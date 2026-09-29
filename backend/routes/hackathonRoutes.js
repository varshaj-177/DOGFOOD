const express = require("express");

const {
  createHackathon,
  getHackathons,
  getHackathonById,
  updateHackathon,
  deleteHackathon
} = require("../controller/hackathonController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/",
  protect,
  authorize(
    "participant",
    "judge",
    "organizer",
    "admin"
  ),
  getHackathons
);

router.get(
  "/:id",
  protect,
  authorize(
    "participant",
    "judge",
    "organizer",
    "admin"
  ),
  getHackathonById
);

router.post(
  "/",
  protect,
  authorize(
    "organizer",
    "admin"
  ),
  createHackathon
);

router.put(
  "/:id",
  protect,
  authorize(
    "organizer",
    "admin"
  ),
  updateHackathon
);

router.delete(
  "/:id",
  protect,
  authorize(
    "organizer",
    "admin"
  ),
  deleteHackathon
);

module.exports = router;