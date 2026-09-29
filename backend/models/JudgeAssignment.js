const mongoose = require("mongoose");

const judgeAssignmentSchema = new mongoose.Schema(
  {
    hackathon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hackathon",
      required: true
    },

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

    status: {
      type: String,
      enum: ["assigned", "completed"],
      default: "assigned"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "JudgeAssignment",
  judgeAssignmentSchema
);