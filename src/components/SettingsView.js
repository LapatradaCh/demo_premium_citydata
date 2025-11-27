import React, { useState } from "react";
import styles from "./css/SettingsView.module.css";
import {
  FaMapMarkedAlt,
  FaCog,
  FaTimes,
  FaUnlockAlt,
  FaUserCog,
  FaUserTie,
  FaSyncAlt,
  FaEye,
  FaEyeSlash,
  FaQrcode,
  FaLink,
  FaEdit,
  FaImage,
  FaBuilding,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaRegCopy,
  FaChevronDown,
  FaCheckCircle
} from "react-icons/fa";

// ... (Components ย่อยอื่นๆ เช่น MockToggle, PasswordModal ใช้ของเดิมได้เลย) ...
// เพื่อความกระชับ ผมจะขอละส่วน MockToggle และ PasswordModal ไว้ (ใช้ code เดิม) 
// แต่ถ้าต้องการให้แปะให้บอกได้ครับ

const MockToggle = () => (
    <label className={styles.mockToggle}>
      <input type="checkbox" />
      <span className={styles.mockSlider}></span>
    </label>
);

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

  // --- ส่วนแสดงผลแบบ "อ่านอย่างเดียว" (Clean View) ---
  const renderViewMode = () => (
    <div className={styles.viewModeContainer}>
        {/* ส่วนหัวการ์ด */}
        <div className={styles.viewHeader}>
            <div className={styles.logoCircleLarge}>
                <FaImage />
            </div>
            <div className={styles.viewHeaderText}>
                <h2>{formData.name || "ชื่อหน่วยงาน"}</h2>
                <div className={styles.tagGroup}>
                    <span className={styles.tagType}>{formData.agencyType || "-"}</span>
                    <span className={styles.tagUsage}>
                        {formData.usageType === 'full' ? <><FaCheckCircle/> ใช้งานเต็มรูปแบบ</> : "ทดลองใช้"}
                    </span>
                </div>
            </div>
            <button className={styles.editModeBtn} onClick={() => setIsEditing(true)}>
                <FaEdit /> แก้ไขข้อมูล
            </button>
        </div>

        <hr className={styles.divider} />

        {/* Grid ข้อมูล */}
        <div className={styles.viewGrid}>
            {/* กล่องรหัส */}
            <div className={styles.infoCard}>
                <div className={styles.infoTitle}><FaUnlockAlt/> รหัสเข้าร่วมองค์กร</div>
                <div className={styles.codeRow}>
                    <span>Admin:</span> <strong className={styles.codeHighlight}>{formData.adminCode}</strong>
                </div>
                <div className={styles.codeRow}>
                    <span>User:</span> <strong className={styles.codeHighlight}>{formData.userCode}</strong>
                </div>
            </div>

            {/* กล่องที่อยู่ */}
            <div className={styles.infoCard}>
                 <div className={styles.infoTitle}><FaMapMarkedAlt/> พื้นที่รับผิดชอบ</div>
                 <div className={styles.addressText}>
                    ต.{formData.subDistrict} อ.{formData.district} จ.{formData.province}
                 </div>
                 <div className={styles.phoneText}>
                    <FaPhoneAlt/> {formData.phone}
                 </div>
            </div>
        </div>
    </div>
  );

  // --- ส่วนฟอร์มแก้ไข (Edit Form) ---
  const renderEditMode = () => (
    <div className={styles.editModeContainer}>
        <div className={styles.editHeaderTitle}>
            <h3>แก้ไขข้อมูล</h3>
            <span onClick={() => setIsEditing(false)} className={styles.closeEditBtn}><FaTimes/></span>
        </div>

      {/* 1. รูปภาพ/โลโก้ */}
      <div className={styles.agencyImageSection}>
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

      <div className={styles.editFormContainer}>
        {/* 2. ชื่อหน่วยงาน (เพิ่มมาให้ครบ) */}
        <div className={styles.formGroup}>
             <label>ชื่อหน่วยงาน</label>
             <input type="text" className={styles.searchInput} value={formData.name} onChange={(e)=>handleChange('name', e.target.value)} />
        </div>

        {/* 3. รหัส (แสดงเฉยๆ หรือให้ copy) */}
        <div className={styles.formSectionBox}>
             <h4 className={styles.sectionHeader}><FaUnlockAlt /> รหัสเข้าร่วมองค์กร</h4>
             <div className={styles.codeSwitchContainer}>
                <button className={`${styles.codeTab} ${activeCodeTab === 'admin' ? styles.active : ''}`} onClick={() => setActiveCodeTab('admin')}>Admin Code</button>
                <button className={`${styles.codeTab} ${activeCodeTab === 'user' ? styles.active : ''}`} onClick={() => setActiveCodeTab('user')}>User Code</button>
             </div>
             <div className={styles.codeDisplayBox}>
                <span className={styles.codeText}>{activeCodeTab === 'admin' ? formData.adminCode : formData.userCode}</span>
                <button className={styles.copyBtn}><FaRegCopy /> คัดลอก</button>
             </div>
        </div>

        {/* 4. ประเภท */}
        <div className={styles.rowTwoCols}>
            <div className={styles.formGroup}>
              <label>ประเภทหน่วยงาน <span style={{color:'red'}}>*</span></label>
              <select className={styles.searchInput} value={formData.agencyType} onChange={(e) => handleChange("agencyType", e.target.value)}>
                 <option value="">เลือกประเภท</option>
                 <option value="เทศบาล">เทศบาล</option>
                 <option value="อบต">อบต.</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>การใช้งาน <span style={{color:'red'}}>*</span></label>
              <select className={styles.searchInput} value={formData.usageType} onChange={(e) => handleChange("usageType", e.target.value)}>
                 <option value="full">เต็มรูปแบบ</option>
                 <option value="demo">ทดลองใช้</option>
              </select>
            </div>
        </div>

        {/* 5. ที่อยู่ */}
        <div className={styles.formSectionBox}>
            <h4 className={styles.sectionHeader}><FaMapMarkedAlt /> ข้อมูลที่ตั้งและติดต่อ</h4>
            <button className={styles.getLocationBtn}><FaMapMarkerAlt /> ดึงตำแหน่งปัจจุบัน</button>
            <div className={styles.rowTwoCols}>
                <div className={styles.formGroup}>
                  <label>จังหวัด</label>
                  <input type="text" className={styles.searchInput} value={formData.province} onChange={(e) => handleChange("province", e.target.value)} />
                </div>
                <div className={styles.formGroup}>
                  <label>อำเภอ/เขต</label>
                  <input type="text" className={styles.searchInput} value={formData.district} onChange={(e) => handleChange("district", e.target.value)} />
                </div>
            </div>
            <div className={styles.rowTwoCols}>
                <div className={styles.formGroup}>
                  <label>ตำบล/แขวง</label>
                  <input type="text" className={styles.searchInput} value={formData.subDistrict} onChange={(e) => handleChange("subDistrict", e.target.value)} />
                </div>
                <div className={styles.formGroup}>
                  <label>เบอร์โทรศัพท์ <span style={{color:'red'}}>*</span></label>
                  <input type="text" className={styles.searchInput} value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} />
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
    <div className={styles.settingsSection}>
        {isEditing ? renderEditMode() : renderViewMode()}
    </div>
  );
};

// ... (MapSettingsContent, PasswordSettingsContent, QR... Components เดิม) ...
const MapSettingsContent = () => (<div className={styles.settingsSection}><h3>ตั้งค่าแผนที่</h3><MockToggle/></div>);
const PasswordSettingsContent = () => (<div className={styles.settingsSection}><h3>รหัสผ่าน</h3></div>);
const QRUnitSettingsContent = () => (<div className={styles.settingsSection}><h3>QR หน่วยงาน</h3></div>);
const QRCreateSettingsContent = () => (<div className={styles.settingsSection}><h3>QR สร้างเอง</h3></div>);


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
    <div className={styles.settingsContainer}>
      {/* ตรงนี้คือ Dropdown (รูปที่ 1) ปรับปรุงใหม่ 
         เปลี่ยนจากป้าย label ธรรมดา เป็น Header Bar สวยๆ
      */}
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
