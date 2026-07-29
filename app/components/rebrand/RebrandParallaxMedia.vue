<template>
  <div class="relative overflow-hidden">
    <div
      aria-hidden="true"
      class="inset-[-7%] absolute fuel-media-parallax motion-reduce:transform-none motion-reduce:[animation:none]"
    >
      <slot name="media" />
    </div>
    <div class="inset-0 absolute z-10">
      <slot />
    </div>
  </div>
</template>
