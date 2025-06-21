import React, { use } from 'react'
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Context from '../context/Context';
import { useContext } from 'react';

function MatchFind() {
    const [loading, setLoading] = React.useState(true);
    const context = useContext(Context);
     const user = useSelector((state) => state?.user?.user);
    const {socket} = useSocket(user?.data);
    const [matchedUser, setMatchedUser] = React.useState(null);

    React.useEffect(() => {
        if (socket) {
            socket.on("match-found", ({partnerSocket, partnerData}) => {
                setMatchedUser(partnerData);
                setLoading(false);
            });
        }

        return () => {
            if (socket) {
                socket.off("match-found");
            }
        };
    }, [socket]);

    return (
        <div className='bg-gray-900 min-h-screen flex flex-col items-center justify-center'>
            <h1 className='text-yellow-500 text-center text-4xl font-bold py-2'>...Lets go...</h1>
            <div className='flex flex-1 items-center justify-center w-full h-full gap-6'>
                {
                    loading ? (
                        <div className='flex items-center justify-center h-64 w-64'>
                            <div className="animate-spin rounded-full h-32 w-32 border-10 border-yellow-500 border-t-transparent"></div>
                        </div>
                    ) : (
                        matchedUser && (
                            <div className='w-full max-w-3xl
                            h-full bg-gray-900 rounded-lg flex gap-6 justify-center p-6 shadow-lg   '>
                                <img
                                    src={matchedUser.avatar}
                                    alt=""
                                    className='rounded-lg border-3 border-yellow-500 w-90 h-110  object-cover animate-pulse duration-700 '
                                />
                                <div className="flex flex-col justify-center bg-gray-800  rounded-lg p-6 ">
                                    <div className='flex text-lg font-semibold gap-2 mb-2'>
                                        <span className='text-white'>Username:</span>
                                        <span className='text-gray-400'>{matchedUser.username}</span>
                                    </div>
                                    <div className='flex text-lg font-semibold gap-2 mb-2'>
                                        <span className='text-white'>I Speak:</span>
                                        <span className='text-gray-400'>hindi</span>
                                    </div>
                                    <div className='flex text-lg font-semibold gap-2'>
                                        <span className='text-white'>Hobbies:</span>
                                        <span className='text-gray-400'>football</span>
                                    </div>
                                </div>
                            </div>
                        )
                    )
                }
            </div>
               {
                matchedUser && (
                     <div className='flex gap-4 mt-6'>
                    <button className='bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-300' onClick={handleAccept}>Accept</button>
                    <button className='bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-300' onClick={handleDecline}>Next</button>
                </div>
                )
               }
            <Link
                to="/home"
                className='bg-yellow-500 mb-4 text-white px-8 py-3 rounded-lg mt-8 cursor-pointer hover:bg-red-500 transition-colors duration-300 font-semibold shadow-md'
            >
                STOP
            </Link>
        </div>
    )
}

function MatchFind() { 
    return <div>MatchFind Component</div>
}
export default MatchFind
