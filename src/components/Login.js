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

const Login = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const initializeAndLogin = async () => {
      try {
        await liff.init({ liffId: "2008265392-G9mE93Em" });
        console.log("LIFF initialized successfully");

        if (liff.isLoggedIn()) {
          console.log("User is logged in. Processing redirect...");
          const idToken = liff.getIDToken();
          if (!idToken) {
            liff.logout();
            setIsProcessing(false);
            setErrorMessage("เซสชันล็อกอินไม่ถูกต้อง กรุณาลองใหม่");
            return;
          }

          const decodedToken = jwtDecode(idToken);
          const userEmail = decodedToken.email;

          if (!userEmail) {
            alert("แอปพลิเคชันจำเป็นต้องได้รับอนุญาตให้เข้าถึงอีเมล กรุณาล็อกอินใหม่อีกครั้งและกดยินยอม");
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

          console.log("Auto login successful with LINE:", userData);
          await fetch(DB_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
          });

          alert(`เข้าสู่ระบบสำเร็จ! ยินดีต้อนรับคุณ ${decodedToken.name}`);
          navigate("/Home");

        } else {
          console.log("User is not logged in. Ready for manual login.");
          setIsProcessing(false);
        }
      } catch (error) {
        console.error("LIFF initialization or auto-login error:", error);
        setErrorMessage("เกิดข้อผิดพลาดระหว่างการล็อกอิน กรุณาลองใหม่อีกครั้ง");
        setIsProcessing(false);
      }
    };

    initializeAndLogin();
  }, [navigate]);

  // ✅ ฟังก์ชันที่แก้ไขแล้ว
  const handleLineLogin = () => {
    if (!liff.isLoggedIn()) {
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
      await fetch(DB_API, { /* ... */ });
      navigate("/Home");
    } catch (error) {
      if (error.code !== "auth/popup-closed-by-user") {
        console.error("Google login error:", error);
        alert("ไม่สามารถเข้าสู่ระบบด้วย Google ได้");
      }
    }
  };

  const handleFacebookLogin = async () => {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      const user = result._tokenResponse;
      if (!user.email) {
          alert("ไม่สามารถดึงอีเมลจาก Facebook ได้ กรุณาตรวจสอบว่าบัญชีของคุณมีอีเมลที่ยืนยันแล้ว และอนุญาตให้แอปเข้าถึง");
          return;
      }
      const userData = {
        email: user.email,
        first_name: user.firstName || "",
        last_name: user.lastName || "",
        provider: "facebook",
        access_token: user.oauthAccessToken,
      };
      await fetch(DB_API, { /* ... */ });
      navigate("/Home");
    } catch (error) {
      if (error.code === 'auth/account-exists-with-different-credential') {
        alert("มีบัญชีที่ใช้อีเมลนี้กับผู้ให้บริการอื่นอยู่แล้ว กรุณาเข้าสู่ระบบด้วยช่องทางเดิม");
      } else if (error.code !== 'auth/popup-closed-by-user') {
        console.error("Facebook login error:", error);
        alert("ไม่สามารถเข้าสู่ระบบด้วย Facebook ได้");
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
