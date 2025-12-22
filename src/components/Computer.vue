<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { loadGLTFModel } from '@/lib/model'

const containerRef = ref<HTMLElement | null>(null)
const loading = ref(true)

function easeOutCirc(x: number) {
  return Math.sqrt(1 - Math.pow(x - 1, 4))
}

let renderer: THREE.WebGLRenderer
let req: number

// Initial positions (constants)
const initialCameraPosition = new THREE.Vector3(
  200 * Math.sin(0.2 * Math.PI),
  100,
  200 * Math.cos(0.2 * Math.PI)
)
const target = new THREE.Vector3(-0.5, -1.2, 0)

const initHelper = () => {
    if(!containerRef.value) {
        return
    }

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
    container.appendChild(renderer.domElement)

    // Camera
    const scale = scH * 0.9 + 4.8
    const camera = new THREE.OrthographicCamera(
        -scale,
        scale,
        scale + 300,
        -scale,
        -500,
        600
    )
    camera.position.copy(initialCameraPosition)
    camera.lookAt(target)

    // Scene
    const scene = new THREE.Scene()
    const ambientLight = new THREE.AmbientLight(0xcccccc, 1)
    scene.add(ambientLight)

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.autoRotate = true
    controls.enableZoom = false
    controls.target = target

    // Load Model
    loadGLTFModel(scene, '/computer.glb', {
        receiveShadow: false,
        castShadow: false
    }).then(() => {
        animate(scene, camera, controls)
        loading.value = false
    }).catch((err) => {
        console.error("Error loading model", err)
        loading.value = false
    })
}

let frame = 0
const animate = (scene: THREE.Scene, camera: THREE.OrthographicCamera, controls: OrbitControls) => {
    req = requestAnimationFrame(() => animate(scene, camera, controls))

    frame = frame <= 100 ? frame + 1 : frame

    if (frame <= 100) {
        const p = initialCameraPosition
        const rotSpeed = -easeOutCirc(frame / 120) * Math.PI * 20

        camera.position.y = 10
        camera.position.x = p.x * Math.cos(rotSpeed) + p.z * Math.sin(rotSpeed)
        camera.position.z = p.z * Math.cos(rotSpeed) - p.x * Math.sin(rotSpeed)
        camera.lookAt(target)
    } else {
        controls.update()
    }

    renderer.render(scene, camera)
}

const handleWindowResize = () => {
    if (containerRef.value && renderer) {
        const scW = containerRef.value.clientWidth
        const scH = containerRef.value.clientHeight
        renderer.setSize(scW, scH)
    }
}

onMounted(() => {
    initHelper()
    window.addEventListener('resize', handleWindowResize)
})

onBeforeUnmount(() => {
    cancelAnimationFrame(req)
    window.removeEventListener('resize', handleWindowResize)
    if(renderer) renderer.dispose()
})

</script>

<template>
  <div ref="containerRef" class="relative m-auto w-[280px] h-[280px] sm:w-[480px] sm:h-[480px] md:w-[640px] md:h-[640px] mt-[-20px] sm:mt-[-60px] md:mt-[-120px] mb-[-40px] sm:mb-[-140px] md:mb-[-200px]">
    <div v-if="loading" class="absolute inset-0 flex justify-center items-center">
        <!-- Spinner -->
        <div class="w-10 h-10 border-4 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
    </div>
  </div>
</template>
