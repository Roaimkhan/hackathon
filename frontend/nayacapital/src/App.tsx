import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import ScrollToHash from './components/layout/ScrollToHash'
import ProtectedRoute from './components/layout/ProtectedRoute'
import PageTransition from './components/ui/PageTransition'
import { AuthProvider } from './contexts/AuthContext'

// Pages
import LandingPage from './pages/LandingPage'
import { StartupListPage } from './pages/StartupListPage'
import StartupDetailPage from './pages/StartupDetailPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { KycPage } from './pages/KycPage'
import InvestorDashboard from './pages/InvestorDashboard'
import FounderDashboard from './pages/FounderDashboard'
import AdminPanel from './pages/AdminPanel'
import { useAuth } from './contexts/AuthContext'

const DashboardRedirect = () => {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role === 'investor') {
    return <Navigate to="/dashboard/investor" replace />
  }

  if (user.role === 'founder') {
    return <Navigate to="/dashboard/founder" replace />
  }

  if (user.role === 'admin') {
    return <Navigate to="/admin" replace />
  }

  return <Navigate to="/" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToHash />
        <div className="min-h-screen flex flex-col bg-white">
          <Navbar />
          <main className="flex-1">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
                <Route path="/startups" element={<PageTransition><StartupListPage /></PageTransition>} />
                <Route path="/startups/:id" element={<PageTransition><StartupDetailPage /></PageTransition>} />
                <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
                <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
                <Route path="/kyc" element={<PageTransition><ProtectedRoute><KycPage /></ProtectedRoute></PageTransition>} />
                <Route path="/dashboard" element={<PageTransition><ProtectedRoute><DashboardRedirect /></ProtectedRoute></PageTransition>} />
                <Route path="/dashboard/investor" element={<PageTransition><ProtectedRoute requiredRole="investor"><InvestorDashboard /></ProtectedRoute></PageTransition>} />
                <Route path="/dashboard/founder" element={<PageTransition><ProtectedRoute requiredRole="founder"><FounderDashboard /></ProtectedRoute></PageTransition>} />
                <Route path="/admin" element={<PageTransition><ProtectedRoute requiredRole="admin"><AdminPanel /></ProtectedRoute></PageTransition>} />
                <Route path="*" element={<PageTransition><div className="min-h-screen pt-24">Page not found</div></PageTransition>} />
              </Routes>
            </AnimatePresence>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  )
}
