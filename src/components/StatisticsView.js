import React, { useState, useEffect } from "react";
import styles from "./css/StatisticsView.module.css";
import { FaStar, FaChevronDown, FaChevronUp, FaTimes, FaTable, FaChartBar } from "react-icons/fa";

// ------------------------- (Component ย่อยเดิม: StatsDetailBox) -------------------------
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

// ------------------------- (Component ย่อยเดิม: DynamicHorizontalBarChart) -------------------------
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

// ------------------------- (Component ย่อยเดิม: ProblemTypeStats) -------------------------
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
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });

        if (!response.ok) throw new Error(`Failed: ${response.statusText}`);
        const data = await response.json();
        const formattedData = data.map(item => ({ ...item, count: parseInt(item.count, 10) })).sort((a, b) => b.count - a.count);
        setChartData(formattedData);
      } catch (err) {
         setError(err.message);
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

// ------------------------- (Component ย่อยเดิม: SatisfactionBox) -------------------------
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
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        if (!response.ok) throw new Error(`Failed: ${response.statusText}`);
        const data = await response.json();
        setSatisfactionData(data);
      } catch (err) {
         setError(err.message);
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

  if (loading) return <div className={styles.chartBox}><h4 className={styles.chartBoxTitle}>ความพึงพอใจของประชาชน</h4><p className={styles.mockHBarLabel}>กำลังโหลดข้อมูล...</p></div>;
  if (error) return <div className={styles.chartBox}><h4 className={styles.chartBoxTitle}>ความพึงพอใจของประชาชน</h4><p className={styles.mockHBarLabel} style={{color: '#dc3545'}}>เกิดข้อผิดพลาด: {error}</p></div>;
  if (!satisfactionData || satisfactionData.total_count === 0) return <div className={styles.chartBox}><h4 className={styles.chartBoxTitle}>ความพึงพอใจของประชาชน</h4><p className={styles.mockHBarLabel}>ไม่มีข้อมูลความพึงพอใจ</p></div>;

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
          <span className={styles.satisfactionBreakdownScore}>{overall_average.toFixed(2)}/5</span>
          <span className={styles.satisfactionBreakdownStars}>{renderStars(overall_average)}</span>
          <span className={styles.satisfactionBreakdownTotal}>({total_count} ความเห็น)</span>
        </div>
        {breakdownWithPercent.map((item) => (
          <div key={item.stars} className={styles.satisfactionBreakdownRow}>
            <span className={styles.satisfactionBreakdownLabel}>{item.stars} <FaStar /></span>
            <div className={styles.satisfactionBreakdownBar}>
              <div className={styles.satisfactionBreakdownBarFill} style={{ width: `${item.percent.toFixed(2)}%`, backgroundColor: item.percent > 0 ? "#ffc107" : "#f0f0f0" }}></div>
            </div>
            <span className={styles.satisfactionBreakdownPercent}>{item.percent.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ====================================================================================
// === (*** NEW COMPONENT: 10 อันดับเจ้าหน้าที่ (Stacked Bar Chart) ***) ===
// ====================================================================================
const TopActiveStaff = ({ organizationId }) => {
  const [staffData, setStaffData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTableView, setIsTableView] = useState(false); // Toggle สำหรับสวิตช์

  // สีพาสเทลตามภาพต้นแบบ
  const STATUS_COLORS = {
    inprogress: "#FCE8A0", // สีเหลืองอ่อน
    completed: "#B5F19C",  // สีเขียวอ่อน
    forwarded: "#CFE2FE",  // สีฟ้าอ่อน
    irrelevant: "#D8FDFC"  // สีฟ้าอมเขียวอ่อน (Cyan)
  };

  useEffect(() => {
    const fetchStaffPerformance = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken || !organizationId) return;

      setLoading(true);
      try {
        // *** TODO: เปลี่ยน URL นี้เป็น API จริงของคุณ ***
        // const response = await fetch(`.../api/stats/staff-top-10?organization_id=${organizationId}...`);
        // const data = await response.json();

        // --- (MOCK DATA: จำลองข้อมูลเพื่อให้เห็นภาพตามรูป) ---
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate delay
        const mockData = [
          { name: "กมนัช พรหมบำรุง", inprogress: 7, completed: 5, forwarded: 4, irrelevant: 2 },
          { name: "กมนัช traffy fondue", inprogress: 4, completed: 1, forwarded: 1, irrelevant: 1 },
          { name: "Phumchai Siriphanporn", inprogress: 2, completed: 2, forwarded: 0, irrelevant: 0 },
          { name: "AbuDaHBeE Tubtim", inprogress: 4, completed: 0, forwarded: 0, irrelevant: 0 },
          { name: "Traffy-testkk NECTEC", inprogress: 3, completed: 1, forwarded: 0, irrelevant: 0 },
          { name: "SuperToy Noppadol", inprogress: 2, completed: 0, forwarded: 0, irrelevant: 0 },
          { name: "Taned Wongpoo", inprogress: 0, completed: 2, forwarded: 0, irrelevant: 0 },
        ];
        // ---------------------------------------------------

        // คำนวณยอดรวมเพื่อใช้จัดอันดับและคำนวณกราฟ
        const processedData = mockData.map(staff => ({
          ...staff,
          total: staff.inprogress + staff.completed + staff.forwarded + staff.irrelevant
        })).sort((a, b) => b.total - a.total).slice(0, 10); // เอาแค่ 10 อันดับ

        setStaffData(processedData);
      } catch (error) {
        console.error("Error fetching staff top 10:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStaffPerformance();
  }, [organizationId]);

  // หาค่ามากที่สุดเพื่อทำ Scale ของกราฟ
  const maxTotal = Math.max(...staffData.map(s => s.total), 0);

  if (loading) return <p className={styles.mockHBarLabel}>กำลังโหลดข้อมูลเจ้าหน้าที่...</p>;

  return (
    <div style={{ width: '100%', marginTop: '10px' }}>
      
      {/* Header ส่วนหัว: ชื่อ + Toggle Switch */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>10 อันดับเจ้าหน้าที่ ที่มีการทำงานมากที่สุด</h4>
        
        {/* Toggle Switch Design */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#666' }}>
          <span>ข้อมูลแบบตาราง</span>
          <div 
            onClick={() => setIsTableView(!isTableView)}
            style={{
              width: '40px', height: '22px', backgroundColor: isTableView ? '#4CAF50' : '#ccc',
              borderRadius: '20px', position: 'relative', cursor: 'pointer', transition: '0.3s'
            }}
          >
            <div style={{
              width: '18px', height: '18px', backgroundColor: 'white', borderRadius: '50%',
              position: 'absolute', top: '2px', left: isTableView ? '20px' : '2px', transition: '0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
            }} />
          </div>
        </div>
      </div>

      {isTableView ? (
        // --- VIEW: TABLE ---
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                <th style={{ padding: '8px' }}>ชื่อเจ้าหน้าที่</th>
                <th style={{ padding: '8px', color: '#d6a606' }}>กำลังดำเนินการ</th>
                <th style={{ padding: '8px', color: '#28a745' }}>เสร็จสิ้น</th>
                <th style={{ padding: '8px', color: '#007bff' }}>ส่งต่อ</th>
                <th style={{ padding: '8px', color: '#17a2b8' }}>ไม่เกี่ยวข้อง</th>
                <th style={{ padding: '8px' }}>รวม</th>
              </tr>
            </thead>
            <tbody>
              {staffData.map((staff, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <td style={{ padding: '8px' }}>{staff.name}</td>
                  <td style={{ padding: '8px' }}>{staff.inprogress}</td>
                  <td style={{ padding: '8px' }}>{staff.completed}</td>
                  <td style={{ padding: '8px' }}>{staff.forwarded}</td>
                  <td style={{ padding: '8px' }}>{staff.irrelevant}</td>
                  <td style={{ padding: '8px', fontWeight: 'bold' }}>{staff.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        // --- VIEW: STACKED CHART ---
        <div>
          {/* Legend (คำอธิบายสี) */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginBottom: '10px', fontSize: '0.8rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: STATUS_COLORS.inprogress }}></span> กำลังดำเนินการ</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: STATUS_COLORS.completed }}></span> เสร็จสิ้น</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: STATUS_COLORS.forwarded }}></span> ส่งต่อ</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: STATUS_COLORS.irrelevant }}></span> ไม่เกี่ยวข้อง</div>
          </div>

          {/* Chart Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {staffData.map((staff, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', fontSize: '0.9rem' }}>
                {/* Name (Left side) */}
                <div style={{ width: '35%', paddingRight: '10px', textAlign: 'right', color: '#555', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={staff.name}>
                  {staff.name}
                </div>

                {/* Bar Area (Right side) */}
                <div style={{ width: '65%', display: 'flex', alignItems: 'center', position: 'relative' }}>
                  {/* Stacked Bar Container */}
                  <div style={{ 
                    width: '100%', // เต็มพื้นที่ Available
                    height: '35px', 
                    display: 'flex',
                    // พื้นหลังจางๆ เพื่อให้เห็น Scale (Option)
                  }}>
                    {/* คำนวณความกว้างเทียบกับ MaxTotal (Scale ที่แท้จริง) */}
                    
                    {/* Segment: กำลังดำเนินการ */}
                    {staff.inprogress > 0 && (
                      <div style={{ width: `${(staff.inprogress / maxTotal) * 100}%`, backgroundColor: STATUS_COLORS.inprogress, height: '100%' }} title={`กำลังดำเนินการ: ${staff.inprogress}`} />
                    )}
                    {/* Segment: เสร็จสิ้น */}
                    {staff.completed > 0 && (
                      <div style={{ width: `${(staff.completed / maxTotal) * 100}%`, backgroundColor: STATUS_COLORS.completed, height: '100%' }} title={`เสร็จสิ้น: ${staff.completed}`} />
                    )}
                    {/* Segment: ส่งต่อ */}
                    {staff.forwarded > 0 && (
                      <div style={{ width: `${(staff.forwarded / maxTotal) * 100}%`, backgroundColor: STATUS_COLORS.forwarded, height: '100%' }} title={`ส่งต่อ: ${staff.forwarded}`} />
                    )}
                    {/* Segment: ไม่เกี่ยวข้อง */}
                    {staff.irrelevant > 0 && (
                      <div style={{ width: `${(staff.irrelevant / maxTotal) * 100}%`, backgroundColor: STATUS_COLORS.irrelevant, height: '100%' }} title={`ไม่เกี่ยวข้อง: ${staff.irrelevant}`} />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* X-Axis Label (Scale) */}
          <div style={{ display: 'flex', marginLeft: '35%', marginTop: '5px', borderTop: '1px solid #eee', paddingTop: '5px', justifyContent: 'space-between', fontSize: '0.75rem', color: '#888' }}>
            <span>0</span>
            <span>{Math.round(maxTotal / 2)}</span>
            <span>{maxTotal}</span>
          </div>
        </div>
      )}
    </div>
  );
};
// ====================================================================================


// ------------------------- (Main Component: StatisticsView) -------------------------
const StatisticsView = ({ subTab, organizationId }) => {
  // State ต่างๆ
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [staffCount, setStaffCount] = useState(null);
  const [staffLoading, setStaffLoading] = useState(true);
  const [staffError, setStaffError] = useState(null);

  // (*** ไม่ต้องใช้ State isOpsUnitsOpen แล้ว เพราะลบส่วนนั้นออก ***)

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

  // Viewport Meta Fix
  useEffect(() => {
    let viewportMeta = document.querySelector("meta[name=viewport]");
    if (!viewportMeta) {
      viewportMeta = document.createElement("meta");
      viewportMeta.name = "viewport";
      document.head.appendChild(viewportMeta);
    }
    viewportMeta.setAttribute("content", "width=device-width, initial-scale=1.0");
  }, []);

  // Fetch Stats Overview
  useEffect(() => {
    const fetchStats = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) { setError("Missing auth token"); setLoading(false); return; }
      if (!organizationId) { setLoading(true); return; }

      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`https://premium-citydata-api-ab.vercel.app/api/stats/overview?organization_id=${organizationId}`, {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        if (!response.ok) throw new Error(`Failed: ${response.statusText}`);
        const data = await response.json();
        const statsObject = data.reduce((acc, item) => {
          acc[item.status] = parseInt(item.count, 10);
          return acc;
        }, {});
        setStatsData(statsObject);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [organizationId]);

  // Fetch Staff Count
  useEffect(() => {
    const fetchStaffCount = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) { setStaffError("Missing auth token"); setStaffLoading(false); return; }
      if (!organizationId) { setStaffLoading(true); return; }

      try {
        setStaffLoading(true);
        setStaffError(null);
        const response = await fetch(`https://premium-citydata-api-ab.vercel.app/api/stats/staff-count?organization_id=${organizationId}`, {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        if (!response.ok) throw new Error("API Error");
        const data = await response.json();
        if (data.staff_count !== undefined) setStaffCount(parseInt(data.staff_count, 10));
        else throw new Error("Invalid data");
      } catch (err) {
        setStaffError(err.message);
      } finally {
        setStaffLoading(false);
      }
    };
    fetchStaffCount();
  }, [organizationId]);

  const totalCases = statsData ? Object.values(statsData).reduce((sum, count) => sum + count, 0) : 0;

  const kpiDetailsWithData = kpiStructure.map(kpi => {
    let value = kpi.id === 'total' ? totalCases : (statsData?.[kpi.id] || 0);
    const percentage = totalCases > 0 ? ((value / totalCases) * 100).toFixed(2) : "0.00";
    const note = kpi.note ? kpi.note.replace("{pending_overdue}", 0).replace("{inprogress_overdue}", 0).replace("{completed_self}", 0).replace("{completed_self_perc}", 0).replace("{rejected_self}", 0).replace("{rejected_self_perc}", 0) : null;
    return { ...kpi, value, percentage, note };
  });

  return (
    <div className={styles.statsContainer}>
      <div className={styles.statsHeader}>
        <h1 className={styles.statsPageTitle}>ภาพรวมสถิติ</h1>
      </div>
      <div className={styles.statsSubHeader}>
        <span className={styles.statsCurrentDate}>
          {new Date().toLocaleDateString("th-TH", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
        <span className={styles.statsSubtitle}>ข้อมูลปัจจุบัน (จำนวนข้อมูลเรื่องทั้งหมด ที่ประชาชนแจ้งเข้ามา)</span>
      </div>

      {loading ? (
        <div className={styles.statsDetailGrid}>
          {kpiStructure.map((kpi) => (
             <div key={kpi.id} className={`${styles.statsDetailBox} ${styles[kpi.cssClass] || ""}`} style={{ borderTopColor: kpi.color, opacity: 0.5 }}>
               <div className={styles.statsDetailHeader}><span className={styles.statsDetailTitle}>{kpi.title}</span><span>...</span></div>
             </div>
          ))}
        </div>
      ) : error ? (
        <div className={styles.statsLoadingOrErrorError}><FaTimes /><span>{error}</span></div>
      ) : (
        <div className={styles.statsDetailGrid}>
          {kpiDetailsWithData.map((kpi) => (
            <StatsDetailBox key={kpi.title} {...kpi} />
          ))}
        </div>
      )}

      <div className={styles.statsBottomGrid}>
        {/* Column 1: Problem Type + Satisfaction */}
        <div className={styles.statsGridColumn}>
          <ProblemTypeStats organizationId={organizationId} />
          <SatisfactionBox organizationId={organizationId} />
        </div>

        {/* Column 2: Operations + Staff Performance (NEW) */}
        <div className={styles.chartBox}>
          <h4 className={styles.chartBoxTitle}>การปฏิบัติงานของเจ้าหน้าที่</h4>
          <div className={styles.opsContent}>
            
            {/* ส่วนนับจำนวนเจ้าหน้าที่ (คงไว้) */}
            <div className={styles.opsKpi}>
              <span>เจ้าหน้าที่ทั้งหมด</span>
              <strong>{staffLoading ? "..." : (staffError ? "-" : staffCount)} (คน)</strong>
            </div>

            {/* ======================================================== */}
            {/* === (*** MODIFIED: แทนที่ส่วนเดิมด้วย TopActiveStaff ***) === */}
            {/* ======================================================== */}
            <TopActiveStaff organizationId={organizationId} />
            {/* ======================================================== */}

          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsView;
