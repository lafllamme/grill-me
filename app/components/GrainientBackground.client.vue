<script setup lang="ts">
import { useRafFn, useResizeObserver } from '@vueuse/core'
import { Mesh, Program, Renderer, Triangle } from 'ogl'

interface GrainientBackgroundProps {
  timeSpeed?: number
  colorBalance?: number
  warpStrength?: number
  warpFrequency?: number
  warpSpeed?: number
  warpAmplitude?: number
  blendAngle?: number
  blendSoftness?: number
  rotationAmount?: number
  noiseScale?: number
  grainAmount?: number
  grainScale?: number
  grainAnimated?: boolean
  contrast?: number
  gamma?: number
  saturation?: number
  centerX?: number
  centerY?: number
  zoom?: number
  color1?: string
  color2?: string
  color3?: string
  className?: string
}

const props = withDefaults(defineProps<GrainientBackgroundProps>(), {
  timeSpeed: 0.25,
  colorBalance: 0,
  warpStrength: 1,
  warpFrequency: 5,
  warpSpeed: 2,
  warpAmplitude: 50,
  blendAngle: 0,
  blendSoftness: 0.05,
  rotationAmount: 500,
  noiseScale: 2,
  grainAmount: 0.19,
  grainScale: 2,
  grainAnimated: false,
  contrast: 1.5,
  gamma: 1,
  saturation: 1,
  centerX: 0,
  centerY: 0,
  zoom: 0.9,
  color1: '#000000',
  color2: '#A73A25',
  color3: '#2D2D2F',
  className: '',
})

const emit = defineEmits<{
  ready: []
}>()

const containerRef = useTemplateRef<HTMLDivElement>('containerRef')
const hasRenderError = ref(false)

const vertexShader = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const fragmentShader = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uTimeSpeed;
uniform float uColorBalance;
uniform float uWarpStrength;
uniform float uWarpFrequency;
uniform float uWarpSpeed;
uniform float uWarpAmplitude;
uniform float uBlendAngle;
uniform float uBlendSoftness;
uniform float uRotationAmount;
uniform float uNoiseScale;
uniform float uGrainAmount;
uniform float uGrainScale;
uniform float uGrainAnimated;
uniform float uContrast;
uniform float uGamma;
uniform float uSaturation;
uniform vec2 uCenterOffset;
uniform float uZoom;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
out vec4 fragColor;

#define S(a,b,t) smoothstep(a,b,t)
mat2 Rot(float a) { float s = sin(a), c = cos(a); return mat2(c,-s,s,c); }

vec2 hash(vec2 p) {
  p = vec2(dot(p, vec2(2127.1, 81.17)), dot(p, vec2(1269.5, 283.37)));
  return fract(sin(p) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p), u = f*f*(3.0-2.0*f);
  float n = mix(
    mix(dot(-1.0 + 2.0 * hash(i + vec2(0.0,0.0)), f - vec2(0.0,0.0)),
        dot(-1.0 + 2.0 * hash(i + vec2(1.0,0.0)), f - vec2(1.0,0.0)), u.x),
    mix(dot(-1.0 + 2.0 * hash(i + vec2(0.0,1.0)), f - vec2(0.0,1.0)),
        dot(-1.0 + 2.0 * hash(i + vec2(1.0,1.0)), f - vec2(1.0,1.0)), u.x),
    u.y
  );
  return 0.5 + 0.5 * n;
}

