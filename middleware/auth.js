const jwt = require("jsonwebtoken");
const { admins } = require("../data/db");

const JWT_SECRET = process.env.JWT_SECRET || "energdive-super-secret-2026";

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required." });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Attach admin user to request
    const admin = admins.find((a) => a.id === decoded.id);
    if (!admin) return res.status(401).json({ error: "Admin not found." });
    req.admin = { id: admin.id, name: admin.name, email: admin.email, role: admin.role };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}

module.exports = { requireAuth, JWT_SECRET };
