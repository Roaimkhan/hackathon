import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { FloatingLabelInput } from '../components/ui/FloatingLabelInput';
import { TrustBadges } from '../components/ui/TrustBadges';
import { FRONTEND_ONLY_MODE } from '../lib/runtimeMode';
import { api } from '../lib/api';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const toErrorMessage = (value: unknown): string => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) return value.map((item) => toErrorMessage(item)).filter(Boolean).join(' | ');
    if (typeof value === 'object') {
      const obj = value as Record<string, unknown>;
      if (typeof obj.message === 'string') return obj.message;
      if (typeof obj.detail === 'string') return obj.detail;
      if (Array.isArray(obj.detail)) return toErrorMessage(obj.detail);
      const serialized = JSON.stringify(value);
      return serialized && serialized !== '{}' ? serialized : 'Unexpected error';
    }
    return String(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);

      const token = localStorage.getItem('naya_token');
      const isRuntimeMock =
        FRONTEND_ONLY_MODE ||
        localStorage.getItem('naya_auth_mode') === 'mock' ||
        Boolean(token && token.startsWith('mock-token-'));

      const routeByRole = (role: string) => {
        if (role === 'investor') {
          navigate('/dashboard/investor');
          return;
        }
        if (role === 'founder') {
          navigate('/dashboard/founder');
          return;
        }
        if (role === 'admin') {
          navigate('/admin');
          return;
        }
        navigate('/');
      };

      if (isRuntimeMock) {
        const rawUser = localStorage.getItem('naya_mock_user');
        const role = rawUser ? JSON.parse(rawUser).role : 'investor';
        routeByRole(role);
      } else {
        const { data } = await api.get('/auth/me');
        const role = data?.role || 'investor';
        routeByRole(role);
      }
    } catch (err: any) {
      const message =
        toErrorMessage(err?.message) ||
        toErrorMessage(err?.response?.data?.detail) ||
        toErrorMessage(err?.response?.data?.message) ||
        'Login failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const leftVariants = {
    hidden: { x: -80, opacity: 0, rotateY: -10 },
    visible: {
      x: 0,
      opacity: 1,
      rotateY: 0,
      transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  const rightVariants = {
    hidden: { x: 80, opacity: 0, rotateY: 10 },
    visible: {
      x: 0,
      opacity: 1,
      rotateY: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const, delay: 0.12 },
    },
  };

  return (
    <div className="relative min-h-screen flex overflow-hidden bg-[radial-gradient(circle_at_12%_10%,rgba(250,204,21,0.2),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(22,163,74,0.2),transparent_36%),linear-gradient(160deg,#031f12_0%,#063821_42%,#f6faf7_42%,#ffffff_100%)]">
      <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)', backgroundSize: '26px 26px' }} />
      <motion.div
        className="absolute left-[10%] top-16 w-64 h-64 rounded-full border border-white/35"
        animate={{ rotate: 360 }}
        transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute right-[14%] bottom-10 w-72 h-72 rounded-full border border-brand-200/60"
        animate={{ rotate: -360 }}
        transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
      />

      {/* LEFT PANEL */}
      <motion.div
        variants={leftVariants}
        initial="hidden"
        animate="visible"
        className="w-0 lg:w-[46%] text-white p-12 xl:p-16 flex flex-col justify-between relative overflow-hidden"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Animated background */}
        <div className="absolute inset-0 opacity-25">
          <svg className="w-full h-full" viewBox="0 0 400 600">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="400" height="600" fill="url(#grid)" />
            <motion.circle
              cx="200"
              cy="300"
              r="150"
              fill="none"
              stroke="white"
              strokeWidth="1"
              animate={{ r: [150, 184, 150], opacity: [0.3, 0.55, 0.3] }}
              transition={{ duration: 7, repeat: Infinity }}
            />
          </svg>
        </div>

        <motion.div
          className="absolute -left-20 top-24 h-72 w-72 rounded-full bg-gold/20 blur-3xl"
          animate={{ y: [-12, 12, -12], scale: [1, 1.08, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-14">
            <div className="w-11 h-11 bg-gold-DEFAULT rounded-xl flex items-center justify-center shadow-[0_12px_30px_-12px_rgba(250,204,21,0.7)]">
              <span className="text-brand-950 font-bold text-xl">✦</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-white/95">NayaCapital</span>
          </div>

          <div className="mb-16 max-w-lg">
            <p className="font-playfair text-4xl italic font-light leading-snug text-white/95">
              "Every empire started with someone who believed before others did."
            </p>
            <p className="mt-6 text-base text-white/70 leading-relaxed">
              Enter your investor lounge and track high-potential opportunities with precision, trust, and visual clarity.
            </p>
          </div>

          <TrustBadges />
        </div>

        <div className="relative z-10">
          <p className="text-sm text-white/70">
            ✓ Trusted by 3,240+ Pakistani investors
          </p>
        </div>
      </motion.div>

      {/* RIGHT PANEL */}
      <motion.div
        variants={rightVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-12"
      >
        <motion.div
          initial={{ opacity: 0, y: 26, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ rotateX: 1.8, rotateY: -1.8 }}
          className="w-full max-w-md rounded-3xl border border-white/75 bg-white/85 backdrop-blur-xl p-8 sm:p-10 shadow-[0_35px_80px_-22px_rgba(5,46,22,0.35)]"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Header */}
          <div className="mb-10 border-b border-surface-2 pb-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 border border-brand-200 px-4 py-1.5 text-xs font-bold tracking-widest uppercase text-brand-700 mb-5">
              ✦ Private Member Access
            </span>
            <h1 className="font-display text-5xl font-bold text-ink-primary mb-3 tracking-tight leading-tight">
              Welcome back
            </h1>
            <p className="text-ink-secondary text-base font-medium leading-relaxed">
              Sign in to your account to continue investing
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-ink-primary mb-3">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
                className="w-full px-4 py-3 rounded-lg border-2 border-surface-2 focus:border-brand-600 focus:outline-none bg-white/50 text-ink-primary placeholder-ink-secondary/50 transition-all font-medium"
              />
            </div>

            {/* Password Input - Fixed Spacing */}
            <div>
              <label className="block text-sm font-semibold text-ink-primary mb-3">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative border-2 border-surface-2 focus-within:border-brand-600 rounded-lg overflow-hidden transition-all bg-white/50 px-4 py-3 flex items-center gap-3">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="flex-1 bg-transparent text-ink-primary placeholder-ink-secondary/50 outline-none font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-ink-secondary hover:text-ink-primary transition-colors flex-shrink-0"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{
                  opacity: 1,
                  x: [0, 8, -8, 0],
                }}
                transition={{ duration: 0.4 }}
                className="bg-red-50 border-2 border-red-200 rounded-lg p-4"
              >
                <p className="text-red-700 text-sm font-semibold">{error}</p>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98, y: 0 }}
              className="w-full bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 text-white font-bold py-4 rounded-lg transition-all duration-300 mt-10 relative overflow-hidden shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  <span>Signing in...</span>
                </span>
              ) : (
                'Login'
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <div className="mt-10 pt-8 border-t border-surface-2 text-center">
            <p className="text-ink-secondary font-medium">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-brand-700 font-bold hover:text-brand-800 transition-colors"
              >
                Create one
              </button>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
