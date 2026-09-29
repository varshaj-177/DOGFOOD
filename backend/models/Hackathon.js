const mongoose = require("mongoose");

const hackathonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true
    },

    startDate: {
      type: Date,
      required: true
    },

    endDate: {
      type: Date,
      required: true
    },

    registrationDeadline: {
      type: Date,
      required: true
    },

    submissionDeadline: {
      type: Date,
      required: true
    },

    status: {
      type: String,
      enum: ["draft", "upcoming", "active", "completed"],
      default: "draft"
    },

    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    maxTeamSize: {
      type: Number,
      default: 4
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Hackathon", hackathonSchema);