import React, { useState, useEffect } from "react";
import styles from "./css/MapView.module.css";

// 1. Import Components ของ Map
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";

// 2. Import MarkerClusterGroup
import MarkerClusterGroup from "react-leaflet-cluster";

import "leaflet/dist/leaflet.css";
import L from "leaflet";

// 3. Import leaflet.heat
import "leaflet.heat";

import {
  FaMapMarkerAlt,
  FaSearch,
  FaFilter,
  FaTimes,
} from "react-icons/fa";

// --- แก้ไขปัญหา Icon Default ของ Leaflet ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// --- HELPER: เลือก CSS Class ตามสถานะ (ใช้ร่วมกันทั้ง List และ Map) ---
const getStatusClass = (status) => {
  switch (status) {
    case "รอรับเรื่อง": return styles.pending;       // สีแดง
    case "กำลังประสานงาน": return styles.coordinating; // สีม่วง
    case "กำลังดำเนินการ": return styles.in_progress;  // สีส้ม
    case "เสร็จสิ้น": return styles.completed;       // สีเขียว
    case "ส่งต่อ": return styles.forwarded;          // สีฟ้าเข้ม
    case "เชิญร่วม": return styles.invited;          // สีฟ้าอ่อน
    case "ปฏิเสธ": return styles.rejected;           // สีเทา
    default: return styles.other;
  }
};

// --- CUSTOM PIN: สร้างหมุด CSS (รูปหยดน้ำ) ---
const createCustomPin = (status) => {
  // แมปสถานะไปหาชื่อ Class ใน CSS (เช่น styles.waiting, styles.completed)
  let pinColorClass = "";
  switch (status) {
    case "รอรับเรื่อง": pinColorClass = styles.waiting; break;
    case "กำลังประสานงาน": pinColorClass = styles.coordinating; break;
    case "กำลังดำเนินการ": pinColorClass = styles.in_progress; break;
    case "เสร็จสิ้น": pinColorClass = styles.completed; break;
    case "ส่งต่อ": pinColorClass = styles.forwarded; break;
    case "เชิญร่วม": pinColorClass = styles.invited; break;
    case "ปฏิเสธ": pinColorClass = styles.rejected; break;
    default: pinColorClass = styles.waiting;
  }

  // ใช้ L.divIcon แทน L.Icon เพื่อใส่ HTML/CSS เอง
  return L.divIcon({
    className: styles.leafletMarkerContainer, // Class เปล่าๆ เพื่อลบ default box ของ leaflet
    html: `<div class="${styles.pin} ${pinColorClass}"></div>`, // HTML ของหมุด
    iconSize: [30, 30],   // ขนาด
    iconAnchor: [15, 30], // จุดปัก (Tip of the pin): [กึ่งกลางแนวนอน, ด้านล่างสุด]
    popupAnchor: [0, -35] // จุดที่ Popup เด้งขึ้นมา
  });
};

// --- Custom Icon: Cluster สีส้ม ---
const createCustomClusterIcon = (cluster) => {
  const count = cluster.getChildCount();
  return L.divIcon({
    html: `<span>${count}</span>`,
    className: styles.customClusterIcon, 
    iconSize: L.point(40, 40, true),
  });
};

// --- Component ใหม่: Heatmap Layer ---
const HeatmapLayer = ({ data }) => {
  const map = useMap();

  useEffect(() => {
    if (!data || data.length === 0) return;

    // กรองและแปลงเป็น format [lat, lng, intensity]
    const points = data
      .filter(p => !isNaN(parseFloat(p.latitude)) && !isNaN(parseFloat(p.longitude)))
      .map(p => [parseFloat(p.latitude), parseFloat(p.longitude), 0.8]); 

    const heat = L.heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      minOpacity: 0.4,
      gradient: {
        0.4: 'blue',
        0.6: 'cyan',
        0.7: 'lime',
        0.8: 'yellow',
        1.0: 'red'
      }
    }).addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [data, map]);

  return null;
};

