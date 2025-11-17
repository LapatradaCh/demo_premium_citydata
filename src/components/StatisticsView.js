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


// (Component 'SatisfactionBox' - ดึงข้อมูลจริง)
const SatisfactionBox = ({ organizationId }) => {
  const [satisfactionData, setSatisfactionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
  }, [organizationId]);

  const renderStars = (average) => {
    const roundedAverage = Math.round(average);
    return (
      <>
        {[...Array(roundedAverage)].map((_, i) => <FaStar key={`full-${i}`} />)}
        {[...Array(5 - roundedAverage)].map((_, i) => <FaStar key={`empty-${i}`} style={{ color: '#e0e0e0' }} />)}
      </>
    );
  };

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

  const { overall_average, total_count, breakdown } = satisfactionData;

  const breakdownWithPercent = breakdown.map(item => ({
    stars: item.score,
    count: item.count,
    percent: total_count > 0 ? (item.count / total_count) * 100 : 0
  }));

  return (
    <div className={styles.chartBox}>
      <h4 className={styles.chartBoxTitle}>ความพึงพอใจของประชาชน</h4>
      <div className={styles.satisfactionBreakdownContainer}>
        <div className={styles.satisfactionBreakdownHeader}>
          <span className={styles.satisfactionBreakdownScore}>
            {overall_average.toFixed(2)}/5
          </span>
          <span className={styles.satisfactionBreakdownStars}>
            {renderStars(overall_average)}
          </span>
          <span className={styles.satisfactionBreakdownTotal}>
            ({total_count} ความเห็น)
          </span>
        </div>

        {breakdownWithPercent.map((item) => (
          <div key={item.stars} className={styles.satisfactionBreakdownRow}>
            <span className={styles.satisfactionBreakdownLabel}>
              {item.stars} <FaStar />
            </span>
            <div className={styles.satisfactionBreakdownBar}>
              <div
                className={styles.satisfactionBreakdownBarFill}
                style={{
                  width: `${item.percent.toFixed(2)}%`,
                  backgroundColor: item.percent > 0 ? "#ffc107" : "#f0f0f0",
                }}
              ></div>
            </div>
            <span className={styles.satisfactionBreakdownPercent}>
              {item.percent.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ====================================================================
// === (*** MODIFIED COMPONENT: TopStaffStats (ดึงข้อมูลจริง) ***) ===
// ====================================================================
const TopStaffStats = ({ organizationId }) => {
  // 1. กำหนดค่า Config ของสถานะ (ชื่อ, Key, สี Pastel)
  const statusConfig = [
      { key: 'pending', label: 'รอรับเรื่อง', color: '#ef9a9a' },      // แดงอ่อน
      { key: 'coordinating', label: 'กำลังประสานงาน', color: '#ce93d8' }, // ม่วงอ่อน
      { key: 'inProgress', label: 'กำลังดำเนินการ', color: '#fff59d' },  // เหลืองอ่อน
      { key: 'completed', label: 'เสร็จสิ้น', color: '#a5d6a7' },      // เขียวอ่อน
      { key: 'forwarded', label: 'ส่งต่อ', color: '#90caf9' },         // ฟ้าอ่อน
      { key: 'invited', label: 'เชิญร่วม', color: '#80cbc4' },         // เขียวมิ้นต์
      { key: 'rejected', label: 'ปฏิเสธ', color: '#b0bec5' }           // เทาเงิน
  ];

  const [staffData, setStaffData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. Helper Function: แปลงชื่อสถานะ (DB) เป็น Key (Component)
  const mapStatusToKey = (statusName) => {
      const mapping = {
          'รอรับเรื่อง': 'pending',
          'กำลังประสานงาน': 'coordinating',
          'กำลังดำเนินการ': 'inProgress',
          'เสร็จสิ้น': 'completed',
          'ส่งต่อ': 'forwarded',
          'เชิญร่วม': 'invited',
          'ปฏิเสธ': 'rejected'
      };
      // คืนค่า key ที่ตรงกัน, หรือ null ถ้าไม่รู้จักสถานะนี้
      return mapping[statusName] || null; 
  };

  // 3. Helper Function: คำนวณยอดรวม (สำหรับเรียงลำดับ)
  const calculateTotal = (staff) => {
      return statusConfig.reduce((sum, config) => sum + (staff[config.key] || 0), 0);
  };

  useEffect(() => {
      const fetchStaffActivities = async () => {
          const accessToken = localStorage.getItem('accessToken');
          if (!accessToken || !organizationId) {
              setLoading(false);
              return;
          }

          try {
              setLoading(true);
              setError(null);

              // 4. เรียก API ที่เราสร้างขึ้น
              const response = await fetch(`https://premium-citydata-api-ab.vercel.app/api/stats/staff-activities?organization_id=${organizationId}`, {
                  headers: {
                      'Authorization': `Bearer ${accessToken}`,
                  },
              });

              if (!response.ok) {
                  const errorData = await response.json();
                  throw new Error(errorData.message || `Failed to fetch staff activities: ${response.statusText}`);
              }

              const rawData = await response.json();
              
              // 5. *** Data Transformation ***
              // (แปลงข้อมูลจาก [ {name, status, count}, ... ] 
              // เป็น [ {name, pending: N, completed: M, ...}, ... ])
              
              const groupedData = {};

              rawData.forEach(item => {
                  const name = item.staff_name || "Unknown Staff";
                  const statusKey = mapStatusToKey(item.new_status); // แปลง "เสร็จสิ้น" -> "completed"
                  const count = parseInt(item.count, 10) || 0;

                  if (!groupedData[name]) {
                      // ถ้าเจอชื่อนี้ครั้งแรก, สร้าง object เริ่มต้นให้
                      groupedData[name] = { 
                          name: name, 
                          pending: 0, coordinating: 0, inProgress: 0, completed: 0, 
                          forwarded: 0, invited: 0, rejected: 0 
                      };
                  }

                  // ถ้าเป็นสถานะที่เรารู้จัก, ให้บวกยอดเข้าไป
                  if (statusKey) {
                      groupedData[name][statusKey] += count;
                  }
              });

              // 6. แปลง Object กลับเป็น Array, เรียงลำดับ, และเอา 10 อันดับแรก
              const processedArray = Object.values(groupedData)
                .sort((a, b) => calculateTotal(b) - calculateTotal(a)) // เรียงจากมากไปน้อย
                .slice(0, 10); // เอา 10 อันดับ

              setStaffData(processedArray);

          } catch (err) {
              console.error("Error fetching staff stats:", err);
              setError(err.message);
          } finally {
              setLoading(false);
          }
      };

      fetchStaffActivities();
  }, [organizationId]); // ทำงานใหม่เมื่อ organizationId เปลี่ยน

  // 7. Render: แสดงผล Loading / Error / No Data
  if (loading) return <p className={styles.mockHBarLabel}>กำลังโหลดข้อมูลเจ้าหน้าที่...</p>;
  if (error) return <p className={styles.mockHBarLabel} style={{color: '#dc3545'}}>เกิดข้อผิดพลาด: {error}</p>;
  if (staffData.length === 0) return <p className={styles.mockHBarLabel}>ไม่มีข้อมูลกิจกรรมเจ้าหน้าที่</p>;


  // 8. Render: แสดงผลกราฟ
  // (หาค่าสูงสุดเพื่อกำหนดความกว้าง 100% ของกราฟ)
  const maxTotal = Math.max(...staffData.map(s => calculateTotal(s)), 0);

  return (
      <div style={{ marginTop: '20px', width: '100%' }}>
          {/* --- Legend (อธิบายสี) --- */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '15px', fontSize: '0.75rem', color: '#555' }}>
              {statusConfig.map((item) => (
                  <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '4px', marginRight: '4px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: item.color }}></div>
                      <span>{item.label}</span>
                  </div>
              ))}
          </div>

          {/* --- Chart Rows --- */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {staffData.map((staff, index) => {
                  const total = calculateTotal(staff);
                  const totalWidthPercent = maxTotal > 0 ? (total / maxTotal) * 100 : 0;

                  // คำนวณ % ความกว้างของแต่ละส่วนภายในแท่งกราฟ
                  const getPercent = (val) => (total > 0 ? (val / total) * 100 : 0);

                  return (
                      <div key={index} style={{ display: 'flex', alignItems: 'center', fontSize: '0.9rem' }}>
                          {/* ชื่อเจ้าหน้าที่ */}
                          <div style={{ width: '35%', paddingRight: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#333' }} title={staff.name}>
                              {staff.name}
                          </div>

                          {/* Stacked Bar */}
                          <div style={{ width: '65%', display: 'flex', alignItems: 'center' }}>
                              <div style={{ 
                                  width: `${totalWidthPercent}%`, 
                                  height: '24px', 
                                  display: 'flex', 
                                  borderRadius: '4px', 
                                  overflow: 'hidden',
                                  backgroundColor: '#f8f9fa' 
                              }}>
                                  {statusConfig.map((config) => {
                                      const val = staff[config.key] || 0;
                                      if (val <= 0) return null;
                                      return (
                                          <div 
                                              key={config.key}
                                              style={{ width: `${getPercent(val)}%`, backgroundColor: config.color }} 
                                              title={`${config.label}: ${val}`}
                                          ></div>
                                      );
                                  })}
                              </div>
                          </div>
                      </div>
                  );
              })}
          </div>
      </div>
  );
};


// ------------------------- (*** 1. StatisticsView - "ภาพรวมสถิติ" ***)
const StatisticsView = ({ subTab, organizationId }) => {
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

  useEffect(() => {
    let viewportMeta = document.querySelector("meta[name=viewport]");
    if (!viewportMeta) {
      viewportMeta = document.createElement("meta");
      viewportMeta.name = "viewport";
      document.head.appendChild(viewportMeta);
    }
    viewportMeta.setAttribute("content", "width=device-width, initial-scale=1.0");
  }, []);

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
        setStaffLoading(true);
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
          <SatisfactionBox organizationId={organizationId} />
        </div>

        {/* คอลัมน์ที่ 2: การปฏิบัติงาน */}
        <div className={styles.chartBox}>
          <h4 className={styles.chartBoxTitle}>
             10 อันดับเจ้าหน้าที่ ที่มีการทำงานมากที่สุด
          </h4>
          <div className={styles.opsContent}>
            {/* แสดงจำนวนเจ้าหน้าที่ทั้งหมด */}
            <div className={styles.opsKpi} style={{marginBottom: 0}}>
              <span>เจ้าหน้าที่ทั้งหมด</span>
              <strong>
                {staffLoading ? "..." : (staffError ? "-" : staffCount)} (คน)
              </strong>
            </div>

            {/* *** แสดงกราฟ Top Staff (ที่ตอนนี้ดึงข้อมูลจริง) *** */}
            <TopStaffStats organizationId={organizationId} />

          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsView;
