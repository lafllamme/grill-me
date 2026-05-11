<script setup lang="ts">
</script>

<template>
  <section class="px-6 pb-10">
    <div class="mx-auto max-w-6xl">
      <div class="mb-6 text-center flex flex-col gap-4 items-center">
        <p class="text-[10px] text-primary tracking-[0.18em] font-display px-4 py-2 border border-divider/70 rounded-full bg-surface-container-low uppercase">
          Procedural BBQ Render
        </p>
        <h2 class="text-3xl text-on-surface leading-tight tracking-tight font-bold font-headline max-w-4xl md:text-5xl">
          We built the grill ourselves. Now you can overcook it on purpose.
        </h2>
        <p class="text-base text-on-surface-variant font-body max-w-2xl md:text-lg">
          The landing scene is now a fully procedural low-poly barbecue stage. Push the heat, watch the flames climb, and let the meat drift from raw to charred.
        </p>
      </div>

      <ClientOnly>
        <GrillScene />
        <template #fallback>
          <div class="border border-divider/70 rounded-[1.75rem] h-[20rem] shadow-[0_32px_120px_-48px_rgba(0,0,0,0.75)] overflow-hidden from-surface-container-low to-surface-container-lowest via-surface-container bg-gradient-to-br lg:h-[30rem] sm:h-[24rem]">
            <div class="px-6 text-center flex h-full items-center justify-center">
              <div class="space-y-3">
                <p class="text-xs text-primary tracking-[0.18em] font-display uppercase">
                  Grill Chamber
                </p>
                <p class="text-lg text-on-surface font-headline">
                  The procedural grill mounts on the client.
                </p>
              </div>
            </div>
          </div>
        </template>
      </ClientOnly>
    </div>
  </section>
</template>
