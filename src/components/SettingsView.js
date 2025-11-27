import React, { useState } from "react";
import styles from "./css/SettingsView.module.css";
import {
  FaCog, FaTimes, FaUnlockAlt, FaEdit, FaImage, FaPhoneAlt,
  FaMapMarkerAlt, FaRegCopy, FaChevronDown, FaCheckCircle,
  FaBuilding, FaMapMarkedAlt, FaUserCog, FaUserTie,
  FaEye, FaEyeSlash, FaSyncAlt, FaQrcode, FaLink
} from "react-icons/fa";

// --- Components ย่อย ---
const MockToggle = () => (
    <label className={styles.mockToggle}>
      <input type="checkbox" />
      <span className={styles.mockSlider}></span>
    </label>
);

// ------------------------------------------------------------------
// --- ส่วนที่ 1: ข้อมูลหน่วยงาน (Agency) - View & Popup Edit ---
// ------------------------------------------------------------------
const AgencySettings = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // ควบคุม Popup
  
  // Data จำลอง
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

  // --- POPUP EDIT MODAL (ฟอร์มแก้ไข) ---
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
                <span className={styles.hintText}>รองรับไฟล์ JPG, PNG (Max 5MB)</span>
             </div>

             {/* 2. ข้อมูลทั่วไป */}
             <div className={styles.formSection}>
                <h4 className={styles.sectionTitle}><FaBuilding/> ข้อมูลทั่วไป</h4>
                <div className={styles.formGrid}>
                    <div className={styles.formGroupFull}>
                        <label>ชื่อหน่วยงาน</label>
                        <input type="text" className={styles.input} value={formData.name} onChange={(e)=>handleChange('name', e.target.value)} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>ประเภทหน่วยงาน <span className={styles.req}>*</span></label>
                        <select className={styles.input} value={formData.agencyType} onChange={(e)=>handleChange('agencyType', e.target.value)}>
                            <option value="เทศบาล">เทศบาล</option>
                            <option value="อบต">อบต.</option>
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label>สถานะการใช้งาน <span className={styles.req}>*</span></label>
                        <select className={styles.input} value={formData.usageType} onChange={(e)=>handleChange('usageType', e.target.value)}>
                            <option value="full">เต็มรูปแบบ</option>
                        </select>
                    </div>
                </div>
             </div>

             {/* 3. รหัส & ที่อยู่ */}
             <div className={styles.formGrid}>
                 {/* รหัส */}
                 <div className={styles.formSection}>
                    <h4 className={styles.sectionTitle}><FaUnlockAlt/> รหัสเข้าร่วม</h4>
                    <div className={styles.codeBox}>
                        <div className={styles.codeTabs}>
                            <button className={activeCodeTab==='admin'?styles.tabActive:styles.tab} onClick={()=>setActiveCodeTab('admin')}>Admin</button>
                            <button className={activeCodeTab==='user'?styles.tabActive:styles.tab} onClick={()=>setActiveCodeTab('user')}>User</button>
                        </div>
                        <div className={styles.codeDisplay}>
                            <span className={styles.codeText}>{activeCodeTab==='admin'?formData.adminCode:formData.userCode}</span>
                            <button className={styles.btnCopy}><FaRegCopy/> คัดลอก</button>
                        </div>
                    </div>
                 </div>

                 {/* ที่อยู่ */}
                 <div className={styles.formSection}>
                    <div className={styles.flexHeader}>
                        <h4 className={styles.sectionTitleNoMargin}><FaMapMarkedAlt/> ที่อยู่ & ติดต่อ</h4>
                        <button className={styles.btnSmallOutline}><FaMapMarkerAlt/> ดึงตำแหน่ง</button>
                    </div>
                    <div className={styles.addressGrid}>
                        <input className={styles.input} placeholder="จังหวัด" value={formData.province} onChange={(e)=>handleChange('province', e.target.value)} />
                        <input className={styles.input} placeholder="อำเภอ" value={formData.district} onChange={(e)=>handleChange('district', e.target.value)} />
                        <input className={styles.input} placeholder="ตำบล" value={formData.subDistrict} onChange={(e)=>handleChange('subDistrict', e.target.value)} />
                        <input className={styles.input} placeholder="เบอร์โทร" value={formData.phone} onChange={(e)=>handleChange('phone', e.target.value)} />
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

  // --- VIEW MODE (หน้าแสดงผลปกติ) ---
  return (
    <>
        <div className={styles.viewContainer}>
            {/* Header Card */}
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

            {/* Info Cards */}
            <div className={styles.infoGrid}>
                <div className={styles.infoBox}>
                    <div className={styles.boxHeader}><FaUnlockAlt style={{color:'#0d6efd'}}/> รหัสเข้าร่วมองค์กร</div>
                    <div className={styles.dataRow}><span>Admin:</span> <strong className={styles.codeFont}>{formData.adminCode}</strong></div>
                    <div className={styles.dataRow}><span>User:</span> <strong className={styles.codeFont}>{formData.userCode}</strong></div>
                </div>
                <div className={styles.infoBox}>
                    <div className={styles.boxHeader}><FaMapMarkedAlt style={{color:'#198754'}}/> พื้นที่รับผิดชอบ</div>
                    <div className={styles.dataRow}><span>ที่อยู่:</span> <span>ต.{formData.subDistrict} อ.{formData.district} จ.{formData.province}</span></div>
                    <div className={styles.dataRow}><span>โทรศัพท์:</span> <span style={{color:'var(--primary)', fontWeight:'bold'}}>{formData.phone}</span></div>
                </div>
            </div>
        </div>
        
        {/* Render Modal if Open */}
        {isEditModalOpen && <AgencyEditModal />}
    </>
  );
};

