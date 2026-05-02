import type { PropType } from 'vue'
import { useLoop, useTres } from '@tresjs/core'
import { tryOnBeforeUnmount } from '@vueuse/core'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { defineComponent, shallowRef, watch, watchEffect } from 'vue'

export default defineComponent({
  name: 'GrillSceneOrbitControls',
  props: {
    /**
     * Shared orbit focus point for the procedural grill stage.
     */
    target: {
      type: Array as unknown as PropType<[number, number, number]>,
      default: () => [0, 0.95, 0] as [number, number, number],
    },
    minDistance: {
      type: Number,
      default: 0.6,
    },
    maxDistance: {
      type: Number,
      default: Number.POSITIVE_INFINITY,
    },
    minPolarAngle: {
      type: Number,
      default: 0.62,
    },
    maxPolarAngle: {
      type: Number,
      default: 1.52,
    },
  },
  setup(props) {
    const { camera, renderer, invalidate } = useTres()
    const { onBeforeRender } = useLoop()
    const controls = shallowRef<OrbitControls | null>(null)

    watchEffect(() => {
      const activeCamera = camera.value
      const canvas = 'domElement' in renderer ? renderer.domElement : null
      if (!activeCamera || !canvas || controls.value)
        return

      const nextControls = new OrbitControls(activeCamera, canvas)
      nextControls.enableDamping = true
      nextControls.dampingFactor = 0.08
      nextControls.enablePan = false
      nextControls.minDistance = props.minDistance
      nextControls.maxDistance = props.maxDistance
      nextControls.minPolarAngle = props.minPolarAngle
      nextControls.maxPolarAngle = props.maxPolarAngle
      nextControls.target.set(0, 0.95, 0)
      nextControls.update()
      nextControls.addEventListener('change', invalidate)
      controls.value = nextControls
    })

    watch(
      () => props.target,
      (nextTarget) => {
        if (!controls.value)
          return

        controls.value.target.set(...nextTarget)
        controls.value.update()
      },
      { deep: true, immediate: true },
    )

    watch(
      () => [props.minDistance, props.maxDistance, props.minPolarAngle, props.maxPolarAngle],
      () => {
        if (!controls.value)
          return

        controls.value.minDistance = props.minDistance
        controls.value.maxDistance = props.maxDistance
        controls.value.minPolarAngle = props.minPolarAngle
        controls.value.maxPolarAngle = props.maxPolarAngle
        controls.value.update()
      },
      { immediate: true },
    )

    const stopLoopHook = onBeforeRender(() => {
      controls.value?.update()
    })

    tryOnBeforeUnmount(() => {
      stopLoopHook.off()
      controls.value?.dispose()
      controls.value = null
    })

    return () => null
  },
})
