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
  FaSyncAlt, // (*** USED FOR LOADING ***)
  // (*** ADDED ***) ไอคอนสำหรับ Dropdown และ Settings
  FaChevronDown,
  FaChevronUp,
  FaQrcode,
  FaLink,
  // (*** ADDED ***) ไอคอนสำหรับแผนที่
  FaMapMarkerAlt,
  // (*** NEW ICONS ***) สำหรับ Report View ใหม่
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
// (*** DELETED ***) ลบ import useAuth ที่ไม่มีอยู่จริง
// import { useAuth } from "./AuthContext";

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

// (*** MODIFIED ***) (Component ย่อยสำหรับ Mockup Stacked Horizontal Bar Chart - รองรับ 7 สถานะใหม่)
const MockOrgStackedBarChart = () => {
  // ข้อมูลสมมติสำหรับกราฟแท่งแบบซ้อน (ปรับให้มี 7 สถานะ)
  const stackedData = [
    {
      name: "หน่วยงาน xx",
      pending: 10, // 10% (รอรับเรื่อง - แดง)
      coordinating: 5, // 5% (กำลังประสานงาน - ม่วง) (*** NEW ***)
      inProgress: 20, // 20% (กำลังดำเนินการ - เหลือง)
      forwarded: 5, // 5% (ส่งต่อ - น้ำเงิน)
      rejected: 5, // 5% (ปฏิเสธ - เทา) (*** MODIFIED NAME ***)
      invited: 5, // 5% (เชิญร่วม - เขียวมิ้นต์) (*** NEW ***)
      completed: 50, // 50% (เสร็จสิ้น - เขียวเข้ม)
      total: 120,
    },
    {
      name: "หน่วยงาน xx",
      pending: 20,
      coordinating: 10,
      inProgress: 30,
      forwarded: 5,
      rejected: 5,
      invited: 10,
      completed: 20,
      total: 85,
    },
    {
      name: "หน่วยงาน xx",
      pending: 5,
      coordinating: 10,
      inProgress: 15,
      forwarded: 10,
      rejected: 10,
      invited: 10,
      completed: 40,
      total: 40,
    },
    {
      name: "หน่วยงาน xx",
      pending: 40,
      coordinating: 10,
      inProgress: 10,
      forwarded: 10,
      rejected: 10,
      invited: 5,
      completed: 15,
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
            {/* 2. กำลังประสานงาน (สีม่วง) (*** NEW ***) */}
            <div
              className={styles.mockStackedBarSegment}
              style={{ width: `${item.coordinating}%`, background: "#9b59b6" }}
              title={`กำลังประสานงาน: ${item.coordinating}%`}
            ></div>
            {/* 3. กำลังดำเนินการ (สีเหลือง) */}
            <div
              className={styles.mockStackedBarSegment}
              style={{ width: `${item.inProgress}%`, background: "#ffc107" }}
              title={`กำลังดำเนินการ: ${item.inProgress}%`}
            ></div>
            {/* 4. เสร็จสิ้น (สีเขียวเข้ม) */}
            <div
              className={styles.mockStackedBarSegment}
              style={{ width: `${item.completed}%`, background: "#057A55" }}
              title={`เสร็จสิ้น: ${item.completed}%`}
            ></div>
            {/* 5. ส่งต่อ (สีน้ำเงิน) (*** MODIFIED NAME ***) */}
            <div
              className={styles.mockStackedBarSegment}
              style={{ width: `${item.forwarded}%`, background: "#007bff" }}
              title={`ส่งต่อ: ${item.forwarded}%`}
            ></div>
            {/* 6. เชิญร่วม (สีเขียวมิ้นต์) (*** NEW ***) */}
            <div
              className={styles.mockStackedBarSegment}
              style={{ width: `${item.invited}%`, background: "#20c997" }}
              title={`เชิญร่วม: ${item.invited}%`}
            ></div>
            {/* 7. ปฏิเสธ (สีเทา) (*** MODIFIED NAME ***) */}
            <div
              className={styles.mockStackedBarSegment}
              style={{ width: `${item.rejected}%`, background: "#6c757d" }}
              title={`ปฏิเสธ: ${item.rejected}%`}
            ></div>
          </div>
          <span className={styles.mockHBarValue}>{item.total}</span>
        </div>
      ))}
      {/* คำอธิบายสัญลักษณ์ (Legend) - (*** MODIFIED - 7 สถานะ ***) */}
      <div className={styles.mockStackedBarLegend}>
        <span>
          <span style={{ background: "#dc3545" }}></span> รอรับเรื่อง
        </span>
        <span>
          <span style={{ background: "#9b59b6" }}></span> กำลังประสานงาน
        </span>
        <span>
          <span style={{ background: "#ffc107" }}></span> กำลังดำเนินการ
        </span>
        <span>
          <span style={{ background: "#057A55" }}></span> เสร็จสิ้น
        </span>
        <span>
          <span style={{ background: "#007bff" }}></span> ส่งต่อ
        </span>
        <span>
          <span style={{ background: "#20c997" }}></span> เชิญร่วม
        </span>
        <span>
          <span style={{ background: "#6c757d" }}></span> ปฏิเสธ
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

