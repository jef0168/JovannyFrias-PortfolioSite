<script setup lang="ts">
</script>

<template>
  <NuxtLink to="/" class="group flex items-center p-2.5 gap-2 text-lg font-bold tracking-tighter text-gray-800 dark:text-white/90">
    <!-- Using a simple icon or image conditionally based on color mode if needed, for now hardcoding or using CSS filter -->
    <div class="transition-transform duration-200 group-hover:-translate-y-0.5">
       <!-- Placeholder for image/icon logic. 
            In the original it swapped images based on color mode. 
            In Tailwind/Nuxt we can use the 'dark:' modifier or a computed prop with color mode. -->
      <img src="/images/computer.png" width="40" height="50" alt="Logo" class="dark:hidden" />
      <img src="/images/computer-dark.png" width="40" height="50" alt="Logo" class="hidden dark:block" />
    </div>
    <span class="font-m-plus">
      Jovanny Frias
    </span>
  </NuxtLink>
</template>

<!-- 
NOTE: "font-m-plus" is a custom font family we might need to configure in tailwind config or CSS.
For now, standard sans is fine, or we add it later.
-->
