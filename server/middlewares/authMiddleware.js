// middlewares/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export default async function authMiddleware(req, res, next) {
  try {
    const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
    if (!token) return res.status(401).json({ message: 'No token' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.id;
    req.userRole = payload.role;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// Role guard
export const authorizeRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.userRole)) return res.status(403).json({ message: 'Forbidden: insufficient role' });
  next();
};
