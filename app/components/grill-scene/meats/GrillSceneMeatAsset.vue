<script setup lang="ts">
import type { Object3D } from 'three'
import type { AnchorOffset, BurnControls, MeatAdjustment, MeatModelConfig } from '../types'
import { tryOnBeforeUnmount, usePreferredReducedMotion } from '@vueuse/core'
import { Box3, Group, MeshStandardMaterial, Vector3 } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { computed, shallowRef, watchEffect } from 'vue'
import { createMeatBurnController } from './useMeatBurn'

interface GrillSceneMeatAssetProps {
  config: MeatModelConfig
  elapsed: number
  wobble: number
  heat: number
  anchorOffset: AnchorOffset
  burnControls: BurnControls
  adjustment: MeatAdjustment
}

const props = defineProps<GrillSceneMeatAssetProps>()

const prefersReducedMotion = usePreferredReducedMotion()
const model = shallowRef<Object3D | null>(null)
const burnController = createMeatBurnController()

const position = computed<[number, number, number]>(() => {
  const wobble = prefersReducedMotion.value
    ? 0
    : Math.sin(props.elapsed * 2.4 + props.config.phase) * props.wobble

  return [
    props.config.position[0] + props.adjustment.x + props.anchorOffset.x,
    props.config.position[1] + wobble + props.adjustment.y + props.anchorOffset.y,
    props.config.position[2] + props.adjustment.z + props.anchorOffset.z,
  ]
})

const rotation = computed<[number, number, number]>(() => [
  props.config.rotation[0],
  props.config.rotation[1] + props.adjustment.rotationY,
  props.config.rotation[2],
])

const uniformScale = computed<[number, number, number]>(() => [
  props.adjustment.scale,
  props.adjustment.scale,
  props.adjustment.scale,
])

async function loadMeatModel() {
  const loader = new GLTFLoader()

  try {
    const gltf = await loader.loadAsync(props.config.url)
    const root = gltf.scene

    root.traverse((child) => {
      const mesh = child as { isMesh?: boolean, castShadow?: boolean, receiveShadow?: boolean }
      if (!mesh.isMesh)
        return

      mesh.castShadow = true
      mesh.receiveShadow = true

      const material = (mesh as { material?: unknown }).material
      if (material instanceof MeshStandardMaterial)
        burnController.registerMaterial(material)
    })

    const initialBox = new Box3().setFromObject(root)
    const initialSize = initialBox.getSize(new Vector3())
    const safeWidth = Math.max(initialSize.x, 0.0001)
    const normalizedScale = (props.config.targetWidth / safeWidth) * props.config.modelScale
    root.scale.setScalar(normalizedScale)

    const centeredBox = new Box3().setFromObject(root)
    const centeredCenter = centeredBox.getCenter(new Vector3())
    root.position.x -= centeredCenter.x
    root.position.y -= centeredCenter.y
    root.position.z -= centeredCenter.z

    const groundedBox = new Box3().setFromObject(root)
    root.position.y += -groundedBox.min.y

    const container = new Group()
    container.add(root)
    model.value = container
  }
  catch {
    model.value = null
  }
}

loadMeatModel()

watchEffect(() => {
  burnController.applyBurn(props.heat, props.burnControls)
})

tryOnBeforeUnmount(() => {
  model.value = null
  burnController.clearMaterials()
})
</script>

<template>
  <TresGroup
    v-if="model"
    :position="position"
    :rotation="rotation"
    :scale="uniformScale"
  >
    <primitive :object="model" />
  </TresGroup>
</template>
