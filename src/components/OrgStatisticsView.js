import React, { useState, useEffect } from "react";
import styles from "./css/OrgStatisticsView.module.css";
import {
  FaChartBar,
  FaStar,
  FaHourglassHalf,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

// ============================================================================
// 1. SUB-COMPONENTS (ส่วนประกอบย่อย)
// ============================================================================

// --- แสดงรายละเอียด Breakdown ดาว (ใช้ใน Card) ---
const CardSatisfactionBreakdown = ({ score, totalReviews, breakdownData }) => (
  <div className={styles.satisfactionCardBreakdown}>
    <div className={styles.satisfactionCardHeader}>
      <span className={styles.satisfactionCardScore}>{score}</span>
      <span className={styles.satisfactionCardStarGroup}>
        {[...Array(5)].map((_, i) => (
          <FaStar key={i} className={styles.satisfactionCardStar} />
        ))}
        <span className={styles.satisfactionCardTotal}>
          ({totalReviews} ความเห็น)
        </span>
      </span>
    </div>

    <div className={styles.satisfactionCardRows}>
      {breakdownData.map((item) => (
        <div key={item.stars} className={styles.satisfactionBreakdownRow}>
          <span className={styles.satisfactionBreakdownLabel}>
            {item.stars}
          </span>
          <div className={styles.satisfactionBreakdownBar}>
            <div
              className={styles.satisfactionBreakdownBarFill}
              style={{
                width: `${item.percent}%`,
                backgroundColor: item.percent > 0 ? "#ffc107" : "#f0f0f0",
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

// --- Card แต่ละใบ (ใช้แสดงความพึงพอใจ) ---
const ReportCardItem = ({ id, name, details }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`${styles.reportCardItem} ${
        isExpanded ? styles.expanded : ""
      }`}
    >
      {/* ส่วนหัว Card */}
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
              {isExpanded ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
            </span>
          </div>
        </div>

        <div className={styles.reportCardScoreGroup}>
          <span className={styles.reportCardScoreText}>
            {typeof details.score === 'number' ? details.score.toFixed(2) : details.score}
          </span>
          <span className={styles.reportCardScoreStars}>
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} />
            ))}
          </span>
          <span className={styles.reportCardScoreReviews}>
            ({details.reviews} ความเห็น)
          </span>
        </div>
      </div>

      {/* ส่วนขยาย Breakdown */}
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

// --- List ของ Card (รับ data จาก API) ---
const ReportCardViewSimplified = ({ data }) => {
  if (!data || data.length === 0) {
    return <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>ไม่มีข้อมูลรีวิว</div>;
  }

  return (
    <div className={styles.reportCardList} style={{ padding: "10px 0" }}>
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

// --- กราฟ Stacked Bar (รับ data จาก API และคำนวณ %) ---
const MockOrgStackedBarChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>ไม่มีข้อมูลกราฟ</div>;
  }

  // Helper คำนวณ % ความกว้าง (กันหารด้วย 0)
  const getWidth = (val, total) => {
    if (!total || total === 0) return 0;
    return (val / total) * 100;
  };

  return (
    <div className={styles.mockStackedBarChart}>
      {data.map((item, index) => (
        <div key={`${item.name}-${index}`} className={styles.mockHBarItem}>
          <span className={styles.mockHBarLabel}>{item.name}</span>
          <div className={styles.mockStackedHBar}>
            {/* 1. รอรับเรื่อง (สีแดง) */}
            <div
              className={styles.mockStackedBarSegment}
              style={{ width: `${getWidth(item.pending, item.total)}%`, background: "#dc3545" }}
              title={`รอรับเรื่อง: ${item.pending}`}
            ></div>
            
            {/* (ตัด 'กำลังประสานงาน' ออกแล้ว) */}

            {/* 2. กำลังดำเนินการ (สีเหลือง) */}
            <div
              className={styles.mockStackedBarSegment}
              style={{ width: `${getWidth(item.inProgress, item.total)}%`, background: "#ffc107" }}
              title={`กำลังดำเนินการ: ${item.inProgress}`}
            ></div>

            {/* 3. เสร็จสิ้น (สีเขียวเข้ม) */}
            <div
              className={styles.mockStackedBarSegment}
              style={{ width: `${getWidth(item.completed, item.total)}%`, background: "#057A55" }}
              title={`เสร็จสิ้น: ${item.completed}`}
            ></div>

            {/* 4. ส่งต่อ (สีน้ำเงิน) */}
            <div
              className={styles.mockStackedBarSegment}
              style={{ width: `${getWidth(item.forwarded, item.total)}%`, background: "#007bff" }}
              title={`ส่งต่อ: ${item.forwarded}`}
            ></div>

            {/* 5. เชิญร่วม (สีเขียวมิ้นต์) */}
            <div
              className={styles.mockStackedBarSegment}
              style={{ width: `${getWidth(item.invited, item.total)}%`, background: "#20c997" }}
              title={`เชิญร่วม: ${item.invited}`}
            ></div>

            {/* 6. ปฏิเสธ (สีเทา) */}
            <div
              className={styles.mockStackedBarSegment}
              style={{ width: `${getWidth(item.rejected, item.total)}%`, background: "#6c757d" }}
              title={`ปฏิเสธ: ${item.rejected}`}
            ></div>
          </div>
          <span className={styles.mockHBarValue}>{item.total}</span>
        </div>
      ))}

      {/* Legend (ลบ 'กำลังประสานงาน' ออก) */}
      <div className={styles.mockStackedBarLegend}>
        <span>
          <span style={{ background: "#dc3545" }}></span> รอรับเรื่อง
        </span>
        {/* ตัด กำลังประสานงาน ออก */}
        <span>
          <span style={{ background: "#ffc107" }}></span> กำลังดำเนินการ
        </span>
        <span>
          <span style={{ background: "#057A55" }}></span> เสร็จสิ้น
        </span>
        <span>
          <span style={{ background: "#007bff" }}></span> ส่งต่อ
        </span>
        <span>
          <span style={{ background: "#20c997" }}></span> เชิญร่วม
        </span>
        <span>
          <span style={{ background: "#6c757d" }}></span> ปฏิเสธ
        </span>
      </div>
    </div>
  );
};

// --- กราฟแท่งธรรมดา (Simple Bar) ---
const MockSimpleBarChart = ({ data, barColor, valueSuffix }) => {
  if (!data || data.length === 0) {
    return <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>ไม่มีข้อมูลกราฟ</div>;
  }

  const maxValue = Math.max(...data.map((d) => d.value)) || 1; // กันหาร 0

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
                background: barColor,
              }}
              title={`${item.value} ${valueSuffix}`}
            ></div>
          </div>
          <span className={styles.mockHBarValue}>
            {item.value.toFixed(1)} {valueSuffix}
          </span>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// 2. MAIN COMPONENT (หน้าจอหลัก)
// ============================================================================

const OrganizationStatisticsView = () => {
  const [activeOrgTab, setActiveOrgTab] = useState("ratio");
  
  // State สำหรับเก็บข้อมูลจริงจาก API
  const [statsData, setStatsData] = useState({
    stackedData: [],
    reportData: [],
    avgTimeData: []
  });
  const [loading, setLoading] = useState(true);

  // เมนูด้านซ้าย
  const menuItems = [
    { id: "ratio", title: "จำนวนเรื่องแจ้ง", icon: <FaChartBar /> },
    { id: "satisfaction", title: "เปรียบเทียบความพึงพอใจ", icon: <FaStar /> },
    { id: "avg_time", title: "เปรียบเทียบเวลาเฉลี่ย", icon: <FaHourglassHalf /> },
  ];

  // Fetch Data เมื่อ Component โหลด
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // *** หมายเหตุ: เปลี่ยน 74 เป็น ID ของ User ที่ login อยู่จริง หรือดึงจาก Context/LocalStorage ***
        const userOrgId = 74; 
        
        const res = await fetch(`https://premium-citydata-api-ab.vercel.app/api/stats/org-stats?org_id=${userOrgId}`);
        const data = await res.json();
        
        if (res.ok) {
          setStatsData(data);
        } else {
          console.error("Failed to fetch stats:", data);
        }
      } catch (error) {
        console.error("API Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // ฟังก์ชันเลือกแสดงเนื้อหาตาม Tab
  const renderContent = () => {
    if (loading) {
      return (
        <div className={styles.chartBox} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <span>กำลังโหลดข้อมูลสถิติ...</span>
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
            barColor="#6c757d"
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

      {/* 2. พื้นที่แสดงเนื้อหาด้านขวา */}
      <div className={styles.orgStatsContent}>
        <div className={styles.orgGraphDashboard}>{renderContent()}</div>
      </div>
    </div>
  );
};

export default OrganizationStatisticsView;
