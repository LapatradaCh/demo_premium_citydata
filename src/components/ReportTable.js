import React, { useState, useEffect, useRef, useMemo } from "react"; 
import styles from "./css/ReportTable.module.css";
import { FaSearch, FaFilter, FaTimes } from "react-icons/fa";
import "cally";

// ------------------------- Helper
const toYYYYMMDD = (d) => (d ? d.toISOString().split("T")[0] : null);

const truncateText = (text, maxLength) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

// ------------------------- Date Filter Component
const DateFilter = () => {
  const [show, setShow] = useState(false);
  const [date, setDate] = useState(new Date());
  const calendarRef = useRef(null);
  const formatDate = (d) => d ? d.toLocaleDateString("th-TH") : "กดเพื่อเลือกช่วงเวลา";

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
      <button className={styles.timeRangeButton} onClick={() => setShow(!show)}>
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

// ------------------------- Main Report Table
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
  const mainFilters = isAllReports ? ["ประเภท", "ช่วงเวลา"] : ["ประเภท", "สถานะ", "หน่วยงาน", "ช่วงเวลา"];
  const locationFilters = isAllReports ? [] : ["จังหวัด", "อำเภอ/เขต", "ตำบล/แขวง"];
  
  const modalTitle = isAllReports ? "ตัวกรอง (รายการแจ้งรวม)" : "ตัวกรอง (เฉพาะหน่วยงาน)";
  const summaryTitle = isAllReports ? "รายการแจ้งรวม" : "รายการแจ้งเฉพาะหน่วยงาน";

  useEffect(() => {
    const fetchIssueTypes = async () => {
      try {
        const res = await fetch("https://premium-citydata-api-ab.vercel.app/api/get_issue_types");
        const data = await res.json();
        setIssueTypes(Array.isArray(data) ? data : (data.data || []));
      } catch (err) { console.error(err); }
    };
    fetchIssueTypes();
  }, []);

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const lastOrg = localStorage.getItem("lastSelectedOrg");
        let orgId = lastOrg ? JSON.parse(lastOrg).id || JSON.parse(lastOrg).organization_id : null;
        const baseUrl = "https://premium-citydata-api-ab.vercel.app/api/get_issue_status"; 
        const url = orgId ? `${baseUrl}?organization_id=${orgId}` : baseUrl;
        const res = await fetch(url);
        const data = await res.json();
        setStatusOptions(Array.isArray(data) ? data : (data.data || []));
      } catch (err) { console.error(err); }
    };
    fetchStatuses();
  }, [subTab]);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true);
        const lastOrg = localStorage.getItem("lastSelectedOrg");
        if (!lastOrg) { setReports([]); setLoading(false); return; }
        const orgId = JSON.parse(lastOrg).id || JSON.parse(lastOrg).organization_id;
        const res = await fetch(`https://premium-citydata-api-ab.vercel.app/api/cases/issue_cases?organization_id=${orgId}`);
        const data = await res.json();
        setReports(Array.isArray(data) ? data : (data.data || []));
      } catch (err) { setReports([]); } finally { setLoading(false); }
    };
    fetchCases();
  }, [subTab]);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchType = selectedType === "all" || (report.issue_type_name || "") === selectedType;
      const matchStatus = selectedStatus === "all" || (report.status || "") === selectedStatus;
      return matchType && matchStatus;
    });
  }, [reports, selectedType, selectedStatus]);

  const getStatusClass = (status) => {
    switch (status) {
      case "รอรับเรื่อง": return styles.pending;
      case "กำลังประสานงาน": return styles.coordinating;
      case "กำลังดำเนินการ": return styles.in_progress;
      case "เสร็จสิ้น": return styles.completed;
      default: return styles.other;
    }
  };

  return (
    <>
      {/* ส่วนค้นหาและตัวกรอง - แก้ไขให้ขนาดปุ่มกะทัดรัดขึ้น */}
      <div className={styles.searchTop}>
        <div className={styles.searchInputWrapper}>
          <input type="text" placeholder="ใส่คำที่ต้องการค้นหา" className={styles.searchInput} />
          <FaSearch className={styles.searchIcon} />
        </div>
        <button className={styles.filterToggleButton} onClick={() => setShowFilters(true)}>
          <FaFilter /> <span>ตัวกรอง</span>
        </button>
      </div>

      {/* Modal ตัวกรองหลัก */}
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
                    {label === "ช่วงเวลา" ? <DateFilter /> : (
                      <select 
                        value={label === "ประเภท" ? selectedType : selectedStatus}
                        onChange={(e) => label === "ประเภท" ? setSelectedType(e.target.value) : setSelectedStatus(e.target.value)}
                      >
                        <option value="all">ทั้งหมด</option>
                        {(label === "ประเภท" ? issueTypes : statusOptions).map((opt, idx) => (
                          <option key={idx} value={opt.issue_type_name || opt}>{opt.issue_type_name || opt}</option>
                        ))}
                      </select>
                    )}
                  </div>
                ))}
              </div>
              <button className={styles.filterApplyButton} onClick={() => setShowFilters(false)}>ตกลง</button>
            </div>
          </div>
        </>
      )}

      <div className={styles.reportSummary}>
        <strong>{summaryTitle}</strong> ({loading ? "โหลด..." : `${filteredReports.length} รายการ`})
      </div>

      {/* Grid รายการการ์ด */}
      <div className={styles.reportTableContainer}>
        {loading ? <p>กำลังโหลด...</p> : filteredReports.map((report) => (
          <div key={report.issue_cases_id} className={styles.reportTableRow}>
            <div className={styles.cardHeaderSection}>
              <img src={report.cover_image_url || "https://via.placeholder.com/70"} alt="img" className={styles.reportImage} />
              <div className={styles.headerInfo}>
                <h3 className={styles.reportHeader}>#{report.case_code}</h3>
                <p className={styles.reportDetailText}>{truncateText(report.title || "-", 35)}</p>
              </div>
            </div>
            <div className={styles.reportStatusGroup}>
              <span className={`${styles.statusTag} ${getStatusClass(report.status)}`}>{report.status}</span>
            </div>
            <button className={styles.toggleDetailsButton} onClick={() => setSelectedReport(report)}>
              อ่านเพิ่มเติม
            </button>
          </div>
        ))}
      </div>

      {/* Popup รายละเอียดเรื่องแจ้ง (เมื่อกดอ่านเพิ่มเติม) */}
      {selectedReport && (
        <>
          <div className={styles.filterModalBackdrop} onClick={() => setSelectedReport(null)}></div>
          <div className={`${styles.filterModal} ${styles.detailPopup}`}>
            <div className={styles.filterModalHeader}>
              <h3>รายละเอียดเรื่องแจ้ง</h3>
              <button className={styles.filterModalClose} onClick={() => setSelectedReport(null)}>
                <FaTimes />
              </button>
            </div>
            <div className={styles.filterModalContent} style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <div className={styles.cardHeaderSection} style={{ marginBottom: '15px' }}>
                <img src={selectedReport.cover_image_url} className={styles.reportImage} style={{ width: '80px', height: '80px' }} />
                <div className={styles.headerInfo}>
                  <h3 className={styles.reportHeader}>#{selectedReport.case_code}</h3>
                  <p className={styles.reportDetailText}>{selectedReport.title}</p>
                </div>
              </div>
              <div className={styles.mainDetails}>
                <div><strong>ประเภท</strong><span className={styles.detailValue}>{selectedReport.issue_type_name}</span></div>
                <div><strong>วันที่</strong><span className={styles.detailValue}>{new Date(selectedReport.created_at).toLocaleDateString("th-TH")}</span></div>
                <div style={{ gridColumn: "span 2" }}><strong>รายละเอียด</strong><span className={styles.detailValue}>{selectedReport.description || "-"}</span></div>
              </div>
              <div className={styles.locationDetails}>
                <div><strong>พิกัด</strong><span className={styles.detailValue}>{selectedReport.latitude}, {selectedReport.longitude}</span></div>
                <div><strong>หน่วยงาน</strong><span className={styles.detailValue}>
                  {selectedReport.organizations?.map(org => org.responsible_unit).join(", ") || "-"}
                </span></div>
              </div>
              <button className={styles.filterApplyButton} onClick={() => setSelectedReport(null)} style={{ marginTop: '15px', backgroundColor: '#000' }}>
                ปิด
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ReportTable;
