<script setup lang="ts">
import { useHead, useSeoMeta } from '#imports'

interface ScaleSwatch {
  hex: string
  shade: string
  bgClass: string
  textClass: string
}

interface SemanticSwatch {
  name: string
  bgClass: string
  textClass: string
  note: string
  borderClass?: string
}

interface TypographySample {
  label: string
  className: string
  sample: string
}

interface MetricPreview {
  label: string
  value: string
  note: string
  accent?: boolean
}

const emberScale: ScaleSwatch[] = [
  { shade: '50', hex: '#faf6f5', bgClass: 'bg-ember-50', textClass: 'text-ember-950' },
  { shade: '100', hex: '#f6ebe9', bgClass: 'bg-ember-100', textClass: 'text-ember-950' },
  { shade: '200', hex: '#f1d5d0', bgClass: 'bg-ember-200', textClass: 'text-ember-950' },
  { shade: '300', hex: '#eeb1a5', bgClass: 'bg-ember-300', textClass: 'text-ember-950' },
  { shade: '400', hex: '#f27c64', bgClass: 'bg-ember-400', textClass: 'text-ember-950' },
  { shade: '500', hex: '#ff4925', bgClass: 'bg-ember-500', textClass: 'text-bone-50' },
  { shade: '600', hex: '#e12d09', bgClass: 'bg-ember-600', textClass: 'text-bone-50' },
  { shade: '700', hex: '#b6280c', bgClass: 'bg-ember-700', textClass: 'text-bone-50' },
  { shade: '800', hex: '#882511', bgClass: 'bg-ember-800', textClass: 'text-bone-50' },
  { shade: '900', hex: '#5d1f13', bgClass: 'bg-ember-900', textClass: 'text-bone-50' },
  { shade: '950', hex: '#38160f', bgClass: 'bg-ember-950', textClass: 'text-bone-50' },
]

const basaltScale: ScaleSwatch[] = [
  { shade: '50', hex: '#f5f4f2', bgClass: 'bg-basalt-50', textClass: 'text-basalt-950' },
  { shade: '100', hex: '#ece8e4', bgClass: 'bg-basalt-100', textClass: 'text-basalt-950' },
  { shade: '200', hex: '#d7d1cb', bgClass: 'bg-basalt-200', textClass: 'text-basalt-950' },
  { shade: '300', hex: '#b4aca5', bgClass: 'bg-basalt-300', textClass: 'text-basalt-950' },
  { shade: '400', hex: '#8d837a', bgClass: 'bg-basalt-400', textClass: 'text-basalt-950' },
  { shade: '500', hex: '#665d56', bgClass: 'bg-basalt-500', textClass: 'text-bone-50' },
  { shade: '600', hex: '#504943', bgClass: 'bg-basalt-600', textClass: 'text-bone-50' },
  { shade: '700', hex: '#3d3833', bgClass: 'bg-basalt-700', textClass: 'text-bone-50' },
  { shade: '800', hex: '#292522', bgClass: 'bg-basalt-800', textClass: 'text-bone-50' },
  { shade: '900', hex: '#181614', bgClass: 'bg-basalt-900', textClass: 'text-bone-50' },
  { shade: '950', hex: '#0f0e0d', bgClass: 'bg-basalt-950', textClass: 'text-bone-50' },
]

const boneScale: ScaleSwatch[] = [
  { shade: '50', hex: '#fffdf9', bgClass: 'bg-bone-50', textClass: 'text-bone-950' },
  { shade: '100', hex: '#fcf7f0', bgClass: 'bg-bone-100', textClass: 'text-bone-950' },
  { shade: '200', hex: '#f5ebdf', bgClass: 'bg-bone-200', textClass: 'text-bone-950' },
  { shade: '300', hex: '#ead8c6', bgClass: 'bg-bone-300', textClass: 'text-bone-950' },
  { shade: '400', hex: '#d8bfa8', bgClass: 'bg-bone-400', textClass: 'text-bone-950' },
  { shade: '500', hex: '#c1a68d', bgClass: 'bg-bone-500', textClass: 'text-bone-950' },
  { shade: '600', hex: '#a3846d', bgClass: 'bg-bone-600', textClass: 'text-bone-50' },
  { shade: '700', hex: '#856956', bgClass: 'bg-bone-700', textClass: 'text-bone-50' },
  { shade: '800', hex: '#685143', bgClass: 'bg-bone-800', textClass: 'text-bone-50' },
  { shade: '900', hex: '#47372f', bgClass: 'bg-bone-900', textClass: 'text-bone-50' },
  { shade: '950', hex: '#2a201b', bgClass: 'bg-bone-950', textClass: 'text-bone-50' },
]

