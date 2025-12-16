import React, { useState, useMemo, useRef, useEffect } from 'react';
import styles from './css/ReportDetail.module.css';

// --- Icons (Minimalist Thin Stroke) ---
const IconMapPin = () => (<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>);
const IconInternalMap = () => (<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>);
const IconGoogle = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>);
const IconImagePlaceholder = () => (<svg width="48" height="48" fill="none" stroke="#D1D5DB" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>);
const IconBuilding = () => (<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>);
const IconEdit = () => (<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>);
const IconRefresh = () => (<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>);
const IconCamera = () => (<svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>);
const IconClose = () => (<svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>);

// Timeline Icons
const IconClock = () => (<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>);
const IconPhone = () => (<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>);
const IconWrench = () => (<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>);
const IconCheck = () => (<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>);
const IconArrowRight = () => (<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>);
const IconUsers = () => (<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>);
const IconX = () => (<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>);

const ReportDetail = ({onGoToInternalMap }) => {
  const reportId = localStorage.getItem("selectedCaseId");
    
  // Data States
  const [caseInfo, setCaseInfo] = useState(null);
  const [timelineData, setTimelineData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0); 

  // Modal & Input States
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  // Update Logic States
  const [issueTypeList, setIssueTypeList] = useState([]);
  const [selectedIssueType, setSelectedIssueType] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusComment, setStatusComment] = useState(""); 
    
  useEffect(() => {
    const fetchIssueTypes = async () => {
      try {
        const res = await fetch('https://premium-citydata-api-ab.vercel.app/api/get_issue_types');
        if (res.ok) {
          const data = await res.json();
          setIssueTypeList(data);
        }
      } catch (err) {
        console.error("Failed to load issue types:", err);
      }
    };
    fetchIssueTypes();
  }, []);

  useEffect(() => {
    const idToFetch = reportId;
    const fetchCaseDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const apiUrl = `https://premium-citydata-api-ab.vercel.app/api/crud_case_detail?id=${idToFetch}`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`Server responded with status: ${response.status}`);

        const result = await response.json();
        const lat = parseFloat(result.info.latitude);
        const lng = parseFloat(result.info.longitude);

        const mappedInfo = {
            id: result.info.case_code || result.info.issue_cases_id,
            real_id: result.info.issue_cases_id,
            title: result.info.title || "ไม่มีหัวข้อ",
            category: result.info.issue_category_name || "ทั่วไป",
            description: result.info.description || "-", 
            rating: result.info.rating ? parseFloat(result.info.rating) : 0.0,
            status: result.info.status || "รอรับเรื่อง",
            locationDetail: (lat && lng) ? `${lat.toFixed(5)}, ${lng.toFixed(5)}` : (result.info.location_detail || "ไม่ระบุพิกัด"),
            lat: lat, lng: lng,
            image: result.info.cover_image_url || null,
            agency: result.info.agency_name || "ไม่ระบุหน่วยงาน"
        };
        setCaseInfo(mappedInfo);
        setTimelineData(result.timeline || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching details:", err);
        setError(err.message);
        setLoading(false);
      }
    };
    fetchCaseDetail();
  }, [reportId, refreshKey]);

  // Update Category Function
  const handleUpdateCategory = async () => {
    if (!selectedIssueType || !caseInfo) { alert("กรุณาเลือกประเภทปัญหา"); return; }
    const storedUserId = localStorage.getItem("user_id");
    const currentUserId = storedUserId ? parseInt(storedUserId) : 1;

    try {
        setIsUpdating(true);
        const response = await fetch('https://premium-citydata-api-ab.vercel.app/api/crud_case_detail', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'update_category', 
                case_id: caseInfo.real_id,
                new_type_id: selectedIssueType.issue_id,
                new_type_name: selectedIssueType.name,
                old_type_name: caseInfo.category,
                user_id: currentUserId 
            })
        });
        if (!response.ok) throw new Error('Update failed');
        setShowTypeModal(false);
        setRefreshKey(prev => prev + 1); 
        alert('เปลี่ยนประเภทปัญหาเรียบร้อยแล้ว');
    } catch (err) {
        alert('เกิดข้อผิดพลาด: ' + err.message);
    } finally {
        setIsUpdating(false);
    }
  };

  // Update Status Function
  const handleUpdateStatus = async () => {
    if (!caseInfo) return;
    // Mock Image Upload logic would go here
    let finalImageUrl = null;
    const storedUserId = localStorage.getItem("user_id");
    const currentUserId = storedUserId ? parseInt(storedUserId) : 1;

    try {
        setIsUpdating(true);
        const response = await fetch('https://premium-citydata-api-ab.vercel.app/api/crud_case_detail', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'update_status',            
                case_id: caseInfo.real_id,           
                user_id: currentUserId,              
                new_status: statusValue,             
                comment: statusComment,              
                image_url: finalImageUrl             
            })
        });
        if (!response.ok) throw new Error('Update failed');
        alert("ปรับสถานะเรียบร้อยแล้ว");
        setShowStatusModal(false);
        setStatusComment("");        
        setSelectedImage(null);      
        setRefreshKey(prev => prev + 1); 

    } catch (err) {
        alert("เกิดข้อผิดพลาด: " + err.message);
    } finally {
        setIsUpdating(false);
    }
  };

  const info = caseInfo || {
    id: "LOADING...", title: "กำลังโหลด...", category: "-", description: "-", rating: 0.0,
    status: "รอรับเรื่อง", locationDetail: "-", lat: null, lng: null, image: null, agency: "-" 
  };

  const [statusValue, setStatusValue] = useState(info.status);
  useEffect(() => { if (showStatusModal) setStatusValue(info.status); }, [showStatusModal, info.status]);

  // Styling Helpers
  const getStatusClass = (status = "") => {
    if (!status) return styles.statusDefault;
    if (status.includes('รอ')) return styles.statusPending;
    if (status.includes('ประสาน')) return styles.statusCoordinating;
    if (status.includes('ดำเนินการ')) return styles.statusProgress;
    if (status.includes('เสร็จ')) return styles.statusDone;
    return styles.statusDefault;
  };

  const getTimelineIcon = (status = "") => {
    if (!status) return <IconClock />;
    if (status.includes('เสร็จ')) return <IconCheck />;
    if (status.includes('ส่งต่อ')) return <IconArrowRight />;
    return <IconClock />;
  };

  const formatThaiDateTime = (isoString) => {
    if (!isoString) return { date: '-', time: '-' };
    const dateObj = new Date(isoString);
    if (isNaN(dateObj.getTime())) return { date: '-', time: '-' };
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    return { 
        date: `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${(dateObj.getFullYear() + 543).toString().slice(-2)}`, 
        time: `${dateObj.getHours()}:${(dateObj.getMinutes()<10?'0':'') + dateObj.getMinutes()} น.` 
    };
  };

  const timelineEvents = useMemo(() => {
    if (!timelineData || timelineData.length === 0) return []; 
    return timelineData.map(log => {
        const { date, time } = formatThaiDateTime(log.created_at);
        return {
            status: log.status,
            date: date, time: time,
            header: `โดย: ${log.changed_by || 'ระบบ'}`, 
            detail: log.detail,
            icon: getTimelineIcon(log.status)
        };
    });
  }, [timelineData]);

  const handleInternalMap = () => { if (onGoToInternalMap) onGoToInternalMap(); };
  const handleGoogleMap = () => {
    const query = info.lat && info.lng ? `${info.lat},${info.lng}` : encodeURIComponent(info.locationDetail || "แผนที่");
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedImage(URL.createObjectURL(file));
  };

  if (loading) return <div className={styles.container}><div style={{padding:'40px', textAlign:'center', color: '#6B7280'}}>กำลังโหลดข้อมูล...</div></div>;
  if (error) return (<div className={styles.container}><div style={{textAlign:'center', color:'red'}}>เกิดข้อผิดพลาด: {error}</div></div>);

  return (
    <div className={styles.container}>
       
      {/* Top Section */}
      <div className={styles.topSection}>
        <div className={`${styles.card} ${styles.infoCard}`}>
          <div>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                <div>
                    <p className={styles.label}>CASE ID: {info.id}</p>
                    <h2 className={styles.title}>{info.title}</h2>
                </div>
                <div className={`${styles.statusBadge} ${getStatusClass(info.status)}`}>
                    {info.status}
                </div>
            </div>

            <div className={styles.metaRow}>
                <div className={styles.metaItem}>
                    <span style={{fontSize:'13px', color:'#9CA3AF'}}>หมวดหมู่</span>
                    <span style={{fontWeight:'600'}}>{info.category}</span>
                </div>
                <div className={styles.metaItem}>
                     <span style={{fontSize:'13px', color:'#9CA3AF'}}>ความพึงพอใจ</span>
                     <div style={{display:'flex', alignItems:'center', gap:'4px'}}>
                        <span style={{color: info.rating > 0 ? '#000' : '#E5E7EB', fontSize:'18px'}}>
                           {'★'.repeat(Math.round(info.rating))}{'☆'.repeat(5 - Math.round(info.rating))}
                        </span>
                        <span style={{fontSize:'14px', fontWeight:'600'}}>{info.rating.toFixed(1)}</span>
                     </div>
                </div>
            </div>
            
            <div className={styles.descriptionBox}>
                <p style={{margin:0}}>{info.description}</p>
            </div>
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

      {/* Middle Section */}
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
          <div className={styles.sectionHeader}><IconBuilding /> หน่วยงานรับผิดชอบ</div>
          <ul className={styles.agencyList}>
            <li className={styles.agencyItem}>{info.agency}</li>
          </ul>
        </div>
      </div>

      {/* Bottom Section (Timeline) */}
      <div className={`${styles.card} ${styles.bottomSection}`}>
        <div className={styles.sectionHeader}>ประวัติการดำเนินงาน</div>
        {timelineEvents.length === 0 ? (
            <div style={{padding:'40px', textAlign:'center', color:'#9CA3AF'}}>ยังไม่มีประวัติการดำเนินงาน</div>
        ) : (
            <div className={styles.timelineContainer}>
            {timelineEvents.map((event, index) => (
                <div key={index} className={styles.timelineRow}>
                    <div className={styles.timeLeft}>
                        <span className={styles.statusTitle}>{event.status}</span>
                        <span className={styles.statusTime}>{event.date}<br/>{event.time}</span>
                    </div>
                    <div className={styles.timeCenter}>
                        <div className={styles.iconCircle}>{event.icon}</div>
                        <div className={styles.line}></div>
                    </div>
                    <div className={styles.timeRight}>
                        <div className={styles.mobileHeader}>
                            <span className={styles.statusTitle}>{event.status}</span>
                            <span className={styles.statusTime}>{event.date} {event.time}</span>
                        </div>
                        <div className={styles.durationText}>{event.header}</div>
                        <div className={styles.detailBody}>{event.detail}</div>
                    </div>
                </div>
            ))}
            </div>
        )}
      </div>

      {/* Modals (Type & Status) - Code remains functionally same but classes updated in CSS */}
      {showTypeModal && (
        <div className={styles.modalOverlay} onClick={() => setShowTypeModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>เปลี่ยนประเภทปัญหา</h3>
              <button className={styles.closeButton} onClick={() => setShowTypeModal(false)}><IconClose /></button>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr', gap:'8px', maxHeight:'300px', overflowY:'auto'}}>
                {issueTypeList.map((typeItem) => (
                    <div key={typeItem.issue_id} 
                         onClick={() => setSelectedIssueType(typeItem)}
                         style={{
                             padding:'12px', borderRadius:'8px', cursor:'pointer', border:'1px solid',
                             borderColor: selectedIssueType?.issue_id === typeItem.issue_id ? '#000' : '#E5E7EB',
                             backgroundColor: selectedIssueType?.issue_id === typeItem.issue_id ? '#F3F4F6' : '#fff'
                         }}>
                        {typeItem.name}
                    </div>
                ))}
            </div>
            <div style={{display:'flex', gap:'12px', marginTop:'16px'}}>
               <button className={styles.btnConfirm} onClick={handleUpdateCategory} disabled={isUpdating}>
                 {isUpdating ? 'บันทึก...' : 'ยืนยันการเปลี่ยน'}
               </button>
            </div>
          </div>
        </div>
      )}

      {showStatusModal && (
        <div className={styles.modalOverlay} onClick={() => { setShowStatusModal(false); setSelectedImage(null); }}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>ปรับสถานะ</h3>
              <button className={styles.closeButton} onClick={() => { setShowStatusModal(false); setSelectedImage(null); }}><IconClose /></button>
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
                <div>
                   <label className={styles.formLabel}>สถานะ</label>
                   <select className={styles.formSelect} value={statusValue} onChange={(e) => setStatusValue(e.target.value)}>
                      <option value="รอรับเรื่อง">รอรับเรื่อง</option>
                      <option value="กำลังประสานงาน">กำลังประสานงาน</option>
                      <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                      <option value="เสร็จสิ้น">เสร็จสิ้น</option>
                      <option value="ส่งต่อ">ส่งต่อ</option>
                      <option value="ปฏิเสธ">ปฏิเสธ</option>
                   </select>
                </div>
                <div>
                   <label className={styles.formLabel}>รายละเอียด</label>
                   <textarea className={styles.formTextarea} rows="3" placeholder="ระบุรายละเอียด..." value={statusComment} onChange={(e) => setStatusComment(e.target.value)}></textarea>
                </div>
                <div>
                    <label className={styles.formLabel}>รูปภาพ</label>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{display:'none'}}/>
                    <div onClick={() => fileInputRef.current.click()} style={{
                        border:'1px dashed #9CA3AF', borderRadius:'8px', padding:'20px', textAlign:'center', cursor:'pointer', backgroundColor:'#F9FAFB'
                    }}>
                        {selectedImage ? <img src={selectedImage} style={{maxHeight:'100px'}} alt="preview"/> : <span style={{color:'#6B7280'}}>+ แนบรูปภาพ</span>}
                    </div>
                </div>
            </div>
            <div style={{display:'flex', gap:'12px', marginTop:'8px'}}>
               <button className={styles.btnCancel} onClick={() => setShowStatusModal(false)}>ยกเลิก</button>
               <button className={styles.btnConfirm} onClick={handleUpdateStatus} disabled={isUpdating}>{isUpdating ? 'บันทึก...' : 'ยืนยัน'}</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ReportDetail;
