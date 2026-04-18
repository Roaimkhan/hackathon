import React from 'react'

interface SkeletonCardProps {
  variant?: 'compact' | 'full'
}

const shimmerAnimation = {
  backgroundSize: '200% 100%',
  animation: 'shimmer 2s infinite',
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({ variant = 'full' }) => {
  return (
    <div
      className={`
        bg-white rounded-2xl border border-surface-2
        ${variant === 'compact' ? 'p-4' : 'p-6'}
      `}
    >
      {/* Top Banner Skeleton */}
      <div className="h-1.5 bg-surface-2 rounded-full -mx-6 -mt-6 mb-4" style={shimmerAnimation} />

      {/* Sector Badge Skeleton */}
      <div className="mb-4">
        <div className="w-24 h-6 bg-surface-2 rounded-full" style={shimmerAnimation} />
      </div>

      {/* Title Skeleton */}
      <div className="mb-2">
        <div className="w-3/4 h-6 bg-surface-2 rounded" style={shimmerAnimation} />
      </div>

      {/* Tagline Skeleton */}
      <div className="mb-6 space-y-2">
        <div className="w-full h-4 bg-surface-2 rounded" style={shimmerAnimation} />
        <div className="w-4/5 h-4 bg-surface-2 rounded" style={shimmerAnimation} />
      </div>

      {/* Funding Bar Skeleton */}
      {variant === 'full' && (
        <div className="mb-6">
          <div className="w-full h-3 bg-surface-2 rounded-full mb-2" style={shimmerAnimation} />
          <div className="flex gap-4">
            <div className="w-24 h-3 bg-surface-2 rounded" style={shimmerAnimation} />
            <div className="w-24 h-3 bg-surface-2 rounded ml-auto" style={shimmerAnimation} />
          </div>
        </div>
      )}

      {/* Stats Row Skeleton */}
      {variant === 'full' && (
        <div className="mb-6">
          <div className="w-full h-3 bg-surface-2 rounded" style={shimmerAnimation} />
        </div>
      )}

      {/* Bottom Buttons Skeleton */}
      <div className="flex gap-3">
        <div className="w-24 h-9 bg-surface-2 rounded-lg" style={shimmerAnimation} />
        <div className="flex-1 h-9 bg-surface-2 rounded-lg" style={shimmerAnimation} />
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  )
}

export default SkeletonCard

