// ...existing code...
import React from 'react';
import { FaEnvelope, FaGlobe, FaCookieBite, FaLock, FaUsers, FaDatabase, FaExclamationTriangle } from 'react-icons/fa';

export default function PrivacyPolicy() {
  return (
    <section className="bg-gray-900 mt-12 text-blue-500 min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">Privacy Policy – SOMVD</h1>
          <div className="text-sm text-gray-400 flex items-center gap-3">
            <span className="inline-flex items-center gap-2">
              <FaExclamationTriangle className="text-yellow-400" /> Last Updated:
            </span>
            <span className="font-medium text-gray-300">September 2025</span>
          </div>
          <p className="mt-4 text-gray-300">
            At SOMVD (Somali Video Downloader), your privacy is very important to us. This Privacy Policy explains how we handle your information when you use our website.
          </p>
        </header>

        <article className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Information We Collect</h2>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-green-400">✅</span>
                <span>We do not collect any personal information when you use SOMVD.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400">✅</span>
                <span>We do not track your downloads, browsing history, or store your IP address for advertising purposes.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400">✅</span>
                <span>If you choose to contact us (via email or contact form), we may collect your name and email address only to respond to your inquiry.</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. How We Use Information</h2>
            <p className="text-gray-300">We use any information you provide only to:</p>
            <ul className="list-disc list-inside mt-3 text-gray-300 space-y-1">
              <li>Provide a better user experience.</li>
              <li>Improve our services and fix errors.</li>
              <li>Respond to your support requests.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Cookies and Tracking</h2>
            <p className="text-gray-300">
              SOMVD does not use cookies for tracking or advertising. Some basic session cookies may be used for site functionality (like language preferences).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Third-Party Content</h2>
            <p className="text-gray-300">
              SOMVD allows you to download content from third-party platforms (like YouTube, TikTok, Facebook, etc.). We are not responsible for the content you download — please follow the Terms of Service of each platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Data Storage</h2>
            <p className="text-gray-300">
              We do not store downloaded videos on our servers. All downloads are processed directly between your browser and the source.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Children’s Privacy</h2>
            <p className="text-gray-300">
              SOMVD is not designed for children under 13. We do not knowingly collect information from children.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Changes to This Policy</h2>
            <p className="text-gray-300">
              We may update this Privacy Policy from time to time. Updates will always be posted on this page with a new “Last Updated” date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Contact Us</h2>
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 gap-3 text-gray-300">
              <div className="flex items-center gap-3">
                <FaEnvelope className="text-blue-400" />
                <a href="mailto:support@somvdapp.com" className="text-blue-400 hover:underline">support@somvdapp.com</a>
              </div>
              <div className="flex items-center gap-3">
                <FaGlobe className="text-blue-400" />
                <a href="https://somvdapp.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">somvdapp.com</a>
              </div>
            </div>
          </section>
        </article>
      </div>
    </section>
  );
}
// ...existing code...