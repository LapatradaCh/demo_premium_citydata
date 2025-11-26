import React from 'react';
// import { useNavigate } from 'react-router-dom'; // (1) เปิดใช้อันนี้ถ้าโปรเจคคุณมี React Router
import styles from './css/ReportDetail.module.css';

// --- Icon Components (SVG) ---
const IconMapPin = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
);

const IconInternalMap = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
);

const IconGoogle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
);

const IconImagePlaceholder = () => (
  <svg width="48" height="48" fill="none" stroke="#D1D5DB" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
);

const ReportDetail = ({ data, onBack }) => {
  // const navigate = useNavigate(); // (1) ถ้าใช้ router

  // Mock Data (ถ้าไม่มี data ส่งมา)
  const info = data || {
    id: "RQ-2023-885",
    title: "ทดสอบไฟฟ้าดับบริเวณทางเดิน",
    rating: 5,
    status: "รอรับเรื่อง",
    locationDetail: "อาคาร 1 > ชั้น 2 > โซนทางเดินทิศใต้ (หน้าลิฟต์ขนของ)",
    lat: null, // ใส่พิกัดจริงตรงนี้ถ้ามี
    lng: null,
    image: null // ใส่ URL รูปตรงนี้
  };

  // --- Functions ---
  
  // ไปหน้า MapView (แผนที่ภายใน)
  const handleInternalMap = () => {
    // เลือกวิธี Nav ตามโครงสร้างโปรเจคของคุณ
    
    // วิธี 1: ถ้าใช้ React Router (แนะนำ)
    // navigate('/MapView'); 

    // วิธี 2: ถ้าเปลี่ยน URL ตรงๆ
    window.location.href = './MapView'; 
  };

  // ไป Google Maps
  const handleGoogleMap = () => {
    // ถ้ามีพิกัด (lat/lng) ให้เปิดตามพิกัด, ถ้าไม่มีให้ Search ตามชื่อสถานที่
    const query = info.lat && info.lng 
      ? `${info.lat},${info.lng}` 
      : encodeURIComponent(info.locationDetail || "แผนที่");
    
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <div className={styles.container}>
      
      {/* ปุ่มย้อนกลับ */}
      {onBack && (
        <button className={styles.backButton} onClick={onBack}>
          <span>←</span> ย้อนกลับ
        </button>
      )}

      {/* === ส่วนบน: ข้อมูลหลัก + รูปภาพ === */}
      <div className={styles.topSection}>
        {/* การ์ดข้อมูล */}
        <div className={`${styles.card} ${styles.infoCard}`}>
          <div>
            <p className={styles.label}>รหัสเรื่อง: {info.id}</p>
            <h2 className={styles.title}>{info.title}</h2>
          </div>
          
          <div>
            <p className={styles.label}>ความเร่งด่วน / คะแนน</p>
            <div className={styles.stars}>
              {'★'.repeat(info.rating)}
              <span style={{color: '#E5E7EB'}}>{'★'.repeat(5 - info.rating)}</span>
            </div>
          </div>

          <div className={styles.statusBadge}>
            <span style={{color: '#6B7280'}}>สถานะ :</span>
            <span>{info.status}</span>
          </div>
        </div>

        {/* การ์ดรูปภาพ */}
        <div className={styles.imageCard}>
          {info.image ? (
            <img src={info.image} alt="Report Issue" className={styles.realImage} />
          ) : (
            <div className={styles.imagePlaceholder}>
              <IconImagePlaceholder />
              <span>ไม่มีรูปภาพแนบ</span>
            </div>
          )}
        </div>
      </div>

      {/* === ส่วนกลาง: ตำแหน่ง + หน่วยงาน === */}
      <div className={styles.middleSection}>
        
        {/* กล่องตำแหน่ง (Location) */}
        <div className={`${styles.card} ${styles.locationCard}`}>
          <div>
            <div className={styles.sectionHeader}>
              <IconMapPin /> ตำแหน่งที่แจ้ง
            </div>
            {/* แสดงข้อความตำแหน่ง */}
            <p className={styles.locationText}>
              {info.locationDetail || "ไม่ระบุรายละเอียดตำแหน่ง"}
            </p>
          </div>

          {/* ปุ่มกด Action */}
          <div className={styles.buttonGroup}>
            <button 
              className={`${styles.actionButton} ${styles.internalMapBtn}`}
              onClick={handleInternalMap}
            >
              <IconInternalMap /> แผนที่ภายใน
            </button>

            <button 
              className={`${styles.actionButton} ${styles.googleMapBtn}`}
              onClick={handleGoogleMap}
            >
              <IconGoogle /> Google Maps
            </button>
          </div>
        </div>

        {/* กล่องหน่วยงาน */}
        <div className={`${styles.card} ${styles.agencyCard}`}>
          <div className={styles.sectionHeader}>หน่วยงานที่เกี่ยวข้อง</div>
          <div style={{ color: '#4B5563', fontSize: '15px', lineHeight: '1.6' }}>
            <ul style={{ paddingLeft: '20px', margin: '0' }}>
              <li>แผนกซ่อมบำรุงทั่วไป</li>
              <li>ฝ่ายอาคารสถานที่</li>
            </ul>
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
