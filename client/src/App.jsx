import './App.css';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import Api from './serverApi/Api';
import Context from './context/Context';
import { useDispatch } from 'react-redux';
import { setUserDetails } from './store/userSlice';
import { useEffect } from 'react';
import { SocketProvider } from "./context/SocketContext.jsx";


import { useState } from 'react';

function App() {
  const dispatch = useDispatch();
  const [userData, setUserData] = useState(null);

  const fetchUserDetails = async () => {
    const dataResponse = await fetch(Api.profile.url, {
      method: "GET",
      credentials: "include",
    });
    const dataApi = await dataResponse.json();
    if (dataApi.status === "success") {
      dispatch(setUserDetails(dataApi.data));
      setUserData(dataApi.data);
    }
    console.log("User Data", dataApi.data);
  }

  useEffect(() => {
    fetchUserDetails();
  }, []);
  return (
    <Context.Provider value={{fetchUserDetails}}>
      <SocketProvider userData={userData}>
        <Toaster
          position="top-center"
          theme="light"
          richColors
          closeButton
          duration={2000}
          toastOptions={{
            classNames: {
              toast: "rounded-2xl shadow-xl border-none bg-white/90 dark:bg-zinc-900/90 text-black dark:text-white px-6 py-4 flex items-center gap-3 font-semibold text-base",
              description: "text-sm text-zinc-600 dark:text-zinc-300",
              actionButton: "bg-transparent text-blue-500 font-bold hover:underline",
              cancelButton: "bg-transparent text-zinc-400 hover:text-zinc-600",
              icon: "rounded-full bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 text-white p-2 mr-2 shadow-md",
              closeButton: "text-zinc-400 hover:text-zinc-600",
            },
            style: {
              boxShadow: "0 4px 24px 0 rgba(0,0,0,0.12)",
              borderRadius: "18px",
              border: "none",
            },
          }}
        />
        <main>
          <Outlet />
        </main>
      </SocketProvider>
    </Context.Provider>
  )
}

export default App;
