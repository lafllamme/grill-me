<script setup lang="ts">
import type { PrismGradientSettings, PrismGradientShaderSettings } from '~/models/prism-gradient'
import PrismGradientBackground from '~/components/PrismGradientBackground.client.vue'
import PrismGradientDevPanel from '~/components/PrismGradientDevPanel.vue'
import { usePrismGradientSettings } from '~/composables/usePrismGradientSettings'

const isDev = import.meta.dev
const route = useRoute()
const shouldShowGlobalChrome = computed(() => route.path !== '/' && route.path !== '/roast')
const shouldShowGlobalNav = computed(() => shouldShowGlobalChrome.value && route.path !== '/dashboard-explorer' && route.path !== '/design-system')
const shouldShowDevPanel = computed(() => isDev && shouldShowGlobalChrome.value && route.path !== '/dashboard-explorer')

const {
  settings,
  isPanelOpen,
  isPanelVisible,
  togglePanel,
  resetSettings,
  closePanel,
  showPanel,
} = usePrismGradientSettings()

const shaderSettings = computed<PrismGradientShaderSettings>(() => ({
  rotation: settings.rotation,
  proportion: settings.proportion,
  scale: settings.scale,
  distortion: settings.distortion,
  swirl: settings.swirl,
  swirlIterations: settings.swirlIterations,
  softness: settings.softness,
  offset: settings.offset,
  shapeSize: settings.shapeSize,
}))

function applySettings(nextSettings: PrismGradientSettings) {
  Object.assign(settings, nextSettings)
}
</script>

<template>
  <div class="text-on-surface bg-black min-h-screen selection:text-on-surface selection:bg-primary">
    <div
      v-if="shouldShowGlobalChrome"
      class="pointer-events-none inset-0 fixed z-0"
    >
      <PrismGradientBackground
        class="inset-0 absolute"
        :speed="settings.speed"
        :ambient-opacity="settings.ambientOpacity"
        :radius="settings.radius"
        :noise="{ opacity: settings.noiseOpacity, scale: settings.noiseScale }"
        :colors="{ dark: settings.darkColors, light: settings.lightColors }"
        :shader="shaderSettings"
      />
    </div>

    <div class="relative z-10">
      <Transition
        enter-active-class="transition-transform duration-650 ease-[cubic-bezier(0.22,1,0.36,1)]"
        enter-from-class="-translate-y-4"
        enter-to-class="translate-y-0"
      >
        <LandingTopNav v-if="shouldShowGlobalNav" />
      </Transition>
      <main>
        <slot />
      </main>
    </div>

    <PrismGradientDevPanel
      v-if="shouldShowDevPanel"
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
