const express = require("express");
const requireAuth = require("../app/middlewares/requireAuth");
const PlanController = require("../app/controllers/planController");
const router = express.Router();


router.use(requireAuth);
router.post("/goal-settings", PlanController.upsertGoalSettings);
router.get("/by-date", PlanController.getPlansByDate);

router.post("/", PlanController.createPlan);
router.get("/", PlanController.getPlans);
router.patch("/:id", PlanController.updatePlan);
router.delete("/:id", PlanController.deletePlan);


module.exports = router;