import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./css/Home.module.css";
import logo from "./logo.png";
import {
  FaMapMarkedAlt,
  FaClipboardList,
  FaChartBar,
  FaCog,
  FaBuilding,
  FaSignOutAlt,
} from "react-icons/fa";
import liff from "@line/liff";

import ReportTable from "./ReportTable";
import MapView from "./MapView";
import StatisticsView from "./StatisticsView";
import OrganizationStatisticsView from "./OrgStatisticsView";
import SettingsView from "./SettingsView";
import ReportDetail from "./ReportDetail";

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [organizationInfo, setOrganizationInfo] = useState({
    name: "กำลังโหลด...",
    logo: logo,
    id: null,
  });

  const [activeTab, setActiveTab] = useState("รายการแจ้ง");
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const [activeSubTabs, setActiveSubTabs] = useState({
    แผนที่: "แผนที่สาธารณะ",
    รายการแจ้ง: "เฉพาะหน่วยงาน",
    สถิติ: "สถิติ",
    ผลลัพธ์: "แก้ปัญหาสูงสุด",
  });

  const [selectedReport, setSelectedReport] = useState(null);

  // ... (menuItems และ useEffect โหลดข้อมูล เหมือนเดิม ไม่ต้องแก้) ...
  const menuItems = [
    {
      name: "แผนที่",
      icon: FaMapMarkedAlt,
      items: ["แผนที่สาธารณะ", "แผนที่ภายใน"],
    },
    {
      name: "หน่วยงาน",
      icon: FaBuilding,
      items: null,
      action: () => navigate("/home1"),
    },
    {
      name: "รายการแจ้ง",
      icon: FaClipboardList,
      items: ["เฉพาะหน่วยงาน", "รายการแจ้งรวม"],
    },
    {
      name: "สถิติ",
      icon: FaChartBar,
      items: ["สถิติ", "สถิติองค์กร"],
    },
    {
      name: "ตั้งค่า",
      icon: FaCog,
      items: null,
    },
  ];

  useEffect(() => {
    const stateAgency = location.state?.agency;
    if (stateAgency) {
      setOrganizationInfo({
        name: stateAgency.name,
        logo: stateAgency.img || logo,
        id: stateAgency.id || stateAgency.organization_id || null,
      });
      localStorage.setItem("lastSelectedOrg", JSON.stringify(stateAgency));
      return;
    }
    const tryReadOrg = (retry = 0) => {
       const cachedOrg = localStorage.getItem("selectedOrg");
       const lastOrg = localStorage.getItem("lastSelectedOrg");
       let orgToSet = null;

       if (cachedOrg) {
         orgToSet = JSON.parse(cachedOrg);
         localStorage.removeItem("selectedOrg");
         localStorage.setItem("lastSelectedOrg", JSON.stringify(orgToSet));
       } else if (lastOrg) {
         orgToSet = JSON.parse(lastOrg);
       }

       if (orgToSet) {
         setOrganizationInfo({
           name: orgToSet.name,
           logo: orgToSet.img || logo,
           id: orgToSet.id || orgToSet.organization_id || null,
         });
       } else if (retry < 3) {
         setTimeout(() => tryReadOrg(retry + 1), 300);
       } else {
         setOrganizationInfo({
           name: "ไม่พบหน่วยงาน",
           logo: logo,
           id: null,
         });
       }
    };
    tryReadOrg();
  }, [location.state]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("lastSelectedOrg");
    localStorage.clear();
    if (liff.isLoggedIn()) liff.logout();
    navigate("/");
  };

  // ✅ แก้ไข 1: ถ้ามี items (เมนูย่อย) ให้เปิดแค่ Pop-up ยังไม่ต้องเปลี่ยนหน้า
  const handleTabClick = (item) => {
    if (item.action) {
      item.action();
    } else {
      if (item.items) {
        // กรณีมีเมนูย่อย: แค่เปิด/ปิด Pop-up (ไม่ set activeTab)
        setOpenSubMenu(openSubMenu === item.name ? null : item.name);
      } else {
        // กรณีไม่มีเมนูย่อย (เช่น ตั้งค่า): เปลี่ยนหน้าได้เลย
        setSelectedReport(null);
        setActiveTab(item.name);
        setOpenSubMenu(null);
      }
    }
  };

  // ✅ แก้ไข 2: เมื่อกดเลือกเมนูย่อย ค่อยเปลี่ยนหน้าหลัก (setActiveTab)
  const handleSubMenuItemClick = (mainTabName, subItemName) => {
    // 1. อัปเดตว่าเลือก SubTab ไหนอยู่
    setActiveSubTabs({
      ...activeSubTabs,
      [mainTabName]: subItemName,
    });
    
    // 2. เปลี่ยนหน้าหลักมาที่ Tab นี้
    setActiveTab(mainTabName); 

    // 3. Logic เพิ่มเติม
    if (mainTabName === "รายการแจ้ง") {
      setSelectedReport(null);
    }
    
    // 4. ปิด Pop-up
    setOpenSubMenu(null);
  };

  const handleGoToInternalMap = () => {
    setActiveTab("แผนที่");
    setActiveSubTabs((prev) => ({
      ...prev,
      แผนที่: "แผนที่ภายใน",
    }));
    setSelectedReport(null);
  };

  return (
    <div>
      <div className={styles.logoSectionTop}>
        <img src={organizationInfo.logo || logo} alt="Logo" className={styles.logoImg} />
        <span className={styles.unitName}>{organizationInfo.name}</span>
        <div className={styles.logoutIcon}>
          <button onClick={handleLogout} className={styles.logoutButton}>
            <FaSignOutAlt /> <span>ออกจากระบบ</span>
          </button>
        </div>
      </div>

      <div className={styles.dashboardContent}>
        {activeTab === "รายการแจ้ง" && (
          <>
            {selectedReport ? (
              <ReportDetail 
                data={selectedReport}
                onBack={() => setSelectedReport(null)} 
                onGoToInternalMap={handleGoToInternalMap} 
              />
            ) : (
              <ReportTable 
                subTab={activeSubTabs["รายการแจ้ง"]} 
                onRowClick={(item) => setSelectedReport(item)} 
              />
            )}
          </>
        )}

        {activeTab === "แผนที่" && (
          <MapView subTab={activeSubTabs["แผนที่"]} />
        )}

        {activeTab === "สถิติ" && (
          <>
            {activeSubTabs["สถิติ"] === "สถิติ" && <StatisticsView subTab={activeSubTabs["สถิติ"]} organizationId={organizationInfo.id} />}
            {activeSubTabs["สถิติ"] === "สถิติองค์กร" && <OrganizationStatisticsView />}
          </>
        )}
        {activeTab === "ตั้งค่า" && <SettingsView />}
      </div>

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
              /* เพิ่มเงื่อนไข: ถ้า Menu เปิดอยู่ ให้ปุ่มดู Active ด้วยเพื่อให้รู้ว่ากดตัวไหนอยู่ */
              className={activeTab === item.name || openSubMenu === item.name ? styles.active : ""}
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
