import React, { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { motion } from 'framer-motion'

interface GlobeMeshProps {
  onPakistanClick: () => void
  isZoomed: boolean
}

const GlobeMesh: React.FC<GlobeMeshProps> = ({ onPakistanClick, isZoomed }) => {
  const globeRef = useRef<THREE.Mesh>(null)
  const atmosphereRef = useRef<THREE.Mesh>(null)
  const pakistanMarkerRef = useRef<THREE.Mesh>(null)
  const t = useRef(0)
  const targetCameraPos = useRef(new THREE.Vector3(0, 0, 2.5))

  // Create Earth texture with canvas
  const createEarthTexture = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 2048
    canvas.height = 1024
    const ctx = canvas.getContext('2d')!

    // Ocean
    ctx.fillStyle = '#1a4d8f'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Continents - simplified
    ctx.fillStyle = '#2d5f1f'
    // North America
    ctx.fillRect(100, 200, 280, 280)
    // South America
    ctx.fillRect(200, 500, 140, 200)
    // Europe
    ctx.fillRect(500, 150, 180, 150)
    // Africa
    ctx.fillRect(550, 350, 200, 300)
    // Pakistan & South Asia - HIGHLIGHTED
    ctx.fillStyle = '#4a9d3a'
    ctx.fillRect(700, 350, 100, 120)
    // India
    ctx.fillRect(750, 380, 80, 100)
    // Asia
    ctx.fillRect(800, 200, 400, 280)
    // Australia
    ctx.fillRect(850, 550, 120, 100)

    // Add glow effect
    ctx.strokeStyle = 'rgba(255, 200, 0, 0.3)'
    ctx.lineWidth = 2
    ctx.strokeRect(700, 350, 100, 120) // Pakistan highlight

    const texture = new THREE.CanvasTexture(canvas)
    texture.magFilter = THREE.LinearFilter
    texture.minFilter = THREE.LinearMipmapLinearFilter
    return texture
  }

  // Create glow texture
  const createGlowTexture = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')!

    const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256)
    gradient.addColorStop(0, 'rgba(34, 197, 94, 0.8)')
    gradient.addColorStop(0.7, 'rgba(34, 197, 94, 0.3)')
    gradient.addColorStop(1, 'rgba(34, 197, 94, 0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 512, 512)

    return new THREE.CanvasTexture(canvas)
  }

  const earthTexture = createEarthTexture()
  const glowTexture = createGlowTexture()

  useFrame((state) => {
    if (!globeRef.current) return

    t.current += 0.0003 // Slow rotation

    // Rotate globe smoothly
    globeRef.current.rotation.y += 0.0002
    if (!isZoomed) {
      globeRef.current.rotation.x = Math.sin(t.current * 0.4) * 0.15
    }

    // Rotate atmosphere
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y = globeRef.current.rotation.y
      atmosphereRef.current.rotation.x = globeRef.current.rotation.x
    }

    // Pakistan marker glow
    if (pakistanMarkerRef.current) {
      pakistanMarkerRef.current.scale.setScalar(1 + Math.sin(t.current * 4) * 0.15)
      pakistanMarkerRef.current.rotation.z += 0.02
    }

    // Smooth camera movement on zoom
    if (state.camera instanceof THREE.PerspectiveCamera) {
      const currentPos = new THREE.Vector3()
      state.camera.getWorldPosition(currentPos)
      currentPos.lerp(targetCameraPos.current, 0.03)
      state.camera.position.copy(currentPos)
      state.camera.lookAt(0, 0, 0)
    }
  })

  const handleGlobeClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    // Pakistan is approximately at lng: 69, lat: 30
    // Convert to normalized position
    if (!isZoomed) {
      targetCameraPos.current = new THREE.Vector3(0.3, 0.2, 0.8)
      onPakistanClick()
    } else {
      targetCameraPos.current = new THREE.Vector3(0, 0, 2.5)
    }
  }

  return (
    <group>
      {/* Main Earth Globe */}
      <mesh ref={globeRef} onClick={handleGlobeClick} castShadow receiveShadow>
        <sphereGeometry args={[1, 128, 64]} />
        <meshPhysicalMaterial
          map={earthTexture}
          metalness={0.1}
          roughness={0.7}
          emissive="#1a4d8f"
          emissiveIntensity={0.15}
          envMapIntensity={0.4}
        />
      </mesh>

      {/* Atmospheric glow */}
      <mesh ref={atmosphereRef} scale={1.05}>
        <sphereGeometry args={[1, 64, 32]} />
        <meshBasicMaterial
          map={glowTexture}
          transparent
          opacity={0.4}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Pakistan marker - positioned on globe surface */}
      <group position={[0.71, 0.35, 0.65]}>
        <mesh ref={pakistanMarkerRef}>
          <sphereGeometry args={[0.15, 32, 32]} />
          <meshStandardMaterial
            color="#facc15"
            emissive="#facc15"
            emissiveIntensity={0.8}
            metalness={0.6}
            roughness={0.2}
          />
        </mesh>
        {/* Marker pulse ring */}
        <mesh scale={1.4} position={[0, 0, 0.01]}>
          <circleGeometry args={[0.12, 32]} />
          <meshBasicMaterial
            color="#facc15"
            transparent
            opacity={0.4}
          />
        </mesh>
      </group>

      {/* Lighting */}
      <pointLight position={[5, 3, 5]} intensity={1.5} color="#ffffff" />
      <ambientLight intensity={0.6} color="#bbf7d0" />
      <directionalLight position={[2, 2, 2]} intensity={0.8} />
    </group>
  )
}

