import React, { useState, useEffect } from "react";
import styles from "./css/StatisticsView.module.css";
import { FaStar, FaChevronDown, FaChevronUp, FaTimes, FaUserTie } from "react-icons/fa";

// ... (Components เดิม: StatsDetailBox, DynamicHorizontalBarChart, ProblemTypeStats, SatisfactionBox เก็บไว้เหมือนเดิม) ...
// เพื่อความกระชับ ผมจะละเว้น Code ส่วนบนที่ไม่ได้แก้ และเริ่มส่วนที่เพิ่มใหม่เลยนะครับ

// ------------------------- (*** ข้อมูลและ Component ย่อยสำหรับหน้าสถิติเดิม ***)
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

// (DynamicHorizontalBarChart ... คงเดิม)
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

// (ProblemTypeStats ... คงเดิม)
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
        if (!response.ok) throw new Error(`Failed to fetch chart data: ${response.statusText}`);
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

// (SatisfactionBox ... คงเดิมตามที่คุณแก้มาแล้ว)
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

// ==========================================================
// === (*** ✨ NEW COMPONENT: TopStaffStats ✨ ***) ===
// ==========================================================
const TopStaffStats = ({ organizationId }) => {
  const [staffData, setStaffData] = useState([]);
  const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null); // ถ้าจะ handle error

  // (สีตามสถานะในรูปภาพ)
  const STATUS_COLORS = {
    inprogress: "#FCE181", // สีเหลืองอ่อน (กำลังดำเนินการ)
    completed: "#AEF089",  // สีเขียวอ่อน (เสร็จสิ้น)
    forwarded: "#C6D8FF",  // สีฟ้าอ่อน (ส่งต่อ)
    irrelevant: "#D6F7FA"  // สีฟ้าจาง (ไม่เกี่ยวข้อง)
  };

  useEffect(() => {
    // (จำลองการดึงข้อมูล - เนื่องจากยังไม่มี API ส่วนนี้ ผมจะ Mock ให้เห็นภาพตามโจทย์)
    // (ในอนาคตเปลี่ยนตรงนี้เป็น fetch ไปยัง API จริง เช่น /api/stats/top-staff)
    const fetchTopStaff = async () => {
      setLoading(true);
      // setTimeout จำลอง delay network
      setTimeout(() => {
        const mockData = [
          { name: "กมนัช พรหมบำรุง", inprogress: 6, completed: 4, forwarded: 3, irrelevant: 1 },
          { name: "กมนัช traffy fondue", inprogress: 4, completed: 1, forwarded: 1, irrelevant: 1 },
          { name: "Phumchai Siriphanporn", inprogress: 2, completed: 2, forwarded: 0, irrelevant: 0 },
          { name: "AbuDaHBeE Tubtim", inprogress: 4, completed: 0, forwarded: 0, irrelevant: 0 },
          { name: "Traffy-testkk NECTEC", inprogress: 3, completed: 1, forwarded: 0, irrelevant: 0 },
          { name: "SuperToy Noppadol", inprogress: 2, completed: 0, forwarded: 0, irrelevant: 0 },
          { name: "Taned Wongpoo", inprogress: 0, completed: 2, forwarded: 0, irrelevant: 0 },
        ];
        setStaffData(mockData);
        setLoading(false);
      }, 800); 
    };

    if (organizationId) {
      fetchTopStaff();
    }
  }, [organizationId]);

  // หาค่า Max รวมเพื่อคำนวณความกว้างของกราฟเทียบกัน
  const maxTotal = Math.max(...staffData.map(s => s.inprogress + s.completed + s.forwarded + s.irrelevant), 0);

  return (
    <div className={styles.opsContent} style={{ paddingBottom: '10px' }}>
       {/* Legend (คำอธิบายสี) */}
       <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '15px', flexWrap: 'wrap', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: STATUS_COLORS.inprogress }}></span> กำลังดำเนินการ</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: STATUS_COLORS.completed }}></span> เสร็จสิ้น</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: STATUS_COLORS.forwarded }}></span> ส่งต่อ</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: STATUS_COLORS.irrelevant }}></span> ไม่เกี่ยวข้อง</div>
       </div>

       {/* Chart Content */}
       {loading ? (
         <p className={styles.mockHBarLabel}>กำลังโหลดข้อมูลเจ้าหน้าที่...</p>
       ) : (
         <div className={styles.staffChartContainer}>
           {staffData.map((staff, idx) => {
             const total = staff.inprogress + staff.completed + staff.forwarded + staff.irrelevant;
             // คำนวณ % ความกว้างของแท่งรวมเทียบกับค่าสูงสุด (เพื่อให้สเกลตรงกันทั้งกราฟ)
             const barWidthPercent = maxTotal > 0 ? (total / maxTotal) * 100 : 0;

             return (
               <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                 {/* ชื่อเจ้าหน้าที่ (ด้านซ้าย) */}
                 <div style={{ width: '35%', paddingRight: '10px', fontSize: '0.9rem', color: '#555', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'right' }} title={staff.name}>
                   {staff.name}
                 </div>

                 {/* แท่งกราฟ (ด้านขวา) */}
                 <div style={{ width: '65%', height: '24px', display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: `${barWidthPercent}%`, height: '100%', display: 'flex', borderRadius: '4px', overflow: 'hidden' }}>
                       {/* ส่วน Stack ต่างๆ */}
                       {staff.inprogress > 0 && <div style={{ width: `${(staff.inprogress/total)*100}%`, background: STATUS_COLORS.inprogress }} title={`กำลังดำเนินการ: ${staff.inprogress}`}></div>}
                       {staff.completed > 0 && <div style={{ width: `${(staff.completed/total)*100}%`, background: STATUS_COLORS.completed }} title={`เสร็จสิ้น: ${staff.completed}`}></div>}
                       {staff.forwarded > 0 && <div style={{ width: `${(staff.forwarded/total)*100}%`, background: STATUS_COLORS.forwarded }} title={`ส่งต่อ: ${staff.forwarded}`}></div>}
                       {staff.irrelevant > 0 && <div style={{ width: `${(staff.irrelevant/total)*100}%`, background: STATUS_COLORS.irrelevant }} title={`ไม่เกี่ยวข้อง: ${staff.irrelevant}`}></div>}
                    </div>
                    {/* ตัวเลขผลรวมท้ายแท่ง (Optional - ถ้าอยากใส่) */}
                    {/* <span style={{ marginLeft: '5px', fontSize: '0.8rem', color: '#888' }}>{total}</span> */}
                 </div>
               </div>
             );
           })}
         </div>
       )}
    </div>
  );
};


