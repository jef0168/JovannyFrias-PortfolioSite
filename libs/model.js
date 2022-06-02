import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

export function loadGLTFModel(
  scene,
  glbPath,
  options = { receiveShadow: true, castShadow: true }
) {
  const { receiveShadow, castShadow } = options
  let counter  =0;
  console.log('LoadModel called')
  return new Promise(async (resolve, reject) => {
    const loader = new GLTFLoader()
    
    loader.loadAsync(
      glbPath
    ).then(gltf => {
      const obj = gltf.scene
      obj.name = 'computer'
      obj.position.y = -150
      obj.position.x = 0
      obj.receiveShadow = receiveShadow
      obj.castShadow = castShadow
      scene.add(obj)
      
      obj.traverse(function (child) {
        if (child.isMesh) {
          child.castShadow = castShadow
          child.receiveShadow = receiveShadow
        }
      })
      resolve(obj)
    }).catch(function (err) {
      reject(err)
    })
  })
}