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
  <InputBeam
    v-model="githubUsername"
    placeholder="torvalds"
    submit-label="Grill"
    busy-label="Grilling..."
    :disabled="disabled"
    :can-submit="canSubmit"
    :is-busy="isBusy"
    @submit="onSubmit"
  />
</template>
