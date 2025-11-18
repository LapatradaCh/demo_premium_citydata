import React, { useState, useEffect } from "react";
import styles from "./css/StatisticsView.module.css";
import { 
  FaStar, 
  FaTimes, 
  FaRegClock, 
  FaArrowDown, 
  FaArrowUp 
} from "react-icons/fa";

// --------------------------------------------------------------------
// 1. Component ย่อย: กล่อง KPI Detail
// --------------------------------------------------------------------
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

// --------------------------------------------------------------------
// 2. Component ย่อย: Horizontal Bar Chart (สำหรับประเภทปัญหา)
// --------------------------------------------------------------------
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

// --------------------------------------------------------------------
// 3. Component ย่อย: ProblemTypeStats
// --------------------------------------------------------------------
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
        const response = await fetch(`https://premium-citydata-api-ab.vercel.app/api/stats/count-by-type?organization_id=${organizationId}`, {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        if (!response.ok) throw new Error("Failed to fetch chart data");
        const data = await response.json();
        const formattedData = data.map(item => ({
          ...item,
          count: parseInt(item.count, 10)
        })).sort((a, b) => b.count - a.count);
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
        {error && <p className={styles.mockHBarLabel} style={{color: '#dc3545'}}>เกิดข้อผิดพลาด</p>}
        {chartData && <DynamicHorizontalBarChart data={chartData} />}
      </div>
    </div>
  );
};

