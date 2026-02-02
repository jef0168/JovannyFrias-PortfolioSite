<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import FlowerGardenGame from '~/components/FlowerGardenGame.vue'

definePageMeta({
  layout: 'secret'
})

// =============================================================================
// CONFIGURATION
// =============================================================================

// Password: Nanami's first name - her favorite JJK character
const PASSWORD = 'kento'
const PASSWORD_HINT = "Hint: What's the first name of your favorite salaryman who HATES overtime? (JJK)"

// =============================================================================
// WINGMEN - NANAMI & LEON
// =============================================================================

// Conversation system - they take turns and sometimes talk to each other!
interface DialogueLine {
  speaker: 'nanami' | 'leon'
  text: string
}

const CONVERSATIONS: Record<string, DialogueLine[]> = {
  password: [
    { speaker: 'nanami', text: "I don't usually do overtime, but for Jovanny? I'll make an exception." },
    { speaker: 'leon', text: "Overtime? Try surviving Raccoon City. This guy's dedication is the real deal." },
    { speaker: 'nanami', text: "Leon, we're trying to be encouraging here, not traumatize her." },
    { speaker: 'leon', text: "Right, sorry. Point is - Jovanny's got skills. Professional level." },
    { speaker: 'nanami', text: "If you need a hint... think about who's talking to you right now." },
    { speaker: 'leon', text: "A guy who codes a whole Valentine's page? That's commitment." },
    { speaker: 'nanami', text: "This man coded an entire experience just for you. Ratio: 10/10." },
    { speaker: 'leon', text: "I've seen a lot of crazy things, but this? This is actually sweet." }
  ],
  error: [
    { speaker: 'leon', text: "System error? I've dealt with worse. Way worse." },
    { speaker: 'nanami', text: "Don't worry. Jovanny has this under control." },
    { speaker: 'leon', text: "Every mission has obstacles. He knows how to handle them." },
    { speaker: 'nanami', text: "As someone who values competence... he's got it." },
    { speaker: 'leon', text: "In situations like this, you need someone reliable. That's Jovanny." },
    { speaker: 'nanami', text: "I've analyzed the situation. Jovanny is worth it. Trust me." },
    { speaker: 'leon', text: "Trust the process. And trust him." },
    { speaker: 'nanami', text: "A system error? He'll fix it. He's reliable like that." }
  ],
  game: [
    { speaker: 'nanami', text: "You've got this. Jovanny believes in you." },
    { speaker: 'leon', text: "Keep moving. Stay focused. You can handle this." },
    { speaker: 'nanami', text: "He made this game just for you. Quite romantic, honestly." },
    { speaker: 'leon', text: "This reminds me of a mission... except with more hearts and less zombies." },
    { speaker: 'nanami', text: "Leon, not everything is about zombies." },
    { speaker: 'leon', text: "You'd be surprised. Anyway - Jovanny's rooting for you. So am I." },
    { speaker: 'nanami', text: "Focus. Collect the hearts. Don't let him down." },
    { speaker: 'leon', text: "He built this whole thing for you. That's dedication." },
    { speaker: 'nanami', text: "I don't say this often, but... you two are a good match." },
    { speaker: 'leon', text: "He's put in the work. Now show him what you've got." },
    { speaker: 'nanami', text: "Between you and me, he's been planning this for a while." },
    { speaker: 'leon', text: "No pressure, but... he really cares about you." }
  ],
  win: [
    { speaker: 'leon', text: "Mission accomplished. Nice work." },
    { speaker: 'nanami', text: "Excellent work. Jovanny chose well." },
    { speaker: 'leon', text: "That's what I call a successful operation." },
    { speaker: 'nanami', text: "System restored. Just like his faith in you." },
    { speaker: 'leon', text: "Knew you could do it. Jovanny did too." },
    { speaker: 'nanami', text: "Mission accomplished. He knew you could do it." }
  ],
  reveal: [
    { speaker: 'nanami', text: "He's asking you to be his Valentine. I'd recommend saying yes." },
    { speaker: 'leon', text: "I don't usually get involved in these things, but... say yes." },
    { speaker: 'nanami', text: "Jovanny is a good man. Hardworking. Dedicated. Like myself." },
    { speaker: 'leon', text: "Did you just compare yourself to him?" },
    { speaker: 'nanami', text: "It's a compliment, Leon." },
    { speaker: 'leon', text: "Fair enough. In my experience, guys like Jovanny are rare. Don't let him go." },
    { speaker: 'nanami', text: "Between us... he really loves you. It's obvious." },
    { speaker: 'leon', text: "I've saved the world a few times. Trust me on this one." },
    { speaker: 'nanami', text: "The correct answer here is clear. Don't overthink it." },
    { speaker: 'leon', text: "This is the part where you say yes. Just saying." },
    { speaker: 'nanami', text: "I've seen a lot of cursed spirits. This? This is blessed." },
    { speaker: 'leon', text: "He's a keeper. Take it from someone who knows." },
    { speaker: 'nanami', text: "As a professional, I can confirm: he's a keeper." }
  ],
  celebration: [
    { speaker: 'leon', text: "Good choice. I knew you'd make the right call." },
    { speaker: 'nanami', text: "Congratulations. You've made a wise choice." },
    { speaker: 'leon', text: "Mission complete. Now enjoy your Valentine's Day." },
    { speaker: 'nanami', text: "Jovanny is lucky to have you. Remember that." },
    { speaker: 'leon', text: "Jovanny's lucky to have you. But you're lucky to have him too." },
    { speaker: 'nanami', text: "This is what happiness looks like. I approve." },
    { speaker: 'leon', text: "This is what winning looks like. Congratulations." },
    { speaker: 'nanami', text: "Now if you'll excuse me, it's past 6pm. I'm off the clock." },
    { speaker: 'leon', text: "My work here is done. Time to move on to the next mission." },
    { speaker: 'nanami', text: "Leon, you can't just leave every situation like it's a mission." },
    { speaker: 'leon', text: "Watch me. You two are going to be just fine. Trust me." },
    { speaker: 'nanami', text: "He's going to treat you right. I guarantee it." }
  ]
}

