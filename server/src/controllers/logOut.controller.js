

export const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: 'true', // only on HTTPS in production
    sameSite: 'None',
    path: '/',
  });

  res.status(200).json({ message: 'Logged out successfully' });
};
