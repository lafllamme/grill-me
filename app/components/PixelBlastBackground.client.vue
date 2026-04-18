<script setup lang="ts">
import {
  useDevicePixelRatio,
  useDocumentVisibility,
  useElementSize,
  useEventListener,
  useMediaQuery,
  usePreferredReducedMotion,
  useRafFn,
  useWindowSize,
} from '@vueuse/core'
import { Effect, EffectComposer, EffectPass, RenderPass } from 'postprocessing'
import * as THREE from 'three'
import { computed, onBeforeUnmount, ref, shallowRef, watch, watchEffect } from 'vue'

type PixelBlastVariant = 'square' | 'circle' | 'triangle' | 'diamond'

interface PixelBlastProps {
  variant?: PixelBlastVariant
  pixelSize?: number
  color?: string
  className?: string
  style?: Record<string, string | number>
  antialias?: boolean
  patternScale?: number
  patternDensity?: number
  liquid?: boolean
  liquidStrength?: number
  liquidRadius?: number
  pixelSizeJitter?: number
  enableRipples?: boolean
  rippleIntensityScale?: number
  rippleThickness?: number
  rippleSpeed?: number
  liquidWobbleSpeed?: number
  autoPauseOffscreen?: boolean
  speed?: number
  transparent?: boolean
  edgeFade?: number
  noiseAmount?: number
}

const props = withDefaults(defineProps<PixelBlastProps>(), {
  variant: 'square',
  pixelSize: 4,
  color: '#FF5633',
  antialias: true,
  patternScale: 2,
  patternDensity: 1,
  liquid: false,
  liquidStrength: 0.1,
  liquidRadius: 1,
  pixelSizeJitter: 0,
  enableRipples: true,
  rippleIntensityScale: 1,
  rippleThickness: 0.1,
  rippleSpeed: 0.3,
  liquidWobbleSpeed: 4.5,
  autoPauseOffscreen: true,
  speed: 0.5,
  transparent: true,
  edgeFade: 0.25,
  noiseAmount: 0,
})
const emit = defineEmits<{
  ready: []
}>()

const MAX_CLICKS = 10

const SHAPE_MAP: Record<PixelBlastVariant, number> = {
  square: 0,
  circle: 1,
  triangle: 2,
  diamond: 3,
}

const VERTEX_SRC = `
void main() {
  gl_Position = vec4(position, 1.0);
}
`

