const JudgeScore = require("../models/JudgeScore");
const Submission = require("../models/Submission");
const Team = require("../models/Team");


// Get hackathon results
const getResults = async (req, res) => {
  try {
    const { hackathonId } = req.params;

    const submissions = await Submission.find({
      hackathon: hackathonId
    })
      .populate("team", "name leader members")
      .populate("hackathon", "title");

    const results = [];

    for (const submission of submissions) {
      const scores = await JudgeScore.find({
        submission: submission._id
      });

      if (scores.length === 0) {
        results.push({
          submissionId: submission._id,
          title: submission.title,
          description: submission.description,
          githubUrl: submission.githubUrl,
          demoUrl: submission.demoUrl,
          team: submission.team,
          evaluated: false,
          judgeCount: 0,
          averageScore: 0,
          percentage: 0
        });

        continue;
      }

      const totalScore = scores.reduce(
        (sum, score) =>
          sum + Number(score.totalScore),
        0
      );

      const averageScore =
        totalScore / scores.length;

      results.push({
        submissionId: submission._id,
        title: submission.title,
        description: submission.description,
        githubUrl: submission.githubUrl,
        demoUrl: submission.demoUrl,
        team: submission.team,
        evaluated: true,
        judgeCount: scores.length,
        averageScore: Number(
          averageScore.toFixed(2)
        ),
        percentage: Number(
          ((averageScore / 50) * 100).toFixed(2)
        )
      });
    }

    // Highest score first
    results.sort(
      (a, b) =>
        b.averageScore - a.averageScore
    );

    // Add rank
    results.forEach((result, index) => {
      result.rank = index + 1;
    });

    res.json(results);

  } catch (error) {
    console.error(
      "GET RESULTS ERROR:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch results",
      error: error.message
    });
  }
};


// Get leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const { hackathonId } = req.params;

    const submissions = await Submission.find({
      hackathon: hackathonId
    }).populate(
      "team",
      "name leader members"
    );

    const leaderboard = [];

    for (const submission of submissions) {
      const scores = await JudgeScore.find({
        submission: submission._id
      });

      // Only evaluated projects appear
      // in the leaderboard
      if (scores.length === 0) {
        continue;
      }

      const totalScore = scores.reduce(
        (sum, score) =>
          sum + Number(score.totalScore),
        0
      );

      const averageScore =
        totalScore / scores.length;

      leaderboard.push({
        submissionId: submission._id,
        teamName:
          submission.team?.name || "Unknown Team",
        projectTitle: submission.title,
        judgeCount: scores.length,
        averageScore: Number(
          averageScore.toFixed(2)
        ),
        maxScore: 50,
        percentage: Number(
          ((averageScore / 50) * 100).toFixed(2)
        )
      });
    }

    // Sort by highest average score
    leaderboard.sort(
      (a, b) =>
        b.averageScore - a.averageScore
    );

    // Add rank
    leaderboard.forEach(
      (item, index) => {
        item.rank = index + 1;
      }
    );

    res.json({
      hackathonId,
      leaderboard
    });

  } catch (error) {
    console.error(
      "GET LEADERBOARD ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch leaderboard",
      error: error.message
    });
  }
};


module.exports = {
  getResults,
  getLeaderboard
};