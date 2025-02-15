// routes/auth.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import { sendOtpEmail } from "../utils/sendOtpEmail.js";
import { generateOtp } from "../utils/generateOpt.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// Функция генерации токенов с учетом sessionId
const generateTokens = (userId, sessionId) => {
  const accessToken = jwt.sign(
    { _id: userId, sessionId },
    process.env.JWT_SECRET,
    { expiresIn: "15m" } // или любое другое время жизни
  );
  const refreshToken = jwt.sign(
    { _id: userId, sessionId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
  return { accessToken, refreshToken };
};

// Регистрация (с OTP)
router.post("/register", async (req, res) => {
  try {
    const { email, password, fullName, avatarUrl } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "Email уже зарегистрирован" });
    }
    const otp = generateOtp();
    const hashedPassword = await bcrypt.hash(password, 10);

    user = new User({
      email,
      passwordHash: hashedPassword,
      otp,
      isVerified: false,
      fullName,
      avatarUrl,
    });
    await user.save();

    const emailResponse = await sendOtpEmail(email, otp);
    if (!emailResponse) {
      return res.status(500).json({ message: "Ошибка при отправке OTP" });
    }
    res.status(200).json({ message: "OTP отправлен на email" });
  } catch (err) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Верификация OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { otp } = req.body;
    const user = await User.findOne({ otp });
    if (!user) {
      return res.status(400).json({ message: "Неверный код" });
    }
    if (user.isVerified) {
      return res.status(400).json({ message: "Аккаунт уже подтвержден" });
    }
    // Обновляем статус пользователя и удаляем OTP
    user.isVerified = true;
    user.otp = null;
    // Генерируем новый sessionId
    const sessionId = crypto.randomBytes(16).toString("hex");
    user.sessionId = sessionId;
    const { accessToken, refreshToken } = generateTokens(user._id, sessionId);
    await user.save();

    res.status(200).json({ 
      message: "Аккаунт подтвержден!", 
      accessToken, 
      refreshToken, 
      userId: user._id 
    });
  } catch (err) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Вход (Login)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Неверный email или пароль" });
    }
    if (!user.isVerified) {
      return res.status(400).json({ message: "Аккаунт не подтвержден! Проверьте email." });
    }
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(400).json({ message: "Неверный email или пароль" });
    }
    // Генерируем новый sessionId и обновляем запись пользователя
    const sessionId = crypto.randomBytes(16).toString("hex");
    user.sessionId = sessionId;
    const { accessToken, refreshToken } = generateTokens(user._id, sessionId);
    await user.save();

    res.status(200).json({ 
      message: "Вход выполнен!", 
      accessToken, 
      refreshToken, 
      userId: user._id 
    });
  } catch (err) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Обновление токенов (Refresh token)
router.post("/refresh-token", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token обязателен" });
    }
    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Неверный refresh token" });
      }
      const user = await User.findById(decoded._id);
      // Проверяем, совпадает ли sessionId из токена с текущим в базе
      if (!user || user.sessionId !== decoded.sessionId) {
        return res.status(401).json({ message: "Неверный refresh token" });
      }
      // Генерируем новый sessionId для ротации (это гарантирует, что старые токены становятся недействительными)
      const newSessionId = crypto.randomBytes(16).toString("hex");
      user.sessionId = newSessionId;
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(user._id, newSessionId);
      await user.save();
      res.status(200).json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    });
  } catch (err) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

export default router;
