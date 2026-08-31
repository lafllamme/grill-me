<script setup lang="ts">
import type { DashboardExplorerProps } from './types'
import { computed } from 'vue'
import ChangeGaugePanel from './change-gauge/ChangeGaugePanel.vue'
import ChangeVolumePanel from './change-volume/ChangeVolumePanel.vue'
import CommitTimelinePanel from './commit-timeline/CommitTimelinePanel.vue'
import EvidenceRingPanel from './evidence-ring/EvidenceRingPanel.vue'
import ProfileRadarPanel from './profile-radar/ProfileRadarPanel.vue'
import RepositorySunburstPanel from './repository-sunburst/RepositorySunburstPanel.vue'
import VerdictPanel from './verdict/VerdictPanel.vue'

const props = defineProps<DashboardExplorerProps>()
const isLive = computed(() => props.model.source === 'live')
</script>

<template>
  <div
    id="profile-panel"
    class="mt-8 gap-4 grid grid-cols-[minmax(0,1fr)] lg:grid-cols-12"
    :aria-busy="phase !== 'idle' && phase !== 'ready'"
    :data-analysis-phase="phase"
  >
    <ProfileRadarPanel
      :key="`${model.key}-radar`"
      class="lg:col-span-6"
      :data="model.charts.radar"
      :panel-class="panelClass"
      :muted-class="mutedClass"
    />
    <VerdictPanel
      :key="`${model.key}-verdict`"
      class="lg:col-span-6"
      :grade="model.verdict.grade"
      :growth-level="model.verdict.growthLevel"
      :headline="model.verdict.headline"
      :note="model.verdict.note"
      :panel-class="panelClass"
      :muted-class="mutedClass"
    />
    <EvidenceRingPanel
      :key="`${model.key}-ring`"
      :data="model.charts.ring"
      heading="Profile signals"
      center-label="Profile score"
      :is-live="isLive"
      :panel-class="panelClass"
      :muted-class="mutedClass"
    />
    <ChangeGaugePanel
      :key="`${model.key}-gauge`"
      :value="model.charts.gauge.value"
      :center-value="model.charts.gauge.centerValue"
      :label="model.charts.gauge.label"
      :description="model.charts.gauge.description"
      :is-live="isLive"
      :panel-class="panelClass"
      :muted-class="mutedClass"
    />
    <ChangeVolumePanel
      :key="`${model.key}-volume`"
      :data="model.charts.changeVolume"
      :panel-class="panelClass"
      :muted-class="mutedClass"
    />
    <CommitTimelinePanel
      :key="`${model.key}-timeline`"
      :data="model.charts.commitRhythm"
      :markers="model.source === 'live' ? [] : undefined"
      :panel-class="panelClass"
      :muted-class="mutedClass"
    />
    <RepositorySunburstPanel
      :key="`${model.key}-sunburst`"
      :data="model.charts.repositoryAnatomy"
      :description="model.source === 'live' ? 'Files and folders are sized by changed lines in the enriched GitHub sample.' : 'Repository folders and file hotspots derived from the selected mock profile.'"
      :is-live="isLive"
      :panel-class="panelClass"
      :muted-class="mutedClass"
    />
  </div>
</template>
