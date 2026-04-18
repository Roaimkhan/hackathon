import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  success?: boolean
  icon?: React.ReactNode
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  success,
  icon,
  value,
  onChange,
  className,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false)
  const hasValue = value && value.toString().length > 0

  return (
    <div className="w-full">
      <div className="relative">
        {/* Animated Label */}
        <motion.label
          animate={{
            y: isFocused || hasValue ? -24 : 0,
            fontSize: isFocused || hasValue ? '12px' : '16px',
            color: error ? '#DC2626' : isFocused ? '#16A34A' : '#6B7280',
          }}
          transition={{ duration: 0.2 }}
          className="absolute left-4 origin-left pointer-events-none"
        >
          {label}
        </motion.label>

        <div className="relative">
          {/* Input */}
          <input
            value={value}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`
              w-full px-4 pt-6 pb-3 text-base bg-white rounded-lg
              border-2 transition-all outline-none
              ${error ? 'border-red-500' : success ? 'border-green-500' : 'border-surface-3'}
              ${isFocused && !error ? 'border-brand-600' : ''}
              focus:ring-2 focus:ring-brand-100
              ${className || ''}
            `}
            {...props}
          />

          {/* Right Icon - Success or Error */}
          {success && !error && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              <ExclamationCircleIcon className="w-5 h-5 text-red-500" />
            </motion.div>
          )}
        </div>

        {/* Animated Bottom Border (Brand Line) */}
        <motion.div
          animate={{
            scaleX: isFocused ? 1 : 0,
            originX: 0,
          }}
          transition={{ duration: 0.3 }}
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-full"
        />
      </div>

      {/* Error or Success Text */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 text-sm text-red-600 font-medium"
          >
            {error}
          </motion.p>
        )}
        {success && !error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 text-sm text-green-600 font-medium"
          >
            ✓ Looking good!
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

// Import AnimatePresence for error/success messages
import { AnimatePresence } from 'framer-motion'

export default Input
