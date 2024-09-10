const express = require("express");

const {
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();
router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.patch("/reset-password/:token", resetPassword);

module.exports = router;
