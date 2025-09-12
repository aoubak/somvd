import React from 'react'

export default function hero() {
  return (
     <section className="bg-gradient-to-b from-gray-900 via-purple-950 to-gray-900 pt-12 pb-20 px-4 md:px-0">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-10">
        {/* Text Content */}
        <div className="flex-1">
          <h1 className="text-4xl text-center md:text-5xl font-bold text-white mb-6 leading-tight">
            Download Videos Instantly <br />
            <span className="text-blue-500">From Anywhere</span>
          </h1>
          <p className="text-lg md:text-xl text-center  text-gray-300 mb-8">
            SOMVD makes it easy to save your favorite videos from any platform. Fast, secure, and free.
          </p>
          <form className="flex flex-col sm:flex-row gap-3">
            <input
              type="url"
              placeholder="Paste video URL here..."
              className="flex-1 px-4 py-3 rounded-lg bg-gray-800 text-white border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition border border-blue-500"
            >
              Download
            </button>
          </form>
        </div>
        {/* Illustration */}
        {/* <div className="flex-1 flex justify-center">
          <img
            src="https://undraw.co/api/illustrations/undraw_video_files_fu10?color=3b82f6"
            alt="Video Download"
            className="w-72 md:w-96"
          />
        </div> */}
      </div>
    </section>
  )
}
