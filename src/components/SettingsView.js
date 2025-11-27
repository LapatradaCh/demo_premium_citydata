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

// --- Mock Components ---
const MockToggle = () => (
    <label className={styles.mockToggle}>
      <input type="checkbox" />
      <span className={styles.mockSlider}></span>
    </label>
);

// ------------------------------------------------------------------
// --- Agency Settings Component ---
// ------------------------------------------------------------------
const AgencySettings = () => {
  const [isEditing, setIsEditing] = useState(false); // Toggle View/Edit Mode
  
  // Mock Data
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

  // --- 1. VIEW MODE (หน้าแสดงผลปกติ - แบบการ์ดสวยงาม) ---
  const renderViewMode = () => (
    <div className={styles.viewModeContainer}>
        {/* Header Card */}
        <div className={styles.viewHeaderCard}>
            <div className={styles.logoWrapper}>
                <div className={styles.logoCircleLarge}>
                    <FaImage />
                </div>
            </div>
            <div className={styles.viewHeaderContent}>
                <div className={styles.viewTitleGroup}>
                    <h2>{formData.name}</h2>
                    <div className={styles.tagGroup}>
                        <span className={styles.tagType}>{formData.agencyType}</span>
                        <span className={styles.tagUsage}>
                            <FaCheckCircle/> ใช้งานเต็มรูปแบบ
                        </span>
                    </div>
                </div>
                <button className={styles.editModeBtn} onClick={() => setIsEditing(true)}>
                    <FaEdit /> แก้ไขข้อมูล
                </button>
            </div>
        </div>

        {/* Info Grid */}
        <div className={styles.viewGrid}>
            {/* รหัส */}
            <div className={styles.infoCard}>
                <div className={styles.infoCardHeader}>
                    <FaUnlockAlt className={styles.iconMuted}/> รหัสเข้าร่วมองค์กร
                </div>
                <div className={styles.codeRow}>
                    <span>Admin:</span> 
                    <strong className={styles.textDark}>{formData.adminCode}</strong>
                </div>
                <div className={styles.codeRow}>
                    <span>User:</span> 
                    <strong className={styles.textDark}>{formData.userCode}</strong>
                </div>
            </div>

            {/* ที่อยู่ */}
            <div className={styles.infoCard}>
                 <div className={styles.infoCardHeader}>
                    <FaMapMarkedAlt className={styles.iconMuted}/> พื้นที่รับผิดชอบ
                 </div>
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

  // --- 2. EDIT MODE (หน้าแก้ไข - จัดระเบียบ Grid) ---
  const renderEditMode = () => (
    <div className={styles.editModeContainer}>
        {/* Header Row: ชื่อหัวข้อ + ปุ่มปิด */}
        <div className={styles.editHeaderRow}>
            <h3>แก้ไขข้อมูลหน่วยงาน</h3>
            <button onClick={() => setIsEditing(false)} className={styles.closeEditBtn} title="ปิด">
                <FaTimes/>
            </button>
        </div>

        <div className={styles.editFormScrollable}>
            
            {/* Section 1: Image Upload (Centered) */}
            <div className={styles.imageUploadSection}>
                <div className={styles.imageCircle}>
                    <FaImage size={32} color="#ccc"/>
                    <span>อัปโหลด</span>
                    {/* ปุ่มแก้ไขเล็กๆ */}
                    <button className={styles.smallEditIcon}>
                        <FaEdit/>
                    </button>
                </div>
                <span className={styles.hintText}>ขนาดไฟล์ไม่เกิน 5MB (JPG, PNG)</span>
            </div>

            {/* Section 2: General Info (Grid Layout) */}
            <div className={styles.formSection}>
                <h4 className={styles.sectionTitle}>
                    <FaBuilding/> ข้อมูลทั่วไป
                </h4>
                <div className={styles.inputGrid}>
                    <div className={styles.formGroupFull}>
                        <label>ชื่อหน่วยงาน</label>
                        <input 
                            type="text" 
                            className={styles.inputField} 
                            value={formData.name} 
                            onChange={(e)=>handleChange('name',e.target.value)} 
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>ประเภทหน่วยงาน <span className={styles.req}>*</span></label>
                        <select 
                            className={styles.inputField} 
                            value={formData.agencyType} 
                            onChange={(e)=>handleChange('agencyType',e.target.value)}
                        >
                            <option value="เทศบาล">เทศบาล</option>
                            <option value="อบต">อบต.</option>
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label>การใช้งาน <span className={styles.req}>*</span></label>
                        <select 
                            className={styles.inputField} 
                            value={formData.usageType} 
                            onChange={(e)=>handleChange('usageType',e.target.value)}
                        >
                            <option value="full">เต็มรูปแบบ</option>
                            <option value="demo">ทดลองใช้</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Section 3: Codes */}
            <div className={styles.formSection}>
                <h4 className={styles.sectionTitle}>
                    <FaUnlockAlt/> รหัสเข้าร่วมองค์กร
                </h4>
                <div className={styles.codeTabsWrapper}>
                    <div className={styles.codeTabs}>
                        <button 
                            className={activeCodeTab==='admin'?styles.tabActive:styles.tab} 
                            onClick={()=>setActiveCodeTab('admin')}
                        >
                            Admin Code
                        </button>
                        <button 
                            className={activeCodeTab==='user'?styles.tabActive:styles.tab} 
                            onClick={()=>setActiveCodeTab('user')}
                        >
                            User Code
                        </button>
                    </div>
                    <div className={styles.codeResultBox}>
                        <span className={styles.codeBig}>
                            {activeCodeTab==='admin'?formData.adminCode:formData.userCode}
                        </span>
                        <button className={styles.inlineCopyBtn}>
                            <FaRegCopy/> คัดลอก
                        </button>
                    </div>
                </div>
            </div>

            {/* Section 4: Location (With Header Action) */}
            <div className={styles.formSection}>
                <div className={styles.sectionHeaderFlex}>
                    <h4 className={styles.sectionTitleNoBorder}>
                        <FaMapMarkedAlt/> ข้อมูลที่ตั้ง
                    </h4>
                    <button className={styles.btnSmallOutline}>
                        <FaMapMarkerAlt/> ดึงตำแหน่งปัจจุบัน
                    </button>
                </div>
                <div className={styles.inputGrid}>
                    <div className={styles.formGroup}>
                        <label>จังหวัด</label>
                        <input 
                            className={styles.inputField} 
                            value={formData.province} 
                            onChange={(e)=>handleChange('province',e.target.value)} 
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>อำเภอ/เขต</label>
                        <input 
                            className={styles.inputField} 
                            value={formData.district} 
                            onChange={(e)=>handleChange('district',e.target.value)} 
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>ตำบล/แขวง</label>
                        <input 
                            className={styles.inputField} 
                            value={formData.subDistrict} 
                            onChange={(e)=>handleChange('subDistrict',e.target.value)} 
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>เบอร์โทรศัพท์ <span className={styles.req}>*</span></label>
                        <input 
                            className={styles.inputField} 
                            value={formData.phone} 
                            onChange={(e)=>handleChange('phone',e.target.value)} 
                        />
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className={styles.actionButtons}>
                <button className={styles.btnCancel} onClick={()=>setIsEditing(false)}>
                    ยกเลิก
                </button>
                <button className={styles.btnSave} onClick={()=>setIsEditing(false)}>
                    บันทึกข้อมูล
                </button>
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

// --- Other Mock Sections ---
const MapSettingsContent = () => (<div className={styles.settingsCard}><h3>ตั้งค่าแผนที่</h3><MockToggle/></div>);
const PasswordSettingsContent = () => (<div className={styles.settingsCard}><h3>รหัสผ่าน</h3></div>);
const QRUnitSettingsContent = () => (<div className={styles.settingsCard}><h3>QR หน่วยงาน</h3></div>);
const QRCreateSettingsContent = () => (<div className={styles.settingsCard}><h3>QR สร้างเอง</h3></div>);


// ------------------------------------------------------------------
// --- Main Layout ---
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
