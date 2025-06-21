import React, { useState } from 'react'
import { FaMedal } from "react-icons/fa6";
import { CgProfile } from "react-icons/cg";
import { BsFilterLeft, BsFilterRight } from "react-icons/bs";
import ProfileBox from './ProfileBox';
import { useContext } from 'react';
import Context from '../context/Context';
import { useSelector } from 'react-redux';
import { useSocket } from '../context/SocketContext';

function Header() {
    const [filterLeft, setFilterLeft] = useState(true);
    const [showProfile, setShowProfile] = useState(false);
    const context = useContext(Context);
    const user = useSelector((state) => state?.user?.user);
    const { activeUsers } = useSocket();

    return (
        <div className='w-full bg-white border-b border-gray-200 shadow-sm fixed top-0 left-0 z-50'>
            <div className='flex justify-between items-center h-10 px-6'>
                {/* Left: Logo/Medal */}
                <div className='flex items-center gap-2'>
                    <FaMedal className='text-pink-500 text-3xl' />
                    <p className='text-gray-900 font-bold text-lg'>0</p>
                </div>
              <div className='flex justify-between items-center gap-6'>
                 {/* Center: Active Users */}
                <div className='flex items-center gap-6'>
                    <div className='flex gap-2 items-center'>
                        <p className='text-gray-700 font-semibold text-base'>Active Users</p>
                        <span className='bg-green-100 text-green-600 rounded-full px-3 py-1 text-sm font-bold'>{activeUsers}</span>
                    </div>
                    <span onClick={() => setFilterLeft(f => !f)} className="cursor-pointer">
                        {filterLeft ? (
                            <BsFilterLeft className='text-gray-700 text-2xl' />
                        ) : (
                            <BsFilterRight className='text-gray-700 text-2xl' />
                        )}
                    </span>
                </div>

                {/* Right: Profile */}
                <div className='flex items-center gap-4 border-l-2 border-gray-600  pl-4'>
                    <div className="relative">
                        <CgProfile
                            className='text-gray-700 text-3xl cursor-pointer hover:text-pink-500 transition'
                            onClick={() => setShowProfile(prev => !prev)}
                        />
                        {showProfile && (
                            <div className="absolute top-12 right-0 z-10">
                                <ProfileBox />
                            </div>
                        )}
                    </div>
                </div>
              </div>
               
            </div>
        </div>
    )
}

export default Header;