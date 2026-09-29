const express = require("express");

const {
  createTeam,
  getTeams,
  addTeamMember
} = require("../controller/teamController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("participant"),
  createTeam
);

router.get(
  "/hackathon/:hackathonId",
  getTeams
);

router.post(
  "/:teamId/members",
  protect,
  authorize("participant"),
  addTeamMember
);

module.exports = router;