import React from 'react'
import { FaRegFileVideo } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-300 pt-8 pb-4 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
        {/* Logo and name */}
        <div className="flex items-center gap-3 mb-4 md:mb-0">
          <span className="bg-white text-blue-500 rounded-lg p-2">
            <FaRegFileVideo size={28} />
          </span>
          <span className="font-semibold text-white text-lg">SOMVD</span>
        </div>
        {/* Links */}
        <ul className="flex gap-8 text-sm">
          <li>
            <a href="#" className="hover:text-blue-500 transition">Terms of Service</a>
          </li>
          <li>
            <a href="#" className="hover:text-blue-500 transition">Privacy Policy</a>
          </li>
          <li>
            <a href="#" className="hover:text-blue-500 transition">Contact Us</a>
          </li>
        </ul>
      </div>
      <hr className="border-gray-800 my-4" />
      <div className="text-center text-xs text-gray-500">
        © 2025 SOMVD. All rights reserved.
      </div>
    </footer>
  )
}
