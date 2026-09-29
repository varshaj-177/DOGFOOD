const Submission = require("../models/Submission");
const Team = require("../models/Team");
const Hackathon = require("../models/Hackathon");

const createSubmission = async (req, res) => {
  try {
    const {
      teamId,
      title,
      description,
      githubUrl,
      demoUrl
    } = req.body;

    if (!teamId || !title || !description || !githubUrl) {
      return res.status(400).json({
        message:
          "Team ID, title, description and GitHub URL are required"
      });
    }

    // Find team
    const team = await Team.findById(teamId);

    if (!team) {
      return res.status(404).json({
        message: "Team not found"
      });
    }

    // Only team leader can submit
    if (team.leader.toString() !== req.user.id) {
      return res.status(403).json({
        message:
          "Only the team leader can submit the project"
      });
    }

    // Find hackathon
    const hackathon = await Hackathon.findById(
      team.hackathon
    );

    if (!hackathon) {
      return res.status(404).json({
        message: "Hackathon not found"
      });
    }

    // Check submission deadline
    if (
      new Date() >
      new Date(hackathon.submissionDeadline)
    ) {
      return res.status(400).json({
        message: "Submission deadline has passed"
      });
    }

    // Check existing submission
    const existingSubmission =
      await Submission.findOne({
        team: teamId
      });

    if (existingSubmission) {
      return res.status(400).json({
        message:
          "This team has already submitted a project"
      });
    }

    const submission = await Submission.create({
      team: teamId,
      hackathon: team.hackathon,
      title,
      description,
      githubUrl,
      demoUrl
    });

    res.status(201).json({
      message: "Project submitted successfully",
      submission
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to submit project",
      error: error.message
    });
  }
};


// ==========================================
// GET ALL SUBMISSIONS FOR A HACKATHON
// ==========================================

const getSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({
      hackathon: req.params.hackathonId
    })
      .populate("team", "name leader members")
      .populate("hackathon", "title");

    res.json(submissions);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch submissions",
      error: error.message
    });
  }
};


// ==========================================
// GET MY SUBMISSION
// ==========================================

const getMySubmission = async (req, res) => {
  try {
    // Find teams where current user is leader/member
    const teams = await Team.find({
      hackathon: req.params.hackathonId,
      members: req.user.id
    });

    if (!teams || teams.length === 0) {
      return res.status(404).json({
        message: "You are not part of a team"
      });
    }

    // Find submission made by any of user's teams
    const teamIds = teams.map(
      (team) => team._id
    );

    const submission =
      await Submission.findOne({
        hackathon: req.params.hackathonId,
        team: { $in: teamIds }
      }).populate(
        "team",
        "name leader members"
      );

    if (!submission) {
      return res.status(404).json({
        message: "No submission found"
      });
    }

    res.json({
      submission
    });
  } catch (error) {
    res.status(500).json({
      message:
        "Failed to fetch your submission",
      error: error.message
    });
  }
};


module.exports = {
  createSubmission,
  getSubmissions,
  getMySubmission
};