import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './css/Home1.module.css'; // ตรวจสอบ path CSS ให้ถูกต้อง

// Import Icons for Content (Search & Cards)
import { Search, X, Key, LogIn, Building2 } from 'lucide-react';

// Import Icons for Bottom Menu & Logout
import {
  FaMapMarkedAlt,
  FaClipboardList,
  FaChartBar,
  FaCog,
  FaBuilding,
  FaSignOutAlt,
} from "react-icons/fa";

const Home1 = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [allAgencies, setAllAgencies] = useState([]); 
  const [filteredAgencies, setFilteredAgencies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- State สำหรับ Bottom Menu ---
  const [activeTab, setActiveTab] = useState("หน่วยงาน");
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const [activeSubTabs, setActiveSubTabs] = useState({
    แผนที่: "แผนที่สาธารณะ",
    รายการแจ้ง: "เฉพาะหน่วยงาน",
    สถิติ: "สถิติ",
    ผลลัพธ์: "แก้ปัญหาสูงสุด",
  });

  // --- Menu Configuration ---
  const menuItems = [
    { 
      name: "แผนที่", 
      icon: FaMapMarkedAlt, 
      items: ["แผนที่สาธารณะ", "แผนที่ภายใน"] 
    },
    { 
      name: "หน่วยงาน", 
      icon: FaBuilding, 
      items: null, 
      action: () => { 
        setActiveTab("หน่วยงาน"); 
        setOpenSubMenu(null);
        // อยู่หน้าเดิมไม่ต้อง navigate
      }
    },
    { 
      name: "รายการแจ้ง", 
      icon: FaClipboardList, 
      items: ["เฉพาะหน่วยงาน", "รายการแจ้งรวม"] 
    },
    { 
      name: "สถิติ", 
      icon: FaChartBar, 
      items: ["สถิติ", "สถิติองค์กร"] 
    },
    { 
      name: "ตั้งค่า", 
      icon: FaCog, 
      items: null 
    },
  ];

  // Fetch ข้อมูลหน่วยงาน
  useEffect(() => {
    const fetchAgencies = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const userId = localStorage.getItem('user_id'); 
        const accessToken = localStorage.getItem('accessToken');
        if (!userId || !accessToken) throw new Error('ไม่พบข้อมูลการเข้าระบบ');
        
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
        setAllAgencies(formattedData);
        setFilteredAgencies(formattedData);
      } catch (err) {
        console.error("Error:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAgencies(); 
  }, []);

  const handleLogout = async () => {
    const accessToken = localStorage.getItem("accessToken");
    const userId = localStorage.getItem("user_id"); 
    try {
      if (accessToken && userId) { 
        await fetch("https://premium-citydata-api-ab.vercel.app/api/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ user_id: userId }), 
        });
      }
    } catch (error) {
      console.error("Logout Error", error);
    } finally {
      if (window.liff && window.liff.isLoggedIn()) window.liff.logout();
      localStorage.clear();
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
    localStorage.setItem('selectedOrg', JSON.stringify(agency));
    localStorage.setItem('lastSelectedOrg', JSON.stringify(agency));
    navigate('/home'); 
  };

  // --- Handlers สำหรับ Menu (Logic เหมือน Home.js) ---
  const handleTabClick = (item) => {
    if (item.action) {
      item.action(); 
    } else if (item.items) {
      // สลับการเปิด/ปิด Sub-menu
      setOpenSubMenu(openSubMenu === item.name ? null : item.name);
    } else {
      setActiveTab(item.name);
      setOpenSubMenu(null);
      // ไปหน้า Home พร้อมส่ง state ว่าจะเปิด Tab ไหน
      navigate("/home", { state: { initialTab: item.name } });
    }
  };

  const handleSubMenuItemClick = (mainTabName, subItemName) => {
    setActiveSubTabs(prev => ({
      ...prev,
      [mainTabName]: subItemName
    }));
    setOpenSubMenu(null);
    // ส่งค่าไปหน้า Home เพื่อเปิด Tab ย่อยนั้นๆ
    navigate("/home", { 
        state: { 
            initialTab: mainTabName,
            initialSubTab: subItemName
        } 
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.appBody}>
        {/* ปุ่ม Logout */}
        <div className={styles.logoutIcon}>
          <button onClick={handleLogout} className={styles.logoutButton}>
            <FaSignOutAlt /> 
            <span>ออกจากระบบ</span>
          </button>
        </div>

        <h1 className={styles.title}>เลือกหน่วยงานที่คุณต้องการ</h1>

        {/* ช่องค้นหา */}
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

        {/* 3 ปุ่มหลัก */}
        <div className={styles.extraCards}>
          <div className={styles.extraCard} onClick={() => navigate('/request-code')}>
            <div className={styles.cardIcon}><Key size={20} /></div>
            <span className={styles.cardTitle}>ขอรหัสเพื่อเริ่มใช้งาน</span>
          </div>
          <div className={styles.extraCard} onClick={() => navigate('/Signin')}>
             <div className={styles.cardIcon}><LogIn size={20} /></div>
            <span className={styles.cardTitle}>ใส่รหัสเพื่อเริ่มใช้งาน</span>
          </div>
          <div className={styles.extraCard} onClick={() => navigate('/CreateOrg')}>
             <div className={styles.cardIcon}><Building2 size={20} /></div>
            <span className={styles.cardTitle}>สร้างหน่วยงาน</span>
          </div>
        </div>

        {/* รายชื่อหน่วยงาน */}
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
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://placehold.co/100x100/A0AEC0/ffffff?text=${agency.name.charAt(0)}`;
                        }}
                      />
                    </div>
                    <div className={styles.agencyName}>
                      {agency.name}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ===== แถบเมนูด้านล่าง (ปรับให้เหมือน Home.js 100%) ===== */}
      <div className={styles.bottomNav}>
        {menuItems.map((item) => {
          const isMainActive = activeTab === item.name;
          const isSubMenuOpen = openSubMenu === item.name;

          return (
            <div key={item.name} className={styles.bottomNavButtonContainer}>
              {/* Sub-menu Popup */}
              {item.items && isSubMenuOpen && (
                <div className={styles.subMenuPopup}>
                  {item.items.map((subItem) => (
                    <div
                      key={subItem}
                      className={`${styles.subMenuItem} ${
                        activeSubTabs[item.name] === subItem ? styles.active : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation(); 
                        handleSubMenuItemClick(item.name, subItem);
                      }}
                    >
                      {subItem}
                    </div>
                  ))}
                </div>
              )}

              {/* ปุ่มเมนูหลัก */}
              <button
                className={isMainActive || isSubMenuOpen ? styles.active : ""}
                onClick={() => handleTabClick(item)}
              >
                <item.icon />
                <span>{item.name}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Home1;
