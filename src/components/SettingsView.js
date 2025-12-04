import React, { useState, useRef, useEffect } from "react";
// ตรวจสอบ path ของ css ให้ถูกต้องตามโปรเจ็คของคุณ
import styles from "./css/SettingsView.module.css"; 
import {
  FaMapMarkedAlt, FaCog, FaTimes, FaUnlockAlt, 
  FaSyncAlt, FaEye, FaEyeSlash, FaQrcode, FaLink, FaEdit, FaImage,
  FaCheckCircle, FaPhoneAlt, FaCity, FaRegCopy, FaSpinner
} from "react-icons/fa";

// ------------------------------------------------------------------
// --- Helper Components ---
// ------------------------------------------------------------------
const MockToggle = () => (
  <label className={styles.mockToggle}>
    <input type="checkbox" />
    <span className={styles.mockSlider}></span>
  </label>
);

// ==================================================================================
// 1. ส่วน "ข้อมูลหน่วยงาน" (Main Logic)
// ==================================================================================
const AgencySettings = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // State สำหรับซ่อน/แสดงรหัส
  const [showCodes, setShowCodes] = useState({ admin: false, user: false });

  // State สำหรับเก็บรูปภาพ (Preview)
  const [logoPreview, setLogoPreview] = useState(null); 
  const fileInputRef = useRef(null); 

  // State ข้อมูลหลัก
  const [formData, setFormData] = useState({
    organization_id: null, 
    name: "",
    adminCode: "",
    userCode: "",
    agencyType: "เทศบาล",
    province: "",
    district: "",
    subDistrict: "",
    phone: "",
    url_logo: ""
  });

  // --- API 1: Fetch Data on Mount (ดึงข้อมูลเมื่อโหลดหน้าเว็บ) ---
  useEffect(() => {
    fetchOrganizationData();
  }, []);

  const fetchOrganizationData = async () => {
    try {
      setIsLoading(true);
      
      // [IMPORTANT]: ในระบบจริง คุณต้องดึง ID นี้มาจาก User Session / Auth Context
      // สำหรับ Demo นี้ ผมจะ hardcode เป็น '1' (หรือ id ที่คุณมีใน DB)
      // หรือลองดึงจาก localStorage ถ้าคุณเก็บไว้ตอน Login
      const currentOrgId = localStorage.getItem('current_org_id') || '1'; 
      
      // เรียก API GET
      const response = await fetch(`/api/organizations?id=${currentOrgId}`);
      
      if (!response.ok) {
        if (response.status === 404) throw new Error("ไม่พบข้อมูลหน่วยงาน (กรุณาเช็ค ID)");
        throw new Error("Failed to fetch data");
      }
      
      const data = await response.json();

      // Map ข้อมูลจาก Database -> State ของ React
      setFormData({
        organization_id: data.organization_id,
        name: data.organization_name || "",
        adminCode: data.admin_code || "",
        userCode: data.organization_code || "", // userCode คือ organization_code ใน DB
        agencyType: data.org_type_id || "เทศบาล",
        province: data.province || "",
        district: data.district || "",
        subDistrict: data.sub_district || "",
        phone: data.contact_phone || "",
        url_logo: data.url_logo || ""
      });

      // ถ้ามี URL รูปเดิม ให้แสดง
      if (data.url_logo) {
        setLogoPreview(data.url_logo);
      }

    } catch (error) {
      console.error("Error loading data:", error);
      // alert("ไม่สามารถโหลดข้อมูลได้: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- API 2: Update Data (บันทึกข้อมูลแก้ไข) ---
  const handleSaveChanges = async () => {
    try {
      if (!formData.organization_id) {
        alert("ไม่พบ ID หน่วยงาน ไม่สามารถบันทึกได้");
        return;
      }

      // เตรียม Payload ให้ตรงกับที่ Backend ต้องการ
      const payload = {
        organization_id: formData.organization_id,
        organization_name: formData.name,
        org_type_id: formData.agencyType,
        district: formData.district,
        sub_district: formData.subDistrict,
        province: formData.province,
        contact_phone: formData.phone,
        url_logo: formData.url_logo 
        // หมายเหตุ: การอัปโหลดไฟล์รูปภาพจริงๆ ต้องทำแยก (Upload -> ได้ URL -> ส่ง URL มาเก็บ)
        // ใน Code นี้จะส่ง URL เดิมกลับไปก่อน
      };

      const response = await fetch('/api/organizations', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Update failed");
      }

      // อัปเดตสำเร็จ
      const updatedData = await response.json();
      alert("บันทึกข้อมูลเรียบร้อยแล้ว");
      setIsEditModalOpen(false);
      
      // ดึงข้อมูลใหม่เพื่อให้แน่ใจว่าหน้าจออัปเดตล่าสุด
      fetchOrganizationData();

    } catch (error) {
      console.error("Save Error:", error);
      alert("เกิดข้อผิดพลาดในการบันทึก: " + error.message);
    }
  };

  // --- Handlers ทั่วไป ---
  const handleChange = (field, value) => { 
      setFormData({ ...formData, [field]: value }); 
  };

  const toggleCode = (key) => {
    setShowCodes(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    alert(`คัดลอกรหัส "${text}" เรียบร้อยแล้ว`);
  };

  // จัดการการเลือกไฟล์รูปภาพ (Client Preview Only)
  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // 1. สร้าง URL ชั่วคราวเพื่อแสดงผล
      const imageUrl = URL.createObjectURL(file);
      setLogoPreview(imageUrl);

      // 2. TODO: ตรงนี้คุณต้องเพิ่ม Logic การ Upload ไฟล์ไปยัง Server (เช่น AWS S3 / Firebase)
      // const uploadUrl = await uploadService(file);
      // handleChange('url_logo', uploadUrl);
      
      // *ชั่วคราว*: แจ้งเตือนว่ายังไม่ได้ทำระบบ Upload
      console.warn("File selected but upload logic is missing.");
    }
  };

  // --- POPUP EDIT MODAL ---
  const AgencyEditModal = () => (
    <>
      <div className={styles.agencyModalBackdrop} onClick={() => setIsEditModalOpen(false)} />
      <div className={styles.agencyModalContainer}>
        {/* Header */}
        <div className={styles.agencyModalHeader}>
            <h3 className={styles.agencyModalTitle}>แก้ไขข้อมูลหน่วยงาน</h3>
            <button className={styles.agencyBtnCloseRed} onClick={() => setIsEditModalOpen(false)}>
                <FaTimes />
            </button>
        </div>
        
        <div className={styles.agencyModalBody}>
             {/* ส่วนอัปโหลดรูปภาพ */}
             <div className={styles.agencyImageSection}>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    style={{ display: "none" }} 
                    accept="image/*"
                    onChange={handleFileChange}
                />
                <div className={styles.agencyImageCircle} onClick={handleImageClick}>
                    {logoPreview ? (
                        <img src={logoPreview} alt="Logo" className={styles.uploadedLogo} />
                    ) : (
                        <FaImage size={32} color="#ccc"/>
                    )}
                    <div className={styles.agencyEditOverlay}><FaEdit/></div>
                </div>
                <span className={styles.agencyHint}>แตะเพื่อเปลี่ยนโลโก้</span>
             </div>

             {/* ฟอร์มข้อมูล */}
             <div className={styles.agencyFormContainer}>
                
                {/* Group 1: ข้อมูลทั่วไป */}
                <div className={styles.agencySectionTitle}>ข้อมูลทั่วไป</div>
                <div className={styles.agencyFormGroup}>
                    <label className={styles.agencyLabel}>ชื่อหน่วยงาน</label>
                    <input className={styles.agencyInput} value={formData.name} onChange={(e)=>handleChange('name', e.target.value)} />
                </div>
                
                <div className={styles.agencyFormGroup}>
                    <label className={styles.agencyLabel}>ประเภทหน่วยงาน <span className={styles.req}>*</span></label>
                    <select className={styles.agencyInput} value={formData.agencyType} onChange={(e)=>handleChange('agencyType', e.target.value)}>
                        <option value="เทศบาล">เทศบาล</option>
                        <option value="อบต">อบต.</option>
                        <option value="สำนักงานเขต">สำนักงานเขต</option>
                        <option value="หน่วยงานเอกชน">หน่วยงานเอกชน</option>
                    </select>
                </div>

                {/* Group 2: รหัส (Read Only) */}
                <div className={styles.agencyDivider}></div>
                <div className={styles.agencySectionTitle}><FaUnlockAlt/> รหัสเข้าร่วม (แก้ไขไม่ได้)</div>
                <div className={styles.agencyRow2}>
                      <div className={styles.agencyFormGroup}>
                        <label className={styles.agencyLabel}>Admin Code</label>
                        <input className={styles.agencyInputCode} value={formData.adminCode} disabled style={{background: '#f0f0f0', color: '#999'}} />
                      </div>
                      <div className={styles.agencyFormGroup}>
                        <label className={styles.agencyLabel}>User Code</label>
                        <input className={styles.agencyInputCode} value={formData.userCode} disabled style={{background: '#f0f0f0', color: '#999'}} />
                      </div>
                </div>

                {/* Group 3: ที่อยู่ */}
                <div className={styles.agencyDivider}></div>
                <div className={styles.agencySectionTitle}><FaMapMarkedAlt/> ที่อยู่และติดต่อ</div>
                
                <div className={styles.agencyAddressGrid}>
                    <div className={styles.agencyFormGroup}>
                        <label className={styles.agencyLabel}>จังหวัด</label>
                        <input className={styles.agencyInput} value={formData.province} onChange={(e)=>handleChange('province', e.target.value)} />
                    </div>
                    <div className={styles.agencyFormGroup}>
                        <label className={styles.agencyLabel}>อำเภอ/เขต</label>
                        <input className={styles.agencyInput} value={formData.district} onChange={(e)=>handleChange('district', e.target.value)} />
                    </div>
                    <div className={styles.agencyFormGroup}>
                        <label className={styles.agencyLabel}>ตำบล/แขวง</label>
                        <input className={styles.agencyInput} value={formData.subDistrict} onChange={(e)=>handleChange('subDistrict', e.target.value)} />
                    </div>
                </div>

                <div className={styles.agencyFormGroup} style={{marginTop: 10}}>
                    <label className={styles.agencyLabel}>เบอร์โทรศัพท์ติดต่อ <span className={styles.req}>*</span></label>
                    <div style={{position:'relative'}}>
                        <FaPhoneAlt style={{position:'absolute', left:12, top:13, color:'#999', fontSize:12}}/>
                        <input className={styles.agencyInput} style={{paddingLeft: 35}} value={formData.phone} onChange={(e)=>handleChange('phone', e.target.value)} />
                    </div>
                </div>

             </div>
        </div>

        <div className={styles.agencyModalFooter}>
            <button className={styles.agencyBtnCancel} onClick={() => setIsEditModalOpen(false)}>ยกเลิก</button>
            <button className={styles.agencyBtnSave} onClick={handleSaveChanges}>บันทึกข้อมูล</button>
        </div>
      </div>
    </>
  );

  // --- LOADING STATE ---
  if (isLoading) {
    return (
        <div className={styles.loadingContainer} style={{padding: 50, textAlign:'center', color: '#666'}}>
            <FaSpinner className="icon-spin" style={{ animation: 'spin 1s linear infinite', fontSize: 24, marginBottom: 10 }} /> 
            <div>กำลังโหลดข้อมูล...</div>
            <style>{`@keyframes spin { 100% { -webkit-transform: rotate(360deg); transform:rotate(360deg); } }`}</style>
        </div>
    );
  }

  // --- VIEW MODE ---
  return (
    <>
        <div className={styles.agencyViewContainer}>
            {/* Card Header Profile */}
            <div className={styles.agencyProfileCard}>
                <div className={styles.agencyProfileHeader}>
                    <div className={styles.agencyLogoCircle}>
                        {logoPreview ? <img src={logoPreview} alt="Logo" className={styles.uploadedLogo} /> : <FaImage style={{color:'#ccc'}}/>}
                    </div>
                    <div>
                        <h2 className={styles.agencyOrgName}>{formData.name || "ยังไม่ระบุชื่อหน่วยงาน"}</h2>
                        <div className={styles.agencyBadges}>
                            <span className={styles.agencyBadgeType}><FaCity style={{fontSize:10}}/> {formData.agencyType}</span>
                        </div>
                    </div>
                </div>
                
                <button className={styles.agencyBtnEditWarning} onClick={() => setIsEditModalOpen(true)}>
                    <FaEdit /> แก้ไขข้อมูล
                </button>
            </div>

            {/* Info Grid */}
            <div className={styles.agencyInfoGrid}>
                {/* Info Box 1: Codes */}
                <div className={styles.agencyInfoBox}>
                    <div className={styles.agencyBoxHeader}><FaUnlockAlt style={{color:'#0d6efd'}}/> รหัสเข้าร่วมองค์กร</div>
                    
                    {/* Admin Code Row */}
                    <div className={styles.agencyDataRow}>
                        <span>Admin:</span> 
                        <div className={styles.codeRevealGroup}>
                            <strong className={styles.agencyCodeFont}>
                                {showCodes.admin ? formData.adminCode : "******"}
                            </strong>
                            <button className={styles.iconBtnEye} onClick={() => toggleCode('admin')} title="แสดง/ซ่อน">
                                {showCodes.admin ? <FaEye /> : <FaEyeSlash />}
                            </button>
                            <button className={styles.iconBtnCopy} onClick={() => handleCopy(formData.adminCode)} title="คัดลอกรหัส">
                                <FaRegCopy />
                            </button>
                        </div>
                    </div>

                    {/* User Code Row */}
                    <div className={styles.agencyDataRow}>
                        <span>User:</span> 
                        <div className={styles.codeRevealGroup}>
                            <strong className={styles.agencyCodeFont}>
                                {showCodes.user ? formData.userCode : "******"}
                            </strong>
                            <button className={styles.iconBtnEye} onClick={() => toggleCode('user')} title="แสดง/ซ่อน">
                                {showCodes.user ? <FaEye /> : <FaEyeSlash />}
                            </button>
                            <button className={styles.iconBtnCopy} onClick={() => handleCopy(formData.userCode)} title="คัดลอกรหัส">
                                <FaRegCopy />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Info Box 2: Address */}
                <div className={styles.agencyInfoBox}>
                    <div className={styles.agencyBoxHeader}><FaMapMarkedAlt style={{color:'#198754'}}/> พื้นที่รับผิดชอบ</div>
                    <div className={styles.agencyDataRow}>
                        <span>ที่อยู่:</span> 
                        <span>
                           {formData.subDistrict || "-"} {formData.district || "-"} {formData.province || "-"}
                        </span>
                    </div>
                    <div className={styles.agencyDataRow}>
                        <span>โทรศัพท์:</span> 
                        <span style={{color:'#057a55', fontWeight:'bold'}}>{formData.phone || "-"}</span>
                    </div>
                </div>
            </div>
        </div>
        
        {/* Render Modal */}
        {isEditModalOpen && <AgencyEditModal />}
    </>
  );
};

