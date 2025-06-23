

export const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
<<<<<<< HEAD
    secure: 'true',
=======
    secure: 'true', // only on HTTPS in production
>>>>>>> 9b2a723078373f9a0babf7852d1a54914db15816
    sameSite: 'None',
    path: '/',
  });

  res.status(200).json({ message: 'Logged out successfully' });
};
