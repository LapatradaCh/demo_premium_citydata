import React, { useState, useEffect, useRef } from "react";
// (*** MODIFIED ***) นำเข้า CSS Module ที่ถูกต้อง
import styles from "./css/Home.module.css";
// ... (imports อื่นๆ เหมือนเดิม) ...
import {
  FaMapMarkedAlt,
// ... (ไอคอนอื่นๆ เหมือนเดิม) ...
  FaMapMarkerAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import liff from "@line/liff";
import "cally";

// ------------------------- (*** ข้อมูลและ Component ย่อยสำหรับหน้าสถิติใหม่ ***)
// ... (StatsDetailBox, MockLineChart, TrendChartBox, MockHorizontalBarChart, ProblemTypeBox, SatisfactionBox, MockOrgStackedBarChart, MockSimpleBarChart ทั้งหมดเหมือนเดิม) ...

// (*** MODIFIED ***)
// ข้อมูล KPI 6 รายการที่สำคัญ (ปรับปรุงตามคำขอ และใส่สีตรงๆ)
const kpiDetails = [
// ... (kpiDetails เหมือนเดิม) ...
];

// (ข้อมูลฟิลเตอร์ - *เก็บไว้เผื่อใช้ แต่ไม่ได้แสดงผลแล้ว*)
const kpiFilters = [
// ... (kpiFilters เหมือนเดิม) ...
];

const compareFilters = ["2021", "2022", "2023", "2024"];

// ------------------------- (*** DELETED ***)
// (ลบ const reportData ที่เป็น mock-up ออกจากตรงนี้)
// const reportData = [ ... ]; 

// ------------------------- Helper
const toYYYYMMDD = (d) => (d ? d.toISOString().split("T")[0] : null);
// ... (truncateText, DateFilter เหมือนเดิม) ...

// ------------------------- Report Table
const ReportTable = ({ subTab }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState(null);

  // (*** 1. ADDED ***)
  // เพิ่ม State สำหรับเก็บข้อมูล, สถานะการโหลด, และข้อผิดพลาด
  const [reportData, setReportData] = useState([]); // ใช้ชื่อเดิม reportData
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // (*** 2. ADDED ***)
  // เพิ่ม useEffect เพื่อ Fetch ข้อมูลจาก API
  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // ดึงข้อมูลจาก API endpoint ที่คุณระบุ
        const response = await fetch(
          "https://premium-citydata-api-ab.vercel.app/api/cases/issue_cases"
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // สมมติว่า API trả về một array ของ report
        // หาก API trả về object เช่น { cases: [...] } ให้ใช้ data.cases
        setReportData(data); 

      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch reports:", err);
      } finally {
        setIsLoading(false);
      }
    };

    // (ในอนาคต อาจจะย้ายเงื่อนไขการ fetch ตาม subTab มาไว้ตรงนี้)
    fetchReports();
    
    // หากต้องการให้ fetch ใหม่ทุกครั้งที่ subTab เปลี่ยน ให้ใส่ [subTab]
  }, [subTab]);


  const isAllReports = subTab === "รายการแจ้งรวม";
  const mainFilters = isAllReports
    ? ["ประเภท", "ช่วงเวลา"]
    : ["ประเภท", "สถานะ", "หน่วยงาน", "ช่วงเวลา"];
// ... (locationFilters, modalTitle, summaryTitle, handleToggleDetails เหมือนเดิม) ...

  return (
    <>
      {/* Search & Filter Button */}
      <div className={styles.searchTop}>
      {/* ... (ส่วน Search และปุ่ม Filter เหมือนเดิม) ... */}
      </div>

      {/* Filter Modal */}
      {showFilters && (
      {/* ... (ส่วน Modal Filter ทั้งหมดเหมือนเดิม) ... */}
      )}

      {/* (*** 3. ADDED ***) 
          เพิ่มการแสดงผลสำหรับ Loading และ Error */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          กำลังโหลดข้อมูล...
        </div>
      )}
      {error && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'red' }}>
          เกิดข้อผิดพลาดในการโหลดข้อมูล: {error}
        </div>
      )}

      {/* (*** 4. MODIFIED ***) 
          เช็คว่าถ้าไม่ loading และไม่มี error ค่อยแสดงผลข้อมูล */}
      {!isLoading && !error && (
        <>
          {/* Summary */}
          <div className={styles.reportSummary}>
            <strong>{summaryTitle}</strong> 
            {/* (*** 5. MODIFIED ***) อัปเดตจำนวนรายการแบบ dynamic */}
            ({reportData.length} รายการ)
          </div>

          {/* Cards */}
          <div className={styles.reportTableContainer}>
            {/* (*** NO CHANGE NEEDED HERE ***)
              โค้ดส่วนนี้จะใช้ 'reportData' จาก state ที่เรา set ไว้โดยอัตโนมัติ
              ตราบใดที่ API ของคุณส่งข้อมูลกลับมาในโครงสร้างเดิม (id, detail, image, status ฯลฯ)
              โค้ดส่วนนี้ไม่ต้องแก้ไขเลย
            */}
            {reportData.map((report) => {
              const isExpanded = expandedCardId === report.id;
              return (
                <div key={report.id} className={styles.reportTableRow}>
                  <img
                    src={report.image}
                    alt="Report"
                    className={styles.reportImage}
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
        </>
      )} {/* (*** สิ้นสุด !isLoading && !error ***) */}
    </>
  );
};

// ------------------------- (*** 1. StatisticsView - "ปรับปรุงใหม่ตาม Spec" ***)
// ... (StatisticsView, OrganizationStatisticsView, SettingsView, MapView ทั้งหมดเหมือนเดิม) ...


// ------------------------- (*** 5. Main Home - "อัปเดต" ***)
const Home = () => {
  // ... (โค้ดทั้งหมดใน Home component เหมือนเดิม) ...
  return (
    <div>
      {/* ... (โค้ดทั้งหมดใน Home return JSX เหมือนเดิม) ... */}
    </div>
  );
};

export default Home;
