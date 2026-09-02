<script setup lang="ts">
import type { DashboardExplorerProps } from './types'
import { computed } from 'vue'
import ChangeGaugePanel from './change-gauge/ChangeGaugePanel.vue'
import ChangeVolumePanel from './change-volume/ChangeVolumePanel.vue'
import CommitTimelinePanel from './commit-timeline/CommitTimelinePanel.vue'
import DashboardExplorerState from './DashboardExplorerState.vue'
import EvidenceRingPanel from './evidence-ring/EvidenceRingPanel.vue'
import ProfileRadarPanel from './profile-radar/ProfileRadarPanel.vue'
import RepositorySunburstPanel from './repository-sunburst/RepositorySunburstPanel.vue'
import VerdictPanel from './verdict/VerdictPanel.vue'

const props = defineProps<DashboardExplorerProps>()
const emit = defineEmits<{
  retry: []
}>()
const renderModel = computed(() => props.model)
const isLoading = computed(() => ['collecting-github', 'scoring', 'reviewing-ai', 'finalizing'].includes(props.phase))
const shouldShowState = computed(() => !renderModel.value || (renderModel.value.source === 'mock' && props.phase !== 'idle' && props.phase !== 'ready'))
const chartStatus = computed<'loading' | 'ready'>(() => isLoading.value ? 'loading' : 'ready')
</script>

<template>
  <div
    id="profile-panel"
    class="mt-8 gap-4 grid grid-cols-[minmax(0,1fr)] lg:grid-cols-12"
    :aria-busy="isLoading"
    :data-analysis-phase="phase"
  >
    <DashboardExplorerState
      v-if="shouldShowState"
      class="lg:col-span-12"
      :phase="phase"
      :progress="progress"
      :panel-class="panelClass"
      :muted-class="mutedClass"
      :username="username"
      :error-message="errorMessage"
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
          :clarity-breakdown="renderModel.profile.clarityBreakdown"
          :ai-review="renderModel.aiReview"
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
      </TransitionGroup>
    </template>
  </div>
</template>