const FRAGMENT_SRC = `
precision highp float;

uniform vec3  uColor;
uniform vec2  uResolution;
uniform float uTime;
uniform float uPixelSize;
uniform float uScale;
uniform float uDensity;
uniform float uPixelJitter;
uniform int   uEnableRipples;
uniform float uRippleSpeed;
uniform float uRippleThickness;
uniform float uRippleIntensity;
uniform float uEdgeFade;

uniform int   uShapeType;
const int SHAPE_SQUARE   = 0;
const int SHAPE_CIRCLE   = 1;
const int SHAPE_TRIANGLE = 2;
const int SHAPE_DIAMOND  = 3;

const int   MAX_CLICKS = 10;

uniform vec2  uClickPos  [MAX_CLICKS];
uniform float uClickTimes[MAX_CLICKS];

out vec4 fragColor;

float Bayer2(vec2 a) {
  a = floor(a);
  return fract(a.x / 2. + a.y * a.y * .75);
}
#define Bayer4(a) (Bayer2(.5*(a))*0.25 + Bayer2(a))
#define Bayer8(a) (Bayer4(.5*(a))*0.25 + Bayer2(a))

#define FBM_OCTAVES     5
#define FBM_LACUNARITY  1.25
#define FBM_GAIN        1.0

float hash11(float n){ return fract(sin(n)*43758.5453); }

float vnoise(vec3 p){
  vec3 ip = floor(p);
  vec3 fp = fract(p);
  float n000 = hash11(dot(ip + vec3(0.0,0.0,0.0), vec3(1.0,57.0,113.0)));
  float n100 = hash11(dot(ip + vec3(1.0,0.0,0.0), vec3(1.0,57.0,113.0)));
  float n010 = hash11(dot(ip + vec3(0.0,1.0,0.0), vec3(1.0,57.0,113.0)));
  float n110 = hash11(dot(ip + vec3(1.0,1.0,0.0), vec3(1.0,57.0,113.0)));
  float n001 = hash11(dot(ip + vec3(0.0,0.0,1.0), vec3(1.0,57.0,113.0)));
  float n101 = hash11(dot(ip + vec3(1.0,0.0,1.0), vec3(1.0,57.0,113.0)));
  float n011 = hash11(dot(ip + vec3(0.0,1.0,1.0), vec3(1.0,57.0,113.0)));
  float n111 = hash11(dot(ip + vec3(1.0,1.0,1.0), vec3(1.0,57.0,113.0)));
  vec3 w = fp*fp*fp*(fp*(fp*6.0-15.0)+10.0);
  float x00 = mix(n000, n100, w.x);
  float x10 = mix(n010, n110, w.x);
  float x01 = mix(n001, n101, w.x);
  float x11 = mix(n011, n111, w.x);
  float y0  = mix(x00, x10, w.y);
  float y1  = mix(x01, x11, w.y);
  return mix(y0, y1, w.z) * 2.0 - 1.0;
}

float fbm2(vec2 uv, float t){
  vec3 p = vec3(uv * uScale, t);
  float amp = 1.0;
  float freq = 1.0;
  float sum = 1.0;
  for (int i = 0; i < FBM_OCTAVES; ++i){
    sum  += amp * vnoise(p * freq);
    freq *= FBM_LACUNARITY;
    amp  *= FBM_GAIN;
  }
  return sum * 0.5 + 0.5;
}

float maskCircle(vec2 p, float cov){
  float r = sqrt(cov) * .25;
  float d = length(p - 0.5) - r;
  float aa = 0.5 * fwidth(d);
  return cov * (1.0 - smoothstep(-aa, aa, d * 2.0));
}

float maskTriangle(vec2 p, vec2 id, float cov){
  bool flip = mod(id.x + id.y, 2.0) > 0.5;
  if (flip) p.x = 1.0 - p.x;
  float r = sqrt(cov);
  float d  = p.y - r*(1.0 - p.x);
  float aa = fwidth(d);
  return cov * clamp(0.5 - d/aa, 0.0, 1.0);
}

float maskDiamond(vec2 p, float cov){
  float r = sqrt(cov) * 0.564;
  return step(abs(p.x - 0.49) + abs(p.y - 0.49), r);
}

void main(){
  float pixelSize = uPixelSize;
  vec2 fragCoord = gl_FragCoord.xy - uResolution * .5;
  float aspectRatio = uResolution.x / uResolution.y;

  vec2 pixelId = floor(fragCoord / pixelSize);
  vec2 pixelUV = fract(fragCoord / pixelSize);

  float cellPixelSize = 8.0 * pixelSize;
  vec2 cellId = floor(fragCoord / cellPixelSize);
  vec2 cellCoord = cellId * cellPixelSize;
  vec2 uv = cellCoord / uResolution * vec2(aspectRatio, 1.0);

  float base = fbm2(uv, uTime * 0.05);
  base = base * 0.5 - 0.65;

  float feed = base + (uDensity - 0.5) * 0.3;

  float speed = uRippleSpeed;
  float thickness = uRippleThickness;
  const float dampT = 1.0;
  const float dampR = 10.0;

  if (uEnableRipples == 1) {
    for (int i = 0; i < MAX_CLICKS; ++i){
      vec2 pos = uClickPos[i];
      if (pos.x < 0.0) continue;
      float localCell = 8.0 * pixelSize;
      vec2 cuv = (((pos - uResolution * .5 - localCell * .5) / uResolution)) * vec2(aspectRatio, 1.0);
      float t = max(uTime - uClickTimes[i], 0.0);
      float r = distance(uv, cuv);
      float waveR = speed * t;
      float ring  = exp(-pow((r - waveR) / thickness, 2.0));
      float atten = exp(-dampT * t) * exp(-dampR * r);
      feed = max(feed, ring * atten * uRippleIntensity);
    }
  }

  float bayer = Bayer8(fragCoord / uPixelSize) - 0.5;
  float bw = step(0.5, feed + bayer);

  float h = fract(sin(dot(floor(fragCoord / uPixelSize), vec2(127.1, 311.7))) * 43758.5453);
  float jitterScale = 1.0 + (h - 0.5) * uPixelJitter;
  float coverage = bw * jitterScale;

  float M;
  if      (uShapeType == SHAPE_CIRCLE)   M = maskCircle(pixelUV, coverage);
  else if (uShapeType == SHAPE_TRIANGLE) M = maskTriangle(pixelUV, pixelId, coverage);
  else if (uShapeType == SHAPE_DIAMOND)  M = maskDiamond(pixelUV, coverage);
  else                                    M = coverage;

  if (uEdgeFade > 0.0) {
    vec2 norm = gl_FragCoord.xy / uResolution;
    float edge = min(min(norm.x, norm.y), min(1.0 - norm.x, 1.0 - norm.y));
    float fade = smoothstep(0.0, uEdgeFade, edge);
    M *= fade;
  }

  fragColor = vec4(uColor, M);
}
`

