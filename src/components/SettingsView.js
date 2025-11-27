import React, { useState } from "react";
import styles from "./css/SettingsView.module.css";
import {
  FaCog, FaTimes, FaUnlockAlt, FaEdit, FaImage, FaPhoneAlt,
  FaMapMarkerAlt, FaRegCopy, FaChevronDown, FaCheckCircle,
  FaBuilding, FaMapMarkedAlt, FaQrcode, FaLink, FaUserCog, FaUserTie,
  FaEye, FaEyeSlash, FaSyncAlt
} from "react-icons/fa";

// --- Mock Toggle Component (สำหรับหน้าอื่นๆ) ---
const MockToggle = () => (
    <label className={styles.mockToggle}>
      <input type="checkbox" />
      <span className={styles.mockSlider}></span>
    </label>
);

// ------------------------------------------------------------------
// --- 1. ส่วนจัดการข้อมูลหน่วยงาน (Agency Settings) ---
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

  // --- VIEW MODE (แสดงผล) ---
  const renderViewMode = () => (
    <div className={styles.viewModeContainer}>
        <div className={styles.viewHeaderCard}>
            <div className={styles.logoWrapper}>
                <div className={styles.logoCircleLarge}><FaImage /></div>
            </div>
            <div className={styles.viewHeaderContent}>
                <div className={styles.viewTitleGroup}>
                    <h2>{formData.name}</h2>
                    <div className={styles.tagGroup}>
                        <span className={styles.tagType}>{formData.agencyType}</span>
                        <span className={styles.tagUsage}><FaCheckCircle/> ใช้งานเต็มรูปแบบ</span>
                    </div>
                </div>
                <button className={styles.editModeBtn} onClick={() => setIsEditing(true)}>
                    <FaEdit /> แก้ไขข้อมูล
                </button>
            </div>
        </div>
        <div className={styles.viewGrid}>
            <div className={styles.infoCard}>
                <div className={styles.infoCardHeader}><FaUnlockAlt/> รหัสเข้าร่วมองค์กร</div>
                <div className={styles.codeRow}><span>Admin:</span> <strong>{formData.adminCode}</strong></div>
                <div className={styles.codeRow}><span>User:</span> <strong>{formData.userCode}</strong></div>
            </div>
            <div className={styles.infoCard}>
                 <div className={styles.infoCardHeader}><FaMapMarkedAlt/> พื้นที่รับผิดชอบ</div>
                 <div className={styles.addressText}>ต.{formData.subDistrict} อ.{formData.district} จ.{formData.province}</div>
                 <div className={styles.phoneText}><FaPhoneAlt/> {formData.phone}</div>
            </div>
        </div>
    </div>
  );

  // --- EDIT MODE (แก้ไขใหม่: จัดระเบียบ Grid ไม่ให้ยืด) ---
  const renderEditMode = () => (
    <div className={styles.editModeContainer}>
        {/* Header: เรียบง่าย ปุ่มปิดอยู่ขวา */}
        <div className={styles.editHeaderRow}>
            <h3>แก้ไขข้อมูลหน่วยงาน</h3>
            <button onClick={() => setIsEditing(false)} className={styles.closeEditBtn}><FaTimes/></button>
        </div>

        <div className={styles.editFormScrollable}>
            
            {/* 1. รูปภาพ (วงกลมกึ่งกลาง) */}
            <div className={styles.imageUploadSection}>
                <div className={styles.imageCircle}>
                    <FaImage size={30} color="#ccc"/>
                    <div className={styles.overlayEdit}><FaEdit/></div>
                </div>
                <span className={styles.hintText}>ขนาดไฟล์ไม่เกิน 5MB (JPG, PNG)</span>
            </div>

            {/* 2. ข้อมูลทั่วไป (Grid 2 คอลัมน์) */}
            <div className={styles.formSection}>
                <h4 className={styles.sectionTitle}><FaBuilding/> ข้อมูลทั่วไป</h4>
                <div className={styles.inputGrid}>
                    <div className={styles.formGroupFull}>
                        <label>ชื่อหน่วยงาน</label>
                        <input type="text" className={styles.inputField} value={formData.name} onChange={(e)=>handleChange('name',e.target.value)} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>ประเภทหน่วยงาน <span className={styles.req}>*</span></label>
                        <select className={styles.inputField} value={formData.agencyType} onChange={(e)=>handleChange('agencyType',e.target.value)}>
                            <option value="เทศบาล">เทศบาล</option>
                            <option value="อบต">อบต.</option>
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label>การใช้งาน <span className={styles.req}>*</span></label>
                        <select className={styles.inputField} value={formData.usageType} onChange={(e)=>handleChange('usageType',e.target.value)}>
                            <option value="full">เต็มรูปแบบ</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* 3. รหัสองค์กร (แบบแท็บ Compact) */}
            <div className={styles.formSection}>
                <h4 className={styles.sectionTitle}><FaUnlockAlt/> รหัสเข้าร่วมองค์กร</h4>
                <div className={styles.codeTabsWrapper}>
                    <div className={styles.codeTabsHeader}>
                        <button className={activeCodeTab==='admin'?styles.tabActive:styles.tab} onClick={()=>setActiveCodeTab('admin')}>Admin Code</button>
                        <button className={activeCodeTab==='user'?styles.tabActive:styles.tab} onClick={()=>setActiveCodeTab('user')}>User Code</button>
                    </div>
                    <div className={styles.codeResultBox}>
                        <span className={styles.codeBig}>{activeCodeTab==='admin'?formData.adminCode:formData.userCode}</span>
                        <button className={styles.inlineCopyBtn}><FaRegCopy/> คัดลอก</button>
                    </div>
                </div>
            </div>

            {/* 4. ที่อยู่ (Header มีปุ่มขวา) */}
            <div className={styles.formSection}>
                <div className={styles.sectionHeaderFlex}>
                    <h4 className={styles.sectionTitleNoBorder}><FaMapMarkedAlt/> ข้อมูลที่ตั้ง</h4>
                    <button className={styles.btnSmallOutline}><FaMapMarkerAlt/> ดึงตำแหน่งปัจจุบัน</button>
                </div>
                <div className={styles.inputGrid}>
                    <div className={styles.formGroup}>
                        <label>จังหวัด</label>
                        <input className={styles.inputField} value={formData.province} onChange={(e)=>handleChange('province',e.target.value)} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>อำเภอ/เขต</label>
                        <input className={styles.inputField} value={formData.district} onChange={(e)=>handleChange('district',e.target.value)} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>ตำบล/แขวง</label>
                        <input className={styles.inputField} value={formData.subDistrict} onChange={(e)=>handleChange('subDistrict',e.target.value)} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>เบอร์โทรศัพท์ <span className={styles.req}>*</span></label>
                        <input className={styles.inputField} value={formData.phone} onChange={(e)=>handleChange('phone',e.target.value)} />
                    </div>
                </div>
            </div>

            {/* ปุ่ม Action */}
            <div className={styles.actionButtons}>
                <button className={styles.btnCancel} onClick={()=>setIsEditing(false)}>ยกเลิก</button>
                <button className={styles.btnSave} onClick={()=>setIsEditing(false)}>บันทึกข้อมูล</button>
            </div>
        </div>
    </div>
  );

  return (
    <div className={styles.settingsCard}>
        {isEditing ? renderEditMode() : renderViewMode()}
    </div>
  );
};

