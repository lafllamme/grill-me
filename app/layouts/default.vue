<template>
  <div class="min-h-screen bg-black text-orange-50">
    <div class="pointer-events-none fixed inset-0 -z-0">
      <div class="absolute inset-0 bg-gradient-to-br from-orange-900/35 via-black to-amber-900/20" />
      <div class="absolute inset-0 opacity-25 [background:linear-gradient(#ffffff08_1px,transparent_1px),linear-gradient(90deg,#ffffff08_1px,transparent_1px)] [background-size:36px_36px]" />
    </div>

    <div class="relative z-10">
      <LandingTopNav />
      <main>
        <slot />
      </main>
    </div>
  </div>
</template>
