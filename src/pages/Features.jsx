import React from 'react';
import { FaBolt, FaShieldAlt, FaCloudDownloadAlt, FaAd, FaUserAltSlash, FaVideo, FaCheck, FaTimes, FaCrown, FaStar, FaRocket, FaArrowRight, FaDownload, FaHeart } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: <FaAd size={28} />,
    title: 'Ad-Free Experience',
    desc: 'Unlike other downloaders, SOMVD is 100% free with no annoying ads.',
  },
  {
    icon: <FaVideo size={28} />,
    title: 'Multi-Platform Support',
    desc: 'Download from YouTube, TikTok, Instagram, Facebook, Twitter, and more.',
  },
  {
    icon: <FaCloudDownloadAlt size={28} />,
    title: 'High Quality Downloads',
    desc: 'Choose from MP4 HD, Full HD, 4K, or extract MP3 audio.',
  },
  {
    icon: <FaBolt size={28} />,
    title: 'Fast & Reliable',
    desc: 'Powered by strong backend technology for quick downloads.',
  },
  {
    icon: <FaUserAltSlash size={28} />,
    title: 'No Login Needed',
    desc: 'Paste the link → click download. Simple.',
  },
  {
    icon: <FaShieldAlt size={28} />,
    title: 'Safe & Secure',
    desc: 'We don’t store your data, all downloads are direct and private.',
  },
];

