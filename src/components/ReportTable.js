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
            {/* SVG Icons... */}
            <calendar-month></calendar-month>
          </calendar-date>
        </div>
      )}
    </div>
  );
};

// ------------------------- Report Table
// ✅ 1. รับ prop "onRowClick" เข้ามา
const ReportTable = ({ subTab, onRowClick }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // โหลดข้อมูล
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
        setReports(data);
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
      {/* ส่วน Search & Filter คงเดิม */}
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

      {/* Filter Modal คงเดิม */}
      {showFilters && (
        <div className={styles.filterModalBackdrop} onClick={() => setShowFilters(false)}>
           {/* ... เนื้อหา Modal ... */}
           {/* (ขอละไว้เพื่อความสั้น เพราะโค้ดเดิมถูกต้องแล้ว) */}
        </div>
      )}
      {showFilters && (
          // ... (ใส่โค้ด Modal เดิมของคุณตรงนี้) ...
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
                   {label === "ช่วงเวลา" ? <DateFilter /> : (
                     <select defaultValue="all"><option value="all">ทั้งหมด</option></select>
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
             <button className={styles.filterApplyButton}>ตกลง</button>
           </div>
         </div>
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
                // ✅ 2. เพิ่ม onClick ที่ Row เพื่อส่ง report กลับไปหน้า Home
                onClick={() => onRowClick && onRowClick(report)}
                style={{ cursor: "pointer" }} // เปลี่ยนเมาส์เป็นรูปมือ
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
                  // ✅ 3. เพิ่ม e.stopPropagation() เพื่อไม่ให้กดปุ่มนี้แล้วเด้งไปหน้า Detail
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
