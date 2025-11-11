import React, { useState, useEffect, useRef } from "react";
// (*** MODIFIED ***) นำเข้า CSS Module ที่ถูกต้อง
import styles from "./css/Home.module.css";
import logo from "./logo.png";
import {
  FaMapMarkedAlt,
  FaClipboardList,
  FaChartBar,
  FaCog,
  FaStar,
  FaSignOutAlt,
  FaSearch,
  FaFilter,
  FaTimes, // ไอคอนกากบาท
  FaBuilding,
  // ไอคอนสำหรับหน้าสถิติใหม่
  FaHourglassHalf, // (*** ADDED ***) สำหรับเมนูเวลาเฉลี่ย
  FaSyncAlt,
  FaCheckCircle,
  // (*** ADDED ***) ไอคอนสำหรับ Dropdown และ Settings
  FaChevronDown,
  FaChevronUp,
  FaQrcode,
  FaLink,
  // (*** ADDED ***) ไอคอนสำหรับแผนที่
  FaMapMarkerAlt,
  // (*** NEW ICONS ***) สำหรับ Report View ใหม่
  FaThumbsUp,
  FaSadTear,
  FaRegStar,
  FaRegClock,
  FaUnlockAlt, // ไอคอนสำหรับรหัสผ่าน
  FaUserCog, // ไอคอนสำหรับผู้ดูแล
  FaUserTie, // ไอคอนสำหรับเจ้าหน้าที่
  // (*** ICONS FOR NEW SETTINGS ***)
  FaEye, // (*** ADDED ***) ไอคอนสำหรับปุ่ม "ดู"
  FaEyeSlash, // <--- (*** ADDED ***) เพิ่มไอคอนนี้เข้าไป
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import liff from "@line/liff";
import "cally";

// ------------------------- (*** ข้อมูลและ Component ย่อยสำหรับหน้าสถิติเดิม ***)

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
    <svg
      className={styles.mockLineChartPath}
      viewBox="0 0 100 50"
      preserveAspectRatio="none"
    >
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
    <span className={styles.chartNote}>(อ้างอิงข้อมูล 7 วันล่าสุด)</span>
  </div>
);

