const express = require("express");

const {
  createSubmission,
  getSubmissions,
  getMySubmission
} = require("../controller/submissionController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();


// ==========================================
// CREATE SUBMISSION
// ==========================================

router.post(
  "/",
  protect,
  authorize("participant"),
  createSubmission
);


// ==========================================
// GET MY SUBMISSION
// ==========================================

router.get(
  "/my/:hackathonId",
  protect,
  authorize("participant"),
  getMySubmission
);


// ==========================================
// GET ALL SUBMISSIONS
// ==========================================

router.get(
  "/hackathon/:hackathonId",
  protect,
  authorize("organizer", "admin", "judge"),
  getSubmissions
);


module.exports = router;