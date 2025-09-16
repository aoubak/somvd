// ...existing code...
import React from 'react';
import { FaPaypal, FaMobileAlt, FaHeart,   } from 'react-icons/fa';
import { SiBuymeacoffee } from 'react-icons/si';

export default function Donate() {
  return (
    <section className="bg-gray-900 mt-15 text-blue-500 py-16 px-4">
      <div className="max-w-5xl mx-auto bg-gradient-to-b from-purple-900/20 to-purple-950 border border-purple-900 rounded-2xl shadow-xl p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left: Message + CTA */}
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Support SOMVD</h1>
          <p className="text-gray-300 mb-6">
            SOMVD is free to use. Help us keep it running — every contribution makes a difference.
            Donations pay for servers, updates, and new features.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="https://www.paypal.com/donate?hosted_button_id=REPLACE_ME"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 justify-center bg-blue-500 hover:bg-blue-600 text-white px-5 py-3 rounded-lg font-semibold transition shadow"
            >
              <FaPaypal /> Donate with PayPal
            </a>

            <a
              href="https://www.buymeacoffee.com/yourname"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 justify-center bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-5 py-3 rounded-lg font-semibold transition shadow"
            >
              <SiBuymeacoffee /> Buy Me a Coffee
            </a>
          </div>

          <p className="text-sm text-gray-400 mt-4">
            Prefer mobile money? Use the numbers below. For larger support or sponsorship, contact us at{' '}
            <a href="mailto:support@somvdapp.com" className="text-blue-400 hover:underline">support@somvdapp.com</a>.
          </p>
        </div>

        {/* Right: Mobile Money + Thank you */}
        <div className="bg-gradient-to-b from-gray-900/20 to-gray-950/15 border border-purple-800/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Mobile Money (Somalia)</h3>
              <p className="text-gray-300 text-sm">Quick support via local carriers</p>
            </div>
            <div className="text-2xl text-yellow-400">
              <FaHeart />
            </div>
          </div>

          <ul className="space-y-4 mb-6">
            <li className="flex items-center gap-3">
              <FaMobileAlt className="text-blue-400" />
              <div>
                <div className="text-sm text-gray-300 font-medium">EVC Plus</div>
                <div className="text-white">+252 Sooooon...</div>
              </div>
            </li>
            <li className="flex items-center gap-3">
              <FaMobileAlt className="text-blue-400" />
              <div>
                <div className="text-sm text-gray-300 font-medium">Sahal</div>
                <div className="text-white">+252 907408416</div>
              </div>
            </li>
          </ul>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500 text-white rounded-md">
              <FaHeart />
            </div>
            <div>
              <div className="text-sm text-gray-300">Thank you</div>
              <div className="text-white font-semibold">Your support keeps SOMVD free for everyone.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Small footer CTA */}
      <div className="max-w-3xl mx-auto text-center mt-8">
        <p className="text-gray-400">
          Every contribution — big or small — helps. Replace placeholder links & numbers with real ones in code.
        </p>
      </div>
    </section>
  );
}
// ...existing code...