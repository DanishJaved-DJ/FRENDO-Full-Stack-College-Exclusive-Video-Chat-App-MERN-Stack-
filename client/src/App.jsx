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
          position="top-right"
          theme="light" // or "dark" — can also follow system theme
          richColors // adds colorful variants to success/error/info
          closeButton // show a close icon
          duration={4000} // time before auto-dismiss (ms)
          offset={16} // spacing from edge
          toastOptions={{
            classNames: {
              toast: "rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800",
              description: "text-sm text-muted-foreground",
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
