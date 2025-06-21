  import {createBrowserRouter} from 'react-router-dom';
  import App from '../App.jsx';
  import Pilot from '../pages/Pilot.jsx';
import Login from '../pages/Login.jsx';
import Signup from '../pages/Signup.jsx';
import ForgotPassword from '../pages/ForgotPassword.jsx';
import Home from '../pages/Home.jsx';
import ViewProfile from '../pages/ViewProfile.jsx';
import {PhotoUploader} from '../pages/PhotoUploader.jsx';
import UpdateProfile from '../pages/Updateprofile.jsx';
import MatchFind from '../pages/MatchFind.jsx';
import Chatting from '../pages/Chatting.jsx';


  const router = createBrowserRouter([
    {
      path: '/',
      element: <App/>,
      children:[
        {
            path: "",
            element: <Pilot/>
        },
        {
          path: "login",
          element: <Login/>
        },
        {
          path: "signup",
          element: <Signup/>
        },
        {
          path: "forgot-password",
          element: <ForgotPassword/>
        },
        {
          path: "home",
          element: <Home/>,
          children : [
            {
              path : "change-photo",
              element  : <PhotoUploader/>
            }
          ]
        },{
          path: "profile",
          element: <ViewProfile/>
      },
         {
          path: "update-profile",
          element: <UpdateProfile/>
         },{
          path: "match-find",
          element: <MatchFind/>
         },{
          path: "chatting",
          element: <Chatting/>
         }
      ]
    },
  ]);
    
  export default router;