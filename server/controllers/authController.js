// controllers/authController.js
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const ACCESS_EXPIRY = '15m';
const REFRESH_EXPIRY = '7d';

function generateTokens(user) {
  const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: ACCESS_EXPIRY });
  const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: REFRESH_EXPIRY });
  return { accessToken, refreshToken };
}

// Helper to set cookies
function setAuthCookies(res, accessToken, refreshToken) {
  res.cookie('token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

// REGISTER
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role });

    const { accessToken, refreshToken } = generateTokens(user);
    user.refreshToken = refreshToken;
    await user.save();

    setAuthCookies(res, accessToken, refreshToken);
    res.status(201).json({ message: 'Registered', user: { id: user._id, name, email, role } });
  } catch (err) {
    next(err);
  }
};

// // LOGIN
// export const login = async (req, res, next) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });
//     if (!user) return res.status(401).json({ message: 'Invalid credentials' });

//     const valid = await bcrypt.compare(password, user.password);
//     if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

//     const { accessToken, refreshToken } = generateTokens(user);
//     user.refreshToken = refreshToken;
//     await user.save();

//     setAuthCookies(res, accessToken, refreshToken);
//     res.json({ message: 'Login successful', user: { id: user._id, name: user.name, email, role: user.role } });
//   } catch (err) {
//     next(err);
//   }
// };

// LOGIN
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ✅ Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // ✅ Save refresh token in DB (optional but recommended)
    user.refreshToken = refreshToken;
    await user.save();

    // ✅ Set cookies (for browser-based security)
    setAuthCookies(res, accessToken, refreshToken);

    // ✅ Send token in JSON response too (for frontend apps like yours)
    res.json({
      message: "Login successful",
      token: accessToken, // <-- ADDED THIS
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};


// REFRESH TOKEN
export const refresh = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: 'Refresh token missing' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id);
    if (!user || user.refreshToken !== token) return res.status(403).json({ message: 'Invalid refresh token' });

    const { accessToken, refreshToken } = generateTokens(user);
    user.refreshToken = refreshToken;
    await user.save();

    setAuthCookies(res, accessToken, refreshToken);
    res.json({ message: 'Token refreshed' });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};

// LOGOUT
export const logout = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      await User.findByIdAndUpdate(payload.id, { refreshToken: null });
    }
    res.clearCookie('token');
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out' });
  } catch (err) {
    next(err);
  }
};

// GET PROFILE
export const me = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('-password -refreshToken');
    res.json({ user });
  } catch (err) {
    next(err);
  }
};
