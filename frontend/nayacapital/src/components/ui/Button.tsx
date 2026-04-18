import React from 'react'
import { motion } from 'framer-motion'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold'
type Size = 'sm' | 'md' | 'lg' | 'xl'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
  children: React.ReactNode
}

type SafeButtonProps = Omit<ButtonProps, 'onAnimationStart' | 'onDrag' | 'onDragStart' | 'onDragEnd'>

const variantStyles: Record<Variant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-md hover:shadow-lg',
  secondary: 'bg-surface-2 text-ink-primary hover:bg-surface-3 border border-surface-3',
  ghost: 'text-ink-primary hover:bg-surface-1',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg',
  gold: 'bg-gold text-brand-950 hover:bg-gold-dark shadow-md hover:shadow-lg font-semibold',
}

const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2 text-base rounded-lg',
  lg: 'px-6 py-3 text-lg rounded-lg',
  xl: 'px-8 py-4 text-xl rounded-lg',
}

const Button: React.FC<SafeButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  className,
  ...props
}) => {
  return (
    <motion.button
      whileHover={{ scale: !disabled && !loading ? 1.02 : 1 }}
      whileTap={{ scale: !disabled && !loading ? 0.98 : 1 }}
      disabled={disabled || loading}
      className={`
        flex items-center justify-center gap-2 font-semibold transition-all
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className || ''}
      `}
      {...props}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        leftIcon
      )}
      {children}
      {rightIcon && !loading && rightIcon}
    </motion.button>
  )
}

export default Button
