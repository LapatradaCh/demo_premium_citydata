import React from 'react';
// Import CSS แบบ Module (สำคัญมาก: ต้องมี .module.css)
import styles from './css/ReportDetail.module.css';

const ReportDetail = ({ data, onBack }) => {
  // Mock data ไว้ทดสอบ ถ้าไม่มีข้อมูลส่งมา
  const info = data || {
    id: "Unknown",
    title: "ความเห็นผู้แจ้ง",
    rating: 5,
    status: "รอรับสถานะ",
    locationDetail: "นำทาง > แผนที่ภายใน >",
    image: null // ใส่ URL รูปตรงนี้
  };

  return (
    <div className={styles.container}>
      
      {/* ปุ่มย้อนกลับ (ถ้าต้องการ) */}
      {onBack && (
        <button 
          onClick={onBack} 
          style={{alignSelf: 'flex-start', padding: '5px 10px', cursor: 'pointer', marginBottom: '10px'}}
        >
          &lt; ย้อนกลับ
        </button>
      )}

      {/* === ส่วนบน: รายละเอียด + รูปภาพ === */}
      <div className={styles.topSection}>
        {/* การ์ดข้อมูลซ้าย */}
        <div className={styles.infoCard}>
          <p className={styles.label}>รหัสเรื่อง {info.id}</p>
          <p className={styles.label}>ชื่อเรื่อง</p>
          <h2 className={styles.title}>{info.title}</h2>
          
          <div className={styles.stars}>
            {'★'.repeat(info.rating)}
          </div>

          <div className={styles.statusBox}>
            <span>สถานะ :</span>
            <span>{info.status}</span>
            <span>&gt;</span>
          </div>
        </div>

        {/* การ์ดรูปภาพขวา */}
        <div className={styles.imageCard}>
          {info.image ? (
            <img src={info.image} alt="Report" className={styles.realImage} />
          ) : (
            <span className={styles.imageText}>รูปภาพ</span>
          )}
        </div>
      </div>

      {/* === ส่วนกลาง: ตำแหน่ง + หน่วยงาน === */}
      <div className={styles.middleSection}>
        {/* กล่องตำแหน่ง */}
        <div className={styles.locationCard}>
          <div className={styles.purpleText}>ตำแหน่ง</div>
          <div className={styles.label}>ตำแหน่ง</div>
          <div className={styles.linkText}>นำทาง &gt; แผนที่ภายใน &gt;</div>
        </div>

        {/* กล่องหน่วยงาน */}
        <div className={styles.agencyWrapper}>
          <div className={styles.agencyHeader}>หน่วยงานที่เกี่ยวข้อง</div>
          <div className={styles.agencyBox}>
            {/* ใส่เนื้อหาหน่วยงานตรงนี้ */}
          </div>
        </div>
      </div>

      {/* === ส่วนล่าง: รายงานสถานะ === */}
      <div className={styles.bottomSection}>
        <div className={styles.sectionTitle}>รายงานสถานะ</div>
        <div style={{ color: '#777', fontStyle: 'italic' }}>
          {/* พื้นที่แสดง Timeline หรือข้อความ */}
          ยังไม่มีรายละเอียดสถานะเพิ่มเติม...
        </div>
      </div>

    </div>
  );
};

export default ReportDetail;
