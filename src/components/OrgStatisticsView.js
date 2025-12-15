import React, { useState, useEffect } from "react";
import styles from "./css/OrgStatisticsView.module.css";
import {
  FaChartBar,
  FaStar,
  FaHourglassHalf,
  FaChevronDown,
  FaChevronUp,
  FaChartPie // เพิ่มไอคอนสำหรับ tab ใหม่
} from "react-icons/fa";

// ============================================================================
// 1. CONFIGURATION
// ============================================================================

const STATUS_COLORS = {
  pending: "#FF4D4F",    // แดง
  inProgress: "#FFC107", // เหลือง
  completed: "#4CAF50",  // เขียว
  forwarded: "#2196F3",  // ฟ้า
  invited: "#00BCD4",    // ฟ้าอมเขียว
  rejected: "#6C757D"    // เทา
};

const STATUS_LABELS = {
  pending: "รอรับเรื่อง",
  inProgress: "ดำเนินการ",
  completed: "เสร็จสิ้น",
  forwarded: "ส่งต่อ",
  invited: "เชิญร่วม",
  rejected: "ปฏิเสธ"
};

const PROBLEM_COLORS_PALETTE = [
  "#3B82F6", "#F59E0B", "#10B981", "#06B6D4", "#EF4444", 
  "#8B5CF6", "#EC4899", "#6366F1", "#9CA3AF"
];

// ============================================================================
// 2. SUB-COMPONENTS
// ============================================================================

// --- STACKED BAR CHART ---
const MockOrgStackedBarChart = ({ data }) => {
  if (!data || data.length === 0) return <div style={{padding:'40px', textAlign:'center', color:'#999'}}>ไม่มีข้อมูล</div>;

  const getWidth = (val, total) => total > 0 ? (val / total) * 100 : 0;

  return (
    <div className={styles.mockStackedBarChart}>
      {data.map((item, index) => (
        <div key={`${item.name}-${index}`} className={styles.mockHBarItem}>
          <span className={styles.mockHBarLabel}>{item.name}</span>
          <div className={styles.mockStackedHBar}>
            {Object.keys(STATUS_COLORS).map(key => (
              <div
                key={key}
                className={styles.mockStackedBarSegment}
                style={{ width: `${getWidth(item[key], item.total)}%`, background: STATUS_COLORS[key] }}
                title={`${STATUS_LABELS[key]}: ${item[key]}`}
              ></div>
            ))}
          </div>
          <span className={styles.mockHBarValue}>{item.total}</span>
        </div>
      ))}

      {/* --- LEGEND --- */}
      <div className={styles.mockStackedBarLegend}>
        {Object.keys(STATUS_COLORS).map(key => (
          <div 
            key={key} 
            className={styles.mockStackedBarLegendItem}
            style={{ backgroundColor: `${STATUS_COLORS[key]}15` }}
          >
            <span 
              className={styles.legendDot} 
              style={{ background: STATUS_COLORS[key] }}
            ></span> 
            {STATUS_LABELS[key]}
          </div>
        ))}
      </div>
    </div>
  );
};

