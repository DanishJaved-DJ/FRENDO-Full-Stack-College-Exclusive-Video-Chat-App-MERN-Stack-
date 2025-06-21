import React from 'react'
import { useContext } from 'react';
import Context from '../context/Context';
import { useSelector } from 'react-redux';

function ViewFriendProfile({ user }) {
    
  return (
      <div className="max-w-sm mx-auto bg-white rounded-xl shadow-md overflow-hidden mt-6">
            <div className="flex flex-col items-center p-6">
                <img
                    className="h-24 w-24 rounded-full object-cover border-4 border-pink-500"
                    src={user.avatarUrl || 'https://ui-avatars.com/api/?name=User'}
                    alt={user.username}
                />
                <h2 className="mt-4 font-bold text-2xl text-pink-500  ">{user.username}</h2>
                <p className="text-gray-500 text-sm">{user.collegeName}</p>
                <p className="text-gray-500 text-sm">email: {user.email}</p>
                <div className="mt-4 w-full">
                    <h3 className="text-md font-semibold text-gray-700 mb-1">Hobbies</h3>
                    <div className="flex flex-wrap gap-2">
                        {user.hobbies && user.hobbies.length > 0 ? (
                            user.hobbies.map((hobby, idx) => (
                                <span
                                    key={idx}
                                    className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-xs"
                                >
                                    {hobby}
                                </span>
                            ))
                        ) : (
                            <span className="text-gray-400 text-xs">No hobbies listed</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
  )
}

    


export default ViewFriendProfile