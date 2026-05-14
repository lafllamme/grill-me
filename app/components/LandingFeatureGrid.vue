<template>
  <section id="leaderboard" class="px-5 py-20 bg-surface-container-low md:px-8">
    <div class="mx-auto gap-5 grid grid-cols-1 max-w-6xl md:grid-cols-3">
      <article class="group border-outline-variant/30 p-8 border bg-background relative overflow-hidden md:col-span-2">
        <div class="relative z-10 space-y-4">
          <Icon class="text-[24px] text-primary" name="ph:brain" />
          <h3 class="text-4xl text-on-surface leading-tight tracking-tight font-bold font-display uppercase">
            LLM Powered Destruction
          </h3>
          <p class="text-lg text-on-surface-variant font-body max-w-3xl">
            Our models were trained exclusively on toxic Reddit threads and senior dev PR comments. We don’t just
            find bugs; we find your insecurities.
          </p>
        </div>
        <Icon class="text-[150px] text-on-surface-variant/20 pointer-events-none transition bottom-2 right-6 absolute group-hover:text-on-surface-variant/30" name="ph:code" />
      </article>

      <article class="border-outline-variant/30 p-8 border bg-surface-container-highest flex flex-col justify-between">
        <h3 class="text-3xl text-on-surface leading-tight tracking-tight font-bold font-display uppercase">
          REAL-TIME
          <span class="text-primary block">BURN METRICS</span>
        </h3>
        <div class="mt-6 space-y-2">
          <div class="bg-background h-8">
            <div class="text-[10px] text-on-surface tracking-wide font-bold font-display px-2 pt-1 bg-primary/25 h-full w-[42%] uppercase">
              Complexity
            </div>
          </div>
          <div class="bg-background h-8">
            <div class="text-on-error-container text-[10px] tracking-wide font-bold font-display px-2 pt-1 bg-error/25 h-full w-[90%] uppercase">
              Unreadability
            </div>
          </div>
        </div>
      </article>

      <article class="text-background p-8 border border-primary-container/30 bg-primary">
        <Icon class="text-[26px] mb-6" name="ph:chart-bar" />
        <h3 class="text-3xl leading-tight tracking-tight font-black font-display uppercase">
          Wall of Shame
        </h3>
        <p class="text-base font-body mt-4">
          Think your code is the worst? Compete against thousands of junior-dev level architects for the top spot on
          our global leaderboard.
        </p>
      </article>

      <article class="border-outline-variant/30 p-8 border bg-background flex gap-8 items-center md:col-span-2">
        <div class="flex-1 space-y-4">
          <h3 class="text-4xl text-on-surface leading-tight tracking-tight font-bold font-display uppercase">
            Integrated with
            <span class="text-primary">Evil</span>
          </h3>
          <p class="text-lg text-on-surface-variant font-body">
            We fetch your starred repos, pull requests, and commit messages. Every typo and “fixed stuff” commit is
            ammo.
          </p>
        </div>
        <div class="border-outline-variant/40 border bg-surface-container-high flex h-28 w-40 items-center justify-center">
          <Icon class="text-[34px] text-on-surface-variant" name="ph:terminal-window" />
        </div>
      </article>
    </div>
  </section>
</template>
