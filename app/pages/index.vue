<script setup lang="ts">
import { createEntryOverlayActions } from '~/utils/landing-entry-overlay'

const isEntryOverlayVisible = useLandingEntryOverlay()

const { onContinue, onNotToday } = createEntryOverlayActions({
  isOverlayVisible: isEntryOverlayVisible,
  navigateTo,
})
</script>

<template>
  <div>
    <LandingEntryOverlay
      v-if="isEntryOverlayVisible"
      @overlay-continue="onContinue"
      @overlay-decline="onNotToday"
    />

    <div :aria-hidden="isEntryOverlayVisible" :inert="isEntryOverlayVisible || undefined">
      <LandingHeroSection />
      <LandingGrillSceneSection />
      <LandingResultTerminal />
      <LandingMetricsSection />
      <LandingRoastWallSection />
      <LandingFinalCtaSection />
      <LandingFooter />
    </div>
  </div>
</template>
