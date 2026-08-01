const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173", "http://localhost:4173", "http://localhost:8081", "https://alma-times.netlify.app"],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Static: uploaded images ──────────────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// ─── Request Logger ───────────────────────────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/auth",     require("./routes/auth"));
app.use("/api/upload",   require("./routes/upload"));
app.use("/api/articles", require("./routes/articles"));
app.use("/api/reports",  require("./routes/reports"));
app.use("/api/videos",   require("./routes/videos"));
app.use("/api/opinions", require("./routes/opinions"));
app.use("/api",          require("./routes/misc"));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

// ─── Testing API ──────────────────────────────────────────────────────────────
app.get("/api/test", (_req, res) => {
  res.json({
    status: "ok",
    message: "Backend API is reachable!",
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    node: process.version,
  });
});

// ─── 404 ─────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: "Route not found." }));

// ─── Error Handler ────────────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error." });
});

// ─── Start ────────────────────────────────────────────────────────────────────
// app.listen(PORT, () => {
//   console.log(`\n🚀 EnergDive API running on http://localhost:${PORT}`);
//   console.log(`   Health: http://localhost:${PORT}/health`);
//   console.log(`   Admin login: admin@energdive.com / Admin@1234\n`);
// });

app.listen(PORT, '127.0.0.1', () => {
  console.log(`\n🚀 EnergDive API running on http://127.0.0.1:${PORT}`);
  console.log(`   Health: http://127.0.0.1:${PORT}/health`);
  console.log(`   Admin login: admin@energdive.com / Admin@1234\n`);
});