// (*** NEW ***) (Component ย่อยสำหรับ Mockup Horizontal Bar Chart - #2 ประเภทปัญหา)
const MockHorizontalBarChart = () => (
  <div className={styles.mockHorizontalBarChart}>
    <div className={styles.mockHBarItem}>
      <span className={styles.mockHBarLabel}>ถนน/ทางเท้า</span>
      <div className={styles.mockHBar}>
        {/* (*** MODIFIED ***) ใส่สีตรงๆ */}
        <div
          className={styles.mockHBarFill}
          style={{ width: "80%", background: "#007bff" }}
        ></div>
      </div>
      <span className={styles.mockHBarValue}>42</span>
    </div>
    <div className={styles.mockHBarItem}>
      <span className={styles.mockHBarLabel}>ไฟฟ้า/ประปา</span>
      <div className={styles.mockHBar}>
        {/* (*** MODIFIED ***) ใส่สีตรงๆ */}
        <div
          className={styles.mockHBarFill}
          style={{ width: "65%", background: "#ffc107" }}
        ></div>
      </div>
      <span className={styles.mockHBarValue}>31</span>
    </div>
    <div className={styles.mockHBarItem}>
      <span className={styles.mockHBarLabel}>ต้นไม้/พื้นที่สีเขียว</span>
      <div className={styles.mockHBar}>
        {/* (*** MODIFIED ***) ใส่สีตรงๆ */}
        <div
          className={styles.mockHBarFill}
          style={{ width: "40%", background: "#057A55" }}
        ></div>
      </div>
      <span className={styles.mockHBarValue}>18</span>
    </div>
    <div className={styles.mockHBarItem}>
      <span className={styles.mockHBarLabel}>อื่นๆ</span>
      <div className={styles.mockHBar}>
        {/* (*** MODIFIED ***) ใส่สีตรงๆ */}
        <div
          className={styles.mockHBarFill}
          style={{ width: "25%", background: "#6c757d" }}
        ></div>
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

// --- (*** FIX 3/B ***) ---
// นี่คือ Component 'SatisfactionBox' ที่แก้ไขใหม่ทั้งหมด
const SatisfactionBox = () => {
  // ข้อมูลสมมติ (เหมือนในรูป)
  const breakdownData = [
    { stars: 5, percent: 100 },
    { stars: 4, percent: 0 },
    { stars: 3, percent: 0 },
    { stars: 2, percent: 0 },
    { stars: 1, percent: 0 },
  ];

  return (
    <div className={styles.chartBox}>
      <h4 className={styles.chartBoxTitle}>ความพึงพอใจของประชาชน</h4>
      {/* ใช้ CSS .satisfactionBreakdownContainer ที่เพิ่มใหม่ (ดูใน CSS FIX 3/C) */}
      <div className={styles.satisfactionBreakdownContainer}>
        {/* Header (จากในรูป) */}
        <div className={styles.satisfactionBreakdownHeader}>
          <span className={styles.satisfactionBreakdownScore}>5.00/5</span>
          <span className={styles.satisfactionBreakdownStars}>
            <FaStar />
            <FaStar />
            <FaStar />
            <FaStar />
            <FaStar />
          </span>
          <span className={styles.satisfactionBreakdownTotal}>
            (11 ความเห็น)
          </span>
        </div>

        {/* Breakdown Rows (จากในรูป) */}
        {breakdownData.map((item) => (
          <div key={item.stars} className={styles.satisfactionBreakdownRow}>
            <span className={styles.satisfactionBreakdownLabel}>
              {item.stars} <FaStar />
            </span>
            <div className={styles.satisfactionBreakdownBar}>
              <div
                className={styles.satisfactionBreakdownBarFill}
                style={{
                  width: `${item.percent}%`,
                  // ใช้สีที่ถูกต้อง (ถ้า 0% ให้เป็นสีเทา)
                  backgroundColor: item.percent > 0 ? "#ffc107" : "#f0f0f0",
                }}
              ></div>
            </div>
            <span className={styles.satisfactionBreakdownPercent}>
              {item.percent}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
// --- (*** จบ FIX 3/B ***) ---

// (*** NEW ***) (Component ย่อยสำหรับ Mockup Stacked Horizontal Bar Chart)
// (*** MODIFIED: เพิ่มสถานะ 'ส่งต่อ(ใหม่)' และ 'ไม่เกี่ยวข้อง' ***)
const MockOrgStackedBarChart = () => {
  // ข้อมูลสมมติสำหรับกราฟแท่งแบบซ้อน (ปรับให้มี 5 สถานะ)
  const stackedData = [
    {
      name: "หน่วยงาน xx",
      pending: 10, // 10% (รอรับเรื่อง)
      inProgress: 20, // 20% (กำลังดำเนินการ)
      forwarded: 5, // 5% (ส่งต่อ(ใหม่))
      rejected: 5, // 5% (ไม่เกี่ยวข้อง)
      completed: 60, // 60% (เสร็จสิ้น)
      total: 120,
    },
    {
      name: "หน่วยงาน xx",
      pending: 30,
      inProgress: 40,
      forwarded: 10,
      rejected: 0,
      completed: 20,
      total: 85,
    },
    {
      name: "หน่วยงาน xx",
      pending: 5,
      inProgress: 15,
      forwarded: 10,
      rejected: 10,
      completed: 60,
      total: 40,
    },
    {
      name: "หน่วยงาน xx",
      pending: 50,
      inProgress: 10,
      forwarded: 10,
      rejected: 10,
      completed: 20,
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
            {/* 1. รอรับเรื่อง (สีแดง) */}
            <div
              className={styles.mockStackedBarSegment}
              style={{ width: `${item.pending}%`, background: "#dc3545" }}
              title={`รอรับเรื่อง: ${item.pending}%`}
            ></div>
            {/* 2. กำลังดำเนินการ (สีเหลือง) */}
            <div
              className={styles.mockStackedBarSegment}
              style={{ width: `${item.inProgress}%`, background: "#ffc107" }}
              title={`กำลังดำเนินการ: ${item.inProgress}%`}
            ></div>
            {/* 3. ส่งต่อ(ใหม่) (สีน้ำเงิน) */}
            <div
              className={styles.mockStackedBarSegment}
              style={{ width: `${item.forwarded}%`, background: "#007bff" }} // ใช้สีน้ำเงินจาก KPI
              title={`ส่งต่อ(ใหม่): ${item.forwarded}%`}
            ></div>
            {/* 4. ไม่เกี่ยวข้อง (สีเทา) */}
            <div
              className={styles.mockStackedBarSegment}
              style={{ width: `${item.rejected}%`, background: "#6c757d" }} // ใช้สีเทาจาก KPI
              title={`ไม่เกี่ยวข้อง: ${item.rejected}%`}
            ></div>
            {/* 5. เสร็จสิ้น (สีเขียว) */}
            <div
              className={styles.mockStackedBarSegment}
              style={{ width: `${item.completed}%`, background: "#057A55" }}
              title={`เสร็จสิ้น: ${item.completed}%`}
            ></div>
          </div>
          <span className={styles.mockHBarValue}>{item.total}</span>
        </div>
      ))}
      {/* คำอธิบายสัญลักษณ์ (Legend) - (*** MODIFIED ***) */}
      <div className={styles.mockStackedBarLegend}>
        <span>
          <span style={{ background: "#dc3545" }}></span> รอรับเรื่อง
        </span>
        <span>
          <span style={{ background: "#ffc107" }}></span> กำลังดำเนินการ
        </span>
        <span>
          <span style={{ background: "#007bff" }}></span> ส่งต่อ(ใหม่)
        </span>
        <span>
          <span style={{ background: "#057A55" }}></span> เสร็จสิ้น
        </span>
        <span>
          <span style={{ background: "#6c757d" }}></span> ไม่เกี่ยวข้อง
        </span>
      </div>
    </div>
  );
};

// (*** NEW ***) (Component กราฟแท่งแนวนอนธรรมดา ที่นำกลับมาใช้ซ้ำได้)
const MockSimpleBarChart = ({ data, barColor, valueSuffix, maxValue }) => {
  // หาสเกลสูงสุด ถ้าไม่ได้กำหนดมา
  const max = maxValue || Math.max(...data.map((d) => d.value));

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
                background: barColor,
              }}
              title={`${item.value} ${valueSuffix}`}
            ></div>
          </div>
          <span className={styles.mockHBarValue}>
            {item.value.toFixed(1)} {valueSuffix}
          </span>
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

// ------------------------- ตัวอย่าง Report Data
const reportData = [
  {
    id: "#2025-TYHKE",
    detail:
      "ทดลองแจ้งเรื่องฝาท่อระบายน้ำที่ถนนหน้าหมู่บ้าน มีน้ำขังเยอะมาก",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFmeZPibDL4XbTA9wnhZCpCeK0bFg07Pf2cw&s",
    category: "อื่นๆ",
    datetime_in: "ต.ค. 4 เม.ย. 68 14:19 น.",
    datetime_out: "ต.ค. 4 เม.ย. 68 14:19 น.",
    location: "914 ถนน ตาดคำ",
    responsible_unit: "ทีมพัฒนา",
    status: "รอรับเรื่อง",
    rating: null,
  },
  {
    id: "#2025-ETNEZE",
    detail: "มีต้นไม้กีดขวาง ทางเดินเท้า ทำให้คนเดินสัญจรไม่สะดวก",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_bRmXqJQOpLMvoKvL89IYlHse2LioPsA8sQ&s",
    category: "ต้นไม้",
    datetime_in: "พฤ. 13 มี.ค. 68 16:08 น.",
    datetime_out: "ต.ค. 3 ส.ค. 69 15:23 น.",
    location: "460 หมู่ 12 ถนน มิตรภาพ",
    responsible_unit: "ทีมพัฒนา",
    status: "เสร็จสิ้น",
    rating: 4,
  },
];

// ------------------------- Helper
const toYYYYMMDD = (d) => (d ? d.toISOString().split("T")[0] : null);

const truncateText = (text, maxLength) => {
  if (!text) return ""; // (*** ADDED GUARD ***) เพิ่มการป้องกัน text เป็น null
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + "...";
};

// ------------------------- (*** ADDED BACK ***) Date Filter (จากโค้ดเก่า)
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

// ------------------------- (*** ADDED BACK ***) Report Table (จากโค้ดเก่า)
const ReportTable = ({ subTab }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // ✅ โหลดข้อมูลจริงทั้งหมด
  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true);
        const lastOrg = localStorage.getItem("lastSelectedOrg");
        console.log("org:", lastOrg);
        if (!lastOrg) {
          console.warn("ไม่พบข้อมูลหน่วยงานใน localStorage");
          setReports([]);
          setLoading(false);
          return;
        }

        const org = JSON.parse(lastOrg);
        const orgId = org.id || org.organization_id;

        // ✅ (*** MODIFIED ***) เรียก endpoint เดียว (backend รวมข้อมูลให้แล้ว)
        // แก้ไข URL ให้ตรงกับ code2
        const res = await fetch(
          `https://premium-citydata-api-ab.vercel.app/api/cases/issue_cases?organization_id=${orgId}`
        );
        if (!res.ok) throw new Error("Fetch cases failed");

        const data = await res.json();

        // --- (ที่แก้ไข) ---
        // ✅ ข้อมูลที่ได้มี field: issue_type_name, organizations (array), etc.
        setReports(data);
      } catch (err) {
        console.error("Error fetching data:", err);
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

  return (
    <>
      {/* Search & Filter */}
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

      {/* Summary */}
      <div className={styles.reportSummary}>
        <strong>{summaryTitle}</strong>{" "}
        ({loading ? "กำลังโหลด..." : `${reports.length} รายการ`})
      </div>

      {/* Cards */}
      <div className={styles.reportTableContainer}>
        {loading ? (
          <p>กำลังโหลดข้อมูล...</p>
        ) : reports.length === 0 ? (
          <p>ไม่มีข้อมูลเรื่องแจ้ง</p>
        ) : (
          reports.map((report) => {
            const isExpanded = expandedCardId === report.issue_cases_id;

            // --- (ที่แก้ไข) ---
            // สร้าง list ของหน่วยงาน
            const responsibleUnits =
              report.organizations && report.organizations.length > 0
                ? report.organizations
                    .map((org) => org.responsible_unit)
                    .join(", ")
                : "-";
            // --- (สิ้นสุดส่วนที่แก้ไข) ---

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
                  <span
                    className={`${styles.statusTag} ${
                      report.status === "รอรับเรื่อง"
                        ? styles.pending
                        : report.status === "กำลังดำเนินการ"
                        ? styles.in_progress
                        : report.status === "เสร็จสิ้น"
                        ? styles.completed
                        : styles.other
                    }`}
                  >
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
                      {/* --- (ที่แก้ไข) --- */}
                      {/* แสดง list ของหน่วยงานที่สร้างไว้ */}
                      <span>หน่วยงานที่รับผิดชอบ: {responsibleUnits}</span>
                      {/* --- (สิ้นสุดส่วนที่แก้ไข) --- */}
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
    </>
  );
};

// ------------------------- (*** ADDED BACK ***) NEW COMPONENTS FOR REPORT CARD VIEW ***)
// (*** นี่คือกลุ่ม Component ที่หายไป ทำให้ "สถิติองค์กร" ไม่ทำงาน ***)

// --- (*** NEW COMPONENT: องค์ประกอบย่อยสำหรับแสดงความพึงพอใจใน Card ***) ---
const CardSatisfactionBreakdown = ({ score, totalReviews, breakdownData }) => (
  <div className={styles.satisfactionCardBreakdown}>
    <div className={styles.satisfactionCardHeader}>
      <span className={styles.satisfactionCardScore}>{score}</span>
      <span className={styles.satisfactionCardStarGroup}>
        {[...Array(5)].map((_, i) => (
          <FaStar key={i} className={styles.satisfactionCardStar} />
        ))}
        <span className={styles.satisfactionCardTotal}>
          ({totalReviews} ความเห็น)
        </span>
      </span>
    </div>

    <div className={styles.satisfactionCardRows}>
      {breakdownData.map((item) => (
        <div key={item.stars} className={styles.satisfactionBreakdownRow}>
          <span className={styles.satisfactionBreakdownLabel}>
            {item.stars}
          </span>
          <div className={styles.satisfactionBreakdownBar}>
            <div
              className={styles.satisfactionBreakdownBarFill}
              style={{
                width: `${item.percent}%`,
                backgroundColor: item.percent > 0 ? "#ffc107" : "#f0f0f0",
              }}
            ></div>
          </div>
          <span className={styles.satisfactionBreakdownPercent}>
            {item.percent}%
          </span>
        </div>
      ))}
    </div>
  </div>
);

// --- (*** NEW COMPONENT: Card แต่ละรายการ ***) ---
const ReportCardItem = ({ id, name, details }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // ข้อมูลจำลองสำหรับ Breakdown
  const mockBreakdownData = [
    { stars: 5, percent: id === 1 ? 100 : id === 2 ? 80 : 10 },
    { stars: 4, percent: id === 1 ? 0 : id === 2 ? 20 : 50 },
    { stars: 3, percent: id === 1 ? 0 : 0 },
    { stars: 2, percent: id === 1 ? 0 : 0 },
    { stars: 1, percent: id === 1 ? 0 : id === 2 ? 0 : 40 },
  ];

  // แก้ไข Mock Data ให้ตรงกับรูป
  if (id === 1 || id === 3 || id === 4) {
    mockBreakdownData[0].percent = 100;
    mockBreakdownData[1].percent = 0;
    mockBreakdownData[4].percent = 0;
  } else if (id === 2) {
    mockBreakdownData[0].percent = 88; // 88% like = 5-star?
    mockBreakdownData[1].percent = 12;
    mockBreakdownData[4].percent = 0;
  }

  return (
    <div
      className={`${styles.reportCardItem} ${
        isExpanded ? styles.expanded : ""
      }`}
    >
      {/* ส่วนบน: หัวข้อ, คะแนน, ปุ่ม */}
      <div className={styles.reportCardHeader}>
        <div className={styles.reportCardTitleGroup}>
          <span className={styles.reportCardRank}>{id}</span>
          <div className={styles.reportCardTitle}>
            {/* องค์ประกอบ Dropdown */}
            <span
              className={styles.reportCardName}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {name}
              {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
            </span>

            {/* (*** MODIFIED ***) ลบ Tags 'ชมชอบ' และ 'แก้ไขเร็ว' ออก */}
            {/* <div className={styles.reportCardDetailTags}> ... </div> */}
          </div>
        </div>

        <div className={styles.reportCardScoreGroup}>
          <span className={styles.reportCardScoreText}>
            {details.score.toFixed(2)}
          </span>
          <span className={styles.reportCardScoreStars}>
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} />
            ))}
          </span>
          <span className={styles.reportCardScoreReviews}>
            ({details.reviews} ความเห็น)
          </span>
        </div>
      </div>

      {/* ส่วนขยาย: Breakdown (ความพึงพอใจ) */}
      {isExpanded && (
        <div className={styles.reportCardExpandedContent}>
          <CardSatisfactionBreakdown
            score={details.score.toFixed(2)}
            totalReviews={details.reviews}
            breakdownData={mockBreakdownData}
          />
        </div>
      )}
    </div>
  );
};

// --- (*** NEW COMPONENT: หน้าแสดงผล Card List ***) ---
const ReportCardView = ({ subTab }) => {
  // ข้อมูลจำลองที่ปรับให้ตรงกับรูป (เขตยานนาวา, วัฒนา, บางขุนเทียน)
  const reportData = [
    {
      id: 1,
      name: "เขตยานนาวา",
      details: {
        score: 5.0,
        reviews: 11,
        likedPercent: "100%",
        fastSolvedPercent: "15%",
      },
    },
    {
      id: 2,
      name: "เขตวัฒนา",
      details: {
        score: 4.8,
        reviews: 25,
        likedPercent: "88%",
        fastSolvedPercent: "14%",
      },
    },
    {
      id: 3,
      name: "เขตบางขุนเทียน",
      details: {
        score: 5.0,
        reviews: 6,
        likedPercent: "100%",
        fastSolvedPercent: "15%",
      },
    },
    {
      id: 4,
      name: "เขตมีนบุรี",
      details: {
        score: 5.0,
        reviews: 5,
        likedPercent: "100%",
        fastSolvedPercent: "14%",
      },
    },
  ];

  // Mock Menu/Filter options (เหมือนในรูป)
  const menuItems = [
    { id: "highest_solved", label: "แก้ปัญหาสูงสุด (%)", icon: FaCheckCircle },
    { id: "least_complained", label: "เรื่องร้องเรียน้อยที่สุด", icon: FaSadTear },
    { id: "most_liked", label: "เรื่องถูกใจสูงสุด", icon: FaThumbsUp },
    { id: "highest_vote", label: "Vote สูงสุด", icon: FaRegStar },
    { id: "newest_problem", label: "เปิดเรื่องใหม่มากที่สุด", icon: FaRegClock },
    {
      id: "most_type",
      label: "ประเภทปัญหามาถึงมากที่สุด",
      icon: FaClipboardList,
    },
  ];

  const [activeMenu, setActiveMenu] = useState(menuItems[0].id);

  return (
    <div className={styles.reportCardViewContainer}>
      {/* 1. Sidebar Menu ด้านซ้าย */}
      <div className={styles.reportCardSidebar}>
        <h3 className={styles.reportCardSidebarTitle}>ผลโหมดการแก้ปัญหาล่าสุด</h3>
        <nav className={styles.reportCardMenuNav}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`${styles.reportCardMenuButton} ${
                activeMenu === item.id ? styles.active : ""
              }`}
              onClick={() => setActiveMenu(item.id)}
            >
              <item.icon />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* 2. Main Content ด้านขวา */}
      <div className={styles.reportCardMainContent}>
        {/* Filter Bar ด้านบน (Dropdowns) */}
        <div className={styles.reportCardFilterBar}>
          <div className={styles.filterGroup}>
            <select defaultValue="highest_solved">
              <option value="highest_solved">ถูกกด Vote มากที่สุด</option>
              <option value="highest_solved">แก้ปัญหาสูงสุด</option>
            </select>
          </div>
          <div
            className={styles.filterGroup}
            style={{ flexGrow: 0.5, minWidth: "180px" }}
          >
            <select defaultValue="month">
              <option value="month">พฤศจิกายน 2568</option>
              <option value="last_month">ตุลาคม 2568</option>
            </select>
          </div>
          <button className={styles.searchButton}>
            <FaSearch />
            ค้นหา
          </button>
        </div>

        {/* รายการ Card */}
        <div className={styles.reportCardList}>
          {reportData.map((item) => (
            <ReportCardItem
              key={item.id}
              id={item.id}
              name={item.name}
              details={item.details}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// (*** NEW COMPONENT: Simplified View สำหรับการแสดงผล Card List ภายใน ChartBox ***)
// (*** นี่คือ Component ที่ "สถิติองค์กร" เรียกใช้ ***)
const ReportCardViewSimplified = () => {
  // ข้อมูลจำลองที่ปรับให้ตรงกับรูป 2
  const reportData = [
    {
      id: 1,
      name: "หน่วยงาน xx",
      details: {
        score: 5.0,
        reviews: 11,
        likedPercent: "100%",
        fastSolvedPercent: "15%",
      },
    },
    {
      id: 2,
      name: "หน่วยงาน xx",
      details: {
        score: 4.8,
        reviews: 25,
        likedPercent: "88%",
        fastSolvedPercent: "14%",
      },
    },
    {
      id: 3,
      name: "หน่วยงาน xx",
      details: {
        score: 5.0,
        reviews: 6,
        likedPercent: "100%",
        fastSolvedPercent: "15%",
      },
    },
    {
      id: 4,
      name: "หน่วยงาน xx",
      details: {
        score: 5.0,
        reviews: 5,
        likedPercent: "100%",
        fastSolvedPercent: "14%",
      },
    },
  ];

  // แสดงเฉพาะรายการ Card โดยไม่มี Sidebar และ Filter Bar ของ ReportCardView
  return (
    <div className={styles.reportCardList} style={{ padding: "10px 0" }}>
      {reportData.map((item) => (
        <ReportCardItem
          key={item.id}
          id={item.id}
          name={item.name}
          details={item.details}
        />
      ))}
    </div>
  );
};
// --- (*** จบส่วนที่ ADDED BACK ***) ---

// ------------------------- (*** 1. StatisticsView - "ภาพรวมสถิติ" ***)
const StatisticsView = ({ subTab }) => {
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
        {/* คอลัมน์ที่ 1: ประเภทปัญหา + ความพึงพอใจ */}
        <div className={styles.statsGridColumn}>
          <ProblemTypeBox />
          <SatisfactionBox />
        </div>

        {/* คอลัมน์ที่ 2: การปฏิบัติงาน */}
        <div className={styles.chartBox}>
          <h4 className={styles.chartBoxTitle}>การปฏิบัติงานของเจ้าหน้าที่</h4>
          <div className={styles.opsContent}>
            <div className={styles.opsKpi}>
              <span>เจ้าหน้าที่ทั้งหมด</span>
              <strong>12 (คน)</strong>
            </div>
            <div className={styles.opsDetail}>
              <span>ค่าเฉลี่ยโดยประมาณของระยะเวลาการทำงาน</span>
              <span>3.2 วัน</span>
            </div>
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

// ------------------------- (*** 2. OrganizationStatisticsView - "สถิติองค์กร (แสดงกราฟเดียว)" ***)
const OrganizationStatisticsView = () => {
  const [activeOrgTab, setActiveOrgTab] = useState("satisfaction");

  const menuItems = [
    { id: "ratio", title: "จำนวนเรื่องแจ้ง", icon: <FaChartBar /> },
    { id: "satisfaction", title: "เปรียบเทียบความพึงพอใจ", icon: <FaStar /> },
    {
      id: "avg_time",
      title: "เปรียบเทียบเวลาเฉลี่ย",
      icon: <FaHourglassHalf />,
    },
  ];

  const avgTimeData = [
    { name: "หน่วยงาน xx", value: 3.2 },
    { name: "หน่วยงาน xx", value: 5.1 },
    { name: "หน่วยงาน xx", value: 2.5 },
    { name: "หน่วยงาน xx", value: 7.0 },
  ];

  const renderContent = () => {
    if (activeOrgTab === "ratio") {
      return (
        <div className={styles.chartBox} key="ratio-chart">
          <h4 className={styles.chartBoxTitle}>
            จำนวนเรื่องแจ้ง
          </h4>
          <MockOrgStackedBarChart />
        </div>
      );
    }
    if (activeOrgTab === "satisfaction") {
      return (
        <div className={styles.chartBox} key="satisfaction-card-list">
          <h4 className={styles.chartBoxTitle}>
            กราฟเปรียบเทียบความพึงพอใจ (แสดงผลลัพธ์เป็น Card List)
          </h4>
          {/* (*** FIXED ***) ตอนนี้ ReportCardViewSimplified ถูก import แล้ว */}
          <ReportCardViewSimplified />
        </div>
      );
    }
    if (activeOrgTab === "avg_time") {
      return (
        <div className={styles.chartBox} key="avg-time-chart">
          <h4 className={styles.chartBoxTitle}>
            กราฟเปรียบเทียบเวลาเฉลี่ย (วัน)
          </h4>
          <div className={styles.chartNote}>(*ยิ่งน้อยยิ่งดี)</div>
          <MockSimpleBarChart
            data={avgTimeData}
            barColor="#6c757d"
            valueSuffix="วัน"
          />
        </div>
      );
    }
    return null;
  };

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

      {/* 2. พื้นที่แสดงเนื้อหาด้านขวา */}
      <div className={styles.orgStatsContent}>
        <div className={styles.orgGraphDashboard}>{renderContent()}</div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------
// --- (*** 3. SettingsView - "ปรับปรุงใหม่ตามคำขอ" ***) ---
// ------------------------------------------------------------------

// (Component ย่อยสำหรับ Toggle Switch - เหมือนเดิม)
const MockToggle = () => (
  <label className={styles.mockToggle}>
    <input type="checkbox" />
    <span className={styles.mockSlider}></span>
  </label>
);

// (*** NEW COMPONENT: Modal สำหรับ "บังคับรีเซ็ต" ***)
// (*** นี่คือเวอร์ชันที่ปลอดภัยกว่า PasswordChangeModal เดิม ***)
const AdminChangePasswordModal = ({ onClose, user }) => {
  // (*** MODIFIED ***) เราไม่สนรหัสเก่า เราจะตั้งใหม่เลย
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = () => {
    if (!newPassword) {
      alert("กรุณาใส่รหัสผ่านใหม่");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("รหัสผ่านใหม่และการยืนยันไม่ตรงกัน");
      return;
    }
    // (ณ จุดนี้ คุณจะส่ง API request เพื่อตั้งรหัสใหม่ให้ user.username)
    alert(`(จำลอง) ตั้งรหัสผ่านใหม่สำหรับ ${user.username} สำเร็จ!`);
    onClose();
  };

  return (
    <>
      <div className={styles.filterModalBackdrop} onClick={onClose} />
      <div className={styles.filterModal}>
        <div className={styles.filterModalHeader}>
          <h3>ตั้งรหัสผ่านใหม่ให้: {user.username}</h3>
          <button className={styles.filterModalClose} onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className={styles.filterModalContent} style={{ gap: "15px" }}>
          {/* (*** DELETED ***) ลบช่อง "รหัสผ่านเดิม" */}

          <div className={styles.filterGroup}>
            <label>รหัสผ่านใหม่</label>
            <input
              type="password"
              className={styles.searchInput}
              placeholder="รหัสผ่านใหม่"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className={styles.filterGroup}>
            <label>ยืนยันรหัสผ่านใหม่</label>
            <input
              type="password"
              className={styles.searchInput}
              placeholder="ยืนยันรหัสผ่านใหม่"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button
            className={styles.filterApplyButton}
            style={{ marginTop: "10px" }}
            onClick={handleSubmit}
          >
            ยืนยันการตั้งรหัสใหม่
          </button>
        </div>
      </div>
    </>
  );
};

// --- (*** MODIFIED: 1. เนื้อหา "ตั้งค่าทั่วไป" (เพิ่มโปรไฟล์ผู้ใช้ และลบเนื้อหาในรูป) ***) ---
const GeneralSettingsContent = () => {
  // ข้อมูลจำลองของเจ้าหน้าที่ที่ล็อกอินอยู่
  const currentUser = {
    name: "เจ้าหน้าที่ สมชาย ใจดี",
    email: "somchai.j@agency.go.th",
    unit: "ฝ่ายรับเรื่องร้องเรียน",
    role: "เจ้าหน้าที่",
  };

  return (
    <>
      {/* (*** ADDED ***) The Profile Box */}
      <div className={styles.settingsSection}>
        <h3 className={styles.settingsTitle}>👤 โปรไฟล์ของฉัน</h3>
        <div className={styles.settingsItem}>
          <span className={styles.settingsItemText}>ชื่อ-สกุล</span>
          <span
            className={styles.settingsItemValue}
            style={{ cursor: "default", color: "#333", fontWeight: "600" }}
          >
            {currentUser.name}
          </span>
        </div>
        <div className={styles.settingsItem}>
          <span className={styles.settingsItemText}>หน่วยงาน</span>
          <span
            className={styles.settingsItemValue}
            style={{ cursor: "default", color: "#555" }}
          >
            {currentUser.unit}
          </span>
        </div>
        <div className={styles.settingsItem} style={{ borderBottom: "none" }}>
          <span className={styles.settingsItemText}>Email</span>
          <span
            className={styles.settingsItemValue}
            style={{ cursor: "default", color: "#555" }}
          >
            {currentUser.email}
          </span>
        </div>
      </div>

      {/* (*** DELETED PER REQUEST ***) 
        กล่อง "การแจ้งเตือน" และ "ทั่วไป (ภาษา)" ถูกลบออกจากหน้านี้
      */}
    </>
  );
};

// --- (*** MODIFIED: 2. เนื้อหา "ตั้งค่าแผนที่" (ปรับปรุงใหม่ตามคำขอ) ***) ---
const MapSettingsContent = () => {
  return (
    <div className={styles.settingsSection}>
      <h3 className={styles.settingsTitle}>
        <FaMapMarkedAlt style={{ marginRight: "10px", color: "#6c757d" }} />
        ตั้งค่าแผนที่
      </h3>
      <p className={styles.settingsSubtitle}>
        ตั้งค่าการแสดงผลของแผนที่สาธารณะสำหรับประชาชน
      </p>

      {/* (*** MODIFIED ***) เหลือแค่ Toggle เดียวตามคำขอ */}
      <div className={styles.settingsItem} style={{ borderBottom: "none" }}>
        <div className={styles.settingsItemText}>
          <span>แผนที่สาธารณะ (เปิด/ปิด)</span>
        </div>
        <MockToggle />
      </div>

      {/* (*** DELETED ***) 
        ลบ Toggle "แสดงหมุดสถานะที่เสร็จสิ้น" และ "แสดงหมายเหตุ" ออก
      */}
    </div>
  );
};

// --- (*** MODIFIED: 3. เนื้อหา "รหัสผ่าน" (สลับการมองเห็นได้) ***) ---
const PasswordSettingsContent = () => {
  const [modalUser, setModalUser] = useState(null); // State สำหรับ Modal (เหมือนเดิม)

  // (*** NEW STATE ***) State เพื่อจำว่ารหัสของ username ใดที่กำลังแสดงอยู่
  const [visiblePasswordUsername, setVisiblePasswordUsername] = useState(null);

  // (*** MODIFIED ***)
  // เปลี่ยนจาก password: "..." เป็น realPassword: "..." เพื่อเก็บรหัสจริง
  const users = [
    {
      role: "ผู้ดูแลหน่วยงาน",
      username: "admin_unit_xx",
      realPassword: "AdminPassword123", // <-- รหัสจริง (จำลอง)
      icon: FaUserCog,
    },
    {
      role: "เจ้าหน้าที่",
      username: "staff_zone_01",
      realPassword: "Staff_pass_456", // <-- รหัสจริง (จำลอง)
      icon: FaUserTie,
    },
  ];

  // ฟังก์ชันเปิด Modal (เหมือนเดิม)
  const handleOpenResetModal = (user) => {
    // ส่งข้อมูล user ทั้งหมดไป (เผื่อ Modal ต้องใช้)
    setModalUser(user);
  };

  // (*** MODIFIED ***)
  // เปลี่ยนจาก handleViewPassword เป็นฟังก์ชันสลับการมองเห็น
  const handleTogglePasswordView = (username) => {
    setVisiblePasswordUsername((prevUsername) =>
      // ถ้า username ที่กดมา คืออันเดียวกับที่แสดงอยู่ ให้ซ่อน (null)
      // ถ้าไม่ใช่ ให้แสดงอันใหม่
      prevUsername === username ? null : username
    );
  };

  return (
    <>
      <div className={styles.settingsSection}>
        <h3 className={styles.settingsTitle}>
          <FaUnlockAlt style={{ marginRight: "10px", color: "#6c757d" }} />
          รหัสเข้าใช้งาน
        </h3>
        <p className={styles.settingsSubtitle}>
          จัดการและรีเซ็ตรหัสผ่านสำหรับเจ้าหน้าที่และผู้ดูแลหน่วยงาน
        </p>

        {/* (*** MODIFIED: อัปเดตการ map ข้อมูล ***) */}
        {users.map((user, index) => {
          // ตรวจสอบว่ารหัสของ user นี้กำลังถูกแสดงอยู่หรือไม่
          const isVisible = visiblePasswordUsername === user.username;

          return (
            <div key={index} className={styles.settingsItem}>
              {/* (ส่วนข้อมูลผู้ใช้ - เหมือนเดิม) */}
              <div className={styles.passwordUserItem}>
                <span className={styles.passwordUserInfo}>
                  <user.icon className={styles.passwordUserIcon} />
                  {user.role} ({user.username})
                </span>

                {/* (*** MODIFIED ***)
                    สลับการแสดงผลรหัสจริง กับ "***********"
                */}
                <span className={styles.passwordUserPass}>
                  รหัสผ่าน: {isVisible ? user.realPassword : "***********"}
                </span>
              </div>

              {/* (ส่วนปุ่ม - อัปเดต onClick และ ข้อความ) */}
              <div className={styles.passwordButtonGroup}>
                <button
                  // (*** MODIFIED ***) เพิ่ม class 'viewButtonActive' เมื่อกำลังแสดง
                  className={`${styles.passwordButton} ${styles.viewButton} ${
                    isVisible ? styles.viewButtonActive : ""
                  }`}
                  // (*** MODIFIED ***) เรียกใช้ฟังก์ชันสลับการมองเห็น
                  onClick={() => handleTogglePasswordView(user.username)}
                >
                  {/* (*** MODIFIED ***) สลับไอคอนและข้อความ */}
                  {isVisible ? <FaEyeSlash /> : <FaEye />}
                  {isVisible ? "ซ่อนรหัส" : "ดูรหัส"}
                </button>

                <button
                  className={`${styles.passwordButton} ${styles.changeButton}`}
                  onClick={() => handleOpenResetModal(user)}
                >
                  <FaSyncAlt /> เปลี่ยนรหัส
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* (Modal - เหมือนเดิม) */}
      {modalUser && (
        <AdminChangePasswordModal
          onClose={() => setModalUser(null)}
          user={modalUser} // ส่ง user object ทั้งหมดไป
        />
      )}
    </>
  );
};

// --- (*** REVERTED: 4. เนื้อหา "QRCode หน่วยงาน" (แบบเดิม) ***) ---
const QRUnitSettingsContent = () => (
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
);

// --- (*** REVERTED: 5. เนื้อหา "QRCode สร้างเอง" (แบบเดิม) ***) ---
const QRCreateSettingsContent = () => (
  <div className={styles.settingsSection}>
    <h3 className={styles.settingsTitle}>สร้าง QR Code เอง</h3>
    <p className={styles.settingsSubtitle}>
      สร้าง QR Code เพื่อลิงก์ไปยังประเภทปัญหาที่กำหนดเอง (เช่น "แจ้งเหตุไฟดับ")
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
          className={styles.searchInput}
        />
      </div>
      <button className={styles.filterApplyButton}>สร้าง QR Code</button>
    </form>
    <div
      className={styles.qrCodePlaceholder}
      style={{ marginTop: "20px" }}
    >
      <span>(QR Code ที่สร้างจะแสดงที่นี่)</span>
    </div>
  </div>
);

// --- (*** REFACTORED: Component หลักสำหรับหน้าตั้งค่า ***) ---
const SettingsView = () => {
  // 1. (*** MODIFIED ***) อัปเดตเมนูตามคำขอ
  const settingsOptions = [
    { id: "ทั่วไป", label: "ตั้งค่า (ทั่วไป)" }, // <-- (*** MODIFIED ***) หน้านี้จะมีโปรไฟล์ผู้ใช้อยู่ด้านบน
    { id: "แผนที่", label: "ตั้งค่าแผนที่" },
    { id: "รหัสผ่าน", label: "รหัสผ่าน (ผู้ดูแล)" }, // <-- (*** ADDED BACK ***)
    { id: "qrหน่วยงาน", label: "QRCode หน่วยงาน" },
    { id: "qrสร้างเอง", label: "QRCode สร้างเอง" },
  ];

  // 2. ตั้งค่าเริ่มต้นเป็น "ทั่วไป" (เพื่อให้เหมือนในรูป)
  const [activeSetting, setActiveSetting] = useState(settingsOptions[0].id);

  // 3. (*** MODIFIED ***) อัปเดตฟังก์ชัน Render ให้ตรงกับเมนู
  const renderSettingContent = () => {
    switch (activeSetting) {
      case "ทั่วไป":
        return <GeneralSettingsContent />; // <-- (*** MODIFIED ***) หน้านี้มีแค่โปรไฟล์
      case "แผนที่":
        return <MapSettingsContent />; // <-- (*** MODIFIED ***) หน้านี้ถูกปรับปรุงแล้ว
      case "รหัสผ่าน":
        return <PasswordSettingsContent />; // <-- (*** MODIFIED ***) ใช้ระบบ 2 ปุ่ม
      case "qrหน่วยงาน":
        return <QRUnitSettingsContent />;
      case "qrสร้างเอง":
        return <QRCreateSettingsContent />;
      default:
        return null;
    }
  };

  // 4. Render UI หลัก (Dropdown + Content) - (เหมือนเดิม)
  return (
    <div className={styles.settingsContainer}>
      <div className={styles.settingsHeaderDropdown}>
        <div className={styles.filterGroup}>
          <label
            htmlFor="settingsSelect"
            style={{
              paddingLeft: "4px",
              marginBottom: "8px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontWeight: "700",
              fontSize: "15px",
            }}
          >
            <FaCog /> เมนูตั้งค่า
          </label>
          <select
            id="settingsSelect"
            value={activeSetting}
            onChange={(e) => setActiveSetting(e.target.value)}
          >
            {settingsOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.settingsContentArea}>
        {renderSettingContent()}
      </div>
    </div>
  );
};
// --- (*** จบส่วนที่ปรับปรุง SettingsView ***) ---

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
              style={{
                top: "50%",
                left: "60%",
                transform: "translate(15px, -110%)",
              }}
            >
              <img
                src={reportData[0].image}
                alt="Mock"
                className={styles.mockPopupImage}
              />
              <span className={styles.mockPopupText}>
                {truncateText(reportData[0].detail, 50)}
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
    name: "กำลังโหลด...",
    logo: logo,
  });

  const [activeTab, setActiveTab] = useState("รายการแจ้ง"); // <-- (*** FIXED ***) เปลี่ยนค่าเริ่มต้นกลับไปที่ "รายการแจ้ง"
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const [activeSubTabs, setActiveSubTabs] = useState({
    แผนที่: "แผนที่สาธารณะ",
    รายการแจ้ง: "เฉพาะหน่วยงาน",
    สถิติ: "สถิติองค์กร",
    // (*** MODIFIED ***) ลบ "ตั้งค่า" ออกจากที่นี่ เพราะไม่จำเป็นแล้ว
    // ตั้งค่า: "ตั้งค่า",
    ผลลัพธ์: "แก้ปัญหาสูงสุด",
  });

  // (*** MODIFIED ***)
  // อัปเดตเมนูให้ครบถ้วน และ "ตั้งค่า" ไม่มีเมนูย่อย
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
      items: ["สถิติ", "สถิติองค์กร"],
    },
    {
      name: "ตั้งค่า",
      icon: FaCog,
      items: null, // <--- ไม่มีเมนูย่อย
    },
  ];

  useEffect(() => {
    const fetchOrg = async () => {
      try {
        const cachedOrg = localStorage.getItem("selectedOrg");
        const lastOrg = localStorage.getItem("lastSelectedOrg");
        if (cachedOrg) {
          const org = JSON.parse(cachedOrg);
          setOrganizationInfo({ name: org.name, logo: org.img });
          localStorage.removeItem("selectedOrg");
          localStorage.setItem("lastSelectedOrg", JSON.stringify(org));
        } else if (lastOrg) {
          const org = JSON.parse(lastOrg);
          setOrganizationInfo({ name: org.name, logo: org.img });
        }
      } catch (error) {
        console.error(error);
        setOrganizationInfo({ name: "เกิดข้อผิดพลาด", logo: logo });
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
        {/* (*** MODIFIED ***)
            นำ <ReportTable> กลับมาใส่ใน 'รายการแจ้ง'
        */}
        {activeTab === "รายการแจ้ง" && (
          <ReportTable subTab={activeSubTabs["รายการแจ้ง"]} />
        )}

        {/* (*** ADDED BACK ***) เพิ่มหน้าอื่นๆ กลับเข้ามา */}
        {activeTab === "แผนที่" && (
          <MapView subTab={activeSubTabs["แผนที่"]} />
        )}

        {activeTab === "สถิติ" && (
          <>
            {activeSubTabs["สถิติ"] === "สถิติ" && (
              <StatisticsView subTab={activeSubTabs["สถิติ"]} />
            )}
            {activeSubTabs["สถิติ"] === "สถิติองค์กร" && (
              <OrganizationStatisticsView />
            )}
          </>
        )}

        {/* (*** MODIFIED ***)
            เรียก <SettingsView /> ที่ใช้ Dropdown แบบ 5 เมนู (แบบเก่า)
        */}
        {activeTab === "ตั้งค่า" && <SettingsView />}
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
                    onClick={() =>
                      handleSubMenuItemClick(item.name, subItem)
                    }
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