// ==================================================================================
// 2-4. หน้าอื่นๆ (Map, QR) - ส่วนนี้ยังเป็น Mockup
// ==================================================================================
const MapSettingsContent = () => (
  <div className={styles.settingsSection}>
    <h3 className={styles.settingsTitle}>
      <FaMapMarkedAlt style={{ marginRight: "10px", color: "#6c757d" }} /> ตั้งค่าแผนที่
    </h3>
    <p className={styles.settingsSubtitle}>ตั้งค่าการแสดงผลของแผนที่สาธารณะสำหรับประชาชน</p>
    <div className={styles.settingsItem} style={{ borderBottom: "none" }}>
      <div className={styles.settingsItemText}><span>แผนที่สาธารณะ (เปิด/ปิด)</span></div>
      <MockToggle />
    </div>
  </div>
);

const QRUnitSettingsContent = () => (
  <div className={styles.settingsSection}>
    <h3 className={styles.settingsTitle}>QRCode ประจำหน่วยงาน</h3>
    <p className={styles.settingsSubtitle}>ใช้ QR Code นี้สำหรับแชร์ให้ประชาชนทั่วไป</p>
    <div className={styles.qrCodePlaceholder}>
      <FaQrcode className={styles.mockQrIcon} />
      <span>(Mockup QR Code)</span>
    </div>
    <button className={styles.filterApplyButton} style={{ width: "100%" }}>ดาวน์โหลด QR Code</button>
  </div>
);

