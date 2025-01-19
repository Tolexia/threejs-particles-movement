import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef, useEffect } from 'react'
import * as THREE from 'three'
import { GPUComputationRenderer } from 'three/addons/misc/GPUComputationRenderer.js'
import particlesVertexShader from '../shaders/particles/vertex.js'
import particlesFragmentShader from '../shaders/particles/fragment.js'
import gpgpuParticlesShader from '../shaders/gpgpu/particles.js'
import { useControls } from 'leva'

export default function Particles({ model }) {
  const { gl, size, viewport, pointer } = useThree()
  const particlesRef = useRef()

  const {particleSize, flowFieldInfluence, flowFieldStrength, flowFieldFrequency, speed} = useControls('Particles', {
    speed: { value: 0.2, min: 0, max: 1, step: 0.001 },
    particleSize: { value: 0.05, min: 0, max: 0.5, step: 0.001 },
    flowFieldInfluence: { value: 0.5, min: 0, max: 1, step: 0.001 },
    flowFieldStrength: { value: 2, min: 0, max: 10, step: 0.001 },
    flowFieldFrequency: { value: 0.5, min: 0, max: 1, step: 0.001 }
  })


  // Create constant uniforms object
  const uniforms = useMemo(() => ({
    uSize: { value: particleSize },
    uResolution: { value: new THREE.Vector2(size.width * viewport.dpr, size.height * viewport.dpr) },
    uParticlesTexture: { value: null }
  }), [size])

  // Update uniforms when controls change
  useEffect(() => {
    if (!uniforms) return
    uniforms.uSize.value = particleSize
  }, [uniforms, particleSize])

  // GPGPU Setup
  const gpgpu = useMemo(() => {
    // if (!model) return null

    // const baseGeometry = model.children[0].geometry
    const baseGeometry = new THREE.SphereGeometry(1, 32, 32)
    const count = baseGeometry.attributes.position.count
    const gpgpuSize = Math.ceil(Math.sqrt(count))
    
    const computation = new GPUComputationRenderer(gpgpuSize, gpgpuSize, gl)
    const baseParticlesTexture = computation.createTexture()

    for(let i = 0; i < count; i++) {
      const i3 = i * 3
      const i4 = i * 4
      baseParticlesTexture.image.data[i4 + 0] = baseGeometry.attributes.position.array[i3 + 0]
      baseParticlesTexture.image.data[i4 + 1] = baseGeometry.attributes.position.array[i3 + 1]
      baseParticlesTexture.image.data[i4 + 2] = baseGeometry.attributes.position.array[i3 + 2]
      baseParticlesTexture.image.data[i4 + 3] = Math.random()
    }

    const particlesVariable = computation.addVariable('uParticles', gpgpuParticlesShader, baseParticlesTexture)
    computation.setVariableDependencies(particlesVariable, [ particlesVariable ])

    particlesVariable.material.uniforms.uSpeed = { value: speed }
    particlesVariable.material.uniforms.uTime = { value: 0 }
    particlesVariable.material.uniforms.uDeltaTime = { value: 0 }
    particlesVariable.material.uniforms.uBase = { value: baseParticlesTexture }
    particlesVariable.material.uniforms.uFlowFieldInfluence = { value: flowFieldInfluence }
    particlesVariable.material.uniforms.uFlowFieldStrength = { value: flowFieldStrength }
    particlesVariable.material.uniforms.uFlowFieldFrequency = { value: flowFieldFrequency }

    computation.init()

    return {
      computation,
      particlesVariable,
      baseGeometry,
      count,
      gpgpuSize
    }
// }, [model, gl])
  }, [gl]) // Retiré model de la dépendance car nous utilisons une sphère

  // Update uniforms when controls change
  useEffect(() => {
    if (!gpgpu) return

    gpgpu.particlesVariable.material.uniforms.uSpeed.value = speed
    gpgpu.particlesVariable.material.uniforms.uFlowFieldInfluence.value = flowFieldInfluence
    gpgpu.particlesVariable.material.uniforms.uFlowFieldStrength.value = flowFieldStrength
    gpgpu.particlesVariable.material.uniforms.uFlowFieldFrequency.value = flowFieldFrequency
  }, [gpgpu, speed, flowFieldInfluence, flowFieldStrength, flowFieldFrequency])

  // Particles geometry setup
  const geometry = useMemo(() => {
    if (!gpgpu) return null

    const particlesUvArray = new Float32Array(gpgpu.count * 2)
    const sizesArray = new Float32Array(gpgpu.count)
    const colorsArray = new Float32Array(gpgpu.count * 3)

    for(let y = 0; y < gpgpu.gpgpuSize; y++) {
      for(let x = 0; x < gpgpu.gpgpuSize; x++) {
        const i = (y * gpgpu.gpgpuSize + x)
        const i2 = i * 2
        const i3 = i * 3

        particlesUvArray[i2 + 0] = (x + 0.5) / gpgpu.gpgpuSize
        particlesUvArray[i2 + 1] = (y + 0.5) / gpgpu.gpgpuSize

        sizesArray[i] = Math.random()

        // Ajouter des couleurs aléatoires pour la sphère
        colorsArray[i3 + 0] = Math.random()
        colorsArray[i3 + 1] = Math.random()
        colorsArray[i3 + 2] = Math.random()
      }
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setDrawRange(0, gpgpu.count)
    geometry.setAttribute('aParticlesUv', new THREE.BufferAttribute(particlesUvArray, 2))
    // geometry.setAttribute('aColor', gpgpu.baseGeometry.attributes.color)
    geometry.setAttribute('aColor', new THREE.BufferAttribute(colorsArray, 3))
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizesArray, 1))

    return geometry
  }, [gpgpu])

  useFrame((state, delta) => {
    if (!gpgpu || !particlesRef.current) return

    // Update GPGPU
    gpgpu.particlesVariable.material.uniforms.uTime.value = state.clock.elapsedTime
    gpgpu.particlesVariable.material.uniforms.uSpeed.value = speed
    gpgpu.particlesVariable.material.uniforms.uDeltaTime.value = delta
    gpgpu.computation.compute()

    // Update particles material
    uniforms.uParticlesTexture.value = gpgpu.computation.getCurrentRenderTarget(gpgpu.particlesVariable).texture
  })

  if (!geometry) return null

  return (
    <points ref={particlesRef}>
      <primitive object={geometry} attach="geometry" />
      <shaderMaterial
        vertexShader={particlesVertexShader}
        fragmentShader={particlesFragmentShader}
        uniforms={uniforms}
      />
    </points>
  )
} 