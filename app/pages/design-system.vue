<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useHead, useSeoMeta } from '#imports'

interface ScaleSwatch {
  shade: string
  hex: string
  bgClass: string
  textClass: string
}

interface TypographySample {
  label: string
  role: string
  className: string
  sampleClass: string
  sample: string
}

interface DarkPattern {
  name: string
  mood: string
  stageClass: string
  contextClass: string
  cardClass: string
  stageHex: string
  contextHex: string
  cardHex: string
  copyClass: string
  mutedClass: string
  buttonClass: string
}

function getRelativeLuminance(hex: string) {
  const channels = hex.slice(1).match(/../g)?.map(channel => Number.parseInt(channel, 16) / 255) ?? [0, 0, 0]
  const linearChannels = channels.map(channel => channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
  return 0.2126 * linearChannels[0]! + 0.7152 * linearChannels[1]! + 0.0722 * linearChannels[2]!
}

function getSurfaceContrast(pattern: DarkPattern) {
  const stageLuminance = getRelativeLuminance(pattern.stageHex)
  const cardLuminance = getRelativeLuminance(pattern.cardHex)
  return `${((Math.max(stageLuminance, cardLuminance) + 0.05) / (Math.min(stageLuminance, cardLuminance) + 0.05)).toFixed(2)}:1`
}

interface PatternSection {
  id: 'dark' | 'light'
  label: string
  title: string
  description: string
  patterns: DarkPattern[]
  emptyMessage?: string
}

const signalRedScale: ScaleSwatch[] = [
  { shade: '50', hex: '#fff1f1', bgClass: 'bg-signal-red-50', textClass: 'text-signal-red-950' },
  { shade: '100', hex: '#ffe1e2', bgClass: 'bg-signal-red-100', textClass: 'text-signal-red-950' },
  { shade: '200', hex: '#ffc7c9', bgClass: 'bg-signal-red-200', textClass: 'text-signal-red-950' },
  { shade: '300', hex: '#ffa0a4', bgClass: 'bg-signal-red-300', textClass: 'text-signal-red-950' },
  { shade: '400', hex: '#ff6b72', bgClass: 'bg-signal-red-400', textClass: 'text-signal-red-950' },
  { shade: '500', hex: '#f0444d', bgClass: 'bg-signal-red-500', textClass: 'text-bone-50' },
  { shade: '600', hex: '#d92d36', bgClass: 'bg-signal-red-600', textClass: 'text-bone-50' },
  { shade: '700', hex: '#b91f2b', bgClass: 'bg-signal-red-700', textClass: 'text-bone-50' },
  { shade: '800', hex: '#981b27', bgClass: 'bg-signal-red-800', textClass: 'text-bone-50' },
  { shade: '900', hex: '#7e1d26', bgClass: 'bg-signal-red-900', textClass: 'text-bone-50' },
  { shade: '950', hex: '#450a0f', bgClass: 'bg-signal-red-950', textClass: 'text-bone-50' },
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

const paletteFamilies = [
  { name: 'Signal Red', token: 'signal-red', description: 'one active signal', swatches: signalRedScale },
  { name: 'Basalt', token: 'basalt', description: 'structure and depth', swatches: basaltScale },
  { name: 'Bone', token: 'bone', description: 'warm contrast', swatches: boneScale },
]

const typographySamples: TypographySample[] = [
  { label: 'Display', role: 'General Sans · expressive UI', className: 'font-display', sampleClass: 'text-4xl tracking-[-0.06em] md:text-6xl', sample: 'Make the hierarchy obvious.' },
  { label: 'Body', role: 'General Sans · readable copy', className: 'font-body', sampleClass: 'text-xl leading-tight tracking-[-0.03em] md:text-3xl', sample: 'Clear structure gives every color a job.' },
  { label: 'Meta', role: 'Azeret Mono · data and status', className: 'font-meta', sampleClass: 'text-lg tracking-[-0.04em] md:text-3xl', sample: 'state=ready · score=78 · v1.0' },
  { label: 'Accent', role: 'Bricolage Grotesque · rare quotes', className: 'font-accent italic', sampleClass: 'text-3xl tracking-[-0.04em] md:text-5xl', sample: 'Taste is a constraint.' },
]

const allPatterns: DarkPattern[] = [
  { name: 'Void Ink', mood: 'pure, sharp, cinematic', stageClass: 'bg-[#050505]', contextClass: 'bg-[#0b0b0c]', cardClass: 'bg-[#151517]', stageHex: '#050505', contextHex: '#0b0b0c', cardHex: '#151517', copyClass: 'text-[#f7f3ee]', mutedClass: 'text-[#a9a29b]', buttonClass: 'bg-[#f7f3ee] text-[#050505]' },
  { name: 'Black Graphite', mood: 'quiet, premium, focused', stageClass: 'bg-[#080808]', contextClass: 'bg-[#151515]', cardClass: 'bg-[#202022]', stageHex: '#080808', contextHex: '#151515', cardHex: '#202022', copyClass: 'text-[#f8f5ef]', mutedClass: 'text-[#aaa5a0]', buttonClass: 'bg-[#d9d5cf] text-[#080808]' },
  { name: 'Dashboard Basalt', mood: 'warm, familiar, calmer', stageClass: 'bg-[#0f0e0d]', contextClass: 'bg-[#181614]', cardClass: 'bg-[#211d1a]', stageHex: '#0f0e0d', contextHex: '#181614', cardHex: '#211d1a', copyClass: 'text-[#fffdf9]', mutedClass: 'text-[#d8bfa8]', buttonClass: 'bg-[#f5ebdf] text-[#0f0e0d]' },
  { name: 'Dashboard Explorer', mood: 'warm basalt, soft separation', stageClass: 'bg-[#0f0e0d]', contextClass: 'bg-[#1a1715]', cardClass: 'bg-[#181614]', stageHex: '#0f0e0d', contextHex: '#1a1715', cardHex: '#181614', copyClass: 'text-[#fffdf9]', mutedClass: 'text-[#d8bfa8]', buttonClass: 'bg-[#f5ebdf] text-[#0f0e0d]' },
  { name: 'Mauve Chamber', mood: 'soft black, warm lift', stageClass: 'bg-[#151211]', contextClass: 'bg-[#211b1a]', cardClass: 'bg-[#302725]', stageHex: '#151211', contextHex: '#211b1a', cardHex: '#302725', copyClass: 'text-[#fff7f0]', mutedClass: 'text-[#d4b9aa]', buttonClass: 'bg-[#f5e5da] text-[#151211]' },
  { name: 'Redline Deep', mood: 'pressure, not decoration', stageClass: 'bg-[#100506]', contextClass: 'bg-[#1d0b0d]', cardClass: 'bg-[#321417]', stageHex: '#100506', contextHex: '#1d0b0d', cardHex: '#321417', copyClass: 'text-[#fff5f1]', mutedClass: 'text-[#d4a9a5]', buttonClass: 'bg-[#f0444d] text-[#220609]' },
  { name: 'Charcoal Mist', mood: 'neutral, tactile, restrained', stageClass: 'bg-[#111214]', contextClass: 'bg-[#1b1c1e]', cardClass: 'bg-[#292b2e]', stageHex: '#111214', contextHex: '#1b1c1e', cardHex: '#292b2e', copyClass: 'text-[#ffffff]', mutedClass: 'text-[#a1a1aa]', buttonClass: 'bg-[#e6e6e6] text-[#292b2e]' },
  { name: 'Soft Carbon', mood: 'low contrast, calm density', stageClass: 'bg-[#1b1918]', contextClass: 'bg-[#24211f]', cardClass: 'bg-[#312c29]', stageHex: '#1b1918', contextHex: '#24211f', cardHex: '#312c29', copyClass: 'text-[#fffaf5]', mutedClass: 'text-[#c6b8ae]', buttonClass: 'bg-[#d8bfa8] text-[#1b1918]' },
  { name: 'Black Bone Focus', mood: 'hard stage, one bright verdict', stageClass: 'bg-[#000000]', contextClass: 'bg-[#11100f]', cardClass: 'bg-[#fffdf9]', stageHex: '#000000', contextHex: '#11100f', cardHex: '#fffdf9', copyClass: 'text-[#11100f]', mutedClass: 'text-[#665d56]', buttonClass: 'bg-[#b91f2b] text-[#fffdf9]' },
  { name: 'Void Whisper', mood: 'ink with a softer edge', stageClass: 'bg-[#050505]', contextClass: 'bg-[#0b0b0b]', cardClass: 'bg-[#111112]', stageHex: '#050505', contextHex: '#0b0b0b', cardHex: '#111112', copyClass: 'text-[#f7f3ee]', mutedClass: 'text-[#9f9993]', buttonClass: 'bg-[#e5dfd8] text-[#050505]' },
  { name: 'Graphite Hush', mood: 'neutral, low attention', stageClass: 'bg-[#0b0b0b]', contextClass: 'bg-[#111112]', cardClass: 'bg-[#171718]', stageHex: '#0b0b0b', contextHex: '#111112', cardHex: '#171718', copyClass: 'text-[#f8f5ef]', mutedClass: 'text-[#9d9995]', buttonClass: 'bg-[#d9d5cf] text-[#0b0b0b]' },
  { name: 'Basalt Quiet', mood: 'warm structure, less contrast', stageClass: 'bg-[#0f0e0d]', contextClass: 'bg-[#181614]', cardClass: 'bg-[#1a1715]', stageHex: '#0f0e0d', contextHex: '#181614', cardHex: '#1a1715', copyClass: 'text-[#fffdf9]', mutedClass: 'text-[#cbb5a2]', buttonClass: 'bg-[#ead8c6] text-[#0f0e0d]' },
  { name: 'Explorer Soft', mood: 'warm stage, barely lifted card', stageClass: 'bg-[#131211]', contextClass: 'bg-[#181614]', cardClass: 'bg-[#1a1715]', stageHex: '#131211', contextHex: '#181614', cardHex: '#1a1715', copyClass: 'text-[#fffdf9]', mutedClass: 'text-[#cbb5a2]', buttonClass: 'bg-[#ead8c6] text-[#131211]' },
  { name: 'Paper Snow', mood: 'soft white stage, lifted card', stageClass: 'bg-[#f4f5f3]', contextClass: 'bg-[#f8f9f7]', cardClass: 'bg-white', stageHex: '#f4f5f3', contextHex: '#f8f9f7', cardHex: '#ffffff', copyClass: 'text-[#1a211e]', mutedClass: 'text-[#4e4e4e]', buttonClass: 'bg-[#1a211e] text-white' },
  { name: 'Cloud Slate', mood: 'cool cloud stage, lifted card', stageClass: 'bg-[#edf0f0]', contextClass: 'bg-[#f4f6f6]', cardClass: 'bg-[#fbfcfc]', stageHex: '#edf0f0', contextHex: '#f4f6f6', cardHex: '#fbfcfc', copyClass: 'text-[#1a211e]', mutedClass: 'text-[#4e4e4e]', buttonClass: 'bg-[#1a211e] text-white' },
  { name: 'White Stone', mood: 'mineral stage, clean card', stageClass: 'bg-[#f0f0ee]', contextClass: 'bg-[#f7f7f4]', cardClass: 'bg-[#fdfcf9]', stageHex: '#f0f0ee', contextHex: '#f7f7f4', cardHex: '#fdfcf9', copyClass: 'text-[#181614]', mutedClass: 'text-[#665d56]', buttonClass: 'bg-[#b91f2b] text-white' },
  { name: 'Silver Cloud', mood: 'cool silver stage, crisp card', stageClass: 'bg-[#e9ecef]', contextClass: 'bg-[#f2f4f5]', cardClass: 'bg-[#f9fafb]', stageHex: '#e9ecef', contextHex: '#f2f4f5', cardHex: '#f9fafb', copyClass: 'text-[#181614]', mutedClass: 'text-[#4e4e4e]', buttonClass: 'bg-[#1a211e] text-white' },
  { name: 'Chalk Graphite', mood: 'chalk stage, bright card', stageClass: 'bg-[#ebeae7]', contextClass: 'bg-[#f4f3ef]', cardClass: 'bg-[#faf9f6]', stageHex: '#ebeae7', contextHex: '#f4f3ef', cardHex: '#faf9f6', copyClass: 'text-[#181614]', mutedClass: 'text-[#665d56]', buttonClass: 'bg-[#b91f2b] text-white' },
  { name: 'Bone Graphite', mood: 'warm paper stage, lifted card', stageClass: 'bg-[#eee9e3]', contextClass: 'bg-[#f6f1eb]', cardClass: 'bg-[#fffdf9]', stageHex: '#eee9e3', contextHex: '#f6f1eb', cardHex: '#fffdf9', copyClass: 'text-[#181614]', mutedClass: 'text-[#665d56]', buttonClass: 'bg-[#b91f2b] text-white' },
  { name: 'Fog White', mood: 'fog canvas, lifted white card', stageClass: 'bg-[#edf0ef]', contextClass: 'bg-[#e5e9e8]', cardClass: 'bg-white', stageHex: '#edf0ef', contextHex: '#e5e9e8', cardHex: '#ffffff', copyClass: 'text-[#1a211e]', mutedClass: 'text-[#4e4e4e]', buttonClass: 'bg-[#b91f2b] text-white' },
  { name: 'Taupe White', mood: 'warm stage, quiet paper card', stageClass: 'bg-[#e8e3dd]', contextClass: 'bg-[#eeeae5]', cardClass: 'bg-[#fffdf9]', stageHex: '#e8e3dd', contextHex: '#eeeae5', cardHex: '#fffdf9', copyClass: 'text-[#181614]', mutedClass: 'text-[#665d56]', buttonClass: 'bg-[#b91f2b] text-white' },
  { name: 'Stone Cloud', mood: 'stone canvas, soft white card', stageClass: 'bg-[#e8e8e6]', contextClass: 'bg-[#eeeeec]', cardClass: 'bg-[#f8f8f6]', stageHex: '#e8e8e6', contextHex: '#eeeeec', cardHex: '#f8f8f6', copyClass: 'text-[#181614]', mutedClass: 'text-[#665d56]', buttonClass: 'bg-[#b91f2b] text-white' },
  { name: 'Paper Lift', mood: 'paper canvas, elevated white card', stageClass: 'bg-[#f1f0ed]', contextClass: 'bg-[#f6f5f2]', cardClass: 'bg-white', stageHex: '#f1f0ed', contextHex: '#f6f5f2', cardHex: '#ffffff', copyClass: 'text-[#181614]', mutedClass: 'text-[#665d56]', buttonClass: 'bg-[#b91f2b] text-white' },
  { name: 'Slate Cloud', mood: 'cool slate, crisp white card', stageClass: 'bg-[#e5e8e9]', contextClass: 'bg-[#edf0f0]', cardClass: 'bg-[#fbfcfc]', stageHex: '#e5e8e9', contextHex: '#edf0f0', cardHex: '#fbfcfc', copyClass: 'text-[#1a211e]', mutedClass: 'text-[#4e4e4e]', buttonClass: 'bg-[#b91f2b] text-white' },
  { name: 'Slate Cloud Soft', mood: 'near-white slate stage, lifted card', stageClass: 'bg-[#eef1f1]', contextClass: 'bg-[#f6f8f8]', cardClass: 'bg-white', stageHex: '#eef1f1', contextHex: '#f6f8f8', cardHex: '#ffffff', copyClass: 'text-[#1a211e]', mutedClass: 'text-[#4e4e4e]', buttonClass: 'bg-[#1a211e] text-white' },
  { name: 'Slate Cloud Rich', mood: 'deeper slate stage, crisp card', stageClass: 'bg-[#dde2e3]', contextClass: 'bg-[#e9edef]', cardClass: 'bg-[#f8faf9]', stageHex: '#dde2e3', contextHex: '#e9edef', cardHex: '#f8faf9', copyClass: 'text-[#1a211e]', mutedClass: 'text-[#4e4e4e]', buttonClass: 'bg-[#1a211e] text-white' },
]

const lightPatternNames = ['Paper Snow', 'Cloud Slate', 'White Stone', 'Silver Cloud', 'Chalk Graphite', 'Bone Graphite', 'Fog White', 'Taupe White', 'Stone Cloud', 'Paper Lift', 'Slate Cloud', 'Slate Cloud Soft', 'Slate Cloud Rich']
function movePatternToFront(patterns: DarkPattern[], winnerName: string) {
  const winner = patterns.find(pattern => pattern.name === winnerName)
  return winner ? [winner, ...patterns.filter(pattern => pattern.name !== winnerName)] : patterns
}
const darkPatterns = movePatternToFront(allPatterns.filter(pattern => !['Black Bone Focus', 'Redline Deep', ...lightPatternNames].includes(pattern.name)), 'Void Whisper')
const lightPatterns = movePatternToFront(allPatterns.filter(pattern => lightPatternNames.includes(pattern.name)), 'Slate Cloud')
const patternSections: PatternSection[] = [
  {
    id: 'dark',
    label: 'Dark · 11 patterns',
    title: 'Find the right black.',
    description: 'The dark set is the first decision: Void Whisper is the current front-runner.',
    patterns: darkPatterns,
  },
  {
    id: 'light',
    label: 'Light · 13 patterns',
    title: 'Find the right light.',
    description: 'The same stage, context, and surface logic — rebuilt entirely with light neutrals. Slate Cloud is the current winner.',
    patterns: lightPatterns,
  },
]

const carouselIndexes = ref<Record<PatternSection['id'], number>>({ dark: 0, light: 0 })

function getCarouselOffsets(section: PatternSection) {
  if (section.patterns.length === 1)
    return [0]

  if (section.patterns.length === 2)
    return [0, 1]

  return [0, 1, 2]
}

function getCarouselPattern(section: PatternSection, offset: number) {
  const index = carouselIndexes.value[section.id]
  const wrappedIndex = (index + offset + section.patterns.length) % section.patterns.length
  return section.patterns[wrappedIndex]!
}

function getCarouselPosition(section: PatternSection) {
  return `${carouselIndexes.value[section.id] + 1} / ${section.patterns.length}`
}

function getCarouselPatternNumber(section: PatternSection, offset: number) {
  const index = (carouselIndexes.value[section.id] + offset + section.patterns.length) % section.patterns.length
  return String(index + 1).padStart(2, '0')
}

function moveCarousel(sectionId: PatternSection['id'], direction: -1 | 1) {
  const section = patternSections.find(item => item.id === sectionId)
  if (!section)
    return

  carouselIndexes.value[sectionId] = (carouselIndexes.value[sectionId] + direction + section.patterns.length) % section.patterns.length
}

function handleCarouselKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null
  if (target?.matches('input, textarea, select, [contenteditable="true"]'))
    return

  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault()
    const sectionId = document.activeElement?.closest<HTMLElement>('[data-carousel-section]')?.dataset.carouselSection as PatternSection['id'] | undefined
    moveCarousel(sectionId ?? 'dark', event.key === 'ArrowLeft' ? -1 : 1)
  }
}

