import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import '@fontsource-variable/geist'
import '@fontsource-variable/geist-mono'
import './index.css'
import App from './App.jsx'
import Home from './pages/Home.jsx'
import NotFound from './pages/NotFound.jsx'
import PrivacyPolicy from './pages/PrivacyPolicy.jsx'
import Terms from './pages/Terms.jsx'

// Login, Signup, Pricing and Donate stay on disk but are not routed until they work end to end
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        // Pathless route so errors render inside the header/footer layout
        errorElement: <NotFound />,
        children: [
          { index: true, element: <Home /> },
          { path: 'terms', element: <Terms /> },
          { path: 'privacy', element: <PrivacyPolicy /> },
          // Old URLs
          { path: 'privacyPolicy', element: <Navigate to="/privacy" replace /> },
          { path: 'features', element: <Navigate to="/#features" replace /> },
          { path: '*', element: <NotFound /> }
        ]
      }
    ]
  }
], { basename: '/somvdapp' })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
