const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { videos, saveVideos } = require("../data/db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// GET /api/videos
router.get("/", (req, res) => res.json(videos));

// GET /api/videos/:id
router.get("/:id", (req, res) => {
  const video = videos.find((v) => v.id === req.params.id);
  if (!video) return res.status(404).json({ error: "Video not found." });
  res.json(video);
});

// POST /api/videos  🔒
router.post("/", requireAuth, (req, res) => {
  const { title, duration, image, description, category, publishedAt } = req.body;
  if (!title) return res.status(400).json({ error: "Title is required." });
  const now = new Date().toISOString();
  const video = { id: uuidv4(), title, duration: duration || "00:00", image: image || "", description: description || "", category: category || "General", publishedAt: publishedAt || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), createdAt: now, updatedAt: now };
  videos.unshift(video);
  saveVideos();
  res.status(201).json(video);
});

// PUT /api/videos/:id  🔒
router.put("/:id", requireAuth, (req, res) => {
  const idx = videos.findIndex((v) => v.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Video not found." });
  videos[idx] = { ...videos[idx], ...req.body, updatedAt: new Date().toISOString() };
  saveVideos();
  res.json(videos[idx]);
});

// DELETE /api/videos/:id  🔒
router.delete("/:id", requireAuth, (req, res) => {
  const idx = videos.findIndex((v) => v.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Video not found." });
  videos.splice(idx, 1);
  saveVideos();
  res.json({ message: "Video deleted." });
});

module.exports = router;
