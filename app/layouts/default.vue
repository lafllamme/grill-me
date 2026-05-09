<script setup lang="ts">
import type { GrainientSettings } from '~/composables/useGrainientSettings'
import { useGrainientSettings } from '~/composables/useGrainientSettings'

const isDev = import.meta.dev
const route = useRoute()
const isEntryOverlayVisible = useLandingEntryOverlay()

const shouldHideChromeForEntryOverlay = computed(() => route.path === '/' && isEntryOverlayVisible.value)

const {
  settings,
  isPanelOpen,
  togglePanel,
  resetSettings,
} = useGrainientSettings()

function applySettings(nextSettings: GrainientSettings) {
  Object.assign(settings, nextSettings)
}
</script>

<template>
  <div class="text-on-surface bg-black min-h-screen selection:text-on-surface selection:bg-primary">
    <div class="pointer-events-none inset-0 fixed z-0">
      <GrainientBackground
        class-name="inset-0 absolute"
        :time-speed="settings.timeSpeed"
        :color-balance="settings.colorBalance"
        :warp-strength="settings.warpStrength"
        :warp-frequency="settings.warpFrequency"
        :warp-speed="settings.warpSpeed"
        :warp-amplitude="settings.warpAmplitude"
        :blend-angle="settings.blendAngle"
        :blend-softness="settings.blendSoftness"
        :rotation-amount="settings.rotationAmount"
        :noise-scale="settings.noiseScale"
        :grain-amount="settings.grainAmount"
        :grain-scale="settings.grainScale"
        :grain-animated="settings.grainAnimated"
        :contrast="settings.contrast"
        :gamma="settings.gamma"
        :saturation="settings.saturation"
        :center-x="settings.centerX"
        :center-y="settings.centerY"
        :zoom="settings.zoom"
        :color1="settings.color1"
        :color2="settings.color2"
        :color3="settings.color3"
      />
    </div>

    <div class="relative z-10">
      <LandingTopNav v-if="!shouldHideChromeForEntryOverlay" />
      <main>
        <slot />
      </main>
    </div>

    <GrainientBackgroundSettings
      v-if="isDev && !shouldHideChromeForEntryOverlay"
      :settings="settings"
      :is-panel-open="isPanelOpen"
      @update:settings="applySettings"
      @toggle="togglePanel"
      @reset="resetSettings"
    />
  </div>
</template>
