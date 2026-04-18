<script setup>
import { h, ref } from 'vue'

const CompA = () => h('div', 'Component A')
const CompB = () => h('div', 'Component B')

const activeComponent = ref(CompA)
</script>

<template>
  <div class="demo">
    <label>
      <input v-model="activeComponent" type="radio" :value="CompA"> A
    </label>
    <label>
      <input v-model="activeComponent" type="radio" :value="CompB"> B
    </label>
    <Transition name="fade" mode="out-in">
      <component :is="activeComponent" />
    </Transition>
  </div>
</template>
