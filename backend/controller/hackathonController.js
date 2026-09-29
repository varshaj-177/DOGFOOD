const Hackathon = require("../models/Hackathon");

const createHackathon = async (req, res) => {
  try {
    const {
      title,
      description,
      startDate,
      endDate,
      registrationDeadline,
      submissionDeadline,
      maxTeamSize
    } = req.body;

    if (
      !title ||
      !description ||
      !startDate ||
      !endDate ||
      !registrationDeadline ||
      !submissionDeadline ||
      !maxTeamSize
    ) {
      return res.status(400).json({
        message: "All hackathon fields are required"
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const registration = new Date(registrationDeadline);
    const submission = new Date(submissionDeadline);

    if (
      isNaN(start.getTime()) ||
      isNaN(end.getTime()) ||
      isNaN(registration.getTime()) ||
      isNaN(submission.getTime())
    ) {
      return res.status(400).json({
        message: "Invalid date format"
      });
    }

    if (registration > start) {
      return res.status(400).json({
        message:
          "Registration deadline must be before the hackathon starts"
      });
    }

    if (submission > end) {
      return res.status(400).json({
        message:
          "Submission deadline cannot be after the hackathon ends"
      });
    }

    if (end <= start) {
      return res.status(400).json({
        message: "End date must be after start date"
      });
    }

    if (Number(maxTeamSize) < 1) {
      return res.status(400).json({
        message: "Maximum team size must be at least 1"
      });
    }

    const existingHackathon = await Hackathon.findOne({
      title: title.trim()
    });

    if (existingHackathon) {
      return res.status(400).json({
        message: "A hackathon with this title already exists"
      });
    }

    const hackathon = await Hackathon.create({
      title: title.trim(),
      description: description.trim(),
      startDate: start,
      endDate: end,
      registrationDeadline: registration,
      submissionDeadline: submission,
      status: "upcoming",
      organizer: req.user.id,
      maxTeamSize: Number(maxTeamSize)
    });

    res.status(201).json({
      message: "Hackathon created successfully",
      hackathon
    });
  } catch (error) {
    console.error("CREATE HACKATHON ERROR:", error);

    res.status(500).json({
      message: "Failed to create hackathon",
      error: error.message
    });
  }
};


const getHackathons = async (req, res) => {
  try {
    const hackathons = await Hackathon.find()
      .populate("organizer", "name email")
      .sort({
        startDate: 1
      });

    res.json(hackathons);
  } catch (error) {
    console.error("GET HACKATHONS ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch hackathons",
      error: error.message
    });
  }
};


const getHackathonById = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(
      req.params.id
    ).populate(
      "organizer",
      "name email"
    );

    if (!hackathon) {
      return res.status(404).json({
        message: "Hackathon not found"
      });
    }

    res.json(hackathon);
  } catch (error) {
    console.error("GET HACKATHON ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch hackathon",
      error: error.message
    });
  }
};


/*
  UPDATE HACKATHON
*/
const updateHackathon = async (req, res) => {
  try {
    const {
      title,
      description,
      startDate,
      endDate,
      registrationDeadline,
      submissionDeadline,
      maxTeamSize,
      status
    } = req.body;

    const hackathon = await Hackathon.findById(
      req.params.id
    );

    if (!hackathon) {
      return res.status(404).json({
        message: "Hackathon not found"
      });
    }

    // Only the organizer who created it
    // or an admin can update it.
    if (
      hackathon.organizer.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message:
          "You are not allowed to update this hackathon"
      });
    }

    if (
      !title ||
      !description ||
      !startDate ||
      !endDate ||
      !registrationDeadline ||
      !submissionDeadline ||
      !maxTeamSize
    ) {
      return res.status(400).json({
        message: "All hackathon fields are required"
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const registration = new Date(
      registrationDeadline
    );
    const submission = new Date(
      submissionDeadline
    );

    if (
      isNaN(start.getTime()) ||
      isNaN(end.getTime()) ||
      isNaN(registration.getTime()) ||
      isNaN(submission.getTime())
    ) {
      return res.status(400).json({
        message: "Invalid date format"
      });
    }

    if (registration > start) {
      return res.status(400).json({
        message:
          "Registration deadline must be before the hackathon starts"
      });
    }

    if (submission > end) {
      return res.status(400).json({
        message:
          "Submission deadline cannot be after the hackathon ends"
      });
    }

    if (end <= start) {
      return res.status(400).json({
        message:
          "End date must be after start date"
      });
    }

    if (Number(maxTeamSize) < 1) {
      return res.status(400).json({
        message:
          "Maximum team size must be at least 1"
      });
    }

    const duplicateTitle =
      await Hackathon.findOne({
        title: title.trim(),
        _id: {
          $ne: req.params.id
        }
      });

    if (duplicateTitle) {
      return res.status(400).json({
        message:
          "Another hackathon with this title already exists"
      });
    }

    hackathon.title = title.trim();
    hackathon.description =
      description.trim();
    hackathon.startDate = start;
    hackathon.endDate = end;
    hackathon.registrationDeadline =
      registration;
    hackathon.submissionDeadline =
      submission;
    hackathon.maxTeamSize =
      Number(maxTeamSize);

    if (
      status &&
      [
        "draft",
        "upcoming",
        "active",
        "completed"
      ].includes(status)
    ) {
      hackathon.status = status;
    }

    await hackathon.save();

    res.json({
      message:
        "Hackathon updated successfully",
      hackathon
    });
  } catch (error) {
    console.error(
      "UPDATE HACKATHON ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Failed to update hackathon",
      error: error.message
    });
  }
};


/*
  DELETE HACKATHON
*/
const deleteHackathon = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(
      req.params.id
    );

    if (!hackathon) {
      return res.status(404).json({
        message: "Hackathon not found"
      });
    }

    // Only the organizer who created it
    // or an admin can delete it.
    if (
      hackathon.organizer.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message:
          "You are not allowed to delete this hackathon"
      });
    }

    await Hackathon.findByIdAndDelete(
      req.params.id
    );

    res.json({
      message:
        "Hackathon deleted successfully"
    });
  } catch (error) {
    console.error(
      "DELETE HACKATHON ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Failed to delete hackathon",
      error: error.message
    });
  }
};


module.exports = {
  createHackathon,
  getHackathons,
  getHackathonById,
  updateHackathon,
  deleteHackathon
};