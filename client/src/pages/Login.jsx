import React, { useState, useContext } from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { Link, useNavigate } from 'react-router-dom';
import Api from '../serverApi/Api.jsx';
import { Toaster, toast } from 'sonner';
import Context from '../context/Context.jsx';

function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLogging , setIsLogging] = useState(false);
    const [data, setData] = useState({
        email: "",
        password: ""
    });
    const navigate = useNavigate();
    const generalContext = useContext(Context);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({
            ...prev,
            [name]: value
        })); 
    }

    const handleSubmit =  async (e) => {
        e.preventDefault();
        setIsLogging(true);
        const dataResponse = await fetch(Api.login.url, {
            method: Api.login.method,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const response = await dataResponse.json();
        if (response.status === "success") {
            toast.success("Login successful");
            navigate('/home');
            setIsLogging(false);
            generalContext.fetchUserDetails();
        } else {
            toast.error(response.message);
            setIsLogging(false);
        }
    } 

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] px-4">
            <div className="w-full max-w-sm bg-white/90 border border-gray-200 rounded-2xl shadow-2xl flex flex-col items-center py-10 px-8 backdrop-blur-md">
                <h1 className="text-5xl font-logo text-transparent bg-clip-text bg-gradient-to-r from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] mb-8 tracking-wider select-none drop-shadow font-bold">
                    Frendo
                </h1>
                <form className="flex flex-col gap-5 w-full" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Email"
                        className="w-full border border-gray-300 bg-white/80 text-gray-900 px-4 py-3 rounded-lg focus:outline-none focus:border-[#ee2a7b] text-base transition"
                        name='email'
                        value={data.email}
                        onChange={handleChange}
                        autoComplete="username"
                    />
                    <div className="w-full relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            className="w-full border border-gray-300 bg-white/80 text-gray-900 px-4 py-3 rounded-lg pr-10 focus:outline-none focus:border-[#ee2a7b] text-base transition"
                            name='password'
                            value={data.password}
                            onChange={handleChange}
                            autoComplete="current-password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#ee2a7b] transition"
                            tabIndex={-1}
                        >
                            {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                        </button>
                    </div>
                    <div className="w-full flex justify-end">
                        <Link
                            to="/forgot-password"
                            className="text-[#ee2a7b] text-xs hover:underline font-medium"
                        >
                            Forgot password?
                        </Link>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white font-bold py-2.5 rounded-lg mt-2 shadow-md hover:opacity-90 transition"
                    >
                        {isLogging ? "Logging in..." : "Login"}
                    </button>
                </form>
                <div className="w-full border-t border-gray-200 my-7"></div>
                <div>
                    <p className="text-gray-700 text-base">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-[#ee2a7b] font-semibold hover:underline">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
            <Toaster position="top-center" richColors />
        </div>
    )
}

export default Login;
