import React from 'react'
import { Link } from 'react-router-dom';

function Pilot() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 px-4">
            <div className="text-center w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-white/80 rounded-3xl shadow-2xl p-8 backdrop-blur-md">
                <div className="flex flex-row items-center justify-center gap-2 sm:gap-3">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-gray-900 font-extrabold drop-shadow-lg">
                        Welcome to&nbsp;
                        <span className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent font-extrabold drop-shadow-lg">
                            FRENDO
                        </span>
                    </h1>
                </div>
                <p className="text-base md:text-lg lg:text-xl text-gray-700 mt-2 font-medium italic">
                    "Where strangers become friends"
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-7">
                    <Link to="/login" className="w-full sm:w-auto">
                        <button className="w-full sm:w-auto bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition transform duration-200 text-base md:text-lg">
                            Log In
                        </button>
                    </Link>
                    <Link to="/signup" className="w-full sm:w-auto">
                        <button className="w-full sm:w-auto border-2 border-pink-400 text-pink-600 px-6 py-3 rounded-full font-bold shadow-lg hover:bg-pink-50 hover:scale-105 transition transform duration-200 text-base md:text-lg">
                            Sign Up
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Pilot;