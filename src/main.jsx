import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter } from 'react-router-dom'
import Home from './pages/home.jsx'
import Features from './pages/Features.jsx'
import Pricing from './pages/Pricing.jsx'
import Support from './pages/Support.jsx'
import Login from './pages/Login.jsx'
import { RouterProvider } from 'react-router-dom'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children:[
      {index: true, element: <Home />},
      {path: '/features', element: <Features />},
      {path: '/pricing', element: <Pricing />},
      {path: '/support', element: <Support />},
      {path: '/login', element: <Login />},
    ],

    
  }
], {basename: '/somvdapp'})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
