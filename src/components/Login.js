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

        if (liff.isLoggedIn()) {
          console.log("User is logged in via LIFF. Processing login...");
          const idToken = liff.getIDToken();
          if (!idToken) throw new Error("Could not get ID Token from LIFF.");

          const decodedToken = jwtDecode(idToken);
          const userEmail = decodedToken.email;
          console.log("info",decodedToken)

          if (!userEmail) {
            alert("การเข้าสู่ระบบล้มเหลว: จำเป็นต้องได้รับอนุญาตให้เข้าถึงอีเมล กรุณาลองใหม่อีกครั้งและกดยินยอม");
            liff.logout();
            setIsProcessing(false);
            return;
          }

          const userData = {
            email: userEmail,
            first_name: decodedToken.name,
            last_name: "-", // LINE does not provide a separate last name
            provider: "line",
            access_token: decodedToken.sub, // Use 'sub' as a unique token for LINE
          };

          // --- [แก้ไขจุดที่ 1] ---
          // 1. ส่งข้อมูลไป DB และรอรับข้อมูลตอบกลับ
          const response = await fetch(DB_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to save user data to DB");
          }

          // 2. แปลงข้อมูลตอบกลับเป็น JSON
          const userFromDb = await response.json();

          // 3. บันทึก access_token ที่ได้รับจาก Backend ลง localStorage
          if (userFromDb && userFromDb.access_token) {
            localStorage.setItem('accessToken', userFromDb.access_token);
            console.log("LINE login: Token stored successfully!");
            alert(`เข้าสู่ระบบสำเร็จ! ยินดีต้อนรับคุณ ${decodedToken.name}`);
            navigate("/Home");
          } else {
            throw new Error("API did not return access_token for LINE user");
          }
          // --- [สิ้นสุดการแก้ไข] ---

        } else {
          console.log("User is not logged in. Ready for manual login.");
          setIsProcessing(false);
        }
      } catch (error) {
        console.error("LIFF logic error:", error);
        setErrorMessage("เกิดข้อผิดพลาดในการเริ่มต้น LIFF: " + error.message);
        setIsProcessing(false);
      }
    };

    initializeLiff();
  }, [navigate]);

  const handleLineLogin = () => {
    if (!isProcessing) {
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

      console.log("Attempting Google login with user data:", userData);

      // --- [แก้ไขจุดที่ 2] ---
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
        console.log("Google login: Token stored successfully!");
        alert(`เข้าสู่ระบบ Google สำเร็จ! สวัสดี ${user.displayName}`);
        navigate("/Home");
      } else {
        throw new Error("API did not return access_token for Google user");
      }
      // --- [สิ้นสุดการแก้ไข] ---

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

      console.log("Attempting Facebook login with user data:", userData);

      // --- [แก้ไขจุดที่ 3] ---
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
        console.log("Facebook login: Token stored successfully!");
        alert(`เข้าสู่ระบบ Facebook สำเร็จ! สวัสดี ${user.displayName}`);
        navigate("/Home");
      } else {
        throw new Error("API did not return access_token for Facebook user");
      }
      // --- [สิ้นสุดการแก้ไข] ---

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
