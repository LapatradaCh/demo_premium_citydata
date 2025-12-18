import React, { useState, useEffect, useRef, useMemo } from "react";
import styles from "./css/ReportTable.module.css";
import { FaSearch, FaFilter, FaTimes } from "react-icons/fa";
import "cally";

// ------------------------- Helper
const toYYYYMMDD = (d) => (d ? d.toISOString().split("T")[0] : null);

const truncateText = (text, maxLength) => {
  if (!text) return "";
  return text.length <= maxLength ? text : text.substring(0, maxLength) + "...";
};

// ------------------------- Date Filter Component
const DateFilter = () => {
  const [show, setShow] = useState(false);
  const [date, setDate] = useState(new Date());
  const calendarRef = useRef(null);

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
        {date.toLocaleDateString("th-TH")}
      </button>
      {show && (
        <div className={styles.calendarPopup}>
          <calendar-date ref={calendarRef} value={toYYYYMMDD(date)}>
            <calendar-month></calendar-month>
          </calendar-date>
        </div>
      )}
    </div>
  );
};

// ------------------------- Main Component
const ReportTable = ({ subTab, onRowClick }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [issueTypes, setIssueTypes] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const isAllReports = subTab === "รายการแจ้งรวม";
  const mainFilters = isAllReports ? ["ประเภท", "ช่วงเวลา"] : ["ประเภท", "สถานะ", "หน่วยงาน", "ช่วงเวลา"];
  const locationFilters = isAllReports ? [] : ["จังหวัด", "อำเภอ/เขต", "ตำบล/แขวง"];

  // 1. Fetch Issue Types
  useEffect(() => {
    fetch("https://premium-citydata-api-ab.vercel.app/api/get_issue_types")
      .then(res => res.json())
      .then(data => setIssueTypes(Array.isArray(data) ? data : (data.data || [])))
      .catch(err => console.error(err));
  }, []);

  // 2. Fetch Statuses
  useEffect(() => {
    fetch("https://premium-citydata-api-ab.vercel.app/api/get_issue_status")
      .then(res => res.json())
      .then(data => setStatusOptions(Array.isArray(data) ? data : (data.data || [])))
      .catch(err => console.error(err));
  }, []);

  // 3. Fetch Reports
  useEffect(() => {
    const fetchCases = async () => {
      setLoading(true);
      const lastOrg = localStorage.getItem("lastSelectedOrg");
      if (!lastOrg) { setReports([]); setLoading(false); return; }
      
      const org = JSON.parse(lastOrg);
      const orgId = org.id || org.organization_id;
      
      try {
        const res = await fetch(`https://premium-citydata-api-ab.vercel.app/api/cases/issue_cases?organization_id=${orgId}`);
        const data = await res.json();
        setReports(Array.isArray(data) ? data : (data.data || []));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, [subTab]);

  // 4. Filtering Logic
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchType = selectedType === "all" || report.issue_type_name === selectedType;
      const matchStatus = selectedStatus === "all" || report.status === selectedStatus;
      return matchType && matchStatus;
    });
  }, [reports, selectedType, selectedStatus]);

  const getStatusClass = (status) => {
    switch (status) {
      case "รอรับเรื่อง": return styles.pending;
      case "กำลังดำเนินการ": return styles.in_progress;
      case "เสร็จสิ้น": return styles.completed;
      case "กำลังประสานงาน": return styles.coordinating;
      default: return "";
    }
  };

  return (
    <>
      <div className={styles.searchTop}>
        <div className={styles.searchInputWrapper}>
          <input type="text" placeholder="ใส่คำที่ต้องการค้นหา" className={styles.searchInput} />
          <FaSearch className={styles.searchIcon} />
        </div>
        <button className={styles.filterToggleButton} onClick={() => setShowFilters(true)}>
          <FaFilter /> <span>ตัวกรอง</span>
        </button>
      </div>

      {showFilters && (
        <>
          <div className={styles.filterModalBackdrop} onClick={() => setShowFilters(false)} />
          <div className={styles.filterModal}>
            <div className={styles.filterModalHeader}>
              <h3>{isAllReports ? "ตัวกรอง (แจ้งรวม)" : "ตัวกรอง (หน่วยงาน)"}</h3>
              <button className={styles.filterModalClose} onClick={() => setShowFilters(false)}><FaTimes /></button>
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
                        {label === "ประเภท" 
                          ? issueTypes.map((t, idx) => <option key={idx} value={t.issue_type_name}>{t.issue_type_name}</option>)
                          : statusOptions.map((s, idx) => <option key={idx} value={s}>{s}</option>)
                        }
                      </select>
                    )}
                  </div>
                ))}
                {locationFilters.map((label, i) => (
                  <div key={i} className={styles.filterGroup}>
                    <label>{label}</label>
                    <select><option value="all">ทั้งหมด</option></select>
                  </div>
                ))}
              </div>
              <button className={styles.filterApplyButton} onClick={() => setShowFilters(false)}>ตกลง</button>
            </div>
          </div>
        </>
      )}

      <div className={styles.reportSummary}>
        <strong>{isAllReports ? "รายการแจ้งรวม" : "รายการแจ้งเฉพาะหน่วยงาน"}</strong> ({loading ? "โหลด..." : `${filteredReports.length} รายการ`})
      </div>

      <div className={styles.reportTableContainer}>
        {!loading && filteredReports.map((report) => {
          const isExpanded = expandedCardId === report.issue_cases_id;
          return (
            <div key={report.issue_cases_id} className={styles.reportTableRow} onClick={() => onRowClick?.(report)}>
              <img src={report.cover_image_url || "https://via.placeholder.com/80"} className={styles.reportImage} alt="case" />
              <div className={styles.reportHeader}>
                <span>#{report.case_code}</span>
                <p className={styles.reportDetailText}>{truncateText(report.title || "-", 40)}</p>
              </div>
              <span className={`${styles.statusTag} ${getStatusClass(report.status)}`}>{report.status}</span>

              {/* ส่วนที่ยืดออกมา */}
              {isExpanded && (
                <div className={styles.expandedSection}>
                  <div className={styles.mainDetails}>
                    <span><strong>ประเภท:</strong> {report.issue_type_name}</span>
                    <span><strong>รายละเอียด:</strong> {report.description || "-"}</span>
                    <span><strong>แจ้งเมื่อ:</strong> {new Date(report.created_at).toLocaleString("th-TH")}</span>
                  </div>
                  <div className={styles.locationDetails}>
                    📍 {report.latitude}, {report.longitude} <br/>
                    🏢 {report.organizations?.map(o => o.responsible_unit).join(", ") || "-"}
                  </div>
                </div>
              )}

              <button 
                className={styles.toggleDetailsButton}
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedCardId(isExpanded ? null : report.issue_cases_id);
                }}
              >
                {isExpanded ? "ซ่อนรายละเอียด" : "อ่านเพิ่มเติม"}
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default ReportTable;
