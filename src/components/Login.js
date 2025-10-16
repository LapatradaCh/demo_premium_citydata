import React, { useEffect, useState } from "react";
import "./Login.css";
import traffyLogo from "./traffy.png";
import liff from "@line/liff";
import { jwtDecode } from "jwt-decode";
import { auth, googleProvider, facebookProvider } from "./firebaseConfig";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { FaFacebookF, FaLine } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

const DB_API = "https://premium-citydata-api-ab.vercel.app/api/users";
const LINE_CHANNEL_ID = "2008265392"; 

const Login = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const initializeLiff = async () => {
      try {
        await liff.init({ liffId: "2008265392-G9mE93Em" }); 
        console.log("LIFF initialized successfully");

        // ตรวจสอบสถานะล็อกอิน (ส่วนนี้จะทำงานหลังกลับมาจาก LINE)
        if (liff.isLoggedIn()) {
          console.log("User is logged in. Processing redirect...");
          const idToken = liff.getIDToken();
          if (!idToken) throw new Error("Could not get ID Token.");

          const decodedToken = jwtDecode(idToken);
          const userEmail = decodedToken.email;
          console.log("after decode", decodedToken)

          if (!userEmail) {
            alert("การเข้าสู่ระบบล้มเหลว: จำเป็นต้องได้รับอนุญาตให้เข้าถึงอีเมล กรุณาลองใหม่อีกครั้งและกดยินยอม");
            liff.logout(); // จุดสำคัญ: ถ้าไม่ได้อีเมล ให้ logout เพื่อให้ครั้งหน้าขอสิทธิ์ใหม่
            setIsProcessing(false);
            return;
          }

          const userData = {
            email: userEmail,
            first_name: decodedToken.name,
            last_name: "-",
            provider: "line",
            access_token: decodedToken.sub,
          };

          console.log("Auto login successful with LINE:", userData);
          
          // ส่งข้อมูลไป DB
          await fetch(DB_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
          });

          alert(`เข้าสู่ระบบสำเร็จ! ยินดีต้อนรับคุณ ${decodedToken.name}`);
          // ไปยังหน้า Home
          navigate("/Home");

        } else {
          console.log("User is not logged in. Ready for manual login.");
          setIsProcessing(false);
        }
      } catch (error) {
        console.error("LIFF logic error:", error);
        setErrorMessage("เกิดข้อผิดพลาดในการเริ่มต้น LIFF");
        setIsProcessing(false);
      }
    };

    initializeLiff();
  }, [navigate]);

  /**
   * ✅ ฟังก์ชันจัดการการล็อกอิน LINE ที่แก้ไขแล้ว
   * กลับมาใช้ liff.login() ซึ่งเป็นวิธีมาตรฐานและแก้ปัญหา Timing Issue
   */
  const handleLineLogin = () => {
    if (!isProcessing) { // ป้องกันการกดซ้ำระหว่างที่แอปกำลังโหลด
      liff.login({ scope: 'profile openid email' });
    }
  };

  // ... (โค้ดของ handleGoogleLogin และ handleFacebookLogin เหมือนเดิม)
  const handleGoogleLogin = async () => { /* ... โค้ดเดิม ... */ };
  const handleFacebookLogin = async () => { /* ... โค้ดเดิม ... */ };

  return (
    <div className="login-container">
      <div className="login-column">
        {isProcessing ? (
          <>
            <img src={traffyLogo} alt="Traffy Logo" className="logo" />
            <h3>กำลังตรวจสอบสถานะ...</h3>
          </>
        ) : (
          <>
            <img src={traffyLogo} alt="Traffy Logo" className="logo" />
            <h2>Fondue Dashboard and Manager</h2>
            <h3>แพลตฟอร์มบริหารจัดการปัญหาเมืองสำหรับเจ้าหน้าที่</h3>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <button className="facebook-btn" onClick={handleFacebookLogin}>
              <FaFacebookF size={20} /> เข้าสู่ระบบด้วย Facebook
            </button>
            <button className="google-btn" onClick={handleGoogleLogin}>
              <FcGoogle size={22} /> เข้าสู่ระบบด้วย Google
            </button>
            <button className="line-btn" onClick={handleLineLogin}>
              <FaLine size={20} /> เข้าสู่ระบบด้วย LINE
            </button>
            
            {/* ... JSX ส่วนที่เหลือเหมือนเดิม ... */}
            <p className="download-text">ดาวน์โหลดและติดตั้งแอปพลิเคชันสำหรับเจ้าหน้าที่ได้ที่</p>
            <div className="store-icons">
              <a href="https://play.google.com/store/apps/details?id=com.traffy2.traffy_report" target="_blank" rel="noopener noreferrer">
                <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" />
              </a>
              <a href="https://apps.apple.com/th/app/fondue-manager/id1431630978?l=th" target="_blank" rel="noopener noreferrer">
                <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="App Store" />
              </a>
            </div>
            <div className="links">
              <a href="https://www.traffy.in.th/Traffy-Fondue-247430d4aa7b803b835beb9ee988541f" target="_blank" rel="noopener noreferrer">
                คู่มือการใช้งาน
              </a>
              <p className="contact">
                <a href="line://ti/p/@fonduehelp" target="_blank" rel="noopener noreferrer">
                  ติดต่อสอบถาม
                </a>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
