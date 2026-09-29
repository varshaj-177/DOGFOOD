const express = require("express");

const {
  submitScore,
  getMyScores,
  getParticipantResult
} = require("../controller/judgeScoreController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// Judge submits a score
router.post(
  "/",
  protect,
  authorize("judge"),
  submitScore
);

// Judge views their submitted scores
router.get(
  "/my-scores",
  protect,
  authorize("judge"),
  getMyScores
);

// Participant views evaluation result
router.get(
  "/participant-result/:hackathonId",
  protect,
  authorize("participant"),
  getParticipantResult
);

module.exports = router;