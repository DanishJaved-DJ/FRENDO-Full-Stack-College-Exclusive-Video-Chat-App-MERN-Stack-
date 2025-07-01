import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link ,useNavigate } from 'react-router-dom';
import  Api  from '../serverApi/Api.jsx';
import { Toaster, toast } from 'sonner';

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    collegeName: '',
    collegeIdProof: null,
  });

  // Handle file input for collegeIdProof
  const handleFile = (e) => {
    const file = e.target.files[0];
    setForm((prev) => ({
      ...prev,
      collegeIdProof: file,
    }));
  };

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
setIsSigningUp(true);
  if (form.password !== form.confirmPassword) {
    toast.error("Password and confirm password do not match.");
    setIsSigningUp(false);
    return;
  }

  console.log("Signup data", form);

  try {
    const formData = new FormData();
    formData.append('username', form.username);
    formData.append('email', form.email);
    formData.append('password', form.password);
    formData.append('confirmPassword', form.confirmPassword);
    formData.append('collegeName', form.collegeName);
    formData.append('collegeIdProof', form.collegeIdProof);

    const res = await fetch(Api.Signup.url, {
      method: Api.Signup.method,
      credentials: 'include',
      body: formData, 
    });

    const response = await res.json();

    if (response.status === 'success') {
      toast.success('Signup successful');
      navigate('/login');
    } else {
      toast.error(response.message || 'Signup failed');
    }

  } catch (err) {
    toast.error('Something went wrong');
    console.error('Signup error:', err);
  }
};

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-tr from-yellow-100 via-pink-200 to-purple-200 px-4">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-lg flex flex-col items-center p-8">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-2 font-sans tracking-tight">Sign up</h2>
        <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 bg-gray-50 text-gray-900 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-pink-400 font-sans text-sm"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 bg-gray-50 text-gray-900 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-pink-400 font-sans text-sm"
          />
          <input
            type="text"
            name="collegeName"
            placeholder="College Name"
            value={form.collegeName}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 bg-gray-50 text-gray-900 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-pink-400 font-sans text-sm"
          />
          <div className="w-full relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 bg-gray-50 text-gray-900 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-pink-400 font-sans text-sm pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-pink-500 focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>
          <div className="w-full relative">
            <input
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 bg-gray-50 text-gray-900 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-pink-400 font-sans text-sm pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((prev) => !prev)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-pink-500 focus:outline-none"
              tabIndex={-1}
            >
              {showConfirm ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>
          <div className="w-full">
            <label className="block text-left text-gray-500 mb-1 text-xs font-medium">Upload college ID</label>
            <input
              type="file"
              name="collegeIdProof"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleChange}
              required
              className="w-full border border-gray-300 bg-gray-50 text-gray-900 px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-pink-400 font-sans text-xs"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 text-white font-bold py-2 rounded mt-2 hover:opacity-90 transition duration-200 text-base"
          >
            {isSigningUp ? "Signing up..." : "Sign Up"}
          </button>
        </form>
        <div className="mt-6 w-full border-t border-gray-200 pt-4 text-center">
          <p className="text-gray-700 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-pink-500 font-semibold hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;