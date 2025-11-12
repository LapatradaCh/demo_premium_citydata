import React, { useState, useEffect } from "react"; // (*** REMOVED useRef ***)
import styles from "./css/MapView.module.css";
import {
  FaMapMarkerAlt,
  FaSearch,
  FaFilter,
  FaTimes,
} from "react-icons/fa";
// (*** REMOVED 'cally' ***)

// ------------------------- ตัวอย่าง Report Data
const reportDataMock = [
  {
    id: "#2025-TYHKE",
    detail:
      "ทดลองแจ้งเรื่องฝาท่อระบายน้ำที่ถนนหน้าหมู่บ้าน มีน้ำขังเยอะมาก",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFmeZPibDL4XbTA9wnhZCpCeK0bFg07Pf2cw&s",
    status: "รอรับเรื่อง",
  },
  {
    id: "#2025-ETNEZE",
    detail: "มีต้นไม้กีดขวาง ทางเดินเท้า ทำให้คนเดินสัญจรไม่สะดวก",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_bRmXqJQOpLMvoKvL89IYlHse2LioPsA8sQ&s",
    status: "เสร็จสิ้น",
  },
];

// ------------------------- Helper
const truncateText = (text, maxLength) => {
  if (!text) return "";
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + "...";
};

// ------------------------- (*** REMOVED DateFilter Component ***)

