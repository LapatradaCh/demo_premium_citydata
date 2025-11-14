import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './css/Home1.module.css'; 
import {
  FaMapMarkedAlt,
  FaClipboardList,
  FaChartBar,
  FaCog,
  FaBuilding,
} from "react-icons/fa";

const Home1 = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [allAgencies, setAllAgencies] = useState([]); 
  const [filteredAgencies, setFilteredAgencies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- State และข้อมูลสำหรับ Nav Bar ---
  const [activeTab, setActiveTab] = useState("หน่วยงาน"); 
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const [activeSubTabs, setActiveSubTabs] = useState({
    แผนที่: "แผนที่สาธารณะ",
    รายการแจ้ง: "เฉพาะหน่วยงาน",
    สถิติ: "สถิติ",
    ผลลัพธ์: "แก้ปัญหาสูงสุด",
  });

  const menuItems = [
    { name: "แผนที่", icon: FaMapMarkedAlt, items: ["แผนที่สาธารณะ", "แผนที่ภายใน"] },
    { name: "หน่วยงาน", icon: FaBuilding, items: null, action: () => navigate("/home1") },
    { name: "รายการแจ้ง", icon: FaClipboardList, items: ["เฉพาะหน่วยงาน", "รายการแจ้งรวม"] },
    { name: "สถิติ", icon: FaChartBar, items: ["สถิติ", "สถิติองค์กร"] },
    { name: "ตั้งค่า", icon: FaCog, items: null },
  ];

  // (useEffect, logAgencyEntry, handleLogout, handleSearch, handleClear, handleAgencyClick)
  // ... (โค้ดส่วน Logic ทั้งหมดเหมือนเดิมทุกประการ) ...

  useEffect(() => {
    const fetchAgencies = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const userId = localStorage.getItem('user_id'); 
        const accessToken = localStorage.getItem('accessToken');

        if (!userId) throw new Error('ไม่พบข้อมูลผู้ใช้ (user_id) กรุณาเข้าสู่ระบบใหม่');
        if (!accessToken) throw new Error('ไม่พบ Access Token กรุณาเข้าสู่ระบบใหม่');

        const apiUrl = `https://premium-citydata-api-ab.vercel.app/api/users_organizations?user_id=${userId}`;

        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) throw new Error(`ไม่สามารถดึงข้อมูลได้: ${response.statusText}`);

        const data = await response.json(); 
        const formattedData = data.map(item => ({
          id: item.organization_id,
          name: item.organization_name,
          img: item.url_logo, 
          badge: null 
        }));
         console.log('data select:', formattedData);

        setAllAgencies(formattedData);
        setFilteredAgencies(formattedData);

      } catch (err) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูลหน่วยงาน:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgencies(); 
  }, []);

  const logAgencyEntry = async (agency) => {
    const userId = localStorage.getItem('user_id');
    const accessToken = localStorage.getItem('accessToken');

    if (!userId || !accessToken) {
      console.error('ไม่สามารถส่ง log: ไม่พบ user_id หรือ accessToken');
      return;
    }

    try {
      const logData = {
        user_id: userId,
        action_type: 'enter_organization',
        provider: localStorage.getItem('provider') || null, 
        user_agent: navigator.userAgent,
        status: 'success',
        details: {
          organization_id: agency.id,
          organization_name: agency.name 
        }
      };
      const apiUrl = 'https://premium-citydata-api-ab.vercel.app/api/user_logs'; 

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(logData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('ไม่สามารถบันทึก log การเข้าหน่วยงาน:', errorData);
      } else {
        console.log('บันทึกการเข้าหน่วยงานเรียบร้อย');
      }

    } catch (err) {
      console.error('เกิดข้อผิดพลาดในการส่ง log:', err);
    }
  };

  const handleLogout = async () => {
    const accessToken = localStorage.getItem("accessToken");
    const userId = localStorage.getItem("user_id"); 
    console.log("Initiating logout for token:", accessToken);

    try {
      if (accessToken && userId) { 
        const apiUrl = "https://premium-citydata-api-ab.vercel.app/api/logout";
        await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ user_id: userId }), 
        });
        console.log("Backend has been notified of the logout.");
      }
    } catch (error) {
      console.error("Failed to notify backend, but proceeding with client-side logout.", error);
    } finally {
      console.log("Executing client-side cleanup.");
      if (window.liff && window.liff.isLoggedIn()) window.liff.logout();
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user_id"); 
      localStorage.removeItem("selectedOrg"); 
      localStorage.removeItem("provider"); 
      navigate("/"); 
    }
  };

  const handleSearch = () => {
    const filtered = allAgencies.filter((agency) =>
      agency.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAgencies(filtered);
  };

  const handleClear = () => {
    setSearchTerm('');
    setFilteredAgencies(allAgencies);
  };

  const handleAgencyClick = (agency) => {
    console.log("Clicked agency:", agency); 
    localStorage.setItem('selectedOrg', JSON.stringify(agency));
    localStorage.setItem('lastSelectedOrg', JSON.stringify(agency));
    logAgencyEntry(agency); 
    navigate('/home'); 
  };

  // --- ฟังก์ชันสำหรับ Nav Bar ---
  const handleTabClick = (item) => {
    if (item.action) {
      item.action(); 
      setActiveTab(item.name);
      setOpenSubMenu(null);
    } else if (item.items) {
      setActiveTab(item.name);
      setOpenSubMenu(openSubMenu === item.name ? null : item.name);
    } else {
      navigate("/home");
    }
  };

  const handleSubMenuItemClick = (mainTabName, subItemName) => {
    navigate("/home");
    setOpenSubMenu(null);
  };


  return (
    <>
      <div className={styles.appBody}>
        {/* (ส่วนเนื้อหา: Logout, Title, Search, Cards, Agency Grid) */}
        {/* ... (โค้ดส่วนเนื้อหาทั้งหมดเหมือนเดิม) ... */}
        
        <div className={styles.logoutIcon}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <svg 
              width="18" height="18" viewBox="0 0 24 24" fill="none" 
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" 
              strokeLinejoin="round" aria-hidden="true" >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>ออกจากระบบ</span>
          </button>
        </div>

        <h1 className={styles.title}>เลือกหน่วยงานที่คุณต้องการ</h1>

        <div className={styles.searchContainer}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="ค้นหาหน่วยงาน..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          {searchTerm && (
            <button className={styles.clearButton} onClick={handleClear}>
              <X size={16} />
            </button>
          )}
          <button className={styles.searchButton} onClick={handleSearch}>
            <Search size={18} />
          </button>
        </div>

        <div className={styles.extraCards}>
          <div className={styles.extraCard} onClick={() => navigate('/request-code')}>
            <p>ขอรหัสเพื่อเริ่มใช้งาน</p>
          </div>
          <div className={styles.extraCard} onClick={() => navigate('/Signin')}>
            <p>ใส่รหัสเพื่อเริ่มใช้งาน</p>
          </div>
          <div className={styles.extraCard} onClick={() => navigate('/CreateOrg')}>
            <p>สร้างหน่วยงาน</p>
          </div>
        </div>

        <div className={styles.agencySection}>
          {isLoading ? (
            <p className={styles.loadingMessage}>กำลังโหลดข้อมูลหน่วยงาน...</p>
          ) : error ? (
            <p className={styles.errorMessage}>เกิดข้อผิดพลาด: {error}</p>
          ) : filteredAgencies.length === 0 ? (
            <p className={styles.noResults}>ไม่พบหน่วยงาน</p>
          ) : (
            <>
              <h2 className={styles.sectionTitle}>หน่วยงานทั้งหมด</h2>
              <div className={styles.agencyGrid}>
                {filteredAgencies.map((agency) => (
                  <div
                    key={agency.id} 
                    className={styles.agencyItem}
                    onClick={() => handleAgencyClick(agency)} 
                  >
                    <div className={styles.agencyImg}>
                      <img
                        src={agency.img}
                        alt={agency.name} 
                        title={agency.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://placehold.co/100x100/A0AEC0/ffffff?text=${agency.name.charAt(0)}`;
                        }}
                      />
                      {agency.badge && <div className={styles.agencyBadge}>{agency.badge}</div>}
                    </div>
                    <div className={styles.agencyName} title="คลิกเพื่อเข้าหน่วยงานนี้">
                      {agency.name}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* --- ส่วน Bottom Nav Bar (ใช้ styles) --- */}
      <div className={styles.bottomNav}>
        {menuItems.map((item) => (
          <div key={item.name} className={styles.bottomNavButtonContainer}>
            {item.items && openSubMenu === item.name && (
              <div className={styles.subMenuPopup}>
                {item.items.map((subItem) => (
                  <div
                    key={subItem}
                    className={`${styles.subMenuItem} ${
                      activeSubTabs[item.name] === subItem ? styles.active : ""
                    }`}
                    onClick={() =>
                      handleSubMenuItemClick(item.name, subItem)
                    }
                  >
                    {subItem}
                  </div>
                ))}
              </div>
            )}
            <button
              className={activeTab === item.name ? styles.active : ""}
              onClick={() => handleTabClick(item)}
            >
              <item.icon />
              <span>{item.name}</span>
            </button>
          </div>
        ))}
      </div>
    </>
  );
};

export default Home1;
