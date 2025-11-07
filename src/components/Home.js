import React, { useState, useEffect, useRef } from "react";
// (*** MODIFIED ***) นำเข้า CSS Module ที่ถูกต้อง
import styles from "./css/Home.module.css";
import logo from "./logo.png";
import {
  FaMapMarkedAlt,
  FaClipboardList,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
  FaSearch,
  FaFilter,
  FaTimes, // ไอคอนกากบาท
  FaBuilding,
  // ไอคอนสำหรับหน้าสถิติใหม่
  FaHourglassHalf,
  FaSyncAlt,
  FaCheckCircle,
  FaChartLine, // เพิ่มสำหรับ Chart
  FaChartPie, // ใช้สำหรับ Donut Chart Placeholder
  FaShare,
  FaTimesCircle,
  FaBookmark,
  FaTools,
  FaTable, // เพิ่มไอคอนตารางสำหรับเมนูใหม่
  FaMap, // ไอคอนสำหรับปุ่ม "ดูข้อมูลแผนที่"
  // (*** ADDED ***) ไอคอนสำหรับ Dropdown และ Settings
  FaChevronDown,
  FaChevronUp,
  FaQrcode,
  FaChevronRight,
  FaBell,
  FaLanguage,
  FaLink,
  // (*** ADDED ***) ไอคอนสำหรับแผนที่
  FaMapMarkerAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import liff from "@line/liff";
import "cally";

// ------------------------- (*** ข้อมูลและ Component ย่อยสำหรับหน้าสถิติใหม่ ***)

// (Component ย่อยสำหรับกล่อง KPI แบบละเอียด 8 กล่อง)
const StatsDetailBox = ({ title, value, percentage, note, color, cssClass }) => (
  <div
    className={`${styles.statsDetailBox} ${styles[cssClass] || ""}`}
    // (*** MODIFIED ***) แก้ไขตรงนี้ให้รับค่าสีตรงๆ
    style={{ borderTopColor: color }}
  >
    <div className={styles.statsDetailHeader}>
      <span className={styles.statsDetailTitle}>{title}</span>
      <span className={styles.statsDetailValue}>{value}</span>
    </div>
    <span className={styles.statsDetailPercentage}>({percentage})</span>
    {note && <span className={styles.statsDetailNote}>{note}</span>}
  </div>
);

// (*** NEW ***) (Component ย่อยสำหรับ Mockup Line Chart - #4 แนวโน้ม)
const MockLineChart = () => (
  <div className={styles.mockLineChartContainer}>
    <div className={styles.mockLineChartGrid}>
      {/* ส่วนนี้เป็นแค่เส้นตารางพื้นหลัง CSS จะจัดการ */}
      {[...Array(6)].map((_, i) => (
        <span key={i}></span>
      ))}
    </div>
    <svg className={styles.mockLineChartPath} viewBox="0 0 100 50" preserveAspectRatio="none">
      <path d="M 0 40 Q 10 10, 20 30 T 40 20 Q 50 10, 60 25 T 80 40 Q 90 50, 100 20" />
    </svg>
    <div className={styles.mockLineChartLabels}>
      <span>จ.</span>
      <span>อ.</span>
      <span>พ.</span>
      <span>พฤ.</span>
      <span>ศ.</span>
      <span>ส.</span>
      <span>อา.</span>
    </div>
  </div>
);

// (*** NEW ***) (Component กล่องสำหรับ Line Chart - #4)
const TrendChartBox = () => (
  <div className={styles.chartBox}>
    <h4 className={styles.chartBoxTitle}>แนวโน้มเรื่องแจ้งตามช่วงเวลา</h4>
    <MockLineChart />
  </div>
);


// (*** NEW ***) (Component ย่อยสำหรับ Mockup Horizontal Bar Chart - #2 ประเภทปัญหา)
const MockHorizontalBarChart = () => (
  <div className={styles.mockHorizontalBarChart}>
    <div className={styles.mockHBarItem}>
      <span className={styles.mockHBarLabel}>ถนน/ทางเท้า</span>
      <div className={styles.mockHBar}>
        {/* (*** MODIFIED ***) ใส่สีตรงๆ */}
        <div className={styles.mockHBarFill} style={{ width: "80%", background: "#007bff" }}></div>
      </div>
      <span className={styles.mockHBarValue}>42</span>
    </div>
    <div className={styles.mockHBarItem}>
      <span className={styles.mockHBarLabel}>ไฟฟ้า/ประปา</span>
      <div className={styles.mockHBar}>
        {/* (*** MODIFIED ***) ใส่สีตรงๆ */}
        <div className={styles.mockHBarFill} style={{ width: "65%", background: "#ffc107" }}></div>
      </div>
      <span className={styles.mockHBarValue}>31</span>
    </div>
    <div className={styles.mockHBarItem}>
      <span className={styles.mockHBarLabel}>ต้นไม้/พื้นที่สีเขียว</span>
      <div className={styles.mockHBar}>
        {/* (*** MODIFIED ***) ใส่สีตรงๆ */}
        <div className={styles.mockHBarFill} style={{ width: "40%", background: "#057A55" }}></div>
      </div>
      <span className={styles.mockHBarValue}>18</span>
    </div>
    <div className={styles.mockHBarItem}>
      <span className={styles.mockHBarLabel}>อื่นๆ</span>
      <div className={styles.mockHBar}>
        {/* (*** MODIFIED ***) ใส่สีตรงๆ */}
        <div className={styles.mockHBarFill} style={{ width: "25%", background: "#6c757d" }}></div>
      </div>
      <span className={styles.mockHBarValue}>10</span>
    </div>
  </div>
);


// (Component ย่อยสำหรับกล่องที่มีแท็บ "ประเภทปัญหา")
// (*** MODIFIED ***) ลบแท็บออก เปลี่ยนเป็นกราฟแนวนอน
const ProblemTypeBox = () => {
  return (
    <div className={styles.chartBox}>
      {/* (*** MODIFIED ***) เปลี่ยนชื่อ Title */}
      <h4 className={styles.chartBoxTitle}>สัดส่วนเรื่องแจ้งตามประเภท</h4>
      
      {/* (*** DELETED ***) ลบแท็บ .problemTypeTabs */}

      <div className={styles.problemTypeContent}>
        {/* (*** MODIFIED ***) เปลี่ยนเป็น Horizontal Bar Chart */}
        <MockHorizontalBarChart />
      </div>
    </div>
  );
};

// (*** NEW ***) (Component กล่องสำหรับ Satisfaction - #6)
const SatisfactionBox = () => (
  <div className={styles.chartBox}>
    <h4 className={styles.chartBoxTitle}>ความพึงพอใจของประชาชน</h4>
    <div className={styles.satisfactionContainer}>
      <div className={styles.satisfactionScore}>
        4.2 <span>/ 5</span>
      </div>
      <div className={styles.satisfactionStars}>
        <span className={`${styles.ratingStar} ${styles.active}`}>★</span>
        <span className={`${styles.ratingStar} ${styles.active}`}>★</span>
        <span className={`${styles.ratingStar} ${styles.active}`}>★</span>
        <span className={`${styles.ratingStar} ${styles.active}`}>★</span>
        <span className={`${styles.ratingStar}`}>★</span>
      </div>
      <div className={styles.satisfactionFooter}>(จาก 23 การประเมิน)</div>
    </div>
  </div>
);

// (*** NEW ***) (Component ย่อยสำหรับ Mockup Stacked Horizontal Bar Chart)
// (นี่คือ Component ใหม่ที่เพิ่มเข้ามา)
const MockOrgStackedBarChart = () => {
  // ข้อมูลสมมติสำหรับกราฟแท่งแบบซ้อน
  const stackedData = [
    {
      name: "หน่วยงาน xx",
      pending: 10,  // 10%
      inProgress: 20, // 20%
      completed: 70,  // 70%
      total: 120, // (ข้อมูลนี้ใช้แสดงเป็นตัวเลข)
    },
    {
      name: "หน่วยงาน xx",
      pending: 30,  // 30%
      inProgress: 40, // 40%
      completed: 30,  // 30%
      total: 85,
    },
    {
      name: "หน่วยงาน xx",
      pending: 5,   // 5%
      inProgress: 15, // 15%
      completed: 80,  // 80%
      total: 40,
    },
    {
      name: "หน่วยงาน xx",
      pending: 50,  // 50%
      inProgress: 30, // 30%
      completed: 20,  // 20%
      total: 15,
    },
  ];

  return (
    <div className={styles.mockStackedBarChart}>
      {stackedData.map((item, index) => (
        // (*** MODIFIED ***) เพิ่ม key ที่ดีกว่า
        <div key={`${item.name}-${index}`} className={styles.mockHBarItem}>
          {/* ใช้ .mockHBarLabel และ .mockHBarValue จากสไตล์เดิมได้ */}
          <span className={styles.mockHBarLabel}>{item.name}</span>
          <div className={styles.mockStackedHBar}>
            <div
              className={styles.mockStackedBarSegment}
              style={{ width: `${item.pending}%`, background: "#dc3545" }} // สีแดง (รอรับเรื่อง)
              title={`รอรับเรื่อง: ${item.pending}%`}
            ></div>
            <div
              className={styles.mockStackedBarSegment}
              style={{ width: `${item.inProgress}%`, background: "#ffc107" }} // สีเหลือง (กำลังทำ)
              title={`กำลังดำเนินการ: ${item.inProgress}%`}
            ></div>
            <div
              className={styles.mockStackedBarSegment}
              style={{ width: `${item.completed}%`, background: "#057A55" }} // สีเขียว (เสร็จสิ้น)
              title={`เสร็จสิ้น: ${item.completed}%`}
            ></div>
          </div>
          <span className={styles.mockHBarValue}>{item.total}</span>
        </div>
      ))}
      {/* คำอธิบายสัญลักษณ์ (Legend) */}
      <div className={styles.mockStackedBarLegend}>
        <span><span style={{ background: "#dc3545" }}></span> รอรับเรื่อง</span>
        <span><span style={{ background: "#ffc107" }}></span> กำลังดำเนินการ</span>
        <span><span style={{ background: "#057A55" }}></span> เสร็จสิ้น</span>
      </div>
    </div>
  );
};


// (*** NEW ***) (Component กราฟแท่งแนวนอนธรรมดา ที่นำกลับมาใช้ซ้ำได้)
const MockSimpleBarChart = ({ data, barColor, valueSuffix, maxValue }) => {
  // หาสเกลสูงสุด ถ้าไม่ได้กำหนดมา
  const max = maxValue || Math.max(...data.map(d => d.value));

  return (
    <div className={styles.mockHorizontalBarChart}>
      {data.map((item, index) => (
        <div key={`${item.name}-${index}`} className={styles.mockHBarItem}>
          <span className={styles.mockHBarLabel}>{item.name}</span>
          <div className={styles.mockHBar}>
            <div 
              className={styles.mockHBarFill} 
              style={{ 
                width: `${(item.value / max) * 100}%`, 
                background: barColor 
              }}
              title={`${item.value} ${valueSuffix}`}
            ></div>
          </div>
          <span className={styles.mockHBarValue}>{item.value} {valueSuffix}</span>
        </div>
      ))}
    </div>
  );
};


// (*** MODIFIED ***)
// ข้อมูล KPI 6 รายการที่สำคัญ (ปรับปรุงตามคำขอ และใส่สีตรงๆ)
const kpiDetails = [
  {
    title: "ทั้งหมด", // (#1)
    value: 71,
    percentage: "100%",
    note: null,
    color: "#f39c12", // (*** MODIFIED ***)
    cssClass: "stats-cream",
  },
  {
    title: "รอรับเรื่อง", // (#3)
    value: 21,
    percentage: "29.58%",
    note: "เกิน 1 เดือน 21 เรื่อง",
    color: "#dc3545", // (*** MODIFIED ***)
    cssClass: "stats-red",
  },
  {
    title: "กำลังดำเนินการ", // (#3)
    value: 18,
    percentage: "25.35%",
    note: "เกิน 1 เดือน 18 เรื่อง",
    color: "#ffc107", // (*** MODIFIED ***)
    cssClass: "stats-yellow",
  },
  {
    title: "เสร็จสิ้น", // (#3)
    value: 23,
    percentage: "32.39%",
    note: "จัดการเอง 3 เรื่อง (13%)",
    color: "#057A55", // (*** MODIFIED ***)
    cssClass: "stats-green",
  },
  {
    title: "ส่งต่อ(ใหม่)",
    value: 0,
    percentage: "0.00%",
    note: "(ส่งต่อหน่วยงานอื่น)",
    color: "#007bff", // (*** MODIFIED ***)
    cssClass: "stats-blue",
  },
  {
    title: "ไม่เกี่ยวข้อง",
    value: 9,
    percentage: "12.68%",
    note: "จัดการเอง 1 เรื่อง (11%)",
    color: "#6c757d", // (*** MODIFIED ***)
    cssClass: "stats-grey",
  },
];


// (ข้อมูลฟิลเตอร์ - *เก็บไว้เผื่อใช้ แต่ไม่ได้แสดงผลแล้ว*)
const kpiFilters = [
  { id: "current", label: "ข้อมูลปัจจุบัน" },
  { id: "month", label: "ย้อนหลัง 1 เดือน" },
  { id: "year", label: "ย้อนหลัง 1 ปี" },
];

const compareFilters = ["2021", "2022", "2023", "2024"];

// ------------------------- (*** DELETED ***)
// (ลบตัวแปร reportData ทั้งหมด)
// -------------------------

// ------------------------- Helper
const toYYYYMMDD = (d) => (d ? d.toISOString().split("T")[0] : null);

const truncateText = (text, maxLength) => {
  if (!text || text.length <= maxLength) {
    return text || "";
  }
  return text.substring(0, maxLength) + "...";
};

// (*** ADDED ***) (Helper function สำหรับจัดรูปแบบวันที่จาก API)
const formatApiDateTime = (isoString) => {
  if (!isoString) return "-";
  try {
    const d = new Date(isoString);
    // จัดรูปแบบเป็น "4 เม.ย. 68, 14:19"
    return d.toLocaleString("th-TH", {
      day: "numeric",
      month: "short",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Bangkok", // ปรับ Timezone ตามต้องการ
    });
  } catch (e) {
    return "N/A";
  }
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
            <svg aria-label="Previous" slot="previous" viewBox="0 0 24 24">
              <path fill="currentColor" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
            <svg aria-label="Next" slot="next" viewBox="0 0 24 24">
              <path fill="currentColor" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
            <calendar-month></calendar-month>
          </calendar-date>
        </div>
      )}
    </div>
  );
};