export default function Features() {
  return (
    <section className="bg-gray-900  text-blue-500 pt-30 pb-20 px-4">
      {/* Hero Section */}
      <div className="max-w-3xl  mx-auto text-center mb-12">
        <div className="flex justify-center mb-4">
          <FaCloudDownloadAlt size={48} className="text-blue-500" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Why Choose SOMVD?</h1>
        <p className="text-gray-300 text-lg">Free, Fast, and Secure Video Downloader for Everyone</p>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-16">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="bg-gray-800 rounded-xl shadow-lg p-8 flex flex-col items-center text-center hover:scale-105 transition"
          >
            <div className="bg-blue-500 text-white rounded-full p-3 mb-4 flex items-center justify-center">
              {feature.icon}
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
            <p className="text-gray-300">{feature.desc}</p>
          </div>
        ))}
      </div>

      {/* Comparison Section - Enhanced Design */}
      <div className="max-w-7xl mx-auto mb-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
            <FaCrown size={32} className="text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Why SOMVD is the Best Choice</h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Compare SOMVD with other video downloaders and see why thousands of users trust us for their downloading needs.
          </p>
        </div>

        {/* Comparison Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* SOMVD Card - Highlighted */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl p-8 text-center relative overflow-hidden">
              {/* Premium Badge */}
              <div className="absolute top-4 right-4">
                <div className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                  <FaStar size={12} />
                  BEST
                </div>
              </div>
              
              <div className="mb-6">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCloudDownloadAlt size={40} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">SOMVD</h3>
                <p className="text-blue-100">The Ultimate Video Downloader</p>
              </div>

              <div className="space-y-4 text-left">
                <div className="flex items-center gap-3">
                  <FaCheck className="text-green-400 text-xl" />
                  <span className="text-white">100% Ad-Free</span>
                </div>
                <div className="flex items-center gap-3">
                  <FaCheck className="text-green-400 text-xl" />
                  <span className="text-white">Multi-Platform Support</span>
                </div>
                <div className="flex items-center gap-3">
                  <FaCheck className="text-green-400 text-xl" />
                  <span className="text-white">High Quality Downloads</span>
                </div>
                <div className="flex items-center gap-3">
                  <FaCheck className="text-green-400 text-xl" />
                  <span className="text-white">Secure & Private</span>
                </div>
                <div className="flex items-center gap-3">
                  <FaCheck className="text-green-400 text-xl" />
                  <span className="text-white">No Registration Required</span>
                </div>
                <div className="flex items-center gap-3">
                  <FaCheck className="text-green-400 text-xl" />
                  <span className="text-white">Fast & Reliable</span>
                </div>
              </div>

              <div className="mt-8">
                <div className="text-3xl font-bold text-white mb-2">FREE</div>
                <div className="text-blue-100">Forever & Always</div>
              </div>
            </div>
          </div>

          {/* Other Downloaders Card */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">Other Downloaders</h3>
              
              {/* Comparison Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="py-4 px-4 text-left text-gray-300 font-semibold">Features</th>
                      <th className="py-4 px-4 text-center text-gray-300 font-semibold">SOMVD</th>
                      <th className="py-4 px-4 text-center text-gray-300 font-semibold">Others</th>
                    </tr>
                  </thead>
                  <tbody className="space-y-2">
                    <tr className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                      <td className="py-4 px-4 text-white font-medium">Ad-Free Experience</td>
                      <td className="py-4 px-4 text-center">
                        <FaCheck className="text-green-400 text-xl mx-auto" />
                      </td>
                      <td className="py-4 px-4 text-center">
                        <FaTimes className="text-red-400 text-xl mx-auto" />
                      </td>
                    </tr>
                    <tr className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                      <td className="py-4 px-4 text-white font-medium">Multi-Platform Support</td>
                      <td className="py-4 px-4 text-center">
                        <FaCheck className="text-green-400 text-xl mx-auto" />
                      </td>
                      <td className="py-4 px-4 text-center">
                        <FaTimes className="text-red-400 text-xl mx-auto" />
                      </td>
                    </tr>
                    <tr className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                      <td className="py-4 px-4 text-white font-medium">High Quality Downloads</td>
                      <td className="py-4 px-4 text-center">
                        <FaCheck className="text-green-400 text-xl mx-auto" />
                      </td>
                      <td className="py-4 px-4 text-center">
                        <FaCheck className="text-yellow-400 text-xl mx-auto" />
                      </td>
                    </tr>
                    <tr className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                      <td className="py-4 px-4 text-white font-medium">Privacy & Security</td>
                      <td className="py-4 px-4 text-center">
                        <FaCheck className="text-green-400 text-xl mx-auto" />
                      </td>
                      <td className="py-4 px-4 text-center">
                        <FaTimes className="text-red-400 text-xl mx-auto" />
                      </td>
                    </tr>
                    <tr className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                      <td className="py-4 px-4 text-white font-medium">No Registration</td>
                      <td className="py-4 px-4 text-center">
                        <FaCheck className="text-green-400 text-xl mx-auto" />
                      </td>
                      <td className="py-4 px-4 text-center">
                        <FaTimes className="text-red-400 text-xl mx-auto" />
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-700/30 transition-colors">
                      <td className="py-4 px-4 text-white font-medium">Speed & Reliability</td>
                      <td className="py-4 px-4 text-center">
                        <FaCheck className="text-green-400 text-xl mx-auto" />
                      </td>
                      <td className="py-4 px-4 text-center">
                        <FaTimes className="text-red-400 text-xl mx-auto" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Bottom Stats */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">100%</div>
                  <div className="text-gray-400 text-sm">Free Forever</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">0</div>
                  <div className="text-gray-400 text-sm">Ads</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">∞</div>
                  <div className="text-gray-400 text-sm">Downloads</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Call-to-Action */}
      <div className="max-w-6xl mx-auto mt-16">
        {/* Main CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-center relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>
          
          {/* Content */}
          <div className="relative z-10">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6">
              <FaRocket size={40} className="text-white" />
            </div>
            
            {/* Headline */}
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Ready to Download?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of users who trust SOMVD for their video downloading needs. 
              <span className="font-semibold text-white"> 100% free, forever.</span>
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Link
                to="/"
                className="group bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center gap-3"
              >
                <FaDownload size={20} />
                Start Downloading Now
                <FaArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                to="/donate"
                className="group bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
              >
                <FaHeart size={20} />
                Support Us
              </Link>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-blue-100">
              <div className="flex items-center gap-2">
                <FaShieldAlt size={16} />
                <span className="text-sm">100% Secure</span>
              </div>
              <div className="flex items-center gap-2">
                <FaAd size={16} />
                <span className="text-sm">No Ads</span>
              </div>
              <div className="flex items-center gap-2">
                <FaUserAltSlash size={16} />
                <span className="text-sm">No Registration</span>
              </div>
              <div className="flex items-center gap-2">
                <FaBolt size={16} />
                <span className="text-sm">Lightning Fast</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Secondary CTA - Features Preview */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-2xl p-6 text-center hover:bg-gray-700 transition-colors">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaVideo size={24} className="text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Multi-Platform</h3>
            <p className="text-gray-400 text-sm">YouTube, TikTok, Instagram, Facebook & more</p>
          </div>
          
          <div className="bg-gray-800 rounded-2xl p-6 text-center hover:bg-gray-700 transition-colors">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCloudDownloadAlt size={24} className="text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">High Quality</h3>
 <p className="text-gray-400 text-sm">MP4 HD, Full HD, 4K & MP3 audio</p>
          </div>
          
          <div className="bg-gray-800 rounded-2xl p-6 text-center hover:bg-gray-700 transition-colors">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaShieldAlt size={24} className="text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Privacy First</h3>
            <p className="text-gray-400 text-sm">Your data stays private & secure</p>
          </div>
        </div>
        
        {/* Final CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 mb-6">
            Still not convinced? Try it now - it's completely free!
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
          >
            <FaRocket size={20} />
            Get Started Free
            <FaArrowRight size={16} />
          </a>
        </div>
      </div>
      
    </section>
  );
}