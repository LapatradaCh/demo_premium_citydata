import React, { useState, useMemo, useEffect } from 'react';
import styles from './css/OrgStatisticsView.module.css'; // ตรวจสอบ path ให้ตรงกับโปรเจกต์ของคุณ
import { 
  BarChart2, Star, Clock, AlertCircle, 
  CheckCircle, PieChart, Layers 
} from 'lucide-react';

// ==========================================
// 1. CONFIG & UTILS
// ==========================================
const TARGET_SLA_DAYS = 3.0; 

const COLORS = {
  pending: "#FF4D4F",    // แดง
  inProgress: "#FFC107", // เหลือง
  completed: "#4CAF50",  // เขียว
  forwarded: "#2196F3",  // ฟ้า
  invited: "#00BCD4",    // ฟ้าอมเขียว
  rejected: "#6C757D"    // เทา
};

const LABELS = {
  pending: "รอรับเรื่อง",
  inProgress: "ดำเนินการ",
  completed: "เสร็จสิ้น",
  forwarded: "ส่งต่อ",
  invited: "เชิญร่วม",
  rejected: "ปฏิเสธ"
};

const PROBLEM_COLORS = [
  "#3B82F6", "#F59E0B", "#10B981", "#06B6D4", "#EF4444", 
  "#8B5CF6", "#EC4899", "#6366F1", "#9CA3AF"
];

// ==========================================
// 2. SUB-COMPONENTS
// ==========================================

