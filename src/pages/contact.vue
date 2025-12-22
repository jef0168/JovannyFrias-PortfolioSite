<script setup lang="ts">
import { ref } from 'vue'
import emailjs from '@emailjs/browser'

definePageMeta({
  layout: 'default'
})

const form = ref(null)
const showSuccess = ref(false)
const isSubmitting = ref(false)

const sendEmail = () => {
    if (!form.value) return

    isSubmitting.value = true
    
    // Using the original service/template IDs and public key from the legacy code
    emailjs.sendForm('service_sd8gc3h', 'template_od3xnbs', form.value, 'TZ-qrvmW-85tlD7YU')
        .then((result) => {
            console.log('Email successfully sent!', result.text)
            showSuccess.value = true
            isSubmitting.value = false
            // Optional: reset form
            // (form.value as HTMLFormElement).reset() 
        }, (error) => {
            console.log('Email failed...', error.text)
            alert("Failed to send email. Please try again.")
            isSubmitting.value = false
        })
}
</script>

<template>
  <div class="pt-4">
    <!-- Success Alert -->
    <div v-if="showSuccess" class="mb-5 p-4 rounded-md bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-700 text-center">
        <div class="flex flex-col items-center">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-green-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
             <h3 class="text-lg font-bold text-green-800 dark:text-green-100">Email submitted!</h3>
             <p class="text-green-700 dark:text-green-200">Thanks for reaching out! Will be in touch soon!</p>
        </div>
    </div>

    <div class="mb-6 p-3 rounded-lg bg-teal-200/50 dark:bg-teal-700/30 text-center font-bold">
        Contact Me
    </div>

    <form ref="form" @submit.prevent="sendEmail" class="flex flex-col gap-4 max-w-md mx-auto">
        <div class="flex flex-col">
            <label class="mb-1 font-medium">Name</label>
            <input required type="text" name="from_name" placeholder="John Doe" class="p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#202023] focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        
        <div class="flex flex-col">
            <label class="mb-1 font-medium">Email</label>
            <input required type="email" name="user_email" placeholder="johndoe@email.com" class="p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#202023] focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        
        <div class="flex flex-col">
            <label class="mb-1 font-medium">Message</label>
            <textarea required name="message" placeholder="Message" rows="4" class="p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#202023] focus:outline-none focus:ring-2 focus:ring-teal-500"></textarea>
        </div>

        <button 
            type="submit" 
            :disabled="isSubmitting"
            class="mt-2 py-2 px-4 rounded bg-teal-500 hover:bg-teal-600 text-white font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {{ isSubmitting ? 'Sending...' : 'Submit Email' }}
        </button>
    </form>
  </div>
</template>
