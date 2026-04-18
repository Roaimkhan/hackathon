import React from 'react'
import { motion } from 'framer-motion'
import { HeartIcon } from '@heroicons/react/24/outline'
import { Link, useLocation } from 'react-router-dom'

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()
  const location = useLocation()

  // Hide footer on auth and app-shell pages
  const hideFooter =
    ['/login', '/register', '/kyc'].includes(location.pathname) ||
    location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/admin')

  if (hideFooter) return null

  const links = {
    product: [
      { label: 'Features', href: '/#how', isRoute: true },
      { label: 'Pricing', href: '/startups', isRoute: true },
      { label: 'Security', href: '/#about', isRoute: true },
      { label: 'Roadmap', href: '/#about', isRoute: true },
    ],
    company: [
      { label: 'About Us', href: '/#about', isRoute: true },
      { label: 'Blog', href: '/startups', isRoute: true },
      { label: 'Careers', href: '/register', isRoute: true },
      { label: 'Press', href: '/#about', isRoute: true },
    ],
    legal: [
      { label: 'Privacy', href: '/#about', isRoute: true },
      { label: 'Terms', href: '/#about', isRoute: true },
      { label: 'Compliance', href: '/#about', isRoute: true },
      { label: 'Contact', href: '/register', isRoute: true },
    ],
  }

  const socials = [
    { name: 'Twitter', icon: '𝕏', href: 'https://x.com' },
    { name: 'LinkedIn', icon: 'in', href: 'https://linkedin.com' },
    { name: 'Instagram', icon: '📷', href: 'https://instagram.com' },
  ]

  return (
    <footer className="relative bg-brand-950 text-surface-1 overflow-hidden">
      {/* Animated Top Border */}
      <div className="relative h-px bg-gradient-to-r from-transparent via-brand-600 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-24">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h3 className="font-display text-2xl font-bold text-white mb-2">
                NayaCapital
              </h3>
              <p className="text-surface-1/70 text-sm leading-relaxed mb-6">
                Democratizing wealth creation in Pakistan. Invest from Rs 1 in vetted startups
                and be part of Pakistan's entrepreneurial revolution.
              </p>
              <div className="flex gap-4">
                {socials.map((social) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    whileHover={{ scale: 1.1, color: '#22C55E' }}
                    className="w-10 h-10 rounded-lg border border-brand-700 hover:border-brand-500 flex items-center justify-center text-sm font-semibold transition-colors"
                    title={social.name}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Links Columns */}
          {Object.entries(links).map(([category, items], idx) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              <h4 className="font-semibold text-white mb-4 capitalize">{category}</h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.label}>
                    {item.isRoute ? (
                      <Link
                        to={item.href}
                        className="text-surface-1/70 hover:text-brand-400 transition-colors text-sm"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <a
                        href={item.href}
                        className="text-surface-1/70 hover:text-brand-400 transition-colors text-sm"
                      >
                        {item.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          {/* Newsletter Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h4 className="font-semibold text-white mb-4">Newsletter</h4>
            <p className="text-surface-1/70 text-sm mb-4">
              Stay updated with investment opportunities.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-3 py-2 rounded-lg bg-brand-900 border border-brand-700 text-surface-0 text-sm placeholder-surface-1/50 focus:outline-none focus:border-brand-500 transition-colors"
              />
              <Link
                to="/register"
                className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-medium text-sm transition-colors"
              >
                Join
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="h-px bg-brand-800 my-8" />

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-surface-1/60"
        >
          <p>
            © {currentYear} NayaCapital. All rights reserved. Invest wisely, grow together.
          </p>
          <div className="flex items-center gap-1">
            Made with
            <HeartIcon className="w-4 h-4 text-brand-500" />
            for Pakistan's entrepreneurs
          </div>
        </motion.div>
      </div>

      {/* Decorative Background Element */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-600/5 rounded-full blur-3xl -z-10 pointer-events-none" />
    </footer>
  )
}

export default Footer
