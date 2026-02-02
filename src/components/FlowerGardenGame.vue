<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['win', 'lose'])

// =============================================================================
// CONFIGURATION
// =============================================================================

const GAME_DURATION = 45
const FLOWERS_TO_WIN = 15
const GAME_WIDTH = 400
const GAME_HEIGHT = 550

const gameCanvas = ref<HTMLCanvasElement | null>(null)
const gameTime = ref(GAME_DURATION)
const flowersCollected = ref(0)
const gameActive = ref(false)
const gameWon = ref(false)
const gameLost = ref(false)
const gardenScore = ref(0)
const lastCollectTime = ref(0)

const butterflies = ref<Butterfly[]>([])
const gardenPlots = ref<FlowerPlot[]>([])
const particles = ref<Particle[]>([])

// Controls
const mousePos = ref({ x: 0, y: 0 })
const isMouseDown = ref(false)
let gameLoop: number | null = null
let timerInterval: number | null = null
let butterflySpawnInterval: number | null = null

// =============================================================================
// INTERFACES
// =============================================================================

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
}

interface FlowerPlot {
  x: number
  y: number
  width: number
  height: number
  state: 'empty' | 'growing' | 'bloomed'
  flowerType: 'tulip' | 'rose' | 'daisy' | 'lily'
  color: string
  growthProgress: number
  plantedTime: number
  swayOffset: number
}

interface Butterfly {
  x: number
  y: number
  targetX: number
  targetY: number
  speed: number
  wingFlap: number
  color: string
}

// =============================================================================
// GAME LOGIC
// =============================================================================

function initGame() {
  gameTime.value = GAME_DURATION
  flowersCollected.value = 0
  gardenScore.value = 0
  gameActive.value = true
  gameWon.value = false
  gameLost.value = false
  gardenPlots.value = []
  butterflies.value = []
  particles.value = []

  // Create garden grid (4x5 = 20 plots)
  const plotSize = 70
  const spacing = 10
  const startX = (GAME_WIDTH - (4 * plotSize + 3 * spacing)) / 2
  const startY = 80

  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 4; col++) {
      gardenPlots.value.push({
        x: startX + col * (plotSize + spacing),
        y: startY + row * (plotSize + spacing),
        width: plotSize,
        height: plotSize,
        state: 'empty',
        flowerType: 'tulip',
        color: '#ff6b9d',
        growthProgress: 0,
        plantedTime: 0,
        swayOffset: Math.random() * Math.PI * 2
      })
    }
  }

  gameLoop = requestAnimationFrame(updateGame)

  timerInterval = window.setInterval(() => {
    if (gameTime.value > 0 && gameActive.value) {
      gameTime.value--
    }

    if (gameTime.value <= 0 && gameActive.value) {
      endGame(false)
    }
  }, 1000)

  butterflySpawnInterval = window.setInterval(() => {
    if (gameActive.value && butterflies.value.length < 3) {
      spawnButterfly()
    }
  }, 8000)

  const canvas = gameCanvas.value
  if (canvas) {
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mousedown', handleMouseDown)
    canvas.addEventListener('touchstart', handleTouchStart)
    canvas.addEventListener('touchmove', handleTouchMove)
    canvas.addEventListener('touchend', handleTouchEnd)
  }
}

function handleMouseMove(e: MouseEvent) {
  const canvas = gameCanvas.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  mousePos.value = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  }
}

function handleMouseDown(e: MouseEvent) {
  const canvas = gameCanvas.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  handlePlotClick(x, y)
}

function handleTouchStart(e: TouchEvent) {
  e.preventDefault()
  const canvas = gameCanvas.value
  if (!canvas || !e.touches[0]) return
  const rect = canvas.getBoundingClientRect()
  const x = e.touches[0].clientX - rect.left
  const y = e.touches[0].clientY - rect.top
  handlePlotClick(x, y)
}

function handleTouchMove(e: TouchEvent) {
  e.preventDefault()
  const canvas = gameCanvas.value
  if (!canvas || !e.touches[0]) return
  const rect = canvas.getBoundingClientRect()
  mousePos.value = {
    x: e.touches[0].clientX - rect.left,
    y: e.touches[0].clientY - rect.top
  }
}

function handleTouchEnd(e: TouchEvent) {
  e.preventDefault()
}

