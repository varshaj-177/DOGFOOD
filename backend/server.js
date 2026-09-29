const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();


// =========================
// CORS
// =========================

app.use(
  cors({
    origin: function (origin, callback) {
      if (
        !origin ||
        /^http:\/\/localhost:\d+$/.test(origin)
      ) {
        callback(null, true);
      } else {
        callback(
          new Error("Not allowed by CORS")
        );
      }
    },
    credentials: true
  })
);


// =========================
// JSON
// =========================

app.use(express.json());


// =========================
// ROUTES
// =========================

const authRoutes = require("./routes/authRoutes");

const judgeRoutes =
  require("./routes/judgeRoutes");

const judgeScoreRoutes =
  require("./routes/judgeScoreRoutes");

const submissionRoutes =
  require("./routes/submissionRoutes");

const hackathonRoutes =
  require("./routes/hackathonRoutes");

const resultRoutes =
  require("./routes/resultRoutes");

const teamRoutes =
  require("./routes/teamRoutes");


// =========================
// USE ROUTES
// =========================

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/judges",
  judgeRoutes
);

app.use(
  "/api/judge-scores",
  judgeScoreRoutes
);

app.use(
  "/api/submissions",
  submissionRoutes
);

app.use(
  "/api/hackathons",
  hackathonRoutes
);

app.use(
  "/api/results",
  resultRoutes
);

app.use(
  "/api/teams",
  teamRoutes
);


// =========================
// HOME
// =========================

app.get("/", (req, res) => {
  res.json({
    message:
      "DOGFOOD backend is running"
  });
});


// =========================
// DATABASE
// =========================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");

    console.log(
      "CONNECTED DATABASE:",
      mongoose.connection.name
    );

    console.log(
      "CONNECTED HOST:",
      mongoose.connection.host
    );

    app.listen(5000, () => {
      console.log("Server running on port 5000");
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
  });