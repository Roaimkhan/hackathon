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

  // Create PHOTOREALISTIC NASA-Quality Earth texture (8K)
  const createEarthTexture = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 8192  // Ultra HD 8K
    canvas.height = 4096
    const ctx = canvas.getContext('2d')!

    // ================== PHOTOREALISTIC OCEAN LAYER ==================
    // Deep dark navy ocean matching NASA satellite imagery
    const oceanGradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    oceanGradient.addColorStop(0, '#030d1a')      // Extreme dark blue (North Pole)
    oceanGradient.addColorStop(0.15, '#0a1f2e')   // Polar darkness
    oceanGradient.addColorStop(0.3, '#0d2d44')    // Cold water tones
    oceanGradient.addColorStop(0.5, '#1a4d7a')    // Equatorial ocean (deeper blue)
    oceanGradient.addColorStop(0.7, '#0d2d44')    // Back to cold
    oceanGradient.addColorStop(0.85, '#0a1f2e')   // Polar region
    oceanGradient.addColorStop(1, '#030d1a')      // South Pole extreme dark
    ctx.fillStyle = oceanGradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Add deep ocean texture with realistic variation
    ctx.fillStyle = 'rgba(15, 40, 70, 0.12)'
    for (let i = 0; i < 300; i++) {
      ctx.beginPath()
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * 120 + 40,
        0,
        Math.PI * 2
      )
      ctx.fill()
    }

    // ================== CLOUD LAYERS (Poles - Icy Blue-White) ==================
    // North Pole cloud layer - icy white-blue
    ctx.fillStyle = 'rgba(200, 220, 240, 0.35)'
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * canvas.width
      const y = Math.random() * 400 + 50  // North pole region
      const size = Math.random() * 200 + 100
      const grad = ctx.createRadialGradient(x, y, size * 0.3, x, y, size)
      grad.addColorStop(0, 'rgba(220, 235, 255, 0.6)')
      grad.addColorStop(1, 'rgba(180, 210, 240, 0.1)')
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()
    }

    // South Pole cloud layer - icy white-blue
    ctx.fillStyle = 'rgba(200, 220, 240, 0.35)'
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * canvas.width
      const y = Math.random() * 400 + (canvas.height - 400)  // South pole region
      const size = Math.random() * 200 + 100
      const grad = ctx.createRadialGradient(x, y, size * 0.3, x, y, size)
      grad.addColorStop(0, 'rgba(220, 235, 255, 0.6)')
      grad.addColorStop(1, 'rgba(180, 210, 240, 0.1)')
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()
    }

    // Scattered mid-latitude clouds
    ctx.fillStyle = 'rgba(240, 245, 255, 0.2)'
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * canvas.width
      const y = Math.random() * 2000 + 500
      const size = Math.random() * 150 + 50
      ctx.fillStyle = `rgba(${240 - Math.random()*40}, ${245 - Math.random()*20}, 255, ${0.15 + Math.random() * 0.1})`
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()
    }

    // ================== CONTINENT LAYER (More realistic) ==================
    
    // North America - detailed shape
    ctx.fillStyle = '#0d3d1e'
    ctx.beginPath()
    ctx.ellipse(500, 600, 280, 380, 0.25, 0, Math.PI * 2)
    ctx.fill()
    // Mountain effect
    ctx.fillStyle = '#1a5a3a'
    ctx.beginPath()
    ctx.ellipse(480, 580, 80, 150, 0.3, 0, Math.PI * 2)
    ctx.fill()

    // South America
    ctx.fillStyle = '#1a5a2f'
    ctx.beginPath()
    ctx.ellipse(650, 1200, 150, 280, 0.1, 0, Math.PI * 2)
    ctx.fill()
    // Amazon rainforest (darker green)
    ctx.fillStyle = '#0f3a20'
    ctx.beginPath()
    ctx.ellipse(680, 1100, 80, 120, 0, 0, Math.PI * 2)
    ctx.fill()

    // Europe - detailed
    ctx.fillStyle = '#2d7a5a'
    ctx.beginPath()
    ctx.ellipse(1500, 600, 220, 180, 0, 0, Math.PI * 2)
    ctx.fill()
    // Scandinavian detail
    ctx.fillStyle = '#1a5a40'
    ctx.beginPath()
    ctx.ellipse(1520, 450, 60, 120, 0.3, 0, Math.PI * 2)
    ctx.fill()

    // Africa - large detailed continent
    ctx.fillStyle = '#2d6a4a'
    ctx.beginPath()
    ctx.ellipse(1800, 1000, 280, 380, 0.08, 0, Math.PI * 2)
    ctx.fill()
    // Sahara (lighter)
    ctx.fillStyle = '#4a8a6a'
    ctx.beginPath()
    ctx.ellipse(1750, 750, 150, 200, 0, 0, Math.PI * 2)
    ctx.fill()

    // Pakistan & South Asia - PREMIUM HIGHLIGHT
    ctx.fillStyle = '#22c55e'
    ctx.beginPath()
    ctx.ellipse(2350, 1000, 140, 180, 0.25, 0, Math.PI * 2)
    ctx.fill()
    // Himalayan mountains
    ctx.fillStyle = '#10a038'
    ctx.beginPath()
    ctx.ellipse(2380, 900, 50, 120, 0.4, 0, Math.PI * 2)
    ctx.fill()

    // India - larger detailed
    ctx.fillStyle = '#1ca94a'
    ctx.beginPath()
    ctx.ellipse(2420, 1080, 120, 160, 0, 0, Math.PI * 2)
    ctx.fill()

    // Southeast Asia
    ctx.fillStyle = '#1ea055'
    ctx.beginPath()
    ctx.ellipse(2600, 1150, 100, 140, 0.1, 0, Math.PI * 2)
    ctx.fill()

    // China & East Asia - very detailed
    ctx.fillStyle = '#2d7a5a'
    ctx.beginPath()
    ctx.ellipse(2900, 900, 350, 250, 0, 0, Math.PI * 2)
    ctx.fill()
    // Himalayan range
    ctx.fillStyle = '#1a5a40'
    ctx.beginPath()
    ctx.ellipse(2700, 800, 150, 280, 0.3, 0, Math.PI * 2)
    ctx.fill()

    // Japan - island detail
    ctx.fillStyle = '#1ca94a'
    ctx.beginPath()
    ctx.ellipse(3100, 850, 40, 80, 0.4, 0, Math.PI * 2)
    ctx.fill()

    // Australia - medium continent
    ctx.fillStyle = '#2d6a4a'
    ctx.beginPath()
    ctx.ellipse(3000, 1400, 180, 180, 0.1, 0, Math.PI * 2)
    ctx.fill()

    // Greenland & Arctic
    ctx.fillStyle = '#1a5a40'
    ctx.beginPath()
    ctx.ellipse(2000, 300, 150, 200, 0.3, 0, Math.PI * 2)
    ctx.fill()

    // New Zealand
    ctx.fillStyle = '#1ca94a'
    ctx.beginPath()
    ctx.ellipse(3200, 1550, 50, 70, 0.3, 0, Math.PI * 2)
    ctx.fill()

    // ================== CITY LIGHTS LAYER (PHOTOREALISTIC NASA Night Lights) ==================
    // Ultra-detailed warm golden-yellow city lights with realistic coastal clustering
    
    // Premium city light colors - warm golden-yellow (exact NASA night lights appearance)
    const cityLightColor = 'rgba(255, 230, 100, 0.95)'      // Warm golden-yellow
    const cityGlowColor = 'rgba(255, 200, 50, 0.45)'        // Outer glow
    const smallCityLight = 'rgba(255, 215, 80, 0.85)'       // Smaller cities
    const smallCityGlow = 'rgba(255, 180, 40, 0.35)'
    
    // ULTRA-DETAILED NORTH AMERICAN CITIES (User requested focus)
    const northAmericanCities = [
      // East Coast USA - highly detailed coastal clustering
      { x: 500, y: 530, name: 'Boston', size: 3.5, glow: 14 },
      { x: 495, y: 545, name: 'NYC', size: 6, glow: 24 },
      { x: 490, y: 560, name: 'Philadelphia', size: 4.5, glow: 18 },
      { x: 485, y: 575, name: 'Washington DC', size: 4, glow: 16 },
      { x: 480, y: 595, name: 'Charlotte', size: 3.5, glow: 14 },
      { x: 475, y: 615, name: 'Atlanta', size: 5, glow: 20 },
      { x: 470, y: 640, name: 'Miami', size: 4.5, glow: 18 },
      
      // Great Lakes / Midwest - dense cluster
      { x: 480, y: 500, name: 'Detroit', size: 4, glow: 16 },
      { x: 485, y: 510, name: 'Cleveland', size: 3.5, glow: 14 },
      { x: 490, y: 500, name: 'Pittsburgh', size: 3, glow: 12 },
      { x: 475, y: 520, name: 'Chicago', size: 5.5, glow: 22 },
      { x: 470, y: 530, name: 'Milwaukee', size: 3, glow: 12 },
      
      // Central USA
      { x: 460, y: 550, name: 'St. Louis', size: 3.5, glow: 14 },
      { x: 450, y: 560, name: 'Memphis', size: 3, glow: 12 },
      { x: 455, y: 580, name: 'Dallas', size: 5, glow: 20 },
      { x: 450, y: 595, name: 'Houston', size: 5, glow: 20 },
      { x: 445, y: 625, name: 'New Orleans', size: 4, glow: 16 },
      
      // Southwest USA
      { x: 420, y: 550, name: 'Denver', size: 4, glow: 16 },
      { x: 410, y: 570, name: 'Phoenix', size: 4.5, glow: 18 },
      { x: 420, y: 600, name: 'Albuquerque', size: 2.5, glow: 10 },
      
      // West Coast USA - premium mega-clusters
      { x: 380, y: 500, name: 'Seattle', size: 4.5, glow: 18 },
      { x: 370, y: 530, name: 'Portland', size: 3.5, glow: 14 },
      { x: 360, y: 560, name: 'San Francisco', size: 5, glow: 20 },
      { x: 355, y: 580, name: 'Los Angeles', size: 6.5, glow: 26 },
      { x: 350, y: 610, name: 'San Diego', size: 4.5, glow: 18 },
      
      // Canada
      { x: 520, y: 420, name: 'Toronto', size: 4, glow: 16 },
      { x: 500, y: 400, name: 'Montreal', size: 4, glow: 16 },
      { x: 530, y: 350, name: 'Quebec City', size: 2.5, glow: 10 },
      { x: 540, y: 380, name: 'Ottawa', size: 2.5, glow: 10 },
      { x: 380, y: 380, name: 'Vancouver', size: 3.5, glow: 14 },
      
      // Mexico
      { x: 440, y: 700, name: 'Mexico City', size: 5.5, glow: 22 },
      { x: 430, y: 680, name: 'Guadalajara', size: 3.5, glow: 14 },
      { x: 450, y: 720, name: 'Monterrey', size: 3, glow: 12 },
      
      // Caribbean - densely detailed
      { x: 530, y: 700, name: 'Puerto Rico', size: 2.5, glow: 10 },
      { x: 525, y: 690, name: 'San Juan', size: 2.5, glow: 10 },
      { x: 515, y: 720, name: 'Haiti', size: 2, glow: 8 },
      { x: 510, y: 730, name: 'Jamaica', size: 1.5, glow: 6 },
      { x: 505, y: 750, name: 'Belize', size: 1.5, glow: 6 },
      { x: 520, y: 760, name: 'Bahamas', size: 2, glow: 8 },
      
      // Central America
      { x: 480, y: 750, name: 'Guatemala', size: 2.5, glow: 10 },
      { x: 490, y: 770, name: 'Honduras', size: 2, glow: 8 },
      { x: 495, y: 785, name: 'Nicaragua', size: 2, glow: 8 },
      { x: 500, y: 800, name: 'Costa Rica', size: 2, glow: 8 },
      { x: 495, y: 815, name: 'Panama', size: 2.5, glow: 10 },
    ]

    // GLOBAL SECONDARY FOCUS CITIES (lower emphasis)
    const globalCities = [
      // South America
      { x: 600, y: 1100, name: 'São Paulo', size: 5.5, glow: 22 },
      { x: 580, y: 1150, name: 'Rio', size: 4.5, glow: 18 },
      { x: 550, y: 1050, name: 'Buenos Aires', size: 4, glow: 16 },
      
      // Europe
      { x: 1500, y: 500, name: 'London', size: 4.5, glow: 18 },
      { x: 1520, y: 480, name: 'Paris', size: 4.5, glow: 18 },
      { x: 1600, y: 480, name: 'Germany', size: 5, glow: 20 },
      { x: 1450, y: 450, name: 'Dublin', size: 2.5, glow: 10 },
      
      // Africa
      { x: 1800, y: 1000, name: 'Cairo', size: 4.5, glow: 18 },
      { x: 1750, y: 1100, name: 'Lagos', size: 4, glow: 16 },
      
      // Middle East
      { x: 2100, y: 950, name: 'Dubai', size: 4, glow: 16 },
      { x: 2050, y: 1020, name: 'Riyadh', size: 4, glow: 16 },
      
      // South Asia
      { x: 2450, y: 1080, name: 'Mumbai', size: 5, glow: 20 },
      { x: 2520, y: 1050, name: 'Delhi', size: 4.5, glow: 18 },
      
      // East Asia
      { x: 2900, y: 800, name: 'Beijing', size: 5, glow: 20 },
      { x: 2950, y: 830, name: 'Shanghai', size: 5.5, glow: 22 },
      { x: 3100, y: 750, name: 'Tokyo', size: 6, glow: 24 },
      
      // Australia
      { x: 2950, y: 1450, name: 'Sydney', size: 3.5, glow: 14 },
    ]

    const allCities = [...northAmericanCities, ...globalCities]

    // Draw city glow halos first (background layer) - for North American cities, use brighter glow
    northAmericanCities.forEach(city => {
      ctx.fillStyle = cityGlowColor
      ctx.globalAlpha = 0.6
      ctx.beginPath()
      ctx.arc(city.x, city.y, city.glow * 1.2, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1.0
    })

    globalCities.forEach(city => {
      ctx.fillStyle = smallCityGlow
      ctx.globalAlpha = 0.5
      ctx.beginPath()
      ctx.arc(city.x, city.y, city.glow, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1.0
    })

    // Draw city lights (foreground layer) - primary lights
    northAmericanCities.forEach(city => {
      ctx.fillStyle = cityLightColor
      ctx.beginPath()
      ctx.arc(city.x, city.y, city.size, 0, Math.PI * 2)
      ctx.fill()
    })

    globalCities.forEach(city => {
      ctx.fillStyle = smallCityLight
      ctx.beginPath()
      ctx.arc(city.x, city.y, city.size * 0.8, 0, Math.PI * 2)
      ctx.fill()
    })

    // Add micro-city lights for ultra realism (small towns/clusters)
    for (let i = 0; i < 150; i++) {
      // Cluster around USA East/West coasts
      if (Math.random() > 0.5) {
        // East Coast cluster
        const x = 460 + Math.random() * 60
        const y = 500 + Math.random() * 150
        ctx.fillStyle = 'rgba(255, 210, 70, 0.7)'
        ctx.beginPath()
        ctx.arc(x, y, 1 + Math.random() * 1.5, 0, Math.PI * 2)
        ctx.fill()
      } else {
        // West Coast cluster
        const x = 350 + Math.random() * 60
        const y = 500 + Math.random() * 150
        ctx.fillStyle = 'rgba(255, 210, 70, 0.7)'
        ctx.beginPath()
        ctx.arc(x, y, 1 + Math.random() * 1.5, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Add atmospheric city light diffusion (very subtle)
    for (let i = 0; i < 50; i++) {
      const city = allCities[Math.floor(Math.random() * allCities.length)]
      const diffusionRadius = 30 + Math.random() * 60
      const grad = ctx.createRadialGradient(city.x, city.y, city.glow * 0.5, city.x, city.y, diffusionRadius)
      grad.addColorStop(0, `rgba(255, 200, 50, ${Math.random() * 0.1})`)
      grad.addColorStop(1, 'rgba(255, 200, 50, 0)')
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(city.x, city.y, diffusionRadius, 0, Math.PI * 2)
      ctx.fill()
    }

    // ================== PAKISTAN HIGHLIGHT ==================
    // Add premium golden ring around Pakistan
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.95)'
    ctx.lineWidth = 8
    ctx.beginPath()
    ctx.ellipse(2350, 1000, 165, 210, 0.25, 0, Math.PI * 2)
    ctx.stroke()

    // Inner glow
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.5)'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.ellipse(2350, 1000, 175, 220, 0.25, 0, Math.PI * 2)
    ctx.stroke()

    // Outer glow
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.3)'
    ctx.lineWidth = 12
    ctx.beginPath()
    ctx.ellipse(2350, 1000, 155, 200, 0.25, 0, Math.PI * 2)
    ctx.stroke()

    const texture = new THREE.CanvasTexture(canvas)
    texture.magFilter = THREE.LinearFilter
    texture.minFilter = THREE.LinearMipmapLinearFilter
    texture.anisotropy = 16  // Better quality on angles
    return texture
  }

  // Create Premium Limb Glow Texture (Atmospheric edge effect)
  const createLimbGlowTexture = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 1024
    const ctx = canvas.getContext('2d')!

    // Sharp limb glow - bright at edges, fades to transparent at center
    const limbGradient = ctx.createRadialGradient(512, 512, 300, 512, 512, 512)
    limbGradient.addColorStop(0, 'rgba(100, 200, 255, 0)')          // Transparent center
    limbGradient.addColorStop(0.6, 'rgba(100, 200, 255, 0.15)')     // Fade in
    limbGradient.addColorStop(0.85, 'rgba(150, 220, 255, 0.5)')     // Bright edge
    limbGradient.addColorStop(1, 'rgba(180, 240, 255, 0.3)')        // Soft edge
    ctx.fillStyle = limbGradient
    ctx.fillRect(0, 0, 1024, 1024)

    return new THREE.CanvasTexture(canvas)
  }

  // Create Premium Glow Texture (Atmosphere + City Lights Aura)
  const createGlowTexture = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 1024
    const ctx = canvas.getContext('2d')!

    // Main atmosphere glow - soft blue atmosphere
    const mainGradient = ctx.createRadialGradient(512, 512, 150, 512, 512, 512)
    mainGradient.addColorStop(0, 'rgba(50, 150, 220, 0)')          // Transparent center
    mainGradient.addColorStop(0.5, 'rgba(100, 180, 240, 0.15)')    // Soft blue
    mainGradient.addColorStop(0.85, 'rgba(120, 200, 255, 0.4)')    // Brighter blue
    mainGradient.addColorStop(1, 'rgba(100, 200, 255, 0.1)')       // Fade out
    ctx.fillStyle = mainGradient
    ctx.fillRect(0, 0, 1024, 1024)

    // Add city light aura reflection
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * 1024
      const y = Math.random() * 1024
      const r = Math.random() * 80 + 40
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r)
      grad.addColorStop(0, 'rgba(255, 200, 50, 0.2)')
      grad.addColorStop(1, 'rgba(255, 200, 50, 0)')
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    }

    return new THREE.CanvasTexture(canvas)
  }

  const earthTexture = createEarthTexture()
  const glowTexture = createGlowTexture()
  const limbGlowTexture = createLimbGlowTexture()

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
      {/* Main Earth Globe - Premium NASA Quality */}
      <mesh ref={globeRef} onClick={handleGlobeClick} castShadow receiveShadow>
        <sphereGeometry args={[1, 256, 128]} />
        <meshPhysicalMaterial
          map={earthTexture}
          metalness={0.05}
          roughness={0.65}
          emissive="#0a1929"
          emissiveIntensity={0.3}
          envMapIntensity={0.5}
          clearcoat={0.15}
          clearcoatRoughness={0.3}
        />
      </mesh>

      {/* Atmospheric glow - Enhanced */}
      <mesh ref={atmosphereRef} scale={1.08}>
        <sphereGeometry args={[1, 128, 64]} />
        <meshBasicMaterial
          map={glowTexture}
          transparent
          opacity={0.5}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Limb Glow - Photorealistic atmospheric edge effect */}
      <mesh scale={1.15}>
        <sphereGeometry args={[1, 128, 64]} />
        <meshBasicMaterial
          map={limbGlowTexture}
          transparent
          opacity={0.7}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Pakistan marker - positioned on globe surface */}
      <group position={[0.71, 0.35, 0.65]}>
        <mesh ref={pakistanMarkerRef}>
          <sphereGeometry args={[0.15, 32, 32]} />
          <meshStandardMaterial
            color="#facc15"
            emissive="#facc15"
            emissiveIntensity={0.9}
            metalness={0.7}
            roughness={0.15}
          />
        </mesh>
        {/* Marker pulse ring */}
        <mesh scale={1.4} position={[0, 0, 0.01]}>
          <circleGeometry args={[0.12, 32]} />
          <meshBasicMaterial
            color="#facc15"
            transparent
            opacity={0.5}
          />
        </mesh>
      </group>

      {/* PHOTOREALISTIC CINEMATIC LIGHTING - NASA Quality */}
      {/* Primary sunlight from front-right (bright, warm) */}
      <pointLight position={[2, 1.5, 3.5]} intensity={2.5} color="#ffffff" decay={0} />
      {/* Key light - slightly warmer tone */}
      <pointLight position={[1.5, 0.8, 3]} intensity={1.8} color="#fffacd" decay={0} />
      {/* Fill light from right side (subtle, cool) */}
      <pointLight position={[-1.5, 0.5, 2]} intensity={0.8} color="#e0f2fe" decay={0} />
      {/* Ambient atmospheric light - soft blue sky */}
      <ambientLight intensity={1.0} color="#dbeafe" />
      {/* Top directional light for depth */}
      <directionalLight position={[0, 3, 0]} intensity={0.9} color="#ffffff" />
      {/* Rim light from back (creates edge glow) */}
      <pointLight position={[-1, -0.5, -2.5]} intensity={0.6} color="#87ceeb" decay={0} />
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
    <div className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden" style={{ background: 'linear-gradient(to bottom right, #f3f4f6, #e5e7eb, #d1d5db)' }}>
      {/* Background ambient effect - Light atmosphere */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-0.5 rounded-full"
            style={{
              background: '#9ca3af',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.15, 0.4, 0.15] }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {/* 3D Globe Canvas - Premium NASA Quality */}
      <div className="relative w-full h-full">
        {canRender3D && (
          <Canvas
            camera={{ position: [0, 0, 2.5], fov: 45, near: 0.1, far: 1000 }}
            className="w-full h-full"
            gl={{
              antialias: true,
              alpha: true,
              preserveDrawingBuffer: true,
              powerPreference: 'high-performance',
              precision: 'highp',
              pixelRatio: Math.min(window.devicePixelRatio, 2),
            }}
            dpr={[1, Math.min(window.devicePixelRatio, 2)]}
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
