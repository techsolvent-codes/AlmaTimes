const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

// ─── Helpers ────────────────────────────────────────────────────────────────

const DATA_DIR = __dirname;

/** Read a JSON file from the data directory */
function loadJSON(filename) {
  const filePath = path.join(DATA_DIR, filename);
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error(`⚠️  Failed to load ${filename}:`, err.message);
    return Array.isArray(filename) ? [] : {};
  }
}

/** Write data to a JSON file in the data directory */
function saveJSON(filename, data) {
  const filePath = path.join(DATA_DIR, filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error(`⚠️  Failed to save ${filename}:`, err.message);
  }
}

// ─── Load Data from JSON Files ──────────────────────────────────────────────

const admins = loadJSON("admins.json");
const articles = loadJSON("articles.json");
const reports = loadJSON("reports.json");
const videos = loadJSON("videos.json");
const opinions = loadJSON("opinions.json");
const topics = loadJSON("topics.json");
const categories = loadJSON("categories.json");
const settings = loadJSON("settings.json");
const subscribers = loadJSON("subscribers.json");

// ─── Ensure admin password hash is valid ────────────────────────────────────
// On first run, the seed file has a placeholder hash. Replace it with a real one.
for (const admin of admins) {
  if (admin.passwordHash && !admin.passwordHash.startsWith("$2a$")) {
    admin.passwordHash = bcrypt.hashSync("Admin@1234", 10);
  }
  // Also ensure a valid hash exists
  if (!admin.passwordHash || admin.passwordHash === "$2a$10$placeholder") {
    admin.passwordHash = bcrypt.hashSync("Admin@1234", 10);
  }
}
saveJSON("admins.json", admins);

// ─── Save Helpers (one per collection) ──────────────────────────────────────

function saveAdmins() { saveJSON("admins.json", admins); }
function saveArticles() { saveJSON("articles.json", articles); }
function saveReports() { saveJSON("reports.json", reports); }
function saveVideos() { saveJSON("videos.json", videos); }
function saveOpinions() { saveJSON("opinions.json", opinions); }
function saveTopics() { saveJSON("topics.json", topics); }
function saveCategories() { saveJSON("categories.json", categories); }
function saveSettings() { saveJSON("settings.json", settings); }
function saveSubscribers() { saveJSON("subscribers.json", subscribers); }

// ─── Exports ────────────────────────────────────────────────────────────────

module.exports = {
  admins,
  articles,
  reports,
  videos,
  opinions,
  topics,
  categories,
  settings,
  subscribers,
  // Save helpers
  saveAdmins,
  saveArticles,
  saveReports,
  saveVideos,
  saveOpinions,
  saveTopics,
  saveCategories,
  saveSettings,
  saveSubscribers,
};
