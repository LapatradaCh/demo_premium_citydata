import React, { useMemo } from 'react'; // เพิ่ม useMemo เพื่อคำนวณเวลาแค่ครั้งเดียวตอนโหลด
import styles from './css/ReportDetail.module.css';

// --- Icon Components ---
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
const IconBack = () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
);
const IconBuilding = () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
);
const IconArrowRight = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
);
const IconClock = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
);

const ReportDetail = ({ data, onBack, onGoToInternalMap }) => {
  
  const info = data || {
    id: "RQ-TEST-001",
    title: "ทดสอบไฟฟ้าดับ",
    rating: 0,
    status: "รอรับเรื่อง",
    locationDetail: "ไม่ระบุตำแหน่ง",
    lat: null, 
    lng: null,
    image: null 
  };

  // --- 🕒 ฟังก์ชันคำนวณวันและเวลาไทย (Real-time) ---
  const getDateTime = (offsetMinutes = 0) => {
    const now = new Date();
    // ปรับเวลาตาม offset (เช่น -10 นาที)
    const targetDate = new Date(now.getTime() + (offsetMinutes * 60000));

    // วันที่แบบไทยย่อ (เช่น 26 พ.ย. 68)
    const day = targetDate.getDate();
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const month = months[targetDate.getMonth()];
    const year = (targetDate.getFullYear() + 543).toString().slice(-2); // เอาแค่ 2 ตัวท้าย

    // เวลา (เช่น 08:56 น.)
    let hours = targetDate.getHours();
    let minutes = targetDate.getMinutes();
    minutes = minutes < 10 ? '0' + minutes : minutes;

    return {
      date: `${day} ${month} ${year}`,
      time: `${hours}:${minutes} น.`
    };
  };

  // ใช้ useMemo เพื่อให้ค่าเวลาคงที่ ไม่เปลี่ยนไปมาทุกครั้งที่ re-render เล็กน้อย
  const timelineEvents = useMemo(() => {
    const now = getDateTime(0);         // เวลาปัจจุบัน
    const past = getDateTime(-10);      // เวลา 10 นาทีที่แล้ว

    return [
      {
        type: 'blue',
        status: 'ส่งต่อ',
        date: now.date,   // 📅 วันที่ปัจจุบัน
        time: now.time,   // 🕒 เวลาปัจจุบัน
        header: 'xxxxxxxxxxxxxx', 
        detail: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 
        icon: <IconArrowRight />
      },
      {
        type: 'red',
        status: 'รอรับเรื่อง',
        date: past.date,  // 📅 วันที่ 10 นาทีก่อน
        time: past.time,  // 🕒 เวลา 10 นาทีก่อน
        header: 'xxxxxxxxxxxxxxxxxxxx', 
        detail: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
        xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
        xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`, 
        icon: <IconClock />
      }
    ];
  }, []);

  const handleInternalMap = () => {
    if (onGoToInternalMap) onGoToInternalMap();
  };

  const handleGoogleMap = () => {
    const query = info.lat && info.lng 
      ? `${info.lat},${info.lng}` 
      : encodeURIComponent(info.locationDetail || "แผนที่");
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <div className={styles.container}>
      
      {/* 1. Top Section */}
      <div className={styles.topSection}>
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

      {/* 2. Middle Section */}
      <div className={styles.middleSection}>
        <div className={`${styles.card} ${styles.locationCard}`}>
          <div>
            <div className={styles.sectionHeader}><IconMapPin /> ตำแหน่งที่แจ้ง</div>
            <p className={styles.locationText}>{info.locationDetail || "ไม่ระบุรายละเอียดตำแหน่ง"}</p>
          </div>
          <div className={styles.buttonGroup}>
            <button className={`${styles.actionButton} ${styles.internalMapBtn}`} onClick={handleInternalMap}>
              <IconInternalMap /> แผนที่ภายใน
            </button>
            <button className={`${styles.actionButton} ${styles.googleMapBtn}`} onClick={handleGoogleMap}>
              <IconGoogle /> Google Maps
            </button>
          </div>
        </div>

        <div className={`${styles.card} ${styles.agencyCard}`}>
          <div className={styles.sectionHeader}><IconBuilding /> หน่วยงานที่เกี่ยวข้อง</div>
          <ul className={styles.agencyList}>
            <li className={styles.agencyItem}>แผนกซ่อมบำรุงทั่วไป</li>
          </ul>
        </div>
      </div>

      {/* 3. Bottom Section: Timeline */}
      <div className={`${styles.card} ${styles.bottomSection}`}>
        <div className={styles.sectionHeader}>ติดตามสถานะการดำเนินงาน</div>
        
        <div className={styles.timelineContainer}>
          {timelineEvents.map((event, index) => (
            <div key={index} className={styles.timelineRow}>
              
              {/* Left: Time & Status */}
              <div className={styles.timeLeft}>
                <span className={`${styles.statusTitle} ${event.type === 'blue' ? styles.textBlue : styles.textRed}`}>
                  {event.status}
                </span>
                <span className={styles.statusTime}>{event.date}</span>
                <span className={styles.statusTime}>{event.time}</span>
              </div>

              {/* Center: Icon & Line */}
              <div className={styles.timeCenter}>
                <div className={`${styles.iconCircle} ${event.type === 'blue' ? styles.bgBlue : styles.bgRed}`}>
                  {event.icon}
                </div>
                <div className={styles.line}></div>
              </div>

              {/* Right: Details */}
              <div className={styles.timeRight}>
                
                {/* Mobile Header */}
                <div className={styles.mobileHeader}>
                   <span className={`${styles.statusTitle} ${event.type === 'blue' ? styles.textBlue : styles.textRed}`}>
                    {event.status}
                  </span>
                   <span className={styles.statusTime}>{event.date} {event.time}</span>
                </div>

                {event.type === 'blue' ? (
                   <div className={styles.durationText}>{event.header}</div>
                ) : (
                   <div className={styles.detailTitle}>{event.header}</div>
                )}
                
                <div className={styles.detailBody}>
                  {event.detail}
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* 4. Back Button (สีแดง) */}
      {onBack && (
        <button className={styles.centerBackButton} onClick={onBack}>
          <IconBack /> ย้อนกลับ
        </button>
      )}

    </div>
  );
};

export default ReportDetail;
