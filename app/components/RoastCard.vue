<script lang="ts" setup>
const props = withDefaults(defineProps<{
  pending?: boolean
  isStreaming?: boolean
  canSubmit?: boolean
  roastIntensity?: number
  errorMessage?: string | null
}>(), {
  pending: false,
  isStreaming: false,
  canSubmit: false,
  roastIntensity: 2,
  errorMessage: null,
})

const emit = defineEmits<{
  'submit': []
  'update:roastIntensity': [value: number]
}>()

const isBusy = computed(() => props.pending || props.isStreaming)

function onSubmit() {
  emit('submit')
}

function onUpdateRoastIntensity(value: number) {
  emit('update:roastIntensity', value)
}
</script>

<template>
  <article
    class="supports-backdrop-filter:backdrop-blur-md p-4 border border-[lab(100%_0_0_/_0.1)] rounded-[2.25rem] border-solid bg-[rgba(38,38,38,0.07)] w-full relative overflow-hidden backdrop-blur-md md:p-7"
  >
    <div class="h-16 pointer-events-none inset-x-0 top-0 absolute from-white/5 to-transparent bg-gradient-to-b" />

    <header class="mb-5 flex flex-col gap-4 relative md:mb-6 md:flex-row md:items-center md:justify-between">
      <div class="text-left">
        <p class="text-xs text-primary tracking-[0.16em] font-body font-medium mb-1 uppercase">
          Source Target
        </p>
        <p class="text-[2rem] text-on-surface leading-tight tracking-tight font-headline font-semibold">
          GitHub Username
        </p>
      </div>

      <div class="text-xs text-on-surface-variant tracking-[0.08em] font-body font-medium px-5 py-2 border border-[lab(100%_0_0_/_0.16)] rounded-full bg-[rgba(8,10,12,0.58)] uppercase">
        <span class="inline-flex gap-2 items-center">
          <Icon class="text-base text-primary" name="ph:shield-check" />
          Secure_Tunnel: Active
        </span>
      </div>
    </header>

    <div class="flex flex-col gap-3 relative md:flex-row md:items-center">
      <RoastInput :disabled="isBusy" @submit="onSubmit" />

      <button
        class="group/btn text-lg text-background tracking-[0.02em] font-headline font-semibold px-10 rounded-[2rem] shrink-0 h-[4.5rem] uppercase shadow-[0_8px_26px_rgba(255,51,0,0.25)] transition duration-300 relative overflow-hidden from-primary to-primary-container bg-gradient-to-br disabled:opacity-60 md:min-w-[11rem] disabled:cursor-not-allowed hover:shadow-[0_10px_30px_rgba(255,51,0,0.32)] active:scale-95 hover:brightness-110"
        :disabled="!isBusy && !canSubmit"
        @click="onSubmit"
      >
        <span class="inline-flex gap-2 items-center relative z-10">
          {{ isBusy ? "Grilling..." : "Grill" }}
          <Icon class="text-xl" name="ph:fire" />
        </span>
        <span
          v-if="!isBusy"
          class="bg-white/16 opacity-0 pointer-events-none transition-opacity duration-300 inset-0 absolute group-hover/btn:opacity-100"
        />
      </button>
    </div>

    <RoastLevel
      :disabled="isBusy"
      :model-value="roastIntensity"
      @update:model-value="onUpdateRoastIntensity"
    />

    <p v-if="errorMessage" class="text-sm text-primary font-body mt-4 text-left">
      {{ errorMessage }}
    </p>

    <footer class="text-[10px] text-on-surface-variant tracking-[0.14em] font-bold font-display mt-5 text-center flex flex-wrap gap-3 uppercase items-center justify-center">
      <span class="inline-flex gap-1 items-center justify-center">
        <Icon class="text-[12px] text-primary" name="ph:fire" />
        4,209 repos destroyed today
      </span>
      <span class="text-on-surface-variant/50">|</span>
      <span class="inline-flex gap-1 items-center justify-center">
        <Icon class="text-[12px]" name="ph:skull" />
        12.4M lines of cringe identified
      </span>
    </footer>
  </article>
</template>
