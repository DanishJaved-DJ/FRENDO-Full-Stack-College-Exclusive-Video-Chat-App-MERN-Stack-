import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { RouterProvider} from 'react-router-dom';
import router from './routes/index.routes.jsx';
import { Provider } from 'react-redux'; // Import Provider
import store from './store/store.jsx'; // Import the store

import { Buffer } from 'buffer';
window.Buffer = Buffer;
import process from 'process';
window.process = process;


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
    <RouterProvider router={router}/>
    </Provider>
  </StrictMode>,
)