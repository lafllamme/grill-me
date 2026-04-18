<script setup>
import { shallowRef } from 'vue'
import CompA from './CompA.vue'
import CompB from './CompB.vue'

defineProps({ useKeepAlive: Boolean })

const current = shallowRef(CompA)
</script>

<template>
  <div class="demo">
    <label><input v-model="current" type="radio" :value="CompA"> A</label>
    <label><input v-model="current" type="radio" :value="CompB"> B</label>
    <template v-if="useKeepAlive">
      <KeepAlive>
        <component :is="current" />
      </KeepAlive>
    </template>
    <template v-else>
      <component :is="current" />
    </template>
  </div>
</template>
