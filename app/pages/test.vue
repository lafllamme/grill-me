<script setup lang="ts">
import { useHead, useSeoMeta } from '#imports'

interface RolePreviewRow {
  label: string
  fontClass: string
  sample: string
}

const rolePreviewRows: RolePreviewRow[] = [
  { label: 'Display', fontClass: 'font-display', sample: 'Your code deserves a colder headline.' },
  { label: 'Body', fontClass: 'font-body', sample: 'The interface copy has to stay credible while the brand keeps its heat.' },
  { label: 'Meta', fontClass: 'font-meta', sample: 'score=74.2 | queue=18s | receipt=signed' },
  { label: 'Accent', fontClass: 'font-accent', sample: 'Not louder. Sharper.' },
]

useHead({
  title: 'Font Playground',
})

useSeoMeta({
  title: 'Font Playground',
  description: 'A focused final typography check for grillme.dev using Bricolage Grotesque, General Sans, Azeret Mono, and Zodiak.',
})
</script>

<template>
  <div class="text-on-surface pt-16 bg-background min-h-[100dvh]">
    <div class="pointer-events-none inset-0 fixed overflow-hidden">
      <div class="bg-[radial-gradient(circle_at_top,_rgba(255,51,0,0.18),_transparent_44%)] h-[34rem] w-[34rem] absolute blur-3xl -right-24 -top-24" />
      <div class="bg-[radial-gradient(circle_at_bottom_left,_rgba(255,255,255,0.05),_transparent_36%)] h-[28rem] w-[28rem] absolute blur-3xl -bottom-12 -left-10" />
    </div>

    <main class="mx-auto px-6 pb-20 pt-8 max-w-[1240px] relative md:px-10">
      <section class="mb-8 p-6 border border-divider/70 rounded-[2rem] bg-surface/70 shadow-[0_30px_120px_rgba(0,0,0,0.18)] backdrop-blur-sm md:p-8">
        <div class="gap-8 grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p class="text-[11px] text-primary tracking-[0.22em] font-meta mb-4 uppercase">
              type system / final verification / 1 system
            </p>
            <h1 class="text-[clamp(2.8rem,6vw,5.6rem)] leading-[0.9] tracking-[-0.045em] font-display max-w-[9ch]">
              Final read. No switches. No noise.
            </h1>
            <p class="text-base text-on-surface-variant leading-relaxed font-body mt-5 max-w-[54ch] md:text-lg">
              This is the locked shortlist: Bricolage for display, General Sans for body, Azeret Mono for technical strings, and Zodiak for editorial lift.
            </p>
          </div>

          <div>
            <div class="mb-5 flex gap-6 items-start justify-between">
              <div>
                <p class="text-[10px] text-on-surface-variant tracking-[0.18em] font-meta uppercase">
                  active system
                </p>
                <h2 class="text-3xl tracking-tight font-display mt-2 md:text-[2.8rem]">
                  Bricolage / General Sans / Azeret Mono / Zodiak
                </h2>
                <p class="text-sm text-on-surface-variant font-body mt-3 md:text-base">
                  Final locked system check. Strong headline tension, calm reading layer, precise technical strings, and a premium serif accent.
                </p>
              </div>

              <p class="text-[10px] text-primary leading-none tracking-[0.18em] font-meta text-right shrink-0 uppercase">
                locked
                <br>
                selection
              </p>
            </div>

            <div class="mt-5 gap-3 grid grid-cols-2 md:grid-cols-4">
              <div class="p-4 border border-divider/70 rounded-[1.2rem] bg-background/35">
                <p class="text-[10px] text-on-surface-variant tracking-[0.16em] font-meta uppercase">
                  display
                </p>
                <p class="text-base leading-tight font-display mt-2">
                  Bricolage Grotesque
                </p>
              </div>

              <div class="p-4 border border-divider/70 rounded-[1.2rem] bg-background/35">
                <p class="text-[10px] text-on-surface-variant tracking-[0.16em] font-meta uppercase">
                  body
                </p>
                <p class="text-base leading-tight font-body mt-2">
                  General Sans
                </p>
              </div>

              <div class="p-4 border border-divider/70 rounded-[1.2rem] bg-background/35">
                <p class="text-[10px] text-on-surface-variant tracking-[0.16em] font-meta uppercase">
                  meta
                </p>
                <p class="text-base leading-tight font-meta mt-2">
                  Azeret Mono
                </p>
              </div>

              <div class="p-4 border border-divider/70 rounded-[1.2rem] bg-background/35">
                <p class="text-[10px] text-on-surface-variant tracking-[0.16em] font-meta uppercase">
                  accent
                </p>
                <p class="text-base leading-tight font-accent mt-2">
                  Zodiak
                </p>
              </div>
            </div>

            <div class="mt-4 p-4 border border-primary/25 rounded-[1.2rem] bg-primary/6">
              <p class="text-[10px] text-primary tracking-[0.16em] font-meta uppercase">
                why this mix
              </p>
              <p class="text-sm text-on-surface-variant leading-relaxed font-body mt-3 md:text-base">
                Display keeps the original brand tension. Body stays smooth and modern. Mono carries the technical strings with more intent. Accent brings the quotes and pull-lines into a premium editorial register.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="mb-8 p-6 border border-divider/70 rounded-[2rem] bg-surface/65 md:p-8">
        <div class="mb-6 max-w-[58ch]">
          <p class="text-[11px] text-primary tracking-[0.18em] font-meta uppercase">
            real headline check
          </p>
          <p class="text-sm text-on-surface-variant leading-relaxed font-body mt-4 md:text-base">
            These two lines carry the decision. If a system fails here, it does not deserve a broader rollout.
          </p>
        </div>

        <div class="gap-5 grid grid-cols-1 lg:grid-cols-2">
          <article class="border border-divider/70 rounded-[1.8rem] bg-background/50 overflow-hidden">
            <div class="px-5 py-4 border-b border-divider/70 md:px-6">
              <p class="text-[10px] text-primary tracking-[0.16em] font-meta uppercase">
                entry overlay
              </p>
            </div>
            <div class="px-5 py-6 md:px-6 md:py-8">
              <p class="text-[clamp(2rem,5vw,4rem)] text-on-surface leading-[0.88] tracking-normal font-black font-display">
                Are you sure
                <br>
                you wanna
                <br>
                <span class="text-primary">enter ?</span>
              </p>
            </div>
          </article>

          <article class="border border-divider/70 rounded-[1.8rem] bg-background/50 overflow-hidden">
            <div class="px-5 py-4 border-b border-divider/70 md:px-6">
              <p class="text-[10px] text-primary tracking-[0.16em] font-meta uppercase">
                landing hero
              </p>
            </div>
            <div class="px-5 py-6 md:px-6 md:py-8">
              <p class="text-[clamp(2.1rem,5vw,4.2rem)] text-on-surface leading-[0.88] tracking-normal font-black font-display uppercase">
                YOUR CODE IS
                <br>
                <span class="text-primary">GARBAGE.</span>
              </p>
            </div>
          </article>
        </div>
      </section>

      <section class="gap-5 grid grid-cols-1 lg:grid-cols-[0.88fr_1.12fr]">
        <article class="p-6 border border-divider/70 rounded-[2rem] bg-surface-container-low/85 md:p-7">
          <p class="text-[10px] text-primary tracking-[0.16em] font-meta uppercase">
            quote check
          </p>
          <p class="text-[1.3rem] text-on-surface leading-relaxed font-accent mt-5 italic md:text-[1.55rem]">
            “The headline can have teeth. The interface still has to sound like it knows what it is doing.”
          </p>
          <p class="text-sm text-on-surface-variant font-body mt-5 md:text-base">
            This is the accent-role test. Too weak and it disappears. Too loud and the product starts acting.
          </p>
          <div class="mt-6 pt-4 border-t border-divider/70">
            <p class="text-[11px] text-on-surface-variant tracking-[0.15em] font-meta uppercase">
              accent: Zodiak
            </p>
          </div>
        </article>

        <div class="gap-4 grid grid-cols-1 md:grid-cols-2">
          <article
            v-for="row in rolePreviewRows"
            :key="row.label"
            class="p-5 border border-divider/70 rounded-[1.7rem] bg-surface/60"
          >
            <p class="text-[10px] text-primary tracking-[0.16em] font-meta uppercase">
              {{ row.label }}
            </p>
            <p :class="row.fontClass" class="text-xl leading-tight mt-4 md:text-[1.7rem]">
              {{ row.sample }}
            </p>
          </article>

          <article class="p-5 border border-divider/70 rounded-[1.7rem] bg-surface/60 md:col-span-2">
            <p class="text-[10px] text-primary tracking-[0.16em] font-meta uppercase">
              bento check
            </p>
            <div class="mt-4 gap-5 grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr]">
              <div>
                <h3 class="text-[2rem] leading-[0.95] font-display md:text-[2.5rem]">
                  A strong headline only works if the product copy still sounds precise after it lands.
                </h3>
                <p class="text-base text-on-surface-variant leading-relaxed font-body mt-4 md:text-lg">
                  This is the real pressure test. The display font should create tension, while the body font keeps the product from drifting into pure performance.
                </p>
              </div>

              <div class="p-4 border border-divider/70 rounded-[1.4rem] bg-background/45">
                <p class="text-[10px] text-on-surface-variant tracking-[0.16em] font-meta uppercase">
                  metric read
                </p>
                <p class="text-[2.8rem] text-primary leading-none font-display mt-4">
                  4 roles
                </p>
                <p class="text-[11px] text-on-surface-variant tracking-[0.14em] font-meta mt-3 uppercase">
                  display / body / mono / accent
                </p>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  </div>
</template>
