<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '#components'

const props = defineProps<{
  username: string
  isPending: boolean
}>()

const emit = defineEmits<{
  'update:username': [value: string]
  'submit': []
}>()

const localUsername = computed({
  get: () => props.username,
  set: value => emit('update:username', value),
})

function submit() {
  if (!localUsername.value.trim() || props.isPending)
    return

  emit('submit')
}
</script>

<template>
  <section class="mx-auto px-4 pb-20 max-w-[96rem] lg:px-10 sm:px-6">
    <div class="border-[1px] border-white/14 border-solid bg-basalt-950 min-h-[92svh] relative overflow-hidden">
      <div class="rounded-full bg-signal-red-700/32 h-[40rem] w-[40rem] right-[-10rem] top-[-15rem] absolute blur-[95px]" />
      <div class="opacity-35 inset-0 absolute">
        <div class="h-full w-full [background-image:linear-gradient(rgba(240,68,77,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(240,68,77,0.12)_1px,transparent_1px)] [background-size:5rem_5rem]" />
      </div>
      <div class="px-6 py-10 flex flex-col inset-0 justify-between absolute lg:px-16 lg:py-14 sm:px-10">
        <div class="flex items-center justify-between">
          <p class="text-[10px] text-signal-red-400 tracking-[0.15em] font-meta uppercase">
            Next public target
          </p>
          <Icon class="text-3xl text-signal-red-400" name="ph:crosshair" />
        </div>

        <div class="mx-auto max-w-[58rem] w-full">
          <h2 class="text-[clamp(3.2rem,7vw,8rem)] text-explore-copy leading-[0.84] tracking-[-0.07em] font-display text-center">
            Put another commit trail on the grill.
          </h2>
          <form class="mt-14 border-b-[1px] border-white/45 border-solid flex gap-4 items-center" @submit.prevent="submit">
            <span class="text-3xl text-signal-red-400 font-mono">@</span>
            <input
              v-model="localUsername"
              class="text-2xl text-explore-copy font-display py-5 outline-none bg-transparent flex-1 min-w-0 sm:text-4xl placeholder:text-explore-muted/45"
              type="text"
              placeholder="GitHub username"
              autocomplete="off"
              autocapitalize="none"
              spellcheck="false"
            >
            <button type="submit" class="text-explore-copy border-[1px] border-white/22 rounded-full border-solid bg-white/8 shrink-0 grid h-12 w-12 place-items-center hover:bg-signal-red-700 disabled:opacity-40" :disabled="!localUsername.trim() || isPending" aria-label="Start another roast">
              <Icon class="text-xl" :class="isPending ? 'animate-spin' : ''" :name="isPending ? 'ph:circle-notch' : 'ph:arrow-up-right'" />
            </button>
          </form>
        </div>

        <p class="text-[10px] text-explore-muted tracking-[0.14em] font-meta uppercase">
          Public evidence only / no private repositories
        </p>
      </div>
    </div>
  </section>
</template>
