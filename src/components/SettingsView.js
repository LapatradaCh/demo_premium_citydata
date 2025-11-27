import React, { useState } from "react";
import styles from "./css/SettingsView.module.css";
import {
  FaCog, FaTimes, FaUnlockAlt, FaEdit, FaImage,
  FaCheckCircle, FaBuilding, FaMapMarkedAlt, FaChevronDown,
  FaMapMarkerAlt, FaUserCog, FaUserTie, FaSyncAlt, FaEye, FaEyeSlash,
  FaQrcode, FaLink
} from "react-icons/fa";

// --- Components ย่อย ---
const MockToggle = () => (
    <label className={styles.mockToggle}>
      <input type="checkbox" />
      <span className={styles.mockSlider}></span>
    </label>
);

// ------------------------------------------------------------------
// --- ส่วนที่ 1: ข้อมูลหน่วยงาน (Agency) ---
// ------------------------------------------------------------------
const AgencySettings = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "เทศบาลตำบลตัวอย่าง",
    adminCode: "AL1F8H2",
    userCode: "US9K2M4",
    agencyType: "เทศบาล",
    usageType: "full",
    province: "เชียงใหม่",
    district: "เมือง",
    subDistrict: "สุเทพ",
    phone: "089-999-9999",
  });

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  // --- POPUP EDIT MODAL (แก้ไขใหม่: เอาปุ่ม copy/ดึงตำแหน่งออก จัด input สวยๆ) ---
  const AgencyEditModal = () => (
    <>
      <div className={styles.modalBackdrop} onClick={() => setIsEditModalOpen(false)} />
      <div className={styles.modalContainer}>
        <div className={styles.modalHeader}>
            <h3>แก้ไขข้อมูลหน่วยงาน</h3>
            <button className={styles.btnClose} onClick={() => setIsEditModalOpen(false)}><FaTimes/></button>
        </div>
        
        <div className={styles.modalBody}>
             {/* 1. รูปภาพ */}
             <div className={styles.imageUploadSection}>
                <div className={styles.imageCircle}>
                    <FaImage size={32} color="#ccc"/>
                    <div className={styles.editIconOverlay}><FaEdit/></div>
                </div>
                <span className={styles.hintText}>รูปภาพโลโก้ (Max 5MB)</span>
             </div>

             {/* Grid Layout: แบ่งซ้ายขวา */}
             <div className={styles.editGridMain}>
                
                {/* คอลัมน์ซ้าย: ข้อมูลทั่วไป */}
                <div className={styles.editColumn}>
                    <h4 className={styles.sectionTitle}><FaBuilding/> ข้อมูลทั่วไป</h4>
                    
                    <div className={styles.formGroup}>
                        <label>ชื่อหน่วยงาน</label>
                        <input type="text" className={styles.input} value={formData.name} onChange={(e)=>handleChange('name', e.target.value)} />
                    </div>

                    <div className={styles.rowTwo}>
                        <div className={styles.formGroup}>
                            <label>ประเภท <span className={styles.req}>*</span></label>
                            <select className={styles.input} value={formData.agencyType} onChange={(e)=>handleChange('agencyType', e.target.value)}>
                                <option value="เทศบาล">เทศบาล</option>
                                <option value="อบต">อบต.</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>สถานะ <span className={styles.req}>*</span></label>
                            <select className={styles.input} value={formData.usageType} onChange={(e)=>handleChange('usageType', e.target.value)}>
                                <option value="full">เต็มรูปแบบ</option>
                            </select>
                        </div>
                    </div>

                    <h4 className={styles.sectionTitle} style={{marginTop: 20}}><FaUnlockAlt/> แก้ไขรหัสเข้าใช้งาน</h4>
                    <div className={styles.rowTwo}>
                         <div className={styles.formGroup}>
                            <label>Admin Code</label>
                            <input type="text" className={styles.inputCode} value={formData.adminCode} onChange={(e)=>handleChange('adminCode', e.target.value)} />
                         </div>
                         <div className={styles.formGroup}>
                            <label>User Code</label>
                            <input type="text" className={styles.inputCode} value={formData.userCode} onChange={(e)=>handleChange('userCode', e.target.value)} />
                         </div>
                    </div>
                </div>

                {/* คอลัมน์ขวา: ที่อยู่ (ไม่มีปุ่มดึงตำแหน่งแล้ว) */}
                <div className={styles.editColumn}>
                    <h4 className={styles.sectionTitle}><FaMapMarkedAlt/> แก้ไขที่อยู่ & ติดต่อ</h4>
                    
                    <div className={styles.formGroup}>
                        <label>จังหวัด</label>
                        <input className={styles.input} value={formData.province} onChange={(e)=>handleChange('province', e.target.value)} />
                    </div>
                    
                    <div className={styles.rowTwo}>
                        <div className={styles.formGroup}>
                            <label>อำเภอ/เขต</label>
                            <input className={styles.input} value={formData.district} onChange={(e)=>handleChange('district', e.target.value)} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>ตำบล/แขวง</label>
                            <input className={styles.input} value={formData.subDistrict} onChange={(e)=>handleChange('subDistrict', e.target.value)} />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>เบอร์โทรศัพท์ <span className={styles.req}>*</span></label>
                        <input className={styles.input} value={formData.phone} onChange={(e)=>handleChange('phone', e.target.value)} />
                    </div>
                </div>

             </div>
        </div>

        <div className={styles.modalFooter}>
            <button className={styles.btnCancel} onClick={() => setIsEditModalOpen(false)}>ยกเลิก</button>
            <button className={styles.btnSave} onClick={() => setIsEditModalOpen(false)}>บันทึกการเปลี่ยนแปลง</button>
        </div>
      </div>
    </>
  );

  // --- VIEW MODE (เหมือนเดิมตามที่คุณชอบ) ---
  return (
    <>
        <div className={styles.viewContainer}>
            <div className={styles.profileCard}>
                <div className={styles.profileLeft}>
                    <div className={styles.logoCircle}><FaImage/></div>
                    <div>
                        <h2 className={styles.orgName}>{formData.name}</h2>
                        <div className={styles.badges}>
                            <span className={styles.badgeType}>{formData.agencyType}</span>
                            <span className={styles.badgeStatus}><FaCheckCircle/> ใช้งานเต็มรูปแบบ</span>
                        </div>
                    </div>
                </div>
                <button className={styles.btnEditMain} onClick={() => setIsEditModalOpen(true)}>
                    <FaEdit /> แก้ไขข้อมูล
                </button>
            </div>

            <div className={styles.infoGrid}>
                <div className={styles.infoBox}>
                    <div className={styles.boxHeader}><FaUnlockAlt style={{color:'#0d6efd'}}/> รหัสเข้าร่วมองค์กร</div>
                    <div className={styles.dataRow}><span>Admin:</span> <strong className={styles.codeFont}>{formData.adminCode}</strong></div>
                    <div className={styles.dataRow}><span>User:</span> <strong className={styles.codeFont}>{formData.userCode}</strong></div>
                </div>
                <div className={styles.infoBox}>
                    <div className={styles.boxHeader}><FaMapMarkedAlt style={{color:'#198754'}}/> พื้นที่รับผิดชอบ</div>
                    <div className={styles.dataRow}><span>ที่อยู่:</span> <span>ต.{formData.subDistrict} อ.{formData.district} จ.{formData.province}</span></div>
                    <div className={styles.dataRow}><span>โทรศัพท์:</span> <span style={{color:'var(--primary-green)', fontWeight:'bold'}}>{formData.phone}</span></div>
                </div>
            </div>
        </div>
        
        {isEditModalOpen && <AgencyEditModal />}
    </>
  );
};

