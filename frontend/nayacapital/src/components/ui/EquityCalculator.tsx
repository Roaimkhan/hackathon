import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface EquityCalculatorProps {
  amount: number;
  fundingGoal: number;
  equityOffered: number;
  onAmountChange: (amount: number) => void;
}

export const EquityCalculator: React.FC<EquityCalculatorProps> = ({
  amount,
  fundingGoal,
  equityOffered,
  onAmountChange,
}) => {
  const equityPercentage = useMemo(() => {
    if (!amount || !fundingGoal) return 0;
    return (amount / fundingGoal) * equityOffered;
  }, [amount, fundingGoal, equityOffered]);

  const sqftEquivalent = useMemo(() => {
    const sqftPerPercent = 10; // 1% = 10 sq ft (fun metaphor)
    return equityPercentage * sqftPerPercent;
  }, [equityPercentage]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(0, parseInt(e.target.value) || 0);
    onAmountChange(value);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-ink-secondary mb-2 uppercase tracking-wide">
          Investment Amount (Min Rs 1)
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-ink-secondary font-mono">
            Rs
          </span>
          <input
            type="number"
            value={amount || ''}
            onChange={handleInputChange}
            placeholder="50,000"
            className="w-full pl-12 pr-4 py-4 border-2 border-surface-2 rounded-xl bg-surface-0 text-ink-primary font-mono text-xl font-semibold placeholder-ink-ghost focus:outline-none focus:border-brand-600 transition-colors"
          />
        </div>
      </div>

      {/* Equity Display */}
      {amount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-brand-50 border border-brand-200 space-y-3"
        >
          <div>
            <p className="text-xs text-ink-secondary font-medium uppercase tracking-wide mb-1">
              Your Equity
            </p>
            <motion.p
              key={equityPercentage}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-3xl font-bold text-brand-600 font-mono"
            >
              {equityPercentage.toFixed(4)}%
            </motion.p>
          </div>
          <div className="pt-3 border-t border-brand-200">
            <p className="text-xs text-ink-secondary mb-1">Fun fact:</p>
            <p className="text-sm font-medium text-ink-primary">
              That's equivalent to <span className="font-bold text-brand-600">{sqftEquivalent.toFixed(1)} sq ft</span> of startup ownership! 🌱
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};
