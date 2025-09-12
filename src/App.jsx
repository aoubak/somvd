// import { useState } from 'react'
// import viteLogo from '/vite.svg'
import { Outlet } from 'react-router-dom'
import Header from './components/header'
import Home from './pages/home'

function App() {
  return (
   <section>
    <Header />
    <Outlet />
    
   </section>
  )
}

export default App
