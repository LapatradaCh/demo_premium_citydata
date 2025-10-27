import React, { useState, useEffect, useRef } from "react";
import styles from "./css/Home.module.css";
import logo from "./logo.png"; // ใช้เป็น fallback
import {
  FaMapMarkedAlt, FaClipboardList, FaChartBar, FaCog, FaSignOutAlt, FaSearch
} from "react-icons/fa";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

// 1. Import LIFF เข้ามา
import liff from "@line/liff";

// 2. Import Cally (Web Component)
import "cally";

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

// Helper function เพื่อแปลง Date object เป็น string "YYYY-MM-DD"
// เพราะ <calendar-date> ต้องการค่า value ใน format นี้
const toYYYYMMDD = (d) => {
  if (!d) return null;
  // ใช้ toISOString() แล้วตัดเอาเฉพาะส่วนวันที่
  return d.toISOString().split('T')[0];
};

// Date Filter (ปรับปรุงใหม่เพื่อใช้ Cally และ default วันปัจจุบัน)
const DateFilter = () => {
  const [show, setShow] = useState(false);
  // ตั้งค่าเริ่มต้น (useState) ให้เป็นวันปัจจุบัน
  const [date, setDate] = useState(new Date()); 
  const calendarRef = useRef(null); // สร้าง Ref เพื่ออ้างอิงถึง web component

  const formatDate = d => d ? d.toLocaleDateString('th-TH') : "กดเพื่อเลือกช่วงเวลา";

  // ใช้ useEffect เพื่อเพิ่ม Event Listener ให้กับ web component
  useEffect(() => {
    const node = calendarRef.current;

    if (node && show) {
      // เมื่อ web component มีการ 'change' (เลือกวัน)
      const handleChange = (e) => {
        // e.target.value จะเป็นค่าวันที่ (เช่น "2025-10-23")
        const selectedDate = new Date(e.target.value);
        setDate(selectedDate);
        setShow(false); // ซ่อนปฏิทิน
      };

      node.addEventListener('change', handleChange);

      // Cleanup function: ลบ listener ออกเมื่อ component หายไป
      return () => {
        node.removeEventListener('change', handleChange);
      };
    }
  }, [show]); // ให้ Effect นี้ทำงานใหม่ทุกครั้งที่ 'show' เปลี่ยนค่า

  return (
    <div style={{ position: "relative" }}>
      <button className="time-range-button" onClick={() => setShow(!show)}>{formatDate(date)}</button>
      {show && (
        <div className="calendar-popup">
          <calendar-date
            ref={calendarRef} // ผูก Ref เข้ากับ element
            value={toYYYYMMDD(date)} // ส่ง props 'value' ที่เป็น format "YYYY-MM-DD"
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

const ReportTable = () => (
  <div className={styles.reportTableContainer}>
    <div className={styles.searchTop}>
      <div className={styles.searchInputContainer}>
        <input type="text" placeholder="ใส่คำที่ต้องการค้นหา" />
        <FaSearch className={styles.searchIcon} />
      </div>
    </div>

    <div className={styles.reportFilters}>
      {["ประเภท", "สถานะ", "หน่วยงาน", "ช่วงเวลา"].map((label, i) => (
        <div className={styles.filterGroup} key={i}>
          <label>{label}</label>
          {label === "ช่วงเวลา" ? (
            <DateFilter />
          ) : (
            <select defaultValue="all">
              <option value="all">ทั้งหมด</option>
            </select>
          )}
        </div>
      ))}

      {["จังหวัด", "อำเภอ/เขต", "ตำบล/แขวง"].map((label, i) => (
        <div key={i} className={`${styles.filterGroup} ${styles.lowerRow}`}>
          <label>{label}</label>
          <select defaultValue="all">
            <option value="all">ทั้งหมด</option>
          </select>
        </div>
      ))}
    </div>

    <div className={styles.reportSummary}>
      เรื่อง <strong>(71 รายการ)</strong> 100% จากทุกรายการ
    </div>

    <div className={styles.reportTableHeader}>
      <div className={`${styles.headerCell} ${styles.reportId}`}></div>
      <div className={`${styles.headerCell} ${styles.imageCol}`}>รูป</div>
      <div className={`${styles.headerCell} ${styles.categoryCol}`}>ประเภท</div>
      <div className={`${styles.headerCell} ${styles.datetimeCol} ${styles.sortable}`}>วัน/เวลา</div>
      <div className={`${styles.headerCell} ${styles.updatedCol} ${styles.sortable}`}>อัพเดต</div>
      <div className={`${styles.headerCell} ${styles.locationCol}`}>ตำแหน่ง</div>
      <div className={`${styles.headerCell} ${styles.unitCol}`}>รับผิดชอบปัจจุบัน</div>
      <div className={`${styles.headerCell} ${styles.statusCol}`}>สถานะ</div>
    </div>

    {reportData.map(report => (
      <div key={report.id} className={styles.reportTableRow}>
        <div className={`${styles.rowCell} ${styles.detailId}`}>
          <span className={styles.reportIdText}>{report.id}</span>
          <p className={styles.reportDetailText}>{report.detail}</p>
        </div>
        <div className={`${styles.rowCell} ${styles.imageCol}`}>
          <img src={report.image} alt="Report" className={styles.reportImage} />
        </div>
        <div className={`${styles.rowCell} ${styles.categoryCol}`}>{report.category}</div>
        <div className={`${styles.rowCell} ${styles.datetimeCol}`}>{report.datetime_in}</div>
        <div className={`${styles.rowCell} ${styles.updatedCol}`}>{report.datetime_out}</div>
        <div className={`${styles.rowCell} ${styles.locationCol}`}>{report.location}</div>
        <div className={`${styles.rowCell} ${styles.unitCol}`}>{report.responsible_unit}</div>
        <div className={`${styles.rowCell} ${styles.statusCol}`}>
          <span className={`${styles.statusTag} ${report.status === "รอรับเรื่อง" ? styles.pending : styles.completed}`}>
            {report.status}
          </span>
          {report.rating && (
            <div className={styles.rating}>
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`${styles.ratingStar} ${i < report.rating ? styles.active : ""}`}
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
    const fetchOrganizationInfo = async () => {
      try {
        // 1. ตรวจสอบว่า user เคยเลือกหน่วยงานล่าสุดหรือไม่
        const cachedOrg = localStorage.getItem("selectedOrg");
        const lastOrg = localStorage.getItem("lastSelectedOrg");

        if (cachedOrg) {
          // 1.1 ถ้ามีค่า selectedOrg จากหน้า Home1: ใช้ค่าเลย
          const org = JSON.parse(cachedOrg);
          setOrganizationInfo({
            name: org.name,
            logo: org.img
          });
          // ล้าง selectedOrg หลังจากใช้แล้ว
          localStorage.removeItem("selectedOrg");

          // เก็บเป็น lastSelectedOrg เผื่อเปิดหน้าใหม่ครั้งต่อไป
          localStorage.setItem("lastSelectedOrg", JSON.stringify(org));

        } else if (lastOrg) {
          // 1.2 ถ้าไม่มี selectedOrg แต่มี lastSelectedOrg (จำหน่วยงานล่าสุด)
          const org = JSON.parse(lastOrg);
          setOrganizationInfo({
            name: org.name,
            logo: org.img
          });

        } else {
          // 1.3 ถ้าไม่มีค่าใน localStorage เลย: fetch API หาหน่วยงานแรก
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
            setOrganizationInfo({
              name: firstOrg.organization_name,
              logo: firstOrg.url_logo
            });

            // เก็บเป็น lastSelectedOrg เผื่อเปิดหน้าใหม่
            localStorage.setItem("lastSelectedOrg", JSON.stringify({
              name: firstOrg.organization_name,
              img: firstOrg.url_logo
            }));
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


  // ฟังก์ชันใหม่สำหรับจัดการการคลิกแท็บ
  const handleTabClick = (tab) => {
    if (tab === "หน่วยงาน") {
      // 1. ถ้าคลิก "หน่วยงาน" ให้ navigate กลับไปหน้าหลัก (หน้าเลือกหน่วยงาน)
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
      // Step 1: Notify the backend (only if a token exists)
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
      // It's okay if the backend call fails. We still want to log the user out on the client-side.
      console.error("Failed to notify backend, but proceeding with client-side logout.", error);
    } finally {
      // Step 2: Perform client-side logout actions (this block ALWAYS runs)
      console.log("Executing client-side cleanup.");

      // Logout from LIFF if the user is logged in via LIFF
      if (liff.isLoggedIn()) {
        liff.logout();
      }

      // ALWAYS remove the token from local storage, regardless of login method
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user_id"); // เคลียร์ user_id ด้วย
      localStorage.removeItem("selectedOrg"); // เคลียร์ค่าที่เลือกไว้ด้วย

      // ALWAYS navigate the user back to the login page for a consistent experience
      navigate("/"); // Or '/login'
    }
  };


return (
  <div>
    <div className={styles.topNavigation}>
      <div className={styles.logoSection}>
        <img
          src={organizationInfo.logo}
          alt="Logo"
          className={styles.logoImg}
          onError={(e) => { e.target.onerror = null; e.target.src = logo; }}
        />
        <span className={styles.unitName}>{organizationInfo.name}</span>
      </div>

      <nav className={styles.centerMenu}>
        {tabs.map(tab => (
          <div key={tab} className={styles.menuWrapper}>
            <button
              className={`${styles.menuItem} ${activeTab === tab ? styles.active : ""}`}
              onClick={() => handleTabClick(tab)}
            >
              {tab}
              {cardsData[tab] && cardsData[tab].length > 0 &&
                (dropdownOpen === tab
                  ? <FiChevronUp className={styles.chevronIcon} />
                  : <FiChevronDown className={styles.chevronIcon} />
                )
              }
            </button>
            {dropdownOpen === tab && cardsData[tab] && (
              <div className={styles.dropdownMenu}>
                {cardsData[tab].map((card, i) => (
                  <div className={styles.dropdownItem} key={i}>
                    {card.icon}{card.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className={styles.logoutIcon}>
        <button onClick={handleLogout}>
          <FaSignOutAlt size={18} />
          <span>ออกจากระบบ</span>
        </button>
      </div>
    </div> {/* <-- ปิด topNavigation */}

    <div className={styles.dashboardContent}>
      {activeTab === "รายการแจ้ง" && <ReportTable />}
     </div>
    </div>
  );
};

export default Home;
