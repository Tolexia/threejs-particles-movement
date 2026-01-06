import { PerspectiveCamera } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import Particles from './components/Particles'
import { Leva } from 'leva'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'

export default function App() {
    const pointLight = useRef()
    const pointMesh = useRef()
    const lightColor = useMemo(() => new THREE.Vector3(1.0, 0.0, 0.0), []) // Bright red
    const lightPosition = useRef(new THREE.Vector3(-2, -2, 5))

    const {pointer, viewport} = useThree()

    useFrame(() => {
        if(!lightPosition.current) return

        // Calculate new position
        const targetPosition = new THREE.Vector3(
            pointer.x * (viewport.width / 4),
            pointer.y * (viewport.height / 4),
            5
        )

        // Smooth position update
        lightPosition.current.lerp(targetPosition, 0.2)

        // Update references
        if(pointMesh.current) {
            pointMesh.current.position.copy(lightPosition.current)
        }
        if(pointLight.current) {
            pointLight.current.position.copy(lightPosition.current)
        }
    })

    return (
        <>
            <color attach="background" args={["#29191f"]} />
            <pointLight ref={pointLight} position={lightPosition.current.toArray()} intensity={3} color={lightColor.toArray()} />
            
            {/* Emissive sphere */}
            <mesh ref={pointMesh} position={lightPosition.current.toArray()}>
                <sphereGeometry args={[0.2, 16, 16]} />
                <meshBasicMaterial
                    color={new THREE.Color(
                        lightColor.x * 3.0,
                        lightColor.y * 3.0,
                        lightColor.z * 3.0
                    )}
                    toneMapped={false}
                />
            </mesh>

            <PerspectiveCamera makeDefault position={[0,0, 11]} fov={35} near={0.1} far={100} />
            <Particles lightPosition={lightPosition} lightColor={lightColor} />
            <Leva
        hidden // default = false, when true the GUI is hidden
      />
        </>
    )
}
