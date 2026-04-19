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
  <label class="px-4 bg-surface-container-lowest flex flex-1 gap-3 items-center">
    <Icon class="text-[18px] text-on-surface-variant" name="ph:user" />
    <input
      v-model="githubUsername"
      class="text-sm text-on-surface font-mono py-4 outline-none bg-transparent w-full placeholder:text-on-surface-variant/60"
      placeholder="torvalds"
      type="text"
      :disabled="disabled"
      @keydown.enter.prevent="onSubmit"
    >
  </label>
</template>
