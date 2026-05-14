<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: string
  disabled?: boolean
  canSubmit?: boolean
  isBusy?: boolean
  placeholder?: string
  submitLabel?: string
  busyLabel?: string
  beamGradient?: string
  beamBorderWidth?: string
}>(), {
  modelValue: '',
  disabled: false,
  canSubmit: true,
  isBusy: false,
  placeholder: 'Enter your email',
  submitLabel: 'Join Waitlist',
  busyLabel: 'Loading...',
  beamGradient: '#ffffff00 72%, #ffffffcc 88%, #ffffff 100%',
  beamBorderWidth: '2px',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'submit': []
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const beamBorderRef = ref<HTMLElement | null>(null)
let beamAnimationFrameId: number | null = null
let beamAnimationStart = 0

const value = computed({
  get: () => props.modelValue,
  set: (nextValue: string) => emit('update:modelValue', nextValue),
})

function runBeamAnimation(timestamp: number) {
  if (!beamBorderRef.value)
    return

  if (beamAnimationStart === 0)
    beamAnimationStart = timestamp

  const turn = ((timestamp - beamAnimationStart) / 5000) % 1
  beamBorderRef.value.style.backgroundImage = `conic-gradient(from ${turn}turn, ${props.beamGradient})`

  beamAnimationFrameId = requestAnimationFrame(runBeamAnimation)
}

onMounted(() => {
  beamAnimationFrameId = requestAnimationFrame(runBeamAnimation)
})

onBeforeUnmount(() => {
  if (beamAnimationFrameId !== null)
    cancelAnimationFrame(beamAnimationFrameId)
})

function onSubmit() {
  if (props.disabled || !props.canSubmit)
    return

  emit('submit')
}

function onContainerClick() {
  inputRef.value?.focus()
}
</script>

<template>
  <form
    class="py-1.5 pl-6 pr-1.5 rounded-full bg-white/5 flex gap-2 w-full ring-3 ring-[lab(100%_0_0/0.1)] items-center relative backdrop-blur-md"
    @submit.prevent="onSubmit"
    @click="onContainerClick"
  >
    <input
      ref="inputRef"
      v-model="value"
      class="text-lg text-on-surface font-body font-medium bg-transparent w-full placeholder:color-zinc-400 focus:outline-0"
      type="text"
      :placeholder="placeholder"
      :disabled="disabled"
    >
    <button
      class="group text-base text-background font-headline font-semibold px-5 py-3 rounded-full bg-primary flex shrink-0 gap-1.5 transition-transform items-center hover:bg-primary-strong disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.985]"
      type="submit"
      :disabled="disabled || !canSubmit"
      @click.stop
    >
      <span>{{ isBusy ? busyLabel : submitLabel }}</span>
      <svg
        class="opacity-0 h-[1em] w-[1em] transition-all -mr-4 group-hover:opacity-100 group-hover:-mr-0 group-active:-rotate-45"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    </button>

    <div class="rounded-full pointer-events-none inset-0 absolute z-10">
      <div
        ref="beamBorderRef"
        class="mask-with-browser-support border-[1px] border-transparent rounded-full border-solid absolute bg-origin-border -inset-[1px]"
        :style="{
          backgroundImage: `conic-gradient(from 0turn, ${props.beamGradient})`,
          borderWidth: props.beamBorderWidth,
        }"
      />
    </div>
  </form>
</template>

<style scoped>
.mask-with-browser-support {
  -webkit-mask: linear-gradient(#000, #000), linear-gradient(#000, #000);
  mask: linear-gradient(#000, #000), linear-gradient(#000, #000);
  mask-clip: content-box, border-box;
  mask-composite: exclude;
  -webkit-mask: linear-gradient(#000, #000) content-box, linear-gradient(#000, #000);
  -webkit-mask-clip: content-box, border-box;
  -webkit-mask-composite: xor;
}
</style>
