import React, { useState, useMemo, useRef, useEffect } from 'react';
import styles from './css/ReportDetail.module.css';
// --- Icons ---
const IconMapPin = () => (<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>);
const IconInternalMap = () => (<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>);
const IconGoogle = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>);
const IconImagePlaceholder = () => (<svg width="48" height="48" fill="none" stroke="#D1D5DB" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>);
const IconBuilding = () => (<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>);
const IconEdit = () => (<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>);
const IconRefresh = () => (<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>);
const IconCamera = () => (<svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>);
const IconClose = () => (<svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>);

// New Icons for Gallery
const IconGallery = () => (<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>);
const IconPlus = () => (<svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>);
const IconPlay = () => (<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>);

// Timeline Icons
const IconClock = () => (<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>);
const IconCheck = () => (<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>);
const IconArrowRight = () => (<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>);
const IconUsers = () => (<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>);
const IconPhone = () => (<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>);


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

  // --- 2. เปลี่ยน State เริ่มต้นให้ใช้ Mockup Data ---
  const [mediaList, setMediaList] = useState([]);

  // Update Logic States
  const [issueTypeList, setIssueTypeList] = useState([]);
  const [selectedIssueType, setSelectedIssueType] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusComment, setStatusComment] = useState(""); 
    
  // 1. Fetch Issue Types
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

  // 2. Fetch Case Detail
  useEffect(() => {
    const idToFetch = reportId;
    const fetchCaseDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!idToFetch) {
             setLoading(false);
             return;
        }

        const apiUrl = `https://premium-citydata-api-ab.vercel.app/api/crud_case_detail?id=${idToFetch}`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }

        const result = await response.json();
        const lat = result.info.latitude ? parseFloat(result.info.latitude) : null;
        const lng = result.info.longitude ? parseFloat(result.info.longitude) : null;

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
        
        // =======================================================
    // 2. เพิ่มส่วน Fetch Media (ดึงรูปจาก API ใหม่ที่คุณให้มา)
    // =======================================================
    
    // ดึง UUID จากผลลัพธ์รอบแรก (สำคัญมาก: Backend บอกว่าต้องใช้ UUID)
    const caseUUID = result.info.issue_cases_id; 

    if (caseUUID) {
        try {
            // ยิงไปที่ Backend ตัวใหม่
            const mediaRes = await fetch(`https://premium-citydata-api-ab.vercel.app/api/get_url_case_media?case_id=${caseUUID}`);
            
            if (mediaRes.ok) {
                const urlList = await mediaRes.json(); // ได้ค่าเป็น ["url1", "url2", ...]
                
                // Map ข้อมูลให้เข้ากับ UI (ต้องเช็คว่าเป็นรูปหรือวิดีโอจากนามสกุลไฟล์)
                const formattedMedia = urlList.map(url => {
                    // เช็คนามสกุลไฟล์ว่าเป็น video หรือไม่
                    const isVideo = url.match(/\.(mp4|mov|webm|avi)$/i);
                    return {
                        type: isVideo ? 'video' : 'image',
                        url: url
                    };
                });

                setMediaList(formattedMedia);
            } else {
                console.warn("Media fetch failed or empty");
                setMediaList([]); 
            }
        } catch (mediaErr) {
            console.error("Error fetching media:", mediaErr);
            setMediaList([]);
        }
    }
    // =======================================================

    setLoading(false);
      } catch (err) {
        console.error("Error fetching details:", err);
        setError(err.message);
        setLoading(false);
      }
    };
    fetchCaseDetail();
  }, [reportId, refreshKey]);

  // --- 3. ฟังก์ชันจำลองการกดเพิ่มรูป (ยังไม่ทำงานจริง) ---
  const handleAddMediaMock = () => {
    alert("ส่วนนี้เป็น Mockup: ระบบอัปโหลดจริงจะเชื่อมต่อกับ Database ในภายหลัง");
    // ตัวอย่าง: ลองเพิ่มรูป Mockup เข้าไปเล่นๆ เพื่อดู Grid ขยาย
    const newMock = { type: 'image', url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=500&q=60' };
    setMediaList([...mediaList, newMock]);
  };

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

  // Fallback info
  const info = caseInfo || {
    id: "LOADING...", title: "กำลังโหลด...", category: "-", description: "-", rating: 0.0,
    status: "รอรับเรื่อง", locationDetail: "-", lat: null, lng: null, image: null, agency: "-" 
  };

  const [statusValue, setStatusValue] = useState(info.status);
  useEffect(() => { if (showStatusModal) setStatusValue(info.status); }, [showStatusModal, info.status]);

  const getStatusClass = (status = "") => {
    if (!status) return styles.statusDefault;
    if (status.includes('รอ')) return styles.statusPending;
    if (status.includes('ประสาน')) return styles.statusCoordinating;
    if (status.includes('ดำเนินการ')) return styles.statusProgress;
    if (status.includes('เสร็จ')) return styles.statusDone;
    if (status.includes('ส่งต่อ')) return styles.statusForward;
    return styles.statusDefault;
  };

  const getTimelineColor = (status = "") => {
    if (!status) return { text: styles.textDefault, bg: styles.bgDefault };
    if (status.includes('รอ')) return { text: styles.textRed, bg: styles.bgRed };
    if (status.includes('ประสาน')) return { text: styles.textPurple, bg: styles.bgPurple };
    if (status.includes('ดำเนินการ')) return { text: styles.textYellow, bg: styles.bgYellow };
    if (status.includes('เสร็จ')) return { text: styles.textGreen, bg: styles.bgGreen };
    if (status.includes('ส่งต่อ')) return { text: styles.textBlue, bg: styles.bgBlue };
    return { text: styles.textDefault, bg: styles.bgDefault };
  };

  const timelineEvents = useMemo(() => {
    if (!timelineData || timelineData.length === 0) return [];
    return timelineData.map(log => {
        const colorClass = getTimelineColor(log.status);
        
        let dateDisplay = '-';
        let timeDisplay = '-';
        if(log.created_at) {
            const dateObj = new Date(log.created_at);
            if(!isNaN(dateObj)) {
                const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
                dateDisplay = `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${(dateObj.getFullYear() + 543).toString().slice(-2)}`;
                timeDisplay = `${dateObj.getHours()}:${(dateObj.getMinutes()<10?'0':'') + dateObj.getMinutes()} น.`;
            }
        }

        let IconComp = <IconClock />;
        if(log.status && log.status.includes('เสร็จ')) IconComp = <IconCheck />;
        else if(log.status && log.status.includes('ส่งต่อ')) IconComp = <IconArrowRight />;
        else if(log.status && log.status.includes('ประสาน')) IconComp = <IconPhone />;
        else if(log.status && log.status.includes('เชิญ')) IconComp = <IconUsers />;

        return {
            ...log,
            colorClass: colorClass,
            dateDisplay,
            timeDisplay,
            header: `โดย: ${log.changed_by || 'ระบบ'}`,
            icon: IconComp
        };
    });
  }, [timelineData]);

  const handleInternalMap = () => { if (onGoToInternalMap) onGoToInternalMap(); };
  
  const handleGoogleMap = () => {
    const query = (info.lat && info.lng) 
        ? `${info.lat},${info.lng}` 
        : encodeURIComponent(info.locationDetail || "แผนที่");
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedImage(URL.createObjectURL(file));
  };
  const handleRemoveImage = (e) => { e.stopPropagation(); setSelectedImage(null); if(fileInputRef.current) fileInputRef.current.value=''; };

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
                  <p className={styles.label}>รหัสเรื่อง: {info.id}</p>
                  <h2 className={styles.title}>{info.title}</h2>
               </div>
               {/* Badge สีสดใส */}
               <div className={`${styles.statusBadge} ${getStatusClass(info.status)}`}>
                  {info.status}
               </div>
            </div>

            {/* ส่วนรายละเอียด (Description) */}
            <div className={styles.descriptionContainer}>
                <span className={styles.descLabel}>รายละเอียด:</span>
                <p className={styles.descText}>{info.description}</p>
            </div>

            {/* --- Info Boxes (Premium Grid with Icons) --- */}
            <div className={styles.metaGrid}>
                
                {/* Box 1: Category */}
                <div className={styles.metaBox}>
                    <div className={styles.metaHeader}>
                        <div className={`${styles.iconWrapper} ${styles.iconBlue}`}>
                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                        </div>
                        <span className={styles.metaLabel}>หมวดหมู่</span>
                    </div>
                    <span className={styles.metaValue}>
                        {info.category}
                    </span>
                </div>

                {/* Box 2: Rating */}
                <div className={styles.metaBox}>
                    <div className={styles.metaHeader}>
                        <div className={`${styles.iconWrapper} ${styles.iconYellow}`}>
                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <span className={styles.metaLabel}>ความพึงพอใจ</span>
                    </div>
                    <div className={styles.metaValue}>
                        <span className={styles.ratingNumber}>{info.rating.toFixed(1)}</span>
                        <div className={styles.starContainer}>
                            ★★★★★
                            <div className={styles.starFilled} style={{ width: `${(info.rating / 5) * 100}%` }}>
                                ★★★★★
                            </div>
                        </div>
                    </div>
                </div>
            </div>

          </div>
          
          <div className={styles.actionRow}>
             <button className={styles.btnSecondary} onClick={() => setShowTypeModal(true)}>
                <IconEdit /> เปลี่ยนหมวดหมู่
             </button>
             <button className={styles.btnPrimary} onClick={() => setShowStatusModal(true)}>
                <IconRefresh /> อัปเดตสถานะ
             </button>
          </div>
        </div>

        {/* Image Card */}
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

        {/* --- AGENCY SECTION --- */}
        <div className={`${styles.card} ${styles.agencyCard}`}>
            <div className={styles.sectionHeader}>
                <IconBuilding /> หน่วยงานที่รับผิดชอบ
            </div>
            
            <div className={styles.agencyList}>
                {(Array.isArray(info.agency) ? info.agency : [info.agency]).map((agencyName, index) => (
                    <div key={index} className={styles.agencyItem}>
                        <div className={styles.agencyIconBox}>
                            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <span className={styles.agencyName}>
                            {agencyName || "ไม่ระบุหน่วยงาน"}
                        </span>
                        {index === 0 && (
                            <span className={styles.agencyTag}>ผู้รับผิดชอบหลัก</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* ========================================= */}
      {/* NEW SECTION: MEDIA GALLERY (MOCKUP) */}
      {/* ========================================= */}
      <div className={styles.card}>
        <div className={styles.mediaHeader}>
           <div className={styles.mediaTitle}>
             <IconGallery /> รูปภาพและวิดีโอประกอบ (หลักฐานการดำเนินงาน)
           </div>
           {/* แสดงจำนวนรูป */}
           <span style={{fontSize:'13px', color:'#6B7280'}}>{mediaList.length} รายการ</span>
        </div>

        <div className={styles.mediaGrid}>
           {/* Loop แสดงรายการรูปภาพ/วิดีโอ Mockup */}
           {mediaList.map((item, idx) => (
             <div key={idx} className={styles.mediaItem} onClick={() => window.open(item.url, '_blank')}>
                {item.type === 'video' ? (
                  <>
                    <video src={item.url} className={styles.mediaImg} />
                    <div className={styles.videoBadge}><IconPlay /></div>
                  </>
                ) : (
                  <img src={item.url} alt={`evidence-${idx}`} className={styles.mediaImg} />
                )}
             </div>
           ))}

           {/* ปุ่ม Upload + (Mockup Action) */}
           <div className={styles.addMediaBox} onClick={handleAddMediaMock}>
              <IconPlus />
              <span style={{fontSize:'12px', fontWeight:'600', marginTop:'4px'}}>เพิ่มรูป/วิดีโอ</span>
           </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className={`${styles.card} ${styles.bottomSection}`}>
        <div className={styles.sectionHeader}>ติดตามสถานะการดำเนินงาน</div>
        {timelineEvents.length === 0 ? (
            <div style={{padding:'40px', textAlign:'center', color:'#9CA3AF'}}>ยังไม่มีประวัติการดำเนินงาน</div>
        ) : (
            <div className={styles.timelineContainer}>
                {timelineEvents.map((event, index) => (
                    <div key={index} className={styles.timelineRow}>
                        <div className={styles.timeLeft}>
                            <span className={`${styles.statusTitle} ${event.colorClass.text}`}>{event.status}</span>
                            <span className={styles.statusTime}>{event.dateDisplay}<br/>{event.timeDisplay}</span>
                        </div>
                        <div className={styles.timeCenter}>
                            <div className={`${styles.iconCircle} ${event.colorClass.bg}`}>
                                {event.icon}
                            </div>
                            <div className={styles.line}></div>
                        </div>
                        <div className={styles.timeRight}>
                            <div className={styles.mobileHeader}>
                                <span className={`${styles.statusTitle} ${event.colorClass.text}`}>{event.status}</span>
                                <span className={styles.statusTime}>{event.dateDisplay} {event.timeDisplay}</span>
                            </div>
                            <div className={styles.durationText}>{event.header}</div>
                            <div className={styles.detailBody}>{event.detail}</div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* ================= MODALS (POPUP STANDARD) ================= */}

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
            
            <div style={{overflowY:'auto'}}>
                <div className={styles.typeGrid}>
                  {issueTypeList.length === 0 && <p style={{textAlign:'center', color:'#888', gridColumn:'span 3'}}>กำลังโหลด...</p>}
                  {issueTypeList.map((typeItem) => {
                    const isSelected = selectedIssueType 
                          ? selectedIssueType.issue_id === typeItem.issue_id 
                          : info.category === typeItem.name;
                    return (
                        <div key={typeItem.issue_id} 
                            className={`${styles.typeItem} ${isSelected ? styles.selected : ''}`}
                            onClick={() => setSelectedIssueType(typeItem)}
                        >
                        <span style={{fontSize:'24px'}}>📝</span>
                        <span style={{fontSize:'13px', textAlign:'center'}}>{typeItem.name}</span>
                        </div>
                    );
                  })}
                </div>
            </div>

            <div className={styles.modalActions}>
               {/* ปุ่มยืนยัน (สีเขียว) */}
               <button className={styles.btnConfirm} onClick={handleUpdateCategory} disabled={isUpdating}>
                 {isUpdating ? 'กำลังบันทึก...' : 'เปลี่ยน'}
               </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal ปรับสถานะ */}
      {showStatusModal && (
        <div className={styles.modalOverlay} onClick={() => { setShowStatusModal(false); setSelectedImage(null); }}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>ปรับสถานะเรื่องแจ้ง</h3>
              <button className={styles.closeButton} onClick={() => { setShowStatusModal(false); setSelectedImage(null); }}>
                <IconClose />
              </button>
            </div>
            <div style={{overflowY:'auto', display:'flex', flexDirection:'column', gap:'16px'}}>
                <div className={styles.formGroup}>
                   <label className={styles.formLabel}>สถานะเรื่องแจ้ง</label>
                   <select className={styles.formSelect} value={statusValue} onChange={(e) => setStatusValue(e.target.value)}>
                      <option value="รอรับเรื่อง">รอรับเรื่อง</option>
                      <option value="กำลังประสานงาน">กำลังประสานงาน</option>
                      <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                      <option value="เสร็จสิ้น">เสร็จสิ้น</option>
                      <option value="ส่งต่อ">ส่งต่อ</option>
                      <option value="เชิญร่วม">เชิญร่วม</option>
                      <option value="ปฏิเสธ">ปฏิเสธ</option>
                   </select>
                </div>
                
                <div className={styles.formGroup}>
                   <label className={styles.formLabel}>อธิบายเพิ่มเติม</label>
                   <textarea className={styles.formTextarea} rows="3" placeholder="รายละเอียดการดำเนินงาน..." value={statusComment} onChange={(e) => setStatusComment(e.target.value)}></textarea>
                </div>

                <div className={styles.formGroup}>
                   <label className={styles.formLabel}>รูปภาพดำเนินการ</label>
                   <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
                   <div className={styles.uploadBox} onClick={() => fileInputRef.current.click()}>
                      {selectedImage ? (
                        <div style={{position:'relative'}}>
                          <img src={selectedImage} alt="Preview" style={{maxHeight:'150px', maxWidth:'100%', borderRadius:'6px'}} />
                          <button onClick={handleRemoveImage} style={{position:'absolute', top:-10, right:-10, background:'red', color:'white', border:'none', borderRadius:'50%', width:24, height:24, cursor:'pointer'}}>×</button>
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
            <div className={styles.modalActions}>
               {/* ปุ่มยืนยัน (สีเขียว) */}
               <button className={styles.btnConfirm} onClick={handleUpdateStatus} disabled={isUpdating}>
                 {isUpdating ? 'กำลังบันทึก...' : 'ยืนยัน'}
               </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ReportDetail;
