import React, { useState } from "react";
import styles from "./css/MapView.module.css";
import { FaMapMarkerAlt } from "react-icons/fa";

// ------------------------- ตัวอย่าง Report Data
// (ข้อมูล Mock นี้ถูกใช้ใน Popup ของแผนที่)
const reportData = [
  {
    id: "#2025-TYHKE",
    detail:
      "ทดลองแจ้งเรื่องฝาท่อระบายน้ำที่ถนนหน้าหมู่บ้าน มีน้ำขังเยอะมาก",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFmeZPibDL4XbTA9wnhZCpCeK0bFg07Pf2cw&s",
    category: "อื่นๆ",
    datetime_in: "ต.ค. 4 เม.ย. 68 14:19 น.",
    datetime_out: "ต.ค. 4 เม.ย. 68 14:19 น.",
    location: "914 ถนน ตาดคำ",
    responsible_unit: "ทีมพัฒนา",
    status: "รอรับเรื่อง",
    rating: null,
  },
  {
    id: "#2025-ETNEZE",
    detail: "มีต้นไม้กีดขวาง ทางเดินเท้า ทำให้คนเดินสัญจรไม่สะดวก",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_bRmXqJQOpLMvoKvL89IYlHse2LioPsA8sQ&s",
    category: "ต้นไม้",
    datetime_in: "พฤ. 13 มี.ค. 68 16:08 น.",
    datetime_out: "ต.ค. 3 ส.ค. 69 15:23 น.",
    location: "460 หมู่ 12 ถนน มิตรภาพ",
    responsible_unit: "ทีมพัฒนา",
    status: "เสร็จสิ้น",
    rating: 4,
  },
];

// ------------------------- Helper
const truncateText = (text, maxLength) => {
  if (!text) return "";
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + "...";
};


