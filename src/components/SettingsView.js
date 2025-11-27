import React, { useState } from "react";
import styles from "./css/SettingsView.module.css";
import {
  FaMapMarkedAlt, FaCog, FaTimes, FaUnlockAlt, FaUserCog, FaUserTie,
  FaSyncAlt, FaEye, FaEyeSlash, FaQrcode, FaLink, FaEdit, FaImage,
  FaCheckCircle, FaBuilding, FaRegCopy
} from "react-icons/fa";

// ------------------------------------------------------------------
// --- Helper Components (เหมือนเดิม ไม่แตะ) ---
// ------------------------------------------------------------------
const MockToggle = () => (
  <label className={styles.mockToggle}>
    <input type="checkbox" />
    <span className={styles.mockSlider}></span>
  </label>
);

const AdminChangePasswordModal = ({ onClose, user }) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const handleSubmit = () => {
    if (!newPassword) { alert("กรุณาใส่รหัสผ่านใหม่"); return; }
    if (newPassword !== confirmPassword) { alert("รหัสผ่านใหม่และการยืนยันไม่ตรงกัน"); return; }
    alert(`ตั้งรหัสผ่านใหม่สำเร็จ!`); onClose();
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
            <input type="password" className={styles.searchInput} value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} />
          </div>
          <div className={styles.filterGroup}>
            <label>ยืนยันรหัสผ่านใหม่</label>
            <input type="password" className={styles.searchInput} value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} />
          </div>
          <button className={styles.filterApplyButton} style={{marginTop:10}} onClick={handleSubmit}>ยืนยัน</button>
        </div>
      </div>
    </>
  );
};

