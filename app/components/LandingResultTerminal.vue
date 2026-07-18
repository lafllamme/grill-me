<script lang="ts" setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoast } from '~/composables/useRoast'
import { extractApiErrorCode, extractApiErrorMessage } from '~/utils/api-error'
import { getRoastSetupErrorMessage } from '~/utils/roast-ui-errors'

const {
  result,
  pending,
  isStreaming,
  partialTitle,
  streamStatus,
  partialRoastLines,
  partialFeedback,
  streamError,
  sharePending,
  submitPending,
  lastShareUrl,
  lastSubmitMessage,
  createShareLink,
  submitToLeaderboard,
} = useRoast()
const { loggedIn, user } = useAuthSession()

const hasSessionOutput = computed(() => {
  return streamStatus.value.length > 0 || partialRoastLines.value.length > 0 || partialFeedback.value.length > 0
})

const displayTitle = ref('')
const TITLE_TYPE_SPEED_MS = 16
let titleTimer: ReturnType<typeof setInterval> | null = null

function stopTitleTyping(): void {
  if (!titleTimer)
    return

  clearInterval(titleTimer)
  titleTimer = null
}

function startTitleTyping(targetTitle: string): void {
  if (!import.meta.client) {
    displayTitle.value = targetTitle
    return
  }

  stopTitleTyping()

  if (!targetTitle) {
    displayTitle.value = ''
    return
  }

  if (!targetTitle.startsWith(displayTitle.value))
    displayTitle.value = ''

  titleTimer = setInterval(() => {
    if (displayTitle.value.length >= targetTitle.length) {
      stopTitleTyping()
      return
    }

    const nextLength = displayTitle.value.length + 1
    displayTitle.value = targetTitle.slice(0, nextLength)
  }, TITLE_TYPE_SPEED_MS)
}

watch(partialTitle, (nextTitle) => {
  const normalized = nextTitle.trim()

  if (!normalized) {
    stopTitleTyping()
    displayTitle.value = ''
    return
  }

  if (!isStreaming.value || !import.meta.client) {
    stopTitleTyping()
    displayTitle.value = normalized
    return
  }

  if (displayTitle.value === normalized)
    return

  startTitleTyping(normalized)
}, { immediate: true })

watch(isStreaming, (live) => {
  if (live)
    return

  if (partialTitle.value.trim()) {
    stopTitleTyping()
    displayTitle.value = partialTitle.value.trim()
  }
})

onBeforeUnmount(() => {
  stopTitleTyping()
})

const actionError = ref<string | null>(null)
const hasResult = computed(() => Boolean(result.value))
const isSelfRoast = computed(() => {
  if (!result.value || !user.value?.login)
    return false

  return result.value.username.toLowerCase() === user.value.login.toLowerCase()
})
const canSubmitOfficial = computed(() => Boolean(hasResult.value && loggedIn.value && isSelfRoast.value))

const statusLabel = computed(() => {
  if (!result.value)
    return ''

  if (!loggedIn.value)
    return 'Unofficial roast. No leaderboard damage done. Login with GitHub to submit your own score.'

  if (isSelfRoast.value)
    return `Official submit allowed (logged in as @${user.value?.login || result.value.username})`

  return `Only the verified owner can submit (@${result.value.username}).`
})

/**
 * Maps API action failures to explicit UI messages.
 */
function toActionErrorMessage(cause: unknown): string {
  const apiCode = extractApiErrorCode(cause)
  const setupHint = getRoastSetupErrorMessage(apiCode)
  if (setupHint)
    return setupHint
  return extractApiErrorMessage(cause, 'Action failed')
}

async function shareRoastResult(): Promise<void> {
  actionError.value = null
  try {
    const shareUrl = await createShareLink()
    if (import.meta.client && navigator?.clipboard?.writeText)
      await navigator.clipboard.writeText(shareUrl)
  }
  catch (cause: unknown) {
    actionError.value = toActionErrorMessage(cause)
  }
}

