import React, { useState, useMemo, useEffect } from 'react';
import styles from './css/OrgStatisticsView.module.css'; 
import { 
  BarChart2, Star, Clock, AlertCircle, 
  CheckCircle, PieChart, Layers, 
  ChevronDown, ChevronUp 
} from 'lucide-react';

// ==========================================
// 1. CONFIG & UTILS
// ==========================================
const TARGET_SLA_DAYS = 3.0; 

const COLORS = {
  pending: "#FF4D4F",     
  inProgress: "#FFC107", 
  completed: "#4CAF50",  
  forwarded: "#2196F3",  
  invited: "#00BCD4",    
  rejected: "#6C757D"    
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

// --- TAB 1: WORKLOAD (ปรับ KPI เป็นแนวนอน) ---
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
             >งานค้าง (วิกฤต)</button>
        </div>
      </div>

      <div className={styles.kpiGrid}>
        {/* ✅ ปรับโครงสร้างให้เข้ากับ CSS Grid แนวนอน */}
        <div className={`${styles.kpiCard} ${styles.kpiCardSuccess}`}>
            <div className={styles.kpiHeader}><CheckCircle size={18} /> อัตราความสำเร็จ</div>
            <div className={styles.kpiValue}>{globalStats.successRate.toFixed(1)}%</div>
            <div className={styles.kpiSubtext}>จากเรื่องร้องเรียนทั้งหมด</div>
        </div>
        <div className={`${styles.kpiCard} ${styles.kpiCardNormal}`}>
            <div className={styles.kpiHeader}><PieChart size={18} /> เรื่องทั้งหมด</div>
            <div className={styles.kpiValue}>{globalStats.total.toLocaleString()}</div>
            <div className={styles.kpiSubtext}>เรื่อง</div>
        </div>
        <div className={`${styles.kpiCard} ${styles.kpiCardCritical}`}>
            <div className={styles.kpiHeader}><AlertCircle size={18} /> งานค้าง (Critical)</div>
            <div className={styles.kpiValue}>{globalStats.pending.toLocaleString()}</div>
            <div className={styles.kpiSubtext}>เรื่อง</div>
        </div>
      </div>

      <div className={styles.mockStackedBarChart}>
        {sortedData.map((item, index) => {
          const itemSuccessRate = item.total > 0 ? (item.completed / item.total) * 100 : 0;
          const pendingRate = item.total > 0 ? (item.pending / item.total) * 100 : 0;
          const showCriticalAlert = pendingRate >= 40 && sortBy === 'pending'; 

          return (
            <div key={index} style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#333' }}>
                  {item.name}
                </span>
                <div style={{ fontSize: '14px' }}>
                  <span style={{ color: '#10B981', fontWeight: '700', marginRight: '8px' }}>
                    สำเร็จ {item.completed} ({itemSuccessRate.toFixed(0)}%)
                  </span>
                  <span style={{ color: '#999', fontSize: '13px' }}>
                    | รวม {item.total}
                  </span>
                </div>
              </div>

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
                       {width > 12 && (
                         <span style={{ whiteSpace: 'nowrap' }}>
                            {val} ({width.toFixed(0)}%)
                         </span>
                       )}
                     </div>
                   );
                 })}
              </div>

              {showCriticalAlert && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', color: '#EF4444', fontSize: '13px', fontWeight: '600' }}>
                    <AlertCircle size={14} />
                    <span>งานค้างสูงผิดปกติ ({pendingRate.toFixed(0)}%)</span>
                </div>
              )}
            </div>
          );
        })}

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

