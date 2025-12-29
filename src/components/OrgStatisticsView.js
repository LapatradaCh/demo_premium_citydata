import React, { useState, useMemo, useEffect } from 'react';
import styles from './css/OrgStatisticsView.module.css'; 
import { 
  BarChart2, Star, Clock, AlertCircle, 
  CheckCircle, PieChart, Layers, 
  ChevronDown, ChevronUp,
  Activity, TrendingUp // เพิ่ม icon สำหรับหน้า SLA
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

// Helper ตัดคำ
const truncateText = (text, maxLength) => {
    if (!text) return '';
    const str = String(text);
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength) + '...';
};

// ==========================================
// 2. SUB-COMPONENTS
// ==========================================

// --- TAB 1: WORKLOAD (KPI แนวนอน) ---
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

// --- TAB 2: SATISFACTION ---
const SatisfactionView = ({ data }) => {
  const sortedData = [...data].sort((a, b) => b.satisfaction - a.satisfaction);
   
  if(data.length === 0) return <div className={styles.chartBox}><div style={{textAlign:'center', padding:'40px', color:'#999'}}>ไม่มีข้อมูล</div></div>;

  const bestOrg = sortedData[0];
  const worstOrg = sortedData[sortedData.length - 1];

  return (
    <div className={styles.chartBox}>
       <h4 className={styles.chartBoxTitle}>อันดับความพึงพอใจประชาชน</h4>
       
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

       <div className={styles.reportCardList}>
          {sortedData.map((item, index) => (
            <div key={index} className={styles.reportCardItem}>
               <div className={styles.reportCardHeader}>
                  <div className={styles.reportCardTitleGroup}>
                     <div className={styles.reportCardRank} style={{ 
                         background: '#1F2937', 
                         color: '#F59E0B',
                         boxShadow: '0 4px 10px rgba(0,0,0,0.15)' 
                     }}>
                        #{index + 1}
                     </div>
                     <div className={styles.reportCardName}>{item.name}</div>
                  </div>
                  
                  <div className={styles.reportCardScoreGroup}>
                     <div className={styles.reportCardScoreText} style={{ color: '#F59E0B' }}>
                        {item.satisfaction.toFixed(2)}
                     </div>
                  </div>
               </div>

               <div className={styles.reportCardProgressBg}>
                  <div className={styles.reportCardProgressBar} style={{ 
                      width: `${(item.satisfaction / 5) * 100}%`, 
                      background: '#10B981'
                  }}></div>
               </div>
            </div>
          ))}
       </div>
    </div>
  );
};

