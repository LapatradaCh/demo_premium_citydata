import React, { useState } from "react";
import styles from "./css/Signin.module.css";
import logo from "./traffy.png";
// import { FaSignOutAlt as LogOut } from "react-icons/fa"; // <-- ไม่ได้ใช้แล้ว ลบออกได้
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

  const handleLogout = async () => {
    const accessToken = localStorage.getItem("accessToken");
    const userId = localStorage.getItem("user_id");
    console.log("Initiating logout for token:", accessToken);

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
        console.log("Backend has been notified of the logout.");
      }
    } catch (error) {
      console.error(
        "Failed to notify backend, but proceeding with client-side logout.",
        error
      );
    } finally {
      console.log("Executing client-side cleanup.");
      if (liff.isLoggedIn()) {
        liff.logout();
      }
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user_id");
      localStorage.removeItem("selectedOrg");
      navigate("/");
    }
  };

  const handleGetOTP = () => {
    if (!phoneNumber.trim()) return setMessage("กรุณาใส่เบอร์โทรศัพท์ก่อน");
    if (!/^\d{9,10}$/.test(phoneNumber))
      return setMessage("เบอร์โทรศัพท์ไม่ถูกต้อง");

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const userIdFromStorage = localStorage.getItem("user_id");

    if (!userIdFromStorage) {
      setMessage("ไม่พบข้อมูลผู้ใช้, กรุณาเข้าสู่ระบบใหม่");
      return;
    }

    if (!unitCode || !phoneNumber || !otpCode)
      return setMessage("กรุณากรอกข้อมูลให้ครบถ้วน");
    if (!generatedOTP) return setMessage("กรุณากดปุ่ม OTP ก่อน");

    const elapsed = (Date.now() - otpSentTime) / 1000;
    if (elapsed > OTP_EXPIRY_SECONDS) {
      setMessage("รหัส OTP หมดอายุแล้ว กรุณากดปุ่ม OTP อีกครั้ง");
      setGeneratedOTP("");
      return;
    }
    if (otpCode !== generatedOTP) {
      return setMessage("รหัส OTP ไม่ถูกต้อง");
    }

    setIsLoading(true);
    try {
      const response = await fetch(DB_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userIdFromStorage,
          organization_code: unitCode,
        }),
      });

      const userId = localStorage.getItem("user_id");
      console.log("userInfo:", userId);

      const data = await response.json();
      setIsLoading(false);

      const orgCountResponse = await fetch(
        `${ORG_COUNT_API_BASE}?user_id=${userId}`
      );
      const orgData = await orgCountResponse.json();
      const orgCount = orgData.length || 0;
      const checkORG = () => {
        if (orgCount > 1) {
          navigate("/home1");
        } else if (orgCount === 1) {
          navigate("/home");
        } else {
          navigate("/Signin");
        }
      };

      if (response.status === 201) {
        setMessage(`เข้าร่วมหน่วยงาน ${unitCode} สำเร็จ!`);
        setUnitCode("");
        setPhoneNumber("");
        setOtpCode("");
        setGeneratedOTP("");
        checkORG();
      } else if (response.status === 409) {
        checkORG();
        console.log("link to your option");
        setMessage("คุณเป็นสมาชิกของหน่วยงานนี้อยู่แล้ว");
      } else if (response.status === 404) {
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

  return (
    <div className={styles.bodySignin}>
      {/* ================== [CHANGE] ==================
        ปุ่ม Logout ที่เป็นไอคอนถูกลบออกจากตรงนี้แล้ว
        ==============================================
      */}

      <div className={styles.otpContainer}>
        <div className={styles.header}>
          <img src={logo} alt="Logo" className={styles.logoImg} />
        </div>

        <form className={styles.otpForm} onSubmit={handleSubmit}>
          <label className={styles.labelUse}>รหัสหน่วยงาน</label>
          <div className={styles.inputField}>
            <input
              type="text"
              value={unitCode}
              onChange={(e) => setUnitCode(e.target.value)}
              placeholder="รหัสหน่วยงาน"
              disabled={isLoading}
            />
          </div>

          <label className={styles.labelUse}>เบอร์โทรศัพท์</label>
          <div className={styles.phoneOtpGroup}>
            <div className={styles.inputField}>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="0812345678"
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

          <label className={styles.labelUse}>รหัส OTP</label>
          <div className={styles.inputField}>
            <input
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              placeholder="กรอกรหัส OTP"
              disabled={isLoading}
            />
          </div>

          <div className={styles.buttonGroup}>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isLoading}
            >
              {isLoading ? "กำลังดำเนินการ..." : "เข้าร่วมหน่วยงาน"}
            </button>

            <button
              type="button"
              className={styles.goBackBtn}
              onClick={handleLogout}
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
