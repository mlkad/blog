// utils/checkAuth.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export default async (req, res, next) => {
  try {
    const token = (req.headers.authorization || "").replace(/Bearer\s?/, "");
    if (!token) {
      return res.status(403).json({ message: "Нет доступа" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Ищем пользователя в базе
    const user = await User.findById(decoded._id);
    // Сравниваем sessionId из токена с сохраненным в БД
    if (!user || user.sessionId !== decoded.sessionId) {
      return res.status(403).json({ message: "Сессия недействительна" });
    }
    req.userId = decoded._id;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Нет доступа" });
  }
};
