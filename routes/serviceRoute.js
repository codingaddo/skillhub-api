const express = require("express");

const router = express.Router();

const { protect, restrictTo } = require("../controllers/authController");
const { createService } = require("../controllers/serviceController");

router
  .route("/:id")
  .post(protect, restrictTo("artesan", "admin"), createService);

module.exports = router;
