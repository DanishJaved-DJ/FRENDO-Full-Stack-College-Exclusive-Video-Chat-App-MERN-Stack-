import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useSocket } from '../context/SocketContext'
import Api from '../serverApi/Api'

function RequestPopUp({ user }) {
    const [visible, setVisible] = useState(true)
    const [show, setShow] = useState(false)
    const { socket} = useSocket();

    const responseHandler = async (accepted) => {
        if (!socket || !user || !user._id) {
            toast.error('Unable to respond: missing connection or user info');
            return;
        }
        try {
            socket.emit("friend-response", { to: user._id, accepted });
            const fetchData = await fetch(Api.friendResponse.url, {
                method: Api.friendResponse.method,
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ requesterId: user._id, action: accepted ? "accept" : "reject" }),
            });
            
            const data = await fetchData.json();
            console.log("Response from server:", data);
            if (data.status) {
                toast.success(`${accepted ? 'accepted' : 'rejected'}`);
            } else {
                toast.error('Failed to respond to friend request');
            }
        } catch (error) {
            console.error("Error responding to friend request:", error);
            toast.error('An error occurred while responding to friend request');
        }
    }

    useEffect(() => {
        setShow(true)
        const timer = setTimeout(() => setShow(false), 9500)
        const hideTimer = setTimeout(() => setVisible(false), 10000)
        return () => {
            clearTimeout(timer)
            clearTimeout(hideTimer)
        }
    }, [])

    // Always show popup when called
    useEffect(() => {
        setVisible(true)
        setShow(true)
        const timer = setTimeout(() => setShow(false), 9500)
        const hideTimer = setTimeout(() => setVisible(false), 10000)
        return () => {
            clearTimeout(timer)
            clearTimeout(hideTimer)
        }
    }, [user])

    if (!visible) return null

    return (
        <div
            className={`fixed top-6 right-6 z-[9999] transition-transform duration-500 ease-in-out ${
                show ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'
            }`}
            style={{ pointerEvents: 'none' }}
        >
            <div
                className="bg-white border border-gray-200 rounded-xl shadow-xl px-6 py-4 flex flex-col gap-2 w-80"
                style={{
                    pointerEvents: 'auto',
                    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
                }}
            >
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 via-orange-400 to-yellow-400 flex items-center justify-center text-white font-bold text-lg">
                        {user?.username?.[0]?.toUpperCase()}
                    </div>
                    <span className="font-semibold text-gray-900">{user.username}</span>
                </div>
                <div className="text-gray-700 text-sm mb-3">
                    wants to follow you.
                </div>
                <div className="flex gap-2">
                    <button
                        className="flex-1 bg-gradient-to-tr from-pink-500 via-orange-400 to-yellow-400 text-white font-semibold py-2 rounded-lg shadow hover:opacity-90 transition"
                        onClick={() => {
                            responseHandler(true)
                            setVisible(false)
                        }}
                    >
                        Confirm
                    </button>
                    <button
                        className="flex-1 bg-gray-100 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-200 transition"
                        onClick={() => {
                            responseHandler(false)
                            setVisible(false)
                        }}
                    >
                        Decline
                    </button>
                </div>
            </div>
        </div>
    )
}

export default RequestPopUp