import React, { useState } from "react";
import styles from "./css/Signin.module.css"; // ตรวจสอบ path ให้ถูกต้อง
import logo from "./traffy.png"; // ตรวจสอบ path รูปภาพ
import { useNavigate } from "react-router-dom";
import liff from "@line/liff";

const DB_API =
  "https://premium-citydata-api-ab.vercel.app/api/users_organizations";
const ORG_COUNT_API_BASE =
  "https://premium-citydata-api-ab.vercel.app/api/users_organizations";

const JoinORG = () => {
  const [unitCode, setUnitCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [generatedOTP, setGeneratedOTP] = useState("");
  const [otpSentTime, setOtpSentTime] = useState(null);
  const [message, setMessage] = useState("");
  const [otpActive, setOtpActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const OTP_EXPIRY_SECONDS = 60;

  // ฟังก์ชัน Logout (กรณีต้องออกจากระบบ)
  const performLogout = async () => {
    const accessToken = localStorage.getItem("accessToken");
    const userId = localStorage.getItem("user_id");

    try {
      if (accessToken && userId) {
        const apiUrl = "https://premium-citydata-api-ab.vercel.app/api/logout";
        await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ user_id: userId }),
        });
      }
    } catch (error) {
      console.error("Logout notify failed", error);
    } finally {
      if (liff.isLoggedIn()) {
        liff.logout();
      }
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user_id");
      localStorage.removeItem("selectedOrg");
      localStorage.removeItem("lastSelectedOrg");
      navigate("/");
    }
  };

  // Logic ปุ่มย้อนกลับ: เช็คว่าเคยเลือก Org มาก่อนไหม
  const handleBack = () => {
    const savedOrg = localStorage.getItem("lastSelectedOrg");
    if (savedOrg) {
      // ถ้ามีข้อมูล Org เก่า แสดงว่าเคย Login แล้ว -> กลับไปหน้า Home1 (Dashboard)
      navigate("/home1");
    } else {
      // ถ้าไม่มี -> Logout กลับหน้าแรก
      performLogout();
    }
  };

  const handleGetOTP = () => {
    if (!phoneNumber.trim()) return setMessage("กรุณาใส่เบอร์โทรศัพท์ก่อน");
    if (!/^\d{9,10}$/.test(phoneNumber)) return setMessage("เบอร์โทรศัพท์ไม่ถูกต้อง");

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOTP(otp);
    setOtpSentTime(Date.now());
    setMessage(`ส่ง OTP ไปที่ ${phoneNumber} แล้ว (จำลอง: ${otp})`);
    setOtpActive(true);

    let timeLeft = OTP_EXPIRY_SECONDS;
    const interval = setInterval(() => {
      timeLeft--;
      if (timeLeft <= 0) {
        clearInterval(interval);
        setOtpActive(false);
        setGeneratedOTP("");
        setMessage("รหัส OTP หมดอายุแล้ว");
      }
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const userIdFromStorage = localStorage.getItem("user_id");
    if (!userIdFromStorage) return setMessage("ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่");
    
    if (!unitCode || !phoneNumber || !otpCode) return setMessage("กรุณากรอกข้อมูลให้ครบ");
    if (!generatedOTP) return setMessage("กรุณากดปุ่ม OTP ก่อน");

    const elapsed = (Date.now() - otpSentTime) / 1000;
    if (elapsed > OTP_EXPIRY_SECONDS) return setMessage("OTP หมดอายุแล้ว");
    if (otpCode !== generatedOTP) return setMessage("รหัส OTP ไม่ถูกต้อง");

    setIsLoading(true);
    try {
      const response = await fetch(DB_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userIdFromStorage,
          organization_code: unitCode,
        }),
      });

      const data = await response.json();
      setIsLoading(false);

      // ฟังก์ชันเช็ค Org หลังจาก Join สำเร็จ
      const checkORG = async () => {
        const orgRes = await fetch(`${ORG_COUNT_API_BASE}?user_id=${userIdFromStorage}`);
        const orgData = await orgRes.json();
        const orgCount = orgData.length || 0;

        if (orgCount > 1) {
          navigate("/home1");
        } else if (orgCount === 1) {
          const sourceOrg = orgData[0];
          const singleOrg = {
            badge: sourceOrg.badge || null,
            id: sourceOrg.organization_id,
            img: sourceOrg.url_logo,
            name: sourceOrg.organization_name
          };
          localStorage.setItem("lastSelectedOrg", JSON.stringify(singleOrg));
          setTimeout(() => navigate('/home'), 100);
        } else {
          navigate("/Signin");
        }
      };

      if (response.status === 201 || response.status === 409) {
        if (response.status === 201) setMessage("เข้าร่วมสำเร็จ!");
        checkORG();
      } else if (response.status === 404) {
        setMessage("รหัสหน่วยงานไม่ถูกต้อง");
      } else {
        setMessage(data.message || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      setIsLoading(false);
      setMessage("Error: " + error.message);
    }
  };

  return (
    <div className={styles.bodySignin}>
      <div className={styles.otpContainer}>
        <div className={styles.header}>
          <img src={logo} alt="Logo" className={styles.logoImg} />
        </div>

        <form className={styles.otpForm} onSubmit={handleSubmit}>
          {/* Unit Code Input */}
          <div>
            <label className={styles.labelUse}>รหัสหน่วยงาน</label>
            <div className={styles.inputField}>
              <input
                type="text"
                value={unitCode}
                onChange={(e) => setUnitCode(e.target.value)}
                placeholder="ระบุรหัสหน่วยงาน..."
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Phone & OTP */}
          <div>
            <label className={styles.labelUse}>เบอร์โทรศัพท์</label>
            <div className={styles.phoneOtpGroup}>
              <div className={styles.inputField}>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="08xxxxxxxx"
                  disabled={isLoading}
                />
              </div>
              <button
                type="button"
                onClick={handleGetOTP}
                disabled={otpActive || isLoading}
              >
                {otpActive ? "..." : "OTP"}
              </button>
            </div>
          </div>

          {/* OTP Code Input */}
          <div>
            <label className={styles.labelUse}>รหัส OTP</label>
            <div className={styles.inputField}>
              <input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="กรอกรหัส 4 หลัก"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className={styles.buttonGroup}>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isLoading}
            >
              {isLoading ? "กำลังโหลด..." : "เข้าร่วมหน่วยงาน"}
            </button>

            <button
              type="button"
              className={styles.goBackBtn}
              onClick={handleBack}
              disabled={isLoading}
            >
              ย้อนกลับ
            </button>
          </div>

          {message && <div className={styles.message}>{message}</div>}
        </form>

        <div className={styles.contactInfo}>ติดต่อสอบถาม: @fonduehelp</div>
      </div>
    </div>
  );
};

export default JoinORG;
