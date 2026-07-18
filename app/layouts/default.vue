<script setup lang="ts">
import type { PrismGradientSettings } from '~/composables/usePrismGradientSettings'
import PrismGradientBackground from '~/components/PrismGradientBackground.client.vue'
import PrismGradientDevPanel from '~/components/PrismGradientDevPanel.vue'
import { usePrismGradientSettings } from '~/composables/usePrismGradientSettings'

const isDev = import.meta.dev
const route = useRoute()
const isEntryOverlayVisible = useLandingEntryOverlay()
const isEntryOverlayRevealChrome = useLandingEntryOverlayRevealChrome()

const shouldHideChromeForEntryOverlay = computed(() =>
  route.path === '/' && isEntryOverlayVisible.value && !isEntryOverlayRevealChrome.value,
)

const {
  settings,
  isPanelOpen,
  isPanelVisible,
  togglePanel,
  resetSettings,
  closePanel,
  showPanel,
} = usePrismGradientSettings()

function applySettings(nextSettings: PrismGradientSettings) {
  Object.assign(settings, nextSettings)
}
</script>

<template>
  <div class="text-on-surface bg-black min-h-screen selection:text-on-surface selection:bg-primary">
    <div class="pointer-events-none inset-0 fixed z-0">
      <PrismGradientBackground
        class="inset-0 absolute"
        :speed="settings.speed"
        :radius="settings.radius"
        :noise="{ opacity: settings.noiseOpacity, scale: settings.noiseScale }"
        :colors="{ dark: settings.darkColors, light: settings.lightColors }"
      />
    </div>

    <div class="relative z-10">
      <Transition
        enter-active-class="transition-transform duration-650 ease-[cubic-bezier(0.22,1,0.36,1)]"
        enter-from-class="-translate-y-4"
        enter-to-class="translate-y-0"
      >
        <LandingTopNav v-if="!shouldHideChromeForEntryOverlay" />
      </Transition>
      <main>
        <slot />
      </main>
    </div>

    <PrismGradientDevPanel
      v-if="isDev && !shouldHideChromeForEntryOverlay"
      :settings="settings"
      :is-panel-open="isPanelOpen"
      :is-panel-visible="isPanelVisible"
      @update:settings="applySettings"
      @toggle="togglePanel"
      @reset="resetSettings"
      @close="closePanel"
      @show="showPanel"
    />
  </div>
</template>
