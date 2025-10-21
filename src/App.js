// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import  Home from "./components/Home";
import Home1 from "./components/Home1"
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} /> {/* หน้า Login */}
        <Route path="/Home" element={<Home />} /> {/* หน้า Home */}
        <Route path="/Home1" element={<Home1 />} /> {/* หน้า Home */}
      </Routes>
    </Router>
  );
}
export default App;
