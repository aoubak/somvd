import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'

// Scroll to #section after navigation, or to the top of a new page
function useScrollToHash() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView()
      return
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
}

function App() {
  useScrollToHash()

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="sr-only rounded-lg bg-lime px-3 py-2 text-sm font-semibold text-lime-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[60]">
        Skip to content
      </a>
      <Header />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default App
