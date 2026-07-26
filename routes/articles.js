const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { articles, saveArticles } = require("../data/db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// ─── Public Endpoints ────────────────────────────────────────────────────────

// GET /api/articles/featured
router.get("/featured", (req, res) => {
  const featured = articles.filter((a) => a.featured && a.published);
  if (featured.length === 0) {
    const fallback = articles.find((a) => a.published);
    return res.json(fallback ? [fallback] : []);
  }
  res.json(featured);
});

// GET /api/articles/trending
router.get("/trending", (req, res) => {
  // Articles explicitly marked as trending, up to 5
  const trending = articles
    .filter((a) => a.trending && a.published)
    .slice(0, 5);
  // Fallback: if none marked, return latest published non-featured
  if (trending.length === 0) {
    return res.json(
      articles.filter((a) => !a.featured && a.published).slice(0, 5)
    );
  }
  res.json(trending);
});

// GET /api/articles  — list with filtering, search, pagination
router.get("/", (req, res) => {
  const { category, search, page = 1, limit = 12, published, filter } = req.query;
  let result = [...articles];

  // Admin can see unpublished; public only sees published
  if (published !== "all") {
    result = result.filter((a) => a.published);
  }

  if (filter === "featured") {
    result = result.filter((a) => a.featured);
  } else if (filter === "trending") {
    result = result.filter((a) => a.trending);
  }

  if (category && category !== "all") {
    result = result.filter(
      (a) => a.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        (a.excerpt && a.excerpt.toLowerCase().includes(q)) ||
        (a.author && a.author.toLowerCase().includes(q)) ||
        a.category.toLowerCase().includes(q)
    );
  }

  const total = result.length;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
  const start = (pageNum - 1) * limitNum;
  const paginated = result.slice(start, start + limitNum);

  res.json({
    articles: paginated,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    },
  });
});

// GET /api/articles/:id
router.get("/:id", (req, res) => {
  const article = articles.find((a) => a.id === req.params.id);
  if (!article) return res.status(404).json({ error: "Article not found." });
  // Related articles: same category, different id
  const related = articles
    .filter((a) => a.id !== article.id && a.category === article.category && a.published)
    .slice(0, 3);
  res.json({ article, related });
});

// ─── Admin Endpoints (🔒 JWT) ────────────────────────────────────────────────

// POST /api/articles
router.post("/", requireAuth, (req, res) => {
  const { title, excerpt, content, category, author, date, readTime, image, featured, published } = req.body;
  if (!title || !category) {
    return res.status(400).json({ error: "Title and category are required." });
  }
  const now = new Date().toISOString();
  const article = {
    id: uuidv4(),
    title,
    excerpt: excerpt || "",
    content: content || "",
    category,
    author: author || "Editorial Desk",
    date: date || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    readTime: readTime || "5 min read",
    image: image || `https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&h=800&q=80`,
    featured: Boolean(featured),
    trending: Boolean(req.body.trending),
    published: published !== undefined ? Boolean(published) : true,
    createdAt: now,
    updatedAt: now,
  };
  articles.unshift(article);
  saveArticles();
  res.status(201).json(article);
});

// PUT /api/articles/:id
router.put("/:id", requireAuth, (req, res) => {
  const idx = articles.findIndex((a) => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Article not found." });
  const { title, excerpt, content, category, author, date, readTime, image, featured, published } = req.body;
  articles[idx] = {
    ...articles[idx],
    title: title ?? articles[idx].title,
    excerpt: excerpt ?? articles[idx].excerpt,
    content: content ?? articles[idx].content,
    category: category ?? articles[idx].category,
    author: author ?? articles[idx].author,
    date: date ?? articles[idx].date,
    readTime: readTime ?? articles[idx].readTime,
    image: image ?? articles[idx].image,
    featured: featured !== undefined ? Boolean(featured) : articles[idx].featured,
    trending: req.body.trending !== undefined ? Boolean(req.body.trending) : articles[idx].trending,
    published: published !== undefined ? Boolean(published) : articles[idx].published,
    updatedAt: new Date().toISOString(),
  };
  saveArticles();
  res.json(articles[idx]);
});

// DELETE /api/articles/:id
router.delete("/:id", requireAuth, (req, res) => {
  const idx = articles.findIndex((a) => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Article not found." });
  articles.splice(idx, 1);
  saveArticles();
  res.json({ message: "Article deleted." });
});

module.exports = router;
