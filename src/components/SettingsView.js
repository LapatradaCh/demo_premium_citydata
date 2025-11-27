import React, { useState } from "react";
import styles from "./css/SettingsView.module.css";
import {
  FaCog,
  FaTimes,
  FaUnlockAlt,
  FaEdit,
  FaImage,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaRegCopy,
  FaChevronDown,
  FaCheckCircle,
  FaBuilding,
  FaMapMarkedAlt
} from "react-icons/fa";

// --- Mock Components (ส่วนนี้ใช้ของเดิมได้ หรือจะปรับแก้ตามต้องการ) ---
const MockToggle = () => (
    <label className={styles.mockToggle}>
      <input type="checkbox" />
      <span className={styles.mockSlider}></span>
    </label>
);
// ... (ส่วน PasswordModal ถ้ามีก็ใส่ไว้ตรงนี้) ...

// ------------------------------------------------------------------
// --- ส่วนแสดงผลข้อมูลหน่วยงาน (View & Edit Logic) ---
// ------------------------------------------------------------------
const AgencySettings = () => {
  const [isEditing, setIsEditing] = useState(false); // สถานะ: false=ดู, true=แก้ไข
  
  // Mock Data
  const [formData, setFormData] = useState({
    name: "เทศบาลตำบลตัวอย่าง",
    adminCode: "AL1F8H2",
    userCode: "US9K2M4",
    agencyType: "เทศบาล",
    usageType: "full", // full/demo
    province: "เชียงใหม่",
    district: "เมือง",
    subDistrict: "สุเทพ",
    phone: "089-999-9999",
  });
  
  const [activeCodeTab, setActiveCodeTab] = useState("admin");

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  // --- ส่วนแสดงผลแบบ "อ่านอย่างเดียว" (View Mode - Clean Card) ---
  const renderViewMode = () => (
    <div className={styles.viewModeContainer}>
        <div className={styles.viewHeaderCard}>
            <div className={styles.logoWrapper}>
                <div className={styles.logoCircleLarge}>
                    <FaImage />
                </div>
            </div>
            <div className={styles.viewHeaderContent}>
                <div className={styles.viewTitleGroup}>
                    <h2>{formData.name || "ชื่อหน่วยงาน"}</h2>
                    <div className={styles.tagGroup}>
                        <span className={styles.tagType}>{formData.agencyType || "ไม่ได้ระบุ"}</span>
                        <span className={`styles.tagUsage ${formData.usageType === 'full' ? styles.tagFull : styles.tagDemo}`}>
                            {formData.usageType === 'full' ? <><FaCheckCircle/> ใช้งานเต็มรูปแบบ</> : "ทดลองใช้"}
                        </span>
                    </div>
                </div>
                <button className={styles.editModeBtn} onClick={() => setIsEditing(true)}>
                    <FaEdit /> แก้ไขข้อมูล
                </button>
            </div>
        </div>

        <div className={styles.viewGrid}>
            {/* กล่องรหัส */}
            <div className={styles.infoCard}>
                <div className={styles.infoCardHeader}>
                    <FaUnlockAlt className={styles.infoIcon}/> รหัสเข้าร่วมองค์กร
                </div>
                <div className={styles.infoCardBody}>
                    <div className={styles.codeRow}>
                        <span className={styles.codeLabel}>Admin:</span>
                        <strong className={styles.codeValue}>{formData.adminCode}</strong>
                    </div>
                    <div className={styles.codeRow}>
                        <span className={styles.codeLabel}>User:</span>
                        <strong className={styles.codeValue}>{formData.userCode}</strong>
                    </div>
                </div>
            </div>

            {/* กล่องที่อยู่ */}
            <div className={styles.infoCard}>
                 <div className={styles.infoCardHeader}>
                    <FaMapMarkedAlt className={styles.infoIcon}/> พื้นที่รับผิดชอบ
                 </div>
                 <div className={styles.infoCardBody}>
                     <div className={styles.addressText}>
                        ต.{formData.subDistrict} อ.{formData.district} จ.{formData.province}
                     </div>
                     <a href={`tel:${formData.phone}`} className={styles.phoneLink}>
                        <FaPhoneAlt/> {formData.phone}
                     </a>
                 </div>
            </div>
        </div>
    </div>
  );

  // --- ส่วนฟอร์มแก้ไข (Edit Mode - Organized Form) ---
  const renderEditMode = () => (
    <div className={styles.editModeContainer}>
        <div className={styles.editHeaderTitle}>
            <h3>แก้ไขข้อมูลหน่วยงาน</h3>
            <button onClick={() => setIsEditing(false)} className={styles.closeEditBtn} title="ปิด"><FaTimes/></button>
        </div>

        <div className={styles.editFormLayout}>
            {/* 1. รูปภาพโลโก้ */}
            <div className={styles.formSection + " " + styles.imageSectionCentered}>
                <div className={styles.agencyImageWrapper}>
                  <div className={styles.agencyImagePlaceholder}>
                    <FaImage className={styles.agencyImageIcon} />
                    <span>อัปโหลดโลโก้</span>
                  </div>
                  <button className={styles.imageEditBtn} title="เลือกไฟล์">
                    <FaEdit />
                  </button>
                </div>
                <div className={styles.fileHint}>ขนาดไฟล์ไม่เกิน 5MB (JPG, PNG)</div>
            </div>

            {/* 2. ข้อมูลทั่วไป */}
            <div className={styles.formSection}>
                <h4 className={styles.sectionTitle}><FaBuilding /> ข้อมูลทั่วไป</h4>
                <div className={styles.formGroup}>
                     <label>ชื่อหน่วยงาน</label>
                     <input type="text" className={styles.formInput} value={formData.name} onChange={(e)=>handleChange('name', e.target.value)} />
                </div>
                <div className={styles.rowTwoCols}>
                    <div className={styles.formGroup}>
                      <label>ประเภทหน่วยงาน <span className={styles.required}>*</span></label>
                      <select className={styles.formInput} value={formData.agencyType} onChange={(e) => handleChange("agencyType", e.target.value)}>
                         <option value="">เลือกประเภท</option>
                         <option value="เทศบาล">เทศบาล</option>
                         <option value="อบต">อบต.</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label>การใช้งาน <span className={styles.required}>*</span></label>
                      <select className={styles.formInput} value={formData.usageType} onChange={(e) => handleChange("usageType", e.target.value)}>
                         <option value="full">เต็มรูปแบบ</option>
                         <option value="demo">ทดลองใช้</option>
                      </select>
                    </div>
                </div>
            </div>

            {/* 3. รหัสเข้าร่วม */}
            <div className={styles.formSection}>
                 <h4 className={styles.sectionTitle}><FaUnlockAlt /> รหัสเข้าร่วมองค์กร</h4>
                 <div className={styles.codeBox}>
                     <div className={styles.codeSwitchContainer}>
                        <button className={`${styles.codeTab} ${activeCodeTab === 'admin' ? styles.active : ''}`} onClick={() => setActiveCodeTab('admin')}>Admin Code</button>
                        <button className={`${styles.codeTab} ${activeCodeTab === 'user' ? styles.active : ''}`} onClick={() => setActiveCodeTab('user')}>User Code</button>
                     </div>
                     <div className={styles.codeDisplayWrapper}>
                        <span className={styles.codeTextDisplay}>{activeCodeTab === 'admin' ? formData.adminCode : formData.userCode}</span>
                        <button className={styles.copyBtn} title="คัดลอก"><FaRegCopy /> คัดลอก</button>
                     </div>
                 </div>
            </div>

            {/* 4. ที่อยู่และติดต่อ */}
            <div className={styles.formSection}>
                <div className={styles.sectionHeaderWithAction}>
                    <h4 className={styles.sectionTitle}><FaMapMarkedAlt /> ข้อมูลที่ตั้งและติดต่อ</h4>
                    <button className={styles.getLocationBtnSmall}><FaMapMarkerAlt /> ดึงตำแหน่งปัจจุบัน</button>
                </div>
                
                <div className={styles.rowTwoCols}>
                    <div className={styles.formGroup}>
                      <label>จังหวัด</label>
                      <input type="text" className={styles.formInput} value={formData.province} onChange={(e) => handleChange("province", e.target.value)} />
                    </div>
                    <div className={styles.formGroup}>
                      <label>อำเภอ/เขต</label>
                      <input type="text" className={styles.formInput} value={formData.district} onChange={(e) => handleChange("district", e.target.value)} />
                    </div>
                </div>
                <div className={styles.rowTwoCols}>
                    <div className={styles.formGroup}>
                      <label>ตำบล/แขวง</label>
                      <input type="text" className={styles.formInput} value={formData.subDistrict} onChange={(e) => handleChange("subDistrict", e.target.value)} />
                    </div>
                    <div className={styles.formGroup}>
                      <label>เบอร์โทรศัพท์ <span className={styles.required}>*</span></label>
                      <input type="text" className={styles.formInput} value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} />
                    </div>
                </div>
            </div>
        </div>

        <div className={styles.actionButtonRow}>
            <button className={styles.btnCancel} onClick={() => setIsEditing(false)}>ยกเลิก</button>
            <button className={styles.btnConfirm} onClick={() => setIsEditing(false)}>บันทึกการเปลี่ยนแปลง</button>
        </div>
    </div>
  );

  return (
    <div className={styles.settingsCard}>
        {isEditing ? renderEditMode() : renderViewMode()}
    </div>
  );
};

// ... (MapSettingsContent, PasswordSettingsContent, QR... Components เดิม) ...
const MapSettingsContent = () => (<div className={styles.settingsCard}><h3>ตั้งค่าแผนที่</h3><MockToggle/></div>);
const PasswordSettingsContent = () => (<div className={styles.settingsCard}><h3>รหัสผ่าน</h3></div>);
const QRUnitSettingsContent = () => (<div className={styles.settingsCard}><h3>QR หน่วยงาน</h3></div>);
const QRCreateSettingsContent = () => (<div className={styles.settingsCard}><h3>QR สร้างเอง</h3></div>);


// --- Main View ---
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
      {/* Header Dropdown */}
      <div className={styles.settingsHeaderBar}>
          <div className={styles.headerLabel}>
             <FaCog /> เมนูตั้งค่าระบบ
          </div>
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
