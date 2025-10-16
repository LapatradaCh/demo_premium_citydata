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

 // 🔽 1. แยก Logic ส่วนจัดการ Token ออกมาเป็นฟังก์ชันใหม่
  const processLineLogin = async () => {
    try {
      const idToken = liff.getIDToken();
      if (!idToken) {
        throw new Error("ไม่สามารถดึง ID Token ได้");
      }

      const decodedToken = jwtDecode(idToken);
      const userEmail = decodedToken.email;

      if (!userEmail) {
        // ถ้าผู้ใช้เคยปฏิเสธสิทธิ์ email ไปแล้ว
        alert("แอปพลิเคชันต้องการสิทธิ์ในการเข้าถึงอีเมล กรุณากดยินยอมอีกครั้ง");
        liff.logout(); // ล้างสถานะเก่า
        // บังคับให้ขออนุญาตใหม่
        liff.login({ scope: 'profile openid email' });
        return;
      }

      const userData = {
        email: userEmail,
        first_name: decodedToken.name,
        last_name: "-",
        provider: "line",
        access_token: decodedToken.sub,
      };

      console.log("ล็อกอิน LINE สำเร็จ:", userData);

      await fetch(DB_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      alert(`เข้าสู่ระบบ LINE สำเร็จ! สวัสดี ${decodedToken.name}`);
      navigate("/Home");

    } catch (error) {
      console.error("Error processing LINE login:", error);
      alert("เกิดข้อผิดพลาดในการประมวลผลข้อมูลล็อกอิน LINE");
    }
  };

  // 🔽 2. ทำให้ useEffect จัดการการล็อกอินอัตโนมัติ
  useEffect(() => {
    const initializeLiff = async () => {
      try {
        await liff.init({ liffId: "2008265392-G9mE93Em" });
        console.log("LIFF initialized");

        // ถ้าผู้ใช้ล็อกอินแล้ว (คือเพิ่งกลับมาจากหน้า LINE)
        if (liff.isLoggedIn()) {
          console.log("User is already logged in. Processing login...");
          await processLineLogin(); // เรียกใช้ฟังก์ชันจัดการ Token ทันที
        }
      } catch (error) {
        console.error("LIFF init error:", error);
      }
    };

    initializeLiff();
  }, []); // ใส่ [] เพื่อให้ useEffect ทำงานครั้งเดียวตอน component โหลด

  // 🔽 3. ปุ่มกดจะทำหน้าที่แค่ "เริ่ม" การล็อกอินเท่านั้น
  const handleLineLogin = () => {
    if (!liff.isLoggedIn()) {
      liff.login({ scope: 'profile openid email' });
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
