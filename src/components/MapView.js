import React, { useState, useEffect } from "react";
import styles from "./css/MapView.module.css";
// เพิ่ม Import สำหรับ React Leaflet
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
  // ... (ส่วน State และ Logic เดิม ไม่ต้องแก้) ...
  const [mapMode, setMapMode] = useState("pins");
  const [showFilters, setShowFilters] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const mainFilters = ["ประเภท", "สถานะ"];

  // ... (Logic ดึงข้อมูล useEffect เดิม ใช้ได้เลย) ...
  // ... (ฟังก์ชัน renderSidebar เดิม ใช้ได้เลย) ...
  
  // ตำแหน่งเริ่มต้นของแผนที่ (เช่น กรุงเทพฯ) หรือจะ set ตามเคสแรกที่เจอก็ได้
  const defaultCenter = [13.7563, 100.5018]; 

  return (
    <div className={styles.mapViewContainer}>
      {renderSidebar()}

      <div className={styles.mapContent}>
        {/* เช็คว่ากำลังโหลดหรือไม่ */}
        {loading ? (
           <div className={styles.mapPlaceholder}>กำลังโหลดแผนที่...</div>
        ) : (
           /* เรียกใช้งาน MapContainer */
           <MapContainer 
             center={defaultCenter} 
             zoom={10} 
             style={{ height: "100%", width: "100%" }} // สำคัญ: ต้องกำหนดความสูง
           >
             {/* Layer ภาพแผนที่ (ใช้ OpenStreetMap ฟรี) */}
             <TileLayer
               attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
               url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
             />

             {/* Loop ข้อมูล reports เพื่อปักหมุด */}
             {mapMode === "pins" && reports.map((report) => {
                // ตรวจสอบว่ามีพิกัดจริงหรือไม่ (กัน Error)
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
             
             {/* ถ้าเป็นโหมด Heatmap อาจต้องใช้ Library เสริม หรือใส่ Logic ตรงนี้ */}
             {mapMode === "heatmap" && (
                // ตัวอย่าง Placeholder ถ้ายังไม่ทำ Heatmap จริง
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
