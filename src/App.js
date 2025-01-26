import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { useEffect, useRef, useState } from 'react'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import Particles from './components/Particles'
import { Leva } from 'leva'

export default function App() {

    const pointLight = useRef()

  return (
    <>
        <color attach="background" args={["#29191f"]} />
        <pointLight ref={pointLight} position={[-2, -2, 5]} intensity={1} color={'#ff0000'} />
        {/* <OrbitControls makeDefault enableDamping 
      autoRotate autoRotateSpeed={0.5} 
      zoomSpeed={0.5} /> */}
        <PerspectiveCamera makeDefault position={[0,0, 11]} fov={35} near={0.1} far={100} />
        <Particles light={pointLight} />
        {/* <Leva
        hidden // default = false, when true the GUI is hidden
      /> */}
    </>
  )
}
