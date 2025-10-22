import React, { useState, useEffect } from "react";
import "./Home.css";
import logo from "./logo.png"; // ใช้เป็น fallback
import {
  FaMapMarkedAlt, FaClipboardList, FaChartBar, FaCog, FaSignOutAlt, FaSearch
} from "react-icons/fa";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import { useNavigate } from "react-router-dom";

// 1. Import LIFF เข้ามา
import liff from "@line/liff";

// ตัวอย่าง Report Data
const reportData = [
  { id: "#2025-TYHKE", detail: "ทดลองแจ้งเรื่องฝาท่อระบายน้ำ...", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFmeZPibDL4XbTA9wnhZCpCeK0bFg07Pf2cw&s", category: "อื่นๆ", datetime_in: "ต.ค. 4 เม.ย. 68 14:19 น.", datetime_out: "ต.ค. 4 เม.ย. 68 14:19 น.", location: "914 ถนน ตาดคำ", responsible_unit: "ทีมพัฒนา", status: "รอรับเรื่อง", rating: null },
  { id: "#2025-ETNEZE", detail: "มีต้นไม้กีดขวาง ทางเดิน...", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_bRmXqJQOpLMvoKvL89IYlHse2LioPsA8sQ&s", category: "ต้นไม้", datetime_in: "พฤ. 13 มี.ค. 68 16:08 น.", datetime_out: "ต.ค. 3 ส.ค. 69 15:23 น.", location: "460 หมู่ 12 ถนน มิตรภาพ", responsible_unit: "ทีมพัฒนา", status: "เสร็จสิ้น", rating: 4 },
];

// Dropdown Data
const cardsData = {
  "แผนที่": [{ icon: <FaMapMarkedAlt />, label: "แผนที่สาธารณะ" }, { icon: <FaMapMarkedAlt />, label: "แผนที่ภายใน" }],
  "รายการแจ้ง": [
    { icon: <FaClipboardList />, label: "เฉพาะหน่วยงาน", path: "/home1" }, // <-- เพิ่ม path
    { icon: <FaClipboardList />, label: "รายการแจ้งรวม" }
  ],
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
    <div className="search-top">
      <div className="search-input-container">
        <input type="text" placeholder="ใส่คำที่ต้องการค้นหา" />
        <FaSearch className="search-icon" /> {/* เพิ่มไอคอนค้นหา */}
      </div>
    </div>

    <div className="report-filters">
      {["ประเภท", "สถานะ", "หน่วยงาน", "ช่วงเวลา"].map((label, i) => (
        <div className="filter-group" key={i}>
          <label>{label}</label>
          {label === "ช่วงเวลา" ? <DateFilter /> : <select defaultValue="all"><option value="all">ทั้งหมด</option></select>}
        </div>
      ))}
      {["จังหวัด", "อำเภอ/เขต", "ตำบล/แขวง"].map((label, i) => (
        <div className="filter-group lower-row" key={i}>
          <label>{label}</label>
          <select defaultValue="all"><option value="all">ทั้งหมด</option></select>
        </div>
      ))}
    </div>

    <div className="report-summary">เรื่อง <strong>(71 รายการ)</strong> 100% จากทุกรายการ</div>

    <div className="report-table-header">
      {/* ... (Header cells) ... */}
    </div>

    {reportData.map(report => (
      <div key={report.id} className="report-table-row">
        {/* ... (Row cells) ... */}
      </div>
    ))}
  </div>
);

// Dashboard
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


  // --- vvv นี่คือ Logic UX ที่ดีขึ้น vvv ---
  useEffect(() => {
    const fetchOrganizationInfo = async () => {
      try {
        // 1. ตรวจสอบว่ามีข้อมูลที่ "เคยเลือกไว้" หรือไม่
        const cachedOrg = localStorage.getItem("selectedOrg");

        if (cachedOrg) {
          // 1.1 ถ้ามี: ใช้ข้อมูลนั้นเลย
          const org = JSON.parse(cachedOrg);
          setOrganizationInfo({
            name: org.name,
            logo: org.img // Home.js (Dashboard) ใช้ 'logo', Home1 (Selector) ใช้ 'img'
          });
          // ** ไม่ต้องลบ localStorage.removeItem("selectedOrg") **

        } else {
          // 1.2 ถ้าไม่มี: (เข้าครั้งแรก หรือเพิ่ง Logout)
          const userId = localStorage.getItem("user_id");
          const accessToken = localStorage.getItem("accessToken");

          if (!userId || !accessToken) {
            throw new Error("ไม่พบ User ID หรือ Token");
          }

          const apiUrl = `https://premium-citydata-api-ab.vercel.app/api/users_organizations?user_id=${userId}`;

          const response = await fetch(apiUrl, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) throw new Error("Failed to fetch organization info");

          const data = await response.json();

          if (data && data.length > 0) {
            const firstOrg = data[0]; // ใช้หน่วยงานแรกเป็น default
            
            // สร้าง object มาตรฐานที่จะใช้ทั้ง set state และ save cache
            const defaultOrgForState = {
              name: firstOrg.organization_name,
              logo: firstOrg.url_logo
            };
            
            // สร้าง object มาตรฐานสำหรับ cache (ให้เหมือนกับที่ Home1 สร้าง)
            const defaultOrgForCache = {
              id: firstOrg.organization_id,
              name: firstOrg.organization_name,
              img: firstOrg.url_logo // ใช้ 'img'
            };

            setOrganizationInfo(defaultOrgForState);
            
            // 3. บันทึกค่า Default นี้ไว้ใน localStorage
            localStorage.setItem("selectedOrg", JSON.stringify(defaultOrgForCache));
          } else {
            setOrganizationInfo({ name: "ไม่พบหน่วยงาน", logo: logo });
          }
        }
      } catch (error) {
        console.error("Error fetching organization info:", error);
        setOrganizationInfo({ name: "เกิดข้อผิดพลาด", logo: logo });
      }
    };

    fetchOrganizationInfo();
  }, []); // [] หมายถึงให้รันแค่ครั้งเดียวตอนโหลด
  // --- ^^^ สิ้นสุด Logic UX ที่ดีขึ้น ^^^ ---

  
  // ฟังก์ชันสำหรับจัดการการคลิกแท็บ
  const handleTabClick = (tab) => {
    if (tab === "หน่วยงาน") {
      // 1. ถ้าคลิก "หน่วยงาน" ให้ navigate กลับไปหน้า (หน้าเลือกหน่วยงาน)
      navigate("/home1");
    } else {
      // 2. ถ้าเป็นแท็บอื่น ให้ทำงานตามปกติ (เปิด/ปิด dropdown และตั้ง active tab)
      setActiveTab(tab);
      toggleDropdown(tab);
    }
  };


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

      // ** ลบทุกอย่างที่เกี่ยวข้องกับ Session **
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user_id");
      localStorage.removeItem("selectedOrg"); // <-- **ลบค่าที่จำไว้ตอน Logout**

      navigate("/"); 
    }
  };

  // ฟังก์ชันสำหรับจัดการการคลิก Dropdown
  const handleDropdownClick = (card) => {
    setDropdownOpen(null); // ปิด dropdown
    if (card.path) {
      navigate(card.path); // สั่งให้ย้ายหน้า
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
            onError={(e) => { e.target.onerror = null; e.target.src = logo; }}
          />
          <span className="unit-name">{organizationInfo.name}</span>
        </div>

        <nav className="center-menu">
          {tabs.map(tab => (
            <div key={tab} className="menu-wrapper">
              
              <button 
                className={activeTab === tab ? "menu-item active" : "menu-item"} 
                onClick={() => handleTabClick(tab)} // <-- ใช้ฟังก์ชันใหม่
              >
                {tab}
                {cardsData[tab] && cardsData[tab].length > 0 && (dropdownOpen === tab ? <FiChevronUp className="chevron-icon" /> : <FiChevronDown className="chevron-icon" />)}
              </button>

              {/* ส่วน Dropdown ที่แก้ไขแล้ว */}
              {dropdownOpen === tab && cardsData[tab] && (
                <div className="dropdown-menu">{cardsData[tab].map((card, i) => (
                  <div
                    className="dropdown-item"
                    key={i}
                    onClick={() => handleDropdownClick(card)} // <-- ใช้ฟังก์ชันใหม่
                  >
                    {card.icon}{card.label}
                  </div>
                ))}</div>
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
