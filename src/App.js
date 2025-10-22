// App.js
import Dashboard from './components/Dashboard';
import Home1 from './components/Home1';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute'; // <-- 1. Import ยามเข้ามา

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
</Routes>