// Wingman conversation state
const showNanami = ref(true)
const showLeon = ref(true)
const currentNanamiLine = ref('')
const currentLeonLine = ref('')
const currentSpeaker = ref<'nanami' | 'leon' | null>(null)
const conversationIndex = ref(0)
let conversationInterval: number | null = null

function startConversation(stageKey: string) {
  if (conversationInterval) clearInterval(conversationInterval)

  const conversation = CONVERSATIONS[stageKey] || []
  if (conversation.length === 0) return

  conversationIndex.value = 0
  showNextLine(conversation)

  // Show line for 5 seconds, then hide for 2 seconds before next line
  conversationInterval = window.setInterval(() => {
    // Hide current line after 5 seconds
    setTimeout(() => {
      currentNanamiLine.value = ''
      currentLeonLine.value = ''
      currentSpeaker.value = null
    }, 5000)

    // Move to next line (shown at the start of next interval)
    conversationIndex.value = (conversationIndex.value + 1) % conversation.length
    showNextLine(conversation)
  }, 7000)
}

function showNextLine(conversation: DialogueLine[]) {
  const line = conversation[conversationIndex.value]
  if (!line) return

  currentSpeaker.value = line.speaker

  if (line.speaker === 'nanami') {
    currentNanamiLine.value = line.text
    currentLeonLine.value = '' // Clear Leon's line
  } else {
    currentLeonLine.value = line.text
    currentNanamiLine.value = '' // Clear Nanami's line
  }
}

function stopConversation() {
  if (conversationInterval) clearInterval(conversationInterval)
  currentNanamiLine.value = ''
  currentLeonLine.value = ''
  currentSpeaker.value = null
}

// =============================================================================
// STAGE MANAGEMENT
// =============================================================================

type Stage = 'password' | 'error' | 'game' | 'win' | 'reveal' | 'celebration'
const stage = ref<Stage>('password')

// =============================================================================
// PASSWORD STAGE
// =============================================================================

const passwordInput = ref('')
const passwordError = ref(false)
const passwordShake = ref(false)

function checkPassword() {
  if (passwordInput.value.toLowerCase().trim() === PASSWORD) {
    stage.value = 'error'
    startDiagnostics()
  } else {
    passwordError.value = true
    passwordShake.value = true
    setTimeout(() => {
      passwordShake.value = false
    }, 500)
  }
}

// =============================================================================
// ERROR/DIAGNOSTICS STAGE
// =============================================================================

const diagnosticLines = ref<string[]>([])
const diagnosticsComplete = ref(false)

