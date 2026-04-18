<script setup>
import { ref } from 'vue'

const x = ref(0)

function onMousemove(e) {
  x.value = e.clientX
}
</script>

<template>
  <div
    :style="{ backgroundColor: `hsl(${x}, 80%, 50%)` }"
    class="demo movearea"
    @mousemove="onMousemove"
  >
    <p>Move your mouse across this div...</p>
    <p>x: {{ x }}</p>
  </div>
</template>

<style>
.movearea {
  color: #fff;
  transition: 0.3s background-color ease;
  border: none;
}
</style>