// ==================================================================================
// 1. ส่วน "ข้อมูลหน่วยงาน" (Dashboard + Fixed Popup Layout)
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
  const handleChange = (field, value) => { setFormData({ ...formData, [field]: value }); };

  // --- POPUP EDIT MODAL (จัด Layout ใหม่ให้ไม่รก) ---
  const AgencyEditModal = () => (
    <>
      <div className={styles.agencyModalBackdrop} onClick={() => setIsEditModalOpen(false)} />
      <div className={styles.agencyModalContainer}>
        {/* Header: ปุ่มปิดแบบเรียบ (รูปที่ 1) */}
        <div className={styles.agencyModalHeader}>
            <h3 className={styles.agencyModalTitle}>แก้ไขข้อมูลหน่วยงาน</h3>
            <button className={styles.agencyBtnCloseSimple} onClick={() => setIsEditModalOpen(false)}>
                <FaTimes/>
            </button>
        </div>
        
        <div className={styles.agencyModalBody}>
             {/* 1. รูปภาพ (อยู่บนสุดตรงกลาง) */}
             <div className={styles.agencyImageSection}>
                <div className={styles.agencyImageCircle}>
                    <FaImage size={32} color="#ccc"/>
                    <div className={styles.agencyEditOverlay}><FaEdit/></div>
                </div>
             </div>

             {/* 2. ฟอร์มจัดกลุ่ม (ใช้ Grid) */}
             <div className={styles.agencyFormContainer}>
                
                {/* Group 1: ข้อมูลทั่วไป */}
                <div className={styles.agencyFormGroup}>
                    <label className={styles.agencyLabel}>ชื่อหน่วยงาน</label>
                    <input className={styles.agencyInput} value={formData.name} onChange={(e)=>handleChange('name', e.target.value)} />
                </div>

                <div className={styles.agencyRow2}>
                    <div className={styles.agencyFormGroup}>
                        <label className={styles.agencyLabel}>ประเภท <span className={styles.req}>*</span></label>
                        <select className={styles.agencyInput} value={formData.agencyType} onChange={(e)=>handleChange('agencyType', e.target.value)}>
                            <option value="เทศบาล">เทศบาล</option>
                            <option value="อบต">อบต.</option>
                        </select>
                    </div>
                    <div className={styles.agencyFormGroup}>
                        <label className={styles.agencyLabel}>สถานะ <span className={styles.req}>*</span></label>
                        <select className={styles.agencyInput} value={formData.usageType} onChange={(e)=>handleChange('usageType', e.target.value)}>
                            <option value="full">เต็มรูปแบบ</option>
                        </select>
                    </div>
                </div>

                <div className={styles.agencyDivider}></div>

                {/* Group 2: รหัส (วางคู่กัน) */}
                <h4 className={styles.agencySubHeader}><FaUnlockAlt/> รหัสเข้าร่วม</h4>
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

                <div className={styles.agencyDivider}></div>

                {/* Group 3: ที่อยู่ (วางเป็นระเบียบ) */}
                <h4 className={styles.agencySubHeader}><FaMapMarkedAlt/> ที่อยู่ & ติดต่อ</h4>
                <div className={styles.agencyRow2}>
                    <div className={styles.agencyFormGroup}>
                        <label className={styles.agencyLabel}>จังหวัด</label>
                        <input className={styles.agencyInput} value={formData.province} onChange={(e)=>handleChange('province', e.target.value)} />
                    </div>
                    <div className={styles.agencyFormGroup}>
                        <label className={styles.agencyLabel}>อำเภอ/เขต</label>
                        <input className={styles.agencyInput} value={formData.district} onChange={(e)=>handleChange('district', e.target.value)} />
                    </div>
                </div>
                <div className={styles.agencyRow2}>
                    <div className={styles.agencyFormGroup}>
                        <label className={styles.agencyLabel}>ตำบล/แขวง</label>
                        <input className={styles.agencyInput} value={formData.subDistrict} onChange={(e)=>handleChange('subDistrict', e.target.value)} />
                    </div>
                    <div className={styles.agencyFormGroup}>
                        <label className={styles.agencyLabel}>เบอร์โทรศัพท์ <span className={styles.req}>*</span></label>
                        <input className={styles.agencyInput} value={formData.phone} onChange={(e)=>handleChange('phone', e.target.value)} />
                    </div>
                </div>

             </div>
        </div>

        <div className={styles.agencyModalFooter}>
            <button className={styles.agencyBtnCancel} onClick={() => setIsEditModalOpen(false)}>ยกเลิก</button>
            <button className={styles.agencyBtnSave} onClick={() => setIsEditModalOpen(false)}>บันทึก</button>
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
                    <div className={styles.agencyLogoCircle}><FaImage/></div>
                    <div>
                        <h2 className={styles.agencyOrgName}>{formData.name}</h2>
                        <div className={styles.agencyBadges}>
                            <span className={styles.agencyBadgeType}>{formData.agencyType}</span>
                            <span className={styles.agencyBadgeStatus}><FaCheckCircle/> ใช้งานเต็มรูปแบบ</span>
                        </div>
                    </div>
                </div>
                <button className={styles.agencyBtnEdit} onClick={() => setIsEditModalOpen(true)}>
                    <FaEdit /> แก้ไขข้อมูล
                </button>
            </div>

            <div className={styles.agencyInfoGrid}>
                <div className={styles.agencyInfoBox}>
                    <div className={styles.agencyBoxHeader}><FaUnlockAlt style={{color:'#0d6efd'}}/> รหัสเข้าร่วมองค์กร</div>
                    <div className={styles.agencyDataRow}><span>Admin:</span> <strong className={styles.agencyCodeFont}>{formData.adminCode}</strong></div>
                    <div className={styles.agencyDataRow}><span>User:</span> <strong className={styles.agencyCodeFont}>{formData.userCode}</strong></div>
                </div>
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
// 2-5. หน้าอื่นๆ (แผนที่, รหัส, QR) -> ใช้ Code เดิมเป๊ะๆ ไม่เปลี่ยน
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

const PasswordSettingsContent = () => {
  const [modalUser, setModalUser] = useState(null);
  const [visible, setVisible] = useState({});
  const toggle = (user) => setVisible({...visible, [user]: !visible[user]});
  const users = [
    { role: "ผู้ดูแลหน่วยงาน", username: "admin_unit_xx", realPassword: "AdminPassword123", icon: FaUserCog },
    { role: "เจ้าหน้าที่", username: "staff_zone_01", realPassword: "Staff_pass_456", icon: FaUserTie },
  ];
  return (
    <>
      <div className={styles.settingsSection}>
        <h3 className={styles.settingsTitle}>
          <FaUnlockAlt style={{ marginRight: "10px", color: "#6c757d" }} /> รหัสเข้าใช้งาน
        </h3>
        <p className={styles.settingsSubtitle}>จัดการและรีเซ็ตรหัสผ่านสำหรับเจ้าหน้าที่และผู้ดูแลหน่วยงาน</p>
        {users.map((user, index) => {
          const isVisible = visible[user.username];
          return (
            <div key={index} className={styles.settingsItem}>
              <div className={styles.passwordUserItem}>
                <span className={styles.passwordUserInfo}>
                  <user.icon className={styles.passwordUserIcon} /> {user.role} ({user.username})
                </span>
                <span className={styles.passwordUserPass}>
                  รหัสผ่าน: {isVisible ? user.realPassword : "***********"}
                </span>
              </div>
              <div className={styles.passwordButtonGroup}>
                <button className={`${styles.passwordButton} ${styles.viewButton} ${isVisible ? styles.viewButtonActive : ""}`} onClick={() => toggle(user.username)}>
                  {isVisible ? <FaEyeSlash /> : <FaEye />} {isVisible ? "ซ่อน" : "ดู"}
                </button>
                <button className={`${styles.passwordButton} ${styles.changeButton}`} onClick={() => setModalUser(user)}>
                  <FaSyncAlt /> เปลี่ยน
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
