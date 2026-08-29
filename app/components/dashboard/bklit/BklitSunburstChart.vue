<script setup lang="ts">
import type { SunburstArc, SunburstNode } from './sunburst'
import { usePreferredReducedMotion } from '@vueuse/core'
import { animate, motionValue } from 'motion-v'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import BklitSunburstLabel from './BklitSunburstLabel.vue'
import BklitSunburstSegment from './BklitSunburstSegment.vue'
import { buildHoverGeometry, buildSunburstLayout, getBreadcrumbIds, getSegmentColor, isDescendant, maxHoverSegmentThickness, transitionSunburstGeometry } from './sunburst'
import { useBklitEnter } from './use-bklit-enter'

const props = withDefaults(defineProps<{
  data: SunburstNode
  size?: number
  replayKey?: string
}>(), {
  size: 560,
  replayKey: 'sunburst',
})

const prefersReducedMotion = usePreferredReducedMotion()
const layout = computed(() => buildSunburstLayout(props.data))
const focusId = ref(layout.value.rootId)
const hoveredId = ref<string | null>(null)
const previousFocusId = ref(layout.value.rootId)
const zoomProgressMotion = motionValue(1)
const zoomProgress = ref(zoomProgressMotion.get())
let stopZoomAnimation: (() => void) | undefined
const radius = computed(() => Math.min(82, (props.size / 2 - 26) / Math.max(layout.value.maxDepth, 1)))
const focusArc = computed(() => layout.value.arcs.find(arc => arc.id === focusId.value))
const visibleArcs = computed(() => layout.value.arcs.filter((arc) => {
  if (focusId.value === layout.value.rootId) {
    return true
  }
  return isDescendant(arc.id, focusId.value) && arc.id !== focusId.value
}))
const renderArcs = computed(() => [...layout.value.arcs].sort((a, b) => b.depth - a.depth || b.arcIndex - a.arcIndex))
const previousFocusArc = computed(() => layout.value.arcs.find(arc => arc.id === previousFocusId.value) ?? null)
const currentFocusArc = computed(() => layout.value.arcs.find(arc => arc.id === focusId.value) ?? null)
const arcGeometries = computed(() => new Map(renderArcs.value.map(arc => [arc.id, transitionSunburstGeometry(arc, previousFocusArc.value, currentFocusArc.value, layout.value.maxDepth, radius.value, zoomProgress.value)])))
const targetHoverGeometries = computed(() => buildHoverGeometry(renderArcs.value, hoveredId.value, radius.value, layout.value.maxDepth, focusId.value === layout.value.rootId ? null : focusId.value))
const animatedHoverGeometries = ref(new Map<string, { grow: number, offset: number }>())
let stopHoverAnimation: (() => void) | undefined
const breadcrumbIds = computed(() => getBreadcrumbIds(focusId.value, layout.value.nodes))
const breadcrumbItems = computed(() => breadcrumbIds.value.map(id => ({ id, name: layout.value.nodes.get(id)?.name ?? id.split(' / ').at(-1) ?? id })))

function arcIndex(arc: SunburstArc) {
  return layout.value.arcs.findIndex(item => item.id === arc.id)
}

function isRelated(arc: SunburstArc) {
  if (!hoveredId.value) {
    return true
  }
  return isDescendant(arc.id, hoveredId.value) || isDescendant(hoveredId.value, arc.id)
}

function selectArc(arc: SunburstArc) {
  if (arc.hasChildren) {
    zoomTo(arc.id)
  }
}

function zoomTo(id: string) {
  if (id === focusId.value) {
    return
  }
  stopZoomAnimation?.()
  previousFocusId.value = focusId.value
  focusId.value = id
  hoveredId.value = null
  zoomProgressMotion.set(0)
  const controls = animate(zoomProgressMotion, 1, {
    type: 'tween',
    duration: 0.75,
    ease: [0.22, 1, 0.36, 1],
    onComplete: () => {
      previousFocusId.value = id
    },
  })
  stopZoomAnimation = () => controls.stop()
}

