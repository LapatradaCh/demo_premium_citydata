import React, { useState } from "react";
import styles from "./css/SettingsView.module.css";
import {
  FaCog, FaTimes, FaUnlockAlt, FaEdit, FaImage, FaPhoneAlt,
  FaMapMarkerAlt, FaRegCopy, FaChevronDown, FaCheckCircle,
  FaBuilding, FaMapMarkedAlt, FaUserCog, FaUserTie,
  FaEye, FaEyeSlash, FaSyncAlt, FaQrcode, FaLink, FaGlobe
} from "react-icons/fa";

// --- Mock Toggle (สำหรับหน้าอื่น) ---
const MockToggle = () => (
    <label className={styles.mockToggle}>
      <input type="checkbox" />
      <span className={styles.mockSlider}></span>
    </label>
);

// ------------------------------------------------------------------
// --- 1. Agency Settings (Re-designed) ---
// ------------------------------------------------------------------
const AgencySettings = () => {
  const [isEditing, setIsEditing] = useState(false); 
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
  const [activeCodeTab, setActiveCodeTab] = useState("admin");

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  // --- VIEW MODE: ออกแบบให้เหมือน Dashboard Profile ---
  const renderViewMode = () => (
    <div className={styles.viewContainer}>
        {/* ส่วนหัว: โลโก้และชื่อ */}
        <div className={styles.profileHeader}>
            <div className={styles.profileLogo}>
                <FaImage />
            </div>
            <div className={styles.profileInfo}>
                <h2 className={styles.orgName}>{formData.name}</h2>
                <div className={styles.badges}>
                    <span className={styles.badgeType}>{formData.agencyType}</span>
                    <span className={styles.badgeStatus}><FaCheckCircle/> ใช้งานเต็มรูปแบบ</span>
                </div>
            </div>
            <button className={styles.btnEditMain} onClick={() => setIsEditing(true)}>
                <FaEdit /> แก้ไขข้อมูล
            </button>
        </div>

        {/* ส่วนเนื้อหา: แบ่งเป็นกล่องข้อมูล */}
        <div className={styles.infoGrid}>
            {/* กล่อง 1: รหัส */}
            <div className={styles.infoBox}>
                <div className={styles.boxHeader}>
                    <div className={styles.iconBox} style={{background: '#e3f2fd', color: '#0d47a1'}}><FaUnlockAlt/></div>
                    <h4>รหัสเข้าร่วมองค์กร</h4>
                </div>
                <div className={styles.boxContent}>
                    <div className={styles.dataRow}>
                        <span className={styles.label}>Admin Code</span>
                        <span className={styles.valueCode}>{formData.adminCode}</span>
                    </div>
                    <div className={styles.dataRow}>
                        <span className={styles.label}>User Code</span>
                        <span className={styles.valueCode}>{formData.userCode}</span>
                    </div>
                </div>
            </div>

            {/* กล่อง 2: ที่อยู่และการติดต่อ */}
            <div className={styles.infoBox}>
                <div className={styles.boxHeader}>
                    <div className={styles.iconBox} style={{background: '#e8f5e9', color: '#1b5e20'}}><FaMapMarkedAlt/></div>
                    <h4>พื้นที่รับผิดชอบ & ติดต่อ</h4>
                </div>
                <div className={styles.boxContent}>
                    <div className={styles.dataRow}>
                        <span className={styles.label}>ที่อยู่</span>
                        <span className={styles.value}>ต.{formData.subDistrict} อ.{formData.district} จ.{formData.province}</span>
                    </div>
                    <div className={styles.dataRow}>
                        <span className={styles.label}>โทรศัพท์</span>
                        <span className={styles.valueHighlight}>{formData.phone}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );

  // --- EDIT MODE: แบ่ง Section ชัดเจน ---
  const renderEditMode = () => (
    <div className={styles.editContainer}>
        <div className={styles.editHeader}>
            <h3>แก้ไขข้อมูลหน่วยงาน</h3>
            <button onClick={() => setIsEditing(false)} className={styles.btnClose}><FaTimes/></button>
        </div>

        <div className={styles.editBody}>
            {/* ส่วนที่ 1: รูปภาพ + ชื่อ */}
            <div className={styles.editSection}>
                <div className={styles.uploadWrapper}>
                    <div className={styles.imgPreview}>
                        <FaImage />
                        <div className={styles.editOverlay}><FaEdit/></div>
                    </div>
                    <div className={styles.uploadText}>
                        <label>รูปภาพโลโก้</label>
                        <span>รองรับไฟล์ JPG, PNG (Max 5MB)</span>
                    </div>
                </div>
                <div className={styles.formGrid}>
                     <div className={styles.formGroupFull}>
                        <label>ชื่อหน่วยงาน</label>
                        <input type="text" className={styles.input} value={formData.name} onChange={(e)=>handleChange('name',e.target.value)} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>ประเภทหน่วยงาน <span className={styles.req}>*</span></label>
                        <select className={styles.input} value={formData.agencyType} onChange={(e)=>handleChange('agencyType',e.target.value)}>
                            <option value="เทศบาล">เทศบาล</option>
                            <option value="อบต">อบต.</option>
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label>สถานะการใช้งาน <span className={styles.req}>*</span></label>
                        <select className={styles.input} value={formData.usageType} onChange={(e)=>handleChange('usageType',e.target.value)}>
                            <option value="full">เต็มรูปแบบ</option>
                        </select>
                    </div>
                </div>
            </div>

            <hr className={styles.divider}/>

            {/* ส่วนที่ 2: รหัส (Codes) */}
            <div className={styles.editSection}>
                <h4 className={styles.subTitle}><FaUnlockAlt/> จัดการรหัสเข้าร่วม</h4>
                <div className={styles.codeManager}>
                    <div className={styles.codeTabs}>
                         <button className={activeCodeTab==='admin' ? styles.tabActive : styles.tab} onClick={()=>setActiveCodeTab('admin')}>Admin</button>
                         <button className={activeCodeTab==='user' ? styles.tabActive : styles.tab} onClick={()=>setActiveCodeTab('user')}>User</button>
                    </div>
                    <div className={styles.codeDisplay}>
                        <span className={styles.largeCode}>{activeCodeTab==='admin'?formData.adminCode:formData.userCode}</span>
                        <button className={styles.btnCopy}><FaRegCopy/> คัดลอก</button>
                    </div>
                </div>
            </div>

            <hr className={styles.divider}/>

            {/* ส่วนที่ 3: ที่อยู่ */}
            <div className={styles.editSection}>
                <div className={styles.flexTitle}>
                    <h4 className={styles.subTitle}><FaMapMarkedAlt/> ข้อมูลที่ตั้ง & ติดต่อ</h4>
                    <button className={styles.btnOutlineSmall}><FaMapMarkerAlt/> ดึงตำแหน่งปัจจุบัน</button>
                </div>
                <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                        <label>จังหวัด</label>
                        <input className={styles.input} value={formData.province} onChange={(e)=>handleChange('province',e.target.value)} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>อำเภอ/เขต</label>
                        <input className={styles.input} value={formData.district} onChange={(e)=>handleChange('district',e.target.value)} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>ตำบล/แขวง</label>
                        <input className={styles.input} value={formData.subDistrict} onChange={(e)=>handleChange('subDistrict',e.target.value)} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>เบอร์โทรศัพท์ <span className={styles.req}>*</span></label>
                        <input className={styles.input} value={formData.phone} onChange={(e)=>handleChange('phone',e.target.value)} />
                    </div>
                </div>
            </div>

            <div className={styles.actionFooter}>
                <button className={styles.btnCancel} onClick={()=>setIsEditing(false)}>ยกเลิก</button>
                <button className={styles.btnSave} onClick={()=>setIsEditing(false)}>บันทึกการเปลี่ยนแปลง</button>
            </div>
        </div>
    </div>
  );

  return (
    <div className={styles.cardContainer}>
        {isEditing ? renderEditMode() : renderViewMode()}
    </div>
  );
};

