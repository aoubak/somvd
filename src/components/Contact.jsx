import React from 'react';
import { FaEnvelope, FaTelegramPlane, FaTwitter, FaWhatsapp } from 'react-icons/fa';
import CTIMAGE from '../assets/images/contact_image.jpg';
import { FaX } from 'react-icons/fa6';

export default function Contact() {
    return (
        <section className="bg-gray-900 text-blue-500 py-16 px-4">
            <div className="max-w-6xl mx-auto bg-gradient-to-b from-purple-900/20 to-purple-950 border border-purple-900 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between p-8 gap-8">
                {/* Left Side: Info */}
                <div className="flex-1 mb-8 md:mb-0">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Get in Touch</h2>
                    <p className="text-gray-300 mb-6">
                        We’d love to hear your feedback, questions, or suggestions.
                    </p>
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <FaEnvelope className="text-blue-400" size={22} />
                            <div className='flex flex-col'>
                                <span className="text-white font-semibold">Email:</span>
                                <a href="mailto:support@somvdapp.com" className="text-blue-400 hover:underline">
                                    support@somvdapp.com
                                </a>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <FaWhatsapp className="text-blue-400" size={22} />
                            <div className='flex flex-col'>
                                <span className="text-white font-semibold">WhatsApp:</span>
                                <a href="w.me:support@somvdapp.com" className="text-blue-400 hover:underline">
                                    +252907408416
                                </a>
                            </div>
                        </div>

                        {/* social links */}





                        <div className="flex items-center gap-3">
                            <FaTelegramPlane className="text-blue-400" size={22} />
                            <FaTwitter className="text-blue-400 ml-4" size={22} />
                        </div>


                    </div>
                </div>
                {/* Right Side: Illustration */}
                <div className="flex-1   flex justify-end">
                    <img
                        src={CTIMAGE}
                        alt="Contact Illustration"
                        className="w-90 md:w-96 rounded-lg"
                    />
                </div>
            </div>
            {/* Footer CTA */}
            <div className="max-w-2xl mx-auto text-center mt-12">
                <h2 className="text-xl font-bold text-white mb-4">
                    Got an idea to make SOMVD better? Don’t hesitate to reach out.
                </h2>
            </div>
        </section>
    );
}