// ------------------------------------------------------------------
// --- ส่วนที่ 2-5: เมนูอื่นๆ (เหมือนเดิม) ---
// ------------------------------------------------------------------
const MapSettingsContent = () => (
    <div className={styles.settingsCard}>
      <h3 className={styles.cardTitle}><FaMapMarkedAlt/> ตั้งค่าแผนที่</h3>
      <p className={styles.settingsSubtitle}>ตั้งค่าการแสดงผลของแผนที่สาธารณะ</p>
      <div className={styles.settingRow}>
        <span>แผนที่สาธารณะ (เปิด/ปิด)</span>
        <MockToggle />
      </div>
    </div>
);

const PasswordSettingsContent = () => {
    const [visible, setVisible] = useState({});
    const toggle = (user) => setVisible({...visible, [user]: !visible[user]});
    return (
        <div className={styles.settingsCard}>
            <h3 className={styles.cardTitle}><FaUnlockAlt/> รหัสเข้าใช้งาน</h3>
            <p className={styles.settingsSubtitle}>จัดการรหัสผ่านสำหรับเจ้าหน้าที่</p>
            {[{role:"ผู้ดูแล", u:"admin", p:"1234"}, {role:"เจ้าหน้าที่", u:"staff", p:"5678"}].map((x,i)=>(
                <div key={i} className={styles.userRow}>
                    <div className={styles.userInfo}><FaUserCog style={{color:'#007bff'}}/> {x.role} ({x.u})</div>
                    <div className={styles.passAction}>
                        <span>{visible[x.u] ? x.p : "••••••"}</span>
                        <button className={styles.btnIcon} onClick={()=>toggle(x.u)}>{visible[x.u]?<FaEyeSlash/>:<FaEye/>}</button>
                        <button className={styles.btnSmall}><FaSyncAlt/> เปลี่ยน</button>
                    </div>
                </div>
            ))}
        </div>
    )
};