function zoomOut() {
  if (focusId.value === layout.value.rootId) {
    return
  }
  const parentId = focusArc.value?.parentId ?? layout.value.rootId
  zoomTo(parentId)
}

function handleChartFocusOut(event: FocusEvent) {
  const chart = event.currentTarget
  const nextTarget = event.relatedTarget
  if (chart instanceof SVGSVGElement && !(nextTarget instanceof Node && chart.contains(nextTarget))) {
    hoveredId.value = null
  }
}

onMounted(() => {
  const unsubscribe = zoomProgressMotion.on('change', (value) => {
    zoomProgress.value = value
  })
  onBeforeUnmount(unsubscribe)
  const stopWatchingHover = watch([hoveredId, targetHoverGeometries], startHoverTransition, { flush: 'post' })
  onBeforeUnmount(stopWatchingHover)
})
onBeforeUnmount(() => {
  stopZoomAnimation?.()
  stopHoverAnimation?.()
})

function segmentDelay(arc: SunburstArc) {
  const sameDepth = visibleArcs.value
    .filter(item => item.depth === arc.depth)
    .sort((a, b) => a.startAngle - b.startAngle)
  const index = sameDepth.findIndex(item => item.id === arc.id)
  return ((arc.depth - 1) * 0.12 + index * 0.08)
}

const labelsDelay = computed(() => {
  const maxSegmentDelay = visibleArcs.value.reduce((latest, arc) => Math.max(latest, segmentDelay(arc)), 0)
  return maxSegmentDelay + 1.1 * 0.85
})
// Bklit reuses the chart entrance transition for labels instead of a short
// independent fade, which keeps the final settle relaxed and coordinated.
const labelsProgress = useBklitEnter(true, labelsDelay.value, () => props.replayKey, { type: 'tween', durationSeconds: 1.1 })
const chartOpacity = useBklitEnter(prefersReducedMotion.value !== 'reduce', 0, () => props.replayKey, { type: 'tween', durationSeconds: 0.35 })

function segmentFillOpacity(arc: SunburstArc) {
  return Math.max(0.45, 1 - Math.max(0, arc.depth - 1) * 0.15)
}

function hoverGeometry(arc: SunburstArc) {
  const hover = animatedHoverGeometries.value.get(arc.id) ?? { grow: 0, offset: 0 }
  const geometry = arcGeometries.value.get(arc.id)
  if (!geometry || (!hover.grow && !hover.offset)) {
    return hover
  }
  const maxExpandedThickness = maxHoverSegmentThickness(layout.value.maxDepth, radius.value)
  const baseThickness = geometry.outerRadius - geometry.innerRadius
  if (baseThickness >= maxExpandedThickness) {
    return { grow: 0, offset: hover.offset }
  }
  return {
    grow: Math.min(hover.grow, maxExpandedThickness - baseThickness),
    offset: hover.offset,
  }
}

function startHoverTransition() {
  stopHoverAnimation?.()
  const starts = new Map(animatedHoverGeometries.value)
  const targets = targetHoverGeometries.value
  const ids = new Set([...starts.keys(), ...targets.keys()])
  if (prefersReducedMotion.value === 'reduce') {
    animatedHoverGeometries.value = new Map(targets)
    return
  }
  const controls = animate(0, 1, {
    type: 'tween',
    duration: 0.42,
    ease: [0.22, 1, 0.36, 1],
    onUpdate: (progress) => {
      const next = new Map<string, { grow: number, offset: number }>()
      for (const id of ids) {
        const start = starts.get(id) ?? { grow: 0, offset: 0 }
        const target = targets.get(id) ?? { grow: 0, offset: 0 }
        const grow = start.grow + (target.grow - start.grow) * progress
        const offset = start.offset + (target.offset - start.offset) * progress
        if (grow > 0.01 || offset > 0.01) {
          next.set(id, { grow, offset })
        }
      }
      animatedHoverGeometries.value = next
    },
  })
  stopHoverAnimation = () => controls.stop()
}

