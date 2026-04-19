import React, { useRef, useState, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import { ArrowRightIcon, PlayIcon, SparklesIcon, CheckCircleIcon, UserGroupIcon } from '@heroicons/react/24/solid'
import CountUp from 'react-countup'
import { useNavigate } from 'react-router-dom'
import RotatingCard from '../components/ui/RotatingCard'
import { BlobShape, AvatarStack } from '../components/ui/Shapes'
import StepCard from '../components/ui/StepCard'
import StartupCard from '../components/ui/StartupCard'
import SkeletonCard from '../components/ui/SkeletonCard'
import MilestonesStepper from '../components/ui/MilestonesStepper'
import FloatingParticles from '../components/ui/FloatingParticles'

const resolveComponent = <T,>(component: T): T => {
  if (
    typeof component === 'object' &&
    component !== null &&
    'default' in (component as Record<string, unknown>)
  ) {
    return (component as unknown as { default: T }).default
  }
  return component
}

const SafeCountUp = resolveComponent(CountUp)
const SafeRotatingCard = resolveComponent(RotatingCard)
const SafeStepCard = resolveComponent(StepCard)
const SafeStartupCard = resolveComponent(StartupCard)
const SafeSkeletonCard = resolveComponent(SkeletonCard)
const SafeMilestonesStepper = resolveComponent(MilestonesStepper)
const SafeFloatingParticles = resolveComponent(FloatingParticles)

const LandingPage: React.FC = () => {
  const navigate = useNavigate()
  const containerRef = useRef(null)
  const isInView = useInView(containerRef, { once: false, margin: '-100px' })

  // Stats data
  const [stats] = useState({
    totalInvested: 25400000,
    activeStartups: 48,
    investors: 3240,
    avgReturn: 18.5,
  })

  // Featured startups
  const [startups, setStartups] = useState<any[]>([])
  const [startupLoading, setStartupLoading] = useState(true)

  useEffect(() => {
    const fetchStartups = async () => {
      try {
        // Simulated data - in production, fetch from Supabase
        // const { data, error } = await supabase
        //   .from('startups')
        //   .select('*')
        //   .eq('status', 'active')
        //   .limit(3)
        
        // Mock data
        setStartups([
          {
            id: 1,
            name: 'AgroTech Solutions',
            tagline: 'Connecting farmers to premium markets using AI-powered logistics',
            sector: 'agritech',
            amount_raised: 650000,
            funding_goal: 1000000,
            investor_count: 342,
            min_investment: 1000,
          },
          {
            id: 2,
            name: 'FinFlow',
            tagline: 'Real-time payment infrastructure for SMEs across South Asia',
            sector: 'fintech',
            amount_raised: 480000,
            funding_goal: 1000000,
            investor_count: 218,
            min_investment: 1000,
          },
          {
            id: 3,
            name: 'HealthFirst',
            tagline: 'Telemedicine and health records on blockchain',
            sector: 'healthtech',
            amount_raised: 820000,
            funding_goal: 1000000,
            investor_count: 456,
            min_investment: 1000,
          },
        ])
      } catch (error) {
        console.error('Error fetching startups:', error)
      } finally {
        setStartupLoading(false)
      }
    }

    // Simulate loading delay
    const timer = setTimeout(() => {
      fetchStartups()
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.7,
        ease: 'easeOut' as const,
      },
    },
  }

  const lineVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: 'easeOut' as const,
      },
    },
  }

  const premiumEase = [0.22, 1, 0.36, 1] as const

  const scrollToSection = (id: string) => {
    const target = document.getElementById(id)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <>
      {/* Hero Section */}
      <section
        id="top"
        className="relative min-h-screen w-full overflow-hidden pt-20 bg-[radial-gradient(circle_at_10%_10%,rgba(250,204,21,0.16),transparent_34%),radial-gradient(circle_at_90%_20%,rgba(22,163,74,0.18),transparent_38%),linear-gradient(180deg,#f8fbf8_0%,#ffffff_45%,#f4f8f4_100%)]"
      >
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(22, 163, 74, 0.08) 1px, transparent 1px)',
              backgroundSize: '44px 44px',
            }}
          />

          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-20 left-1/2 -translate-x-1/2 w-[38rem] h-[38rem] rounded-full border border-brand-200/70"
          />

          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 34, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-28 left-1/2 -translate-x-1/2 w-[52rem] h-[52rem] rounded-full border border-gold/30"
          />

          {/* Top-right blob */}
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1],
            }}
            transition={{
              rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
              scale: { duration: 6, repeat: Infinity, ease: premiumEase },
            }}
            className="absolute -top-40 -right-40 w-[30rem] h-[30rem]"
          >
            <BlobShape className="w-full h-full text-brand-200/50" />
          </motion.div>

          {/* Bottom-left blob */}
          <motion.div
            animate={{
              rotate: -360,
              scale: [1, 0.95, 1],
            }}
            transition={{
              rotate: { duration: 25, repeat: Infinity, ease: 'linear' },
              scale: { duration: 8, repeat: Infinity, ease: premiumEase },
            }}
            className="absolute -bottom-32 -left-32 w-80 h-80"
          >
            <BlobShape className="w-full h-full text-gold/50" />
          </motion.div>
        </div>

        {/* Main Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 h-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-80px)]">
            {/* Left Content */}
            <motion.div
              ref={containerRef}
              variants={containerVariants}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="flex flex-col gap-6 z-20"
            >
              {/* Badge */}
              <motion.div
                variants={itemVariants}
                className="inline-flex w-fit"
              >
                <div className="px-5 py-2 rounded-full border border-brand-300/70 bg-white/75 backdrop-blur-md shadow-soft flex items-center gap-2">
                  <span className="text-lg">🌱</span>
                  <span className="text-sm font-semibold tracking-wide text-brand-700 uppercase">
                    Pakistan First Investment Platform
                  </span>
                </div>
              </motion.div>

              {/* Heading */}
              <div className="space-y-2">
                {/* Line 1: "Invest from" */}
                <motion.div variants={lineVariants} className="overflow-hidden">
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-ink-secondary leading-tight">
                    Invest from
                  </h1>
                </motion.div>

                {/* Line 2: "Rs 100." with animated underline */}
                <motion.div variants={lineVariants} className="overflow-hidden">
                  <div className="relative inline-block">
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-brand-700 leading-tight drop-shadow-[0_8px_24px_rgba(22,163,74,0.25)]">
                      Rs 100.
                    </h1>
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
                      transition={{ delay: 0.6, duration: 0.8 }}
                      className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-brand-600 to-brand-400 origin-left"
                      style={{ width: '100%' }}
                    />
                  </div>
                </motion.div>

                {/* Line 3: "Own Pakistan" */}
                <motion.div variants={lineVariants} className="overflow-hidden">
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-ink-primary leading-tight">
                    Own Pakistan
                  </h1>
                </motion.div>

                {/* Line 4: "Future." with gold */}
                <motion.div variants={lineVariants} className="overflow-hidden">
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold via-yellow-300 to-gold-dark leading-tight">
                    Future.
                  </h1>
                </motion.div>
              </div>

              {/* Subheadline */}
              <motion.p
                variants={itemVariants}
                className="text-lg md:text-xl text-ink-secondary/95 max-w-lg leading-relaxed"
              >
                Join thousands of Pakistanis backing the next generation of startups. No bank
                account needed.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-4 pt-4"
              >
                {/* Primary Button */}
                <motion.button
                  onClick={() => navigate('/register')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 text-white rounded-full font-semibold text-base flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_18px_40px_-14px_rgba(21,128,61,0.75)] hover:shadow-[0_26px_55px_-16px_rgba(21,128,61,0.85)]"
                >
                  Start Investing
                  <motion.div
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRightIcon className="w-5 h-5" />
                  </motion.div>
                </motion.button>

                {/* Secondary Button */}
                <motion.button
                  onClick={() => scrollToSection('how')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 border-2 border-brand-700/70 text-brand-700 rounded-full font-semibold text-base flex items-center justify-center gap-2 hover:bg-white/70 transition-colors relative group backdrop-blur-sm"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full border-2 border-brand-600 opacity-0 group-hover:opacity-30"
                  />
                  <PlayIcon className="w-5 h-5" />
                  Watch How It Works
                </motion.button>
              </motion.div>

              {/* Social Proof */}
              <motion.div
                variants={itemVariants}
                className="flex items-center gap-4 pt-4"
              >
                <AvatarStack count={5} />
                <div className="rounded-2xl bg-white/70 border border-white/80 shadow-soft px-4 py-2 backdrop-blur-sm">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-gold text-sm">★</span>
                    ))}
                  </div>
                  <p className="text-sm text-ink-muted font-medium">
                    Trusted by 3,240+ investors across Pakistan
                  </p>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Side: 3D Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.8, delay: 0.4, ease: premiumEase }}
              className="hidden lg:block relative h-full"
            >
              <div className="absolute -top-12 -left-8 w-48 h-48 rounded-full bg-gold/20 blur-3xl" />
              <div className="absolute bottom-8 right-4 w-56 h-56 rounded-full bg-brand-300/25 blur-3xl" />
              <SafeRotatingCard />
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 2: LIVE STATS BAR */}
      <motion.section
        initial={{ y: 0, opacity: 1 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative bg-gradient-to-b from-brand-950 via-brand-900 to-brand-950 py-20 overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {[
              { label: 'Total Invested', value: stats.totalInvested, suffix: '+', format: 'currency' },
              { label: 'Active Startups', value: stats.activeStartups, suffix: '', format: 'number' },
              { label: 'Investors', value: stats.investors, suffix: '+', format: 'number' },
              { label: 'Avg Return', value: stats.avgReturn, suffix: '%', format: 'decimal' },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ duration: 0.28, ease: premiumEase }}
                className={`flex flex-col items-center py-8 px-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md ${idx < 3 ? 'lg:border-r lg:border-white/15' : ''}`}
              >
                <motion.div
                  initial={{ scale: 1 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: idx * 0.1, type: 'spring', stiffness: 100 }}
                  className="text-4xl md:text-5xl font-mono font-bold text-gold mb-2"
                >
                  <>
                    {stat.format === 'currency' && 'Rs '}
                    <SafeCountUp end={stat.value} separator="," duration={2.5} />
                    {stat.suffix}
                  </>
                </motion.div>
                <p className="text-sm text-surface-3 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* SECTION 2.5: PREMIUM ANIMATED SHOWCASE - Replaces 3D Globe */}
      <section className="relative py-24 lg:py-32 overflow-hidden bg-gradient-to-br from-brand-50 via-white to-gold-50">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-32 -right-32 w-96 h-96 rounded-full border border-brand-200/30 opacity-60"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
            className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full border border-gold/20 opacity-50"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-ink-primary mb-6 tracking-tight">
              Investment Made Simple
            </h2>
            <p className="text-lg md:text-xl text-ink-secondary max-w-3xl mx-auto leading-relaxed">
              Join thousands of Pakistanis investing in tomorrow's success stories
            </p>
          </motion.div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '🎯',
                title: 'Verified Opportunities',
                description: 'Carefully curated startups with strong fundamentals and growth potential across Pakistan',
                color: 'from-brand-500 to-brand-600',
              },
              {
                icon: '💰',
                title: 'Flexible Investments',
                description: 'Start investing from just Rs 100 and diversify your portfolio across multiple sectors',
                color: 'from-gold to-gold-dark',
              },
              {
                icon: '📊',
                title: 'Real-Time Tracking',
                description: 'Monitor your investments, track returns, and receive regular milestone updates',
                color: 'from-green-500 to-green-600',
              },
              {
                icon: '🔐',
                title: 'Secure & Compliant',
                description: 'Full regulatory compliance with blockchain-backed equity records and legal protection',
                color: 'from-blue-500 to-blue-600',
              },
              {
                icon: '🚀',
                title: 'High Growth Potential',
                description: 'Average returns of 18.5% annually with access to pre-IPO investment opportunities',
                color: 'from-purple-500 to-purple-600',
              },
              {
                icon: '👥',
                title: 'Community Support',
                description: 'Join 3,240+ Pakistani investors and network with like-minded entrepreneurs',
                color: 'from-pink-500 to-pink-600',
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="group"
              >
                <div className={`h-full rounded-2xl p-8 bg-gradient-to-br ${feature.color} opacity-5 group-hover:opacity-10 transition-all duration-300 absolute inset-0`} />
                <div className="relative h-full rounded-2xl p-8 border-2 border-white/80 bg-white/95 backdrop-blur-sm shadow-lg group-hover:shadow-2xl group-hover:border-brand-300 transition-all duration-300">
                  {/* Icon */}
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity, delay: idx * 0.1 }}
                    className="text-5xl mb-5 inline-block"
                  >
                    {feature.icon}
                  </motion.div>

                  {/* Content */}
                  <h3 className="font-display text-xl font-bold text-ink-primary mb-3 group-hover:text-brand-700 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-ink-secondary/90 leading-relaxed text-base">
                    {feature.description}
                  </p>

                  {/* Hover Accent */}
                  <motion.div
                    initial={{ width: 0 }}
                    whileHover={{ width: '100%' }}
                    transition={{ duration: 0.3 }}
                    className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${feature.color} rounded-full`}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <motion.button
              onClick={() => navigate('/register')}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="px-10 py-5 bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 text-white rounded-full font-bold text-lg flex items-center justify-center gap-3 mx-auto transition-all duration-300 shadow-xl hover:shadow-2xl"
            >
              <span>Start Investing Now</span>
              <motion.div
                animate={{ x: [0, 6, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRightIcon className="w-6 h-6" />
              </motion.div>
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* SECTION 3: HOW IT WORKS */}
      <section
        id="how"
        className="py-24 lg:py-36 bg-[linear-gradient(180deg,#f7faf7_0%,#ffffff_40%,#f8faf8_100%)]"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold text-ink-primary mb-4 tracking-tight">
              How It Works
            </h2>
            <p className="text-lg text-ink-secondary max-w-2xl mx-auto">
              Three simple steps to start building your investment portfolio
            </p>
          </motion.div>

          {/* Timeline with connecting line */}
          <div className="relative">
            {/* Connecting line - desktop only */}
            <div className="hidden lg:block absolute top-16 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-300/60 to-transparent" />

            {/* Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <SafeStepCard
                number="01"
                icon={<SparklesIcon className="w-8 h-8" />}
                title="Create Account & KYC"
                description="Sign up in minutes and complete identity verification. No documents needed."
                index={0}
              />
              <SafeStepCard
                number="02"
                icon={<CheckCircleIcon className="w-8 h-8" />}
                title="Browse Verified Startups"
                description="Explore vetted startups with detailed business plans and founder profiles."
                index={1}
              />
              <SafeStepCard
                number="03"
                icon={<UserGroupIcon className="w-8 h-8" />}
                title="Track & Grow Equity"
                description="Monitor your investments and watch your portfolio grow in real-time."
                index={2}
              />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: FEATURED STARTUPS */}
      <section className="py-24 lg:py-36 bg-surface-0">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-brand">Featured Startups</span>
            </h2>
            <p className="text-lg text-ink-secondary max-w-2xl mx-auto">
              Investment opportunities vetted by our expert team
            </p>
          </motion.div>

          {/* Startup Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {startupLoading
              ? [...Array(3)].map((_, i) => <SafeSkeletonCard key={i} />)
              : startups.map((startup, idx) => (
                  <SafeStartupCard
                    key={startup.id}
                    startup={startup}
                    index={idx}
                    onClick={() => navigate('/startups')}
                  />
                ))}
          </div>

          {/* View All Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <motion.button
              onClick={() => navigate('/startups')}
              whileHover={{ y: -2, scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 border-2 border-brand-700/80 text-brand-700 rounded-full font-semibold hover:bg-brand-50 transition-colors shadow-soft"
            >
              View All Startups
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* SECTION 5: MILESTONE TRUST BANNER */}
      <section id="about" className="py-20 lg:py-28 bg-[linear-gradient(180deg,#f0f9f2_0%,#ebf8ef_100%)] border-y border-brand-200/70">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Headline */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-3xl lg:text-4xl font-bold text-ink-primary leading-tight">
                Your money moves only when <span className="text-brand-600">milestones are met.</span>
              </h2>
              <p className="text-ink-secondary mt-4 leading-relaxed">
                We hold investments in escrow until founders hit agreed-upon milestones. Your capital is protected every step of the way.
              </p>
            </motion.div>

            {/* Right: Milestones Stepper */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="flex justify-center"
            >
              <SafeMilestonesStepper />
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 6: FINAL CTA */}
      <section className="relative py-32 bg-[radial-gradient(circle_at_20%_10%,rgba(250,204,21,0.2),transparent_24%),radial-gradient(circle_at_90%_10%,rgba(22,163,74,0.4),transparent_28%),linear-gradient(180deg,#031d0f_0%,#052e16_60%,#02180d_100%)] text-white overflow-hidden">
        <SafeFloatingParticles />

        <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-tight"
          >
            Ready to own a piece of Pakistan?
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button
              onClick={() => navigate('/register')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-full font-semibold transition-all duration-300 shadow-[0_20px_45px_-16px_rgba(22,163,74,0.85)]"
            >
              Create Investor Account
            </motion.button>
            <motion.button
              onClick={() => navigate('/register?role=founder')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 border-2 border-white/80 text-white rounded-full font-semibold hover:bg-white/10 transition-colors backdrop-blur-sm"
            >
              List Your Startup
            </motion.button>
          </motion.div>
        </div>
      </section>
    </>
  )
}

export default LandingPage
