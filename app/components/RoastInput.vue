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
  <label class="px-3 rounded-full bg-transparent flex flex-1 gap-3 min-h-[4.25rem] items-center md:px-4">
    <Icon class="text-[18px] text-primary" name="ph:link-simple-horizontal" />
    <input
      v-model="githubUsername"
      class="text-lg text-on-surface font-body py-3 outline-none bg-transparent w-full placeholder:text-on-surface-variant/35"
      placeholder="torvalds"
      type="text"
      :disabled="disabled"
      @keydown.enter.prevent="onSubmit"
    >
  </label>
</template>
