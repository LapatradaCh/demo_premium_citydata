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
// ... (imports และ code ส่วนอื่นๆ เหมือนเดิม)

// 🔹 ฟังก์ชันล็อกอิน LINE (อัปเดตล่าสุด)
const handleLineLogin = async () => {
  try {
    if (!liff.isLoggedIn()) {
      liff.login({ scope: 'profile openid email' });
      return; // ออกจากฟังก์ชันไปก่อน เพราะหน้าจะ redirect
    }

    const idToken = liff.getIDToken();
    if (!idToken) {
      throw new Error("ไม่สามารถดึง ID Token ได้");
    }

    const decodedToken = jwtDecode(idToken);
    const userEmail = decodedToken.email;

    // ❗️ จุดแก้ไข: ตรวจสอบว่าได้อีเมลหรือไม่
    if (!userEmail) {
      // 1. สร้าง URL สำหรับขออนุญาตใหม่
      const liffId = "2008265392-G9mE93Em"; // LIFF ID ของคุณ
      const redirectUri = window.location.href; // URL หน้าปัจจุบันที่จะให้ LINE redirect กลับมา
      const consentUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${liff.getOS() === 'web' ? '2008265392' : liffId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=profile%20openid%20email&prompt=consent&state=some_string`;
      // ⚠️ หมายเหตุ: คุณต้องใส่ Channel ID ของคุณเองตรง 'YOUR_CHANNEL_ID' สำหรับ Web

      // 2. แจ้งเตือนผู้ใช้และส่งไปหน้าขออนุญาต
      alert("แอปพลิเคชันต้องการสิทธิ์ในการเข้าถึงอีเมลเพื่อดำเนินการต่อ กรุณากดยินยอมในหน้าถัดไป");
      window.location.href = consentUrl; // สั่งให้ redirect ไปยังหน้าขอสิทธิ์
      return; // หยุดการทำงานส่วนที่เหลือ
    }

    // ถ้าได้อีเมลแล้ว ก็ทำงานตามปกติ
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
