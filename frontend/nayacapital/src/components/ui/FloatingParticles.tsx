import React, { useMemo } from 'react'
import { motion } from 'framer-motion'

interface Particle {
  id: number
  left: number
  top: number
  delay: number
  duration: number
}

const FloatingParticles: React.FC = () => {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 4,
    }))
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{
            opacity: 0,
            y: 0,
          }}
          animate={{
            opacity: [0, 0.6, 0],
            y: [-20, -100],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute w-1 h-1 rounded-full bg-white"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
          }}
        />
      ))}
    </div>
  )
}

export default FloatingParticles
