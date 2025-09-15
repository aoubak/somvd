// ...existing code...
import React from 'react';
import { FaEnvelope, FaGlobe, FaExclamationTriangle } from 'react-icons/fa';

export default function Terms() {
  return (
    <section className="bg-gray-900 mt-12 text-blue-500 min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">Terms of Service – SOMVD</h1>
          <div className="text-sm text-gray-400 flex items-center gap-3">
            <FaExclamationTriangle className="text-yellow-400" />
            <span className="font-medium text-gray-300">Last Updated: September 2025</span>
          </div>
          <p className="mt-4 text-gray-300">
            Welcome to SOMVD (Somali Video Downloader). By accessing or using our website, you agree to these Terms of Service. Please read them carefully.
          </p>
        </header>

        <article className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-xl font-semibold text-white mb-2">1. Acceptance of Terms</h2>
            <p>By using SOMVD, you agree to follow these Terms. If you do not agree, please do not use our service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">2. Service Description</h2>
            <p>
              SOMVD provides a tool that allows users to download publicly available videos and audio from supported platforms. SOMVD is free to use and is provided on a non‑profit basis.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">3. User Responsibilities</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>You agree to use SOMVD only for personal and non-commercial purposes.</li>
              <li>You are solely responsible for ensuring that downloading or using content complies with the laws of your country and the Terms of Service of the platform from which the content is downloaded.</li>
              <li>You must not use SOMVD to download or distribute copyrighted content illegally.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">4. Copyright Disclaimer</h2>
            <p>
              SOMVD is not affiliated with YouTube, TikTok, Facebook, Instagram, Twitter (X), or any other platform. We respect the rights of content creators. Downloaded videos should only be used for personal, offline use unless you have permission from the copyright owner.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">5. Limitation of Liability</h2>
            <p>
              SOMVD provides the service “as is” with no guarantees of accuracy, reliability, or availability. We are not responsible for any damages, losses, or legal issues that may result from using this service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">6. Changes to the Service</h2>
            <p>
              We may update or change SOMVD at any time, including adding or removing features, without prior notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">7. Termination</h2>
            <p>
              We reserve the right to block or restrict access to SOMVD if a user is found to be violating these Terms or abusing the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">8. Changes to the Terms</h2>
            <p>
              We may update these Terms of Service at any time. Updates will be posted on this page with a new “Last Updated” date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Contact Us</h2>
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