const diagnosticMessages = [
  '> Initializing love.exe...',
  '> ERROR: Valentine not found in system registry',
  '> Scanning for romantic compatibility...',
  '> Found: Perfect match detected!',
  '> Loading memories... [████████████] 100%',
  '> Checking BTS concert tickets... VALID',
  '> Analyzing anime watchlist... IMPRESSIVE',
  '> Jujutsu Kaisen references... LOADED',
  '> Nanami-level dedication... CONFIRMED',
  '> Heart capacity... OVERFLOWING',
  '> Recovery protocol available.',
  '> Awaiting user input...'
]

function startDiagnostics() {
  diagnosticLines.value = []
  let i = 0
  const interval = setInterval(() => {
    if (i < diagnosticMessages.length) {
      const msg = diagnosticMessages[i]
      if (msg) diagnosticLines.value.push(msg)
      i++
    } else {
      clearInterval(interval)
      diagnosticsComplete.value = true
    }
  }, 400)
}

function startRecovery() {
  stage.value = 'game'
}

function handleGameWin() {
  setTimeout(() => {
    stage.value = 'win'
    setTimeout(() => {
      stage.value = 'reveal'
    }, 3000)
  }, 1000)
}

// =============================================================================
// MINI-GAME STAGE - Animal Crossing Style Flower Garden
// =============================================================================


// =============================================================================
// WIN ANIMATION STAGE
// =============================================================================

const systemRestoredText = ref('')
const fullSystemText = 'SYSTEM RESTORED'

function typeSystemRestored() {
  let i = 0
  const interval = setInterval(() => {
    if (i < fullSystemText.length) {
      systemRestoredText.value = fullSystemText.substring(0, i + 1)
      i++
    } else {
      clearInterval(interval)
    }
  }, 100)
}

watch(stage, (newStage) => {
  if (newStage === 'win') {
    systemRestoredText.value = ''
    typeSystemRestored()
  }

  // Start wingman conversation for each stage
  startConversation(newStage)
})

// =============================================================================
// REVEAL STAGE - Pleading Interaction
// =============================================================================

const noClickCount = ref(0)
const showSadCat = ref(false)
const currentSadImage = ref('')
const noButtonText = ref('No 💩')
let celebrationAudio: HTMLAudioElement | null = null

const NO_TEXTS = [
  "No 💩",
  "Are you sure? 🥺",
  "Pretty please? 🥺",
  "Don't do this to me... 😭",
  "I'll give you all the BTS tickets! 🎟️",
  "Nanami would be disappointed... ✨",
  "Leon is judging you... 🔫",
  "Just one 'Yes'? 👉👈",
  "You're breaking my heart! 💔",
  "I'm not giving up! 🔥"
]

const SAD_IMAGES = [
  '/images/sad-cat1.jpg',
  '/images/sad-cat2.jpg',
  '/images/sad-cat3.jpg',
  '/images/sad-emoji.gif'
]

function handleNoClick() {
  noClickCount.value++
  
  // Cycle button text indefinitely
  const textIndex = noClickCount.value % NO_TEXTS.length
  noButtonText.value = NO_TEXTS[textIndex] || "No 💩"
  
  // Show random sad cat
  const randomImage = SAD_IMAGES[Math.floor(Math.random() * SAD_IMAGES.length)]
  currentSadImage.value = randomImage || ''
  showSadCat.value = true
  
  // Hide cat after a bit
  setTimeout(() => {
    showSadCat.value = false
  }, 2000)
}

function sayYes() {
  stage.value = 'celebration'
  
  // Play Sao Paulo for 30 seconds
  celebrationAudio = new Audio('/sound/saopaulo.mp3')
  celebrationAudio.play().catch(e => console.log('Audio play failed:', e))
  
  setTimeout(() => {
    if (celebrationAudio) {
      celebrationAudio.pause()
      celebrationAudio = null
    }
  }, 120000)
}

// =============================================================================
// CELEBRATION STAGE
// =============================================================================

// Simple celebration - no Instagram stuff

// Start wingmen conversation on mount
onMounted(() => {
  startConversation('password')
})

// Cleanup
onUnmounted(() => {
  stopConversation()
  if (celebrationAudio) {
    celebrationAudio.pause()
    celebrationAudio = null
  }
})
</script>