// Helper: ตัดคำ
const truncateText = (text, maxLength) => {
  if (!text) return "";
  return text.length <= maxLength ? text : text.substring(0, maxLength) + "...";
};

// Component: Auto Zoom
const FitBoundsToMarkers = ({ markers }) => {
  const map = useMap();
  useEffect(() => {
    if (markers.length > 0) {
      const validMarkers = markers.filter(m => 
        !isNaN(parseFloat(m.latitude)) && !isNaN(parseFloat(m.longitude))
      );
      if (validMarkers.length > 0) {
        const bounds = L.latLngBounds(validMarkers.map(m => [parseFloat(m.latitude), parseFloat(m.longitude)]));
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [markers, map]);
  return null;
};

const MapView = ({ subTab }) => {
  const [mapMode, setMapMode] = useState("pins"); // 'pins' หรือ 'heatmap'
  const [showFilters, setShowFilters] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const mainFilters = ["ประเภท", "สถานะ"];

  const isPublic = subTab === "แผนที่สาธารณะ";
  const title = isPublic ? "แผนที่สาธารณะ" : "แผนที่ภายใน";
  const modalTitle = `ตัวกรอง (${title})`;
  const summaryTitle = `รายการแจ้ง (${title})`;

  const defaultCenter = [13.7563, 100.5018];

  // --- Logic ดึงข้อมูล (Pagination Loop) ---
  useEffect(() => {
    const fetchAllCases = async () => {
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
        
        let allData = [];
        let page = 1;
        let hasMore = true;
        const limit = 100;

        while (hasMore) {
          const apiUrl = `https://premium-citydata-api-ab.vercel.app/api/cases/issue_cases?organization_id=${orgId}&limit=${limit}&page=${page}`;
          
          const res = await fetch(apiUrl);
          if (!res.ok) throw new Error(`Fetch failed at page ${page}`);
          
          const data = await res.json();
          
          let currentBatch = [];
          if (Array.isArray(data)) {
            currentBatch = data;
          } else if (data.data && Array.isArray(data.data)) {
            currentBatch = data.data;
          }

          if (currentBatch.length === 0) {
            hasMore = false;
          } else {
            allData = [...allData, ...currentBatch];
            if (currentBatch.length < limit) {
              hasMore = false;
            } else {
              page++;
            }
          }
        }

        console.log("จำนวนที่ดึงมาได้ทั้งหมด:", allData.length);
        setReports(allData);

      } catch (err) {
        console.error("Error fetching cases:", err);
        setReports([]); 
      } finally {
        setLoading(false);
      }
    };

    fetchAllCases();
  }, [subTab]);

  const handleToggleDetails = (id) => {
    setExpandedCardId((prevId) => (prevId === id ? null : id));
  };

  const renderSidebar = () => (
    <div className={styles.mapSidebar}>
      <h3 className={styles.mapSidebarTitle}>{title}</h3>
      <div className={`${styles.searchTop} ${styles.sidebarSearchTop}`}>
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
          <div className={styles.filterModalBackdrop} onClick={() => setShowFilters(false)}></div>
          <div className={styles.filterModal}>
            <div className={styles.filterModalHeader}>
              <h3>{modalTitle}</h3>
              <button className={styles.filterModalClose} onClick={() => setShowFilters(false)}><FaTimes /></button>
            </div>
            <div className={styles.filterModalContent}>
              <div className={styles.reportFilters}>
                <div className={styles.filterGroup}>
                   <label>รูปแบบแสดงผล</label>
                   <div className={styles.mapToggles}>
                    <button className={mapMode === "pins" ? styles.toggleButtonActive : styles.toggleButton} onClick={() => setMapMode("pins")}>หมุด (Pins)</button>
                    <button className={mapMode === "heatmap" ? styles.toggleButtonActive : styles.toggleButton} onClick={() => setMapMode("heatmap")}>Heatmap</button>
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
                ))}              </div>
              <button className={styles.filterApplyButton} onClick={() => setShowFilters(false)}>ตกลง</button>
            </div>
          </div>
        </>
      )}

      <div className={styles.sidebarReportListContainer}>
        <div className={styles.reportSummary}>
          <strong>{summaryTitle}</strong> ({loading ? "โหลด..." : `${reports.length} รายการ`})
        </div>
        <div className={styles.reportTableContainer}>
          {loading ? <p style={{color: '#64748b', textAlign: 'center'}}>กำลังโหลดข้อมูล...</p> : reports.length === 0 ? <p style={{color: '#64748b', textAlign: 'center'}}>ไม่มีข้อมูลเรื่องแจ้ง</p> : (
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
                    <p className={styles.locationDetails}><FaMapMarkerAlt /> {report.latitude}, {report.longitude}</p>
                  </div>
                )}
                <button className={styles.toggleDetailsButton} onClick={() => handleToggleDetails(expandedCardId === report.issue_cases_id ? null : report.issue_cases_id)}>
                  {expandedCardId === report.issue_cases_id ? "ซ่อนรายละเอียด" : "ดูรายละเอียด"}
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
           <div className={styles.mapPlaceholder}>กำลังโหลดแผนที่ ({reports.length} จุด)...</div>
        ) : (
           <MapContainer center={defaultCenter} zoom={10} style={{ height: "100%", width: "100%" }}>
             <TileLayer
               attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
               url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
             />

             {/* Auto Zoom */}
             {reports.length > 0 && <FitBoundsToMarkers markers={reports} />}

             {/* Heatmap Mode */}
             {mapMode === "heatmap" && (
                <HeatmapLayer data={reports} />
             )}

             {/* Pins Mode */}
             {mapMode === "pins" && (
                <MarkerClusterGroup 
                   chunkedLoading
                   iconCreateFunction={createCustomClusterIcon}
                >
                  {reports.map((report) => {
                    const lat = parseFloat(report.latitude);
                    const lng = parseFloat(report.longitude);
                    if (isNaN(lat) || isNaN(lng)) return null;

                    return (
                      <Marker 
                        key={report.issue_cases_id} 
                        position={[lat, lng]} 
                        icon={createCustomPin(report.status)} // เรียกใช้ฟังก์ชัน CSS Pin
                      >
                        <Popup>
                          <div style={{fontFamily: 'Prompt', textAlign: 'center'}}>
                            <strong style={{color: '#3b82f6'}}>#{report.case_code}</strong><br/>
                            <p style={{margin: '4px 0', fontSize: '13px'}}>{report.title}</p>
                            <span className={`${styles.statusTag} ${getStatusClass(report.status)}`} style={{marginTop: '4px', display:'inline-block'}}>
                                {report.status}
                            </span>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MarkerClusterGroup>
             )}
           </MapContainer>
        )}

        {/* Legend: คำอธิบายสีหมุด (แสดงเฉพาะโหมด Pins และใช้ CSS Class แทนรูปภาพ) */}
        {!loading && mapMode === "pins" && (
            <div className={styles.mapLegend}>
                <div className={styles.legendItem}>
                    <div className={`${styles.legendDot} ${styles.waiting}`}></div>
                    <span>รอรับเรื่อง</span>
                </div>
                <div className={styles.legendItem}>
                    <div className={`${styles.legendDot} ${styles.coordinating}`}></div>
                    <span>กำลังประสานงาน</span>
                </div>
                <div className={styles.legendItem}>
                    <div className={`${styles.legendDot} ${styles.in_progress}`}></div>
                    <span>กำลังดำเนินการ</span>
                </div>
                <div className={styles.legendItem}>
                    <div className={`${styles.legendDot} ${styles.completed}`}></div>
                    <span>เสร็จสิ้น</span>
                </div>
                <div className={styles.legendItem}>
                    <div className={`${styles.legendDot} ${styles.forwarded}`}></div>
                    <span>ส่งต่อ/เชิญร่วม</span>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default MapView;