const QRUnitSettingsContent = () => (
  <div className={styles.settingsCard}>
    <h3 className={styles.cardTitle}>QRCode ประจำหน่วยงาน</h3>
    <div className={styles.qrCodePlaceholder}>
      <FaQrcode className={styles.mockQrIcon} />
      <span>(Mockup QR Code)</span>
    </div>
    <button className={styles.filterApplyButton} style={{ width: "100%" }}>ดาวน์โหลด QR Code</button>
  </div>
);

const QRCreateSettingsContent = () => (
  <div className={styles.settingsCard}>
    <h3 className={styles.cardTitle}>สร้าง QR Code เอง</h3>
    <div className={styles.formGroup}>
        <label>เลือกประเภทปัญหา</label>
        <select className={styles.input}><option>ทั้งหมด</option><option>ไฟดับ</option></select>
    </div>
    <div className={styles.formGroup} style={{marginTop:10}}>
        <label>ชื่อลิงก์</label>
        <input className={styles.input} placeholder="เช่น qr-zone-a" />
    </div>
    <button className={styles.filterApplyButton} style={{ marginTop: 20 }}>สร้าง QR Code</button>
    <div className={styles.qrCodePlaceholder} style={{ marginTop: 20, height: 150 }}><span>(QR จะแสดงที่นี่)</span></div>
  </div>
);

// ------------------------------------------------------------------
// --- Main View ---
// ------------------------------------------------------------------
const SettingsView = () => {
  const settingsOptions = [
    { id: "ข้อมูลหน่วยงาน", label: "ข้อมูลหน่วยงาน" },
    { id: "แผนที่", label: "ตั้งค่าแผนที่" },
    { id: "รหัสผ่าน", label: "รหัสผ่าน (ผู้ดูแล)" },
    { id: "qrหน่วยงาน", label: "QRCode หน่วยงาน" },
    { id: "qrสร้างเอง", label: "QRCode สร้างเอง" },
  ];
  const [activeSetting, setActiveSetting] = useState(settingsOptions[0].id);

  const renderSettingContent = () => {
    switch (activeSetting) {
      case "ข้อมูลหน่วยงาน": return <AgencySettings />;
      case "แผนที่": return <MapSettingsContent />;
      case "รหัสผ่าน": return <PasswordSettingsContent />;
      case "qrหน่วยงาน": return <QRUnitSettingsContent />;
      case "qrสร้างเอง": return <QRCreateSettingsContent />;
      default: return null;
    }
  };

  return (
    <div className={styles.settingsContainer}>
      <div className={styles.settingsHeaderDropdown}>
        <div className={styles.filterGroup}>
          <label style={{display:'flex', gap:8, alignItems:'center', fontWeight:700, marginBottom:8}}>
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
