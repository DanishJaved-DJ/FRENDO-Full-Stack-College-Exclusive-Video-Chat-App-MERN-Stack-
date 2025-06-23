

export const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: 'true',
    sameSite: 'None',
    path: '/',
  });

  res.status(200).json({ message: 'Logged out successfully' });
};
