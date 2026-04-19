import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { FloatingLabelInput } from '../components/ui/FloatingLabelInput';
import { PasswordStrengthIndicator } from '../components/ui/PasswordStrengthIndicator';
import { RoleSelector } from '../components/ui/RoleSelector';
import { TrustBadges } from '../components/ui/TrustBadges';
import { useAuth } from '../contexts/AuthContext';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const initialRoleParam = searchParams.get('role');
  const initialRole: 'investor' | 'founder' =
    initialRoleParam === 'founder' || initialRoleParam === 'investor'
      ? initialRoleParam
      : 'investor';
  const [selectedRole, setSelectedRole] = useState<'investor' | 'founder'>(initialRole);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  const isFormValid = Boolean(
    fullName.trim() &&
      email.trim() &&
      password &&
      confirmPassword &&
      password === confirmPassword
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await register(email, password, fullName, selectedRole);

      // Investors must complete KYC before investing.
      if (selectedRole === 'investor') {
        navigate('/kyc');
      } else {
        navigate('/dashboard/founder');
      }
    } catch (err: any) {
      const message =
        toErrorMessage(err?.message) ||
        toErrorMessage(err?.response?.data?.detail) ||
        toErrorMessage(err?.response?.data?.message) ||
        'Registration failed. Please try again.';
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
    <div className="relative min-h-screen flex overflow-hidden bg-[radial-gradient(circle_at_10%_15%,rgba(250,204,21,0.2),transparent_34%),radial-gradient(circle_at_88%_18%,rgba(22,163,74,0.22),transparent_38%),radial-gradient(circle_at_60%_55%,rgba(15,158,73,0.12),transparent_48%),linear-gradient(160deg,#032113_0%,#074128_35%,#2f6a50_55%,#d9ebe0_78%,#f8fbf9_100%)]">
      <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.22) 1px, transparent 1px)', backgroundSize: '26px 26px' }} />
      <motion.div
        className="absolute left-[11%] top-20 w-64 h-64 rounded-full border border-white/35"
        animate={{ rotate: 360 }}
        transition={{ duration: 27, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute right-[12%] bottom-8 w-72 h-72 rounded-full border border-brand-200/60"
        animate={{ rotate: -360 }}
        transition={{ duration: 34, repeat: Infinity, ease: 'linear' }}
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
              <pattern id="grid-register" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="400" height="600" fill="url(#grid-register)" />
            <motion.circle
              cx="200"
              cy="300"
              r="150"
              fill="none"
              stroke="white"
              strokeWidth="1"
              animate={{ r: [150, 184, 150], opacity: [0.32, 0.56, 0.32] }}
              transition={{ duration: 7, repeat: Infinity }}
            />
          </svg>
        </div>

        <motion.div
          className="absolute -left-16 top-24 h-72 w-72 rounded-full bg-gold/20 blur-3xl"
          animate={{ y: [-12, 10, -12], scale: [1, 1.08, 1] }}
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
              Build your profile, choose your role, and unlock curated opportunities in Pakistan's next market leaders.
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
        className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-12 overflow-y-auto"
      >
        <motion.div
          initial={{ opacity: 0, y: 26, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ rotateX: 1.8, rotateY: -1.8 }}
          className="w-full max-w-md rounded-3xl border border-white/75 bg-white/85 backdrop-blur-xl p-8 sm:p-10 my-6 shadow-[0_35px_80px_-22px_rgba(5,46,22,0.35)]"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Header */}
          <div className="mb-10 border-b border-surface-2 pb-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 border border-brand-200 px-4 py-1.5 text-xs font-bold tracking-widest uppercase text-brand-700 mb-5">
              ✦ Equity Access Program
            </span>
            <h1 className="font-display text-5xl font-bold text-ink-primary mb-3 tracking-tight leading-tight">
              Join NayaCapital
            </h1>
            <p className="text-ink-secondary text-base font-medium leading-relaxed">
              Start your investment journey today
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-ink-primary mb-3">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                required
                className="w-full px-4 py-3 rounded-lg border-2 border-surface-2 focus:border-brand-600 focus:outline-none bg-white/50 text-ink-primary placeholder-ink-secondary/50 transition-all font-medium"
              />
            </div>

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

            {/* Role Selector */}
            <div>
              <label className="block text-sm font-semibold text-ink-primary mb-4">
                Choose your role <span className="text-red-500">*</span>
              </label>
              <RoleSelector
                selectedRole={selectedRole}
                onSelectRole={setSelectedRole}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-ink-primary mb-3">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative border-2 border-surface-2 focus-within:border-brand-600 rounded-lg overflow-hidden transition-all bg-white/50 px-4 py-3 flex items-center gap-3">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
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

            {/* Password Strength Indicator */}
            {password && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2"
              >
                <PasswordStrengthIndicator password={password} />
              </motion.div>
            )}

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-ink-primary mb-3">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative border-2 border-surface-2 focus-within:border-brand-600 rounded-lg overflow-hidden transition-all bg-white/50 px-4 py-3 flex items-center gap-3">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="flex-1 bg-transparent text-ink-primary placeholder-ink-secondary/50 outline-none font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-ink-secondary hover:text-ink-primary transition-colors flex-shrink-0"
                >
                  {showConfirmPassword ? (
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
                className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-4"
              >
                <p className="text-red-700 text-sm font-semibold">{error}</p>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading || !isFormValid}
              whileHover={isFormValid ? { scale: 1.02, y: -2 } : {}}
              whileTap={isFormValid ? { scale: 0.98, y: 0 } : {}}
              className={`w-full font-bold py-4 rounded-lg transition-all duration-300 mt-10 relative overflow-hidden text-base ${
                isFormValid
                  ? 'bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 text-white shadow-lg hover:shadow-xl cursor-pointer'
                  : 'bg-surface-3 text-ink-secondary cursor-not-allowed opacity-60'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  <span>Creating account...</span>
                </span>
              ) : (
                'Create Account'
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <div className="mt-10 pt-8 border-t border-surface-2 text-center">
            <p className="text-ink-secondary font-medium">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-brand-700 font-bold hover:text-brand-800 transition-colors"
              >
                Sign in
              </button>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
