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

const partialRoastLines = computed(() => {
  return partialRoast.value
    .split(/\n+/)
    .map(line => line.trim())
    .filter(Boolean)
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

      <div class="text-sm font-mono p-8 min-h-[400px] space-y-4">
        <div v-if="pending && isStreaming" class="space-y-4">
          <div class="flex gap-4">
            <span class="text-on-surface-variant/90">[live]</span>
            <span class="text-primary font-bold">STREAM:</span>
            <span class="text-on-surface">Receiving live roast output...</span>
          </div>

          <div v-if="partialRoastLines.length > 0" class="space-y-2">
            <p
              v-for="(line, index) in partialRoastLines"
              :key="`line-${index}-${line}`"
              class="text-on-surface leading-relaxed"
            >
              {{ line }}
            </p>
          </div>

          <div v-if="streamStatus.length > 0" class="text-on-surface-variant/90 space-y-1">
            <p
              v-for="(line, index) in streamStatus"
              :key="`status-${index}-${line}`"
              class="leading-relaxed"
            >
              {{ line }}
            </p>
          </div>

          <div v-if="partialFeedback.length > 0" class="pt-2">
            <p class="text-xs text-primary tracking-[0.14em] font-display mb-2 uppercase">
              Feedback (live)
            </p>
            <ul class="space-y-2">
              <li
                v-for="(item, index) in partialFeedback"
                :key="`live-feedback-${index}-${item}`"
                class="text-on-surface-variant flex gap-2"
              >
                <span class="text-primary">-</span>
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>

          <p v-if="streamError" class="text-sm text-primary">
            {{ streamError }}
          </p>

          <div class="text-primary pt-4 animate-pulse">
            _
          </div>
        </div>

        <div v-else-if="result" class="space-y-4">
          <div class="flex flex-wrap gap-4">
            <span class="text-on-surface-variant/90">[done]</span>
            <span class="text-green-400 font-bold">SUCCESS:</span>
            <span class="text-on-surface">
              Roast generated for @{{ result.username }} ({{ result.meta.commitCount }} commits / {{ result.meta.prCount }} PRs)
            </span>
          </div>

          <blockquote class="text-lg text-on-surface leading-relaxed font-serif pl-4 border-l-4 border-primary italic">
            <p v-for="(line, index) in result.roastLines" :key="`result-line-${index}-${line}`">
              {{ line }}
            </p>
          </blockquote>

          <div class="pt-2">
            <p class="text-xs text-primary tracking-[0.14em] font-display mb-2 uppercase">
              Feedback
            </p>
            <ul class="space-y-2">
              <li v-for="(item, index) in result.feedback" :key="`${index}-${item}`" class="text-on-surface-variant flex gap-2">
                <span class="text-primary">-</span>
                <span>{{ item }}</span>
              </li>
            </ul>
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
