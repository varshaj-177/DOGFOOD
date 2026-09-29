const Team = require("../models/Team");
const Hackathon = require("../models/Hackathon");
const User = require("../models/User");

// Create a team
const createTeam = async (req, res) => {
  try {
    const { name, hackathonId } = req.body;

    if (!name || !hackathonId) {
      return res.status(400).json({
        message: "Team name and hackathon ID are required"
      });
    }

    const hackathon = await Hackathon.findById(hackathonId);

    if (!hackathon) {
      return res.status(404).json({
        message: "Hackathon not found"
      });
    }

    const existingTeam = await Team.findOne({
      hackathon: hackathonId,
      leader: req.user.id
    });

    if (existingTeam) {
      return res.status(400).json({
        message: "You already created a team for this hackathon"
      });
    }

    const team = await Team.create({
      name,
      hackathon: hackathonId,
      leader: req.user.id,
      members: [req.user.id]
    });

    res.status(201).json({
      message: "Team created successfully",
      team
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to create team",
      error: error.message
    });
  }
};


// Get teams for a hackathon
const getTeams = async (req, res) => {
  try {
    const teams = await Team.find({
      hackathon: req.params.hackathonId
    })
      .populate("leader", "name email")
      .populate("members", "name email");

    res.json(teams);

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch teams",
      error: error.message
    });
  }
};
const addTeamMember = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Member email is required"
      });
    }

    const team = await Team.findById(req.params.teamId);

    if (!team) {
      return res.status(404).json({
        message: "Team not found"
      });
    }

    // Only team leader can add members
    if (team.leader.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Only the team leader can add members"
      });
    }

    const hackathon = await Hackathon.findById(team.hackathon);

    if (!hackathon) {
      return res.status(404).json({
        message: "Hackathon not found"
      });
    }

    // Check team size
    if (team.members.length >= hackathon.maxTeamSize) {
      return res.status(400).json({
        message: `Team cannot have more than ${hackathon.maxTeamSize} members`
      });
    }

    // Find user
    const user = await User.findOne({
      email: email.toLowerCase()
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // Only participants can join teams
    if (user.role !== "participant") {
      return res.status(400).json({
        message: "Only participants can join teams"
      });
    }

    // Check if already in this team
    if (team.members.some(member => member.toString() === user._id.toString())) {
      return res.status(400).json({
        message: "User is already a member of this team"
      });
    }

    // Check if user already belongs to another team
    const existingTeam = await Team.findOne({
      hackathon: team.hackathon,
      members: user._id
    });

    if (existingTeam) {
      return res.status(400).json({
        message: "User is already part of another team in this hackathon"
      });
    }

    team.members.push(user._id);

    await team.save();

    const updatedTeam = await Team.findById(team._id)
      .populate("leader", "name email")
      .populate("members", "name email");

    res.json({
      message: "Team member added successfully",
      team: updatedTeam
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to add team member",
      error: error.message
    });
  }
};


module.exports = {
  createTeam,
  getTeams,
  addTeamMember
};