// ------------------------------------------------------------------
// --- (ส่วนหน้าอื่นๆ ยังคงเดิม) ---
// ------------------------------------------------------------------
const MapSettingsContent = () => (
    <div className={styles.cardContainer}>
      <h3 className={styles.pageTitle}><FaMapMarkedAlt/> ตั้งค่าแผนที่</h3>
      <div className={styles.settingItem}>
        <span>เปิด/ปิด แผนที่สาธารณะ</span>
        <MockToggle />
      </div>
    </div>
);

const PasswordSettingsContent = () => {
    // Mock user list logic (simplified for display)
    return (
        <div className={styles.cardContainer}>
            <h3 className={styles.pageTitle}><FaUnlockAlt/> รหัสเข้าใช้งาน</h3>
            <div className={styles.userList}>
                <div className={styles.userRow}>
                    <div className={styles.userInfo}><FaUserCog style={{color:'#007bff'}}/> ผู้ดูแล (Admin)</div>
                    <button className={styles.btnOutlineSmall}><FaSyncAlt/> เปลี่ยนรหัส</button>
                </div>
                <div className={styles.userRow}>
                    <div className={styles.userInfo}><FaUserTie style={{color:'#28a745'}}/> เจ้าหน้าที่</div>
                    <button className={styles.btnOutlineSmall}><FaSyncAlt/> เปลี่ยนรหัส</button>
                </div>
            </div>
        </div>
    )
};

const QRUnitSettingsContent = () => (
    <div className={styles.cardContainer}>
        <h3 className={styles.pageTitle}><FaQrcode/> QR Code หน่วยงาน</h3>
        <div className={styles.qrArea}>
            <FaQrcode size={80} color="#ddd"/>
            <p>QR Code Preview</p>
        </div>
        <button className={styles.btnSaveFull}>ดาวน์โหลด QR Code</button>
    </div>
);

const QRCreateSettingsContent = () => (
    <div className={styles.cardContainer}>
        <h3 className={styles.pageTitle}><FaLink/> สร้าง QR Code เอง</h3>
        <div className={styles.formGroupFull} style={{marginBottom:'15px'}}>
             <label>ลิงก์ปลายทาง / ชื่อปัญหา</label>
             <input type="text" className={styles.input} placeholder="ระบุชื่อ..." />
        </div>
        <button className={styles.btnSaveFull}>สร้าง QR Code</button>
    </div>
);

// ------------------------------------------------------------------
// --- Main View Controller ---
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
    <div className={styles.layoutWrapper}>
      <div className={styles.headerBar}>
          <div className={styles.headerTitle}><FaCog /> เมนูตั้งค่าระบบ</div>
          <div className={styles.selectWrapper}>
              <select className={styles.selectBox} value={activeSetting} onChange={(e) => setActiveSetting(e.target.value)}>
                {settingsOptions.map((opt) => (<option key={opt.id} value={opt.id}>{opt.label}</option>))}
              </select>
              <FaChevronDown className={styles.selectArrow} />
          </div>
      </div>
      <div className={styles.contentArea}>
        {renderSettingContent()}
      </div>
    </div>
  );
};

export default SettingsView;
