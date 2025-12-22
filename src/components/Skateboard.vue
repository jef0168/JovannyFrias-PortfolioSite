<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { loadGLTFModel } from '@/lib/model'

const containerRef = ref<HTMLElement | null>(null)
const loading = ref(true)

let renderer: THREE.WebGLRenderer
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let controls: OrbitControls
let req: number
let skateboard: THREE.Object3D | null = null

// Animation state
const isFlipping = ref(false)
const isFailed = ref(false) // New fail state
const showFailMsg = ref(false)
const currentTrick = ref<'kickflip' | 'heelflip' | 'treflip' | 'impossible'>('kickflip')
let flipProgress = 0
let randomTilt = .5
let popStrength = 2
const speed = 0.2 // Speed of "infinite" motion

// Skill Check State
const skillCheckActive = ref(false)
const indicatorPos = ref(0) // 0 to 100
const targetZoneStart = ref(0) // 0 to 100
const targetZoneWidth = ref(20) // Width of green zone
let skillCheckReq: number
let skillDirection = 1
const skillSpeed = ref(1.3) // How fast the bar moves (Dynamic now)

// Score State
const score = ref(0)
const gainedPoints = ref(0)
const showScorePopup = ref(false)

// Trick Configuration (Difficulty & Points)
const TRICK_STATS = {
    kickflip:   { points: 100, width: 30, speed: 1.2, label: 'Kickflip' },
    heelflip:   { points: 200, width: 25, speed: 1.5, label: 'Heelflip' },
    treflip:    { points: 500, width: 15, speed: 2.0, label: 'Tre Flip' },
    impossible: { points: 1000, width: 10, speed: 2.5, label: 'Impossible' }
}

// Initial setup
const initialCameraPosition = new THREE.Vector3(0.98, 0.77, 3.99)
const target = new THREE.Vector3(0.98, 0.62, 0.19)
        
// Camera state
// Removed baseScale, actionScale, currentScale as they are for OrthographicCamera

const createConcreteTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Base grey
    ctx.fillStyle = '#404040';
    ctx.fillRect(0, 0, 512, 512);

    // Noise
    for (let i = 0; i < 50000; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const opacity = Math.random() * 0.1;
        ctx.fillStyle = Math.random() > 0.5 ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`;
        ctx.fillRect(x, y, 2, 2);
    }
    
    // Scratches
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 50; i++) {
        ctx.beginPath();
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        ctx.moveTo(x, y);
        ctx.lineTo(x + (Math.random() - 0.5) * 50, y + (Math.random() - 0.5) * 50);
        ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(10, 10); // Repeat texture
    
    return texture;
}

const init = () => {
    if (!containerRef.value) return

    const container = containerRef.value
    const scW = container.clientWidth
    const scH = container.clientHeight

    // Renderer
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(scW, scH)
    renderer.outputEncoding = THREE.sRGBEncoding
    // Enable Shadows
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(renderer.domElement)

    // Camera setup with aspect ratio
    const aspect = scW / scH
    
    // Switch to PerspectiveCamera for realistic POV
    camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000)
    camera.position.copy(initialCameraPosition)
    camera.up.set(0, 0, -1) // IMPORTANT: -Z is Up for top-down view
    camera.lookAt(target)


    // Scene
    scene = new THREE.Scene()
    
    // Reduce fog start distance to keep board clear
    scene.fog = new THREE.Fog(0x222222, 20, 60)
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6) // Reduced ambient to make shadow popping
    scene.add(ambientLight)
    
    // Moving Floor (Concrete)
    const concreteTexture = createConcreteTexture();
    if (concreteTexture) {
        const planeGeometry = new THREE.PlaneGeometry(100, 100);
        const planeMaterial = new THREE.MeshStandardMaterial({ 
            map: concreteTexture,
            roughness: 0.9,
            metalness: 0.1
        });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.rotation.x = -Math.PI / 2; // Rotate to lie on XZ
        plane.position.y = -0.28 // Raised further to touch wheels
        plane.name = "ground"
        plane.receiveShadow = true // Enable receive shadow
        scene.add(plane)
    } else {
        // Fallback to grid
        const gridHelper = new THREE.GridHelper(100, 100, 0x555555, 0x555555)
        gridHelper.position.y = -0.28
        scene.add(gridHelper)
    }
    
    // Directional light with Shadows
    const dirLight = new THREE.DirectionalLight(0xffffff, 1)
    dirLight.position.set(10, 20, 10) // High up and offset
    dirLight.castShadow = true
    dirLight.shadow.mapSize.width = 2048
    dirLight.shadow.mapSize.height = 2048
    dirLight.shadow.camera.near = 0.5
    dirLight.shadow.camera.far = 100
    dirLight.shadow.camera.left = -20;
    dirLight.shadow.camera.right = 20;
    dirLight.shadow.camera.top = 20;
    dirLight.shadow.camera.bottom = -20;
    dirLight.shadow.bias = -0.0005
    scene.add(dirLight)

    // Controls - Disabled for fixed camera
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableRotate = false
    controls.enableZoom = false
    controls.enablePan = false
    controls.target = target
    controls.update()

    // Load Model
    loadGLTFModel(scene, '/skateboard.glb', {
        receiveShadow: true,
        castShadow: true
    }).then((obj) => {
        skateboard = obj
        // FIX Scale: Length (Z) must be > Width (X)
        skateboard.scale.set(2.0, 2.0, 2.0) 
        skateboard.position.set(0, 0, 0)

        // Texture Optimization
        const maxAnisotropy = renderer.capabilities.getMaxAnisotropy()
        skateboard.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh
                
                if (mesh.material) {
                    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
                    materials.forEach((mat) => {
                        const m = mat as THREE.MeshStandardMaterial
                        if (m.map) m.map.anisotropy = maxAnisotropy
                    })
                }
            }
        })
        
        loading.value = false
        animate()
    }).catch((err) => {
        console.error("Error loading skateboard model", err)
        loading.value = false
    })
}

const animate = () => {
    req = requestAnimationFrame(animate)

    if (skateboard && containerRef.value) {
        // Infinite Motion Animation
        
        // 1. Move Grid (Floor) / Texture - Only if not in failed state
        if (!isFailed.value) {
            const ground = scene.getObjectByName('ground') as THREE.Mesh
            if (ground && ground.material) {
                const mat = ground.material as THREE.MeshStandardMaterial
                if (mat.map) {
                    // Move texture offset to simulate movement
                    mat.map.offset.y -= speed * 0.1 // Adjust 0.1 for texture scale/speed ratio
                }
            } else {
                 // Fallback for Grid if texture failed (though rare)
                 if (scene.children) {
                     const grid = scene.children.find(c => c instanceof THREE.GridHelper)
                     if (grid) {
                         grid.position.z += speed * 2 
                         if (grid.position.z > 10) {
                             grid.position.z = 0
                         }
                     }
                 }
            }
        }
    
        // Dynamic FOV for dramatic effect during flips
        if (isFlipping.value) {
            // Widen FOV during flip (60 -> 75)
            const targetFOV = 75
            camera.fov = THREE.MathUtils.lerp(camera.fov, targetFOV, 0.1)
            camera.updateProjectionMatrix()
        } else {
            // Return to normal FOV
            const targetFOV = 60
            camera.fov = THREE.MathUtils.lerp(camera.fov, targetFOV, 0.1)
            camera.updateProjectionMatrix()
            if (controls) controls.update()
        }

        if (isFlipping.value) {
            // Animation Speed
            flipProgress += 0.010
            
            if (flipProgress <= 1) {
                // Increase jump height for impossible trick to prevent ground clipping
                const heightMultiplier = currentTrick.value === 'impossible' ? 2.5 : 1.5
                const jumpHeight = heightMultiplier * popStrength
                
                // Easing constant (Sine Ease Out for smooth jump apex)
                // y = sin(progress * PI)
                const y = Math.sin(flipProgress * Math.PI) * jumpHeight
                skateboard.position.y = y

                // Two-phase animation: Pop (0-0.2) then Flip (0.2-1.0)
                const popPhase = 0.2 // First 20% is the ollie pop
                
                if (isFailed.value) {
                    // FAIL PHYSICS: PRIMO (Land on side)
                    // Rotate to 90 degrees on Z to stand on side edge
                    skateboard.rotation.z = THREE.MathUtils.lerp(0, Math.PI / 2, flipProgress)
                    skateboard.rotation.x = THREE.MathUtils.lerp(0, 0.1, flipProgress) // Slight tilt
                    
                    // Height calculation:
                    // If flat, y = 0.
                    // If side (width=2.0), center needs to be up by half width = 1.0
                    // However, we lerp to it.
                    const targetY = 1.0 // Half of scale.x (2.0)
                    skateboard.position.y = THREE.MathUtils.lerp(y, targetY, flipProgress * flipProgress)
                } else {
                    // SUCCESS PHYSICS
                    
                    if (flipProgress < popPhase) {
                        // OLLIE POP PHASE: Tail snap and initial lift
                        const popProgress = flipProgress / popPhase // 0 to 1 within pop phase
                        
                        // Smooth easing for pop (ease out)
                        const easedPop = 1 - Math.pow(1 - popProgress, 3)
                        
                        // Strong tail snap at the beginning
                        skateboard.rotation.x = -easedPop * 0.4 * popStrength
                        
                        // No flip rotation during pop
                        skateboard.rotation.z = 0
                        skateboard.rotation.y = 0
                        
                    } else {
                        // FLIP PHASE: Actual trick rotation
                        // Normalize progress for flip phase (0.2-1.0 becomes 0-1)
                        const flipPhaseProgress = (flipProgress - popPhase) / (1 - popPhase)
                        
                        // Smooth transition from pop to flip
                        const transitionBlend = Math.min(flipPhaseProgress * 5, 1) // Quick blend over first 20% of flip phase
                        
                        // Universal Pop (Tail snap): decays quickly as board rises
                        const popSnap = Math.max(0, 1 - flipProgress * 4) * -0.3 * popStrength
                        
                        // Blend from pop rotation to trick rotation
                        const popRotation = -0.4 * popStrength * (1 - transitionBlend)
                        
                        // Rotation Logic based on Trick with Style & Randomness
                        if (currentTrick.value === 'kickflip') {
                            // Kickflip: Fast linear flip + slight nose dip at peak
                            skateboard.rotation.z = -flipPhaseProgress * Math.PI * 2
                            
                            // Catch dip + Pop + Random tilt + blend from pop
                            skateboard.rotation.x = (Math.sin(flipPhaseProgress * Math.PI) * 0.2) + popSnap + (Math.sin(flipPhaseProgress * Math.PI) * randomTilt) + popRotation
                            
                            // Slight random yaw to look imperfect
                            skateboard.rotation.y = Math.sin(flipPhaseProgress * Math.PI) * randomTilt * 0.5

                        } else if (currentTrick.value === 'heelflip') {
                            // Heelflip: Reverse spin + nose pitch up
                            skateboard.rotation.z = flipPhaseProgress * Math.PI * 2
                            skateboard.rotation.x = (-Math.sin(flipPhaseProgress * Math.PI) * 0.2) + popSnap + popRotation
                            
                            // Add random roll variation
                            skateboard.rotation.y = Math.sin(flipPhaseProgress * Math.PI) * randomTilt

                        } else if (currentTrick.value === 'treflip') {
                            // 360 Flip: Scoop sensation
                            // Flip accelerates
                            const ease = flipPhaseProgress < 0.5 ? 2 * flipPhaseProgress * flipPhaseProgress : 1 - Math.pow(-2 * flipPhaseProgress + 2, 2) / 2;
                            skateboard.rotation.z = -ease * Math.PI * 2
                            skateboard.rotation.y = -ease * Math.PI * 2
                            
                            // Varial scoop tilt + pop + blend
                            skateboard.rotation.x = (Math.sin(flipPhaseProgress * Math.PI * 2) * 0.3) + popSnap + randomTilt + popRotation
                            
                        } else if (currentTrick.value === 'impossible') {
                            // Impossible: Wrapping sensation with lateral tilt
                            // Vertical rotation (X) - main flip axis
                            skateboard.rotation.x = (-flipPhaseProgress * Math.PI * 2) + popSnap + popRotation
                            
                            // Add lateral tilt (Y-axis) for realistic impossible motion
                            // Real impossibles have a scooping/tilting motion, not perfectly vertical
                            skateboard.rotation.y = Math.sin(flipPhaseProgress * Math.PI) * 0.4 + (randomTilt * 0.5)
                            
                            // Subtle side woggle + random tilt on Z
                            skateboard.rotation.z = (Math.sin(flipPhaseProgress * Math.PI * 2) * 0.15) + (randomTilt * 2 * Math.sin(flipPhaseProgress * Math.PI))
                        }
                    }
                }
                
                
            } else {
                // Animation Done
                if (isFailed.value) {
                    // Landed in failed state
                    isFlipping.value = false
                    showFailMsg.value = true
                    // Reset score on failure
                    score.value = 0
                    // Leave rotation as is (messy)
                    // Position board on its side on the ground
                    // Since board width is 2.0, half is 1.0, but we need to account for ground at -0.28
                    skateboard.position.y = 1.0 - 0.28
                } else {
                    resetBoard()
                }
            }
        } 
        
        // Always update controls if they exist to allow user interaction
        if (controls) controls.update()
        
    } else {
         if (controls) controls.update()
    }

    renderer.render(scene, camera)
}



const resetBoard = () => {
    isFlipping.value = false
    isFailed.value = false
    showFailMsg.value = false
    showScorePopup.value = false
    flipProgress = 0
    if (skateboard) {
        skateboard.position.y = 0
        skateboard.rotation.set(0, 0, 0)
    }
}

const handleKeyDown = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase()

    // Reset
    if (key === 'r') {
        resetBoard()
        // Stop any active skill check
        skillCheckActive.value = false
        cancelAnimationFrame(skillCheckReq)
        return
    }

    // Skill Check Interaction
    if (skillCheckActive.value && key === ' ') {
        // Stop bar
        cancelAnimationFrame(skillCheckReq)
        skillCheckActive.value = false
        
        // Check Success
        const hit = indicatorPos.value >= targetZoneStart.value && indicatorPos.value <= (targetZoneStart.value + targetZoneWidth.value)
        
        if (hit) {
            isFailed.value = false
            // Award points
            const trickStats = TRICK_STATS[currentTrick.value]
            gainedPoints.value = trickStats.points
            score.value += trickStats.points
            showScorePopup.value = true
            setTimeout(() => { showScorePopup.value = false }, 2000)
        } else {
            isFailed.value = true
        }
        
        // Start the actual trick animation
        startTrickAnimation()
        return
    }

    if (isFlipping.value || !skateboard || isFailed.value || skillCheckActive.value) return

    // Init Trick - Start Skill Check
    if (['k', 'h', 't', 'i'].includes(key)) {
        if (key === 'k') currentTrick.value = 'kickflip'
        if (key === 'h') currentTrick.value = 'heelflip'
        if (key === 't') currentTrick.value = 'treflip'
        if (key === 'i') currentTrick.value = 'impossible'
        
        startSkillCheck()
    }
}

const startSkillCheck = () => {
    skillCheckActive.value = true
    indicatorPos.value = 0
    skillDirection = 1
    
    // Apply trick-specific difficulty
    const trickStats = TRICK_STATS[currentTrick.value]
    targetZoneWidth.value = trickStats.width
    skillSpeed.value = trickStats.speed
    
    // Random target zone
    targetZoneStart.value = 40 + Math.random() * 40 // Between 40 and 80
    
    animateSkillCheck()
}

const animateSkillCheck = () => {
    if (!skillCheckActive.value) return
    
    indicatorPos.value += skillSpeed.value * skillDirection
    
    if (indicatorPos.value >= 100 || indicatorPos.value <= 0) {
        skillDirection *= -1
    }
    
    skillCheckReq = requestAnimationFrame(animateSkillCheck)
}

const startTrickAnimation = () => {
    isFlipping.value = true
    flipProgress = 0
    showFailMsg.value = false
    
    // Randomize Props
    randomTilt = (Math.random() - 0.5) * 0.3 
    popStrength = 0.9 + Math.random() * 0.2
}

const handleWindowResize = () => {
    if (containerRef.value && renderer) {
        const scW = containerRef.value.clientWidth
        const scH = containerRef.value.clientHeight
        renderer.setSize(scW, scH)
    }
}

onMounted(() => {
    init()
    window.addEventListener('resize', handleWindowResize)
    window.addEventListener('keydown', handleKeyDown)
})

onBeforeUnmount(() => {
    cancelAnimationFrame(req)
    window.removeEventListener('resize', handleWindowResize)
    window.removeEventListener('keydown', handleKeyDown)
    if (renderer) renderer.dispose()
    if (controls) controls.dispose()
})
</script>

<template>
  <div ref="containerRef" class="relative w-full h-[500px] cursor-pointer" title="Controls: K (Kickflip), H (Heelflip), T (Tre Flip), I (Impossible), R (Reset)">
    <div v-if="loading" class="absolute inset-0 flex justify-center items-center">
        <div class="w-8 h-8 border-4 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
    </div>
    
    <!-- Scoreboard -->
    <div class="absolute top-4 left-4 bg-black/70 text-white px-4 py-2 rounded-lg font-bold">
        <div class="text-xs uppercase tracking-wider opacity-70">Score</div>
        <div class="text-2xl">{{ score.toLocaleString() }}</div>
    </div>

    <!-- Score Popup -->
    <div v-if="showScorePopup" class="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-bounce">
        <span class="text-green-400 font-bold text-3xl uppercase tracking-widest drop-shadow-lg">
            +{{ gainedPoints }}!
        </span>
    </div>
    
    <div v-if="showFailMsg" class="absolute inset-0 flex flex-col justify-center items-center pointer-events-none animate-bounce">
        <span class="text-red-500 font-bold text-xl uppercase tracking-widest shadow-white drop-shadow-md">Trick Failed!</span>
        <span class="text-gray-500 text-xs mt-1">Press R to reset</span>
    </div>
    
    <!-- Skill Check UI -->
    <div v-if="skillCheckActive" class="absolute bottom-12 w-full flex justify-center flex-col items-center">
        <div class="text-xs font-bold text-white mb-1 uppercase tracking-wider drop-shadow-md">Press SPACE in Green Zone!</div>
        <div class="w-[200px] h-4 bg-gray-800 border-2 border-white rounded-full relative overflow-hidden shadow-lg">
            <!-- Target Zone -->
            <div class="absolute h-full bg-green-500 opacity-80" :style="{ left: targetZoneStart + '%', width: targetZoneWidth + '%' }"></div>
            <!-- Indicator -->
            <div class="absolute h-full w-1 bg-red-500 z-10" :style="{ left: indicatorPos + '%' }"></div>
        </div>
    </div>

    <!-- Controls Info -->
    <div v-if="!loading && !showFailMsg && !skillCheckActive" class="absolute top-4 right-4 bg-black/70 text-white px-4 py-2 rounded-lg font-bold text-xs">
        <div class="uppercase tracking-wider opacity-70 mb-1">Controls</div>
        <div class="space-y-1">
            <div>K - Kickflip (100)</div>
            <div>H - Heelflip (200)</div>
            <div>T - Tre Flip (500)</div>
            <div>I - Impossible (1000)</div>
            <div>R - Reset</div>
        </div>
    </div>
  </div>
</template>
