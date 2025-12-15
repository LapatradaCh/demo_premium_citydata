import React, { useState, useEffect, useMemo } from "react";
// Import CSS Module ที่คุณสร้าง
import styles from "./css/OrgStatisticsView.module.css";
// ใช้ Icon จาก Lucide React
import {
  BarChart2,
  Star,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp
} from "lucide-react";

// ==========================================
// 1. CONFIGURATION & CONSTANTS
// ==========================================
const API_BASE_URL = "https://premium-citydata-api-ab.vercel.app/api/stats";
const USER_ORG_ID = 74; // เปลี่ยน ID ตามการใช้งานจริง

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

const PROBLEM_COLORS = [
  "#3B82F6", "#F59E0B", "#10B981", "#06B6D4", 
  "#EF4444", "#8B5CF6", "#EC4899", "#6366F1", "#999999"
];

// ==========================================
// 2. SUB-COMPONENTS
// ==========================================

// --- Stacked Bar Chart (ปริมาณงาน) ---
const MockOrgStackedBarChart = ({ data }) => {
  if (!data || data.length === 0) return <div style={{padding:'40px', textAlign:'center', color:'#999'}}>ไม่มีข้อมูล</div>;

  return (
    <div className={styles.mockStackedBarChart}>
      {data.map((item, index) => (
        <div key={`${item.name}-${index}`} className={styles.mockHBarItem}>
          <span className={styles.mockHBarLabel} title={item.name}>{item.name}</span>
          <div className={styles.mockStackedHBar}>
            {Object.keys(STATUS_COLORS).map(key => {
              const width = item.total > 0 ? (item[key] / item.total) * 100 : 0;
              if (width === 0) return null;
              return (
                <div
                  key={key}
                  className={styles.mockStackedBarSegment}
                  style={{ width: `${width}%`, background: STATUS_COLORS[key] }}
                  title={`${STATUS_LABELS[key]}: ${item[key]}`}
                ></div>
              );
            })}
          </div>
          <span className={styles.mockHBarValue}>{item.total}</span>
        </div>
      ))}

      {/* Legend */}
      <div className={styles.mockStackedBarLegend}>
        {Object.keys(STATUS_COLORS).map(key => (
          <div 
            key={key} 
            className={styles.mockStackedBarLegendItem}
            style={{ backgroundColor: `${STATUS_COLORS[key]}15` }} // จางๆ 10-15%
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

// --- Report Card (ความพึงพอใจ) ---
const CardSatisfactionBreakdown = ({ score, totalReviews }) => {
  // สร้าง Mock breakdown (ในเคสจริงอาจต้องคำนวณจาก Data)
  const breakdownData = [
    { stars: 5, percent: 60 },
    { stars: 4, percent: 20 },
    { stars: 3, percent: 10 },
    { stars: 2, percent: 5 },
    { stars: 1, percent: 5 },
  ];

  return (
    <div className={styles.satisfactionCardBreakdown}>
      <div className={styles.satisfactionCardHeader}>
        <span className={styles.satisfactionCardScore}>{score}</span>
        <div style={{display:'flex', justifyContent:'center', gap:'4px', marginBottom:'8px'}}>
          {[...Array(5)].map((_, i) => <Star key={i} fill={i < Math.round(score) ? "#ffc107" : "#eee"} color="none" size={18} />)}
        </div>
        <div style={{color:'#888', fontSize:'14px'}}>จาก {totalReviews} ความเห็น</div>
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
  return (
    <div className={styles.reportCardItem}>
      <div className={styles.reportCardHeader}>
        <div className={styles.reportCardTitleGroup}>
          <span className={styles.reportCardRank}>{id}</span>
          <div style={{display:'flex', flexDirection:'column'}}>
            <span 
              className={styles.reportCardName} 
              onClick={() => setIsExpanded(!isExpanded)} 
              style={{cursor:'pointer', display:'flex', alignItems:'center', gap:'8px'}}
            >
              {name}
              {isExpanded ? <ChevronUp size={16} color="#999"/> : <ChevronDown size={16} color="#999"/>}
            </span>
          </div>
        </div>
        <div className={styles.reportCardScoreGroup}>
          <span className={styles.reportCardScoreText}>{details.score.toFixed(2)}</span>
          <div className={styles.reportCardScoreStars}>
            <div style={{display:'flex', gap:2, justifyContent:'flex-end'}}>
              {[...Array(5)].map((_, i) => (
                 <Star key={i} size={14} fill={i < Math.round(details.score) ? "#ffc107" : "#eee"} color="none" />
              ))}
            </div>
          </div>
          <span className={styles.reportCardScoreReviews}>({details.reviews} ความเห็น)</span>
        </div>
      </div>
      {isExpanded && (
        <div className={styles.reportCardExpandedContent}>
          <CardSatisfactionBreakdown score={details.score.toFixed(2)} totalReviews={details.reviews} />
        </div>
      )}
    </div>
  );
};

// --- Simple Bar Chart (SLA & Problem Types) ---
// ใช้สำหรับแสดง SLA และ ประเภทปัญหา (เนื่องจาก CSS รองรับรูปแบบนี้)
const MockSimpleBarChart = ({ data, valueSuffix, colorOverride }) => {
  if (!data || data.length === 0) return <div style={{padding:'40px', textAlign:'center', color:'#999'}}>ไม่มีข้อมูล</div>;
  
  const maxValue = Math.max(...data.map((d) => d.value)) || 1;

  return (
    <div className={styles.mockHorizontalBarChart}>
      {data.map((item, index) => (
        <div key={index} className={styles.mockHBarItem}>
          <span className={styles.mockHBarLabel} title={item.name}>{item.name}</span>
          <div className={styles.mockHBar}>
            <div 
              className={styles.mockHBarFill} 
              style={{
                width: `${(item.value / maxValue) * 100}%`,
                background: colorOverride ? (item.color || colorOverride) : undefined
              }}
            ></div>
          </div>
          <span className={styles.mockHBarValue} style={{fontSize:'16px'}}>
            {item.value.toLocaleString()} {valueSuffix}
          </span>
        </div>
      ))}
    </div>
  );
};

// ==========================================
// 3. MAIN COMPONENT
// ==========================================

const OrganizationStatisticsView = () => {
  const [activeOrgTab, setActiveOrgTab] = useState("ratio");
  const [orgData, setOrgData] = useState([]);
  const [problemData, setProblemData] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- MENU ITEMS ---
  const menuItems = [
    { id: "ratio", title: "ปริมาณงาน (รายเขต)", icon: <BarChart2 /> },
    { id: "satisfaction", title: "ความพึงพอใจ", icon: <Star /> },
    { id: "avg_time", title: "ประสิทธิภาพ (SLA)", icon: <Clock /> },
    { id: "problem_type", title: "ประเภทปัญหา", icon: <Layers /> },
  ];

  // --- FETCH API ---
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // 1. Fetch Organization Stats
        const orgRes = await fetch(`${API_BASE_URL}/org-stats?org_id=${USER_ORG_ID}`);
        const orgStatsRaw = await orgRes.json();
        
        // 2. Fetch Problem Types
        const probRes = await fetch(`${API_BASE_URL}/org-count-issue-type?org_id=${USER_ORG_ID}`);
        const probStatsRaw = await probRes.json();

        if (Array.isArray(orgStatsRaw)) setOrgData(orgStatsRaw);
        if (Array.isArray(probStatsRaw)) setProblemData(probStatsRaw);

      } catch (error) {
        console.error("API Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // --- RENDER CONTENT ---
  const renderContent = () => {
    if (loading) return <div className={styles.chartBox} style={{display:'flex',justifyContent:'center',alignItems:'center',height:'300px'}}>กำลังโหลดข้อมูล...</div>;

    // 1. ปริมาณงาน (Stacked Bar)
    if (activeOrgTab === "ratio") {
      return (
        <div className={styles.chartBox}>
          <h4 className={styles.chartBoxTitle}>จำนวนเรื่องแจ้งตามสถานะ</h4>
          <MockOrgStackedBarChart data={orgData} />
        </div>
      );
    }
    
    // 2. ความพึงพอใจ (Report Cards)
    if (activeOrgTab === "satisfaction") {
      const sortedByScore = [...orgData].sort((a,b) => b.satisfaction - a.satisfaction);
      return (
        <div className={styles.chartBox}>
          <h4 className={styles.chartBoxTitle}>อันดับความพึงพอใจประชาชน</h4>
          <div className={styles.reportCardList}>
             {sortedByScore.map((item, index) => (
                <ReportCardItem 
                  key={item.id} 
                  id={index + 1} 
                  name={item.name} 
                  details={{ score: item.satisfaction, reviews: item.reviews }} 
                />
             ))}
          </div>
        </div>
      );
    }

    // 3. เวลาเฉลี่ย (Simple Bar)
    if (activeOrgTab === "avg_time") {
      // แปลงข้อมูลให้เข้า format ของ Simple Bar Chart
      const slaData = orgData.map(d => ({ name: d.name, value: d.avgTime }));
      return (
        <div className={styles.chartBox}>
          <h4 className={styles.chartBoxTitle}>เวลาดำเนินการเฉลี่ย (วัน)</h4>
          <div className={styles.chartNote}>(*ยิ่งน้อยยิ่งดี)</div>
          <MockSimpleBarChart data={slaData} valueSuffix="วัน" />
        </div>
      );
    }

    // 4. ประเภทปัญหา (Simple Bar - Reused Style)
    if (activeOrgTab === "problem_type") {
      // แปลงข้อมูลและใส่สี
      const typeData = problemData.map((d, i) => ({
        name: d.name,
        value: d.count,
        color: PROBLEM_COLORS[i % PROBLEM_COLORS.length]
      }));
      return (
        <div className={styles.chartBox}>
          <h4 className={styles.chartBoxTitle}>สถิติประเภทปัญหาที่พบ</h4>
          <MockSimpleBarChart 
            data={typeData} 
            valueSuffix="เรื่อง" 
            colorOverride={null} // ใช้สีจาก item เอง
          />
        </div>
      );
    }

    return null;
  };

  return (
    <div className={styles.orgStatsContainer}>
      {/* SIDEBAR */}
      <div className={styles.orgStatsSidebar}>
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

      {/* CONTENT */}
      <div className={styles.orgStatsContent}>
        <div className={styles.orgGraphDashboard}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default OrganizationStatisticsView;
