import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

function CreateHackathon() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    registrationDeadline: "",
    submissionDeadline: "",
    maxTeamSize: 4
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

    setMessage("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (
      !formData.title ||
      !formData.description ||
      !formData.startDate ||
      !formData.endDate ||
      !formData.registrationDeadline ||
      !formData.submissionDeadline ||
      !formData.maxTeamSize
    ) {
      setError("Please fill all the required fields.");
      return;
    }

    if (Number(formData.maxTeamSize) < 1) {
      setError("Maximum team size must be at least 1.");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      const response = await fetch(
        `${API_URL}/hackathons`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },

          body: JSON.stringify({
            title: formData.title,
            description: formData.description,
            startDate: formData.startDate,
            endDate: formData.endDate,
            registrationDeadline:
              formData.registrationDeadline,
            submissionDeadline:
              formData.submissionDeadline,
            maxTeamSize:
              Number(formData.maxTeamSize)
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to create hackathon"
        );
      }

      setMessage(
        "Hackathon created successfully!"
      );

      setFormData({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        registrationDeadline: "",
        submissionDeadline: "",
        maxTeamSize: 4
      });
    } catch (error) {
      setError(
        error.message ||
          "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(212,175,55,0.10), transparent 30%), radial-gradient(circle at bottom right, rgba(212,175,55,0.07), transparent 30%), #050505",
        color: "#f5f1df",
        padding: "30px"
      }}
    >
      {/* HEADER */}

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto 30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
          flexWrap: "wrap"
        }}
      >
        <div>
          <div
            style={{
              fontSize: "12px",
              letterSpacing: "3px",
              color: "#d4af37",
              fontWeight: "800",
              marginBottom: "8px"
            }}
          >
            DOGFOOD • ORGANIZER
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "34px",
              fontWeight: "900",
              background:
                "linear-gradient(90deg, #f7e6a5, #d4af37, #f0d77a)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent"
            }}
          >
            Create Hackathon
          </h1>

          <p
            style={{
              marginTop: "8px",
              color: "#9d967f"
            }}
          >
            Create and launch a new hackathon event.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap"
          }}
        >
          <button
            onClick={() =>
              navigate("/organizer")
            }
            className="dark-button"
          >
            ← Dashboard
          </button>

          <button
            onClick={handleLogout}
            className="dark-button"
          >
            Logout
          </button>
        </div>
      </div>

      {/* MAIN CARD */}

      <div
        className="gold-card"
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "35px"
        }}
      >
        {/* CARD HEADER */}

        <div
          style={{
            marginBottom: "30px",
            paddingBottom: "20px",
            borderBottom:
              "1px solid rgba(212,175,55,0.18)"
          }}
        >
          <div
            className="gold-badge"
            style={{
              marginBottom: "12px"
            }}
          >
            ✦ NEW EVENT
          </div>

          <h2
            style={{
              margin: "0 0 8px",
              color: "#f7e6a5",
              fontSize: "24px"
            }}
          >
            Hackathon Details
          </h2>

          <p
            style={{
              margin: 0,
              color: "#8f8976"
            }}
          >
            Enter the basic information, dates,
            and team configuration.
          </p>
        </div>

        {/* SUCCESS */}

        {message && (
          <div
            style={{
              padding: "15px 18px",
              marginBottom: "22px",
              borderRadius: "12px",
              background:
                "rgba(212,175,55,0.08)",
              border:
                "1px solid rgba(212,175,55,0.35)",
              color: "#f0d77a",
              fontWeight: "700"
            }}
          >
            ✓ {message}
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div
            style={{
              padding: "15px 18px",
              marginBottom: "22px",
              borderRadius: "12px",
              background:
                "rgba(180,40,40,0.10)",
              border:
                "1px solid rgba(220,80,80,0.35)",
              color: "#ff9b9b",
              fontWeight: "700"
            }}
          >
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* TITLE */}

          <div
            style={{
              marginBottom: "24px"
            }}
          >
            <label
              style={{
                display: "block",
                marginBottom: "9px",
                color: "#d4af37",
                fontSize: "13px",
                fontWeight: "800",
                letterSpacing: "0.5px"
              }}
            >
              HACKATHON TITLE *
            </label>

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter hackathon title"
              style={{
                width: "100%",
                padding: "14px 16px"
              }}
            />
          </div>

          {/* DESCRIPTION */}

          <div
            style={{
              marginBottom: "28px"
            }}
          >
            <label
              style={{
                display: "block",
                marginBottom: "9px",
                color: "#d4af37",
                fontSize: "13px",
                fontWeight: "800",
                letterSpacing: "0.5px"
              }}
            >
              DESCRIPTION *
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the hackathon, theme, rules, and objectives..."
              rows="6"
              style={{
                width: "100%",
                padding: "14px 16px",
                resize: "vertical"
              }}
            />
          </div>

          {/* DATES */}

          <div
            style={{
              marginBottom: "12px"
            }}
          >
            <div
              className="gold-badge"
              style={{
                marginBottom: "18px"
              }}
            >
              📅 EVENT TIMELINE
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "20px",
              marginBottom: "28px"
            }}
          >
            {/* START */}

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "9px",
                  color: "#d4af37",
                  fontSize: "13px",
                  fontWeight: "800"
                }}
              >
                START DATE & TIME *
              </label>

              <input
                type="datetime-local"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "14px 16px"
                }}
              />
            </div>

            {/* END */}

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "9px",
                  color: "#d4af37",
                  fontSize: "13px",
                  fontWeight: "800"
                }}
              >
                END DATE & TIME *
              </label>

              <input
                type="datetime-local"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "14px 16px"
                }}
              />
            </div>

            {/* REGISTRATION */}

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "9px",
                  color: "#d4af37",
                  fontSize: "13px",
                  fontWeight: "800"
                }}
              >
                REGISTRATION DEADLINE *
              </label>

              <input
                type="datetime-local"
                name="registrationDeadline"
                value={
                  formData.registrationDeadline
                }
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "14px 16px"
                }}
              />
            </div>

            {/* SUBMISSION */}

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "9px",
                  color: "#d4af37",
                  fontSize: "13px",
                  fontWeight: "800"
                }}
              >
                SUBMISSION DEADLINE *
              </label>

              <input
                type="datetime-local"
                name="submissionDeadline"
                value={
                  formData.submissionDeadline
                }
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "14px 16px"
                }}
              />
            </div>
          </div>

          {/* TEAM SIZE */}

          <div
            style={{
              maxWidth: "350px",
              marginBottom: "35px"
            }}
          >
            <label
              style={{
                display: "block",
                marginBottom: "9px",
                color: "#d4af37",
                fontSize: "13px",
                fontWeight: "800"
              }}
            >
              MAXIMUM TEAM SIZE *
            </label>

            <input
              type="number"
              name="maxTeamSize"
              min="1"
              value={formData.maxTeamSize}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "14px 16px"
              }}
            />

            <p
              style={{
                marginTop: "8px",
                color: "#77715f",
                fontSize: "12px"
              }}
            >
              Maximum number of participants allowed
              in one team.
            </p>
          </div>

          {/* ACTIONS */}

          <div
            style={{
              paddingTop: "25px",
              borderTop:
                "1px solid rgba(212,175,55,0.15)",
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              flexWrap: "wrap"
            }}
          >
            <button
              type="button"
              className="dark-button"
              onClick={() =>
                navigate("/organizer")
              }
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="gold-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    style={{
                      display: "inline-block",
                      width: "14px",
                      height: "14px",
                      borderRadius: "50%",
                      border:
                        "2px solid rgba(0,0,0,0.25)",
                      borderTopColor: "#080808",
                      animation:
                        "gold-spin 0.8s linear infinite",
                      marginRight: "8px",
                      verticalAlign: "middle"
                    }}
                  ></span>

                  Creating...
                </>
              ) : (
                <>✦ Create Hackathon</>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* FOOTER */}

      <div
        style={{
          maxWidth: "1200px",
          margin: "25px auto 0",
          textAlign: "center",
          color: "#625d4e",
          fontSize: "12px"
        }}
      >
        DOGFOOD 2026 • Build. Innovate. Impact.
      </div>
    </div>
  );
}

export default CreateHackathon;