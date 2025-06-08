import React from 'react'

const Tools = () => {
  return (
    <div id="tools">
        <section className="bg-gray-50 py-16">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-12">
      <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
    Our Tools</h2>
      <p className="mt-4 text-lg text-gray-600">
        Empowering farmers with intelligent tools that not only predict — but protect.
      </p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
      <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
        <div className="text-green-600 mb-4">
          🌾
        </div>
        <h3 className="text-xl font-semibold text-gray-900">
            <a href="/crop-selector">Crop Selector</a>
            </h3>
        <p className="mt-2 text-gray-600">
        Get tailored crop suggestions for your soil and climate.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
        <div className="text-green-600 mb-4">
          📡
        </div>
        <h3 className="text-xl font-semibold text-gray-900">
            <a href="risk-management">Risk Management</a>
            </h3>
        <p className="mt-2 text-gray-600">
          Hyperlocal and accurate weather predictions tailored to your farm's location to reduce risk and losses.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
        <div className="text-green-600 mb-4">
          🐛
        </div>
        <h3 className="text-xl font-semibold text-gray-900">
            <a href="disease-detection">Disease Detection</a>
            </h3>
        <p className="mt-2 text-gray-600">
        Identify crop diseases early using AI.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
        <div className="text-green-600 mb-4">
          📡
        </div>
        <h3 className="text-xl font-semibold text-gray-900">
            <a href="/weather-forecasting">Weather Forecasting</a>
            </h3>
        <p className="mt-2 text-gray-600">
          Hyperlocal and accurate weather predictions tailored to your farm's location to reduce risk and losses.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
        <div className="text-green-600 mb-4">
          🔔
        </div>
        <h3 className="text-xl font-semibold text-gray-900">Smart Alerts & Automations</h3>
        <p className="mt-2 text-gray-600">
          Receive real-time alerts and automate tasks like pest deterrence based on sensor data.
        </p>
      </div>
    </div>
  </div>
</section>
    </div>
  )
}

export default Tools
