<script lang="ts" setup>
import { useHead } from '#imports'
import AppSmoothScroll from '~/components/AppSmoothScroll.vue'

useHead({
  title: 'grillme.dev | GitHub Roast',
  htmlAttrs: {
    lang: 'en',
  },
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
