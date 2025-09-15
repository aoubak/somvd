import React, { useState } from 'react';
import {
  FaCheckCircle, FaTimesCircle, FaVideo, FaUserAltSlash, FaFileVideo,
  FaMobileAlt, FaExclamationTriangle, FaShieldAlt, FaRedo, FaLock, FaUserAstronaut
} from 'react-icons/fa';

const faqs = [
  {
    question: 'Is SOMVD free to use?',
    icon: <FaCheckCircle className="text-green-400" size={22} />,
    answer: '✅ Yes. SOMVD is 100% free with no hidden charges, no ads, and no premium plans.',
  },
  {
    question: 'Do I need to create an account or log in?',
    icon: <FaTimesCircle className="text-red-400" size={22} />,
    answer: '❌ No. You don’t need to register. Just paste your video link and download.',
  },
  {
    question: 'Which platforms are supported?',
    icon: <FaVideo className="text-blue-400" size={22} />,
    answer: (
      <span>
        🎥 SOMVD supports popular platforms like:<br />
        <span className="inline-block ml-4">YouTube<br />Facebook<br />Instagram<br />TikTok<br />Twitter (X)<br />And many more…</span>
      </span>
    ),
  },
  {
    question: 'What video formats are available?',
    icon: <FaFileVideo className="text-yellow-400" size={22} />,
    answer: (
      <span>
        📂 You can download in multiple formats depending on availability:<br />
        <span className="inline-block ml-4">MP4 (360p, 720p, 1080p, sometimes 4K)<br />MP3 (audio only)</span>
      </span>
    ),
  },
  {
    question: 'Does SOMVD work on mobile and desktop?',
    icon: <FaMobileAlt className="text-blue-400" size={22} />,
    answer: (
      <span>
        ✅ Yes. SOMVD is a web app, so it works on:<br />
        <span className="inline-block ml-4">Android & iOS phones (via browser).<br />Windows, macOS, and Linux PCs.</span>
      </span>
    ),
  },
  {
    question: 'Is downloading videos legal?',
    icon: <FaExclamationTriangle className="text-orange-400" size={22} />,
    answer: (
      <span>
        ⚠️ SOMVD is a tool for personal use only.<br />
        Please respect the copyright laws of your country and the terms of each platform.
      </span>
    ),
  },
  {
    question: 'Is SOMVD safe?',
    icon: <FaShieldAlt className="text-green-400" size={22} />,
    answer: (
      <span>
        ✅ Yes. We don’t store your videos, history, or personal information. Downloads happen directly from the source.
      </span>
    ),
  },
  {
    question: 'Why is my download not working?',
    icon: <FaRedo className="text-red-400" size={22} />,
    answer: (
      <span>
        ❌ Sometimes platforms change their systems. If you face issues:<br />
        <span className="inline-block ml-4">Refresh the page.<br />Try again later.<br />Contact us if the problem continues.</span>
      </span>
    ),
  },
  {
    question: 'Can I download private or paid videos?',
    icon: <FaLock className="text-red-400" size={22} />,
    answer: (
      <span>
        🚫 No. SOMVD only supports publicly available content.
      </span>
    ),
  },
  {
    question: 'Who created SOMVD?',
    icon: <FaUserAstronaut className="text-blue-400" size={22} />,
    answer: (
      <span>
        👨‍💻 SOMVD was built as a non-profit project to help people download videos easily, without ads or restrictions — inspired by open-source projects like VLC Player.
      </span>
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
      <div className="max-w-2xl mx-auto">
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
              <div className="bg-gray-950 text-gray-300 px-5 py-4 rounded-b-lg border-t border-blue-900">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}