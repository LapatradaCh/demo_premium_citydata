import React, { useState } from "react";
import styles from "./css/SettingsView.module.css";
import {
  FaMapMarkedAlt, FaCog, FaTimes, FaUnlockAlt, FaUserCog, FaUserTie,
  FaSyncAlt, FaEye, FaEyeSlash, FaQrcode, FaLink, FaEdit, FaImage,
  FaCheckCircle, FaBuilding, FaRegCopy, FaPhoneAlt, FaMapMarkerAlt,
  FaChevronDown
} from "react-icons/fa";

// --- Toggle Component (แบบเดิม) ---
const MockToggle = () => (
  <label className={styles.mockToggle}>
    <input type="checkbox" />
    <span className={styles.mockSlider}></span>
  </label>
);

// --- Admin Change Password Modal (แบบเดิม) ---
const AdminChangePasswordModal = ({ onClose, user }) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = () => {
    if (!newPassword) { alert("กรุณาใส่รหัสผ่านใหม่"); return; }
    if (newPassword !== confirmPassword) { alert("รหัสผ่านใหม่และการยืนยันไม่ตรงกัน"); return; }
    alert(`(จำลอง) ตั้งรหัสผ่านใหม่สำเร็จ!`);
    onClose();
  };

  return (
    <>
      <div className={styles.filterModalBackdrop} onClick={onClose} />
      <div className={styles.filterModal}>
        <div className={styles.filterModalHeader}>
          <h3>ตั้งรหัสผ่านใหม่ให้: {user.username}</h3>
          <button className={styles.filterModalClose} onClick={onClose}><FaTimes /></button>
        </div>
        <div className={styles.filterModalContent}>
          <div className={styles.filterGroup}>
            <label>รหัสผ่านใหม่</label>
            <input type="password" className={styles.searchInput} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
          <div className={styles.filterGroup}>
            <label>ยืนยันรหัสผ่านใหม่</label>
            <input type="password" className={styles.searchInput} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
          <button className={styles.filterApplyButton} style={{ marginTop: "10px" }} onClick={handleSubmit}>
            ยืนยันการตั้งรหัสใหม่
          </button>
        </div>
      </div>
    </>
  );
};

