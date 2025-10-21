import React, { useState, useEffect } from 'react'; // <-- 1. Import useEffect
import { Search, LogOut, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import liff from "@line/liff";
import './Home1.css';

// ⛔️ 2. ลบ const agencies = [...] ที่ hardcode ไว้ออกไป

const Home1 = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // --- vvv 3. เพิ่ม States สำหรับเก็บข้อมูลที่ fetch มา vvv ---
  const [allAgencies, setAllAgencies] = useState([]); // State สำหรับเก็บข้อมูลทั้งหมดจาก API
  const [filteredAgencies, setFilteredAgencies] = useState([]); // State สำหรับแสดงผล (เริ่มต้นเป็น array ว่าง)
  const [isLoading, setIsLoading] = useState(true); // State สำหรับ loading
  const [error, setError] = useState(null); // State สำหรับเก็บ error
  // --- ^^^ สิ้นสุดส่วนที่เพิ่ม States ^^^ ---


  // --- vvv 4. เพิ่ม useEffect สำหรับ Fetch ข้อมูล vvv ---
  useEffect(() => {
    const fetchOrganizations = async () => {
      // ดึง user_id และ token จาก localStorage
      // (*** สมมติว่าคุณเก็บ user_id ไว้ใน localStorage ตอน login ***)
      const userId = localStorage.getItem("user_id"); 
      const accessToken = localStorage.getItem("accessToken");
      console.log("info userid:",userId)
      console.log("info accesstoken:",accessToken)
      
      if (!userId || !accessToken) {
        console.error("User ID or Access Token not found. Redirecting to login.");
        setError("ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่");
        setIsLoading(false);
        // อาจจะ navigate กลับไปหน้า login
        // navigate("/"); 
        return;
      }

      // สร้าง URL ตามที่ต้องการ
      const apiUrl = `https://premium-citydata-api-ab.vercel.app/api/users_organizations?user_id=${userId}`;

      try {
        setIsLoading(true); // เริ่มโหลด
        setError(null);
        
        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`, // ส่ง Token ไปด้วย
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // แปลงข้อมูลที่ได้จาก API (ตามชื่อ column ที่คุณระบุ)
        // ให้ตรงกับ format ที่ component นี้ใช้ (id, name, img)
        const formattedData = data.map(org => ({
          id: org.organization_id, // สมมติว่า id คือ organization_id
          name: org.organization_name, // <-- ตามที่คุณต้องการ
          img: org.url_logo,           // <-- ตามที่คุณต้องการ
          // badge: org.badge || null // ถ้า API มี badge ก็ใส่ตรงนี้
        }));

        setAllAgencies(formattedData); // เก็บข้อมูลต้นฉบับ
        setFilteredAgencies(formattedData); // ตั้งค่าข้อมูลที่จะแสดงผลในตอนแรก
      
      } catch (err) {
        console.error("Failed to fetch organizations:", err);
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูลหน่วยงาน");
      } finally {
        setIsLoading(false); // หยุด loading ไม่ว่าจะสำเร็จหรือล้มเหลว
      }
    };

    fetchOrganizations();
  }, []); // [] หมายถึงให้ run effect นี้แค่ครั้งเดียวตอน component โหลด
  // --- ^^^ สิ้นสุดส่วน useEffect ^^^ ---


  // --- vvv 5. ปรับปรุง handleLogout (เพิ่มการลบ user_id) vvv ---
  const handleLogout = async () => {
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
      localStorage.removeItem("user_id"); // <-- แนะนำ: ลบ user_id ออกไปด้วย

      navigate("/"); 
    }
  };
  // --- ^^^ สิ้นสุดส่วน handleLogout ^^^ ---


  // --- vvv 6. ปรับปรุง handleSearch และ handleClear vvv ---
  const handleSearch = () => {
    // กรองจาก allAgencies (ข้อมูลต้นฉบับ)
    const filtered = allAgencies.filter((agency) =>
      agency.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAgencies(filtered); // อัปเดต state ที่ใช้แสดงผล
  };

  const handleClear = () => {
    setSearchTerm('');
    setFilteredAgencies(allAgencies); // Reset กลับไปเป็นข้อมูลทั้งหมด
  };
  // --- ^^^ สิ้นสุดส่วน Search/Clear ^^^ ---

  const handleAgencyClick = () => navigate('/home');


  // --- vvv 7. ปรับปรุง JSX (Render) vvv ---
  // สร้างฟังก์ชันช่วย render ส่วนของ grid
  const renderAgencyGrid = () => {
    if (isLoading) {
      return <p className="loading-text">กำลังโหลดข้อมูลหน่วยงาน...</p>;
    }

    if (error) {
      return <p className="error-text">{error}</p>;
    }

    if (filteredAgencies.length === 0) {
      return <p className="no-results">ไม่พบหน่วยงาน</p>;
    }

    // ถ้ามีข้อมูล
    return (
      <div className="agency-grid">
        {filteredAgencies.map((agency) => (
          <div
            key={agency.id} // <-- ใช้ key จากข้อมูลที่ fetch มา
            className="agency-item"
            onClick={handleAgencyClick}
          >
            <div className="agency-img">
              <img
                src={agency.img} // <-- มาจาก url_logo
                alt={agency.name} // <-- มาจาก organization_name
                title={agency.name}
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
    );
  };


  return (
    <div className="app-body">
      {/* Logout Button (คงเดิม) */}
      <div className="logout-icon">
        <button onClick={handleLogout}>
          <LogOut size={18} />
          <span>ออกจากระบบ</span>
        </button>
      </div>

      {/* Header (คงเดิม) */}
      <h1 className="title">เลือกหน่วยงานที่คุณต้องการ</h1>

      {/* Search Box (คงเดิม) */}
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

      {/* Agency Grid (เรียกใช้ฟังก์ชัน render) */}
      <div className="agency-section">
        {renderAgencyGrid()}
      </div>
    </div>
  );
};
// --- ^^^ สิ้นสุดส่วน JSX ^^^ ---

export default Home1;
