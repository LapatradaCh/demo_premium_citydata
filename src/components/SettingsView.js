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
} from "react-icons/fa";

// ------------------------------------------------------------------
// --- (*** 3. SettingsView - "ปรับปรุงใหม่ตามคำขอ" ***) ---
// ------------------------------------------------------------------

// (Component ย่อยสำหรับ Toggle Switch - เหมือนเดิม)
const MockToggle = () => (
  <label className={styles.mockToggle}>
    <input type="checkbox" />
    <span className={styles.mockSlider}></span>
  </label>
);

// (*** NEW COMPONENT: Modal สำหรับ "บังคับรีเซ็ต" ***)
// (*** นี่คือเวอร์ชันที่ปลอดภัยกว่า PasswordChangeModal เดิม ***)
const AdminChangePasswordModal = ({ onClose, user }) => {
  // (*** MODIFIED ***) เราไม่สนรหัสเก่า เราจะตั้งใหม่เลย
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
    // (ณ จุดนี้ คุณจะส่ง API request เพื่อตั้งรหัสใหม่ให้ user.username)
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
          {/* (*** DELETED ***) ลบช่อง "รหัสผ่านเดิม" */}

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

// --- (*** MODIFIED: 1. เนื้อหา "ตั้งค่าทั่วไป" (เพิ่มโปรไฟล์ผู้ใช้ และลบเนื้อหาในรูป) ***) ---
const GeneralSettingsContent = () => {
  // ข้อมูลจำลองของเจ้าหน้าที่ที่ล็อกอินอยู่
  const currentUser = {
    name: "เจ้าหน้าที่ สมชาย ใจดี",
    email: "somchai.j@agency.go.th",
    unit: "ฝ่ายรับเรื่องร้องเรียน",
    role: "เจ้าหน้าที่",
  };

  return (
    <>
      {/* (*** ADDED ***) The Profile Box */}
      <div className={styles.settingsSection}>
        <h3 className={styles.settingsTitle}>👤 โปรไฟล์ของฉัน</h3>
        <div className={styles.settingsItem}>
          <span className={styles.settingsItemText}>ชื่อ-สกุล</span>
          <span
            className={styles.settingsItemValue}
            style={{ cursor: "default", color: "#333", fontWeight: "600" }}
          >
            {currentUser.name}
          </span>
        </div>
        <div className={styles.settingsItem}>
          <span className={styles.settingsItemText}>หน่วยงาน</span>
          <span
            className={styles.settingsItemValue}
            style={{ cursor: "default", color: "#555" }}
          >
            {currentUser.unit}
          </span>
        </div>
        <div className={styles.settingsItem} style={{ borderBottom: "none" }}>
          <span className={styles.settingsItemText}>Email</span>
          <span
            className={styles.settingsItemValue}
            style={{ cursor: "default", color: "#555" }}
          >
            {currentUser.email}
          </span>
        </div>
      </div>

      {/* (*** DELETED PER REQUEST ***)
            กล่อง "การแจ้งเตือน" และ "ทั่วไป (ภาษา)" ถูกลบออกจากหน้านี้
          */}
    </>
  );
};

// --- (*** MODIFIED: 2. เนื้อหา "ตั้งค่าแผนที่" (ปรับปรุงใหม่ตามคำขอ) ***) ---
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

      {/* (*** MODIFIED ***) เหลือแค่ Toggle เดียวตามคำขอ */}
      <div className={styles.settingsItem} style={{ borderBottom: "none" }}>
        <div className={styles.settingsItemText}>
          <span>แผนที่สาธารณะ (เปิด/ปิด)</span>
        </div>
        <MockToggle />
      </div>

      {/* (*** DELETED ***)
            ลบ Toggle "แสดงหมุดสถานะที่เสร็จสิ้น" และ "แสดงหมายเหตุ" ออก
          */}
    </div>
  );
};

