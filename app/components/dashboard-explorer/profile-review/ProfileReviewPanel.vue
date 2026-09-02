<script setup lang="ts">
import type { ProfileReviewPanelProps } from './types'
import { computed } from 'vue'

const props = defineProps<ProfileReviewPanelProps>()

const reviewVerdictLabels: Record<string, string> = {
  supports: 'supports score',
  softens: 'softens score',
  contradicts: 'challenges score',
  insufficient: 'limited evidence',
}

const axisReviews = computed(() => props.aiReview?.axisReviews ?? [])
const hasReviewContent = computed(() => Boolean(props.clarityBreakdown || props.aiReview))
</script>

<template>
  <article
    v-if="hasReviewContent"
    :class="props.panelClass"
    class="p-6 rounded-[28px] transition-colors duration-300 sm:p-8"
    data-testid="profile-review-panel"
  >
    <div class="flex flex-wrap gap-4 items-start justify-between">
      <div>
        <p class="text-[10px] text-primary-strong tracking-[0.18em] font-meta uppercase">
          Score evidence
        </p>
        <h2 class="text-2xl tracking-[-0.04em] font-body mt-3">
          What the profile is based on
        </h2>
      </div>
      <span class="text-[10px] text-primary-strong tracking-[0.12em] font-meta uppercase">
        {{ props.isLive ? 'Live' : 'Mock' }}
      </span>
    </div>

    <div class="mt-8 gap-8 grid lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
      <section v-if="props.clarityBreakdown" aria-label="Clarity score breakdown">
        <p :class="props.mutedClass" class="text-[10px] tracking-[0.14em] font-meta uppercase">
          Clarity breakdown
        </p>
        <div class="mt-4 gap-2 grid grid-cols-2 lg:grid-cols-2 sm:grid-cols-4">
          <span class="text-[10px] text-current/60 tracking-[0.08em] font-meta px-2.5 py-2 rounded-lg bg-current/5 uppercase">
            Message {{ props.clarityBreakdown.messageSignal }}
          </span>
          <span class="text-[10px] text-current/60 tracking-[0.08em] font-meta px-2.5 py-2 rounded-lg bg-current/5 uppercase">
            Names {{ props.clarityBreakdown.namingSignal }}
          </span>
          <span class="text-[10px] text-current/60 tracking-[0.08em] font-meta px-2.5 py-2 rounded-lg bg-current/5 uppercase">
            Structure {{ props.clarityBreakdown.structureSignal }}
          </span>
          <span class="text-[10px] text-primary tracking-[0.08em] font-meta px-2.5 py-2 rounded-lg bg-primary/10 uppercase">
            Cap {{ props.clarityBreakdown.evidenceCap }}
          </span>
        </div>
      </section>

      <section v-if="props.aiReview" aria-label="AI review">
        <div class="text-[11px] tracking-[0.08em] font-meta flex gap-3 uppercase items-center justify-between">
          <span :class="props.mutedClass">AI second read</span>
          <span class="text-primary">{{ props.aiReview.status }} · {{ props.aiReview.confidence }}%</span>
        </div>
        <div v-if="axisReviews.length" class="mt-4 divide-current/10 divide-y">
          <article v-for="review in axisReviews" :key="review.axis" class="py-4 first:pt-0 last:pb-0">
            <div class="text-[10px] tracking-[0.08em] font-meta flex gap-3 uppercase items-center justify-between">
              <span>{{ review.axis }}</span>
              <span class="text-primary">{{ reviewVerdictLabels[review.verdict] ?? review.verdict }} · {{ review.confidence }}%</span>
            </div>
            <p :class="props.mutedClass" class="text-sm leading-6 mt-2 max-w-[60ch]">
              {{ review.summary }}
            </p>
            <ul v-if="review.evidence.length" class="mt-3 space-y-2">
              <li v-for="item in review.evidence" :key="`${item.commitSha}:${item.filename}`" :class="props.mutedClass" class="text-xs leading-5">
                <span class="text-current/80 font-meta">{{ item.filename }}</span>
                <span class="text-current/30 mx-1">·</span>
                {{ item.observation }}
              </li>
            </ul>
          </article>
        </div>
      </section>
    </div>
  </article>
</template>
