import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // 1. อย่าลืม import useLocation

// --- 2. Import Components ของแต่ละหน้า (ตามชื่อไฟล์ CSS ของคุณ) ---
// * ตรวจสอบ path ให้ถูกต้องว่าไฟล์ .js เก็บอยู่ที่ไหน (เช่น ./components/)
import MapView from './MapView'; 
import ReportTable from './ReportTable'; 
import StatisticsView from './StatisticsView';
import OrgStatisticsView from './OrgStatisticsView';
import SettingsView from './SettingsView';

// Import CSS ของ Home หลัก
import styles from './css/Home1.module.css'; 
import { FaMapMarkedAlt, FaClipboardList, FaChartBar, FaCog, FaBuilding } from "react-icons/fa";

const Home = () => {
  const location = useLocation(); // เรียกใช้ Hook รับค่า
  const navigate = useNavigate();

  // --- State ---
  const [activeTab, setActiveTab] = useState("รายการแจ้ง"); // ค่า Default
  const [activeSubTabs, setActiveSubTabs] = useState({
    แผนที่: "แผนที่สาธารณะ",
    รายการแจ้ง: "เฉพาะหน่วยงาน",
    สถิติ: "สถิติ", 
  });
  const [openSubMenu, setOpenSubMenu] = useState(null);

  // --- 3. useEffect เพื่อรับค่าที่ส่งมาจาก Home1 ---
  useEffect(() => {
    if (location.state) {
      const { targetTab, targetSubTab } = location.state;
      
      console.log("รับค่าจาก Home1:", targetTab, targetSubTab); // เช็คค่าใน Console

      if (targetTab) {
        setActiveTab(targetTab); // เปลี่ยน Tab หลักทันที
      }

      if (targetSubTab && targetTab) {
        setActiveSubTabs(prev => ({
          ...prev,
          [targetTab]: targetSubTab // เปลี่ยน Sub Tab ถ้ามี
        }));
      }
      
      // ล้าง state ทิ้ง เพื่อไม่ให้ refresh แล้วค่าค้าง (Optional)
      window.history.replaceState({}, document.title);
    }
  }, [location]);


  // --- 4. ฟังก์ชันเลือกแสดงหน้า (Render Logic) ---
  const renderContent = () => {
    switch (activeTab) {
      case "แผนที่":
        // ส่ง activeSubTabs['แผนที่'] ไปให้ MapView เพื่อเลือกโหมด (สาธารณะ/ภายใน)
        return <MapView mode={activeSubTabs['แผนที่']} />;

      case "รายการแจ้ง":
        return <ReportTable filter={activeSubTabs['รายการแจ้ง']} />;

      case "สถิติ":
        // ถ้าเลือกเมนูย่อย "สถิติองค์กร" ให้ไปหน้า OrgStatisticsView
        if (activeSubTabs['สถิติ'] === "สถิติองค์กร") {
          return <OrgStatisticsView />;
        }
        // ถ้าเลือกเมนูย่อย "สถิติ" ธรรมดา ให้ไปหน้า StatisticsView
        return <StatisticsView />;

      case "ตั้งค่า":
        return <SettingsView />;

      case "หน่วยงาน":
        // กรณีนี้อาจจะไม่แสดงเนื้อหา แต่ redirect กลับไป Home1 หรือแสดง Profile
        return <div className={styles.placeholder}>หน้าหน่วยงาน</div>;

      default:
        return <ReportTable />; // Default Page
    }
  };

  // ... (ส่วนจัดการเมนู handleTabClick, handleSubMenuItemClick เหมือนเดิม) ...
  const menuItems = [
    { name: "แผนที่", icon: FaMapMarkedAlt, items: ["แผนที่สาธารณะ", "แผนที่ภายใน"] },
    { name: "หน่วยงาน", icon: FaBuilding, items: null, action: () => navigate("/home1") },
    { name: "รายการแจ้ง", icon: FaClipboardList, items: ["เฉพาะหน่วยงาน", "รายการแจ้งรวม"] },
    { name: "สถิติ", icon: FaChartBar, items: ["สถิติ", "สถิติองค์กร"] },
    { name: "ตั้งค่า", icon: FaCog, items: null },
  ];

  const handleTabClick = (item) => {
    if (item.action) {
      item.action();
    } else if (item.items) {
      setActiveTab(item.name);
      setOpenSubMenu(openSubMenu === item.name ? null : item.name);
    } else {
      setActiveTab(item.name);
      setOpenSubMenu(null);
    }
  };

  const handleSubMenuItemClick = (mainTabName, subItemName) => {
    setActiveTab(mainTabName);
    setActiveSubTabs({ ...activeSubTabs, [mainTabName]: subItemName });
    setOpenSubMenu(null);
  };

  return (
    <div className={styles.dashboardContent}>
        {/* --- ส่วน Header (Logo, Search) ใส่ตาม Code เดิมของคุณ --- */}
        {/* ... Header Code ... */}

        {/* --- ส่วนแสดงเนื้อหา --- */}
        <div className={styles.mainContentArea}>
            {renderContent()} 
        </div>

        {/* --- Bottom Nav Bar --- */}
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
                    onClick={() => handleSubMenuItemClick(item.name, subItem)}
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
    </div>
  );
};

export default Home;
