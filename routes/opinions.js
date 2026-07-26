const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { opinions, saveOpinions } = require("../data/db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/", (req, res) => res.json(opinions));

router.post("/", requireAuth, (req, res) => {
  const { author, role, quote, title, avatar, content, publishedAt } = req.body;
  if (!author || !title) return res.status(400).json({ error: "Author and title are required." });
  const now = new Date().toISOString();
  const opinion = { id: uuidv4(), author, role: role || "", quote: quote || "", title, avatar: avatar || "", content: content || "", publishedAt: publishedAt || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), createdAt: now, updatedAt: now };
  opinions.unshift(opinion);
  saveOpinions();
  res.status(201).json(opinion);
});

router.put("/:id", requireAuth, (req, res) => {
  const idx = opinions.findIndex((o) => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Opinion not found." });
  opinions[idx] = { ...opinions[idx], ...req.body, updatedAt: new Date().toISOString() };
  saveOpinions();
  res.json(opinions[idx]);
});

router.delete("/:id", requireAuth, (req, res) => {
  const idx = opinions.findIndex((o) => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Opinion not found." });
  opinions.splice(idx, 1);
  saveOpinions();
  res.json({ message: "Opinion deleted." });
});

module.exports = router;
