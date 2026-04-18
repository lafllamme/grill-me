<template>
  <div class="min-h-screen bg-background text-on-surface selection:bg-primary selection:text-on-surface">
    <div class="pointer-events-none fixed inset-0 -z-0">
      <div class="absolute inset-0 bg-gradient-to-br from-surface via-background to-surface-container-lowest" />
      <div class="absolute inset-0 opacity-15 [background:radial-gradient(circle_at_20%_15%,rgba(255,51,0,0.08),transparent_40%),radial-gradient(circle_at_75%_70%,rgba(255,51,0,0.06),transparent_45%)]" />
      <div class="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-primary/12 to-transparent" />
      <div class="absolute bottom-20 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
    </div>

    <div class="relative z-10">
      <LandingTopNav />
      <main>
        <slot />
      </main>
    </div>
  </div>
</template>
