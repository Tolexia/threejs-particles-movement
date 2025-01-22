import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { useEffect, useState } from 'react'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import Particles from './components/Particles'

export default function App() {
  const [model, setModel] = useState(null)



  useEffect(() => {
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('/draco/')

    const loader = new GLTFLoader()
    loader.setDRACOLoader(dracoLoader)
    
    loader.load('./model.glb', (gltf) => {
      setModel(gltf.scene)
    })
  }, [])

  return (
    <>
      <color attach="background" args={["#29191f"]} />
      <OrbitControls makeDefault enableDamping 
    //   autoRotate autoRotateSpeed={0.5} 
      zoomSpeed={0.5} />
      <PerspectiveCamera makeDefault position={[4.5, 4, 11]} fov={35} near={0.1} far={100} />
      {model && <Particles 
        model={model}
      />}
    </>
  )
}