// ==================================================================================
// 1. ส่วน "ข้อมูลหน่วยงาน" (ใช้ดีไซน์ใหม่: Dashboard + Popup Edit)
// ==================================================================================
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
  const [activeCodeTab, setActiveCodeTab] = useState("admin");
  const handleChange = (field, value) => { setFormData({ ...formData, [field]: value }); };

  // Popup Modal
  const AgencyEditModal = () => (
    <>
      <div className={styles.modalBackdrop} onClick={() => setIsEditModalOpen(false)} />
      <div className={styles.modalContainer}>
        <div className={styles.modalHeader}>
            <h3>แก้ไขข้อมูลหน่วยงาน</h3>
            <button className={styles.btnClose} onClick={() => setIsEditModalOpen(false)}><FaTimes/></button>
        </div>
        <div className={styles.modalBody}>
             {/* รูปภาพ */}
             <div className={styles.imageUploadSection}>
                <div className={styles.imageCircle}>
                    <FaImage size={32} color="#ccc"/>
                    <div className={styles.editIconOverlay}><FaEdit/></div>
                </div>
                <span className={styles.hintText}>รองรับไฟล์ JPG, PNG (Max 5MB)</span>
             </div>
             {/* ข้อมูลทั่วไป */}
             <div className={styles.formSectionNew}>
                <h4 className={styles.sectionTitleNew}><FaBuilding/> ข้อมูลทั่วไป</h4>
                <div className={styles.formGrid}>
                    <div className={styles.formGroupFull}>
                        <label>ชื่อหน่วยงาน</label>
                        <input type="text" className={styles.inputNew} value={formData.name} onChange={(e)=>handleChange('name', e.target.value)} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>ประเภทหน่วยงาน <span className={styles.req}>*</span></label>
                        <select className={styles.inputNew} value={formData.agencyType} onChange={(e)=>handleChange('agencyType', e.target.value)}>
                            <option value="เทศบาล">เทศบาล</option>
                            <option value="อบต">อบต.</option>
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label>สถานะการใช้งาน <span className={styles.req}>*</span></label>
                        <select className={styles.inputNew} value={formData.usageType} onChange={(e)=>handleChange('usageType', e.target.value)}>
                            <option value="full">เต็มรูปแบบ</option>
                        </select>
                    </div>
                </div>
             </div>
             {/* รหัส & ที่อยู่ */}
             <div className={styles.formGrid}>
                 <div className={styles.formSectionNew}>
                    <h4 className={styles.sectionTitleNew}><FaUnlockAlt/> รหัสเข้าร่วม</h4>
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
                 <div className={styles.formSectionNew}>
                    <div className={styles.flexHeader}>
                        <h4 className={styles.sectionTitleNoMargin}><FaMapMarkedAlt/> ที่อยู่ & ติดต่อ</h4>
                        <button className={styles.btnSmallOutline}><FaMapMarkerAlt/> ดึงตำแหน่ง</button>
                    </div>
                    <div className={styles.addressGrid}>
                        <input className={styles.inputNew} placeholder="จังหวัด" value={formData.province} onChange={(e)=>handleChange('province', e.target.value)} />
                        <input className={styles.inputNew} placeholder="อำเภอ" value={formData.district} onChange={(e)=>handleChange('district', e.target.value)} />
                        <input className={styles.inputNew} placeholder="ตำบล" value={formData.subDistrict} onChange={(e)=>handleChange('subDistrict', e.target.value)} />
                        <input className={styles.inputNew} placeholder="เบอร์โทร" value={formData.phone} onChange={(e)=>handleChange('phone', e.target.value)} />
                    </div>
                 </div>
             </div>
        </div>
        <div className={styles.modalFooter}>
            <button className={styles.btnCancelNew} onClick={() => setIsEditModalOpen(false)}>ยกเลิก</button>
            <button className={styles.btnSaveNew} onClick={() => setIsEditModalOpen(false)}>บันทึกการเปลี่ยนแปลง</button>
        </div>
      </div>
    </>
  );

  // Dashboard View
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

// ==================================================================================
// 2. ส่วน "แผนที่" (Original Clean Design)
// ==================================================================================
const MapSettingsContent = () => {
  return (
    <div className={styles.settingsSection}>
      <h3 className={styles.settingsTitle}>
        <FaMapMarkedAlt style={{ marginRight: "10px", color: "#6c757d" }} />
        ตั้งค่าแผนที่
      </h3>
      <p className={styles.settingsSubtitle}>
        ตั้งค่าการแสดงผลของแผนที่สาธารณะสำหรับประชาชน
      </p>
      <div className={styles.settingsItem} style={{ borderBottom: "none" }}>
        <div className={styles.settingsItemText}>
          <span>แผนที่สาธารณะ (เปิด/ปิด)</span>
        </div>
        <MockToggle />
      </div>
    </div>
  );
};

