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
} from "react-icons/fa";

// ------------------------------------------------------------------
// --- Components ย่อย (Toggle, Modal) ---
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
    if (!newPassword) {
      alert("กรุณาใส่รหัสผ่านใหม่");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("รหัสผ่านใหม่และการยืนยันไม่ตรงกัน");
      return;
    }
    alert(`(จำลอง) ตั้งรหัสผ่านใหม่สำหรับ ${user.username} สำเร็จ!`);
    onClose();
  };

  return (
    <>
      <div className={styles.filterModalBackdrop} onClick={onClose} />
      <div className={styles.filterModal}>
        <div className={styles.filterModalHeader}>
          <h3>ตั้งรหัสผ่านใหม่ให้: {user.username}</h3>
          <button className={styles.filterModalClose} onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className={styles.filterModalContent} style={{ gap: "15px" }}>
          <div className={styles.filterGroup}>
            <label>รหัสผ่านใหม่</label>
            <input
              type="password"
              className={styles.searchInput}
              placeholder="รหัสผ่านใหม่"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className={styles.filterGroup}>
            <label>ยืนยันรหัสผ่านใหม่</label>
            <input
              type="password"
              className={styles.searchInput}
              placeholder="ยืนยันรหัสผ่านใหม่"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button
            className={styles.filterApplyButton}
            style={{ marginTop: "10px" }}
            onClick={handleSubmit}
          >
            ยืนยันการตั้งรหัสใหม่
          </button>
        </div>
      </div>
    </>
  );
};

// ------------------------------------------------------------------
// --- (*** NEW: 1. เนื้อหา "ข้อมูลหน่วยงาน" - สร้างใหม่ตามรูป ***) ---
// ------------------------------------------------------------------
const AgencyEditContent = () => {
  // Mock Data
  const [formData, setFormData] = useState({
    name: "เทศบาลตำบลตัวอย่าง",
    type: "เทศบาลขนาดกลาง",
    location: "123 หมู่ 1 ถ.สุขุมวิท ต.ปากน้ำ อ.เมือง จ.สมุทรปราการ",
    phone: "02-123-4567",
  });

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className={styles.settingsSection}>
      {/* ส่วนหัวข้อ (Optional) */}
      <h3 className={styles.settingsTitle}>
        <FaBuilding style={{ marginRight: "10px", color: "#6c757d" }} />
        แก้ไขข้อมูลหน่วยงาน
      </h3>

      {/* --- ส่วนรูปภาพ --- */}
      <div className={styles.agencyImageSection}>
        <div className={styles.agencyImageWrapper}>
          <div className={styles.agencyImagePlaceholder}>
            <FaImage className={styles.agencyImageIcon} />
            <span>รูปภาพ</span>
          </div>
          <button className={styles.imageEditBtn} title="แก้ไขรูปภาพ">
            <FaEdit />
          </button>
        </div>
      </div>

      {/* --- ฟอร์มกรอกข้อมูล --- */}
      <div className={styles.editFormContainer}>
        {/* ชื่อหน่วยงาน */}
        <div className={styles.formGroup}>
          <label>ชื่อหน่วยงาน</label>
          <input
            type="text"
            className={styles.searchInput}
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
        </div>

        {/* ประเภทหน่วยงาน */}
        <div className={styles.formGroup}>
          <label>ประเภทหน่วยงาน</label>
          <input
            type="text"
            className={styles.searchInput}
            value={formData.type}
            onChange={(e) => handleChange("type", e.target.value)}
          />
        </div>

        {/* ตำแหน่งหน่วยงาน & แผนที่ */}
        <div className={styles.formGroup}>
          <label>
             ตำแหน่งหน่วยงาน
          </label>
          {/* Input text */}
          <input
            type="text"
            className={styles.searchInput}
            style={{ marginBottom: "10px" }}
            value={formData.location}
            onChange={(e) => handleChange("location", e.target.value)}
          />
          {/* Map Placeholder Box */}
          <div className={styles.mapPlaceholderBox}>
             <FaMapMarkerAlt style={{fontSize: '24px', marginBottom: '8px'}} />
             <span>(พื้นที่แสดงแผนที่ Google Map)</span>
          </div>
        </div>

        {/* เบอร์โทรศัพท์ */}
        <div className={styles.formGroup}>
          <label>
            <FaPhoneAlt style={{ marginRight: "6px", fontSize: "12px" }} />
            เบอร์โทรศัพท์
          </label>
          <input
            type="text"
            className={styles.searchInput}
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
          />
        </div>
      </div>

      {/* --- ปุ่ม Action (แดง/เขียว) --- */}
      <div className={styles.actionButtonRow}>
        <button className={styles.btnCancel}>
            ยกเลิกแก้ไข
        </button>
        <button className={styles.btnConfirm}>
            ยืนยันแก้ไข
        </button>
      </div>
    </div>
  );
};

