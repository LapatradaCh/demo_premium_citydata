// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/1";
import Dashboard from "./components/Home";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} /> {/* หน้า Login */}
        <Route path="/Home" element={<Home />} /> {/* หน้า Home */}
      </Routes>
    </Router>
  );
}export default App;