function handlePlotClick(x: number, y: number) {
  if (!gameActive.value) return

  // Check if clicked on a plot
  for (const plot of gardenPlots.value) {
    if (x >= plot.x && x <= plot.x + plot.width && y >= plot.y && y <= plot.y + plot.height) {
      if (plot.state === 'bloomed') {
        flowersCollected.value++
        gardenScore.value += 10
        spawnParticles(plot.x + plot.width / 2, plot.y + plot.height / 2, plot.color, 12)
        plot.state = 'empty'
        plot.growthProgress = 0
      } else if (plot.state === 'empty') {
        const flowerTypes = ['tulip', 'rose', 'daisy', 'lily'] as const
        const colors = ['#ff6b9d', '#9b59b6', '#FFD700', '#87CEEB', '#FF69B4', '#DDA0DD']
        
        plot.state = 'growing'
        const randomType = flowerTypes[Math.floor(Math.random() * flowerTypes.length)]
        plot.flowerType = randomType || 'tulip'
        const randomColor = colors[Math.floor(Math.random() * colors.length)]
        plot.color = randomColor || '#ff6b9d'
        plot.plantedTime = Date.now()
        plot.growthProgress = 0
      }
      break
    }
  }

  for (let i = butterflies.value.length - 1; i >= 0; i--) {
    const butterfly = butterflies.value[i]
    if (!butterfly) continue
    const dist = Math.sqrt((x - butterfly.x) ** 2 + (y - butterfly.y) ** 2)
    if (dist < 25) {
      gardenScore.value += 5
      gameTime.value += 2
      spawnParticles(butterfly.x, butterfly.y, butterfly.color, 15)
      butterflies.value.splice(i, 1)
    }
  }
}

function spawnButterfly() {
  const colors = ['#ff6b9d', '#9b59b6', '#FFD700', '#87CEEB']
  butterflies.value.push({
    x: Math.random() < 0.5 ? -30 : GAME_WIDTH + 30,
    y: 50 + Math.random() * 200,
    targetX: 50 + Math.random() * (GAME_WIDTH - 100),
    targetY: 50 + Math.random() * 200,
    speed: 1 + Math.random() * 2,
    wingFlap: 0,
    color: colors[Math.floor(Math.random() * colors.length)] || '#ff6b9d'
  })
}

function spawnParticles(x: number, y: number, color: string, count: number) {
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5
    const speed = 2 + Math.random() * 3
    particles.value.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      life: 1,
      maxLife: 1,
      color,
      size: 3 + Math.random() * 4
    })
  }
}

function updateGame() {
  if (!gameActive.value) return

  const now = Date.now()

  for (const plot of gardenPlots.value) {
    if (plot.state === 'growing') {
      const growthTime = 4000
      const elapsed = now - plot.plantedTime
      plot.growthProgress = Math.min(elapsed / growthTime, 1)
      if (plot.growthProgress >= 1) plot.state = 'bloomed'
    }
    plot.swayOffset += 0.02
  }

  // Update butterflies
  for (let i = butterflies.value.length - 1; i >= 0; i--) {
    const butterfly = butterflies.value[i]
    if (!butterfly) continue
    
    // Move towards target
    const dx = butterfly.targetX - butterfly.x
    const dy = butterfly.targetY - butterfly.y
    butterfly.x += dx * butterfly.speed * 0.02
    butterfly.y += dy * butterfly.speed * 0.02
    
    // Wing flap animation
    butterfly.wingFlap += 0.15
    
    // Change target occasionally
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
      butterfly.targetX = 50 + Math.random() * (GAME_WIDTH - 100)
      butterfly.targetY = 50 + Math.random() * 200
    }
  }

  // Update particles
  for (let i = particles.value.length - 1; i >= 0; i--) {
    const p = particles.value[i]
    if (!p) continue
    p.x += p.vx
    p.y += p.vy
    p.vy += 0.15 // gravity
    p.life -= 0.025
    if (p.life <= 0) {
      particles.value.splice(i, 1)
    }
  }

  if (flowersCollected.value >= FLOWERS_TO_WIN) {
    endGame(true)
    return
  }

  drawGame()
  gameLoop = requestAnimationFrame(updateGame)
}

