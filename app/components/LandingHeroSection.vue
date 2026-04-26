<script lang="ts" setup>
import { useWindowScroll } from '@vueuse/core'
import { useRoast } from '#imports'

const roastStore = useRoastStore()
const { loggedIn, user } = useAuthSession()

const {
  pending,
  error,
  isStreaming,
  streamError,
  result,
  sharePending,
  submitPending,
  lastShareUrl,
  lastSubmitMessage,
  roastUsername,
  cancelRoast,
  createShareLink,
  submitToLeaderboard,
} = useRoast()
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
const actionError = ref<string | null>(null)
const isSelfRoast = computed(() => {
  if (!result.value || !user.value?.login)
    return false

  return result.value.username.toLowerCase() === user.value.login.toLowerCase()
})

const canSubmitOfficial = computed(() => Boolean(result.value && loggedIn.value && isSelfRoast.value))

const leaderboardHint = computed(() => {
  if (!result.value)
    return ''

  if (!loggedIn.value)
    return 'Unofficial roast. No leaderboard damage done. Login with GitHub to submit your own score.'

  if (isSelfRoast.value)
    return 'This is your verified GitHub account. You can submit this score to the Wall of Shame.'

  return 'You can roast this profile, but only the verified owner can submit it to the leaderboard.'
})

async function shareRoastResult() {
  actionError.value = null
  try {
    const shareUrl = await createShareLink()
    if (import.meta.client && navigator?.clipboard?.writeText)
      await navigator.clipboard.writeText(shareUrl)
  }
  catch (cause: any) {
    actionError.value = cause?.data?.message || cause?.message || 'Failed to create share link'
  }
}

async function submitOfficialEntry() {
  actionError.value = null
  try {
    await submitToLeaderboard()
  }
  catch (cause: any) {
    actionError.value = cause?.data?.message || cause?.message || 'Failed to submit official score'
  }
}
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

      <div v-if="result" class="mt-4 p-4 text-left border border-white/10 rounded-2xl bg-black/30 md:p-5">
        <p class="text-xs text-white/70 tracking-[0.1em] mb-3 uppercase">
          {{ leaderboardHint }}
        </p>

        <div class="flex flex-wrap gap-3 items-center">
          <button
            class="text-sm text-black font-semibold px-4 py-2 rounded-xl bg-primary disabled:opacity-60 disabled:cursor-not-allowed"
            :disabled="sharePending"
            @click="shareRoastResult"
          >
            {{ sharePending ? "Creating share..." : "Share Roast" }}
          </button>

          <button
            class="text-sm text-white font-semibold px-4 py-2 border border-primary/40 rounded-xl bg-black/40 disabled:opacity-55 disabled:cursor-not-allowed"
            :disabled="!canSubmitOfficial || submitPending"
            @click="submitOfficialEntry"
          >
            {{ submitPending ? "Submitting..." : "Submit to Wall of Shame" }}
          </button>

          <p v-if="lastShareUrl" class="text-xs text-primary break-all">
            Share link copied. This roast expires in 24 hours: {{ lastShareUrl }}
          </p>
          <p v-if="lastSubmitMessage" class="text-xs text-primary">
            {{ lastSubmitMessage }}
          </p>
          <p v-if="actionError" class="text-xs text-primary">
            {{ actionError }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
