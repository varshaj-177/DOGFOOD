import React from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Login from "./pages/Login";
import JudgeDashboard from "./pages/JudgeDashboard";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import ParticipantDashboard from "./pages/ParticipantDashboard";
import CreateHackathon from "./pages/CreateHackathon";
import ManageHackathons from "./pages/ManageHackathons";


function ProtectedRoute({
  children,
  allowedRoles
}) {
  const token =
    localStorage.getItem("token");

  const storedUser =
    localStorage.getItem("user");

  if (!token || !storedUser) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  let user;

  try {
    user = JSON.parse(storedUser);
  } catch (error) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  if (
    allowedRoles &&
    !allowedRoles.includes(user.role)
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
}


function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* LOGIN */}
        <Route
          path="/"
          element={<Login />}
        />


        {/* PARTICIPANT */}
        <Route
          path="/participant"
          element={
            <ProtectedRoute
              allowedRoles={[
                "participant"
              ]}
            >
              <ParticipantDashboard />
            </ProtectedRoute>
          }
        />


        {/* JUDGE */}
        <Route
          path="/judge"
          element={
            <ProtectedRoute
              allowedRoles={[
                "judge"
              ]}
            >
              <JudgeDashboard />
            </ProtectedRoute>
          }
        />


        {/* ORGANIZER DASHBOARD */}
        <Route
          path="/organizer"
          element={
            <ProtectedRoute
              allowedRoles={[
                "organizer",
                "admin"
              ]}
            >
              <OrganizerDashboard />
            </ProtectedRoute>
          }
        />


        {/* CREATE HACKATHON */}
        <Route
          path="/organizer/create-hackathon"
          element={
            <ProtectedRoute
              allowedRoles={[
                "organizer",
                "admin"
              ]}
            >
              <CreateHackathon />
            </ProtectedRoute>
          }
        />


        {/* MANAGE HACKATHONS */}
        <Route
          path="/organizer/manage-hackathons"
          element={
            <ProtectedRoute
              allowedRoles={[
                "organizer",
                "admin"
              ]}
            >
              <ManageHackathons />
            </ProtectedRoute>
          }
        />


        {/* INVALID URL */}
        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}


export default App;