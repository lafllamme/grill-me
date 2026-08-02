<script setup lang="ts">
import type { GrillmeMarkShape } from './grillme-mark-shapes'
import { GRILLME_MARK_SHAPES } from './grillme-mark-shapes'
import { WORDMARK_FONTS } from './grillme-wordmark-fonts'

const props = withDefaults(defineProps<{
  accent?: string
  showWordmark?: boolean
  /** Optional mark variant from the shapes.gallery exploration ('01'–'72'). Falls back to the asterisk mark. */
  shape?: string
  /** Wordmark font variant, see WORDMARK_FONTS. */
  font?: string
}>(), {
  accent: '#FF5633',
  showWordmark: true,
  shape: undefined,
  font: 'bricolage',
})

/**
 * Höhe des Marks im Lockup (in viewBox-Einheiten, max 42).
 * Die eine Stellschraube für die Mark-Größe — Text und Gesamthöhe bleiben unberührt.
 */
const LOCKUP_MARK_HEIGHT = 42

const activeShape = computed<GrillmeMarkShape | undefined>(() =>
  props.shape ? GRILLME_MARK_SHAPES[props.shape] : undefined,
)

const activeShapeConfig = computed(() => {
  if (!activeShape.value) {
    return undefined
  }

  return typeof activeShape.value === 'string'
    ? {
        paths: [activeShape.value],
        fillRule: undefined,
        transform: undefined,
        glyphScale: undefined,
        lockupWordmarkX: undefined,
        lockupHeight: undefined,
        lockupOffsetY: undefined,
      }
    : {
        paths: activeShape.value.paths ?? (activeShape.value.d ? [activeShape.value.d] : []),
        fillRule: activeShape.value.fillRule,
        transform: activeShape.value.transform,
        glyphScale: activeShape.value.glyphScale,
        lockupWordmarkX: activeShape.value.lockupWordmarkX,
        lockupHeight: activeShape.value.lockupHeight,
        lockupOffsetY: activeShape.value.lockupOffsetY,
      }
})

const activeGlyphTransform = computed(() => {
  const shapeTransform = activeShapeConfig.value?.transform
  const glyphScale = activeShapeConfig.value?.glyphScale

  const scaleTransform = glyphScale
    ? `translate(128 128) scale(${glyphScale}) translate(-128 -128)`
    : undefined

  return [shapeTransform, scaleTransform].filter(Boolean).join(' ') || undefined
})

const lockupMarkTransform = computed(() => {
  const markHeight = activeShapeConfig.value?.lockupHeight ?? LOCKUP_MARK_HEIGHT
  const offsetY = activeShapeConfig.value?.lockupOffsetY ?? (3 + (42 - markHeight) / 2)
  return `translate(0 ${offsetY}) scale(${markHeight / 256})`
})

const lockupWordmarkX = computed(() =>
  activeShapeConfig.value?.lockupWordmarkX ?? 58,
)

const activeFont = computed(() =>
  WORDMARK_FONTS[props.font] ?? WORDMARK_FONTS.azeret!,
)
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :viewBox="showWordmark ? `0 0 ${activeFont.viewBoxWidth} 48` : '0 0 42 48'"
    fill="none"
    role="img"
    aria-label="Grillme"
  >
    <g
      v-if="activeShapeConfig"
      :transform="showWordmark ? lockupMarkTransform : 'translate(0 3) scale(0.1640625)'"
    >
      <path
        v-for="(shapePath, index) in activeShapeConfig.paths"
        :key="`${index}-${shapePath.slice(0, 24)}`"
        :d="shapePath"
        :fill="accent"
        :fill-rule="activeShapeConfig.fillRule"
        :clip-rule="activeShapeConfig.fillRule"
        :transform="activeGlyphTransform"
      />
    </g>
    <g
      v-else
      :stroke="accent"
      stroke-width="4"
    >
      <path d="M20 4V16.3604C20 19.087 16.6569 20.3998 14.8016 18.4017L7 10" />
      <path d="M40 24H27.6396C24.913 24 23.6002 20.6569 25.5983 18.8016L34 11" />
      <path d="M20 44V31.6396C20 28.913 23.3431 27.6002 25.1984 29.5983L33 38" />
      <path d="M0 24L12.3604 24C15.087 24 16.3998 27.3431 14.4017 29.1984L6 37" />
    </g>
    <g
      v-if="showWordmark"
      :transform="`translate(${lockupWordmarkX} 36)`"
    >
      <text
        x="0"
        y="0"
        fill="#F5F5F5"
        :font-family="activeFont.family"
        :font-size="activeFont.fontSize"
        :font-weight="activeFont.weight"
        :letter-spacing="activeFont.letterSpacing"
        :transform="`scale(${activeFont.scaleX} 1)`"
      >
        GRILLME
      </text>
    </g>
    <g
      v-if="showWordmark"
      transform="translate(0 -2)"
    >
      <circle
        :cx="activeFont.viewBoxWidth - 12"
        cy="22.5"
        r="10.5"
        stroke="#F5F5F5"
        stroke-width="2.2"
      />
      <text
        :x="activeFont.viewBoxWidth - 12"
        y="27.5"
        fill="#F5F5F5"
        font-family="General Sans, sans-serif"
        font-size="14.5"
        font-weight="700"
        text-anchor="middle"
      >
        R
      </text>
    </g>
  </svg>
</template>
