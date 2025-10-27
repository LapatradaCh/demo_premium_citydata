import React, { useState } from "react";
import styles from "./css/Signin.module.css";
import logo from "./traffy.png";
import { FaSignOutAlt as LogOut } from "react-icons/fa";

const JoinORG = () => {
  const [unitCode, setUnitCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [generatedOTP, setGeneratedOTP] = useState("");
  const [otpSentTime, setOtpSentTime] = useState(null);
  const [message, setMessage] = useState("");
  const [otpActive, setOtpActive] = useState(false);

  const OTP_EXPIRY_SECONDS = 60;

  const handleLogout = () => {
    setUnitCode("");
    setPhoneNumber("");
    setOtpCode("");
    setGeneratedOTP("");
    setOtpSentTime(null);
    setOtpActive(false);
    setMessage("คุณได้ออกจากระบบแล้ว");
  };

  const handleGetOTP = () => {
    if (!phoneNumber.trim()) return setMessage("กรุณาใส่เบอร์โทรศัพท์ก่อน");
    if (!/^\d{9,10}$/.test(phoneNumber)) return setMessage("เบอร์โทรศัพท์ไม่ถูกต้อง");

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOTP(otp);
    setOtpSentTime(Date.now());
    setMessage(`ส่ง OTP ไปที่ ${phoneNumber} แล้ว (จำลองการส่ง: ${otp})`);
    setOtpActive(true);

    let timeLeft = OTP_EXPIRY_SECONDS;
    const interval = setInterval(() => {
      timeLeft--;
      if (timeLeft <= 0) {
        clearInterval(interval);
        setOtpActive(false);
        setGeneratedOTP("");
        setMessage("รหัส OTP หมดอายุแล้ว กรุณากดปุ่ม OTP อีกครั้ง");
      }
    }, 1000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("");

    if (!unitCode || !phoneNumber || !otpCode)
      return setMessage("กรุณากรอกข้อมูลให้ครบถ้วน");
    if (!generatedOTP) return setMessage("กรุณากดปุ่ม OTP ก่อน");

    const elapsed = (Date.now() - otpSentTime) / 1000;
    if (elapsed > OTP_EXPIRY_SECONDS) {
      setMessage("รหัส OTP หมดอายุแล้ว กรุณากดปุ่ม OTP อีกครั้ง");
      setGeneratedOTP("");
      return;
    }

    if (otpCode === generatedOTP) {
      setMessage(`เข้าสู่ระบบหน่วยงาน ${unitCode} สำเร็จ!`);
      setUnitCode("");
      setPhoneNumber("");
      setOtpCode("");
      setGeneratedOTP("");
    } else {
      setMessage("รหัส OTP ไม่ถูกต้อง");
    }
  };

  return (
    <div className={styles.bodySignin}>
      {/* Logout Button */}
      <div className={styles["logout-icon"]}>
        <button onClick={handleLogout}>
          <LogOut size={18} />
          <span>ออกจากระบบ</span>
        </button>
      </div>

      {/* Container OTP */}
      <div className={styles["otp-container"]}>
        <div className={styles.header}>
          <img src={logo} alt="Logo" className={styles["logo-img"]} />
        </div>

        <form className={styles["otp-form"]} onSubmit={handleSubmit}>
          {/* รหัสหน่วยงาน */}
          <label className={styles.labelUse}>รหัสหน่วยงาน</label>
          <div className={styles.inputField}>
            <input
              type="text"
              value={unitCode}
              onChange={(e) => setUnitCode(e.target.value)}
              placeholder="รหัสหน่วยงาน"
            />
          </div>

          {/* เบอร์โทรศัพท์ */}
          <label className={styles.labelUse}>เบอร์โทรศัพท์</label>
          <div className={styles["phone-otp-group"]}>
            <div className={styles.inputField}>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="ตัวอย่าง: 0812345678"
              />
            </div>
            <button type="button" onClick={handleGetOTP} disabled={otpActive}>
              {otpActive ? "OTP กำลังส่ง..." : "OTP"}
            </button>
          </div>

          {/* รหัส OTP */}
          <label className={styles.labelUse}>รหัส OTP</label>
          <div className={styles.inputField}>
            <input
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              placeholder="กรอกรหัส OTP"
            />
          </div>

          {/* Submit */}
          <button type="submit" className={styles["submit-btn"]}>
            เข้าร่วมหน่วยงาน
          </button>

          {message && <div className={styles.message}>{message}</div>}
        </form>

        <div className={styles["contact-info"]}>ติดต่อสอบถาม: @fonduehelp</div>
      </div>
    </div>
  );
};

export default JoinORG;
