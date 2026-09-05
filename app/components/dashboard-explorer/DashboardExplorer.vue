<script setup lang="ts">
import type { DashboardExplorerProps } from './types'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import ChangeGaugePanel from './change-gauge/ChangeGaugePanel.vue'
import ChangeVolumePanel from './change-volume/ChangeVolumePanel.vue'
import CommitTimelinePanel from './commit-timeline/CommitTimelinePanel.vue'
import DashboardExplorerState from './DashboardExplorerState.vue'
import EvidenceRingPanel from './evidence-ring/EvidenceRingPanel.vue'
import ProfileRadarPanel from './profile-radar/ProfileRadarPanel.vue'
import ProfileReviewPanel from './profile-review/ProfileReviewPanel.vue'
import RepositorySunburstPanel from './repository-sunburst/RepositorySunburstPanel.vue'
import VerdictPanel from './verdict/VerdictPanel.vue'

const props = defineProps<DashboardExplorerProps>()
const emit = defineEmits<{
  retry: []
}>()
const renderModel = computed(() => props.model)
const profileUsername = computed(() => props.username?.trim() || renderModel.value?.identity.username || '')
const isLoading = computed(() => ['collecting-github', 'scoring', 'reviewing-ai', 'finalizing'].includes(props.phase))
const shouldShowState = computed(() => !renderModel.value || (renderModel.value.source === 'mock' && props.phase !== 'idle' && props.phase !== 'ready'))
const chartStatus = computed<'loading' | 'ready'>(() => isLoading.value ? 'loading' : 'ready')

const HANDOFF_DURATION_MS = 720
const isLoadingStateVisible = ref(false)
const isLoadingStateHandoff = ref(false)
const lastLoadingProgress = ref(props.progress ?? null)
const hasProfileHeadlineHandoff = ref(false)
const dashboardExplorerRoot = ref<HTMLElement | null>(null)
const profileHeadlineElement = ref<HTMLElement | null>(null)
const profileHeadlineStyle = ref<Record<string, string>>({
  opacity: '0',
  transform: 'translate3d(0, 0, 0) scale(1)',
  transformOrigin: 'top left',
})
const isProfileHeadlineTransitioning = ref(false)
let handoffTimeout: ReturnType<typeof setTimeout> | undefined
let profileHeadlineEnableFrame: number | undefined
let profileHeadlineResizeFrame: number | undefined

function clearHandoffTimeout() {
  if (handoffTimeout === undefined)
    return

  clearTimeout(handoffTimeout)
  handoffTimeout = undefined
}

function syncLoadingStateVisibility(nextShouldShowState: boolean) {
  if (nextShouldShowState) {
    clearHandoffTimeout()
    hasProfileHeadlineHandoff.value = false
    isLoadingStateVisible.value = true
    isLoadingStateHandoff.value = false
    return
  }

  if (!isLoadingStateVisible.value)
    return

  clearHandoffTimeout()
  hasProfileHeadlineHandoff.value = true
  isLoadingStateHandoff.value = true
  handoffTimeout = setTimeout(() => {
    isLoadingStateVisible.value = false
    isLoadingStateHandoff.value = false
    handoffTimeout = undefined
  }, HANDOFF_DURATION_MS)
}

interface ProfileHeadlineTarget {
  left: number
  top: number
  scale: number
}

function clearProfileHeadlineEnableFrame() {
  if (profileHeadlineEnableFrame === undefined)
    return

  window.cancelAnimationFrame(profileHeadlineEnableFrame)
  profileHeadlineEnableFrame = undefined
}

function getCardPadding(card: HTMLElement) {
  const styles = window.getComputedStyle(card)
  return {
    right: Number.parseFloat(styles.paddingRight) || 0,
    top: Number.parseFloat(styles.paddingTop) || 0,
  }
}

function getUntransformedCardRect(card: HTMLElement) {
  const rect = card.getBoundingClientRect()
  const transform = window.getComputedStyle(card).transform
  if (transform === 'none')
    return rect

  const values = transform.startsWith('matrix3d(')
    ? transform.slice(9, -1).split(',').map(Number)
    : transform.slice(7, -1).split(',').map(Number)
  const translateX = transform.startsWith('matrix3d(') ? values[12] || 0 : values[4] || 0
  const translateY = transform.startsWith('matrix3d(') ? values[13] || 0 : values[5] || 0

  return {
    ...rect,
    left: rect.left - translateX,
    right: rect.right - translateX,
    top: rect.top - translateY,
    bottom: rect.bottom - translateY,
  }
}

