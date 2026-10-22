import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.routes.js";
import authTestRoutes from "./middlewares/auth-test.routes.js";
import studentRoutes from "./modules/students/students.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import branchRoutes from "./modules/branches/branches.routes.js";
import teacherUnitTestMarksRoutes from "./modules/unit-tests/teacherUnitTestMarks.routes.js";



const app = express();

// Security
app.use(helmet());

// CORS

const allowedOrigins: string[] = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter((origin): origin is string => Boolean(origin));
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Middleware
app.use(compression());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/auth-test", authTestRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/branches", branchRoutes);
app.use("/api/teacher", teacherUnitTestMarksRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "College ERP API is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);

export default app;