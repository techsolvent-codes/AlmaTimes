const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { reports, saveReports } = require("../data/db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// GET /api/reports
router.get("/", (req, res) => res.json(reports));

// GET /api/reports/:id
router.get("/:id", (req, res) => {
  const report = reports.find((r) => r.id === req.params.id);
  if (!report) return res.status(404).json({ error: "Report not found." });
  res.json(report);
});

// POST /api/reports  🔒
router.post("/", requireAuth, (req, res) => {
  const { title, desc, image, type, publishedAt, pdfUrl } = req.body;
  if (!title) return res.status(400).json({ error: "Title is required." });
  const now = new Date().toISOString();
  const report = { id: uuidv4(), title, desc: desc || "", image: image || "", type: type || "Report", publishedAt: publishedAt || new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }), pdfUrl: pdfUrl || "", createdAt: now, updatedAt: now };
  reports.unshift(report);
  saveReports();
  res.status(201).json(report);
});

// PUT /api/reports/:id  🔒
router.put("/:id", requireAuth, (req, res) => {
  const idx = reports.findIndex((r) => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Report not found." });
  reports[idx] = { ...reports[idx], ...req.body, updatedAt: new Date().toISOString() };
  saveReports();
  res.json(reports[idx]);
});

// DELETE /api/reports/:id  🔒
router.delete("/:id", requireAuth, (req, res) => {
  const idx = reports.findIndex((r) => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Report not found." });
  reports.splice(idx, 1);
  saveReports();
  res.json({ message: "Report deleted." });
});

module.exports = router;
