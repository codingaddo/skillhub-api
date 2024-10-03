const express = require("express");
const router = express.Router();

const { protect } = require("../controllers/authController");
const {
  getMessages,
  sendMessage,
} = require("../controllers/messageController");

router.post("/send", protect, sendMessage);
router.get("/:chatId", protect, getMessages);

module.exports = router;
