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
});

export default mongoose.model('User', UserSchema);
