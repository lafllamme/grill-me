<script lang="ts" setup>
const repositoryUrl = ref("")
</script>

<template>
  <section class="flex min-h-[870px] flex-col items-center justify-center px-6 pt-24 text-center">
    <h1 class="mb-8 font-headline text-6xl leading-none font-extrabold tracking-tight text-on-surface uppercase md:text-[9rem]">
      YOUR CODE IS
      <span class="block bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">
        GARBAGE.
      </span>
    </h1>

    <p class="mb-12 max-w-2xl font-body text-xl font-medium text-on-surface-variant">
      Our AI doesn't just review your code; it incinerates your technical debt and feeds your ego to the wolves. Enter a repository URL to begin the roast.
    </p>

    <div class="w-full max-w-4xl rounded-xl bg-surface-container-lowest p-2 shadow-[0_0_40px_rgba(255,51,0,0.15)]">
      <div class="flex flex-col gap-2 md:flex-row">
        <label class="flex flex-1 items-center gap-3 bg-surface-container-lowest px-4">
          <NuxtIcon class="text-[18px] text-on-surface-variant" name="ph:terminal-window" />
          <input
            v-model="repositoryUrl"
            class="w-full bg-transparent py-4 font-mono text-sm text-on-surface placeholder:text-on-surface-variant/60 outline-none"
            placeholder="https://github.com/your-username/your-shameful-repo"
            type="text"
          >
        </label>
        <button class="rounded-lg bg-gradient-to-r from-primary to-primary-container px-10 py-4 font-display text-sm font-black tracking-[0.1em] text-on-surface uppercase transition duration-150 hover:brightness-110 active:scale-95">
          ROAST
        </button>
      </div>
    </div>

    <div class="mt-8 flex flex-wrap items-center justify-center gap-3 font-display text-[10px] font-bold tracking-[0.14em] text-on-surface-variant uppercase">
      <span class="inline-flex items-center gap-1">
        <NuxtIcon class="text-[12px] text-primary" name="ph:fire" />
        4,209 repos destroyed today
      </span>
      <span class="text-on-surface-variant/50">|</span>
      <span class="inline-flex items-center gap-1">
        <NuxtIcon class="text-[12px]" name="ph:skull" />
        12.4M lines of cringe identified
      </span>
    </div>
  </section>
</template>
