const express = require("express");
const requireAuth = require("../app/middlewares/requireAuth");
const runProcessController = require("../app/controllers/runProcessController");
const router = express.Router();

router.use(requireAuth);

router.post("/", runProcessController.createRunProcess);
router.get("/by-date", runProcessController.getRunProcessesByDate);
router.get("/stats/overview", runProcessController.getStatsOverview);
router.get("/stats/dashboard", runProcessController.getStatsDashboard);
module.exports = router;

