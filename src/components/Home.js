import React, { useState, useEffect, useRef } from "react";
import styles from "./css/Home.module.css";
import logo from "./logo.png"; // fallback logo
import {
  FaMapMarkedAlt,
  FaClipboardList,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
  FaSearch
} from "react-icons/fa";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import liff from "@line/liff";
import "cally";

// ตัวอย่าง Report Data (คงเดิม)
const reportData = [
  { id: "#2025-TYHKE", detail: "ทดลองแจ้งเรื่องฝาท่อระบายน้ำ...", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFmeZPibDL4XbTA9wnhZCpCeK0bFg07Pf2cw&s", category: "อื่นๆ", datetime_in: "ต.ค. 4 เม.ย. 68 14:19 น.", datetime_out: "ต.ค. 4 เม.ย. 68 14:19 น.", location: "914 ถนน ตาดคำ", responsible_unit: "ทีมพัฒนา", status: "รอรับเรื่อง", rating: null },
  { id: "#2025-ETNEZE", detail: "มีต้นไม้กีดขวาง ทางเดิน...", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_bRmXqJQOpLMvoKvL89IYlHse2LioPsA8sQ&s", category: "ต้นไม้", datetime_in: "พฤ. 13 มี.ค. 68 16:08 น.", datetime_out: "ต.ค. 3 ส.ค. 69 15:23 น.", location: "460 หมู่ 12 ถนน มิตรภาพ", responsible_unit: "ทีมพัฒนา", status: "เสร็จสิ้น", rating: 4 },
];

// Dropdown Data (คงเดิม)
const cardsData = {
  "แผนที่": [{ icon: <FaMapMarkedAlt />, label: "แผนที่สาธารณะ" }, { icon: <FaMapMarkedAlt />, label: "แผนที่ภายใน" }],
  "รายการแจ้ง": [{ icon: <FaClipboardList />, label: "เฉพาะหน่วยงาน" }, { icon: <FaClipboardList />, label: "รายการแจ้งรวม" }],
  "สถิติ": [{ icon: <FaChartBar />, label: "สถิติ" }, { icon: <FaChartBar />, label: "สถิติองค์กร" }],
  "ตั้งค่า": [{ icon: <FaCog />, label: "ตั้งค่า" }, { icon: <FaCog />, label: "QRCode หน่วยงาน" }, { icon: <FaCog />, label: "QRCode สร้างเอง" }]
};

// Helper function สำหรับ <calendar-date> (คงเดิม)
const toYYYYMMDD = (d) => d ? d.toISOString().split('T')[0] : null;

// Date Filter component (คงเดิม)
const DateFilter = () => {
  const [show, setShow] = useState(false);
  const [date, setDate] = useState(new Date()); 
  const calendarRef = useRef(null);
  const formatDate = d => d ? d.toLocaleDateString('th-TH') : "กดเพื่อเลือกช่วงเวลา";

  useEffect(() => {
    const node = calendarRef.current;
    if (node && show) {
      const handleChange = (e) => {
        setDate(new Date(e.target.value));
        setShow(false);
      };
      node.addEventListener('change', handleChange);
      return () => node.removeEventListener('change', handleChange);
    }
  }, [show]);

  return (
    <div style={{ position: "relative" }}>
      <button className={styles.timeRangeButton} onClick={() => setShow(!show)}>{formatDate(date)}</button>
      {show && (
        <div className={styles.calendarPopup}>
          <calendar-date
            ref={calendarRef}
            value={toYYYYMMDD(date)}
            className="cally bg-base-100 border border-base-300 shadow-lg rounded-box"
          >
            <svg aria-label="Previous" className="fill-current size-4" slot="previous" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M15.75 19.5 8.25 12l7.5-7.5"></path></svg>
            <svg aria-label="Next" className="fill-current size-4" slot="next" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="m8.25 4.5 7.5 7.5-7.5 7.5"></path></svg>
            <calendar-month></calendar-month>
          </calendar-date>
        </div>
      )}
    </div>
  );
};

// Report Table component (ปรับปรุงโครงสร้าง JSX)
const ReportTable = () => (
  <>
    {/* 1. Search Input */}
    <div className={styles.searchTop}>
      <div className={styles.searchInputContainer}>
        <input type="text" placeholder="ใส่คำที่ต้องการค้นหา" />
        <FaSearch className={styles.searchIcon} />
      </div>
    </div>
    
    {/* 2. Filters Group */}
    <div className={styles.reportFilters}>
      {/* Filters Row 1 */}
      {["ประเภท", "สถานะ", "หน่วยงาน", "ช่วงเวลา"].map((label, i) => (
        <div className={styles.filterGroup} key={i}>
          <label>{label}</label>
          {label === "ช่วงเวลา" ? <DateFilter /> : <select defaultValue="all"><option value="all">ทั้งหมด</option></select>}
        </div>
      ))}
      {/* Filters Row 2 */}
      {["จังหวัด", "อำเภอ/เขต", "ตำบล/แขวง"].map((label, i) => (
        <div key={i} className={`${styles.filterGroup}`}>
          <label>{label}</label>
          <select defaultValue="all"><option value="all">ทั้งหมด</option></select>
        </div>
      ))}
    </div>
    
    {/* 3. Report Summary (ย้ายลงมาอยู่ใต้ Filter) */}
    <div className={styles.reportSummary}>เรื่อง <strong>(71 รายการ)</strong> 100% จากทุกรายการ</div>
    
    {/* 4. Report Cards Container */}
    <div className={styles.reportTableContainer}>
      {/* ลบ reportTableHeader ออกเพราะใช้ Card View */}
      {reportData.map(report => (
        <div key={report.id} className={styles.reportTableRow}>
          {/* ส่วนของ Card Layout - ต้องตรงกับ Grid/Area ที่กำหนดใน CSS */}

          {/* Row 1: Image, Header, Status */}
          <img src={report.image} alt="Report" className={styles.reportImage} />
          
          {/* Header/ID (Grid Area: header) */}
          <div className={styles.reportHeader}>
            <span className={styles.reportIdText}>{report.id}</span>
            <p className={styles.reportDetailText}>{report.detail}</p>
          </div>
          
          {/* Status/Rating (Grid Area: status) */}
          <div className={styles.reportStatusGroup}>
            <span className={`${styles.statusTag} ${report.status === "รอรับเรื่อง" ? styles.pending : styles.completed}`}>{report.status}</span>
            <div className={styles.rating}>
                {report.rating && [...Array(5)].map((_, i) => (
                <span key={i} className={`${styles.ratingStar} ${i < report.rating ? styles.active : ""}`}>★</span>
                ))}
            </div>
          </div>
          
          {/* Details (Grid Area: details) - จัดกลุ่มข้อมูลรอง */}
          <div className={styles.mainDetails}>
            <span className={styles.dateTimeItem}>ประเภท: {report.category}</span>
            <span className={styles.dateTimeItem}>แจ้งเข้า: {report.datetime_in}</span>
            <span className={styles.dateTimeItem}>อัพเดต: {report.datetime_out}</span>
            {/* Note: ต้องปรับ CSS ใน .mainDetails ให้แสดงผลหลายคอลัมน์ */}
          </div>

          {/* Location (Grid Area: location) */}
          <div className={styles.locationDetails}>
            <span className={styles.locationItem}>ที่ตั้ง: {report.location}</span>
            <span className={styles.locationItem}>ผู้รับผิดชอบ: {report.responsible_unit}</span>
          </div>

        </div>
      ))}
    </div>
  </>
);

// Main Home component (คงเดิม)
const Home = () => {
  const [activeTab, setActiveTab] = useState("รายการแจ้ง");
  const tabs = ["แผนที่", "หน่วยงาน" ,"รายการแจ้ง", "สถิติ", "ตั้งค่า"];
  const navigate = useNavigate();
  const [organizationInfo, setOrganizationInfo] = useState({ name: "กำลังโหลด...", logo: logo });

  // ... (useEffect และ handleLogout โค้ดเดิม) ...
  useEffect(() => {
    const fetchOrg = async () => {
      try {
        const cachedOrg = localStorage.getItem("selectedOrg");
        const lastOrg = localStorage.getItem("lastSelectedOrg");
        if (cachedOrg) {
          const org = JSON.parse(cachedOrg);
          setOrganizationInfo({ name: org.name, logo: org.img });
          localStorage.removeItem("selectedOrg");
          localStorage.setItem("lastSelectedOrg", JSON.stringify(org));
        } else if (lastOrg) {
          const org = JSON.parse(lastOrg);
          setOrganizationInfo({ name: org.name, logo: org.img });
        } else {
          const userId = localStorage.getItem("user_id");
          const accessToken = localStorage.getItem("accessToken");
          if (!userId || !accessToken) throw new Error("ไม่พบ User ID หรือ Token");
          const res = await fetch(`https://premium-citydata-api-ab.vercel.app/api/users_organizations?user_id=${userId}`, { headers: { 'Authorization': `Bearer ${accessToken}` } });
          const data = await res.json();
          if (data && data.length > 0) {
            const firstOrg = data[0];
            setOrganizationInfo({ name: firstOrg.organization_name, logo: firstOrg.url_logo });
            localStorage.setItem("lastSelectedOrg", JSON.stringify({ name: firstOrg.organization_name, img: firstOrg.url_logo }));
          } else setOrganizationInfo({ name: "ไม่พบหน่วยงาน", logo: logo });
        }
      } catch (error) {
        console.error(error);
        setOrganizationInfo({ name: "เกิดข้อผิดพลาด", logo: logo });
      }
    };
    fetchOrg();
  }, []);

  const handleTabClick = (tab) => {
    setActiveTab(tab); // แก้ตรงนี้ให้ทุกปุ่มมี active
    if (tab === "หน่วยงาน") navigate("/home1");
  };

  const handleLogout = async () => {
    const accessToken = localStorage.getItem("accessToken");
    const userId = localStorage.getItem("user_id");
    try { if (accessToken && userId) await fetch("https://premium-citydata-api-ab.vercel.app/api/logout", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` }, body: JSON.stringify({ user_id: userId }) }); } catch (e) { console.error(e); }
    if (liff.isLoggedIn()) liff.logout();
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user_id");
    localStorage.removeItem("selectedOrg");
    navigate("/");
  };
  
  return (
    <div>
      <div className={styles.logoSectionTop}>
        <img src={organizationInfo.logo} alt="Logo" className={styles.logoImg} onError={e => { e.target.onerror = null; e.target.src = logo; }} />
        <span className={styles.unitName}>{organizationInfo.name}</span>

        {/* Logout อยู่ขวาสุด TopNavigation */}
        <div className={styles.logoutIcon}>
          <button onClick={handleLogout}><FaSignOutAlt size={18} /><span>ออกจากระบบ</span></button>
        </div>
      </div>



      {/* Dashboard content */}
      <div className={styles.dashboardContent}>
        {activeTab === "รายการแจ้ง" && <ReportTable />}
      </div>

      {/* Bottom navbar */}
      <div className={styles.bottomNav}>
        {tabs.map(tab => (
          <button key={tab} className={activeTab === tab ? styles.active : ""} onClick={() => handleTabClick(tab)}>
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Home;
