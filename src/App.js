import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  return (
    <Routes>
      <Route path="/login" element={!token ? <Login setToken={setToken} /> : <Navigate to="/" />} />
      <Route path="/register" element={!token ? <Register setToken={setToken} /> : <Navigate to="/" />} />
      <Route path="/" element={token ? <Dashboard setToken={setToken} /> : <Navigate to="/login" />} />
    </Routes>
  );
}
