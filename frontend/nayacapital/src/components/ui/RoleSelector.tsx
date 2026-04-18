import React from 'react';
import { motion } from 'framer-motion';
import { SparklesIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';

interface RoleSelectorProps {
  selectedRole: 'investor' | 'founder' | null;
  onSelectRole: (role: 'investor' | 'founder') => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  selectedRole,
  onSelectRole,
}) => {
  const roles = [
    {
      id: 'investor' as const,
      label: 'I want to Invest',
      icon: SparklesIcon,
      description: 'Discover and invest in startups',
    },
    {
      id: 'founder' as const,
      label: 'I have a Startup',
      icon: RocketLaunchIcon,
      description: 'Raise capital for your venture',
    },
  ];

  return (
    <div className="mb-8">
      <p className="text-sm font-medium text-ink-primary mb-4">Choose your role</p>
      <div className="grid grid-cols-2 gap-4">
        {roles.map((role) => {
          const isSelected = selectedRole === role.id;
          const Icon = role.icon;

          return (
            <motion.button
              key={role.id}
              type="button"
              onClick={() => onSelectRole(role.id)}
              animate={{
                backgroundColor: isSelected ? 'rgb(22, 163, 74)' : 'rgba(255, 255, 255, 0.9)',
                borderColor: isSelected ? 'rgb(22, 163, 74)' : 'rgb(229, 231, 235)',
                scale: isSelected ? 1.05 : 1,
              }}
              whileHover={{ y: -4, rotateX: 2, rotateY: -2 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className={`p-6 rounded-xl border-2 cursor-pointer text-center transition-all ${
                isSelected
                  ? 'border-brand-600 shadow-[0_18px_40px_-18px_rgba(22,163,74,0.7)]'
                  : 'border-surface-2 shadow-soft hover:shadow-md'
              }`}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="flex justify-center mb-3">
                <Icon
                  className={`w-8 h-8 ${
                    isSelected ? 'text-white' : 'text-brand-600'
                  }`}
                />
              </div>
              <p
                className={`font-semibold transition-colors ${
                  isSelected ? 'text-white' : 'text-ink-primary'
                }`}
              >
                {role.label}
              </p>
              <p
                className={`text-xs mt-2 transition-colors ${
                  isSelected ? 'text-white/80' : 'text-ink-secondary'
                }`}
              >
                {role.description}
              </p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
