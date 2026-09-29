const express = require("express");

const {
  getResults,
  getLeaderboard
} = require("../controller/resultController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();


// Organizer/Admin can view results
router.get(
  "/hackathon/:hackathonId",
  protect,
  authorize("organizer", "admin"),
  getResults
);


// Organizer/Admin can view leaderboard
router.get(
  "/leaderboard/:hackathonId",
  protect,
  authorize("organizer", "admin"),
  getLeaderboard
);


module.exports = router;