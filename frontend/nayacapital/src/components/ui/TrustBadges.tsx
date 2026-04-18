import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon, ShieldCheckIcon, StarIcon } from '@heroicons/react/24/solid';

export const TrustBadges: React.FC = () => {
  const badges = [
    { icon: CheckCircleIcon, label: 'CNIC Verified' },
    { icon: ShieldCheckIcon, label: 'Milestone Protected' },
    { icon: StarIcon, label: 'From Rs 1' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-4"
    >
      {badges.map((badge) => {
        const Icon = badge.icon;
        return (
          <motion.div
            key={badge.label}
            variants={itemVariants}
            className="flex items-center gap-3 text-white bg-white/10 border border-white/20 rounded-xl px-3 py-2 backdrop-blur-sm"
          >
            <Icon className="w-5 h-5 text-gold-DEFAULT" />
            <span className="text-sm font-medium">{badge.label}</span>
          </motion.div>
        );
      })}
    </motion.div>
  );
};
