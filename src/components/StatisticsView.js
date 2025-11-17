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


// (*** MODIFIED: Component 'SatisfactionBox' - ดึงข้อมูลจริง ***)
const SatisfactionBox = ({ organizationId }) => {
  const [satisfactionData, setSatisfactionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // (useEffect สำหรับดึงข้อมูลความพึงพอใจ)
  useEffect(() => {
    const fetchSatisfactionData = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken || !organizationId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // (*** MODIFIED: เปลี่ยน URL ไปยัง API overall-rating ***)
        const response = await fetch(`https://premium-citydata-api-ab.vercel.app/api/stats/overall-rating?organization_id=${organizationId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          if (response.headers.get("content-type")?.includes("text/html")) {
            throw new Error("API not found (404). Server returned HTML.");
          }
          throw new Error(`Failed to fetch satisfaction data: ${response.statusText}`);
        }

        const data = await response.json();
        
        // (*** MODIFIED: เก็บข้อมูลที่ได้จาก API ลง State ***)
        // (ข้อมูลที่ได้: { overall_average, total_count, breakdown: [...] })
        setSatisfactionData(data);

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

    fetchSatisfactionData();
  }, [organizationId]); // (ให้ re-fetch เมื่อ organizationId เปลี่ยน)

  // (Helper function สำหรับ Render ดาวตามคะแนนเฉลี่ย)
  const renderStars = (average) => {
    // const fullStars = Math.floor(average);
    // const halfStar = average - fullStars >= 0.5; // (Backend API ไม่มีดาวครึ่ง แต่เผื่อไว้)
    // const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    // (API นี้ดูเหมือนจะให้คะแนนเต็ม)
    // (เราจะปัดเศษตามปกติ)
    const roundedAverage = Math.round(average);

    return (
      <>
        {[...Array(roundedAverage)].map((_, i) => <FaStar key={`full-${i}`} />)}
        {[...Array(5 - roundedAverage)].map((_, i) => <FaStar key={`empty-${i}`} style={{ color: '#e0e0e0' }} />)}
      </>
    );
  };

  // (*** MODIFIED: ส่วน Render ที่ใช้ข้อมูลจริง ***)
  
  // (1. Loading State)
  if (loading) {
    return (
      <div className={styles.chartBox}>
        <h4 className={styles.chartBoxTitle}>ความพึงพอใจของประชาชน</h4>
        <div className={styles.satisfactionBreakdownContainer}>
           <p className={styles.mockHBarLabel}>กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  // (2. Error State)
  if (error) {
    return (
      <div className={styles.chartBox}>
        <h4 className={styles.chartBoxTitle}>ความพึงพอใจของประชาชน</h4>
        <div className={styles.satisfactionBreakdownContainer}>
           <p className={styles.mockHBarLabel} style={{color: '#dc3545'}}>เกิดข้อผิดพลาด: {error}</p>
        </div>
      </div>
    );
  }
  
  // (3. No Data State)
  if (!satisfactionData || satisfactionData.total_count === 0) {
     return (
      <div className={styles.chartBox}>
        <h4 className={styles.chartBoxTitle}>ความพึงพอใจของประชาชน</h4>
        <div className={styles.satisfactionBreakdownContainer}>
           <p className={styles.mockHBarLabel}>ไม่มีข้อมูลความพึงพอใจ</p>
        </div>
      </div>
    );
  }

  // (4. Success State - คำนวณ % สำหรับ breakdown)
  const { overall_average, total_count, breakdown } = satisfactionData;

  const breakdownWithPercent = breakdown.map(item => ({
    stars: item.score,
    count: item.count,
    // (คำนวณ % จาก total_count)
    percent: total_count > 0 ? (item.count / total_count) * 100 : 0
  }));

  // (Render UI จริง)
  return (
    <div className={styles.chartBox}>
      <h4 className={styles.chartBoxTitle}>ความพึงพอใจของประชาชน</h4>
      <div className={styles.satisfactionBreakdownContainer}>
        <div className={styles.satisfactionBreakdownHeader}>
          
          {/* (ใช้ overall_average) */}
          <span className={styles.satisfactionBreakdownScore}>
            {overall_average.toFixed(2)}/5
          </span>
          
          {/* (ใช้ helper renderStars) */}
          <span className={styles.satisfactionBreakdownStars}>
            {renderStars(overall_average)}
          </span>
          
          {/* (ใช้ total_count) */}
          <span className={styles.satisfactionBreakdownTotal}>
            ({total_count} ความเห็น)
          </span>

        </div>

        {/* (ใช้ breakdownWithPercent ที่คำนวณแล้ว) */}
        {breakdownWithPercent.map((item) => (
          <div key={item.stars} className={styles.satisfactionBreakdownRow}>
            <span className={styles.satisfactionBreakdownLabel}>
              {item.stars} <FaStar />
            </span>
            <div className={styles.satisfactionBreakdownBar}>
              <div
                className={styles.satisfactionBreakdownBarFill}
                style={{
                  // (ใช้ % ที่คำนวณได้)
                  width: `${item.percent.toFixed(2)}%`,
                  backgroundColor: item.percent > 0 ? "#ffc107" : "#f0f0f0",
                }}
              ></div>
            </div>
            <span className={styles.satisfactionBreakdownPercent}>
              {/* (ปัดเศษ % สำหรับแสดงผล) */}
              {item.percent.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
// (*** END MODIFIED SatisfactionBox ***)


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

  // ==========================================================
  // === (*** ❗️❗️ เพิ่มโค้ดนี้เข้าไป ❗️❗️ ***) ===
  // ==========================================================
  useEffect(() => {
    // 1. ค้นหาแท็ก viewport ที่อาจมีอยู่
    let viewportMeta = document.querySelector("meta[name=viewport]");

    if (!viewportMeta) {
      // 2. ถ้าไม่มี ให้สร้างขึ้นมาใหม่
      viewportMeta = document.createElement("meta");
      viewportMeta.name = "viewport";
      document.head.appendChild(viewportMeta); // ฉีดเข้าไปใน <head>
    }

    // 3. ตั้งค่า content (นี่คือหัวใจสำคัญ)
    viewportMeta.setAttribute("content", "width=device-width, initial-scale=1.0");

    // 4. (ทางเลือก) นี่คือโค้ดสำหรับล้างค่า เมื่อออกจากหน้านี้
    //    หากคุณต้องการให้หน้าอื่นกลับไปเป็นเหมือนเดิม (ไม่แนะนำ)
    // return () => {
    //   viewportMeta.setAttribute("content", ""); // ล้างค่าเมื่อออกจากหน้า
    // };
    
  }, []); // [] หมายถึง ให้ทำงานแค่ครั้งเดียวเมื่อหน้านี้โหลด
  // ==========================================================
  // === (*** ⭐️ จบส่วนที่เพิ่ม ⭐️ ***) ===
  // ==========================================================


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
        
        const data = await response.json();

        if (data.staff_count !== undefined) {
            setStaffCount(parseInt(data.staff_count, 10));
        } else {
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
          
          {/* (*** MODIFIED: ส่ง organizationId ไปให้ SatisfactionBox ***) */}
          <SatisfactionBox organizationId={organizationId} />
        
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
