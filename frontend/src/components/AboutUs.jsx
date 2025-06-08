import React from 'react';
import { FaLeaf, FaTemperatureHigh, FaCloudRain, FaChartLine, FaMobileAlt, FaUserFriends } from 'react-icons/fa';

const AboutUs = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-blue-800 mb-4">About Krishi AI</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Empowering farmers with AI-driven insights for smarter agricultural decisions
        </p>
      </div>

      {/* Mission Statement */}
      <div className="bg-blue-50 rounded-xl p-8 mb-16">
        <h2 className="text-2xl font-semibold text-blue-800 mb-4">Our Mission</h2>
        <p className="text-gray-700 leading-relaxed">
          At Krishi AI, we're committed to revolutionizing agriculture through technology. 
          Our platform combines artificial intelligence, machine learning, and real-time data 
          to provide farmers with the tools they need to make informed decisions, increase 
          crop yields, and reduce losses due to diseases and adverse weather conditions.
        </p>
      </div>

      {/* Key Features Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold text-blue-800 mb-8 text-center">How We Help Farmers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Disease Detection */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-blue-600 mb-4">
              <FaLeaf className="text-3xl" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Smart Disease Detection</h3>
            <p className="text-gray-600">
              Instantly identify plant diseases using our AI-powered image recognition system. 
              Get accurate diagnoses for multiple crops including tomatoes, potatoes, and peppers, 
              helping you take timely action to protect your crops.
            </p>
          </div>

          {/* Weather Forecasting */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-blue-600 mb-4">
              <FaTemperatureHigh className="text-3xl" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Precise Weather Forecasting</h3>
            <p className="text-gray-600">
              Access hyper-local weather data with our interactive map system. Get detailed 
              temperature and rainfall predictions for your exact location, helping you plan 
              irrigation and protect crops from adverse weather.
            </p>
          </div>

          {/* Crop Selection */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-blue-600 mb-4">
              <FaChartLine className="text-3xl" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Intelligent Crop Selection</h3>
            <p className="text-gray-600">
              Make data-driven decisions about which crops to plant. Our system analyzes soil 
              conditions, weather patterns, and historical data to recommend the most suitable 
              crops for your land.
            </p>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold text-blue-800 mb-8 text-center">Benefits for Farmers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-800">Increased Efficiency</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Quick disease detection saves time and resources
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Automated weather monitoring reduces manual checks
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Data-driven decisions improve crop planning
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-800">Better Yields</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Early disease detection prevents crop loss
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Optimal crop selection for your conditions
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Weather-based planning improves harvest quality
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Technology Section */}
      <div className="bg-gray-50 rounded-xl p-8 mb-16">
        <h2 className="text-2xl font-semibold text-blue-800 mb-6">Our Technology</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">AI-Powered Solutions</h3>
            <p className="text-gray-700 mb-4">
              We leverage cutting-edge artificial intelligence and machine learning to provide 
              accurate predictions and analyses. Our systems continuously learn and improve 
              to serve you better.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li>• Advanced image recognition for disease detection</li>
              <li>• Machine learning for crop recommendations</li>
              <li>• Real-time weather data processing</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">User-Friendly Interface</h3>
            <p className="text-gray-700 mb-4">
              Designed with farmers in mind, our platform is intuitive and easy to use. 
              Access powerful tools through a simple, clean interface.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li>• Interactive map-based location selection</li>
              <li>• Clear, visual data presentation</li>
              <li>• Mobile-responsive design</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-blue-800 mb-4">Ready to Transform Your Farming?</h2>
        <p className="text-gray-600 mb-6">
          Join the growing community of farmers using Krishi AI to make smarter agricultural decisions.
        </p>
        <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
          Get Started Now
        </button>
      </div>
    </div>
  );
};

export default AboutUs; 