import React, { useState, useEffect } from "react";
import styles from "./css/MapView.module.css";
import {
  FaMapMarkerAlt,
  FaSearch,
  FaFilter,
  FaTimes,
} from "react-icons/fa";

// ------------------------- Helper
const truncateText = (text, maxLength) => {
  if (!text) return "";
  return text.length <= maxLength ? text : text.substring(0, maxLength) + "...";
};

const MapView = ({ subTab }) => {
  const [mapMode, setMapMode] = useState("pins");
  const [showFilters, setShowFilters] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const mainFilters = ["ประเภท", "สถานะ"];
  const locationFilters = [];

  // ตั้งค่าหัวข้อตาม Tab
  const isPublic = subTab === "แผนที่สาธารณะ";
  const title = isPublic ? "แผนที่สาธารณะ" : "แผนที่ภายใน";
  const modalTitle = `ตัวกรอง (${title})`;
  const summaryTitle = `รายการแจ้ง (${title})`;

  // Logic การดึงข้อมูล (ปรับใช้ร่วมกัน)
  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true);
        const lastOrg = localStorage.getItem("lastSelectedOrg");
        if (!lastOrg) {
          setReports([]);
          return;
        }
        const org = JSON.parse(lastOrg);
        const orgId = org.id || org.organization_id;
        
        // หมายเหตุ: ตรงนี้ถ้ามี URL API แยกสำหรับสาธารณะสามารถเปลี่ยนได้
        const apiUrl = `https://premium-citydata-api-ab.vercel.app/api/cases/issue_cases?organization_id=${orgId}`;
        
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error("Fetch failed");
        const data = await res.json();
        setReports(data);
      } catch (err) {
        console.error("Error fetching:", err);
        setReports([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, [subTab]); // ดึงใหม่เมื่อเปลี่ยน Tab

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

  // เรนเดอร์ Sidebar (แยกฟังก์ชันมาเพื่อให้เหมือนกันทั้ง 2 หน้า)
  const renderSidebar = () => (
    <div className={styles.mapSidebar}>
      <h3 className={styles.mapSidebarTitle}>{title}</h3>

      {/* Search + Filter Button */}
      <div className={`${styles.searchTop} ${styles.sidebarSearchTop}`}>
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

      {/* Filter Modal */}
      {showFilters && (
        <>
          <div
            className={styles.filterModalBackdrop}
            onClick={() => setShowFilters(false)}
          ></div>
          <div className={styles.filterModal}>
            <div className={styles.filterModalHeader}>
              <h3>{modalTitle}</h3>
              <button className={styles.filterModalClose} onClick={() => setShowFilters(false)}>
                <FaTimes />
              </button>
            </div>
            <div className={styles.filterModalContent}>
              <div className={styles.reportFilters}>
                <div className={styles.filterGroup}>
                  <label>รูปแบบแสดงผล</label>
                  <div className={styles.mapToggles}>
                    <button
                      className={mapMode === "pins" ? styles.toggleButtonActive : styles.toggleButton}
                      onClick={() => setMapMode("pins")}
                    >หมุด</button>
                    <button
                      className={mapMode === "heatmap" ? styles.toggleButtonActive : styles.toggleButton}
                      onClick={() => setMapMode("heatmap")}
                    >Heatmap</button>
                  </div>
                </div>
                {mainFilters.map((label, i) => (
                  <div className={styles.filterGroup} key={i}>
                    <label>{label}</label>
                    <select defaultValue="all">
                      <option value="all">ทั้งหมด</option>
                      {label === "ประเภท" && (
                        <>
                          <option value="t1">ไฟฟ้า/ประปา</option>
                          <option value="t2">ถนน/ทางเท้า</option>
                        </>
                      )}
                      {label === "สถานะ" && (
                        <>
                          <option value="pending">รอรับเรื่อง</option>
                          <option value="completed">เสร็จสิ้น</option>
                        </>
                      )}
                    </select>
                  </div>
                ))}
              </div>
              <button className={styles.filterApplyButton} onClick={() => setShowFilters(false)}>ตกลง</button>
            </div>
          </div>
        </>
      )}

      {/* Report List */}
      <div className={styles.sidebarReportListContainer}>
        <div className={styles.reportSummary}>
          <strong>{summaryTitle}</strong> ({loading ? "โหลด..." : `${reports.length} รายการ`})
        </div>
        <div className={styles.reportTableContainer}>
          {loading ? (
            <p>กำลังโหลดข้อมูล...</p>
          ) : reports.length === 0 ? (
            <p>ไม่มีข้อมูลเรื่องแจ้ง</p>
          ) : (
            reports.map((report) => (
              <div key={report.issue_cases_id} className={styles.reportTableRow}>
                <img src={report.cover_image_url || "https://via.placeholder.com/50"} className={styles.reportImage} alt="" />
                <div className={styles.reportHeader}>
                  <span className={styles.reportIdText}>#{report.case_code}</span>
                  <p className={styles.reportDetailText}>{truncateText(report.title || "-", 40)}</p>
                </div>
                <div className={styles.reportStatusGroup}>
                  <span className={`${styles.statusTag} ${getStatusClass(report.status)}`}>{report.status}</span>
                </div>
                {expandedCardId === report.issue_cases_id && (
                  <div className={styles.mainDetails}>
                    <p>รายละเอียด: {report.description}</p>
                    <p>พิกัด: {report.latitude}, {report.longitude}</p>
                  </div>
                )}
                <button
                  className={styles.toggleDetailsButton}
                  onClick={() => handleToggleDetails(expandedCardId === report.issue_cases_id ? null : report.issue_cases_id)}
                >
                  {expandedCardId === report.issue_cases_id ? "ซ่อน" : "อ่านเพิ่ม"}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.mapViewContainer}>
      {renderSidebar()}

      <div className={styles.mapContent}>
        <div className={styles.mapPlaceholder}>
          {mapMode === "pins" ? (
            <>
              <span>พื้นที่{title} (Mode: Pins)</span>
              <FaMapMarkerAlt
                className={`${styles.mockMapPin} ${styles.pending}`}
                style={{ top: "30%", left: "40%" }}
              />
              <div className={styles.mapLegend}>
                <div className={styles.legendItem}>
                  <FaMapMarkerAlt className={styles.pending} /> <span>รอรับเรื่อง</span>
                </div>
                <div className={styles.legendItem}>
                  <FaMapMarkerAlt className={styles.completed} /> <span>เสร็จสิ้น</span>
                </div>
              </div>
            </>
          ) : (
            <span>พื้นที่{title} (Mode: Heatmap)</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapView;
