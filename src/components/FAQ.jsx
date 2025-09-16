import React, { useState } from 'react';
import {
  FaCheckCircle, FaTimesCircle, FaVideo, FaUserAltSlash, FaFileVideo,
  FaMobileAlt, FaExclamationTriangle, FaShieldAlt, FaRedo, FaLock, FaUserAstronaut,
  FaCheck, FaTimes, FaList, FaDesktop, FaGavel, FaExclamationCircle,
  FaBan, FaCode, FaArrowRight
} from 'react-icons/fa';

const faqs = [
  {
    question: 'Is SOMVD free to use?',
    icon: <FaCheckCircle className="text-green-400" size={22} />,
    answer: (
      <div className="flex items-start gap-3">
        <FaCheck className="text-green-400 text-lg mt-1 flex-shrink-0" />
        <span>Yes. SOMVD is 100% free with no hidden charges, no ads, and no premium plans.</span>
      </div>
    ),
  },
  {
    question: 'Do I need to create an account or log in?',
    icon: <FaTimesCircle className="text-red-400" size={22} />,
    answer: (
      <div className="flex items-start gap-3">
        <FaTimes className="text-red-400 text-lg mt-1 flex-shrink-0" />
        <span>No. You don't need to register. Just paste your video link and download.</span>
      </div>
    ),
  },
  {
    question: 'Which platforms are supported?',
    icon: <FaVideo className="text-blue-400" size={22} />,
    answer: (
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <FaVideo className="text-blue-400 text-lg mt-1 flex-shrink-0" />
          <span>SOMVD supports popular platforms like:</span>
        </div>
        <div className="ml-8 space-y-2">
          <div className="flex items-center gap-2">
            <FaArrowRight className="text-blue-400 text-sm" />
            <span>YouTube</span>
          </div>
          <div className="flex items-center gap-2">
            <FaArrowRight className="text-blue-400 text-sm" />
            <span>Facebook</span>
          </div>
          <div className="flex items-center gap-2">
            <FaArrowRight className="text-blue-400 text-sm" />
            <span>Instagram</span>
          </div>
          <div className="flex items-center gap-2">
            <FaArrowRight className="text-blue-400 text-sm" />
            <span>TikTok</span>
          </div>
          <div className="flex items-center gap-2">
            <FaArrowRight className="text-blue-400 text-sm" />
            <span>Twitter (X)</span>
          </div>
          <div className="flex items-center gap-2">
            <FaArrowRight className="text-blue-400 text-sm" />
            <span>And many more…</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    question: 'What video formats are available?',
    icon: <FaFileVideo className="text-yellow-400" size={22} />,
    answer: (
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <FaFileVideo className="text-yellow-400 text-lg mt-1 flex-shrink-0" />
          <span>You can download in multiple formats depending on availability:</span>
        </div>
        <div className="ml-8 space-y-2">
          <div className="flex items-center gap-2">
            <FaArrowRight className="text-yellow-400 text-sm" />
            <span>MP4 (360p, 720p, 1080p, sometimes 4K)</span>
          </div>
          <div className="flex items-center gap-2">
            <FaArrowRight className="text-yellow-400 text-sm" />
            <span>MP3 (audio only)</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    question: 'Does SOMVD work on mobile and desktop?',
    icon: <FaMobileAlt className="text-blue-400" size={22} />,
    answer: (
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <FaCheck className="text-green-400 text-lg mt-1 flex-shrink-0" />
          <span>Yes. SOMVD is a web app, so it works on:</span>
        </div>
        <div className="ml-8 space-y-2">
          <div className="flex items-center gap-2">
            <FaMobileAlt className="text-blue-400 text-sm" />
            <span>Android & iOS phones (via browser)</span>
          </div>
          <div className="flex items-center gap-2">
            <FaDesktop className="text-blue-400 text-sm" />
            <span>Windows, macOS, and Linux PCs</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    question: 'Is downloading videos legal?',
    icon: <FaExclamationTriangle className="text-orange-400" size={22} />,
    answer: (
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <FaExclamationCircle className="text-orange-400 text-lg mt-1 flex-shrink-0" />
          <span>SOMVD is a tool for personal use only.</span>
        </div>
        <div className="flex items-start gap-3">
          <FaGavel className="text-orange-400 text-lg mt-1 flex-shrink-0" />
          <span>Please respect the copyright laws of your country and the terms of each platform.</span>
        </div>
      </div>
    ),
  },
  {
    question: 'Is SOMVD safe?',
    icon: <FaShieldAlt className="text-green-400" size={22} />,
    answer: (
      <div className="flex items-start gap-3">
        <FaCheck className="text-green-400 text-lg mt-1 flex-shrink-0" />
        <span>Yes. We don't store your videos, history, or personal information. Downloads happen directly from the source.</span>
      </div>
    ),
  },
  {
    question: 'Why is my download not working?',
    icon: <FaRedo className="text-red-400" size={22} />,
    answer: (
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <FaTimes className="text-red-400 text-lg mt-1 flex-shrink-0" />
          <span>Sometimes platforms change their systems. If you face issues:</span>
        </div>
        <div className="ml-8 space-y-2">
          <div className="flex items-center gap-2">
            <FaArrowRight className="text-red-400 text-sm" />
            <span>Refresh the page</span>
          </div>
          <div className="flex items-center gap-2">
            <FaArrowRight className="text-red-400 text-sm" />
            <span>Try again later</span>
          </div>
          <div className="flex items-center gap-2">
            <FaArrowRight className="text-red-400 text-sm" />
            <span>Contact us if the problem continues</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    question: 'Can I download private or paid videos?',
    icon: <FaLock className="text-red-400" size={22} />,
    answer: (
      <div className="flex items-start gap-3">
        <FaBan className="text-red-400 text-lg mt-1 flex-shrink-0" />
        <span>No. SOMVD only supports publicly available content.</span>
      </div>
    ),
  },
  {
    question: 'Who created SOMVD?',
    icon: <FaUserAstronaut className="text-blue-400" size={22} />,
    answer: (
      <div className="flex items-start gap-3">
        <FaCode className="text-blue-400 text-lg mt-1 flex-shrink-0" />
        <span>SOMVD was built as a non-profit project to help people download videos easily, without ads or restrictions — inspired by open-source projects like VLC Player.</span>
      </div>
    ),
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = idx => setOpenIndex(openIndex === idx ? null : idx);

  return (
    <section className="bg-gray-900 text-blue-500 py-16 px-4">
      <div className="max-w-3xl mx-auto text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <p className="text-gray-300">Find answers to common questions about SOMVD.</p>
      </div>
      <div className="max-w-6xl bg-amber-00 mx-auto">
        {faqs.map((faq, idx) => (
          <div key={idx} className="mb-4">
            <button
              className="w-full flex items-center justify-between bg-gray-800 rounded-lg px-5 py-4 text-left focus:outline-none hover:bg-gray-700 transition"
              onClick={() => toggle(idx)}
            >
              <span className="flex items-center gap-3 text-white text-lg font-semibold">
                {faq.icon}
                {faq.question}
              </span>
              <span className="text-blue-400 text-xl">{openIndex === idx ? '-' : '+'}</span>
            </button>
            {openIndex === idx && (
              <div className="bg-gray-950  text-gray-300 px-5 py-4 rounded-b-lg border-t border-blue-900">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}