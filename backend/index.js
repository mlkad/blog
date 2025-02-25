import express from "express";
import fs from "fs";
import multer from "multer";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { handleValidationErrors, checkAuth } from "./utils/index.js";

import authRoutes from "./routes/auth.js"; // ✅ Исправлено!
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";

dotenv.config({ path: "./backend/.env" });

// Подключение к MongoDB
mongoose

  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Подключено к базе данных"))
  .catch((err) => console.error("❌ Ошибка подключения к БД:", err));

const app = express();

// Настройка хранения файлов
const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    if (!fs.existsSync("uploads")) {
      fs.mkdirSync("uploads");
    }
    cb(null, "uploads");
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

// Middleware
app.use(express.json());
app.use(cors()); // ✅ Перенесён в правильное место

// Маршруты
app.use("/auth", authRoutes);  // ✅ Исправлено!
app.use("/api/users", userRoutes);
app.use("/posts", postRoutes);
app.use("/uploads", express.static("uploads"));

// Загрузка файлов
app.post("/upload", checkAuth, upload.single("image"), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`,
  });
});

// Запуск сервера
const PORT = process.env.PORT || 4404;
app.listen(PORT, (err) => {
  if (err) {
    console.error("❌ Ошибка запуска сервера:", err);
  } else {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
  }
});

// Раздача фронтенда (если он есть)
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "frontend", "build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});