const GlobeAnimation: React.FC = () => {
  const [canRender3D, setCanRender3D] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false)
  const [showText, setShowText] = useState(false)

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

  const handlePakistanClick = () => {
    setIsZoomed(true)
    setTimeout(() => setShowText(true), 400)
  }

  const handleZoomOut = () => {
    setShowText(false)
    setTimeout(() => setIsZoomed(false), 300)
  }

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black flex flex-col items-center justify-center overflow-hidden">
      {/* Background stars effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(60)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* 3D Globe Canvas */}
      <div className="relative w-full h-full">
        {canRender3D && (
          <Canvas
            camera={{ position: [0, 0, 2.5], fov: 45, near: 0.1, far: 1000 }}
            className="w-full h-full"
            gl={{
              antialias: true,
              alpha: true,
              preserveDrawingBuffer: true,
            }}
          >
            <GlobeMesh onPakistanClick={handlePakistanClick} isZoomed={isZoomed} />
          </Canvas>
        )}

        {/* Overlay Text - Pakistan Branding */}
        {isZoomed && showText && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="relative z-20"
              initial={{ scale: 0.3, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              transition={{
                type: 'spring',
                stiffness: 100,
                damping: 20,
              }}
            >
              <div className="text-center">
                <motion.h1
                  className="font-display text-6xl md:text-7xl font-bold bg-gradient-to-r from-brand-400 via-brand-500 to-gold-400 bg-clip-text text-transparent drop-shadow-2xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  NayaCapital
                </motion.h1>
                <motion.p
                  className="text-gold-300 text-lg md:text-xl font-semibold tracking-widest mt-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  Investing in Pakistan's Future
                </motion.p>
                <motion.div
                  className="mt-8 flex justify-center gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                >
                  <motion.button
                    onClick={handleZoomOut}
                    className="px-8 py-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white font-semibold rounded-lg hover:shadow-2xl hover:shadow-brand-500/50 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Explore Globe
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Zoom hint text */}
        {!isZoomed && (
          <motion.div
            className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center pointer-events-none"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            <p className="text-gold-300 font-semibold text-sm md:text-base">
              Click on the golden marker over Pakistan
            </p>
          </motion.div>
        )}

        {/* Title section */}
        <motion.div
          className="absolute top-12 left-1/2 -translate-x-1/2 text-center pointer-events-none z-10"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
            Global Investment Hub
          </h2>
          <p className="text-gold-200 text-sm md:text-base">
            Connecting investors worldwide to opportunities in Pakistan
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default GlobeAnimation