const semanticSwatches: SemanticSwatch[] = [
  { name: 'background', bgClass: 'bg-background', textClass: 'text-on-background', note: 'page stage', borderClass: 'border border-divider' },
  { name: 'surface', bgClass: 'bg-surface', textClass: 'text-on-surface', note: 'base module shell', borderClass: 'border border-divider' },
  { name: 'surface-container-low', bgClass: 'bg-surface-container-low', textClass: 'text-on-surface', note: 'lowest panel', borderClass: 'border border-divider' },
  { name: 'surface-container', bgClass: 'bg-surface-container', textClass: 'text-on-surface', note: 'default panel', borderClass: 'border border-divider' },
  { name: 'surface-container-high', bgClass: 'bg-surface-container-high', textClass: 'text-on-surface', note: 'strong separation', borderClass: 'border border-divider' },
  { name: 'surface-container-highest', bgClass: 'bg-surface-container-highest', textClass: 'text-on-surface', note: 'top local surface', borderClass: 'border border-divider' },
  { name: 'surface-variant', bgClass: 'bg-surface-variant', textClass: 'text-on-surface', note: 'hard contrast shell', borderClass: 'border border-divider' },
  { name: 'surface-bright', bgClass: 'bg-surface-bright', textClass: 'text-bone-50', note: 'brightest structural dark', borderClass: 'border border-divider' },
  { name: 'primary', bgClass: 'bg-primary', textClass: 'text-background', note: 'active heat signal' },
  { name: 'primary-strong', bgClass: 'bg-primary-strong', textClass: 'text-basalt-950', note: 'brighter emphasis' },
  { name: 'primary-soft', bgClass: 'bg-primary-soft', textClass: 'text-primary', note: 'soft tint for chips', borderClass: 'border border-primary/16' },
  { name: 'primary-container', bgClass: 'bg-primary-container', textClass: 'text-on-primary-fixed', note: 'contained dark heat' },
  { name: 'primary-muted', bgClass: 'bg-primary-muted', textClass: 'text-primary', note: 'quiet heat wash', borderClass: 'border border-primary/12' },
  { name: 'glow', bgClass: 'bg-glow', textClass: 'text-primary', note: 'localized atmosphere', borderClass: 'border border-primary/16' },
]

const typographySamples: TypographySample[] = [
  { label: 'Display', className: 'font-display', sample: 'Your code should earn the heat.' },
  { label: 'Body', className: 'font-body', sample: 'The system needs restraint so the accent can feel expensive instead of loud.' },
  { label: 'Meta', className: 'font-meta', sample: 'queue=18s · state=armed · output=streaming' },
  { label: 'Accent', className: 'font-accent italic', sample: 'Design with colors you love.' },
]

const metrics: MetricPreview[] = [
  { label: 'Ego reduction rate', value: '98.4%', note: 'Primary only when the number needs heat.', accent: true },
  { label: 'System temp', value: 'critical', note: 'State stays readable on dark surfaces.' },
  { label: 'Cringes logged', value: '12.4M', note: 'Neutral shells carry the section, not orange.' },
]

useHead({
  title: 'Color Token Lab',
})

useSeoMeta({
  title: 'Color Token Lab',
  description: 'Final Ember, Basalt, and Bone token system for grillme.dev with raw scales, semantic tokens, and UI slices.',
})
</script>

