import React, { useState } from "react";
import styles from "./css/OrgStatisticsView.module.css";
import {
  FaChartBar,
  FaStar,
  FaHourglassHalf,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

// (*** MODIFIED ***) (Component ย่อยสำหรับ Mockup Stacked Horizontal Bar Chart - รองรับ 7 สถานะใหม่)
const MockOrgStackedBarChart = () => {
  // ข้อมูลสมมติสำหรับกราฟแท่งแบบซ้อน (ปรับให้มี 7 สถานะ)
  const stackedData = [
    {
      name: "หน่วยงาน xx",
      pending: 10, // 10% (รอรับเรื่อง - แดง)
      coordinating: 5, // 5% (กำลังประสานงาน - ม่วง) (*** NEW ***)
      inProgress: 20, // 20% (กำลังดำเนินการ - เหลือง)
      forwarded: 5, // 5% (ส่งต่อ - น้ำเงิน)
      rejected: 5, // 5% (ปฏิเสธ - เทา) (*** MODIFIED NAME ***)
      invited: 5, // 5% (เชิญร่วม - เขียวมิ้นต์) (*** NEW ***)
      completed: 50, // 50% (เสร็จสิ้น - เขียวเข้ม)
      total: 120,
    },
    {
      name: "หน่วยงาน xx",
      pending: 20,
      coordinating: 10,
      inProgress: 30,
      forwarded: 5,
      rejected: 5,
      invited: 10,
      completed: 20,
      total: 85,
    },
    {
      name: "หน่วยงาน xx",
      pending: 5,
      coordinating: 10,
      inProgress: 15,
      forwarded: 10,
      rejected: 10,
      invited: 10,
      completed: 40,
      total: 40,
    },
    {
      name: "หน่วยงาน xx",
      pending: 40,
      coordinating: 10,
      inProgress: 10,
      forwarded: 10,
      rejected: 10,
      invited: 5,
      completed: 15,
      total: 15,
    },
  ];

  return (
    <div className={styles.mockStackedBarChart}>
      {stackedData.map((item, index) => (
        // (*** MODIFIED ***) เพิ่ม key ที่ดีกว่า
        <div key={`${item.name}-${index}`} className={styles.mockHBarItem}>
          {/* ใช้ .mockHBarLabel และ .mockHBarValue จากสไตล์เดิมได้ */}
          <span className={styles.mockHBarLabel}>{item.name}</span>
          <div className={styles.mockStackedHBar}>
            {/* 1. รอรับเรื่อง (สีแดง) */}
            <div
              className={styles.mockStackedBarSegment}
              style={{ width: `${item.pending}%`, background: "#dc3545" }}
              title={`รอรับเรื่อง: ${item.pending}%`}
            ></div>
            {/* 2. กำลังประสานงาน (สีม่วง) (*** NEW ***) */}
            <div
              className={styles.mockStackedBarSegment}
              style={{ width: `${item.coordinating}%`, background: "#9b59b6" }}
              title={`กำลังประสานงาน: ${item.coordinating}%`}
            ></div>
            {/* 3. กำลังดำเนินการ (สีเหลือง) */}
            <div
              className={styles.mockStackedBarSegment}
              style={{ width: `${item.inProgress}%`, background: "#ffc107" }}
              title={`กำลังดำเนินการ: ${item.inProgress}%`}
            ></div>
            {/* 4. เสร็จสิ้น (สีเขียวเข้ม) */}
            <div
              className={styles.mockStackedBarSegment}
              style={{ width: `${item.completed}%`, background: "#057A55" }}
              title={`เสร็จสิ้น: ${item.completed}%`}
            ></div>
            {/* 5. ส่งต่อ (สีน้ำเงิน) (*** MODIFIED NAME ***) */}
            <div
              className={styles.mockStackedBarSegment}
              style={{ width: `${item.forwarded}%`, background: "#007bff" }}
              title={`ส่งต่อ: ${item.forwarded}%`}
            ></div>
            {/* 6. เชิญร่วม (สีเขียวมิ้นต์) (*** NEW ***) */}
            <div
              className={styles.mockStackedBarSegment}
              style={{ width: `${item.invited}%`, background: "#20c997" }}
              title={`เชิญร่วม: ${item.invited}%`}
            ></div>
            {/* 7. ปฏิเสธ (สีเทา) (*** MODIFIED NAME ***) */}
            <div
              className={styles.mockStackedBarSegment}
              style={{ width: `${item.rejected}%`, background: "#6c757d" }}
              title={`ปฏิเสธ: ${item.rejected}%`}
            ></div>
          </div>
          <span className={styles.mockHBarValue}>{item.total}</span>
        </div>
      ))}
      {/* คำอธิบายสัญลักษณ์ (Legend) - (*** MODIFIED - 7 สถานะ ***) */}
      <div className={styles.mockStackedBarLegend}>
        <span>
          <span style={{ background: "#dc3545" }}></span> รอรับเรื่อง
        </span>
        <span>
          <span style={{ background: "#9b59b6" }}></span> กำลังประสานงาน
        </span>
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

// (*** NEW ***) (Component กราฟแท่งแนวนอนธรรมดา ที่นำกลับมาใช้ซ้ำได้)
const MockSimpleBarChart = ({ data, barColor, valueSuffix, maxValue }) => {
  // หาสเกลสูงสุด ถ้าไม่ได้กำหนดมา
  const max = maxValue || Math.max(...data.map((d) => d.value));

  return (
    <div className={styles.mockHorizontalBarChart}>
      {data.map((item, index) => (
        <div key={`${item.name}-${index}`} className={styles.mockHBarItem}>
          <span className={styles.mockHBarLabel}>{item.name}</span>
          <div className={styles.mockHBar}>
            <div
              className={styles.mockHBarFill}
              style={{
                width: `${(item.value / max) * 100}%`,
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

// ------------------------- (*** ADDED BACK ***) NEW COMPONENTS FOR REPORT CARD VIEW ***)
// (*** นี่คือกลุ่ม Component ที่หายไป ทำให้ "สถิติองค์กร" ไม่ทำงาน ***)

// --- (*** NEW COMPONENT: องค์ประกอบย่อยสำหรับแสดงความพึงพอใจใน Card ***) ---
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

// --- (*** NEW COMPONENT: Card แต่ละรายการ ***) ---
const ReportCardItem = ({ id, name, details }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // ข้อมูลจำลองสำหรับ Breakdown
  const mockBreakdownData = [
    { stars: 5, percent: id === 1 ? 100 : id === 2 ? 80 : 10 },
    { stars: 4, percent: id === 1 ? 0 : id === 2 ? 20 : 50 },
    { stars: 3, percent: id === 1 ? 0 : 0 },
    { stars: 2, percent: id === 1 ? 0 : 0 },
    { stars: 1, percent: id === 1 ? 0 : id === 2 ? 0 : 40 },
  ];

  // แก้ไข Mock Data ให้ตรงกับรูป
  if (id === 1 || id === 3 || id === 4) {
    mockBreakdownData[0].percent = 100;
    mockBreakdownData[1].percent = 0;
    mockBreakdownData[4].percent = 0;
  } else if (id === 2) {
    mockBreakdownData[0].percent = 88; // 88% like = 5-star?
    mockBreakdownData[1].percent = 12;
    mockBreakdownData[4].percent = 0;
  }

  return (
    <div
      className={`${styles.reportCardItem} ${
        isExpanded ? styles.expanded : ""
      }`}
    >
      {/* ส่วนบน: หัวข้อ, คะแนน, ปุ่ม */}
      <div className={styles.reportCardHeader}>
        <div className={styles.reportCardTitleGroup}>
          <span className={styles.reportCardRank}>{id}</span>
          <div className={styles.reportCardTitle}>
            {/* องค์ประกอบ Dropdown */}
            <span
              className={styles.reportCardName}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {name}
              {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
            </span>

            {/* (*** MODIFIED ***) ลบ Tags 'ชมชอบ' และ 'แก้ไขเร็ว' ออก */}
            {/* <div className={styles.reportCardDetailTags}> ... </div> */}
          </div>
        </div>

        <div className={styles.reportCardScoreGroup}>
          <span className={styles.reportCardScoreText}>
            {details.score.toFixed(2)}
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

      {/* ส่วนขยาย: Breakdown (ความพึงพอใจ) */}
      {isExpanded && (
        <div className={styles.reportCardExpandedContent}>
          <CardSatisfactionBreakdown
            score={details.score.toFixed(2)}
            totalReviews={details.reviews}
            breakdownData={mockBreakdownData}
          />
        </div>
      )}
    </div>
  );
};

// (*** NEW COMPONENT: Simplified View สำหรับการแสดงผล Card List ภายใน ChartBox ***)
// (*** นี่คือ Component ที่ "สถิติองค์กร" เรียกใช้ ***)
const ReportCardViewSimplified = () => {
  // ข้อมูลจำลองที่ปรับให้ตรงกับรูป 2
  const reportData = [
    {
      id: 1,
      name: "หน่วยงาน xx",
      details: {
        score: 5.0,
        reviews: 11,
        likedPercent: "100%",
        fastSolvedPercent: "15%",
      },
    },
    {
      id: 2,
      name: "หน่วยงาน xx",
      details: {
        score: 4.8,
        reviews: 25,
        likedPercent: "88%",
        fastSolvedPercent: "14%",
      },
    },
    {
      id: 3,
      name: "หน่วยงาน xx",
      details: {
        score: 5.0,
        reviews: 6,
        likedPercent: "100%",
        fastSolvedPercent: "15%",
      },
    },
    {
      id: 4,
      name: "หน่วยงาน xx",
      details: {
        score: 5.0,
        reviews: 5,
        likedPercent: "100%",
        fastSolvedPercent: "14%",
      },
    },
  ];

  // แสดงเฉพาะรายการ Card โดยไม่มี Sidebar และ Filter Bar ของ ReportCardView
  return (
    <div className={styles.reportCardList} style={{ padding: "10px 0" }}>
      {reportData.map((item) => (
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
// --- (*** จบส่วนที่ ADDED BACK ***) ---

// ------------------------- (*** 2. OrganizationStatisticsView - "สถิติองค์กร (แสดงกราฟเดียว)" ***)
const OrganizationStatisticsView = () => {
  const [activeOrgTab, setActiveOrgTab] = useState("satisfaction");

  const menuItems = [
    { id: "ratio", title: "จำนวนเรื่องแจ้ง", icon: <FaChartBar /> },
    { id: "satisfaction", title: "เปรียบเทียบความพึงพอใจ", icon: <FaStar /> },
    {
      id: "avg_time",
      title: "เปรียบเทียบเวลาเฉลี่ย",
      icon: <FaHourglassHalf />,
    },
  ];

  const avgTimeData = [
    { name: "หน่วยงาน xx", value: 3.2 },
    { name: "หน่วยงาน xx", value: 5.1 },
    { name: "หน่วยงาน xx", value: 2.5 },
    { name: "หน่วยงาน xx", value: 7.0 },
  ];

  const renderContent = () => {
    if (activeOrgTab === "ratio") {
      return (
        <div className={styles.chartBox} key="ratio-chart">
          <h4 className={styles.chartBoxTitle}>
            จำนวนเรื่องแจ้ง (7 สถานะ)
          </h4>
          <MockOrgStackedBarChart />
        </div>
      );
    }
    if (activeOrgTab === "satisfaction") {
      return (
        <div className={styles.chartBox} key="satisfaction-card-list">
          <h4 className={styles.chartBoxTitle}>
            กราฟเปรียบเทียบความพึงพอใจ (แสดงผลลัพธ์เป็น Card List)
          </h4>
          {/* (*** FIXED ***) ตอนนี้ ReportCardViewSimplified ถูก import แล้ว */}
          <ReportCardViewSimplified />
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
            data={avgTimeData}
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
