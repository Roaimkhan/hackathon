import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface LoadingScreenProps {
  duration?: number
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ duration = 2000 }) => {
  const [isVisible, setIsVisible] = useState(true)
  const [taglineIndex, setTaglineIndex] = useState(0)

  const taglines = ['Investing', 'For Everyone', 'From Rs 1', 'Pakistan']

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration])

  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineIndex((prev) => (prev + 1) % taglines.length)
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] bg-brand-950 flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-950 via-brand-900 to-brand-950 opacity-50" />

          {/* Content */}
          <motion.div
            className="relative z-10 flex flex-col items-center gap-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            {/* Logo */}
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="flex flex-col items-center gap-3"
            >
              {/* Logo Icon */}
              <motion.svg
                className="w-24 h-24 text-brand-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
                <path
                  d="M12 6v6m-4-2l4-4 4 4"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </motion.svg>

              {/* Logo Text */}
              <motion.h1
                className="font-display text-4xl font-bold text-white text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                NayaCapital
              </motion.h1>
            </motion.div>

            {/* Progress Bar */}
            <motion.div
              className="w-64 h-1 rounded-full bg-brand-800 overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{
                  duration: duration / 1000,
                  ease: 'easeInOut',
                }}
              />
            </motion.div>

            {/* Rotating Tagline */}
            <div className="h-8 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.p
                  key={taglineIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="text-brand-400 text-lg font-medium text-center"
                >
                  {taglines[taglineIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Decorative Elements */}
          <motion.div
            className="absolute top-20 left-10 w-40 h-40 bg-brand-600/10 rounded-full blur-3xl"
            animate={{
              x: [0, 20, -20, 0],
              y: [0, -20, 20, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-40 h-40 bg-brand-500/10 rounded-full blur-3xl"
            animate={{
              x: [0, -20, 20, 0],
              y: [0, 20, -20, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default LoadingScreen