const QRCreateSettingsContent = () => (
  <div className={styles.settingsSection}>
    <h3 className={styles.settingsTitle}>สร้าง QR Code เอง</h3>
    <p className={styles.settingsSubtitle}>สร้าง QR Code เพื่อลิงก์ไปยังประเภทปัญหาที่กำหนดเอง</p>
    <form className={styles.qrForm} onSubmit={(e)=>e.preventDefault()}>
      <div className={styles.filterGroup}>
        <label>เลือกประเภทปัญหา</label>
        <select>
          <option>ทั้งหมด</option>
          <option>ไฟฟ้า/ประปา</option>
          <option>ถนน/ทางเท้า</option>
          <option>ความสะอาด</option>
        </select>
      </div>
      <div className={styles.filterGroup}>
        <label><FaLink /> ชื่อลิงก์ (ไม่บังคับ)</label>
        <input type="text" placeholder="เช่น 'qr-ไฟดับ-โซนA'" className={styles.searchInput} />
      </div>
      <button className={styles.filterApplyButton}>สร้าง QR Code</button>
    </form>
    <div className={styles.qrCodePlaceholder} style={{ marginTop: "20px" }}>
      <span>(QR Code ที่สร้างจะแสดงที่นี่)</span>
    </div>
  </div>
);

