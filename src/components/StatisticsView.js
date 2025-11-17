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

// =============================================================================
// (*** NEW COMPONENT: 10 อันดับเจ้าหน้าที่ (Stacked Bar Chart) ***)
// =============================================================================
const StaffPerformanceChart = ({ organizationId }) => {
  // Mock Data เพื่อให้เหมือนในรูปภาพ (หากมี API ให้เปลี่ยนไป fetch แทน)
  const mockData = [
    { name: "กมนัช พรหมบำรุง", inProgress: 7, completed: 5, forwarded: 4, irrelevant: 2 },
    { name: "กมนัช traffy fondue", inProgress: 4, completed: 1, forwarded: 1, irrelevant: 1 },
    { name: "Phumchai Siriphanpor...", inProgress: 2, completed: 2, forwarded: 0, irrelevant: 0 },
    { name: "AbuDaHBeE Tubtim", inProgress: 4, completed: 0, forwarded: 0, irrelevant: 0 },
    { name: "Traffy-testkk NECTEC,...", inProgress: 3, completed: 1, forwarded: 0, irrelevant: 0 },
    { name: "SuperToy Noppadol", inProgress: 2, completed: 0, forwarded: 0, irrelevant: 0 },
    { name: "Taned Wongpoo", inProgress: 0, completed: 2, forwarded: 0, irrelevant: 0 },
  ];

  // คำนวณค่า Max เพื่อทำ Scale (เช่น ถ้ามากสุดคือ 18 ก็ตั้ง max ไว้ประมาณนั้น)
  const maxVal = Math.max(...mockData.map(d => d.inProgress + d.completed + d.forwarded + d.irrelevant)) || 1;
  // เพิ่ม Buffer ให้กราฟไม่ชนขอบขวาเกินไป (เช่น +20%)
  const scaleMax = Math.ceil(maxVal * 1.2); 

  return (
    <div style={{ padding: '10px 0' }}>
      {/* Header / Legend */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '15px', marginBottom: '15px', fontSize: '0.85rem', color: '#555', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#FCE8A8' }}></span>
            กำลังดำเนินการ
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#B5F088' }}></span>
            เสร็จสิ้น
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#C8D8FA' }}></span>
            ส่งต่อ
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#DDFBFD' }}></span>
            ไม่เกี่ยวข้อง
        </div>
      </div>

      {/* Chart Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {mockData.map((staff, idx) => {
            const total = staff.inProgress + staff.completed + staff.forwarded + staff.irrelevant;
            
            return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', fontSize: '0.9rem', color: '#555' }}>
                    {/* Name Label */}
                    <div style={{ width: '160px', minWidth: '160px', textAlign: 'right', paddingRight: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {staff.name}
                    </div>

                    {/* Bar Track */}
                    <div style={{ flex: 1, display: 'flex', position: 'relative', height: '28px' }}>
                        {/* Stack: In Progress */}
                        {staff.inProgress > 0 && (
                            <div style={{ width: `${(staff.inProgress / scaleMax) * 100}%`, backgroundColor: '#FCE8A8', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={`กำลังดำเนินการ: ${staff.inProgress}`}></div>
                        )}
                        {/* Stack: Completed */}
                        {staff.completed > 0 && (
                             <div style={{ width: `${(staff.completed / scaleMax) * 100}%`, backgroundColor: '#B5F088', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={`เสร็จสิ้น: ${staff.completed}`}></div>
                        )}
                         {/* Stack: Forwarded */}
                         {staff.forwarded > 0 && (
                             <div style={{ width: `${(staff.forwarded / scaleMax) * 100}%`, backgroundColor: '#C8D8FA', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={`ส่งต่อ: ${staff.forwarded}`}></div>
                        )}
                        {/* Stack: Irrelevant */}
                        {staff.irrelevant > 0 && (
                             <div style={{ width: `${(staff.irrelevant / scaleMax) * 100}%`, backgroundColor: '#DDFBFD', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={`ไม่เกี่ยวข้อง: ${staff.irrelevant}`}></div>
                        )}
                    </div>
                </div>
            );
        })}
      </div>

      {/* X-Axis Guide (Optional) */}
      <div style={{ display: 'flex', paddingLeft: '175px', marginTop: '5px', borderTop: '1px solid #eee', paddingTop: '5px', color: '#aaa', fontSize: '0.8rem' }}>
          <div style={{ flex: 1 }}>0</div>
          <div style={{ flex: 1 }}>{Math.round(scaleMax * 0.33)}</div>
          <div style={{ flex: 1 }}>{Math.round(scaleMax * 0.66)}</div>
          <div>{scaleMax}</div>
      </div>
    </div>
  );
};


// ------------------------- (*** 1. StatisticsView - "ภาพรวมสถิติ" ***)
const StatisticsView = ({ subTab, organizationId }) => {
  // const [isOpsUnitsOpen, setIsOpsUnitsOpen] = useState(false); // ไม่ได้ใช้แล้ว

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
          <SatisfactionBox organizationId={organizationId} />
        </div>

        {/* คอลัมน์ที่ 2: การปฏิบัติงาน */}
        <div className={styles.chartBox}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h4 className={styles.chartBoxTitle}>10 อันดับเจ้าหน้าที่ ที่มีการทำงานมากที่สุด</h4>
              {/* สวิตซ์จำลอง (ถ้าต้องการให้ใช้งานได้จริงต้องเขียน Logic เพิ่ม) */}
              <div style={{ fontSize: '0.8rem', color: '#999', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  ข้อมูลแบบตาราง
                  <div style={{ width: '30px', height: '16px', backgroundColor: '#ddd', borderRadius: '10px', position: 'relative' }}>
                      <div style={{ width: '12px', height: '12px', backgroundColor: '#fff', borderRadius: '50%', position: 'absolute', top: '2px', left: '2px' }}></div>
                  </div>
              </div>
          </div>
          
          <div className={styles.opsContent}>
            <div className={styles.opsKpi}>
              <span>เจ้าหน้าที่ทั้งหมด</span>
              {/* (แสดงผล Staff Count ที่ดึงมา) */}
              <strong>
                {staffLoading ? "..." : (staffError ? "-" : staffCount)} (คน)
              </strong>
            </div>
            
            {/* --------------------------------------------- */}
            {/* (*** MODIFIED: แทนที่ส่วนค่าเฉลี่ยเดิม ด้วยกราฟ Stacked Bar ***) */}
            {/* --------------------------------------------- */}
            <div style={{ marginTop: '10px' }}>
                <StaffPerformanceChart organizationId={organizationId} />
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};
export default StatisticsView;
