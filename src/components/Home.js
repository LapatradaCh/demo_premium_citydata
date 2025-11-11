import React, { useState, useEffect } from "react";
// (*** MODIFIED ***) นำเข้า CSS Module ที่ถูกต้อง
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
import { useNavigate } from "react-router-dom";
import liff from "@line/liff";

// (*** NEW ***) นำเข้า Component หน้าต่างๆ ที่เราแยกไฟล์ไป
import ReportTable from "./ReportTable";
import MapView from "./MapView";
import StatisticsView from "./StatisticsView";
import OrganizationStatisticsView from "./OrgStatisticsView";
import SettingsView from "./SettingsView";



const Home = () => {
  const navigate = useNavigate();
  const [organizationInfo, setOrganizationInfo] = useState({
    name: "กำลังโหลด...",
    logo: logo,
    id: null, // (*** MODIFIED: เพิ่ม id เป็น null เริ่มต้น ***)
  });

  const [activeTab, setActiveTab] = useState("รายการแจ้ง"); // <-- (*** FIXED ***) เปลี่ยนค่าเริ่มต้นกลับไปที่ "รายการแจ้ง"
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const [activeSubTabs, setActiveSubTabs] = useState({
    แผนที่: "แผนที่สาธารณะ",
    รายการแจ้ง: "เฉพาะหน่วยงาน",
    สถิติ: "สถิติ", // (*** MODIFIED ***) เปลี่ยนค่าเริ่มต้นเป็น "สถิติ" (หน้าหลัก)
    ผลลัพธ์: "แก้ปัญหาสูงสุด",
  });

  // (*** MODIFIED ***)
  // อัปเดตเมนูให้ครบถ้วน และ "ตั้งค่า" ไม่มีเมนูย่อย
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
      items: null, // <--- ไม่มีเมนูย่อย
    },
  ];

  useEffect(() => {
    const fetchOrg = async () => {
      try {
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
          // (*** MODIFIED: ตั้งค่า state พร้อม ID ***)
          setOrganizationInfo({
            name: orgToSet.name,
            logo: orgToSet.img,
            id: orgToSet.id || orgToSet.organization_id, // <-- [สำคัญ]
          });
        } else {
          // กรณีไม่พบ Org ID เลย (ไม่ควรเกิดขึ้น แต่ป้องกันไว้)
          setOrganizationInfo({ name: "ไม่พบหน่วยงาน", logo: logo, id: null });
        }
      } catch (error) {
        console.error(error);
        setOrganizationInfo({ name: "เกิดข้อผิดพลาด", logo: logo, id: null });
      }
    };
    fetchOrg();
  }, []);

  const handleLogout = () => {
    // (*** MODIFIED ***) ตรวจสอบให้แน่ใจว่าได้ล้าง Token ออกจาก localStorage ตอน Logout
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("lastSelectedOrg");
    localStorage.clear(); // ล้างทั้งหมดเลยก็ได้

    if (liff.isLoggedIn()) liff.logout();
    navigate("/");
  };

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
    setActiveSubTabs({
      ...activeSubTabs,
      [mainTabName]: subItemName,
    });
    setOpenSubMenu(null);
  };

  return (
    <div>
      <div className={styles.logoSectionTop}>
        <img
          src={organizationInfo.logo}
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

      <div className={styles.dashboardContent}>
        {/* (*** MODIFIED ***)
              แสดง Component ที่ import เข้ามา
           */}
        {activeTab === "รายการแจ้ง" && (
          <ReportTable subTab={activeSubTabs["รายการแจ้ง"]} />
        )}

        {activeTab === "แผนที่" && (
          <MapView subTab={activeSubTabs["แผนที่"]} />
        )}

        {activeTab === "สถิติ" && (
          <>
            {activeSubTabs["สถิติ"] === "สถิติ" && (
              // (*** MODIFIED: ส่ง organizationId ลงไปเป็น prop ***)
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
