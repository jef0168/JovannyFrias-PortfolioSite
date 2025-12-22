<script setup lang="ts">
import { ref } from 'vue'

const route = useRoute()

const isMenuOpen = ref(false)

const links = [
  { name: 'Projects', path: '/projects' },
  { name: 'Posts', path: '/posts' },
  { name: 'Contact', path: '/contact' }
]

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}
</script>

<template>
  <nav class="fixed w-full z-10 bg-white/40 dark:bg-[#20202380] backdrop-blur-md transition-colors duration-200">
    <div class="container max-w-3xl mx-auto p-2 flex flex-wrap items-center justify-between">
      <div class="flex items-center mr-5">
        <h1 class="text-lg font-bold tracking-tighter">
          <Logo />
        </h1>
      </div>

      <!-- Desktop Menu -->
      <div class="hidden md:flex flex-grow items-center gap-4">
        <NuxtLink 
          v-for="link in links" 
          :key="link.path"
          :to="link.path"
          class="p-2 transition-colors duration-200 rounded-md"
          :class="[
            route.path === link.path 
              ? 'bg-teal-200 dark:bg-teal-700/30 text-[#202023]' 
              : 'text-[#202023] dark:text-gray-200'
          ]"
        >
          {{ link.name }}
        </NuxtLink>
        
        <a 
          href="https://www.linkedin.com/in/jovanny-frias/" 
          target="_blank"
          class="flex items-center gap-1 p-2 text-[#202023] dark:text-gray-200 hover:underline"
        >
          <!-- Simple LinkedIn Icon -->
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/>
          </svg>
          LinkedIn
        </a>

        <a 
          href="/Resume.pdf" 
          target="_blank"
          class="p-2 text-[#202023] dark:text-gray-200 hover:underline"
        >
          Resume
        </a>
      </div>

      <div class="flex-1 flex justify-end items-center gap-2">
        <!-- Theme Toggle Button -->
         <button class="p-2 rounded bg-orange-200 dark:bg-purple-900 transition-colors" @click="$colorMode.preference = $colorMode.value === 'dark' ? 'light' : 'dark'">
            {{ $colorMode.value === 'dark' ? '🌞' : '🌙' }}
         </button>

        <!-- Mobile Menu Button -->
        <div class="md:hidden relative">
          <button 
            @click="toggleMenu"
            class="p-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
            aria-label="Options"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path>
            </svg>
          </button>
          
          <!-- Mobile Dropdown -->
          <div 
            v-if="isMenuOpen" 
            class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 overflow-hidden z-20"
          >
             <NuxtLink to="/" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white" @click="isMenuOpen = false">About</NuxtLink>
             <NuxtLink to="/projects" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white" @click="isMenuOpen = false">Projects</NuxtLink>
             <NuxtLink to="/posts" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white" @click="isMenuOpen = false">Posts</NuxtLink>
             <a href="https://www.linkedin.com/in/jovanny-frias/" target="_blank" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white" @click="isMenuOpen = false">LinkedIn</a>
             <a href="/Resume.pdf" target="_blank" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white" @click="isMenuOpen = false">Resume</a>
             <NuxtLink to="/contact" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white" @click="isMenuOpen = false">Contact</NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>
