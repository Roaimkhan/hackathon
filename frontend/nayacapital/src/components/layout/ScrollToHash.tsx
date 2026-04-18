import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const ScrollToHash = () => {
  const location = useLocation()

  useEffect(() => {
    const hash = location.hash.replace('#', '')

    if (hash) {
      const target = document.getElementById(hash)
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
    }

    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [location.pathname, location.hash])

  return null
}

export default ScrollToHash
