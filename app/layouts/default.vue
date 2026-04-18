<template>
  <div class="min-h-screen bg-background text-on-surface selection:bg-primary selection:text-on-primary-fixed">
    <div class="pointer-events-none fixed inset-0 -z-0">
      <div class="absolute inset-0 bg-gradient-to-br from-surface-container-low via-background to-surface-container-lowest" />
      <div class="absolute inset-0 opacity-20 [background:linear-gradient(#ffffff08_1px,transparent_1px),linear-gradient(90deg,#ffffff08_1px,transparent_1px)] [background-size:36px_36px]" />
      <div class="absolute top-[10%] right-[8%] h-72 w-72 rounded-full bg-primary/8 blur-[120px]" />
    </div>

    <div class="relative z-10">
      <LandingTopNav />
      <main>
        <slot />
      </main>
    </div>
  </div>
</template>
