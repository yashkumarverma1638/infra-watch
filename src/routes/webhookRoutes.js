const express = require("express");
const router = express.Router();

const { stripeWebhook } = require("../controllers/paymentController");

// 🚨 ONLY raw here
router.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhook,
);

module.exports = router;
