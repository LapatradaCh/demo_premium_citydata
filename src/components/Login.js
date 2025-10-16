import React, { useEffect } from "react";
import "./Login.css";
import traffyLogo from "./traffy.png";
import liff from "@line/liff";
import { jwtDecode } from "jwt-decode"; // ⬅️ เพิ่ม import นี้เข้ามา
import { auth, googleProvider, facebookProvider } from "./firebaseConfig";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { FaFacebookF, FaLine } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

const DB_API = "https://premium-citydata-api-ab.vercel.app/api/users"; // URL API ของคุณ

const Login = () => {
  const navigate = useNavigate();

  // 🔹 เริ่มต้น LIFF
  useEffect(() => {
    const initLiff = async () => {
      try {
        // ID ของ LIFF App คุณ
        await liff.init({ liffId: "2008265392-G9mE93Em" }); 
        console.log("LIFF initialized");
      } catch (error) {
        console.error("LIFF init error:", error);
      }
    };
    initLiff();
  }, []);

  // 🔹 ฟังก์ชันล็อกอิน LINE (ฉบับแก้ไขสมบูรณ์)
  const handleLineLogin = async () => {
    try {
      if (!liff.isLoggedIn()) {
        // ขอ scope 'profile', 'openid', และ 'email' ตอน login
        liff.login({ scope: 'profile openid email' });
      } else {
        const idToken = liff.getIDToken();
        if (!idToken) {
          throw new Error("ไม่สามารถดึง ID Token ได้");
        }

        // ถอดรหัส ID Token เพื่อเอาข้อมูลผู้ใช้
        const decodedToken = jwtDecode(idToken);
        console.log("Decoded Token Info:", decodedToken);
        
        const userEmail = decodedToken.email;

        // ตรวจสอบว่าผู้ใช้ได้อนุญาตให้เข้าถึงอีเมลหรือไม่
        if (!userEmail) {
          alert("ผู้ใช้ไม่ได้อนุญาตให้เข้าถึงอีเมล กรุณาลองอีกครั้งและกดยินยอม");
          // บังคับ logout เพื่อให้ผู้ใช้สามารถกดขอ permission ใหม่ได้ในครั้งถัดไป
          liff.logout(); 
          return;
        }

        const userData = {
          email: userEmail,
          first_name: decodedToken.name, // ใช้ชื่อจาก token
          last_name: "-", // สามารถเว้นว่างหรือจัดการภายหลังได้
          provider: "line",
          access_token: decodedToken.sub, // 'sub' คือ user ID ใน ID Token
        };

        console.log("ล็อกอิน LINE สำเร็จ (ข้อมูลจาก ID Token):", userData);

        // ส่งข้อมูลไปยัง API ของคุณ
        await fetch(DB_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        });

        alert(`เข้าสู่ระบบ LINE สำเร็จ! สวัสดี ${decodedToken.name}`);
        navigate("/Home");
      }
    } catch (error) {
      console.error("LINE login error:", error);
      alert("ไม่สามารถเข้าสู่ระบบด้วย LINE ได้");
    }
  };

  // 🔹 ฟังก์ชันล็อกอิน Google (โค้ดเดิม)
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

      await fetch(DB_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      alert(`เข้าสู่ระบบ Google สำเร็จ! สวัสดี ${user.displayName}`);
      navigate("/Home");
    } catch (error) {
      if (error.code === "auth/popup-closed-by-user") {
        alert("คุณปิดหน้าต่างล็อกอินก่อนเข้าสู่ระบบ");
      } else {
        console.error("Google login error:", error);
        alert("ไม่สามารถเข้าสู่ระบบด้วย Google ได้");
      }
    }
  };

  // 🔹 ฟังก์ชันล็อกอิน Facebook (โค้ดเดิม)
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

      await fetch(DB_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      alert(`เข้าสู่ระบบ Facebook สำเร็จ! สวัสดี ${user.displayName}`);
      navigate("/Home");
    } catch (error) {
      if (error.code === "auth/popup-closed-by-user") {
        alert("คุณปิดหน้าต่างล็อกอินก่อนเข้าสู่ระบบ");
      } else if (error.code === "auth/account-exists-with-different-credential") {
        alert("บัญชีนี้มีอยู่แล้วกับผู้ให้บริการอื่น กรุณาใช้บัญชีเดิมเข้าสู่ระบบ");
      } else {
        console.error("Facebook login error:", error);
        alert("ไม่สามารถเข้าสู่ระบบด้วย Facebook ได้");
      }
    }
  };

  // 🔹 ส่วน JSX สำหรับแสดงผล (โค้ดเดิม)
  return (
    <div className="login-container">
      <div className="login-column">
        <img src={traffyLogo} alt="Traffy Logo" className="logo" />
        <h2>Fondue Dashboard and Manager</h2>
        <h3>แพลตฟอร์มบริหารจัดการปัญหาเมืองสำหรับเจ้าหน้าที่</h3>
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
          <a
            href="https://play.google.com/store/apps/details?id=com.traffy2.traffy_report"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
              alt="Google Play"
            />
          </a>
          <a
            href="https://apps.apple.com/th/app/fondue-manager/id1431630978?l=th"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
              alt="App Store"
            />
          </a>
        </div>

        <div className="links">
          <a
            href="https://www.traffy.in.th/Traffy-Fondue-247430d4aa7b803b835beb9ee988541f"
            target="_blank"
            rel="noopener noreferrer"
          >
            คู่มือการใช้งาน
          </a>
          <p className="contact">
            <a
              href="line://ti/p/@fonduehelp"
              target="_blank"
              rel="noopener noreferrer"
            >
              ติดต่อสอบถาม
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
