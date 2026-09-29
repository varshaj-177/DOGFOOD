import { useEffect, useState } from "react";
import "./OrganizerResults.css";

function OrganizerResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const hackathonId = "6ab63a5493ae61ddc55bb5a6";

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/";
      return;
    }

    fetch(`http://localhost:5000/api/results/hackathon/${hackathonId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((response) => {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("token");
          window.location.href = "/";
          return null;
        }

        return response.json();
      })
      .then((data) => {
        if (data) {
          setResults(data.results || []);
        }

        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to load results:", error);
        setLoading(false);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="results-page">
        <div className="loading">
          Loading results...
        </div>
      </div>
    );
  }

  return (
    <div className="results-page">

      <div className="results-header">

        <div>
          <p className="eyebrow">DOGFOOD 2026</p>

          <h1>Hackathon Results</h1>

          <p className="subtitle">
            Review project scores and judging results.
          </p>
        </div>

        <div className="header-actions">

          <div className="result-count">
            <strong>{results.length}</strong>
            <span>Projects</span>
          </div>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </div>

      {results.length === 0 ? (

        <div className="empty-card">

          <h2>No results available</h2>

          <p>
            Judging results will appear here after judges submit scores.
          </p>

        </div>

      ) : (

        <div className="results-card">

          <table>

            <thead>

              <tr>
                <th>Rank</th>
                <th>Project</th>
                <th>Judges</th>
                <th>Average Score</th>
              </tr>

            </thead>

            <tbody>

              {results.map((result, index) => (

                <tr key={result.submissionId}>

                  <td>
                    <span className="rank">
                      #{index + 1}
                    </span>
                  </td>

                  <td>

                    <div className="project-name">
                      {result.title}
                    </div>

                    <div className="project-description">
                      {result.description}
                    </div>

                  </td>

                  <td>

                    <span className="judge-badge">
                      {result.judgeCount}
                    </span>

                  </td>

                  <td>

                    <span className="score">
                      {result.averageScore}
                    </span>

                    <span className="out-of">
                      {" / 50"}
                    </span>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </div>
  );
}

export default OrganizerResults;