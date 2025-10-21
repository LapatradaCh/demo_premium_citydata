import React, { useState, useEffect } from 'react'; // <-- เพิ่ม useEffect
import { Search, LogOut, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import liff from "@line/liff";
import './Home1.css';

// --- vvv ลบ const agencies ที่ hardcode ออกไป vvv ---
// const agencies = [ ... ];
// --- ^^^ สิ้นสุดการลบ ^^^ ---

const Home1 = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // --- vvv ส่วนที่เพิ่มเข้ามาสำหรับ Fetch API vvv ---
  const [allAgencies, setAllAgencies] = useState([]); // เก็บ master list จาก API
  const [filteredAgencies, setFilteredAgencies] = useState([]); // state ที่ใช้แสดงผล (เริ่มต้นเป็น array ว่าง)
  const [isLoading, setIsLoading] = useState(true); // สถานะกำลังโหลด
  const [error, setError] = useState(null); // สถานะ error

  useEffect(() => {
    // ฟังก์ชันสำหรับดึงข้อมูลหน่วยงาน
    const fetchAgencies = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 1. ดึง user_id และ token จาก localStorage
        const userId = localStorage.getItem('user_id'); 
        const accessToken = localStorage.getItem('accessToken');

        if (!userId) {
          throw new Error('ไม่พบข้อมูลผู้ใช้ (user_id) กรุณาเข้าสู่ระบบใหม่');
        }
        
        if (!accessToken) {
          throw new Error('ไม่พบ Access Token กรุณาเข้าสู่ระบบใหม่');
        }

        // 2. สร้าง URL ตามที่ร้องขอ
        const apiUrl = `https://premium-citydata-api-ab.vercel.app/api/users_organizations?user_id=${userId}`;

        // 3. เรียก API
        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`ไม่สามารถดึงข้อมูลได้: ${response.statusText}`);
        }

        const data = await response.json();

        // 4. ทำการ Map ข้อมูลจาก API (ตามที่คุณต้องการ)
        // API field: organization_name -> name
        // API field: url_log -> img
        // เราจะสมมติว่า API คืน organization_id มาเพื่อใช้เป็น key นะครับ
        const formattedData = data.map(item => ({
          id: item.organization_id, // หรือ item.id ขึ้นอยู่กับ API ของคุณ
          name: item.organization_name,
          img: item.url_log,
          badge: null // API ของคุณอาจไม่มี badge, ใส่ null ไว้ก่อน
        }));

        // 5. อัปเดต State
        setAllAgencies(formattedData);
        setFilteredAgencies(formattedData);

      } catch (err) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูลหน่วยงาน:", err);
        setError(err.message);
      } finally {
        setIsLoading(false); // สิ้นสุดการโหลด
      }
    };

    fetchAgencies(); // เรียกใช้งานฟังก์ชันเมื่อ component โหลด
  }, []); // [] หมายถึงให้รันแค่ครั้งเดียวตอนโหลด
  // --- ^^^ สิ้นสุดส่วนที่เพิ่มเข้ามา ^^^ ---


  const handleLogout = async () => {
    // ... (ส่วนของ Logout ยังคงเดิม ไม่เปลี่ยนแปลง) ...
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
      localStorage.removeItem("user_id"); // <-- แนะนำให้ลบ user_id ออกไปด้วย
 
      navigate("/");
    }
  };


  const handleSearch = () => {
    // --- vvv อัปเดตให้ค้นหาจาก allAgencies vvv ---
    const filtered = allAgencies.filter((agency) =>
      agency.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    // --- ^^^ สิ้นสุดการอัปเดต ^^^ ---
    setFilteredAgencies(filtered);
  };

  const handleClear = () => {
    setSearchTerm('');
    // --- vvv อัปเดตให้รีเซ็ตเป็น allAgencies vvv ---
    setFilteredAgencies(allAgencies);
    // --- ^^^ สิ้นสุดการอัปเดต ^^^ ---
  };

  const handleAgencyClick = () => navigate('/home');

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
        {/* --- vvv ส่วนจัดการ Loading และ Error vvv --- */}
        {isLoading ? (
          <p className="loading-message">กำลังโหลดข้อมูลหน่วยงาน...</p>
        ) : error ? (
          <p className="error-message">เกิดข้อผิดพลาด: {error}</p>
        ) : filteredAgencies.length === 0 ? (
        // --- ^^^ สิ้นสุดส่วนจัดการ Loading และ Error ^^^ --- */}
          <p className="no-results">ไม่พบหน่วยงาน</p>
        ) : (
          <div className="agency-grid">
            {filteredAgencies.map((agency) => (
              <div
                key={agency.id} // <-- id นี้จะมาจาก item.organization_id ที่เรา map ไว้
                className="agency-item"
                onClick={handleAgencyClick}
              >
                <div className="agency-img">
                  <img
                    src={agency.img} // <-- img นี้จะมาจาก item.url_log
                    alt={agency.name} // <-- name นี้จะมาจาก item.organization_name
                    title={agency.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://placehold.co/100x100/A0AEC0/ffffff?text=${agency.name.charAt(0)}`;
                    }}
                  />
                  {agency.badge && <div className="agency-badge">{agency.badge}</div>}
                </div>
                <div className="agency-name" title="คลิกเพื่อเข้าหน่วยงานนี้">
                  {agency.name} {/* <-- name นี้จะมาจาก item.organization_name */}
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
