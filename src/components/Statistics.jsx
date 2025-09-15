import React, { useState, useEffect } from 'react';
import { FaDownload, FaUsers, FaGlobe, FaClock } from 'react-icons/fa';

export default function Statistics() {
  const [counters, setCounters] = useState({
    downloads: 0,
    users: 0,
    platforms: 0,
    uptime: 0
  });

  const finalStats = {
    downloads: 2847392,
    users: 156789,
    platforms: 15,
    uptime: 99.9
  };

  useEffect(() => {
    const duration = 2000; // 2 seconds animation
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      setCounters({
        downloads: Math.floor(finalStats.downloads * progress),
        users: Math.floor(finalStats.users * progress),
        platforms: Math.floor(finalStats.platforms * progress),
        uptime: Math.floor(finalStats.uptime * progress * 10) / 10
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setCounters(finalStats);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K';
    }
    return num.toLocaleString();
  };

  const stats = [
    {
      icon: <FaDownload size={24} />,
      value: formatNumber(counters.downloads),
      label: 'Videos Downloaded',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20'
    },
    {
      icon: <FaUsers size={24} />,
      value: formatNumber(counters.users),
      label: 'Happy Users',
      color: 'text-green-400',
      bgColor: 'bg-green-500/20'
    },
    {
      icon: <FaGlobe size={24} />,
      value: counters.platforms,
      label: 'Supported Platforms',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20'
    },
    {
      icon: <FaClock size={24} />,
      value: counters.uptime + '%',
      label: 'Uptime',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20'
    }
  ];

  return (
    <section className="bg-gray-900 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Trusted by Millions Worldwide
          </h2>
          <p className="text-gray-300 text-lg">
            Join the community that's already downloading their favorite content
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-gray-800 rounded-xl p-6 text-center border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:transform hover:scale-105"
            >
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${stat.bgColor} mb-4`}>
                <span className={stat.color}>{stat.icon}</span>
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                {stat.value}
              </div>
              <div className="text-gray-400 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 text-center">
          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span>Server Status: Online</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>SSL Secured</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span>GDPR Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
