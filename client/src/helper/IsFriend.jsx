import Context from '../context/Context';
import { useContext } from 'react';
import { useSelector } from 'react-redux';

const isfriend = (userId) => {
   const context = useContext(Context);
   const user = useSelector((state) => state?.user?.user);
   const friendsList = user.friends || [];

  return friendsList.some(friend => friend.id === userId);
};

export { isfriend };
