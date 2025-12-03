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

// Timeline Icons
const IconClock = () => (<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>);
const IconPhone = () => (<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>);
const IconWrench = () => (<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>);
const IconCheck = () => (<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>);
const IconArrowRight = () => (<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>);
const IconUsers = () => (<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>);
const IconX = () => (<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>);

const ReportDetail = ({ reportId, onGoToInternalMap }) => {
  
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
    const idToFetch = reportId || "41f97b13-7b67-461f-9db1-37629029da84";

    const fetchCaseDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const apiUrl = `https://premium-citydata-api-ab.vercel.app/api/crud_case_detail?id=${idToFetch}`;
        
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }

        const result = await response.json();
        const lat = parseFloat(result.info.latitude);
        const lng = parseFloat(result.info.longitude);

        const mappedInfo = {
            id: result.info.case_code || result.info.issue_cases_id,
            real_id: result.info.issue_cases_id,
            title: result.info.title || "ไม่มีหัวข้อ",
            category: result.info.issue_category_name || "ทั่วไป",
            
            // ✅ ใช้ parseFloat เพื่อรองรับคะแนนทศนิยม เช่น 4.5
            rating: result.info.rating ? parseFloat(result.info.rating) : 0.0,
            
            status: result.info.status || "รอรับเรื่อง",
            locationDetail: (lat && lng) 
              ? `${lat.toFixed(5)}, ${lng.toFixed(5)}` 
              : (result.info.location_detail || "ไม่ระบุพิกัด"),
            lat: lat,
            lng: lng,
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

  // ==========================================
  // ★ ส่วนที่เพิ่มใหม่: เชื่อมต่อกับ API view.js
  // ==========================================
  useEffect(() => {
    const triggerViewCase = async () => {
        // ต้องรอให้โหลดข้อมูลเคสเสร็จก่อนถึงจะยิง API View
        if (!caseInfo || !caseInfo.real_id) return;

        // ดึง user_id และ organization_id จาก LocalStorage
        const storedUserId = localStorage.getItem("user_id");
        const storedOrgId = localStorage.getItem("organization_id"); // ★ สำคัญ: ต้องมั่นใจว่ามีค่านี้ใน Storage

        if (!storedUserId || !storedOrgId) {
            console.warn("View Tracking: Missing user_id or organization_id in localStorage");
            return;
        }

        try {
            // URL ของ API view.js (เดาโครงสร้างจากไฟล์ที่ให้มาคือ /api/cases/[id]/view)
            const apiUrl = `https://premium-citydata-api-ab.vercel.app/api/cases/${caseInfo.real_id}/view`;

            const response = await fetch(apiUrl, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    organization_id: parseInt(storedOrgId),
                    user_id: parseInt(storedUserId)
                })
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Case View Tracked Successfully:", data);
                
                // หาก API แจ้งว่ามีการเปลี่ยนสถานะ หรือมีการอัปเดตข้อมูล
                // ให้ทำการ Refresh ข้อมูลในหน้าจอใหม่ (เพื่อให้ Timeline ขึ้นว่าดูแล้ว หรือสถานะเปลี่ยนเป็นกำลังประสานงาน)
                // เราจะเช็คคร่าวๆ ว่าถ้าสำเร็จ ก็ให้ Refresh ไปเลยเพื่อความชัวร์
                setRefreshKey(prev => prev + 1);
            } else {
                const errText = await response.text();
                console.error("Failed to track view:", errText);
            }

        } catch (err) {
            console.error("Error calling view API:", err);
        }
    };

    // เรียกฟังก์ชันนี้เฉพาะตอนที่ caseInfo.real_id เปลี่ยน (คือโหลดเสร็จครั้งแรก)
    triggerViewCase();

  }, [caseInfo?.real_id]); 
  // ==========================================


  // 3. Handle Update Category
  const handleUpdateCategory = async () => {
    if (!selectedIssueType || !caseInfo) {
        alert("กรุณาเลือกประเภทปัญหา");
        return;
    }

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

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || errorData.message || 'Update failed');
        }

        setShowTypeModal(false);
        setRefreshKey(prev => prev + 1); 
        alert('เปลี่ยนประเภทปัญหาเรียบร้อยแล้ว');

    } catch (err) {
        alert('เกิดข้อผิดพลาด: ' + err.message);
        console.error("Update Category Error:", err);
    } finally {
        setIsUpdating(false);
    }
  };

  // 4. Handle Update Status
  const handleUpdateStatus = async () => {
    if (!caseInfo) return;

    // --- Image Upload Placeholder ---
    let finalImageUrl = null;
    const file = fileInputRef.current?.files[0];
    if (file) {
        // finalImageUrl = await uploadImage(file);
        console.log("Mock Image Upload: จะต้องมีการอัปโหลดไฟล์จริงเพื่อรับ URL");
    }

    const storedUserId = localStorage.getItem("user_id");
    const currentUserId = storedUserId ? parseInt(storedUserId) : 1;

    try {
        setIsUpdating(true);

        const payload = {
            action: 'update_status',            
            case_id: caseInfo.real_id,          
            user_id: currentUserId,              
            new_status: statusValue,            
            comment: statusComment,             
            image_url: finalImageUrl            
        };

        const response = await fetch('https://premium-citydata-api-ab.vercel.app/api/crud_case_detail', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Update failed');
        }

        alert("ปรับสถานะเรียบร้อยแล้ว");
        setShowStatusModal(false);
        setStatusComment("");       
        setSelectedImage(null);     
        setRefreshKey(prev => prev + 1); 

    } catch (err) {
        console.error("Update Status Error:", err);
        alert("เกิดข้อผิดพลาด: " + err.message);
    } finally {
        setIsUpdating(false);
    }
  };


  // Fallback Data
  const info = caseInfo || {
    id: "LOADING...",
    title: "กำลังโหลด...",
    category: "-",
    rating: 0.0,
    status: "รอรับเรื่อง", 
    locationDetail: "-",
    lat: null, 
    lng: null,
    image: null,
    agency: "-" 
  };

  const [statusValue, setStatusValue] = useState(info.status);
  
  useEffect(() => {
    if (showStatusModal) {
      setStatusValue(info.status);
    }
  }, [showStatusModal, info.status]);

  // --- Helper Functions ---
  const getStatusClass = (status = "") => {
    if (!status) return styles.statusDefault;
    if (status.includes('รอ')) return styles.statusPending;
    if (status.includes('ประสาน')) return styles.statusCoordinating;
    if (status.includes('ดำเนินการ')) return styles.statusProgress;
    if (status.includes('เสร็จ')) return styles.statusDone;
    if (status.includes('ส่งต่อ')) return styles.statusForward;
    if (status.includes('เชิญ')) return styles.statusInvite;
    if (status.includes('ปฏิเสธ')) return styles.statusReject;
    return styles.statusDefault;
  };

  const getTimelineColorType = (status = "") => {
    if (!status) return 'red';
    if (status.includes('รอ')) return 'red';
    if (status.includes('ประสาน')) return 'purple';
    if (status.includes('ดำเนินการ')) return 'yellow';
    if (status.includes('เสร็จ')) return 'green';
    if (status.includes('ส่งต่อ')) return 'blue';
    if (status.includes('เชิญ')) return 'teal';
    if (status.includes('ปฏิเสธ')) return 'dark';
    return 'red';
  };

  const getTimelineIcon = (status = "") => {
    if (!status) return <IconClock />;
    if (status.includes('รอ')) return <IconClock />;
    if (status.includes('ประสาน')) return <IconPhone />;
    if (status.includes('ดำเนินการ')) return <IconWrench />;
    if (status.includes('เสร็จ')) return <IconCheck />;
    if (status.includes('ส่งต่อ')) return <IconArrowRight />;
    if (status.includes('เชิญ')) return <IconUsers />;
    if (status.includes('ปฏิเสธ')) return <IconX />;
    return <IconClock />;
  };

  const formatThaiDateTime = (isoString) => {
    if (!isoString) return { date: '-', time: '-' };
    const dateObj = new Date(isoString);
    if (isNaN(dateObj.getTime())) return { date: '-', time: '-' };

    const day = dateObj.getDate();
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const month = months[dateObj.getMonth()];
    const year = (dateObj.getFullYear() + 543).toString().slice(-2);
    
    let hours = dateObj.getHours();
    let minutes = dateObj.getMinutes();
    minutes = minutes < 10 ? '0' + minutes : minutes;
    
    return { date: `${day} ${month} ${year}`, time: `${hours}:${minutes} น.` };
  };

  const timelineEvents = useMemo(() => {
    if (!timelineData || timelineData.length === 0) return []; 
    return timelineData.map(log => {
        const { date, time } = formatThaiDateTime(log.created_at);
        return {
            type: getTimelineColorType(log.status),
            status: log.status,
            date: date,
            time: time,
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

  if (loading) return <div className={styles.container}><div style={{padding:'40px', textAlign:'center', color: '#6B7280'}}>กำลังโหลดข้อมูล...</div></div>;
  if (error) return (
    <div className={styles.container}>
        <div style={{padding:'40px', textAlign:'center', color:'red'}}>
            เกิดข้อผิดพลาด: {error}
            <br/>
            <button onClick={() => window.location.reload()} style={{marginTop:'10px', padding:'5px 10px'}}>ลองใหม่</button>
        </div>
    </div>
  );

  return (
    <div className={styles.container}>
      
      {/* Top Section */}
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
            <p className={styles.label}>คะแนนความพึงพอใจเฉลี่ย</p>
            
            {/* ✅ ปรับปรุงส่วนแสดงดาว: ใช้ Overlay Technique และสีเหลือง */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              
              {/* Container สำหรับดาว */}
              <div style={{ 
                  position: 'relative', 
                  display: 'inline-block', 
                  fontSize: '1.25rem', 
                  lineHeight: 1,
                  letterSpacing: '2px' 
              }}>
                
                {/* Layer 1 (ล่างสุด): ดาวสีเทาเต็ม 5 ดวง (Background) */}
                <div style={{ color: '#E5E7EB' }}>
                  ★★★★★
                </div>
                
                {/* Layer 2 (บนสุด): ดาวสีเหลือง (Foreground) ตัดขอบตาม % คะแนน */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    whiteSpace: 'nowrap', 
                    overflow: 'hidden',   
                    color: '#FFC107',     // ✨ สีเหลือง (Amber 500)
                    width: `${(info.rating / 5) * 100}%` 
                }}>
                  ★★★★★
                </div>
              </div>

              {/* แสดงตัวเลขคะแนนจริงด้านหลัง */}
              <span style={{ fontSize: '0.9rem', color: '#6B7280', fontWeight: '500' }}>
                  {info.rating > 0 ? info.rating.toFixed(1) : '0.0'} / 5
              </span>

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
          <div className={styles.sectionHeader}><IconBuilding /> หน่วยงานที่เกี่ยวข้อง</div>
          <ul className={styles.agencyList}>
            <li className={styles.agencyItem}>{info.agency}</li>
          </ul>
        </div>
      </div>

      {/* Bottom Section (Timeline) */}
      <div className={`${styles.card} ${styles.bottomSection}`}>
        <div className={styles.sectionHeader}>ติดตามสถานะการดำเนินงาน</div>
        {timelineEvents.length === 0 ? (
            <div style={{padding:'20px', textAlign:'center', color:'#9CA3AF'}}>ยังไม่มีประวัติการดำเนินงาน</div>
        ) : (
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
        )}
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
            
            <div className={styles.modalScrollableContent}>
                <div className={styles.typeGrid}>
                  
                  {issueTypeList.length === 0 && <p style={{textAlign:'center', color:'#888'}}>กำลังโหลดประเภท...</p>}

                  {issueTypeList.map((typeItem) => {
                    const isSelected = selectedIssueType 
                          ? selectedIssueType.issue_id === typeItem.issue_id 
                          : info.category === typeItem.name;

                    return (
                        <div 
                            key={typeItem.issue_id} 
                            className={`${styles.typeItem} ${isSelected ? styles.selected : ''}`}
                            onClick={() => setSelectedIssueType(typeItem)}
                        >
                        <div className={styles.typeCircle}><span>?</span></div>
                        <span className={styles.typeLabel}>{typeItem.name}</span>
                        </div>
                    );
                  })}
                </div>
            </div>

            <div className={styles.modalActions}>
               <button 
                  className={styles.btnConfirm} 
                  onClick={handleUpdateCategory}
                  disabled={isUpdating}
               >
                  {isUpdating ? 'กำลังบันทึก...' : 'เปลี่ยน'}
               </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal ปรับสถานะเรื่องแจ้ง (Update Status) */}
      {showStatusModal && (
        <div className={styles.modalOverlay} onClick={() => { setShowStatusModal(false); setSelectedImage(null); }}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>ปรับสถานะเรื่องแจ้ง</h3>
              <button className={styles.closeButton} onClick={() => { setShowStatusModal(false); setSelectedImage(null); }}>
                <IconClose />
              </button>
            </div>
            <div className={styles.modalScrollableContent}>
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
                   <textarea 
                        className={styles.formTextarea} 
                        placeholder="รายละเอียดการดำเนินงาน..."
                        value={statusComment}
                        onChange={(e) => setStatusComment(e.target.value)}
                    ></textarea>
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
            <div className={styles.modalActions}>
               <button className={styles.btnCancel} onClick={() => { setShowStatusModal(false); setSelectedImage(null); }}>ยกเลิก</button>
               
               <button 
                  className={styles.btnConfirm} 
                  onClick={handleUpdateStatus}
                  disabled={isUpdating}
               >
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