interface TouchPoint {
  x: number
  y: number
  vx: number
  vy: number
  force: number
  age: number
}

interface ThreeState {
  renderer: THREE.WebGLRenderer
  scene: THREE.Scene
  camera: THREE.OrthographicCamera
  material: THREE.ShaderMaterial
  quad: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>
  timer: THREE.Timer
  uniforms: {
    uResolution: { value: THREE.Vector2 }
    uTime: { value: number }
    uColor: { value: THREE.Color }
    uClickPos: { value: THREE.Vector2[] }
    uClickTimes: { value: Float32Array }
    uShapeType: { value: number }
    uPixelSize: { value: number }
    uScale: { value: number }
    uDensity: { value: number }
    uPixelJitter: { value: number }
    uEnableRipples: { value: number }
    uRippleSpeed: { value: number }
    uRippleThickness: { value: number }
    uRippleIntensity: { value: number }
    uEdgeFade: { value: number }
  }
  composer?: EffectComposer
  touch?: ReturnType<typeof createTouchTexture>
  liquidEffect?: Effect
  clickIx: number
  timeOffset: number
}

function createTouchTexture() {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const rawContext = canvas.getContext('2d')
  if (!rawContext)
    throw new Error('2D context not available')

  const ctx = rawContext
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const texture = new THREE.Texture(canvas)
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.generateMipmaps = false

  const trail: TouchPoint[] = []
  let last: { x: number, y: number } | null = null
  const maxAge = 64
  const speed = 1 / maxAge
  let radius = 0.1 * size

  const clear = () => {
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const drawPoint = (point: TouchPoint) => {
    const posX = point.x * size
    const posY = (1 - point.y) * size

    let intensity = 1
    const easeOutSine = (t: number) => Math.sin((t * Math.PI) / 2)
    const easeOutQuad = (t: number) => -t * (t - 2)

    if (point.age < maxAge * 0.3)
      intensity = easeOutSine(point.age / (maxAge * 0.3))
    else
      intensity = easeOutQuad(1 - (point.age - maxAge * 0.3) / (maxAge * 0.7)) || 0

    intensity *= point.force

    const color = `${((point.vx + 1) / 2) * 255}, ${((point.vy + 1) / 2) * 255}, ${intensity * 255}`
    const offset = size * 5
    ctx.shadowOffsetX = offset
    ctx.shadowOffsetY = offset
    ctx.shadowBlur = radius
    ctx.shadowColor = `rgba(${color}, ${0.22 * intensity})`
    ctx.beginPath()
    ctx.fillStyle = 'rgba(255, 0, 0, 1)'
    ctx.arc(posX - offset, posY - offset, radius, 0, Math.PI * 2)
    ctx.fill()
  }

  const addTouch = (norm: { x: number, y: number }) => {
    let force = 0
    let vx = 0
    let vy = 0

    if (last) {
      const dx = norm.x - last.x
      const dy = norm.y - last.y
      if (dx === 0 && dy === 0)
        return
      const dd = dx * dx + dy * dy
      const d = Math.sqrt(dd)
      vx = dx / (d || 1)
      vy = dy / (d || 1)
      force = Math.min(dd * 10000, 1)
    }

    last = { x: norm.x, y: norm.y }
    trail.push({ x: norm.x, y: norm.y, age: 0, force, vx, vy })
  }

  const update = () => {
    clear()

    for (let i = trail.length - 1; i >= 0; i--) {
      const point = trail[i]
      if (!point)
        continue
      const f = point.force * speed * (1 - point.age / maxAge)
      point.x += point.vx * f
      point.y += point.vy * f
      point.age++
      if (point.age > maxAge)
        trail.splice(i, 1)
    }

    for (const point of trail)
      drawPoint(point)

    texture.needsUpdate = true
  }

  return {
    texture,
    addTouch,
    update,
    set radiusScale(value: number) {
      radius = 0.1 * size * value
    },
    get radiusScale() {
      return radius / (0.1 * size)
    },
  }
}

function createLiquidEffect(texture: THREE.Texture, options?: { strength?: number, freq?: number }) {
  const fragment = `
    uniform sampler2D uTexture;
    uniform float uStrength;
    uniform float uTime;
    uniform float uFreq;

    void mainUv(inout vec2 uv) {
      vec4 tex = texture2D(uTexture, uv);
      float vx = tex.r * 2.0 - 1.0;
      float vy = tex.g * 2.0 - 1.0;
      float intensity = tex.b;

      float wave = 0.5 + 0.5 * sin(uTime * uFreq + intensity * 6.2831853);
      float amt = uStrength * intensity * wave;
      uv += vec2(vx, vy) * amt;
    }
  `

  return new Effect('LiquidEffect', fragment, {
    uniforms: new Map<string, THREE.Uniform>([
      ['uTexture', new THREE.Uniform(texture)],
      ['uStrength', new THREE.Uniform(options?.strength ?? 0.025)],
      ['uTime', new THREE.Uniform(0)],
      ['uFreq', new THREE.Uniform(options?.freq ?? 4.5)],
    ]),
  })
}

function createNoiseEffect(noiseAmount: number) {
  return new Effect(
    'NoiseEffect',
    `
      uniform float uTime;
      uniform float uAmount;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453);}
      void mainUv(inout vec2 uv){}
      void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){
        float n = hash(floor(uv*vec2(1920.0,1080.0))+floor(uTime*60.0));
        float g = (n-0.5)*uAmount;
        outputColor = inputColor + vec4(vec3(g),0.0);
      }
    `,
    {
      uniforms: new Map<string, THREE.Uniform>([
        ['uTime', new THREE.Uniform(0)],
        ['uAmount', new THREE.Uniform(noiseAmount)],
      ]),
    },
  )
}

const containerRef = ref<HTMLDivElement | null>(null)
const threeRef = shallowRef<ThreeState | null>(null)
const hasRenderedFirstFrame = ref(false)

function randomFloat() {
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    const values = new Uint32Array(1)
    window.crypto.getRandomValues(values)
    return (values[0] ?? 0) / 0xFFFFFFFF
  }
  return Math.random()
}

