const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

const User = require("./models/User");

dotenv.config();


const createUsers = async () => {

  try {

    await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log(
      "MongoDB connected"
    );


    const password = await bcrypt.hash(
      "12345678",
      10
    );


    // =========================
    // JUDGE
    // =========================

    await User.findOneAndUpdate(
      {
        email: "judge@example.com"
      },

      {
        name: "DOGFOOD Judge",
        email: "judge@example.com",
        password: password,
        role: "judge"
      },

      {
        upsert: true,
        new: true
      }
    );


    // =========================
    // ORGANIZER
    // =========================

    await User.findOneAndUpdate(
      {
        email: "organizer@example.com"
      },

      {
        name: "DOGFOOD Organizer",
        email: "organizer@example.com",
        password: password,
        role: "organizer"
      },

      {
        upsert: true,
        new: true
      }
    );


    console.log(
      "Users created successfully"
    );

    console.log("");
    console.log(
      "JUDGE:"
    );
    console.log(
      "judge@example.com"
    );
    console.log(
      "12345678"
    );

    console.log("");

    console.log(
      "ORGANIZER:"
    );
    console.log(
      "organizer@example.com"
    );
    console.log(
      "12345678"
    );


    await mongoose.disconnect();

  }

  catch (error) {

    console.error(
      "ERROR:",
      error
    );

    process.exit(1);

  }

};


createUsers();