// ------------------------------------------------------------------
// --- (Restore) ส่วนเมนูอื่นๆ ที่คุณกลัวหายไป ---
// ------------------------------------------------------------------

// 2. ตั้งค่าแผนที่
const MapSettingsContent = () => (
    <div className={styles.settingsCard}>
      <h3 className={styles.cardTitle}><FaMapMarkedAlt /> ตั้งค่าแผนที่</h3>
      <div className={styles.settingRow}>
        <span>แผนที่สาธารณะ (เปิด/ปิด)</span>
        <MockToggle />
      </div>
    </div>
);

// 3. รหัสผ่าน
const PasswordSettingsContent = () => (
    <div className={styles.settingsCard}>
      <h3 className={styles.cardTitle}><FaUnlockAlt /> รหัสเข้าใช้งาน</h3>
      <div className={styles.userList}>
          {/* Mock User Item */}
          <div className={styles.userItem}>
             <div className={styles.userInfo}>
                <FaUserCog className={styles.iconBlue}/> ผู้ดูแล (Admin)
             </div>
             <button className={styles.btnSmallOutline}><FaSyncAlt/> เปลี่ยนรหัส</button>
          </div>
          <div className={styles.userItem}>
             <div className={styles.userInfo}>
                <FaUserTie className={styles.iconBlue}/> เจ้าหน้าที่
             </div>
             <button className={styles.btnSmallOutline}><FaSyncAlt/> เปลี่ยนรหัส</button>
          </div>
      </div>
    </div>
);

// 4. QR Code
const QRUnitSettingsContent = () => (
    <div className={styles.settingsCard}>
        <h3 className={styles.cardTitle}><FaQrcode /> QR Code หน่วยงาน</h3>
        <div className={styles.qrPlaceholder}>QR Code จะแสดงที่นี่</div>
    </div>
);

// 5. Create QR
const QRCreateSettingsContent = () => (
    <div className={styles.settingsCard}>
        <h3 className={styles.cardTitle}><FaLink /> สร้าง QR Code เอง</h3>
        <div className={styles.formGroup}>
            <label>ระบุชื่อลิงก์</label>
            <input type="text" className={styles.inputField} placeholder="ชื่อลิงก์..." />
        </div>
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
    <div className={styles.settingsPageContainer}>
      <div className={styles.settingsHeaderBar}>
          <div className={styles.headerLabel}><FaCog /> เมนูตั้งค่าระบบ</div>
          <div className={styles.customSelectWrapper}>
              <select 
                className={styles.customSelect}
                value={activeSetting} 
                onChange={(e) => setActiveSetting(e.target.value)}
              >
                {settingsOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>
              <FaChevronDown className={styles.selectIcon} />
          </div>
      </div>
      <div className={styles.settingsContentArea}>
        {renderSettingContent()}
      </div>
    </div>
  );
};

export default SettingsView;