const { width: elementWidth, height: elementHeight } = useElementSize(containerRef)
const { width: windowWidth, height: windowHeight } = useWindowSize()
const { pixelRatio } = useDevicePixelRatio()
const visibility = useDocumentVisibility()
const prefersReducedMotion = usePreferredReducedMotion()
const hasCoarsePointer = useMediaQuery('(pointer: coarse)')
const hasSmallViewport = useMediaQuery('(max-width: 767px)')

const useAdaptiveFallback = computed(() => {
  return prefersReducedMotion.value === 'reduce' || hasCoarsePointer.value || hasSmallViewport.value
})

const effectiveEnableRipples = computed(() => {
  return props.enableRipples && !useAdaptiveFallback.value
})

const effectiveLiquid = computed(() => {
  return props.liquid && !useAdaptiveFallback.value
})

const effectiveNoiseAmount = computed(() => {
  return useAdaptiveFallback.value ? 0 : props.noiseAmount
})

const isVisible = computed(() => visibility.value === 'visible')

const { pause: pauseAnimation, resume: resumeAnimation } = useRafFn(({ timestamp }) => {
  const state = threeRef.value
  if (!state)
    return

  if (props.autoPauseOffscreen && !isVisible.value)
    return

  state.timer.update(timestamp)
  state.uniforms.uTime.value = state.timeOffset + state.timer.getElapsed()

  if (state.liquidEffect) {
    const liquidTime = state.liquidEffect.uniforms.get('uTime')
    if (liquidTime)
      liquidTime.value = state.uniforms.uTime.value
  }

  if (state.composer) {
    state.touch?.update()
    for (const pass of state.composer.passes) {
      if (!(pass instanceof EffectPass))
        continue
      const effects = (pass as unknown as { effects?: Effect[] }).effects || []
      for (const effect of effects) {
        const timeUniform = effect.uniforms.get('uTime')
        if (timeUniform)
          timeUniform.value = state.uniforms.uTime.value
      }
    }
    state.composer.render()
  }
  else {
    state.renderer.render(state.scene, state.camera)
  }

  if (!hasRenderedFirstFrame.value) {
    hasRenderedFirstFrame.value = true
    emit('ready')
  }
}, { immediate: false })

