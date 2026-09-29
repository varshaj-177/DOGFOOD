import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api";

function ParticipantDashboard() {
  const [user, setUser] = useState(null);
  const [hackathons, setHackathons] = useState([]);
  const [selectedHackathon, setSelectedHackathon] =
    useState(null);

  const [team, setTeam] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [evaluation, setEvaluation] = useState(null);

  const [memberEmail, setMemberEmail] = useState("");

  const [teamName, setTeamName] = useState("");
  const [projectTitle, setProjectTitle] =
    useState("");
  const [description, setDescription] =
    useState("");
  const [githubUrl, setGithubUrl] =
    useState("");
  const [demoUrl, setDemoUrl] = useState("");

  const [activeSection, setActiveSection] =
    useState("overview");

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser =
      localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }

    fetchHackathons();
  }, []);

  const getToken = () =>
    localStorage.getItem("token");

  const fetchHackathons = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        setError(
          "Your login session has expired. Please login again."
        );
        return;
      }

      const response = await fetch(
        `${API_URL}/hackathons`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch hackathons"
        );
      }

      const list = Array.isArray(data)
        ? data
        : data.hackathons || [];

      setHackathons(list);

      if (list.length > 0) {
        selectHackathon(list[0]);
      }
    } catch (err) {
      console.error(
        "FETCH HACKATHONS ERROR:",
        err
      );

      setError(
        err.message ||
          "Failed to fetch hackathons"
      );
    } finally {
      setLoading(false);
    }
  };

  const selectHackathon = async (
    hackathon
  ) => {
    setSelectedHackathon(hackathon);

    setTeam(null);
    setSubmission(null);
    setEvaluation(null);

    setProjectTitle("");
    setDescription("");
    setGithubUrl("");
    setDemoUrl("");

    await Promise.all([
      fetchMyTeam(hackathon._id),
      fetchMySubmission(hackathon._id),
      fetchEvaluation(hackathon._id)
    ]);
  };

  const fetchMyTeam = async (
    hackathonId
  ) => {
    try {
      const response = await fetch(
        `${API_URL}/teams/hackathon/${hackathonId}`
      );

      const data = await response.json();

      if (!response.ok) {
        return;
      }

      const teams = Array.isArray(data)
        ? data
        : data.teams || [];

      const currentUser = JSON.parse(
        localStorage.getItem("user")
      );

      const myTeam = teams.find((item) =>
        item.members?.some(
          (member) =>
            String(
              member._id || member
            ) ===
            String(currentUser?.id)
        )
      );

      setTeam(myTeam || null);
    } catch {
      setTeam(null);
    }
  };

  const fetchMySubmission = async (
    hackathonId
  ) => {
    try {
      const response = await fetch(
        `${API_URL}/submissions/my/${hackathonId}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setSubmission(null);
        return;
      }

      const currentSubmission =
        data.submission || data;

      setSubmission(currentSubmission);

      if (currentSubmission) {
        setProjectTitle(
          currentSubmission.title || ""
        );

        setDescription(
          currentSubmission.description ||
            ""
        );

        setGithubUrl(
          currentSubmission.githubUrl || ""
        );

        setDemoUrl(
          currentSubmission.demoUrl || ""
        );
      }
    } catch {
      setSubmission(null);
    }
  };

  const fetchEvaluation = async (
    hackathonId
  ) => {
    try {
      setError("");
      setMessage("");

      if (!hackathonId) {
        setError("No hackathon selected.");
        return;
      }

      const token = getToken();

      if (!token) {
        setError(
          "Your login session has expired. Please login again."
        );
        return;
      }

      const response = await fetch(
        `${API_URL}/judge-scores/participant-result/${hackathonId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch evaluation"
        );
      }

      setEvaluation(data);

      if (data.evaluated) {
        setMessage(
          "Evaluation refreshed successfully!"
        );
      } else {
        setMessage(
          "Your project has not been evaluated yet."
        );
      }
    } catch (err) {
      console.error(
        "FETCH EVALUATION ERROR:",
        err
      );

      setEvaluation(null);

      setError(
        err.message ||
          "Failed to refresh evaluation."
      );
    }
  };

  const createTeam = async (event) => {
    event.preventDefault();

    try {
      setMessage("");
      setError("");

      if (!selectedHackathon) {
        setError(
          "Please select a hackathon"
        );
        return;
      }

      const response = await fetch(
        `${API_URL}/teams`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`
          },
          body: JSON.stringify({
            name: teamName,
            hackathonId:
              selectedHackathon._id
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to create team"
        );
      }

      setMessage(
        "Team created successfully!"
      );

      setTeamName("");

      await fetchMyTeam(
        selectedHackathon._id
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const addMember = async (event) => {
    event.preventDefault();

    try {
      setMessage("");
      setError("");

      if (!team) {
        setError("Create a team first");
        return;
      }

      const response = await fetch(
        `${API_URL}/teams/${team._id}/members`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`
          },
          body: JSON.stringify({
            email: memberEmail
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to add member"
        );
      }

      setMessage(
        "Team member added successfully!"
      );

      setMemberEmail("");

      await fetchMyTeam(
        selectedHackathon._id
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const submitProject = async (event) => {
    event.preventDefault();

    try {
      setMessage("");
      setError("");

      if (!team) {
        setError(
          "Create a team before submitting"
        );
        return;
      }

      if (submission) {
        setError(
          "Your team has already submitted a project"
        );
        return;
      }

      const response = await fetch(
        `${API_URL}/submissions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`
          },
          body: JSON.stringify({
            teamId: team._id,
            title: projectTitle,
            description,
            githubUrl,
            demoUrl
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to submit project"
        );
      }

      setMessage(
        "Project submitted successfully!"
      );

      await fetchMySubmission(
        selectedHackathon._id
      );

      setActiveSection("submission");
    } catch (err) {
      setError(err.message);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const formatDate = (date) => {
    if (!date) {
      return "Not specified";
    }

    return new Date(date).toLocaleString(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short"
      }
    );
  };

  const getHackathonStatus = (
    hackathon
  ) => {
    if (!hackathon) {
      return "Unknown";
    }

    const now = new Date();

    const start = hackathon.startDate
      ? new Date(hackathon.startDate)
      : null;

    const end = hackathon.endDate
      ? new Date(hackathon.endDate)
      : null;

    const deadline =
      hackathon.submissionDeadline
        ? new Date(
            hackathon.submissionDeadline
          )
        : null;

    if (start && now < start) {
      return "Upcoming";
    }

    if (
      deadline &&
      now > deadline
    ) {
      return "Submission Closed";
    }

    if (end && now > end) {
      return "Completed";
    }

    return "Active";
  };

  const isSubmissionClosed = () => {
    if (!selectedHackathon) {
      return false;
    }

    if (
      !selectedHackathon.submissionDeadline
    ) {
      return false;
    }

    return (
      new Date() >
      new Date(
        selectedHackathon.submissionDeadline
      )
    );
  };

  if (loading) {
    return (
      <div className="participant-loading">
        <div className="loading-ring"></div>

        <div className="loading-brand">
          DOGFOOD
        </div>

        <div className="loading-text">
          Loading participant dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="participant-page">

      {/* =========================
          HEADER
      ========================= */}

      <header className="participant-header">

        <div className="brand-area">

          <div className="brand-row">

            <div className="brand-icon">
              ⚡
            </div>

            <h1>
              DOGFOOD
            </h1>

            <span className="year-badge">
              2026
            </span>

          </div>

          <p>
            Participant Dashboard
          </p>

        </div>

        <div className="user-area">

          <div className="user-profile">

            <div className="user-avatar">
              {(user?.name || "P")
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <strong>
                {user?.name ||
                  "Participant"}
              </strong>

              <span>
                Participant
              </span>
            </div>

          </div>

          <button
            onClick={logout}
            className="logout-button"
          >
            ↪ Logout
          </button>

        </div>

      </header>

      <main className="participant-container">

        {/* =========================
            ALERTS
        ========================= */}

        {message && (
          <div className="alert success-alert">
            <span>✓</span>
            {message}
          </div>
        )}

        {error && (
          <div className="alert error-alert">
            <span>!</span>
            {error}
          </div>
        )}

        {hackathons.length === 0 ? (

          <div className="premium-card empty-main">

            <div className="empty-symbol">
              ◈
            </div>

            <h2>
              No Hackathons Available
            </h2>

            <p>
              There are currently no
              hackathons available.
            </p>

          </div>

        ) : (

          <>

            {/* =========================
                HACKATHON SELECTOR
            ========================= */}

            <div className="premium-card">

              <div className="section-heading">

                <div>
                  <span className="eyebrow">
                    EVENT
                  </span>

                  <h2>
                    Select Hackathon
                  </h2>
                </div>

                <div className="gold-icon">
                  ◆
                </div>

              </div>

              <select
                value={
                  selectedHackathon?._id ||
                  ""
                }
                onChange={(event) => {
                  const hackathon =
                    hackathons.find(
                      (item) =>
                        item._id ===
                        event.target.value
                    );

                  if (hackathon) {
                    selectHackathon(
                      hackathon
                    );
                  }
                }}
                className="premium-select"
              >
                {hackathons.map(
                  (hackathon) => (
                    <option
                      key={hackathon._id}
                      value={hackathon._id}
                    >
                      {hackathon.title}
                    </option>
                  )
                )}
              </select>

            </div>

            {selectedHackathon && (
              <>

                {/* =========================
                    HERO
                ========================= */}

                <div className="hackathon-hero">

                  <div className="hero-decoration"></div>

                  <div className="hero-content">

                    <span>
                      CURRENT HACKATHON
                    </span>

                    <h2>
                      {selectedHackathon.title}
                    </h2>

                    <p>
                      {selectedHackathon.description ||
                        "Welcome to DOGFOOD 2026."}
                    </p>

                  </div>

                  <div className="hero-status">

                    <span className="status-dot"></span>

                    {getHackathonStatus(
                      selectedHackathon
                    )}

                  </div>

                </div>

                {/* =========================
                    INFO CARDS
                ========================= */}

                <div className="info-grid">

                  <InfoCard
                    icon="◷"
                    label="START DATE"
                    value={formatDate(
                      selectedHackathon.startDate
                    )}
                  />

                  <InfoCard
                    icon="◷"
                    label="END DATE"
                    value={formatDate(
                      selectedHackathon.endDate
                    )}
                  />

                  <InfoCard
                    icon="⏱"
                    label="SUBMISSION DEADLINE"
                    value={formatDate(
                      selectedHackathon.submissionDeadline
                    )}
                  />

                  <InfoCard
                    icon="♟"
                    label="MAX TEAM SIZE"
                    value={
                      selectedHackathon.maxTeamSize ||
                      "Not specified"
                    }
                  />

                </div>

                {/* =========================
                    NAVIGATION
                ========================= */}

                <nav className="dashboard-nav">

                  {[
                    {
                      id: "overview",
                      icon: "◈",
                      label: "Overview"
                    },
                    {
                      id: "team",
                      icon: "♟",
                      label: "My Team"
                    },
                    {
                      id: "submission",
                      icon: "◆",
                      label: "Submission"
                    },
                    {
                      id: "evaluation",
                      icon: "★",
                      label: "Evaluation"
                    }
                  ].map((item) => (

                    <button
                      key={item.id}
                      onClick={() =>
                        setActiveSection(
                          item.id
                        )
                      }
                      className={
                        activeSection ===
                        item.id
                          ? "nav-item active"
                          : "nav-item"
                      }
                    >

                      <span>
                        {item.icon}
                      </span>

                      {item.label}

                    </button>

                  ))}

                </nav>

                {/* =========================
                    OVERVIEW
                ========================= */}

                {activeSection ===
                  "overview" && (

                  <section>

                    <div className="premium-card">

                      <div className="section-heading">

                        <div>
                          <span className="eyebrow">
                            WELCOME
                          </span>

                          <h2>
                            Welcome,{" "}
                            {user?.name ||
                              "Participant"}
                            !
                          </h2>
                        </div>

                        <div className="gold-icon">
                          ✦
                        </div>

                      </div>

                      <p className="muted-text">
                        Participate in the
                        hackathon by creating a
                        team, submitting your
                        project and checking your
                        evaluation.
                      </p>

                      <div className="overview-grid">

                        <OverviewCard
                          icon="♟"
                          title="Team"
                          value={
                            team
                              ? team.name
                              : "Not created"
                          }
                        />

                        <OverviewCard
                          icon="◆"
                          title="Submission"
                          value={
                            submission
                              ? "Submitted"
                              : "Not submitted"
                          }
                        />

                        <OverviewCard
                          icon="★"
                          title="Evaluation"
                          value={
                            evaluation?.evaluated
                              ? `${evaluation.evaluation.averageScore}/50`
                              : "Pending"
                          }
                        />

                      </div>

                    </div>

                    <div className="premium-card">

                      <div className="section-heading">

                        <div>
                          <span className="eyebrow">
                            TIMELINE
                          </span>

                          <h2>
                            Hackathon Status
                          </h2>
                        </div>

                        <div className="gold-icon">
                          ◷
                        </div>

                      </div>

                      <div className="timeline-grid">

                        <TimelineItem
                          label="CURRENT STATUS"
                          value={getHackathonStatus(
                            selectedHackathon
                          )}
                        />

                        <TimelineItem
                          label="SUBMISSION DEADLINE"
                          value={formatDate(
                            selectedHackathon.submissionDeadline
                          )}
                        />

                      </div>

                      {isSubmissionClosed() &&
                        !submission && (

                          <div className="gold-warning">
                            <span>⚠</span>

                            <span>
                              The submission
                              deadline has passed.
                              New project
                              submissions are
                              closed.
                            </span>
                          </div>

                        )}

                    </div>

                  </section>

                )}

                {/* =========================
                    TEAM
                ========================= */}

                {activeSection ===
                  "team" && (

                  <section>

                    <div className="premium-card">

                      <div className="section-heading">

                        <div>
                          <span className="eyebrow">
                            COLLABORATION
                          </span>

                          <h2>
                            My Team
                          </h2>
                        </div>

                        <div className="gold-icon">
                          ♟
                        </div>

                      </div>

                      {team ? (

                        <>

                          <div className="team-banner">

                            <div className="team-symbol">
                              ♟
                            </div>

                            <div>

                              <span className="eyebrow">
                                TEAM
                              </span>

                              <h3>
                                {team.name}
                              </h3>

                              <p>
                                <strong>
                                  Team Leader:
                                </strong>{" "}
                                {team.leader?.name ||
                                  "Unknown"}
                              </p>

                            </div>

                          </div>

                          <h3 className="sub-heading">
                            Team Members
                          </h3>

                          <div className="members-grid">

                            {team.members?.map(
                              (member) => (

                                <div
                                  key={
                                    member._id ||
                                    member
                                  }
                                  className="member-card"
                                >

                                  <div className="member-avatar">
                                    {(member.name ||
                                      "M")
                                      .charAt(0)
                                      .toUpperCase()}
                                  </div>

                                  <div>
                                    <strong>
                                      {member.name ||
                                        "Member"}
                                    </strong>

                                    <span>
                                      {member.email ||
                                        ""}
                                    </span>
                                  </div>

                                </div>

                              )
                            )}

                          </div>

                          {team.leader &&
                            String(
                              team.leader._id
                            ) ===
                              String(
                                user?.id
                              ) && (

                              <form
                                onSubmit={
                                  addMember
                                }
                                className="premium-form"
                              >

                                <h3>
                                  Add Team Member
                                </h3>

                                <input
                                  type="email"
                                  placeholder="Participant email"
                                  value={
                                    memberEmail
                                  }
                                  onChange={(
                                    event
                                  ) =>
                                    setMemberEmail(
                                      event.target
                                        .value
                                    )
                                  }
                                  className="premium-input"
                                  required
                                />

                                <button
                                  type="submit"
                                  className="gold-button-main"
                                >
                                  + Add Member
                                </button>

                              </form>

                            )}

                        </>

                      ) : (

                        <>

                          <div className="empty-team">

                            <div>
                              ♟
                            </div>

                            <h3>
                              No Team Yet
                            </h3>

                            <p>
                              You have not created
                              or joined a team yet.
                            </p>

                          </div>

                          <form
                            onSubmit={
                              createTeam
                            }
                            className="premium-form"
                          >

                            <input
                              type="text"
                              placeholder="Enter team name"
                              value={teamName}
                              onChange={(
                                event
                              ) =>
                                setTeamName(
                                  event.target
                                    .value
                                )
                              }
                              className="premium-input"
                              required
                            />

                            <button
                              type="submit"
                              className="gold-button-main"
                            >
                              + Create Team
                            </button>

                          </form>

                        </>

                      )}

                    </div>

                  </section>

                )}

                {/* =========================
                    SUBMISSION
                ========================= */}

                {activeSection ===
                  "submission" && (

                  <section>

                    <div className="premium-card">

                      <div className="section-heading">

                        <div>
                          <span className="eyebrow">
                            PROJECT
                          </span>

                          <h2>
                            Project Submission
                          </h2>
                        </div>

                        <div className="gold-icon">
                          ◆
                        </div>

                      </div>

                      {submission ? (

                        <div>

                          <div className="submitted-badge">
                            ✓ SUBMITTED
                          </div>

                          <div className="project-box">

                            <h3>
                              {submission.title}
                            </h3>

                            <p>
                              {
                                submission.description
                              }
                            </p>

                            <div className="project-links">

                              <a
                                href={
                                  submission.githubUrl
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="gold-outline-button"
                              >
                                ◇ GitHub Repository
                              </a>

                              {submission.demoUrl && (

                                <a
                                  href={
                                    submission.demoUrl
                                  }
                                  target="_blank"
                                  rel="noreferrer"
                                  className="gold-outline-button"
                                >
                                  ↗ Live Demo
                                </a>

                              )}

                            </div>

                          </div>

                        </div>

                      ) : isSubmissionClosed() ? (

                        <div className="gold-warning">
                          <span>⚠</span>

                          <span>
                            The submission deadline
                            has passed. Project
                            submission is closed.
                          </span>
                        </div>

                      ) : !team ? (

                        <div className="gold-warning">
                          <span>⚠</span>

                          <span>
                            Please create or join a
                            team before submitting a
                            project.
                          </span>
                        </div>

                      ) : (

                        <form
                          onSubmit={
                            submitProject
                          }
                          className="premium-form"
                        >

                          <label>
                            Project Title
                          </label>

                          <input
                            type="text"
                            value={
                              projectTitle
                            }
                            onChange={(event) =>
                              setProjectTitle(
                                event.target
                                  .value
                              )
                            }
                            className="premium-input"
                            required
                          />

                          <label>
                            Project Description
                          </label>

                          <textarea
                            value={
                              description
                            }
                            onChange={(event) =>
                              setDescription(
                                event.target
                                  .value
                              )
                            }
                            className="premium-textarea"
                            rows="5"
                            required
                          />

                          <label>
                            GitHub URL
                          </label>

                          <input
                            type="url"
                            value={
                              githubUrl
                            }
                            onChange={(event) =>
                              setGithubUrl(
                                event.target
                                  .value
                              )
                            }
                            className="premium-input"
                            placeholder="https://github.com/..."
                            required
                          />

                          <label>
                            Demo URL
                          </label>

                          <input
                            type="url"
                            value={
                              demoUrl
                            }
                            onChange={(event) =>
                              setDemoUrl(
                                event.target
                                  .value
                              )
                            }
                            className="premium-input"
                            placeholder="https://..."
                          />

                          <button
                            type="submit"
                            className="gold-button-main"
                          >
                            Submit Project →
                          </button>

                        </form>

                      )}

                    </div>

                  </section>

                )}

                {/* =========================
                    EVALUATION
                ========================= */}

                {activeSection ===
                  "evaluation" && (

                  <section>

                    <div className="premium-card">

                      <div className="section-heading">

                        <div>
                          <span className="eyebrow">
                            RESULTS
                          </span>

                          <h2>
                            Project Evaluation
                          </h2>

                          <p className="muted-text">
                            Your judge evaluation
                            results appear here.
                          </p>
                        </div>

                        <button
                          onClick={() =>
                            fetchEvaluation(
                              selectedHackathon._id
                            )
                          }
                          className="dark-gold-button"
                        >
                          ↻ Refresh
                        </button>

                      </div>

                      {!evaluation ||
                      !evaluation.evaluated ? (

                        <div className="pending-box">

                          <div>
                            ◷
                          </div>

                          <h3>
                            Evaluation Pending
                          </h3>

                          <p>
                            Your project has not
                            been evaluated yet.
                          </p>

                        </div>

                      ) : (

                        <>

                          <div className="score-grid">

                            <ScoreCard
                              label="AVERAGE SCORE"
                              value={
                                evaluation
                                  .evaluation
                                  .averageScore
                              }
                              suffix="/50"
                            />

                            <ScoreCard
                              label="PERCENTAGE"
                              value={
                                evaluation
                                  .evaluation
                                  .percentage
                              }
                              suffix="%"
                            />

                            <ScoreCard
                              label="JUDGES"
                              value={
                                evaluation
                                  .evaluation
                                  .judgeCount
                              }
                            />

                          </div>

                          <h3 className="sub-heading">
                            Evaluation Details
                          </h3>

                          {evaluation.evaluation.scores?.map(
                            (
                              score,
                              index
                            ) => (

                              <div
                                key={
                                  score._id ||
                                  index
                                }
                                className="evaluation-card"
                              >

                                <div className="evaluation-header">

                                  <h4>
                                    Judge Evaluation{" "}
                                    {index + 1}
                                  </h4>

                                  <span className="total-badge">
                                    {
                                      score.totalScore
                                    }
                                    /50
                                  </span>

                                </div>

                                <div className="criteria-grid">

                                  <Criteria
                                    label="Technical Quality"
                                    value={
                                      score.technicalQuality
                                    }
                                  />

                                  <Criteria
                                    label="Innovation"
                                    value={
                                      score.innovation
                                    }
                                  />

                                  <Criteria
                                    label="UI/UX"
                                    value={
                                      score.uiux
                                    }
                                  />

                                  <Criteria
                                    label="Impact"
                                    value={
                                      score.impact
                                    }
                                  />

                                  <Criteria
                                    label="Presentation"
                                    value={
                                      score.presentation
                                    }
                                  />

                                </div>

                                {score.comments && (

                                  <div className="comments-box">

                                    <strong>
                                      Judge Comments
                                    </strong>

                                    <p>
                                      {
                                        score.comments
                                      }
                                    </p>

                                  </div>

                                )}

                              </div>

                            )
                          )}

                        </>

                      )}

                    </div>

                  </section>

                )}

              </>
            )}

          </>

        )}

      </main>

      <style>{`

        /* =====================================
           PARTICIPANT PREMIUM GOLD THEME
        ===================================== */

        .participant-page {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 10% 10%,
              rgba(212,175,55,0.08),
              transparent 27%
            ),
            radial-gradient(
              circle at 90% 80%,
              rgba(212,175,55,0.055),
              transparent 30%
            ),
            #050505;
          color: #f5f1df;
          padding-bottom: 60px;
        }

        /* HEADER */

        .participant-header {
          position: sticky;
          top: 0;
          z-index: 50;

          min-height: 82px;

          padding: 16px 40px;

          display: flex;
          justify-content: space-between;
          align-items: center;

          background:
            rgba(5,5,5,0.92);

          border-bottom:
            1px solid
            rgba(212,175,55,0.16);

          backdrop-filter:
            blur(20px);

          box-shadow:
            0 15px 45px
            rgba(0,0,0,0.55);
        }

        .brand-row {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .brand-area h1 {
          margin: 0;

          font-size: 24px;

          letter-spacing: 3px;

          font-weight: 900;

          background:
            linear-gradient(
              90deg,
              #f7e6a5,
              #d4af37,
              #f0d77a
            );

          -webkit-background-clip: text;
          background-clip: text;

          color: transparent;
        }

        .brand-area p {
          margin:
            5px 0 0 48px;

          color: #77715f;

          font-size: 12px;

          letter-spacing: 0.7px;
        }

        .brand-icon {
          width: 38px;
          height: 38px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 11px;

          background:
            linear-gradient(
              145deg,
              #1b1b1b,
              #080808
            );

          border:
            1px solid
            rgba(212,175,55,0.40);

          color: #f0d77a;

          box-shadow:
            0 0 25px
            rgba(212,175,55,0.10);
        }

        .year-badge {
          padding: 5px 9px;

          border-radius: 20px;

          background:
            rgba(212,175,55,0.08);

          border:
            1px solid
            rgba(212,175,55,0.25);

          color: #f0d77a;

          font-size: 10px;

          font-weight: 900;

          letter-spacing: 1px;
        }

        .user-area {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .user-avatar {
          width: 40px;
          height: 40px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background:
            linear-gradient(
              145deg,
              #f0d77a,
              #a9821e
            );

          color: #080808;

          font-weight: 900;

          box-shadow:
            0 0 20px
            rgba(212,175,55,0.14);
        }

        .user-profile strong {
          display: block;

          color: #f5f1df;

          font-size: 13px;
        }

        .user-profile span {
          display: block;

          margin-top: 3px;

          color: #77715f;

          font-size: 11px;
        }

        .logout-button {
          padding: 10px 15px;

          border-radius: 10px;

          border:
            1px solid
            rgba(212,175,55,0.22);

          background:
            #0c0c0c;

          color: #d9c46b;

          font-weight: 800;

          cursor: pointer;

          transition: 0.2s ease;
        }

        .logout-button:hover {
          border-color:
            rgba(212,175,55,0.50);

          background:
            rgba(212,175,55,0.07);

          box-shadow:
            0 0 22px
            rgba(212,175,55,0.08);
        }

        /* CONTAINER */

        .participant-container {
          width: 100%;
          max-width: 1200px;

          margin: 0 auto;

          padding: 30px 22px;
        }

        /* ALERTS */

        .alert {
          padding: 13px 16px;

          border-radius: 12px;

          margin-bottom: 18px;

          display: flex;
          align-items: center;

          gap: 10px;

          font-size: 13px;
        }

        .success-alert {
          background:
            rgba(212,175,55,0.07);

          border:
            1px solid
            rgba(212,175,55,0.20);

          color: #f0d77a;
        }

        .error-alert {
          background:
            rgba(130,30,30,0.15);

          border:
            1px solid
            rgba(210,80,80,0.25);

          color: #e5a5a5;
        }

        /* CARD */

        .premium-card {
          position: relative;

          background:
            linear-gradient(
              145deg,
              rgba(22,22,22,0.97),
              rgba(8,8,8,0.97)
            );

          border:
            1px solid
            rgba(212,175,55,0.17);

          border-radius: 20px;

          padding: 26px;

          margin-bottom: 20px;

          box-shadow:
            0 20px 55px
            rgba(0,0,0,0.45);

          backdrop-filter:
            blur(18px);
        }

        .premium-card::before {
          content: "";

          position: absolute;

          top: 0;
          left: 12%;
          right: 12%;

          height: 1px;

          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(212,175,55,0.35),
              transparent
            );
        }

        .section-heading {
          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 20px;

          margin-bottom: 20px;
        }

        .section-heading h2 {
          margin:
            5px 0 0;

          font-size: 22px;

          color: #f5f1df;
        }

        .eyebrow {
          color: #d4af37;

          font-size: 9px;

          font-weight: 900;

          letter-spacing: 2px;
        }

        .gold-icon {
          width: 42px;
          height: 42px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 12px;

          background:
            rgba(212,175,55,0.07);

          border:
            1px solid
            rgba(212,175,55,0.20);

          color: #e0bd55;

          font-size: 18px;
        }

        .muted-text {
          color: #8d8775;

          line-height: 1.7;
        }

        /* SELECT */

        .premium-select {
          width: 100%;

          height: 50px;

          padding: 0 14px;

          border-radius: 11px;

          border:
            1px solid
            rgba(212,175,55,0.20);

          background:
            #0b0b0b;

          color: #f5f1df;

          outline: none;

          font-size: 14px;

          cursor: pointer;
        }

        .premium-select:focus {
          border-color:
            #d4af37;

          box-shadow:
            0 0 0 3px
            rgba(212,175,55,0.07);
        }

        .premium-select option {
          background: #0b0b0b;

          color: #f5f1df;
        }

        /* HERO */

        .hackathon-hero {
          position: relative;

          overflow: hidden;

          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 20px;

          min-height: 210px;

          padding: 32px;

          margin-bottom: 20px;

          border-radius: 22px;

          background:
            radial-gradient(
              circle at 20% 10%,
              rgba(212,175,55,0.18),
              transparent 35%
            ),
            linear-gradient(
              145deg,
              #19150b,
              #080808
            );

          border:
            1px solid
            rgba(212,175,55,0.30);

          box-shadow:
            0 25px 70px
            rgba(0,0,0,0.55),
            0 0 40px
            rgba(212,175,55,0.05);
        }

        .hero-decoration {
          position: absolute;

          width: 280px;
          height: 280px;

          border-radius: 50%;

          right: -110px;
          top: -150px;

          border:
            1px solid
            rgba(212,175,55,0.16);

          box-shadow:
            0 0 80px
            rgba(212,175,55,0.07);
        }

        .hero-content {
          position: relative;

          z-index: 2;
        }

        .hero-content > span {
          color: #d4af37;

          font-size: 9px;

          font-weight: 900;

          letter-spacing: 2px;
        }

        .hero-content h2 {
          margin:
            9px 0 10px;

          font-size: 31px;

          line-height: 1.15;

          color: #f7e6a5;
        }

        .hero-content p {
          margin: 0;

          max-width: 720px;

          color: #9b9582;

          line-height: 1.65;
        }

        .hero-status {
          position: relative;

          z-index: 2;

          display: flex;

          align-items: center;

          gap: 8px;

          padding: 10px 15px;

          white-space: nowrap;

          border-radius: 30px;

          background:
            rgba(212,175,55,0.08);

          border:
            1px solid
            rgba(212,175,55,0.25);

          color: #f0d77a;

          font-size: 12px;

          font-weight: 900;
        }

        .status-dot {
          width: 8px;
          height: 8px;

          border-radius: 50%;

          background: #d4af37;

          box-shadow:
            0 0 12px
            rgba(212,175,55,0.85);
        }

        /* INFO */

        .info-grid {
          display: grid;

          grid-template-columns:
            repeat(
              auto-fit,
              minmax(210px, 1fr)
            );

          gap: 14px;

          margin-bottom: 22px;
        }

        .info-card {
          padding: 19px;

          border-radius: 15px;

          background:
            linear-gradient(
              145deg,
              #151515,
              #0b0b0b
            );

          border:
            1px solid
            rgba(212,175,55,0.13);

          transition: 0.2s ease;
        }

        .info-card:hover {
          transform:
            translateY(-3px);

          border-color:
            rgba(212,175,55,0.30);

          box-shadow:
            0 12px 35px
            rgba(0,0,0,0.45);
        }

        .info-icon {
          color: #d4af37;

          font-size: 20px;

          margin-bottom: 12px;
        }

        .info-label {
          color: #77715f;

          font-size: 9px;

          font-weight: 900;

          letter-spacing: 1.5px;

          margin-bottom: 7px;
        }

        .info-value {
          color: #ddd6bd;

          font-size: 13px;

          line-height: 1.5;

          font-weight: 700;
        }

        /* NAV */

        .dashboard-nav {
          display: flex;

          flex-wrap: wrap;

          gap: 7px;

          padding: 6px;

          margin-bottom: 22px;

          border-radius: 14px;

          background:
            rgba(9,9,9,0.92);

          border:
            1px solid
            rgba(212,175,55,0.14);
        }

        .nav-item {
          flex: 1;

          min-width: 130px;

          padding: 12px 15px;

          border:
            1px solid transparent;

          border-radius: 10px;

          background: transparent;

          color: #827c6b;

          cursor: pointer;

          font-weight: 800;

          display: flex;

          align-items: center;

          justify-content: center;

          gap: 8px;

          transition: 0.2s ease;
        }

        .nav-item:hover {
          color: #e0bd55;

          background:
            rgba(212,175,55,0.05);
        }

        .nav-item.active {
          color: #090909;

          background:
            linear-gradient(
              135deg,
              #f0d77a,
              #d4af37
            );

          border-color:
            rgba(240,215,122,0.40);

          box-shadow:
            0 8px 25px
            rgba(212,175,55,0.16);
        }

        /* OVERVIEW */

        .overview-grid {
          display: grid;

          grid-template-columns:
            repeat(
              auto-fit,
              minmax(190px, 1fr)
            );

          gap: 13px;

          margin-top: 22px;
        }

        .overview-card {
          padding: 18px;

          border-radius: 14px;

          background:
            #0b0b0b;

          border:
            1px solid
            rgba(212,175,55,0.12);

          display: flex;

          flex-direction: column;

          gap: 8px;
        }

        .overview-card-icon {
          color: #d4af37;

          font-size: 20px;
        }

        .overview-card strong {
          color: #eee7cf;

          font-size: 13px;
        }

        .overview-card span:last-child {
          color: #8c8675;

          font-size: 13px;
        }

        .timeline-grid {
          display: grid;

          grid-template-columns:
            repeat(
              auto-fit,
              minmax(250px, 1fr)
            );

          gap: 14px;

          margin-top: 18px;
        }

        .timeline-item {
          padding: 18px;

          border-radius: 13px;

          background:
            #0b0b0b;

          border:
            1px solid
            rgba(212,175,55,0.11);
        }

        .timeline-item span {
          display: block;

          color: #77715f;

          font-size: 9px;

          font-weight: 900;

          letter-spacing: 1.3px;

          margin-bottom: 8px;
        }

        .timeline-item strong {
          color: #e0bd55;

          font-size: 14px;
        }

        /* TEAM */

        .team-banner {
          display: flex;

          align-items: center;

          gap: 18px;

          padding: 22px;

          border-radius: 16px;

          background:
            radial-gradient(
              circle at 15% 50%,
              rgba(212,175,55,0.10),
              transparent 40%
            ),
            #0b0b0b;

          border:
            1px solid
            rgba(212,175,55,0.18);
        }

        .team-symbol {
          width: 58px;
          height: 58px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 15px;

          background:
            linear-gradient(
              145deg,
              #f0d77a,
              #a9821e
            );

          color: #080808;

          font-size: 24px;

          box-shadow:
            0 10px 30px
            rgba(212,175,55,0.14);
        }

        .team-banner h3 {
          margin:
            4px 0;

          font-size: 24px;

          color: #f0d77a;
        }

        .team-banner p {
          margin: 0;

          color: #8c8675;

          font-size: 13px;
        }

        .sub-heading {
          margin:
            25px 0 14px;

          color: #eee7cf;

          font-size: 16px;
        }

        .members-grid {
          display: grid;

          grid-template-columns:
            repeat(
              auto-fit,
              minmax(240px, 1fr)
            );

          gap: 10px;
        }

        .member-card {
          display: flex;

          align-items: center;

          gap: 12px;

          padding: 14px;

          border-radius: 12px;

          background: #0b0b0b;

          border:
            1px solid
            rgba(212,175,55,0.11);
        }

        .member-avatar {
          width: 38px;
          height: 38px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 10px;

          background:
            rgba(212,175,55,0.10);

          border:
            1px solid
            rgba(212,175,55,0.20);

          color: #e0bd55;

          font-weight: 900;
        }

        .member-card strong {
          display: block;

          color: #e8e0c8;

          font-size: 13px;
        }

        .member-card span {
          display: block;

          margin-top: 4px;

          color: #706a5c;

          font-size: 11px;
        }

        /* FORMS */

        .premium-form {
          display: flex;

          flex-direction: column;

          gap: 11px;

          margin-top: 24px;
        }

        .premium-form h3 {
          margin: 0 0 3px;

          color: #e9e1c9;

          font-size: 16px;
        }

        .premium-form label {
          color: #b2aa95;

          font-size: 12px;

          font-weight: 700;

          margin-top: 5px;
        }

        .premium-input,
        .premium-textarea {
          width: 100%;

          padding: 13px 14px;

          border:
            1px solid
            rgba(212,175,55,0.18);

          border-radius: 10px;

          background: #090909;

          color: #f5f1df;

          outline: none;

          font-size: 14px;

          transition: 0.2s ease;
        }

        .premium-input {
          height: 48px;
        }

        .premium-textarea {
          resize: vertical;
        }

        .premium-input::placeholder,
        .premium-textarea::placeholder {
          color: #5e594d;
        }

        .premium-input:focus,
        .premium-textarea:focus {
          border-color:
            #d4af37;

          box-shadow:
            0 0 0 3px
            rgba(212,175,55,0.06),
            0 0 20px
            rgba(212,175,55,0.06);
        }

        .gold-button-main {
          border: none;

          min-height: 48px;

          padding: 12px 20px;

          border-radius: 10px;

          background:
            linear-gradient(
              135deg,
              #f0d77a,
              #d4af37,
              #a9821e
            );

          color: #080808;

          font-weight: 900;

          cursor: pointer;

          box-shadow:
            0 10px 28px
            rgba(212,175,55,0.13);

          transition: 0.2s ease;
        }

        .gold-button-main:hover {
          transform:
            translateY(-2px);

          filter:
            brightness(1.08);

          box-shadow:
            0 14px 35px
            rgba(212,175,55,0.20);
        }

        /* EMPTY */

        .empty-team,
        .empty-main {
          text-align: center;

          color: #898373;
        }

        .empty-team {
          padding: 30px 10px;
        }

        .empty-team > div,
        .empty-symbol {
          font-size: 40px;

          color: #d4af37;

          margin-bottom: 10px;
        }

        .empty-team h3,
        .empty-main h2 {
          color: #eee7cf;
        }

        .empty-team p,
        .empty-main p {
          color: #77715f;
        }

        /* WARNING */

        .gold-warning {
          display: flex;

          align-items: center;

          gap: 10px;

          padding: 14px 16px;

          margin-top: 18px;

          border-radius: 11px;

          background:
            rgba(212,175,55,0.06);

          border:
            1px solid
            rgba(212,175,55,0.18);

          color: #d9c46b;

          font-size: 13px;
        }

        /* SUBMISSION */

        .submitted-badge {
          display: inline-flex;

          align-items: center;

          padding: 7px 12px;

          border-radius: 30px;

          background:
            rgba(212,175,55,0.08);

          border:
            1px solid
            rgba(212,175,55,0.25);

          color: #e0bd55;

          font-size: 10px;

          font-weight: 900;

          letter-spacing: 1px;
        }

        .project-box {
          margin-top: 16px;

          padding: 22px;

          border-radius: 15px;

          background:
            #0b0b0b;

          border:
            1px solid
            rgba(212,175,55,0.13);
        }

        .project-box h3 {
          margin:
            0 0 10px;

          color: #f0d77a;

          font-size: 21px;
        }

        .project-box p {
          color: #918b7b;

          line-height: 1.7;
        }

        .project-links {
          display: flex;

          flex-wrap: wrap;

          gap: 10px;

          margin-top: 20px;
        }

        .gold-outline-button {
          display: inline-flex;

          align-items: center;

          justify-content: center;

          padding: 10px 14px;

          border-radius: 9px;

          text-decoration: none;

          color: #e0bd55;

          background:
            rgba(212,175,55,0.05);

          border:
            1px solid
            rgba(212,175,55,0.22);

          font-size: 12px;

          font-weight: 800;

          transition: 0.2s ease;
        }

        .gold-outline-button:hover {
          background:
            rgba(212,175,55,0.10);

          border-color:
            rgba(212,175,55,0.45);

          transform:
            translateY(-2px);
        }

        /* EVALUATION */

        .dark-gold-button {
          padding: 10px 15px;

          border-radius: 10px;

          border:
            1px solid
            rgba(212,175,55,0.25);

          background:
            rgba(212,175,55,0.06);

          color: #e0bd55;

          font-weight: 800;

          cursor: pointer;

          transition: 0.2s ease;
        }

        .dark-gold-button:hover {
          background:
            rgba(212,175,55,0.11);

          border-color:
            rgba(212,175,55,0.45);

          box-shadow:
            0 0 20px
            rgba(212,175,55,0.08);
        }

        .pending-box {
          text-align: center;

          padding: 40px 20px;

          margin-top: 15px;

          border-radius: 15px;

          background:
            #0b0b0b;

          border:
            1px solid
            rgba(212,175,55,0.11);

          color: #77715f;
        }

        .pending-box > div {
          font-size: 38px;

          color: #d4af37;

          margin-bottom: 10px;
        }

        .pending-box h3 {
          color: #ddd6bd;
        }

        .score-grid {
          display: grid;

          grid-template-columns:
            repeat(
              auto-fit,
              minmax(180px, 1fr)
            );

          gap: 13px;

          margin: 20px 0;
        }

        .score-card {
          padding: 21px;

          border-radius: 15px;

          background:
            radial-gradient(
              circle at 20% 10%,
              rgba(212,175,55,0.10),
              transparent 45%
            ),
            #0b0b0b;

          border:
            1px solid
            rgba(212,175,55,0.16);
        }

        .score-card span {
          display: block;

          color: #77715f;

          font-size: 9px;

          font-weight: 900;

          letter-spacing: 1.3px;

          margin-bottom: 10px;
        }

        .score-card strong {
          color: #f0d77a;

          font-size: 31px;
        }

        .score-card small {
          color: #8c8675;

          font-size: 14px;
        }

        .evaluation-card {
          padding: 20px;

          margin-top: 13px;

          border-radius: 15px;

          background: #0b0b0b;

          border:
            1px solid
            rgba(212,175,55,0.13);
        }

        .evaluation-header {
          display: flex;

          justify-content: space-between;

          align-items: center;

          gap: 15px;
        }

        .evaluation-header h4 {
          margin: 0;

          color: #e8e0c8;

          font-size: 15px;
        }

        .total-badge {
          padding: 7px 11px;

          border-radius: 20px;

          background:
            rgba(212,175,55,0.08);

          border:
            1px solid
            rgba(212,175,55,0.24);

          color: #e0bd55;

          font-size: 12px;

          font-weight: 900;
        }

        .criteria-grid {
          display: grid;

          grid-template-columns:
            repeat(
              auto-fit,
              minmax(160px, 1fr)
            );

          gap: 10px;

          margin-top: 17px;
        }

        .criteria-item {
          padding: 13px;

          border-radius: 10px;

          background:
            #101010;

          border:
            1px solid
            rgba(212,175,55,0.08);

          color: #8d8776;

          font-size: 12px;
        }

        .criteria-item strong {
          display: block;

          margin-top: 5px;

          color: #d9c46b;

          font-size: 14px;
        }

        .comments-box {
          margin-top: 17px;

          padding: 15px;

          border-radius: 11px;

          background:
            rgba(212,175,55,0.035);

          border:
            1px solid
            rgba(212,175,55,0.10);
        }

        .comments-box strong {
          color: #d4af37;

          font-size: 11px;

          text-transform: uppercase;

          letter-spacing: 1px;
        }

        .comments-box p {
          margin:
            8px 0 0;

          color: #9a9382;

          line-height: 1.6;
        }

        /* LOADING */

        .participant-loading {
          min-height: 100vh;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          background:
            radial-gradient(
              circle at center,
              rgba(212,175,55,0.08),
              #050505 60%
            );

          color: #f5f1df;
        }

        .loading-ring {
          width: 42px;
          height: 42px;

          border-radius: 50%;

          border:
            2px solid
            rgba(212,175,55,0.12);

          border-top-color:
            #d4af37;

          animation:
            participant-spin
            0.8s linear infinite;

          margin-bottom: 18px;
        }

        @keyframes participant-spin {
          to {
            transform:
              rotate(360deg);
          }
        }

        .loading-brand {
          color: #f0d77a;

          font-size: 22px;

          font-weight: 900;

          letter-spacing: 4px;
        }

        .loading-text {
          margin-top: 8px;

          color: #77715f;

          font-size: 12px;
        }

        /* RESPONSIVE */

        @media (max-width: 800px) {

          .participant-header {
            padding: 15px 18px;

            align-items: flex-start;

            flex-direction: column;
          }

          .user-area {
            width: 100%;

            justify-content:
              space-between;
          }

          .participant-container {
            padding:
              22px 14px;
          }

          .hackathon-hero {
            flex-direction: column;

            align-items: flex-start;

            padding: 25px;
          }

          .hero-status {
            align-self: flex-start;
          }

          .nav-item {
            min-width:
              calc(50% - 4px);

            flex: auto;
          }
        }

        @media (max-width: 500px) {

          .brand-area h1 {
            font-size: 20px;
          }

          .brand-area p {
            margin-left: 0;
          }

          .user-profile {
            display: none;
          }

          .premium-card {
            padding: 20px;

            border-radius: 16px;
          }

          .hero-content h2 {
            font-size: 24px;
          }

          .nav-item {
            width: 100%;
          }

          .section-heading {
            align-items: flex-start;
          }

          .section-heading h2 {
            font-size: 19px;
          }

        }

      `}</style>

    </div>
  );
}


/* =========================
   SMALL UI COMPONENTS
========================= */

function InfoCard({
  icon,
  label,
  value
}) {
  return (
    <div className="info-card">

      <div className="info-icon">
        {icon}
      </div>

      <div className="info-label">
        {label}
      </div>

      <div className="info-value">
        {value}
      </div>

    </div>
  );
}


function OverviewCard({
  icon,
  title,
  value
}) {
  return (
    <div className="overview-card">

      <span className="overview-card-icon">
        {icon}
      </span>

      <strong>
        {title}
      </strong>

      <span>
        {value}
      </span>

    </div>
  );
}


function TimelineItem({
  label,
  value
}) {
  return (
    <div className="timeline-item">

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

    </div>
  );
}


function ScoreCard({
  label,
  value,
  suffix
}) {
  return (
    <div className="score-card">

      <span>
        {label}
      </span>

      <strong>
        {value}

        {suffix && (
          <small>
            {suffix}
          </small>
        )}
      </strong>

    </div>
  );
}


function Criteria({
  label,
  value
}) {
  return (
    <div className="criteria-item">

      {label}

      <strong>
        {value}/10
      </strong>

    </div>
  );
}


export default ParticipantDashboard;