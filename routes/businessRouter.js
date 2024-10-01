const express = require("express");

const router = express.Router();
const {
  createBusiness,
  getAll,
  getMyBusiness,
  updateMyBusiness,
  deleteMyBusiness,
} = require("../controllers/businessControllers");

const { protect, restrictTo } = require("../controllers/authController");
const { createService } = require("../controllers/serviceController");

router
  .route("/create")
  .post(protect, restrictTo("artesan", "admin"), createBusiness);
router.route("/").get(getAll);
router.route("/my-business").get(protect, getMyBusiness);
router
  .route("/update-my-business/:businessId")
  .patch(protect, updateMyBusiness);
router
  .route("/delete-my-business/:businessId")
  .delete(protect, deleteMyBusiness);

router
  .route("/:businessId/service")
  .post(protect, restrictTo("artesan", "admin"), createService);

module.exports = router;
