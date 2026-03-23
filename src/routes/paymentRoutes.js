const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const { createCheckoutSession } = require("../controllers/paymentController");

const { stripeWebhook } = require("../controllers/webhookController");

// 🔥 create session
router.post("/create-checkout-session", auth, createCheckoutSession);

// 🔥 webhook (NO auth)
router.post("/webhook", stripeWebhook);

module.exports = router;
