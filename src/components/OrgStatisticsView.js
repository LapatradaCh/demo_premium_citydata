import React, { useState, useEffect } from "react";
import styles from "./css/OrgStatisticsView.module.css"; // ตรวจสอบ path ให้ถูกต้อง
import {
  FaChartBar,
  FaStar,
  FaHourglassHalf,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

// ============================================================================
// 1. SUB-COMPONENTS
// ============================================================================

// --- แสดงรายละเอียด Breakdown ดาว ---
const CardSatisfactionBreakdown = ({ score, totalReviews, breakdownData }) => (
  <div className={styles.satisfactionCardBreakdown}>
    <div className={styles.satisfactionCardHeader}>
      <span className={styles.satisfactionCardScore}>{score}</span>
      <span className={styles.satisfactionCardStarGroup}>
        {[...Array(5)].map((_, i) => (
          <FaStar key={i} className={styles.satisfactionCardStar} color="#ffc107" size={24} />
        ))}
      </span>
      <div className={styles.satisfactionCardTotal} style={{marginTop: '8px', color: '#888'}}>
          จาก {totalReviews} ความเห็น
      </div>
    </div>

    <div className={styles.satisfactionCardRows}>
      {breakdownData.map((item) => (
        <div key={item.stars} className={styles.satisfactionBreakdownRow}>
          <span className={styles.satisfactionBreakdownLabel} style={{fontWeight:'bold', color:'#555'}}>
            {item.stars}
          </span>
          <div className={styles.satisfactionBreakdownBar}>
            <div
              className={styles.satisfactionBreakdownBarFill}
              style={{
                width: `${item.percent}%`,
                backgroundColor: "#ffc107", // สีเหลืองทอง
              }}
            ></div>
          </div>
          <span className={styles.satisfactionBreakdownPercent}>
            {item.percent}%
          </span>
        </div>
      ))}
    </div>
  </div>
);

// --- Card Item ---
const ReportCardItem = ({ id, name, details }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`${styles.reportCardItem} ${isExpanded ? styles.expanded : ""}`}>
      <div className={styles.reportCardHeader}>
        <div className={styles.reportCardTitleGroup}>
          <span className={styles.reportCardRank}>{id}</span>
          <div className={styles.reportCardTitle}>
            <span
              className={styles.reportCardName}
              onClick={() => setIsExpanded(!isExpanded)}
              style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
            >
              {name}
              {isExpanded ? <FaChevronUp size={12} color="#999" /> : <FaChevronDown size={12} color="#999" />}
            </span>
          </div>
        </div>

        <div className={styles.reportCardScoreGroup} style={{textAlign:'right'}}>
          <span className={styles.reportCardScoreText}>
            {typeof details.score === 'number' ? details.score.toFixed(2) : details.score}
          </span>
          <span className={styles.reportCardScoreStars}>
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} color="#ffc107" />
            ))}
          </span>
          <span className={styles.reportCardScoreReviews}>
            ({details.reviews} ความเห็น)
          </span>
        </div>
      </div>

      {isExpanded && (
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

const ReportCardViewSimplified = ({ data }) => {
  if (!data || data.length === 0) {
    return <div style={{ padding: "40px", textAlign: "center", color: "#999" }}>ไม่มีข้อมูลรีวิว</div>;
  }
  return (
    <div className={styles.reportCardList}>
      {data.map((item) => (
        <ReportCardItem
          key={item.id}
          id={item.id}
          name={item.name}
          details={item.details}
        />
      ))}
    </div>
  );
};

// --- กราฟ Stacked Bar (ปรับสีตามรูปที่ 4) ---
const MockOrgStackedBarChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <div style={{ padding: "40px", textAlign: "center", color: "#999" }}>ไม่มีข้อมูลกราฟ</div>;
  }

  const getWidth = (val, total) => {
    if (!total || total === 0) return 0;
    return (val / total) * 100;
  };

  // *** สีสถานะอิงตามรูปที่ 4 ***
  const COLORS = {
    pending: "#FF4D4F",    // แดง (รอรับเรื่อง)
    inProgress: "#FFC107", // เหลือง (ดำเนินการ)
    completed: "#4CAF50",  // เขียว (เสร็จสิ้น)
    forwarded: "#2196F3",  // ฟ้า (ส่งต่อ)
    invited: "#00BCD4",    // ฟ้าอมเขียว (เชิญร่วม)
    rejected: "#6C757D"    // เทา (ปฏิเสธ)
  };

  return (
    <div className={styles.mockStackedBarChart}>
      {data.map((item, index) => (
        <div key={`${item.name}-${index}`} className={styles.mockHBarItem}>
          <span className={styles.mockHBarLabel}>{item.name}</span>
          <div className={styles.mockStackedHBar}>
            {/* 1. รอรับเรื่อง (แดง) */}
            <div
              className={styles.mockStackedBarSegment}
              style={{ width: `${getWidth(item.pending, item.total)}%`, background: COLORS.pending }}
              title={`รอรับเรื่อง: ${item.pending}`}
            ></div>
            
            {/* 2. กำลังดำเนินการ (เหลือง) */}
            <div
              className={styles.mockStackedBarSegment}
              style={{ width: `${getWidth(item.inProgress, item.total)}%`, background: COLORS.inProgress }}
              title={`กำลังดำเนินการ: ${item.inProgress}`}
            ></div>

            {/* 3. เสร็จสิ้น (เขียว) */}
            <div
              className={styles.mockStackedBarSegment}
              style={{ width: `${getWidth(item.completed, item.total)}%`, background: COLORS.completed }}
              title={`เสร็จสิ้น: ${item.completed}`}
            ></div>

            {/* 4. ส่งต่อ (ฟ้า) */}
            <div
              className={styles.mockStackedBarSegment}
              style={{ width: `${getWidth(item.forwarded, item.total)}%`, background: COLORS.forwarded }}
              title={`ส่งต่อ: ${item.forwarded}`}
            ></div>

            {/* 5. เชิญร่วม (ฟ้าอมเขียว/Cyan) */}
            <div
              className={styles.mockStackedBarSegment}
              style={{ width: `${getWidth(item.invited, item.total)}%`, background: COLORS.invited }}
              title={`เชิญร่วม: ${item.invited}`}
            ></div>

            {/* 6. ปฏิเสธ (เทา) */}
            <div
              className={styles.mockStackedBarSegment}
              style={{ width: `${getWidth(item.rejected, item.total)}%`, background: COLORS.rejected }}
              title={`ปฏิเสธ: ${item.rejected}`}
            ></div>
          </div>
          <span className={styles.mockHBarValue}>{item.total}</span>
        </div>
      ))}

      {/* Legend แบบใหม่ สวยงาม */}
      <div className={styles.mockStackedBarLegend}>
        <span><span style={{ background: COLORS.pending }}></span> รอรับเรื่อง</span>
        <span><span style={{ background: COLORS.inProgress }}></span> ดำเนินการ</span>
        <span><span style={{ background: COLORS.completed }}></span> เสร็จสิ้น</span>
        <span><span style={{ background: COLORS.forwarded }}></span> ส่งต่อ</span>
        <span><span style={{ background: COLORS.invited }}></span> เชิญร่วม</span>
        <span><span style={{ background: COLORS.rejected }}></span> ปฏิเสธ</span>
      </div>
    </div>
  );
};

