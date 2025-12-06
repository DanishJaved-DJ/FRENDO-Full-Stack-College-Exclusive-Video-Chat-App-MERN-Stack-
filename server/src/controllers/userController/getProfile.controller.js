// server/src/controllers/userController/getProfile.controller.js
import User from '../../models/user.models.js';
import redis from '../../db/redisClient.js';

export const getProfile = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ status: 'false', message: 'Unauthorized: User not authenticated' });
    }

    const userId = req.user._id.toString();
    const cacheKey = `user:profile:${userId}`;

 // first go to Redis,  if found return the response
    const cached = await redis.get(cacheKey);
    if (cached) {
      const user = JSON.parse(cached);
      return res.status(200).json({ status: 'success', data: user, cache: true });
    }

// else then got to database -> mongoDB 
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ status: 'false', message: 'User not found' });
    }

    // save data for future use for 60s expiry
    await redis.set(cacheKey, JSON.stringify(user), "EX", 60);

    return res.status(200).json({ status: 'success', data: user, cache: false });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({ status: 'false', message: 'Internal Server Error' });
  }
};