// --- TAB 1: WORKLOAD (ปริมาณงาน) ---
const WorkloadView = ({ data }) => {
  const [sortBy, setSortBy] = useState('total');

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => b[sortBy] - a[sortBy]);
  }, [data, sortBy]);

  const globalStats = useMemo(() => {
    const total = data.reduce((acc, item) => acc + item.total, 0);
    const completed = data.reduce((acc, item) => acc + item.completed, 0);
    const pending = data.reduce((acc, item) => acc + item.pending, 0);
    const successRate = total > 0 ? (completed / total) * 100 : 0;
    return { total, completed, pending, successRate };
  }, [data]);

  return (
    <div className={styles.chartBox}>
      <div className={styles.chartBoxTitle}>
        ปริมาณงานและการจัดการ (ภาพรวม)
        <div className={styles.headerControls}>
             <button 
               onClick={() => setSortBy('total')}
               className={`${styles.controlBtn} ${sortBy === 'total' ? styles.activeTotal : ''}`}
             >ทั้งหมด</button>
             <button 
               onClick={() => setSortBy('pending')}
               className={`${styles.controlBtn} ${sortBy === 'pending' ? styles.activeCritical : ''}`}
             >งานค้าง</button>

            //   <button 
            //   onClick={() => setSortBy('pending')}
            //   className={`${styles.controlBtn} ${sortBy === 'pending' ? styles.activeCritical : ''}`}
            // >งานค้าง (วิกฤต) </button>
        
      </div>

      {/* KPI Section */}
      <div className={styles.kpiGrid}>
        <div className={`${styles.kpiCard} ${styles.kpiCardSuccess}`}>
            <div className={styles.kpiHeader}><CheckCircle size={16} /> อัตราความสำเร็จ</div>
            <div className={styles.kpiValue}>{globalStats.successRate.toFixed(1)}%</div>
            <div className={styles.kpiSubtext}>จากเรื่องร้องเรียนทั้งหมด</div>
        </div>
        <div className={`${styles.kpiCard} ${styles.kpiCardNormal}`}>
            <div className={styles.kpiHeader}><PieChart size={16} /> เรื่องทั้งหมด</div>
            <div className={styles.kpiValue}>{globalStats.total.toLocaleString()}</div>
            <div className={styles.kpiSubtext}>เรื่อง</div>
        </div>
        <div className={`${styles.kpiCard} ${styles.kpiCardCritical}`}>
            <div className={styles.kpiHeader}><AlertCircle size={16} /> งานค้าง (Critical)</div>
            <div className={styles.kpiValue}>{globalStats.pending.toLocaleString()}</div>
            <div className={styles.kpiSubtext}>เรื่อง</div>
        </div>
      </div>

      {/* Stacked Bar Chart */}
      <div className={styles.mockStackedBarChart}>
        {sortedData.map((item, index) => {
          const itemSuccessRate = item.total > 0 ? (item.completed / item.total) * 100 : 0;
          return (
            <div key={index} style={{ marginBottom: '24px' }}>
              
              {/* Header: ชื่อเขต | สถิติ */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#333' }}>
                  {item.name}
                </span>
                <div style={{ fontSize: '14px' }}>
                  {/* แก้ไข: เพิ่มจำนวนเคส และวงเล็บเปอร์เซ็นต์ตามที่ขอ */}
                  <span style={{ color: '#10B981', fontWeight: '700', marginRight: '8px' }}>
                    สำเร็จ {item.completed} ({itemSuccessRate.toFixed(0)}%)
                  </span>
                  <span style={{ color: '#999', fontSize: '13px' }}>
                    | รวม {item.total}
                  </span>
                </div>
              </div>

              {/* Bar Graph */}
              <div className={styles.mockStackedHBar}>
                 {Object.keys(COLORS).map(key => {
                   const val = item[key] || 0;
                   const width = item.total > 0 ? (val / item.total) * 100 : 0;
                   if (width === 0) return null;
                   
                   return (
                     <div 
                       key={key}
                       className={styles.mockStackedBarSegment}
                       style={{ 
                         width: `${width}%`, 
                         background: COLORS[key],
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         color: '#fff',
                         fontSize: '11px',
                         fontWeight: 'bold',
                         textShadow: '0px 1px 2px rgba(0,0,0,0.2)' 
                       }}
                       title={`${LABELS[key]}: ${val}`}
                     >
                       {/* แก้ไข: แสดง จำนวน (เปอร์เซ็นต์%) ในแท่งกราฟ */}
                       {width > 12 && (
                         <span style={{ whiteSpace: 'nowrap' }}>
                            {val} ({width.toFixed(0)}%)
                         </span>
                       )}
                     </div>
                   );
                 })}
              </div>
            </div>
          );
        })}

        {/* Legend */}
        <div className={styles.mockStackedBarLegend}>
           {Object.keys(COLORS).map(key => (
             <div key={key} className={styles.mockStackedBarLegendItem}>
               <span className={styles.legendDot} style={{ background: COLORS[key] }}></span>
               {LABELS[key]}
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

// --- TAB 2: SATISFACTION (ความพึงพอใจ) ---
const SatisfactionView = ({ data }) => {
  const sortedData = [...data].sort((a, b) => b.satisfaction - a.satisfaction);
  
  if(data.length === 0) return <div className={styles.chartBox}><div style={{textAlign:'center', padding:'40px', color:'#999'}}>ไม่มีข้อมูล</div></div>;

  const bestOrg = sortedData[0];
  const worstOrg = sortedData[sortedData.length - 1];

  return (
    <div className={styles.chartBox}>
       <h4 className={styles.chartBoxTitle}>อันดับความพึงพอใจประชาชน</h4>
       
       {/* Highlight Cards */}
       <div className={styles.satisfactionHighlightGrid}>
          <div className={`${styles.highlightCard} ${styles.highlightCardGreen}`}>
             <div className={styles.highlightTitle}>คะแนนสูงสุด</div>
             <div className={styles.highlightName}>{bestOrg?.name || '-'}</div>
             <div className={styles.highlightScore}>
                {bestOrg?.satisfaction.toFixed(1) || '0.0'} 
                <span className={styles.highlightScoreMax}>/ 5.0</span>
             </div>
          </div>
          <div className={`${styles.highlightCard} ${styles.highlightCardRed}`}>
             <div className={styles.highlightTitle}>ต้องปรับปรุง</div>
             <div className={styles.highlightName}>{worstOrg?.name || '-'}</div>
             <div className={styles.highlightScore}>
                {worstOrg?.satisfaction.toFixed(1) || '0.0'}
                <span className={styles.highlightScoreMax}>/ 5.0</span>
             </div>
          </div>
       </div>

       {/* Ranking List */}
       <div className={styles.reportCardList}>
          {sortedData.map((item, index) => (
            <div key={index} className={styles.reportCardItem}>
               <div className={styles.reportCardHeader}>
                  <div className={styles.reportCardTitleGroup}>
                     <span className={styles.reportCardRank} style={{ color: index < 3 ? '#FFC107' : '#999' }}>#{index + 1}</span>
                     <div><div className={styles.reportCardName}>{item.name}</div></div>
                  </div>
                  <div className={styles.reportCardScoreGroup}>
                     <div className={styles.reportCardScoreText}>{item.satisfaction.toFixed(2)}</div>
                     <div className={styles.reportCardScoreStars}>
                        {[...Array(5)].map((_, i) => (
                           <Star key={i} size={14} fill={i < Math.round(item.satisfaction) ? "#FFC107" : "#E0E0E0"} stroke="none" style={{marginRight:2}} />
                        ))}
                     </div>
                     <div className={styles.reportCardScoreReviews}>({item.reviews} รีวิว)</div>
                  </div>
               </div>
               {/* Progress Bar */}
               <div className={styles.reportCardProgressBg}>
                  <div className={styles.reportCardProgressBar} style={{ 
                      width: `${(item.satisfaction / 5) * 100}%`, 
                      background: item.satisfaction >= 4 ? '#4CAF50' : item.satisfaction >= 3 ? '#FFC107' : '#FF4D4F' 
                  }}></div>
               </div>
            </div>
          ))}
       </div>
    </div>
  );
};

// --- TAB 3: EFFICIENCY (SLA) ---
const EfficiencyView = ({ data }) => {
  const sortedData = [...data].sort((a, b) => a.avgTime - b.avgTime);
  const maxVal = Math.max(...data.map(d => d.avgTime), TARGET_SLA_DAYS * 1.5) || 10;
  const overallAvg = data.reduce((acc, curr) => acc + curr.avgTime, 0) / (data.length || 1);

  return (
    <div className={styles.chartBox}>
       <h4 className={styles.chartBoxTitle}>ความรวดเร็วในการแก้ไขปัญหา (SLA)</h4>
       
       {/* SLA Header Box */}
       <div className={styles.slaHeaderBox}>
          <div className={styles.slaTargetInfo}>
             <div className={styles.slaTargetTitle}>เป้าหมาย SLA: ภายใน {TARGET_SLA_DAYS} วัน</div>
             <div className={styles.slaTargetSub}>หากกราฟเกินเส้นประ แสดงว่าล่าช้ากว่ากำหนด</div>
          </div>
          <div className={styles.slaAvgInfo}>
             <span className={styles.slaAvgLabel}>เวลาเฉลี่ยรวมทุกเขต</span>
             <div className={styles.slaAvgValue}>
                {overallAvg.toFixed(1)} <span className={styles.slaUnit}>วัน</span>
             </div>
          </div>
       </div>

       {/* Graph Container */}
       <div className={styles.mockHorizontalBarChart} style={{ marginTop:'20px' }}>
          {/* เส้นประ SLA */}
          <div className={styles.slaLineContainer} style={{ left: `calc(180px + 20px + ${(TARGET_SLA_DAYS / maxVal) * (100 - 25)}% - 50px)` }}>
             <span className={styles.slaLabel}>Target {TARGET_SLA_DAYS} วัน</span>
          </div>

          {/* Bars */}
          {sortedData.map((item, index) => {
             const isOver = item.avgTime > TARGET_SLA_DAYS;
             return (
               <div key={index} className={styles.mockHBarItem}>
                  <span className={styles.mockHBarLabel} style={{ color: isOver ? '#FF4D4F' : '#444' }}>{item.name}</span>
                  <div className={styles.mockHBar}>
                     <div 
                        className={styles.mockHBarFill} 
                        style={{ 
                           width: `${(item.avgTime / maxVal) * 100}%`,
                           background: isOver ? '#FF4D4F' : '#4CAF50'
                        }}
                     ></div>
                  </div>
                  <span className={styles.mockHBarValue} style={{ color: isOver ? '#FF4D4F' : '#000' }}>
                     {item.avgTime.toFixed(1)} วัน
                  </span>
               </div>
             );
          })}
       </div>
    </div>
  );
};

// --- TAB 4: PROBLEM TYPES (Donut) ---
const ProblemTypeView = ({ data }) => {
  const total = data.reduce((acc, item) => acc + item.count, 0);
  const topType = data.length > 0 ? data.reduce((prev, current) => (prev.count > current.count) ? prev : current) : { name: '-', count: 0 };
  const topTypePercent = total > 0 ? (topType.count / total) * 100 : 0;

  let cumulativePercent = 0;
  const donutData = data.map((item, index) => {
    const percent = total > 0 ? item.count / total : 0;
    const startPercent = cumulativePercent;
    cumulativePercent += percent;
    return { ...item, percent, startPercent, color: PROBLEM_COLORS[index % PROBLEM_COLORS.length] };
  });

  const getCoordinates = (percent) => [Math.cos(2 * Math.PI * percent), Math.sin(2 * Math.PI * percent)];

  return (
    <div className={styles.chartBox}>
       <h4 className={styles.chartBoxTitle}>สัดส่วนประเภทปัญหาในพื้นที่</h4>
       
       {/* Header Summary */}
       <div className={styles.donutHeaderBox}>
          <div className={styles.donutTotalBlock}>
             <span className={styles.donutTotalTitle}>เรื่องร้องเรียนทั้งหมด</span>
             <div className={styles.donutTotalNum}>
                {total.toLocaleString()} <span className={styles.donutTotalUnit}>เรื่อง</span>
             </div>
          </div>
          <div className={styles.donutTopTypeBox}>
             <div className={styles.donutTopLabel}>ประเภทที่พบมากที่สุด</div>
             <div className={styles.donutTopBadge}>
                <span style={{width:8, height:8, borderRadius:'50%', background:'#2563eb'}}></span>
                {topType.name} ({topTypePercent.toFixed(0)}%)
             </div>
          </div>
       </div>

       {/* Donut Chart & Legend */}
       <div className={styles.donutContainer}>
          <div className={styles.donutWrapper}>
             <svg viewBox="-1 -1 2 2" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                {donutData.map((item) => {
                   const [startX, startY] = getCoordinates(item.startPercent);
                   const [endX, endY] = getCoordinates(item.startPercent + item.percent);
                   const largeArcFlag = item.percent > 0.5 ? 1 : 0;
                   const pathData = item.percent === 1 
                      ? `M 1 0 A 1 1 0 1 1 -1 0 A 1 1 0 1 1 1 0`
                      : `M ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} L 0 0`;
                   return <path key={item.id} d={pathData} fill={item.color} stroke="#fff" strokeWidth="0.02" />;
                })}
                <circle cx="0" cy="0" r="0.65" fill="#fff" />
             </svg>
             <div className={styles.donutCenterText}>
                <span className={styles.donutTotalValue}>{data.length}</span>
                <span className={styles.donutLabel}>ประเภท</span>
             </div>
          </div>

          <div className={styles.donutLegendGrid}>
             {donutData.map((item) => (
                <div key={item.id} className={styles.donutLegendItem}>
                   <div className={styles.donutLegendInfo}>
                      <span className={styles.donutColorDot} style={{ background: item.color }}></span>
                      <span className={styles.donutName}>{item.name}</span>
                   </div>
                   <div className={styles.donutValues}>
                      <span className={styles.donutCount}>{item.count}</span>
                      <span className={styles.donutPercent}>({(item.percent * 100).toFixed(0)}%)</span>
                   </div>
                </div>
             ))}
          </div>
       </div>
    </div>
  );
};

// ==========================================
// 3. MAIN COMPONENT (CONNECTED)
// ==========================================

export default function OrganizationStatisticsView() {
  const [activeTab, setActiveTab] = useState('workload');
  const [loading, setLoading] = useState(true);
  const [orgData, setOrgData] = useState([]);
  const [problemData, setProblemData] = useState([]);

  // *** ID องค์กรตามจริง ***
  const local= localStorage.getItem("lastSelectedOrg");
  const org = JSON.parse(local);
  const USER_ORG_ID = org.id;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Fetch Data from Real API
        const [orgRes, probRes] = await Promise.all([
          fetch(`https://premium-citydata-api-ab.vercel.app/api/stats/org-stats?org_id=${USER_ORG_ID}`),
          fetch(`https://premium-citydata-api-ab.vercel.app/api/stats/org-count-issue-type?org_id=${USER_ORG_ID}`)
        ]);

        if (orgRes.ok) {
          const rawOrg = await orgRes.json();
          setOrgData(rawOrg.map(item => ({
             ...item,
             pending: item.pending || 0,
             inProgress: item.inProgress || 0,
             completed: item.completed || 0,
             forwarded: item.forwarded || 0,
             rejected: item.rejected || 0,
             invited: item.invited || 0
          })));
        }
        
        if (probRes.ok) {
           const rawProb = await probRes.json();
           setProblemData(rawProb);
        }

      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const renderContent = () => {
    if (loading) return <div className={styles.chartBox}><div style={{height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999'}}>กำลังโหลดข้อมูล...</div></div>;
    
    switch (activeTab) {
      case 'workload': return <WorkloadView data={orgData} />;
      case 'satisfaction': return <SatisfactionView data={orgData} />;
      case 'efficiency': return <EfficiencyView data={orgData} />;
      case 'problemType': return <ProblemTypeView data={problemData} />;
      default: return null;
    }
  };

  const menuItems = [
    { id: 'workload', label: 'จำนวนเรื่องแจ้ง', icon: <BarChart2 size={18} /> },
    { id: 'satisfaction', label: 'เปรียบเทียบความพึงพอใจ', icon: <Star size={18} /> },
    { id: 'efficiency', label: 'เวลาเฉลี่ย (SLA)', icon: <Clock size={18} /> },
    { id: 'problemType', label: 'ประเภทปัญหา', icon: <Layers size={18} /> },
  ];

  return (
    <div className={styles.orgStatsContainer}>
      {/* Sidebar */}
      <div className={styles.orgStatsSidebar}>
        <h3 className={styles.orgStatsMenuTitle}>สถิติองค์กร</h3>
        <nav className={styles.orgStatsMenuNav}>
          {menuItems.map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`${styles.orgStatsMenuButton} ${activeTab === item.id ? styles.active : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className={styles.orgStatsContent}>
        <div className={styles.orgGraphDashboard}>
           {renderContent()}
        </div>
      </div>
    </div>
  );
}