// --- REPORT CARD ---
const CardSatisfactionBreakdown = ({ score, totalReviews, breakdownData }) => {
  // ถ้าไม่มี breakdown data (จาก API ที่ flattened แล้ว) ให้ mock ขึ้นมา หรือซ่อน
  // กรณีนี้ขอซ่อนส่วน breakdown ถ้าไม่มีข้อมูล เพื่อไม่ให้ error
  if (!breakdownData || breakdownData.length === 0) {
    return (
      <div style={{textAlign:'center', padding:'20px', color:'#999'}}>
        ไม่พบข้อมูลรายละเอียดดาว
      </div>
    );
  }

  return (
    <div className={styles.satisfactionCardBreakdown}>
      <div className={styles.satisfactionCardHeader}>
        <span className={styles.satisfactionCardScore}>{score}</span>
        <div style={{display:'flex', justifyContent:'center', gap:'4px'}}>
          {[...Array(5)].map((_, i) => <FaStar key={i} color="#ffc107" size={18} />)}
        </div>
        <div style={{marginTop:'8px', color:'#888', fontSize:'14px'}}>จาก {totalReviews} ความเห็น</div>
      </div>
      <div className={styles.satisfactionCardRows}>
        {breakdownData.map((item) => (
          <div key={item.stars} className={styles.satisfactionBreakdownRow}>
            <span className={styles.satisfactionBreakdownLabel}>{item.stars}</span>
            <div className={styles.satisfactionBreakdownBar}>
              <div className={styles.satisfactionBreakdownBarFill} style={{width: `${item.percent}%`, backgroundColor: "#ffc107"}}></div>
            </div>
            <span className={styles.satisfactionBreakdownPercent}>{item.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ReportCardItem = ({ id, name, details }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  // เนื่องจาก API ใหม่ flattened ข้อมูล อาจไม่มี breakdown
  const hasBreakdown = details.breakdown && details.breakdown.length > 0;

  return (
    <div className={`${styles.reportCardItem} ${isExpanded ? styles.expanded : ""}`}>
      <div className={styles.reportCardHeader}>
        <div className={styles.reportCardTitleGroup}>
          <span className={styles.reportCardRank}>{id}</span>
          <div style={{display:'flex', flexDirection:'column'}}>
            <span 
              className={styles.reportCardName} 
              onClick={() => hasBreakdown && setIsExpanded(!isExpanded)} 
              style={{cursor: hasBreakdown ? 'pointer' : 'default', display:'flex', alignItems:'center', gap:'8px'}}
            >
              {name}
              {hasBreakdown && (isExpanded ? <FaChevronUp size={12} color="#999"/> : <FaChevronDown size={12} color="#999"/>)}
            </span>
          </div>
        </div>
        <div className={styles.reportCardScoreGroup}>
          <span className={styles.reportCardScoreText}>
            {typeof details.score === 'number' ? details.score.toFixed(2) : details.score}
          </span>
          <span className={styles.reportCardScoreStars}>
            {[...Array(5)].map((_, i) => <FaStar key={i} color="#ffc107" size={14} style={{marginRight:'2px'}}/>)}
          </span>
          <span className={styles.reportCardScoreReviews}>({details.reviews} ความเห็น)</span>
        </div>
      </div>
      {isExpanded && hasBreakdown && (
        <div className={styles.reportCardExpandedContent}>
          <CardSatisfactionBreakdown 
            score={typeof details.score === 'number' ? details.score.toFixed(2) : details.score} 
            totalReviews={details.reviews} 
            breakdownData={details.breakdown} 
          />
        </div>
      )}
    </div>
  );
};

// --- SIMPLE BAR CHART ---
const MockSimpleBarChart = ({ data, valueSuffix }) => {
  if (!data || data.length === 0) return <div style={{padding:'40px', textAlign:'center', color:'#999'}}>ไม่มีข้อมูล</div>;
  const maxValue = Math.max(...data.map((d) => d.value)) || 1;
  return (
    <div className={styles.mockHorizontalBarChart}>
      {data.map((item, index) => (
        <div key={index} className={styles.mockHBarItem}>
          <span className={styles.mockHBarLabel}>{item.name}</span>
          <div className={styles.mockHBar}>
            <div className={styles.mockHBarFill} style={{width: `${(item.value / maxValue) * 100}%`}}></div>
          </div>
          <span className={styles.mockHBarValue} style={{fontSize:'16px'}}>{item.value.toFixed(1)} {valueSuffix}</span>
        </div>
      ))}
    </div>
  );
};

// --- DONUT CHART (NEW FEATURE in OLD STYLE) ---
const MockDonutChart = ({ data }) => {
  if (!data || data.length === 0) return <div style={{padding:'40px', textAlign:'center', color:'#999'}}>ไม่มีข้อมูล</div>;
  
  const total = data.reduce((acc, item) => acc + item.count, 0);
  let cumulativePercent = 0;
  
  const donutSegments = data.map((item, index) => {
    const percent = total > 0 ? item.count / total : 0;
    const startPercent = cumulativePercent;
    cumulativePercent += percent;
    return { 
      ...item, 
      percent, 
      startPercent, 
      color: PROBLEM_COLORS_PALETTE[index % PROBLEM_COLORS_PALETTE.length] 
    };
  });

  const getCoords = (percent) => [Math.cos(2 * Math.PI * percent), Math.sin(2 * Math.PI * percent)];

  return (
    <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'32px'}}>
      {/* SVG Donut */}
      <div style={{width:'240px', height:'240px', position:'relative'}}>
        <svg viewBox="-1 -1 2 2" style={{transform:'rotate(-90deg)', width:'100%', height:'100%'}}>
          {donutSegments.map(item => {
             const [startX, startY] = getCoords(item.startPercent);
             const [endX, endY] = getCoords(item.startPercent + item.percent);
             const largeArc = item.percent > 0.5 ? 1 : 0;
             const pathData = item.percent === 1 
               ? `M 1 0 A 1 1 0 1 1 -1 0 A 1 1 0 1 1 1 0` // Full circle
               : `M ${startX} ${startY} A 1 1 0 ${largeArc} 1 ${endX} ${endY} L 0 0`;
             return <path key={item.id} d={pathData} fill={item.color} stroke="#fff" strokeWidth="0.02" />;
          })}
          <circle cx="0" cy="0" r="0.6" fill="#fff" />
        </svg>
        <div style={{position:'absolute', top:0, left:0, width:'100%', height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', pointerEvents:'none'}}>
          <span style={{fontSize:'36px', fontWeight:'800', color:'#333'}}>{data.length}</span>
          <span style={{fontSize:'12px', color:'#999'}}>ประเภท</span>
        </div>
      </div>

      {/* List/Legend */}
      <div style={{width:'100%', display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'12px'}}>
        {donutSegments.map(item => (
          <div key={item.id} style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', borderRadius:'12px', background:'#f8f9fa'}}>
             <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
               <span style={{width:'12px', height:'12px', borderRadius:'50%', background:item.color}}></span>
               <span style={{fontSize:'14px', fontWeight:'600', color:'#555'}}>{item.name}</span>
             </div>
             <div style={{textAlign:'right'}}>
               <div style={{fontSize:'16px', fontWeight:'800', color:'#000'}}>{item.count}</div>
               <div style={{fontSize:'12px', color:'#999'}}>{(item.percent * 100).toFixed(0)}%</div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// 3. MAIN COMPONENT
// ============================================================================

const OrganizationStatisticsView = () => {
  const [activeOrgTab, setActiveOrgTab] = useState("ratio");
  const [statsData, setStatsData] = useState({ stackedData: [], reportData: [], avgTimeData: [] });
  const [problemData, setProblemData] = useState([]);
  const [loading, setLoading] = useState(true);

  // *** ID องค์กรตามจริง ***
  const USER_ORG_ID = 74;

  const menuItems = [
    { id: "ratio", title: "จำนวนเรื่องแจ้ง", icon: <FaChartBar /> },
    { id: "satisfaction", title: "เปรียบเทียบความพึงพอใจ", icon: <FaStar /> },
    { id: "avg_time", title: "เปรียบเทียบเวลาเฉลี่ย", icon: <FaHourglassHalf /> },
    { id: "problem_type", title: "ประเภทปัญหา", icon: <FaChartPie /> }, // เพิ่มเมนูใหม่
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch Parallel
        const [orgRes, probRes] = await Promise.all([
          fetch(`https://premium-citydata-api-ab.vercel.app/api/stats/org-stats?org_id=${USER_ORG_ID}`),
          fetch(`https://premium-citydata-api-ab.vercel.app/api/stats/org-count-issue-type?org_id=${USER_ORG_ID}`)
        ]);

        if (orgRes.ok) {
          const orgData = await orgRes.json();
          
          // Map Org Data for Stacked Chart
          const stackedData = orgData.map(item => ({
            name: item.name,
            total: item.total,
            pending: item.pending,
            inProgress: item.inProgress,
            completed: item.completed,
            forwarded: item.forwarded,
            rejected: item.rejected,
            invited: item.invited
          })).sort((a,b) => b.total - a.total);

          // Map Org Data for Report Card
          const reportData = orgData.map((item, index) => ({
             id: index + 1,
             name: item.name,
             details: {
               score: item.satisfaction,
               reviews: item.reviews,
               // *หมายเหตุ: API ล่าสุดไม่ได้ส่ง breakdown มา 
               // ถ้าต้องการแสดงกราฟแท่งดาว ต้องแก้ API org-stats ให้ return array breakdown ด้วย
               breakdown: [] 
             }
          })).sort((a,b) => b.details.score - a.details.score);

          // Map Org Data for Avg Time
          const avgTimeData = orgData.map(item => ({
            name: item.name,
            value: item.avgTime
          })).sort((a,b) => a.value - b.value); // น้อยไปมาก

          setStatsData({ stackedData, reportData, avgTimeData });
        }

        if (probRes.ok) {
          const probData = await probRes.json();
          setProblemData(probData);
        }

      } catch (error) {
        console.error("API Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const renderContent = () => {
    if (loading) return <div className={styles.chartBox} style={{display:'flex',justifyContent:'center',alignItems:'center',height:'300px', color:'#999'}}>กำลังโหลดข้อมูล...</div>;

    if (activeOrgTab === "ratio") {
      return (
        <div className={styles.chartBox}>
          <h4 className={styles.chartBoxTitle}>จำนวนเรื่องแจ้ง (6 สถานะ)</h4>
          <MockOrgStackedBarChart data={statsData.stackedData} />
        </div>
      );
    }
    if (activeOrgTab === "satisfaction") {
      return (
        <div className={styles.chartBox}>
          <h4 className={styles.chartBoxTitle}>เปรียบเทียบความพึงพอใจ</h4>
          <div className={styles.reportCardList}>
             {statsData.reportData.map((item, index) => <ReportCardItem key={item.id} id={index+1} {...item} />)}
          </div>
        </div>
      );
    }
    if (activeOrgTab === "avg_time") {
      return (
        <div className={styles.chartBox}>
          <h4 className={styles.chartBoxTitle}>เปรียบเทียบเวลาเฉลี่ย (วัน)</h4>
          <div className={styles.chartNote}>(*ยิ่งน้อยยิ่งดี)</div>
          <MockSimpleBarChart data={statsData.avgTimeData} valueSuffix="วัน" />
        </div>
      );
    }
    if (activeOrgTab === "problem_type") {
      return (
        <div className={styles.chartBox}>
          <h4 className={styles.chartBoxTitle}>สัดส่วนประเภทปัญหา (ภาพรวม)</h4>
          <MockDonutChart data={problemData} />
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.orgStatsContainer}>
      <div className={styles.orgStatsSidebar}>
        {/* หัวข้อสีดำ */}
        <h3 className={styles.orgStatsMenuTitle}>สถิติองค์กร</h3>
        <nav className={styles.orgStatsMenuNav}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`${styles.orgStatsMenuButton} ${activeOrgTab === item.id ? styles.active : ""}`}
              onClick={() => setActiveOrgTab(item.id)}
            >
              {item.icon}
              <span>{item.title}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className={styles.orgStatsContent}>
        <div className={styles.orgGraphDashboard}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default OrganizationStatisticsView;
