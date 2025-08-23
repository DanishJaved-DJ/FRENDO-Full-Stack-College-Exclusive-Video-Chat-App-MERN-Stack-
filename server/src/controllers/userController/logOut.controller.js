export const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: 'true',
    sameSite: 'none',
  });

  res.status(200).json({ message: 'Logged out successfully' });
};
