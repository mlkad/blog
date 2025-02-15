import express from 'express';
import { register } from '../controllers/UserController.js';
import User from '../models/User.js';

const router = express.Router();

// Регистрация должна быть доступна без авторизации
router.post('/register', register);

// Далее можно использовать checkAuth для защищённых маршрутов
import checkAuth from "../utils/checkAuth.js";
router.use(checkAuth);

// Например, защита для получения списка пользователей
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}, '-password -otp -token');
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

export default router;
