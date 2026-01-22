const PackageController = require("../app/controllers/packageController");
const express = require("express");
const router = express.Router();
const requireAuth = require("../app/middlewares/requireAuth");

// Áp dụng middleware xác thực cho tất cả các route trong này
router.use(requireAuth);

// POST /api/packages/subscribe
router.post("/subscribe", PackageController.createPackage);

// GET /api/packages/me
router.get("/me", PackageController.getPackageByUserId);

module.exports = router;
