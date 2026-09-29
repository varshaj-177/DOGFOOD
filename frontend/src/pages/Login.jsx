import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

function Login() {
  const navigate = useNavigate();

  const [isSignup, setIsSignup] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

    setError("");
    setSuccess("");
  };

  const switchMode = () => {
    setIsSignup(!isSignup);

    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: ""
    });

    setError("");
    setSuccess("");
  };

  // =========================
  // LOGIN
  // =========================

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      setError("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Login failed"
        );
      }

      localStorage.setItem(
        "token",
        data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      if (data.user.role === "participant") {
        navigate("/participant");
      } else if (data.user.role === "judge") {
        navigate("/judge");
      } else if (
        data.user.role === "organizer" ||
        data.user.role === "admin"
      ) {
        navigate("/organizer");
      } else {
        setError("Invalid user role.");
      }
    } catch (error) {
      setError(
        error.message ||
          "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // SIGN UP
  // =========================

  const handleSignup = async () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (formData.name.trim().length < 2) {
      setError("Name must contain at least 2 characters.");
      return;
    }

    if (formData.password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: formData.name.trim(),
            email: formData.email.trim(),
            password: formData.password
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Registration failed"
        );
      }

      setSuccess(
        "Account created successfully! You can now sign in."
      );

      setFormData({
        name: "",
        email: formData.email,
        password: "",
        confirmPassword: ""
      });

      setTimeout(() => {
        setIsSignup(false);
        setSuccess("");
      }, 1500);

    } catch (error) {
      setError(
        error.message ||
          "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSignup) {
      await handleSignup();
    } else {
      await handleLogin();
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 20% 10%, rgba(212,175,55,0.12), transparent 30%), radial-gradient(circle at 85% 90%, rgba(212,175,55,0.08), transparent 30%), #050505",
        color: "#f5f1df",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "25px",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* GOLD DECORATION */}

      <div
        style={{
          position: "absolute",
          width: "350px",
          height: "350px",
          borderRadius: "50%",
          border:
            "1px solid rgba(212,175,55,0.12)",
          top: "-180px",
          left: "-120px"
        }}
      />

      <div
        style={{
          position: "absolute",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          border:
            "1px solid rgba(212,175,55,0.08)",
          bottom: "-300px",
          right: "-180px"
        }}
      />

      {/* MAIN CONTAINER */}

      <div
        style={{
          width: "100%",
          maxWidth: "470px",
          position: "relative",
          zIndex: 2
        }}
      >
        {/* BRAND */}

        <div
          style={{
            textAlign: "center",
            marginBottom: "25px"
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              margin: "0 auto 18px",
              borderRadius: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "linear-gradient(145deg, #f0d77a, #b89425)",
              boxShadow:
                "0 0 45px rgba(212,175,55,0.20)",
              fontSize: "32px"
            }}
          >
            ✦
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "42px",
              fontWeight: "950",
              letterSpacing: "5px",
              background:
                "linear-gradient(90deg, #f7e6a5, #d4af37, #f0d77a)",
              WebkitBackgroundClip:
                "text",
              backgroundClip: "text",
              color: "transparent"
            }}
          >
            DOGFOOD
          </h1>

          <p
            style={{
              marginTop: "8px",
              color: "#918b78",
              fontSize: "13px",
              letterSpacing: "1px"
            }}
          >
            HACKATHON MANAGEMENT PLATFORM
          </p>
        </div>

        {/* CARD */}

        <div
          style={{
            background:
              "linear-gradient(145deg, rgba(23,23,23,0.98), rgba(8,8,8,0.98))",
            border:
              "1px solid rgba(212,175,55,0.25)",
            borderRadius: "24px",
            padding: "34px",
            boxShadow:
              "0 25px 80px rgba(0,0,0,0.65), 0 0 35px rgba(212,175,55,0.06)",
            backdropFilter: "blur(20px)"
          }}
        >
          {/* HEADER */}

          <div
            style={{
              marginBottom: "28px"
            }}
          >
            <div
              className="gold-badge"
              style={{
                marginBottom: "12px"
              }}
            >
              {isSignup
                ? "✦ CREATE ACCOUNT"
                : "✦ SECURE LOGIN"}
            </div>

            <h2
              style={{
                margin: "0 0 8px",
                color: "#f7e6a5",
                fontSize: "27px"
              }}
            >
              {isSignup
                ? "Create Your Account"
                : "Welcome Back"}
            </h2>

            <p
              style={{
                margin: 0,
                color: "#77715f",
                lineHeight: "1.5"
              }}
            >
              {isSignup
                ? "Join DOGFOOD and participate in hackathons."
                : "Sign in to access your DOGFOOD dashboard."}
            </p>
          </div>

          {/* ERROR */}

          {error && (
            <div
              style={{
                padding: "13px 15px",
                marginBottom: "20px",
                borderRadius: "12px",
                background:
                  "rgba(180,40,40,0.10)",
                border:
                  "1px solid rgba(220,80,80,0.30)",
                color: "#ff9b9b",
                fontSize: "13px",
                fontWeight: "700"
              }}
            >
              ⚠ {error}
            </div>
          )}

          {/* SUCCESS */}

          {success && (
            <div
              style={{
                padding: "13px 15px",
                marginBottom: "20px",
                borderRadius: "12px",
                background:
                  "rgba(212,175,55,0.08)",
                border:
                  "1px solid rgba(212,175,55,0.30)",
                color: "#f0d77a",
                fontSize: "13px",
                fontWeight: "700"
              }}
            >
              ✓ {success}
            </div>
          )}

          {/* FORM */}

          <form onSubmit={handleSubmit}>
            {/* NAME — SIGNUP ONLY */}

            {isSignup && (
              <div
                style={{
                  marginBottom: "20px"
                }}
              >
                <label
                  htmlFor="name"
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "#d4af37",
                    fontSize: "12px",
                    fontWeight: "800",
                    letterSpacing: "0.5px"
                  }}
                >
                  FULL NAME
                </label>

                <div
                  style={{
                    position: "relative"
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      left: "15px",
                      top: "50%",
                      transform:
                        "translateY(-50%)",
                      color: "#d4af37"
                    }}
                  >
                    👤
                  </span>

                  <input
                    id="name"
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="name"
                    style={{
                      width: "100%",
                      padding:
                        "14px 15px 14px 43px"
                    }}
                  />
                </div>
              </div>
            )}

            {/* EMAIL */}

            <div
              style={{
                marginBottom: "20px"
              }}
            >
              <label
                htmlFor="email"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "#d4af37",
                  fontSize: "12px",
                  fontWeight: "800",
                  letterSpacing: "0.5px"
                }}
              >
                EMAIL ADDRESS
              </label>

              <div
                style={{
                  position: "relative"
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    left: "15px",
                    top: "50%",
                    transform:
                      "translateY(-50%)",
                    color: "#d4af37"
                  }}
                >
                  ✉
                </span>

                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  style={{
                    width: "100%",
                    padding:
                      "14px 15px 14px 43px"
                  }}
                />
              </div>
            </div>

            {/* PASSWORD */}

            <div
              style={{
                marginBottom: "20px"
              }}
            >
              <label
                htmlFor="password"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "#d4af37",
                  fontSize: "12px",
                  fontWeight: "800",
                  letterSpacing: "0.5px"
                }}
              >
                PASSWORD
              </label>

              <div
                style={{
                  position: "relative"
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    left: "15px",
                    top: "50%",
                    transform:
                      "translateY(-50%)",
                    color: "#d4af37"
                  }}
                >
                  🔒
                </span>

                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete={
                    isSignup
                      ? "new-password"
                      : "current-password"
                  }
                  style={{
                    width: "100%",
                    padding:
                      "14px 15px 14px 43px"
                  }}
                />
              </div>
            </div>

            {/* CONFIRM PASSWORD */}

            {isSignup && (
              <div
                style={{
                  marginBottom: "25px"
                }}
              >
                <label
                  htmlFor="confirmPassword"
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "#d4af37",
                    fontSize: "12px",
                    fontWeight: "800",
                    letterSpacing: "0.5px"
                  }}
                >
                  CONFIRM PASSWORD
                </label>

                <div
                  style={{
                    position: "relative"
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      left: "15px",
                      top: "50%",
                      transform:
                        "translateY(-50%)",
                      color: "#d4af37"
                    }}
                  >
                    🔐
                  </span>

                  <input
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={
                      formData.confirmPassword
                    }
                    onChange={handleChange}
                    autoComplete="new-password"
                    style={{
                      width: "100%",
                      padding:
                        "14px 15px 14px 43px"
                    }}
                  />
                </div>
              </div>
            )}

            {!isSignup && (
              <div
                style={{
                  marginBottom: "25px"
                }}
              />
            )}

            {/* MAIN BUTTON */}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                border:
                  "1px solid rgba(240,215,122,0.35)",
                background:
                  loading
                    ? "#8f7420"
                    : "linear-gradient(135deg, #f0d77a, #d4af37)",
                color: "#080808",
                padding: "15px",
                borderRadius: "13px",
                fontWeight: "900",
                fontSize: "15px",
                cursor: loading
                  ? "not-allowed"
                  : "pointer",
                boxShadow:
                  "0 10px 30px rgba(212,175,55,0.15)",
                transition:
                  "all 0.2s ease"
              }}
            >
              {loading ? (
                <>
                  <span
                    style={{
                      display:
                        "inline-block",
                      width: "15px",
                      height: "15px",
                      borderRadius:
                        "50%",
                      border:
                        "2px solid rgba(0,0,0,0.25)",
                      borderTopColor:
                        "#080808",
                      animation:
                        "gold-spin 0.8s linear infinite",
                      marginRight:
                        "8px",
                      verticalAlign:
                        "middle"
                    }}
                  />

                  {isSignup
                    ? "Creating Account..."
                    : "Signing In..."}
                </>
              ) : (
                <>
                  {isSignup
                    ? "Create Account"
                    : "Sign In"}

                  <span
                    style={{
                      marginLeft: "10px"
                    }}
                  >
                    →
                  </span>
                </>
              )}
            </button>
          </form>

          {/* SWITCH LOGIN / SIGNUP */}

          <div
            style={{
              textAlign: "center",
              marginTop: "22px"
            }}
          >
            <span
              style={{
                color: "#77715f",
                fontSize: "13px"
              }}
            >
              {isSignup
                ? "Already have an account?"
                : "Don't have an account?"}
            </span>

            <button
              type="button"
              onClick={switchMode}
              style={{
                marginLeft: "7px",
                border: "none",
                background: "transparent",
                color: "#f0d77a",
                fontWeight: "800",
                cursor: "pointer",
                fontSize: "13px",
                padding: 0
              }}
            >
              {isSignup
                ? "Sign In"
                : "Sign Up"}
            </button>
          </div>

          {/* DIVIDER */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              margin:
                "25px 0 22px"
            }}
          >
            <div
              style={{
                flex: 1,
                height: "1px",
                background:
                  "rgba(212,175,55,0.15)"
              }}
            />

            <span
              style={{
                color: "#716b59",
                fontSize: "10px",
                fontWeight: "800",
                letterSpacing: "1px"
              }}
            >
              DOGFOOD 2026
            </span>

            <div
              style={{
                flex: 1,
                height: "1px",
                background:
                  "rgba(212,175,55,0.15)"
              }}
            />
          </div>

          {/* ROLES */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(3, 1fr)",
              gap: "10px"
            }}
          >
            <RoleBox
              icon="👨‍💻"
              label="Participant"
            />

            <RoleBox
              icon="⚖️"
              label="Judge"
            />

            <RoleBox
              icon="📊"
              label="Organizer"
            />
          </div>

          {/* SIGNUP NOTE */}

          {isSignup && (
            <div
              style={{
                marginTop: "18px",
                padding: "12px",
                borderRadius: "12px",
                background:
                  "rgba(212,175,55,0.04)",
                border:
                  "1px solid rgba(212,175,55,0.10)",
                color: "#77715f",
                fontSize: "11px",
                lineHeight: "1.5",
                textAlign: "center"
              }}
            >
              New accounts are registered as
              <strong
                style={{
                  color: "#d4af37",
                  marginLeft: "4px"
                }}
              >
                Participant
              </strong>
              .
              <br />
              Judge and Organizer accounts are
              managed separately.
            </div>
          )}
        </div>

        {/* FOOTER */}

        <p
          style={{
            textAlign: "center",
            marginTop: "22px",
            color: "#5f5a4d",
            fontSize: "11px"
          }}
        >
          © 2026 DOGFOOD Hackathon
          <br />
          Build. Innovate. Impact.
        </p>
      </div>
    </div>
  );
}

function RoleBox({ icon, label }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "13px 7px",
        borderRadius: "12px",
        background:
          "rgba(212,175,55,0.035)",
        border:
          "1px solid rgba(212,175,55,0.10)"
      }}
    >
      <div
        style={{
          fontSize: "18px",
          marginBottom: "5px"
        }}
      >
        {icon}
      </div>

      <div
        style={{
          color: "#9d967f",
          fontSize: "9px",
          fontWeight: "800",
          textTransform: "uppercase",
          letterSpacing: "0.5px"
        }}
      >
        {label}
      </div>
    </div>
  );
}

export default Login;