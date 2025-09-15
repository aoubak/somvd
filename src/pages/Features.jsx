import React from 'react';
import { FaBolt, FaShieldAlt, FaCloudDownloadAlt, FaAd, FaUserAltSlash, FaVideo } from 'react-icons/fa';

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

      {/* Comparison Section - Two Columns */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center mb-16">
        {/* Left Column: Large Font */}
        <div className="flex flex-col justify-center h-full">
          <h2 className="text-4xl font-extrabold text-white mb-4 leading-tight">
            Enjoy with Safety<br />and Security
          </h2>
          <p className="text-gray-300 text-lg">
            Your privacy is our priority. With SOMVD, you can download videos without worrying about your data being stored or shared.
          </p>
        </div>
        {/* Right Column: Table */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 text-center">SOMVD vs Other Downloaders</h2>
          <table className="w-full text-left bg-gray-800 rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-gray-700 text-blue-500">
                <th className="py-3 px-4">Feature</th>
                <th className="py-3 px-4">SOMVD</th>
                <th className="py-3 px-4">Others</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-3 px-4 text-white">No Ads</td>
                <td className="py-3 px-4 text-green-400 font-bold">✅</td>
                <td className="py-3 px-4 text-red-400 font-bold">❌</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-white">Multi-Platform</td>
                <td className="py-3 px-4 text-green-400 font-bold">✅</td>
                <td className="py-3 px-4 text-red-400 font-bold">❌</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-white">Secure & Private</td>
                <td className="py-3 px-4 text-green-400 font-bold">✅</td>
                <td className="py-3 px-4 text-red-400 font-bold">❌</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Call-to-Action */}
      <div className="max-w-2xl mx-auto text-center mt-12">
        <h2 className="text-2xl font-bold text-white mb-4">Start Downloading Instantly – It’s Free</h2>
        <a
          href="/"
          className="inline-block bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 transition border border-blue-500"
        >
          Try Now
        </a>
      </div>
    </section>

    // ok lets do some edition in comaprison section dive into colums, first make it left side add large font "like: enjoy with safety and secure" right dispaly current info
  );
}