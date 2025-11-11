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

  const menuItems = [
    { name: "แผนที่", icon: FaMapMarkedAlt, items: ["แผนที่สาธารณะ", "แผนที่ภายใน"] },
    { name: "หน่วยงาน", icon: FaBuilding, action: () => navigate("/home1") },
    { name: "รายการแจ้ง", icon: FaClipboardList, items: ["เฉพาะหน่วยงาน", "รายการแจ้งรวม"] },
    { name: "สถิติ", icon: FaChartBar, items: ["สถิติ", "สถิติองค์กร"] },
    { name: "ตั้งค่า", icon: FaCog },
  ];

  // 🧠 โหลดข้อมูลหน่วยงาน
  useEffect(() => {
    const stateAgency = location.state?.agency;

    // ✅ 1. ถ้ามีค่า state จากหน้า login หรือ home1
    if (stateAgency) {
      const logoUrl =
        stateAgency.url_logo ||
        stateAgency.img ||
        stateAgency.logo ||
        logo;

      const orgInfo = {
        name: stateAgency.name,
        logo: logoUrl,
        id: stateAgency.id || stateAgency.organization_id || null,
      };

      setOrganizationInfo(orgInfo);
      localStorage.setItem("lastSelectedOrg", JSON.stringify(orgInfo));
      return;
    }

    // ✅ 2. ถ้าไม่มี state — โหลดจาก localStorage โดยตรง
    const cached = localStorage.getItem("lastSelectedOrg");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setOrganizationInfo({
          name: parsed.name || "ไม่พบชื่อหน่วยงาน",
          logo: parsed.url_logo || parsed.logo || logo,
          id: parsed.id || null,
        });
      } catch (e) {
        console.error("⚠️ lastSelectedOrg ไม่ใช่ JSON ที่ถูกต้อง", e);
        setOrganizationInfo({ name: "ไม่พบหน่วยงาน", logo, id: null });
      }
    } else {
      setOrganizationInfo({ name: "ไม่พบหน่วยงาน", logo, id: null });
    }
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

  const handleTabClick = (item) => {
    if (item.action) item.action();
    else if (item.items) {
      setActiveTab(item.name);
      setOpenSubMenu(openSubMenu === item.name ? null : item.name);
    } else {
      setActiveTab(item.name);
      setOpenSubMenu(null);
    }
  };

  const handleSubMenuItemClick = (mainTabName, subItemName) => {
    setActiveSubTabs({ ...activeSubTabs, [mainTabName]: subItemName });
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
        {activeTab === "รายการแจ้ง" && (
          <ReportTable subTab={activeSubTabs["รายการแจ้ง"]} />
        )}
        {activeTab === "แผนที่" && <MapView subTab={activeSubTabs["แผนที่"]} />}
        {activeTab === "สถิติ" && (
          <>
            {activeSubTabs["สถิติ"] === "สถิติ" && (
              <StatisticsView
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

      {/* ===== เมนูด้านล่าง ===== */}
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
