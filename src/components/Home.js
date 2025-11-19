import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./css/Home.module.css"; // import CSS ที่แก้ไขแล้ว
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

// Component ย่อยเดิม
import ReportTable from "./ReportTable";
import MapView from "./MapView";
import StatisticsView from "./StatisticsView";
import OrganizationStatisticsView from "./OrgStatisticsView";
import SettingsView from "./SettingsView";

// Component ใหม่ (หน้าแจ้งเรื่องตามรูป)
import ReportDetail from "./ReportDetail"; 

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // --- State ข้อมูลองค์กร ---
  const [organizationInfo, setOrganizationInfo] = useState({
    name: "กำลังโหลด...",
    logo: logo,
    id: null,
  });

  // --- State การจัดการ Tab และ Menu ---
  const [activeTab, setActiveTab] = useState("รายการแจ้ง");
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const [activeSubTabs, setActiveSubTabs] = useState({
    แผนที่: "แผนที่สาธารณะ",
    รายการแจ้ง: "เฉพาะหน่วยงาน",
    สถิติ: "สถิติ",
    ผลลัพธ์: "แก้ปัญหาสูงสุด",
  });

  // --- State สำหรับเลือกดูรายละเอียดแจ้งเรื่อง (เพิ่มใหม่) ---
  const [selectedReport, setSelectedReport] = useState(null);

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

  // 🧠 โหลดข้อมูลหน่วยงาน
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

  // ออกจากระบบ
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("lastSelectedOrg");
    localStorage.clear();

    if (liff.isLoggedIn()) liff.logout();
    navigate("/");
  };

  // สลับแท็บหลัก
  const handleTabClick = (item) => {
    if (item.action) {
      item.action();
    } else {
      // เมื่อเปลี่ยน Tab หลัก ให้เคลียร์ข้อมูล Report ที่เลือกไว้
      setSelectedReport(null);
      
      if (item.items) {
        setActiveTab(item.name);
        setOpenSubMenu(openSubMenu === item.name ? null : item.name);
      } else {
        setActiveTab(item.name);
        setOpenSubMenu(null);
      }
    }
  };

  // เปลี่ยนเมนูย่อย
  const handleSubMenuItemClick = (mainTabName, subItemName) => {
    setActiveSubTabs({
      ...activeSubTabs,
      [mainTabName]: subItemName,
    });
    
    if (mainTabName === "รายการแจ้ง") {
      setSelectedReport(null);
    }
    
    setOpenSubMenu(null);
  };

  return (
    <div>
      {/* ===== ส่วนหัว ===== */}
      <div className={styles.logoSectionTop}>
        <img
          src={organizationInfo.logo || logo}
          alt="Logo"
          className={styles.logoImg}
        />
        <span className={styles.unitName}>{organizationInfo.name}</span>

        <div className={styles.logoutIcon}>
          <button onClick={handleLogout} className={styles.logoutButton}>
            <FaSignOutAlt />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </div>

      {/* ===== เนื้อหาหลัก ===== */}
      <div className={styles.dashboardContent}>
        
        {/* --- ส่วนจัดการ รายการแจ้ง --- */}
        {activeTab === "รายการแจ้ง" && (
          <>
            {selectedReport ? (
              <ReportDetail 
                data={selectedReport}
                onBack={() => setSelectedReport(null)} 
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
            {activeSubTabs["สถิติ"] === "สถิติ" && (
              <StatisticsView
                subTab={activeSubTabs["สถิติ"]}
                organizationId={organizationInfo.id}
              />
            )}
            {activeSubTabs["สถิติ"] === "สถิติองค์กร" && (
              <OrganizationStatisticsView />
            )}
          </>
        )}

        {activeTab === "ตั้งค่า" && <SettingsView />}
      </div>

      {/* ===== แถบเมนูด้านล่าง ===== */}
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
    </div>
  );
};

export default Home;
