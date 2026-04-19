<script lang="ts" setup>
withDefaults(defineProps<{
  pending?: boolean
  isStreaming?: boolean
  canSubmit?: boolean
  errorMessage?: string | null
}>(), {
  pending: false,
  isStreaming: false,
  canSubmit: false,
  errorMessage: null,
})

const emit = defineEmits<{
  submit: []
}>()

function onSubmit() {
  emit('submit')
}
</script>

<template>
  <article class="p-4 border border-outline/40 rounded-[2.25rem] bg-surface-container-low/90 shadow-[0_20px_55px_rgba(0,0,0,0.35)] md:p-7">
    <header class="mb-5 flex flex-col gap-4 md:mb-6 md:flex-row md:items-center md:justify-between">
      <div class="text-left">
        <p class="text-xs text-primary tracking-[0.24em] font-black font-display mb-1 uppercase">
          Source Target
        </p>
        <p class="text-2xl text-on-surface tracking-tight font-bold font-headline">
          GitHub Username
        </p>
      </div>

      <div class="text-xs text-on-surface-variant tracking-[0.08em] font-black font-display px-5 py-2 rounded-full bg-background uppercase">
        <span class="inline-flex gap-2 items-center">
          <Icon class="text-base text-primary" name="ph:shield-check" />
          Secure_Tunnel: Active
        </span>
      </div>
    </header>

    <div class="p-3 border border-outline/30 rounded-[2rem] bg-surface-container-lowest md:p-4">
      <div class="flex flex-col gap-3 md:flex-row md:items-center">
        <RoastInput :disabled="pending && isStreaming" @submit="onSubmit" />

        <button
          class="group/btn text-lg text-background tracking-[0.04em] font-black font-display px-10 py-4 rounded-full shrink-0 uppercase shadow-[0_10px_40px_rgba(255,51,0,0.3)] transition duration-500 relative overflow-hidden from-primary to-primary-container bg-gradient-to-br disabled:opacity-60 md:min-w-[11rem] disabled:cursor-not-allowed hover:shadow-[0_15px_50px_rgba(255,51,0,0.5)] active:scale-95"
          :disabled="!pending && !canSubmit"
          @click="onSubmit"
        >
          <span class="inline-flex gap-2 items-center relative z-10">
            {{ pending ? "Grilling..." : "Grill" }}
            <Icon v-if="!pending" class="text-xl" name="ph:fire-simple-fill" />
          </span>
          <span
            v-if="!pending"
            class="bg-white/20 opacity-0 transition-opacity duration-300 inset-0 absolute group-hover/btn:opacity-100"
          />
        </button>
      </div>
    </div>

    <p v-if="errorMessage" class="text-sm text-primary font-body mt-4 text-left">
      {{ errorMessage }}
    </p>

    <footer class="text-[11px] text-on-surface-variant/75 tracking-[0.08em] font-black font-display mt-5 flex flex-wrap gap-x-6 gap-y-2 uppercase items-center">
      <span class="inline-flex gap-2 items-center">
        <Icon class="text-sm" name="ph:check-circle-fill" />
        Legacy Code Detection
      </span>
      <span class="inline-flex gap-2 items-center">
        <Icon class="text-sm" name="ph:check-circle-fill" />
        Ego Damage Analysis
      </span>
      <span class="inline-flex gap-2 items-center">
        <Icon class="text-sm" name="ph:check-circle-fill" />
        Technical Debt Calc
      </span>
    </footer>
  </article>
</template>
