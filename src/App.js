// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/1";
import Dashboard from "./components/Dashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} /> {/* หน้า Login */}
        <Route path="/dashboard" element={<Dashboard />} /> {/* หน้า Dashboard */}
      </Routes>
    </Router>
  );
}export default App;
