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
const LIFF_ID = "2008265392-G9mE93Em"; // <-- กำหนดค่า LIFF ID ไว้ที่นี่

const Login = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // --- [แก้ไขจุดที่ 1] สร้างฟังก์ชันสำหรับประมวลผลข้อมูลและส่งไป Backend ---
  // ใช้ useCallback เพื่อไม่ให้ฟังก์ชันนี้ถูกสร้างใหม่ทุกครั้งที่ re-render โดยไม่จำเป็น
  const processAndNavigate = useCallback(async (userData) => {
    try {
      console.log(`Processing login for provider: ${userData.provider}`, userData);
      const response = await fetch(DB_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to save ${userData.provider} user to DB`);
      }

      const userFromDb = await response.json();
      if (userFromDb && userFromDb.access_token) {
        localStorage.setItem('accessToken', userFromDb.access_token);
        console.log(`${userData.provider} login: Token stored successfully!`);
        alert(`เข้าสู่ระบบสำเร็จ! ยินดีต้อนรับคุณ ${userData.first_name}`);
        navigate("/Home");
      } else {
        throw new Error(`API did not return access_token for ${userData.provider} user`);
      }
    } catch (error) {
      console.error(`${userData.provider} processing error:`, error);
      setErrorMessage(`เกิดข้อผิดพลาดในการเข้าสู่ระบบ: ${error.message}`);
      setIsProcessing(false);
    }
  }, [navigate]); // dependency คือ navigate

  // --- [แก้ไขจุดที่ 2] ปรับปรุง useEffect ให้จัดการ LIFF อย่างเดียว ---
  useEffect(() => {
    const initializeLiff = async () => {
      try {
        await liff.init({ liffId: LIFF_ID });
        console.log("LIFF initialized successfully");

        if (liff.isLoggedIn()) {
          console.log("User is logged in via LIFF. Processing login...");
          const idToken = liff.getIDToken();
          if (!idToken) throw new Error("Could not get ID Token from LIFF.");

          const decodedToken = jwtDecode(idToken);
          const userEmail = decodedToken.email;

          if (!userEmail) {
            alert("การเข้าสู่ระบบล้มเหลว: จำเป็นต้องได้รับอนุญาตให้เข้าถึงอีเมล กรุณาลองใหม่อีกครั้งและกดยินยอม");
            liff.logout();
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
          
          // เรียกใช้ฟังก์ชันประมวลผลที่สร้างไว้
          await processAndNavigate(userData);

        } else {
          console.log("User is not logged in via LIFF. Ready for manual login.");
          setIsProcessing(false);
        }
      } catch (error) {
        console.error("LIFF logic error:", error);
        setErrorMessage("เกิดข้อผิดพลาดในการเริ่มต้น LIFF: " + error.message);
        setIsProcessing(false);
      }
    };

    initializeLiff();
  }, [processAndNavigate]); // dependency คือ processAndNavigate

  // --- [แก้ไขจุดที่ 3] ปรับปรุง handleLineLogin ให้ทำหน้าที่เดียว ---
  const handleLineLogin = () => {
    if (!isProcessing) {
      setIsProcessing(true); // แสดงสถานะกำลังโหลดทันทีที่กด
      // ขอสิทธิ์ profile, openid, และ email เพื่อให้ได้ข้อมูลครบถ้วน
      liff.login({ scope: 'profile openid email' });
    }
  };

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
      await processAndNavigate(userData);
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
      await processAndNavigate(userData);
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
              <a href="https://www.traffy.in.th/Traffy-Fondue-247430d4aa7b803b835beb9ee988541f" target="_blank" rel="noopener noreferrer">
                คู่มือการใช้งาน
              </a>
              <a href="line://ti/p/@fonduehelp" target="_blank" rel="noopener noreferrer">
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
