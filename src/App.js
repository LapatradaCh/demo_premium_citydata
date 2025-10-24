// App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom'; // <-- 1. Import Routes และ Route
import Home from './components/Home';
import Home1 from './components/Home1';
import JoinORG from "./components/Signin"
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute'; // <-- Import ยามเข้ามา

// 2. สร้าง Function App()
function App() {
  // 3. ใช้ return เพื่อคืนค่า JSX
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      
      {/* หน้าที่ต้อง Login ถึงจะเห็น */}
      <Route 
        path="/home1" 
        element={
          <ProtectedRoute>
            <Home1 />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/home" 
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/Signin" 
        element={
          <ProtectedRoute>
            <JoinORG />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default App;