// ------------------------- Report Table
// (*** MODIFIED ***) (แก้ไขทั้ง Component เพื่อ fetch ข้อมูล)
const ReportTable = ({ subTab, organizationId }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState(null);

  // (*** ADDED ***) State สำหรับเก็บข้อมูลและสถานะการโหลด
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // (*** ADDED ***) useEffect สำหรับดึงข้อมูลจาก API
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError(null);
      
      // (ดู "ข้อสมมติฐาน" ด้านล่างเกี่ยวกับ API URL นี้)
      let apiUrl = "https://premium-citydata-api-ab.vercel.app/api/cases/issue_cases";

      try {
        if (subTab === "เฉพาะหน่วยงาน") {
          if (!organizationId) {
            // ถ้าอยู่แท็บ "เฉพาะหน่วยงาน" แต่ยังไม่มี ID (เช่น โหลดไม่เสร็จ)
            console.warn("No organization ID available, skipping fetch.");
            setLoading(false);
            setReports([]);
            return;
          }
          // (ข้อสมมติฐาน) API รองรับการ filter ด้วย ?organization_id=...
          apiUrl = `https://premium-citydata-api-ab.vercel.app/api/cases/issue_cases?organization_id=${organizationId}`;
        }
        
        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // แปลงข้อมูล API ให้ตรงกับ format ที่ UI คาดหวัง
        const formattedData = data.map((apiCase) => ({
          id: apiCase.case_code, // (SQL: case_code)
          detail: apiCase.title, // (SQL: title)
          full_description: apiCase.description, // (SQL: description)
          image: apiCase.cover_image_url || null, // (SQL: cover_image_url)

          // (ข้อสมมติฐาน) API ส่ง issue_type.name มาให้
          // ถ้าไม่ ให้ลองใช้ tags[0] หรือ fallback ไปที่ issue_type_id
          category:
            apiCase.issue_type?.name ||
            (apiCase.tags && apiCase.tags[0]) ||
            apiCase.issue_type_id ||
            "ไม่ระบุ",

          datetime_in: formatApiDateTime(apiCase.created_at), // (SQL: created_at)
          datetime_out: formatApiDateTime(apiCase.updated_at), // (SQL: updated_at)

          // (ข้อสมมติฐาน) UI ต้องแสดง Lat/Lon ตาม SQL
          location: `Lat: ${apiCase.latitude}, Lon: ${apiCase.longitude}`,

          // (ข้อสมมติฐาน) API ส่ง organization.name มาให้
          responsible_unit: apiCase.organization?.name || "ไม่ระบุหน่วยงาน",

          status: apiCase.status, // (SQL: status)
          
          // (ข้อสมมติฐาน) SQL ไม่มี rating แต่ UI มี
          rating: apiCase.rating || null,
        }));
        
        setReports(formattedData);

      } catch (err) {
        console.error("Failed to fetch reports:", err);
        setError(err.message);
        setReports([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [subTab, organizationId]); // <-- Fetch ใหม่ เมื่อเปลี่ยนแท็บ หรือเมื่อ orgId โหลดเสร็จ

  const handleToggleDetails = (id) => {
    setExpandedCardId((prevId) => (prevId === id ? null : id));
  };

  return (
    <>
      {/* Search & Filter Button */}
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
              <button
                className={styles.filterModalClose}
                onClick={() => setShowFilters(false)}
              >
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

      {/* Summary (*** MODIFIED ***) */}
      <div className={styles.reportSummary}>
        <strong>{summaryTitle}</strong> ({loading ? "..." : reports.length}{" "}
        รายการ)
      </div>

      {/* (*** ADDED ***) Loading / Error / Empty States */}
      {loading && (
        <div className={styles.loadingPlaceholder} style={{ padding: "20px", textAlign: "center" }}>
          กำลังโหลดข้อมูล...
        </div>
      )}

      {!loading && error && (
        <div className={styles.loadingPlaceholder} style={{ padding: "20px", textAlign: "center", color: "red" }}>
          เกิดข้อผิดพลาด: {error}
        </div>
      )}

      {!loading && !error && reports.length === 0 && (
        <div className={styles.loadingPlaceholder} style={{ padding: "20px", textAlign: "center" }}>
          ไม่พบข้อมูล
        </div>
      )}

      {/* Cards (*** MODIFIED ***) */}
      {!loading && !error && reports.length > 0 && (
        <div className={styles.reportTableContainer}>
          {reports.map((report) => { {/* (*** MODIFIED ***) ใช้ state 'reports' */}
            const isExpanded = expandedCardId === report.id;
            return (
              <div key={report.id} className={styles.reportTableRow}>
                <img
                  // (*** MODIFIED ***) เพิ่ม fallback image
                  src={report.image || logo} // ใช้วิธีแสดง logo ของหน่วยงานแทนถ้าไม่มีรูป
                  alt="Report"
                  className={styles.reportImage}
                  // (*** ADDED ***) จัดการรูปที่ error
                  onError={(e) => { e.target.onerror = null; e.target.src=logo; }}
                />
                <div className={styles.reportHeader}>
                  <span className={styles.reportIdText}>{report.id}</span>
                  <p className={styles.reportDetailText}>
                    {truncateText(report.detail, 40)}
                  </p>
                </div>
                <div className={styles.reportStatusGroup}>
                  <span
                    className={`${styles.statusTag} ${
                      report.status === "รอรับเรื่อง"
                        ? styles.pending
                        : report.status === "เสร็จสิ้น"
                        ? styles.completed
                        : report.status === "กำลังดำเนินการ"
                        ? styles.in_progress // (เพิ่ม 'in_progress' เผื่อไว้)
                        : ""
                    }`}
                  >
                    {report.status}
                  </span>
                  <div className={styles.rating}>
                    {report.rating &&
                      [...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`${styles.ratingStar} ${
                            i < report.rating ? styles.active : ""
                          }`}
                        >
                          ★
                        </span>
                      ))}
                  </div>
                </div>

                {isExpanded && (
                  <>
                    <div className={styles.mainDetails}>
                      {/* (*** MODIFIED ***) แสดง full_description ถ้ามี */}
                      <p style={{marginBottom: "10px"}}>{report.full_description || report.detail}</p>
                      <span>ประเภท: {report.category}</span>
                      <span>แจ้งเข้า: {report.datetime_in}</span>
                      <span>อัพเดต: {report.datetime_out}</span>
                    </div>
                    <div className={styles.locationDetails}>
                      <span>ที่ตั้ง: {report.location}</span>
                      <span>ผู้รับผิดชอบ: {report.responsible_unit}</span>
                    </div>
                  </>
                )}
                <button
                  className={styles.toggleDetailsButton}
                  onClick={() => handleToggleDetails(report.id)}
                >
                  {isExpanded ? "ซ่อนรายละเอียด" : "อ่านเพิ่มเติม"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

// ------------------------- (*** 1. StatisticsView - "ปรับปรุงใหม่ตาม Spec" ***)
const StatisticsView = ({ subTab }) => {
  // (State ยังอยู่ แต่ JSX ถูกลบไปแล้ว)
  const [activeKpiFilter, setActiveKpiFilter] = useState("current");
  const [activeCompareFilter, setActiveCompareFilter] = useState("2024");
  // (*** ADDED ***) State สำหรับ dropdown หน่วยงาน
  const [isOpsUnitsOpen, setIsOpsUnitsOpen] = useState(false);

  return (
    <div className={styles.statsContainer}>
      {/* 1. Header (ชื่อหน้า) */}
      <div className={styles.statsHeader}>
        <h1 className={styles.statsPageTitle}>ภาพรวมสถิติ</h1>
      </div>

      {/* 2. Sub-Header (วันที่ และ Subtitle) */}
      <div className={styles.statsSubHeader}>
        <span className={styles.statsCurrentDate}>
          วันพุธที่ 5 พฤศจิกายน 2568
        </span>
        <span className={styles.statsSubtitle}>
          ข้อมูลปัจจุบัน (จำนวนข้อมูลเรื่องทั้งหมด ที่ประชาชนแจ้งเข้ามา)
        </span>
      </div>

      {/* 4. Detailed KPI Grid (ตาราง KPI 6 กล่อง) - (#1 และ #3) */}
      <div className={styles.statsDetailGrid}>
        {kpiDetails.map((kpi) => (
          <StatsDetailBox
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            percentage={kpi.percentage}
            note={kpi.note}
            color={kpi.color}
            cssClass={kpi.cssClass}
          />
        ))}
      </div>


      {/* 5. (*** MODIFIED ***) Main Chart Grid (ปรับเป็น 2 คอลัมน์ตามรูปที่ 2) */}
      <div className={styles.statsBottomGrid}>

        {/* --- (*** NEW WRAPPER ***) --- */}
        {/* คอลัมน์ที่ 1: ประเภทปัญหา + ความพึงพอใจ */}
        <div className={styles.statsGridColumn}>
          
          {/* (*** DELETED ***) ลบ TrendChartBox (กราฟเส้น) ออก */}
          
          {/* (*** MODIFIED ***) กล่อง "ประเภทของปัญหา" (#2) */}
          <ProblemTypeBox />

          {/* (*** NEW ***) กล่อง "ความพึงพอใจ" (#6) */}
          <SatisfactionBox />
        </div>
        {/* --- (*** END NEW WRAPPER ***) --- */}


        {/* คอลัมน์ที่ 2: การปฏิบัติงาน */}
        {/* กล่อง "การปฏิบัติงาน" (#5, #7, #8) */}
        <div className={styles.chartBox}>
          <h4 className={styles.chartBoxTitle}>การปฏิบัติงานของเจ้าหน้าที่</h4>
          <div className={styles.opsContent}>
            {/* (#8) จำนวนเจ้าหน้าที่ */}
            <div className={styles.opsKpi}>
              <span>เจ้าหน้าที่ทั้งหมด</span>
              <strong>12 (คน)</strong>
            </div>
            {/* (#5) ระยะเวลาเฉลี่ย */}
            <div className={styles.opsDetail}>
              <span>ค่าเฉลี่ยโดยประมาณของระยะเวลาการทำงาน</span>
              <span>3.2 วัน</span>
            </div>

            {/* (#7) หน่วยงาน */}
            <div
              className={`${styles.opsDetail} ${styles.clickable}`}
              onClick={() => setIsOpsUnitsOpen(!isOpsUnitsOpen)}
            >
              <div className={styles.opsDetailHeader}>
                <span>หน่วยงานที่ร่วมรับผิดชอบ</span>
                <span>
                  5 หน่วยงาน
                  {isOpsUnitsOpen ? (
                    <FaChevronUp className={styles.opsToggleIcon} />
                  ) : (
                    <FaChevronDown className={styles.opsToggleIcon} />
                  )}
                </span>
              </div>
              {isOpsUnitsOpen && (
                <div className={styles.opsUnitList}>
                  <div className={styles.opsUnitItem}>xxxx หน่วยงานที่ 1</div>
                  <div className={styles.opsUnitItem}>xxxx หน่วยงานที่ 2</div>
                  <div className={styles.opsUnitItem}>xxxx หน่วยงานที่ 3</div>
                  <div className={styles.opsUnitItem}>xxxx หน่วยงานที่ 4</div>
                  <div className={styles.opsUnitItem}>xxxx หน่วยงานที่ 5</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ------------------------- (*** 2. OrganizationStatisticsView - "ปรับปรุงใหม่ตาม Spec" ***)
// (*** MODIFIED ***) อัปเดตตารางตามคำขอ
const OrganizationStatisticsView = () => {
  // State ภายในสำหรับจัดการเมนูด้านซ้าย
  
  // (*** นี่คือจุดที่แก้ไขตามคำขอล่าสุด ***)
  // แก้ไข "table" เป็น "graph" เพื่อให้กราฟแสดงเป็นหน้าเริ่มต้น
  const [activeOrgTab, setActiveOrgTab] = useState("graph"); // 'table' หรือ 'graph'

  // เมนู 2 อันที่เรารวบไอเดียแล้ว
  const menuItems = [
    { id: "table", title: "ตารางสถิติรายหน่วยงาน", icon: <FaTable /> },
    { id: "graph", title: "กราฟเปรียบเทียบ", icon: <FaChartBar /> },
  ];

  // (*** MODIFIED ***) เพิ่มข้อมูล "xx" สำหรับคอลัมน์ใหม่
  const orgTableData = [
    {
      id: 1,
      name: "หน่วยงาน xx",
      total: "xx",
      pending: "xx",
      inProgress: "xx",
      completed: "xx",
      forwarded: "xx",
      rejected: "xx",
      staffCount: "xx",
      satisfaction: "xx",
      avgTime: "xx.x วัน",
    },
    {
      id: 2,
      name: "หน่วยงาน xx",
      total: "xx",
      pending: "xx",
      inProgress: "xx",
      completed: "xx",
      forwarded: "xx",
      rejected: "xx",
      staffCount: "xx",
      satisfaction: "xx",
      avgTime: "xx.x วัน",
    },
    {
      id: 3,
      name: "หน่วยงาน xx",
      total: "xx",
      pending: "xx",
      inProgress: "xx",
      completed: "xx",
      forwarded: "xx",
      rejected: "xx",
      staffCount: "xx",
      satisfaction: "xx",
      avgTime: "xx.x วัน",
    },
    {
      id: 4,
      name: "หน่วยงาน xx",
      total: "xx",
      pending: "xx",
      inProgress: "xx",
      completed: "xx",
      forwarded: "xx",
      rejected: "xx",
      staffCount: "xx",
      satisfaction: "xx",
      avgTime: "xx.x วัน",
    },
  ];

  // (*** NEW ***) ข้อมูลสมมติสำหรับกราฟใหม่
  const satisfactionData = [
    { name: "หน่วยงาน xx", value: 4.2 },
    { name: "หน่วยงาน xx", value: 3.8 },
    { name: "หน่วยงาน xx", value: 4.7 },
    { name: "หน่วยงาน xx", value: 2.9 },
  ];

  const avgTimeData = [
    { name: "หน่วยงาน xx", value: 3.2 },
    { name: "หน่วยงาน xx", value: 5.1 },
    { name: "หน่วยงาน xx", value: 2.5 },
    { name: "หน่วยงาน xx", value: 7.0 },
  ];


  return (
    <div className={styles.orgStatsContainer}>
      {/* 1. เมนูด้านซ้าย */}
      <div className={styles.orgStatsSidebar}>
        <h3 className={styles.orgStatsMenuTitle}>สถิติองค์กร</h3>
        <nav className={styles.orgStatsMenuNav}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`${styles.orgStatsMenuButton} ${
                activeOrgTab === item.id ? styles.active : ""
              }`}
              onClick={() => setActiveOrgTab(item.id)}
            >
              {item.icon}
              <span>{item.title}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* 2. พื้นที่แสดงเนื้อหาด้านขวา (Mockup ใหม่) */}
      <div className={styles.orgStatsContent}>
        {activeOrgTab === "table" && (
          <div className={styles.chartBox}>
            <h4 className={styles.chartBoxTitle}>ตารางสถิติรายหน่วยงาน</h4>
            
            {/* (*** MODIFIED ***) อัปเดตตารางให้มีคอลัมน์มากขึ้น */}
            <div className={styles.orgStatsTableWrapper}> {/* (ADDED WRAPPER for scrolling) */}
              <table className={styles.orgStatsTable}>
                <thead>
                  <tr>
                    <th>หน่วยงาน</th>
                    <th>เรื่องทั้งหมด</th>
                    <th>รอรับเรื่อง</th>
                    <th>กำลังดำเนินการ</th>
                    <th>เสร็จสิ้น</th>
                    <th>ส่งต่อ(ใหม่)</th>
                    <th>ไม่เกี่ยวข้อง</th>
                    <th>เจ้าหน้าที่</th>
                    <th>ความพึงพอใจ</th>
                    <th>เวลาเฉลี่ย</th>
                  </tr>
                </thead>
                <tbody>
                  {orgTableData.map((org) => (
                    <tr key={org.id}>
                      <td className={styles.unitNameCell}>{org.name}</td>
                      <td>{org.total}</td>
                      <td>{org.pending}</td>
                      <td>{org.inProgress}</td>
                      <td>{org.completed}</td>
                      <td>{org.forwarded}</td>
                      <td>{org.rejected}</td>
                      <td>{org.staffCount}</td>
                      <td>{org.satisfaction}</td>
                      <td>{org.avgTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* --- (*** นี่คือจุดที่แก้ไข ***) --- */}
        {activeOrgTab === "graph" && (
          // (*** ADDED ***) เพิ่ม Wrapper สำหรับแดชบอร์ด
          <div className={styles.orgGraphDashboard}>
            
            {/* กราฟที่ 1: สัดส่วนงาน */}
            <div className={styles.chartBox}>
              <h4 className={styles.chartBoxTitle}>
                กราฟเปรียบเทียบสัดส่วนงาน (รอรับ/กำลังทำ/เสร็จสิ้น)
              </h4>
              <MockOrgStackedBarChart />
            </div>

            {/* กราฟที่ 2: ความพึงพอใจ */}
            <div className={styles.chartBox}>
              <h4 className={styles.chartBoxTitle}>
                กราฟเปรียบเทียบความพึงพอใจ
              </h4>
              <MockSimpleBarChart 
                data={satisfactionData}
                barColor="#007bff"
                valueSuffix="คะแนน"
                maxValue={5} // (*** ADDED ***) กำหนดค่าสูงสุดเป็น 5
              />
            </div>

            {/* กราฟที่ 3: เวลาเฉลี่ย */}
            <div className={styles.chartBox}>
              <h4 className={styles.chartBoxTitle}>
                กราฟเปรียบเทียบเวลาเฉลี่ย (วัน)
              </h4>
              <div className={styles.chartNote}>(*ยิ่งน้อยยิ่งดี)</div>
              <MockSimpleBarChart 
                data={avgTimeData}
                barColor="#6c757d"
                valueSuffix="วัน"
                // (*** ADDED ***) ไม่กำหนด maxValue เพื่อให้สเกลอัตโนมัติ
              />
            </div>

          </div>
        )}
        {/* --- (*** จบจุดที่แก้ไข ***) --- */}
      </div>
    </div>
  );
};


// (*** ADDED ***)
// ------------------------- (*** 3. SettingsView - "เนื้อหาใหม่" ***)

// (Component ย่อยสำหรับ Toggle Switch)
const MockToggle = () => (
  <label className={styles.mockToggle}>
    <input type="checkbox" />
    <span className={styles.mockSlider}></span>
  </label>
);

// (Component หลักสำหรับหน้าตั้งค่า)
const SettingsView = ({ subTab }) => {
  // 1. หน้า "ตั้งค่า"
  if (subTab === "ตั้งค่า") {
    return (
      <div className={styles.settingsContainer}>
        <div className={styles.settingsSection}>
          <h3 className={styles.settingsTitle}>การแจ้งเตือน</h3>
          <div className={styles.settingsItem}>
            <div className={styles.settingsItemText}>
              <FaBell />
              <span>รับการแจ้งเตือน (Push)</span>
            </div>
            <MockToggle />
          </div>
        </div>

        <div className={styles.settingsSection}>
          <h3 className={styles.settingsTitle}>ทั่วไป</h3>
          <div className={styles.settingsItem}>
            <div className={styles.settingsItemText}>
              <FaLanguage />
              <span>ภาษา</span>
            </div>
            <div className={styles.settingsItemValue}>
              <span>ไทย</span>
              <FaChevronRight />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. หน้า "QRCode หน่วยงาน"
  if (subTab === "QRCode หน่วยงาน") {
    return (
      <div className={styles.settingsContainer}>
        <div className={styles.settingsSection}>
          <h3 className={styles.settingsTitle}>QRCode ประจำหน่วยงาน</h3>
          <p className={styles.settingsSubtitle}>
            ใช้ QR Code นี้สำหรับแชร์ให้ประชาชนทั่วไป
            เพื่อแจ้งเรื่องเข้ามายังหน่วยงานของคุณ
          </p>
          <div className={styles.qrCodePlaceholder}>
            <FaQrcode className={styles.mockQrIcon} />
            <span>(Mockup QR Code)</span>
          </div>
          <button className={styles.filterApplyButton} style={{ width: "100%" }}>
            ดาวน์โหลด QR Code
          </button>
        </div>
      </div>
    );
  }

  // 3. หน้า "QRCode สร้างเอง"
  if (subTab === "QRCode สร้างเอง") {
    return (
      <div className={styles.settingsContainer}>
        <div className={styles.settingsSection}>
          <h3 className={styles.settingsTitle}>สร้าง QR Code เอง</h3>
          <p className={styles.settingsSubtitle}>
            สร้าง QR Code เพื่อลิงก์ไปยังประเภทปัญหาที่กำหนดเอง
            (เช่น "แจ้งเหตุไฟดับ")
          </p>
          <form className={styles.qrForm}>
            <div className={styles.filterGroup}>
              <label>เลือกประเภทปัญหา</label>
              <select>
                <option>xxxx (ทั้งหมด)</option>
                <option>xxxx ไฟฟ้า/ประปา</option>
                <option>xxxx ถนน/ทางเท้า</option>
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label>
                <FaLink /> ชื่อลิงก์ (ไม่บังคับ)
              </label>
              <input
                type="text"
                placeholder="เช่น 'qr-ไฟดับ-โซนA'"
                className={styles.searchInput} // (ใช้สไตล์ร่วม)
              />
            </div>
            <button className={styles.filterApplyButton}>สร้าง QR Code</button>
          </form>

          {/* (พื้นที่แสดงผลลัพธ์) */}
          <div
            className={styles.qrCodePlaceholder}
            style={{ marginTop: "20px" }}
          >
            <span>(QR Code ที่สร้างจะแสดงที่นี่)</span>
          </div>
        </div>
      </div>
    );
  }

  // (Default case)
  return (
    <div className={styles.settingsContainer}>
      <div>{subTab}</div>
    </div>
  );
};

// (*** ADDED ***)
// ------------------------- (*** 4. MapView - "เนื้อหาใหม่" ***)
// (*** นี่คือ Component ที่นำกลับมาตามคำขอ ***)
const MapView = ({ subTab }) => {
  const [mapMode, setMapMode] = useState("pins"); // 'pins' or 'heatmap'

  // 1. หน้า "แผนที่สาธารณะ"
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
                <option value="pending">xxxx รอรับเรื่อง</option>
                <option value="completed">xxxx เสร็จสิ้น</option>
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label>ช่วงเวลา</label>
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

            {/* Mock Pin 1 */}
            <FaMapMarkerAlt
              className={styles.mockMapPin}
              style={{ top: "30%", left: "40%" }}
            />

            {/* Mock Pin 2 (With Popup) */}
            <FaMapMarkerAlt
              className={styles.mockMapPin}
              style={{ top: "50%", left: "60%" }}
            />
            <div
              className={styles.mockMapPopup}
              style={{ top: "50%", left: "60%", transform: "translate(15px, -110%)" }}
            >
              <img
                // src={reportData[0].image} // (Can't use reportData anymore)
                src={logo} // (Fallback to logo)
                alt="Mock"
                className={styles.mockPopupImage}
              />
              <span className={styles.mockPopupText}>
                {truncateText("ตัวอย่าง Mockup Popup", 50)}
              </span>
              <span className={`${styles.statusTag} ${styles.pending}`}>
                รอรับเรื่อง
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. หน้า "แผนที่ภายใน"
  if (subTab === "แผนที่ภายใน") {
    return (
      <div className={styles.mapViewContainer}>
        {/* 2.1 Sidebar (Internal) */}
        <div className={styles.mapSidebar}>
          <h3 className={styles.mapSidebarTitle}>เครื่องมือแผนที่ภายใน</h3>
          
          <div className={styles.mapSidebarSection}>
            <label className={styles.filterGroup}>รูปแบบการแสดงผล</label>
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

          <div className={styles.mapSidebarSection}>
            <div className={styles.filterGroup}>
              <label>สถานะ</label>
              <select defaultValue="all">
                <option value="all">ทั้งหมด</option>
                <option value="pending">รอรับเรื่อง</option>
                <option value="in_progress">กำลังดำเนินการ</option>
                <option value="completed">เสร็จสิ้น</option>
                <option value="rejected">ไม่เกี่ยวข้อง</option>
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label>หน่วยงานรับผิดชอบ</label>
              <select defaultValue="all">
                <option value="all">ทุกหน่วยงาน</option>
                <option value="unit1">xxxx กองช่าง</option>
                {/* (*** FIXED SYNTAX ERROR ***) */}
                <option value="unit2">xxxx กองสาธารณสุข</option>
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label>ผู้รับผิดชอบ</label>
              <select defaultValue="all" disabled>
                <option value="all">ทุกคน</option>
              </select>
            </div>
          </div>
          <button className={styles.filterApplyButton}>กรองข้อมูล</button>
        </div>

        {/* 2.2 Map Content (Internal) */}
        <div className={styles.mapContent}>
          <div className={styles.mapPlaceholder}>
            {mapMode === "pins" ? (
              <>
                <span>(พื้นที่แผนที่ภายใน - หมุด)</span>
                {/* Mock Pins (Internal) */}
                <FaMapMarkerAlt
                  className={`${styles.mockMapPin} ${styles.pending}`}
                  style={{ top: "25%", left: "30%" }}
                  title="รอรับเรื่อง"
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
                <FaMapMarkerAlt
                  className={`${styles.mockMapPin} ${styles.pending}`}
                  style={{ top: "70%", left: "70%" }}
                  title="รอรับเรื่อง"
                />

                {/* Legend */}
                <div className={styles.mapLegend}>
                  <div className={styles.legendItem}>
                    <FaMapMarkerAlt className={styles.pending} />
                    <span>รอรับเรื่อง</span>
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


// ------------------------- (*** 5. Main Home - "อัปเดต" ***)
const Home = () => {
  const navigate = useNavigate();
  const [organizationInfo, setOrganizationInfo] = useState({
    // (*** MODIFIED ***) เพิ่ม id
    id: null,
    name: "กำลังโหลด...",
    logo: logo,
  });

  const [activeTab, setActiveTab] = useState("รายการแจ้ง");
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const [activeSubTabs, setActiveSubTabs] = useState({
    แผนที่: "แผนที่สาธารณะ",
    รายการแจ้ง: "เฉพาะหน่วยงาน",
    สถิติ: "สถิติ", // <-- ค่าเริ่มต้นคือ "สถิติ"
    ตั้งค่า: "ตั้งค่า",
  });

  // --- คืนค่าเมนูย่อยให้ "สถิติ" ---
  const menuItems = [
    {
      name: "แผนที่",
      icon: FaMapMarkedAlt,
      items: ["แผนที่สาธารณะ", "แผนที่ภายใน"],
    },
    {
      name: "หน่วยงาน",
      icon: FaBuilding,
      items: null,
      action: () => navigate("/home1"),
    },
    {
      name: "รายการแจ้ง",
      icon: FaClipboardList,
      items: ["เฉพาะหน่วยงาน", "รายการแจ้งรวม"],
    },
    {
      name: "สถิติ",
      icon: FaChartBar,
      items: ["สถิติ", "สถิติองค์กร"], // <-- คืนค่าเมนูย่อย
    },
    {
      name: "ตั้งค่า",
      icon: FaCog,
      items: ["ตั้งค่า", "QRCode หน่วยงาน", "QRCode สร้างเอง"],
    },
  ];

  useEffect(() => {
    const fetchOrg = async () => {
      try {
        const cachedOrg = localStorage.getItem("selectedOrg");
        const lastOrg = localStorage.getItem("lastSelectedOrg");
        
        let orgToSet = null; // (*** MODIFIED ***)

        if (cachedOrg) {
          orgToSet = JSON.parse(cachedOrg); // (*** MODIFIED ***)
          localStorage.removeItem("selectedOrg");
          localStorage.setItem("lastSelectedOrg", JSON.stringify(orgToSet)); // (*** MODIFIED ***)
        } else if (lastOrg) {
          orgToSet = JSON.parse(lastOrg); // (*** MODIFIED ***)
        }
        
        // (*** MODIFIED ***)
        if (orgToSet) {
          // (ข้อสมมติฐาน) object 'org' จาก localStorage มี 'id', 'name', 'img'
          setOrganizationInfo({ 
            id: orgToSet.id, // (*** ADDED ***)
            name: orgToSet.name, 
            logo: orgToSet.img 
          });
        } else {
          // ถ้าไม่พบหน่วยงาน
          setOrganizationInfo({ id: null, name: "ไม่พบหน่วยงาน", logo: logo });
        }

      } catch (error) {
        console.error(error);
        // (*** MODIFIED ***)
        setOrganizationInfo({ id: null, name: "เกิดข้อผิดพลาด", logo: logo });
      }
    };
    fetchOrg();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    if (liff.isLoggedIn()) liff.logout();
    navigate("/");
  };

  const handleTabClick = (item) => {
    if (item.action) {
      item.action();
    } else if (item.items) {
      setActiveTab(item.name);
      setOpenSubMenu(openSubMenu === item.name ? null : item.name);
    } else {
      setActiveTab(item.name);
      setOpenSubMenu(null);
    }
  };

  const handleSubMenuItemClick = (mainTabName, subItemName) => {
    setActiveSubTabs({
      ...activeSubTabs,
      [mainTabName]: subItemName,
    });
    setOpenSubMenu(null);
  };

  return (
    <div>
      <div className={styles.logoSectionTop}>
        <img
          src={organizationInfo.logo}
          alt="Logo"
          className={styles.logoImg}
        />
        <span className={styles.unitName}>{organizationInfo.name}</span>

        <div className={styles.logoutIcon}>
          <button onClick={handleLogout} className={styles.logoutButton}>
            <FaSignOutAlt />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </div>

      <div className={styles.dashboardContent}>
        {activeTab === "รายการแจ้ง" && (
          // (*** MODIFIED ***) ส่ง organizationId เป็น prop
          <ReportTable 
            subTab={activeSubTabs["รายการแจ้ง"]} 
            organizationId={organizationInfo.id} 
          />
        )}

        {/* (*** MODIFIED ***) นำ MapView Component กลับมาใช้งาน */}
        {activeTab === "แผนที่" && (
          <MapView subTab={activeSubTabs["แผนที่"]} />
        )}

        {/* --- ตรรกะการสลับหน้าสถิติ (กลับมาเหมือนเดิม) --- */}
        {activeTab === "สถิติ" && (
          <>
            {/* ถ้าเมนูย่อยคือ "สถิติ" ให้แสดง Component (ที่ layout ใหม่) */}
            {activeSubTabs["สถิติ"] === "สถิติ" && (
              <StatisticsView subTab={activeSubTabs["สถิติ"]} />
            )}

            {/* ถ้าเมนูย่อยคือ "สถิติองค์กร" ให้แสดง Component (ของเดิม) */}
            {activeSubTabs["สถิติ"] === "สถิติองค์กร" && (
              <OrganizationStatisticsView />
            )}
          </>
        )}

        {/* (*** MODIFIED ***) เปลี่ยนไปใช้ SettingsView Component */}
        {activeTab === "ตั้งค่า" && (
          <SettingsView subTab={activeSubTabs["ตั้งค่า"]} />
        )}
      </div>

      {/* --- Bottom Nav Bar --- */}
      <div className={styles.bottomNav}>
        {menuItems.map((item) => (
          <div key={item.name} className={styles.bottomNavButtonContainer}>
            {item.items && openSubMenu === item.name && (
              <div className={styles.subMenuPopup}>
                {item.items.map((subItem) => (
                  <div
                    key={subItem}
                    className={`${styles.subMenuItem} ${
                      activeSubTabs[item.name] === subItem ? styles.active : ""
                    }`}
                    onClick={() => handleSubMenuItemClick(item.name, subItem)}
                  >
                    {subItem}
                  </div>
                ))}
              </div>
            )}
            <button
              className={activeTab === item.name ? styles.active : ""}
              onClick={() => handleTabClick(item)}
            >
              <item.icon />
              <span>{item.name}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
