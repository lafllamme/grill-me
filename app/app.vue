<script lang="ts" setup>
import { useHead } from '#imports'

useHead({
  title: 'grillme.dev | GitHub Roast',
  htmlAttrs: {
    lang: 'en',
  },
})
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