// ------------------------------------------------------------------
// --- ส่วนที่ 2: เมนูอื่นๆ (กู้คืนกลับมาเหมือนเดิม) ---
// ------------------------------------------------------------------

// Map
const MapSettingsContent = () => (
    <div className={styles.viewContainer}>
      <div className={styles.simpleCard}>
        <h3 className={styles.pageTitle}><FaMapMarkedAlt/> ตั้งค่าแผนที่</h3>
        <div className={styles.settingRow}>
            <span>แผนที่สาธารณะ (เปิด/ปิด)</span>
            <MockToggle />
        </div>
      </div>
    </div>
);

// Password
const PasswordSettingsContent = () => {
    const [visible, setVisible] = useState({});
    const toggle = (user) => setVisible({...visible, [user]: !visible[user]});
    return (
        <div className={styles.viewContainer}>
            <div className={styles.simpleCard}>
                <h3 className={styles.pageTitle}><FaUnlockAlt/> รหัสเข้าใช้งาน</h3>
                {[
                    {role:"ผู้ดูแล (Admin)", user:"admin_xx", pass:"1234"},
                    {role:"เจ้าหน้าที่", user:"staff_01", pass:"5678"}
                ].map((u,i)=>(
                    <div key={i} className={styles.userRow}>
                        <div className={styles.userInfo}>
                            <FaUserCog style={{color:'#0d6efd'}}/> 
                            <div>{u.role}<div style={{fontSize:12, color:'#999'}}>{u.user}</div></div>
                        </div>
                        <div className={styles.passAction}>
                            <span style={{marginRight:10, fontSize:13}}>{visible[u.user] ? u.pass : "••••••"}</span>
                            <button className={styles.btnIcon} onClick={()=>toggle(u.user)}>{visible[u.user]?<FaEyeSlash/>:<FaEye/>}</button>
                            <button className={styles.btnSmall}><FaSyncAlt/> เปลี่ยน</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
};

// QR Codes
const QRUnitSettingsContent = () => (
    <div className={styles.viewContainer}>
        <div className={styles.simpleCard}>
            <h3 className={styles.pageTitle}><FaQrcode/> QR Code หน่วยงาน</h3>
            <div className={styles.qrArea}>
                <FaQrcode size={60} color="#ccc"/>
                <span>ตัวอย่าง QR Code</span>
            </div>
            <button className={styles.btnSave}>ดาวน์โหลด QR Code</button>
        </div>
    </div>
);

const QRCreateSettingsContent = () => (
    <div className={styles.viewContainer}>
        <div className={styles.simpleCard}>
            <h3 className={styles.pageTitle}><FaLink/> สร้าง QR Code เอง</h3>
            <div className={styles.formGroup} style={{marginBottom:15}}>
                <label>ชื่อลิงก์ / ปัญหา</label>
                <input className={styles.input} placeholder="เช่น แจ้งไฟดับ..." />
            </div>
            <button className={styles.btnSave}>สร้าง QR Code</button>
        </div>
    </div>
);

// ------------------------------------------------------------------
// --- Main View Controller ---
// ------------------------------------------------------------------
const SettingsView = () => {
  // เมนูตั้งค่า (ตัด "ทั่วไป" ออกแล้ว เอา "ข้อมูลหน่วยงาน" ขึ้นก่อน)
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