// --- TAB 2: SATISFACTION (ปรับให้ตรงกับดีไซน์รูปที่ 2, 6, 7) ---
const SatisfactionView = ({ data }) => {
  const sortedData = [...data].sort((a, b) => b.satisfaction - a.satisfaction);
   
  if(data.length === 0) return <div className={styles.chartBox}><div style={{textAlign:'center', padding:'40px', color:'#999'}}>ไม่มีข้อมูล</div></div>;

  const bestOrg = sortedData[0];
  const worstOrg = sortedData[sortedData.length - 1];

  return (
    <div className={styles.chartBox}>
       <h4 className={styles.chartBoxTitle}>อันดับความพึงพอใจประชาชน</h4>
       
       {/* Highlight Cards Grid */}
       <div className={styles.satisfactionHighlightGrid}>
          {/* Best Org (Green) */}
          <div className={`${styles.highlightCard} ${styles.highlightCardGreen}`}>
             <div className={styles.highlightTitle}>คะแนนสูงสุด</div>
             <div className={styles.highlightName}>{bestOrg?.name || '-'}</div>
             <div className={styles.highlightScore}>
                {bestOrg?.satisfaction.toFixed(1) || '0.0'} 
                <span className={styles.highlightScoreMax}>/ 5.0</span>
             </div>
          </div>
          {/* Worst Org (Red) */}
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
                     {/* ✅ Badge อันดับสีดำ ตัวหนังสือเหลือง */}
                     <div className={styles.reportCardRank} style={{ 
                         background: '#1F2937', 
                         color: '#F59E0B',
                         boxShadow: '0 4px 10px rgba(0,0,0,0.15)' 
                     }}>
                        #{index + 1}
                     </div>
                     <div className={styles.reportCardName}>{item.name}</div>
                  </div>
                  
                  {/* ✅ คะแนนสีเหลือง ขวาสุด */}
                  <div className={styles.reportCardScoreGroup}>
                     <div className={styles.reportCardScoreText} style={{ color: '#F59E0B' }}>
                        {item.satisfaction.toFixed(2)}
                     </div>
                  </div>
               </div>

               {/* Progress Bar */}
               <div className={styles.reportCardProgressBg}>
                  <div className={styles.reportCardProgressBar} style={{ 
                      width: `${(item.satisfaction / 5) * 100}%`, 
                      background: '#10B981' // สีเขียวตามรูป
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
       
       <div className={styles.slaHeaderBox}>
          <div className={styles.slaTargetInfo}>
             <div style={{fontSize:'14px', fontWeight:'700', marginBottom:'4px'}}>เป้าหมาย SLA: ภายใน {TARGET_SLA_DAYS} วัน</div>
             <div style={{fontSize:'12px', color:'#666'}}>หากกราฟเกินเส้นประ แสดงว่าล่าช้ากว่ากำหนด</div>
          </div>
          <div className={styles.slaAvgInfo}>
             <span style={{fontSize:'13px', color:'#666', display:'block', marginBottom:'4px'}}>เวลาเฉลี่ยรวมทุกเขต</span>
             <div style={{fontSize:'24px', fontWeight:'800', lineHeight:'1'}}>
                {overallAvg.toFixed(1)} <span style={{fontSize:'14px', fontWeight:'500'}}>วัน</span>
             </div>
          </div>
       </div>

       <div className={styles.mockHorizontalBarChart}>
          <div className={styles.slaLineContainer} style={{ left: `calc(180px + 20px + ${(TARGET_SLA_DAYS / maxVal) * (100 - 25)}% - 50px)` }}>
             <span className={styles.slaLabel}>Target {TARGET_SLA_DAYS} วัน</span>
          </div>

          {sortedData.map((item, index) => {
             const isOver = item.avgTime > TARGET_SLA_DAYS;
             return (
               <div key={index} className={styles.mockHBarItem}>
                  <span className={styles.mockHBarLabel} style={{ color: '#333' }}>{item.name}</span>
                  <div className={styles.mockHBar}>
                     <div 
                        className={styles.mockHBarFill} 
                        style={{ 
                           width: `${(item.avgTime / maxVal) * 100}%`,
                           background: isOver ? '#FF4D4F' : '#10B981' // แดงถ้าเกิน, เขียวถ้าผ่าน
                        }}
                     ></div>
                  </div>
                  <span className={styles.mockHBarValue} style={{ color: isOver ? '#FF4D4F' : '#1F2937' }}>
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
       
       <div className={styles.donutHeaderBox}>
          <div className={styles.donutTotalBlock}>
             <span style={{fontSize:'13px', color:'#666', display:'block', marginBottom:'4px'}}>เรื่องร้องเรียนทั้งหมด</span>
             <div style={{fontSize:'20px', fontWeight:'800'}}>
                {total.toLocaleString()} <span style={{fontSize:'12px', fontWeight:'500'}}>เรื่อง</span>
             </div>
          </div>
          <div className={styles.donutTopTypeBox}>
             <div style={{fontSize:'13px', color:'#666', marginBottom:'4px'}}>ประเภทที่พบมากที่สุด</div>
             <div style={{display:'flex', alignItems:'center', gap:'6px', fontWeight:'700', fontSize:'14px'}}>
                <span style={{width:8, height:8, borderRadius:'50%', background:'#2563eb'}}></span>
                {topType.name} ({topTypePercent.toFixed(0)}%)
             </div>
          </div>
       </div>

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
                <span style={{fontSize:'24px', fontWeight:'800'}}>{data.length}</span>
                <span style={{fontSize:'12px', color:'#666'}}>ประเภท</span>
             </div>
          </div>

          <div className={styles.donutLegendGrid}>
             {donutData.map((item) => (
                <div key={item.id} className={styles.donutLegendItem}>
                   <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                      <span className={styles.donutColorDot} style={{ background: item.color }}></span>
                      <span style={{fontSize:'14px', fontWeight:'500'}}>{item.name}</span>
                   </div>
                   <div style={{textAlign:'right'}}>
                      <span style={{fontWeight:'700', marginRight:'4px'}}>{item.count}</span>
                      <span style={{fontSize:'12px', color:'#666'}}>({(item.percent * 100).toFixed(0)}%)</span>
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
   
  const [orgData, setOrgData] = useState([]);
  const [problemData, setProblemData] = useState([]);

  // *** ID องค์กรตามจริง ***
  const local = localStorage.getItem("lastSelectedOrg");
  const org = local ? JSON.parse(local) : { id: 1 }; 
  const USER_ORG_ID = org.id;

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
  }, [USER_ORG_ID]);

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

  const activeMenuLabel = menuItems.find(item => item.id === activeTab);

  return (
    <div className={styles.orgStatsContainer}>
       
      {/* Sidebar Desktop */}
      <div className={styles.orgStatsSidebarDesktop}>
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

      {/* Mobile Dropdown */}
      <div className={styles.orgStatsMobileDropdown}>
        <div className={styles.mobileDropdownLabel}>เลือกหัวข้อสถิติ</div>
        <button 
            className={`${styles.mobileDropdownTrigger} ${isMobileMenuOpen ? styles.open : ''}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
            <div className={styles.triggerContent}>
                {activeMenuLabel?.icon}
                <span>{activeMenuLabel?.label}</span>
            </div>
            {isMobileMenuOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        {isMobileMenuOpen && (
            <div className={styles.mobileDropdownList}>
                {menuItems.map((item) => (
                <button 
                    key={item.id}
                    onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileMenuOpen(false);
                    }}
                    className={`${styles.mobileDropdownItem} ${activeTab === item.id ? styles.activeItem : ''}`}
                >
                    <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                        {item.icon}
                        <span>{item.label}</span>
                    </div>
                    {activeTab === item.id && <CheckCircle size={18} className={styles.activeCheck} />}
                </button>
                ))}
            </div>
        )}
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
