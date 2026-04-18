import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MagnifyingGlassIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { FundingBar } from '../components/ui/FundingBar';
import { useStartups } from '../hooks';
import { FRONTEND_ONLY_MODE } from '../lib/runtimeMode';

interface Startup {
  id: string;
  name: string;
  tagline: string;
  sector: string;
  founder_name: string;
  founder_avatar: string;
  amount_raised: number;
  funding_goal: number;
  investors_count: number;
  min_investment: number;
  logo?: string;
}

type SortOption = 'newest' | 'most-funded' | 'closing-soon' | 'min-investment';
type SectorFilter = 'all' | 'agritech' | 'fintech' | 'edtech' | 'healthtech' | 'retail';

const SECTORS: { id: SectorFilter; label: string; color: string }[] = [
  { id: 'all', label: 'All', color: 'brand' },
  { id: 'agritech', label: 'AgriTech', color: 'emerald' },
  { id: 'fintech', label: 'Fintech', color: 'blue' },
  { id: 'edtech', label: 'EdTech', color: 'purple' },
  { id: 'healthtech', label: 'HealthTech', color: 'red' },
  { id: 'retail', label: 'Retail', color: 'orange' },
];

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'newest', label: 'Newest' },
  { id: 'most-funded', label: 'Most Funded' },
  { id: 'closing-soon', label: 'Closing Soon' },
  { id: 'min-investment', label: 'Min Investment' },
];

// Mock data
const MOCK_STARTUPS: Startup[] = [
  {
    id: '1',
    name: 'AgroTech Solutions',
    tagline: 'Precision farming through AI and IoT sensors for Pakistani farmers',
    sector: 'agritech',
    founder_name: 'Ahmed Hassan',
    founder_avatar: 'AH',
    amount_raised: 1650000,
    funding_goal: 2500000,
    investors_count: 342,
    min_investment: 100,
  },
  {
    id: '2',
    name: 'FinFlow',
    tagline: 'Blockchain-based payment solutions for SMEs in South Asia',
    sector: 'fintech',
    founder_name: 'Saira Khan',
    founder_avatar: 'SK',
    amount_raised: 1200000,
    funding_goal: 2500000,
    investors_count: 287,
    min_investment: 100,
  },
  {
    id: '3',
    name: 'HealthFirst',
    tagline: 'Telemedicine platform connecting rural communities with specialists',
    sector: 'healthtech',
    founder_name: 'Dr. Faisal Mirza',
    founder_avatar: 'FM',
    amount_raised: 2050000,
    funding_goal: 2500000,
    investors_count: 521,
    min_investment: 100,
  },
  {
    id: '4',
    name: 'EduBridge',
    tagline: 'Interactive learning platform for K-12 students across Pakistan',
    sector: 'edtech',
    founder_name: 'Maria Cheema',
    founder_avatar: 'MC',
    amount_raised: 950000,
    funding_goal: 2000000,
    investors_count: 198,
    min_investment: 100,
  },
  {
    id: '5',
    name: 'RetailHub',
    tagline: 'Unified e-commerce platform for local retailers and brands',
    sector: 'retail',
    founder_name: 'Hassan Ali',
    founder_avatar: 'HA',
    amount_raised: 1500000,
    funding_goal: 2500000,
    investors_count: 412,
    min_investment: 100,
  },
  {
    id: '6',
    name: 'FarmConnect',
    tagline: 'Supply chain management for agricultural exports',
    sector: 'agritech',
    founder_name: 'Yasir Ali',
    founder_avatar: 'YA',
    amount_raised: 800000,
    funding_goal: 1500000,
    investors_count: 156,
    min_investment: 100,
  },
  {
    id: '7',
    name: 'CryptoPay',
    tagline: 'Crypto wallet and exchange for South Asian markets',
    sector: 'fintech',
    founder_name: 'Ali Raza',
    founder_avatar: 'AR',
    amount_raised: 2200000,
    funding_goal: 3000000,
    investors_count: 623,
    min_investment: 100,
  },
  {
    id: '8',
    name: 'MediHub',
    tagline: 'AI-powered diagnostic center network across Pakistan',
    sector: 'healthtech',
    founder_name: 'Dr. Amina Shah',
    founder_avatar: 'AS',
    amount_raised: 1350000,
    funding_goal: 2000000,
    investors_count: 289,
    min_investment: 100,
  },
  {
    id: '9',
    name: 'SkillUp Academy',
    tagline: 'Vocational training platform for digital economy skills',
    sector: 'edtech',
    founder_name: 'Fatima Khan',
    founder_avatar: 'FK',
    amount_raised: 650000,
    funding_goal: 1500000,
    investors_count: 124,
    min_investment: 100,
  },
];

