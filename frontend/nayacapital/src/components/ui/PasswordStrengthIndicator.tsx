import React from 'react';
import { motion } from 'framer-motion';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
  const calculateStrength = (pwd: string): number => {
    if (!pwd) return 0;
    let strength = 0;
    
    // Length check
    if (pwd.length >= 8) strength += 1;
    if (pwd.length >= 12) strength += 1;
    
    // Complexity checks
    if (/[a-z]/.test(pwd)) strength += 0.5;
    if (/[A-Z]/.test(pwd)) strength += 0.5;
    if (/[0-9]/.test(pwd)) strength += 0.5;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength += 0.5;
    
    return Math.min(strength, 4);
  };

  const strength = calculateStrength(password);
  const bars = [1, 2, 3, 4];

  const getStrengthLabel = () => {
    if (strength < 1) return 'Weak';
    if (strength < 2) return 'Fair';
    if (strength < 3) return 'Good';
    return 'Strong';
  };

  const getStrengthColor = () => {
    if (strength < 1) return 'bg-red-500';
    if (strength < 2) return 'bg-yellow-500';
    if (strength < 3) return 'bg-blue-500';
    return 'bg-brand-600';
  };

  return (
    <div className="mt-2 mb-8">
      <div className="flex gap-2 mb-2">
        {bars.map((bar) => (
          <motion.div
            key={bar}
            animate={{
              scaleY: bar <= strength ? 1 : 0.3,
            }}
            transition={{ duration: 0.3 }}
            className={`h-1 flex-1 rounded-full transition-colors ${
              bar <= strength ? getStrengthColor() : 'bg-surface-2'
            }`}
          />
        ))}
      </div>
      <p className={`text-sm font-medium leading-5 ${
        strength < 1 ? 'text-red-500' : 
        strength < 2 ? 'text-yellow-500' : 
        strength < 3 ? 'text-blue-500' : 
        'text-brand-600'
      }`}>
        Password strength: {getStrengthLabel()}
      </p>
    </div>
  );
};
