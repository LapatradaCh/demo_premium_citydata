import React, { useState, useEffect } from "react";
import styles from "./css/StatisticsView.module.css";
import { FaStar, FaChevronDown, FaChevronUp, FaTimes } from "react-icons/fa";

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

// (*** MODIFIED ***) (Component ย่อยสำหรับ Horizontal Bar Chart - รองรับข้อมูลจริง)
// (แทนที่ MockHorizontalBarChart เดิม)
const DynamicHorizontalBarChart = ({ data }) => {
  // กำหนดสี (ถ้าข้อมูลมีมากกว่านี้ สีจะวนซ้ำ)
  const colors = ["#007bff", "#ffc107", "#057A55", "#6c757d", "#dc3545", "#20c997"];

  // หาค่าสูงสุดเพื่อคำนวณ % ความกว้าง
  const maxCount = Math.max(...data.map(item => item.count), 0);

  // ถ้าไม่มีข้อมูล ให้แสดงข้อความ
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
                  background: colors[index % colors.length] // วนสี
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

// (*** MODIFIED ***) (Component ย่อยสำหรับกล่อง "ประเภทปัญหา" - ดึงข้อมูลจริง)
// (แทนที่ ProblemTypeBox เดิม)
const ProblemTypeStats = ({ organizationId }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChartData = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken || !organizationId) {
        setLoading(false); // ยังไม่พร้อม
        return; // รอข้อมูล Token และ Org ID
      }

      try {
        setLoading(true);
        setError(null);

        // (*** FIXED URL SCHEME ***)
        const response = await fetch(`https://premium-citydata-api-ab.vercel.app/api/stats/count-by-type?organization_id=${organizationId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          // (Check for HTML error)
          if (response.headers.get("content-type")?.includes("text/html")) {
            throw new Error("API not found (404). Server returned HTML.");
          }
          throw new Error(`Failed to fetch chart data: ${response.statusText}`);
        }

        const data = await response.json();

        // (ตัวเลขจาก neon-serverless อาจจะเป็น string -> แปลงเป็น number)
        // และเรียงลำดับจากมากไปน้อย
        const formattedData = data.map(item => ({
          ...item,
          count: parseInt(item.count, 10)
        })).sort((a, b) => b.count - a.count); // เรียงจากมากไปน้อย

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
  }, [organizationId]); // ให้ re-fetch เมื่อ organizationId เปลี่ยน

  return (
    <div className={styles.chartBox}>
      <h4 className={styles.chartBoxTitle}>สัดส่วนเรื่องแจ้งตามประเภท</h4>
      <div className={styles.problemTypeContent}>
        {loading && <p className={styles.mockHBarLabel}>กำลังโหลดข้อมูล...</p>}
        {error && <p className={styles.mockHBarLabel} style={{color: '#dc3545'}}>เกิดข้อผิดพลาด: {error}</p>}
        {/* (*** MODIFIED ***) เรียกใช้ Dynamic Chart */}
        {chartData && <DynamicHorizontalBarChart data={chartData} />}
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

        // (*** FIXED URL SCHEME ***)
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
          {/* (*** MODIFIED: เรียกใช้ Component ใหม่ และส่ง prop ***) */}
          <ProblemTypeStats organizationId={organizationId} />
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

export default StatisticsView;
