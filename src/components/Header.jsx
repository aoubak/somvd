import React from 'react'
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed z-50  w-full top-0 left-0 bg-gray-900/45 shadow-gray-600 shadow backdrop-blur-2xl text-white font-outfit">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link to="/" className="text-white text-2xl font-bold">SOMVD</Link>

        {/* Desktop Links */}
        <ul className="hidden md:flex py-2 rounded-md px-3 border  backdrop-blur-2xl border-gray-700  space-x-8 items-center">
          <li>
            <Link to="/" className="hover:text-gray-300 transition">
              Home
            </Link>
          </li>
          <li>
            <Link to="/features" className="hover:text-gray-300 transition">
              Features
            </Link>
          </li>

          <li>
            <Link to="/donate" className="hover:text-gray-300 transition">
              Donate
            </Link>
          </li>

        </ul>

        {/* links In Disktop */}
        <div className='hidden md:flex space-x-6 items-center list-none'>
          <li>
            <Link to="/login" className="hover:text-gray-300 transition">
              Login
            </Link>
          </li>
          <li>
            <button className="bg-blue-500 text-gray-300 px-4 py-2 rounded-lg hover:bg-blue-600 transition font-semibold border border-blue-500">
              Download
            </button>
          </li>
        </div>

        <button
          className="md:hidden text-blue-500 focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 7h20M4 14h20M4 21h20" />
          </svg>
        </button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-gray-800/45 backdrop-blur-2xl px-4 py-2">
          <ul className="space-y-2">
            <li>
              <Link to="/" className="hover:text-gray-300 transition">
                Home
              </Link>
            </li>
            <li>
              <Link to="/features" className="hover:text-gray-300 transition">
                Features
              </Link>
            </li>

            <li>
              <Link to="/donate" className="hover:text-gray-300 transition">
                Donate
              </Link>
            </li>
            <li><Link to="/login" className="block hover:text-white transition">Login</Link></li>
            <li>
              <button className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition font-semibold border border-blue-500">
                Download
              </button>
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}
