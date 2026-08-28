<script lang="ts" setup>
import { useHead } from '#imports'
import AppSmoothScroll from '~/components/AppSmoothScroll.vue'

useHead({
  title: 'grillme.dev | GitHub Roast',
  htmlAttrs: {
    lang: 'en',
  },
  link: [
    {
      rel: 'preload',
      href: '/fonts/fontshare/general-sans/General-Sans__Variable.woff2',
      as: 'font',
      type: 'font/woff2',
      crossorigin: 'anonymous',
    },
    {
      rel: 'preload',
      href: '/fonts/fontshare/azeret-mono/Azeret-Mono__Variable.woff2',
      as: 'font',
      type: 'font/woff2',
      crossorigin: 'anonymous',
    },
  ],
})
</script>

<template>
  <AppSmoothScroll>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </AppSmoothScroll>
</template>