async function syncProfileHeadline() {
  await nextTick()

  const root = dashboardExplorerRoot.value
  const headline = profileHeadlineElement.value
  if (!root || !headline)
    return

  const rootRect = root.getBoundingClientRect()
  const naturalWidth = headline.offsetWidth
  const loadingAnchor = root.querySelector<HTMLElement>('[data-testid="dashboard-loading-profile-headline-anchor"]')
  const loadingCard = root.querySelector<HTMLElement>('[data-testid="dashboard-loading-card-profile"]')
  const finalCard = root.querySelector<HTMLElement>('[data-testid="profile-radar-panel"]')
  let target: ProfileHeadlineTarget | undefined

  if (isLoadingStateVisible.value && loadingAnchor && loadingCard && !isLoadingStateHandoff.value) {
    const anchorRect = loadingAnchor.getBoundingClientRect()
    const anchorStyles = window.getComputedStyle(loadingAnchor)
    const loadingScale = 0.72
    const scaledWidth = naturalWidth * loadingScale
    const left = anchorStyles.textAlign === 'center'
      ? anchorRect.left + (anchorRect.width - scaledWidth) / 2
      : anchorRect.left

    target = {
      left: left - rootRect.left,
      top: anchorRect.top - rootRect.top,
      scale: loadingScale,
    }
  }

  if (isLoadingStateHandoff.value && loadingCard) {
    const cardRect = getUntransformedCardRect(loadingCard)
    const padding = getCardPadding(loadingCard)
    target = {
      left: cardRect.right - padding.right - naturalWidth - rootRect.left,
      top: cardRect.top + padding.top - rootRect.top,
      scale: 1,
    }
  }

  if (!target && finalCard && !hasProfileHeadlineHandoff.value) {
    const cardRect = getUntransformedCardRect(finalCard)
    const padding = getCardPadding(finalCard)
    target = {
      left: cardRect.right - padding.right - naturalWidth - rootRect.left,
      top: cardRect.top + padding.top - rootRect.top,
      scale: 1,
    }
  }

  clearProfileHeadlineEnableFrame()
  if (!target) {
    if (hasProfileHeadlineHandoff.value && profileHeadlineStyle.value.opacity === '1') {
      isProfileHeadlineTransitioning.value = true
      return
    }

    isProfileHeadlineTransitioning.value = false
    profileHeadlineStyle.value = {
      opacity: '0',
      transform: 'translate3d(0, 0, 0) scale(1)',
      transformOrigin: 'top left',
    }
    return
  }

  const wasVisible = profileHeadlineStyle.value.opacity === '1'
  profileHeadlineStyle.value = {
    opacity: '1',
    transform: `translate3d(${target.left}px, ${target.top}px, 0) scale(${target.scale})`,
    transformOrigin: 'top left',
  }

  if (wasVisible || isLoadingStateHandoff.value) {
    isProfileHeadlineTransitioning.value = true
    return
  }

  isProfileHeadlineTransitioning.value = false
  profileHeadlineEnableFrame = window.requestAnimationFrame(() => {
    isProfileHeadlineTransitioning.value = true
    profileHeadlineEnableFrame = undefined
  })
}

function scheduleProfileHeadlineSync() {
  if (profileHeadlineResizeFrame !== undefined)
    return

  profileHeadlineResizeFrame = window.requestAnimationFrame(() => {
    profileHeadlineResizeFrame = undefined
    void syncProfileHeadline()
  })
}

watch(() => props.progress, (nextProgress) => {
  if (nextProgress) {
    lastLoadingProgress.value = nextProgress
  }
  else if (shouldShowState.value) {
    lastLoadingProgress.value = null
  }
}, { immediate: true })
watch(shouldShowState, syncLoadingStateVisibility, { immediate: true })
watch([isLoadingStateVisible, isLoadingStateHandoff, renderModel, profileUsername], () => {
  void syncProfileHeadline()
}, { immediate: true })
onMounted(() => {
  void syncProfileHeadline()
  window.addEventListener('resize', scheduleProfileHeadlineSync)
})
onBeforeUnmount(() => {
  clearHandoffTimeout()
  clearProfileHeadlineEnableFrame()
  window.removeEventListener('resize', scheduleProfileHeadlineSync)
  if (profileHeadlineResizeFrame !== undefined) {
    window.cancelAnimationFrame(profileHeadlineResizeFrame)
    profileHeadlineResizeFrame = undefined
  }
})

const displayedLoadingProgress = computed(() => isLoadingStateHandoff.value ? lastLoadingProgress.value : props.progress)
</script>

