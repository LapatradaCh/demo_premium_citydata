import React, { useState } from "react";
import styles from "./css/Signin.module.css";
import logo from "./traffy.png";
import { FaSignOutAlt as LogOut } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // <-- IMPORT
import liff from "@line/liff"; // <-- IMPORT


const DB_API ="https://premium-citydata-api-ab.vercel.app/api/users_organizations";
const ORG_COUNT_API_BASE = "https://premium-citydata-api-ab.vercel.app/api/users_organizations";


const JoinORG = () => {
  const [unitCode, setUnitCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [generatedOTP, setGeneratedOTP] = useState("");
  const [otpSentTime, setOtpSentTime] = useState(null);
  const [message, setMessage] = useState("");
  const [otpActive, setOtpActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false); 

  const navigate = useNavigate(); // <-- ประกาศ navigate

  const OTP_EXPIRY_SECONDS = 60;

  // --- ฟังก์ชัน Logout ใหม่ (ตามที่คุณให้มา) ---
  const handleLogout = async () => {
    const accessToken = localStorage.getItem("accessToken");
    const userId = localStorage.getItem("user_id"); // 1. ดึง user_id มาด้วย
    console.log("Initiating logout for token:", accessToken);

    try {
      // Step 1: Notify the backend
      if (accessToken && userId) { // 2. เช็กว่ามี cả userId ด้วย
        const apiUrl = "https://premium-citydata-api-ab.vercel.app/api/logout";
        await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ user_id: userId }), // 3. ส่ง user_id ไปใน body
        });
        console.log("Backend has been notified of the logout.");
      }
    } catch (error) {
      // It's okay if the backend call fails. We still want to log the user out on the client-side.
      console.error("Failed to notify backend, but proceeding with client-side logout.", error);
    } finally {
      // Step 2: Perform client-side logout actions (this block ALWAYS runs)
      console.log("Executing client-side cleanup.");

      // Logout from LIFF if the user is logged in via LIFF
      if (liff.isLoggedIn()) {
        liff.logout();
      }

      // ALWAYS remove the token from local storage, regardless of login method
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user_id"); // เคลียร์ user_id ด้วย
      localStorage.removeItem("selectedOrg"); // เคลียร์ค่าที่เลือกไว้ด้วย

      // ALWAYS navigate the user back to the login page for a consistent experience
      navigate("/"); // Or '/login'
    }
  };

  // --- จบฟังก์ชัน Logout ---

  // --- ฟังก์ชันขอ OTP (จำลอง) ---
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
  // --- จบฟังก์ชันขอ OTP ---

  // --- ฟังก์ชัน Submit (ที่เชื่อม Backend) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    // 1. ดึง user_id จาก localStorage
    const userIdFromStorage = localStorage.getItem("user_id");

    // 2. ตรวจสอบว่ามี user_id หรือไม่
    if (!userIdFromStorage) {
      setMessage("ไม่พบข้อมูลผู้ใช้, กรุณาเข้าสู่ระบบใหม่");
      return;
    }

    // 3. ตรวจสอบฟอร์ม
    if (!unitCode || !phoneNumber || !otpCode)
      return setMessage("กรุณากรอกข้อมูลให้ครบถ้วน");
    if (!generatedOTP) return setMessage("กรุณากดปุ่ม OTP ก่อน");

    // 4. ตรวจสอบ OTP
    const elapsed = (Date.now() - otpSentTime) / 1000;
    if (elapsed > OTP_EXPIRY_SECONDS) {
      setMessage("รหัส OTP หมดอายุแล้ว กรุณากดปุ่ม OTP อีกครั้ง");
      setGeneratedOTP("");
      return;
    }
    if (otpCode !== generatedOTP) {
      return setMessage("รหัส OTP ไม่ถูกต้อง");
    }

    // 5. ถ้า OTP ถูกต้อง -> ยิง API
    setIsLoading(true);
    try {
    const response = await fetch(DB_API , {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userIdFromStorage,   // <-- ส่ง user_id
          organization_code: unitCode,  // <-- ส่ง unitCode
        }),
      });

      const userId = localStorage.getItem("user_id");
console.log("userInfo:", userId);
      
      const data = await response.json();
      setIsLoading(false); 

      if (response.status === 201) { // 201 Created (เข้าร่วมสำเร็จ)
        setMessage(`เข้าร่วมหน่วยงาน ${unitCode} สำเร็จ!`);
        // เคลียร์ฟอร์ม
        setUnitCode("");
        setPhoneNumber("");
        setOtpCode("");
        setGeneratedOTP("");
        
        // (Optional: พาไปหน้า /home)
        const orgCountResponse = await fetch(`${ORG_COUNT_API_BASE}?user_id=${userId}`);
        const orgData = await orgCountResponse.json();
        const orgCount = orgData.length || 0; 
      if (orgCount > 1) {
        navigate("/home1");
      } else if (orgCount === 1) {
        navigate("/home");
      } else {
        navigate("/Signin");
      }
      } else if (response.status === 409) { // 409 Conflict (อยู่ในหน่วยงานนี้แล้ว)
        setMessage("คุณเป็นสมาชิกของหน่วยงานนี้อยู่แล้ว");
      } else if (response.status === 404) { // 404 Not Found (รหัสหน่วยงาน/user ผิด)
        setMessage("รหัสหน่วยงานไม่ถูกต้อง หรือ ไม่พบข้อมูลผู้ใช้");
      } else {
        setMessage(data.message || "เกิดข้อผิดพลาดในการเข้าร่วม");
      }

    } catch (error) {
      setIsLoading(false);
      console.error("Failed to join organization:", error);
      setMessage("เกิดข้อผิดพลาดในการเชื่อมต่อ: " + error.message);
    }
  };
  // --- จบฟังก์ชัน Submit ---

  return (
    <div className={styles.bodySignin}>
      <div className={styles.logoutIcon}>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={18} />
          <span>ออกจากระบบ</span>
        </button>
      </div>

      <div className={styles.otpContainer}>
        <div className={styles.header}>
          <img src={logo} alt="Logo" className={styles.logoImg} />
        </div>

        <form className={styles.otpForm} onSubmit={handleSubmit}>
          <label className={styles.labelUse}>รหัสหน่วยงาน</label>
          <div className={styles.inputField}>
            <input type="text" value={unitCode} onChange={e => setUnitCode(e.target.value)} placeholder="รหัสหน่วยงาน" disabled={isLoading}/>
          </div>

          <label className={styles.labelUse}>เบอร์โทรศัพท์</label>
          <div className={styles.phoneOtpGroup}>
            <div className={styles.inputField}>
              <input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="0812345678" disabled={isLoading}/>
            </div>
            <button type="button" onClick={handleGetOTP} disabled={otpActive || isLoading}>
              {otpActive ? "OTP กำลังส่ง..." : "OTP"}
            </button>
          </div>

          <label className={styles.labelUse}>รหัส OTP</label>
          <div className={styles.inputField}>
            <input type="text" value={otpCode} onChange={e => setOtpCode(e.target.value)} placeholder="กรอกรหัส OTP" disabled={isLoading}/>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading ? "กำลังดำเนินการ..." : "เข้าร่วมหน่วยงาน"}
          </button>

          {message && <div className={styles.message}>{message}</div>}
        </form>

        <div className={styles.contactInfo}>ติดต่อสอบถาม: @fonduehelp</div>
      </div>
    </div>
  );
};

export default JoinORG;
