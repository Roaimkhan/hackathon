import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheckIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

export const KycPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, setUser, refreshUser } = useAuth();
  const [cnic, setCnic] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  // Format CNIC as user types: 00000-0000000-0
  const formatCnic = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 5) {
      return cleaned;
    } else if (cleaned.length <= 12) {
      return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
    } else {
      return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 12)}-${cleaned.slice(12, 13)}`;
    }
  };

  const handleCnicChange = (value: string) => {
    setCnic(formatCnic(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('naya_token');
      const isRuntimeMock =
        localStorage.getItem('naya_auth_mode') === 'mock' ||
        Boolean(token && token.startsWith('mock-token-'));

      if (isRuntimeMock) {
        const mockUserRaw = localStorage.getItem('naya_mock_user');
        const existingMockUser = mockUserRaw ? JSON.parse(mockUserRaw) : user;

        if (existingMockUser) {
          const updatedUser = {
            ...existingMockUser,
            full_name: fullName || existingMockUser.full_name,
            cnic,
            kyc_status: 'approved' as const,
          };
          localStorage.setItem('naya_mock_user', JSON.stringify(updatedUser));
          setUser(updatedUser);
        }
      } else {
        await api.post('/auth/kyc', {
          cnic,
        });
        await refreshUser();
      }

      setIsVerified(true);

      // After 1.5s, redirect based on user role
      setTimeout(() => {
        if (user?.role === 'investor') {
          navigate('/dashboard/investor');
        } else if (user?.role === 'founder') {
          navigate('/dashboard/founder');
        } else {
          navigate('/');
        }
      }, 1500);
    } catch (err: any) {
      const message = err.response?.data?.detail || err.response?.data?.message || 'KYC verification failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' as const },
    },
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-20 flex items-center justify-center">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md px-6"
      >
        <AnimatePresence mode="wait">
          {!isVerified ? (
            <motion.div
              key="kyc-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Progress Step */}
              <div className="flex items-center justify-between mb-8">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="text-sm font-semibold text-ink-secondary hover:text-ink-primary transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back
                </button>
                <div className="text-right">
                  <p className="text-xs font-semibold text-brand-600 uppercase">Step 1 of 1</p>
                  <p className="text-sm text-ink-secondary">Verify Your Identity</p>
                </div>
              </div>

              {/* Shield Icon */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="flex justify-center mb-8"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-brand-600/20 rounded-full blur-xl" />
                  <ShieldCheckIcon className="w-16 h-16 text-brand-600 relative" />
                </div>
              </motion.div>

              {/* Heading */}
              <div className="text-center mb-8">
                <h1 className="font-playfair text-3xl font-bold text-ink-primary mb-2">
                  Verify Your Identity
                </h1>
                <p className="text-ink-secondary text-sm">
                  Complete KYC to access your dashboard and start investing
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-0">
                {/* CNIC Input */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-ink-primary mb-2">
                    CNIC Number
                  </label>
                  <input
                    type="text"
                    value={cnic}
                    onChange={(e) => handleCnicChange(e.target.value)}
                    placeholder="00000-0000000-0"
                    maxLength={15}
                    className="w-full bg-surface-1 border border-surface-2 rounded-lg py-3 px-4 text-ink-primary outline-none focus:border-brand-600 focus:bg-white transition-colors font-mono"
                  />
                  <p className="text-xs text-ink-secondary mt-2">
                    Format: 00000-0000000-0
                  </p>
                </div>

                {/* Full Name */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-ink-primary mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                    className="w-full bg-surface-1 border border-surface-2 rounded-lg py-3 px-4 text-ink-primary outline-none focus:border-brand-600 focus:bg-white transition-colors"
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{
                      opacity: 1,
                      x: [0, 10, -10, 10, -10, 0],
                    }}
                    transition={{ duration: 0.5 }}
                    className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6"
                  >
                    <p className="text-red-600 text-sm">{error}</p>
                  </motion.div>
                )}

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={loading || !cnic || !fullName}
                  whileHover={cnic && fullName ? { scale: 1.02 } : {}}
                  whileTap={cnic && fullName ? { scale: 0.98 } : {}}
                  animate={loading ? { boxShadow: '0 0 20px rgba(22, 163, 74, 0.5)' } : {}}
                  className={`w-full font-semibold py-3 rounded-lg transition-colors mt-8 relative overflow-hidden ${
                    cnic && fullName
                      ? 'bg-brand-600 hover:bg-brand-700 text-white cursor-pointer'
                      : 'bg-surface-2 text-ink-secondary cursor-not-allowed'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      />
                      Verifying...
                    </span>
                  ) : (
                    'Complete Verification'
                  )}
                </motion.button>
              </form>

              {/* Info Box */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-8 p-4 bg-brand-50 border border-brand-200 rounded-lg"
              >
                <p className="text-xs text-brand-900">
                  🔒 Your information is encrypted and secure. We use military-grade encryption to protect your data.
                </p>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="kyc-success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              {/* Success Checkmark */}
              <motion.div
                animate={{
                  scale: [0, 1.2, 1],
                  rotate: [0, 10, 0],
                }}
                transition={{
                  duration: 0.8,
                  ease: 'easeOut',
                }}
                className="flex justify-center mb-6"
              >
                <div className="relative w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [0, 1] }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    <CheckCircleIcon className="w-12 h-12 text-brand-600" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Success Message */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="font-playfair text-3xl font-bold text-ink-primary mb-2">
                  Identity Verified!
                </h2>
                <p className="text-ink-secondary mb-6">
                  Your account is ready. Redirecting to your dashboard...
                </p>
              </motion.div>

              {/* Loading Dots */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-center gap-2"
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                    className="w-2 h-2 rounded-full bg-brand-600"
                  />
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
