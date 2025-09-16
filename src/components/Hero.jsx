import React from 'react'
import VideoDownloader from './VideoDownloader'

export default function Hero() {
  return (
     <section className="bg-gradient-to-b from-gray-900 via-purple-950 to-gray-900 pt-12 pb-20 px-4 md:px-0">
      <div className="max-w-4xl mx-auto  mb-10">
        <h1 className="text-4xl text-left md:text-center md:text-5xl font-bold text-white mb-6 leading-tight">
          Download Videos Instantly <br />
          <span className="text-blue-500">From Anywhere</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-8">
          SOMVD makes it easy to save your favorite videos from any platform. Fast, secure, and free.
        </p>
      </div>
      
      <VideoDownloader />
      
      {/* Features Preview */}
      <div className="max-w-4xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <div className="text-3xl mb-3">⚡</div>
          <h3 className="text-white font-semibold mb-2">Lightning Fast</h3>
          <p className="text-gray-400 text-sm">Download videos in seconds with our optimized servers</p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <div className="text-3xl mb-3">🔒</div>
          <h3 className="text-white font-semibold mb-2">100% Secure</h3>
          <p className="text-gray-400 text-sm">Your privacy is protected. No data stored or shared</p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <div className="text-3xl mb-3">🆓</div>
          <h3 className="text-white font-semibold mb-2">Completely Free</h3>
          <p className="text-gray-400 text-sm">No hidden fees, no ads, no registration required</p>
        </div>
      </div>
    </section>
  )
}