<template>
  <div class="secret-page" :class="{ 'dreamy-theme': stage === 'reveal' || stage === 'celebration' }">

    <!-- PASSWORD STAGE -->
    <div v-if="stage === 'password'" class="stage password-stage">
      <div class="password-container" :class="{ shake: passwordShake }">
        <div class="lock-icon">🔐</div>
        <h1>Secret Area</h1>
        <p class="hint">{{ PASSWORD_HINT }}</p>

        <div class="input-group">
          <input
            v-model="passwordInput"
            type="password"
            placeholder="Enter password..."
            @keyup.enter="checkPassword"
            class="password-input"
            :class="{ error: passwordError }"
          />
          <button @click="checkPassword" class="submit-btn">
            Enter
          </button>
        </div>

        <p v-if="passwordError" class="error-text">
          Incorrect password. Try again!
        </p>
      </div>
    </div>

    <!-- ERROR/DIAGNOSTICS STAGE -->
    <div v-if="stage === 'error'" class="stage error-stage">
      <div class="error-container">
        <div class="glitch-text">
          <h1 data-text="404">404</h1>
        </div>
        <h2 class="error-subtitle">Valentine Not Found</h2>

        <div class="console">
          <div class="console-header">
            <span class="dot red"></span>
            <span class="dot yellow"></span>
            <span class="dot green"></span>
            <span class="console-title">love_recovery.exe</span>
          </div>
          <div class="console-body">
            <p v-for="(line, i) in diagnosticLines" :key="i" class="console-line">
              {{ line }}
            </p>
            <span class="cursor" v-if="!diagnosticsComplete">_</span>
          </div>
        </div>

        <button
          v-if="diagnosticsComplete"
          @click="startRecovery"
          class="recovery-btn"
        >
          <span class="btn-icon">⚡</span>
          RUN RECOVERY
        </button>
      </div>
    </div>

    <!-- GAME STAGE -->
    <div v-if="stage === 'game'" class="stage game-stage">
      <FlowerGardenGame @win="handleGameWin" />
    </div>

    <!-- WIN ANIMATION STAGE -->
    <div v-if="stage === 'win'" class="stage win-stage">
      <div class="win-container">
        <div class="system-restored">
          <span v-for="(char, i) in systemRestoredText" :key="i" class="restored-char">
            {{ char }}
          </span>
        </div>
        <div class="loading-bar">
          <div class="loading-fill"></div>
        </div>
        <div class="hearts-float">
          <span v-for="i in 12" :key="i" class="floating-heart" :style="{ animationDelay: `${i * 0.1}s` }">
            💜
          </span>
        </div>
      </div>
    </div>

    <!-- REVEAL STAGE -->
    <div v-if="stage === 'reveal'" class="stage reveal-stage">
      <div class="reveal-container">
        <!-- Sad Cat Popup -->
        <Transition name="cat-pop">
          <div v-if="showSadCat" class="sad-cat-popup">
            <img :src="currentSadImage" alt="Sad Cat" />
          </div>
        </Transition>

        <div class="sparkles">
          <span v-for="i in 30" :key="i" class="sparkle" :style="{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`
          }">✨</span>
        </div>

        <h1 class="reveal-title">Will you be my Valentine?</h1>

        <p class="reveal-subtitle">💜 I love you more than anything 💜</p>

        <div class="button-container">
          <button @click="sayYes" class="yes-btn">
            Yes! 💜
          </button>

          <button
            class="no-btn static"
            @click="handleNoClick"
          >
            {{ noButtonText }}
          </button>
        </div>
      </div>
    </div>

    <!-- CELEBRATION STAGE -->
    <div v-if="stage === 'celebration'" class="stage celebration-stage">
      <div class="celebration-container">
        <div class="confetti">
          <span v-for="i in 60" :key="i" class="confetti-piece" :style="{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            backgroundColor: ['#9b59b6', '#ff6b9d', '#FFD700', '#87CEEB', '#fff'][i % 5]
          }"></span>
        </div>

        <div class="celebration-hearts">
          <span v-for="i in 20" :key="i" class="float-heart" :style="{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 4}s`
          }">💜</span>
        </div>

        <div class="celebration-gif">
          <img src="/images/bear-kiss-bear-kisses.gif" alt="Bears Kissing" />
        </div>
        <h1 class="celebration-title">💜 Yay! 💜</h1>
        <p class="celebration-subtitle">I knew you'd say yes!</p>

        <div class="love-message">
          <p>You're the best part of my every day.</p>
          <p>I'm so incredibly lucky to have you in my life.</p>
          <p>Thank you for being my favorite adventure.</p>
          <p class="borahae">I love you forever! 💜</p>
        </div>

        <div class="final-hearts">
          💜💜💜💜💜💜💜
        </div>
      </div>
    </div>

    <!-- WINGMEN -->
    <!-- Nanami Wingman -->
    <Transition name="nanami-slide">
      <div v-if="showNanami" class="nanami-wingman" :class="{ 'is-dimmed': currentSpeaker !== 'nanami' }">
        <img src="/images/nanami.png" alt="Nanami" class="wingman-image" :class="{ 'is-speaking': currentSpeaker === 'nanami' }" />
        <Transition name="subtitle-fade" mode="out-in">
          <div v-if="currentNanamiLine" :key="currentNanamiLine" class="wingman-subtitle">
            <div class="subtitle-text">{{ currentNanamiLine }}</div>
          </div>
        </Transition>
      </div>
    </Transition>

    <!-- Leon Wingman -->
    <Transition name="leon-slide">
      <div v-if="showLeon" class="leon-wingman" :class="{ 'is-dimmed': currentSpeaker !== 'leon' }">
        <img src="/images/leon.png" alt="Leon" class="wingman-image" :class="{ 'is-speaking': currentSpeaker === 'leon' }" />
        <Transition name="subtitle-fade" mode="out-in">
          <div v-if="currentLeonLine" :key="currentLeonLine" class="wingman-subtitle">
            <div class="subtitle-text">{{ currentLeonLine }}</div>
          </div>
        </Transition>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* =============================================================================
   BASE STYLES
   ============================================================================= */

