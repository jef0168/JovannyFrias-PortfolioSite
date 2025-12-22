<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
  layout: 'default'
})

const activeTab = ref('Programming')
const tabs = ['Programming', 'Sneakers', 'Music']
</script>

<template>
  <div class="pt-4">
    <div class="rounded-lg bg-teal-200/50 dark:bg-white/10 p-3 mb-6 backdrop-blur-md text-center">
      Hello, I'm a full-stack developer based in Texas!
    </div>

    <div class="flex flex-col md:flex-row items-center gap-8 mb-6">
      <div class="flex-grow">
        <h2 class="text-3xl font-bold tracking-tighter font-m-plus mb-2">
          Jovanny Frias
        </h2>
        <p>Software Engineer</p>
        
        <!-- Social Links -->
        <div class="mt-4 flex gap-4">
            <a href="https://www.linkedin.com/in/jovanny-frias/" target="_blank" class="flex items-center gap-2 text-teal-600 dark:text-teal-200 hover:underline font-bold">
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/>
                 </svg>
                 @jovanny-frias
            </a>
        </div>
      </div>
      
      <div class="shrink-0 text-center">
         <div class="inline-block border-2 border-white dark:border-white/50 rounded-full overflow-hidden w-24 h-24 shadow-lg">
            <img src="/images/jovanny.png" alt="Profile Image" class="w-full h-full object-cover" />
         </div>
      </div>
    </div>
    
    <Section :delay="0.1">
      <h3 class="text-xl font-bold underline decoration-4 decoration-teal-500 underline-offset-4 mb-4 font-m-plus">
        Work
      </h3>
      <p class="mb-4">
         <!-- Link component logic for image button -->
         <a href="https://taxact.com" target="_blank" class="inline-block hover:opacity-80 transition-opacity">
            <img src="/images/taxact.jpg" alt="TaxAct" class="w-[75px] h-[75px] rounded-full" />
         </a>
      </p>

      <BioSection class="mb-3">
        <BioYear>2024 - Present</BioYear>
        Software Engineer 2 @ TaxAct (Dallas, TX)
        <Paragraph class="mt-2">
          I'm currently working as a Software Engineer 2 at TaxAct in Dallas, Texas.
        </Paragraph>
      </BioSection>

      <BioSection class="mb-3">
        <BioYear>2021 - 2024</BioYear>
        Software Engineer 1 @ TaxAct (Dallas, TX)
        <Paragraph class="mt-2">
            My team was responsible for the development and maintenance of the
            Payment Processing System for TaxAct. I've contributed in huge
            refactor efforts to improve and move our entire payment system from
            Chase Paymentech to Braintree by PayPal.
        </Paragraph>
      </BioSection>
    </Section>

    <Section :delay="0.2">
      <h3 class="text-xl font-bold underline decoration-4 decoration-teal-500 underline-offset-4 mb-4 font-m-plus">
        Life and Journey
      </h3>
      
      <BioSection class="mb-2">
        <BioYear>1999</BioYear>
        Born in Zacatecas, Mexico (🇲🇽)
      </BioSection>

      <BioSection class="mb-2">
        <BioYear>2000</BioYear>
        Moved to Fort Worth, TX, USA (🇺🇸)
      </BioSection>

      <BioSection class="mb-2">
        <BioYear>2017</BioYear>
        Graduated from Southwest High School in Fort Worth, TX.
        <Paragraph class="mt-1">
          Learned a ton of life lessons from my experience in one of the top
          bands in the state of Texas as a French Horn / Mellophone player. My
          passion for music and performing still lives on today and the
          discipline learned from my time in band has helped me in my current
          career as a Software Engineer. 🎺
        </Paragraph>
      </BioSection>

      <BioSection class="mb-2">
        <BioYear>2020</BioYear>
        Graduated with a Bachelors of Science in Computer Science from the University of North Texas in Denton, TX (🇺🇸)
      </BioSection>

       <BioSection class="mb-2">
        <BioYear>2023</BioYear>
        Engaged to my beautiful fiance!
      </BioSection>

      <BioSection class="mb-2">
        <BioYear>2024</BioYear>
        Moved to Burleson, TX
      </BioSection>

      <BioSection class="mb-2">
        <BioYear>2024</BioYear>
          Got married!
      </BioSection>
    </Section>
  </div>
</template>
