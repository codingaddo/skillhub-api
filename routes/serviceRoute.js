const express = require("express");

const router = express.Router();

const { protect, restrictTo } = require("../controllers/authController");
const {
  createService,
  verifyService,
  getAllVerifiedServices,
  getAllService,
  deleteService,
  deleteServiceByowner,
} = require("../controllers/serviceController");

router
  .route("/:id")
  .post(protect, restrictTo("artesan", "admin"), createService);

router
  .route("/verify/:serviceId")
  .patch(protect, restrictTo("admin"), verifyService);

router.route("/verified-sevices").get(getAllVerifiedServices);
router.route("/").get(getAllService);

router
  .route("/delete/:serviceId")
  .delete(protect, restrictTo("admin"), deleteService);

router
  .route("/delete-my-service/:serviceId")
  .delete(protect, deleteServiceByowner);

module.exports = router;