<template>
  <div
    id="profile-panel"
    ref="dashboardExplorerRoot"
    class="mt-8 gap-4 grid grid-cols-[minmax(0,1fr)] relative lg:grid-cols-12"
    :aria-busy="isLoading"
    :data-analysis-phase="phase"
  >
    <p
      ref="profileHeadlineElement"
      data-testid="dashboard-profile-headline"
      class="text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.92] tracking-[-0.055em] font-body font-light pointer-events-none whitespace-nowrap left-0 top-0 absolute z-20"
      :class="isProfileHeadlineTransitioning ? 'transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none' : 'transition-none'"
      :style="profileHeadlineStyle"
    >
      {{ profileUsername || 'profile' }}
    </p>
    <DashboardExplorerState
      v-if="isLoadingStateVisible"
      class="lg:col-span-12"
      :phase="phase"
      :progress="displayedLoadingProgress"
      :panel-class="panelClass"
      :muted-class="mutedClass"
      :username="profileUsername"
      :error-message="errorMessage"
      :is-handoff="isLoadingStateHandoff"
      @retry="emit('retry')"
    />
    <template v-else-if="renderModel">
      <TransitionGroup
        tag="div"
        class="contents"
        appear
        enter-active-class="transition-[opacity,transform,filter] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
        enter-from-class="opacity-0 translate-y-4 blur-sm"
        enter-to-class="opacity-100 translate-y-0 blur-0"
        leave-active-class="transition-[opacity,transform,filter] duration-300 ease-in motion-reduce:transition-none"
        leave-from-class="opacity-100 translate-y-0 blur-0"
        leave-to-class="opacity-0 translate-y-2 blur-sm"
      >
        <ProfileRadarPanel
          :key="`${renderModel.key}-radar`"
          :style="{ transitionDelay: '0ms' }"
          class="lg:col-span-6"
          :data="renderModel.charts.radar"
          :panel-class="panelClass"
          :muted-class="mutedClass"
        />
        <VerdictPanel
          :key="`${renderModel.key}-verdict`"
          :style="{ transitionDelay: '70ms' }"
          class="lg:col-span-6"
          :grade="renderModel.verdict.grade"
          :growth-level="renderModel.verdict.growthLevel"
          :headline="renderModel.verdict.headline"
          :note="renderModel.verdict.note"
          :panel-class="panelClass"
          :muted-class="mutedClass"
        />
        <EvidenceRingPanel
          :key="`${renderModel.key}-ring`"
          :style="{ transitionDelay: '140ms' }"
          :data="renderModel.charts.ring"
          heading="Profile signals"
          center-label="Profile score"
          :is-live="renderModel.source === 'live'"
          :panel-class="panelClass"
          :muted-class="mutedClass"
        />
        <ChangeGaugePanel
          :key="`${renderModel.key}-gauge`"
          :style="{ transitionDelay: '210ms' }"
          :value="renderModel.charts.gauge.value"
          :center-value="renderModel.charts.gauge.centerValue"
          :label="renderModel.charts.gauge.label"
          :description="renderModel.charts.gauge.description"
          :is-live="renderModel.source === 'live'"
          :panel-class="panelClass"
          :muted-class="mutedClass"
        />
        <ChangeVolumePanel
          :key="`${renderModel.key}-volume`"
          :style="{ transitionDelay: '280ms' }"
          :data="renderModel.charts.changeVolume"
          :chart-status="chartStatus"
          :panel-class="panelClass"
          :muted-class="mutedClass"
        />
        <CommitTimelinePanel
          :key="`${renderModel.key}-timeline`"
          :style="{ transitionDelay: '350ms' }"
          :data="renderModel.charts.commitRhythm"
          :markers="renderModel.source === 'live' ? [] : undefined"
          :chart-status="chartStatus"
          :panel-class="panelClass"
          :muted-class="mutedClass"
        />
        <RepositorySunburstPanel
          :key="`${renderModel.key}-sunburst`"
          :style="{ transitionDelay: '420ms' }"
          :data="renderModel.charts.repositoryAnatomy"
          :description="renderModel.source === 'live' ? 'Files and folders are sized by changed lines in the enriched GitHub sample.' : 'Repository folders and file hotspots derived from the selected mock profile.'"
          :is-live="renderModel.source === 'live'"
          :panel-class="panelClass"
          :muted-class="mutedClass"
        />
        <ProfileReviewPanel
          v-if="renderModel.profile.clarityBreakdown || renderModel.aiReview"
          :key="`${renderModel.key}-review`"
          :style="{ transitionDelay: '490ms' }"
          class="lg:col-span-12"
          :clarity-breakdown="renderModel.profile.clarityBreakdown"
          :ai-review="renderModel.aiReview"
          :is-live="renderModel.source === 'live'"
          :panel-class="panelClass"
          :muted-class="mutedClass"
        />
      </TransitionGroup>
    </template>
  </div>
</template>
