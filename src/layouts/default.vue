<script setup lang="ts">
// import Computer from '~/components/Computer.vue' // Will import later
</script>

<template>
  <div class="min-h-screen bg-[#f0e7db] dark:bg-[#202023] text-[#202023] dark:text-[#eeeeee] transition-colors duration-200">
    <Head>
      <Title>Jovanny Frias - Homepage</Title>
      <Meta name="viewport" content="width=device-width, initial-scale=1" />
    </Head>

    <Navbar />

    <div class="container max-w-3xl mx-auto pt-14 px-4">
      <ClientOnly>
          <Computer />
      </ClientOnly> 
      
      <slot />
    </div>

    <ClientOnly>
       <div class="mt-8">
           <Skateboard />
       </div>
    </ClientOnly>
  </div>
</template>
