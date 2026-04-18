<script lang="ts" setup>
import { computed } from 'vue'
import { useRoast } from '~/composables/useRoast'

const {
  result,
  pending,
  isStreaming,
  streamStatus,
  partialRoast,
  partialFeedback,
  streamError,
} = useRoast()

const hasSessionOutput = computed(() => {
  return streamStatus.value.length > 0 || partialRoast.value.trim().length > 0 || partialFeedback.value.length > 0
})

const partialRoastLines = computed(() => {
  return partialRoast.value
    .split(/\n+/)
    .map(line => line.trim())
    .filter(Boolean)
})

const roastDisplayLines = computed(() => {
  if (partialRoastLines.value.length === 0)
    return []

  const lines = [...partialRoastLines.value]
    .filter(line => !/^feedback:?$/i.test(line))

  if (partialFeedback.value.length === 0)
    return lines

  const trailingBulletLines = []
  for (let index = lines.length - 1; index >= 0; index--) {
    const current = lines[index] ?? ''
    if (!/^[-*•]\s+/.test(current))
      break
    trailingBulletLines.unshift(current.replace(/^[-*•]\s+/, '').trim())
  }

  if (trailingBulletLines.length === 0)
    return lines

  const feedbackComparable = partialFeedback.value
    .map(item => item
      .toLowerCase()
      .replace(/[`"'“”‘’]/g, '')
      .replace(/\s+/g, ' ')
      .trim())
    .filter(Boolean)
  const trailingComparable = trailingBulletLines
    .map(item => item
      .toLowerCase()
      .replace(/[`"'“”‘’]/g, '')
      .replace(/\s+/g, ' ')
      .trim())
    .filter(Boolean)

  const hasExactDuplicate = trailingComparable.length > 0
    && trailingComparable.length <= feedbackComparable.length
    && trailingComparable.every((item, index) => item === feedbackComparable[index])

  if (!hasExactDuplicate)
    return lines

  return lines.slice(0, lines.length - trailingBulletLines.length)
})
</script>

<template>
  <section class="mx-auto px-6 py-24 max-w-6xl">
    <div class="border border-divider rounded-xl bg-surface-container-lowest shadow-2xl overflow-hidden">
      <div class="px-4 py-3 bg-surface-container flex items-center justify-between">
        <div class="flex gap-2">
          <span class="border border-red-500/40 rounded-full bg-red-500/20 h-3 w-3" />
          <span class="border border-amber-500/40 rounded-full bg-amber-500/20 h-3 w-3" />
          <span class="border border-green-500/40 rounded-full bg-green-500/20 h-3 w-3" />
        </div>
        <span class="text-xs text-on-surface-variant tracking-[0.14em] font-mono uppercase">
          roast-engine-v2.1.0 --stream
        </span>
      </div>

      <div class="text-sm font-mono p-10 min-h-[420px] space-y-6 md:p-12">
        <div v-if="hasSessionOutput || pending || result" class="space-y-6">
          <div class="flex gap-4">
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

          <div class="min-h-[220px]">
            <blockquote v-if="roastDisplayLines.length > 0" class="text-lg text-on-surface leading-loose font-body pl-5 border-l-4 border-primary italic space-y-3">
              <p
                v-for="(line, index) in roastDisplayLines"
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
            <ul v-if="partialFeedback.length > 0" class="space-y-3">
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

          <p v-if="streamError" class="text-sm text-primary">
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
  </section>
</template>
