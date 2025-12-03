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
    // ลบ case_id ที่อาจค้างอยู่ออกด้วยตอน logout
    localStorage.removeItem("selectedCaseId");
    localStorage.clear();
    if (liff.isLoggedIn()) liff.logout();
    navigate("/");
  };

  const handleTabClick = (item) => {
    if (item.action) {
      item.action();
    } else {
      if (item.items) {
        setOpenSubMenu(openSubMenu === item.name ? null : item.name);
      } else {
        setSelectedReport(null);
        setActiveTab(item.name);
        setOpenSubMenu(null);
      }
    }
  };

  const handleSubMenuItemClick = (mainTabName, subItemName) => {
    setActiveSubTabs({
      ...activeSubTabs,
      [mainTabName]: subItemName,
    });
    
    setActiveTab(mainTabName); 

    if (mainTabName === "รายการแจ้ง") {
      setSelectedReport(null);
    }
    
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

  // ✅ ฟังก์ชันสำหรับจัดการเมื่อกดเลือกเคส (แยกออกมาเพื่อให้ดูง่าย)
  const handleReportSelect = (item) => {
    console.log("failure");
    if (item) {
      console.log("success:", item);
        // บันทึก ID ลง LocalStorage (ใช้ชื่อ key ว่า 'selectedCaseId')
        // หมายเหตุ: ตรวจสอบว่าใน object item ใช้ชื่อ field ว่า 'id' หรือ 'case_id' 
        // ถ้าเป็น 'case_id' ให้แก้เป็น item.case_id ครับ
        const caseIdToSave = item.case_id; 
        if (caseIdToSave) {
            localStorage.setItem("selectedCaseId", caseIdToSave);
        }
    }
    setSelectedReport(item);
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
                onBack={() => {
                    // (Optional) เมื่อกดกลับ อาจจะลบ ID ออกจาก storage หรือเก็บไว้ก็ได้ตามต้องการ
                    // localStorage.removeItem("selectedCaseId"); 
                    setSelectedReport(null);
                }} 
                onGoToInternalMap={handleGoToInternalMap} 
              />
            ) : (
              <ReportTable 
                subTab={activeSubTabs["รายการแจ้ง"]} 
                // ✅ เรียกใช้ฟังก์ชัน handleReportSelect แทนการ set state โดยตรง
                onRowClick={handleReportSelect} 
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
