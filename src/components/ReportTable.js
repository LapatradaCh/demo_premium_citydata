import React, { useState, useEffect, useRef } from "react";
import styles from "./css/ReportTable.module.css";
import { FaSearch, FaFilter, FaTimes } from "react-icons/fa";
import "cally";

// ------------------------- Helper
const toYYYYMMDD = (d) => (d ? d.toISOString().split("T")[0] : null);

const truncateText = (text, maxLength) => {
  if (!text) return "";
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + "...";
};

// ------------------------- Date Filter
const DateFilter = () => {
  const [show, setShow] = useState(false);
  const [date, setDate] = useState(new Date());
  const calendarRef = useRef(null);
  const formatDate = (d) =>
    d ? d.toLocaleDateString("th-TH") : "กดเพื่อเลือกช่วงเวลา";

  useEffect(() => {
    const node = calendarRef.current;
    if (node && show) {
      const handleChange = (e) => {
        setDate(new Date(e.target.value));
        setShow(false);
      };
      node.addEventListener("change", handleChange);
      return () => node.removeEventListener("change", handleChange);
    }
  }, [show]);

  return (
    <div style={{ position: "relative" }}>
      <button
        className={styles.timeRangeButton}
        onClick={() => setShow(!show)}
      >
        {formatDate(date)}
      </button>
      {show && (
        <div className={styles.calendarPopup}>
          <calendar-date
            ref={calendarRef}
            value={toYYYYMMDD(date)}
            className="cally bg-base-100 border border-base-300 shadow-lg rounded-box"
          >
            <calendar-month></calendar-month>
          </calendar-date>
        </div>
      )}
    </div>
  );
};

