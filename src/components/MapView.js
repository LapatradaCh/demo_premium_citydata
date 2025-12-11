import React, { useState, useEffect } from "react";
import styles from "./css/MapView.module.css";
// Import ของ React Leaflet
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import {
  FaMapMarkerAlt,
  FaSearch,
  FaFilter,
  FaTimes,
} from "react-icons/fa";

// --- แก้ไขปัญหา Icon ของ Leaflet ไม่แสดงใน React ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

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

  // ตั้งค่าหัวข้อตาม Tab
  const isPublic = subTab === "แผนที่สาธารณะ";
  const title = isPublic ? "แผนที่สาธารณะ" : "แผนที่ภายใน";
  const modalTitle = `ตัวกรอง (${title})`;
  const summaryTitle = `รายการแจ้ง (${title})`;

  // ตำแหน่งเริ่มต้นของแผนที่ (เช่น กรุงเทพฯ)
  const defaultCenter = [13.7563, 100.5018]; 

  // Logic การดึงข้อมูล
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
  }, [subTab]);

  const handleToggleDetails = (id) => {
    setExpandedCardId((prevId) => (prevId === id ? null : id));
  };

  // ฟังก์ชัน getStatusClass (ที่เคยหายไป)
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

  // ฟังก์ชัน renderSidebar (ที่เคยหายไป)
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
        {loading ? (
           <div className={styles.mapPlaceholder}>กำลังโหลดแผนที่...</div>
        ) : (
           <MapContainer 
             center={defaultCenter} 
             zoom={10} 
             style={{ height: "100%", width: "100%" }} 
           >
             <TileLayer
               attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
               url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
             />

             {mapMode === "pins" && reports.map((report) => {
                const lat = parseFloat(report.latitude);
                const lng = parseFloat(report.longitude);
                
                if (isNaN(lat) || isNaN(lng)) return null;

                return (
                  <Marker key={report.issue_cases_id} position={[lat, lng]}>
                    <Popup>
                      <div className={styles.popupContent}>
                        <strong>#{report.case_code}</strong><br/>
                        {report.title}<br/>
                        <span className={`${styles.statusTag} ${getStatusClass(report.status)}`}>
                          {report.status}
                        </span>
                      </div>
                    </Popup>
                  </Marker>
                );
             })}
             
             {mapMode === "heatmap" && (
                <div className="leaflet-bottom leaflet-right" style={{pointerEvents:'none', margin: 20}}>
                   <div style={{background:'white', padding:10}}>โหมด Heatmap (กำลังพัฒนา)</div>
                </div>
             )}

           </MapContainer>
        )}
      </div>
    </div>
  );
};

export default MapView;
