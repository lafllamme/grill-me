<script lang="ts" setup>
const props = withDefaults(defineProps<{
  disabled?: boolean
}>(), {
  disabled: false,
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
  <label class="group px-3 border border-[lab(100%_0_0_/_0.1)] rounded-full border-solid bg-[rgba(8,10,12,0.28)] flex flex-1 gap-3 min-h-[4.5rem] items-center relative overflow-hidden md:px-4">
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
      class="text-lg text-on-surface font-body font-medium py-3 outline-none bg-transparent w-full relative z-10 placeholder:text-on-surface-variant/40"
      placeholder="torvalds"
      type="text"
      :disabled="disabled"
      @keydown.enter.prevent="onSubmit"
    >
  </label>
</template>
