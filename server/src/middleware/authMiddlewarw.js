import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  try {
    // 1. Read token from cookies
    const token = req?.cookies?.token;

    // console.log(token);

    // 2. If no token, deny access
    if (!token) {
      return res.status(401).json({ status: 'false', message: 'Unauthorized: No token provided' });
    }

    // 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    // console.log("Decoded user:", req.user);

    next();
  } catch (error) {
    return res.status(401).json({ status: 'false', message: 'Invalid or expired token' });
  }
};
