import React from 'react'

const Footer = () => {
  return (
    <div>
      <footer className="bg-green-700 text-gray-300 py-10">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex flex-col md:flex-row md:justify-between md:items-start space-y-8 md:space-y-0">
      
      <div className="md:w-1/3">
        <h3 className="text-xl font-bold text-white mb-4">Agri Sense</h3>
        <p className="text-sm leading-relaxed">
          Empowering farmers with AI-driven insights for healthier crops and better yields. Not only predicting but protecting your farm.
        </p>
      </div>


      <div className="md:w-1/3">
        <h4 className="text-lg font-bold text-white mb-4">Quick Links</h4>
        <ul className="space-y-2 text-sm">
          <li><a href="#hero" className="hover:text-green-400 transition">Home</a></li>
          <li><a href="#tools" className="hover:text-green-400 transition">Tools</a></li>
          <li><a href="#krishi-chat" className="hover:text-green-400 transition">Krishi Chat</a></li>
          <li><a href="/contact" className="hover:text-green-400 transition">Contact</a></li>
        </ul>
      </div>


    </div>

    <div className="mt-10 border-t border-gray-700 pt-6 text-center text-xs text-gray-700 font-bold">
      &copy; 2025 Agri Sense. All rights reserved.
    </div>
  </div>
</footer>

    </div>
  )
}

export default Footer
