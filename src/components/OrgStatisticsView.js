import React, { useState, useEffect, useMemo } from "react";
import styles from "./css/OrgStatisticsView.module.css";
import {
  FaChartBar,
  FaStar,
  FaHourglassHalf,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

// ============================================================================
// 1. CONFIGURATION & UTILS
// ============================================================================

// สีสถานะตามรูปที่ 4 และ 5
const STATUS_COLORS = {
  pending: "#FF4D4F",    // แดง (รอรับเรื่อง)
  inProgress: "#FFC107", // เหลือง (ดำเนินการ)
  completed: "#4CAF50",  // เขียว (เสร็จสิ้น)
  forwarded: "#2196F3",  // ฟ้า (ส่งต่อ)
  invited: "#00BCD4",    // ฟ้าอมเขียว (เชิญร่วม)
  rejected: "#6C757D"    // เทา (ปฏิเสธ)
};

const STATUS_LABELS = {
  pending: "รอรับเรื่อง",
  inProgress: "ดำเนินการ",
  completed: "เสร็จสิ้น",
  forwarded: "ส่งต่อ",
  invited: "เชิญร่วม",
  rejected: "ปฏิเสธ"
};

// ============================================================================
// 2. SUB-COMPONENTS
// ============================================================================

// --- STATUS SUMMARY SECTION (ส่วนสรุปยอดด้านบน) ---
const StatusSummarySection = ({ data }) => {
  // ค่า Default ป้องกัน Error
  const stats = data || { total: 0, pending: 0, inProgress: 0, completed: 0, forwarded: 0, invited: 0, rejected: 0 };
  
  // เรียงลำดับการ์ดตามรูปที่ 5
  const CARDS = [
    { key: "pending", color: STATUS_COLORS.pending },
    { key: "inProgress", color: STATUS_COLORS.inProgress },
    { key: "completed", color: STATUS_COLORS.completed },
    { key: "forwarded", color: STATUS_COLORS.forwarded },
    { key: "invited", color: STATUS_COLORS.invited },
    { key: "rejected", color: STATUS_COLORS.rejected },
  ];

  const getPercent = (val) => {
    if(stats.total === 0) return "0%";
    return `${Math.round((val / stats.total) * 100)}%`;
  };

  return (
    <div className={styles.statusSummaryContainer}>
      {/* การ์ดใหญ่ (Total) */}
      <div className={styles.totalSummaryCard}>
        <div className={styles.totalCardHeader}>
          <span className={styles.totalLabel}>ทั้งหมด</span>
          <span className={styles.totalPercent}>100%</span>
        </div>
        <div className={styles.totalValue}>{stats.total}</div>
        <div className={styles.decorativeCircle}></div>
      </div>

      {/* Grid การ์ดเล็ก */}
      <div className={styles.statusGrid}>
        {CARDS.map((card) => {
          const value = stats[card.key] || 0;
          return (
            <div 
              key={card.key} 
              className={styles.statusCard}
              style={{ backgroundColor: card.color }}
            >
              <div className={styles.statusCardHeader}>
                <span className={styles.statusLabel}>{STATUS_LABELS[card.key]}</span>
                <span className={styles.statusPercent}>{getPercent(value)}</span>
              </div>
              <div className={styles.statusValue}>{value}</div>
              <div className={styles.decorativeCircle}></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- CHART COMPONENTS ---
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

      <div className={styles.mockStackedBarLegend}>
        {Object.keys(STATUS_COLORS).map(key => (
          <span key={key}>
            <span style={{ background: STATUS_COLORS[key] }}></span> {STATUS_LABELS[key]}
          </span>
        ))}
      </div>
    </div>
  );
};

// --- REPORT CARD COMPONENTS ---
const CardSatisfactionBreakdown = ({ score, totalReviews, breakdownData }) => (
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

const ReportCardItem = ({ id, name, details }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <div className={`${styles.reportCardItem} ${isExpanded ? styles.expanded : ""}`}>
      <div className={styles.reportCardHeader}>
        <div className={styles.reportCardTitleGroup}>
          <span className={styles.reportCardRank}>{id}</span>
          <div style={{display:'flex', flexDirection:'column'}}>
            <span className={styles.reportCardName} onClick={() => setIsExpanded(!isExpanded)} style={{cursor:'pointer', display:'flex', alignItems:'center', gap:'8px'}}>
              {name}
              {isExpanded ? <FaChevronUp size={12} color="#999"/> : <FaChevronDown size={12} color="#999"/>}
            </span>
          </div>
        </div>
        <div className={styles.reportCardScoreGroup}>
          <span className={styles.reportCardScoreText}>{typeof details.score === 'number' ? details.score.toFixed(2) : details.score}</span>
          <span className={styles.reportCardScoreStars}>
            {[...Array(5)].map((_, i) => <FaStar key={i} color="#ffc107" size={14} style={{marginRight:'2px'}}/>)}
          </span>
          <span className={styles.reportCardScoreReviews}>({details.reviews} ความเห็น)</span>
        </div>
      </div>
      {isExpanded && (
        <div className={styles.reportCardExpandedContent}>
          <CardSatisfactionBreakdown score={typeof details.score === 'number' ? details.score.toFixed(2) : details.score} totalReviews={details.reviews} breakdownData={details.breakdown} />
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

// ============================================================================
// 3. MAIN COMPONENT
// ============================================================================

const OrganizationStatisticsView = () => {
  const [activeOrgTab, setActiveOrgTab] = useState("ratio");
  const [statsData, setStatsData] = useState({ stackedData: [], reportData: [], avgTimeData: [] });
  const [loading, setLoading] = useState(true);

  // คำนวณยอดรวม (Summary) จากข้อมูล Stacked Data ที่ได้จาก API
  const summaryData = useMemo(() => {
    if (!statsData.stackedData || statsData.stackedData.length === 0) return null;
    return statsData.stackedData.reduce((acc, curr) => ({
      total: acc.total + curr.total,
      pending: acc.pending + curr.pending,
      inProgress: acc.inProgress + curr.inProgress,
      completed: acc.completed + curr.completed,
      forwarded: acc.forwarded + curr.forwarded,
      invited: acc.invited + curr.invited,
      rejected: acc.rejected + curr.rejected,
    }), { total: 0, pending: 0, inProgress: 0, completed: 0, forwarded: 0, invited: 0, rejected: 0 });
  }, [statsData.stackedData]);

  const menuItems = [
    { id: "ratio", title: "จำนวนเรื่องแจ้ง", icon: <FaChartBar /> },
    { id: "satisfaction", title: "เปรียบเทียบความพึงพอใจ", icon: <FaStar /> },
    { id: "avg_time", title: "เปรียบเทียบเวลาเฉลี่ย", icon: <FaHourglassHalf /> },
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // *** หมายเหตุ: เปลี่ยน 74 เป็น Dynamic Org ID ของ User ***
        const userOrgId = 74; 
        const res = await fetch(`https://premium-citydata-api-ab.vercel.app/api/stats/org-stats?org_id=${userOrgId}`);
        const data = await res.json();
        if (res.ok) setStatsData(data);
      } catch (error) {
        console.error("API Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const renderContent = () => {
    if (loading) return <div className={styles.chartBox} style={{display:'flex',justifyContent:'center',alignItems:'center',height:'300px'}}>Loading...</div>;

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
             {statsData.reportData.map(item => <ReportCardItem key={item.id} {...item} />)}
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
    return null;
  };

  return (
    <div className={styles.orgStatsContainer}>
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

      <div className={styles.orgStatsContent}>
        {/* แสดง Summary Cards เฉพาะเมื่อโหลดเสร็จและมีข้อมูล */}
        {!loading && summaryData && <StatusSummarySection data={summaryData} />}
        
        <div className={styles.orgGraphDashboard}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default OrganizationStatisticsView;
