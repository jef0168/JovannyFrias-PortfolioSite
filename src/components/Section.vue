<script setup lang="ts">
// Using v-motion-fade-visible or custom motion definition
defineProps<{
  delay?: number
}>()
</script>

<template>
  <div
    v-motion
    :initial="{ opacity: 0, y: 10 }"
    :enter="{ opacity: 1, y: 0, transition: { duration: 800, delay: (delay || 0) * 1000 } }"
    class="mb-6"
  >
    <slot />
  </div>
</template>
