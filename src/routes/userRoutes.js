const express = require("express");
const router = express.Router();
const {
  getMe,
  updateProfile,
  changePassword,
} = require("../controllers/userController");
const authMiddleware = require("../middleware/auth");

router.get("/me", getMe);
router.put("/update", authMiddleware, updateProfile);
router.put("/change-password", authMiddleware, changePassword);
module.exports = router;