function drawGame() {
  const canvas = gameCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT)
  gradient.addColorStop(0, '#87CEEB')
  gradient.addColorStop(0.6, '#B0E0E6')
  gradient.addColorStop(1, '#98D8C8')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)

  const time = Date.now() * 0.0005
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
  for (let i = 0; i < 3; i++) {
    const x = ((i * 150 + time * 20) % (GAME_WIDTH + 100)) - 50
    const y = 20 + i * 15
    drawCloud(ctx, x, y)
  }

  ctx.fillStyle = '#FFD700'
  ctx.beginPath()
  ctx.arc(GAME_WIDTH - 50, 40, 25, 0, Math.PI * 2)
  ctx.fill()
  
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)'
  ctx.lineWidth = 2
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4 + time
    ctx.beginPath()
    ctx.moveTo(GAME_WIDTH - 50 + Math.cos(angle) * 30, 40 + Math.sin(angle) * 30)
    ctx.lineTo(GAME_WIDTH - 50 + Math.cos(angle) * 40, 40 + Math.sin(angle) * 40)
    ctx.stroke()
  }

  for (const plot of gardenPlots.value) {
    ctx.fillStyle = '#8B4513'
    ctx.fillRect(plot.x, plot.y, plot.width, plot.height)
    ctx.fillStyle = '#654321'
    ctx.fillRect(plot.x + 2, plot.y + 2, plot.width - 4, plot.height - 4)
    ctx.strokeStyle = '#5C4033'
    ctx.lineWidth = 2
    ctx.strokeRect(plot.x, plot.y, plot.width, plot.height)

    if (plot.state === 'growing' || plot.state === 'bloomed') {
      const centerX = plot.x + plot.width / 2
      const centerY = plot.y + plot.height / 2
      const sway = Math.sin(plot.swayOffset) * 3
      drawFlower(ctx, centerX + sway, centerY, plot.flowerType, plot.color, plot.growthProgress)
    }
  }

  for (const butterfly of butterflies.value) {
    drawButterfly(ctx, butterfly.x, butterfly.y, butterfly.wingFlap, butterfly.color)
  }

  for (const p of particles.value) {
    ctx.globalAlpha = p.life
    ctx.fillStyle = p.color
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
  ctx.setLineDash([5, 5])
  ctx.beginPath()
  ctx.arc(mousePos.value.x, mousePos.value.y, 20, 0, Math.PI * 2)
  ctx.stroke()
  ctx.setLineDash([])
}

function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.beginPath()
  ctx.arc(x, y, 15, 0, Math.PI * 2)
  ctx.arc(x + 15, y - 5, 20, 0, Math.PI * 2)
  ctx.arc(x + 35, y, 15, 0, Math.PI * 2)
  ctx.arc(x + 17, y + 5, 15, 0, Math.PI * 2)
  ctx.fill()
}

