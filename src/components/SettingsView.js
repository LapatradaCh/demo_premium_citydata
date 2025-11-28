import React, { useState, useRef } from "react";
import styles from "./css/SettingsView.module.css";
import {
  FaMapMarkedAlt, FaCog, FaTimes, FaUnlockAlt, 
  FaSyncAlt, FaEye, FaEyeSlash, FaQrcode, FaLink, FaEdit, FaImage,
  FaCheckCircle, FaPhoneAlt, FaCity, FaRegCopy
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
// 1. ส่วน "ข้อมูลหน่วยงาน" (UPDATED: Add Copy Button)
// ==================================================================================
const AgencySettings = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // State สำหรับซ่อน/แสดงรหัส
  const [showCodes, setShowCodes] = useState({ admin: false, user: false });

  // State สำหรับเก็บรูปภาพ
  const [logoPreview, setLogoPreview] = useState(null); 
  const fileInputRef = useRef(null); 

  const [formData, setFormData] = useState({
    name: "เทศบาลตำบลตัวอย่าง",
    adminCode: "AL1F8H2",
    userCode: "US9K2M4",
    agencyType: "เทศบาล",
    province: "เชียงใหม่",
    district: "เมือง",
    subDistrict: "สุเทพ",
    phone: "089-999-9999",
  });

  const handleChange = (field, value) => { setFormData({ ...formData, [field]: value }); };

  // ฟังก์ชันสลับสถานะตา (เปิด/ปิดรหัส)
  const toggleCode = (key) => {
    setShowCodes(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // ฟังก์ชันคัดลอกรหัส
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert(`คัดลอกรหัส "${text}" เรียบร้อยแล้ว`);
  };

  // จัดการรูปภาพ
  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setLogoPreview(imageUrl);
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
                    </select>
                </div>

                {/* Group 2: รหัส */}
                <div className={styles.agencyDivider}></div>
                <div className={styles.agencySectionTitle}><FaUnlockAlt/> รหัสเข้าร่วม</div>
                <div className={styles.agencyRow2}>
                      <div className={styles.agencyFormGroup}>
                        <label className={styles.agencyLabel}>Admin Code</label>
                        <input className={styles.agencyInputCode} value={formData.adminCode} onChange={(e)=>handleChange('adminCode', e.target.value)} />
                      </div>
                      <div className={styles.agencyFormGroup}>
                        <label className={styles.agencyLabel}>User Code</label>
                        <input className={styles.agencyInputCode} value={formData.userCode} onChange={(e)=>handleChange('userCode', e.target.value)} />
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
            <button className={styles.agencyBtnSave} onClick={() => setIsEditModalOpen(false)}>บันทึกข้อมูล</button>
        </div>
      </div>
    </>
  );

  // --- VIEW MODE ---
  return (
    <>
        <div className={styles.agencyViewContainer}>
            <div className={styles.agencyProfileCard}>
                <div className={styles.agencyProfileLeft}>
                    <div className={styles.agencyLogoCircle}>
                        {logoPreview ? <img src={logoPreview} alt="Logo" className={styles.uploadedLogo} /> : <FaImage/>}
                    </div>
                    <div>
                        <h2 className={styles.agencyOrgName}>{formData.name}</h2>
                        <div className={styles.agencyBadges}>
                            <span className={styles.agencyBadgeType}><FaCity style={{fontSize:10}}/> {formData.agencyType}</span>
                        </div>
                    </div>
                </div>
                <button className={styles.agencyBtnEditWarning} onClick={() => setIsEditModalOpen(true)}>
                    <FaEdit /> แก้ไขข้อมูล
                </button>
            </div>

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
                            {/* ปุ่มตา */}
                            <button className={styles.iconBtnEye} onClick={() => toggleCode('admin')} title="แสดง/ซ่อน">
                                {showCodes.admin ? <FaEye /> : <FaEyeSlash />}
                            </button>
                            {/* ปุ่มคัดลอก (Copy) */}
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
                            {/* ปุ่มตา */}
                            <button className={styles.iconBtnEye} onClick={() => toggleCode('user')} title="แสดง/ซ่อน">
                                {showCodes.user ? <FaEye /> : <FaEyeSlash />}
                            </button>
                            {/* ปุ่มคัดลอก (Copy) */}
                            <button className={styles.iconBtnCopy} onClick={() => handleCopy(formData.userCode)} title="คัดลอกรหัส">
                                <FaRegCopy />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Info Box 2: Address */}
                <div className={styles.agencyInfoBox}>
                    <div className={styles.agencyBoxHeader}><FaMapMarkedAlt style={{color:'#198754'}}/> พื้นที่รับผิดชอบ</div>
                    <div className={styles.agencyDataRow}><span>ที่อยู่:</span> <span>ต.{formData.subDistrict} อ.{formData.district} จ.{formData.province}</span></div>
                    <div className={styles.agencyDataRow}><span>โทรศัพท์:</span> <span style={{color:'#057a55', fontWeight:'bold'}}>{formData.phone}</span></div>
                </div>
            </div>
        </div>
        {isEditModalOpen && <AgencyEditModal />}
    </>
  );
};

// ==================================================================================
// 2-4. หน้าอื่นๆ (Map, QR)
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
          <option>xxxx (ทั้งหมด)</option>
          <option>xxxx ไฟฟ้า/ประปา</option>
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

// Main View
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
          <select value={activeSetting} onChange={(e) => setActiveSetting(e.target.value)}>
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
