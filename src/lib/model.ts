import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import type { Scene, Object3D } from 'three'

export function loadGLTFModel(
    scene: Scene,
    glbPath: string,
    options = { receiveShadow: true, castShadow: true }
): Promise<Object3D> {
    const { receiveShadow, castShadow } = options
    return new Promise((resolve, reject) => {
        const loader = new GLTFLoader()

        loader.load(
            glbPath,
            (gltf: GLTF) => {
                const obj = gltf.scene
                obj.name = 'computer'
                obj.position.y = 0
                obj.position.x = 0
                obj.receiveShadow = receiveShadow
                obj.castShadow = castShadow
                scene.add(obj)

                obj.traverse(function (child) {
                    if ((child as any).isMesh) {
                        child.castShadow = castShadow
                        child.receiveShadow = receiveShadow
                    }
                })
                resolve(obj)
            },
            undefined,
            function (error: unknown) {
                reject(error)
            }
        )
    })
}