// --- (*** MODIFIED: 3. เนื้อหา "รหัสผ่าน" (สลับการมองเห็นได้) ***) ---
const PasswordSettingsContent = () => {
  const [modalUser, setModalUser] = useState(null); // State สำหรับ Modal (เหมือนเดิม)

  // (*** NEW STATE ***) State เพื่อจำว่ารหัสของ username ใดที่กำลังแสดงอยู่
  const [visiblePasswordUsername, setVisiblePasswordUsername] = useState(null);

  // (*** MODIFIED ***)
  // เปลี่ยนจาก password: "..." เป็น realPassword: "..." เพื่อเก็บรหัสจริง
  const users = [
    {
      role: "ผู้ดูแลหน่วยงาน",
      username: "admin_unit_xx",
      realPassword: "AdminPassword123", // <-- รหัสจริง (จำลอง)
      icon: FaUserCog,
    },
    {
      role: "เจ้าหน้าที่",
      username: "staff_zone_01",
      realPassword: "Staff_pass_456", // <-- รหัสจริง (จำลอง)
      icon: FaUserTie,
    },
  ];

  // ฟังก์ชันเปิด Modal (เหมือนเดิม)
  const handleOpenResetModal = (user) => {
    // ส่งข้อมูล user ทั้งหมดไป (เผื่อ Modal ต้องใช้)
    setModalUser(user);
  };

  // (*** MODIFIED ***)
  // เปลี่ยนจาก handleViewPassword เป็นฟังก์ชันสลับการมองเห็น
  const handleTogglePasswordView = (username) => {
    setVisiblePasswordUsername((prevUsername) =>
      // ถ้า username ที่กดมา คืออันเดียวกับที่แสดงอยู่ ให้ซ่อน (null)
      // ถ้าไม่ใช่ ให้แสดงอันใหม่
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

        {/* (*** MODIFIED: อัปเดตการ map ข้อมูล ***) */}
        {users.map((user, index) => {
          // ตรวจสอบว่ารหัสของ user นี้กำลังถูกแสดงอยู่หรือไม่
          const isVisible = visiblePasswordUsername === user.username;

          return (
            <div key={index} className={styles.settingsItem}>
              {/* (ส่วนข้อมูลผู้ใช้ - เหมือนเดิม) */}
              <div className={styles.passwordUserItem}>
                <span className={styles.passwordUserInfo}>
                  <user.icon className={styles.passwordUserIcon} />
                  {user.role} ({user.username})
                </span>

                {/* (*** MODIFIED ***)
                        สลับการแสดงผลรหัสจริง กับ "***********"
                    */}
                <span className={styles.passwordUserPass}>
                  รหัสผ่าน: {isVisible ? user.realPassword : "***********"}
                </span>
              </div>

              {/* (ส่วนปุ่ม - อัปเดต onClick และ ข้อความ) */}
              <div className={styles.passwordButtonGroup}>
                <button
                  // (*** MODIFIED ***) เพิ่ม class 'viewButtonActive' เมื่อกำลังแสดง
                  className={`${styles.passwordButton} ${styles.viewButton} ${
                    isVisible ? styles.viewButtonActive : ""
                  }`}
                  // (*** MODIFIED ***) เรียกใช้ฟังก์ชันสลับการมองเห็น
                  onClick={() => handleTogglePasswordView(user.username)}
                >
                  {/* (*** MODIFIED ***) สลับไอคอนและข้อความ */}
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

      {/* (Modal - เหมือนเดิม) */}
      {modalUser && (
        <AdminChangePasswordModal
          onClose={() => setModalUser(null)}
          user={modalUser} // ส่ง user object ทั้งหมดไป
        />
      )}
    </>
  );
};

// --- (*** REVERTED: 4. เนื้อหา "QRCode หน่วยงาน" (แบบเดิม) ***) ---
const QRUnitSettingsContent = () => (
  <div className={styles.settingsSection}>
    <h3 className={styles.settingsTitle}>QRCode ประจำหน่วยงาน</h3>
    <p className={styles.settingsSubtitle}>
      ใช้ QR Code นี้สำหรับแชร์ให้ประชาชนทั่วไป
      เพื่อแจ้งเรื่องเข้ามายังหน่วยงานของคุณ
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

// --- (*** REVERTED: 5. เนื้อหา "QRCode สร้างเอง" (แบบเดิม) ***) ---
const QRCreateSettingsContent = () => (
  <div className={styles.settingsSection}>
    <h3 className={styles.settingsTitle}>สร้าง QR Code เอง</h3>
    <p className={styles.settingsSubtitle}>
      สร้าง QR Code เพื่อลิงก์ไปยังประเภทปัญหาที่กำหนดเอง (เช่น "แจ้งเหตุไฟดับ")
    </p>
    <form className={styles.qrForm}>
      <div className={styles.filterGroup}>
        <label>เลือกประเภทปัญหา</label>
        <select>
          <option>xxxx (ทั้งหมด)</option>
          <option>xxxx ไฟฟ้า/ประปา</option>
          <option>xxxx ถนน/ทางเท้า</option>
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

// --- (*** REFACTORED: Component หลักสำหรับหน้าตั้งค่า ***) ---
const SettingsView = () => {
  // 1. (*** MODIFIED ***) อัปเดตเมนูตามคำขอ
  const settingsOptions = [
    { id: "ทั่วไป", label: "ตั้งค่า (ทั่วไป)" }, // <-- (*** MODIFIED ***) หน้านี้จะมีโปรไฟล์ผู้ใช้อยู่ด้านบน
    { id: "แผนที่", label: "ตั้งค่าแผนที่" },
    { id: "รหัสผ่าน", label: "รหัสผ่าน (ผู้ดูแล)" }, // <-- (*** ADDED BACK ***)
    { id: "qrหน่วยงาน", label: "QRCode หน่วยงาน" },
    { id: "qrสร้างเอง", label: "QRCode สร้างเอง" },
  ];

  // 2. ตั้งค่าเริ่มต้นเป็น "ทั่วไป" (เพื่อให้เหมือนในรูป)
  const [activeSetting, setActiveSetting] = useState(settingsOptions[0].id);

  // 3. (*** MODIFIED ***) อัปเดตฟังก์ชัน Render ให้ตรงกับเมนู
  const renderSettingContent = () => {
    switch (activeSetting) {
      case "ทั่วไป":
        return <GeneralSettingsContent />; // <-- (*** MODIFIED ***) หน้านี้มีแค่โปรไฟล์
      case "แผนที่":
        return <MapSettingsContent />; // <-- (*** MODIFIED ***) หน้านี้ถูกปรับปรุงแล้ว
      case "รหัสผ่าน":
        return <PasswordSettingsContent />; // <-- (*** MODIFIED ***) ใช้ระบบ 2 ปุ่ม
      case "qrหน่วยงาน":
        return <QRUnitSettingsContent />;
      case "qrสร้างเอง":
        return <QRCreateSettingsContent />;
      default:
        return null;
    }
  };

  // 4. Render UI หลัก (Dropdown + Content) - (เหมือนเดิม)
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
// --- (*** จบส่วนที่ปรับปรุง SettingsView ***) ---

export default SettingsView;