// ==================================================================================
// 3. ส่วน "รหัสผ่าน" (Original Clean Design)
// ==================================================================================
const PasswordSettingsContent = () => {
  const [modalUser, setModalUser] = useState(null);
  const [visiblePasswordUsername, setVisiblePasswordUsername] = useState(null);

  const users = [
    { role: "ผู้ดูแลหน่วยงาน", username: "admin_unit_xx", realPassword: "AdminPassword123", icon: FaUserCog },
    { role: "เจ้าหน้าที่", username: "staff_zone_01", realPassword: "Staff_pass_456", icon: FaUserTie },
  ];

  const handleTogglePasswordView = (username) => {
    setVisiblePasswordUsername((prev) => prev === username ? null : username);
  };

  return (
    <>
      <div className={styles.settingsSection}>
        <h3 className={styles.settingsTitle}>
          <FaUnlockAlt style={{ marginRight: "10px", color: "#6c757d" }} />
          รหัสเข้าใช้งาน
        </h3>
        <p className={styles.settingsSubtitle}>
          จัดการและรีเซ็ตรหัสผ่านสำหรับเจ้าหน้าที่และผู้ดูแลหน่วยงาน
        </p>

        {users.map((user, index) => {
          const isVisible = visiblePasswordUsername === user.username;
          return (
            <div key={index} className={styles.settingsItem}>
              <div className={styles.passwordUserItem}>
                <span className={styles.passwordUserInfo}>
                  <user.icon className={styles.passwordUserIcon} />
                  {user.role} ({user.username})
                </span>
                <span className={styles.passwordUserPass}>
                  รหัสผ่าน: {isVisible ? user.realPassword : "***********"}
                </span>
              </div>
              <div className={styles.passwordButtonGroup}>
                <button
                  className={`${styles.passwordButton} ${styles.viewButton} ${isVisible ? styles.viewButtonActive : ""}`}
                  onClick={() => handleTogglePasswordView(user.username)}
                >
                  {isVisible ? <FaEyeSlash /> : <FaEye />} {isVisible ? "ซ่อนรหัส" : "ดูรหัส"}
                </button>
                <button
                  className={`${styles.passwordButton} ${styles.changeButton}`}
                  onClick={() => setModalUser(user)}
                >
                  <FaSyncAlt /> เปลี่ยนรหัส
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {modalUser && <AdminChangePasswordModal onClose={() => setModalUser(null)} user={modalUser} />}
    </>
  );
};

// ==================================================================================
// 4. ส่วน "QR Code หน่วยงาน" (Original Clean Design)
// ==================================================================================
const QRUnitSettingsContent = () => (
  <div className={styles.settingsSection}>
    <h3 className={styles.settingsTitle}>QRCode ประจำหน่วยงาน</h3>
    <p className={styles.settingsSubtitle}>
      ใช้ QR Code นี้สำหรับแชร์ให้ประชาชนทั่วไป เพื่อแจ้งเรื่องเข้ามายังหน่วยงานของคุณ
    </p>
    <div className={styles.qrCodePlaceholder}>
      <FaQrcode className={styles.mockQrIcon} />
      <span>(Mockup QR Code)</span>
    </div>
    <button className={styles.filterApplyButton} style={{ width: "100%" }}>
      ดาวน์โหลด QR Code
    </button>
  </div>
);

// ==================================================================================
// 5. ส่วน "QR Code สร้างเอง" (Original Clean Design)
// ==================================================================================
const QRCreateSettingsContent = () => (
  <div className={styles.settingsSection}>
    <h3 className={styles.settingsTitle}>สร้าง QR Code เอง</h3>
    <p className={styles.settingsSubtitle}>
      สร้าง QR Code เพื่อลิงก์ไปยังประเภทปัญหาที่กำหนดเอง
    </p>
    <form className={styles.qrForm}>
      <div className={styles.filterGroup}>
        <label>เลือกประเภทปัญหา</label>
        <select>
          <option>xxxx (ทั้งหมด)</option>
          <option>xxxx ไฟฟ้า/ประปา</option>
        </select>
      </div>
      <div className={styles.filterGroup}>
        <label>
          <FaLink /> ชื่อลิงก์ (ไม่บังคับ)
        </label>
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
// MAIN VIEW
// ==================================================================================
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
          <label htmlFor="settingsSelect" style={{ paddingLeft: "4px", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px", fontWeight: "700", fontSize: "15px" }}>
            <FaCog /> เมนูตั้งค่าระบบ
          </label>
          <select id="settingsSelect" value={activeSetting} onChange={(e) => setActiveSetting(e.target.value)}>
            {settingsOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>{opt.label}</option>
            ))}
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
