import React, { useState, useMemo, useEffect } from 'react';
import styles from './css/OrgStatisticsView.module.css'; // Import CSS Module
import { 
  BarChart2, Star, Clock, AlertCircle, 
  CheckCircle, PieChart, Layers, Filter 
} from 'lucide-react';

// ==========================================
// 1. CONFIG & UTILS
// ==========================================
const TARGET_SLA_DAYS = 3.0; 

const COLORS = {
  pending: "#FF4D4F",    // แดง (ตาม CSS เดิม)
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
        {/* Sorting Controls (Inline style for simple layout) */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', fontSize: '12px' }}>
             <button 
               onClick={() => setSortBy('total')}
               style={{ 
                 padding: '4px 12px', borderRadius: '6px', border: '1px solid #eee', cursor: 'pointer',
                 background: sortBy === 'total' ? '#000' : '#fff', color: sortBy === 'total' ? '#fff' : '#666'
               }}
             >ทั้งหมด</button>
             <button 
               onClick={() => setSortBy('pending')}
               style={{ 
                  padding: '4px 12px', borderRadius: '6px', border: '1px solid #eee', cursor: 'pointer',
                  background: sortBy === 'pending' ? '#FF4D4F' : '#fff', color: sortBy === 'pending' ? '#fff' : '#666'
               }}
             >งานค้าง</button>
        </div>
      </div>

      {/* KPI Section (Inline styles used to match Mockup idea without altering CSS file) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {/* Card 1 */}
        <div style={{ background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)', padding: '20px', borderRadius: '16px', color: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.9, fontSize: '14px' }}>
              <CheckCircle size={16} /> อัตราความสำเร็จ
            </div>
            <div style={{ fontSize: '32px', fontWeight: '800', marginTop: '8px' }}>{globalStats.successRate.toFixed(1)}%</div>
        </div>
        {/* Card 2 */}
        <div style={{ border: '1px solid #f0f0f0', padding: '20px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', fontSize: '14px' }}>
              <PieChart size={16} /> เรื่องทั้งหมด
            </div>
            <div style={{ fontSize: '32px', fontWeight: '800', marginTop: '8px', color: '#333' }}>{globalStats.total.toLocaleString()}</div>
        </div>
        {/* Card 3 */}
        <div style={{ border: '1px solid #FF4D4F', background: '#FFF5F5', padding: '20px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FF4D4F', fontSize: '14px' }}>
              <AlertCircle size={16} /> งานค้าง (Critical)
            </div>
            <div style={{ fontSize: '32px', fontWeight: '800', marginTop: '8px', color: '#FF4D4F' }}>{globalStats.pending.toLocaleString()}</div>
        </div>
      </div>

      {/* Stacked Bar Chart */}
      <div className={styles.mockStackedBarChart}>
        {sortedData.map((item, index) => (
          <div key={index} className={styles.mockHBarItem}>
            <span className={styles.mockHBarLabel}>{item.name}</span>
            <div className={styles.mockStackedHBar}>
               {Object.keys(COLORS).map(key => {
                 const val = item[key] || 0;
                 const width = item.total > 0 ? (val / item.total) * 100 : 0;
                 if (width === 0) return null;
                 return (
                   <div 
                     key={key}
                     className={styles.mockStackedBarSegment}
                     style={{ width: `${width}%`, background: COLORS[key] }}
                     title={`${LABELS[key]}: ${val}`}
                   />
                 );
               })}
            </div>
            <span className={styles.mockHBarValue}>{item.total}</span>
          </div>
        ))}

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

  return (
    <div className={styles.chartBox}>
       <h4 className={styles.chartBoxTitle}>อันดับความพึงพอใจ</h4>
       
       <div className={styles.reportCardList}>
          {sortedData.map((item, index) => (
            <div key={index} className={styles.reportCardItem}>
               <div className={styles.reportCardHeader}>
                  <div className={styles.reportCardTitleGroup}>
                     <span className={styles.reportCardRank} style={{ color: index < 3 ? '#FFC107' : '#999' }}>#{index + 1}</span>
                     <div>
                        <div className={styles.reportCardName}>{item.name}</div>
                     </div>
                  </div>
                  <div className={styles.reportCardScoreGroup}>
                     <div className={styles.reportCardScoreText}>{item.satisfaction.toFixed(2)}</div>
                     <div className={styles.reportCardScoreStars}>
                        {[...Array(5)].map((_, i) => (
                           <Star key={i} size={14} 
                                 fill={i < Math.round(item.satisfaction) ? "#FFC107" : "#E0E0E0"} 
                                 stroke="none" 
                                 style={{marginRight:2}} />
                        ))}
                     </div>
                     <div className={styles.reportCardScoreReviews}>({item.reviews} รีวิว)</div>
                  </div>
               </div>
               
               {/* Progress Bar (Visual Only) */}
               <div style={{ marginTop: '16px', height: '6px', background: '#f5f5f5', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ 
                      height: '100%', 
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
       <h4 className={styles.chartBoxTitle}>
          เวลาเฉลี่ยในการแก้ไขปัญหา (วัน)
          <span style={{ fontSize:'12px', fontWeight:'normal', marginLeft:'auto', color:'#666' }}>
            ค่าเฉลี่ยรวม: <b>{overallAvg.toFixed(1)} วัน</b>
          </span>
       </h4>
       <div className={styles.chartNote}>(*ยิ่งน้อยยิ่งดี / เส้นประคือเป้าหมาย {TARGET_SLA_DAYS} วัน)</div>

       <div className={styles.mockHorizontalBarChart} style={{ position: 'relative' }}>
          
          {/* SLA Line Overlay */}
          <div style={{ 
            position: 'absolute', 
            left: `calc(180px + 20px + ${(TARGET_SLA_DAYS / maxVal) * (100 - 25)}% - 50px)`, // Adjust calculation roughly to fit grid
            top: 0, bottom: 0, 
            borderLeft: '2px dashed #FF4D4F', 
            zIndex: 10,
            opacity: 0.5,
            pointerEvents: 'none'
          }}>
             <span style={{ position: 'absolute', top: '-25px', left: '-30px', background: '#FF4D4F', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '4px' }}>
                Target {TARGET_SLA_DAYS} วัน
             </span>
          </div>

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
                           background: isOver ? 'linear-gradient(90deg, #FF4D4F 0%, #D32F2F 100%)' : 'linear-gradient(90deg, #4CAF50 0%, #2E7D32 100%)'
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
       <h4 className={styles.chartBoxTitle}>สัดส่วนประเภทปัญหา (ภาพรวม)</h4>
       
       <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}>
          {/* SVG Donut */}
          <div style={{ width: '260px', height: '260px', position: 'relative' }}>
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
             <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <span style={{ fontSize: '36px', fontWeight: '800', color: '#333' }}>{data.length}</span>
                <span style={{ fontSize: '12px', color: '#999' }}>ประเภท</span>
             </div>
          </div>

          {/* Legend Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px', width: '100%' }}>
             {donutData.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f9f9f9', borderRadius: '8px' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: item.color }}></span>
                      <span style={{ fontWeight: '600', color: '#555', fontSize: '14px' }}>{item.name}</span>
                   </div>
                   <div style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: '800', color: '#000' }}>{item.count}</span>
                      <span style={{ marginLeft: '6px', color: '#999', fontSize: '12px' }}>({(item.percent * 100).toFixed(0)}%)</span>
                   </div>
                </div>
             ))}
          </div>
       </div>
    </div>
  );
};

// ==========================================
// 3. MAIN APP
// ==========================================

export default function OrganizationStatisticsView() {
  const [activeTab, setActiveTab] = useState('workload');
  const [loading, setLoading] = useState(true);
  const [orgData, setOrgData] = useState([]);
  const [problemData, setProblemData] = useState([]);

  // *** ID องค์กรตามจริง ***
  const USER_ORG_ID = 74;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [orgRes, probRes] = await Promise.all([
          fetch(`https://premium-citydata-api-ab.vercel.app/api/stats/org-stats?org_id=${USER_ORG_ID}`),
          fetch(`https://premium-citydata-api-ab.vercel.app/api/stats/org-count-issue-type?org_id=${USER_ORG_ID}`)
        ]);

        if (orgRes.ok) {
          const rawOrg = await orgRes.json();
          // Map to match format
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
