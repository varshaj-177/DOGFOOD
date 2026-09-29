const express = require("express");

const {
  assignJudge,
  getJudgeAssignments,
  getJudges
} = require("../controller/judgeController");

const protect =
  require("../middleware/authMiddleware");

const authorize =
  require("../middleware/roleMiddleware");

const router =
  express.Router();


// ==========================================
// ORGANIZER ASSIGNS JUDGE
// ==========================================

router.post(
  "/assign",
  protect,
  authorize("organizer", "admin"),
  assignJudge
);


// ==========================================
// ORGANIZER GETS ALL JUDGES
// ==========================================

router.get(
  "/list",
  protect,
  authorize("organizer", "admin"),
  getJudges
);


// ==========================================
// JUDGE GETS ASSIGNED PROJECTS
// ==========================================

router.get(
  "/my-assignments",
  protect,
  authorize("judge"),
  getJudgeAssignments
);


module.exports = router;