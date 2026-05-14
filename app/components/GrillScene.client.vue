<script setup lang="ts">
import type { Object3D } from 'three'
import type {
  AnchorOffset,
  BurnControls,
  FlameControls,
  FuelControls,
  MeatAdjustmentMap,
  SmokeControls,
} from './grill-scene/types'
import { TresCanvas } from '@tresjs/core'
import { tryOnBeforeUnmount, useDevicePixelRatio, useLocalStorage, useRafFn } from '@vueuse/core'
import { Box3, Group, Vector3 } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { computed, shallowRef, watch } from 'vue'
import { clampHeat, getGrillHeatState } from '../utils/grill-heat-state'
import GrillSceneCoals from './grill-scene/GrillSceneCoals.vue'
import GrillSceneFire from './grill-scene/GrillSceneFire.vue'
import GrillSceneMeats from './grill-scene/GrillSceneMeats.vue'
import GrillSceneSettingsPanel from './grill-scene/GrillSceneSettingsPanel.vue'
import GrillSceneSmoke from './grill-scene/GrillSceneSmoke.vue'
import GrillSceneOrbitControls from './GrillSceneOrbitControls'

interface GrillSceneProps {
  heightClass?: string
  initialHeat?: number
}

interface CameraPlacement {
  x: number
  y: number
  z: number
}

const props = withDefaults(defineProps<GrillSceneProps>(), {
  heightClass: 'h-[20rem] sm:h-[24rem] lg:h-[30rem]',
  initialHeat: 0.38,
})

const heat = ref(clampHeat(props.initialHeat))
const elapsed = ref(0)
const grillModel = shallowRef<Object3D | null>(null)
const hasModelError = ref(false)
const modelUrl = new URL('../assets/models/grill/Barbeque.glb', import.meta.url).href

const defaultEmberOffset: AnchorOffset = {
  x: 0.38,
  y: 0.5,
  z: -0.49,
}
const defaultMeatOffset: AnchorOffset = {
  x: 0.34,
  y: 0.59,
  z: -0.37,
}
const defaultSmokeOffset: AnchorOffset = {
  x: 0.54,
  y: 1.15,
  z: -0.04,
}
const defaultCameraPosition: CameraPlacement = {
  x: -0.26,
  y: 5.67,
  z: 6.22,
}
const defaultCameraTarget: CameraPlacement = {
  x: 3.89,
  y: 0.1,
  z: -12,
}
const defaultCameraOrbit = {
  minDistance: 0.2,
  maxDistance: 24,
  minPolarAngle: 0.62,
  maxPolarAngle: 1.52,
}
const defaultMeatAdjustments: MeatAdjustmentMap = {
  sausage: { x: -0.3, y: 0, z: 0.3, scale: 0.4, rotationY: 1.16 },
  steak: { x: 0.57, y: -0.02, z: -0.16, scale: 0.4, rotationY: 0.24 },
  bacon: { x: 0.43, y: 0, z: 0, scale: 0.75, rotationY: 1.64 },
}
const defaultFuelControls: FuelControls = {
  glowIntensity: 1.25,
  pulseSpeed: 1,
  coalDensity: 1,
  coalBlackness: 0.84,
  hotspotVariance: 0.55,
  coalCount: 1,
}
const defaultFlameControls: FlameControls = {
  height: 1,
  spread: 1,
  opacity: 1,
  flicker: 1,
  baseDensity: 1,
  verticalTaper: 0.68,
  emberRate: 1,
  bedTurbulence: 1,
}
const defaultBurnControls: BurnControls = {
  charStrength: 1,
  charThreshold: 0.45,
}
const defaultSmokeControls: SmokeControls = {
  density: 1,
  rise: 1,
  drift: 1,
  opacity: 0.42,
  softness: 0.7,
}

const emberOffset = useLocalStorage<AnchorOffset>('grill-scene-ember-offset-v2', defaultEmberOffset)
const meatOffset = useLocalStorage<AnchorOffset>('grill-scene-meat-offset-v2', defaultMeatOffset)
const smokeOffset = useLocalStorage<AnchorOffset>('grill-scene-smoke-offset-v1', defaultSmokeOffset)
const cameraPositionOffset = useLocalStorage<CameraPlacement>('grill-scene-camera-position-v1', defaultCameraPosition)
const cameraTargetOffset = useLocalStorage<CameraPlacement>('grill-scene-camera-target-v1', defaultCameraTarget)
const cameraOrbit = useLocalStorage<{
  minDistance: number
  maxDistance: number
  minPolarAngle: number
  maxPolarAngle: number
}>('grill-scene-camera-orbit-v1', defaultCameraOrbit)
const meatAdjustments = useLocalStorage<MeatAdjustmentMap>('grill-scene-meat-adjustments-v1', defaultMeatAdjustments)
const fuelControls = useLocalStorage<FuelControls>('grill-scene-fuel-controls-v1', defaultFuelControls)
const flameControls = useLocalStorage<FlameControls>('grill-scene-flame-controls-v1', defaultFlameControls)
const burnControls = useLocalStorage<BurnControls>('grill-scene-burn-controls-v1', defaultBurnControls)
const smokeControls = useLocalStorage<SmokeControls>('grill-scene-smoke-controls-v1', defaultSmokeControls)

