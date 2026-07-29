<script setup lang="ts">
import {
  useDebounceFn,
  usePreferredReducedMotion,
  useResizeObserver,
} from '@vueuse/core'
import { motion } from 'motion-v'
import {
  computed,
  nextTick,
  onMounted,
  ref,
  watch,
} from 'vue'

type HeadingTag = 'h1' | 'h2' | 'h3' | 'p'

const props = withDefaults(defineProps<{
  lines?: readonly string[]
  text?: string
  as?: HeadingTag
  delay?: number
  stagger?: number
  duration?: number
  amount?: number
}>(), {
  as: 'h2',
  delay: 0,
  stagger: 0.11,
  duration: 0.7,
  amount: 0,
})

const headingElement = ref<HTMLElement | null>(null)
const measurementElement = ref<HTMLElement | null>(null)
const preferredReducedMotion = usePreferredReducedMotion()
const fullText = computed(() =>
  props.text?.trim() || props.lines?.join(' ').trim() || '',
)
const hasFixedLines = computed(() => Boolean(props.lines?.length))
const renderedLines = ref<string[]>(
  props.lines?.length ? [...props.lines] : [fullText.value],
)
const isMeasurementReady = ref(hasFixedLines.value)
const initialVariant = computed(() =>
  preferredReducedMotion.value === 'reduce' ? 'visible' : 'hidden',
)

const containerVariants = computed(() => ({
  hidden: {},
  visible: {
    transition: preferredReducedMotion.value === 'reduce'
      ? { duration: 0 }
      : {
          delayChildren: props.delay,
          staggerChildren: props.stagger,
        },
  },
}))

const lineVariants = computed(() => ({
  hidden: {
    y: '125%',
  },
  visible: {
    y: '0%',
    transition: preferredReducedMotion.value === 'reduce'
      ? { duration: 0 }
      : {
          duration: props.duration,
          ease: [0.44, 0, 0.34, 0.98] as const,
        },
  },
}))

async function measureVisualLines() {
  if (hasFixedLines.value) {
    isMeasurementReady.value = true
    return
  }

  await nextTick()

  const textNode = measurementElement.value?.firstChild
  if (!textNode || textNode.nodeType !== Node.TEXT_NODE)
    return

  const range = document.createRange()
  const visualLines: string[][] = []
  let previousTop: number | null = null

  for (const match of fullText.value.matchAll(/\S+/g)) {
    const word = match[0]
    const startIndex = match.index

    range.setStart(textNode, startIndex)
    range.setEnd(textNode, startIndex + word.length)

    const currentTop = Math.round(range.getBoundingClientRect().top)

    if (previousTop === null || Math.abs(currentTop - previousTop) > 1) {
      visualLines.push([])
      previousTop = currentTop
    }

    visualLines.at(-1)?.push(word)
  }

  const nextLines = visualLines
    .map(line => line.filter(Boolean).join(' '))
    .filter(Boolean)

  if (nextLines.length) {
    renderedLines.value = nextLines
    isMeasurementReady.value = true
  }
}

const scheduleLineMeasurement = useDebounceFn(measureVisualLines, 80)

useResizeObserver(headingElement, () => {
  if (!hasFixedLines.value)
    void scheduleLineMeasurement()
})

watch(fullText, () => {
  renderedLines.value = props.lines?.length ? [...props.lines] : [fullText.value]
  isMeasurementReady.value = hasFixedLines.value

  if (!hasFixedLines.value)
    void scheduleLineMeasurement()
})

onMounted(async () => {
  if (hasFixedLines.value)
    return

  await document.fonts?.ready
  await measureVisualLines()
})
</script>

<template>
  <component
    :is="as"
    ref="headingElement"
    class="min-w-0 block relative"
    :aria-label="fullText"
  >
    <span
      ref="measurementElement"
      class="block invisible whitespace-pre-wrap"
      aria-hidden="true"
    >{{ fullText }}</span>

    <motion.span
      v-if="isMeasurementReady"
      class="block inset-0 absolute"
      aria-hidden="true"
      :variants="containerVariants"
      :initial="initialVariant"
      while-in-view="visible"
      :in-view-options="{ once: true, amount }"
    >
      <span
        v-for="(line, index) in renderedLines"
        :key="index"
        class="py-[0.12em] w-full block overflow-hidden -my-[0.12em]"
      >
        <motion.span class="align-top inline-block whitespace-pre-wrap" :variants="lineVariants">
          {{ line }}
        </motion.span>
      </span>
    </motion.span>
  </component>
</template>
