const express = require("express");
const { topics, categories, settings, subscribers, saveSettings, saveSubscribers } = require("../data/db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// GET /api/topics
router.get("/topics", (req, res) => res.json(topics));

// GET /api/categories
router.get("/categories", (req, res) => res.json(categories));

// POST /api/newsletter
router.post("/newsletter", (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Valid email is required." });
  }
  if (subscribers.includes(email)) {
    return res.json({ message: "You are already subscribed!" });
  }
  subscribers.push(email);
  saveSubscribers();
  res.json({ message: "Subscribed successfully!" });
});

// GET /api/settings  (public — returns non-sensitive fields)
router.get("/settings", (req, res) => {
  const { siteName, tagline, description, breakingNews, latestTicker } = settings;
  res.json({ siteName, tagline, description, breakingNews, latestTicker });
});

// PUT /api/settings  🔒
router.put("/settings", requireAuth, (req, res) => {
  const { siteName, tagline, description, breakingNews, latestTicker } = req.body;
  if (siteName !== undefined) settings.siteName = siteName;
  if (tagline !== undefined) settings.tagline = tagline;
  if (description !== undefined) settings.description = description;
  if (breakingNews !== undefined) settings.breakingNews = breakingNews;
  if (latestTicker !== undefined) settings.latestTicker = latestTicker;
  saveSettings();
  res.json(settings);
});

// GET /api/stats  🔒  — dashboard stats
router.get("/stats", requireAuth, (req, res) => {
  const { articles } = require("../data/db");
  const { reports } = require("../data/db");
  const { videos } = require("../data/db");
  res.json({
    totalArticles: articles.length,
    publishedArticles: articles.filter((a) => a.published).length,
    draftArticles: articles.filter((a) => !a.published).length,
    totalReports: reports.length,
    totalVideos: videos.length,
    subscribers: subscribers.length,
    recentArticles: articles.slice(0, 5),
  });
});

module.exports = router;
