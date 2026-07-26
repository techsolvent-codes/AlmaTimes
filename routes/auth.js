const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { admins, saveAdmins } = require("../data/db");
const { JWT_SECRET } = require("../middleware/auth");

const router = express.Router();

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }
  const admin = admins.find((a) => a.email.toLowerCase() === email.toLowerCase());
  if (!admin) {
    return res.status(401).json({ error: "Invalid email or password." });
  }
  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid email or password." });
  }
  const token = jwt.sign({ id: admin.id, role: admin.role }, JWT_SECRET, { expiresIn: "7d" });
  res.json({
    token,
    user: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
  });
});

// GET /api/auth/me  (requires Bearer token)
router.get("/me", require("../middleware/auth").requireAuth, (req, res) => {
  res.json({ user: req.admin });
});

// POST /api/auth/change-password
router.post("/change-password", require("../middleware/auth").requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Both currentPassword and newPassword are required." });
  }
  const admin = admins.find((a) => a.id === req.admin.id);
  const valid = await bcrypt.compare(currentPassword, admin.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Current password is incorrect." });
  }
  admin.passwordHash = await bcrypt.hash(newPassword, 10);
  saveAdmins();
  res.json({ message: "Password changed successfully." });
});

module.exports = router;
