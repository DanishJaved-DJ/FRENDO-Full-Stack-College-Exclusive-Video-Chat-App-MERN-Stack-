
import User from '../../models/user.models.js';

export const changePassword = async (req, res) => {
  const userId = req.user._id; 
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ status: 'fail', message: 'Both current and new passwords are required.' });
  }

  try {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ status: 'fail', message: 'Incorrect current password' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ status: 'success', message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ status: 'false', message: 'Server error' });
  }
};
