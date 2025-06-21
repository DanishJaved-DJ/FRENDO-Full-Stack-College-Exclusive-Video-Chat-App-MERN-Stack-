import React from 'react'

function Boxform() {
  return (
    <div className="bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 shadow-lg rounded-2xl p-0.5 max-w-md mx-auto">
      <div className="bg-white bg-opacity-80 rounded-xl p-6 shadow-md">
        <form className="flex flex-col gap-5">
          <input
            type="text"
            placeholder="College"
            className="bg-gray-100 focus:bg-white focus:ring-2 focus:ring-pink-400 text-gray-800 p-3 rounded-lg text-center font-semibold transition"
          />
          <input
            type="text"
            placeholder="I Speak"
            className="bg-gray-100 focus:bg-white focus:ring-2 focus:ring-pink-400 text-gray-800 p-3 rounded-lg text-center font-semibold transition"
          />
          <input
            type="text"
            placeholder="My Topics"
            className="bg-gray-100 focus:bg-white focus:ring-2 focus:ring-pink-400 text-gray-800 p-3 rounded-lg h-24 text-center font-semibold transition"
          />
        </form>
      </div>
    </div>
  )
}

export default Boxform