import React, { useMemo } from 'react';
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

// --- Timeline Icons ---
const IconClock = () => ( // รอรับเรื่อง
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
);
const IconPhone = () => ( // กำลังประสาน
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
);
const IconWrench = () => ( // ดำเนินการ
    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
);
const IconCheck = () => ( // เสร็จสิ้น
    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
);
const IconArrowRight = () => ( // ส่งต่อ
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
);
const IconUsers = () => ( // เชิญร่วม
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
);
const IconX = () => ( // ปฏิเสธ
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
);

const ReportDetail = ({ data, onBack, onGoToInternalMap }) => {
  
  const info = data || {
    id: "RQ-TEST-001",
    title: "ทดสอบไฟฟ้าดับ",
    rating: 0,
    status: "รอรับเรื่อง", // 🔴 ลองเปลี่ยนเป็นสถานะอื่น จะเห็น Timeline ขึ้น 2 อัน
    locationDetail: "ไม่ระบุตำแหน่ง",
    lat: null, 
    lng: null,
    image: null 
  };

  // Logic 1: เลือกสีป้ายสถานะ (Badges)
  const getStatusClass = (status) => {
    if (status.includes('รอ')) return styles.statusPending;
    if (status.includes('ประสาน')) return styles.statusCoordinating;
    if (status.includes('ดำเนินการ')) return styles.statusProgress;
    if (status.includes('เสร็จ')) return styles.statusDone;
    if (status.includes('ส่งต่อ')) return styles.statusForward;
    if (status.includes('เชิญ')) return styles.statusInvite;
    if (status.includes('ปฏิเสธ')) return styles.statusReject;
    return styles.statusDefault;
  };

  // Logic 2: เลือกสีเส้น Timeline
  const getTimelineColorType = (status) => {
    if (status.includes('รอ')) return 'red';
    if (status.includes('ประสาน')) return 'purple';
    if (status.includes('ดำเนินการ')) return 'yellow';
    if (status.includes('เสร็จ')) return 'green';
    if (status.includes('ส่งต่อ')) return 'blue';
    if (status.includes('เชิญ')) return 'teal';
    if (status.includes('ปฏิเสธ')) return 'dark';
    return 'red';
  };

  // Logic 3: เลือกไอคอน Timeline
  const getTimelineIcon = (status) => {
    if (status.includes('รอ')) return <IconClock />;
    if (status.includes('ประสาน')) return <IconPhone />;
    if (status.includes('ดำเนินการ')) return <IconWrench />;
    if (status.includes('เสร็จ')) return <IconCheck />;
    if (status.includes('ส่งต่อ')) return <IconArrowRight />;
    if (status.includes('เชิญ')) return <IconUsers />;
    if (status.includes('ปฏิเสธ')) return <IconX />;
    return <IconClock />;
  };

  // Logic 4: เวลา Real-time
  const getDateTime = (offsetMinutes = 0) => {
    const now = new Date();
    const targetDate = new Date(now.getTime() + (offsetMinutes * 60000));
    const day = targetDate.getDate();
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const month = months[targetDate.getMonth()];
    const year = (targetDate.getFullYear() + 543).toString().slice(-2);
    let hours = targetDate.getHours();
    let minutes = targetDate.getMinutes();
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return {
      date: `${day} ${month} ${year}`,
      time: `${hours}:${minutes} น.`
    };
  };

  // ✅ Timeline Logic: ถ้า "รอรับเรื่อง" โชว์อันเดียว, ถ้าอื่น โชว์ 2 อัน
  const timelineEvents = useMemo(() => {
    const now = getDateTime(0);
    const past = getDateTime(-10);

    // รายการล่าสุด (แสดงเสมอ)
    const latestItem = {
      type: getTimelineColorType(info.status), 
      status: info.status, 
      date: now.date,
      time: now.time,
      header: 'xxxxxxxxxxxxxx', 
      detail: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 
      icon: getTimelineIcon(info.status)
    };

    // รายการประวัติ (แสดงเฉพาะเมื่อสถานะ *ไม่ใช่* รอรับเรื่อง)
    const historyItem = {
      type: 'red',
      status: 'รอรับเรื่อง', 
      date: past.date,
      time: past.time,
      header: 'xxxxxxxxxxxxxxxxxxxx', 
      detail: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
      xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`, 
      icon: <IconClock />
    };

    // Logic ตรวจสอบเงื่อนไข
    if (info.status === 'รอรับเรื่อง') {
      return [latestItem]; // โชว์แค่อันเดียว
    } else {
      return [latestItem, historyItem]; // โชว์ล่าสุด + ประวัติ
    }

  }, [info.status]);

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
          
          <div className={`${styles.statusBadge} ${getStatusClass(info.status)}`}>
            <span>สถานะ :</span>
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
          {timelineEvents.map((event, index) => {
            
            // Logic เลือก Class สีของ Timeline ตาม type
            let colorTitleClass = styles.textRed;
            let colorBgClass = styles.bgRed;
            
            if (event.type === 'blue') { colorTitleClass = styles.textBlue; colorBgClass = styles.bgBlue; }
            else if (event.type === 'green') { colorTitleClass = styles.textGreen; colorBgClass = styles.bgGreen; }
            else if (event.type === 'yellow') { colorTitleClass = styles.textYellow; colorBgClass = styles.bgYellow; }
            else if (event.type === 'purple') { colorTitleClass = styles.textPurple; colorBgClass = styles.bgPurple; }
            else if (event.type === 'teal') { colorTitleClass = styles.textTeal; colorBgClass = styles.bgTeal; }
            else if (event.type === 'dark') { colorTitleClass = styles.textDark; colorBgClass = styles.bgDark; }

            return (
              <div key={index} className={styles.timelineRow}>
                <div className={styles.timeLeft}>
                  <span className={`${styles.statusTitle} ${colorTitleClass}`}>
                    {event.status}
                  </span>
                  <span className={styles.statusTime}>{event.date}</span>
                  <span className={styles.statusTime}>{event.time}</span>
                </div>
                <div className={styles.timeCenter}>
                  <div className={`${styles.iconCircle} ${colorBgClass}`}>
                    {event.icon}
                  </div>
                  <div className={styles.line}></div>
                </div>
                <div className={styles.timeRight}>
                  <div className={styles.mobileHeader}>
                     <span className={`${styles.statusTitle} ${colorTitleClass}`}>
                      {event.status}
                    </span>
                     <span className={styles.statusTime}>{event.date} {event.time}</span>
                  </div>
                  <div className={styles.durationText}>{event.header}</div>
                  <div className={styles.detailBody}>
                    {event.detail}
                  </div>
                </div>
              </div>
            );
          })}
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
