<script lang="ts" setup>
const username = ref("")
const roastLevel = ref(2)

const roastLabels = ["Polite", "Mean", "Savage", "Hellfire"] as const
const roastLevelLabel = computed(() => roastLabels[roastLevel.value - 1] ?? "Mean")
</script>

<template>
  <section class="relative overflow-hidden px-5 pt-20 pb-12 md:px-8 md:pt-24">
    <div class="pointer-events-none absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/8 blur-[120px]" />

    <div class="relative z-10 mx-auto max-w-4xl space-y-8 text-center">
      <h1 class="font-display text-5xl leading-[0.9] font-black tracking-tight text-zinc-100 uppercase md:text-8xl">
        YOUR CODE IS
        <span class="block text-orange-400 italic">
          GARBAGE.
        </span>
      </h1>

      <p class="mx-auto max-w-2xl font-body text-lg text-zinc-300 md:text-[30px]">
        Submit your GitHub username for a brutal, AI-powered logic-check. No feelings spared. No refactor ignored.
      </p>

      <div class="mt-12 border border-zinc-800/60 bg-zinc-950/90 p-7 shadow-[0_0_50px_rgba(255,120,77,0.08)] md:p-12">
        <div class="group relative">
          <input
            v-model="username"
            class="w-full border-0 border-b-2 border-orange-500/35 bg-transparent px-1 py-5 font-display text-4xl font-bold text-zinc-100 placeholder:text-zinc-800 focus:border-orange-400 focus:outline-none md:text-6xl"
            placeholder="GITHUB_USERNAME"
            type="text"
          />
          <span class="absolute top-1/2 right-2 -translate-y-1/2 font-display text-[11px] font-bold tracking-[0.18em] text-orange-400/55 uppercase">
            Required
          </span>
        </div>

        <div class="mt-10 space-y-5">
          <div class="flex items-end justify-between">
            <span class="font-display text-[11px] font-bold tracking-[0.2em] text-orange-300 uppercase">
              Set Intensity
            </span>
            <span class="bg-zinc-800 px-3 py-1 font-display text-[11px] font-bold tracking-[0.16em] text-zinc-100 uppercase">
              {{ roastLevelLabel }}
            </span>
          </div>

          <input
            v-model.number="roastLevel"
            class="h-2 w-full cursor-pointer appearance-none bg-zinc-800 accent-orange-400"
            max="4"
            min="1"
            step="1"
            type="range"
          />

          <div class="grid grid-cols-4 font-display text-[10px] tracking-[0.12em] text-zinc-500 uppercase">
            <span class="text-left">Polite</span>
            <span class="text-center">Mean</span>
            <span class="text-center">Savage</span>
            <span class="text-right text-red-400">Hellfire</span>
          </div>
        </div>

        <button class="mt-10 flex w-full items-center justify-center gap-2 bg-gradient-to-r from-orange-400 to-orange-500 py-5 font-display text-2xl font-black tracking-tight text-black uppercase shadow-[0_10px_40px_rgba(255,120,77,0.35)] transition hover:brightness-110">
          GRILL ME
          <NuxtIcon class="text-[22px]" name="ph:fire" />
        </button>
      </div>
    </div>
  </section>
</template>
