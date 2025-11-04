// server.js - CRITICAL: Load dotenv FIRST, SYNCHRONOUSLY
import dotenv from "dotenv";
dotenv.config();

// Add this debug line right after dotenv.config()
console.log('✅ Environment loaded in server.js:', {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY ? `${process.env.GEMINI_API_KEY.substring(0, 15)}...` : '❌ MISSING',
  PORT: process.env.PORT,
});
// import dotenv from "dotenv";
// dotenv.config();
import express from "express";
import http from "http";
import { Server as IOServer } from "socket.io";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import shareRoutes from "./routes/shareRoutes.js";
import errorMiddleware from "./middlewares/errorMiddleware.js";
import { createRateLimiter } from "./utils/rateLimiter.js";
import { attachSocket } from "./websockets/socket.js"; // your custom websocket logic

// 🧠 File path setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

/**
 * ✅ Correct CORS setup for localhost:5173
 */
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:5173", // 🔥 FIXED
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

/**
 * ✅ Initialize Socket.IO (with matching CORS)
 */
const io = new IOServer(server, {
  cors: corsOptions,
});

// Attach your custom socket handlers
attachSocket(io);

/**
 * ✅ Security & middleware setup
 */
app.use(helmet());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(createRateLimiter());

/**
 * ✅ API routes
 */
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/share", shareRoutes);

/**
 * ✅ Health check
 */
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

/**
 * ✅ Global error middleware
 */
app.use(errorMiddleware);

/**
 * ✅ Start the server
 */
const PORT = process.env.PORT || 5000;

(async () => {
  await connectDB(process.env.MONGODB_URI || "mongodb://localhost:27017/collabdb");

  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🧩 CORS Origin allowed: ${corsOptions.origin}`);
  });
})();

/**
 * ✅ Graceful shutdown
 */
process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down gracefully...");
  process.exit(0);
});