const MapView = ({ subTab }) => {
  const [mapMode, setMapMode] = useState("pins"); // 'pins' or 'heatmap'

  // --- State for Report List ---
  const [showFilters, setShowFilters] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- (*** MODIFIED Filter Logic ***) ---
  const mainFilters = ["ประเภท", "สถานะ"]; // (*** เหลือแค่ ประเภท, สถานะ ***)
  const locationFilters = []; // (*** ลบฟิลเตอร์พื้นที่ออก ***)
  const modalTitle = "ตัวกรอง (แผนที่ภายใน)";
  const summaryTitle = "รายการแจ้ง (แผนที่ภายใน)";

  // --- Data Fetching Logic ---
  useEffect(() => {
    if (subTab === "แผนที่ภายใน") {
      const fetchCases = async () => {
        try {
          setLoading(true);
          const lastOrg = localStorage.getItem("lastSelectedOrg");
          if (!lastOrg) {
            console.warn("ไม่พบข้อมูลหน่วยงานใน localStorage");
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
    }
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
  
  // 1. หน้า "แผนที่สาธารณะ" (ไม่เปลี่ยนแปลง)
  if (subTab === "แผนที่สาธารณะ") {
    return (
      <div className={styles.mapViewContainer}>
        {/* 1.1 Sidebar (Public) */}
        <div className={styles.mapSidebar}>
          <h3 className={styles.mapSidebarTitle}>ตัวกรองแผนที่สาธารณะ</h3>
          <div className={styles.mapSidebarSection}>
            <div className={styles.filterGroup}>
              <label>ประเภทปัญหา</label>
              <select defaultValue="all">
                <option value="all">ทั้งหมด</option>
                <option value="public">xxxx ไฟฟ้า/ประปา</option>
                <option value="internal">xxxx ถนน/ทางเท้า</option>
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label>สถานะ</label>
              <select defaultValue="all">
                <option value="all">ทั้งหมด</option>
                <option value="pending">รอรับเรื่อง</option>
                <option value="in_progress">กำลังดำเนินการ</option>
                <option value="completed">เสร็จสิ้น</option>
                <option value="forwarded">ส่งต่อ</option>
                <option value="rejected">ปฏิเสธ</option>
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label>ช่วงเวลา</label>
              {/* (DateFilter ถูกลบไปแล้ว แต่ปุ่ม Mockup ของ Public Map ยังอยู่) */}
              <button className={styles.timeRangeButton}>
                กดเพื่อเลือกช่วงเวลา
              </button>
            </div>
          </div>
          <button className={styles.filterApplyButton}>ค้นหา</button>
        </div>

        {/* 1.2 Map Content (Public) */}
        <div className={styles.mapContent}>
          <div className={styles.mapPlaceholder}>
            <span>(พื้นที่แผนที่สาธารณะ)</span>
            <FaMapMarkerAlt
              className={`${styles.mockMapPin} ${styles.pending}`}
              style={{ top: "30%", left: "40%" }}
            />
            <FaMapMarkerAlt
              className={`${styles.mockMapPin} ${styles.coordinating}`}
              style={{ top: "50%", left: "60%" }}
            />
            <div
              className={styles.mockMapPopup}
              style={{
                top: "50%",
                left: "60%",
                transform: "translate(15px, -110%)",
              }}
            >
              <img
                src={reportDataMock[0].image}
                alt="Mock"
                className={styles.mockPopupImage}
              />
              <span className={styles.mockPopupText}>
                {truncateText(reportDataMock[0].detail, 50)}
              </span>
              <span className={`${styles.statusTag} ${styles.coordinating}`}>
                กำลังประสานงาน
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. หน้า "แผนที่ภายใน" (*** แก้ไข Layout ใหม่ ***)
  if (subTab === "แผนที่ภายใน") {
    return (
      <div className={styles.mapViewContainer}>
        
        {/* 2.1 Sidebar (Internal) */}
        <div className={styles.mapSidebar}>
          <h3 className={styles.mapSidebarTitle}>เครื่องมือแผนที่ภายใน</h3>

          {/* (Search + Filter Button) */}
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

          {/* (*** MODIFIED: Filter Modal ***) */}
          {showFilters && (
            <>
              <div
                className={styles.filterModalBackdrop}
                onClick={() => setShowFilters(false)}
              ></div>
              <div className={styles.filterModal}>
                <div className={styles.filterModalHeader}>
                  <h3>{modalTitle}</h3>
                  <button
                    className={styles.filterModalClose}
                    onClick={() => setShowFilters(false)}
                  >
                    <FaTimes />
                  </button>
                </div>
                <div className={styles.filterModalContent}>
                  <div className={styles.reportFilters}>
                    
                    {/* (*** ADDED: รูปแบบแสดงผล ***) */}
                    <div className={styles.filterGroup}>
                      <label>รูปแบบแสดงผล</label>
                      <div className={styles.mapToggles}>
                        <button
                          className={
                            mapMode === "pins"
                              ? styles.toggleButtonActive
                              : styles.toggleButton
                          }
                          onClick={() => setMapMode("pins")}
                        >
                          หมุด
                        </button>
                        <button
                          className={
                            mapMode === "heatmap"
                              ? styles.toggleButtonActive
                              : styles.toggleButton
                          }
                          onClick={() => setMapMode("heatmap")}
                        >
                          Heatmap
                        </button>
                      </div>
                    </div>
                    
                    {/* (*** MODIFIED: เหลือแค่ ประเภท และ สถานะ ***) */}
                    {mainFilters.map((label, i) => (
                      <div className={styles.filterGroup} key={i}>
                        <label>{label}</label>
                        <select defaultValue="all">
                          <option value="all">ทั้งหมด</option>
                          {/* (เพิ่มตัวเลือก Mockup) */}
                          {label === "ประเภท" && (
                             <>
                              <option value="type1">xxxx ไฟฟ้า/ประปา</option>
                              <option value="type2">xxxx ถนน/ทางเท้า</option>
                             </>
                          )}
                          {label === "สถานะ" && (
                             <>
                              <option value="pending">รอรับเรื่อง</option>
                              <option value="coordinating">กำลังประสานงาน</option>
                              <option value="in_progress">กำลังดำเนินการ</option>
                              <option value="completed">เสร็จสิ้น</option>
                              <option value="forwarded">ส่งต่อ</option>
                              <option value="invited">เชิญร่วม</option>
                              <option value="rejected">ปฏิเสธ</option>
                             </>
                          )}
                        </select>
                      </div>
                    ))}
                    
                    {/* (*** locationFilters ถูกลบไปแล้ว (Array ว่าง) ***) */}
                    {locationFilters.map((label, i) => (
                      <div key={i} className={styles.filterGroup}>
                        <label>{label}</label>
                        <select defaultValue="all">
                          <option value="all">ทั้งหมด</option>
                        </select>
                      </div>
                    ))}
                  </div>
                  <button className={styles.filterApplyButton}>ตกลง</button>
                </div>
              </div>
            </>
          )}

          {/* (Report List in Sidebar) */}
          <div className={styles.sidebarReportListContainer}>
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
                      ? report.organizations
                          .map((org) => org.responsible_unit)
                          .join(", ")
                      : "-";

                  return (
                    <div key={report.issue_cases_id} className={styles.reportTableRow}>
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
                        onClick={() =>
                          handleToggleDetails(
                            isExpanded ? null : report.issue_cases_id
                          )
                        }
                      >
                        {isExpanded ? "ซ่อนรายละเอียด" : "อ่านเพิ่มเติม"}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
        
        {/* 2.2 Map Content (Internal) */}
        <div className={styles.mapContent}>
          
          {/* (*** REMOVED: .mapTogglesAbsolute (ย้ายไปใน Modal) ***) */}

          <div className={styles.mapPlaceholder}>
            {mapMode === "pins" ? (
              <>
                <span>(พื้นที่แผนที่ภายใน - หมุด)</span>
                <FaMapMarkerAlt
                  className={`${styles.mockMapPin} ${styles.pending}`}
                  style={{ top: "25%", left: "30%" }}
                  title="รอรับเรื่อง"
                />
                <FaMapMarkerAlt
                  className={`${styles.mockMapPin} ${styles.coordinating}`}
                  style={{ top: "15%", left: "55%" }}
                  title="กำลังประสานงาน"
                />
                <FaMapMarkerAlt
                  className={`${styles.mockMapPin} ${styles.in_progress}`}
                  style={{ top: "40%", left: "55%" }}
                  title="กำลังดำเนินการ"
                />
                <FaMapMarkerAlt
                  className={`${styles.mockMapPin} ${styles.completed}`}
                  style={{ top: "65%", left: "40%" }}
                  title="เสร็จสิ้น"
                />
                <div className={styles.mapLegend}>
                    <div className={styles.legendItem}>
                      <FaMapMarkerAlt className={styles.pending} />
                      <span>รอรับเรื่อง</span>
                    </div>
                    <div className={styles.legendItem}>
                      <FaMapMarkerAlt className={styles.coordinating} />
                      <span>ประสานงาน</span>
                    </div>
                    <div className={styles.legendItem}>
                      <FaMapMarkerAlt className={styles.in_progress} />
                      <span>ดำเนินการ</span>
                    </div>
                    <div className={styles.legendItem}>
                      <FaMapMarkerAlt className={styles.completed} />
                      <span>เสร็จสิ้น</span>
                    </div>
                </div>
              </>
            ) : (
              <span>(Mockup Heatmap)</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // (Default case)
  return (
    <div className={styles.mapViewContainer}>
      <div>{subTab}</div>
    </div>
  );
};

export default MapView;
