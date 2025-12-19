import React, { useState, useEffect, useRef, useMemo } from "react"; 
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
  const [selectedReport, setSelectedReport] = useState(null); 
  const [reports, setReports] = useState([]); 
  const [loading, setLoading] = useState(true);

  const [issueTypes, setIssueTypes] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);

  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

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

  // --- 1. Fetch Issue Types ---
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

  // --- 2. Fetch Statuses ---
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const lastOrg = localStorage.getItem("lastSelectedOrg");
        let orgId = null;
        if (lastOrg) {
          const orgData = JSON.parse(lastOrg);
          orgId = orgData.id || orgData.organization_id;
        }
        const baseUrl = "https://premium-citydata-api-ab.vercel.app/api/get_issue_status"; 
        const url = orgId ? `${baseUrl}?organization_id=${orgId}` : baseUrl;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch statuses");
        const data = await res.json();
        if (Array.isArray(data)) {
          setStatusOptions(data);
        } else if (data.data && Array.isArray(data.data)) {
           setStatusOptions(data.data); 
        } else {
           setStatusOptions([]);
        }
      } catch (err) {
        console.error("Error fetching statuses:", err);
        setStatusOptions([]);
      }
    };
    fetchStatuses();
  }, [subTab]);

  // --- 3. Fetch Reports ---
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

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const reportTypeName = report.issue_type_name || ""; 
      const matchType = selectedType === "all" || reportTypeName === selectedType;
      const reportStatus = report.status || "";
      const matchStatus = selectedStatus === "all" || reportStatus === selectedStatus;
      return matchType && matchStatus;
    });
  }, [reports, selectedType, selectedStatus]);

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
                        <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                          <option value="all">ทั้งหมด</option>
                          {issueTypes.map((type, index) => (
                            <option key={index} value={type.issue_type_name || type.name}>
                              {type.issue_type_name || type.name}
                            </option>
                          ))}
                        </select>
                     ) : label === "สถานะ" ? (
                        <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                          <option value="all">ทั้งหมด</option>
                          {statusOptions.map((status, index) => (
                            <option key={index} value={status}>{status}</option>
                          ))}
                        </select>
                     ) : (
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
        <strong>{summaryTitle}</strong> ({loading ? "กำลังโหลด..." : `${filteredReports.length} รายการ`})
      </div>

      <div className={styles.reportTableContainer}>
        {loading ? (
          <p>กำลังโหลดข้อมูล...</p>
        ) : filteredReports.map((report) => (
          <div key={report.issue_cases_id} className={styles.reportTableRow} onClick={() => onRowClick && onRowClick(report)}>
            <div className={styles.cardHeaderSection}>
              <img src={report.cover_image_url || "https://via.placeholder.com/70"} alt="Report" className={styles.reportImage} />
              <div className={styles.headerInfo}>
                <h3 className={styles.reportHeader}>#{report.case_code}</h3>
                <p className={styles.reportDetailText}>{truncateText(report.title || "-", 40)}</p>
              </div>
            </div>
            <div className={styles.reportStatusGroup}>
              <span className={`${styles.statusTag} ${getStatusClass(report.status)}`}>{report.status}</span>
            </div>
            <button 
              className={styles.toggleDetailsButton} 
              onClick={(e) => { e.stopPropagation(); setSelectedReport(report); }} 
            >
              อ่านเพิ่มเติม
            </button>
          </div>
        ))}
      </div>

      {/* ✅ ปรับปรุง Modal รายละเอียดให้อ่านง่าย: Label บน Value ล่าง พร้อมแยกโซนพิกัด */}
      {selectedReport && (
        <>
          <div className={styles.filterModalBackdrop} onClick={() => setSelectedReport(null)}></div>
          <div className={styles.filterModal} style={{ maxWidth: '440px' }}>
            <div className={styles.filterModalHeader}>
              <h3>รายละเอียดเรื่องแจ้ง</h3>
              <button className={styles.filterModalClose} onClick={() => setSelectedReport(null)}>
                <FaTimes />
              </button>
            </div>
            <div className={styles.filterModalContent} style={{ maxHeight: '80vh', overflowY: 'auto', paddingBottom: '35px' }}>
              
              <div className={styles.detailHeaderSection}>
                <img src={selectedReport.cover_image_url || "https://via.placeholder.com/100"} className={styles.detailCoverImage} />
                <div className={styles.detailHeaderInfo}>
                  <h3 className={styles.detailCaseId}>#{selectedReport.case_code}</h3>
                  <p className={styles.detailTitleText}>{selectedReport.title}</p>
                </div>
              </div>

              <div className={styles.detailContentBody}>
                <div className={styles.detailRow}>
                  <div className={styles.detailCol}>
                    <label>ประเภทปัญหา</label>
                    <span className={styles.detailValueBold}>{selectedReport.issue_type_name || "-"}</span>
                  </div>
                  <div className={styles.detailCol}>
                    <label>วันที่แจ้ง</label>
                    <span className={styles.detailValueBold}>
                      {selectedReport.created_at ? new Date(selectedReport.created_at).toLocaleString("th-TH") : "-"}
                    </span>
                  </div>
                </div>

                <div className={styles.detailColFull}>
                  <label>รายละเอียด</label>
                  <div className={styles.detailDescriptionBox}>
                    {selectedReport.description || "-"}
                  </div>
                </div>
              </div>

              <div className={styles.detailLocationBox}>
                <div className={styles.detailCol}>
                  <label>พิกัด</label>
                  <span className={styles.detailValueBold}>{selectedReport.latitude}, {selectedReport.longitude}</span>
                </div>
                <div className={styles.detailCol}>
                  <label>หน่วยงานรับผิดชอบ</label>
                  <span className={styles.detailValueBold}>
                    {selectedReport.organizations?.map(org => org.responsible_unit).join(", ") || "-"}
                  </span>
                </div>
              </div>
              
              {/* ปุ่ม "ปิดหน้าต่าง" ด้านล่างถูกลบออกแล้ว */}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ReportTable;
