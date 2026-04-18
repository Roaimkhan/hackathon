import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

interface Milestone {
  id: string;
  title: string;
  description: string;
  unlocksPercent: number;
  status: 'completed' | 'in-progress' | 'upcoming';
  dueDate: string;
}

interface TimelineProps {
  milestones: Milestone[];
}

export const MilestoneTimeline: React.FC<TimelineProps> = ({ milestones }) => {
  const currentIndex = milestones.findIndex((m) => m.status === 'in-progress');
  const progressPercent = currentIndex >= 0 ? ((currentIndex + 1) / milestones.length) * 100 : 0;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-playfair text-3xl font-bold text-ink-primary mb-2">
          Milestones & Fund Release
        </h2>
        <p className="text-ink-secondary">Funds unlock as milestones are verified</p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Connecting Line */}
        <div className="absolute left-6 top-0 bottom-0 w-1 bg-surface-3">
          <motion.div
            initial={{ height: '0%' }}
            whileInView={{ height: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            viewport={{ once: true }}
            className="w-full bg-brand-600 rounded-full"
          />
        </div>

        {/* Milestones */}
        <div className="space-y-8 pl-20">
          {milestones.map((milestone, index) => {
            const isCompleted = milestone.status === 'completed';
            const isInProgress = milestone.status === 'in-progress';

            return (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                viewport={{ once: true }}
                className="relative"
              >
                {/* Circle */}
                <div className="absolute -left-20 top-0 w-12 h-12 flex items-center justify-center">
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                      className="w-12 h-12 rounded-full bg-brand-600 flex items-center justify-center"
                    >
                      <CheckCircleIcon className="w-7 h-7 text-white" />
                    </motion.div>
                  ) : isInProgress ? (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-12 h-12 rounded-full border-2 border-brand-600 flex items-center justify-center bg-white"
                    >
                      <div className="w-6 h-6 rounded-full bg-brand-600" />
                    </motion.div>
                  ) : (
                    <div className="w-12 h-12 rounded-full border-2 border-surface-3 flex items-center justify-center bg-white" />
                  )}
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className={`font-playfair text-lg font-bold ${
                      isCompleted ? 'line-through text-ink-secondary' : 'text-ink-primary'
                    }`}>
                      {milestone.title}
                    </h3>
                    {isInProgress && (
                      <span className="px-2 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold animate-pulse">
                        In Progress
                      </span>
                    )}
                  </div>
                  <p className={`text-sm ${
                    isCompleted ? 'text-ink-ghost' : 'text-ink-secondary'
                  }`}>
                    {milestone.description}
                  </p>
                  <p className="text-sm font-semibold text-brand-600">
                    Unlocks {milestone.unlocksPercent}% of funds
                  </p>
                  <p className={`text-xs ${isCompleted ? 'text-ink-ghost' : 'text-ink-secondary'}`}>
                    Due: {milestone.dueDate}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
