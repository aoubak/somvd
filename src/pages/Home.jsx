import React from 'react'
import Hero from '../components/Hero'
import SupPlatforms from '../components/SupPlatforms'
import HowWorks from '../components/howworks'
import Footer from '../components/Footer'
export default function Home() {
  return (
    <section className='bg-gray-900 text-blue-500 pt-12 md:px-0'>
      <Hero />
      <SupPlatforms />
      <HowWorks />
      <Footer />
    </section>
  )
}
