import React, { useState, useEffect } from "react";
import styles from "./css/StatisticsView.module.css";
import { FaStar, FaChevronDown, FaChevronUp, FaTimes } from "react-icons/fa";

// ------------------------- (*** ข้อมูลและ Component ย่อยสำหรับหน้าสถิติเดิม ***)

// (Component ย่อยสำหรับกล่อง KPI แบบละเอียด 8 กล่อง)
const StatsDetailBox = ({ title, value, percentage, note, color, cssClass }) => (
  <div
    className={`${styles.statsDetailBox} ${styles[cssClass] || ""}`}
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

// (Component ย่อยสำหรับ Horizontal Bar Chart - รองรับข้อมูลจริง)
const DynamicHorizontalBarChart = ({ data }) => {
  const colors = ["#007bff", "#ffc107", "#057A55", "#6c757d", "#dc3545", "#20c997"];
  const maxCount = Math.max(...data.map(item => item.count), 0);

  if (data.length === 0) {
    return <p className={styles.mockHBarLabel}>ไม่มีข้อมูลเรื่องแจ้ง</p>;
  }

  return (
    <div className={styles.mockHorizontalBarChart}>
      {data.map((item, index) => {
        const widthPercent = maxCount > 0 ? (item.count / maxCount) * 100 : 0;

        return (
          <div key={item.issue_type_name} className={styles.mockHBarItem}>
            <span className={styles.mockHBarLabel}>{item.issue_type_name}</span>
            <div className={styles.mockHBar}>
              <div
                className={styles.mockHBarFill}
                style={{
                  width: `${widthPercent}%`,
                  background: colors[index % colors.length]
                }}
                title={`${item.issue_type_name}: ${item.count}`}
              ></div>
            </div>
            <span className={styles.mockHBarValue}>{item.count}</span>
          </div>
        );
      })}
    </div>
  );
};

// (Component ย่อยสำหรับกล่อง "ประเภทปัญหา" - ดึงข้อมูลจริง)
const ProblemTypeStats = ({ organizationId }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChartData = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken || !organizationId) {
        setLoading(false); 
        return; 
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`https://premium-citydata-api-ab.vercel.app/api/stats/count-by-type?organization_id=${organizationId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          if (response.headers.get("content-type")?.includes("text/html")) {
            throw new Error("API not found (404). Server returned HTML.");
          }
          throw new Error(`Failed to fetch chart data: ${response.statusText}`);
        }

        const data = await response.json();

        const formattedData = data.map(item => ({
          ...item,
          count: parseInt(item.count, 10)
        })).sort((a, b) => b.count - a.count); 

        setChartData(formattedData);
      } catch (err) {
         if (err instanceof SyntaxError) {
          setError("Failed to parse JSON. API might be returning HTML (404).");
         } else {
          setError(err.message);
         }
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [organizationId]); 

  return (
    <div className={styles.chartBox}>
      <h4 className={styles.chartBoxTitle}>สัดส่วนเรื่องแจ้งตามประเภท</h4>
      <div className={styles.problemTypeContent}>
        {loading && <p className={styles.mockHBarLabel}>กำลังโหลดข้อมูล...</p>}
        {error && <p className={styles.mockHBarLabel} style={{color: '#dc3545'}}>เกิดข้อผิดพลาด: {error}</p>}
        {chartData && <DynamicHorizontalBarChart data={chartData} />}
      </div>
    </div>
  );
};


// (Component 'SatisfactionBox' - ข้อมูลสมมติ)
const SatisfactionBox = () => {
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
      <div className={styles.satisfactionBreakdownContainer}>
        <div className={styles.satisfactionBreakdownHeader}>
          <span className={styles.satisfactionBreakdownScore}>5.00/5</span>
          <span className={styles.satisfactionBreakdownStars}>
            <FaStar /> <FaStar /> <FaStar /> <FaStar /> <FaStar />
          </span>
          <span className={styles.satisfactionBreakdownTotal}>
            (11 ความเห็น)
          </span>
        </div>

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


// ------------------------- (*** 1. StatisticsView - "ภาพรวมสถิติ" ***)
const StatisticsView = ({ subTab, organizationId }) => {
  const [isOpsUnitsOpen, setIsOpsUnitsOpen] = useState(false);

  // (State สำหรับสถิติหลัก)
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // (State สำหรับจำนวนเจ้าหน้าที่)
  const [staffCount, setStaffCount] = useState(null);
  const [staffLoading, setStaffLoading] = useState(true);
  const [staffError, setStaffError] = useState(null);

  // (โครงสร้าง KPI)
  const kpiStructure = [
    { id: "total", title: "ทั้งหมด", note: null, color: "#6c757d", cssClass: "stats-cream" },
    { id: "รอรับเรื่อง", title: "รอรับเรื่อง", note: "เกิน 1 เดือน {pending_overdue} เรื่อง", color: "#dc3545", cssClass: "stats-red" },
    { id: "กำลังประสานงาน", title: "กำลังประสานงาน", note: null, color: "#9b59b6", cssClass: "stats-purple" },
    { id: "กำลังดำเนินการ", title: "กำลังดำเนินการ", note: "เกิน 1 เดือน {inprogress_overdue} เรื่อง", color: "#ffc107", cssClass: "stats-yellow" },
    { id: "เสร็จสิ้น", title: "เสร็จสิ้น", note: "จัดการเอง {completed_self} เรื่อง ({completed_self_perc}%)", color: "#057A55", cssClass: "stats-green" },
    { id: "ส่งต่อ", title: "ส่งต่อ", note: "(ส่งต่อหน่วยงานอื่น)", color: "#007bff", cssClass: "stats-blue" },
    { id: "เชิญร่วม", title: "เชิญร่วม", note: null, color: "#20c997", cssClass: "stats-mint" },
    { id: "ปฏิเสธ", title: "ปฏิเสธ", note: "จัดการเอง {rejected_self} เรื่อง ({rejected_self_perc}%)", color: "#6c757d", cssClass: "stats-grey" },
  ];

  // (useEffect สำหรับดึงสถิติหลัก)
  useEffect(() => {
    const fetchStats = async () => {
      const accessToken = localStorage.getItem('accessToken');

      if (!accessToken) {
        setError("Missing auth token from localStorage");
        setLoading(false);
        return;
      }
      if (!organizationId) {
        setLoading(true); 
        return;
      }

      try {
        setLoading(true);
        setError(null); 

        const response = await fetch(`https://premium-citydata-api-ab.vercel.app/api/stats/overview?organization_id=${organizationId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          if (response.headers.get("content-type")?.includes("text/html")) {
            throw new Error("API not found (404). Server returned HTML.");
          }
          throw new Error(`Failed to fetch stats: ${response.statusText}`);
        }

        const data = await response.json();

        const statsObject = data.reduce((acc, item) => {
          acc[item.status] = parseInt(item.count, 10);
          return acc;
        }, {});

        setStatsData(statsObject);
      } catch (err) {
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
  }, [organizationId]); 

  // (useEffect สำหรับดึงข้อมูล Staff Count)
  useEffect(() => {
    const fetchStaffCount = async () => {
      const accessToken = localStorage.getItem('accessToken');

      if (!accessToken) {
        setStaffError("Missing auth token");
        setStaffLoading(false);
        return;
      }
      if (!organizationId) {
        setStaffLoading(true); // รอ organizationId
        return;
      }

      try {
        setStaffLoading(true);
        setStaffError(null);

        const response = await fetch(`https://premium-citydata-api-ab.vercel.app/api/stats/staff-count?organization_id=${organizationId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          if (response.headers.get("content-type")?.includes("text/html")) {
            throw new Error("API not found (404).");
          }
          throw new Error(`Failed to fetch staff count: ${response.statusText}`);
        }

        // (*** MODIFIED ***)
        // (API backend คืนค่า { "staff_count": "12" } ตามไฟล์ที่คุณให้มา)
        const data = await response.json(); 

        // (*** MODIFIED: เปลี่ยนจาก data.count เป็น data.staff_count ***)
        if (data.staff_count !== undefined) { 
           setStaffCount(parseInt(data.staff_count, 10)); // (*** MODIFIED ***)
        } else {
           // (*** MODIFIED: อัปเดตข้อความ Error ให้ตรงกับความเป็นจริง ***)
           throw new Error("Invalid data structure from staff API (expected 'staff_count')");
        }

      } catch (err) {
        if (err instanceof SyntaxError) {
          setStaffError("Failed to parse JSON (API 404?).");
        } else {
          setStaffError(err.message);
        }
      } finally {
        setStaffLoading(false);
      }
    };

    fetchStaffCount();
  }, [organizationId]); 
  // (*** END NEW useEffect for Staff Count ***)


  // (สร้าง kpiDetails แบบไดนามิก)
  const totalCases = statsData ? Object.values(statsData).reduce((sum, count) => sum + count, 0) : 0;

  const kpiDetailsWithData = kpiStructure.map(kpi => {
    let value = 0;
    if (kpi.id === 'total') {
      value = totalCases;
    } else {
      value = statsData?.[kpi.id] || 0;
    }
    const percentage = totalCases > 0 ? ((value / totalCases) * 100).toFixed(2) : "0.00";
    const note = kpi.note ? kpi.note
      .replace("{pending_overdue}", 0)
      .replace("{inprogress_overdue}", 0)
      .replace("{completed_self}", 0)
      .replace("{completed_self_perc}", 0)
      .replace("{rejected_self}", 0)
      .replace("{rejected_self_perc}", 0)
      : null;

    return { ...kpi, value, percentage, note };
  });


  // (ส่วน Render)
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
      {loading ? (
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
              value={kpi.value}
              percentage={kpi.percentage}
              note={kpi.note}
              color={kpi.color}
              cssClass={kpi.cssClass}
            />
          ))}
        </div>
      )}

      {/* 5. Main Chart Grid (2 คอลัมน์) */}
      <div className={styles.statsBottomGrid}>
        {/* คอลัมน์ที่ 1: ประเภทปัญหา + ความพึงพอใจ */}
        <div className={styles.statsGridColumn}>
          <ProblemTypeStats organizationId={organizationId} />
          <SatisfactionBox />
        </div>

        {/* คอลัมน์ที่ 2: การปฏิบัติงาน */}
        <div className={styles.chartBox}>
          <h4 className={styles.chartBoxTitle}>การปฏิบัติงานของเจ้าหน้าที่</h4>
          <div className={styles.opsContent}>
            <div className={styles.opsKpi}>
              <span>เจ้าหน้าที่ทั้งหมด</span>
              {/* (แสดงผล Staff Count ที่ดึงมา) */}
              <strong>
                {staffLoading ? "..." : (staffError ? "-" : staffCount)} (คน)
              </strong>
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

export default StatisticsView;
