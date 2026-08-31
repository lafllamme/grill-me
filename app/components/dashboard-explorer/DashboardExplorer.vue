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
const isLoading = computed(() => ['collecting-github', 'scoring', 'reviewing-ai'].includes(props.phase))
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
      :panel-class="panelClass"
      :muted-class="mutedClass"
      :username="username"
      :error-message="errorMessage"
      @retry="emit('retry')"
    />
    <template v-else-if="renderModel">
      <ProfileRadarPanel
        :key="`${renderModel.key}-radar`"
        class="lg:col-span-6"
        :data="renderModel.charts.radar"
        :panel-class="panelClass"
        :muted-class="mutedClass"
      />
      <VerdictPanel
        :key="`${renderModel.key}-verdict`"
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
        :data="renderModel.charts.ring"
        heading="Profile signals"
        center-label="Profile score"
        :is-live="renderModel.source === 'live'"
        :panel-class="panelClass"
        :muted-class="mutedClass"
      />
      <ChangeGaugePanel
        :key="`${renderModel.key}-gauge`"
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
        :data="renderModel.charts.changeVolume"
        :chart-status="chartStatus"
        :panel-class="panelClass"
        :muted-class="mutedClass"
      />
      <CommitTimelinePanel
        :key="`${renderModel.key}-timeline`"
        :data="renderModel.charts.commitRhythm"
        :markers="renderModel.source === 'live' ? [] : undefined"
        :chart-status="chartStatus"
        :panel-class="panelClass"
        :muted-class="mutedClass"
      />
      <RepositorySunburstPanel
        :key="`${renderModel.key}-sunburst`"
        :data="renderModel.charts.repositoryAnatomy"
        :description="renderModel.source === 'live' ? 'Files and folders are sized by changed lines in the enriched GitHub sample.' : 'Repository folders and file hotspots derived from the selected mock profile.'"
        :is-live="renderModel.source === 'live'"
        :panel-class="panelClass"
        :muted-class="mutedClass"
      />
    </template>
  </div>
</template>
