import React, { useEffect, useState } from "react";

const API_URL = "https://dogfood-0f1x.onrender.com/api";

function JudgeDashboard() {
  const [user, setUser] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [scores, setScores] = useState([]);

  const [selectedAssignment, setSelectedAssignment] =
    useState(null);

  const [technicalQuality, setTechnicalQuality] =
    useState("");
  const [innovation, setInnovation] = useState("");
  const [uiux, setUiux] = useState("");
  const [impact, setImpact] = useState("");
  const [presentation, setPresentation] =
    useState("");
  const [comments, setComments] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }

    loadDashboard();
  }, []);

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      await Promise.all([
        fetchAssignments(),
        fetchScores()
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    const response = await fetch(
      `${API_URL}/judges/my-assignments`,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Failed to fetch assignments"
      );
    }

    setAssignments(
      Array.isArray(data)
        ? data
        : data.assignments || []
    );
  };

  const fetchScores = async () => {
    const response = await fetch(
      `${API_URL}/judge-scores/my-scores`,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Failed to fetch scores"
      );
    }

    setScores(
      Array.isArray(data)
        ? data
        : data.scores || []
    );
  };

  const refreshDashboard = async () => {
    try {
      setMessage("");
      setError("");

      await loadDashboard();

      setMessage(
        "Dashboard refreshed successfully."
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const openEvaluation = (assignment) => {
    setSelectedAssignment(assignment);

    setTechnicalQuality("");
    setInnovation("");
    setUiux("");
    setImpact("");
    setPresentation("");
    setComments("");

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const closeEvaluation = () => {
    setSelectedAssignment(null);

    setTechnicalQuality("");
    setInnovation("");
    setUiux("");
    setImpact("");
    setPresentation("");
    setComments("");
  };

  const submitScore = async (event) => {
    event.preventDefault();

    if (!selectedAssignment) {
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");
      setError("");

      const scoreValues = [
        technicalQuality,
        innovation,
        uiux,
        impact,
        presentation
      ];

      const hasEmptyScore = scoreValues.some(
        (value) =>
          value === "" ||
          value === null ||
          value === undefined
      );

      if (hasEmptyScore) {
        setError(
          "Please enter all five scores."
        );
        return;
      }

      const numericScores =
        scoreValues.map(Number);

      const invalidScore = numericScores.some(
        (score) =>
          Number.isNaN(score) ||
          score < 0 ||
          score > 10
      );

      if (invalidScore) {
        setError(
          "Each score must be between 0 and 10."
        );
        return;
      }

      const response = await fetch(
        `${API_URL}/judge-scores`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`
          },
          body: JSON.stringify({
            submissionId:
              selectedAssignment.submission
                ?._id ||
              selectedAssignment.submissionId,

            technicalQuality:
              Number(technicalQuality),

            innovation: Number(innovation),

            uiux: Number(uiux),

            impact: Number(impact),

            presentation:
              Number(presentation),

            comments
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to submit evaluation"
        );
      }

      setMessage(
        "Evaluation submitted successfully!"
      );

      closeEvaluation();

      await Promise.all([
        fetchAssignments(),
        fetchScores()
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/";
  };

  const getProject = (assignment) => {
    return (
      assignment?.submission ||
      assignment?.project ||
      null
    );
  };

  const getProjectTitle = (assignment) => {
    const project = getProject(assignment);

    return (
      project?.title ||
      assignment?.title ||
      "Untitled Project"
    );
  };

  const getProjectDescription = (
    assignment
  ) => {
    const project = getProject(assignment);

    return (
      project?.description ||
      assignment?.description ||
      "No description provided."
    );
  };

  const getGithubUrl = (assignment) => {
    const project = getProject(assignment);

    return (
      project?.githubUrl ||
      assignment?.githubUrl ||
      ""
    );
  };

  const getDemoUrl = (assignment) => {
    const project = getProject(assignment);

    return (
      project?.demoUrl ||
      assignment?.demoUrl ||
      ""
    );
  };

  const getTeamName = (assignment) => {
    const project = getProject(assignment);

    return (
      project?.team?.name ||
      assignment?.team?.name ||
      "Team"
    );
  };

  const isCompleted = (assignment) => {
    return (
      assignment.status === "completed" ||
      assignment.status === "evaluated" ||
      scores.some(
        (score) =>
          String(
            score.submission?._id ||
              score.submission
          ) ===
          String(
            getProject(assignment)?._id ||
              assignment.submissionId
          )
      )
    );
  };

  const getTotal = () => {
    return (
      Number(technicalQuality || 0) +
      Number(innovation || 0) +
      Number(uiux || 0) +
      Number(impact || 0) +
      Number(presentation || 0)
    );
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

  const getHackathon = (assignment) => {
    return (
      assignment?.hackathon ||
      getProject(assignment)?.hackathon ||
      null
    );
  };

  const getDeadline = (assignment) => {
    const hackathon =
      getHackathon(assignment);

    return (
      hackathon?.submissionDeadline ||
      assignment?.submissionDeadline ||
      null
    );
  };

  const getDeadlineStatus = (assignment) => {
    const deadline =
      getDeadline(assignment);

    if (!deadline) {
      return "No deadline specified";
    }

    return new Date() >
      new Date(deadline)
      ? "Deadline passed"
      : "Evaluation period active";
  };

  const completedCount =
    assignments.filter(isCompleted).length;

  const pendingCount =
    assignments.length - completedCount;

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingLogo}>
          DOGFOOD
        </div>

        <div style={styles.loadingSpinner}></div>

        <p style={styles.loadingText}>
          Loading Judge Dashboard...
        </p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <header style={styles.header}>
        <div style={styles.brand}>
          <div style={styles.brandBox}>
            D
          </div>

          <div>
            <h1 style={styles.logo}>
              DOGFOOD
            </h1>

            <p style={styles.subtitle}>
              HACKATHON MANAGEMENT PLATFORM
            </p>
          </div>
        </div>

        <div style={styles.headerRight}>
          <div style={styles.userInfo}>
            <div style={styles.avatar}>
              {(user?.name || "J")
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <strong style={styles.userName}>
                {user?.name || "Judge"}
              </strong>

              <span style={styles.userRole}>
                JUDGE
              </span>
            </div>
          </div>

          <button
            onClick={refreshDashboard}
            style={styles.refreshButton}
          >
            ↻ Refresh
          </button>

          <button
            onClick={logout}
            style={styles.logoutButton}
          >
            Logout
          </button>
        </div>
      </header>

      <main style={styles.container}>
        {/* MESSAGES */}

        {message && (
          <div style={styles.success}>
            <span style={styles.messageIcon}>
              ✓
            </span>

            {message}
          </div>
        )}

        {error && (
          <div style={styles.error}>
            <span style={styles.errorIcon}>
              !
            </span>

            {error}
          </div>
        )}

        {/* HERO */}

        <section style={styles.hero}>
          <div style={styles.heroContent}>
            <div style={styles.heroBadge}>
              ● JUDGE PORTAL
            </div>

            <h2 style={styles.heroTitle}>
              Welcome,{" "}
              <span style={styles.goldText}>
                {user?.name || "Judge"}
              </span>
            </h2>

            <p style={styles.heroDescription}>
              Review assigned projects, evaluate
              innovative ideas, and provide
              meaningful feedback to hackathon
              teams.
            </p>

            <div style={styles.heroDivider}></div>

            <p style={styles.heroHint}>
              Fair evaluation • Clear feedback •
              Better innovation
            </p>
          </div>

          <div style={styles.scaleCard}>
            <div style={styles.scaleStar}>
              ★
            </div>

            <p style={styles.scaleLabel}>
              SCORING SCALE
            </p>

            <strong style={styles.scaleNumber}>
              0 — 10
            </strong>

            <div style={styles.scaleLine}></div>

            <p style={styles.scaleSmall}>
              MAXIMUM TOTAL
            </p>

            <strong style={styles.scaleTotal}>
              50 POINTS
            </strong>
          </div>
        </section>

        {/* STATS */}

        <section style={styles.statsGrid}>
          <StatCard
            label="ASSIGNED PROJECTS"
            value={assignments.length}
            icon="◈"
            description="Projects assigned to you"
          />

          <StatCard
            label="COMPLETED"
            value={completedCount}
            icon="✓"
            description="Evaluations submitted"
          />

          <StatCard
            label="PENDING"
            value={pendingCount}
            icon="◷"
            description="Projects remaining"
          />

          <StatCard
            label="MY EVALUATIONS"
            value={scores.length}
            icon="★"
            description="Submitted assessments"
          />
        </section>

        {/* EVALUATION PANEL */}

        {selectedAssignment && (
          <section style={styles.evaluationPanel}>
            <div style={styles.evaluationHeader}>
              <div>
                <p style={styles.panelLabel}>
                  ● EVALUATING PROJECT
                </p>

                <h2 style={styles.evaluationTitle}>
                  {getProjectTitle(
                    selectedAssignment
                  )}
                </h2>

                <p style={styles.evaluationTeam}>
                  TEAM •{" "}
                  {getTeamName(
                    selectedAssignment
                  )}
                </p>
              </div>

              <button
                onClick={closeEvaluation}
                style={styles.closeButton}
              >
                × Close
              </button>
            </div>

            {/* PROJECT INFO */}

            <div style={styles.projectInfo}>
              <h3 style={styles.infoTitle}>
                Project Overview
              </h3>

              <p style={styles.projectDescription}>
                {getProjectDescription(
                  selectedAssignment
                )}
              </p>

              <div style={styles.projectLinks}>
                {getGithubUrl(
                  selectedAssignment
                ) && (
                  <a
                    href={getGithubUrl(
                      selectedAssignment
                    )}
                    target="_blank"
                    rel="noreferrer"
                    style={styles.link}
                  >
                    ⌘ GitHub Repository ↗
                  </a>
                )}

                {getDemoUrl(
                  selectedAssignment
                ) && (
                  <a
                    href={getDemoUrl(
                      selectedAssignment
                    )}
                    target="_blank"
                    rel="noreferrer"
                    style={styles.link}
                  >
                    ▶ Live Demo ↗
                  </a>
                )}
              </div>

              <div style={styles.deadlineBox}>
                <div>
                  <span style={styles.deadlineLabel}>
                    SUBMISSION DEADLINE
                  </span>

                  <strong
                    style={styles.deadlineDate}
                  >
                    {formatDate(
                      getDeadline(
                        selectedAssignment
                      )
                    )}
                  </strong>
                </div>

                <span style={styles.deadlineStatus}>
                  {getDeadlineStatus(
                    selectedAssignment
                  )}
                </span>
              </div>
            </div>

            {/* EVALUATION FORM */}

            <form
              onSubmit={submitScore}
              style={styles.form}
            >
              <div style={styles.criteriaHeader}>
                <div>
                  <h3 style={styles.criteriaTitle}>
                    Evaluation Criteria
                  </h3>

                  <p style={styles.criteriaSubtitle}>
                    Rate every category from 0 to
                    10.
                  </p>
                </div>

                <span style={styles.criteriaBadge}>
                  5 × 10 = 50
                </span>
              </div>

              <ScoreInput
                label="Technical Quality"
                value={technicalQuality}
                setValue={
                  setTechnicalQuality
                }
                description="Code quality, functionality and technical implementation."
              />

              <ScoreInput
                label="Innovation"
                value={innovation}
                setValue={setInnovation}
                description="Originality and creativity of the solution."
              />

              <ScoreInput
                label="UI / UX"
                value={uiux}
                setValue={setUiux}
                description="Usability, design and overall user experience."
              />

              <ScoreInput
                label="Impact"
                value={impact}
                setValue={setImpact}
                description="Practical usefulness and potential real-world impact."
              />

              <ScoreInput
                label="Presentation"
                value={presentation}
                setValue={setPresentation}
                description="Clarity, demonstration and communication."
              />

              <div style={styles.totalBox}>
                <div>
                  <span style={styles.totalLabel}>
                    CURRENT TOTAL
                  </span>

                  <p style={styles.totalHint}>
                    Maximum possible score: 50
                  </p>
                </div>

                <strong style={styles.totalScore}>
                  {getTotal()}
                  <span style={styles.totalSuffix}>
                    /50
                  </span>
                </strong>
              </div>

              <div>
                <label style={styles.label}>
                  Comments / Feedback
                </label>

                <p style={styles.commentHint}>
                  Provide constructive feedback
                  for the team.
                </p>

                <textarea
                  value={comments}
                  onChange={(event) =>
                    setComments(
                      event.target.value
                    )
                  }
                  rows="5"
                  placeholder="Enter constructive feedback for the team..."
                  style={styles.textarea}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  ...styles.submitButton,
                  opacity: submitting
                    ? 0.6
                    : 1
                }}
              >
                {submitting
                  ? "Submitting..."
                  : "Submit Evaluation"}

                {!submitting && (
                  <span>→</span>
                )}
              </button>
            </form>
          </section>
        )}

        {/* ASSIGNED PROJECTS */}

        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <p style={styles.sectionEyebrow}>
                JUDGING QUEUE
              </p>

              <h2 style={styles.sectionTitle}>
                Assigned Projects
              </h2>

              <p style={styles.sectionDescription}>
                Review each assigned project and
                submit your evaluation.
              </p>
            </div>

            <span style={styles.sectionBadge}>
              {assignments.length} PROJECT
              {assignments.length !== 1
                ? "S"
                : ""}
            </span>
          </div>

          {assignments.length === 0 ? (
            <div style={styles.emptyCard}>
              <div style={styles.emptyIcon}>
                ◇
              </div>

              <h3 style={styles.emptyTitle}>
                No Projects Assigned
              </h3>

              <p style={styles.emptyText}>
                You currently have no projects
                assigned for evaluation.
              </p>
            </div>
          ) : (
            <div style={styles.projectGrid}>
              {assignments.map(
                (assignment, index) => {
                  const completed =
                    isCompleted(assignment);

                  return (
                    <div
                      key={
                        assignment._id ||
                        index
                      }
                      style={styles.projectCard}
                    >
                      <div style={styles.projectTop}>
                        <span
                          style={{
                            ...styles.statusBadge,
                            ...(completed
                              ? styles.completedBadge
                              : styles.pendingBadge)
                          }}
                        >
                          ●{" "}
                          {completed
                            ? "Evaluated"
                            : "Pending"}
                        </span>

                        <span
                          style={styles.projectNumber}
                        >
                          #
                          {String(
                            index + 1
                          ).padStart(2, "0")}
                        </span>
                      </div>

                      <div style={styles.goldLine}></div>

                      <h3 style={styles.projectTitle}>
                        {getProjectTitle(
                          assignment
                        )}
                      </h3>

                      <p style={styles.teamText}>
                        TEAM •{" "}
                        <strong>
                          {getTeamName(
                            assignment
                          )}
                        </strong>
                      </p>

                      <p style={styles.description}>
                        {getProjectDescription(
                          assignment
                        )}
                      </p>

                      <div style={styles.cardLinks}>
                        {getGithubUrl(
                          assignment
                        ) && (
                          <a
                            href={getGithubUrl(
                              assignment
                            )}
                            target="_blank"
                            rel="noreferrer"
                            style={styles.smallLink}
                          >
                            GitHub ↗
                          </a>
                        )}

                        {getDemoUrl(
                          assignment
                        ) && (
                          <a
                            href={getDemoUrl(
                              assignment
                            )}
                            target="_blank"
                            rel="noreferrer"
                            style={styles.smallLink}
                          >
                            Demo ↗
                          </a>
                        )}
                      </div>

                      <div style={styles.cardDeadline}>
                        <span
                          style={
                            styles.cardDeadlineLabel
                          }
                        >
                          DEADLINE
                        </span>

                        <strong
                          style={
                            styles.cardDeadlineValue
                          }
                        >
                          {formatDate(
                            getDeadline(
                              assignment
                            )
                          )}
                        </strong>
                      </div>

                      {!completed ? (
                        <button
                          onClick={() =>
                            openEvaluation(
                              assignment
                            )
                          }
                          style={
                            styles.evaluateButton
                          }
                        >
                          Evaluate Project
                          <span>→</span>
                        </button>
                      ) : (
                        <div
                          style={
                            styles.completedMessage
                          }
                        >
                          ✓ Evaluation Submitted
                        </div>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          )}
        </section>

        {/* SUBMITTED EVALUATIONS */}

        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <p style={styles.sectionEyebrow}>
                YOUR RECORD
              </p>

              <h2 style={styles.sectionTitle}>
                My Submitted Evaluations
              </h2>

              <p style={styles.sectionDescription}>
                Evaluations you have already
                submitted.
              </p>
            </div>

            <span style={styles.sectionBadge}>
              {scores.length} SUBMITTED
            </span>
          </div>

          {scores.length === 0 ? (
            <div style={styles.emptyCard}>
              <div style={styles.emptyIcon}>
                ★
              </div>

              <p style={styles.emptyText}>
                No evaluations submitted yet.
              </p>
            </div>
          ) : (
            <div style={styles.scoreList}>
              {scores.map(
                (score, index) => {
                  const project =
                    score.submission;

                  return (
                    <div
                      key={
                        score._id || index
                      }
                      style={
                        styles.submittedScore
                      }
                    >
                      <div style={styles.submittedMain}>
                        <div
                          style={
                            styles.submittedNumber
                          }
                        >
                          {String(
                            index + 1
                          ).padStart(2, "0")}
                        </div>

                        <div>
                          <h3
                            style={
                              styles.submittedTitle
                            }
                          >
                            {project?.title ||
                              "Project"}
                          </h3>

                          <p
                            style={
                              styles.submittedTotal
                            }
                          >
                            Total Score:{" "}
                            <strong>
                              {
                                score.totalScore
                              }
                              /50
                            </strong>
                          </p>
                        </div>
                      </div>

                      <div
                        style={
                          styles.scoreDetails
                        }
                      >
                        <ScorePill
                          label="Technical"
                          value={
                            score.technicalQuality
                          }
                        />

                        <ScorePill
                          label="Innovation"
                          value={
                            score.innovation
                          }
                        />

                        <ScorePill
                          label="UI/UX"
                          value={score.uiux}
                        />

                        <ScorePill
                          label="Impact"
                          value={score.impact}
                        />

                        <ScorePill
                          label="Presentation"
                          value={
                            score.presentation
                          }
                        />
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  description
}) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statTop}>
        <span style={styles.statLabel}>
          {label}
        </span>

        <span style={styles.statIcon}>
          {icon}
        </span>
      </div>

      <strong style={styles.statNumber}>
        {value}
      </strong>

      <span style={styles.statDescription}>
        {description}
      </span>
    </div>
  );
}

function ScoreInput({
  label,
  value,
  setValue,
  description
}) {
  return (
    <div style={styles.scoreInputBox}>
      <div>
        <label style={styles.label}>
          {label}
        </label>

        <p style={styles.inputDescription}>
          {description}
        </p>
      </div>

      <div style={styles.scoreControl}>
        <input
          type="number"
          min="0"
          max="10"
          step="1"
          value={value}
          onChange={(event) =>
            setValue(event.target.value)
          }
          style={styles.scoreInput}
          placeholder="0-10"
          required
        />

        <span style={styles.scoreMax}>
          /10
        </span>
      </div>
    </div>
  );
}

function ScorePill({ label, value }) {
  return (
    <div style={styles.scorePill}>
      <span style={styles.scorePillLabel}>
        {label}
      </span>

      <strong style={styles.scorePillValue}>
        {value}/10
      </strong>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at 10% 0%, rgba(212,175,55,0.08), transparent 28%), radial-gradient(circle at 90% 20%, rgba(212,175,55,0.05), transparent 24%), #050505",
    color: "#f5f1df",
    fontFamily:
      "Inter, Arial, Helvetica, sans-serif"
  },

  loadingPage: {
    minHeight: "100vh",
    background: "#050505",
    color: "#f5f1df",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "14px"
  },

  loadingLogo: {
    color: "#d4af37",
    fontSize: "25px",
    fontWeight: "900",
    letterSpacing: "4px"
  },

  loadingSpinner: {
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    border:
      "3px solid rgba(212,175,55,0.15)",
    borderTopColor: "#d4af37",
    animation:
      "gold-spin 0.8s linear infinite"
  },

  loadingText: {
    color: "#77715f",
    fontSize: "13px"
  },

  header: {
    position: "sticky",
    top: 0,
    zIndex: 20,
    background:
      "rgba(5,5,5,0.96)",
    backdropFilter: "blur(18px)",
    borderBottom:
      "1px solid rgba(212,175,55,0.18)",
    padding: "16px 40px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px"
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },

  brandBox: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    background:
      "linear-gradient(135deg, #f7e6a5, #d4af37, #9a761d)",
    color: "#080808",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "950",
    fontSize: "21px",
    boxShadow:
      "0 0 25px rgba(212,175,55,0.18)"
  },

  logo: {
    margin: 0,
    fontSize: "21px",
    letterSpacing: "2px",
    fontWeight: "900",
    color: "#f7e6a5"
  },

  subtitle: {
    margin: "3px 0 0",
    color: "#77715f",
    fontSize: "9px",
    letterSpacing: "2px",
    fontWeight: "800"
  },

  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },

  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginRight: "5px"
  },

  avatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background:
      "rgba(212,175,55,0.10)",
    border:
      "1px solid rgba(212,175,55,0.30)",
    color: "#e0bd55",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "900"
  },

  userName: {
    display: "block",
    color: "#f5f1df",
    fontSize: "13px"
  },

  userRole: {
    display: "block",
    color: "#d4af37",
    fontSize: "9px",
    marginTop: "3px",
    letterSpacing: "1.5px",
    fontWeight: "800"
  },

  refreshButton: {
    border:
      "1px solid rgba(212,175,55,0.28)",
    background: "#0d0d0d",
    color: "#e0bd55",
    padding: "10px 15px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "800"
  },

  logoutButton: {
    border:
      "1px solid rgba(212,175,55,0.22)",
    background:
      "linear-gradient(145deg, #1a1a1a, #090909)",
    color: "#f0d77a",
    padding: "10px 17px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "800"
  },

  container: {
    maxWidth: "1240px",
    margin: "0 auto",
    padding: "34px 22px 70px"
  },

  success: {
    background:
      "rgba(212,175,55,0.08)",
    color: "#f0d77a",
    padding: "13px 16px",
    borderRadius: "12px",
    marginBottom: "18px",
    border:
      "1px solid rgba(212,175,55,0.25)",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontWeight: "700"
  },

  error: {
    background:
      "rgba(160,35,35,0.12)",
    color: "#f0a5a5",
    padding: "13px 16px",
    borderRadius: "12px",
    marginBottom: "18px",
    border:
      "1px solid rgba(220,80,80,0.25)",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontWeight: "700"
  },

  messageIcon: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "rgba(212,175,55,0.12)",
    color: "#d4af37",
    fontWeight: "900"
  },

  errorIcon: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "rgba(220,80,80,0.12)",
    color: "#f0a5a5",
    fontWeight: "900"
  },

  hero: {
    position: "relative",
    overflow: "hidden",
    background:
      "linear-gradient(135deg, #17150d, #0e0e0e 55%, #080808)",
    border:
      "1px solid rgba(212,175,55,0.28)",
    borderRadius: "24px",
    padding: "38px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "35px",
    marginBottom: "20px",
    boxShadow:
      "0 25px 70px rgba(0,0,0,0.55)"
  },

  heroContent: {
    maxWidth: "700px"
  },

  heroBadge: {
    display: "inline-block",
    padding: "7px 11px",
    borderRadius: "999px",
    border:
      "1px solid rgba(212,175,55,0.28)",
    background:
      "rgba(212,175,55,0.07)",
    color: "#d4af37",
    fontSize: "9px",
    fontWeight: "900",
    letterSpacing: "1.5px"
  },

  heroTitle: {
    margin: "17px 0 10px",
    fontSize: "34px",
    lineHeight: 1.15,
    fontWeight: "900",
    color: "#ffffff"
  },

  goldText: {
    background:
      "linear-gradient(90deg, #f7e6a5, #d4af37, #f0d77a)",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent"
  },

  heroDescription: {
    margin: 0,
    color: "#aaa28d",
    lineHeight: 1.7,
    fontSize: "14px",
    maxWidth: "650px"
  },

  heroDivider: {
    height: "1px",
    width: "130px",
    margin: "20px 0 11px",
    background:
      "linear-gradient(90deg, #d4af37, transparent)"
  },

  heroHint: {
    margin: 0,
    color: "#77715f",
    fontSize: "11px"
  },

  scaleCard: {
    minWidth: "190px",
    padding: "23px",
    borderRadius: "18px",
    background:
      "linear-gradient(145deg, rgba(212,175,55,0.11), rgba(212,175,55,0.03))",
    border:
      "1px solid rgba(212,175,55,0.26)",
    textAlign: "center"
  },

  scaleStar: {
    color: "#d4af37",
    fontSize: "19px"
  },

  scaleLabel: {
    color: "#9e936f",
    fontSize: "9px",
    letterSpacing: "2px",
    fontWeight: "900",
    margin: "7px 0"
  },

  scaleNumber: {
    color: "#f7e6a5",
    fontSize: "25px"
  },

  scaleLine: {
    height: "1px",
    background:
      "rgba(212,175,55,0.20)",
    margin: "13px 0"
  },

  scaleSmall: {
    color: "#77715f",
    fontSize: "9px",
    margin: 0
  },

  scaleTotal: {
    display: "block",
    color: "#d4af37",
    fontSize: "12px",
    letterSpacing: "1px",
    marginTop: "4px"
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "13px",
    marginBottom: "36px"
  },

  statCard: {
    background:
      "linear-gradient(145deg, #151515, #0b0b0b)",
    border:
      "1px solid rgba(212,175,55,0.16)",
    padding: "20px",
    borderRadius: "17px",
    boxShadow:
      "0 15px 45px rgba(0,0,0,0.32)"
  },

  statTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },

  statLabel: {
    color: "#77715f",
    fontSize: "9px",
    letterSpacing: "1.4px",
    fontWeight: "900"
  },

  statIcon: {
    color: "#d4af37",
    fontSize: "16px"
  },

  statNumber: {
    display: "block",
    color: "#f7e6a5",
    fontSize: "31px",
    lineHeight: 1,
    marginTop: "16px"
  },

  statDescription: {
    display: "block",
    color: "#625e50",
    fontSize: "11px",
    marginTop: "8px"
  },

  evaluationPanel: {
    background:
      "linear-gradient(145deg, #151515, #080808)",
    border:
      "1px solid rgba(212,175,55,0.38)",
    borderRadius: "22px",
    padding: "30px",
    marginBottom: "38px",
    boxShadow:
      "0 25px 75px rgba(0,0,0,0.55)"
  },

  evaluationHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    borderBottom:
      "1px solid rgba(212,175,55,0.13)",
    paddingBottom: "21px",
    marginBottom: "22px"
  },

  panelLabel: {
    color: "#d4af37",
    fontSize: "9px",
    fontWeight: "900",
    letterSpacing: "1.7px",
    margin: "0 0 7px"
  },

  evaluationTitle: {
    margin: 0,
    fontSize: "27px",
    color: "#ffffff",
    fontWeight: "900"
  },

  evaluationTeam: {
    color: "#77715f",
    margin: "7px 0 0",
    fontSize: "11px",
    letterSpacing: "1px"
  },

  closeButton: {
    border:
      "1px solid rgba(212,175,55,0.25)",
    background: "#0b0b0b",
    color: "#c8bea2",
    padding: "9px 14px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "700"
  },

  projectInfo: {
    background:
      "linear-gradient(145deg, rgba(212,175,55,0.055), rgba(255,255,255,0.015))",
    padding: "21px",
    borderRadius: "15px",
    marginBottom: "26px",
    border:
      "1px solid rgba(212,175,55,0.13)"
  },

  infoTitle: {
    margin: "0 0 12px",
    color: "#eee7d0",
    fontSize: "15px"
  },

  projectDescription: {
    color: "#a8a08d",
    lineHeight: 1.7,
    fontSize: "13px",
    margin: 0
  },

  projectLinks: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "16px"
  },

  link: {
    color: "#d4af37",
    fontWeight: "800",
    fontSize: "12px",
    textDecoration: "none",
    padding: "9px 12px",
    borderRadius: "9px",
    background:
      "rgba(212,175,55,0.07)",
    border:
      "1px solid rgba(212,175,55,0.18)"
  },

  deadlineBox: {
    marginTop: "17px",
    padding: "13px 15px",
    background: "#090909",
    borderRadius: "10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
    border:
      "1px solid rgba(212,175,55,0.11)"
  },

  deadlineLabel: {
    display: "block",
    color: "#625e50",
    fontSize: "8px",
    letterSpacing: "1.5px",
    fontWeight: "900",
    marginBottom: "4px"
  },

  deadlineDate: {
    display: "block",
    color: "#cfc5a7",
    fontSize: "12px"
  },

  deadlineStatus: {
    color: "#d4af37",
    fontSize: "10px",
    fontWeight: "900"
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },

  criteriaHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    marginBottom: "3px"
  },

  criteriaTitle: {
    margin: 0,
    color: "#f5f1df",
    fontSize: "18px"
  },

  criteriaSubtitle: {
    margin: "5px 0 0",
    color: "#625e50",
    fontSize: "11px"
  },

  criteriaBadge: {
    color: "#d4af37",
    fontSize: "10px",
    fontWeight: "900",
    padding: "8px 11px",
    borderRadius: "999px",
    background:
      "rgba(212,175,55,0.07)",
    border:
      "1px solid rgba(212,175,55,0.18)"
  },

  scoreInputBox: {
    background:
      "linear-gradient(145deg, #141414, #0a0a0a)",
    border:
      "1px solid rgba(212,175,55,0.13)",
    padding: "15px 17px",
    borderRadius: "12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px"
  },

  label: {
    color: "#e9e2cc",
    fontWeight: "800",
    display: "block",
    fontSize: "13px"
  },

  inputDescription: {
    margin: "5px 0 0",
    color: "#625e50",
    fontSize: "11px",
    lineHeight: 1.5
  },

  scoreControl: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    flexShrink: 0
  },

  scoreInput: {
    width: "72px",
    padding: "11px 8px",
    background: "#080808",
    color: "#f7e6a5",
    border:
      "1px solid rgba(212,175,55,0.32)",
    borderRadius: "9px",
    outline: "none",
    fontSize: "17px",
    fontWeight: "900",
    textAlign: "center"
  },

  scoreMax: {
    color: "#625e50",
    fontSize: "11px",
    fontWeight: "700"
  },

  totalBox: {
    background:
      "linear-gradient(135deg, rgba(212,175,55,0.12), rgba(212,175,55,0.035))",
    padding: "19px 21px",
    borderRadius: "13px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    border:
      "1px solid rgba(212,175,55,0.25)",
    marginTop: "3px"
  },

  totalLabel: {
    color: "#d4af37",
    fontSize: "10px",
    fontWeight: "900",
    letterSpacing: "1.5px"
  },

  totalHint: {
    margin: "4px 0 0",
    color: "#625e50",
    fontSize: "10px"
  },

  totalScore: {
    color: "#f7e6a5",
    fontSize: "26px",
    fontWeight: "950"
  },

  totalSuffix: {
    color: "#77715f",
    fontSize: "14px"
  },

  commentHint: {
    color: "#625e50",
    margin: "5px 0 9px",
    fontSize: "11px"
  },

  textarea: {
    width: "100%",
    padding: "13px",
    border:
      "1px solid rgba(212,175,55,0.18)",
    background: "#080808",
    color: "#eee7d0",
    borderRadius: "10px",
    resize: "vertical",
    fontSize: "13px",
    outline: "none",
    minHeight: "120px",
    boxSizing: "border-box"
  },

  submitButton: {
    border:
      "1px solid rgba(240,215,122,0.40)",
    background:
      "linear-gradient(135deg, #f0d77a, #d4af37, #b88918)",
    color: "#080808",
    padding: "14px 20px",
    borderRadius: "11px",
    cursor: "pointer",
    fontWeight: "950",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "9px",
    boxShadow:
      "0 10px 30px rgba(212,175,55,0.14)"
  },

  section: {
    marginBottom: "42px"
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "20px",
    marginBottom: "18px"
  },

  sectionEyebrow: {
    color: "#d4af37",
    fontSize: "9px",
    fontWeight: "900",
    letterSpacing: "2px",
    margin: "0 0 6px"
  },

  sectionTitle: {
    margin: 0,
    color: "#f5f1df",
    fontSize: "23px",
    fontWeight: "900"
  },

  sectionDescription: {
    margin: "6px 0 0",
    color: "#625e50",
    fontSize: "12px"
  },

  sectionBadge: {
    color: "#9e936f",
    fontSize: "9px",
    fontWeight: "900",
    letterSpacing: "1px",
    padding: "7px 10px",
    border:
      "1px solid rgba(212,175,55,0.17)",
    borderRadius: "999px",
    background:
      "rgba(212,175,55,0.04)"
  },

  projectGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "16px"
  },

  projectCard: {
    background:
      "linear-gradient(145deg, #151515, #090909)",
    border:
      "1px solid rgba(212,175,55,0.15)",
    borderRadius: "17px",
    padding: "21px",
    boxShadow:
      "0 18px 45px rgba(0,0,0,0.34)"
  },

  projectTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },

  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "9px",
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: "0.8px"
  },

  completedBadge: {
    background:
      "rgba(212,175,55,0.10)",
    color: "#d4af37",
    border:
      "1px solid rgba(212,175,55,0.22)"
  },

  pendingBadge: {
    background:
      "rgba(240,215,122,0.08)",
    color: "#e0bd55",
    border:
      "1px solid rgba(240,215,122,0.20)"
  },

  projectNumber: {
    color: "#4f4b40",
    fontWeight: "900",
    fontSize: "11px"
  },

  goldLine: {
    height: "1px",
    width: "45px",
    background:
      "linear-gradient(90deg, #d4af37, transparent)",
    margin: "17px 0 13px"
  },

  projectTitle: {
    margin: 0,
    color: "#f5f1df",
    fontSize: "19px",
    fontWeight: "900"
  },

  teamText: {
    color: "#776e58",
    fontSize: "10px",
    letterSpacing: "1px",
    margin: "8px 0 0"
  },

  description: {
    color: "#827c6d",
    lineHeight: 1.65,
    fontSize: "12px",
    minHeight: "58px",
    margin: "13px 0 0"
  },

  cardLinks: {
    display: "flex",
    gap: "8px",
    margin: "14px 0",
    flexWrap: "wrap"
  },

  smallLink: {
    color: "#d4af37",
    fontWeight: "800",
    fontSize: "11px",
    textDecoration: "none",
    padding: "6px 9px",
    borderRadius: "7px",
    background:
      "rgba(212,175,55,0.06)",
    border:
      "1px solid rgba(212,175,55,0.14)"
  },

  cardDeadline: {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
    padding: "10px 0",
    borderTop:
      "1px solid rgba(212,175,55,0.09)",
    marginBottom: "10px"
  },

  cardDeadlineLabel: {
    color: "#4f4b40",
    fontSize: "8px",
    letterSpacing: "1px",
    fontWeight: "900"
  },

  cardDeadlineValue: {
    color: "#827c6d",
    fontSize: "10px"
  },

  evaluateButton: {
    width: "100%",
    border:
      "1px solid rgba(240,215,122,0.35)",
    background:
      "linear-gradient(135deg, #e0bd55, #b88918)",
    color: "#080808",
    padding: "12px",
    borderRadius: "9px",
    cursor: "pointer",
    fontWeight: "950",
    fontSize: "12px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px"
  },

  completedMessage: {
    width: "100%",
    boxSizing: "border-box",
    textAlign: "center",
    background:
      "rgba(212,175,55,0.06)",
    color: "#d4af37",
    padding: "11px",
    borderRadius: "9px",
    fontWeight: "800",
    fontSize: "11px",
    border:
      "1px solid rgba(212,175,55,0.16)"
  },

  emptyCard: {
    background:
      "linear-gradient(145deg, #131313, #090909)",
    padding: "38px 25px",
    borderRadius: "17px",
    textAlign: "center",
    color: "#625e50",
    border:
      "1px solid rgba(212,175,55,0.13)"
  },

  emptyIcon: {
    width: "46px",
    height: "46px",
    borderRadius: "50%",
    margin: "0 auto 13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#d4af37",
    background:
      "rgba(212,175,55,0.07)",
    border:
      "1px solid rgba(212,175,55,0.18)",
    fontSize: "18px"
  },

  emptyTitle: {
    color: "#b8b19a",
    fontSize: "16px",
    margin: "0 0 6px"
  },

  emptyText: {
    margin: 0,
    fontSize: "12px",
    lineHeight: 1.6
  },

  scoreList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },

  submittedScore: {
    background:
      "linear-gradient(145deg, #141414, #090909)",
    border:
      "1px solid rgba(212,175,55,0.14)",
    borderRadius: "14px",
    padding: "17px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap"
  },

  submittedMain: {
    display: "flex",
    alignItems: "center",
    gap: "13px"
  },

  submittedNumber: {
    width: "36px",
    height: "36px",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#d4af37",
    background:
      "rgba(212,175,55,0.07)",
    border:
      "1px solid rgba(212,175,55,0.15)",
    fontSize: "10px",
    fontWeight: "900"
  },

  submittedTitle: {
    margin: 0,
    color: "#eee7d0",
    fontSize: "14px"
  },

  submittedTotal: {
    margin: "4px 0 0",
    color: "#625e50",
    fontSize: "10px"
  },

  scoreDetails: {
    display: "flex",
    gap: "7px",
    flexWrap: "wrap",
    alignItems: "center"
  },

  scorePill: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "3px",
    padding: "7px 9px",
    minWidth: "68px",
    borderRadius: "8px",
    background:
      "rgba(212,175,55,0.045)",
    border:
      "1px solid rgba(212,175,55,0.11)"
  },

  scorePillLabel: {
    color: "#625e50",
    fontSize: "8px",
    fontWeight: "800"
  },

  scorePillValue: {
    color: "#d4af37",
    fontSize: "10px"
  }
};

export default JudgeDashboard;