void mainImage(out vec4 o, vec2 C) {
  float t = iTime * uTimeSpeed;
  vec2 uv = C / iResolution.xy;
  float ratio = iResolution.x / iResolution.y;
  vec2 tuv = uv - 0.5 + uCenterOffset;
  tuv /= max(uZoom, 0.001);

  float degree = noise(vec2(t * 0.1, tuv.x * tuv.y) * uNoiseScale);
  tuv.y *= 1.0 / ratio;
  tuv *= Rot(radians((degree - 0.5) * uRotationAmount + 180.0));
  tuv.y *= ratio;

  float frequency = uWarpFrequency;
  float ws = max(uWarpStrength, 0.001);
  float amplitude = uWarpAmplitude / ws;
  float warpTime = t * uWarpSpeed;
  tuv.x += sin(tuv.y * frequency + warpTime) / amplitude;
  tuv.y += sin(tuv.x * (frequency * 1.5) + warpTime) / (amplitude * 0.5);

  vec3 colA = uColor1;
  vec3 colB = uColor2;
  vec3 colC = uColor3;

  float b = uColorBalance;
  float s = max(uBlendSoftness, 0.0);
  mat2 blendRot = Rot(radians(uBlendAngle));
  float blendX = (tuv * blendRot).x;

  float edge0 = -0.3 - b - s;
  float edge1 = 0.2 - b + s;
  float v0 = 0.5 - b + s;
  float v1 = -0.3 - b - s;

  vec3 layer1 = mix(colC, colB, S(edge0, edge1, blendX));
  vec3 layer2 = mix(colB, colA, S(edge0, edge1, blendX));
  vec3 col = mix(layer1, layer2, S(v0, v1, tuv.y));

  vec2 grainUv = uv * max(uGrainScale, 0.001);
  if (uGrainAnimated > 0.5) grainUv += vec2(iTime * 0.05);
  float grain = fract(sin(dot(grainUv, vec2(12.9898, 78.233))) * 43758.5453);
  col += (grain - 0.5) * uGrainAmount;

  col = (col - 0.5) * uContrast + 0.5;
  float luma = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = mix(vec3(luma), col, uSaturation);
  col = pow(max(col, 0.0), vec3(1.0 / max(uGamma, 0.001)));
  col = clamp(col, 0.0, 1.0);

  o = vec4(col, 1.0);
}

