import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "https://dogfood-0f1x.onrender.com/api";

function OrganizerDashboard() {
  const navigate = useNavigate();

  const [hackathons, setHackathons] = useState([]);
  const [selectedHackathon, setSelectedHackathon] =
    useState("");

  const [results, setResults] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  const [loading, setLoading] = useState(true);
  const [resultsLoading, setResultsLoading] =
    useState(false);

  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const user =
    JSON.parse(localStorage.getItem("user")) || {};

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchHackathons();
  }, []);

  useEffect(() => {
    if (selectedHackathon) {
      fetchHackathonData(selectedHackathon);
    }
  }, [selectedHackathon]);

  const fetchHackathons = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/hackathons`,
        {
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

      const hackathonList = Array.isArray(data)
        ? data
        : data.hackathons || [];

      setHackathons(hackathonList);

      if (hackathonList.length > 0) {
        setSelectedHackathon(
          hackathonList[0]._id
        );
      }
    } catch (error) {
      setError(
        error.message ||
          "Failed to load hackathons"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchHackathonData = async (
    hackathonId
  ) => {
    try {
      setResultsLoading(true);
      setError("");

      const [
        resultsResponse,
        leaderboardResponse
      ] = await Promise.all([
        fetch(
          `${API_URL}/results/hackathon/${hackathonId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        ),

        fetch(
          `${API_URL}/results/leaderboard/${hackathonId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )
      ]);

      const resultsData =
        await resultsResponse.json();

      const leaderboardData =
        await leaderboardResponse.json();

      if (!resultsResponse.ok) {
        throw new Error(
          resultsData.message ||
            "Failed to fetch results"
        );
      }

      if (!leaderboardResponse.ok) {
        throw new Error(
          leaderboardData.message ||
            "Failed to fetch leaderboard"
        );
      }

      setResults(
        Array.isArray(resultsData)
          ? resultsData
          : []
      );

      setLeaderboard(
        Array.isArray(
          leaderboardData?.leaderboard
        )
          ? leaderboardData.leaderboard
          : []
      );
    } catch (error) {
      setError(
        error.message ||
          "Failed to load hackathon data"
      );
    } finally {
      setResultsLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);

      await fetchHackathons();

      if (selectedHackathon) {
        await fetchHackathonData(
          selectedHackathon
        );
      }
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  const selectedHackathonData =
    hackathons.find(
      (hackathon) =>
        hackathon._id === selectedHackathon
    );

  const getStatus = (hackathon) => {
    if (!hackathon) {
      return "Unknown";
    }

    const now = new Date();

    const start =
      new Date(hackathon.startDate);

    const end =
      new Date(hackathon.endDate);

    const deadline =
      new Date(
        hackathon.submissionDeadline
      );

    if (hackathon.status === "completed") {
      return "Completed";
    }

    if (now < start) {
      return "Upcoming";
    }

    if (now <= deadline) {
      return "Active";
    }

    if (now <= end) {
      return "Submission Closed";
    }

    return "Completed";
  };

  const formatDate = (date) => {
    if (!date) {
      return "Not available";
    }

    return new Date(date).toLocaleString(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short"
      }
    );
  };

  const totalSubmissions =
    results.length;

  const evaluatedProjects =
    results.filter(
      (result) => result.evaluated
    ).length;

  const pendingProjects =
    results.filter(
      (result) => !result.evaluated
    ).length;

  const activeStatus =
    selectedHackathonData
      ? getStatus(selectedHackathonData)
      : "No Hackathon";

  return (
    <div className="organizer-page">

      {/* HEADER */}

      <header className="organizer-header">

        <div className="brand-area">

          <div className="brand-icon">
            🚀
          </div>

          <div>
            <div className="brand-name">
              DOGFOOD
              <span>2026</span>
            </div>

            <div className="brand-subtitle">
              HACKATHON MANAGEMENT PLATFORM
            </div>
          </div>

        </div>

        <div className="header-user">

          <div className="avatar">
            {(user.name || "O")
              .charAt(0)
              .toUpperCase()}
          </div>

          <div className="user-details">
            <strong>
              {user.name || "Organizer"}
            </strong>

            <span>
              {user.role || "organizer"}
            </span>
          </div>

        </div>

      </header>


      {/* MAIN */}

      <main className="organizer-main">

        {/* HERO */}

        <section className="hero">

          <div className="hero-content">

            <div className="live-badge">
              <span className="live-dot" />
              ORGANIZER CONTROL CENTER
            </div>

            <h1>
              Welcome back,
              <span>
                {" "}
                {user.name || "Organizer"}
              </span>
            </h1>

            <p>
              Control your hackathons, monitor
              submissions, track evaluations and
              manage your leaderboard from one
              powerful workspace.
            </p>

          </div>

          <div className="hero-decoration">

            <div className="orbit orbit-one" />

            <div className="orbit orbit-two" />

            <div className="hero-core">
              🚀
            </div>

          </div>

        </section>


        {/* QUICK ACTIONS */}

        <section className="actions-panel">

          <div className="section-label">
            QUICK ACTIONS
          </div>

          <div className="action-grid">

            <button
              className="action-card create-action"
              onClick={() =>
                navigate(
                  "/organizer/create-hackathon"
                )
              }
            >

              <div className="action-icon">
                ＋
              </div>

              <div className="action-content">
                <strong>
                  Create Hackathon
                </strong>

                <span>
                  Launch a new event
                </span>
              </div>

              <div className="action-arrow">
                →
              </div>

            </button>


            <button
              className="action-card"
              onClick={() =>
                navigate(
                  "/organizer/manage-hackathons"
                )
              }
            >

              <div className="action-icon">
                ⚙
              </div>

              <div className="action-content">
                <strong>
                  Manage Hackathons
                </strong>

                <span>
                  Edit and organize events
                </span>
              </div>

              <div className="action-arrow">
                →
              </div>

            </button>


            <button
              className="action-card"
              onClick={handleRefresh}
              disabled={refreshing}
            >

              <div
                className={`action-icon ${
                  refreshing
                    ? "refresh-spinning"
                    : ""
                }`}
              >
                ↻
              </div>

              <div className="action-content">
                <strong>
                  {refreshing
                    ? "Refreshing..."
                    : "Refresh Data"}
                </strong>

                <span>
                  Sync latest results
                </span>
              </div>

              <div className="action-arrow">
                ↻
              </div>

            </button>


            <button
              className="action-card logout-action"
              onClick={handleLogout}
            >

              <div className="action-icon">
                ↪
              </div>

              <div className="action-content">
                <strong>
                  Logout
                </strong>

                <span>
                  End organizer session
                </span>
              </div>

              <div className="action-arrow">
                →
              </div>

            </button>

          </div>

        </section>


        {/* ERROR */}

        {error && (
          <div className="error-box">

            <span>⚠</span>

            <div>
              <strong>
                Something went wrong
              </strong>

              <p>{error}</p>
            </div>

          </div>
        )}


        {/* SELECT HACKATHON */}

        <section className="section-card">

          <div className="section-header">

            <div>

              <div className="section-kicker">
                EVENT MANAGEMENT
              </div>

              <h2>
                Select Hackathon
              </h2>

              <p>
                Choose an event to monitor
                its activity and results.
              </p>

            </div>

            {selectedHackathonData && (
              <div className="status-chip">
                <span />
                {activeStatus}
              </div>
            )}

          </div>


          {loading ? (

            <div className="loading-card">
              <div className="spinner" />
              <span>
                Loading hackathons...
              </span>
            </div>

          ) : hackathons.length === 0 ? (

            <div className="empty-card">

              <div className="empty-icon">
                🚀
              </div>

              <h3>
                No Hackathons Yet
              </h3>

              <p>
                Create your first hackathon
                and start building an amazing
                event.
              </p>

              <button
                className="primary-button"
                onClick={() =>
                  navigate(
                    "/organizer/create-hackathon"
                  )
                }
              >
                <span>＋</span>
                Create Your First Hackathon
              </button>

            </div>

          ) : (

            <div className="select-wrapper">

              <span className="select-icon">
                ◈
              </span>

              <select
                className="hackathon-select"
                value={selectedHackathon}
                onChange={(e) =>
                  setSelectedHackathon(
                    e.target.value
                  )
                }
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

              <span className="select-arrow">
                ▼
              </span>

            </div>

          )}

        </section>


        {selectedHackathonData && (
          <>

            {/* HACKATHON OVERVIEW */}

            <section className="event-card">

              <div className="event-top">

                <div className="event-main">

                  <div className="event-kicker">
                    CURRENT HACKATHON
                  </div>

                  <h2>
                    {selectedHackathonData.title}
                  </h2>

                  <p>
                    {
                      selectedHackathonData.description
                    }
                  </p>

                </div>

                <div
                  className={`event-status ${activeStatus
                    .toLowerCase()
                    .replaceAll(" ", "-")}`}
                >
                  <span />
                  {activeStatus}
                </div>

              </div>


              <div className="date-grid">

                <div className="date-item">
                  <span>START DATE</span>

                  <strong>
                    {formatDate(
                      selectedHackathonData.startDate
                    )}
                  </strong>
                </div>

                <div className="date-item">
                  <span>END DATE</span>

                  <strong>
                    {formatDate(
                      selectedHackathonData.endDate
                    )}
                  </strong>
                </div>

                <div className="date-item">
                  <span>
                    SUBMISSION DEADLINE
                  </span>

                  <strong>
                    {formatDate(
                      selectedHackathonData.submissionDeadline
                    )}
                  </strong>
                </div>

                <div className="date-item">
                  <span>
                    MAX TEAM SIZE
                  </span>

                  <strong>
                    {selectedHackathonData.maxTeamSize}
                    <small> members</small>
                  </strong>
                </div>

              </div>

            </section>


            {/* STATS */}

            <section className="stats-grid">

              <div className="stat-card">

                <div className="stat-top">
                  <span>
                    TOTAL SUBMISSIONS
                  </span>

                  <div className="stat-icon">
                    📁
                  </div>
                </div>

                <strong>
                  {totalSubmissions}
                </strong>

                <small>
                  Projects submitted
                </small>

              </div>


              <div className="stat-card">

                <div className="stat-top">
                  <span>
                    EVALUATED
                  </span>

                  <div className="stat-icon">
                    ✓
                  </div>
                </div>

                <strong>
                  {evaluatedProjects}
                </strong>

                <small>
                  Projects reviewed
                </small>

              </div>


              <div className="stat-card">

                <div className="stat-top">
                  <span>
                    PENDING
                  </span>

                  <div className="stat-icon">
                    ⏳
                  </div>
                </div>

                <strong>
                  {pendingProjects}
                </strong>

                <small>
                  Awaiting evaluation
                </small>

              </div>


              <div className="stat-card">

                <div className="stat-top">
                  <span>
                    RANKED TEAMS
                  </span>

                  <div className="stat-icon">
                    🏆
                  </div>
                </div>

                <strong>
                  {leaderboard.length}
                </strong>

                <small>
                  Teams on leaderboard
                </small>

              </div>

            </section>


            {/* LEADERBOARD */}

            <section className="section-card">

              <div className="section-header">

                <div>

                  <div className="section-kicker">
                    PERFORMANCE
                  </div>

                  <h2>
                    🏆 Leaderboard
                  </h2>

                  <p>
                    Current project rankings
                    based on judge evaluations.
                  </p>

                </div>

                <div className="count-badge">
                  {leaderboard.length} Ranked
                </div>

              </div>


              {resultsLoading ? (

                <div className="loading-card">
                  <div className="spinner" />

                  <span>
                    Loading leaderboard...
                  </span>
                </div>

              ) : leaderboard.length === 0 ? (

                <div className="empty-small">

                  <span>🏆</span>

                  <div>
                    <strong>
                      No evaluated projects yet
                    </strong>

                    <p>
                      Rankings will appear here
                      once judges evaluate projects.
                    </p>
                  </div>

                </div>

              ) : (

                <div className="table-wrapper">

                  <table className="leaderboard-table">

                    <thead>
                      <tr>
                        <th>RANK</th>
                        <th>TEAM</th>
                        <th>PROJECT</th>
                        <th>JUDGES</th>
                        <th>SCORE</th>
                        <th>RESULT</th>
                      </tr>
                    </thead>

                    <tbody>

                      {leaderboard.map(
                        (item) => (

                          <tr
                            key={
                              item.submissionId
                            }
                          >

                            <td>
                              <span
                                className={`rank rank-${item.rank}`}
                              >
                                #{item.rank}
                              </span>
                            </td>

                            <td>
                              <strong className="team-name">
                                {item.teamName}
                              </strong>
                            </td>

                            <td>
                              <span className="project-name">
                                {item.projectTitle}
                              </span>
                            </td>

                            <td>
                              <span className="judge-count">
                                {item.judgeCount}
                              </span>
                            </td>

                            <td>
                              <strong className="score">
                                {item.averageScore}
                                <span>/50</span>
                              </strong>
                            </td>

                            <td>
                              <div className="percentage">
                                {item.percentage}%
                              </div>
                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              )}

            </section>


            {/* PROJECT RESULTS */}

            <section className="section-card">

              <div className="section-header">

                <div>

                  <div className="section-kicker">
                    SUBMISSIONS
                  </div>

                  <h2>
                    📋 Project Results
                  </h2>

                  <p>
                    Review all projects submitted
                    to this hackathon.
                  </p>

                </div>

                <div className="count-badge">
                  {results.length} Projects
                </div>

              </div>


              {resultsLoading ? (

                <div className="loading-card">

                  <div className="spinner" />

                  <span>
                    Loading projects...
                  </span>

                </div>

              ) : results.length === 0 ? (

                <div className="empty-small">

                  <span>📋</span>

                  <div>

                    <strong>
                      No projects submitted yet
                    </strong>

                    <p>
                      Submitted projects will
                      appear here.
                    </p>

                  </div>

                </div>

              ) : (

                <div className="project-grid">

                  {results.map(
                    (result) => (

                      <div
                        className="project-card"
                        key={
                          result.submissionId
                        }
                      >

                        <div className="project-header">

                          <div>

                            <span className="team-label">
                              {result.team?.name ||
                                "Unknown Team"}
                            </span>

                            <h3>
                              {result.title}
                            </h3>

                          </div>

                          <span
                            className={
                              result.evaluated
                                ? "evaluated"
                                : "pending"
                            }
                          >
                            <span />

                            {result.evaluated
                              ? "Evaluated"
                              : "Pending"}
                          </span>

                        </div>


                        <p className="project-description">
                          {result.description}
                        </p>


                        <div className="score-row">

                          <div>
                            <span>
                              AVERAGE SCORE
                            </span>

                            <strong>
                              {result.evaluated
                                ? `${result.averageScore}/50`
                                : "—"}
                            </strong>
                          </div>

                          <div>
                            <span>
                              PERCENTAGE
                            </span>

                            <strong>
                              {result.evaluated
                                ? `${result.percentage}%`
                                : "—"}
                            </strong>
                          </div>

                        </div>


                        <div className="project-footer">

                          <span>
                            {result.evaluated
                              ? "✓ Evaluation complete"
                              : "⏳ Awaiting judge review"}
                          </span>

                          <div className="project-links">

                            {result.githubUrl && (
                              <a
                                href={
                                  result.githubUrl
                                }
                                target="_blank"
                                rel="noreferrer"
                              >
                                GitHub ↗
                              </a>
                            )}

                            {result.demoUrl && (
                              <a
                                href={
                                  result.demoUrl
                                }
                                target="_blank"
                                rel="noreferrer"
                              >
                                Demo ↗
                              </a>
                            )}

                          </div>

                        </div>

                      </div>

                    )
                  )}

                </div>

              )}

            </section>

          </>
        )}

      </main>


      {/* ================= BLACK + GOLD CSS ================= */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #050505;
        }

        .organizer-page {
          min-height: 100vh;
          color: #f5f1df;

          background:
            radial-gradient(
              circle at 10% 5%,
              rgba(212, 175, 55, 0.11),
              transparent 28%
            ),
            radial-gradient(
              circle at 90% 85%,
              rgba(212, 175, 55, 0.06),
              transparent 28%
            ),
            #050505;

          font-family:
            Inter,
            Arial,
            Helvetica,
            sans-serif;

          overflow-x: hidden;
        }


        /* HEADER */

        .organizer-header {
          min-height: 86px;

          padding:
            16px 5%;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 20px;

          position: sticky;
          top: 0;

          z-index: 50;

          background:
            rgba(5, 5, 5, 0.90);

          border-bottom:
            1px solid
            rgba(212, 175, 55, 0.22);

          backdrop-filter:
            blur(20px);

          box-shadow:
            0 10px 40px
            rgba(0, 0, 0, 0.55);
        }


        .brand-area {
          display: flex;
          align-items: center;
          gap: 13px;
        }


        .brand-icon {
          width: 46px;
          height: 46px;

          display: grid;
          place-items: center;

          border-radius: 14px;

          background:
            linear-gradient(
              135deg,
              #f0d77a,
              #b88a18
            );

          color: #080808;

          font-size: 21px;

          box-shadow:
            0 0 28px
            rgba(212, 175, 55, 0.25);
        }


        .brand-name {
          font-size: 19px;
          font-weight: 950;

          letter-spacing: 1px;

          color: #f7e6a5;
        }


        .brand-name span {
          color: #d4af37;
          margin-left: 5px;
        }


        .brand-subtitle {
          margin-top: 3px;

          color: #77715f;

          font-size: 9px;
          font-weight: 800;

          letter-spacing: 1.7px;
        }


        .header-user {
          display: flex;
          align-items: center;

          gap: 11px;

          padding:
            7px 12px 7px 7px;

          border:
            1px solid
            rgba(212, 175, 55, 0.18);

          border-radius: 15px;

          background:
            rgba(15, 15, 15, 0.92);
        }


        .avatar {
          width: 39px;
          height: 39px;

          display: grid;
          place-items: center;

          border-radius: 12px;

          background:
            linear-gradient(
              135deg,
              #f0d77a,
              #9d7418
            );

          color: #080808;

          font-weight: 950;
        }


        .user-details {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }


        .user-details strong {
          font-size: 13px;
          color: #f5f1df;
        }


        .user-details span {
          color: #8f885f;

          font-size: 10px;

          text-transform: uppercase;

          letter-spacing: 1px;
        }


        /* MAIN */

        .organizer-main {
          width: min(1400px, 90%);

          margin: auto;

          padding:
            42px 0 80px;

          position: relative;

          z-index: 1;
        }


        /* HERO */

        .hero {
          min-height: 285px;

          padding: 45px;

          border-radius: 28px;

          position: relative;

          overflow: hidden;

          display: flex;
          align-items: center;
          justify-content: space-between;

          background:
            linear-gradient(
              135deg,
              #17140b,
              #0b0b0b 65%,
              #11100b
            );

          border:
            1px solid
            rgba(212, 175, 55, 0.28);

          box-shadow:
            0 25px 80px
            rgba(0, 0, 0, 0.60),
            inset 0 1px 0
            rgba(240, 215, 122, 0.08);
        }


        .hero::after {
          content: "";

          position: absolute;

          width: 500px;
          height: 500px;

          right: -180px;
          top: -260px;

          border-radius: 50%;

          background:
            radial-gradient(
              circle,
              rgba(212, 175, 55, 0.18),
              transparent 65%
            );
        }


        .hero-content {
          max-width: 720px;

          position: relative;

          z-index: 2;
        }


        .live-badge {
          display: inline-flex;

          align-items: center;

          gap: 8px;

          padding:
            7px 12px;

          border-radius: 999px;

          border:
            1px solid
            rgba(212, 175, 55, 0.32);

          background:
            rgba(212, 175, 55, 0.07);

          color: #f0d77a;

          font-size: 10px;
          font-weight: 900;

          letter-spacing: 1.5px;
        }


        .live-dot {
          width: 7px;
          height: 7px;

          border-radius: 50%;

          background: #d4af37;

          box-shadow:
            0 0 12px
            rgba(212, 175, 55, 0.8);
        }


        .hero h1 {
          margin:
            20px 0 12px;

          font-size:
            clamp(32px, 4vw, 52px);

          line-height: 1.05;

          letter-spacing: -2px;

          color: #f5f1df;
        }


        .hero h1 span {
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


        .hero p {
          color: #aaa38e;

          max-width: 680px;

          line-height: 1.75;

          font-size: 15px;
        }


        /* HERO DECORATION */

        .hero-decoration {
          width: 190px;
          height: 190px;

          position: relative;

          display: grid;
          place-items: center;

          margin-right: 30px;
        }


        .hero-core {
          width: 88px;
          height: 88px;

          border-radius: 50%;

          display: grid;
          place-items: center;

          font-size: 38px;

          position: relative;

          z-index: 3;

          background:
            linear-gradient(
              135deg,
              #f0d77a,
              #a87915
            );

          box-shadow:
            0 0 70px
            rgba(212, 175, 55, 0.32);
        }


        .orbit {
          position: absolute;

          border:
            1px solid
            rgba(212, 175, 55, 0.30);

          border-radius: 50%;
        }


        .orbit-one {
          width: 145px;
          height: 145px;

          transform:
            rotate(25deg);
        }


        .orbit-two {
          width: 185px;
          height: 105px;

          transform:
            rotate(-35deg);

          border-color:
            rgba(240, 215, 122, 0.22);
        }


        /* ACTIONS */

        .actions-panel {
          margin-top: 25px;

          padding: 24px;

          border-radius: 22px;

          background:
            linear-gradient(
              145deg,
              #151515,
              #090909
            );

          border:
            1px solid
            rgba(212, 175, 55, 0.18);

          box-shadow:
            0 18px 55px
            rgba(0, 0, 0, 0.45);
        }


        .section-label,
        .section-kicker,
        .event-kicker {
          color: #a58a37;

          font-size: 10px;

          font-weight: 900;

          letter-spacing: 1.8px;
        }


        .action-grid {
          display: grid;

          grid-template-columns:
            repeat(4, 1fr);

          gap: 12px;

          margin-top: 13px;
        }


        .action-card {
          min-height: 78px;

          padding: 12px;

          display: flex;
          align-items: center;

          gap: 12px;

          text-align: left;

          border-radius: 16px;

          cursor: pointer;

          color: #f5f1df;

          border:
            1px solid
            rgba(212, 175, 55, 0.15);

          background:
            linear-gradient(
              145deg,
              #181818,
              #0a0a0a
            );

          transition:
            transform 0.2s ease,
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }


        .action-card:hover {
          transform:
            translateY(-3px);

          border-color:
            rgba(212, 175, 55, 0.55);

          box-shadow:
            0 0 28px
            rgba(212, 175, 55, 0.10);
        }


        .action-card:disabled {
          opacity: 0.7;
          cursor: wait;
        }


        .create-action {
          background:
            linear-gradient(
              135deg,
              rgba(212, 175, 55, 0.18),
              rgba(30, 25, 10, 0.80)
            );

          border-color:
            rgba(212, 175, 55, 0.35);
        }


        .logout-action:hover {
          border-color:
            rgba(212, 175, 55, 0.45);
        }


        .action-icon {
          flex: 0 0 auto;

          width: 43px;
          height: 43px;

          border-radius: 12px;

          display: grid;
          place-items: center;

          font-size: 20px;

          color: #f0d77a;

          background:
            rgba(212, 175, 55, 0.08);

          border:
            1px solid
            rgba(212, 175, 55, 0.22);
        }


        .action-content {
          min-width: 0;

          display: flex;
          flex-direction: column;

          gap: 4px;
        }


        .action-content strong {
          font-size: 12px;
        }


        .action-content span {
          color: #77715f;
          font-size: 10px;
        }


        .action-arrow {
          margin-left: auto;

          color: #8f885f;

          font-size: 18px;
        }


        .refresh-spinning {
          animation:
            spin 0.8s linear infinite;
        }


        @keyframes spin {
          to {
            transform:
              rotate(360deg);
          }
        }


        /* ERROR */

        .error-box {
          margin-top: 20px;

          padding: 16px 18px;

          display: flex;

          gap: 13px;

          border-radius: 16px;

          color: #f3c0b7;

          background:
            rgba(80, 20, 15, 0.35);

          border:
            1px solid
            rgba(180, 70, 50, 0.25);
        }


        .error-box > span {
          font-size: 20px;
        }


        .error-box strong {
          font-size: 13px;
        }


        .error-box p {
          margin: 4px 0 0;

          color: #c99287;

          font-size: 12px;
        }


        /* SECTION */

        .section-card {
          margin-top: 25px;

          padding: 28px;

          border-radius: 23px;

          background:
            linear-gradient(
              145deg,
              rgba(22, 22, 22, 0.98),
              rgba(8, 8, 8, 0.98)
            );

          border:
            1px solid
            rgba(212, 175, 55, 0.17);

          box-shadow:
            0 18px 55px
            rgba(0, 0, 0, 0.45);
        }


        .section-header {
          display: flex;

          align-items: flex-end;

          justify-content:
            space-between;

          gap: 20px;

          margin-bottom: 20px;
        }


        .section-header h2 {
          margin:
            6px 0 5px;

          font-size: 22px;

          letter-spacing: -0.5px;

          color: #f5f1df;
        }


        .section-header p {
          margin: 0;

          color: #77715f;

          font-size: 12px;
        }


        .status-chip,
        .count-badge {
          padding:
            8px 12px;

          border-radius: 999px;

          color: #f0d77a;

          background:
            rgba(212, 175, 55, 0.08);

          border:
            1px solid
            rgba(212, 175, 55, 0.24);

          font-size: 10px;

          font-weight: 800;

          white-space: nowrap;
        }


        .status-chip {
          display: flex;
          align-items: center;
          gap: 7px;
        }


        .status-chip span {
          width: 6px;
          height: 6px;

          border-radius: 50%;

          background: #d4af37;

          box-shadow:
            0 0 9px
            rgba(212, 175, 55, 0.8);
        }


        /* SELECT */

        .select-wrapper {
          position: relative;
        }


        .hackathon-select {
          width: 100%;

          height: 58px;

          padding:
            0 48px;

          appearance: none;

          border-radius: 14px;

          outline: none;

          color: #f5f1df;

          font-size: 14px;

          font-weight: 700;

          background:
            #0b0b0b;

          border:
            1px solid
            rgba(212, 175, 55, 0.20);

          cursor: pointer;
        }


        .hackathon-select:focus {
          border-color:
            #d4af37;

          box-shadow:
            0 0 0 3px
            rgba(212, 175, 55, 0.08);
        }


        .hackathon-select option {
          background: #0b0b0b;
          color: #f5f1df;
        }


        .select-icon,
        .select-arrow {
          position: absolute;

          top: 50%;

          transform:
            translateY(-50%);

          z-index: 2;

          pointer-events: none;
        }


        .select-icon {
          left: 18px;
          color: #d4af37;
        }


        .select-arrow {
          right: 20px;
          color: #8f885f;
          font-size: 10px;
        }


        /* LOADING */

        .loading-card {
          min-height: 110px;

          display: flex;

          align-items: center;
          justify-content: center;

          gap: 12px;

          color: #918a75;

          border-radius: 16px;

          background:
            #090909;

          border:
            1px dashed
            rgba(212, 175, 55, 0.18);
        }


        .spinner {
          width: 22px;
          height: 22px;

          border-radius: 50%;

          border:
            2px solid
            rgba(212, 175, 55, 0.15);

          border-top-color:
            #d4af37;

          animation:
            spin 0.7s linear infinite;
        }


        /* EMPTY */

        .empty-card {
          padding:
            55px 20px;

          text-align: center;

          border-radius: 19px;

          background:
            radial-gradient(
              circle at center,
              rgba(212, 175, 55, 0.08),
              transparent 60%
            ),
            #080808;

          border:
            1px dashed
            rgba(212, 175, 55, 0.22);
        }


        .empty-icon {
          width: 62px;
          height: 62px;

          margin: auto;

          display: grid;
          place-items: center;

          border-radius: 18px;

          background:
            rgba(212, 175, 55, 0.08);

          border:
            1px solid
            rgba(212, 175, 55, 0.20);

          font-size: 27px;
        }


        .empty-card h3 {
          margin:
            16px 0 7px;
        }


        .empty-card p {
          margin:
            0 auto 22px;

          max-width: 450px;

          color: #77715f;

          font-size: 13px;

          line-height: 1.6;
        }


        .primary-button {
          border:
            1px solid
            rgba(240, 215, 122, 0.35);

          padding:
            12px 18px;

          border-radius: 12px;

          color: #090909;

          font-weight: 900;

          cursor: pointer;

          background:
            linear-gradient(
              135deg,
              #f0d77a,
              #d4af37
            );

          box-shadow:
            0 10px 30px
            rgba(212, 175, 55, 0.18);
        }


        .primary-button:hover {
          filter: brightness(1.08);
        }


        /* EVENT */

        .event-card {
          margin-top: 25px;

          padding: 30px;

          border-radius: 25px;

          background:
            linear-gradient(
              135deg,
              #19160d,
              #0c0c0c
            );

          border:
            1px solid
            rgba(212, 175, 55, 0.24);

          box-shadow:
            0 20px 70px
            rgba(0, 0, 0, 0.45);
        }


        .event-top {
          display: flex;

          justify-content:
            space-between;

          align-items:
            flex-start;

          gap: 20px;
        }


        .event-main {
          max-width: 850px;
        }


        .event-main h2 {
          margin:
            7px 0;

          font-size:
            clamp(25px, 3vw, 35px);

          letter-spacing: -1px;

          color: #f7e6a5;
        }


        .event-main p {
          margin: 0;

          color: #a29b86;

          line-height: 1.7;

          font-size: 13px;
        }


        .event-status {
          padding:
            9px 13px;

          display: flex;

          align-items: center;

          gap: 7px;

          border-radius: 999px;

          font-size: 10px;

          font-weight: 900;

          white-space: nowrap;

          background:
            rgba(212, 175, 55, 0.09);

          color: #f0d77a;

          border:
            1px solid
            rgba(212, 175, 55, 0.25);
        }


        .event-status span {
          width: 6px;
          height: 6px;

          border-radius: 50%;

          background: #d4af37;

          box-shadow:
            0 0 10px
            rgba(212, 175, 55, 0.8);
        }


        .event-status.upcoming {
          color: #f0d77a;
        }


        .event-status.submission-closed {
          color: #e0bd55;
        }


        .event-status.completed {
          color: #a9a28e;
        }


        .event-status.completed span {
          background: #77715f;
          box-shadow: none;
        }


        /* DATES */

        .date-grid {
          margin-top: 28px;

          padding-top: 22px;

          display: grid;

          grid-template-columns:
            repeat(4, 1fr);

          border-top:
            1px solid
            rgba(212, 175, 55, 0.10);
        }


        .date-item {
          padding:
            0 20px;

          border-right:
            1px solid
            rgba(212, 175, 55, 0.08);
        }


        .date-item:first-child {
          padding-left: 0;
        }


        .date-item:last-child {
          border-right: none;
        }


        .date-item span {
          display: block;

          margin-bottom: 8px;

          color: #77715f;

          font-size: 9px;

          font-weight: 900;

          letter-spacing: 1.3px;
        }


        .date-item strong {
          font-size: 12px;

          color: #e9e2ca;

          line-height: 1.5;
        }


        .date-item small {
          color: #77715f;

          font-weight: 500;
        }


        /* STATS */

        .stats-grid {
          display: grid;

          grid-template-columns:
            repeat(4, 1fr);

          gap: 15px;

          margin-top: 25px;
        }


        .stat-card {
          padding: 21px;

          min-height: 145px;

          border-radius: 19px;

          position: relative;

          overflow: hidden;

          background:
            linear-gradient(
              145deg,
              #171717,
              #0b0b0b
            );

          border:
            1px solid
            rgba(212, 175, 55, 0.16);

          box-shadow:
            0 15px 45px
            rgba(0, 0, 0, 0.30);
        }


        .stat-card::before {
          content: "";

          position: absolute;

          top: 0;
          left: 0;

          width: 100%;
          height: 2px;

          background:
            linear-gradient(
              90deg,
              transparent,
              #d4af37,
              transparent
            );
        }


        .stat-top {
          display: flex;

          justify-content:
            space-between;

          align-items: center;
        }


        .stat-top > span {
          color: #8f885f;

          font-size: 9px;

          font-weight: 900;

          letter-spacing: 1.1px;
        }


        .stat-icon {
          width: 35px;
          height: 35px;

          display: grid;
          place-items: center;

          border-radius: 10px;

          background:
            rgba(212, 175, 55, 0.08);

          border:
            1px solid
            rgba(212, 175, 55, 0.15);

          color: #f0d77a;

          font-size: 16px;
        }


        .stat-card > strong {
          display: block;

          margin-top: 18px;

          font-size: 34px;

          letter-spacing: -1px;

          color: #f7e6a5;
        }


        .stat-card > small {
          color: #77715f;

          font-size: 10px;
        }


        /* TABLE */

        .table-wrapper {
          overflow-x: auto;

          border-radius: 16px;

          border:
            1px solid
            rgba(212, 175, 55, 0.13);
        }


        .leaderboard-table {
          width: 100%;

          min-width: 750px;

          border-collapse:
            collapse;

          background:
            #090909;
        }


        .leaderboard-table th {
          padding: 15px;

          text-align: left;

          color: #a58a37;

          font-size: 9px;

          letter-spacing: 1.2px;

          background:
            rgba(212, 175, 55, 0.07);

          border-bottom:
            1px solid
            rgba(212, 175, 55, 0.13);
        }


        .leaderboard-table td {
          padding:
            17px 15px;

          border-bottom:
            1px solid
            rgba(212, 175, 55, 0.07);

          color: #c8c0aa;

          font-size: 12px;
        }


        .leaderboard-table tbody tr {
          transition:
            background 0.2s ease;
        }


        .leaderboard-table tbody tr:hover {
          background:
            rgba(212, 175, 55, 0.035);
        }


        .leaderboard-table tbody tr:last-child td {
          border-bottom: none;
        }


        .rank {
          display: inline-flex;

          min-width: 37px;

          height: 28px;

          padding:
            0 8px;

          align-items: center;
          justify-content: center;

          border-radius: 9px;

          color: #e0bd55;

          background:
            rgba(212, 175, 55, 0.08);

          font-weight: 900;
        }


        .rank-1 {
          color: #080808;

          background:
            linear-gradient(
              135deg,
              #f7e6a5,
              #d4af37
            );
        }


        .rank-2 {
          color: #ddd6c1;

          background:
            rgba(180, 180, 170, 0.12);
        }


        .rank-3 {
          color: #e6c18b;

          background:
            rgba(180, 120, 60, 0.12);
        }


        .team-name {
          color: #f5f1df;
        }


        .project-name {
          color: #a29b86;
        }


        .judge-count {
          color: #d4af37;

          font-weight: 800;
        }


        .score {
          color: #f7e6a5;
        }


        .score span {
          color: #77715f;

          font-weight: 500;
        }


        .percentage {
          display: inline-block;

          padding:
            6px 9px;

          border-radius: 8px;

          color: #080808;

          background:
            linear-gradient(
              135deg,
              #f0d77a,
              #d4af37
            );

          font-weight: 900;
        }


        /* EMPTY SMALL */

        .empty-small {
          padding: 25px;

          display: flex;

          align-items: center;

          gap: 15px;

          border-radius: 16px;

          background:
            #090909;

          border:
            1px dashed
            rgba(212, 175, 55, 0.16);
        }


        .empty-small > span {
          width: 43px;
          height: 43px;

          display: grid;
          place-items: center;

          border-radius: 12px;

          background:
            rgba(212, 175, 55, 0.08);

          border:
            1px solid
            rgba(212, 175, 55, 0.16);

          font-size: 19px;
        }


        .empty-small strong {
          font-size: 13px;

          color: #f0d77a;
        }


        .empty-small p {
          margin:
            4px 0 0;

          color: #77715f;

          font-size: 11px;
        }


        /* PROJECT GRID */

        .project-grid {
          display: grid;

          grid-template-columns:
            repeat(2, 1fr);

          gap: 15px;
        }


        .project-card {
          padding: 22px;

          border-radius: 20px;

          background:
            linear-gradient(
              145deg,
              #171717,
              #090909
            );

          border:
            1px solid
            rgba(212, 175, 55, 0.14);

          transition:
            transform 0.2s ease,
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }


        .project-card:hover {
          transform:
            translateY(-3px);

          border-color:
            rgba(212, 175, 55, 0.35);

          box-shadow:
            0 15px 45px
            rgba(0, 0, 0, 0.40);
        }


        .project-header {
          display: flex;

          align-items:
            flex-start;

          justify-content:
            space-between;

          gap: 15px;
        }


        .team-label {
          display: block;

          color: #a58a37;

          font-size: 9px;

          font-weight: 900;

          letter-spacing: 1.2px;

          text-transform: uppercase;
        }


        .project-header h3 {
          margin:
            6px 0 0;

          font-size: 18px;

          color: #f5f1df;
        }


        .evaluated,
        .pending {
          display: inline-flex;

          align-items: center;

          gap: 6px;

          padding:
            7px 9px;

          border-radius: 999px;

          font-size: 9px;

          font-weight: 900;

          white-space: nowrap;
        }


        .evaluated {
          color: #d4af37;

          background:
            rgba(212, 175, 55, 0.08);

          border:
            1px solid
            rgba(212, 175, 55, 0.22);
        }


        .pending {
          color: #b7a978;

          background:
            rgba(180, 150, 60, 0.06);

          border:
            1px solid
            rgba(180, 150, 60, 0.16);
        }


        .evaluated span,
        .pending span {
          width: 5px;
          height: 5px;

          border-radius: 50%;

          background:
            #d4af37;
        }


        .project-description {
          margin:
            18px 0;

          color: #99917c;

          font-size: 12px;

          line-height: 1.7;

          min-height: 42px;
        }


        .score-row {
          display: grid;

          grid-template-columns:
            repeat(2, 1fr);

          gap: 10px;
        }


        .score-row > div {
          padding: 13px;

          border-radius: 12px;

          background:
            #0a0a0a;

          border:
            1px solid
            rgba(212, 175, 55, 0.10);
        }


        .score-row span {
          display: block;

          margin-bottom: 6px;

          color: #77715f;

          font-size: 8px;

          font-weight: 900;

          letter-spacing: 1px;
        }


        .score-row strong {
          color: #f0d77a;

          font-size: 18px;
        }


        .project-footer {
          margin-top: 18px;

          padding-top: 15px;

          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 15px;

          border-top:
            1px solid
            rgba(212, 175, 55, 0.08);

          color: #77715f;

          font-size: 10px;
        }


        .project-links {
          display: flex;

          gap: 8px;
        }


        .project-links a {
          padding:
            6px 9px;

          border-radius: 8px;

          color: #d4af37;

          background:
            rgba(212, 175, 55, 0.06);

          border:
            1px solid
            rgba(212, 175, 55, 0.15);

          text-decoration: none;

          font-weight: 800;
        }


        .project-links a:hover {
          color: #080808;

          background:
            #d4af37;
        }


        /* RESPONSIVE */

        @media (max-width: 1100px) {

          .action-grid,
          .stats-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .project-grid {
            grid-template-columns:
              1fr;
          }

        }


        @media (max-width: 800px) {

          .organizer-main {
            width: 94%;
            padding-top: 25px;
          }

          .hero {
            padding: 30px;
          }

          .hero-decoration {
            display: none;
          }

          .date-grid {
            grid-template-columns:
              repeat(2, 1fr);

            gap: 20px;
          }

          .date-item {
            border-right: none;
            padding: 0;
          }

        }


        @media (max-width: 600px) {

          .organizer-header {
            padding:
              12px 4%;
          }

          .brand-subtitle {
            display: none;
          }

          .user-details {
            display: none;
          }

          .header-user {
            padding: 6px;
          }

          .hero {
            padding: 25px;

            min-height: 250px;
          }

          .hero h1 {
            font-size: 34px;
          }

          .hero p {
            font-size: 13px;
          }

          .action-grid,
          .stats-grid,
          .date-grid,
          .score-row {
            grid-template-columns:
              1fr;
          }

          .action-card {
            width: 100%;
          }

          .section-card,
          .event-card,
          .actions-panel {
            padding: 20px;
          }

          .section-header,
          .event-top {
            flex-direction: column;

            align-items:
              flex-start;
          }

          .project-footer {
            flex-direction: column;

            align-items:
              flex-start;
          }

          .project-links {
            width: 100%;
          }

        }

      `}</style>

    </div>
  );
}

export default OrganizerDashboard;