function mapToPixels(event: PointerEvent, renderer: THREE.WebGLRenderer) {
  const rect = renderer.domElement.getBoundingClientRect()
  const scaleX = renderer.domElement.width / Math.max(rect.width, 1)
  const scaleY = renderer.domElement.height / Math.max(rect.height, 1)

  const fx = (event.clientX - rect.left) * scaleX
  const fy = (rect.height - (event.clientY - rect.top)) * scaleY

  return {
    fx,
    fy,
    width: renderer.domElement.width,
    height: renderer.domElement.height,
  }
}

function setRendererSize() {
  const state = threeRef.value
  if (!state)
    return

  const width = Math.max(
    Math.round(elementWidth.value || 0),
    Math.round(windowWidth.value || 0),
    1,
  )
  const height = Math.max(
    Math.round(elementHeight.value || 0),
    Math.round(windowHeight.value || 0),
    1,
  )

  state.renderer.setPixelRatio(Math.min(pixelRatio.value || 1, 2))
  state.renderer.setSize(width, height, false)
  state.uniforms.uResolution.value.set(state.renderer.domElement.width, state.renderer.domElement.height)
  state.uniforms.uPixelSize.value = props.pixelSize * state.renderer.getPixelRatio()
  state.composer?.setSize(state.renderer.domElement.width, state.renderer.domElement.height)
}

function disposeThree() {
  pauseAnimation()
  hasRenderedFirstFrame.value = false

  const state = threeRef.value
  if (!state)
    return

  state.quad.geometry.dispose()
  state.material.dispose()
  state.composer?.dispose()
  state.timer.disconnect()
  state.timer.dispose()
  state.renderer.dispose()

  const container = containerRef.value
  if (container && state.renderer.domElement.parentElement === container)
    container.removeChild(state.renderer.domElement)

  threeRef.value = null
}

function setupThree() {
  const container = containerRef.value
  if (!container)
    return

  disposeThree()
  hasRenderedFirstFrame.value = false

  const canvas = document.createElement('canvas')
  const gl = canvas.getContext('webgl2', {
    antialias: props.antialias,
    alpha: true,
  }) || canvas.getContext('webgl', {
    antialias: props.antialias,
    alpha: true,
  })

  if (!gl)
    return

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: props.antialias,
    alpha: true,
  })

  renderer.domElement.style.width = '100%'
  renderer.domElement.style.height = '100%'

  if (props.transparent)
    renderer.setClearAlpha(0)
  else
    renderer.setClearColor(0x000000, 1)

  container.appendChild(renderer.domElement)

  const uniforms = {
    uResolution: { value: new THREE.Vector2(0, 0) },
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(props.color) },
    uClickPos: { value: Array.from({ length: MAX_CLICKS }, () => new THREE.Vector2(-1, -1)) },
    uClickTimes: { value: new Float32Array(MAX_CLICKS) },
    uShapeType: { value: SHAPE_MAP[props.variant] ?? 0 },
    uPixelSize: { value: props.pixelSize },
    uScale: { value: props.patternScale },
    uDensity: { value: props.patternDensity },
    uPixelJitter: { value: props.pixelSizeJitter },
    uEnableRipples: { value: effectiveEnableRipples.value ? 1 : 0 },
    uRippleSpeed: { value: props.rippleSpeed },
    uRippleThickness: { value: props.rippleThickness },
    uRippleIntensity: { value: props.rippleIntensityScale },
    uEdgeFade: { value: props.edgeFade },
  }

  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  const material = new THREE.ShaderMaterial({
    vertexShader: VERTEX_SRC,
    fragmentShader: FRAGMENT_SRC,
    uniforms,
    transparent: true,
    glslVersion: THREE.GLSL3,
    depthTest: false,
    depthWrite: false,
  })

  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material)
  scene.add(quad)

  const timer = new THREE.Timer()
  timer.connect(document)
  timer.setTimescale(props.speed)
  const timeOffset = randomFloat() * 1000

  let composer: EffectComposer | undefined
  let touch: ReturnType<typeof createTouchTexture> | undefined
  let liquidEffect: Effect | undefined

  if (effectiveLiquid.value) {
    touch = createTouchTexture()
    touch.radiusScale = props.liquidRadius

    composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))

    liquidEffect = createLiquidEffect(touch.texture, {
      strength: props.liquidStrength,
      freq: props.liquidWobbleSpeed,
    })
    const liquidPass = new EffectPass(camera, liquidEffect)
    liquidPass.renderToScreen = true
    composer.addPass(liquidPass)
  }

  if (effectiveNoiseAmount.value > 0) {
    if (!composer) {
      composer = new EffectComposer(renderer)
      composer.addPass(new RenderPass(scene, camera))
    }

    for (const pass of composer.passes) {
      if ('renderToScreen' in pass)
        (pass as { renderToScreen?: boolean }).renderToScreen = false
    }

    const noisePass = new EffectPass(camera, createNoiseEffect(effectiveNoiseAmount.value))
    noisePass.renderToScreen = true
    composer.addPass(noisePass)
  }

  threeRef.value = {
    renderer,
    scene,
    camera,
    material,
    quad,
    timer,
    uniforms,
    composer,
    touch,
    liquidEffect,
    clickIx: 0,
    timeOffset,
  }

  setRendererSize()
  resumeAnimation()
}

