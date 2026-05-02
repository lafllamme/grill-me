<script setup lang="ts">
import type { AnchorOffset, BurnControls, MeatAdjustment } from '../types'
import GrillSceneMeatAsset from './GrillSceneMeatAsset.vue'
import { steakConfig } from './meat-configs'

defineProps<{
  elapsed: number
  wobble: number
  heat: number
  anchorOffset: AnchorOffset
  burnControls: BurnControls
  adjustment: MeatAdjustment
}>()
</script>

<template>
  <GrillSceneMeatAsset
    :config="steakConfig"
    :elapsed="elapsed"
    :wobble="wobble"
    :heat="heat"
    :anchor-offset="anchorOffset"
    :burn-controls="burnControls"
    :adjustment="adjustment"
  />
</template>
