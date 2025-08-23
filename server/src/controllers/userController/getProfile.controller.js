import User from '../../models/user.models.js';

export const getProfile = async (req, res) => {
  try {
    // `req.user` is set by authMiddleware
    if (!req.user || !req.user._id) {
      return res.status(401).json({ status: 'false', message: 'Unauthorized: User not authenticated' });
    }
    const userId = req.user?._id ;

    // console.log('User ID:', userId);
    
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ status: 'false', message: 'User not found' });
    }

    return res.status(200).json({ status: 'success', data: user });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({ status: 'false', message: 'Internal Server Error' });
  }
};
