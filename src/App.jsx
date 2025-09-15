// import { useState } from 'react'
// import viteLogo from '/vite.svg'
import { Outlet } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'

function App() {
  return (
   <section>
    <Header />
    <Outlet />
    <Footer />
   </section>
  )
}

export default App
