const express = require("express");
const router = express.Router();

const { protect, restrictTo } = require("../controllers/authController");
const { createChat, getChats } = require("../controllers/chatController");

router.route("/").post(protect, createChat);
router.route("/").get(protect, getChats);

module.exports = router;
