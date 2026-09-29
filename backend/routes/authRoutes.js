const express = require("express");

const router = express.Router();

const {
  register,
  login,
  resetJudgePassword
} = require("../controller/authController");


// =========================
// REGISTER
// =========================

router.post(
  "/register",
  register
);


// =========================
// LOGIN
// =========================

router.post(
  "/login",
  login
);


// =========================
// TEMPORARY JUDGE PASSWORD RESET
// =========================

router.post(
  "/reset-judge-password",
  resetJudgePassword
);


module.exports = router;