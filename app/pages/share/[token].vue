<script setup lang="ts">
import type { RoastShareResolveResponse } from '~~/shared/roast/contracts'

const route = useRoute()
const token = computed(() => String(route.params.token || ''))

const { data, pending, error } = await useFetch<RoastShareResolveResponse>(() => `/api/roast/share/${encodeURIComponent(token.value)}`, {
  watch: [token],
})
</script>

<template>
  <div class="bg-basalt-950 text-on-surface min-h-screen">
    <LandingTopNav />
    <main class="mx-auto px-4 pb-24 pt-32 max-w-4xl md:px-10">
      <header class="mb-8 space-y-3">
        <p class="text-xs text-primary tracking-[0.22em] uppercase">
          Shared Roast
        </p>
        <h1 class="text-4xl text-white leading-tight tracking-tight font-display md:text-6xl">
          Unofficial Roast Snapshot
        </h1>
        <p class="text-base text-white/65 max-w-2xl">
          This is an unofficial shared roast and does not affect the leaderboard.
        </p>
      </header>

      <section class="p-6 border border-white/10 rounded-2xl bg-black/40 md:p-8">
        <p v-if="pending" class="text-white/70">
          Loading shared roast...
        </p>
        <p v-else-if="error || !data" class="text-primary">
          Share not found or expired.
        </p>
        <template v-else>
          <p class="text-xs text-white/50 tracking-[0.12em] mb-2 uppercase">
            @{{ data.data.username }}
          </p>
          <h2 class="text-3xl text-white leading-tight tracking-tight font-headline mb-5">
            {{ data.data.title }}
          </h2>

          <blockquote class="text-lg text-on-surface leading-relaxed mb-8 pl-4 border-l-4 border-primary space-y-3">
            <p
              v-for="(line, index) in data.data.roastLines"
              :key="`shared-roast-${index}`"
            >
              {{ line }}
            </p>
          </blockquote>

          <div class="mb-8 space-y-3">
            <p class="text-xs text-primary tracking-[0.14em] uppercase">
              Feedback
            </p>
            <ul class="space-y-2">
              <li
                v-for="(item, index) in data.data.feedback"
                :key="`shared-feedback-${index}`"
                class="text-on-surface-variant flex gap-2"
              >
                <span class="text-primary">-</span>
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>

          <div class="gap-3 grid grid-cols-1 md:grid-cols-3">
            <div class="p-3 border border-white/10 rounded-xl bg-white/5">
              <p class="text-xs text-white/50 tracking-[0.12em] uppercase">
                Stink Score
              </p>
              <p class="text-2xl text-primary font-display mt-1">
                {{ data.data.metrics.stinkScore.toFixed(1) }}%
              </p>
            </div>
            <div class="p-3 border border-white/10 rounded-xl bg-white/5">
              <p class="text-xs text-white/50 tracking-[0.12em] uppercase">
                Ego Damage
              </p>
              <p class="text-2xl text-primary font-display mt-1">
                {{ data.data.metrics.egoDamage.toFixed(1) }}%
              </p>
            </div>
            <div class="p-3 border border-white/10 rounded-xl bg-white/5">
              <p class="text-xs text-white/50 tracking-[0.12em] uppercase">
                Grade
              </p>
              <p class="text-2xl text-primary font-display mt-1">
                {{ data.data.metrics.grade }}
              </p>
            </div>
          </div>
        </template>
      </section>
    </main>
  </div>
</template>
