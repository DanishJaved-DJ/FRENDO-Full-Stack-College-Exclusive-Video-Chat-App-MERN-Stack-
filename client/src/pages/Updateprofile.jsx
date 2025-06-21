import React from 'react'
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Api from '../serverApi/Api.jsx';
import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import  { useContext} from 'react'
import Context from '../context/Context.jsx';

function UpdateProfile() {
  const [profileDetails, setProfileDetails] = useState({
    username: '',
    dob: '',
    regNo: '',
    gender: '',
    hobbies: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { fetchUserDetails } = useContext(Context);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileDetails((prev) => ({
      ...prev,
      [name]: value
    })); 
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(Api.updateProfile.url, {
        method: Api.updateProfile.method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileDetails),
      });

      const dataResponse = await response.json();
      if (dataResponse.status === 'success') {
        fetchUserDetails();
        toast.success('Profile updated successfully');
        navigate('/profile'); 
      } else {
        toast.error('Failed to update profile: ' + dataResponse.message);
      }
    } catch (error) {
      toast.error('An error occurred while updating the profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]">
      <Link
        className="fixed top-5 left-0 px-4 py-2 rounded-r-full text-lg font-semibold bg-white/80 text-[#ee2a7b] hover:bg-white hover:text-[#6228d7] shadow"
        to="/home"
      >
        Back
      </Link>
      <div className="bg-white/90 rounded-2xl shadow-2xl px-10 py-8 w-full max-w-md flex flex-col items-center">
        <h1 className="text-4xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] tracking-tight">
          Update Profile
        </h1>
        <form className="w-full space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-xs font-bold mb-2 text-[#6228d7] uppercase tracking-widest">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={profileDetails.username}
              onChange={handleChange} 
              className="w-full p-3 rounded-lg border border-gray-200 focus:border-[#ee2a7b] focus:ring-2 focus:ring-[#ee2a7b]/30 bg-white text-gray-900 placeholder-gray-400 transition"
              placeholder="Enter your username"
              autoComplete="off"
            />
          </div>
          <div>
            <label htmlFor="dob" className="block text-xs font-bold mb-2 text-[#6228d7] uppercase tracking-widest">Date of Birth</label>
            <input
              type="date"
              id="dob"
              name="dob"
              value={profileDetails.dob}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-gray-200 focus:border-[#ee2a7b] focus:ring-2 focus:ring-[#ee2a7b]/30 bg-white text-gray-900 transition"
            />
          </div>
          <div>
            <label htmlFor="regNo" className="block text-xs font-bold mb-2 text-[#6228d7] uppercase tracking-widest">Registration Number</label>
            <input
              type="text"
              id="regNo"
              name="regNo"
              value={profileDetails.regNo}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-gray-200 focus:border-[#ee2a7b] focus:ring-2 focus:ring-[#ee2a7b]/30 bg-white text-gray-900 placeholder-gray-400 transition"
              placeholder="Enter your registration number"
              autoComplete="off"
            />
          </div>
          <div>
            <label htmlFor="gender" className="block text-xs font-bold mb-2 text-[#6228d7] uppercase tracking-widest">Gender</label>
            <select
              id="gender"
              name="gender"
              value={profileDetails.gender}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-gray-200 focus:border-[#ee2a7b] focus:ring-2 focus:ring-[#ee2a7b]/30 bg-white text-gray-900 transition"
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="hobbies" className="block text-xs font-bold mb-2 text-[#6228d7] uppercase tracking-widest">Hobbies</label>
            <input
              type="text"
              id="hobbies"
              name="hobbies"
              value={profileDetails.hobbies}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-gray-200 focus:border-[#ee2a7b] focus:ring-2 focus:ring-[#ee2a7b]/30 bg-white text-gray-900 placeholder-gray-400 transition"
              placeholder="Enter your hobbies (space separated)"
              autoComplete="off"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-xs font-bold mb-2 text-[#6228d7] uppercase tracking-widest">Description</label>
            <textarea
              id="description"
              name="description"
              value={profileDetails.description}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-gray-200 focus:border-[#ee2a7b] focus:ring-2 focus:ring-[#ee2a7b]/30 bg-white text-gray-900 placeholder-gray-400 transition"
              placeholder="Tell us about yourself"
              rows={3}
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-full bg-gradient-to-r from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white font-bold text-lg shadow-lg hover:scale-105 transition disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default UpdateProfile;