function labelVisible(arc: SunburstArc) {
  const geometry = arcGeometries.value.get(arc.id)
  if (!geometry) {
    return false
  }
  const hover = hoverGeometry(arc)
  const labelRadius = (geometry.innerRadius + geometry.outerRadius) / 2 + hover.offset + hover.grow / 2
  const angularSpace = (geometry.endAngle - geometry.startAngle) * labelRadius
  const radialSpace = geometry.outerRadius - geometry.innerRadius + hover.grow - 6

  // Bklit uses the geometric label gate: every segment gets a label when the
  // available arc length and ring width can hold it without collision.
  return angularSpace >= 26 && radialSpace >= 16
}
</script>

<template>
  <div class="w-full">
    <nav v-if="focusId !== layout.rootId" aria-label="Sunburst navigation" class="text-xs font-meta mb-2 flex flex-wrap gap-2 items-center justify-center">
      <template v-for="(item, index) in breadcrumbItems" :key="item.id">
        <span v-if="index" class="text-current/35" aria-hidden="true">›</span>
        <button
          v-if="index < breadcrumbItems.length - 1"
          class="text-current/60 transition-colors hover:text-current focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          type="button"
          @click="zoomTo(item.id)"
        >
          {{ item.name }}
        </button>
        <span v-else class="text-current">{{ item.name }}</span>
      </template>
    </nav>

    <div class="mx-auto flex w-full justify-center relative overflow-visible" :style="{ minHeight: `${props.size + 44}px` }">
      <svg
        class="h-auto max-w-full overflow-visible"
        :style="{ width: `${props.size}px`, opacity: prefersReducedMotion === 'reduce' ? 1 : chartOpacity }"
        :viewBox="`${-props.size / 2} ${-props.size / 2} ${props.size} ${props.size}`"
        :aria-label="`${props.data.name} hierarchy sunburst`"
        @focusout="handleChartFocusOut"
        @pointerleave="hoveredId = null"
      >
        <g :style="{ transformOrigin: '0 0' }">
          <BklitSunburstSegment
            v-for="arc in renderArcs"
            :key="`${props.replayKey}-${arc.id}`"
            :arc="arc"
            :color="getSegmentColor(arc, arcIndex(arc))"
            :delay="segmentDelay(arc)"
            :fill-opacity="segmentFillOpacity(arc)"
            :geometry="arcGeometries.get(arc.id) ?? null"
            :hover-grow="hoverGeometry(arc).grow"
            :hover-offset="hoverGeometry(arc).offset"
            :is-related="isRelated(arc)"
            :reduced-motion="prefersReducedMotion === 'reduce'"
            :replay-key="props.replayKey"
            @hover="hoveredId = $event ? arc.id : null"
            @select="selectArc(arc)"
          />
          <g :style="{ opacity: labelsProgress }" pointer-events="none">
            <template v-for="arc in renderArcs" :key="`${props.replayKey}-label-${arc.id}`">
              <BklitSunburstLabel
                v-if="labelVisible(arc) && isRelated(arc) && arcGeometries.get(arc.id)"
                :arc="arc"
                :geometry="arcGeometries.get(arc.id)!"
                :hover-grow="hoverGeometry(arc).grow"
                :hover-offset="hoverGeometry(arc).offset"
                :reduced-motion="prefersReducedMotion === 'reduce'"
              />
            </template>
          </g>
          <circle v-if="focusId !== layout.rootId" class="cursor-pointer fill-current/8 stroke-current/20" :r="Math.max(radius * 0.9, 20)" stroke-width="1" @click="zoomOut" />
        </g>
      </svg>
    </div>
    <p class="text-sm text-current/55 text-center min-h-5" aria-live="polite">
      <template v-if="hoveredId">
        {{ hoveredId.replaceAll(' / ', ' › ') }}
      </template>
      <template v-else-if="focusId === layout.rootId">
        Click a segment to zoom in · hover to inspect
      </template>
      <template v-else>
        Click the center to zoom out
      </template>
    </p>
  </div>
</template>
