import React, { useState, useEffect } from 'react';
import { Search, LogOut, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import liff from "@line/liff";
import './Home1.css';

const Home1 = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [agencies, setAgencies] = useState([]); // <-- แก้จาก static array เป็น state ที่ดึงจาก API
  const [filteredAgencies, setFilteredAgencies] = useState([]);
  const navigate = useNavigate();

  // ✅ โหลดข้อมูลหน่วยงานจาก API ตาม user_id ที่ login เข้ามา
  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        // ดึง user_id จาก localStorage หรือ token ตามที่มี
        const userId = localStorage.getItem("user_id"); 
        if (!userId) {
          console.warn("No user_id found in localStorage.");
          return;
        }

        // เรียก API ตามรูปแบบที่ให้มา
        const apiUrl = `https://premium-citydata-api-ab.vercel.app/api/users_organizations?user_id=${userId}`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Failed to fetch agencies");

        const data = await response.json();

        // แปลงข้อมูลให้อยู่ในรูปแบบเดียวกับ agencies เดิม
        const mappedAgencies = data.map((item, index) => ({
          id: index + 1,
          name: item.organization_name,
          img: item.url_logo, // ดึงรูปจาก column url_logo
          badge: item.badge || null,
        }));

        setAgencies(mappedAgencies);
        setFilteredAgencies(mappedAgencies);
      } catch (error) {
        console.error("Error fetching agencies:", error);
      }
    };

    fetchAgencies();
  }, []);

  /**
   * ฟังก์ชันสำหรับออกจากระบบ (ฉบับสมบูรณ์)
   */
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
      localStorage.removeItem("user_id"); // เคลียร์ user_id ด้วย
      navigate("/");
    }
  };

  const handleSearch = () => {
    const filtered = agencies.filter((agency) =>
      agency.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAgencies(filtered);
  };

  const handleClear = () => {
    setSearchTerm('');
    setFilteredAgencies(agencies);
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
        {filteredAgencies.length === 0 ? (
          <p className="no-results">ไม่พบหน่วยงาน</p>
        ) : (
          <div className="agency-grid">
            {filteredAgencies.map((agency) => (
              <div
                key={agency.id}
                className="agency-item"
                onClick={handleAgencyClick}
              >
                <div className="agency-img">
                  <img
                    src={agency.img}
                    alt={agency.name}
                    title={agency.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://placehold.co/100x100/A0AEC0/ffffff?text=${agency.name?.charAt(0) || '?'}`;
                    }}
                  />
                  {agency.badge && <div className="agency-badge">{agency.badge}</div>}
                </div>
                <div className="agency-name" title="คลิกเพื่อเข้าหน่วยงานนี้">
                  {agency.name}
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
