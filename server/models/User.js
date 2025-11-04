// models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['owner', 'editor', 'viewer'], default: 'editor' },
  refreshToken: { type: String }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
