import User from '../models/user.models.js';



export const updateProfile = async (req, res) => {
  try {
    // console.log('Update Profile Request:', req.user);
    const userId = req.user?._id ;

    // console.log('User ID:', userId);
    
    if(!userId) {
      return res.status(400).json({ status: 'false', message: 'User ID not found' });
    }



    const allowedFields = ['username', 'dob', 'regNo', 'gender', 'hobbies', 'description' , 'avatarUrl'];
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== null && req.body[field] !== '') {
        updates[field] = req.body[field];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true }).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ status: 'false', message: 'User not found' });
    }

    res.status(200).json({ status: 'success', message: 'Profile updated', data: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'false', message: 'Update failed' });
  }
};
