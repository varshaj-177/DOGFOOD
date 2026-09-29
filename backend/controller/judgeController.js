const JudgeAssignment = require("../models/JudgeAssignment");
const Submission = require("../models/Submission");
const User = require("../models/User");


// ==========================================
// ASSIGN JUDGE TO SUBMISSION
// ==========================================

const assignJudge = async (req, res) => {
  try {
    const {
      submissionId,
      judgeId
    } = req.body;

    // Check required fields
    if (!submissionId || !judgeId) {
      return res.status(400).json({
        message:
          "Submission ID and Judge ID are required"
      });
    }


    // Find submission
    const submission =
      await Submission.findById(
        submissionId
      );

    if (!submission) {
      return res.status(404).json({
        message:
          "Submission not found"
      });
    }


    // Find judge
    const judge =
      await User.findById(judgeId);

    if (!judge) {
      return res.status(404).json({
        message:
          "Judge not found"
      });
    }


    // Make sure selected user is a judge
    if (judge.role !== "judge") {
      return res.status(400).json({
        message:
          "Selected user is not a judge"
      });
    }


    // Check if already assigned
    const existingAssignment =
      await JudgeAssignment.findOne({
        submission: submissionId,
        judge: judgeId
      });

    if (existingAssignment) {
      return res.status(400).json({
        message:
          "Judge is already assigned to this submission"
      });
    }


    // Create assignment
    const assignment =
      await JudgeAssignment.create({
        hackathon:
          submission.hackathon,

        submission:
          submissionId,

        judge:
          judgeId
      });


    // Get complete assignment
    const result =
      await JudgeAssignment.findById(
        assignment._id
      )
        .populate(
          "judge",
          "name email"
        )
        .populate(
          "submission",
          "title description githubUrl demoUrl"
        )
        .populate(
          "hackathon",
          "title"
        );


    res.status(201).json({
      message:
        "Judge assigned successfully",

      assignment:
        result
    });

  } catch (error) {

    console.error(
      "ASSIGN JUDGE ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Failed to assign judge",

      error:
        error.message
    });
  }
};



// ==========================================
// GET JUDGE ASSIGNMENTS
// ==========================================

const getJudgeAssignments =
  async (req, res) => {

    try {

      const assignments =
        await JudgeAssignment.find({
          judge: req.user.id
        })
          .populate("submission")
          .populate(
            "hackathon",
            "title"
          );

      res.json(assignments);

    } catch (error) {

      console.error(
        "GET ASSIGNMENTS ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch judge assignments",

        error:
          error.message
      });
    }
  };



// ==========================================
// GET ALL JUDGES
// ==========================================

const getJudges =
  async (req, res) => {

    try {

      const judges =
        await User.find(
          {
            role: "judge"
          },
          "name email"
        ).sort({
          name: 1
        });

      res.json(judges);

    } catch (error) {

      console.error(
        "GET JUDGES ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch judges",

        error:
          error.message
      });
    }
  };



module.exports = {
  assignJudge,
  getJudgeAssignments,
  getJudges
};