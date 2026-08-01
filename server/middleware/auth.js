import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const verifyToken = async (req, res, next) => {
  try {
    let token = req.headers.authorization?.split(' ')[1] || req.cookies?.accessToken;
    if (!token) {
      return res.status(401).json({ message: 'Access token missing' });
    }
    const secret = process.env.JWT_ACCESS_SECRET || 'vitalis_jwt_access_secret_super_secure_key_2026_x90a';
    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token', error: err.message });
  }
};
