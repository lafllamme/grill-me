<script lang="ts" setup>
import { useRoast } from '#imports'

const githubUsername = ref('')

const { pending, error, roastUsername } = useRoast()

async function submitRoast() {
  await roastUsername(githubUsername.value)
}
</script>

<template>
  <section class="px-6 pt-24 text-center flex flex-col min-h-[870px] items-center justify-center">
    <h1 class="text-6xl text-on-surface leading-none tracking-tight font-extrabold font-headline mb-8 uppercase md:text-[9rem]">
      YOUR CODE IS
      <span class="text-transparent block from-primary to-primary-container bg-gradient-to-r bg-clip-text">
        GARBAGE.
      </span>
    </h1>

    <p class="text-xl text-on-surface-variant font-body font-medium mb-12 max-w-2xl">
      Our AI doesn't just review your code; it incinerates your technical debt and feeds your ego to the wolves. Enter a GitHub username to begin the roast.
    </p>

    <div class="p-2 rounded-xl bg-surface-container-lowest max-w-4xl w-full shadow-[0_0_40px_rgba(255,51,0,0.15)]">
      <div class="flex flex-col gap-2 md:flex-row">
        <label class="px-4 bg-surface-container-lowest flex flex-1 gap-3 items-center">
          <Icon class="text-[18px] text-on-surface-variant" name="ph:user" />
          <input
            v-model="githubUsername"
            class="text-sm text-on-surface font-mono py-4 outline-none bg-transparent w-full placeholder:text-on-surface-variant/60"
            placeholder="torvalds"
            type="text"
            @keydown.enter.prevent="submitRoast"
          >
        </label>
        <button
          class="text-sm text-on-surface tracking-[0.1em] font-black font-display px-10 py-4 rounded-lg uppercase transition duration-150 from-primary to-primary-container bg-gradient-to-r disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 hover:brightness-110"
          :disabled="pending || !githubUsername.trim()"
          @click="submitRoast"
        >
          {{ pending ? "ROASTING..." : "ROAST" }}
        </button>
      </div>
      <p v-if="error" class="text-sm text-primary font-body mt-3 text-left">
        {{ error }}
      </p>
    </div>

    <div class="text-[10px] text-on-surface-variant tracking-[0.14em] font-bold font-display mt-8 flex flex-wrap gap-3 uppercase items-center justify-center">
      <span class="inline-flex gap-1 items-center">
        <Icon class="text-[12px] text-primary" name="ph:fire" />
        4,209 repos destroyed today
      </span>
      <span class="text-on-surface-variant/50">|</span>
      <span class="inline-flex gap-1 items-center">
        <Icon class="text-[12px]" name="ph:skull" />
        12.4M lines of cringe identified
      </span>
    </div>
  </section>
</template>
