import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendOtpEmail } from "../utils/sendOtpEmail.js";
import { generateOtp } from "../utils/generateOpt.js";
import dotenv from "dotenv";
dotenv.config();
const router = express.Router();

// Регистрация с OTP
router.post("/register", async (req, res) => {
  try {
    console.log("🔹 Запрос на регистрацию получен:", req.body);
    const { email, password, fullName, avatarUrl } = req.body;
    console.log("🔹 Проверяем наличие пользователя в БД:", email);
    let user = await User.findOne({ email });
    if (user) {
      console.log("❌ Email уже зарегистрирован");
      return res.status(400).json({ message: "Email уже зарегистрирован" });
    }
    const otp = generateOtp();
    console.log(`✅ OTP сгенерирован: ${otp} для ${email}`);

    const hashedPassword = await bcrypt.hash(password, 10);

    user = new User({
      email,
      passwordHash: hashedPassword,
      otp,
      isVerified: false,
      fullName,
      avatarUrl,
    });
    console.log("🔹 Сохраняем пользователя в БД:", user);
    await user.save();
    console.log("✅ Пользователь сохранён в БД!");

    console.log(`User saved in DB: ${user.email}`);

    // Проверяем отправку почты
    console.log(`📩 Отправляем OTP ${otp} на ${email}`);
    const emailResponse = await sendOtpEmail(email, otp);
    console.log("✅ Email отправлен?", emailResponse);

    if (!emailResponse) {
      console.error("Ошибка при отправке OTP на email");
      return res.status(500).json({ message: "Ошибка при отправке OTP" });
    }
    console.log("🔹 Возвращаем ответ клиенту...");
    res.status(200).json({ message: "OTP отправлен на email" });
  } catch (err) {
    console.error("Ошибка регистрации:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});
// Верификация OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { otp } = req.body;
    console.log(`🔹 Получен запрос на верификацию OTP: ${otp}`);

    // Ищем пользователя по OTP
    const user = await User.findOne({ otp });

    if (!user) {
      console.log("❌ Неверный или просроченный OTP!");
      return res.status(400).json({ message: "Неверный код" });
    }

    if (user.isVerified) {
      console.log("⚠️ Пользователь уже верифицирован!");
      return res.status(400).json({ message: "Аккаунт уже подтвержден" });
    }

    // Обновляем статус пользователя
    user.isVerified = true;
    user.otp = null; // Удаляем OTP после успешной проверки
    await user.save();

    console.log("✅ Верификация успешна, создаем токен...");
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(200).json({ message: "✅ Аккаунт подтвержден!", token });
  } catch (err) {
    console.error("Ошибка при верификации OTP:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Вход (Login)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`🔹 Запрос на вход: ${email}`);

    // Ищем пользователя в базе
    const user = await User.findOne({ email });

    if (!user) {
      console.log("❌ Пользователь не найден!");
      return res.status(400).json({ message: "Неверный email или пароль" });
    }

    // Проверяем верификацию
    if (!user.isVerified) {
      console.log("⚠️ Аккаунт не подтвержден!");
      return res
        .status(400)
        .json({ message: "Аккаунт не подтвержден! Проверьте email." });
    }

    // Проверяем пароль
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      console.log("❌ Неверный пароль!");
      return res.status(400).json({ message: "Неверный email или пароль" });
    }

    // Создаём токен
    console.log("✅ Логин успешен, создаем токен...");
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res
      .status(200)
      .json({ message: "✅ Вход выполнен!", token, userId: user._id });
  } catch (err) {
    console.error("Ошибка входа:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

export default router;
