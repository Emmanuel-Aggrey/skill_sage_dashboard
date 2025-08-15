import React from "react";
import { Route, Routes } from "react-router-dom";
import { Dashboard, Login, UnauthorizedPage } from "./pages";
import ProtectedRoute from "./utils/ProtectedRoute";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "CREATOR", "EMPLOYER"]}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;
