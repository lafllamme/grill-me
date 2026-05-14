<script setup lang="ts">
import type { LeaderboardItem } from '~~/shared/roast/contracts'

const { leaderboard, pending, error, window, search, setWindow } = useLeaderboard()

const entries = computed<LeaderboardItem[]>(() => leaderboard.value?.items || [])

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime()))
    return 'unknown'
  return date.toLocaleString()
}
</script>

<template>
  <div class="bg-basalt-950 text-on-surface min-h-screen">
    <LandingTopNav />

    <main class="mx-auto px-4 pb-24 pt-32 max-w-6xl md:px-10">
      <header class="mb-8 space-y-4">
        <p class="text-xs text-primary tracking-[0.24em] font-meta uppercase">
          Leaderboard
        </p>
        <h1 class="text-5xl text-white leading-[0.9] tracking-tight font-display md:text-7xl">
          Wall of Shame
        </h1>
        <p class="text-lg text-white/65 max-w-3xl">
          Official Wall of Shame. Only verified self-submitted roasts are ranked here.
        </p>
      </header>

      <section class="mb-8 p-4 border border-white/10 rounded-2xl bg-white/5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div class="p-1 border border-white/10 rounded-full bg-black/40 inline-flex gap-2">
          <button
            class="text-sm px-4 py-1.5 rounded-full transition"
            :class="window === 'all' ? 'bg-primary text-black' : 'text-white/70 hover:text-white'"
            @click="setWindow('all')"
          >
            All-time
          </button>
          <button
            class="text-sm px-4 py-1.5 rounded-full transition"
            :class="window === '24h' ? 'bg-primary text-black' : 'text-white/70 hover:text-white'"
            @click="setWindow('24h')"
          >
            Last 24h
          </button>
        </div>

        <input
          v-model="search"
          type="search"
          placeholder="Search victims..."
          class="text-white px-4 py-2 outline-none border border-white/10 rounded-xl bg-black/50 w-full transition focus:border-primary md:w-80"
        >
      </section>

      <section class="border border-white/10 rounded-2xl bg-black/40 overflow-hidden">
        <div class="text-xs text-white/45 tracking-[0.22em] font-meta px-5 py-3 border-b border-white/10 gap-2 grid grid-cols-[80px_1fr_180px_180px_190px] uppercase">
          <span>Rank</span>
          <span>Victim</span>
          <span>Spaghetti</span>
          <span>Ego Damage</span>
          <span>Verdict</span>
        </div>

        <div v-if="pending" class="text-white/70 p-6">
          Loading leaderboard...
        </div>
        <div v-else-if="error" class="text-red-300 p-6">
          Failed to load leaderboard.
        </div>
        <div v-else-if="entries.length === 0" class="text-white/70 p-6">
          No entries yet. Run a roast to populate the board.
        </div>
        <ul v-else>
          <li
            v-for="entry in entries"
            :key="`${entry.username}-${entry.rank}`"
            class="text-white/90 px-5 py-4 border-b border-white/8 gap-2 grid grid-cols-[80px_1fr_180px_180px_190px] items-center last:border-b-0"
          >
            <span class="text-3xl text-primary leading-none font-display">
              #{{ String(entry.rank).padStart(2, '0') }}
            </span>

            <div class="min-w-0">
              <p class="text-2xl leading-none font-display truncate">
                @{{ entry.username }}
              </p>
              <p class="text-xs text-white/50 font-meta mt-1 truncate">
                last roasted: {{ formatDate(entry.lastRoastedAt) }}
              </p>
            </div>

            <div>
              <p class="text-3xl leading-none font-display" :class="entry.metrics.stinkScore >= 90 ? 'text-primary' : 'text-white'">
                {{ formatPercent(entry.metrics.stinkScore) }}
              </p>
              <p class="text-xs text-white/50 font-meta mt-1">
                SI {{ formatPercent(entry.metrics.spaghettiIndex) }}
              </p>
            </div>

            <div>
              <div class="rounded-full bg-white/15 h-2 w-full">
                <div class="rounded-full bg-primary h-2" :style="{ width: `${entry.metrics.egoDamage}%` }" />
              </div>
              <p class="text-xs text-primary font-meta mt-1">
                {{ formatPercent(entry.metrics.egoDamage) }}
              </p>
            </div>

            <div class="space-y-1">
              <p class="text-4xl text-primary leading-none font-display">
                {{ entry.metrics.grade }}
              </p>
              <p class="text-xs text-white/70 tracking-[0.12em] font-meta uppercase">
                {{ entry.metrics.specialTitle }}
              </p>
            </div>
          </li>
        </ul>
      </section>
    </main>
  </div>
</template>
