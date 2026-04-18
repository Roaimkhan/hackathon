import React from 'react'

interface SectorBadgeProps {
  sector: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sectorColorMap: Record<string, { bg: string; text: string; dot: string }> = {
  AgriTech: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  Fintech: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  EdTech: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
  HealthTech: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  Retail: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
}

const SectorBadge: React.FC<SectorBadgeProps> = ({ sector, size = 'md', className = '' }) => {
  const colors = sectorColorMap[sector] || {
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    dot: 'bg-gray-500',
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  }

  return (
    <div
      className={`
        inline-flex items-center gap-2 rounded-full font-semibold
        ${colors.bg} ${colors.text}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
      {sector}
    </div>
  )
}

export default SectorBadge
