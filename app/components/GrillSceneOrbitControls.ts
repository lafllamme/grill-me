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
      nextControls.minDistance = 4.4
      nextControls.maxDistance = 12.6
      nextControls.minPolarAngle = 0.62
      nextControls.maxPolarAngle = 1.52
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
