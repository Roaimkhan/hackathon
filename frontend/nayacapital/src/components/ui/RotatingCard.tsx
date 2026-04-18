import React, { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { PerspectiveCamera, Sphere } from '@react-three/drei'
import * as THREE from 'three'

// Particle system for wealth flow
const ParticleSystem: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null)
  const particleCount = 200
  const t = useRef(0)

  useEffect(() => {
    if (!pointsRef.current) return
    const positions = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 6
      positions[i + 1] = (Math.random() - 0.5) * 6
      positions[i + 2] = (Math.random() - 0.5) * 6
    }
    pointsRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  }, [])

  useFrame(() => {
    if (!pointsRef.current) return
    t.current += 0.01
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i + 1] += Math.sin(t.current + positions[i]) * 0.008
      if (positions[i + 1] > 3) positions[i + 1] = -3
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry />
      <pointsMaterial size={0.04} color="#22c55e" transparent opacity={0.4} sizeAttenuation />
    </points>
  )
}

// Premium investment coin
const InvestmentCoin: React.FC<{ 
  position: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
  color: string
  emissiveColor: string
  rotationSpeed?: number
}> = ({ position, rotation = [0, 0, 0], scale = 1, color, emissiveColor, rotationSpeed = 1 }) => {
  const meshRef = useRef<THREE.Group>(null)
  const t = useRef(0)

  useFrame(() => {
    if (!meshRef.current) return
    t.current += 0.016 * rotationSpeed
    meshRef.current.rotation.y += 0.008 * rotationSpeed
    meshRef.current.rotation.x = Math.sin(t.current * 0.5) * 0.15
    meshRef.current.position.y += Math.sin(t.current * 2) * 0.003
  })

  return (
    <group ref={meshRef} position={position} rotation={rotation} scale={scale}>
      {/* Main coin */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.8, 0.8, 0.18, 64]} />
        <meshPhysicalMaterial
          color={color}
          metalness={0.85}
          roughness={0.12}
          emissive={emissiveColor}
          emissiveIntensity={0.4}
          envMapIntensity={1}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* Coin rim */}
      <mesh position={[0, 0.095, 0]} castShadow>
        <torusGeometry args={[0.82, 0.08, 32, 100]} />
        <meshStandardMaterial
          color={emissiveColor}
          metalness={0.9}
          roughness={0.08}
          emissive={emissiveColor}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Glowing edge */}
      <mesh position={[0, 0, 0.1]}>
        <torusGeometry args={[0.8, 0.06, 32, 100]} />
        <meshBasicMaterial color={emissiveColor} transparent opacity={0.6} />
      </mesh>

      {/* Center glow sphere */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshBasicMaterial color={emissiveColor} transparent opacity={0.3} />
      </mesh>
    </group>
  )
}

