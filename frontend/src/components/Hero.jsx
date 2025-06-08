import React from 'react'

const Hero = () => {
  return (
<div className="relative py-12 sm:py-16 lg:pt-20 xl:pb-0">
  <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-3xl text-center">
      <h1 className="mt-5 text-3xl font-light leading-tight text-gray-900 sm:text-5xl sm:leading-tight lg:text-6xl lg:leading-tight">
        Increase <br className="sm:hidden" />
        Awareness with
        <span className="relative inline-flex justify-center whitespace-nowrap font-bold">
          Krishi AI
        </span>
      </h1>
      <p className="mt-4 text-lg text-gray-700 max-w-2xl mx-auto">
        Not only predicts, but protects your crops and livelihood through smart, real-time farming technology.
      </p>
    </div>

    <div className="mt-16 mb-16 flex flex-col items-center justify-center divide-y divide-gray-300 sm:flex-row sm:divide-x sm:divide-y-0 md:mt-20">
      <div className="flex max-w-xs flex-col space-y-2 px-4 py-4">
        <h3 className="text-lg font-semibold text-gray-900">Smart Farming Solutions</h3>
        <p className="text-gray-600">
          Harness IoT and data analytics to optimize crop yields, reduce waste, and ensure sustainable farming practices.
        </p>
      </div>
      <div className="flex max-w-xs flex-col space-y-2 px-4 py-4">
        <h3 className="text-lg font-semibold text-gray-900">Real-Time Crop Monitoring & Protection</h3>
        <p className="text-gray-600">
          Monitor soil health, moisture, and pests in real-time, and receive alerts to protect your crops before issues arise.
        </p>
      </div>
      <div className="flex max-w-xs flex-col space-y-2 px-4 py-4">
        <h3 className="text-lg font-semibold text-gray-900">Sustainability & Impact</h3>
        <p className="text-gray-600">
          Empower farmers with eco-friendly technologies that increase productivity while preserving the environment.
        </p>
      </div>
    </div>
  </div>
</div>

  )
}

export default Hero
