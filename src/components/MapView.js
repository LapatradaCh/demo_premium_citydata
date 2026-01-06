import React, { useState, useEffect, useMemo } from "react"; // ✅ เพิ่ม useMemo
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

// --- แก้ไขปัญหา Icon Default ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// --- Custom Icons ---
const createIcon = (colorUrl) => new L.Icon({
  iconUrl: colorUrl,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const redIcon = createIcon('https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png');
const greenIcon = createIcon('https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png');
const orangeIcon = createIcon('https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png');
const violetIcon = createIcon('https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png');
const blueIcon = createIcon('https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png');
const greyIcon = createIcon('https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png');

const getIconByStatus = (status) => {
  switch (status) {
    case "รอรับเรื่อง": return redIcon;
    case "ดำเนินการ": return orangeIcon;
    case "กำลังดำเนินการ": return orangeIcon;
    case "เสร็จสิ้น": return greenIcon;
    case "ส่งต่อ": return blueIcon;
    case "เชิญร่วม": return violetIcon;
    case "ปฏิเสธ": return greyIcon;
    default: return redIcon;
  }
};

const createCustomClusterIcon = (cluster) => {
  const count = cluster.getChildCount();
  return L.divIcon({
    html: `<span>${count}</span>`,
    className: styles.customClusterIcon, 
    iconSize: L.point(40, 40, true),
  });
};

const HeatmapLayer = ({ data }) => {
  const map = useMap();
  useEffect(() => {
    if (!data || data.length === 0) return;
    const points = data
      .filter(p => !isNaN(parseFloat(p.latitude)) && !isNaN(parseFloat(p.longitude)))
      .map(p => [parseFloat(p.latitude), parseFloat(p.longitude), 0.8]); 
    const heat = L.heatLayer(points, {
      radius: 25, blur: 15, maxZoom: 17, minOpacity: 0.4,
      gradient: { 0.4: 'blue', 0.6: 'cyan', 0.7: 'lime', 0.8: 'yellow', 1.0: 'red' }
    }).addTo(map);
    return () => { map.removeLayer(heat); };
  }, [data, map]);
  return null;
};

const truncateText = (text, maxLength) => {
  if (!text) return "";
  return text.length <= maxLength ? text : text.substring(0, maxLength) + "...";
};

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
  const [mapMode, setMapMode] = useState("pins");
  const [showFilters, setShowFilters] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState(null);
  const [reports, setReports] = useState([]); // ข้อมูลดิบทั้งหมด
  const [loading, setLoading] = useState(true);
  
  // --- State สำหรับเก็บตัวเลือก Filter ---
  const [issueTypes, setIssueTypes] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);

  // --- ✅ State สำหรับเก็บ "ค่าที่ถูกเลือก" (Selected Value) ---
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const mainFilters = ["ประเภท", "สถานะ"];
  const isPublic = subTab === "แผนที่สาธารณะ";
  const title = isPublic ? "แผนที่สาธารณะ" : "แผนที่ภายใน";
  const modalTitle = `ตัวกรอง (${title})`;
  const summaryTitle = `รายการแจ้ง (${title})`;
  const defaultCenter = [13.7563, 100.5018];

  // 1. Fetch Issue Types
  useEffect(() => {
    const fetchIssueTypes = async () => {
      try {
        const res = await fetch("https://premium-citydata-api-ab.vercel.app/api/get_issue_types");
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        if (Array.isArray(data)) setIssueTypes(data);
        else if (data.data && Array.isArray(data.data)) setIssueTypes(data.data);
      } catch (err) { console.error(err); }
    };
    fetchIssueTypes();
  }, []);

  // 2. Fetch Statuses
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const lastOrg = localStorage.getItem("lastSelectedOrg");
        let orgId = null;
        if (lastOrg) orgId = JSON.parse(lastOrg).id || JSON.parse(lastOrg).organization_id;

        const baseUrl = "https://premium-citydata-api-ab.vercel.app/api/get_issue_status"; 
        const url = orgId ? `${baseUrl}?organization_id=${orgId}` : baseUrl;

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        if (Array.isArray(data)) setStatusOptions(data);
        else if (data.data && Array.isArray(data.data)) setStatusOptions(data.data);
      } catch (err) { console.error(err); }
    };
    fetchStatuses();
  }, []);

  // 3. Fetch Reports (All Data)
  useEffect(() => {
    const fetchAllCases = async () => {
      try {
        setLoading(true);
        const lastOrg = localStorage.getItem("lastSelectedOrg");
        if (!lastOrg) { setReports([]); setLoading(false); return; }
        
        const org = JSON.parse(lastOrg);
        const orgId = org.id || org.organization_id;
        
        let allData = [];
        let page = 1;
        let hasMore = true;
        const limit = 100;

        while (hasMore) {
          const apiUrl = `https://premium-citydata-api-ab.vercel.app/api/cases/issue_cases?organization_id=${orgId}&limit=${limit}&page=${page}`;
          const res = await fetch(apiUrl);
          if (!res.ok) throw new Error("Fetch failed");
          const data = await res.json();
          let currentBatch = (Array.isArray(data) ? data : data.data) || [];

          if (currentBatch.length === 0) hasMore = false;
          else {
            allData = [...allData, ...currentBatch];
            if (currentBatch.length < limit) hasMore = false;
            else page++;
          }
        }
        setReports(allData);
      } catch (err) {
        console.error(err);
        setReports([]); 
      } finally {
        setLoading(false);
      }
    };
    fetchAllCases();
  }, [subTab]);

  // --- ✅ 4. Logic การกรองข้อมูล (ทำงานทันทีเมื่อ State เปลี่ยน) ---
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      // กรองประเภท (Type)
      // หมายเหตุ: เช็คทั้ง issue_type_id (int) และ string เผื่อ API ส่งมาไม่เหมือนกัน
      const matchType = selectedType === "all" || 
                        report.issue_type_id == selectedType; 

      // กรองสถานะ (Status)
      const matchStatus = selectedStatus === "all" || 
                          report.status === selectedStatus;

      return matchType && matchStatus;
    });
  }, [reports, selectedType, selectedStatus]);

  const handleToggleDetails = (id) => {
    setExpandedCardId((prevId) => (prevId === id ? null : id));
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "รอรับเรื่อง": return styles.pending;
      case "ดำเนินการ": return styles.in_progress;
      case "กำลังดำเนินการ": return styles.in_progress;
      case "เสร็จสิ้น": return styles.completed;
      case "ส่งต่อ": return styles.forwarded;
      case "เชิญร่วม": return styles.invited;
      case "ปฏิเสธ": return styles.rejected;
      default: return styles.other;
    }
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
                    
                    {/* --- Filter: ประเภท --- */}
                    {label === "ประเภท" && (
                       <select 
                          value={selectedType} // ✅ Bind State
                          onChange={(e) => setSelectedType(e.target.value)} // ✅ Update State
                       >
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
                    )}

                    {/* --- Filter: สถานะ --- */}
                    {label === "สถานะ" && (
                       <select 
                          value={selectedStatus} // ✅ Bind State
                          onChange={(e) => setSelectedStatus(e.target.value)} // ✅ Update State
                       >
                         <option value="all">ทั้งหมด</option>
                         {statusOptions.length > 0 ? (
                           statusOptions.map((status, index) => (
                             <option key={index} value={status}>
                               {status}
                             </option>
                           ))
                         ) : (
                           <option disabled>ไม่พบข้อมูลสถานะ</option>
                         )}
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

      {/* --- ใช้ filteredReports แทน reports ในส่วนแสดงผล --- */}
      <div className={styles.sidebarReportListContainer}>
        <div className={styles.reportSummary}>
          <strong>{summaryTitle}</strong> ({loading ? "โหลด..." : `${filteredReports.length} รายการ`})
        </div>
        <div className={styles.reportTableContainer}>
          {loading ? <p>กำลังโหลดข้อมูล...</p> : filteredReports.length === 0 ? <p>ไม่พบข้อมูลตามเงื่อนไข</p> : (
            filteredReports.map((report) => (
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
                <button className={styles.toggleDetailsButton} onClick={() => handleToggleDetails(expandedCardId === report.issue_cases_id ? null : report.issue_cases_id)}>
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
           <div className={styles.mapPlaceholder}>กำลังโหลดแผนที่ ({reports.length} จุด)...</div>
        ) : (
           <MapContainer center={defaultCenter} zoom={10} style={{ height: "100%", width: "100%" }}>
             <TileLayer
               attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
               url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
             />

             {/* Auto Zoom: ใช้ filteredReports */}
             {filteredReports.length > 0 && <FitBoundsToMarkers markers={filteredReports} />}

             {/* Heatmap Mode: ใช้ filteredReports */}
             {mapMode === "heatmap" && (
                <HeatmapLayer data={filteredReports} />
             )}

             {/* Pins Mode: ใช้ filteredReports */}
             {mapMode === "pins" && (
                <MarkerClusterGroup 
                   chunkedLoading
                   iconCreateFunction={createCustomClusterIcon}
                >
                  {filteredReports.map((report) => {
                    const lat = parseFloat(report.latitude);
                    const lng = parseFloat(report.longitude);
                    if (isNaN(lat) || isNaN(lng)) return null;

                    return (
                      <Marker 
                        key={report.issue_cases_id} 
                        position={[lat, lng]} 
                        icon={getIconByStatus(report.status)}
                      >
                        <Popup>
                          <div className={styles.popupContent}>
                            <strong>#{report.case_code}</strong><br/>
                            {report.title}<br/>
                            <span className={`${styles.statusTag} ${getStatusClass(report.status)}`}>{report.status}</span>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MarkerClusterGroup>
             )}
           </MapContainer>
        )}
        
        {/* Legend */}
        {!loading && mapMode === "pins" && (
            <div className={styles.mapLegend}>
                {/* ... (Legend Items คงเดิม) ... */}
                <div className={styles.legendItem}>
                    <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png" alt="red"/>
                    <span>รอรับเรื่อง</span>
                </div>
                <div className={styles.legendItem}>
                    <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png" alt="orange"/>
                    <span>ดำเนินการ</span>
                </div>
                <div className={styles.legendItem}>
                    <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png" alt="green"/>
                    <span>เสร็จสิ้น</span>
                </div>
                <div className={styles.legendItem}>
                    <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png" alt="blue"/>
                    <span>ส่งต่อ</span>
                </div>
                <div className={styles.legendItem}>
                    <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png" alt="violet"/>
                    <span>เชิญร่วม</span>
                </div>
                 <div className={styles.legendItem}>
                    <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png" alt="grey"/>
                    <span>ปฏิเสธ</span>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default MapView;