// Central rotating structure
const CentralStructure: React.FC<{ pointer: React.MutableRefObject<{ x: number; y: number }> }> = ({ pointer }) => {
  const groupRef = useRef<THREE.Group>(null)
  const coreRef = useRef<THREE.Mesh>(null)
  const orbitRingsRef = useRef<THREE.Group>(null)
  const t = useRef(0)
  const targetRotation = useRef({ x: 0, y: 0 })

  useFrame(() => {
    if (!groupRef.current) return

    t.current += 0.016

    // Pointer tracking
    targetRotation.current.y = pointer.current.x * 0.4
    targetRotation.current.x = -pointer.current.y * 0.3

    groupRef.current.rotation.x += (targetRotation.current.x - groupRef.current.rotation.x) * 0.06
    groupRef.current.rotation.y += (targetRotation.current.y - groupRef.current.rotation.y) * 0.06

    // Core rotation
    if (coreRef.current) {
      coreRef.current.rotation.z += 0.005
    }

    // Orbit rings
    if (orbitRingsRef.current) {
      orbitRingsRef.current.children.forEach((child: any, idx: number) => {
        if (idx % 2 === 0) {
          child.rotation.z += 0.003
        } else {
          child.rotation.z -= 0.003
        }
        child.rotation.x = Math.sin(t.current * 0.3 + idx) * 0.1
      })
    }
  })

  return (
    <group ref={groupRef}>
      {/* Central core */}
      <mesh ref={coreRef} castShadow receiveShadow>
        <icosahedronGeometry args={[0.5, 4]} />
        <meshPhysicalMaterial
          color="#facc15"
          metalness={0.9}
          roughness={0.08}
          emissive="#facc15"
          emissiveIntensity={0.6}
          clearcoat={1}
          clearcoatRoughness={0.12}
        />
      </mesh>

      {/* Core glow */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshBasicMaterial color="#facc15" transparent opacity={0.15} />
      </mesh>

      {/* Orbiting rings */}
      <group ref={orbitRingsRef}>
        <mesh position={[0, 0, 0]}>
          <torusGeometry args={[1.4, 0.08, 12, 100]} />
          <meshStandardMaterial
            color="#22c55e"
            metalness={0.8}
            roughness={0.15}
            emissive="#22c55e"
            emissiveIntensity={0.4}
          />
        </mesh>

        <mesh position={[0, 0, 0]} rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[1.4, 0.06, 12, 100]} />
          <meshStandardMaterial
            color="#facc15"
            metalness={0.85}
            roughness={0.1}
            emissive="#facc15"
            emissiveIntensity={0.35}
          />
        </mesh>

        <mesh position={[0, 0, 0]} rotation={[0, Math.PI / 3, 0]}>
          <torusGeometry args={[1.4, 0.06, 12, 100]} />
          <meshStandardMaterial
            color="#10b981"
            metalness={0.75}
            roughness={0.2}
            emissive="#10b981"
            emissiveIntensity={0.3}
          />
        </mesh>
      </group>

      {/* Investment coins orbiting */}
      <InvestmentCoin 
        position={[2, 0, 0]} 
        color="#0f9f4a" 
        emissiveColor="#22c55e" 
        scale={0.6}
        rotationSpeed={0.8}
      />
      <InvestmentCoin 
        position={[-2, 0, 0]} 
        color="#0f9f4a" 
        emissiveColor="#22c55e" 
        scale={0.6}
        rotationSpeed={0.8}
      />
      <InvestmentCoin 
        position={[0, 2, 0]} 
        color="#facc15" 
        emissiveColor="#fbbf24" 
        scale={0.55}
        rotationSpeed={0.9}
      />
      <InvestmentCoin 
        position={[0, -2, 0]} 
        color="#10b981" 
        emissiveColor="#34d399" 
        scale={0.55}
        rotationSpeed={0.9}
      />

      {/* Connecting lines between coins */}
      <line>
        <bufferGeometry attach="geometry">
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([2, 0, 0, -2, 0, 0, 0, 2, 0, 0, -2, 0]), 3]}
            count={4}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#22c55e" transparent opacity={0.4} linewidth={2} />
      </line>

      {/* Outer glow sphere */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[3, 32, 32]} />
        <meshBasicMaterial color="#22c55e" transparent opacity={0.05} />
      </mesh>
    </group>
  )
}

const RotatingCard: React.FC = () => {
  const pointer = useRef({ x: 0, y: 0 })
  const rootRef = useRef<HTMLDivElement>(null)
  const [canRender3D, setCanRender3D] = useState(false)

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas')
      const hasWebGL =
        !!canvas.getContext('webgl') ||
        !!canvas.getContext('experimental-webgl') ||
        !!canvas.getContext('webgl2')
      setCanRender3D(hasWebGL)
    } catch {
      setCanRender3D(false)
    }
  }, [])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!rootRef.current) return
    const rect = rootRef.current.getBoundingClientRect()
    const nx = (e.clientX - rect.left) / rect.width
    const ny = (e.clientY - rect.top) / rect.height

    pointer.current = {
      x: (nx - 0.5) * 2,
      y: (ny - 0.5) * 2,
    }
  }

  return (
    <div
      ref={rootRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        pointer.current = { x: 0, y: 0 }
      }}
      className="relative ml-auto w-full max-w-[520px] h-[520px]"
      style={{ perspective: '1200px' }}
    >
      {canRender3D ? (
        <Canvas
          camera={{ position: [0, 0, 3.8], fov: 45 }}
          className="w-full h-full"
          shadows
          gl={{
            antialias: true,
            alpha: true,
            preserveDrawingBuffer: true,
          }}
        >
          <PerspectiveCamera makeDefault position={[0, 0, 3.8]} fov={45} />
          
          {/* Lighting setup */}
          <ambientLight intensity={0.5} color="#ffffff" />
          <directionalLight 
            position={[3, 3, 3]} 
            intensity={1.4} 
            color="#ffffff" 
            castShadow 
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight position={[2, -2, 2]} intensity={1} color="#22c55e" />
          <pointLight position={[-2, 2, 2]} intensity={0.8} color="#facc15" />
          <pointLight position={[0, 0, -3]} intensity={0.6} color="#10b981" />
          
          {/* Main visualization */}
          <CentralStructure pointer={pointer} />
          
          {/* Particle flow */}
          <ParticleSystem />

          {/* Background glow */}
          <Sphere args={[6, 32, 32]} position={[0, 0, -1]}>
            <meshBasicMaterial 
              color="#0f9f4a" 
              transparent 
              opacity={0.08}
            />
          </Sphere>
        </Canvas>
      ) : (
        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-brand-50 to-white">
          <div className="text-center">
            <div className="w-32 h-32 rounded-full mx-auto mb-4 bg-gradient-to-br from-brand-400 to-gold-300 shadow-lg" />
            <p className="text-brand-700 font-display text-2xl font-bold">NayaCapital</p>
            <p className="text-brand-600 text-sm mt-2">Premium Investment Hub</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default RotatingCard
