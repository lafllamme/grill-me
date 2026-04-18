<template>
  <section id="wall-of-shame" class="mx-auto max-w-7xl px-6 py-24">
    <div class="grid grid-cols-1 gap-16 lg:grid-cols-12">
      <div class="lg:col-span-7">
        <h2 class="mb-8 font-headline text-3xl font-black tracking-tight uppercase">Roast of the Day</h2>
        <article class="relative overflow-hidden rounded-2xl bg-surface-container-high p-12">
          <div class="absolute top-0 right-0 p-8 text-9xl font-black text-on-surface-variant/10 select-none">“</div>
          <div class="relative z-10">
            <div class="mb-8 flex items-center gap-4">
              <div class="h-16 w-16 rounded-full bg-gradient-to-br from-surface-container-highest to-surface-container-lowest" />
              <div>
                <p class="font-body text-lg font-bold">Senior Dev @ Big Tech</p>
                <p class="font-mono text-sm text-on-surface-variant">repo: microservice-hell</p>
              </div>
            </div>

            <blockquote class="mb-8 font-serif text-2xl leading-relaxed italic text-on-surface">
              "Grillme told me that my clean architecture was just a series of over-engineered nested folders containing empty interfaces and sadness. I haven't opened VS Code in three days."
            </blockquote>

            <div class="flex flex-wrap gap-2">
              <span class="bg-primary/10 px-2 py-1 font-display text-[10px] font-bold tracking-[0.1em] text-primary uppercase">Emotional Damage</span>
              <span class="bg-primary/10 px-2 py-1 font-display text-[10px] font-bold tracking-[0.1em] text-primary uppercase">Verified Roast</span>
            </div>
          </div>
        </article>
      </div>

      <div class="lg:col-span-5">
        <h2 class="mb-8 font-headline text-3xl font-black tracking-tight uppercase">Wall of Shame</h2>
        <div class="space-y-4">
          <article class="group flex cursor-pointer items-center justify-between bg-surface-container-low px-6 py-5 transition-colors hover:bg-surface-container-high">
            <div class="flex items-center gap-4">
              <span class="font-headline text-xl font-black text-primary">01</span>
              <div>
                <p class="font-headline font-bold tracking-tight">facebook-killer-final</p>
                <p class="font-display text-xs font-bold tracking-[0.12em] text-on-surface-variant uppercase">Destroyed 2m ago</p>
              </div>
            </div>
            <NuxtIcon class="text-[18px] text-on-surface-variant transition-colors group-hover:text-primary" name="ph:fire" />
          </article>

          <article class="group flex cursor-pointer items-center justify-between bg-surface-container-low px-6 py-5 transition-colors hover:bg-surface-container-high">
            <div class="flex items-center gap-4">
              <span class="font-headline text-xl font-black text-primary">02</span>
              <div>
                <p class="font-headline font-bold tracking-tight">ai-powered-todo-app</p>
                <p class="font-display text-xs font-bold tracking-[0.12em] text-on-surface-variant uppercase">Destroyed 14m ago</p>
              </div>
            </div>
            <NuxtIcon class="text-[18px] text-on-surface-variant transition-colors group-hover:text-primary" name="ph:fire" />
          </article>

          <article class="group flex cursor-pointer items-center justify-between bg-surface-container-low px-6 py-5 transition-colors hover:bg-surface-container-high">
            <div class="flex items-center gap-4">
              <span class="font-headline text-xl font-black text-primary">03</span>
              <div>
                <p class="font-headline font-bold tracking-tight">legacy-cobol-wrapper</p>
                <p class="font-display text-xs font-bold tracking-[0.12em] text-on-surface-variant uppercase">Destroyed 1h ago</p>
              </div>
            </div>
            <NuxtIcon class="text-[18px] text-on-surface-variant transition-colors group-hover:text-primary" name="ph:fire" />
          </article>
        </div>
      </div>
    </div>
  </section>
</template>
