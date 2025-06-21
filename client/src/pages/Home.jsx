import React from 'react'
import Header from '../components/Header'
import { RiCameraAiLine } from "react-icons/ri";
import { MdInsertPhoto } from "react-icons/md";
import { IoColorFilterOutline } from "react-icons/io5";
import { MdOutlineBugReport } from "react-icons/md";
import Boxform from '../components/Boxform';
import  { useState } from 'react';
import { MdOutlineExpandMore } from "react-icons/md";

import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import Context from '../context/Context';
import { setUserDetails } from '../store/userSlice';
import { useContext } from 'react';
import { toast } from 'sonner';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import FriendList from '../components/FriendList';

function Home() {
  
   const [showBox, setShowBox] = useState(false);
   const [showAvatar,setShowAvatar] = useState("");

   const context = useContext(Context);
   const user = useSelector((state) => state?.user?.user);
 
  React.useEffect(() => {
  setShowAvatar(user?.avatarUrl);
  }, [user]);
  const { socket } = useSocket();
  const handleStart = () => socket?.emit("join-queue");
  
  const dispatch = useDispatch();
  return (
  <div className="min-h-screen bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] font-sans relative">
  <aside>
   <div className='w-full min-h-screen relative'>
  {/* Header component */}
  <div>
  <Header/>
  </div>

  {/* Main content */}
  <div className='relative'>
    <div className='w-60 h-60 bg-gradient-to-tr bg-white rounded-lg shadow-xl m-auto absolute flex flex-col justify-end   top-10  rounded-b-4xl left-1/12  -translate-x-1/2'>
    {showAvatar ? (
    <img
    src={showAvatar}
    alt="Avatar"
    className="w-60 h-60 object-cover rounded-b-4xl shadow-xl m-auto absolute flex flex-col justify-end z-10 border-4 border-white"
    />
    ) : null}
    <Link
    to={'change-photo'}
    className='flex bg-white/60 p-1 justify-center items-center h-12 rounded-b-4xl gap-2 cursor-pointer z-20 hover:bg-white transition duration-300 absolute bottom-0 left-0 right-0'
    >
    <RiCameraAiLine className='text-[#ee2a7b] text-2xl' />
    <p className='text-[#ee2a7b] text-center font-semibold'>Change Photo</p>
    </Link>
    </div>
  </div>

  <div className='mt-10 absolute inset-x-0 top-1/2 transform -translate-y-1/2 text-center text-white gap-y-2-2 drop-shadow-lg'>
    <h1 className='text-8xl font-extrabold tracking-tight font-[cursive] bg-gradient-to-r text-white bg-clip-text '>FRENDO</h1>
    <p className='text-2xl font-medium'>meet new friends</p>
  </div>

  <div>
    <div className='absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-row items-center gap-8'>
    <IoColorFilterOutline className='text-white text-5xl hover:scale-110 transition duration-300 drop-shadow-lg' />

    <Link to={'/match-find'} className='bg-gradient-to-r from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white font-bold py-4 px-32 text-xl rounded-full shadow-lg hover:scale-105 transition duration-300 border-2 border-white'
    onClick={() => {
    if (!user) {
      toast.error("Please login to start matching!");
      return;
    }
    handleStart();
    }}
    >
    Start
    </Link>

    <MdOutlineBugReport className='text-red-500 text-5xl opacity-55 hover:scale-110 transition duration-300 drop-shadow-lg' />
    </div>
  </div>

  <div className="absolute transform top-1/2">
    {/* 3-Dot Button for sm and md */}
  <button
  className="block lg:hidden p-2 text-white bg-gradient-to-tr from-[#fdc468] to-[#df4996] rounded-full shadow-md hover:scale-110 transition duration-300"
  onClick={() => setShowBox(prev => !prev)}
  >
  < MdOutlineExpandMore size={50} />
  </button>

  {/* The Box component (always visible on lg+, toggle on sm/md) */}
  <div
  className={`${
    showBox ? 'block' : 'hidden'
  } lg:block rounded-2xl shadow-2xl absolute top-full mt-2 z-10 w-72 bg-white/90 backdrop-blur-md border border-[#ee2a7b]`}
  >
  <Boxform />
  </div>
  <div>
        
  </div>
  </div>
   </div>
  </aside>

  {/* FriendList box at the right side */}
  <div className="hidden lg:block fixed top-3 right-0 h-[80%] w-80 p-4 z-30">
    <div className="h-full bg-white/90 rounded-l-2xl shadow-2xl border-l border-[#ee2a7b] flex flex-col">
    <div className="flex-1 overflow-y-auto px-2 pb-4">
      <FriendList />
    </div>
    </div>
  </div>

  <main>
  <Outlet/>
  </main>
  </div> 
  )
}

export default Home
