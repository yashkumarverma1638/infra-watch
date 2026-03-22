const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { getAlerts } = require("../controllers/alertController");

router.get("/", auth, getAlerts);

module.exports = router;
