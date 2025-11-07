import React, { useState, useEffect, useRef } from "react";
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
  FaTimes,
  FaBuilding,
  FaHourglassHalf,
  FaSyncAlt,
  FaCheckCircle,
  FaChartLine,
  FaChartPie,
  FaShare,
  FaTimesCircle,
  FaBookmark,
  FaTools,
  FaTable,
  FaMap,
  FaChevronDown,
  FaChevronUp,
  FaQrcode,
  FaChevronRight,
  FaBell,
  FaLanguage,
  FaLink,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import liff from "@line/liff";
import "cally";

// ------------------------- Helper functions
const toYYYYMMDD = (d) => (d ? d.toISOString().split("T")[0] : null);
const truncateText = (text, maxLength) =>
  text && text.length > maxLength ? text.substring(0, maxLength) + "..." : text;

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
      <button className={styles.timeRangeButton} onClick={() => setShow(!show)}>
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

// ------------------------- ✅ Report Table (fetch จาก API จริง)
const ReportTable = ({ subTab }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAllReports = subTab === "รายการแจ้งรวม";
  const mainFilters = isAllReports
    ? ["ประเภท", "ช่วงเวลา"]
    : ["ประเภท", "สถานะ", "หน่วยงาน", "ช่วงเวลา"];
  const locationFilters = isAllReports ? [] : ["จังหวัด", "อำเภอ/เขต", "ตำบล/แขวง"];
  const modalTitle = isAllReports
    ? "ตัวกรอง (รายการแจ้งรวม)"
    : "ตัวกรอง (เฉพาะหน่วยงาน)";
  const summaryTitle = isAllReports
    ? "รายการแจ้งรวม"
    : "รายการแจ้งเฉพาะหน่วยงาน";

  // ดึงข้อมูลจริงจาก API
  useEffect(() => {
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
        console.error("Error fetching cases:", err);
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
            
            {/* --- ส่วนสำหรับดึงชื่อหน่วยงาน (ถ้ามี) --- */}
            let orgNames = "-";
            if (report.responsible_orgs && report.responsible_orgs.length > 0) {
              orgNames = report.responsible_orgs.map(org => org.name).join(", ");
            } else if (report.responsible_organization_names && report.responsible_organization_names.length > 0) {
              orgNames = report.responsible_organization_names.join(", ");
            }
            
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
                  <span className={styles.reportIdText}>#{report.case_code}</span>
                  <p className={styles.reportDetailText}>
                    {truncateText(report.title || "-", 40)}
                  </p>
                </div>
                <div className={styles.reportStatusGroup}>
                  
                  {/* ===== 🚩 CHANGE 1: แสดงประเภทของปัญหา ===== */}
                  <span className={`${styles.statusTag} ${styles.other}`}>
                    {report.issue_type_name || (report.issue_type && report.issue_type.name) || "ไม่ระบุประเภท"}
                  </span>
                  {/* ========================================= */}

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
                      
                      {/* ===== 🚩 CHANGE 2: เปลี่ยนจาก แท็ก เป็น หน่วยงานที่รับผิดชอบ ===== */}
                      <span>
                        หน่วยงานที่รับผิดชอบ: {orgNames}
                      </span>
                      {/* ======================================================== */}
                      
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

// ------------------------- Main Home Component
const Home = () => {
  const navigate = useNavigate();
  const [organizationInfo, setOrganizationInfo] = useState({
    name: "กำลังโหลด...",
    logo: logo,
  });

  const [activeTab, setActiveTab] = useState("รายการแจ้ง");
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const [activeSubTabs, setActiveSubTabs] = useState({
    แผนที่: "แผนที่สาธารณะ",
    รายการแจ้ง: "เฉพาะหน่วยงาน",
    สถิติ: "สถิติ",
    ตั้งค่า: "ตั้งค่า",
  });

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
      items: ["ตั้งค่า", "QRCode หน่วยงาน", "QRCode สร้างเอง"],
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
        <img src={organizationInfo.logo} alt="Logo" className={styles.logoImg} />
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
          <ReportTable subTab={activeSubTabs["รายการแจ้ง"]} />
        )}
      </div>

      {/* --- Bottom Nav --- */}
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
