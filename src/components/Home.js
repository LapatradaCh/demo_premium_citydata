import React, { useState, useEffect } from "react";
import "./Home.css";
import logo from "./logo.png";
import {
  FaMapMarkedAlt, FaClipboardList, FaChartBar, FaCog, FaSignOutAlt, FaSearch
} from "react-icons/fa";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import { useNavigate } from "react-router-dom";
import liff from "@line/liff";

// ตัวอย่าง Report Data
const reportData = [
  { id: "#2025-TYHKE", detail: "ทดลองแจ้งเรื่องฝาท่อระบายน้ำ...", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFmeZPibDL4XbTA9wnhZCpCeK0bFg07Pf2cw&s", category: "อื่นๆ", datetime_in: "ต.ค. 4 เม.ย. 68 14:19 น.", datetime_out: "ต.ค. 4 เม.ย. 68 14:19 น.", location: "914 ถนน ตาดคำ", responsible_unit: "ทีมพัฒนา", status: "รอรับเรื่อง", rating: null },
  { id: "#2025-ETNEZE", detail: "มีต้นไม้กีดขวาง ทางเดิน...", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_bRmXqJQOpLMvoKvL89IYlHse2LioPsA8sQ&s", category: "ต้นไม้", datetime_in: "พฤ. 13 มี.ค. 68 16:08 น.", datetime_out: "ต.ค. 3 ส.ค. 69 15:23 น.", location: "460 หมู่ 12 ถนน มิตรภาพ", responsible_unit: "ทีมพัฒนา", status: "เสร็จสิ้น", rating: 4 },
];

// Dropdown Data
const cardsData = {
  "แผนที่": [{ icon: <FaMapMarkedAlt />, label: "แผนที่สาธารณะ" }, { icon: <FaMapMarkedAlt />, label: "แผนที่ภายใน" }],
  "รายการแจ้ง": [{ icon: <FaClipboardList />, label: "เฉพาะหน่วยงาน" }, { icon: <FaClipboardList />, label: "รายการแจ้งรวม" }],
  "สถิติ": [{ icon: <FaChartBar />, label: "สถิติ" }, { icon: <FaChartBar />, label: "สถิติองค์กร" }],
  "ตั้งค่า": [{ icon: <FaCog />, label: "ตั้งค่า" }, { icon: <FaCog />, label: "QRCode หน่วยงาน" }, { icon: <FaCog />, label: "QRCode สร้างเอง" }]
};

// Date Filter
const DateFilter = () => {
  const [show, setShow] = useState(false);
  const [date, setDate] = useState(null);
  const formatDate = d => d ? d.toLocaleDateString() : "กดเพื่อเลือกช่วงเวลา";
  return (
    <div style={{ position: "relative" }}>
      <button className="time-range-button" onClick={() => setShow(!show)}>{formatDate(date)}</button>
      {show && (
        <div className="calendar-popup">
          <Calendar onChange={d => { setDate(d); setShow(false); }} value={date || new Date()} />
        </div>
      )}
    </div>
  );
};

// Report Table
const ReportTable = () => (
  <div className="report-table-container">
    {/* ... เหมือนเดิม ... */}
  </div>
);

const Home = () => {
  const [activeTab, setActiveTab] = useState("รายการแจ้ง");
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const tabs = ["แผนที่", "หน่วยงาน", "รายการแจ้ง", "สถิติ", "ตั้งค่า"];
  const toggleDropdown = tab => setDropdownOpen(dropdownOpen === tab ? null : tab);
  const navigate = useNavigate();

  const [organizationInfo, setOrganizationInfo] = useState({
    name: "กำลังโหลด...",
    logo: logo
  });

  useEffect(() => {
    const loadOrganization = async () => {
      try {
        // เช็กหน่วยงานที่เลือกล่าสุด
        const cachedOrg = localStorage.getItem("selectedOrg");
        const lastOrg = localStorage.getItem("lastSelectedOrg");

        if (cachedOrg) {
          // ใช้ selectedOrg ที่เพิ่งเลือกมาจาก Home1
          const org = JSON.parse(cachedOrg);
          setOrganizationInfo({ name: org.name, logo: org.img });
          localStorage.removeItem("selectedOrg"); // ล้างหลังใช้
        } else if (lastOrg) {
          // ไม่มี selectedOrg แต่มี lastSelectedOrg (เคยเลือกครั้งก่อน)
          const org = JSON.parse(lastOrg);
          setOrganizationInfo({ name: org.name, logo: org.img });
        } else {
          // ไม่มีทั้งคู่ → redirect ไปเลือกหน่วยงาน
          navigate("/home1");
          return;
        }
      } catch (error) {
        console.error("Error loading organization:", error);
        setOrganizationInfo({ name: "เกิดข้อผิดพลาด", logo: logo });
      }
    };

    loadOrganization();
  }, [navigate]);

  const handleTabClick = (tab) => {
    if (tab === "หน่วยงาน") {
      navigate("/home1");
    } else {
      setActiveTab(tab);
      toggleDropdown(tab);
    }
  };

  const handleLogout = async () => {
    const accessToken = localStorage.getItem("accessToken");
    try {
      if (accessToken) {
        await fetch(`https://premium-citydata-api-ab.vercel.app/api/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` }
        });
      }
    } catch (error) {
      console.error("Logout backend failed:", error);
    } finally {
      if (liff.isLoggedIn()) liff.logout();
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user_id");
      localStorage.removeItem("selectedOrg");
      navigate("/");
    }
  };

  return (
    <div>
      <div className="top-navigation">
        <div className="logo-section">
          <img
            src={organizationInfo.logo}
            alt="Logo"
            className="logo-img"
            onError={e => { e.target.onerror = null; e.target.src = logo; }}
          />
          <span className="unit-name">{organizationInfo.name}</span>
        </div>

        <nav className="center-menu">
          {tabs.map(tab => (
            <div key={tab} className="menu-wrapper">
              <button
                className={activeTab === tab ? "menu-item active" : "menu-item"}
                onClick={() => handleTabClick(tab)}
              >
                {tab}
                {cardsData[tab] && cardsData[tab].length > 0 &&
                  (dropdownOpen === tab ? <FiChevronUp className="chevron-icon" /> : <FiChevronDown className="chevron-icon" />)}
              </button>
              {dropdownOpen === tab && cardsData[tab] && (
                <div className="dropdown-menu">{cardsData[tab].map((card, i) => (<div className="dropdown-item" key={i}>{card.icon}{card.label}</div>))}</div>
              )}
            </div>
          ))}
        </nav>

        <div className="logout-icon">
          <button onClick={handleLogout}>
            <FaSignOutAlt size={18} />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        {activeTab === "รายการแจ้ง" && <ReportTable />}
      </div>
    </div>
  );
};

export default Home;