.secret-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 50%, #1a0a2e 100%);
  color: #fff;
  font-family: 'Segoe UI', system-ui, sans-serif;
  overflow-x: hidden;
  transition: background 1s ease;
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
  overscroll-behavior: none;
}

.secret-page.dreamy-theme {
  background: linear-gradient(135deg, #2d1b4e 0%, #4a1a6b 30%, #6b2d7b 60%, #8b4a8b 100%);
}

.stage {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

/* =============================================================================
   PASSWORD STAGE
   ============================================================================= */

.password-container {
  text-align: center;
  max-width: 400px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.password-container.shake {
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

.lock-icon {
  font-size: 60px;
  margin-bottom: 20px;
}

.password-container h1 {
  font-size: 28px;
  margin-bottom: 10px;
  color: #9b59b6;
}

.hint {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  margin-bottom: 30px;
  line-height: 1.5;
}

.input-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

.password-input {
  flex: 1;
  min-width: 200px;
  padding: 15px 20px;
  border: 2px solid rgba(155, 89, 182, 0.5);
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.3);
  color: #fff;
  font-size: 16px;
  outline: none;
  transition: border-color 0.3s;
}

.password-input:focus {
  border-color: #9b59b6;
}

.password-input.error {
  border-color: #e74c3c;
}

.submit-btn {
  padding: 15px 30px;
  background: linear-gradient(135deg, #9b59b6, #8e44ad);
  border: none;
  border-radius: 10px;
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(155, 89, 182, 0.4);
}

.error-text {
  color: #e74c3c;
  margin-top: 15px;
  font-size: 14px;
}

/* =============================================================================
   ERROR/DIAGNOSTICS STAGE
   ============================================================================= */

.error-container {
  text-align: center;
  max-width: 600px;
}

.glitch-text h1 {
  font-size: 120px;
  font-weight: bold;
  color: #ff6b9d;
  text-shadow:
    0 0 10px #ff6b9d,
    0 0 20px #ff6b9d,
    0 0 40px #ff6b9d;
  animation: glitch 2s infinite;
  position: relative;
}

@keyframes glitch {
  0%, 90%, 100% {
    text-shadow: 0 0 10px #ff6b9d, 0 0 20px #ff6b9d;
    transform: translate(0);
  }
  92% {
    text-shadow: -5px 0 #00fff9, 5px 0 #ff00ff;
    transform: translate(-2px, 2px);
  }
  94% {
    text-shadow: 5px 0 #00fff9, -5px 0 #ff00ff;
    transform: translate(2px, -2px);
  }
  96% {
    text-shadow: -5px 0 #ff00ff, 5px 0 #00fff9;
    transform: translate(-1px, 1px);
  }
}

.error-subtitle {
  font-size: 24px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 30px;
}

.console {
  background: #0d0d0d;
  border-radius: 10px;
  overflow: hidden;
  text-align: left;
  margin-bottom: 30px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.console-header {
  background: #2d2d2d;
  padding: 10px 15px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.dot.red { background: #ff5f56; }
.dot.yellow { background: #ffbd2e; }
.dot.green { background: #27ca40; }

.console-title {
  margin-left: 10px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.console-body {
  padding: 20px;
  min-height: 200px;
  max-height: 300px;
  overflow-y: auto;
  font-family: 'Courier New', monospace;
  font-size: 14px;
}

.console-line {
  margin: 5px 0;
  color: #00ff00;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

.cursor {
  animation: blink 1s infinite;
  color: #00ff00;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.recovery-btn {
  padding: 20px 40px;
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  border: none;
  border-radius: 10px;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  animation: pulse 2s infinite;
  transition: transform 0.2s;
}

.recovery-btn:hover {
  transform: scale(1.05);
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.7); }
  50% { box-shadow: 0 0 0 15px rgba(231, 76, 60, 0); }
}

.btn-icon {
  font-size: 24px;
}


.retry-btn:hover {
  transform: scale(1.05);
}

/* =============================================================================
   WIN ANIMATION STAGE
   ============================================================================= */

.win-container {
  text-align: center;
}

.system-restored {
  font-size: 48px;
  font-weight: bold;
  color: #27ae60;
  text-shadow: 0 0 20px #27ae60;
  margin-bottom: 30px;
  min-height: 60px;
}

.restored-char {
  display: inline-block;
  animation: charPop 0.3s ease;
}

@keyframes charPop {
  0% { transform: scale(0) rotate(-10deg); opacity: 0; }
  50% { transform: scale(1.3); }
  100% { transform: scale(1) rotate(0); opacity: 1; }
}

.loading-bar {
  width: 300px;
  height: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
  margin: 0 auto 30px;
}

.loading-fill {
  height: 100%;
  background: linear-gradient(90deg, #9b59b6, #ff6b9d, #9b59b6);
  background-size: 200% 100%;
  animation: loading 2s ease-in-out forwards, shimmer 1s infinite;
  border-radius: 10px;
}

@keyframes loading {
  0% { width: 0; }
  100% { width: 100%; }
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.hearts-float {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.floating-heart {
  font-size: 30px;
  animation: float 2s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

/* =============================================================================
   REVEAL STAGE
   ============================================================================= */

.reveal-stage {
  touch-action: pan-y;
}

.reveal-container {
  text-align: center;
  width: 100%;
  max-width: 500px;
  position: relative;
  padding: 100px 20px 40px;
  min-height: 700px;
}

.sparkles {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.sparkle {
  position: absolute;
  font-size: 20px;
  animation: sparkle 3s ease-in-out infinite;
}

@keyframes sparkle {
  0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
  50% { opacity: 1; transform: scale(1) rotate(180deg); }
}

.reveal-title {
  font-size: 36px;
  color: #fff;
  text-shadow: 0 0 30px rgba(155, 89, 182, 0.8);
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
  animation: revealTitle 1s ease-out;
}

@keyframes revealTitle {
  0% { opacity: 0; transform: scale(0.5); }
  100% { opacity: 1; transform: scale(1); }
}

.reveal-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 40px;
  position: relative;
  z-index: 1;
}

.button-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
  min-height: auto;
  width: 100%;
  padding-top: 20px;
}

.yes-btn {
  padding: 25px 60px;
  border: none;
  border-radius: 20px;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
  background: linear-gradient(135deg, #ff6b9d, #ff8fab);
  color: #fff;
  box-shadow: 0 8px 40px rgba(255, 107, 157, 0.5);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  z-index: 3;
  position: relative;
}

.yes-btn:hover {
  transform: scale(1.15);
  box-shadow: 0 12px 50px rgba(255, 107, 157, 0.7);
}

.yes-btn:active {
  transform: scale(1.05);
}

.no-btn {
  position: relative;
  margin-top: 40px;
  padding: 12px 28px;
  background: linear-gradient(135deg, #636e72, #7f8c8d);
  border: none;
  border-radius: 10px;
  font-size: 14px;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 2;
  user-select: none;
  opacity: 1;
}

/* Remove hover background change - button just runs away */

.running-hint {
  position: relative;
  z-index: 1;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  margin-top: 20px;
  font-style: italic;
}

/* =============================================================================
   CELEBRATION STAGE
   ============================================================================= */

.celebration-gif {
  margin-bottom: 20px;
  animation: scale-in 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex;
  justify-content: center;
  width: 100%;
}

.celebration-gif img {
  width: 200px;
  height: auto;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(155, 89, 182, 0.4);
  border: 4px solid rgba(255, 255, 255, 0.2);
}

@keyframes scale-in {
  from { transform: scale(0); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.celebration-container {
  text-align: center;
  max-width: 500px;
  position: relative;
  padding: 40px 20px;
}

.confetti {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.confetti-piece {
  position: absolute;
  width: 10px;
  height: 10px;
  top: -20px;
  animation: confettiFall 4s linear infinite;
}

@keyframes confettiFall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}

.celebration-hearts {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.float-heart {
  position: absolute;
  font-size: 30px;
  bottom: -50px;
  animation: floatUp linear infinite;
}

@keyframes floatUp {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(-110vh) rotate(360deg);
    opacity: 0;
  }
}

.celebration-title {
  font-size: 52px;
  margin-bottom: 10px;
  animation: bounce 1s ease infinite;
  position: relative;
  z-index: 1;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.celebration-subtitle {
  font-size: 22px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 40px;
  position: relative;
  z-index: 1;
}

.love-message {
  background: rgba(255, 255, 255, 0.1);
  padding: 30px;
  border-radius: 20px;
  margin-bottom: 30px;
  position: relative;
  z-index: 1;
  backdrop-filter: blur(10px);
}

.love-message p {
  font-size: 18px;
  margin: 10px 0;
  color: rgba(255, 255, 255, 0.9);
}

.love-message .borahae {
  font-size: 24px;
  font-weight: bold;
  color: #9b59b6;
  margin-top: 20px;
}

.final-hearts {
  font-size: 36px;
  animation: pulse-hearts 2s ease-in-out infinite;
  position: relative;
  z-index: 1;
}

@keyframes pulse-hearts {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

/* =============================================================================
   WINGMEN - Anime Style (Nanami & Leon)
   ============================================================================= */

/* Nanami - Bottom Right */
.nanami-wingman {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  max-width: 400px;
}

/* Leon - Bottom Left */
.leon-wingman {
  position: fixed;
  bottom: 30px;
  left: 30px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  max-width: 400px;
}

/* Shared wingman image styles */
.wingman-image {
  width: 140px;
  height: 140px;
  object-fit: contain;
  filter: drop-shadow(0 8px 25px rgba(155, 89, 182, 0.6)) grayscale(0.5);
  opacity: 0.7;
  transition: all 0.5s ease;
}

.wingman-image.is-speaking {
  filter: drop-shadow(0 8px 25px rgba(155, 89, 182, 0.6)) grayscale(0);
  opacity: 1;
  animation: wingman-speaking 0.6s ease-in-out infinite alternate;
}

.leon-wingman .wingman-image.is-speaking {
  filter: drop-shadow(0 8px 25px rgba(65, 105, 225, 0.6)) grayscale(0);
}

.nanami-wingman.is-dimmed, .leon-wingman.is-dimmed {
  transform: scale(0.9);
}

/* Subtle bounce animation to simulate speaking */
@keyframes wingman-speaking {
  0% {
    transform: translateY(0) scale(1);
  }
  100% {
    transform: translateY(-3px) scale(1.01);
  }
}

.wingman-image:hover {
  filter: drop-shadow(0 10px 30px rgba(155, 89, 182, 0.8));
}

/* Leon gets a slightly different glow */
.leon-wingman .wingman-image {
  filter: drop-shadow(0 8px 25px rgba(65, 105, 225, 0.6));
}

.leon-wingman .wingman-image:hover {
  filter: drop-shadow(0 10px 30px rgba(65, 105, 225, 0.8));
}

/* Anime-style subtitle container */
.wingman-subtitle {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 0 10px;
}

.subtitle-text {
  background: rgba(0, 0, 0, 0.85);
  color: #ffffff;
  padding: 12px 24px;
  border-radius: 4px;
  font-size: 15px;
  line-height: 1.6;
  text-align: center;
  max-width: 380px;
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(155, 89, 182, 0.6);
  font-family: 'Segoe UI', system-ui, sans-serif;
  font-weight: 500;
  letter-spacing: 0.3px;
  position: relative;
}

/* Leon gets a blue border */
.leon-wingman .subtitle-text {
  border: 2px solid rgba(65, 105, 225, 0.6);
}

/* Subtle glow effect for subtitle */
.subtitle-text::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(155, 89, 182, 0.1), transparent);
  border-radius: 4px;
  pointer-events: none;
}

.leon-wingman .subtitle-text::before {
  background: linear-gradient(135deg, rgba(65, 105, 225, 0.1), transparent);
}

/* Transition animations - Nanami */
.nanami-slide-enter-active,
.nanami-slide-leave-active {
  transition: all 0.6s ease;
}

.nanami-slide-enter-from {
  transform: translateX(200px) translateY(50px);
  opacity: 0;
}

.nanami-slide-leave-to {
  transform: translateX(200px) translateY(50px);
  opacity: 0;
}

/* Transition animations - Leon */
.leon-slide-enter-active,
.leon-slide-leave-active {
  transition: all 0.6s ease;
}

.leon-slide-enter-from {
  transform: translateX(-200px) translateY(50px);
  opacity: 0;
}

.leon-slide-leave-to {
  transform: translateX(-200px) translateY(50px);
  opacity: 0;
}

/* Subtitle fade transition */
.subtitle-fade-enter-active {
  animation: subtitle-appear 0.5s ease-out;
}

.subtitle-fade-leave-active {
  animation: subtitle-disappear 0.3s ease-in;
}

@keyframes subtitle-appear {
  0% {
    opacity: 0;
    transform: translateY(10px) scale(0.95);
  }
  60% {
    opacity: 1;
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes subtitle-disappear {
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-5px);
  }
}

/* =============================================================================
   RESPONSIVE
   ============================================================================= */

@media (max-width: 480px) {
  .glitch-text h1 {
    font-size: 80px;
  }

  .error-subtitle {
    font-size: 18px;
  }

  .console-body {
    font-size: 12px;
    padding: 15px;
  }

  .reveal-title {
    font-size: 28px;
  }

  .celebration-title {
    font-size: 40px;
  }

  .system-restored {
    font-size: 28px;
  }

  .love-message p {
    font-size: 16px;
  }

  .nanami-wingman {
    bottom: 10px;
    right: 10px;
    left: auto;
    transform: none;
    max-width: 120px;
    gap: 5px;
  }

  .leon-wingman {
    bottom: 10px;
    left: 10px;
    right: auto;
    transform: none;
    max-width: 120px;
    gap: 5px;
  }

  .wingman-image {
    width: 70px;
    height: 70px;
  }

  .wingman-subtitle {
    position: fixed;
    bottom: 110px;
    left: 0;
    right: 0;
    width: 100%;
    z-index: 1001;
    pointer-events: none;
    display: flex;
    justify-content: center;
  }

  .subtitle-text {
    font-size: 13px;
    padding: 10px 16px;
    width: fit-content;
    min-width: 200px;
    max-width: 85%;
    margin: 0 auto;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
    white-space: normal;
  }

  .celebration-gif {
    margin: 0 auto 20px;
  }

  .celebration-gif img {
    width: 160px;
    height: auto;
    margin: 0 auto;
  }
}

.sad-cat-popup {
  position: absolute;
  top: -60px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  pointer-events: none;
}

.sad-cat-popup img {
  width: 150px;
  height: auto;
  border-radius: 15px;
  border: 4px solid #fff;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}

.cat-pop-enter-active {
  animation: cat-bounce-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.cat-pop-leave-active {
  animation: cat-bounce-out 0.4s ease-in;
}

@keyframes cat-bounce-in {
  0% { transform: translate(-50%, 50px) scale(0); opacity: 0; }
  60% { transform: translate(-50%, -20px) scale(1.1); opacity: 1; }
  100% { transform: translate(-50%, 0) scale(1); opacity: 1; }
}

@keyframes cat-bounce-out {
  0% { transform: translate(-50%, 0) scale(1); opacity: 1; }
  100% { transform: translate(-50%, -50px) scale(0); opacity: 0; }
}

.no-btn.static {
  transition: all 0.3s ease;
  min-width: 120px;
}
</style>