// (*** DELETED ***)
// ลบ kpiDetails ที่เป็นข้อมูล Mock (ข้อมูลจริงจะถูกสร้างใน Component)
// const kpiDetails = [ ... ];

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

// ------------------------- (*** ADDED BACK / MODIFIED ***) Report Table (อัปเดตสถานะสี)
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

  const getStatusClass = (status) => {
    switch (status) {
      case "รอรับเรื่อง":
        return styles.pending;
      case "กำลังประสานงาน": // *** NEW ***
        return styles.coordinating;
      case "กำลังดำเนินการ":
        return styles.in_progress;
      case "เสร็จสิ้น":
        return styles.completed;
      case "ส่งต่อ": // *** MODIFIED NAME ***
        return styles.forwarded;
      case "เชิญร่วม": // *** NEW ***
        return styles.invited;
      case "ปฏิเสธ": // *** MODIFIED NAME ***
        return styles.rejected;
      default:
        return styles.other;
    }
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
// (*** MODIFIED: นี่คือ Component ที่แก้ไขหลัก ***)
const StatisticsView = ({ subTab, organizationId }) => { // (*** MODIFIED: รับ organizationId ***)
  const [isOpsUnitsOpen, setIsOpsUnitsOpen] = useState(false);

  // (*** NEW: State สำหรับดึงข้อมูลสถิติ ***)
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // (*** DELETED ***) ลบ const { accessToken } = useAuth();

  // (*** NEW: โครงสร้าง KPI (ย้ายมาจากข้างนอก) ***)
  // เราใช้ ID ให้ตรงกับค่า 'status' ใน DB
  const kpiStructure = [
    {
      id: "total", // ID พิเศษสำหรับยอดรวม
      title: "ทั้งหมด",
      note: null,
      color: "#f39c12", // ส้ม
      cssClass: "stats-cream",
    },
    {
      id: "รอรับเรื่อง", // (*** สำคัญ: ต้องตรงกับค่าใน DB ***)
      title: "รอรับเรื่อง",
      note: "เกิน 1 เดือน {pending_overdue} เรื่อง",
      color: "#dc3545", // แดง
      cssClass: "stats-red",
    },
    {
      id: "กำลังประสานงาน", // (*** สำคัญ: ต้องตรงกับค่าใน DB ***)
      title: "กำลังประสานงาน",
      note: null,
      color: "#9b59b6", // ม่วง
      cssClass: "stats-purple",
    },
    {
      id: "กำลังดำเนินการ", // (*** สำคัญ: ต้องตรงกับค่าใน DB ***)
      title: "กำลังดำเนินการ",
      note: "เกิน 1 เดือน {inprogress_overdue} เรื่อง",
      color: "#ffc107", // เหลือง
      cssClass: "stats-yellow",
    },
    {
      id: "เสร็จสิ้น", // (*** สำคัญ: ต้องตรงกับค่าใน DB ***)
      title: "เสร็จสิ้น",
      note: "จัดการเอง {completed_self} เรื่อง ({completed_self_perc}%)",
      color: "#057A55", // เขียว
      cssClass: "stats-green",
    },
    {
      id: "ส่งต่อ", // (*** สำคัญ: ต้องตรงกับค่าใน DB ***)
      title: "ส่งต่อ",
      note: "(ส่งต่อหน่วยงานอื่น)",
      color: "#007bff", // น้ำเงิน
      cssClass: "stats-blue",
    },
    {
      id: "เชิญร่วม", // (*** สำคัญ: ต้องตรงกับค่าใน DB ***)
      title: "เชิญร่วม",
      note: null,
      color: "#20c997", // เขียวมิ้นต์
      cssClass: "stats-mint",
    },
    {
      id: "ปฏิเสธ", // (*** สำคัญ: ต้องตรงกับค่าใน DB ***)
      title: "ปฏิเสธ",
      note: "จัดการเอง {rejected_self} เรื่อง ({rejected_self_perc}%)",
      color: "#6c757d", // เทา
      cssClass: "stats-grey",
    },
  ];

  // (*** NEW: useEffect สำหรับดึงข้อมูล ***)
  useEffect(() => {
    const fetchStats = async () => {
      // (*** MODIFIED ***) ดึง Token จาก localStorage โดยตรง
      const accessToken = localStorage.getItem('accessToken');

      if (!accessToken) {
        setError("Missing auth token from localStorage");
        setLoading(false);
        return;
      }
      if (!organizationId) {
        // setError("Organization ID not loaded"); // รอให้ ID ถูกส่งมาก่อน
        // เราจะไม่ตั้ง error แต่จะแค่รอเงียบๆ
        setLoading(true); // ตั้งเป็น loading ค้างไว้จนกว่า organizationId จะมา
        return;
      }

      try {
        setLoading(true);
        setError(null); // เคลียร์ Error เก่า (ถ้ามี)
        
        // (*** MODIFIED: เพิ่ม organization_id เข้าไปใน URL ***)
        const response = await fetch(`https://premium-citydata-api-ab.vercel.app/api/stats/overview?organization_id=${organizationId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          // (*** ADDED: ตรวจจับ 404/HTML error ***)
          if (response.headers.get("content-type")?.includes("text/html")) {
            throw new Error("API not found (404). Server returned HTML.");
          }
          throw new Error(`Failed to fetch stats: ${response.statusText}`);
        }

        const data = await response.json();
        
        // (*** แปลง Array เป็น Object เพื่อง่ายต่อการใช้งาน ***)
        // ผลลัพธ์: { "รอรับเรื่อง": 15, "เสร็จสิ้น": 120, ... }
        const statsObject = data.reduce((acc, item) => {
          // (ตัวเลขจาก neon-serverless อาจจะเป็น string)
          acc[item.status] = parseInt(item.count, 10);
          return acc;
        }, {});
        
        setStatsData(statsObject);
      } catch (err) {
         // (*** ADDED: ตรวจจับ JSON Parse error ***)
        if (err instanceof SyntaxError) {
          setError("Failed to parse JSON. API might be returning HTML (404).");
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [organizationId]); // (*** MODIFIED: ลบ accessToken ออกจาก dependency ***)

  // (*** NEW: สร้าง kpiDetails แบบไดนามิก ***)
  const totalCases = statsData ? Object.values(statsData).reduce((sum, count) => sum + count, 0) : 0;
    
  const kpiDetailsWithData = kpiStructure.map(kpi => {
    let value = 0;
    if (kpi.id === 'total') {
      value = totalCases;
    } else {
      // ใช้ค่าจาก statsData ที่ดึงมา, ถ้าไม่มีให้เป็น 0
      value = statsData?.[kpi.id] || 0;
    }
    
    // (*** MODIFIED: ป้องกันการหารด้วย 0 ***)
    const percentage = totalCases > 0 ? ((value / totalCases) * 100).toFixed(2) : "0.00";
    
    // (หมายเหตุ: API ยังไม่ได้ส่งข้อมูล 'overdue' หรือ 'self')
    // (เราจะแสดง 0 ไปก่อน)
    const note = kpi.note ? kpi.note
      .replace("{pending_overdue}", 0)
      .replace("{inprogress_overdue}", 0)
      .replace("{completed_self}", 0)
      .replace("{completed_self_perc}", 0)
      .replace("{rejected_self}", 0)
      .replace("{rejected_self_perc}", 0)
      : null;

    return {
      ...kpi,
      value: value,
      percentage: `${percentage}%`,
      note: note
    };
  });
  // (*** END NEW DYNAMIC DATA ***)


  return (
    <div className={styles.statsContainer}>
      {/* 1. Header (ชื่อหน้า) */}
      <div className={styles.statsHeader}>
        <h1 className={styles.statsPageTitle}>ภาพรวมสถิติ</h1>
      </div>

      {/* 2. Sub-Header (วันที่ และ Subtitle) */}
      <div className={styles.statsSubHeader}>
        <span className={styles.statsCurrentDate}>
          {new Date().toLocaleDateString("th-TH", {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
          })}
        </span>
        <span className={styles.statsSubtitle}>
          ข้อมูลปัจจุบัน (จำนวนข้อมูลเรื่องทั้งหมด ที่ประชาชนแจ้งเข้ามา)
        </span>
      </div>

      {/* 4. Detailed KPI Grid (ตาราง KPI 8 กล่อง) */}
      {/* (*** MODIFIED: แสดง Loading/Error/Data ***) */}
      {loading ? (
        // (*** MODIFIED: ปรับปรุง UI ตอน Loading ***)
        <div className={styles.statsDetailGrid}>
          {kpiStructure.map((kpi) => (
             <div
              key={kpi.id}
              className={`${styles.statsDetailBox} ${styles[kpi.cssClass] || ""}`}
              style={{ borderTopColor: kpi.color, opacity: 0.5 }}
            >
              <div className={styles.statsDetailHeader}>
                <span className={styles.statsDetailTitle}>{kpi.title}</span>
                <span className={styles.statsDetailValue}>...</span>
              </div>
              <span className={styles.statsDetailPercentage}>(...)</span>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className={styles.statsLoadingOrErrorError}>
          <FaTimes />
          <span>ไม่สามารถโหลดสถิติได้: {error}</span>
        </div>
      ) : (
        <div className={styles.statsDetailGrid}>
          {kpiDetailsWithData.map((kpi) => (
            <StatsDetailBox
              key={kpi.title}
              title={kpi.title}
              value={kpi.value} // <-- (*** แสดงข้อมูลจริง ***)
              percentage={kpi.percentage} // <-- (*** แสดงข้อมูลจริง ***)
              note={kpi.note}
              color={kpi.color}
              cssClass={kpi.cssClass}
            />
          ))}
        </div>
      )}

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
// (*** END MODIFIED StatisticsView ***)


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
            จำนวนเรื่องแจ้ง (7 สถานะ)
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
                <option value="pending">รอรับเรื่อง</option>
                <option value="in_progress">กำลังดำเนินการ</option>
                <option value="completed">เสร็จสิ้น</option>
                <option value="forwarded">ส่งต่อ</option>
                <option value="rejected">ปฏิเสธ</option>
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

            {/* Mock Pin 1 (รอรับเรื่อง - แดง) */}
            <FaMapMarkerAlt
              className={`${styles.mockMapPin} ${styles.pending}`}
              style={{ top: "30%", left: "40%" }}
            />

            {/* Mock Pin 2 (กำลังประสานงาน - ม่วง) */}
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
                src={reportData[0].image}
                alt="Mock"
                className={styles.mockPopupImage}
              />
              <span className={styles.mockPopupText}>
                {truncateText(reportData[0].detail, 50)}
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
                <option value="coordinating">กำลังประสานงาน</option>
                <option value="in_progress">กำลังดำเนินการ</option>
                <option value="completed">เสร็จสิ้น</option>
                <option value="forwarded">ส่งต่อ</option>
                <option value="invited">เชิญร่วม</option>
                <option value="rejected">ปฏิเสธ</option>
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
                <FaMapMarkerAlt
                  className={`${styles.mockMapPin} ${styles.rejected}`}
                  style={{ top: "70%", left: "70%" }}
                  title="ปฏิเสธ"
                />

                {/* Legend */}
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
                  <div className={styles.legendItem}>
                    <FaMapMarkerAlt className={styles.rejected} />
                    <span>ปฏิเสธ</span>
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
    id: null, // (*** MODIFIED: เพิ่ม id เป็น null เริ่มต้น ***)
  });

  const [activeTab, setActiveTab] = useState("รายการแจ้ง"); // <-- (*** FIXED ***) เปลี่ยนค่าเริ่มต้นกลับไปที่ "รายการแจ้ง"
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const [activeSubTabs, setActiveSubTabs] = useState({
    แผนที่: "แผนที่สาธารณะ",
    รายการแจ้ง: "เฉพาะหน่วยงาน",
    สถิติ: "สถิติ", // (*** MODIFIED ***) เปลี่ยนค่าเริ่มต้นเป็น "สถิติ" (หน้าหลัก)
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
        let orgToSet = null;

        if (cachedOrg) {
          orgToSet = JSON.parse(cachedOrg);
          localStorage.removeItem("selectedOrg");
          localStorage.setItem("lastSelectedOrg", JSON.stringify(orgToSet));
        } else if (lastOrg) {
          orgToSet = JSON.parse(lastOrg);
        }

        if (orgToSet) {
          // (*** MODIFIED: ตั้งค่า state พร้อม ID ***)
          setOrganizationInfo({ 
            name: orgToSet.name, 
            logo: orgToSet.img,
            id: orgToSet.id || orgToSet.organization_id // <-- [สำคัญ]
          });
        } else {
           // กรณีไม่พบ Org ID เลย (ไม่ควรเกิดขึ้น แต่ป้องกันไว้)
           setOrganizationInfo({ name: "ไม่พบหน่วยงาน", logo: logo, id: null });
        }
      } catch (error) {
        console.error(error);
        setOrganizationInfo({ name: "เกิดข้อผิดพลาด", logo: logo, id: null });
      }
    };
    fetchOrg();
  }, []);

  const handleLogout = () => {
    // (*** MODIFIED ***) ตรวจสอบให้แน่ใจว่าได้ล้าง Token ออกจาก localStorage ตอน Logout
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('lastSelectedOrg');
    localStorage.clear(); // ล้างทั้งหมดเลยก็ได้
    
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
              // (*** MODIFIED: ส่ง organizationId ลงไปเป็น prop ***)
              <StatisticsView 
                subTab={activeSubTabs["สถิติ"]} 
                organizationId={organizationInfo.id} 
              />
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
