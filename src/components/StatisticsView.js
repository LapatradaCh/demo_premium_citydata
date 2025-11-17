import React, { useState, useEffect } from "react";
import styles from "./css/StatisticsView.module.css";
import { FaStar, FaChevronDown, FaChevronUp, FaTimes } from "react-icons/fa";

// =============================================================================
// (*** ส่วนประกอบย่อย: StaffPerformanceChart - 10 อันดับเจ้าหน้าที่ ***)
// =============================================================================
const StaffPerformanceChart = () => {
  // Mock Data ตามภาพตัวอย่าง
  const mockData = [
    { name: "กมนัช พรหมบำรุง", inProgress: 7, completed: 5, forwarded: 4, irrelevant: 2 },
    { name: "กมนัช traffy fondue", inProgress: 4, completed: 1, forwarded: 1, irrelevant: 1 },
    { name: "Phumchai Siriphanpor...", inProgress: 2, completed: 2, forwarded: 0, irrelevant: 0 },
    { name: "AbuDaHBeE Tubtim", inProgress: 4, completed: 0, forwarded: 0, irrelevant: 0 },
    { name: "Traffy-testkk NECTEC,...", inProgress: 3, completed: 1, forwarded: 0, irrelevant: 0 },
    { name: "SuperToy Noppadol", inProgress: 2, completed: 0, forwarded: 0, irrelevant: 0 },
    { name: "Taned Wongpoo", inProgress: 0, completed: 2, forwarded: 0, irrelevant: 0 },
  ];

  // คำนวณค่า Max เพื่อทำ Scale
  const maxVal = Math.max(...mockData.map(d => d.inProgress + d.completed + d.forwarded + d.irrelevant)) || 1;
  const scaleMax = Math.ceil(maxVal * 1.2); // เผื่อพื้นที่ด้านขวา 20%

  return (
    <div className={styles.staffChartContainer}>
      {/* Legend (คำอธิบายสี) */}
      <div className={styles.staffChartLegend}>
        <div className={styles.staffChartLegendItem}>
          <span className={styles.staffChartLegendDot} style={{ background: '#FCE8A8' }}></span> กำลังดำเนินการ
        </div>
        <div className={styles.staffChartLegendItem}>
          <span className={styles.staffChartLegendDot} style={{ background: '#B5F088' }}></span> เสร็จสิ้น
        </div>
        <div className={styles.staffChartLegendItem}>
          <span className={styles.staffChartLegendDot} style={{ background: '#C8D8FA' }}></span> ส่งต่อ
        </div>
        <div className={styles.staffChartLegendItem}>
          <span className={styles.staffChartLegendDot} style={{ background: '#DDFBFD' }}></span> ไม่เกี่ยวข้อง
        </div>
      </div>

      {/* Chart Rows */}
      <div className={styles.staffChartRows}>
        {mockData.map((staff, idx) => (
          <div key={idx} className={styles.staffChartRow}>
            <div className={styles.staffChartName} title={staff.name}>{staff.name}</div>
            
            <div className={styles.staffChartBarTrack}>
              {staff.inProgress > 0 && (
                <div className={styles.staffChartBarSegment} style={{ width: `${(staff.inProgress / scaleMax) * 100}%`, background: '#FCE8A8' }} title={`กำลังดำเนินการ: ${staff.inProgress}`}></div>
              )}
              {staff.completed > 0 && (
                <div className={styles.staffChartBarSegment} style={{ width: `${(staff.completed / scaleMax) * 100}%`, background: '#B5F088' }} title={`เสร็จสิ้น: ${staff.completed}`}></div>
              )}
              {staff.forwarded > 0 && (
                <div className={styles.staffChartBarSegment} style={{ width: `${(staff.forwarded / scaleMax) * 100}%`, background: '#C8D8FA' }} title={`ส่งต่อ: ${staff.forwarded}`}></div>
              )}
              {staff.irrelevant > 0 && (
                <div className={styles.staffChartBarSegment} style={{ width: `${(staff.irrelevant / scaleMax) * 100}%`, background: '#DDFBFD' }} title={`ไม่เกี่ยวข้อง: ${staff.irrelevant}`}></div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* X-Axis Labels */}
      <div className={styles.staffChartXAxis}>
        <div>0</div>
        <div>{Math.round(scaleMax * 0.33)}</div>
        <div>{Math.round(scaleMax * 0.66)}</div>
        <div>{scaleMax}</div>
      </div>
    </div>
  );
};

// =============================================================================
// (*** ส่วนประกอบย่อยอื่นๆ: KPI Box, Bar Chart, ProblemType, Satisfaction ***)
// =============================================================================

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
        if (!response.ok) {
            if (response.headers.get("content-type")?.includes("text/html")) throw new Error("API not found (404).");
            throw new Error(`Failed to fetch chart data: ${response.statusText}`);
        }
        const data = await response.json();
        const formattedData = data.map(item => ({ ...item, count: parseInt(item.count, 10) })).sort((a, b) => b.count - a.count);
        setChartData(formattedData);
      } catch (err) {
         setError(err instanceof SyntaxError ? "Failed to parse JSON." : err.message);
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
        if (!response.ok) {
            if (response.headers.get("content-type")?.includes("text/html")) throw new Error("API not found (404).");
            throw new Error(`Failed to fetch satisfaction data: ${response.statusText}`);
        }
        const data = await response.json();
        setSatisfactionData(data);
      } catch (err) {
         setError(err instanceof SyntaxError ? "Failed to parse JSON." : err.message);
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

  if (loading) return <div className={styles.chartBox}><h4 className={styles.chartBoxTitle}>ความพึงพอใจของประชาชน</h4><div className={styles.satisfactionBreakdownContainer}><p className={styles.mockHBarLabel}>กำลังโหลดข้อมูล...</p></div></div>;
  if (error) return <div className={styles.chartBox}><h4 className={styles.chartBoxTitle}>ความพึงพอใจของประชาชน</h4><div className={styles.satisfactionBreakdownContainer}><p className={styles.mockHBarLabel} style={{color: '#dc3545'}}>เกิดข้อผิดพลาด: {error}</p></div></div>;
  if (!satisfactionData || satisfactionData.total_count === 0) return <div className={styles.chartBox}><h4 className={styles.chartBoxTitle}>ความพึงพอใจของประชาชน</h4><div className={styles.satisfactionBreakdownContainer}><p className={styles.mockHBarLabel}>ไม่มีข้อมูลความพึงพอใจ</p></div></div>;

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

// =============================================================================
// (*** MAIN COMPONENT: StatisticsView ***)
// =============================================================================
const StatisticsView = ({ subTab, organizationId }) => {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [staffCount, setStaffCount] = useState(null);
  const [staffLoading, setStaffLoading] = useState(true);
  const [staffError, setStaffError] = useState(null);

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

  useEffect(() => {
    const fetchStats = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) { setError("Missing auth token"); setLoading(false); return; }
      if (!organizationId) { setLoading(true); return; }
      try {
        setLoading(true); setError(null);
        const response = await fetch(`https://premium-citydata-api-ab.vercel.app/api/stats/overview?organization_id=${organizationId}`, {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        if (!response.ok) throw new Error("Failed to fetch stats");
        const data = await response.json();
        const statsObject = data.reduce((acc, item) => { acc[item.status] = parseInt(item.count, 10); return acc; }, {});
        setStatsData(statsObject);
      } catch (err) { setError(err.message); } finally { setLoading(false); }
    };
    fetchStats();
  }, [organizationId]);

  useEffect(() => {
    const fetchStaffCount = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) { setStaffError("Missing auth token"); setStaffLoading(false); return; }
      if (!organizationId) { setStaffLoading(true); return; }
      try {
        setStaffLoading(true); setStaffError(null);
        const response = await fetch(`https://premium-citydata-api-ab.vercel.app/api/stats/staff-count?organization_id=${organizationId}`, {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        if (!response.ok) throw new Error("Failed to fetch staff count");
        const data = await response.json();
        if (data.staff_count !== undefined) setStaffCount(parseInt(data.staff_count, 10));
        else throw new Error("Invalid data");
      } catch (err) { setStaffError(err.message); } finally { setStaffLoading(false); }
    };
    fetchStaffCount();
  }, [organizationId]);

  const totalCases = statsData ? Object.values(statsData).reduce((sum, count) => sum + count, 0) : 0;
  const kpiDetailsWithData = kpiStructure.map(kpi => {
    const value = kpi.id === 'total' ? totalCases : (statsData?.[kpi.id] || 0);
    const percentage = totalCases > 0 ? ((value / totalCases) * 100).toFixed(2) : "0.00";
    return { ...kpi, value, percentage, note: kpi.note?.replace(/\{.*?\}/g, "0") };
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
          {kpiStructure.map(kpi => (
             <div key={kpi.id} className={`${styles.statsDetailBox} ${styles[kpi.cssClass] || ""}`} style={{ borderTopColor: kpi.color, opacity: 0.5 }}>
               <div className={styles.statsDetailHeader}><span className={styles.statsDetailTitle}>{kpi.title}</span><span className={styles.statsDetailValue}>...</span></div>
             </div>
          ))}
        </div>
      ) : error ? (
        <div className={styles.statsLoadingOrErrorError}><FaTimes /><span>ไม่สามารถโหลดสถิติได้: {error}</span></div>
      ) : (
        <div className={styles.statsDetailGrid}>
          {kpiDetailsWithData.map(kpi => <StatsDetailBox key={kpi.title} {...kpi} />)}
        </div>
      )}

      <div className={styles.statsBottomGrid}>
        <div className={styles.statsGridColumn}>
          <ProblemTypeStats organizationId={organizationId} />
          <SatisfactionBox organizationId={organizationId} />
        </div>

        <div className={styles.chartBox}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '10px' }}>
              <h4 className={styles.chartBoxTitle} style={{marginBottom:0, border:0}}>10 อันดับเจ้าหน้าที่ ที่มีการทำงานมากที่สุด</h4>
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
              <strong>{staffLoading ? "..." : (staffError ? "-" : staffCount)} (คน)</strong>
            </div>
            
            {/* แสดงกราฟเจ้าหน้าที่ */}
            <StaffPerformanceChart />
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsView;
