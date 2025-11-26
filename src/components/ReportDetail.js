import React from 'react';
import styles from './css/ReportDetail.module.css';

// SVG Icons (Optional: ใส่เพื่อให้ดูสวยขึ้น ถ้าไม่ใช้ลบออกได้)
const IconMap = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
);
const IconImage = () => (
  <svg width="40" height="40" fill="none" stroke="#9CA3AF" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
);

const ReportDetail = ({ data, onBack }) => {
  const info = data || {
    id: "RQ-2023-001", // ใส่รหัสสมมติให้ดูเต็มขึ้น
    title: "ทดสอบไฟฟ้าดับบริเวณทางเดิน",
    rating: 5,
    status: "รอรับเรื่อง",
    locationDetail: "อาคาร 1 > ชั้น 2 > โซนทางเดินทิศใต้",
    image: null 
  };

  return (
    <div className={styles.container}>
      
      {/* ปุ่มย้อนกลับ Styled ใหม่ */}
      {onBack && (
        <button className={styles.backButton} onClick={onBack}>
          ← ย้อนกลับ
        </button>
      )}

      {/* === ส่วนบน: รายละเอียด + รูปภาพ === */}
      <div className={styles.topSection}>
        {/* การ์ดข้อมูล */}
        <div className={`${styles.card} ${styles.infoCard}`}>
          <div className={styles.headerRow}>
            <div>
              <p className={styles.label}>รหัสเรื่อง: {info.id}</p>
              <h2 className={styles.title}>{info.title}</h2>
            </div>
          </div>
          
          <div>
            <p className={styles.label} style={{marginBottom: '4px'}}>ความเร่งด่วน / คะแนน</p>
            <div className={styles.stars}>
              {'★'.repeat(info.rating)}
              <span style={{color: '#E5E7EB'}}>{'★'.repeat(5 - info.rating)}</span> {/* ดาวสีเทาสำหรับส่วนที่เหลือ */}
            </div>
          </div>

          <div className={styles.statusBadge}>
            <span style={{color: '#6B7280'}}>สถานะ :</span>
            <span style={{color: '#000'}}>{info.status}</span>
          </div>
        </div>

        {/* การ์ดรูปภาพ */}
        <div className={styles.imageCard}>
          {info.image ? (
            <img src={info.image} alt="Report" className={styles.realImage} />
          ) : (
            <div className={styles.imagePlaceholder}>
              <IconImage />
              <span>ไม่มีรูปภาพแนบ</span>
            </div>
          )}
        </div>
      </div>

      {/* === ส่วนกลาง: ตำแหน่ง + หน่วยงาน === */}
      <div className={styles.middleSection}>
        {/* กล่องตำแหน่ง */}
        <div className={`${styles.card} ${styles.locationCard}`}>
          <div className={styles.sectionHeader}>
            <IconMap /> ตำแหน่งที่แจ้ง
          </div>
          <div className={styles.breadcrumb}>
            {info.locationDetail}
          </div>
        </div>

        {/* กล่องหน่วยงาน */}
        <div className={`${styles.card} ${styles.agencyCard}`}>
          <div className={styles.sectionHeader}>หน่วยงานที่เกี่ยวข้อง</div>
          <div style={{ color: '#4B5563', fontSize: '14px' }}>
            {/* Content หน่วยงาน */}
            - แผนกซ่อมบำรุงทั่วไป
          </div>
        </div>
      </div>

      {/* === ส่วนล่าง: รายงานสถานะ === */}
      <div className={`${styles.card} ${styles.bottomSection}`}>
        <div className={styles.sectionHeader}>ติดตามสถานะการดำเนินงาน</div>
        <div className={styles.emptyStateText}>
          ยังไม่มีการอัปเดตสถานะเพิ่มเติม...
        </div>
      </div>

    </div>
  );
};

export default ReportDetail;
