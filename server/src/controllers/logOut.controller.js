

export const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // only on HTTPS in production
    sameSite: 'strict',
    path: '/',
  });

  res.status(200).json({ message: 'Logged out successfully' });
};
