<template>
  <section id="manifesto" class="mx-auto max-w-6xl px-5 py-14 md:px-8">
    <div class="border border-outline-variant/45 bg-surface-container-lowest">
      <div class="flex items-center justify-between border-b border-outline-variant/45 bg-surface-container-highest px-4 py-2">
        <div class="flex gap-2">
          <span class="h-2.5 w-2.5 bg-surface-bright" />
          <span class="h-2.5 w-2.5 bg-surface-bright" />
          <span class="h-2.5 w-2.5 bg-surface-bright" />
        </div>
        <span class="font-display text-[10px] font-bold tracking-[0.15em] text-on-surface-variant uppercase">
          ROOT@GRILLME: ~
        </span>
        <NuxtIcon class="text-[18px] text-on-surface-variant/60" name="ph:terminal-window" />
      </div>

      <div class="space-y-4 p-6 font-mono text-sm leading-relaxed md:p-10 md:text-base">
        <div class="flex items-center gap-3">
          <span class="font-display font-bold text-primary">$</span>
          <span class="italic text-on-surface-variant">Waiting for input...</span>
        </div>

        <div class="space-y-3 text-on-surface-variant/60 italic opacity-70">
          <p>// Logic incinerator initialized...</p>
          <p>// Scanning repositories for poor naming conventions...</p>
          <p>// Analyzing nested if-statements that make us cry...</p>
        </div>

        <article class="mt-8 border-l-4 border-error/65 bg-gradient-to-b from-surface-container-high to-surface-container-low p-7">
          <h3 class="font-display text-xl font-black tracking-tight text-error uppercase">
            The Verdict
          </h3>
          <p class="mt-4 max-w-4xl font-serif text-lg italic text-on-surface-variant">
            “Your contributions to ‘clean code’ are like a dumpster fire in a vacuum: technically impressive how much
            energy is wasted while achieving absolutely zero oxygen.”
          </p>

          <div class="mt-6 flex items-center gap-4">
            <div class="h-1 flex-1 bg-surface-container-highest">
              <div class="h-full w-[85%] bg-gradient-to-r from-primary to-error" />
            </div>
            <span class="font-display text-[10px] font-black tracking-[0.12em] text-primary-fixed-dim uppercase">
              Ego Damage 85%
            </span>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
