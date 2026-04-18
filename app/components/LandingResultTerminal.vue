<template>
  <section class="mx-auto max-w-6xl px-6 py-24">
    <div class="overflow-hidden rounded-xl border border-divider bg-surface-container-lowest shadow-2xl">
      <div class="flex items-center justify-between bg-surface-container px-4 py-3">
        <div class="flex gap-2">
          <span class="h-3 w-3 rounded-full border border-red-500/40 bg-red-500/20" />
          <span class="h-3 w-3 rounded-full border border-amber-500/40 bg-amber-500/20" />
          <span class="h-3 w-3 rounded-full border border-green-500/40 bg-green-500/20" />
        </div>
        <span class="font-mono text-xs tracking-[0.14em] text-on-surface-variant uppercase">
          roast-engine-v2.0.4 --live
        </span>
      </div>

      <div class="min-h-[400px] space-y-4 p-8 font-mono text-sm">
        <div class="flex gap-4">
          <span class="text-on-surface-variant/70">[08:42:11]</span>
          <span class="font-bold text-primary">INIT:</span>
          <span class="text-on-surface">Targeting repository: "legacy-spaghetti-monster"</span>
        </div>
        <div class="flex gap-4">
          <span class="text-on-surface-variant/70">[08:42:13]</span>
          <span class="font-bold text-amber-400">SCAN:</span>
          <span class="text-on-surface">Scanning 427 files for signs of intelligence...</span>
        </div>
        <div class="flex gap-4">
          <span class="text-on-surface-variant/70">[08:42:14]</span>
          <span class="font-bold text-red-400">ERROR:</span>
          <span class="text-on-surface">Intelligence not found. Found "temp_final_v4_copy.js" instead.</span>
        </div>
        <div class="flex gap-4 pl-12">
          <span class="italic text-primary-container">"This variable naming is so bad it qualifies as a war crime in 14 countries."</span>
        </div>
        <div class="flex gap-4">
          <span class="text-on-surface-variant/70">[08:42:18]</span>
          <span class="font-bold text-blue-400">INFO:</span>
          <span class="text-on-surface">Calculating Cyclomatic Complexity of user's life choices...</span>
        </div>
        <div class="flex gap-4">
          <span class="text-on-surface-variant/70">[08:42:20]</span>
          <span class="font-bold text-green-400">SUCCESS:</span>
          <span class="text-on-surface">Roast generated. Ego destruction at 98.4%.</span>
        </div>
        <div class="animate-pulse pt-4 text-primary">_</div>
      </div>
    </div>
  </section>
</template>
