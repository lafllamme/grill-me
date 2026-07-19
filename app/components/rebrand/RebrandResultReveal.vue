<template>
  <section id="result" class="mx-auto px-4 pb-8 max-w-[88rem] lg:px-10 sm:px-6">
    <div class="px-6 py-16 border-[1px] border-explore-border rounded-[2.5rem] border-solid bg-black/46 flex min-h-[72dvh] shadow-[0_32px_160px_rgba(45,0,7,0.52)] items-end backdrop-blur-2xl lg:px-16 lg:py-24 sm:px-10 sm:py-20 sm:rounded-[3.5rem]">
      <div class="w-full">
        <div class="flex gap-4 items-center justify-between">
          <p class="text-xs text-signal-red-500 tracking-[0.2em] font-meta uppercase">
            Final verdict
          </p>
          <p class="text-[10px] text-explore-muted tracking-[0.14em] font-meta uppercase">
            medium rare / 06 receipts
          </p>
        </div>
        <div class="mt-10 gap-12 grid lg:grid-cols-[1.35fr_0.65fr] lg:items-end">
          <blockquote class="text-[clamp(3.2rem,7.4vw,8.5rem)] text-explore-copy leading-[0.84] tracking-[-0.07em] font-display max-w-[11ch]">
            You didn’t remove complexity. You moved it somewhere with fewer witnesses.
          </blockquote>
          <div>
            <p class="text-base text-explore-muted leading-relaxed font-body max-w-[31rem] sm:text-lg">
              Six commits, three suspicious abstractions, and one README that promises a rewrite. The evidence remains attached to the punchline.
            </p>
            <div class="mt-8 flex flex-wrap gap-3">
              <button type="button" class="text-xs text-explore-copy tracking-[0.1em] font-label px-5 py-3.5 rounded-xl bg-signal-red-700 uppercase hover:bg-signal-red-600">
                Share receipt
              </button>
              <a href="#target" class="text-xs text-explore-copy tracking-[0.1em] font-label px-5 py-3.5 border-[1px] border-explore-border rounded-xl border-solid bg-white/4 uppercase hover:bg-white/8">Roast another</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
