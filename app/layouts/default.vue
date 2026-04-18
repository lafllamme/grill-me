<template>
  <div class="text-on-surface bg-background min-h-screen selection:text-on-surface selection:bg-primary">
    <div class="-z-0 pointer-events-none inset-0 fixed">
      <div class="inset-0 absolute from-surface to-surface-container-lowest via-background bg-gradient-to-br" />
      <div class="opacity-15 [background:radial-gradient(circle_at_20%_15%,rgba(255,51,0,0.08),transparent_40%),radial-gradient(circle_at_75%_70%,rgba(255,51,0,0.06),transparent_45%)] inset-0 absolute" />
      <div class="h-40 inset-x-0 top-0 absolute from-primary/12 to-transparent bg-gradient-to-b" />
      <div class="rounded-full bg-primary/10 h-96 w-96 bottom-20 left-1/2 absolute blur-[120px] -translate-x-1/2" />
    </div>

    <div class="relative z-10">
      <LandingTopNav />
      <main>
        <slot />
      </main>
    </div>
  </div>
</template>
