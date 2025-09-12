import React from 'react'
import { FaFacebook,FaTiktok , FaTwitter, FaInstagram, FaLinkedin, FaYoutube } from "react-icons/fa";
export default function SupPlatforms() {

    const platforms = [
        {
            name: 'YouTube',
            icon: <FaYoutube size={26} />,
            color: 'bg-red-600',
        },
        {
            name: 'Facebook',
            icon: <FaFacebook size={26} />,
            color: 'bg-blue-700',
        },
        {
            name: 'TikTok',
            icon: <FaTiktok size={26} />, // This should be the TikTok icon, but FaTwitter is used here.
            color: 'bg-black',
        },
        {
            name: 'Instagram',
            icon: <FaInstagram size={26} />,
            color: 'bg-gradient-to-tr from-pink-500 via-purple-500 to-yellow-500',
        },
    ];
  return (
    <section className='bg-gray-900 text-blue-500 pt-12 pb-20 md:px-0'>
        <div className="max-w-3xl mx-auto text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Supported Platforms</h2>
        <p className="text-gray-300">Download videos from your favorite social media platforms with ease.</p>
      </div>
      <ul className="flex flex-wrap justify-center gap-8">
        {platforms.map((platform) => (
          <li
            key={platform.name}
            className={`flex flex-col items-center p-6 rounded-xl shadow-lg ${platform.color} bg-opacity-80 min-w-[120px]`}
          >
            <span className='w-[40px] h-[40px] text-blue-900 rounded-full bg-white flex items-center justify-center ' >{platform.icon}</span>
            <span className="text-lg font-semibold text-white">{platform.name}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