async function submitOfficialEntry(): Promise<void> {
  actionError.value = null
  try {
    await submitToLeaderboard()
  }
  catch (cause: unknown) {
    actionError.value = toActionErrorMessage(cause)
  }
}
</script>

<template>
  <section id="roast-terminal" data-testid="roast-terminal" class="mx-auto px-6 py-24 max-w-6xl">
    <div class="border border-divider rounded-xl bg-surface-container-lowest shadow-2xl overflow-hidden">
      <div class="px-4 py-3 bg-surface-container flex items-center justify-between">
        <div class="flex gap-2">
          <span class="border border-red-500/40 rounded-full bg-red-500/20 h-3 w-3" />
          <span class="border border-amber-500/40 rounded-full bg-amber-500/20 h-3 w-3" />
          <span class="border border-green-500/40 rounded-full bg-green-500/20 h-3 w-3" />
        </div>
        <span class="text-xs text-on-surface-variant tracking-[0.14em] font-meta uppercase">
          roast-engine-v3.1.0 --stream
        </span>
      </div>

      <div class="text-sm font-mono p-10 min-h-[420px] space-y-6 md:p-12">
        <div v-if="hasSessionOutput || pending || result" class="space-y-6">
          <div data-testid="roast-session-state" class="flex gap-4">
            <span class="text-on-surface-variant/90">{{ isStreaming ? "[live]" : pending ? "[prep]" : "[done]" }}</span>
            <span :class="isStreaming ? 'text-primary' : pending ? 'text-amber-400' : 'text-green-400'" class="font-bold">
              {{ isStreaming ? "STREAM:" : pending ? "PREP:" : "SUCCESS:" }}
            </span>
            <span class="text-on-surface">
              <template v-if="isStreaming">Receiving live roast output...</template>
              <template v-else-if="pending">Preparing roast stream...</template>
              <template v-else-if="result">
                Roast generated for @{{ result.username }} ({{ result.meta.commitCount }} commits / {{ result.meta.prCount }} PRs)
              </template>
              <template v-else>Session completed.</template>
            </span>
          </div>

          <div class="text-on-surface-variant/90 min-h-[144px] space-y-2">
            <template v-if="streamStatus.length > 0">
              <p
                v-for="(line, index) in streamStatus"
                :key="`status-${index}-${line}`"
                class="leading-relaxed"
              >
                {{ line }}
              </p>
            </template>
            <p v-else class="leading-relaxed opacity-70">
              Awaiting pipeline status updates...
            </p>
          </div>

          <div class="pt-2 min-h-[104px] space-y-3 md:min-h-[116px]">
            <p class="text-[10px] text-primary tracking-[0.14em] font-display uppercase">
              Roast Title
            </p>
            <div class="pl-5 border-l-4 border-primary/70">
              <p data-testid="roast-title" class="text-2xl text-on-surface leading-tight tracking-tight font-headline font-semibold min-h-[3.5rem] md:text-[2rem] md:min-h-[4rem]">
                <template v-if="displayTitle">
                  {{ displayTitle }}
                </template>
                <template v-else>
                  <span class="text-on-surface-variant/55">
                    Awaiting roast title...
                  </span>
                </template>
                <span v-if="isStreaming && displayTitle" class="text-primary ml-1 animate-pulse">_</span>
              </p>
            </div>
          </div>

          <div class="min-h-[220px]">
            <blockquote v-if="partialRoastLines.length > 0" data-testid="roast-lines" class="text-lg text-on-surface leading-loose font-body pl-5 border-l-4 border-primary italic space-y-3">
              <p
                v-for="(line, index) in partialRoastLines"
                :key="`line-${index}-${line}`"
              >
                {{ line }}
              </p>
            </blockquote>
            <p v-else class="text-on-surface-variant/70 leading-relaxed pl-5">
              Waiting for roast output...
            </p>
          </div>

          <div class="pt-4 min-h-[184px]">
            <p class="text-xs text-primary tracking-[0.14em] font-display mb-3 uppercase">
              Feedback
            </p>
            <ul v-if="partialFeedback.length > 0" data-testid="roast-feedback" class="space-y-3">
              <li
                v-for="(item, index) in partialFeedback"
                :key="`live-feedback-${index}-${item}`"
                class="text-on-surface-variant leading-relaxed flex gap-3"
              >
                <span class="text-primary">-</span>
                <span>{{ item }}</span>
              </li>
            </ul>
            <p v-else class="text-on-surface-variant/70 leading-relaxed">
              Feedback bullets will appear here.
            </p>
          </div>

          <p v-if="streamError" data-testid="roast-stream-error" class="text-sm text-primary">
            {{ streamError }}
          </p>

          <div v-if="isStreaming" class="text-primary pt-4 animate-pulse">
            _
          </div>
        </div>

        <div v-else class="space-y-4">
          <div class="flex gap-4">
            <span class="text-on-surface-variant/90">[08:42:11]</span>
            <span class="text-primary font-bold">INIT:</span>
            <span class="text-on-surface">Waiting for GitHub username input...</span>
          </div>
          <div class="flex gap-4">
            <span class="text-on-surface-variant/90">[08:42:13]</span>
            <span class="text-amber-400 font-bold">SCAN:</span>
            <span class="text-on-surface">No target selected yet.</span>
          </div>
          <div class="text-primary pt-4 animate-pulse">
            _
          </div>
        </div>
      </div>
    </div>

    <div v-if="hasResult" class="mt-8 space-y-6">
      <div class="gap-4 grid grid-cols-1 md:grid-cols-2">
        <button
          class="text-lg text-black font-extrabold font-headline px-8 py-6 border border-primary rounded-none bg-primary uppercase shadow-[0_0_26px_rgba(255,144,109,0.25)] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99] hover:brightness-110"
          :disabled="sharePending"
          @click="shareRoastResult"
        >
          {{ sharePending ? "Creating Share..." : "Share Roast" }}
        </button>
        <button
          class="text-lg text-white font-extrabold font-headline px-8 py-6 border border-divider rounded-none bg-surface-container-low uppercase transition-all duration-200 hover:bg-surface-container disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99]"
          :disabled="!canSubmitOfficial || submitPending"
          @click="submitOfficialEntry"
        >
          {{ submitPending ? "Submitting..." : "Submit to Wall of Shame" }}
        </button>
      </div>

      <div class="text-xs text-on-surface-variant tracking-[0.14em] font-meta px-4 py-3 border border-divider bg-surface-container-low uppercase md:text-center">
        {{ statusLabel }}
      </div>

      <p v-if="lastShareUrl" class="text-sm text-primary break-all">
        Share link copied. This roast expires in 24 hours: {{ lastShareUrl }}
      </p>
      <p v-if="lastSubmitMessage" class="text-sm text-primary">
        {{ lastSubmitMessage }}
      </p>
      <p v-if="actionError" class="text-sm text-primary">
        {{ actionError }}
      </p>

      <div class="gap-4 grid grid-cols-1 md:grid-cols-3">
        <article class="p-5 border border-divider bg-surface-container-low">
          <p class="text-[10px] text-on-surface-variant tracking-[0.16em] font-meta uppercase">
            Stink Score
          </p>
          <p class="text-5xl text-primary leading-none font-bold font-headline mt-3">
            {{ result?.metrics.stinkScore.toFixed(1) }}%
          </p>
        </article>
        <article class="p-5 border border-divider bg-surface-container-low">
          <p class="text-[10px] text-on-surface-variant tracking-[0.16em] font-meta uppercase">
            Ego Damage
          </p>
          <p class="text-5xl text-primary leading-none font-bold font-headline mt-3">
            {{ result?.metrics.egoDamage.toFixed(1) }}%
          </p>
        </article>
        <article class="p-5 border border-divider bg-surface-container-low">
          <p class="text-[10px] text-on-surface-variant tracking-[0.16em] font-meta uppercase">
            Verdict
          </p>
          <p class="text-5xl text-primary leading-none font-bold font-headline mt-3">
            {{ result?.metrics.grade }}
          </p>
        </article>
      </div>
    </div>
  </section>
</template>
