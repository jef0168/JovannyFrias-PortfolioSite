import { useState, useEffect, useRef, useCallback } from "react";
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {loadGLTFModel} from '../libs/model'
import { ComputerContainer, ComputerSpinner } from "./computer-loader";
// import * as gui from 'dat.gui'

function easeOutCirc(x){
    return Math.sqrt(1 - Math.pow(x-1, 4))
}

// class MinMaxGUIHelper {
//   constructor(obj, minProp, maxProp, minDif) {
//     this.obj = obj;
//     this.minProp = minProp;
//     this.maxProp = maxProp;
//     this.minDif = minDif;
//   }
//   get min() {
//     return this.obj[this.minProp];
//   }
//   set min(v) {
//     this.obj[this.minProp] = v;
//     this.obj[this.maxProp] = Math.max(this.obj[this.maxProp], v + this.minDif);
//   }
//   get max() {
//     return this.obj[this.maxProp];
//   }
//   set max(v) {
//     this.obj[this.maxProp] = v;
//     this.min = this.min;  // this will call the min setter
//   }
// }



const Computer = () => {
    const refContainer = useRef();
    const [loading, setLoading] = useState(true)
    const [renderer, setRenderer] = useState()
    const [_camera, setCamera] = useState()
    const [target] = useState(new THREE.Vector3(-0.5, -50, 0))
    const [initialCameraPosition] = useState(
        new THREE.Vector3(
        200 * Math.sin(0.2 * Math.PI),
        100,
        200 * Math.cos(0.2 * Math.PI)
        )
    )
    const [scene] = useState(new THREE.Scene())
    const [_controls, setControls] = useState()

    // const dat = new gui.GUI()

    const handleWindowResize = useCallback(() => {
        const { current: container } = refContainer
        if (container && renderer) {
          const scW = container.clientWidth
          const scH = container.clientHeight
    
          renderer.setSize(scW, scH)
        }
      }, [renderer])

      /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(() => {
        const { current: container } = refContainer
        if (container && !renderer) {
          const scW = container.clientWidth
          const scH = container.clientHeight
    
          const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
          })
          renderer.setPixelRatio(window.devicePixelRatio)
          renderer.setSize(scW, scH)
          renderer.outputEncoding = THREE.sRGBEncoding
          container.appendChild(renderer.domElement)
          setRenderer(renderer)
    
          // 640 -> 240
          // 8   -> 6
          const scale = scH * 0.9 + 4.8
          const camera = new THREE.OrthographicCamera(
            -scale,
            scale,
            scale +300,
            -scale,
            -500,
            600
          )

          // function updateCamera(){
          //   camera.updateProjectionMatrix();
          // }


          camera.position.copy(initialCameraPosition)
          camera.lookAt(target)
          setCamera(camera)

          // dat.add(camera, 'zoom', -1000, 1000, 1).listen();
          // const minMaxGUIHelper = new MinMaxGUIHelper(camera, 'near', 'far', 0.1);
          // dat.add(minMaxGUIHelper, 'min', 0.0001, 99999, 0.0001).name('near').onChange(updateCamera);
          // dat.add(minMaxGUIHelper, 'max', 0.1, 99999, 0.1).name('far').onChange(updateCamera);          

          const ambientLight = new THREE.AmbientLight(0xcccccc, .5)
          scene.add(ambientLight)
    
          const controls = new OrbitControls(camera, renderer.domElement)
          controls.autoRotate = true
          controls.target = target
          setControls(controls)

          loadGLTFModel(scene, './computer.glb', {
            receiveShadow: false,
            castShadow: false
          }).then(() => {
            animate()
            setLoading(false)
          })
    
          let req = null
          let frame = 0
          const animate = () => {
            req = requestAnimationFrame(animate)
    
            frame = frame <= 100 ? frame + 1 : frame
    
            if (frame <= 100) {
              const p = initialCameraPosition
              const rotSpeed = -easeOutCirc(frame / 120) * Math.PI * 20
    
              camera.position.y = 10
              camera.position.x =
                p.x * Math.cos(rotSpeed) + p.z * Math.sin(rotSpeed)
              camera.position.z =
                p.z * Math.cos(rotSpeed) - p.x * Math.sin(rotSpeed)
              camera.lookAt(target)
            } else {
              controls.update()
            }
    
            renderer.render(scene, camera)
          }
    
          return () => {
            console.log('unmount')
            cancelAnimationFrame(req)
            renderer.dispose()
          }
        }
      }, [])

    useEffect(() => {
        window.addEventListener('resize', handleWindowResize, false)
        return () => {
          window.removeEventListener('resize', handleWindowResize, false)
        }
      }, [renderer, handleWindowResize])

    return(
        <ComputerContainer ref={refContainer}>{loading && <ComputerSpinner />}</ComputerContainer>
    )
}

export default Computer