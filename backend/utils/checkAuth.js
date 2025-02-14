import jwt from 'jsonwebtoken';

export default (req, res, next) => {
  const token = (req.headers.authorization || "").replace(/Bearer\s?/, "");

  if (!token) {
    return res.status(403).json({ message: "Нет доступа" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const now = Math.floor(Date.now() / 1000);

    // Если до истечения токена осталось менее 20 минут – просим войти заново
    if (decoded.exp - now < 1200) {
      return res.status(401).json({ message: "Сессия истекла, войдите заново" });
    }

    req.userId = decoded._id; // используем _id, как указано при генерации токена
    next();
  } catch (e) {
    return res.status(403).json({ message: "Нет доступа" });
  }
};
