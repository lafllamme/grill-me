<template>
  <section id="metrics" class="bg-surface-container-low px-6 py-24">
    <div class="mx-auto max-w-7xl">
      <div class="mb-16">
        <h2 class="font-headline text-4xl font-black tracking-tight text-on-surface uppercase md:text-6xl">
          EGO DESTRUCTION
          <span class="block text-primary">METRICS</span>
        </h2>
        <div class="mt-4 h-1 w-24 bg-gradient-to-r from-primary to-primary-container" />
      </div>

      <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
        <article class="rounded-lg bg-surface p-8 transition duration-150 hover:shadow-[0_0_40px_rgba(255,51,0,0.15)]">
          <NuxtIcon class="mb-6 text-[26px] text-primary" name="ph:trend-down" />
          <p class="mb-2 font-display text-xs font-bold tracking-[0.14em] text-on-surface-variant uppercase">Ego Reduction Rate</p>
          <p class="mb-4 font-headline text-5xl font-black">98.4%</p>
          <p class="font-body text-sm text-on-surface-variant">Users report an immediate inability to post on LinkedIn after one analysis.</p>
        </article>

        <article class="rounded-lg bg-surface p-8 transition duration-150 hover:shadow-[0_0_40px_rgba(255,51,0,0.15)]">
          <NuxtIcon class="mb-6 text-[26px] text-primary" name="ph:thermometer-hot" />
          <p class="mb-2 font-display text-xs font-bold tracking-[0.14em] text-on-surface-variant uppercase">System Temp</p>
          <p class="mb-4 font-headline text-5xl font-black uppercase">Critical</p>
          <p class="font-body text-sm text-on-surface-variant">Servers currently reaching temperatures comparable to the surface of the sun.</p>
        </article>

        <article class="rounded-lg bg-surface p-8 transition duration-150 hover:shadow-[0_0_40px_rgba(255,51,0,0.15)]">
          <NuxtIcon class="mb-6 text-[26px] text-primary" name="ph:notepad" />
          <p class="mb-2 font-display text-xs font-bold tracking-[0.14em] text-on-surface-variant uppercase">Cringes Logged</p>
          <p class="mb-4 font-headline text-5xl font-black">12.4M</p>
          <p class="font-body text-sm text-on-surface-variant">Equivalent to reading every "I wrote a wrapper for an API" Medium post twice.</p>
        </article>
      </div>
    </div>
  </section>
</template>
