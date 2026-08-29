<script setup lang="ts">
import type { SunburstArc, SunburstNode } from './sunburst'
import { usePreferredReducedMotion } from '@vueuse/core'
import { computed, ref } from 'vue'
import BklitSunburstSegment from './BklitSunburstSegment.vue'
import { buildSunburstLayout, getBreadcrumbIds, getSegmentColor, isDescendant } from './sunburst'
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
const radius = computed(() => Math.min(82, (props.size / 2 - 26) / Math.max(layout.value.maxDepth, 1)))
const focusArc = computed(() => layout.value.arcs.find(arc => arc.id === focusId.value))
const visibleArcs = computed(() => layout.value.arcs.filter((arc) => {
  if (focusId.value === layout.value.rootId) {
    return true
  }
  return isDescendant(arc.id, focusId.value) && arc.id !== focusId.value
}))
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
    focusId.value = arc.id
    hoveredId.value = null
  }
}

function zoomTo(id: string) {
  focusId.value = id
  hoveredId.value = null
}

function zoomOut() {
  if (focusId.value === layout.value.rootId) {
    return
  }
  const parentId = focusArc.value?.parentId ?? layout.value.rootId
  zoomTo(parentId)
}

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

function segmentOpacity(arc: SunburstArc) {
  return isRelated(arc) ? (1 - Math.max(0, arc.depth - 1) * 0.12) : 0.25
}

function labelVisible(arc: SunburstArc) {
  const ringWidth = radius.value
  const labelRadius = (arc.depth - 0.5) * ringWidth + 3
  const angularSpace = (arc.endAngle - arc.startAngle) * labelRadius
  const radialSpace = ringWidth - 6

  // Bklit uses the geometric label gate: every segment gets a label when the
  // available arc length and ring width can hold it without collision.
  return angularSpace >= 26 && radialSpace >= 16
}

function labelPosition(arc: SunburstArc) {
  const angle = (arc.startAngle + arc.endAngle) / 2
  const labelRadius = (arc.depth - 0.5) * radius.value + 3
  return {
    x: Number((Math.sin(angle) * labelRadius).toFixed(3)),
    y: Number((-Math.cos(angle) * labelRadius).toFixed(3)),
    angle,
  }
}

function labelRotation(arc: SunburstArc) {
  let degrees = labelPosition(arc).angle * 180 / Math.PI - 90
  if (degrees > 90) {
    degrees -= 180
  }
  if (degrees < -90) {
    degrees += 180
  }
  return degrees
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
        :style="{ width: `${props.size}px`, opacity: prefersReducedMotion === 'reduce' ? 1 : undefined }"
        :viewBox="`${-props.size / 2} ${-props.size / 2} ${props.size} ${props.size}`"
        :aria-label="`${props.data.name} hierarchy sunburst`"
      >
        <g :style="{ transformOrigin: '0 0' }">
          <g
            v-for="arc in visibleArcs"
            :key="`${props.replayKey}-${arc.id}-${focusId}`"
            class="cursor-pointer"
            :style="{ opacity: segmentOpacity(arc), transition: prefersReducedMotion === 'reduce' ? 'none' : 'opacity 160ms ease-out, transform 420ms cubic-bezier(0.22, 1, 0.36, 1)', transform: isRelated(arc) && hoveredId === arc.id ? `translate(${Math.sin((arc.startAngle + arc.endAngle) / 2) * 8}px, ${-Math.cos((arc.startAngle + arc.endAngle) / 2) * 8}px)` : undefined }"
            @mouseenter="hoveredId = arc.id"
            @mouseleave="hoveredId = null"
            @focusin="hoveredId = arc.id"
            @focusout="hoveredId = null"
          >
            <BklitSunburstSegment :arc="arc" :color="getSegmentColor(arc, arcIndex(arc))" :delay="segmentDelay(arc)" :hover-grow="hoveredId ? (isRelated(arc) ? 8 : 0) : 0" :reduced-motion="prefersReducedMotion === 'reduce'" :radius="radius" :replay-key="props.replayKey" @select="selectArc(arc)" />
            <title>{{ arc.name }} · {{ arc.value }} changes</title>
          </g>
          <g :style="{ opacity: labelsProgress }" pointer-events="none">
            <template v-for="arc in visibleArcs" :key="`${props.replayKey}-label-${arc.id}-${focusId}`">
              <text
                v-if="labelVisible(arc) && isRelated(arc)"
                :x="labelPosition(arc).x"
                :y="labelPosition(arc).y"
                dominant-baseline="middle"
                fill="var(--chart-label)"
                font-size="11"
                font-weight="600"
                text-anchor="middle"
                paint-order="stroke"
                stroke="var(--chart-background)"
                stroke-linejoin="round"
                stroke-width="2.5"
                :transform="`rotate(${labelRotation(arc)} ${labelPosition(arc).x} ${labelPosition(arc).y})`"
              >{{ arc.name }}</text>
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