// --- (2. เนื้อหา "ตั้งค่าแผนที่") ---
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

// --- (3. เนื้อหา "รหัสผ่าน") ---
const PasswordSettingsContent = () => {
  const [modalUser, setModalUser] = useState(null);
  const [visiblePasswordUsername, setVisiblePasswordUsername] = useState(null);

  const users = [
    {
      role: "ผู้ดูแลหน่วยงาน",
      username: "admin_unit_xx",
      realPassword: "AdminPassword123",
      icon: FaUserCog,
    },
    {
      role: "เจ้าหน้าที่",
      username: "staff_zone_01",
      realPassword: "Staff_pass_456",
      icon: FaUserTie,
    },
  ];

  const handleOpenResetModal = (user) => {
    setModalUser(user);
  };

  const handleTogglePasswordView = (username) => {
    setVisiblePasswordUsername((prevUsername) =>
      prevUsername === username ? null : username
    );
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
                  className={`${styles.passwordButton} ${styles.viewButton} ${
                    isVisible ? styles.viewButtonActive : ""
                  }`}
                  onClick={() => handleTogglePasswordView(user.username)}
                >
                  {isVisible ? <FaEyeSlash /> : <FaEye />}
                  {isVisible ? "ซ่อนรหัส" : "ดูรหัส"}
                </button>
                <button
                  className={`${styles.passwordButton} ${styles.changeButton}`}
                  onClick={() => handleOpenResetModal(user)}
                >
                  <FaSyncAlt /> เปลี่ยนรหัส
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {modalUser && (
        <AdminChangePasswordModal
          onClose={() => setModalUser(null)}
          user={modalUser}
        />
      )}
    </>
  );
};

// --- (4. เนื้อหา "QRCode หน่วยงาน") ---
const QRUnitSettingsContent = () => (
  <div className={styles.settingsSection}>
    <h3 className={styles.settingsTitle}>QRCode ประจำหน่วยงาน</h3>
    <p className={styles.settingsSubtitle}>
      ใช้ QR Code นี้สำหรับแชร์ให้ประชาชนทั่วไป
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

// --- (5. เนื้อหา "QRCode สร้างเอง") ---
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
        <input
          type="text"
          placeholder="เช่น 'qr-ไฟดับ-โซนA'"
          className={styles.searchInput}
        />
      </div>
      <button className={styles.filterApplyButton}>สร้าง QR Code</button>
    </form>
    <div
      className={styles.qrCodePlaceholder}
      style={{ marginTop: "20px" }}
    >
      <span>(QR Code ที่สร้างจะแสดงที่นี่)</span>
    </div>
  </div>
);

// --- Main SettingsView ---
const SettingsView = () => {
  // (*** MODIFIED ***) เปลี่ยน "ทั่วไป" เป็น "ข้อมูลหน่วยงาน"
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
      case "ข้อมูลหน่วยงาน":
        return <AgencyEditContent />; // เรียกใช้ Component ใหม่
      case "แผนที่":
        return <MapSettingsContent />;
      case "รหัสผ่าน":
        return <PasswordSettingsContent />;
      case "qrหน่วยงาน":
        return <QRUnitSettingsContent />;
      case "qrสร้างเอง":
        return <QRCreateSettingsContent />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.settingsContainer}>
      <div className={styles.settingsHeaderDropdown}>
        <div className={styles.filterGroup}>
          <label
            htmlFor="settingsSelect"
            style={{
              paddingLeft: "4px",
              marginBottom: "8px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontWeight: "700",
              fontSize: "15px",
            }}
          >
            <FaCog /> เมนูตั้งค่า
          </label>
          <select
            id="settingsSelect"
            value={activeSetting}
            onChange={(e) => setActiveSetting(e.target.value)}
          >
            {settingsOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
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
