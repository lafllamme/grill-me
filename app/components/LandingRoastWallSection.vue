<template>
  <section id="wall-of-shame" class="mx-auto px-6 py-24 max-w-7xl">
    <div class="gap-16 grid grid-cols-1 lg:grid-cols-12">
      <div class="lg:col-span-7">
        <h2 class="text-3xl tracking-tight font-black font-headline mb-8 uppercase">
          Roast of the Day
        </h2>
        <article class="p-12 rounded-2xl bg-black relative overflow-hidden">
          <div class="text-9xl text-on-surface-variant/10 font-black p-8 select-none right-0 top-0 absolute">
            “
          </div>
          <div class="relative z-10">
            <div class="mb-8 flex gap-4 items-center">
              <div class="rounded-full bg-black h-16 w-16" />
              <div>
                <p class="text-lg font-body font-bold">
                  Senior Dev @ Big Tech
                </p>
                <p class="text-sm text-on-surface-variant font-mono">
                  repo: microservice-hell
                </p>
              </div>
            </div>

            <blockquote class="text-2xl text-on-surface leading-relaxed font-serif mb-8 italic">
              "Grillme told me that my clean architecture was just a series of over-engineered nested folders containing empty interfaces and sadness. I haven't opened VS Code in three days."
            </blockquote>

            <div class="flex flex-wrap gap-2">
              <span class="text-[10px] text-on-surface tracking-[0.1em] font-bold font-display px-2 py-1 bg-primary/20 uppercase">Emotional Damage</span>
              <span class="text-[10px] text-on-surface tracking-[0.1em] font-bold font-display px-2 py-1 bg-primary/20 uppercase">Verified Roast</span>
            </div>
          </div>
        </article>
      </div>

      <div class="lg:col-span-5">
        <h2 class="text-3xl tracking-tight font-black font-headline mb-8 uppercase">
          Wall of Shame
        </h2>
        <div class="space-y-4">
          <article class="group px-6 py-5 bg-black flex cursor-pointer transition-colors items-center justify-between hover:bg-black">
            <div class="flex gap-4 items-center">
              <span class="text-xl text-primary font-black font-headline">01</span>
              <div>
                <p class="tracking-tight font-bold font-headline">
                  facebook-killer-final
                </p>
                <p class="text-xs text-on-surface-variant tracking-[0.12em] font-bold font-display uppercase">
                  Destroyed 2m ago
                </p>
              </div>
            </div>
            <Icon class="text-[18px] text-on-surface-variant transition-colors group-hover:text-primary" name="ph:fire" />
          </article>

          <article class="group px-6 py-5 bg-black flex cursor-pointer transition-colors items-center justify-between hover:bg-black">
            <div class="flex gap-4 items-center">
              <span class="text-xl text-primary font-black font-headline">02</span>
              <div>
                <p class="tracking-tight font-bold font-headline">
                  ai-powered-todo-app
                </p>
                <p class="text-xs text-on-surface-variant tracking-[0.12em] font-bold font-display uppercase">
                  Destroyed 14m ago
                </p>
              </div>
            </div>
            <Icon class="text-[18px] text-on-surface-variant transition-colors group-hover:text-primary" name="ph:fire" />
          </article>

          <article class="group px-6 py-5 bg-black flex cursor-pointer transition-colors items-center justify-between hover:bg-black">
            <div class="flex gap-4 items-center">
              <span class="text-xl text-primary font-black font-headline">03</span>
              <div>
                <p class="tracking-tight font-bold font-headline">
                  legacy-cobol-wrapper
                </p>
                <p class="text-xs text-on-surface-variant tracking-[0.12em] font-bold font-display uppercase">
                  Destroyed 1h ago
                </p>
              </div>
            </div>
            <Icon class="text-[18px] text-on-surface-variant transition-colors group-hover:text-primary" name="ph:fire" />
          </article>
        </div>
      </div>
    </div>
  </section>
</template>