<template>
  <div class="text-on-background bg-background min-h-[100dvh]">
    <div class="pointer-events-none inset-0 fixed overflow-hidden">
      <div class="rounded-full bg-primary/14 h-[26rem] w-[26rem] absolute blur-[120px] -right-20 -top-16" />
      <div class="rounded-full bg-primary-soft h-[20rem] w-[20rem] left-[-4rem] top-[28rem] absolute blur-[110px]" />
    </div>

    <main class="mx-auto px-6 pb-24 pt-20 max-w-[1280px] relative md:px-10">
      <section class="p-7 border border-divider rounded-[2rem] bg-surface md:p-10">
        <div class="gap-10 grid xl:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p class="text-[11px] text-on-surface-variant tracking-[0.22em] font-meta uppercase">
              final color system / dark first / one accent only
            </p>
            <h1 class="text-[clamp(3rem,6vw,6rem)] leading-[0.86] tracking-[-0.06em] font-display mt-5 max-w-[10ch]">
              Ember for heat.
              <span class="text-primary block">Basalt for structure.</span>
              <span class="text-bone-300 block">Bone for calm.</span>
            </h1>
            <p class="text-base text-bone-200 leading-relaxed font-body mt-6 max-w-[58ch] md:text-lg">
              This route is now the proving ground for the final token model. The product should read as black, bone, and restraint first. Orange only enters when the interface needs pressure.
            </p>
          </div>

          <div class="p-5 border border-divider rounded-[1.7rem] bg-surface-container md:p-6">
            <div class="flex flex-wrap gap-2">
              <span class="text-[10px] text-primary tracking-[0.18em] font-meta px-3 py-1 border border-primary/16 rounded-full bg-primary-soft uppercase">
                ember 500 anchor
              </span>
              <span class="text-[10px] text-on-surface-variant tracking-[0.18em] font-meta px-3 py-1 border border-divider rounded-full bg-surface-container-high uppercase">
                #ff4925
              </span>
            </div>

            <div class="mt-6 gap-4 grid md:grid-cols-2">
              <article class="p-4 border border-divider rounded-[1.4rem] bg-surface-container-low">
                <p class="text-[10px] text-on-surface-variant tracking-[0.16em] font-meta uppercase">
                  rule 01
                </p>
                <p class="text-xl text-on-surface leading-tight font-display mt-3">
                  Primary stays a signal.
                </p>
                <p class="text-sm text-on-surface-variant leading-relaxed font-body mt-3">
                  CTA, active state, one hero hit, selected controls, and focused metrics.
                </p>
              </article>

              <article class="p-4 border border-divider rounded-[1.4rem] bg-surface-container-low">
                <p class="text-[10px] text-on-surface-variant tracking-[0.16em] font-meta uppercase">
                  rule 02
                </p>
                <p class="text-xl text-on-surface leading-tight font-display mt-3">
                  Surfaces carry the page.
                </p>
                <p class="text-sm text-on-surface-variant leading-relaxed font-body mt-3">
                  Structure belongs to Basalt. Copy hierarchy belongs to Bone. Heat is not wallpaper anymore.
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section class="mt-8 gap-8 grid xl:grid-cols-[1.04fr_0.96fr]">
        <article class="p-6 border border-divider rounded-[2rem] bg-surface md:p-8">
          <div class="mb-6 flex gap-6 items-end justify-between">
            <div>
              <p class="text-[11px] text-on-surface-variant tracking-[0.18em] font-meta uppercase">
                raw family scales
              </p>
              <h2 class="text-3xl tracking-tight font-display mt-3 md:text-[3rem]">
                The raw palette.
              </h2>
            </div>
            <p class="text-[11px] text-on-surface-variant tracking-[0.16em] font-meta text-right uppercase">
              only these three
              <br>
              families exist
            </p>
          </div>

          <div class="space-y-5">
            <div>
              <div class="mb-3 flex gap-4 items-center justify-between">
                <h3 class="text-xl tracking-tight font-display">
                  Ember
                </h3>
                <p class="text-[11px] text-primary tracking-[0.18em] font-meta uppercase">
                  500 = #ff4925
                </p>
              </div>
              <div class="gap-3 grid lg:grid-cols-4 sm:grid-cols-2 xl:grid-cols-3">
                <div v-for="swatch in emberScale" :key="`ember-${swatch.shade}`" :class="[swatch.bgClass, swatch.textClass]" class="px-3 py-4 rounded-[1.1rem] flex flex-col min-h-22 justify-between">
                  <div class="flex gap-3 items-start justify-between">
                    <span class="text-[10px] tracking-[0.16em] font-meta uppercase">Ember</span>
                    <span class="text-base leading-none font-display">{{ swatch.shade }}</span>
                  </div>
                  <span class="text-sm tracking-[0.08em] font-meta opacity-80">{{ swatch.hex }}</span>
                </div>
              </div>
            </div>

            <div>
              <div class="mb-3 flex gap-4 items-center justify-between">
                <h3 class="text-xl tracking-tight font-display">
                  Basalt
                </h3>
                <p class="text-[11px] text-on-surface-variant tracking-[0.18em] font-meta uppercase">
                  structural dark neutral
                </p>
              </div>
              <div class="gap-3 grid lg:grid-cols-4 sm:grid-cols-2 xl:grid-cols-3">
                <div v-for="swatch in basaltScale" :key="`basalt-${swatch.shade}`" :class="[swatch.bgClass, swatch.textClass]" class="px-3 py-4 rounded-[1.1rem] flex flex-col min-h-22 justify-between">
                  <div class="flex gap-3 items-start justify-between">
                    <span class="text-[10px] tracking-[0.16em] font-meta uppercase">Basalt</span>
                    <span class="text-base leading-none font-display">{{ swatch.shade }}</span>
                  </div>
                  <span class="text-sm tracking-[0.08em] font-meta opacity-80">{{ swatch.hex }}</span>
                </div>
              </div>
            </div>

            <div>
              <div class="mb-3 flex gap-4 items-center justify-between">
                <h3 class="text-xl tracking-tight font-display">
                  Bone
                </h3>
                <p class="text-[11px] text-on-surface-variant tracking-[0.18em] font-meta uppercase">
                  warm editorial neutral
                </p>
              </div>
              <div class="gap-3 grid lg:grid-cols-4 sm:grid-cols-2 xl:grid-cols-3">
                <div v-for="swatch in boneScale" :key="`bone-${swatch.shade}`" :class="[swatch.bgClass, swatch.textClass]" class="px-3 py-4 border border-bone-200/40 rounded-[1.1rem] flex flex-col min-h-22 justify-between">
                  <div class="flex gap-3 items-start justify-between">
                    <span class="text-[10px] tracking-[0.16em] font-meta uppercase">Bone</span>
                    <span class="text-base leading-none font-display">{{ swatch.shade }}</span>
                  </div>
                  <span class="text-sm tracking-[0.08em] font-meta opacity-80">{{ swatch.hex }}</span>
                </div>
              </div>
            </div>
          </div>
        </article>

        <article class="p-6 border border-divider rounded-[2rem] bg-surface md:p-8">
          <p class="text-[11px] text-on-surface-variant tracking-[0.18em] font-meta uppercase">
            semantic token layer
          </p>
          <h2 class="text-3xl tracking-tight font-display mt-3 md:text-[3rem]">
            Components should live here.
          </h2>
          <p class="text-base text-bone-200 leading-relaxed font-body mt-4 max-w-[52ch]">
            Raw scales exist for reference. Product UI should use semantic tokens so the language stays consistent when the brand evolves.
          </p>

          <div class="mt-6 gap-3 grid sm:grid-cols-2">
            <article v-for="swatch in semanticSwatches" :key="swatch.name" :class="[swatch.bgClass, swatch.textClass, swatch.borderClass]" class="p-4 rounded-[1.3rem] min-h-28">
              <p class="text-[10px] tracking-[0.16em] font-meta opacity-80 uppercase">
                {{ swatch.name }}
              </p>
              <p class="text-lg leading-tight font-display mt-3">
                {{ swatch.name }}
              </p>
              <p class="text-sm leading-relaxed font-body mt-3 opacity-80">
                {{ swatch.note }}
              </p>
            </article>
          </div>
        </article>
      </section>

      <section class="mt-8 p-6 border border-divider rounded-[2rem] bg-surface md:p-8">
        <div class="mb-6 max-w-[58ch]">
          <p class="text-[11px] text-on-surface-variant tracking-[0.18em] font-meta uppercase">
            typography pressure check
          </p>
          <h2 class="text-3xl tracking-tight font-display mt-3 md:text-[3rem]">
            Type should survive with less orange.
          </h2>
          <p class="text-base text-bone-200 leading-relaxed font-body mt-4 md:text-lg">
            If the interface collapses without broad orange fills, the hierarchy was fake. This section checks the final font system inside the new color model.
          </p>
        </div>

        <div class="gap-4 grid lg:grid-cols-4">
          <article v-for="sample in typographySamples" :key="sample.label" class="p-5 border border-divider rounded-[1.6rem] bg-surface-container">
            <p class="text-[10px] text-on-surface-variant tracking-[0.16em] font-meta uppercase">
              {{ sample.label }}
            </p>
            <p :class="sample.className" class="text-[1.35rem] text-on-surface leading-tight mt-4 md:text-[1.8rem]">
              {{ sample.sample }}
            </p>
          </article>
        </div>
      </section>

      <section class="mt-8 gap-8 grid xl:grid-cols-[0.9fr_1.1fr]">
        <article class="border border-divider rounded-[2rem] bg-surface overflow-hidden">
          <div class="px-5 py-4 border-b border-divider bg-surface-container md:px-6">
            <div class="flex gap-4 items-center justify-between">
              <div class="flex gap-3 items-center">
                <span class="rounded-full bg-primary h-2.5 w-2.5" />
                <span class="text-base text-on-surface tracking-tight font-display">Grillme</span>
              </div>
              <nav class="gap-2 hidden md:flex">
                <span class="text-[10px] text-on-surface-variant tracking-[0.16em] font-meta px-3 py-2 uppercase">Leaderboard</span>
                <span class="text-[10px] text-primary tracking-[0.16em] font-meta px-3 py-2 border border-primary/16 rounded-full bg-primary-soft uppercase">Metrics</span>
                <span class="text-[10px] text-on-surface-variant tracking-[0.16em] font-meta px-3 py-2 uppercase">API</span>
              </nav>
            </div>
          </div>
          <div class="px-5 py-6 md:px-6 md:py-8">
            <p class="text-[clamp(2.4rem,5vw,4.4rem)] leading-[0.88] tracking-[-0.05em] font-display uppercase">
              YOUR CODE IS
              <span class="text-primary block">GARBAGE.</span>
            </p>
            <p class="text-base text-bone-200 leading-relaxed font-body mt-5 max-w-[34ch]">
              The hero keeps one hot line. The rest of the hierarchy stays grounded in structure and copy contrast.
            </p>
          </div>
        </article>

        <article class="p-6 border border-divider rounded-[2rem] bg-surface md:p-7">
          <p class="text-[10px] text-on-surface-variant tracking-[0.16em] font-meta uppercase">
            quote and input slice
          </p>
          <div class="mt-5 gap-4 grid lg:grid-cols-[1.1fr_0.9fr]">
            <div class="p-5 border border-divider rounded-[1.6rem] bg-surface-container md:p-6">
              <p class="text-[10px] text-on-surface-variant tracking-[0.16em] font-meta uppercase">
                editorial block
              </p>
              <p class="text-[1.35rem] text-on-surface leading-relaxed font-accent mt-5 italic md:text-[1.75rem]">
                “The interface can be funny. The system still has to look like it knows what it is doing.”
              </p>
              <p class="text-sm text-on-surface-variant leading-relaxed font-body mt-5 md:text-base">
                Accent type keeps the editorial moment. It no longer needs a giant orange field behind it.
              </p>
            </div>

            <div class="p-5 border border-divider rounded-[1.6rem] bg-surface-container-high flex flex-col md:p-6">
              <p class="text-[10px] text-on-surface-variant tracking-[0.16em] font-meta uppercase">
                cta and form state
              </p>
              <label class="text-base text-on-surface tracking-tight font-display mt-5">GitHub Username</label>
              <div class="mt-3 px-4 py-3 border border-divider rounded-full bg-surface-container-low">
                <span class="text-on-surface-variant font-body">@torvalds</span>
              </div>
              <button class="text-[11px] text-background tracking-[0.18em] font-meta mt-5 px-4 py-3 rounded-full bg-primary uppercase transition-transform active:scale-[0.98]">
                Start roast
              </button>
              <div class="mt-5 border border-primary/16 rounded-full bg-primary-soft h-2 overflow-hidden">
                <div class="rounded-full bg-primary h-full w-[38%]" />
              </div>
              <p class="text-[11px] text-on-surface-variant tracking-[0.16em] font-meta mt-3 uppercase">
                heat level / medium rare
              </p>
            </div>
          </div>
        </article>
      </section>

      <section class="mt-8 p-6 border border-divider rounded-[2rem] bg-surface md:p-8">
        <div class="mb-6 max-w-[56ch]">
          <p class="text-[11px] text-on-surface-variant tracking-[0.18em] font-meta uppercase">
            metrics pressure check
          </p>
          <h2 class="text-3xl tracking-tight font-display mt-3 md:text-[3rem]">
            Heat appears where it matters.
          </h2>
          <p class="text-base text-bone-200 leading-relaxed font-body mt-4 md:text-lg">
            This section validates scarcity. Not every stat gets orange. The accent should feel valuable because it is used selectively.
          </p>
        </div>

        <div class="gap-4 grid lg:grid-cols-3">
          <article v-for="metric in metrics" :key="metric.label" class="p-5 border border-divider rounded-[1.7rem] bg-surface-container md:p-6">
            <p class="text-[10px] text-on-surface-variant tracking-[0.16em] font-meta uppercase">
              {{ metric.label }}
            </p>
            <p :class="metric.accent ? 'text-primary' : 'text-on-surface'" class="text-[2.4rem] leading-none tracking-tight font-display mt-5 uppercase md:text-[3.1rem]">
              {{ metric.value }}
            </p>
            <p class="text-sm text-on-surface-variant leading-relaxed font-body mt-4 md:text-base">
              {{ metric.note }}
            </p>
          </article>
        </div>
      </section>
    </main>
  </div>
</template>
