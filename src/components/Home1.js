import React, { useState, useEffect } from 'react'; // <-- เพิ่ม useEffect
import { Search, LogOut, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import liff from "@line/liff";
import './Home1.css';

// --- vvv ลบ const agencies ที่ hardcode ไว้ออก vvv ---
// const agencies = [ ... ];
// --- ^^^ ลบ const agencies ที่ hardcode ไว้ออก ^^^ ---

const Home1 = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- vvv ส่วนที่อัปเดต vvv ---
  const [agencies, setAgencies] = useState([]); // State สำหรับเก็บข้อมูลจริงจาก API
  const [filteredAgencies, setFilteredAgencies] = useState([]); // State สำหรับแสดงผล (หลังค้นหา)
  const [isLoading, setIsLoading] = useState(true); // State สำหรับ Loading
  const [error, setError] = useState(null); // State สำหรับ Error
  // --- ^^^ สิ้นสุดส่วนที่อัปเดต ^^^ ---

  const navigate = useNavigate();

  // --- vvv ส่วนที่เพิ่มมา (useEffect) vvv ---
  useEffect(() => {
    const fetchAgencies = async () => {
      // 1. ดึง user_id และ token จาก localStorage
      // (ผมสมมติว่าคุณเก็บ user_id ไว้นะครับ ถ้าไม่ได้เก็บ ต้องหาวิธีส่ง user_id มา)
      const userId = localStorage.getItem("user_id"); 
      const accessToken = localStorage.getItem("accessToken");

      // 2. ถ้าไม่มีข้อมูล user หรือ token ให้หยุดทำงาน
      if (!userId || !accessToken) {
        console.error("User ID or Access Token not found. Cannot fetch agencies.");
        setError("ไม่พบข้อมูลผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่");
        setIsLoading(false);
        // อาจจะ navigate ไปหน้า login เลยก็ได้
        // navigate("/"); 
        return;
      }

      // 3. สร้าง URL ตามที่คุณต้องการ
      const apiUrl = `https://premium-citydata-api-ab.vercel.app/api/users_organizations?user_id=${userId}`;

      try {
        const response = await fetch(apiUrl, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`, // ส่ง Token ไปด้วย
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // 4. Map ข้อมูลที่ได้จาก API ให้ตรงกับ format ที่ UI ต้องการ
        // (ผมสมมติว่า ID ขององค์กรคือ organization_id)
        const formattedData = data.map(org => ({
          id: org.organization_id, // หรือ ID อื่นๆ ที่เป็น unique key
          name: org.organization_name, // ตามที่คุณระบุ
          img: org.url_log, // ตามที่คุณระบุ
          badge: null // API ของคุณอาจไม่มี badge, ถ้ามีก็ map มาได้เลย
        }));

        setAgencies(formattedData); // เก็บข้อมูลต้นฉบับ
        setFilteredAgencies(formattedData); // ตั้งค่าข้อมูลที่จะแสดงผล
        
      } catch (err) {
        console.error("Failed to fetch agencies:", err);
        setError("ไม่สามารถดึงข้อมูลหน่วยงานได้");
      } finally {
        setIsLoading(false); // หยุด Loading
      }
    };

    fetchAgencies();
  }, [navigate]); // ใส่ navigate ไว้ใน dependency array (เผื่อใช้ในอนาคต)
  // --- ^^^ สิ้นสุดส่วนที่เพิ่มมา (useEffect) ^^^ ---

  
  const handleLogout = async () => {
    // ... (ส่วน Logout ของคุณเหมือนเดิม ไม่ได้แก้ไข) ...
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
      localStorage.removeItem("user_id"); // <-- แนะนำให้ลบ user_id ออกด้วย
      navigate("/");
    }
  };

  // --- vvv ส่วนที่อัปเดต (Logic ค้นหา) vvv ---
  const handleSearch = () => {
    // กรองจาก `agencies` (ข้อมูลต้นฉบับ)
    const filtered = agencies.filter((agency) =>
      agency.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAgencies(filtered); // อัปเดต state ที่ใช้แสดงผล
  };

  const handleClear = () => {
    setSearchTerm('');
    setFilteredAgencies(agencies); // Reset กลับไปใช้ข้อมูลต้นฉบับ
  };
  // --- ^^^ สิ้นสุดส่วนที่อัปเดต (Logic ค้นหา) ^^^ ---

  const handleAgencyClick = () => navigate('/home');

  // --- vvv ส่วนที่อัปเดต (JSX) vvv ---
  // แสดง Loading
  if (isLoading) {
    return <div className="app-body"><div className="loading-spinner"></div><p>กำลังโหลดข้อมูล...</p></div>;
  }

  // แสดง Error
  if (error) {
    return <div className="app-body"><p className="error-message">เกิดข้อผิดพลาด: {error}</p></div>;
  }
  // --- ^^^ สิ้นสุดส่วนที่อัปเดต (JSX) ^^^ ---

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
      <div className="agency-section">
        {/*
          * ส่วนนี้ไม่ต้องแก้เลย เพราะมันอ่านจาก `filteredAgencies`
          * ซึ่งเราจัดการอัปเดตมันใน useEffect, handleSearch, handleClear อยู่แล้ว
        */}
        {filteredAgencies.length === 0 ? (
          <p className="no-results">ไม่พบหน่วยงาน</p>
        ) : (
          <div className="agency-grid">
            {filteredAgencies.map((agency) => (
              <div
                key={agency.id} // <-- ใช้ ID ที่ได้จาก API
                className="agency-item"
                onClick={handleAgencyClick}
              >
                <div className="agency-img">
                  <img
                    src={agency.img} // <-- ใช้ img (url_log) จาก API
                    alt={agency.name}
                    title={agency.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://placehold.co/100x100/A0AEC0/ffffff?text=${agency.name.charAt(0)}`;
                    }}
                  />
                  {agency.badge && <div className="agency-badge">{agency.badge}</div>}
                </div>
                <div className="agency-name" title="คลิกเพื่อเข้าหน่วยงานนี้">
                  {agency.name} {/* <-- ใช้ name (organization_name) จาก API */}
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
