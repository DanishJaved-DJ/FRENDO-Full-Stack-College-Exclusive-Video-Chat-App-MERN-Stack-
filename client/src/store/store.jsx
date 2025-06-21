
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice.jsx'; // Import your reducers

const store = configureStore({
  reducer: {
    user: userReducer, // Add your reducers here
  },
});

export default store;