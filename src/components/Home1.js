import React, { useState, useEffect } from 'react'; // <-- เพิ่ม import useEffect
import { Search, LogOut, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import liff from "@line/liff";
import './Home1.css';

// --- vvv ลบ array 'agencies' ที่ hardcode ไว้ออก vvv ---
// const agencies = [ ... ]; 
// --- ^^^ ลบ array 'agencies' ที่ hardcode ไว้ออก ^^^ ---

const Home1 = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- vvv ส่วนที่อัปเดต vvv ---
  const [allAgencies, setAllAgencies] = useState([]); // State สำหรับเก็บข้อมูล Master
  const [filteredAgencies, setFilteredAgencies] = useState([]); // State สำหรับแสดงผล (หลัง filter)
  const [isLoading, setIsLoading] = useState(true); // State สำหรับสถานะ Loading
  const [error, setError] = useState(null); // State สำหรับเก็บ Error
  // --- ^^^ สิ้นสุดส่วนที่อัปเดต ^^^ ---

  const navigate = useNavigate();

  // --- vvv ส่วนที่เพิ่มใหม่ (useEffect) vvv ---
  useEffect(() => {
    const fetchUserOrganizations = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 1. ดึง user_id และ token จาก localStorage
        // (สมมติว่าตอน Login คุณได้เก็บ user_id ไว้นะครับ)
        const userId = localStorage.getItem("user_id"); 
        const accessToken = localStorage.getItem("accessToken");

        // 2. ตรวจสอบว่ามีข้อมูล login ครบหรือไม่
        if (!userId || !accessToken) {
          console.error("User ID or Access Token not found. Redirecting to login.");
          navigate("/"); // กลับไปหน้า Login
          return;
        }

        // 3. สร้าง URL ตามที่คุณต้องการ
        const apiUrl = `https://premium-citydata-api-ab.vercel.app/api/users_organizations?user_id=${userId}`;
        
        // 4. เรียก API
        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // ส่ง Token ไปด้วยเพื่อยืนยันตัวตน
            "Authorization": `Bearer ${accessToken}`, 
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }

        const data = await response.json();

        // 5. Map ข้อมูลที่ได้จาก API ให้ตรงกับโครงสร้างที่ Component นี้ใช้
        const mappedData = data.map(org => ({
          ...org, // เผื่อมี field อื่นๆ เช่น badge
          id: org.organization_id || org.id, // พยายามหา ID ที่ไม่ซ้ำกัน (สำคัญมากสำหรับ React key)
          name: org.organization_name, // Map field 'organization_name' -> 'name'
          img: org.url_logo, // Map field 'url_logo' -> 'img'
        }));

        setAllAgencies(mappedData);
        setFilteredAgencies(mappedData);

      } catch (err) {
        console.error("Error fetching organizations:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserOrganizations();
  }, [navigate]); // ใส่ navigate ใน dependency array เพราะเรามีการเรียกใช้
  // --- ^^^ สิ้นสุดส่วนที่เพิ่มใหม่ (useEffect) ^^^ ---


  const handleLogout = async () => {
    // ... (ส่วนของ Logout ยังเหมือนเดิม ไม่ต้องแก้ไข) ...
    const accessToken = localStorage.getItem("accessToken");
    console.log("Initiating logout for token:", accessToken);
 
    try {
      if (accessToken) {
        const apiUrl = `https://premium-citydata-api-ab.vercel.app/api/logout`;
        await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });
        console.log("Backend has been notified of the logout.");
      }
    } catch (error) {
      console.error("Failed to notify backend, but proceeding with client-side logout.", error);
    } finally {
      console.log("Executing client-side cleanup.");
      if (liff.isLoggedIn()) {
        liff.logout();
      }
      localStorage.removeItem("accessToken");
      // อย่าลืมลบ user_id ออกจาก localStorage ด้วย
      localStorage.removeItem("user_id"); 
      navigate("/");
    }
  };

  const handleSearch = () => {
    // --- vvv อัปเดต vvv ---
    // เปลี่ยนจาก 'agencies' เป็น 'allAgencies'
    const filtered = allAgencies.filter((agency) =>
      agency.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    // --- ^^^ อัปเดต ^^^ ---
    setFilteredAgencies(filtered);
  };

  const handleClear = () => {
    setSearchTerm('');
    // --- vvv อัปเดต vvv ---
    // เปลี่ยนจาก 'agencies' เป็น 'allAgencies'
    setFilteredAgencies(allAgencies);
    // --- ^^^ อัปเดต ^^^ ---
  };

  const handleAgencyClick = () => navigate('/home');

  // --- vvv ส่วนที่เพิ่มใหม่ (Loading/Error Handling) vvv ---
  if (isLoading) {
    return (
      <div className="app-body">
        <p className="loading-text">กำลังโหลดข้อมูลหน่วยงาน...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-body">
        <p className="error-text">เกิดข้อผิดพลาด: {error}</p>
        <button onClick={handleLogout}>กลับไปหน้า Login</button>
      </div>
    );
  }
  // --- ^^^ สิ้นสุดส่วนที่เพิ่มใหม่ (Loading/Error Handling) ^^^ ---

  return (
    <div className="app-body">
      {/* Logout Button */}
      <div className="logout-icon">
        <button onClick={handleLogout}>
          <LogOut size={18} />
          <span>ออกจากระบบ</span>
        </button>
      </div>

      {/* Header */}
      <h1 className="title">เลือกหน่วยงานที่คุณต้องการ</h1>

      {/* Search Box */}
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="ค้นหาหน่วยงาน..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        {searchTerm && (
          <button className="clear-button" onClick={handleClear}>
            <X size={16} />
          </button>
        )}
        <button className="search-button" onClick={handleSearch}>
          <Search size={18} />
        </button>
      </div>

      {/* Agency Grid */}
      {/* ส่วนนี้ไม่ต้องแก้ไข เพราะอ่านค่าจาก 'filteredAgencies' ซึ่งถูกต้องอยู่แล้ว */}
      <div className="agency-section">
        {filteredAgencies.length === 0 ? (
          <p className="no-results">ไม่พบหน่วยงาน</p>
        ) : (
          <div className="agency-grid">
            {filteredAgencies.map((agency) => (
              <div
                key={agency.id} // <-- สำคัญมาก: ต้องมั่นใจว่า agency.id ไม่ซ้ำกัน
                className="agency-item"
                onClick={handleAgencyClick}
              >
                <div className="agency-img">
                  <img
                    src={agency.img} // <-- มาจาก url_logo
                    alt={agency.name} // <-- มาจาก organization_name
                    title={agency.name} // <-- มาจาก organization_name
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://placehold.co/100x100/A0AEC0/ffffff?text=${agency.name.charAt(0)}`;
                    }}
                  />
                  {agency.badge && <div className="agency-badge">{agency.badge}</div>}
                </div>
                <div className="agency-name" title="คลิกเพื่อเข้าหน่วยงานนี้">
                  {agency.name} {/* <-- มาจาก organization_name */}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home1;
