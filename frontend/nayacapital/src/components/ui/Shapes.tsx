import React from 'react'
import { motion } from 'framer-motion'

interface BlobProps {
  className?: string
  style?: React.CSSProperties
}

export const BlobShape: React.FC<BlobProps> = ({ className = '', style = {} }) => {
  return (
    <svg
      viewBox="0 0 200 200"
      className={`absolute pointer-events-none ${className}`}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="blur">
          <feGaussianBlur in="SourceGraphic" stdDeviation="10" />
        </filter>
      </defs>
      <path
        d="M45.5,31.5 Q89.5,-10.5 145.5,27.5 Q180.5,55.5 158.5,110.5 Q130.5,180.5 75.5,167.5 Q15.5,152.5 25.5,97.5 Q35.5,42.5 45.5,31.5"
        fill="currentColor"
        filter="url(#blur)"
        opacity="0.7"
      />
    </svg>
  )
}

export const AvatarStack: React.FC<{ count?: number }> = ({ count = 5 }) => {
  const initials = ['AF', 'AH', 'SR', 'FK', 'MN']

  return (
    <div className="flex items-center -space-x-2">
      {initials.slice(0, count).map((initial, idx) => (
        <motion.div
          key={idx}
          initial={{ scale: 0, x: -10 }}
          whileInView={{ scale: 1, x: 0 }}
          transition={{ delay: 0.5 + idx * 0.05, duration: 0.4 }}
          className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white ${
            ['bg-brand-500', 'bg-brand-600', 'bg-gold', 'bg-green-500', 'bg-emerald-600'][idx % 5]
          }`}
        >
          {initial}
        </motion.div>
      ))}
    </div>
  )
}
