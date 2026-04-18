<template>
  <section id="metrics" class="px-6 py-24 bg-surface-container-low">
    <div class="mx-auto max-w-7xl">
      <div class="mb-16">
        <h2 class="text-4xl text-on-surface tracking-tight font-black font-headline uppercase md:text-6xl">
          EGO DESTRUCTION
          <span class="text-primary block">METRICS</span>
        </h2>
        <div class="mt-4 h-1 w-24 from-primary to-primary-container bg-gradient-to-r" />
      </div>

      <div class="gap-8 grid grid-cols-1 md:grid-cols-3">
        <article class="p-8 rounded-lg bg-surface transition duration-150 hover:shadow-[0_0_40px_rgba(255,51,0,0.15)]">
          <Icon class="text-[26px] text-primary mb-6" name="ph:trend-down" />
          <p class="text-xs text-on-surface-variant tracking-[0.14em] font-bold font-display mb-2 uppercase">
            Ego Reduction Rate
          </p>
          <p class="text-5xl font-black font-headline mb-4">
            98.4%
          </p>
          <p class="text-sm text-on-surface-variant font-body">
            Users report an immediate inability to post on LinkedIn after one analysis.
          </p>
        </article>

        <article class="p-8 rounded-lg bg-surface transition duration-150 hover:shadow-[0_0_40px_rgba(255,51,0,0.15)]">
          <Icon class="text-[26px] text-primary mb-6" name="ph:thermometer-hot" />
          <p class="text-xs text-on-surface-variant tracking-[0.14em] font-bold font-display mb-2 uppercase">
            System Temp
          </p>
          <p class="text-5xl font-black font-headline mb-4 uppercase">
            Critical
          </p>
          <p class="text-sm text-on-surface-variant font-body">
            Servers currently reaching temperatures comparable to the surface of the sun.
          </p>
        </article>

        <article class="p-8 rounded-lg bg-surface transition duration-150 hover:shadow-[0_0_40px_rgba(255,51,0,0.15)]">
          <Icon class="text-[26px] text-primary mb-6" name="ph:notepad" />
          <p class="text-xs text-on-surface-variant tracking-[0.14em] font-bold font-display mb-2 uppercase">
            Cringes Logged
          </p>
          <p class="text-5xl font-black font-headline mb-4">
            12.4M
          </p>
          <p class="text-sm text-on-surface-variant font-body">
            Equivalent to reading every "I wrote a wrapper for an API" Medium post twice.
          </p>
        </article>
      </div>
    </div>
  </section>
</template>
