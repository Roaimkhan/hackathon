import React from 'react'
import { motion } from 'framer-motion'
import { CheckIcon } from '@heroicons/react/24/solid'

interface Milestone {
  label: string
  status: 'completed' | 'in-progress' | 'pending'
}

interface MilestonesStepperProps {
  milestones?: Milestone[]
}

const MilestonesStepper: React.FC<MilestonesStepperProps> = ({
  milestones = [
    { label: 'MVP Launch', status: 'completed' },
    { label: '100 Users', status: 'completed' },
    { label: 'Revenue', status: 'in-progress' },
  ],
}) => {
  return (
    <div className="flex items-center gap-2 lg:gap-4">
      {milestones.map((milestone, idx) => (
        <div key={idx} className="flex items-center gap-2 lg:gap-4">
          {/* Milestone Dot */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ delay: idx * 0.2, duration: 0.5 }}
            viewport={{ once: true }}
            className={`relative w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center text-white font-bold text-xs lg:text-sm flex-shrink-0 ${
              milestone.status === 'completed'
                ? 'bg-brand-600'
                : milestone.status === 'in-progress'
                  ? 'bg-brand-500'
                  : 'bg-surface-3'
            }`}
          >
            {milestone.status === 'completed' ? (
              <CheckIcon className="w-4 h-4 lg:w-5 lg:h-5" />
            ) : milestone.status === 'in-progress' ? (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 lg:w-2.5 lg:h-2.5 bg-white rounded-full"
              />
            ) : (
              <span>{idx + 1}</span>
            )}
          </motion.div>

          {/* Line between milestones */}
          {idx < milestones.length - 1 && (
            <div className="relative h-1 flex-grow lg:w-20 max-w-16 lg:max-w-32 bg-surface-3 rounded-full overflow-hidden">
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{
                  delay: 0.2 + idx * 0.25,
                  duration: 0.6,
                  ease: 'easeInOut',
                }}
                viewport={{ once: true }}
                className={`h-full rounded-full origin-left ${
                  milestone.status === 'completed' ? 'bg-brand-600' : 'bg-surface-3'
                }`}
              />
            </div>
          )}
        </div>
      ))}

      {/* Labels Below (Mobile: only show full labels on lg) */}
      <div className="hidden lg:flex flex-col gap-4 ml-4">
        {milestones.map((milestone, idx) => (
          <div
            key={idx}
            className={`text-xs font-medium ${
              milestone.status === 'completed'
                ? 'text-brand-600'
                : milestone.status === 'in-progress'
                  ? 'text-brand-500'
                  : 'text-ink-muted'
            }`}
          >
            {milestone.label}
          </div>
        ))}
      </div>
    </div>
  )
}

export default MilestonesStepper
