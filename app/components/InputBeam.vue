<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: string
  disabled?: boolean
  canSubmit?: boolean
  isBusy?: boolean
  placeholder?: string
}>(), {
  modelValue: '',
  disabled: false,
  canSubmit: true,
  isBusy: false,
  placeholder: 'Enter your email',
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
  beamBorderRef.value.style.backgroundImage = `conic-gradient(from ${turn}turn, #a78bfa00 75%, #a78bfa 100%)`

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
    class="py-1.5 pl-6 pr-1.5 border border-white/20 rounded-full flex gap-2 max-w-md w-full items-center relative from-white/20 to-white/5 bg-gradient-to-br"
    @submit.prevent="onSubmit"
    @click="onContainerClick"
  >
    <input
      ref="inputRef"
      v-model="value"
      class="text-sm text-white bg-transparent w-full focus:outline-0 placeholder-white/80"
      type="text"
      :placeholder="placeholder"
      :disabled="disabled"
    >
    <button
      class="group text-sm text-gray-900 font-medium px-4 py-3 rounded-full flex shrink-0 gap-1.5 transition-transform items-center from-gray-50 to-gray-400 bg-gradient-to-br disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.985]"
      type="submit"
      :disabled="disabled || !canSubmit"
      @click.stop
    >
      <span>{{ isBusy ? 'Loading...' : 'Join Waitlist' }}</span>
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
        style="background-image: conic-gradient(from 0turn, #a78bfa00 75%, #a78bfa 100%)"
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
