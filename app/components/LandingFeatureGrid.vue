<template>
  <section id="leaderboard" class="bg-surface-container-low px-5 py-20 md:px-8">
    <div class="mx-auto grid max-w-6xl grid-cols-1 gap-5 md:grid-cols-3">
      <article class="group relative overflow-hidden border border-outline-variant/30 bg-background p-8 md:col-span-2">
        <div class="relative z-10 space-y-4">
          <NuxtIcon class="text-[24px] text-primary" name="ph:brain" />
          <h3 class="font-display text-4xl leading-tight font-bold tracking-tight text-on-surface uppercase">
            LLM Powered Destruction
          </h3>
          <p class="max-w-3xl font-body text-lg text-on-surface-variant">
            Our models were trained exclusively on toxic Reddit threads and senior dev PR comments. We don’t just
            find bugs; we find your insecurities.
          </p>
        </div>
        <NuxtIcon class="pointer-events-none absolute right-6 bottom-2 text-[150px] text-on-surface-variant/20 transition group-hover:text-on-surface-variant/30" name="ph:code" />
      </article>

      <article class="flex flex-col justify-between border border-outline-variant/30 bg-surface-container-highest p-8">
        <h3 class="font-display text-3xl leading-tight font-bold tracking-tight text-on-surface uppercase">
          REAL-TIME
          <span class="block text-primary">BURN METRICS</span>
        </h3>
        <div class="mt-6 space-y-2">
          <div class="h-8 bg-background">
            <div class="h-full w-[42%] bg-primary/25 px-2 pt-1 font-display text-[10px] font-bold tracking-wide text-on-surface uppercase">
              Complexity
            </div>
          </div>
          <div class="h-8 bg-background">
            <div class="h-full w-[90%] bg-error/25 px-2 pt-1 font-display text-[10px] font-bold tracking-wide text-on-error-container uppercase">
              Unreadability
            </div>
          </div>
        </div>
      </article>

      <article class="border border-primary-container/30 bg-primary p-8 text-on-primary-fixed">
        <NuxtIcon class="mb-6 text-[26px]" name="ph:chart-bar" />
        <h3 class="font-display text-3xl leading-tight font-black tracking-tight uppercase">
          Wall of Shame
        </h3>
        <p class="mt-4 font-body text-base">
          Think your code is the worst? Compete against thousands of junior-dev level architects for the top spot on
          our global leaderboard.
        </p>
      </article>

      <article class="flex items-center gap-8 border border-outline-variant/30 bg-background p-8 md:col-span-2">
        <div class="flex-1 space-y-4">
          <h3 class="font-display text-4xl leading-tight font-bold tracking-tight text-on-surface uppercase">
            Integrated with
            <span class="text-primary">Evil</span>
          </h3>
          <p class="font-body text-lg text-on-surface-variant">
            We fetch your starred repos, pull requests, and commit messages. Every typo and “fixed stuff” commit is
            ammo.
          </p>
        </div>
        <div class="flex h-28 w-40 items-center justify-center border border-outline-variant/40 bg-surface-container-high">
          <NuxtIcon class="text-[34px] text-on-surface-variant" name="ph:terminal-window" />
        </div>
      </article>
    </div>
  </section>
</template>
