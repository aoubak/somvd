import React from 'react'
import { FaLink, FaDownload, FaPlayCircle } from 'react-icons/fa';

export default function HowWorks() {

    const steps = [
    {
      icon: <FaLink size={32} />,
      title: 'Paste the URL',
      desc: 'Copy the video URL from your browser and paste it into the search bar.',
    },
    {
      icon: <FaDownload size={32} />,
      title: 'Download the Video',
      desc: 'Choose your desired video quality and click the download button.',
    },
    {
      icon: <FaPlayCircle size={32} />,
      title: 'Enjoy Offline',
      desc: 'Watch your downloaded videos anytime, even without an internet connection.',
    },
  ];


  return (
   <section className="bg-gray-900 text-blue-500 py-16 px-4">
      <div className="max-w-4xl mx-auto text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
        <p className="text-gray-300">Simple steps to download your favorite videos.</p>
      </div>
      <div className="flex max-w-6xl mx-auto flex-col md:flex-row justify-center gap-8">
        {steps.map((step) => (
          <div
            key={step.title}
            className="flex-1 bg-gray-800 rounded-xl shadow-lg p-8 flex flex-col items-center transition"
          >
            <div className="bg-blue-500 text-white rounded-full p-4 mb-4 flex items-center justify-center">
              {step.icon}
            </div>
            <h3 className="text-xl font-semibold text-white  mb-2">{step.title}</h3>
            <p className="text-gray-300 text-center">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