void main() {
  vec4 o = vec4(0.0);
  mainImage(o, gl_FragCoord.xy);
  fragColor = o;
}
`

function hexToRgb(hex: string): [number, number, number] {
  const cleaned = hex.trim().replace('#', '')
  if (!/^[0-9A-F]{6}$/i.test(cleaned))
    return [1, 1, 1]
  const parsed = Number.parseInt(cleaned, 16)
  return [
    ((parsed >> 16) & 255) / 255,
    ((parsed >> 8) & 255) / 255,
    (parsed & 255) / 255,
  ]
}

type GrainientProgram = Program & {
  uniforms: {
    iTime: { value: number }
    iResolution: { value: Float32Array }
    uTimeSpeed: { value: number }
    uColorBalance: { value: number }
    uWarpStrength: { value: number }
    uWarpFrequency: { value: number }
    uWarpSpeed: { value: number }
    uWarpAmplitude: { value: number }
    uBlendAngle: { value: number }
    uBlendSoftness: { value: number }
    uRotationAmount: { value: number }
    uNoiseScale: { value: number }
    uGrainAmount: { value: number }
    uGrainScale: { value: number }
    uGrainAnimated: { value: number }
    uContrast: { value: number }
    uGamma: { value: number }
    uSaturation: { value: number }
    uCenterOffset: { value: Float32Array }
    uZoom: { value: number }
    uColor1: { value: Float32Array }
    uColor2: { value: Float32Array }
    uColor3: { value: Float32Array }
  }
}

let renderer: Renderer | null = null
let program: GrainientProgram | null = null
let mesh: Mesh | null = null
let readyEmitted = false
let startTime: number | null = null

function updateUniforms() {
  if (!program)
    return

  program.uniforms.uTimeSpeed.value = props.timeSpeed
  program.uniforms.uColorBalance.value = props.colorBalance
  program.uniforms.uWarpStrength.value = props.warpStrength
  program.uniforms.uWarpFrequency.value = props.warpFrequency
  program.uniforms.uWarpSpeed.value = props.warpSpeed
  program.uniforms.uWarpAmplitude.value = props.warpAmplitude
  program.uniforms.uBlendAngle.value = props.blendAngle
  program.uniforms.uBlendSoftness.value = props.blendSoftness
  program.uniforms.uRotationAmount.value = props.rotationAmount
  program.uniforms.uNoiseScale.value = props.noiseScale
  program.uniforms.uGrainAmount.value = props.grainAmount
  program.uniforms.uGrainScale.value = props.grainScale
  program.uniforms.uGrainAnimated.value = props.grainAnimated ? 1 : 0
  program.uniforms.uContrast.value = props.contrast
  program.uniforms.uGamma.value = props.gamma
  program.uniforms.uSaturation.value = props.saturation
  program.uniforms.uCenterOffset.value[0] = props.centerX
  program.uniforms.uCenterOffset.value[1] = props.centerY
  program.uniforms.uZoom.value = props.zoom

  const color1 = hexToRgb(props.color1)
  const color2 = hexToRgb(props.color2)
  const color3 = hexToRgb(props.color3)

  program.uniforms.uColor1.value.set(color1)
  program.uniforms.uColor2.value.set(color2)
  program.uniforms.uColor3.value.set(color3)
}

function setSize() {
  if (!renderer || !program || !containerRef.value)
    return

  const rect = containerRef.value.getBoundingClientRect()
  const width = Math.max(1, Math.floor(rect.width))
  const height = Math.max(1, Math.floor(rect.height))

  renderer.setSize(width, height)

  const gl = renderer.gl
  program.uniforms.iResolution.value[0] = gl.drawingBufferWidth
  program.uniforms.iResolution.value[1] = gl.drawingBufferHeight
}

const { pause: pauseRaf, resume: resumeRaf } = useRafFn(
  ({ timestamp }) => {
    if (!renderer || !program || !mesh)
      return

    if (startTime === null)
      startTime = timestamp

    program.uniforms.iTime.value = (timestamp - startTime) * 0.001
    renderer.render({ scene: mesh })

    if (!readyEmitted) {
      readyEmitted = true
      emit('ready')
    }
  },
  { immediate: false },
)

function cleanup() {
  pauseRaf()

  const canvas = renderer?.gl?.canvas as HTMLCanvasElement | undefined
  if (containerRef.value && canvas && canvas.parentElement === containerRef.value)
    containerRef.value.removeChild(canvas)

  renderer = null
  program = null
  mesh = null
  startTime = null
}

function mountGrainient() {
  if (!containerRef.value)
    return

  cleanup()
  hasRenderError.value = false

  try {
    renderer = new Renderer({
      webgl: 2,
      alpha: true,
      antialias: false,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    })

    const gl = renderer.gl
    const canvas = gl.canvas as HTMLCanvasElement
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.display = 'block'

    containerRef.value.appendChild(canvas)

    const geometry = new Triangle(gl)
    program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new Float32Array([1, 1]) },
        uTimeSpeed: { value: props.timeSpeed },
        uColorBalance: { value: props.colorBalance },
        uWarpStrength: { value: props.warpStrength },
        uWarpFrequency: { value: props.warpFrequency },
        uWarpSpeed: { value: props.warpSpeed },
        uWarpAmplitude: { value: props.warpAmplitude },
        uBlendAngle: { value: props.blendAngle },
        uBlendSoftness: { value: props.blendSoftness },
        uRotationAmount: { value: props.rotationAmount },
        uNoiseScale: { value: props.noiseScale },
        uGrainAmount: { value: props.grainAmount },
        uGrainScale: { value: props.grainScale },
        uGrainAnimated: { value: props.grainAnimated ? 1 : 0 },
        uContrast: { value: props.contrast },
        uGamma: { value: props.gamma },
        uSaturation: { value: props.saturation },
        uCenterOffset: { value: new Float32Array([props.centerX, props.centerY]) },
        uZoom: { value: props.zoom },
        uColor1: { value: new Float32Array(hexToRgb(props.color1)) },
        uColor2: { value: new Float32Array(hexToRgb(props.color2)) },
        uColor3: { value: new Float32Array(hexToRgb(props.color3)) },
      },
    }) as GrainientProgram

    mesh = new Mesh(gl, {
      geometry,
      program,
    })

    setSize()

    startTime = null
    readyEmitted = false
    resumeRaf()
  }
  catch {
    hasRenderError.value = true
    cleanup()
  }
}

useResizeObserver(containerRef, () => {
  setSize()
})

onMounted(() => {
  nextTick(() => {
    mountGrainient()
  })
})

onBeforeUnmount(() => {
  cleanup()
})

watch(
  () => [
    props.timeSpeed,
    props.colorBalance,
    props.warpStrength,
    props.warpFrequency,
    props.warpSpeed,
    props.warpAmplitude,
    props.blendAngle,
    props.blendSoftness,
    props.rotationAmount,
    props.noiseScale,
    props.grainAmount,
    props.grainScale,
    props.grainAnimated,
    props.contrast,
    props.gamma,
    props.saturation,
    props.centerX,
    props.centerY,
    props.zoom,
    props.color1,
    props.color2,
    props.color3,
  ],
  () => {
    updateUniforms()
  },
)
</script>

<template>
  <div
    ref="containerRef"
    class="h-full w-full relative overflow-hidden" :class="[className]"
    aria-label="Grainient animated background"
  >
    <div
      v-if="hasRenderError"
      class="bg-[radial-gradient(circle_at_18%_16%,_rgba(255,86,51,0.26),_transparent_38%),radial-gradient(circle_at_76%_58%,_rgba(50,49,53,0.92),_rgba(45,45,47,1)_65%)] inset-0 absolute"
    />
  </div>
</template>
