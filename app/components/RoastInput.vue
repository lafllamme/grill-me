<script lang="ts" setup>
const props = withDefaults(defineProps<{
  disabled?: boolean
  canSubmit?: boolean
  isBusy?: boolean
}>(), {
  disabled: false,
  canSubmit: false,
  isBusy: false,
})

const emit = defineEmits<{
  submit: []
}>()

const roastStore = useRoastStore()

const githubUsername = computed({
  get: () => roastStore.githubUsername,
  set: value => roastStore.setUsername(value),
})

function onSubmit() {
  if (props.disabled)
    return

  emit('submit')
}
</script>

<template>
  <label class="group px-3 border border-[lab(100%_0_0_/_0.1)] rounded-full border-solid bg-[rgba(8,10,12,0.28)] flex flex-1 gap-3 min-h-[4.5rem] items-center relative overflow-hidden backdrop-blur-md md:px-4">
    <span class="rounded-full opacity-45 pointer-events-none transition-opacity duration-300 inset-0 absolute group-focus-within:opacity-95 group-hover:opacity-75">
      <svg class="h-full w-full" viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden="true">
        <rect
          x="0.75"
          y="0.75"
          width="998.5"
          height="98.5"
          rx="49.25"
          pathLength="100"
          fill="none"
          stroke="rgba(255,255,255,0.92)"
          stroke-width="1.1"
          stroke-linecap="round"
          stroke-dasharray="8 92"
          transform="rotate(180 500 50)"
        >
          <animate attributeName="stroke-dashoffset" from="0" to="-100" dur="4.4s" repeatCount="indefinite" />
        </rect>
      </svg>
    </span>

    <Icon class="text-[18px] text-primary/90" name="ph:link-simple-horizontal" />
    <input
      v-model="githubUsername"
      class="text-lg text-on-surface font-body font-medium py-3 outline-none bg-transparent min-w-0 w-full relative z-10 placeholder:text-on-surface-variant/40"
      placeholder="torvalds"
      type="text"
      :disabled="disabled"
      @keydown.enter.prevent="onSubmit"
    >
    <button
      class="group/btn text-base text-background tracking-[0.02em] font-headline font-semibold px-6 rounded-full shrink-0 h-[3.3rem] uppercase transition duration-300 relative z-10 overflow-hidden from-primary to-primary-container bg-gradient-to-br disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] hover:brightness-110"
      type="button"
      :disabled="disabled || !canSubmit"
      @click="onSubmit"
    >
      <span class="inline-flex gap-2 items-center relative z-10">
        {{ isBusy ? "Grilling..." : "Grill" }}
        <Icon class="text-lg" name="ph:fire" />
      </span>
      <span
        v-if="!isBusy"
        class="bg-white/16 opacity-0 pointer-events-none transition-opacity duration-300 inset-0 absolute group-hover/btn:opacity-100"
      />
    </button>
  </label>
</template>
