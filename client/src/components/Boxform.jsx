import React from 'react'
import { useContext } from 'react'
import Context from '../context/Context.jsx';
import { useSelector } from 'react-redux';

function Boxform() {
  const context = useContext(Context);
  const user = useSelector((state) => state?.user?.user);

  return (
    <div className="bg-gradient-to-tr from-pink-100 via-white to-blue-100 shadow-2xl rounded-3xl p-4 max-w-md mx-auto border-4 border-white/70">
      {user ? (
        <div className="w-full text-center">
          <h1 className="text-2xl font-bold text-[#6228d7]">{user.username?.toUpperCase()}</h1>
          <div className="flex flex-col items-center mb-6">
          </div>
          <div className="bg-white/80 rounded-xl p-8 shadow space-y-3 text-left">
            <div>
              <span className="font-semibold text-[#6228d7]">College Name:</span>
              <span className="ml-2 text-gray-700">{user.collegeName || 'N/A'}</span>
            </div>
            <div>
              <span className="font-semibold text-[#6228d7]">Hobbies:</span>
              <span className="ml-2 text-gray-700">
                {user.hobbies && user.hobbies.length > 0 ? (
                  <div className="flex flex-col gap-1 mt-2">
                    {user.hobbies.map((hobby, idx) => (
                      <div key={idx} className="bg-blue-100 rounded px-2 py-1  font-semibold uppercase text-[#d75c28] w-fit">
                        {hobby}
                      </div>
                    ))}
                  </div>
                ) : 'N/A'}
              </span>
            </div>
            <div>
              <span className="font-semibold text-[#6228d7]">Description:</span>
              <span className="ml-2 text-gray-700">{user.description || 'N/A'}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          <span className="text-4xl mb-2 block">🙍‍♂️</span>
          <p className="font-semibold">No user details available.</p>
        </div>
      )}
    </div>
  )
}

export default Boxform