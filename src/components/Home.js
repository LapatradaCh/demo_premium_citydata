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
  { id:"#2025-TYHKE", detail:"ทดลองแจ้งเรื่องฝาท่อระบายน้ำ...", image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFmeZPibDL4XbTA9wnhZCpCeK0bFg07Pf2cw&s", category:"อื่นๆ", datetime_in:"ต.ค. 4 เม.ย. 68 14:19 น.", datetime_out:"ต.ค. 4 เม.ย. 68 14:19 น.", location:"914 ถนน ตาดคำ", responsible_unit:"ทีมพัฒนา", status:"รอรับเรื่อง", rating:null },
  { id:"#2025-ETNEZE", detail:"มีต้นไม้กีดขวาง ทางเดิน...", image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_bRmXqJQOpLMvoKvL89IYlHse2LioPsA8sQ&s", category:"ต้นไม้", datetime_in:"พฤ. 13 มี.ค. 68 16:08 น.", datetime_out:"ต.ค. 3 ส.ค. 69 15:23 น.", location:"460 หมู่ 12 ถนน มิตรภาพ", responsible_unit:"ทีมพัฒนา", status:"เสร็จสิ้น", rating:4 },
];

// Dropdown Data
const cardsData = {
  "แผนที่":[{ icon:<FaMapMarkedAlt />, label:"แผนที่สาธารณะ" },{ icon:<FaMapMarkedAlt />, label:"แผนที่ภายใน" }],
  "รายการแจ้ง":[{ icon:<FaClipboardList />, label:"เฉพาะหน่วยงาน" },{ icon:<FaClipboardList />, label:"รายการแจ้งรวม" }],
  "สถิติ":[{ icon:<FaChartBar />, label:"สถิติ" },{ icon:<FaChartBar />, label:"สถิติองค์กร" }],
  "ตั้งค่า":[{ icon:<FaCog />, label:"ตั้งค่า" },{ icon:<FaCog />, label:"QRCode หน่วยงาน" },{ icon:<FaCog />, label:"QRCode สร้างเอง" }]
};

// Date Filter
const DateFilter = () => {
  const [show,setShow] = useState(false);
  const [date,setDate] = useState(null);
  const formatDate = d => d ? d.toLocaleDateString() : "กดเพื่อเลือกช่วงเวลา";
  return (
    <div style={{position:"relative"}}>
      <button className="time-range-button" onClick={()=>setShow(!show)}>{formatDate(date)}</button>
      {show && (
        <div className="calendar-popup">
          <Calendar onChange={d=>{setDate(d); setShow(false);}} value={date||new Date()} />
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
      {["ประเภท","สถานะ","หน่วยงาน","ช่วงเวลา"].map((label,i)=>(
        <div className="filter-group" key={i}>
          <label>{label}</label>
          {label==="ช่วงเวลา"?<DateFilter/>:<select defaultValue="all"><option value="all">ทั้งหมด</option></select>}
        </div>
      ))}
      {["จังหวัด","อำเภอ/เขต","ตำบล/แขวง"].map((label,i)=>(
        <div className="filter-group lower-row" key={i}>
          <label>{label}</label>
          <select defaultValue="all"><option value="all">ทั้งหมด</option></select>
        </div>
      ))}
    </div>

    <div className="report-summary">เรื่อง <strong>(71 รายการ)</strong> 100% จากทุกรายการ</div>

    <div className="report-table-header">
      <div className="header-cell report-id"></div>
      <div className="header-cell image-col">รูป</div>
      <div className="header-cell category-col">ประเภท</div>
      <div className="header-cell datetime-col sortable">วัน/เวลา</div>
      <div className="header-cell updated-col sortable">อัพเดต</div>
      <div className="header-cell location-col">ตำแหน่ง</div>
      <div className="header-cell unit-col">รับผิดชอบปัจจุบัน</div>
      <div className="header-cell status-col">สถานะ</div>
    </div>

    {reportData.map(report=>(
      <div key={report.id} className="report-table-row">
        <div className="row-cell detail-id">
          <span className="report-id-text">{report.id}</span>
          <p className="report-detail-text">{report.detail}</p>
        </div>
        <div className="row-cell image-col"><img src={report.image} alt="Report" className="report-image"/></div>
        <div className="row-cell category-col">{report.category}</div>
        <div className="row-cell datetime-col">{report.datetime_in}</div>
        <div className="row-cell updated-col">{report.datetime_out}</div>
        <div className="row-cell location-col">{report.location}</div>
        <div className="row-cell unit-col">{report.responsible_unit}</div>
        <div className="row-cell status-col">
          <span className={`status-tag ${report.status==="รอรับเรื่อง"?"pending":"completed"}`}>{report.status}</span>
          {report.rating && (
            <div className="rating">
              {[...Array(5)].map((_, i) => (
                <span 
                  key={i} 
                  className={`rating-star ${i < report.rating ? 'active' : ''}`}
                >
                  ★
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    ))}
  </div>
);

// Dashboard
const Dashboard = () => {
  const [activeTab,setActiveTab] = useState("รายการแจ้ง");
  const [dropdownOpen,setDropdownOpen] = useState(null);
  const tabs = ["แผนที่","หน่วยงาน","รายการแจ้ง","สถิติ","ตั้งค่า"];
  const toggleDropdown = tab => setDropdownOpen(dropdownOpen===tab?null:tab);

  const navigate = useNavigate();

  // --- vvv เพิ่ม State สำหรับเก็บข้อมูลหน่วยงาน vvv ---
  const [organizationInfo, setOrganizationInfo] = useState({
    name: "กำลังโหลด...",
    logo: logo // ใช้ logo ที่ import มาเป็นค่าเริ่มต้น
  });
  // --- ^^^ สิ้นสุดส่วนที่เพิ่ม State ^^^ ---


  // --- vvv เพิ่ม useEffect เพื่อดึงข้อมูลหน่วยงาน vvv ---
  useEffect(() => {
    const fetchOrganizationInfo = async () => {
      try {
        const userId = localStorage.getItem("user_id");
        const accessToken = localStorage.getItem("accessToken");

        if (!userId || !accessToken) {
          console.warn("ไม่พบ User ID หรือ Token, ไม่สามารถดึงข้อมูลหน่วยงานได้");
          setOrganizationInfo({ name: "ไม่พบข้อมูล", logo: logo });
          return;
        }

        const apiUrl = `https://premium-citydata-api-ab.vercel.app/api/users_organizations?user_id=${userId}`;

        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${accessToken}`, // สำคัญ: ต้องใส่ Token
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error("Failed to fetch organization info");
        }

        const data = await response.json();

        // **สมมติฐาน**: เราใช้ข้อมูลหน่วยงาน "แรก" ที่ user สังกัดอยู่
        if (data && data.length > 0) {
          const firstOrg = data[0];
          setOrganizationInfo({
            name: firstOrg.organization_name,
            logo: firstOrg.url_logo // (จากตาราง view_user_org_details)
          });
        } else {
          setOrganizationInfo({ name: "ไม่พบหน่วยงาน",