// ------------------------- (*** 4. MapView - "เนื้อหาใหม่" ***)
// (*** นี่คือ Component ที่นำกลับมาตามคำขอ ***)
const MapView = ({ subTab }) => {
  const [mapMode, setMapMode] = useState("pins"); // 'pins' or 'heatmap'

  // 1. หน้า "แผนที่สาธารณะ"
  if (subTab === "แผนที่สาธารณะ") {
    return (
      <div className={styles.mapViewContainer}>
        {/* 1.1 Sidebar (Public) */}
        <div className={styles.mapSidebar}>
          <h3 className={styles.mapSidebarTitle}>ตัวกรองแผนที่สาธารณะ</h3>
          <div className={styles.mapSidebarSection}>
            <div className={styles.filterGroup}>
              <label>ประเภทปัญหา</label>
              <select defaultValue="all">
                <option value="all">ทั้งหมด</option>
                <option value="public">xxxx ไฟฟ้า/ประปา</option>
                <option value="internal">xxxx ถนน/ทางเท้า</option>
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label>สถานะ</label>
              <select defaultValue="all">
                <option value="all">ทั้งหมด</option>
                <option value="pending">รอรับเรื่อง</option>
                <option value="in_progress">กำลังดำเนินการ</option>
                <option value="completed">เสร็จสิ้น</option>
                <option value="forwarded">ส่งต่อ</option>
                <option value="rejected">ปฏิเสธ</option>
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label>ช่วงเวลา</label>
              <button className={styles.timeRangeButton}>
                กดเพื่อเลือกช่วงเวลา
              </button>
            </div>
          </div>
          <button className={styles.filterApplyButton}>ค้นหา</button>
        </div>

        {/* 1.2 Map Content (Public) */}
        <div className={styles.mapContent}>
          <div className={styles.mapPlaceholder}>
            <span>(พื้นที่แผนที่สาธารณะ)</span>

            {/* Mock Pin 1 (รอรับเรื่อง - แดง) */}
            <FaMapMarkerAlt
              className={`${styles.mockMapPin} ${styles.pending}`}
              style={{ top: "30%", left: "40%" }}
            />

            {/* Mock Pin 2 (กำลังประสานงาน - ม่วง) */}
            <FaMapMarkerAlt
              className={`${styles.mockMapPin} ${styles.coordinating}`}
              style={{ top: "50%", left: "60%" }}
            />
            <div
              className={styles.mockMapPopup}
              style={{
                top: "50%",
                left: "60%",
                transform: "translate(15px, -110%)",
              }}
            >
              <img
                src={reportData[0].image}
                alt="Mock"
                className={styles.mockPopupImage}
              />
              <span className={styles.mockPopupText}>
                {truncateText(reportData[0].detail, 50)}
              </span>
              <span className={`${styles.statusTag} ${styles.coordinating}`}>
                กำลังประสานงาน
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. หน้า "แผนที่ภายใน"
  if (subTab === "แผนที่ภายใน") {
    return (
      <div className={styles.mapViewContainer}>
        {/* 2.1 Sidebar (Internal) */}
        <div className={styles.mapSidebar}>
          <h3 className={styles.mapSidebarTitle}>เครื่องมือแผนที่ภายใน</h3>

          <div className={styles.mapSidebarSection}>
            <label className={styles.filterGroup}>รูปแบบการแสดงผล</label>
            <div className={styles.mapToggles}>
              <button
                className={
                  mapMode === "pins"
                    ? styles.toggleButtonActive
                    : styles.toggleButton
                }
                onClick={() => setMapMode("pins")}
              >
                หมุด
              </button>
              <button
                className={
                  mapMode === "heatmap"
                    ? styles.toggleButtonActive
                    : styles.toggleButton
                }
                onClick={() => setMapMode("heatmap")}
              >
                Heatmap
              </button>
            </div>
          </div>

          <div className={styles.mapSidebarSection}>
            <div className={styles.filterGroup}>
              <label>สถานะ</label>
              <select defaultValue="all">
                <option value="all">ทั้งหมด</option>
                <option value="pending">รอรับเรื่อง</option>
                <option value="coordinating">กำลังประสานงาน</option>
                <option value="in_progress">กำลังดำเนินการ</option>
                <option value="completed">เสร็จสิ้น</option>
                <option value="forwarded">ส่งต่อ</option>
                <option value="invited">เชิญร่วม</option>
                <option value="rejected">ปฏิเสธ</option>
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label>หน่วยงานรับผิดชอบ</label>
              <select defaultValue="all">
                <option value="all">ทุกหน่วยงาน</option>
                <option value="unit1">xxxx กองช่าง</option>
                <option value="unit2">xxxx กองสาธารณสุข</option>
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label>ผู้รับผิดชอบ</label>
              <select defaultValue="all" disabled>
                <option value="all">ทุกคน</option>
              </select>
            </div>
          </div>
          <button className={styles.filterApplyButton}>กรองข้อมูล</button>
        </div>

        {/* 2.2 Map Content (Internal) */}
        <div className={styles.mapContent}>
          <div className={styles.mapPlaceholder}>
            {mapMode === "pins" ? (
              <>
                <span>(พื้นที่แผนที่ภายใน - หมุด)</span>
                {/* Mock Pins (Internal) */}
                <FaMapMarkerAlt
                  className={`${styles.mockMapPin} ${styles.pending}`}
                  style={{ top: "25%", left: "30%" }}
                  title="รอรับเรื่อง"
                />
                <FaMapMarkerAlt
                  className={`${styles.mockMapPin} ${styles.coordinating}`}
                  style={{ top: "15%", left: "55%" }}
                  title="กำลังประสานงาน"
                />
                <FaMapMarkerAlt
                  className={`${styles.mockMapPin} ${styles.in_progress}`}
                  style={{ top: "40%", left: "55%" }}
                  title="กำลังดำเนินการ"
                />
                <FaMapMarkerAlt
                  className={`${styles.mockMapPin} ${styles.completed}`}
                  style={{ top: "65%", left: "40%" }}
                  title="เสร็จสิ้น"
                />
                <FaMapMarkerAlt
                  className={`${styles.mockMapPin} ${styles.rejected}`}
                  style={{ top: "70%", left: "70%" }}
                  title="ปฏิเสธ"
                />

                {/* Legend */}
                <div className={styles.mapLegend}>
                  <div className={styles.legendItem}>
                    <FaMapMarkerAlt className={styles.pending} />
                    <span>รอรับเรื่อง</span>
                  </div>
                  <div className={styles.legendItem}>
                    <FaMapMarkerAlt className={styles.coordinating} />
                    <span>ประสานงาน</span>
                  </div>
                  <div className={styles.legendItem}>
                    <FaMapMarkerAlt className={styles.in_progress} />
                    <span>ดำเนินการ</span>
                  </div>
                  <div className={styles.legendItem}>
                    <FaMapMarkerAlt className={styles.completed} />
                    <span>เสร็จสิ้น</span>
                  </div>
                  <div className={styles.legendItem}>
                    <FaMapMarkerAlt className={styles.rejected} />
                    <span>ปฏิเสธ</span>
                  </div>
                </div>
              </>
            ) : (
              <span>(Mockup Heatmap)</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // (Default case)
  return (
    <div className={styles.mapViewContainer}>
      <div>{subTab}</div>
    </div>
  );
};

export default MapView;
