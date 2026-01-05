const express = require("express");
const router = express.Router();
const controller = require("../controller/recommender_controller/RecommenderController");

router.post("/events", controller.addEvent);
router.post("/events/batch", controller.addBatchEvents);
router.get("/recommendations/:userId", controller.getRecommendations);
router.get("/popular", controller.getPopular);
router.get("/status", controller.getStatus); // ✅ New status endpoint
router.get("/debug", controller.getDebugInfo); // ✅ New debug endpoint
module.exports = router;
