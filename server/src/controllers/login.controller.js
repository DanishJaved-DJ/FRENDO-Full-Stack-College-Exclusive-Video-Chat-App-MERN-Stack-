import User from '../models/user.models.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    // Create token
    const token = jwt.sign(
      { _id : user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set token in HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
  
    });

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        isVerified: user.isVerified,
      }
    });
  } catch (err) {
    res.status(500).json({ status: 'false', message: 'Server error', error: err.message });
  }
};
