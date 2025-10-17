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
          console.log("User is logged in. Processing redirect...");
          const idToken = liff.getIDToken();
          if (!idToken) throw new Error("Could not get ID Token.");

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

          // --- [แก้ไขจุดที่ 1] ---
          // 1. ส่งข้อมูลไป DB และรอรับข้อมูลตอบกลับ
          const response = await fetch(DB_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
          });

          if (!response.ok) throw new Error("Failed to save user data to DB");

          // 2. แปลงข้อมูลตอบกลับเป็น JSON
          const userFromDb = await response.json();

          // 3. บันทึก access_token ลง localStorage
          if (userFromDb && userFromDb.access_token) {
            localStorage.setItem('accessToken', userFromDb.access_token);
            console.log("LINE login: Token stored successfully!");
          } else {
            throw new Error("API did not return access_token for LINE user");
          }
          // --- [สิ้นสุดการแก้ไข] ---

          alert(`เข้าสู่ระบบสำเร็จ! ยินดีต้อนรับคุณ ${decodedToken.name}`);
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

      console.log("ล็อกอิน Google สำเร็จ:", userData);

      // --- [แก้ไขจุดที่ 2] ---
      const response = await fetch(DB_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) throw new Error("Failed to save Google user to DB");

      const userFromDb = await response.json();
      
      if (userFromDb && userFromDb.access_token) {
        localStorage.setItem('accessToken', userFromDb.access_token);
        console.log("Google login: Token stored successfully!");
      } else {
        throw new Error("API did not return access_token for Google user");
      }
      // --- [สิ้นสุดการแก้ไข] ---

      alert(`เข้าสู่ระบบ Google สำเร็จ! สวัสดี ${user.displayName}`);
      navigate("/Home");
    } catch (error) {
      // ... (error handling)
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

      console.log("ล็อกอิน Facebook สำเร็จ:", userData);

      // --- [แก้ไขจุดที่ 3] ---
      const response = await fetch(DB_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) throw new Error("Failed to save Facebook user to DB");
      
      const userFromDb = await response.json();

      if (userFromDb && userFromDb.access_token) {
        localStorage.setItem('accessToken', userFromDb.access_token);
        console.log("Facebook login: Token stored successfully!");
      } else {
        throw new Error("API did not return access_token for Facebook user");
      }
      // --- [สิ้นสุดการแก้ไข] ---

      alert(`เข้าสู่ระบบ Facebook สำเร็จ! สวัสดี ${user.displayName}`);
      navigate("/Home");
    } catch (error) {
      // ... (error handling)
    }
  };

  return (
    // ... (ส่วน JSX ของคุณเหมือนเดิมทั้งหมด)
    <div className="login-container">
      {/* ... */}
    </div>
  );
};

export default Login;
