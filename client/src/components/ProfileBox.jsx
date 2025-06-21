import React from 'react'
import { Link } from 'react-router-dom';
import Api from '../serverApi/Api.jsx';
import { Toaster, toast } from 'sonner';
import { useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import Context from '../context/Context.jsx';
import { setUserDetails } from '../store/userSlice.jsx';
import { useNavigate } from 'react-router-dom';

function ProfileBox() {
  const context = useContext(Context);
  const user = useSelector((state) => state?.user?.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const fetchdata = await fetch(Api.logout.url, {
      method: Api.logout.method,
      Credentials: 'include',
    });
    const dataResponse = await fetchdata.json();
    if (dataResponse.success) {
      toast.success(dataResponse.message);
      dispatch(setUserDetails(null));
    } else {
      navigate('/login');
      dispatch(setUserDetails(null));
      toast.error(dataResponse.message);
    }
  }

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 w-72 border border-gray-200">
      <div className="flex flex-col items-center gap-6"></div>
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 p-1">
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
            {/* Placeholder for profile image */}
            <span className="text-4xl text-gray-400">👤</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 w-full">
          <Link
            to="/profile"
            className="text-gray-900 text-lg font-semibold hover:bg-gray-100 rounded-md px-4 py-2 transition"
          >
            Profile
          </Link>
          <Link
            to="/update-profile"
            className="text-gray-900 text-lg font-semibold hover:bg-gray-100 rounded-md px-4 py-2 transition"
          >
            Update Profile
          </Link>
          <button
            onClick={handleLogout}
            className="text-red-500 text-lg font-semibold hover:bg-red-50 rounded-md px-4 py-2 transition text-left"
          >
            Logout
          </button>
        </div>
      </div>
    
  )
}

export default ProfileBox;