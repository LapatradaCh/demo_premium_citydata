import React, { useEffect, useState, useCallback } from "react";
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
const LIFF_ID = "2008265392-G9mE93Em"; // <-- แยกค่าคงที่ออกมา

const Login = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // --- [แก้ไขจุดที่ 1] สร้างฟังก์ชันสำหรับจัดการข้อมูลหลังล็อกอินสำเร็จ ---
  const processLiffLogin = useCallback(async () => {
    try {
      console.log("User is logged in via LIFF. Processing login...");
      const idToken = liff.getIDToken();
      if (!idToken) throw new Error("Could not get ID Token from LIFF.");

      const decodedToken = jwtDecode(idToken);
      const userEmail = decodedToken.email;
      console.log("Decoded Token Info:", decodedToken);

      if (!userEmail) {
        alert(
          "การเข้าสู่ระบบล้มเหลว: จำเป็นต้องได้รับอนุญาตให้เข้าถึงอีเมล กรุณาลองใหม่อีกครั้งและกดยินยอม"
        );
        liff.logout(); // ยังคง logout ไว้ เผื่อกรณีที่ผู้ใช้กดยกเลิก permission
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

      const response = await fetch(DB_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to save user data to DB"
        );
      }

      const userFromDb = await response.json();

      if (userFromDb && userFromDb.access_token) {
        localStorage.setItem("accessToken", userFromDb.access_token);
        console.log("LINE login: Token stored successfully!");
        alert(`เข้าสู่ระบบสำเร็จ! ยินดีต้อนรับคุณ ${decodedToken.name}`);
        navigate("/Home");
      } else {
        throw new Error("API did not return access_token for LINE user");
      }
    } catch (error) {
      console.error("LIFF Process Error:", error);
      setErrorMessage("เกิดข้อผิดพลาดในการประมวลผลข้อมูล LIFF: " + error.message);
      setIsProcessing(false);
    }
  }, [navigate]); // useCallback พร้อม dependency คือ navigate

  useEffect(() => {
    const initializeLiff = async () => {
      try {
        await liff.init({ liffId: LIFF_ID });
        console.log("LIFF initialized successfully");

        if (liff.isLoggedIn()) {
          // ถ้าล็อกอินอยู่แล้ว ให้เริ่มประมวลผลข้อมูลเลย (Auto-Login)
          await processLiffLogin();
        } else {
          // ถ้ายังไม่ล็อกอิน ก็พร้อมให้ผู้ใช้กดปุ่ม
          console.log("User is not logged in. Ready for manual login.");
          setIsProcessing(false);
        }
      } catch (error) {
        console.error("LIFF initialization error:", error);
        setErrorMessage("เกิดข้อผิดพลาดในการเริ่มต้น LIFF: " + error.message);
        setIsProcessing(false);
      }
    };

    initializeLiff();
  }, [processLiffLogin]); // ใส่ processLiffLogin เป็น dependency

  // --- [แก้ไขจุดที่ 2] ปรับปรุง handleLineLogin ให้ชัดเจนขึ้น ---
  const handleLineLogin = () => {
    if (isProcessing) return; // ป้องกันการกดซ้ำซ้อน
    
    setIsProcessing(true); // แสดงสถานะกำลังโหลดก่อน Redirect
    // สั่งให้ LIFF ทำการล็อกอิน, หลังจากนี้หน้าเว็บจะถูก Redirect
    // และเมื่อกลับมา `useEffect` จะทำงานและตรวจจับสถานะ `liff.isLoggedIn()` ที่เป็น true เอง
    liff.login({ scope: "profile openid email" });
  };


  // ... (โค้ดของ handleGoogleLogin และ handleFacebookLogin ยังคงเหมือนเดิม) ...
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result._tokenResponse;

      const userData = {
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
        provider: "google",
        access_token: user.oauthAccessToken,
      };

      const response = await fetch(DB_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save Google user to DB");
      }

      const userFromDb = await response.json();
      
      if (userFromDb && userFromDb.access_token) {
        localStorage.setItem('accessToken', userFromDb.access_token);
        alert(`เข้าสู่ระบบ Google สำเร็จ! สวัสดี ${user.displayName}`);
        navigate("/Home");
      } else {
        throw new Error("API did not return access_token for Google user");
      }

    } catch (error) {
      if (error.code === "auth/popup-closed-by-user") {
        alert("คุณปิดหน้าต่างล็อกอินก่อนเข้าสู่ระบบ");
      } else {
        console.error("Google login error:", error);
        alert("ไม่สามารถเข้าสู่ระบบด้วย Google ได้: " + error.message);
      }
    }
  };

  const handleFacebookLogin = async () => {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      const user = result._tokenResponse;

      const userData = {
        email: user.email,
        first_name: user.firstName || "",
        last_name: user.lastName || "",
        provider: "facebook",
        access_token: user.oauthAccessToken,
      };

      const response = await fetch(DB_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save Facebook user to DB");
      }
      
      const userFromDb = await response.json();

      if (userFromDb && userFromDb.access_token) {
        localStorage.setItem('accessToken', userFromDb.access_token);
        alert(`เข้าสู่ระบบ Facebook สำเร็จ! สวัสดี ${user.displayName}`);
        navigate("/Home");
      } else {
        throw new Error("API did not return access_token for Facebook user");
      }

    } catch (error) {
      if (error.code === "auth/popup-closed-by-user") {
        alert("คุณปิดหน้าต่างล็อกอินก่อนเข้าสู่ระบบ");
      } else if (error.code === "auth/account-exists-with-different-credential") {
        alert("บัญชีนี้มีอยู่แล้วกับผู้ให้บริการอื่น กรุณาใช้บัญชีเดิมเข้าสู่ระบบ");
      } else {
        console.error("Facebook login error:", error);
        alert("ไม่สามารถเข้าสู่ระบบด้วย Facebook ได้: " + error.message);
      }
    }
  };


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

            <div className="bottom-links">
              <a
                href="https://www.traffy.in.th/Traffy-Fondue-247430d4aa7b803b835beb9ee988541f"
                target="_blank"
                rel="noopener noreferrer"
              >
                คู่มือการใช้งาน
              </a>
              <a
                href="line://ti/p/@fonduehelp"
                target="_blank"
                rel="noopener noreferrer"
              >
                ติดต่อสอบถาม
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
