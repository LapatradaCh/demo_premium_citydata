// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/1";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="./components/1" element={<Login />} />
        <Route path="*" element={<Login />} /> {/* Default หน้า Login */}
      </Routes>
    </Router>
  );
}

export default App;
