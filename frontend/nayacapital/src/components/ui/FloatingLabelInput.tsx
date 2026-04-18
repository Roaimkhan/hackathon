import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface FloatingLabelInputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  icon?: React.ReactNode;
  placeholder?: string;
}

export const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  error,
  required,
  icon,
  placeholder,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const isHasValue = value.length > 0;
  const isActive = isFocused || isHasValue;

  return (
    <div className="relative mb-6">
      <div
        className={`relative border-b-2 transition-colors ${
          error
            ? 'border-red-500'
            : isFocused
              ? 'border-brand-600'
              : 'border-surface-3'
        }`}
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-ink-secondary">{icon}</span>}

          <div className="flex-1 relative">
            <motion.label
              htmlFor={label}
              animate={{
                y: isActive ? -24 : 0,
                fontSize: isActive ? '12px' : '16px',
              }}
              transition={{ duration: 0.2 }}
              className={`absolute transition-colors ${
                isActive ? 'text-brand-600' : 'text-ink-secondary'
              } pointer-events-none`}
            >
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </motion.label>

            <input
              id={label}
              type={type}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder || ''}
              className="w-full bg-transparent py-3 text-ink-primary outline-none placeholder-surface-2"
            />
          </div>
        </div>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-sm mt-2"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};