function drawFlower(ctx: CanvasRenderingContext2D, x: number, y: number, type: string, color: string, progress: number) {
  const height = 40 * progress
  ctx.strokeStyle = '#2ecc71'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(x, y + 15)
  ctx.lineTo(x, y + 15 - height)
  ctx.stroke()
  
  if (progress > 0.4) {
    ctx.fillStyle = '#27ae60'
    ctx.beginPath()
    ctx.ellipse(x - 5, y + 15 - height * 0.4, 8, 4, -0.5, 0, Math.PI * 2)
    ctx.ellipse(x + 5, y + 15 - height * 0.4, 8, 4, 0.5, 0, Math.PI * 2)
    ctx.fill()
  }
  
  if (progress >= 1) {
    ctx.fillStyle = color
    if (type === 'tulip') {
      ctx.beginPath()
      ctx.moveTo(x - 10, y + 15 - height)
      ctx.bezierCurveTo(x - 15, y + 5 - height, x - 5, y - 5 - height, x, y + 5 - height)
      ctx.bezierCurveTo(x + 5, y - 5 - height, x + 15, y + 5 - height, x + 10, y + 15 - height)
      ctx.closePath()
      ctx.fill()
    } else if (type === 'rose') {
      for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2) / 5
        ctx.beginPath()
        ctx.arc(x + Math.cos(angle) * 6, y + 15 - height + Math.sin(angle) * 6, 7, 0, Math.PI * 2)
        ctx.fill()
      }
    } else {
      ctx.fillStyle = '#F0E68C'
      ctx.beginPath()
      ctx.arc(x, y + 15 - height, 6, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = color
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI * 2) / 8
        ctx.beginPath()
        ctx.ellipse(x + Math.cos(angle) * 10, y + 15 - height + Math.sin(angle) * 10, 8, 3, angle, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  } else if (progress > 0.2) {
    ctx.fillStyle = '#27ae60'
    ctx.beginPath()
    ctx.arc(x, y + 15 - height, 5, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawButterfly(ctx: CanvasRenderingContext2D, x: number, y: number, flap: number, color: string) {
  const wingSize = 10 + Math.sin(flap) * 4
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.ellipse(x - 5, y - 5, wingSize, 8, -0.5, 0, Math.PI * 2)
  ctx.ellipse(x - 5, y + 5, wingSize * 0.8, 6, 0.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(x + 5, y - 5, wingSize, 8, 0.5, 0, Math.PI * 2)
  ctx.ellipse(x + 5, y + 5, wingSize * 0.8, 6, -0.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#333'
  ctx.beginPath()
  ctx.ellipse(x, y, 2, 8, 0, 0, Math.PI * 2)
  ctx.fill()
}

function endGame(won: boolean) {
  gameActive.value = false
  gameWon.value = won
  gameLost.value = !won

  if (gameLoop) cancelAnimationFrame(gameLoop)
  if (timerInterval) clearInterval(timerInterval)
  if (butterflySpawnInterval) clearInterval(butterflySpawnInterval)

  if (won) {
    emit('win')
  } else {
    emit('lose')
  }
}

function retryGame() {
  initGame()
}

onMounted(() => {
  initGame()
})

onUnmounted(() => {
  if (gameLoop) cancelAnimationFrame(gameLoop)
  if (timerInterval) clearInterval(timerInterval)
  if (butterflySpawnInterval) clearInterval(butterflySpawnInterval)
})
</script>

<template>
  <div class="game-container">
    <div class="game-header">
      <div class="stat">
        <span class="stat-label">Time</span>
        <span class="stat-value" :class="{ warning: gameTime <= 10 }">{{ gameTime }}s</span>
      </div>
      <div class="stat flowers-stat">
        <span class="stat-label">Flowers Collected</span>
        <span class="stat-value">{{ Math.min(flowersCollected, FLOWERS_TO_WIN) }}/{{ FLOWERS_TO_WIN }}</span>
      </div>
    </div>

    <div class="game-instructions" v-if="!gameLost">
      <p>Plant and collect {{ FLOWERS_TO_WIN }} flowers to restore the system!</p>
      <p class="controls-hint">Click/Tap to plant seeds and harvest bloomed flowers</p>
    </div>

    <div class="powerup-legend">
      <div class="legend-item"><span class="legend-icon blue">🦋</span> Butterfly bonus: +2s</div>
    </div>

    <canvas
      ref="gameCanvas"
      :width="GAME_WIDTH"
      :height="GAME_HEIGHT"
      class="game-canvas"
    ></canvas>

    <!-- Game Over Overlay -->
    <div v-if="gameLost" class="game-over-overlay">
      <h2>Time's Up!</h2>
      <p>You collected {{ flowersCollected }} flowers</p>
      <button @click="retryGame" class="retry-btn">Try Again</button>
    </div>

    <!-- Win Overlay -->
    <div v-if="gameWon" class="game-won-overlay">
      <h2>Garden Restored!</h2>
      <div class="heart-burst">🌸</div>
    </div>
  </div>
</template>

<style scoped>
.game-container {
  text-align: center;
  position: relative;
}

.game-header {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 15px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #9b59b6;
}

.stat-value.warning {
  color: #e74c3c;
  animation: pulse-text 0.5s infinite;
}

@keyframes pulse-text {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.game-instructions {
  margin-bottom: 10px;
  color: rgba(255, 255, 255, 0.8);
}

.controls-hint {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.powerup-legend {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.legend-item {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  gap: 5px;
}

.legend-icon {
  font-size: 16px;
}

.game-canvas {
  border: 3px solid #9b59b6;
  border-radius: 10px;
  box-shadow: 0 0 30px rgba(155, 89, 182, 0.3);
  max-width: 100%;
  touch-action: none;
  background: #98D8C8;
}

.game-over-overlay,
.game-won-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.95);
  padding: 40px;
  border-radius: 20px;
  text-align: center;
  z-index: 10;
  border: 2px solid #9b59b6;
}

.game-over-overlay h2 {
  color: #e74c3c;
  margin-bottom: 15px;
}

.game-won-overlay h2 {
  color: #27ae60;
  margin-bottom: 15px;
}

.heart-burst {
  font-size: 80px;
  animation: burst 0.5s ease-out;
}

@keyframes burst {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.5); }
  100% { transform: scale(1); opacity: 1; }
}

.retry-btn {
  padding: 15px 30px;
  background: linear-gradient(135deg, #9b59b6, #8e44ad);
  border: none;
  border-radius: 10px;
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 20px;
}
</style>
