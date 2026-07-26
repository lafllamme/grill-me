<script setup lang="ts">
import RebrandChapterMeta from '~/components/rebrand/RebrandChapterMeta.vue'
</script>

<template>
  <section class="mx-auto px-4 pb-36 pt-8 max-w-[96rem] min-h-[118svh] lg:px-10 sm:px-6 lg:pb-52">
    <RebrandChapterMeta index="01" title="About the product" />

    <div class="pt-[clamp(8rem,19vw,19rem)] gap-12 grid lg:grid-cols-[0.58fr_1.42fr] lg:items-end">
      <div class="pb-3">
        <p class="text-[10px] text-signal-red-700 tracking-[0.18em] font-meta uppercase">
          Public commits / private consequences
        </p>
        <p class="text-base text-basalt-600 leading-relaxed font-body mt-8 max-w-[27rem] sm:text-lg">
          Grillme turns public engineering evidence into a verdict that is funny enough to share and specific enough to improve from.
        </p>
      </div>

      <h2 class="text-[clamp(3.2rem,7.2vw,8rem)] text-basalt-950 leading-[0.86] tracking-[-0.07em] font-display">
        Evidence first. Then the punchline. Never the other way around.
      </h2>
    </div>
  </section>
</template>
