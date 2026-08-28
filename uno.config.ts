import {
  defineConfig,
  presetIcons,
  presetMini,
  presetWind4,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

const basePreset = presetWind4({
  preflights: {
    reset: true,
  },
})
const basePresetAlternatives = {
  mini: () => presetMini(),
}
export const unoBasePresetAlternatives = basePresetAlternatives

export default defineConfig({
  theme: {
    colors: {
      'ember': {
        50: '#faf6f5',
        100: '#f6ebe9',
        200: '#f1d5d0',
        300: '#eeb1a5',
        400: '#f27c64',
        500: '#ff4925',
        600: '#e12d09',
        700: '#b6280c',
        800: '#882511',
        900: '#5d1f13',
        950: '#38160f',
      },
      'basalt': {
        50: '#f5f4f2',
        100: '#ece8e4',
        200: '#d7d1cb',
        300: '#b4aca5',
        400: '#8d837a',
        500: '#665d56',
        600: '#504943',
        700: '#3d3833',
        800: '#292522',
        900: '#181614',
        950: '#0f0e0d',
      },
      'bone': {
        50: '#fffdf9',
        100: '#fcf7f0',
        200: '#f5ebdf',
        300: '#ead8c6',
        400: '#d8bfa8',
        500: '#c1a68d',
        600: '#a3846d',
        700: '#856956',
        800: '#685143',
        900: '#47372f',
        950: '#2a201b',
      },
      // Signal Red is the product accent. Ember remains available for legacy
      // exploration pages, but must not be used for new product UI.
      'primary': '#b91f2b',
      'primary-strong': '#f0444d',
      'primary-soft': 'rgba(185, 31, 43, 0.12)',
      'primary-container': '#7e1d26',
      'primary-muted': 'rgba(185, 31, 43, 0.08)',
      'header-glass': 'rgba(15, 14, 13, 0.72)',
      'header-border': 'rgba(252, 247, 240, 0.1)',
      'header-highlight': 'rgba(252, 247, 240, 0.06)',
      'header-hover': 'rgba(185, 31, 43, 0.12)',
      'background': '#0f0e0d',
      'surface': '#181614',
      'surface-container-low': '#131211',
      'surface-container': '#1a1715',
      'surface-container-high': '#211d1a',
      'surface-container-highest': '#292522',
      'surface-container-lowest': '#0f0e0d',
      'surface-variant': '#3d3833',
      'surface-bright': '#504943',
      'chart-track': '#252831',
      'chart-hover': '#2f3035',
      'chart-line-primary': '#2a2a2e',
      'chart-line-secondary': '#5c5d65',
      'chart-grid': 'rgba(92, 93, 101, 0.28)',
      'chart-tooltip': '#18181b',
      'muted': '#1a1715',
      'on-background': '#fcf7f0',
      'on-surface': '#fcf7f0',
      'on-surface-variant': '#d8bfa8',
      'on-primary-fixed': '#fffdf9',
      'border': 'rgba(252, 247, 240, 0.1)',
      'outline': 'rgba(252, 247, 240, 0.14)',
      'divider': 'rgba(252, 247, 240, 0.08)',
      'glow': 'rgba(240, 68, 77, 0.18)',
      'error': '#f0444d',
      'success': '#7dbd6d',
      // Prototype-only palette for /test-1. Do not use in production modules yet.
      'explore-ink': 'var(--explore-ink, #080708)',
      'explore-ink-soft': 'var(--explore-ink-soft, #100b0d)',
      'explore-panel': 'var(--explore-panel, rgba(18, 12, 14, 0.72))',
      'explore-panel-high': 'var(--explore-panel-high, rgba(32, 17, 21, 0.86))',
      'explore-border': 'var(--explore-border, rgba(255, 235, 239, 0.12))',
      'explore-border-high': 'var(--explore-border-high, rgba(255, 235, 239, 0.2))',
      'explore-copy': 'var(--explore-copy, #f8eeef)',
      'explore-muted': 'var(--explore-muted, #c5b2b4)',
      'explore-signal': 'var(--explore-accent, #b91f2b)',
      'explore-signal-bright': 'var(--explore-accent-bright, #f0444d)',
      'explore-signal-deep': 'var(--explore-accent-deep, #7e1d26)',
      'explore-glow': 'var(--explore-glow, rgba(217, 45, 54, 0.34))',
      'signal-red': {
        50: '#fff1f1',
        100: '#ffe1e2',
        200: '#ffc7c9',
        300: '#ffa0a4',
        400: '#ff6b72',
        500: '#f0444d',
        600: '#d92d36',
        700: '#b91f2b',
        800: '#981b27',
        900: '#7e1d26',
        950: '#450a0f',
      },
    },
    font: {
      headline: '"General Sans", sans-serif',
      display: '"General Sans", sans-serif',
      label: '"General Sans", sans-serif',
      body: '"General Sans", sans-serif',
      mono: '"Azeret Mono", monospace',
      meta: '"Azeret Mono", monospace',
      climate: '"Climate Crisis", sans-serif',
      accent: '"Bricolage Grotesque", sans-serif',
    },
  },
  presets: [basePreset, presetIcons()],
  shortcuts: {
    'fuel-editorial-headline': 'text-[30px] leading-[30px] tracking-[-1.1px] font-body font-medium lg:text-[38px] lg:leading-[38px] lg:tracking-[-1.2px] xl:text-[70px] xl:leading-[70px] xl:tracking-[-2.1px]',
  },
  preflights: [
    {
      getCSS: () => `
html, body {
  font-synthesis: none;
  font-synthesis-weight: none;
  font-synthesis-style: none;
  font-synthesis-small-caps: none;
}

:root {
  --color-primary: #b91f2b;
  --color-primary-strong: #f0444d;
  --color-on-background: #fcf7f0;
  --color-on-surface-variant: #d8bfa8;
  --color-surface-variant: #3d3833;
  --color-chart-track: #252831;
  --color-chart-tooltip: #18181b;
}

@keyframes chapter-cover-rise {
  from {
    transform: translateY(0) skewY(0deg);
  }
  to {
    transform: translateY(-220px) skewY(-7deg);
  }
}

@keyframes fuel-hero-background-drift {
  from {
    transform: translateY(0) scale(1.04);
  }
  to {
    transform: translateY(-12svh) scale(1.12);
  }
}

@keyframes fuel-hero-exit {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0.38;
    transform: translateY(-10svh);
  }
}

@keyframes fuel-enter-down {
  from {
    opacity: 0;
    transform: translateY(-24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fuel-enter-up {
  from {
    opacity: 0;
    transform: translateY(32px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fuel-mask-rise {
  from {
    clip-path: inset(100% 0 0 0);
    transform: translateY(24px);
  }
  to {
    clip-path: inset(0 0 0 0);
    transform: translateY(0);
  }
}

@keyframes fuel-view-reveal {
  from {
    opacity: 0.2;
    transform: translateY(36px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fuel-sticky-settle {
  from {
    transform: translateY(54px) scale(0.958);
  }
  to {
    transform: translateY(0) scale(1);
  }
}

@keyframes fuel-media-parallax {
  from {
    transform: translateY(6%) scale(1.12);
  }
  to {
    transform: translateY(-6%) scale(1.02);
  }
}

@keyframes bklit-bar-reveal {
  from {
    transform: scaleY(0.02);
    transform-box: fill-box;
    transform-origin: bottom;
  }
  to {
    transform: scaleY(1);
    transform-box: fill-box;
    transform-origin: bottom;
  }
}

@keyframes bklit-bar-fade {
  from {
    opacity: 0;
    filter: blur(2px);
    transform-box: fill-box;
  }
  to {
    opacity: 1;
    filter: blur(0);
    transform-box: fill-box;
  }
}

@media (prefers-reduced-motion: reduce) {
  .animate-bklit-bar-reveal,
  .animate-bklit-bar-fade {
    animation-duration: 1ms !important;
    animation-iteration-count: 1 !important;
  }
}

`,
    },
  ],
  rules: [
    ['animate-bklit-bar-reveal', {
      animation: 'bklit-bar-reveal 1100ms cubic-bezier(0.85, 0, 0.15, 1) both',
    }],
    ['animate-bklit-bar-fade', {
      animation: 'bklit-bar-fade 1100ms cubic-bezier(0.85, 0, 0.15, 1) both',
    }],
    ['chapter-shell-timeline', {
      'view-timeline-axis': 'block',
      'view-timeline-name': '--chapter-entry',
    }],
    ['chapter-cover-scroll', {
      'animation-range': 'entry 0% entry 100%',
      'animation-timeline': '--chapter-entry',
    }],
    ['chapter-cover-scroll-compact', {
      'animation-range': 'entry 0% entry 100%',
      'animation-timeline': 'view(block)',
    }],
    ['fuel-hero-background', {
      'animation-fill-mode': 'both',
      'animation-name': 'fuel-hero-background-drift',
      'animation-range': '0px 1200px',
      'animation-timeline': 'scroll(root block)',
      'animation-timing-function': 'linear',
    }],
    ['fuel-hero-exit', {
      'animation-fill-mode': 'both',
      'animation-name': 'fuel-hero-exit',
      'animation-range': '0px 1200px',
      'animation-timeline': 'scroll(root block)',
      'animation-timing-function': 'linear',
    }],
    ['fuel-view-reveal', {
      'animation-fill-mode': 'both',
      'animation-name': 'fuel-view-reveal',
      'animation-range': 'entry 4% cover 32%',
      'animation-timeline': 'view(block)',
      'animation-timing-function': 'cubic-bezier(0.22, 1, 0.36, 1)',
    }],
    ['fuel-sticky-settle', {
      'animation-fill-mode': 'both',
      'animation-name': 'fuel-sticky-settle',
      'animation-range': 'entry 0% cover 34%',
      'animation-timeline': 'view(block)',
      'animation-timing-function': 'cubic-bezier(0.22, 1, 0.36, 1)',
    }],
    ['fuel-media-parallax', {
      'animation-fill-mode': 'both',
      'animation-name': 'fuel-media-parallax',
      'animation-range': 'entry -10% exit 110%',
      'animation-timeline': 'view(block)',
      'animation-timing-function': 'linear',
      'transform-origin': 'center',
    }],
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
})
