<script setup lang="ts">
import type { AnchorOffset, BurnControls, MeatAdjustmentMap } from './types'
import GrillSceneBacon from './meats/GrillSceneBacon.vue'
import GrillSceneSausage from './meats/GrillSceneSausage.vue'
import GrillSceneSteak from './meats/GrillSceneSteak.vue'

interface GrillSceneMeatsProps {
  elapsed: number
  wobble: number
  heat: number
  anchorOffset: AnchorOffset
  burnControls: BurnControls
  adjustments: MeatAdjustmentMap
}

defineProps<GrillSceneMeatsProps>()
</script>

<template>
  <GrillSceneSausage
    :elapsed="elapsed"
    :wobble="wobble"
    :heat="heat"
    :anchor-offset="anchorOffset"
    :burn-controls="burnControls"
    :adjustment="adjustments.sausage"
  />
  <GrillSceneSteak
    :elapsed="elapsed"
    :wobble="wobble"
    :heat="heat"
    :anchor-offset="anchorOffset"
    :burn-controls="burnControls"
    :adjustment="adjustments.steak"
  />
  <GrillSceneBacon
    :elapsed="elapsed"
    :wobble="wobble"
    :heat="heat"
    :anchor-offset="anchorOffset"
    :burn-controls="burnControls"
    :adjustment="adjustments.bacon"
  />
</template>
