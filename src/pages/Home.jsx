import React from 'react'
import Hero from '../components/Hero'
import SupPlatforms from '../components/SupPlatforms'
import HowWorks from '../components/howworks'
import Statistics from '../components/Statistics'
import FAQ from '../components/FAQ'
import Contact from '../components/Contact'

export default function Home() {
  return (
    <section className='bg-gray-900 text-blue-500 pt-12 md:px-0'>
      <Hero />
      {/* <SupPlatforms /> */}
      <HowWorks />
      <Statistics />
      <FAQ />
      <Contact />
    </section>
  )
}
