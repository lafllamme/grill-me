import type { RoastStreamEvidenceEvent } from '~~/shared/roast/contracts'
import { useIntervalFn } from '@vueuse/core'
import { ref } from 'vue'

type PreviewEvent
  = | { type: 'status', phase: string, message: string }
    | { type: 'title', text: string }
    | { type: 'roast-line', text: string }
    | { type: 'feedback', text: string }

const PREVIEW_EVENTS: PreviewEvent[] = [
  { type: 'status', phase: 'fetching_github', message: 'Opening the public commit trail' },
  { type: 'status', phase: 'selecting_evidence', message: 'Ranking commits and separating evidence from dependency noise' },
  { type: 'status', phase: 'building_prompt', message: 'Packing changed files and safe patch excerpts' },
  { type: 'status', phase: 'calling_ai', message: 'Turning verified evidence into useful emotional damage' },
  { type: 'status', phase: 'parsing_output', message: 'Reading the structured verdict as it arrives' },
  { type: 'title', text: 'Abstraction Witness Protection' },
  { type: 'roast-line', text: 'You did not remove complexity. You gave it aliases and hoped nobody would check the imports.' },
  { type: 'roast-line', text: 'That helper wraps a one-line API so thoroughly it now needs onboarding documentation.' },
  { type: 'roast-line', text: 'Your component tree has the confidence of an architecture diagram and the boundaries of spilled soup.' },
  { type: 'roast-line', text: 'The naming is immaculate, which is useful because the behavior certainly is not.' },
  { type: 'feedback', text: 'Delete pass-through wrappers that do not own state, policy, or transformation.' },
  { type: 'feedback', text: 'Move repeated request-state handling into one typed composable with an explicit contract.' },
  { type: 'feedback', text: 'Add one behavior-level test before the next abstraction gets a factory.' },
]

const PREVIEW_EVIDENCE: RoastStreamEvidenceEvent = {
  type: 'evidence',
  commits: [
    {
      repo: 'lafllamme/grill-me',
      sha: '1c83407',
      message: 'feat: add evidence-aware roast reasoning preview',
      additions: 522,
      deletions: 101,
      changedFiles: 11,
      files: [
        { filename: 'app/components/rebrand/RebrandLiveRoastStage.vue', status: 'modified', additions: 17, deletions: 83 },
        { filename: 'app/components/rebrand/RebrandReasoning.vue', status: 'added', additions: 85, deletions: 0 },
        { filename: 'app/composables/useRoastReasoning.ts', status: 'added', additions: 98, deletions: 0 },
      ],
    },
  ],
  prs: [],
}

export function useRoastPreview() {
  const isPending = ref(false)
  const isStreaming = ref(false)
  const title = ref('')
  const roastLines = ref<string[]>([])
  const feedback = ref<string[]>([])
  const statuses = ref<string[]>([])
  const evidence = ref<RoastStreamEvidenceEvent | null>(null)
  const eventIndex = ref(0)

  const applyEvent = (event: PreviewEvent) => {
    if (event.type === 'status') {
      statuses.value.push(`[${event.phase}] ${event.message}`)
      return
    }

    if (event.type === 'title') {
      title.value = event.text
      return
    }

    if (event.type === 'roast-line') {
      roastLines.value.push(event.text)
      return
    }

    feedback.value.push(event.text)
  }

  const { pause, resume } = useIntervalFn(() => {
    const event = PREVIEW_EVENTS[eventIndex.value]

    if (!event) {
      isPending.value = false
      isStreaming.value = false
      pause()
      return
    }

    applyEvent(event)
    eventIndex.value += 1
  }, 500, { immediate: false })

  const stop = () => {
    pause()
    isPending.value = false
    isStreaming.value = false
  }

  const play = () => {
    stop()
    title.value = ''
    roastLines.value = []
    feedback.value = []
    statuses.value = []
    evidence.value = PREVIEW_EVIDENCE
    eventIndex.value = 0
    isPending.value = true
    isStreaming.value = true

    const firstEvent = PREVIEW_EVENTS[eventIndex.value]
    if (firstEvent) {
      applyEvent(firstEvent)
      eventIndex.value += 1
    }

    resume()
  }

  return {
    isPending,
    isStreaming,
    title,
    roastLines,
    feedback,
    statuses,
    evidence,
    play,
    stop,
  }
}