function applyUniformUpdates() {
  const state = threeRef.value
  if (!state)
    return

  const uniforms = state.uniforms
  uniforms.uShapeType.value = SHAPE_MAP[props.variant] ?? 0
  uniforms.uColor.value.set(props.color)
  uniforms.uScale.value = props.patternScale
  uniforms.uDensity.value = props.patternDensity
  uniforms.uPixelJitter.value = props.pixelSizeJitter
  uniforms.uEnableRipples.value = effectiveEnableRipples.value ? 1 : 0
  uniforms.uRippleIntensity.value = props.rippleIntensityScale
  uniforms.uRippleThickness.value = props.rippleThickness
  uniforms.uRippleSpeed.value = props.rippleSpeed
  uniforms.uEdgeFade.value = props.edgeFade
  state.timer.setTimescale(props.speed)

  if (props.transparent)
    state.renderer.setClearAlpha(0)
  else
    state.renderer.setClearColor(0x000000, 1)

  if (state.touch)
    state.touch.radiusScale = props.liquidRadius

  if (state.liquidEffect) {
    const strength = state.liquidEffect.uniforms.get('uStrength')
    if (strength)
      strength.value = props.liquidStrength

    const freq = state.liquidEffect.uniforms.get('uFreq')
    if (freq)
      freq.value = props.liquidWobbleSpeed
  }

  setRendererSize()
}

useEventListener(window, 'pointerdown', (event: PointerEvent) => {
  const state = threeRef.value
  if (!state || !effectiveEnableRipples.value)
    return

  const { fx, fy } = mapToPixels(event, state.renderer)
  const current = state.clickIx
  state.uniforms.uClickPos.value[current]?.set(fx, fy)
  state.uniforms.uClickTimes.value[current] = state.uniforms.uTime.value
  state.clickIx = (current + 1) % MAX_CLICKS
}, { passive: true })

useEventListener(window, 'pointermove', (event: PointerEvent) => {
  const state = threeRef.value
  if (!state?.touch)
    return

  const { fx, fy, width, height } = mapToPixels(event, state.renderer)
  state.touch.addTouch({
    x: fx / Math.max(width, 1),
    y: fy / Math.max(height, 1),
  })
}, { passive: true })

useEventListener(window, 'load', () => {
  setRendererSize()
}, { passive: true })

useEventListener(window, 'pageshow', () => {
  setRendererSize()
}, { passive: true })

watch(
  [
    () => props.antialias,
    () => props.liquid,
    () => props.liquidStrength,
    () => props.liquidRadius,
    () => props.liquidWobbleSpeed,
    () => props.noiseAmount,
    () => effectiveLiquid.value,
    () => effectiveNoiseAmount.value,
    () => useAdaptiveFallback.value,
  ],
  () => {
    setupThree()
  },
)

watch(
  [
    () => props.variant,
    () => props.pixelSize,
    () => props.color,
    () => props.patternScale,
    () => props.patternDensity,
    () => props.pixelSizeJitter,
    () => props.enableRipples,
    () => props.rippleIntensityScale,
    () => props.rippleThickness,
    () => props.rippleSpeed,
    () => props.edgeFade,
    () => props.speed,
    () => props.transparent,
  ],
  () => {
    applyUniformUpdates()
  },
)

watch(
  [elementWidth, elementHeight, windowWidth, windowHeight, pixelRatio],
  () => {
    setRendererSize()
  },
  { immediate: true },
)

watchEffect(() => {
  if (!containerRef.value)
    return
  if (!threeRef.value)
    setupThree()
})

onBeforeUnmount(() => {
  disposeThree()
})
</script>

<template>
  <div
    ref="containerRef"
    class="h-full w-full relative overflow-hidden"
    :class="[className]"
    :style="style"
    aria-label="PixelBlast interactive background"
  />
</template>