// ------------------------- Report Table
const ReportTable = ({ subTab, onRowClick }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- State สำหรับเก็บตัวเลือกใน Filter ---
  const [issueTypes, setIssueTypes] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]); // ✅ เก็บสถานะที่ได้จาก API

  const isAllReports = subTab === "รายการแจ้งรวม";
  const mainFilters = isAllReports
    ? ["ประเภท", "ช่วงเวลา"]
    : ["ประเภท", "สถานะ", "หน่วยงาน", "ช่วงเวลา"];
  const locationFilters = isAllReports
    ? []
    : ["จังหวัด", "อำเภอ/เขต", "ตำบล/แขวง"];
  const modalTitle = isAllReports
    ? "ตัวกรอง (รายการแจ้งรวม)"
    : "ตัวกรอง (เฉพาะหน่วยงาน)";
  const summaryTitle = isAllReports
    ? "รายการแจ้งรวม"
    : "รายการแจ้งเฉพาะหน่วยงาน";

  // --- 1. Fetch Issue Types (ดึงประเภทปัญหา) ---
  useEffect(() => {
    const fetchIssueTypes = async () => {
      try {
        const res = await fetch("https://premium-citydata-api-ab.vercel.app/api/get_issue_types");
        if (!res.ok) throw new Error("Failed to fetch issue types");
        const data = await res.json();
        
        if (Array.isArray(data)) {
            setIssueTypes(data);
        } else if (data.data && Array.isArray(data.data)) {
            setIssueTypes(data.data);
        } else {
            setIssueTypes([]);
        }
      } catch (err) {
        console.error("Error fetching issue types:", err);
      }
    };
    fetchIssueTypes();
  }, []);

  // --- 2. Fetch Statuses (ดึงสถานะจาก Backend ใหม่ของคุณ) ---
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        // ดึง Organization ID จาก LocalStorage
        const lastOrg = localStorage.getItem("lastSelectedOrg");
        let orgId = null;
        if (lastOrg) {
          const orgData = JSON.parse(lastOrg);
          orgId = orgData.id || orgData.organization_id;
        }

        // สร้าง URL: ถ้ามี Org ID ให้ส่งไปด้วย
        // *** ตรวจสอบ URL API ของคุณให้ถูกต้องนะครับ ***
        const baseUrl = "https://premium-citydata-api-ab.vercel.app/api/get_issue_status"; 
        const url = orgId 
          ? `${baseUrl}?organization_id=${orgId}` 
          : baseUrl;

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch statuses");
        
        const data = await res.json();
        
        // ตรวจสอบ format ข้อมูลที่ API ส่งกลับมา
        if (Array.isArray(data)) {
          setStatusOptions(data);
        } else if (data.data && Array.isArray(data.data)) {
           setStatusOptions(data.data); 
        } else {
           setStatusOptions([]);
        }

      } catch (err) {
        console.error("Error fetching statuses:", err);
        // กรณี Error อาจจะ Set ค่า Default ว่างไว้ หรือ Hardcode กันเหนียว
        setStatusOptions([]);
      }
    };

    // เรียกใช้ฟังก์ชัน
    fetchStatuses();
  }, [subTab]); // เมื่อเปลี่ยน Tab หรือโหลดหน้าใหม่ให้ดึงสถานะด้วย

  // --- 3. Fetch Reports (ดึงข้อมูลเคส) ---
  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true);
        const lastOrg = localStorage.getItem("lastSelectedOrg");
        if (!lastOrg) {
          setReports([]);
          setLoading(false);
          return;
        }

        const org = JSON.parse(lastOrg);
        const orgId = org.id || org.organization_id;

        const res = await fetch(
          `https://premium-citydata-api-ab.vercel.app/api/cases/issue_cases?organization_id=${orgId}`
        );
        if (!res.ok) throw new Error("Fetch cases failed");

        const data = await res.json();
        const reportsData = Array.isArray(data) ? data : (data.data || []);
        
        setReports(reportsData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setReports([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, [subTab]);

  const handleToggleDetails = (id) => {
    setExpandedCardId((prevId) => (prevId === id ? null : id));
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "รอรับเรื่อง": return styles.pending;
      case "กำลังประสานงาน": return styles.coordinating;
      case "กำลังดำเนินการ": return styles.in_progress;
      case "เสร็จสิ้น": return styles.completed;
      case "ส่งต่อ": return styles.forwarded;
      case "เชิญร่วม": return styles.invited;
      case "ปฏิเสธ": return styles.rejected;
      default: return styles.other;
    }
  };

  return (
    <>
      <div className={styles.searchTop}>
        <div className={styles.searchInputWrapper}>
          <input
            type="text"
            placeholder="ใส่คำที่ต้องการค้นหา"
            className={styles.searchInput}
          />
          <FaSearch className={styles.searchIcon} />
        </div>
        <button
          className={styles.filterToggleButton}
          onClick={() => setShowFilters(true)}
        >
          <FaFilter />
          <span>ตัวกรอง</span>
        </button>
      </div>

      {showFilters && (
        <>
           <div className={styles.filterModalBackdrop} onClick={() => setShowFilters(false)}></div>
           <div className={styles.filterModal}>
             <div className={styles.filterModalHeader}>
               <h3>{modalTitle}</h3>
               <button className={styles.filterModalClose} onClick={() => setShowFilters(false)}>
                 <FaTimes />
               </button>
             </div>
             <div className={styles.filterModalContent}>
               <div className={styles.reportFilters}>
                 {mainFilters.map((label, i) => (
                   <div className={styles.filterGroup} key={i}>
                     <label>{label}</label>
                     
                     {label === "ช่วงเวลา" ? (
                        <DateFilter />
                     ) : label === "ประเภท" ? (
                        <select defaultValue="all">
                          <option value="all">ทั้งหมด</option>
                          {issueTypes.map((type, index) => (
                            <option 
                              key={type.issue_type_id || type.id || index} 
                              value={type.issue_type_id || type.id}
                            >
                              {type.issue_type_name || type.name || "ระบุไม่ได้"}
                            </option>
                          ))}
                        </select>
                     ) : label === "สถานะ" ? (
                        // ✅ แสดงผลสถานะจาก API (statusOptions)
                        <select defaultValue="all">
                          <option value="all">ทั้งหมด</option>
                          {statusOptions.length > 0 ? (
                            statusOptions.map((status, index) => (
                              <option key={index} value={status}>
                                {status}
                              </option>
                            ))
                          ) : (
                            // กรณีโหลดไม่เจอ หรือ API ส่งมาว่าง
                            <option disabled>ไม่พบข้อมูลสถานะ</option>
                          )}
                        </select>
                     ) : (
                        // Filter อื่นๆ (เช่น หน่วยงาน)
                        <select defaultValue="all">
                          <option value="all">ทั้งหมด</option>
                        </select>
                     )}

                   </div>
                 ))}
                 
                 {locationFilters.map((label, i) => (
                   <div key={i} className={styles.filterGroup}>
                     <label>{label}</label>
                     <select defaultValue="all"><option value="all">ทั้งหมด</option></select>
                   </div>
                 ))}
               </div>
               <button className={styles.filterApplyButton} onClick={() => setShowFilters(false)}>ตกลง</button>
             </div>
           </div>
        </>
      )}

      <div className={styles.reportSummary}>
        <strong>{summaryTitle}</strong>{" "}
        ({loading ? "กำลังโหลด..." : `${reports.length} รายการ`})
      </div>

      <div className={styles.reportTableContainer}>
        {loading ? (
          <p>กำลังโหลดข้อมูล...</p>
        ) : reports.length === 0 ? (
          <p>ไม่มีข้อมูลเรื่องแจ้ง</p>
        ) : (
          reports.map((report) => {
            const isExpanded = expandedCardId === report.issue_cases_id;
            const responsibleUnits =
              report.organizations && report.organizations.length > 0
                ? report.organizations.map((org) => org.responsible_unit).join(", ")
                : "-";

            return (
              <div
                key={report.issue_cases_id}
                className={styles.reportTableRow}
                onClick={() => onRowClick && onRowClick(report)}
                style={{ cursor: "pointer" }} 
              >
                <img
                  src={
                    report.cover_image_url ||
                    "https://via.placeholder.com/120x80?text=No+Image"
                  }
                  alt="Report"
                  className={styles.reportImage}
                />
                <div className={styles.reportHeader}>
                  <span className={styles.reportIdText}>
                    #{report.case_code}
                  </span>
                  <p className={styles.reportDetailText}>
                    {truncateText(report.title || "-", 40)}
                  </p>
                </div>
                <div className={styles.reportStatusGroup}>
                  <span className={`${styles.statusTag} ${getStatusClass(report.status)}`}>
                    {report.status}
                  </span>
                </div>

                {isExpanded && (
                  <>
                    <div className={styles.mainDetails}>
                      <span>ประเภทปัญหา: {report.issue_type_name}</span>
                      <span>รายละเอียด: {report.description || "-"}</span>
                      <span>
                        วันที่แจ้ง:{" "}
                        {new Date(report.created_at).toLocaleString("th-TH")}
                      </span>
                      <span>
                        อัปเดตล่าสุด:{" "}
                        {new Date(report.updated_at).toLocaleString("th-TH")}
                      </span>
                    </div>
                    <div className={styles.locationDetails}>
                      <span>
                        พิกัด: {report.latitude}, {report.longitude}
                      </span>
                      <span>หน่วยงานรับผิดชอบ: {responsibleUnits}</span>
                    </div>
                  </>
                )}

                <button
                  className={styles.toggleDetailsButton}
                  onClick={(e) => {
                    e.stopPropagation(); 
                    handleToggleDetails(
                      isExpanded ? null : report.issue_cases_id
                    );
                  }}
                >
                  {isExpanded ? "ซ่อนรายละเอียด" : "อ่านเพิ่มเติม"}
                </button>
              </div>
            );
          })
        )}
      </div>
    </>
  );
};

export default ReportTable;
