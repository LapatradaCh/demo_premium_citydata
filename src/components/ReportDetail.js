import React, { useState, useMemo, useRef, useEffect } from 'react';
import styles from './css/ReportDetail.module.css';

// --- Icons (คงเดิม) ---
const IconMapPin = () => (<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>);
const IconInternalMap = () => (<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>);
const IconGoogle = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>);
const IconImagePlaceholder = () => (<svg width="48" height="48" fill="none" stroke="#D1D5DB" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>);
const IconBuilding = () => (<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>);
const IconEdit = () => (<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>);
const IconRefresh = () => (<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>);
const IconCamera = () => (<svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>);
const IconClose = () => (<svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>);

// Timeline Icons (คงเดิม)
const IconClock = () => (<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>);
const IconPhone = () => (<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>);
const IconWrench = () => (<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>);
const IconCheck = () => (<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>);
const IconArrowRight = () => (<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>);
const IconUsers = () => (<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>);
const IconX = () => (<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>);

const ReportDetail = ({ data, onGoToInternalMap }) => {
  // Modal States
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  
  // States for Image Upload
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  // --- Parse Data from Backend ---
  // Backend returns: { info: {...}, timeline: [...] }
  const rawInfo = data?.info || {};
  const rawTimeline = data?.timeline || [];

  // Map Backend Fields to UI Fields
  const info = {
    // ใช้ issue_cases_id จาก Backend
    id: rawInfo.issue_cases_id || "N/A",
    // เดาชื่อ field จาก DB ทั่วไป (ปรับตามจริงถ้าชื่อ field ใน DB ไม่ใช่ issue_topic)
    title: rawInfo.issue_topic || rawInfo.title || "ไม่ระบุหัวข้อ", 
    category: rawInfo.issue_type || rawInfo.category || "ทั่วไป",
    rating: rawInfo.urgency_level || 0, // สมมติชื่อ field
    status: rawInfo.status || "รอรับเรื่อง", 
    locationDetail: rawInfo.location_name || rawInfo.locationDetail || "ไม่ระบุตำแหน่ง",
    lat: rawInfo.lat || null, 
    lng: rawInfo.lng || null,
    image: rawInfo.photo_url || rawInfo.image || null 
  };

  const [statusValue, setStatusValue] = useState(info.status);
  
  useEffect(() => {
    if (showStatusModal) {
      setStatusValue(info.status);
    }
  }, [showStatusModal, info.status]);

  // --- Helper Functions ---
  const getStatusClass = (status) => {
    const s = status || "";
    if (s.includes('รอ')) return styles.statusPending;
    if (s.includes('ประสาน')) return styles.statusCoordinating;
    if (s.includes('ดำเนินการ')) return styles.statusProgress;
    if (s.includes('เสร็จ')) return styles.statusDone;
    if (s.includes('ส่งต่อ')) return styles.statusForward;
    if (s.includes('เชิญ')) return styles.statusInvite;
    if (s.includes('ปฏิเสธ')) return styles.statusReject;
    return styles.statusDefault;
  };

  const getTimelineColorType = (status) => {
    const s = status || "";
    if (s.includes('รอ')) return 'red';
    if (s.includes('ประสาน')) return 'purple';
    if (s.includes('ดำเนินการ')) return 'yellow';
    if (s.includes('เสร็จ')) return 'green';
    if (s.includes('ส่งต่อ')) return 'blue';
    if (s.includes('เชิญ')) return 'teal';
    if (s.includes('ปฏิเสธ')) return 'dark';
    return 'red';
  };

  const getTimelineIcon = (status) => {
    const s = status || "";
    if (s.includes('รอ')) return <IconClock />;
    if (s.includes('ประสาน')) return <IconPhone />;
    if (s.includes('ดำเนินการ')) return <IconWrench />;
    if (s.includes('เสร็จ')) return <IconCheck />;
    if (s.includes('ส่งต่อ')) return <IconArrowRight />;
    if (s.includes('เชิญ')) return <IconUsers />;
    if (s.includes('ปฏิเสธ')) return <IconX />;
    return <IconClock />;
  };

  // Function แปลงวันที่จาก Backend String (ISO/Timestamp)
  const formatDateTime = (dateString) => {
    if (!dateString) return { date: '-', time: '-' };
    const dateObj = new Date(dateString);
    
    // แปลงเป็น พ.ศ. และภาษาไทย
    const day = dateObj.getDate();
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const month = months[dateObj.getMonth()];
    const year = (dateObj.getFullYear() + 543).toString().slice(-2);
    
    let hours = dateObj.getHours();
    let minutes = dateObj.getMinutes();
    minutes = minutes < 10 ? '0' + minutes : minutes;
    
    return { 
        date: `${day} ${month} ${year}`, 
        time: `${hours}:${minutes} น.` 
    };
  };

  // --- Real Timeline Logic ---
  // ใช้ rawTimeline จาก Backend แทน Mock Data
  const timelineEvents = useMemo(() => {
    if (!rawTimeline || rawTimeline.length === 0) {
      // Fallback ถ้าไม่มีข้อมูล Timeline
      return [{
          type: getTimelineColorType(info.status), 
          status: info.status, 
          date: '-', time: '-',
          header: 'สถานะปัจจุบัน', 
          detail: 'ยังไม่มีประวัติการดำเนินการ', 
          icon: getTimelineIcon(info.status)
      }];
    }

    // Map ข้อมูลจาก Backend -> Frontend Timeline
    return rawTimeline.map((log) => {
        const { date, time } = formatDateTime(log.created_at);
        return {
            type: getTimelineColorType(log.status),
            status: log.status,
            date: date,
            time: time,
            header: log.changed_by ? `ดำเนินการโดย: ${log.changed_by}` : 'อัปเดตระบบ', // แสดงชื่อผู้ทำถ้ามี
            detail: log.detail, // ข้อความที่ Backend เตรียมมาให้แล้ว (เช่น "เปลี่ยนสถานะจาก...")
            icon: getTimelineIcon(log.status)
        };
    });
  }, [rawTimeline, info.status]);

  const handleInternalMap = () => { if (onGoToInternalMap) onGoToInternalMap(); };
  const handleGoogleMap = () => {
    const query = info.lat && info.lng ? `${info.lat},${info.lng}` : encodeURIComponent(info.locationDetail || "แผนที่");
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  // --- Image Upload Handlers ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation(); 
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; 
    }
  };

  // Mock Data สำหรับ Dropdown
  const problemTypes = ["ไฟฟ้า", "ประปา", "ถนน", "ความสะอาด", "จราจร", "เสียงรบกวน", "น้ำท่วม", "ต้นไม้", "อื่นๆ"];

  return (
    <div className={styles.container}>
      
      {/* 1. Top Section */}
      <div className={styles.topSection}>
        <div className={`${styles.card} ${styles.infoCard}`}>
          <div>
            <p className={styles.label}>รหัสเรื่อง: {info.id}</p>
            <h2 className={styles.title}>{info.title}</h2>
            <div className={styles.categoryText}>
               <span>ประเภท: {info.category}</span>
            </div>
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

          <div className={styles.actionRow}>
             <button className={styles.editButton} onClick={() => setShowTypeModal(true)}>
                <IconEdit /> เปลี่ยนประเภท
             </button>
             <button className={styles.editButton} onClick={() => setShowStatusModal(true)}>
                <IconRefresh /> ปรับสถานะ
             </button>
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
            <p className={styles.locationText}>{info.locationDetail}</p>
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

      {/* 3. Bottom Section - TIMELINE REAL DATA */}
      <div className={`${styles.card} ${styles.bottomSection}`}>
        <div className={styles.sectionHeader}>ติดตามสถานะการดำเนินงาน</div>
        <div className={styles.timelineContainer}>
          {timelineEvents.map((event, index) => {
            let colorTitleClass = styles.textRed;
            let colorBgClass = styles.bgRed;
            switch(event.type) {
               case 'blue': colorTitleClass = styles.textBlue; colorBgClass = styles.bgBlue; break;
               case 'green': colorTitleClass = styles.textGreen; colorBgClass = styles.bgGreen; break;
               case 'yellow': colorTitleClass = styles.textYellow; colorBgClass = styles.bgYellow; break;
               case 'purple': colorTitleClass = styles.textPurple; colorBgClass = styles.bgPurple; break;
               case 'teal': colorTitleClass = styles.textTeal; colorBgClass = styles.bgTeal; break;
               case 'dark': colorTitleClass = styles.textDark; colorBgClass = styles.bgDark; break;
               default: colorTitleClass = styles.textRed; colorBgClass = styles.bgRed;
            }

            return (
              <div key={index} className={styles.timelineRow}>
                <div className={styles.timeLeft}>
                  <span className={`${styles.statusTitle} ${colorTitleClass}`}>{event.status}</span>
                  <span className={styles.statusTime}>{event.date}</span>
                  <span className={styles.statusTime}>{event.time}</span>
                </div>
                <div className={styles.timeCenter}>
                  <div className={`${styles.iconCircle} ${colorBgClass}`}>{event.icon}</div>
                  <div className={styles.line}></div>
                </div>
                <div className={styles.timeRight}>
                  <div className={styles.mobileHeader}>
                      <span className={`${styles.statusTitle} ${colorTitleClass}`}>{event.status}</span>
                      <span className={styles.statusTime}>{event.date} {event.time}</span>
                  </div>
                  <div className={styles.durationText}>{event.header}</div>
                  <div className={styles.detailBody}>{event.detail}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= MODALS ================= */}
      
      {/* 1. Modal เปลี่ยนประเภทปัญหา */}
      {showTypeModal && (
        <div className={styles.modalOverlay} onClick={() => setShowTypeModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>เปลี่ยนประเภทปัญหา</h3>
              <button className={styles.closeButton} onClick={() => setShowTypeModal(false)}>
                <IconClose />
              </button>
            </div>
            
            {/* Wrapper สำหรับ Scroll */}
            <div className={styles.modalScrollableContent}>
                <div className={styles.typeGrid}>
                  {problemTypes.map((type, index) => (
                    <div key={index} className={`${styles.typeItem} ${index === 0 ? styles.selected : ''}`}>
                      <div className={styles.typeCircle}>
                        <span>?</span> 
                      </div>
                      <span className={styles.typeLabel}>{type}</span>
                    </div>
                  ))}
                </div>
            </div>

            <div className={styles.modalActions}>
               <button className={styles.btnConfirm} onClick={() => setShowTypeModal(false)}>เปลี่ยน</button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal ปรับสถานะเรื่องแจ้ง */}
      {showStatusModal && (
        <div className={styles.modalOverlay} onClick={() => {
            setShowStatusModal(false);
            setSelectedImage(null);
          }}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            
            {/* HEADER */}
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>ปรับสถานะเรื่องแจ้ง</h3>
              <button className={styles.closeButton} onClick={() => {
                  setShowStatusModal(false);
                  setSelectedImage(null);
                }}>
                <IconClose />
              </button>
            </div>
            
            {/* BODY */}
            <div className={styles.modalScrollableContent}>
                <div className={styles.formGroup}>
                   <label className={styles.formLabel}>สถานะเรื่องแจ้ง</label>
                   <select 
                      className={styles.formSelect} 
                      value={statusValue} 
                      onChange={(e) => setStatusValue(e.target.value)}
                    >
                      <option value="รอรับเรื่อง">รอรับเรื่อง</option>
                      <option value="กำลังประสาน">กำลังประสาน</option>
                      <option value="ดำเนินการ">ดำเนินการ</option>
                      <option value="เสร็จสิ้น">เสร็จสิ้น</option>
                      <option value="ส่งต่อ">ส่งต่อ</option>
                      <option value="เชิญร่วม">เชิญร่วม</option>
                      <option value="ปฏิเสธ">ปฏิเสธ</option>
                    </select>
                </div>

                <div className={styles.formGroup}>
                   <label className={styles.formLabel}>อธิบายเพิ่มเติม</label>
                   <textarea className={styles.formTextarea} placeholder="รายละเอียดการดำเนินงาน..."></textarea>
                </div>

                <div className={styles.formGroup}>
                   <label className={styles.formLabel}>รูปภาพดำเนินการ</label>
                   <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
                   <div className={styles.uploadBox} onClick={triggerFileInput}>
                      {selectedImage ? (
                        <div className={styles.previewWrapper}>
                          <img src={selectedImage} alt="Preview" className={styles.imagePreview} />
                          <button className={styles.removePreviewBtn} onClick={handleRemoveImage}>×</button>
                        </div>
                      ) : (
                        <>
                          <IconCamera />
                          <span>แนบรูปภาพ</span>
                        </>
                      )}
                   </div>
                </div>
            </div>

            {/* FOOTER */}
            <div className={styles.modalActions}>
               <button className={styles.btnCancel} onClick={() => {
                   setShowStatusModal(false);
                   setSelectedImage(null); 
                 }}>ยกเลิก</button>
               <button className={styles.btnConfirm} onClick={() => {
                   setShowStatusModal(false);
                   setSelectedImage(null); 
                 }}>ยืนยัน</button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
};

export default ReportDetail;
