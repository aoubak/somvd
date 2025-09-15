import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Features from './pages/Features.jsx'
import Pricing from './pages/Pricing.jsx'
import Donate from './pages/Donate.jsx'
import Login from './pages/Login.jsx'
import { RouterProvider } from 'react-router-dom'
import PrivacyPolicy from './pages/PrivacyPolicy.jsx'
import Terms from './pages/Terms.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children:[
      {index: true, element: <Home />},
      {path: '/features', element: <Features />},
      {path: '/pricing', element: <Pricing />},
      {path: '/donate', element: <Donate />},
      {path: '/login', element: <Login />},
      {path: '/privacyPolicy', element: <PrivacyPolicy />},
      {path: '/terms', element: <Terms />},
    ],

    
  }
], {basename: '/somvdapp'})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