const getSectorColor = (sector: string): string => {
  const colorMap: Record<string, string> = {
    agritech: '#10b981',
    fintech: '#3b82f6',
    edtech: '#a855f7',
    healthtech: '#ef4444',
    retail: '#f97316',
  };
  return colorMap[sector] || '#16a34a';
};

const StartupSkeletonCard: React.FC = () => (
  <motion.div className="rounded-xl bg-surface-1 border border-surface-3 p-4 overflow-hidden">
    <div className="h-1 bg-shimmer rounded-full mb-4" />
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-full bg-shimmer" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-24 bg-shimmer rounded" />
      </div>
    </div>
    <div className="h-6 bg-shimmer rounded mb-2" />
    <div className="space-y-2 mb-4">
      <div className="h-3 w-full bg-shimmer rounded" />
      <div className="h-3 w-3/4 bg-shimmer rounded" />
    </div>
    <div className="h-3 bg-shimmer rounded mb-4" />
    <div className="h-8 bg-shimmer rounded" />
  </motion.div>
);

export const StartupListPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedSector, setSelectedSector] = useState<SectorFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [sortOpen, setSortOpen] = useState(false);
  const [startups, setStartups] = useState<Startup[]>([]);
  const [filteredStartups, setFilteredStartups] = useState<Startup[]>([]);
  const { startups: apiStartups, loading, error } = useStartups();

  useEffect(() => {
    if (FRONTEND_ONLY_MODE) {
      setStartups(MOCK_STARTUPS);
      return;
    }

    const normalized = apiStartups.map((item) => {
      const sectorValue = (item.sector || '').toLowerCase();
      const sectorKey: SectorFilter =
        sectorValue === 'agri' ? 'agritech' :
        sectorValue === 'health' ? 'healthtech' :
        sectorValue === 'other' ? 'retail' :
        (sectorValue as SectorFilter);

      return {
        id: item.id,
        name: item.name,
        tagline: item.tagline,
        sector: sectorKey,
        founder_name: item.founder_name || 'Verified Founder',
        founder_avatar: item.founder_avatar || (item.name || 'S').slice(0, 2).toUpperCase(),
        amount_raised: item.amount_raised,
        funding_goal: item.funding_goal,
        investors_count: item.investor_count || 0,
        min_investment: item.min_investment || 100,
      }
    });

    setStartups(normalized);
  }, [apiStartups]);

  // Filter and sort startups
  useEffect(() => {
    let filtered = [...startups];

    // Sector filter
    if (selectedSector !== 'all') {
      filtered = filtered.filter((s) => s.sector === selectedSector);
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(searchLower) ||
          s.tagline.toLowerCase().includes(searchLower) ||
          s.founder_name.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    switch (sortBy) {
      case 'most-funded':
        filtered.sort((a, b) => b.amount_raised - a.amount_raised);
        break;
      case 'closing-soon':
        filtered.sort(
          (a, b) =>
            (a.funding_goal - a.amount_raised) - (b.funding_goal - b.amount_raised)
        );
        break;
      case 'min-investment':
        filtered.sort((a, b) => a.min_investment - b.min_investment);
        break;
      default:
        // newest (default order)
        break;
    }

    setFilteredStartups(filtered);
  }, [startups, search, selectedSector, sortBy]);

  const headerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' as const },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' as const },
    },
  };

  return (
    <div className="min-h-screen bg-surface-0 pt-24 pb-20">
      {/* Header */}
      <motion.div
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-6 lg:px-12 mb-16"
      >
        <div className="text-center">
          <h1 className="font-playfair text-5xl lg:text-6xl font-bold text-ink-primary mb-4">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-r from-brand-600 via-brand-500 to-brand-700 bg-clip-text text-transparent"
            >
              Find Your Next Investment
            </motion.span>
          </h1>
          <p className="text-xl text-ink-secondary max-w-2xl mx-auto">
            Verified Pakistani startups, raising from real people
          </p>
        </div>
      </motion.div>

      {/* Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="sticky top-20 z-40 bg-white/80 glass border-b border-surface-2 py-4 mb-12"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-4">
          {/* Search Input */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-ink-secondary" />
            <input
              type="text"
              placeholder="Search startups, founders, sectors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-surface-2 bg-white/50 backdrop-blur-sm placeholder-ink-secondary text-ink-primary focus:outline-none focus:border-brand-600 transition-colors"
            />
          </div>

          {/* Sector Filters & Sort */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {SECTORS.map((sector) => (
                <motion.button
                  key={sector.id}
                  onClick={() => setSelectedSector(sector.id)}
                  className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                    selectedSector === sector.id
                      ? 'bg-brand-600 text-white shadow-lg'
                      : 'bg-surface-2 text-ink-secondary hover:bg-surface-3'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {sector.label}
                </motion.button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <motion.button
                onClick={() => setSortOpen(!sortOpen)}
                className="px-4 py-2 rounded-lg border border-surface-2 bg-white/50 text-ink-secondary hover:bg-surface-2 transition-colors flex items-center gap-2 font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {SORT_OPTIONS.find((s) => s.id === sortBy)?.label}
                <ChevronDownIcon
                  className={`w-4 h-4 transition-transform ${sortOpen ? 'rotate-180' : ''}`}
                />
              </motion.button>

              {sortOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute top-full right-0 mt-2 w-48 rounded-lg bg-white border border-surface-3 shadow-lg overflow-hidden z-50"
                >
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        setSortBy(option.id);
                        setSortOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 transition-colors text-sm ${
                        sortBy === option.id
                          ? 'bg-brand-50 text-brand-700 font-medium'
                          : 'text-ink-secondary hover:bg-surface-2'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          </div>

          {/* Results Count */}
          <p className="text-sm text-ink-secondary">
            Showing {loading ? '...' : filteredStartups.length} startup
            {filteredStartups.length !== 1 ? 's' : ''}
          </p>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </motion.div>

      {/* Startups Grid */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {loading ? (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div key={i} variants={cardVariants}>
                <StartupSkeletonCard />
              </motion.div>
            ))}
          </motion.div>
        ) : filteredStartups.length > 0 ? (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredStartups.map((startup) => (
              <motion.div key={startup.id} variants={cardVariants}>
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="h-full rounded-xl border border-surface-2 hover:border-brand-200 bg-white hover:shadow-2xl transition-all overflow-hidden group"
                >
                  {/* Sector Banner */}
                  <div
                    className="h-1 w-full"
                    style={{ backgroundColor: getSectorColor(startup.sector) }}
                  />

                  <div className="p-5 flex flex-col h-full">
                    {/* Founder Info */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-white">
                          {startup.founder_avatar || startup.name.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-ink-secondary truncate">
                        {startup.founder_name}
                      </span>
                    </div>

                    {/* Startup Name */}
                    <h3 className="font-playfair text-xl font-bold text-ink-primary mb-2 line-clamp-2">
                      {startup.name}
                    </h3>

                    {/* Sector Badge */}
                    <div className="mb-3">
                      <span
                        className="text-xs font-semibold px-3 py-1 rounded-full text-white"
                        style={{ backgroundColor: getSectorColor(startup.sector) }}
                      >
                        {SECTORS.find((s) => s.id === startup.sector)?.label}
                      </span>
                    </div>

                    {/* Tagline */}
                    <p className="text-sm text-ink-secondary line-clamp-2 mb-4">
                      {startup.tagline}
                    </p>

                    {/* Funding Bar */}
                    <div className="mb-4">
                      <FundingBar
                        raised={startup.amount_raised}
                        goal={startup.funding_goal}
                      />
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-2 mb-4 pb-4 border-b border-surface-2 text-xs">
                      <div>
                        <p className="text-ink-secondary font-medium">Raised</p>
                        <p className="font-mono font-semibold text-ink-primary">
                          {(startup.amount_raised / 1000000).toFixed(1)}M
                        </p>
                      </div>
                      <div>
                        <p className="text-ink-secondary font-medium">Funded</p>
                        <p className="font-mono font-semibold text-brand-600">
                          {Math.round((startup.amount_raised / startup.funding_goal) * 100)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-ink-secondary font-medium">Investors</p>
                        <p className="font-mono font-semibold text-ink-primary">
                          {startup.investors_count}
                        </p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between gap-2 mt-auto">
                      <div className="px-2 py-1 rounded bg-gold-100 text-gold-900 text-xs font-semibold">
                        Min: Rs {startup.min_investment.toLocaleString()}
                      </div>
                      <motion.button
                        onClick={() => navigate(`/startups/${startup.id}`)}
                        whileHover={{ scale: 1.05, x: 4 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-3 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold transition-colors group/btn flex items-center gap-1"
                      >
                        View & Invest
                        <span className="group-hover/btn:translate-x-0.5 transition-transform">
                          →
                        </span>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-lg text-ink-secondary">
              No startups found matching your filters.
            </p>
            <motion.button
              onClick={() => {
                setSearch('');
                setSelectedSector('all');
              }}
              whileHover={{ scale: 1.05 }}
              className="mt-6 px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-colors"
            >
              Reset Filters
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
