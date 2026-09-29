const mongoose = require("mongoose");

const judgeScoreSchema = new mongoose.Schema(
  {
    submission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Submission",
      required: true
    },

    judge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    technicalQuality: {
      type: Number,
      required: true,
      min: 0,
      max: 10
    },

    innovation: {
      type: Number,
      required: true,
      min: 0,
      max: 10
    },

    uiux: {
      type: Number,
      required: true,
      min: 0,
      max: 10
    },

    impact: {
      type: Number,
      required: true,
      min: 0,
      max: 10
    },

    presentation: {
      type: Number,
      required: true,
      min: 0,
      max: 10
    },

    totalScore: {
      type: Number,
      required: true
    },

    comments: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("JudgeScore", judgeScoreSchema);