// --- TAB 3: EFFICIENCY (SLA) - [ปรับปรุงใหม่ตามดีไซน์รูปภาพ] ---
const EfficiencyView = ({ data }) => {
  // 1. Process Data & Mock Targets (จำลอง SLA Target ตามชื่อ หรือ Default)
  const processedData = useMemo(() => {
    return data.map((item) => {
        // ดึงเวลาจริง (รองรับทั้ง avgTime จาก Org หรือ avg_resolution_time จาก Type)
        const actualDays = item.avgTime || parseFloat(item.avg_resolution_time) || 0;
        
        // Mock Target Logic (สามารถปรับเป็นค่าจาก DB ได้)
        let targetDays = TARGET_SLA_DAYS; // Default 3
        const name = item.name || item.issue_type_name || '';
        if (name.includes('ถนน') || name.includes('ทางเท้า')) targetDays = 7;
        if (name.includes('ไฟ')) targetDays = 1;
        if (name.includes('น้ำท่วม')) targetDays = 3;

        const isOverdue = actualDays > targetDays;
        const diff = Math.abs(actualDays - targetDays).toFixed(1);

        return {
            ...item,
            displayName: name,
            actualDays,
            targetDays,
            isOverdue,
            diff,
            progressPercent: Math.min((actualDays / targetDays) * 100, 100)
        };
    }).sort((a,b) => (b.actualDays/b.targetDays) - (a.actualDays/a.targetDays)); // เรียงตามความวิกฤต (Ratio)
  }, [data]);

  // 2. Summary Logic
  const totalItems = processedData.length;
  // const totalIssues = processedData.reduce((acc, curr) => acc + (curr.total || curr.count || 0), 0); // ถ้าจะนับจำนวนเรื่อง
  const overdueCount = processedData.filter(d => d.isOverdue).length;
  const slaScore = totalItems > 0 ? Math.round(((totalItems - overdueCount) / totalItems) * 100) : 0;

  return (
    <div className={styles.chartBox}>
       <div className={styles.chartBoxTitle} style={{display:'flex', alignItems:'center', gap:'8px'}}>
           <Activity size={20} color="#6366f1" />
           ประสิทธิภาพการแก้ไขปัญหา (SLA)
       </div>
       
       {/* Top Summary Cards */}
       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px', marginTop: '16px' }}>
            {/* Card 1: Total Groups */}
            <div style={{ padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px', background: '#fff' }}>
                <div style={{ padding: '10px', borderRadius: '50%', background: '#eff6ff', color: '#3b82f6', minWidth:'40px', display:'flex', justifyContent:'center', alignItems:'center' }}>
                    <Layers size={20} />
                </div>
                <div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>รายการทั้งหมด</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>{totalItems} <span style={{fontSize:'12px', fontWeight:'normal'}}>รายการ</span></div>
                </div>
            </div>

            {/* Card 2: Overdue */}
            <div style={{ padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px', background: '#fff' }}>
                <div style={{ padding: '10px', borderRadius: '50%', background: '#fef2f2', color: '#ef4444', minWidth:'40px', display:'flex', justifyContent:'center', alignItems:'center' }}>
                    <Clock size={20} />
                </div>
                <div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>ล่าช้ากว่าเป้า</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>{overdueCount} <span style={{fontSize:'12px', fontWeight:'normal'}}>รายการ</span></div>
                </div>
            </div>

            {/* Card 3: Score */}
            <div style={{ padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px', background: '#fff' }}>
                <div style={{ padding: '10px', borderRadius: '50%', background: '#f0fdf4', color: '#22c55e', minWidth:'40px', display:'flex', justifyContent:'center', alignItems:'center' }}>
                    <TrendingUp size={20} />
                </div>
                <div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>คะแนน SLA รวม</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#22c55e' }}>{slaScore}% <span style={{fontSize:'12px', fontWeight:'normal', color: '#64748b'}}>ผ่านเกณฑ์</span></div>
                </div>
            </div>
       </div>

       {/* Detailed List */}
       <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '20px', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '11px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' }}>
              <span>รายละเอียด (เรียงตามความวิกฤต)</span>
              <span>เป้าหมาย vs เวลาจริง</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {processedData.slice(0, 10).map((item, idx) => {
                   const barColor = item.isOverdue ? '#ef4444' : '#22c55e';
                   const bgColor = item.isOverdue ? '#fef2f2' : '#f0fdf4';
                   const borderColor = item.isOverdue ? '#fee2e2' : '#dcfce7';

                   return (
                      <div key={idx} style={{ display: 'grid', gridTemplateColumns: 'minmax(150px, 2fr) 3fr', alignItems: 'center', gap: '16px' }}>
                          {/* 1. Icon & Name */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ 
                                  width: '36px', height: '36px', borderRadius: '8px', 
                                  background: bgColor, 
                                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                  border: '1px solid', borderColor: borderColor,
                                  color: barColor, flexShrink: 0, fontWeight:'bold'
                              }}>
                                  {item.displayName.charAt(0)}
                              </div>
                              <div style={{ overflow: 'hidden' }}>
                                  <div style={{ fontWeight: '600', fontSize: '14px', color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      {truncateText(item.displayName, 25)}
                                  </div>
                              </div>
                          </div>

                          {/* 2. Progress Bar & Info */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', alignItems:'center' }}>
                                  <span style={{fontWeight:'bold', color: barColor}}>
                                      {item.actualDays.toFixed(1)} วัน
                                  </span>
                                  <span style={{ fontSize: '11px', color: '#64748b' }}>
                                     เป้า {item.targetDays} วัน 
                                     {item.isOverdue ? <span style={{color:'#ef4444', marginLeft:'4px'}}>(+{item.diff})</span> : ''}
                                  </span>
                              </div>
                              <div style={{ height: '6px', width: '100%', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden', position:'relative' }}>
                                  {/* ขีดบอก Target (ถ้าอยากใส่เพิ่ม) */}
                                  <div style={{ height: '100%', width: `${item.progressPercent}%`, background: barColor, borderRadius: '3px', transition:'width 0.5s' }}></div>
                              </div>
                          </div>
                      </div>
                   );
              })}
          </div>
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
      // *** MODIFIED: ใช้ problemData แทน orgData เพื่อให้แสดงผลแยกตามประเภท (Category) เหมือนในรูปภาพ ***
      // หากต้องการดู SLA ของหน่วยงาน ให้เปลี่ยนกลับเป็น data={orgData}
      case 'efficiency': return <EfficiencyView data={problemData.length > 0 ? problemData : orgData} />;
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