// ==================================================================================
// MAIN VIEW CONTAINER
// ==================================================================================
const SettingsView = () => {
  const settingsOptions = [
    { id: "ข้อมูลหน่วยงาน", label: "ข้อมูลหน่วยงาน" },
    { id: "แผนที่", label: "ตั้งค่าแผนที่" },
    { id: "qrหน่วยงาน", label: "QRCode หน่วยงาน" },
    { id: "qrสร้างเอง", label: "QRCode สร้างเอง" },
  ];

  const [activeSetting, setActiveSetting] = useState(settingsOptions[0].id);

  const renderSettingContent = () => {
    switch (activeSetting) {
      case "ข้อมูลหน่วยงาน": return <AgencySettings />;
      case "แผนที่": return <MapSettingsContent />;
      case "qrหน่วยงาน": return <QRUnitSettingsContent />;
      case "qrสร้างเอง": return <QRCreateSettingsContent />;
      default: return null;
    }
  };

  return (
    <div className={styles.settingsContainer}>
      <div className={styles.settingsHeaderDropdown}>
        <div className={styles.filterGroup}>
          <label style={{paddingLeft:4, marginBottom:8, display:'flex', alignItems:'center', gap:8, fontWeight:700, fontSize:15}}>
            <FaCog /> เมนูตั้งค่าระบบ
          </label>
          <select 
             value={activeSetting} 
             onChange={(e) => setActiveSetting(e.target.value)}
             className={styles.settingsSelect} // เพิ่ม class ให้ select
          >
            {settingsOptions.map((opt) => (<option key={opt.id} value={opt.id}>{opt.label}</option>))}
          </select>
        </div>
      </div>
      <div className={styles.settingsContentArea}>
        {renderSettingContent()}
      </div> 
    </div>
  );
};

export default SettingsView;