function patchMissingDefaults<T extends object>(target: T, defaults: T): T {
  let hasChanges = false
  const patched = { ...target } as Record<string, unknown>

  for (const [key, value] of Object.entries(defaults)) {
    if (patched[key] == null) {
      patched[key] = value
      hasChanges = true
    }
  }

  return hasChanges ? patched as T : target
}

watch(
  () => fuelControls.value,
  (next) => {
    const patched = patchMissingDefaults(next, defaultFuelControls)
    if (patched !== next)
      fuelControls.value = patched
  },
  { deep: true, immediate: true },
)

watch(
  () => flameControls.value,
  (next) => {
    const patched = patchMissingDefaults(next, defaultFlameControls)
    if (patched !== next)
      flameControls.value = patched
  },
  { deep: true, immediate: true },
)

watch(
  () => smokeControls.value,
  (next) => {
    const patched = patchMissingDefaults(next, defaultSmokeControls)
    if (patched !== next)
      smokeControls.value = patched
  },
  { deep: true, immediate: true },
)

watch(
  () => smokeOffset.value,
  (next) => {
    const patched = patchMissingDefaults(next, defaultSmokeOffset)
    if (patched !== next)
      smokeOffset.value = patched
  },
  { deep: true, immediate: true },
)

const { pixelRatio } = useDevicePixelRatio()
const maxDpr = computed<[number, number]>(() => [1, Math.min(2, pixelRatio.value || 1)])
const sceneState = computed(() => getGrillHeatState(heat.value))
const heatPercent = computed(() => Math.round(heat.value * 100))
const fireLightPosition = computed<[number, number, number]>(() => [
  0.56 + emberOffset.value.x,
  2.18 + sceneState.value.fire.height * 0.1 + emberOffset.value.y,
  0.08 + emberOffset.value.z,
])
const ambientIntensity = computed(() => 1 + sceneState.value.ambience.intensity * 0.18)
const hemisphereIntensity = computed(() => 1.12 + sceneState.value.ambience.intensity * 0.22)
const cameraPositionValues = computed<[number, number, number]>(() => [cameraPositionOffset.value.x, cameraPositionOffset.value.y, cameraPositionOffset.value.z])
const cameraTargetValues = computed<[number, number, number]>(() => [cameraTargetOffset.value.x, cameraTargetOffset.value.y, cameraTargetOffset.value.z])

watch(
  () => [cameraOrbit.value.minDistance, cameraOrbit.value.maxDistance],
  () => {
    const minDistance = cameraOrbit.value.minDistance
    const maxDistance = cameraOrbit.value.maxDistance
    if (maxDistance <= minDistance)
      cameraOrbit.value.maxDistance = minDistance + 0.2
  },
  { immediate: true },
)

watch(
  () => [cameraOrbit.value.minPolarAngle, cameraOrbit.value.maxPolarAngle],
  () => {
    const minPolarAngle = cameraOrbit.value.minPolarAngle
    const maxPolarAngle = cameraOrbit.value.maxPolarAngle
    if (maxPolarAngle <= minPolarAngle)
      cameraOrbit.value.maxPolarAngle = minPolarAngle + 0.05
  },
  { immediate: true },
)

async function loadGrillModel() {
  const loader = new GLTFLoader()

  try {
    const gltf = await loader.loadAsync(modelUrl)
    const root = gltf.scene

    root.traverse((child) => {
      const mesh = child as { isMesh?: boolean, castShadow?: boolean, receiveShadow?: boolean }
      if (!mesh.isMesh)
        return

      mesh.castShadow = true
      mesh.receiveShadow = true
    })

    const initialBox = new Box3().setFromObject(root)
    const initialSize = initialBox.getSize(new Vector3())
    const targetWidth = 5.75
    const scale = targetWidth / initialSize.x
    root.scale.setScalar(scale)

    const centeredBox = new Box3().setFromObject(root)
    const centeredCenter = centeredBox.getCenter(new Vector3())
    root.position.x -= centeredCenter.x
    root.position.y -= centeredCenter.y
    root.position.z -= centeredCenter.z

    const groundedBox = new Box3().setFromObject(root)
    root.position.y += -groundedBox.min.y - 0.18
    root.position.x += 0.22
    root.position.z += 0.04
    root.rotation.y = Math.PI * 0.04

    const container = new Group()
    container.add(root)
    grillModel.value = container
    hasModelError.value = false
  }
  catch {
    grillModel.value = null
    hasModelError.value = true
  }
}

