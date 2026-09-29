const JudgeScore = require("../models/JudgeScore");
const JudgeAssignment = require("../models/JudgeAssignment");
const Submission = require("../models/Submission");
const Team = require("../models/Team");


// ==========================================
// SUBMIT SCORE
// ==========================================

const submitScore = async (req, res) => {
  try {
    const {
      submissionId,
      technicalQuality,
      innovation,
      uiux,
      impact,
      presentation,
      comments
    } = req.body;

    if (
      !submissionId ||
      technicalQuality === undefined ||
      innovation === undefined ||
      uiux === undefined ||
      impact === undefined ||
      presentation === undefined
    ) {
      return res.status(400).json({
        message: "All score fields are required"
      });
    }

    const scores = [
      technicalQuality,
      innovation,
      uiux,
      impact,
      presentation
    ];

    for (const score of scores) {
      if (
        Number(score) < 0 ||
        Number(score) > 10 ||
        isNaN(Number(score))
      ) {
        return res.status(400).json({
          message: "Each score must be between 0 and 10"
        });
      }
    }

    const assignment =
      await JudgeAssignment.findOne({
        submission: submissionId,
        judge: req.user.id
      });

    if (!assignment) {
      return res.status(403).json({
        message:
          "You are not assigned to this submission"
      });
    }

    const existingScore =
      await JudgeScore.findOne({
        submission: submissionId,
        judge: req.user.id
      });

    if (existingScore) {
      return res.status(400).json({
        message:
          "You have already scored this submission"
      });
    }

    const totalScore =
      Number(technicalQuality) +
      Number(innovation) +
      Number(uiux) +
      Number(impact) +
      Number(presentation);

    const score =
      await JudgeScore.create({
        submission: submissionId,
        judge: req.user.id,
        technicalQuality: Number(
          technicalQuality
        ),
        innovation: Number(
          innovation
        ),
        uiux: Number(uiux),
        impact: Number(impact),
        presentation: Number(
          presentation
        ),
        totalScore,
        comments: comments || ""
      });

    assignment.status = "completed";

    await assignment.save();

    res.status(201).json({
      message:
        "Score submitted successfully",
      score
    });

  } catch (error) {
    console.error(
      "SUBMIT SCORE ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Failed to submit score",
      error: error.message
    });
  }
};


// ==========================================
// GET MY SCORES - JUDGE
// ==========================================

const getMyScores = async (req, res) => {
  try {
    const scores =
      await JudgeScore.find({
        judge: req.user.id
      })
        .populate(
          "submission",
          "title description githubUrl demoUrl"
        );

    res.json(scores);

  } catch (error) {
    console.error(
      "GET MY SCORES ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch scores",
      error: error.message
    });
  }
};


// ==========================================
// GET PARTICIPANT RESULT
// ==========================================

const getParticipantResult = async (req, res) => {
  try {
    const { hackathonId } = req.params;

    console.log(
      "GET PARTICIPANT RESULT:",
      {
        participant: req.user.id,
        hackathonId
      }
    );

    // ------------------------------------------
    // FIND PARTICIPANT'S TEAM
    // ------------------------------------------

    const teams = await Team.find({
      hackathon: hackathonId,
      members: req.user.id
    });

    console.log(
      "PARTICIPANT TEAMS:",
      teams.map((team) => ({
        id: team._id,
        name: team.name,
        hackathon: team.hackathon,
        members: team.members
      }))
    );

    if (!teams || teams.length === 0) {
      return res.status(404).json({
        message: "You are not part of a team"
      });
    }

    const teamIds = teams.map(
      (team) => team._id
    );

    // ------------------------------------------
    // FIND SUBMISSION USING TEAM
    // ------------------------------------------

    let submission =
      await Submission.findOne({
        team: { $in: teamIds }
      });

    // ------------------------------------------
    // FALLBACK:
    // If the submission exists but its stored
    // hackathon value is inconsistent, still
    // locate it through the participant's team.
    // ------------------------------------------

    if (!submission) {
      submission =
        await Submission.findOne({
          hackathon: hackathonId,
          team: { $in: teamIds }
        });
    }

    console.log(
      "PARTICIPANT SUBMISSION:",
      submission
        ? {
            id: submission._id,
            title: submission.title,
            team: submission.team,
            hackathon: submission.hackathon
          }
        : null
    );

    if (!submission) {
      return res.status(404).json({
        message: "No submission found"
      });
    }

    // ------------------------------------------
    // FIND JUDGE SCORES
    // ------------------------------------------

    const scores =
      await JudgeScore.find({
        submission: submission._id
      }).select(
        "technicalQuality innovation uiux impact presentation totalScore comments"
      );

    console.log(
      "PARTICIPANT SCORES:",
      scores
    );

    // ------------------------------------------
    // NO EVALUATION YET
    // ------------------------------------------

    if (!scores || scores.length === 0) {
      return res.json({
        evaluated: false,
        message:
          "Your project has not been evaluated yet"
      });
    }

    // ------------------------------------------
    // CALCULATE RESULT
    // ------------------------------------------

    const total =
      scores.reduce(
        (sum, score) =>
          sum + Number(score.totalScore),
        0
      );

    const averageScore =
      total / scores.length;

    const percentage =
      (averageScore / 50) * 100;

    // ------------------------------------------
    // RETURN RESULT
    // ------------------------------------------

    res.json({
      evaluated: true,

      submission: {
        id: submission._id,
        title: submission.title
      },

      evaluation: {
        judgeCount: scores.length,

        averageScore: Number(
          averageScore.toFixed(2)
        ),

        maxScore: 50,

        percentage: Number(
          percentage.toFixed(2)
        ),

        scores
      }
    });

  } catch (error) {
    console.error(
      "GET PARTICIPANT RESULT ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch participant result",
      error: error.message
    });
  }
};


module.exports = {
  submitScore,
  getMyScores,
  getParticipantResult
};