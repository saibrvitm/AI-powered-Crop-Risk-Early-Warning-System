import React from 'react'

const ChatHero = () => {
  return (
    <div id="krishi-chat">
      <section className="relative bg-green-50 py-20">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <h1 className="text-4xl font-extrabold text-green-900 sm:text-5xl lg:text-6xl">
      Meet <span className="text-green-700">Krish</span><br />
      Your AI-powered farming assistant
    </h1>
    <p className="mt-6 max-w-3xl mx-auto text-lg text-green-800">
      Get instant expert advice on weather, crop health, pest control, and more — all at your fingertips.
    </p>
    <div className="mt-10">
      <a href="/krishi-chat" className="inline-block bg-green-700 text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-green-800 transition">
        Start Chatting
      </a>
    </div>
  </div>
</section>

    </div>
  )
}

export default ChatHero
