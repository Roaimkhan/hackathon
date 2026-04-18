import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDownIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { user, logout, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Hide navbar on auth and app-shell pages
  const hideNavbar =
    ['/login', '/register', '/kyc'].includes(location.pathname) ||
    location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/admin')

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = async () => {
    await logout()
    setDropdownOpen(false)
    navigate('/')
  }

  const navLinks = [
    { label: 'Startups', href: '/startups', isSection: false },
    { label: 'How It Works', href: '/#how', isSection: true },
    { label: 'About', href: '/#about', isSection: true },
  ]

  // Hide navbar on auth pages
  if (hideNavbar) return null

  const handleSectionClick = (href: string) => {
    const hash = href.split('#')[1]
    if (!hash) return

    if (location.pathname === '/') {
      const target = document.getElementById(hash)
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      return
    }

    navigate(href)
  }

  return (
    <>
      {/* Desktop Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        className={`fixed top-0 left-0 right-0 z-50 hidden md:flex items-center justify-between px-6 lg:px-12 py-4 transition-all duration-300 ${
          scrolled
            ? 'glass bg-surface-0/80 border-b border-surface-3'
            : 'bg-transparent'
        }`}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <motion.svg
            className="w-6 h-6 text-brand-600 group-hover:text-brand-700 transition-colors"
            fill="currentColor"
            viewBox="0 0 24 24"
            whileHover={{ scale: 1.1 }}
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11z" />
          </motion.svg>
          <span className="font-display text-xl font-bold text-ink-primary">NayaCapital</span>
        </Link>

        {/* Nav Links */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            link.isSection ? (
              <button
                key={link.href}
                onClick={() => handleSectionClick(link.href)}
                className="relative text-ink-secondary hover:text-ink-primary transition-colors group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-600 group-hover:w-full transition-all duration-300" />
              </button>
            ) : (
              <Link
                key={link.href}
                to={link.href}
                className="relative text-ink-secondary hover:text-ink-primary transition-colors group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-600 group-hover:w-full transition-all duration-300" />
              </Link>
            )
          ))}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {loading ? (
            <div className="w-8 h-8 rounded-full border-2 border-surface-3 border-t-brand-600 animate-spin" />
          ) : user ? (
            <>
              {/* Wallet Balance */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="px-4 py-2 rounded-full bg-brand-100 text-brand-700 text-sm font-mono font-semibold flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
                Rs {user.wallet_balance.toLocaleString()}
              </motion.div>

              {/* Dropdown */}
              <div className="relative">
                <motion.button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-surface-2 transition-colors"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {user.full_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-ink-secondary capitalize">
                    {user.role}
                  </span>
                  <ChevronDownIcon className="w-4 h-4 text-ink-muted" />
                </motion.button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute right-0 mt-2 w-48 rounded-lg bg-surface-0 border border-surface-3 shadow-lg overflow-hidden"
                    >
                      <Link
                        to={
                          user.role === 'investor'
                            ? '/dashboard/investor'
                            : '/dashboard/founder'
                        }
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-ink-secondary hover:bg-surface-2 transition-colors"
                      >
                        Dashboard
                      </Link>
                      <Link
                        to={
                          user.role === 'investor'
                            ? '/dashboard/investor'
                            : '/dashboard/founder'
                        }
                        state={{ tab: 'settings' }}
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-ink-secondary hover:bg-surface-2 transition-colors"
                      >
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-surface-3"
                      >
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-ink-primary border border-surface-3 rounded-lg hover:bg-surface-2 transition-colors text-sm font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors text-sm font-medium"
              >
                Start Investing
              </Link>
            </>
          )}
        </div>
      </motion.nav>

      {/* Mobile Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        className={`fixed top-0 left-0 right-0 z-40 md:hidden flex items-center justify-between px-4 py-3 transition-all duration-300 ${
          scrolled ? 'glass bg-surface-0/80 border-b border-surface-3' : 'bg-transparent'
        }`}
      >
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-lg font-bold text-ink-primary">NC</span>
        </Link>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 hover:bg-surface-2 rounded-lg transition-colors"
        >
          {mobileMenuOpen ? (
            <XMarkIcon className="w-6 h-6" />
          ) : (
            <Bars3Icon className="w-6 h-6" />
          )}
        </button>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-0 right-0 z-30 md:hidden bg-surface-0 border-b border-surface-3 p-4 flex flex-col gap-4"
          >
            {navLinks.map((link) => (
              link.isSection ? (
                <button
                  key={link.href}
                  onClick={() => {
                    handleSectionClick(link.href)
                    setMobileMenuOpen(false)
                  }}
                  className="text-left text-ink-secondary hover:text-ink-primary transition-colors py-2"
                >
                  {link.label}
                </button>
              ) : (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-ink-secondary hover:text-ink-primary transition-colors py-2"
                >
                  {link.label}
                </Link>
              )
            ))}
            <div className="h-px bg-surface-3 my-2" />
            {user ? (
              <>
                <div className="px-3 py-2 rounded-lg bg-brand-100 text-brand-700 text-sm font-mono font-semibold">
                  Rs {user.wallet_balance.toLocaleString()}
                </div>
                <Link
                  to={
                    user.role === 'investor'
                      ? '/dashboard/investor'
                      : '/dashboard/founder'
                  }
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-ink-secondary hover:text-ink-primary py-2"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-left text-sm font-medium text-red-600 py-2"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-ink-primary py-2"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-brand-600 py-2"
                >
                  Start Investing
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Navbar