// --- กราฟแท่งธรรมดา (Simple Bar) ---
const MockSimpleBarChart = ({ data, valueSuffix }) => {
  if (!data || data.length === 0) {
    return <div style={{ padding: "40px", textAlign: "center", color: "#999" }}>ไม่มีข้อมูลกราฟ</div>;
  }
  const maxValue = Math.max(...data.map((d) => d.value)) || 1; 

  return (
    <div className={styles.mockHorizontalBarChart}>
      {data.map((item, index) => (
        <div key={`${item.name}-${index}`} className={styles.mockHBarItem}>
          <span className={styles.mockHBarLabel}>{item.name}</span>
          <div className={styles.mockHBar}>
            <div
              className={styles.mockHBarFill}
              style={{
                width: `${(item.value / maxValue) * 100}%`,
                // ใช้สีเทาไล่เฉด (Monochrome Theme)
                background: "linear-gradient(90deg, #6c757d 0%, #495057 100%)"
              }}
            ></div>
          </div>
          <span className={styles.mockHBarValue} style={{fontSize: '16px'}}>
            {item.value.toFixed(1)} {valueSuffix}
          </span>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// 2. MAIN COMPONENT
// ============================================================================

const OrganizationStatisticsView = () => {
  const [activeOrgTab, setActiveOrgTab] = useState("ratio");
  const [statsData, setStatsData] = useState({
    stackedData: [],
    reportData: [],
    avgTimeData: []
  });
  const [loading, setLoading] = useState(true);

  const menuItems = [
    { id: "ratio", title: "จำนวนเรื่องแจ้ง", icon: <FaChartBar /> },
    { id: "satisfaction", title: "เปรียบเทียบความพึงพอใจ", icon: <FaStar /> },
    { id: "avg_time", title: "เปรียบเทียบเวลาเฉลี่ย", icon: <FaHourglassHalf /> },
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // ID องค์กร (เปลี่ยนตามการใช้งานจริง)
        const userOrgId = 74; 
        const res = await fetch(`https://premium-citydata-api-ab.vercel.app/api/stats/org-stats?org_id=${userOrgId}`);
        const data = await res.json();
        
        if (res.ok) {
          setStatsData(data);
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
    if (loading) {
      return (
        <div className={styles.chartBox} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <span style={{color:'#888', fontWeight:'500'}}>กำลังโหลดข้อมูลสถิติ...</span>
        </div>
      );
    }

    if (activeOrgTab === "ratio") {
      return (
        <div className={styles.chartBox} key="ratio-chart">
          <h4 className={styles.chartBoxTitle}>
            จำนวนเรื่องแจ้ง (6 สถานะ)
          </h4>
          <MockOrgStackedBarChart data={statsData.stackedData} />
        </div>
      );
    }

    if (activeOrgTab === "satisfaction") {
      return (
        <div className={styles.chartBox} key="satisfaction-card-list">
          <h4 className={styles.chartBoxTitle}>
            กราฟเปรียบเทียบความพึงพอใจ
          </h4>
          <ReportCardViewSimplified data={statsData.reportData} />
        </div>
      );
    }

    if (activeOrgTab === "avg_time") {
      return (
        <div className={styles.chartBox} key="avg-time-chart">
          <h4 className={styles.chartBoxTitle}>
            กราฟเปรียบเทียบเวลาเฉลี่ย (วัน)
          </h4>
          <div className={styles.chartNote}>(*ยิ่งน้อยยิ่งดี)</div>
          <MockSimpleBarChart
            data={statsData.avgTimeData}
            valueSuffix="วัน"
          />
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.orgStatsContainer}>
      {/* 1. เมนูด้านซ้าย */}
      <div className={styles.orgStatsSidebar}>
        <h3 className={styles.orgStatsMenuTitle}>สถิติองค์กร</h3>
        <nav className={styles.orgStatsMenuNav}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`${styles.orgStatsMenuButton} ${
                activeOrgTab === item.id ? styles.active : ""
              }`}
              onClick={() => setActiveOrgTab(item.id)}
            >
              {item.icon}
              <span>{item.title}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* 2. เนื้อหาด้านขวา */}
      <div className={styles.orgStatsContent}>
        <div className={styles.orgGraphDashboard}>{renderContent()}</div>
      </div>
    </div>
  );
};

export default OrganizationStatisticsView;
