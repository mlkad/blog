// User.js model
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  otp: { type: String, default: null },
  isVerified: { type: Boolean, default: false },
  token: { type: String, default: null },
  fullName: { type: String },
  avatarUrl: { type: String },
  refreshToken: { type: String, default: null },
  sessionId: { type: String, default: null } 
});

export default mongoose.model('User', UserSchema);
