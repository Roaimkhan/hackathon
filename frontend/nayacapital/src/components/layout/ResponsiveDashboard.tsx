import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

interface ResponsiveDashboardProps {
  sidebar: React.ReactNode
  content: React.ReactNode
  sidebarWidth?: string // default: w-60
}

/**
 * ResponsiveDashboard: Wraps dashboards with responsive sidebar
 * - Desktop: Side-by-side layout
 * - Mobile: Collapsible hamburger menu
 */
export const ResponsiveDashboard: React.FC<ResponsiveDashboardProps> = ({
  sidebar,
  content,
  sidebarWidth = 'w-60',
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-surface-1 overflow-hidden">
      {/* Desktop Sidebar - Always Visible */}
      <div className={`hidden md:block ${sidebarWidth} shrink-0 border-r border-surface-3`}>
        {sidebar}
      </div>

      {/* Mobile Sidebar - Drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />

            {/* Mobile Menu Drawer */}
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 h-full w-60 z-50 bg-brand-950 text-white border-r border-brand-900 overflow-y-auto md:hidden"
            >
              {sidebar}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Top Bar */}
        <div className="md:hidden flex items-center justify-between h-16 px-4 border-b border-surface-3 bg-surface-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-surface-2 rounded-lg transition-colors"
          >
            <Bars3Icon className="w-6 h-6 text-ink-primary" />
          </button>

          <h1 className="text-lg font-semibold text-ink-primary">NayaCapital</h1>

          <div className="w-10" /> {/* Spacer for alignment */}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          {content}
        </div>
      </div>
    </div>
  )
}
