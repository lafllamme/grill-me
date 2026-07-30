<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '#components'
import RebrandParallaxMedia from '~/components/rebrand/RebrandParallaxMedia.vue'
import RebrandScrollHeadline from '~/components/rebrand/RebrandScrollHeadline.vue'

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

const evidenceLines = [
  { filename: 'server/roast/evidence.ts', delta: '+84 / -21' },
  { filename: 'app/composables/useRoast.ts', delta: '+37 / -12' },
  { filename: 'shared/roast-contract.ts', delta: '+18 / -06' },
] as const
</script>

<template>
  <section class="mx-auto px-4 pb-24 max-w-[96rem] lg:px-10 sm:px-6">
    <div class="border-[1px] border-white/14 rounded-4xl border-solid bg-basalt-950 min-h-[92svh] relative overflow-hidden">
      <div class="bg-signal-red-950/72 inset-0 absolute" />
      <div class="bg-signal-red-700/34 h-[44rem] w-[44rem] right-[-12rem] top-[-18rem] absolute blur-[105px]" />
      <div class="bg-black/58 h-[22rem] inset-x-0 bottom-0 absolute blur-[42px]" />
      <div class="px-6 py-10 flex flex-col min-h-[92svh] justify-between relative z-10 lg:px-16 lg:py-14 sm:px-10">
        <div class="flex items-center justify-between">
          <p class="text-[10px] text-signal-red-400 tracking-[0.15em] font-meta uppercase">
            07 / Next public target
          </p>
          <p class="text-[10px] text-explore-muted tracking-[0.13em] font-meta uppercase">
            © Grillme
          </p>
        </div>

        <div class="py-20 gap-12 grid lg:gap-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div class="min-w-0">
            <RebrandScrollHeadline
              class="fuel-editorial-headline text-explore-copy"
              text="Put another commit trail on the grill."
            />
            <form class="mt-14 border-b-[1px] border-white/45 border-solid flex gap-4 items-center" @submit.prevent="submit">
              <span class="text-3xl text-signal-red-400 font-mono">@</span>
              <input
                v-model="localUsername"
                class="text-2xl text-explore-copy font-body py-5 outline-none bg-transparent flex-1 min-w-0 sm:text-4xl placeholder:text-explore-muted/45"
                type="text"
                placeholder="GitHub username"
                autocomplete="off"
                autocapitalize="none"
                spellcheck="false"
              >
              <button type="submit" class="text-explore-copy border-[1px] border-white/22 rounded-full border-solid bg-white/8 shrink-0 grid h-12 w-12 transition-colors place-items-center hover:bg-signal-red-700 disabled:opacity-40" :disabled="!localUsername.trim() || isPending" aria-label="Start another roast">
                <Icon class="text-xl" :class="isPending ? 'animate-spin' : ''" :name="isPending ? 'ph:circle-notch' : 'ph:arrow-up-right'" />
              </button>
            </form>
          </div>

          <RebrandParallaxMedia class="border-[1px] border-white/14 border-solid bg-black/52 min-h-[30rem] min-w-0">
            <template #media>
              <div class="bg-black/52 inset-0 absolute" />
              <div class="bg-signal-red-950/32 h-[26rem] w-[26rem] right-[-8rem] top-[-9rem] absolute blur-[72px]" />
            </template>
            <div class="p-6 border-b-[1px] border-white/12 border-solid flex items-center justify-between sm:p-8">
              <div>
                <p class="text-[10px] text-signal-red-400 tracking-[0.14em] font-meta uppercase">
                  Evidence preview
                </p>
                <p class="text-lg text-explore-copy font-body mt-2">
                  4d91be2 · cleanup the roast stream
                </p>
              </div>
              <span class="text-xs text-signal-red-400 font-mono">+139 / -39</span>
            </div>
            <div class="p-6 space-y-3 sm:p-8">
              <div v-for="line in evidenceLines" :key="line.filename" class="px-4 py-4 border-[1px] border-white/12 border-solid bg-white/[0.025] flex gap-6 items-center justify-between">
                <span class="text-xs text-explore-copy font-mono truncate">{{ line.filename }}</span>
                <span class="text-[10px] text-signal-red-400 font-mono shrink-0">{{ line.delta }}</span>
              </div>
            </div>
            <div class="px-6 pb-7 bottom-0 absolute sm:px-8">
              <p class="text-[10px] text-explore-muted tracking-[0.13em] font-meta uppercase">
                Public evidence / bounded context / streamed verdict
              </p>
            </div>
          </RebrandParallaxMedia>
        </div>

        <p class="text-[10px] text-explore-muted tracking-[0.14em] font-meta uppercase">
          Public evidence only / no private repositories
        </p>
      </div>
    </div>
  </section>
</template>