onMounted(() => window.addEventListener('keydown', handleCarouselKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', handleCarouselKeydown))

useHead({ title: 'Design System' })

useSeoMeta({
  title: 'Design System',
  description: 'A compact reference for the Signal Red, Basalt, Bone and typography tokens used by grillme.dev.',
})
</script>

<template>
  <div class="text-on-background bg-basalt-900 min-h-[100dvh]">
    <div class="mx-auto px-5 pb-20 pt-28 max-w-[1320px] md:px-8 md:pt-20">
      <header class="pb-10 border-b border-outline flex flex-col gap-8 justify-between md:flex-row md:items-end">
        <div class="max-w-[48rem]">
          <p class="text-[11px] text-primary-strong tracking-[0.18em] font-meta uppercase">
            Grillme · design system
          </p>
          <h1 class="text-[clamp(3.5rem,9vw,7.5rem)] leading-[0.86] tracking-[-0.07em] font-display mt-5">
            Less noise.
            <span class="text-bone-300 block">More signal.</span>
          </h1>
          <p class="text-base text-on-surface-variant leading-relaxed font-body mt-7 max-w-[58ch] md:text-lg">
            Three color families, four type roles, and surfaces that are easy to read. This page is the compact source of truth for the visual language.
          </p>
        </div>
        <p class="text-[11px] text-on-surface-variant tracking-[0.16em] font-meta uppercase md:text-right">
          dark first<br>
          one accent<br>
          clear layers
        </p>
      </header>

      <section class="mt-10">
        <div class="flex flex-col gap-6 justify-between md:flex-row md:items-end">
          <div>
            <div class="flex gap-3 flex-wrap items-center">
              <p class="text-[11px] text-primary-strong tracking-[0.18em] font-meta uppercase">
                01 · palette
              </p>
              <span class="text-[10px] text-signal-red-100 tracking-[0.12em] font-meta px-2 py-1 rounded-full bg-signal-red-950 uppercase">
                Redline Deep · accent
              </span>
            </div>
            <h2 class="text-3xl tracking-[-0.04em] font-display mt-3 md:text-5xl">
              Color has three jobs.
            </h2>
          </div>
          <p class="text-sm text-on-surface-variant leading-relaxed font-body max-w-[34ch]">
            Red calls attention. Basalt builds the frame. Bone keeps the page human.
          </p>
        </div>

        <div class="mt-8">
          <p class="text-[10px] text-on-surface-variant tracking-[0.16em] font-meta uppercase mb-3">
            Core roles
          </p>
          <div class="gap-2 grid sm:grid-cols-2 lg:grid-cols-4">
            <div class="p-4 rounded-lg bg-black">
              <p class="text-sm text-bone-50 font-body">
                Stage
              </p>
              <p class="text-[10px] text-bone-300 font-meta mt-1">
                black · full bleed
              </p>
            </div>
            <div class="p-4 rounded-lg bg-bone-50">
              <p class="text-sm text-basalt-950 font-body">
                Focus
              </p>
              <p class="text-[10px] text-basalt-600 font-meta mt-1">
                bone · primary read
              </p>
            </div>
            <div class="p-4 rounded-lg bg-surface-container-high">
              <p class="text-sm text-on-surface font-body">
                Structure
              </p>
              <p class="text-[10px] text-on-surface-variant font-meta mt-1">
                warm graphite · cards
              </p>
            </div>
            <div class="p-4 rounded-lg bg-signal-red-700">
              <p class="text-sm text-bone-50 font-body">
                Action
              </p>
              <p class="text-[10px] text-bone-100 font-meta mt-1">
                cherry red · one decision
              </p>
            </div>
          </div>
        </div>

        <div class="mt-8 space-y-6">
          <div v-for="family in paletteFamilies" :key="family.token">
            <div class="mb-3 flex gap-4 items-baseline justify-between">
              <h3 class="text-xl tracking-[-0.02em] font-display">
                {{ family.name }}
              </h3>
              <p class="text-[10px] text-on-surface-variant tracking-[0.14em] font-meta uppercase">
                {{ family.description }}
              </p>
            </div>
            <div class="gap-1.5 grid grid-cols-6 sm:grid-cols-11">
              <div v-for="swatch in family.swatches" :key="`${family.token}-${swatch.shade}`" :class="[swatch.bgClass, swatch.textClass]" class="p-2 rounded-lg flex flex-col min-h-18 justify-between sm:min-h-22">
                <span class="text-[10px] font-meta">{{ swatch.shade }}</span>
                <span class="text-[9px] tracking-[-0.02em] font-meta opacity-80">{{ swatch.hex }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Archived surface experiments: keep for reference while the core system is being simplified.
      <section class="mt-6 p-5 border border-outline rounded-2xl bg-surface-container md:p-8">
        <div class="flex flex-col gap-6 justify-between md:flex-row md:items-end">
          <div>
            <p class="text-[11px] text-primary-strong tracking-[0.18em] font-meta uppercase">
              02 / surfaces
            </p>
            <h2 class="text-3xl tracking-[-0.04em] font-display mt-3 md:text-5xl">
              Cards need daylight.
            </h2>
          </div>
          <p class="text-sm text-on-surface-variant leading-relaxed font-body max-w-[38ch]">
            The stage is intentionally quiet. Each card steps up enough to be visible without adding decoration.
          </p>
        </div>

        <div class="mt-8 p-4 border border-outline rounded-xl bg-background md:p-5">
          <div class="mb-4 flex gap-4 items-center justify-between">
            <p class="text-[10px] text-on-surface-variant tracking-[0.16em] font-meta uppercase">
              contrast ladder
            </p>
            <span class="text-[10px] text-primary-strong tracking-[0.16em] font-meta uppercase">background → card</span>
          </div>
          <div class="gap-2 grid lg:grid-cols-4 sm:grid-cols-2">
            <div v-for="surface in surfaceSamples" :key="surface.token" :class="[surface.bgClass, surface.textClass]" class="p-4 border border-outline rounded-xl min-h-28">
              <p class="text-[10px] tracking-[0.12em] font-meta uppercase">
                {{ surface.name }}
              </p>
              <p class="text-lg tracking-[-0.02em] font-display mt-5">
                {{ surface.token }}
              </p>
              <p class="text-xs text-on-surface-variant font-body mt-2">
                {{ surface.note }}
              </p>
            </div>
          </div>
        </div>

        <div class="mt-5 gap-3 grid md:grid-cols-[1.15fr_0.85fr]">
          <div class="p-5 border border-outline rounded-xl bg-surface-container-high">
            <p class="text-[10px] text-primary-strong tracking-[0.16em] font-meta uppercase">
              recommended composition
            </p>
            <p class="text-2xl tracking-[-0.04em] font-display mt-4">
              Quiet stage. Visible module.
            </p>
            <p class="text-sm text-on-surface-variant leading-relaxed font-body mt-3 max-w-[42ch]">
              Use the page foundation behind a single card surface. Reserve the highest layer for a focused control or active state.
            </p>
          </div>
          <div class="p-5 border border-outline rounded-xl bg-surface-container-highest">
            <p class="text-[10px] text-on-surface-variant tracking-[0.16em] font-meta uppercase">
              one active signal
            </p>
            <div class="mt-5 flex gap-3 items-center">
              <span class="rounded-full bg-primary h-3 w-3" />
              <span class="text-lg font-body">Selected / live / focused</span>
            </div>
          </div>
        </div>
      </section> -->

      <section v-for="patternSection in patternSections" :key="patternSection.label" :data-carousel-section="patternSection.id" class="mt-10">
        <div class="flex flex-col gap-6 justify-between md:flex-row md:items-end">
          <div>
            <p class="text-[11px] text-primary-strong tracking-[0.18em] font-meta uppercase">
              {{ patternSection.label }}
            </p>
            <h2 class="text-3xl tracking-[-0.04em] font-display mt-3 md:text-5xl">
              {{ patternSection.title }}
            </h2>
          </div>
          <div class="flex gap-5 items-end justify-between md:max-w-[40ch]">
            <p class="text-sm text-on-surface-variant leading-relaxed font-body max-w-[40ch]">
              {{ patternSection.description }}
            </p>
            <div class="flex gap-1 shrink-0 items-center">
              <button class="text-lg text-on-surface-variant border border-outline rounded-lg h-8 w-8 leading-none transition-colors border-solid hover:text-on-background hover:border-on-surface-variant focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2" type="button" :aria-label="`Previous ${patternSection.label} pattern`" @click="moveCarousel(patternSection.id, -1)">
                ←
              </button>
              <span class="text-[10px] text-on-surface-variant tracking-[0.08em] font-meta min-w-12 text-center" aria-live="polite">
                {{ getCarouselPosition(patternSection) }}
              </span>
              <button class="text-lg text-on-surface-variant border border-outline rounded-lg h-8 w-8 leading-none transition-colors border-solid hover:text-on-background hover:border-on-surface-variant focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2" type="button" :aria-label="`Next ${patternSection.label} pattern`" @click="moveCarousel(patternSection.id, 1)">
                →
              </button>
            </div>
          </div>
        </div>

        <div v-if="patternSection.patterns.length" class="mt-8 gap-3 grid grid-cols-1 lg:grid-cols-3">
          <article v-for="offset in getCarouselOffsets(patternSection)" :key="`${patternSection.id}-${getCarouselPattern(patternSection, offset).name}`" :class="[getCarouselPattern(patternSection, offset).stageClass, offset === 0 ? 'flex' : 'hidden lg:flex']" class="p-3 rounded-2xl flex-col min-h-56 transition-[opacity,transform] duration-300 lg:min-h-[30rem]">
            <template v-if="getCarouselPattern(patternSection, offset)">
              <div class="flex gap-3 items-start justify-between">
                <div>
                  <p :class="getCarouselPattern(patternSection, offset).copyClass" class="text-sm leading-tight font-body">
                    <Icon v-if="['Void Whisper', 'Slate Cloud'].includes(getCarouselPattern(patternSection, offset).name)" name="ph:crown-simple" class="text-primary-strong mr-1 align-[-0.12em]" />{{ getCarouselPattern(patternSection, offset).name }}
                  </p>
                  <p :class="getCarouselPattern(patternSection, offset).mutedClass" class="text-[10px] leading-tight font-meta mt-1">
                    {{ getCarouselPattern(patternSection, offset).mood }}
                  </p>
                  <p :class="getCarouselPattern(patternSection, offset).mutedClass" class="text-[9px] tracking-[0.08em] font-meta uppercase mt-2">
                    stage ↔ card {{ getSurfaceContrast(getCarouselPattern(patternSection, offset)) }}
                  </p>
                </div>
                <span :class="getCarouselPattern(patternSection, offset).mutedClass" class="text-[10px] font-meta">{{ getCarouselPatternNumber(patternSection, offset) }}</span>
              </div>

              <div class="mt-5 flex-1">
                <div :class="getCarouselPattern(patternSection, offset).cardClass" class="p-4 rounded-lg flex flex-col h-full justify-between">
                  <div>
                    <p :class="getCarouselPattern(patternSection, offset).mutedClass" class="text-[9px] tracking-[0.12em] font-meta uppercase">
                      bento context
                    </p>
                    <p :class="getCarouselPattern(patternSection, offset).copyClass" class="text-xl leading-none tracking-[-0.05em] font-display mt-4">
                      Receipts found.
                    </p>
                  </div>
                  <div class="mt-6 flex gap-3 items-center justify-between">
                    <span :class="getCarouselPattern(patternSection, offset).mutedClass" class="text-[9px] font-meta">C- / 12</span>
                    <button :class="getCarouselPattern(patternSection, offset).buttonClass" class="text-[9px] tracking-[0.1em] font-meta px-2 py-1 rounded uppercase" type="button">
                      Open
                    </button>
                  </div>
                </div>
              </div>

              <div class="mt-3 flex gap-1.5">
                <span :class="getCarouselPattern(patternSection, offset).stageClass" class="border border-white/10 rounded-sm flex-1 h-3" />
                <span :class="getCarouselPattern(patternSection, offset).contextClass" class="border border-white/10 rounded-sm flex-1 h-3" />
                <span :class="getCarouselPattern(patternSection, offset).cardClass" class="border border-white/10 rounded-sm flex-1 h-3" />
              </div>
              <p :class="getCarouselPattern(patternSection, offset).mutedClass" class="text-[9px] tracking-[-0.02em] font-meta mt-2">
                {{ getCarouselPattern(patternSection, offset).stageHex }} · {{ getCarouselPattern(patternSection, offset).contextHex }} · {{ getCarouselPattern(patternSection, offset).cardHex }}
              </p>
            </template>
          </article>
        </div>
        <div v-else class="p-6 border border-dashed border-outline rounded-xl mt-8">
          <p class="text-sm text-on-surface-variant leading-relaxed font-body max-w-[52ch]">
            {{ patternSection.emptyMessage }}
          </p>
        </div>
      </section>

      <section class="mt-6">
        <div class="flex flex-col gap-6 justify-between md:flex-row md:items-end">
          <div>
            <p class="text-[11px] text-primary-strong tracking-[0.18em] font-meta uppercase">
              Type roles
            </p>
            <h2 class="text-3xl tracking-[-0.04em] font-display mt-3 md:text-5xl">
              Four voices. No costume.
            </h2>
          </div>
          <p class="text-sm text-on-surface-variant leading-relaxed font-body max-w-[38ch]">
            One voice per job. The specimen below shows how the system sounds before it ships.
          </p>
        </div>

        <div class="mt-8 border-y border-outline">
          <div v-for="sample in typographySamples" :key="sample.label" class="py-5 md:py-7">
            <div class="flex gap-4 items-baseline justify-between">
              <p class="text-[10px] text-primary-strong tracking-[0.16em] font-meta uppercase">
                {{ sample.label }}
              </p>
              <p class="text-[10px] text-on-surface-variant leading-relaxed font-meta text-right">
                {{ sample.role }}
              </p>
            </div>
            <p :class="[sample.className, sample.sampleClass]" class="text-on-surface leading-none mt-4 md:mt-5">
              {{ sample.sample }}
            </p>
          </div>
        </div>
      </section>

      <!-- Archived direction and stage experiments.
      <section class="mt-20 pt-12 border-t-2 border-primary/30 md:pt-16">
        <div class="flex flex-col gap-8 justify-between md:flex-row md:items-end">
          <div class="max-w-[44rem]">
            <p class="text-[11px] text-primary-strong tracking-[0.18em] font-meta uppercase">
              Palette lab / homepage extracted
            </p>
            <h2 class="text-[clamp(2.5rem,6vw,5rem)] leading-[0.9] tracking-[-0.06em] font-display mt-4">
              Three ways to hold the heat.
            </h2>
          </div>
          <p class="text-sm text-on-surface-variant leading-relaxed font-body max-w-[36ch]">
            Same red. Same type. Different relationships between the dark stage, the module, and the light chapter.
          </p>
        </div>

        <div class="mt-8 gap-4 grid lg:grid-cols-3">
          <article v-for="(direction, index) in paletteDirections" :key="direction.name" class="p-5 border border-outline rounded-2xl bg-surface-container md:p-6">
            <div class="flex gap-4 items-start justify-between">
              <p class="text-[10px] text-primary-strong tracking-[0.16em] font-meta uppercase">
                0{{ index + 1 }} / direction
              </p>
              <span v-if="index === 0" class="text-[10px] text-bone-50 tracking-[0.12em] font-meta px-2 py-1 rounded bg-primary uppercase">recommended</span>
            </div>
            <h3 class="text-2xl leading-none tracking-[-0.04em] font-display mt-8">
              {{ direction.name }}
            </h3>
            <p class="text-sm text-on-surface-variant font-body mt-3">
              {{ direction.mood }}
            </p>

            <div class="mt-7 gap-1.5 grid grid-cols-4">
              <div v-for="swatch in direction.swatches" :key="`${direction.name}-${swatch.label}`" :class="[swatch.className, swatch.textClass]" class="p-2 rounded-lg flex flex-col min-h-24 justify-between">
                <span class="text-[9px] tracking-[0.12em] font-meta uppercase">{{ swatch.label }}</span>
                <span class="text-[9px] leading-tight font-meta">{{ swatch.token }}</span>
              </div>
            </div>

            <div :class="direction.stageClass" class="mt-4 p-3 rounded-xl">
              <div :class="direction.panelClass" class="p-4 rounded-lg">
                <div class="flex gap-3 items-start justify-between">
                  <div>
                    <p :class="direction.highlightClass" class="text-[9px] tracking-[0.14em] font-meta uppercase">
                      roast card
                    </p>
                    <p :class="direction.name === 'Black / Bone Split' ? 'text-basalt-950' : 'text-bone-50'" class="text-lg leading-tight tracking-[-0.03em] font-display mt-3">
                      Your code has receipts.
                    </p>
                  </div>
                  <span :class="direction.name === 'Black / Bone Split' ? 'text-basalt-700 border-basalt-700/30' : 'text-on-surface-variant border-outline'" class="text-[9px] font-meta px-2 py-1 border rounded">C-</span>
                </div>
                <div class="mt-5 flex gap-3 items-center justify-between">
                  <span :class="direction.name === 'Black / Bone Split' ? 'text-basalt-700' : 'text-on-surface-variant'" class="text-[10px] font-meta">evidence / 04</span>
                  <button :class="[direction.actionClass, direction.actionTextClass]" class="text-[10px] tracking-[0.12em] font-meta px-3 py-2 rounded uppercase transition-colors focus-visible:outline-2 focus-visible:outline-primary-strong focus-visible:outline-offset-2 hover:brightness-110" type="button">
                    View roast
                  </button>
                </div>
              </div>
            </div>

            <div class="mt-6 pt-4 border-t border-divider flex gap-3 items-baseline justify-between">
              <p class="text-xs text-on-surface-variant leading-relaxed font-body">
                {{ direction.verdict }}
              </p>
              <span class="text-[10px] text-primary-strong tracking-[0.12em] font-meta uppercase">explore</span>
            </div>
          </article>
        </div>

        <div class="mt-5 p-5 border border-outline rounded-2xl bg-bone-200 md:p-7">
          <div class="flex flex-col gap-6 justify-between md:flex-row md:items-center">
            <div>
              <p class="text-[10px] text-basalt-700 tracking-[0.16em] font-meta uppercase">
                directional read
              </p>
              <p class="text-2xl text-basalt-950 leading-tight tracking-[-0.04em] font-display mt-3">
                Graphite Editorial gives the roast room to speak.
              </p>
            </div>
            <p class="text-sm text-basalt-700 leading-relaxed font-body max-w-[38ch]">
              It keeps the homepage’s dark chamber, makes cards legible, and lets the warm chapter feel like a deliberate change of temperature.
            </p>
          </div>
        </div>
      </section>

      <section class="mt-20 pt-12 border-t-2 border-primary/30 md:pt-16">
        <div class="flex flex-col gap-6 justify-between md:flex-row md:items-end">
          <div class="max-w-[48rem]">
            <p class="text-[11px] text-primary-strong tracking-[0.18em] font-meta uppercase">
              Reference synthesis / surface recipes
            </p>
            <h2 class="text-[clamp(2.5rem,6vw,5rem)] leading-[0.9] tracking-[-0.06em] font-display mt-4">
              Make the stage do the work.
            </h2>
          </div>
          <p class="text-sm text-on-surface-variant leading-relaxed font-body max-w-[38ch]">
            Three product-ready compositions from the same primitive set: one stage, one readable card, one red action.
          </p>
        </div>

        <div class="mt-8 gap-4 grid lg:grid-cols-3">
          <article class="p-4 border border-outline rounded-2xl bg-basalt-950">
            <div class="px-2 pt-1 flex gap-4 items-center justify-between">
              <h3 class="text-sm text-bone-50 font-body">
                Dark command room
              </h3>
              <span class="text-[10px] text-bone-300 font-meta">dark / neutral</span>
            </div>
            <div class="mt-4 p-5 rounded-2xl bg-basalt-800 min-h-72">
              <div class="flex gap-4 items-start justify-between">
                <div>
                  <p class="text-[10px] text-bone-300 tracking-[0.12em] font-meta uppercase">
                    latest roast
                  </p>
                  <p class="text-3xl text-bone-50 leading-[0.95] tracking-[-0.06em] font-display mt-6">
                    Receipts<br>found.
                  </p>
                </div>
                <span class="text-xs text-bone-50 font-meta px-2 py-1 border border-outline rounded-lg">C-</span>
              </div>
              <div class="mt-10 pt-4 border-t border-outline flex gap-3 items-center justify-between">
                <span class="text-xs text-bone-300 font-body">12 findings</span>
                <button class="text-[10px] text-bone-950 tracking-[0.12em] font-meta px-3 py-2 rounded-lg bg-bone-100 uppercase transition-colors focus-visible:outline-2 focus-visible:outline-bone-50 focus-visible:outline-offset-2 hover:bg-bone-50" type="button">
                  Open
                </button>
              </div>
            </div>
          </article>

          <article class="p-4 border border-basalt-300 rounded-2xl bg-bone-200">
            <div class="px-2 pt-1 flex gap-4 items-center justify-between">
              <h3 class="text-sm text-basalt-950 font-body">
                Paper verdict
              </h3>
              <span class="text-[10px] text-basalt-600 font-meta">light / focal</span>
            </div>
            <div class="mt-4 p-5 rounded-xl bg-bone-50 min-h-72">
              <p class="text-[10px] text-basalt-600 tracking-[0.12em] font-meta uppercase">
                the read
              </p>
              <p class="text-3xl text-basalt-950 leading-[0.95] tracking-[-0.06em] font-display mt-6">
                Your code<br>needs proof.
              </p>
              <p class="text-sm text-basalt-700 leading-relaxed font-body mt-8 max-w-[26ch]">
                Light surfaces are reserved for the one insight the user should remember.
              </p>
            </div>
          </article>

          <article class="p-4 border border-outline rounded-2xl bg-basalt-800">
            <div class="px-2 pt-1 flex gap-4 items-center justify-between">
              <h3 class="text-sm text-bone-50 font-body">
                Action module
              </h3>
              <span class="text-[10px] text-bone-300 font-meta">red / functional</span>
            </div>
            <div class="mt-4 p-5 rounded-xl bg-basalt-950 flex flex-col min-h-72 justify-between">
              <div>
                <p class="text-[10px] text-primary-strong tracking-[0.12em] font-meta uppercase">
                  new subject
                </p>
                <p class="text-2xl text-bone-50 leading-tight tracking-[-0.05em] font-display mt-6">
                  Who gets roasted next?
                </p>
                <div class="mt-6 p-3 border border-outline rounded-lg bg-surface-container-low flex gap-3 items-center">
                  <span class="text-sm text-bone-300 font-body">@torvalds</span>
                  <span class="text-[10px] text-bone-400 font-meta ml-auto">ready</span>
                </div>
              </div>
              <button class="text-[10px] text-bone-50 tracking-[0.14em] font-meta px-4 py-3 rounded-lg bg-signal-red-700 w-full uppercase transition-colors focus-visible:outline-2 focus-visible:outline-signal-red-500 focus-visible:outline-offset-2 hover:bg-signal-red-600" type="button">
                Run roast
              </button>
            </div>
          </article>
        </div>

        <div class="mt-5 p-5 border border-outline rounded-2xl bg-surface-container md:p-7">
          <div class="flex flex-col gap-6 justify-between md:flex-row md:items-start">
            <div>
              <p class="text-[10px] text-primary-strong tracking-[0.16em] font-meta uppercase">
                same primitives / different stage
              </p>
              <p class="text-2xl leading-tight tracking-[-0.04em] font-display mt-3">
                The palette only needs four jobs.
              </p>
            </div>
            <div class="gap-2 grid sm:grid-cols-2 md:w-[33rem]">
              <div class="p-3 rounded-lg bg-black">
                <p class="text-xs text-bone-50 font-body">
                  Stage
                </p>
                <p class="text-[10px] text-bone-300 font-meta mt-1">
                  quiet / deep / full bleed
                </p>
              </div>
              <div class="p-3 rounded-lg bg-bone-100">
                <p class="text-xs text-basalt-950 font-body">
                  Focus
                </p>
                <p class="text-[10px] text-basalt-600 font-meta mt-1">
                  paper / readable / rare
                </p>
              </div>
              <div class="p-3 rounded-lg bg-basalt-700">
                <p class="text-xs text-bone-50 font-body">
                  Support
                </p>
                <p class="text-[10px] text-bone-300 font-meta mt-1">
                  graphite / evidence / quiet
                </p>
              </div>
              <div class="p-3 rounded-lg bg-signal-red-700">
                <p class="text-xs text-bone-50 font-body">
                  Action
                </p>
                <p class="text-[10px] text-bone-100 font-meta mt-1">
                  red / one decision
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="mt-20 pt-12 border-t-2 border-primary/30 md:pt-16">
        <div class="flex flex-col gap-6 justify-between md:flex-row md:items-end">
          <div class="max-w-[48rem]">
            <p class="text-[11px] text-primary-strong tracking-[0.18em] font-meta uppercase">
              Component context / same kit
            </p>
            <h2 class="text-[clamp(2.5rem,6vw,5rem)] leading-[0.9] tracking-[-0.06em] font-display mt-4">
              Same parts. Different temperature.
            </h2>
          </div>
          <p class="text-sm text-on-surface-variant leading-relaxed font-body max-w-[38ch]">
            The stage changes the mood. The components keep their roles, spacing, and action hierarchy.
          </p>
        </div>

        <div class="mt-8 gap-4 grid lg:grid-cols-3">
          <article class="p-4 border border-outline rounded-2xl bg-black md:p-5">
            <div class="px-2 pt-1 flex gap-4 items-center justify-between">
              <div>
                <h3 class="text-lg text-bone-50 tracking-[-0.03em] font-display">
                  Dark stage
                </h3>
                <p class="text-[10px] text-bone-300 tracking-[0.12em] font-meta mt-1 uppercase">
                  quiet canvas / visible modules
                </p>
              </div>
              <span class="text-[10px] text-primary-strong tracking-[0.12em] font-meta uppercase">recommended</span>
            </div>

            <div class="mt-5 p-5 rounded-2xl bg-basalt-800 md:p-6">
              <div class="flex gap-4 items-start justify-between">
                <div>
                  <p class="text-[10px] text-bone-300 tracking-[0.12em] font-meta uppercase">
                    new roast
                  </p>
                  <p class="text-2xl text-bone-50 leading-tight tracking-[-0.05em] font-display mt-4">
                    Read the repo.
                  </p>
                </div>
                <span class="text-[10px] text-bone-300 font-meta px-2 py-1 border border-outline rounded-lg">ready</span>
              </div>
              <div class="mt-6 gap-2 grid sm:grid-cols-[1fr_auto]">
                <div class="p-3 border border-outline rounded-lg bg-basalt-800">
                  <p class="text-xs text-bone-300 font-body">
                    github.com/torvalds/linux
                  </p>
                </div>
                <button class="text-[10px] text-bone-50 tracking-[0.12em] font-meta px-4 py-3 rounded-lg bg-signal-red-700 uppercase transition-colors focus-visible:outline-2 focus-visible:outline-signal-red-500 focus-visible:outline-offset-2 hover:bg-signal-red-600" type="button">
                  Roast
                </button>
              </div>
            </div>

            <div class="mt-3 p-4 border border-outline rounded-2xl bg-basalt-800">
              <div class="flex gap-4 items-center justify-between">
                <div>
                  <p class="text-sm text-bone-50 font-body">
                    Latest verdict
                  </p>
                  <p class="text-xs text-bone-300 font-body mt-1">
                    12 findings · 4 high heat
                  </p>
                </div>
                <span class="text-2xl text-bone-50 tracking-[-0.05em] font-display">C-</span>
              </div>
            </div>
          </article>

          <article class="p-4 border border-basalt-300 rounded-2xl bg-bone-200 md:p-5">
            <div class="px-2 pt-1 flex gap-4 items-center justify-between">
              <div>
                <h3 class="text-lg text-basalt-950 tracking-[-0.03em] font-display">
                  Light stage
                </h3>
                <p class="text-[10px] text-basalt-600 tracking-[0.12em] font-meta mt-1 uppercase">
                  warm canvas / crisp modules
                </p>
              </div>
              <span class="text-[10px] text-basalt-600 tracking-[0.12em] font-meta uppercase">dark content</span>
            </div>

            <div class="mt-5 p-5 rounded-2xl bg-basalt-800 md:p-6">
              <div class="flex gap-4 items-start justify-between">
                <div>
                  <p class="text-[10px] text-bone-300 tracking-[0.12em] font-meta uppercase">
                    new roast
                  </p>
                  <p class="text-2xl text-bone-50 leading-tight tracking-[-0.05em] font-display mt-4">
                    Read the repo.
                  </p>
                </div>
                <span class="text-[10px] text-bone-300 font-meta px-2 py-1 border border-outline rounded-lg">ready</span>
              </div>
              <div class="mt-6 gap-2 grid sm:grid-cols-[1fr_auto]">
                <div class="p-3 border border-outline rounded-lg bg-basalt-700">
                  <p class="text-xs text-bone-300 font-body">
                    github.com/torvalds/linux
                  </p>
                </div>
                <button class="text-[10px] text-bone-50 tracking-[0.12em] font-meta px-4 py-3 rounded-lg bg-signal-red-700 uppercase transition-colors focus-visible:outline-2 focus-visible:outline-signal-red-500 focus-visible:outline-offset-2 hover:bg-signal-red-600" type="button">
                  Roast
                </button>
              </div>
            </div>

            <div class="mt-3 p-4 border border-outline rounded-2xl bg-basalt-950">
              <div class="flex gap-4 items-center justify-between">
                <div>
                  <p class="text-sm text-bone-50 font-body">
                    Latest verdict
                  </p>
                  <p class="text-xs text-bone-300 font-body mt-1">
                    12 findings · 4 high heat
                  </p>
                </div>
                <span class="text-2xl text-bone-50 tracking-[-0.05em] font-display">C-</span>
              </div>
            </div>
          </article>

          <article class="p-4 border border-outline rounded-2xl bg-black md:p-5">
            <div class="px-2 pt-1 flex gap-4 items-center justify-between">
              <div>
                <h3 class="text-lg text-bone-50 tracking-[-0.03em] font-display">
                  Dark focus
                </h3>
                <p class="text-[10px] text-bone-300 tracking-[0.12em] font-meta mt-1 uppercase">
                  bone card / verdict moment
                </p>
              </div>
              <span class="text-[10px] text-primary-strong tracking-[0.12em] font-meta uppercase">editorial</span>
            </div>
            <div class="mt-5 p-5 rounded-2xl bg-bone-50 flex flex-col min-h-72 justify-between md:p-6">
              <div>
                <p class="text-[10px] text-basalt-600 tracking-[0.12em] font-meta uppercase">
                  the read
                </p>
                <p class="text-3xl text-basalt-950 leading-[0.95] tracking-[-0.06em] font-display mt-6">
                  Your code needs proof.
                </p>
              </div>
              <div class="flex gap-3 items-center justify-between">
                <span class="text-xs text-basalt-700 font-body">score / C-</span>
                <button class="text-[10px] text-bone-50 tracking-[0.12em] font-meta px-3 py-2 rounded-lg bg-signal-red-700 uppercase transition-colors focus-visible:outline-2 focus-visible:outline-signal-red-500 focus-visible:outline-offset-2 hover:bg-signal-red-600" type="button">
                  Open verdict
                </button>
              </div>
            </div>
          </article>
        </div>

        <div class="mt-5 p-5 border border-outline rounded-2xl bg-surface-container md:p-7">
          <div class="gap-6 grid md:grid-cols-[0.7fr_1.3fr] md:items-center">
            <div>
              <p class="text-[10px] text-primary-strong tracking-[0.16em] font-meta uppercase">
                working rule
              </p>
              <p class="text-2xl leading-tight tracking-[-0.04em] font-display mt-3">
                Contrast the stage. Calm the components.
              </p>
            </div>
            <p class="text-sm text-on-surface-variant leading-relaxed font-body max-w-[58ch]">
              A stage owns the atmosphere. A card owns the content. Inputs recede, neutral actions stay quiet, and Signal Red appears only where a decision needs heat.
            </p>
          </div>
        </div>
      </section> -->
    </div>
  </div>
</template>
