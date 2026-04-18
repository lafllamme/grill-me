<template>
  <section id="manifesto" class="mx-auto max-w-6xl px-5 py-14 md:px-8">
    <div class="border border-zinc-800/50 bg-black">
      <div class="flex items-center justify-between border-b border-zinc-800/50 bg-zinc-900 px-4 py-2">
        <div class="flex gap-2">
          <span class="h-2.5 w-2.5 bg-zinc-700" />
          <span class="h-2.5 w-2.5 bg-zinc-700" />
          <span class="h-2.5 w-2.5 bg-zinc-700" />
        </div>
        <span class="font-display text-[10px] font-bold tracking-[0.15em] text-zinc-500 uppercase">
          ROOT@GRILLME: ~
        </span>
        <NuxtIcon class="text-[18px] text-zinc-600" name="ph:terminal-window" />
      </div>

      <div class="space-y-4 p-6 font-mono text-sm leading-relaxed md:p-10 md:text-base">
        <div class="flex items-center gap-3">
          <span class="font-display font-bold text-orange-400">$</span>
          <span class="italic text-zinc-300">Waiting for input...</span>
        </div>

        <div class="space-y-3 text-zinc-600 italic opacity-55">
          <p>// Logic incinerator initialized...</p>
          <p>// Scanning repositories for poor naming conventions...</p>
          <p>// Analyzing nested if-statements that make us cry...</p>
        </div>

        <article class="mt-8 border-l-4 border-red-500/65 bg-gradient-to-b from-zinc-900 to-black p-7">
          <h3 class="font-display text-xl font-black tracking-tight text-red-400 uppercase">
            The Verdict
          </h3>
          <p class="mt-4 max-w-4xl font-serif text-lg italic text-zinc-300">
            “Your contributions to ‘clean code’ are like a dumpster fire in a vacuum: technically impressive how much
            energy is wasted while achieving absolutely zero oxygen.”
          </p>

          <div class="mt-6 flex items-center gap-4">
            <div class="h-1 flex-1 bg-zinc-800">
              <div class="h-full w-[85%] bg-gradient-to-r from-orange-400 to-red-500" />
            </div>
            <span class="font-display text-[10px] font-black tracking-[0.12em] text-orange-300 uppercase">
              Ego Damage 85%
            </span>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
