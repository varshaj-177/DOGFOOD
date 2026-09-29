import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

function ManageHackathons() {
  const navigate = useNavigate();

  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [editingHackathon, setEditingHackathon] =
    useState(null);

  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    registrationDeadline: "",
    submissionDeadline: "",
    maxTeamSize: 4,
    status: "upcoming"
  });

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const formatDateForInput = (date) => {
    if (!date) return "";

    const d = new Date(date);

    if (isNaN(d.getTime())) return "";

    const year = d.getFullYear();
    const month = String(
      d.getMonth() + 1
    ).padStart(2, "0");
    const day = String(
      d.getDate()
    ).padStart(2, "0");
    const hours = String(
      d.getHours()
    ).padStart(2, "0");
    const minutes = String(
      d.getMinutes()
    ).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const loadHackathons = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        navigate("/");
        return;
      }

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
            "Failed to load hackathons"
        );
      }

      setHackathons(data);
    } catch (error) {
      setError(
        error.message ||
          "Failed to load hackathons"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHackathons();
  }, []);

  const openEdit = (hackathon) => {
    setEditingHackathon(hackathon);

    setEditForm({
      title: hackathon.title || "",
      description:
        hackathon.description || "",
      startDate: formatDateForInput(
        hackathon.startDate
      ),
      endDate: formatDateForInput(
        hackathon.endDate
      ),
      registrationDeadline:
        formatDateForInput(
          hackathon.registrationDeadline
        ),
      submissionDeadline:
        formatDateForInput(
          hackathon.submissionDeadline
        ),
      maxTeamSize:
        hackathon.maxTeamSize || 4,
      status:
        hackathon.status || "upcoming"
    });

    setMessage("");
    setError("");
  };

  const closeEdit = () => {
    setEditingHackathon(null);
  };

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });

    setError("");
    setMessage("");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (
      !editForm.title ||
      !editForm.description ||
      !editForm.startDate ||
      !editForm.endDate ||
      !editForm.registrationDeadline ||
      !editForm.submissionDeadline ||
      !editForm.maxTeamSize
    ) {
      setError(
        "Please fill all required fields."
      );
      return;
    }

    try {
      const token = getToken();

      const response = await fetch(
        `${API_URL}/hackathons/${editingHackathon._id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },

          body: JSON.stringify({
            title: editForm.title,
            description:
              editForm.description,
            startDate: editForm.startDate,
            endDate: editForm.endDate,
            registrationDeadline:
              editForm.registrationDeadline,
            submissionDeadline:
              editForm.submissionDeadline,
            maxTeamSize:
              Number(editForm.maxTeamSize),
            status: editForm.status
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update hackathon"
        );
      }

      setMessage(
        "Hackathon updated successfully."
      );

      setEditingHackathon(null);

      await loadHackathons();
    } catch (error) {
      setError(
        error.message ||
          "Failed to update hackathon"
      );
    }
  };

  const handleDelete = async (hackathon) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${hackathon.title}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");

      const token = getToken();

      const response = await fetch(
        `${API_URL}/hackathons/${hackathon._id}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete hackathon"
        );
      }

      setMessage(
        "Hackathon deleted successfully."
      );

      await loadHackathons();
    } catch (error) {
      setError(
        error.message ||
          "Failed to delete hackathon"
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const d = new Date(date);

    if (isNaN(d.getTime())) {
      return "—";
    }

    return d.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  };

  const getStatusStyle = (status) => {
    if (status === "active") {
      return {
        background:
          "rgba(50,180,100,0.10)",
        color: "#7ee2a8",
        border:
          "1px solid rgba(80,210,130,0.30)"
      };
    }

    if (status === "completed") {
      return {
        background:
          "rgba(120,120,120,0.10)",
        color: "#c5c0b0",
        border:
          "1px solid rgba(180,180,180,0.20)"
      };
    }

    if (status === "draft") {
      return {
        background:
          "rgba(180,140,50,0.10)",
        color: "#d4af37",
        border:
          "1px solid rgba(212,175,55,0.25)"
      };
    }

    return {
      background:
        "rgba(212,175,55,0.10)",
      color: "#f0d77a",
      border:
        "1px solid rgba(212,175,55,0.28)"
    };
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 10% 5%, rgba(212,175,55,0.09), transparent 28%), radial-gradient(circle at 90% 90%, rgba(212,175,55,0.06), transparent 28%), #050505",
        color: "#f5f1df",
        padding: "30px"
      }}
    >
      {/* HEADER */}

      <div
        style={{
          maxWidth: "1250px",
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
              color: "#d4af37",
              fontSize: "11px",
              fontWeight: "900",
              letterSpacing: "3px",
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
              WebkitBackgroundClip:
                "text",
              backgroundClip: "text",
              color: "transparent"
            }}
          >
            Manage Hackathons
          </h1>

          <p
            style={{
              margin:
                "8px 0 0",
              color: "#918b78"
            }}
          >
            Create, edit and manage your
            hackathon events.
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
            className="dark-button"
            onClick={() =>
              navigate("/organizer")
            }
          >
            ← Dashboard
          </button>

          <button
            className="gold-button"
            onClick={() =>
              navigate(
                "/organizer/create-hackathon"
              )
            }
          >
            + Create Hackathon
          </button>

          <button
            className="dark-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>

      {/* MESSAGE */}

      {message && (
        <div
          style={{
            maxWidth: "1250px",
            margin:
              "0 auto 20px",
            padding: "14px 18px",
            borderRadius: "12px",
            background:
              "rgba(212,175,55,0.08)",
            border:
              "1px solid rgba(212,175,55,0.30)",
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
            maxWidth: "1250px",
            margin:
              "0 auto 20px",
            padding: "14px 18px",
            borderRadius: "12px",
            background:
              "rgba(180,40,40,0.10)",
            border:
              "1px solid rgba(220,80,80,0.30)",
            color: "#ff9b9b",
            fontWeight: "700"
          }}
        >
          ⚠ {error}
        </div>
      )}

      {/* CONTENT */}

      <div
        className="gold-card"
        style={{
          maxWidth: "1250px",
          margin: "0 auto",
          padding: "28px"
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            marginBottom: "24px",
            gap: "15px",
            flexWrap: "wrap"
          }}
        >
          <div>
            <div
              className="gold-badge"
            >
              ✦ EVENT MANAGEMENT
            </div>

            <h2
              style={{
                margin:
                  "12px 0 5px",
                color: "#f7e6a5"
              }}
            >
              All Hackathons
            </h2>

            <p
              style={{
                margin: 0,
                color: "#77715f"
              }}
            >
              {hackathons.length} hackathon
              {hackathons.length !== 1
                ? "s"
                : ""}{" "}
              available
            </p>
          </div>

          <button
            className="dark-button"
            onClick={loadHackathons}
            disabled={loading}
          >
            ↻ Refresh
          </button>
        </div>

        <div
          className="gold-divider"
          style={{
            marginBottom: "25px"
          }}
        ></div>

        {/* LOADING */}

        {loading ? (
          <div
            style={{
              minHeight: "250px",
              display: "flex",
              justifyContent:
                "center",
              alignItems: "center",
              flexDirection:
                "column",
              gap: "15px"
            }}
          >
            <div className="gold-spinner"></div>

            <span
              style={{
                color: "#8f8976"
              }}
            >
              Loading hackathons...
            </span>
          </div>
        ) : hackathons.length === 0 ? (
          /* EMPTY */

          <div
            style={{
              textAlign: "center",
              padding: "70px 20px"
            }}
          >
            <div
              style={{
                fontSize: "45px",
                marginBottom: "15px"
              }}
            >
              ✦
            </div>

            <h3
              style={{
                color: "#f0d77a",
                marginBottom: "8px"
              }}
            >
              No Hackathons Yet
            </h3>

            <p
              style={{
                color: "#77715f",
                marginBottom: "22px"
              }}
            >
              Create your first hackathon
              to get started.
            </p>

            <button
              className="gold-button"
              onClick={() =>
                navigate(
                  "/organizer/create-hackathon"
                )
              }
            >
              + Create Hackathon
            </button>
          </div>
        ) : (
          /* HACKATHON LIST */

          <div
            style={{
              display: "grid",
              gap: "18px"
            }}
          >
            {hackathons.map(
              (hackathon) => (
                <div
                  key={hackathon._id}
                  style={{
                    background:
                      "linear-gradient(145deg, rgba(24,24,24,0.95), rgba(10,10,10,0.95))",
                    border:
                      "1px solid rgba(212,175,55,0.18)",
                    borderRadius: "18px",
                    padding: "24px",
                    transition:
                      "all 0.2s ease"
                  }}
                >
                  {/* TOP */}

                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "flex-start",
                      gap: "20px",
                      flexWrap:
                        "wrap"
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        minWidth:
                          "250px"
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems:
                            "center",
                          gap: "10px",
                          flexWrap:
                            "wrap",
                          marginBottom:
                            "10px"
                        }}
                      >
                        <h3
                          style={{
                            margin: 0,
                            color:
                              "#f7e6a5",
                            fontSize:
                              "22px"
                          }}
                        >
                          {hackathon.title}
                        </h3>

                        <span
                          style={{
                            ...getStatusStyle(
                              hackathon.status
                            ),
                            padding:
                              "6px 10px",
                            borderRadius:
                              "999px",
                            fontSize:
                              "10px",
                            fontWeight:
                              "900",
                            textTransform:
                              "uppercase",
                            letterSpacing:
                              "1px"
                          }}
                        >
                          {hackathon.status}
                        </span>
                      </div>

                      <p
                        style={{
                          color:
                            "#99927f",
                          lineHeight:
                            "1.6",
                          margin:
                            "0 0 15px"
                        }}
                      >
                        {
                          hackathon.description
                        }
                      </p>
                    </div>

                    {/* ACTION BUTTONS */}

                    <div
                      style={{
                        display:
                          "flex",
                        gap: "9px",
                        flexWrap:
                          "wrap"
                      }}
                    >
                      <button
                        className="dark-button"
                        onClick={() =>
                          openEdit(
                            hackathon
                          )
                        }
                      >
                        ✎ Edit
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(
                            hackathon
                          )
                        }
                        style={{
                          border:
                            "1px solid rgba(220,80,80,0.28)",
                          background:
                            "rgba(120,20,20,0.12)",
                          color:
                            "#ff9b9b",
                          padding:
                            "11px 18px",
                          borderRadius:
                            "12px",
                          fontWeight:
                            "700",
                          cursor:
                            "pointer"
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* INFO GRID */}

                  <div
                    style={{
                      display:
                        "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(190px, 1fr))",
                      gap: "12px",
                      marginTop:
                        "20px"
                    }}
                  >
                    <InfoBox
                      label="START"
                      value={formatDate(
                        hackathon.startDate
                      )}
                    />

                    <InfoBox
                      label="END"
                      value={formatDate(
                        hackathon.endDate
                      )}
                    />

                    <InfoBox
                      label="REGISTRATION"
                      value={formatDate(
                        hackathon.registrationDeadline
                      )}
                    />

                    <InfoBox
                      label="SUBMISSION"
                      value={formatDate(
                        hackathon.submissionDeadline
                      )}
                    />

                    <InfoBox
                      label="MAX TEAM SIZE"
                      value={
                        hackathon.maxTeamSize
                      }
                    />
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* EDIT MODAL */}

      {editingHackathon && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(0,0,0,0.78)",
            backdropFilter:
              "blur(8px)",
            display: "flex",
            justifyContent:
              "center",
            alignItems:
              "center",
            padding: "20px",
            zIndex: 1000,
            overflowY: "auto"
          }}
        >
          <div
            className="gold-card"
            style={{
              width: "100%",
              maxWidth: "850px",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "30px"
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
                marginBottom:
                  "25px"
              }}
            >
              <div>
                <div
                  className="gold-badge"
                >
                  ✦ EDIT HACKATHON
                </div>

                <h2
                  style={{
                    margin:
                      "12px 0 0",
                    color:
                      "#f7e6a5"
                  }}
                >
                  Update Hackathon
                </h2>
              </div>

              <button
                className="dark-button"
                onClick={closeEdit}
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleUpdate}
            >
              {/* TITLE */}

              <div
                style={{
                  marginBottom:
                    "20px"
                }}
              >
                <label
                  style={{
                    display:
                      "block",
                    marginBottom:
                      "8px",
                    color:
                      "#d4af37",
                    fontSize:
                      "12px",
                    fontWeight:
                      "800"
                  }}
                >
                  TITLE *
                </label>

                <input
                  type="text"
                  name="title"
                  value={
                    editForm.title
                  }
                  onChange={
                    handleEditChange
                  }
                  style={{
                    width:
                      "100%",
                    padding:
                      "13px 15px"
                  }}
                />
              </div>

              {/* DESCRIPTION */}

              <div
                style={{
                  marginBottom:
                    "20px"
                }}
              >
                <label
                  style={{
                    display:
                      "block",
                    marginBottom:
                      "8px",
                    color:
                      "#d4af37",
                    fontSize:
                      "12px",
                    fontWeight:
                      "800"
                  }}
                >
                  DESCRIPTION *
                </label>

                <textarea
                  name="description"
                  value={
                    editForm.description
                  }
                  onChange={
                    handleEditChange
                  }
                  rows="5"
                  style={{
                    width:
                      "100%",
                    padding:
                      "13px 15px",
                    resize:
                      "vertical"
                  }}
                />
              </div>

              {/* DATES */}

              <div
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(230px, 1fr))",
                  gap: "18px",
                  marginBottom:
                    "20px"
                }}
              >
                <EditField
                  label="START DATE & TIME"
                  name="startDate"
                  type="datetime-local"
                  value={
                    editForm.startDate
                  }
                  onChange={
                    handleEditChange
                  }
                />

                <EditField
                  label="END DATE & TIME"
                  name="endDate"
                  type="datetime-local"
                  value={
                    editForm.endDate
                  }
                  onChange={
                    handleEditChange
                  }
                />

                <EditField
                  label="REGISTRATION DEADLINE"
                  name="registrationDeadline"
                  type="datetime-local"
                  value={
                    editForm.registrationDeadline
                  }
                  onChange={
                    handleEditChange
                  }
                />

                <EditField
                  label="SUBMISSION DEADLINE"
                  name="submissionDeadline"
                  type="datetime-local"
                  value={
                    editForm.submissionDeadline
                  }
                  onChange={
                    handleEditChange
                  }
                />

                <EditField
                  label="MAX TEAM SIZE"
                  name="maxTeamSize"
                  type="number"
                  value={
                    editForm.maxTeamSize
                  }
                  onChange={
                    handleEditChange
                  }
                />

                <div>
                  <label
                    style={{
                      display:
                        "block",
                      marginBottom:
                        "8px",
                      color:
                        "#d4af37",
                      fontSize:
                        "12px",
                      fontWeight:
                        "800"
                    }}
                  >
                    STATUS
                  </label>

                  <select
                    name="status"
                    value={
                      editForm.status
                    }
                    onChange={
                      handleEditChange
                    }
                    style={{
                      width:
                        "100%",
                      padding:
                        "13px 15px"
                    }}
                  >
                    <option value="draft">
                      Draft
                    </option>

                    <option value="upcoming">
                      Upcoming
                    </option>

                    <option value="active">
                      Active
                    </option>

                    <option value="completed">
                      Completed
                    </option>
                  </select>
                </div>
              </div>

              {/* ACTIONS */}

              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "flex-end",
                  gap: "10px",
                  paddingTop:
                    "20px",
                  borderTop:
                    "1px solid rgba(212,175,55,0.15)"
                }}
              >
                <button
                  type="button"
                  className="dark-button"
                  onClick={
                    closeEdit
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="gold-button"
                >
                  ✓ Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}

      <div
        style={{
          maxWidth: "1250px",
          margin: "25px auto 0",
          textAlign: "center",
          color: "#625d4e",
          fontSize: "12px"
        }}
      >
        DOGFOOD 2026 • Hackathon Management
        Platform
      </div>
    </div>
  );
}

/* INFO BOX */

function InfoBox({ label, value }) {
  return (
    <div
      style={{
        background:
          "rgba(212,175,55,0.035)",
        border:
          "1px solid rgba(212,175,55,0.10)",
        borderRadius: "12px",
        padding: "13px 15px"
      }}
    >
      <div
        style={{
          color: "#706a59",
          fontSize: "9px",
          fontWeight: "900",
          letterSpacing: "1px",
          marginBottom: "6px"
        }}
      >
        {label}
      </div>

      <div
        style={{
          color: "#d8d1bb",
          fontSize: "12px",
          fontWeight: "700"
        }}
      >
        {value}
      </div>
    </div>
  );
}

/* EDIT FIELD */

function EditField({
  label,
  name,
  type,
  value,
  onChange
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          marginBottom: "8px",
          color: "#d4af37",
          fontSize: "12px",
          fontWeight: "800"
        }}
      >
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        style={{
          width: "100%",
          padding: "13px 15px"
        }}
      />
    </div>
  );
}

export default ManageHackathons;