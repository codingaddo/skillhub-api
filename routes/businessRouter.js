const express = require("express");

const router = express.Router();
const {
  createBusiness,
  getAll,
} = require("../controllers/businessControllers");

const { protect, restrictTo } = require("../controllers/authController");

router
  .route("/create")
  .post(protect, restrictTo("artesan", "admin"), createBusiness);
router.route("/").get(getAll);

module.exports = router;
