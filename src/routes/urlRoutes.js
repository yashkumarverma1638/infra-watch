const express = require("express");
const router = express.Router();

const {
  addUrl,
  getUrls,
  getMetrics,
  getUptime,
} = require("../controllers/urlController");

router.get("/", getUrls);
router.post("/add", addUrl);
router.get("/metrics/:urlId", getMetrics);
router.get("/uptime/:urlId", getUptime);

module.exports = router;