useRafFn(({ delta }) => {
  elapsed.value += delta / 1000
})

loadGrillModel()

tryOnBeforeUnmount(() => {
  grillModel.value = null
})
</script>

<template>
  <div
    class="border border-divider/70 rounded-[1.75rem] shadow-[0_32px_120px_-48px_rgba(0,0,0,0.75)] relative overflow-hidden from-surface-container-low to-surface-container-lowest via-surface-container bg-gradient-to-br"
    :class="props.heightClass"
  >
    <div class="inset-0 absolute from-primary/8 to-primary-container/10 via-transparent bg-gradient-to-br" />
    <div class="rounded-full bg-black/35 h-12 inset-x-10 bottom-7 absolute blur-2xl" />

    <TresCanvas
      :dpr="maxDpr"
      alpha
      class="h-full w-full relative z-10"
    >
      <TresPerspectiveCamera
        :position="cameraPositionValues"
        :fov="30"
        :near="0.1"
        :far="100"
      />
      <GrillSceneOrbitControls
        :target="cameraTargetValues"
        :min-distance="cameraOrbit.minDistance"
        :max-distance="cameraOrbit.maxDistance"
        :min-polar-angle="cameraOrbit.minPolarAngle"
        :max-polar-angle="cameraOrbit.maxPolarAngle"
      />
      <TresAmbientLight :intensity="ambientIntensity" />
      <TresHemisphereLight :intensity="hemisphereIntensity" :position="[0, 8, 0]" />
      <TresDirectionalLight :intensity="1.85" :position="[7, 9, 6]" />
      <TresDirectionalLight :intensity="0.72" :position="[-4, 3, -2]" />
      <TresPointLight
        :color="sceneState.fire.tipColor"
        :intensity="sceneState.fire.intensity"
        :distance="10"
        :position="fireLightPosition"
      />

      <TresGroup>
        <TresMesh :position="[0, -0.22, 0]" :receive-shadow="true">
          <TresCylinderGeometry :args="[3.7, 4.05, 0.38, 10]" />
          <TresMeshStandardMaterial color="#1A1514" :roughness="0.95" :metalness="0.05" />
        </TresMesh>

        <primitive v-if="grillModel" :object="grillModel" />

        <GrillSceneCoals :elapsed="elapsed" :state="sceneState" :anchor-offset="emberOffset" :controls="fuelControls" />
        <GrillSceneFire :elapsed="elapsed" :state="sceneState" :anchor-offset="emberOffset" :controls="flameControls" />
        <GrillSceneSmoke :elapsed="elapsed" :state="sceneState" :smoke-offset="smokeOffset" :controls="smokeControls" />
        <GrillSceneMeats
          :elapsed="elapsed"
          :wobble="sceneState.meat.wobble"
          :heat="heat"
          :anchor-offset="meatOffset"
          :burn-controls="burnControls"
          :adjustments="meatAdjustments"
        />
      </TresGroup>
    </TresCanvas>

    <div class="px-3 py-1.5 border border-divider/60 rounded-full bg-black/30 flex gap-2 pointer-events-none items-center left-5 top-5 absolute z-20 backdrop-blur-md">
      <span class="rounded-full bg-primary h-2 w-2" />
      <span class="text-[10px] text-on-surface-variant tracking-[0.16em] font-meta uppercase">
        Hybrid grill shell + live browning
      </span>
    </div>

    <GrillSceneSettingsPanel
      v-model:heat="heat"
      v-model:ember-offset="emberOffset"
      v-model:meat-offset="meatOffset"
      v-model:smoke-offset="smokeOffset"
      v-model:camera-position-offset="cameraPositionOffset"
      v-model:camera-target-offset="cameraTargetOffset"
      v-model:camera-orbit="cameraOrbit"
      v-model:meat-adjustments="meatAdjustments"
      v-model:fuel-controls="fuelControls"
      v-model:flame-controls="flameControls"
      v-model:burn-controls="burnControls"
      v-model:smoke-controls="smokeControls"
      :scene-state="sceneState"
      :heat-percent="heatPercent"
      :has-model-error="hasModelError"
    />
  </div>
</template>