// ------------------------- (*** 1. StatisticsView - "ภาพรวมสถิติ" ***)
const StatisticsView = ({ subTab, organizationId }) => {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [staffCount, setStaffCount] = useState(null);
  const [staffLoading, setStaffLoading] = useState(true);
  const [staffError, setStaffError] = useState(null);

  // (โครงสร้าง KPI ... คงเดิม)
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

  // (Fetch Stats Overview ... คงเดิม)
  useEffect(() => {
    const fetchStats = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken || !organizationId) { setLoading(false); return; }
      try {
        setLoading(true); setError(null);
        const response = await fetch(`https://premium-citydata-api-ab.vercel.app/api/stats/overview?organization_id=${organizationId}`, {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        if (!response.ok) throw new Error("Failed");
        const data = await response.json();
        const statsObject = data.reduce((acc, item) => { acc[item.status] = parseInt(item.count, 10); return acc; }, {});
        setStatsData(statsObject);
      } catch (err) { setError(err.message); } finally { setLoading(false); }
    };
    fetchStats();
  }, [organizationId]);

  // (Fetch Staff Count ... คงเดิม)
  useEffect(() => {
    const fetchStaffCount = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken || !organizationId) { setStaffLoading(false); return; }
      try {
        setStaffLoading(true); setStaffError(null);
        const response = await fetch(`https://premium-citydata-api-ab.vercel.app/api/stats/staff-count?organization_id=${organizationId}`, {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        if (!response.ok) throw new Error("Failed");
        const data = await response.json();
        setStaffCount(parseInt(data.staff_count, 10));
      } catch (err) { setStaffError(err.message); } finally { setStaffLoading(false); }
    };
    fetchStaffCount();
  }, [organizationId]);

  const totalCases = statsData ? Object.values(statsData).reduce((sum, count) => sum + count, 0) : 0;
  const kpiDetailsWithData = kpiStructure.map(kpi => {
    let value = kpi.id === 'total' ? totalCases : (statsData?.[kpi.id] || 0);
    const percentage = totalCases > 0 ? ((value / totalCases) * 100).toFixed(2) : "0.00";
    const note = kpi.note ? kpi.note.replace(/\{.*?\}/g, "0") : null; 
    return { ...kpi, value, percentage, note };
  });

  // (ส่วน Render)
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

      {/* KPI Grid */}
      {loading ? (
        <div className={styles.statsDetailGrid}>Loading...</div>
      ) : error ? (
        <div className={styles.statsLoadingOrErrorError}>Error: {error}</div>
      ) : (
        <div className={styles.statsDetailGrid}>
          {kpiDetailsWithData.map((kpi) => (
            <StatsDetailBox key={kpi.title} {...kpi} />
          ))}
        </div>
      )}

      {/* Main Chart Grid (2 คอลัมน์) */}
      <div className={styles.statsBottomGrid}>
        {/* คอลัมน์ที่ 1: ประเภทปัญหา + ความพึงพอใจ */}
        <div className={styles.statsGridColumn}>
          <ProblemTypeStats organizationId={organizationId} />
          <SatisfactionBox organizationId={organizationId} />
        </div>

        {/* (*** MODIFIED: คอลัมน์ที่ 2: ปรับปรุงใหม่ ***) */}
        <div className={styles.chartBox}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
             <h4 className={styles.chartBoxTitle}>10 อันดับเจ้าหน้าที่ ที่มีการทำงานมากที่สุด</h4>
             {/* Toggle ดูแบบตาราง (UI Placeholder ตามรูป) */}
             <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', color: '#666' }}>
                <span>ข้อมูลแบบตาราง</span>
                <div style={{ width: '32px', height: '18px', background: '#ddd', borderRadius: '10px', position: 'relative' }}>
                   <div style={{ width: '14px', height: '14px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: '2px' }}></div>
                </div>
             </div>
          </div>

          <div className={styles.opsContent}>
            {/* แสดงจำนวนเจ้าหน้าที่ทั้งหมดไว้ด้านบนกราฟ เหมือนเดิม หรือจะเอาออกก็ได้ */}
            <div className={styles.opsKpi} style={{ marginBottom: '15px' }}>
              <span><FaUserTie /> เจ้าหน้าที่ทั้งหมดในระบบ</span>
              <strong>
                {staffLoading ? "..." : (staffError ? "-" : staffCount)} (คน)
              </strong>
            </div>

            {/* (*** ใส่ Component ใหม่ที่นี่ ***) */}
            <TopStaffStats organizationId={organizationId} />

          </div>
        </div>
      </div>
    </div>
  ); 
};

export default StatisticsView;