// --------------------------------------------------------------------
// 4. Component ย่อย: SatisfactionBox
// --------------------------------------------------------------------
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
        const response = await fetch(`https://premium-citydata-api-ab.vercel.app/api/stats/overall-rating?organization_id=${organizationId}`, {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        if (!response.ok) throw new Error("Failed to fetch satisfaction data");
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

  if (loading) return <div className={styles.chartBox}><p className={styles.mockHBarLabel}>กำลังโหลดข้อมูล...</p></div>;
  if (error || !satisfactionData || satisfactionData.total_count === 0) return <div className={styles.chartBox}><p className={styles.mockHBarLabel}>ไม่มีข้อมูลความพึงพอใจ</p></div>;

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
              <div
                className={styles.satisfactionBreakdownBarFill}
                style={{ width: `${item.percent.toFixed(2)}%`, backgroundColor: item.percent > 0 ? "#ffc107" : "#f0f0f0" }}
              ></div>
            </div>
            <span className={styles.satisfactionBreakdownPercent}>{item.percent.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ====================================================================
// === (*** NEW UPDATE ***) TopStaffStats แบบ Stacked Bar ===
// ====================================================================
const TopStaffStats = ({ organizationId }) => {
  // กำหนดค่า Config ตามรูปภาพที่แนบมา (เรียงลำดับ Priority สี และ Key)
  const statusConfig = [
      { key: 'pending', label: 'รอรับเรื่อง', color: '#ef4444' },      // แดง
      { key: 'coordinating', label: 'กำลังประสานงาน', color: '#a855f7' }, // ม่วง
      { key: 'inProgress', label: 'กำลังดำเนินการ', color: '#eab308' },  // เหลือง
      { key: 'completed', label: 'เสร็จสิ้น', color: '#22c55e' },      // เขียว
      { key: 'forwarded', label: 'ส่งต่อ', color: '#3b82f6' },         // ฟ้า
      { key: 'invited', label: 'เชิญร่วม', color: '#14b8a6' },         // เขียวอมฟ้า
      { key: 'rejected', label: 'ปฏิเสธ', color: '#6b7280' },           // เทา
      { key: 'nullStatus', label: 'NULL', color: '#d1d5db' }           // เทาอ่อน (สำหรับ NULL)
  ];

  const [staffData, setStaffData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ฟังก์ชันแปลงชื่อ Status ภาษาไทยจาก API ให้เป็น Key ภาษาอังกฤษ
  const mapStatusToKey = (statusName) => {
      if (!statusName || statusName === 'NULL') return 'nullStatus';
      const mapping = {
          'รอรับเรื่อง': 'pending',
          'กำลังประสานงาน': 'coordinating',
          'กำลังดำเนินการ': 'inProgress',
          'เสร็จสิ้น': 'completed',
          'ส่งต่อ': 'forwarded',
          'เชิญร่วม': 'invited',
          'ปฏิเสธ': 'rejected'
      };
      return mapping[statusName] || 'nullStatus'; 
  };

  // ฟังก์ชันคำนวณยอดรวมของพนักงานแต่ละคน
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

              // ดึงข้อมูล Activities
              const response = await fetch(`https://premium-citydata-api-ab.vercel.app/api/stats/staff-activities?organization_id=${organizationId}`, {
                  headers: { 'Authorization': `Bearer ${accessToken}` },
              });

              if (!response.ok) throw new Error("Failed to fetch staff activities");

              const rawData = await response.json();
              
              const groupedData = {};

              // Group ข้อมูลตามชื่อพนักงาน และนับแยกตาม Status
              rawData.forEach(item => {
                  const name = item.staff_name || "Unknown Staff";
                  const statusKey = mapStatusToKey(item.new_status); 
                  const count = parseInt(item.count, 10) || 0;

                  if (!groupedData[name]) {
                      groupedData[name] = { 
                          name: name, 
                          pending: 0, coordinating: 0, inProgress: 0, completed: 0, 
                          forwarded: 0, invited: 0, rejected: 0, nullStatus: 0
                      };
                  }

                  if (groupedData[name][statusKey] !== undefined) {
                      groupedData[name][statusKey] += count;
                  }
              });

              // แปลงเป็น Array, เรียงตามยอดรวมมากไปน้อย, ตัดมาแค่ Top 10
              const processedArray = Object.values(groupedData)
                .sort((a, b) => calculateTotal(b) - calculateTotal(a)) 
                .slice(0, 10); 

              setStaffData(processedArray);

          } catch (err) {
              console.error("Error fetching staff stats:", err);
              setError(err.message);
          } finally {
              setLoading(false);
          }
      };

      fetchStaffActivities();
  }, [organizationId]);

  if (loading) return <p className={styles.mockHBarLabel}>กำลังโหลดข้อมูลเจ้าหน้าที่...</p>;
  if (error) return <p className={styles.mockHBarLabel} style={{color: '#dc3545'}}>เกิดข้อผิดพลาด: {error}</p>;
  if (staffData.length === 0) return <p className={styles.mockHBarLabel}>ไม่มีข้อมูลกิจกรรมเจ้าหน้าที่</p>;

  // หาค่า Max Total เพื่อใช้คำนวณความยาวของแท่ง Bar หลัก
  const maxTotal = Math.max(...staffData.map(s => calculateTotal(s)), 0);

  return (
      <div style={{ marginTop: '20px', width: '100%' }}>
          {/* --- Legend (คำอธิบายสี) --- */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '16px', fontSize: '0.75rem', color: '#555' }}>
              {statusConfig.map((item) => (
                  <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: item.color }}></div>
                      <span>{item.label}</span>
                  </div>
              ))}
          </div>

          {/* --- Stacked Bar Charts --- */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {staffData.map((staff, index) => {
                  const total = calculateTotal(staff);
                  // ความยาวของแท่งรวม เทียบกับคนที่มีงานเยอะที่สุด
                  const totalWidthPercent = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
                  
                  return (
                      <div key={index} style={{ display: 'flex', alignItems: 'center', fontSize: '0.9rem' }}>
                          {/* ชื่อเจ้าหน้าที่ */}
                          <div style={{ width: '30%', paddingRight: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#333', fontWeight: '500' }} title={staff.name}>
                              {staff.name}
                          </div>

                          {/* Stacked Bar Container */}
                          <div style={{ width: '60%', display: 'flex', alignItems: 'center' }}>
                              <div style={{ 
                                  width: `${totalWidthPercent}%`, 
                                  height: '20px', // ปรับความสูงแท่ง
                                  display: 'flex', 
                                  borderRadius: '4px', 
                                  overflow: 'hidden',
                                  backgroundColor: '#f3f4f6', // พื้นหลังจางๆ กรณีโหลดไม่ทัน
                                  position: 'relative'
                              }}>
                                  {statusConfig.map((config) => {
                                      const val = staff[config.key] || 0;
                                      if (val <= 0) return null;
                                      
                                      // คำนวณ % ของ segment นี้เทียบกับยอดรวมของพนักงานคนนั้น
                                      const segmentWidth = (val / total) * 100;

                                      return (
                                          <div 
                                              key={config.key}
                                              style={{ 
                                                width: `${segmentWidth}%`, 
                                                height: '100%',
                                                backgroundColor: config.color 
                                              }} 
                                              title={`${config.label}: ${val}`}
                                          ></div>
                                      );
                                  })}
                              </div>
                          </div>

                          {/* ยอดรวมตัวเลข */}
                          <div style={{ width: '10%', textAlign: 'right', fontSize: '0.85rem', color: '#6b7280', fontWeight: '600' }}>
                            {total}
                          </div>
                      </div>
                  );
              })}
          </div>
      </div>
  );
};

// --------------------------------------------------------------------
// 5. Component ย่อย: Mockup เวลาทำงาน (AverageWorkTimeMock)
// --------------------------------------------------------------------
const AverageWorkTimeMock = () => {
  const data = {
    totalTime: "1 วัน 4 ชม.",
    comparePercent: 12.5,
    isFaster: true,
    breakdown: [
      { label: "รอรับเรื่อง", time: "30 นาที", color: "#ef9a9a", width: "10%" },
      { label: "ประสานงาน", time: "3.5 ชม.", color: "#ce93d8", width: "30%" },
      { label: "ดำเนินการแก้ไข", time: "24 ชม.", color: "#fff59d", width: "60%" },
    ]
  };

  return (
    <div className={styles.chartBox} style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
        <div>
          <h4 className={styles.chartBoxTitle} style={{ marginBottom: '5px' }}>เวลาเฉลี่ยในการปิดงาน</h4>
          <span style={{ fontSize: '0.85rem', color: '#6c757d' }}>เฉลี่ยจากเรื่องที่สถานะ "เสร็จสิ้น" ในเดือนนี้</span>
        </div>
        <div style={{ backgroundColor: '#e3f2fd', color: '#1976d2', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FaRegClock size={20} />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '20px' }}>
        <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#333' }}>{data.totalTime}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: '600', color: data.isFaster ? '#057A55' : '#dc3545', backgroundColor: data.isFaster ? '#def7ec' : '#fde8e8', padding: '2px 8px', borderRadius: '12px' }}>
          {data.isFaster ? <FaArrowDown size={10}/> : <FaArrowUp size={10}/>}
          <span>{data.comparePercent}% {data.isFaster ? "เร็วขึ้น" : "ช้าลง"}</span>
        </div>
      </div>
      <div style={{ marginBottom: '15px' }}>
        <div style={{ display: 'flex', width: '100%', height: '12px', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#f0f0f0', marginBottom: '10px' }}>
          {data.breakdown.map((item, index) => (
            <div key={index} style={{ width: item.width, backgroundColor: item.color, borderRight: index !== data.breakdown.length - 1 ? '2px solid #fff' : 'none' }} title={`${item.label}: ${item.time}`} />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
           {data.breakdown.map((item, index) => (
             <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.color }}></div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.75rem', color: '#6c757d' }}>{item.label}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#333' }}>{item.time}</span>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

// ====================================================================
// 6. Component หลัก: StatisticsView
// ====================================================================
const StatisticsView = ({ organizationId }) => {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State สำหรับจำนวนเจ้าหน้าที่ (Total Staff Count)
  const [staffCount, setStaffCount] = useState(null);
  const [staffLoading, setStaffLoading] = useState(true);
  const [staffError, setStaffError] = useState(null);

  const kpiStructure = [
    { id: "total", title: "ทั้งหมด", note: null, color: "#6c757d", cssClass: "stats-cream" },
    { id: "รอรับเรื่อง", title: "รอรับเรื่อง", note: "เกิน 1 เดือน 0 เรื่อง", color: "#dc3545", cssClass: "stats-red" },
    { id: "กำลังประสานงาน", title: "กำลังประสานงาน", note: null, color: "#9b59b6", cssClass: "stats-purple" },
    { id: "กำลังดำเนินการ", title: "กำลังดำเนินการ", note: "เกิน 1 เดือน 0 เรื่อง", color: "#ffc107", cssClass: "stats-yellow" },
    { id: "เสร็จสิ้น", title: "เสร็จสิ้น", note: "จัดการเอง 0 เรื่อง (0%)", color: "#057A55", cssClass: "stats-green" },
    { id: "ส่งต่อ", title: "ส่งต่อ", note: "(ส่งต่อหน่วยงานอื่น)", color: "#007bff", cssClass: "stats-blue" },
    { id: "เชิญร่วม", title: "เชิญร่วม", note: null, color: "#20c997", cssClass: "stats-mint" },
    { id: "ปฏิเสธ", title: "ปฏิเสธ", note: "จัดการเอง 0 เรื่อง (0%)", color: "#6c757d", cssClass: "stats-grey" },
  ];

  // Fetch Overview Stats
  useEffect(() => {
    const fetchStats = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken || !organizationId) { setLoading(false); return; }
      try {
        setLoading(true);
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

  // --- Fetch Staff Count (API ตามที่ร้องขอ) ---
  useEffect(() => {
    const fetchStaffCount = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken || !organizationId) { setStaffLoading(false); return; }
      try {
        setStaffLoading(true);
        const response = await fetch(`https://premium-citydata-api-ab.vercel.app/api/stats/staff-count?organization_id=${organizationId}`, {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        if (!response.ok) throw new Error("Failed to fetch staff count");
        const data = await response.json();
        if (data.staff_count !== undefined) {
            setStaffCount(parseInt(data.staff_count, 10));
        }
      } catch (err) { setStaffError(err.message); } finally { setStaffLoading(false); }
    };
    fetchStaffCount();
  }, [organizationId]);

  const totalCases = statsData ? Object.values(statsData).reduce((sum, count) => sum + count, 0) : 0;
  const kpiDetailsWithData = kpiStructure.map(kpi => {
    const value = kpi.id === 'total' ? totalCases : (statsData?.[kpi.id] || 0);
    const percentage = totalCases > 0 ? ((value / totalCases) * 100).toFixed(2) : "0.00";
    return { ...kpi, value, percentage };
  });

  return (
    <div className={styles.statsContainer}>
      <div className={styles.statsHeader}>
        <h1 className={styles.statsPageTitle}>ภาพรวมสถิติ</h1>
      </div>
      <div className={styles.statsSubHeader}>
        <span className={styles.statsCurrentDate}>{new Date().toLocaleDateString("th-TH", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        <span className={styles.statsSubtitle}>ข้อมูลปัจจุบัน (จำนวนข้อมูลเรื่องทั้งหมด ที่ประชาชนแจ้งเข้ามา)</span>
      </div>

      {/* KPI Grid */}
      <div className={styles.statsDetailGrid}>
        {loading ? <p>กำลังโหลด...</p> : kpiDetailsWithData.map((kpi) => (
          <StatsDetailBox key={kpi.title} {...kpi} />
        ))}
      </div>

      {/* Bottom Grid */}
      <div className={styles.statsBottomGrid}>
        <div className={styles.statsGridColumn}>
          <ProblemTypeStats organizationId={organizationId} />
          <SatisfactionBox organizationId={organizationId} />
        </div>

        <div className={styles.statsGridColumn}>
          <AverageWorkTimeMock />
          
          {/* Top Staff Box with Stacked Bar */}
          <div className={styles.chartBox}>
            <h4 className={styles.chartBoxTitle}>10 อันดับเจ้าหน้าที่ ที่มีการทำงานมากที่สุด</h4>
            <div className={styles.opsContent}>
              <div className={styles.opsKpi} style={{marginBottom: 0}}>
                <span>เจ้าหน้าที่ทั้งหมด</span>
                {/* แสดงจำนวนเจ้าหน้าที่จาก API staff-count */}
                <strong>
                  {staffLoading ? "..." : (staffError ? "-" : staffCount)} (คน)
                </strong>
              </div>
              <TopStaffStats organizationId={organizationId} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StatisticsView;
