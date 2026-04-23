<script lang="ts" setup>
import { useWindowScroll } from '@vueuse/core'
import { useRoast } from '#imports'

const roastStore = useRoastStore()

const { pending, error, isStreaming, streamError, roastUsername, cancelRoast } = useRoast()
const { y } = useWindowScroll({
  behavior: 'smooth',
})

function scrollToTerminal() {
  if (!import.meta.client)
    return

  const terminalElement = document.getElementById('roast-terminal')
  if (!terminalElement)
    return

  const topOffset = 24
  const targetY = terminalElement.getBoundingClientRect().top + window.scrollY - topOffset
  y.value = Math.max(0, targetY)
}

async function submitRoast() {
  if (pending.value && isStreaming.value) {
    cancelRoast()
    return
  }

  if (!roastStore.canSubmit)
    return

  scrollToTerminal()
  await roastUsername(roastStore.trimmedUsername, { roastIntensity: roastStore.roastIntensity })
}

const errorMessage = computed(() => error.value || streamError.value)
</script>

<template>
  <section class="px-6 pt-24 text-center flex flex-col min-h-[870px] items-center justify-center">
    <h1 class="text-6xl text-on-surface leading-none tracking-tight font-extrabold font-headline mb-8 uppercase md:text-[9rem]">
      YOUR CODE IS
      <span class="text-transparent block from-primary to-primary-container bg-gradient-to-r bg-clip-text">
        GARBAGE.
      </span>
    </h1>

    <p class="text-xl text-on-surface-variant font-body font-medium mb-12 max-w-2xl">
      Our AI doesn't just review your code; it incinerates your technical debt and feeds your ego to the wolves. Enter a GitHub username to begin the roast.
    </p>

    <div class="max-w-5xl w-full">
      <RoastCard
        :pending="pending"
        :is-streaming="isStreaming"
        :can-submit="roastStore.canSubmit"
        :roast-intensity="roastStore.roastIntensity"
        :error-message="errorMessage"
        @update:roast-intensity="roastStore.setRoastIntensity"
        @submit="submitRoast"
      />
    </div>
  </section>
</template>
