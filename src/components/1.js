// Login.js
import React from "react";
import "./1.css";
import traffyLogo from "./traffy.png";
import { auth, googleProvider, facebookProvider } from "./firebaseConfig";
import { signInWithPopup } from "firebase/auth";
import liff from "@line/liff";
import { useNavigate } from "react-router-dom";

const LIFF_ID = "2008265392-G9mE93Em"; // ใส่ LIFF ID ของคุณ

const Login = () => {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      alert(`เข้าสู่ระบบ Google สำเร็จ! สวัสดี ${user.displayName}`);

      navigate("/login"); // redirect กลับหน้า Login
    } catch (error) {
      if (error.code === "auth/popup-closed-by-user") {
        alert("คุณปิดหน้าต่างล็อกอินก่อนเข้าสู่ระบบ");
      } else {
        console.error("Google login error:", error);
        alert("ไม่สามารถเข้าสู่ระบบด้วย Google ได้");
      }
    }
  };

  const handleFacebookLogin = async () => {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      const user = result.user;

      alert(`เข้าสู่ระบบ Facebook สำเร็จ! สวัสดี ${user.displayName}`);

      navigate("/login"); // redirect กลับหน้า Login
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

  const handleLineLogin = async () => {
    try {
      await liff.init({ liffId: LIFF_ID });
      if (!liff.isLoggedIn()) {
        liff.login(); // LIFF จะ handle popup/redirect
      } else {
        const profile = await liff.getProfile();
        alert(`เข้าสู่ระบบ LINE สำเร็จ! สวัสดี ${profile.displayName}`);

        navigate("/login"); // redirect กลับหน้า Login
      }
    } catch (error) {
      console.error("LINE login error:", error);
      alert("ไม่สามารถเข้าสู่ระบบด้วย LINE ได้");
    }
  };

  return (
    <div className="login-container">
      <div className="login-column">
        <img src={traffyLogo} alt="Traffy Logo" className="logo" />
        <h2>Traffy Fondue</h2>
        <h3>
          Traffy Fondue (ทราฟฟี่ฟองดูว์ / ท่านพี่ฟ้องดู) สามารถช่วยให้หน่วยงานต่างๆ
          บริหารจัดการปัญหาได้ทันท่วงที พร้อมแสดงข้อมูลรายละเอียดของปัญหา ภาพหน้างาน
          และพิกัดตำแหน่ง เพื่อประกอบการตัดสินใจให้เจ้าหน้าที่พร้อมเข้าแก้ไขปัญหาได้อย่างรวดเร็ว
        </h3>

        <button className="facebook-btn" onClick={handleFacebookLogin}>
          เข้าสู่ระบบด้วย Facebook
        </button>

        <button className="google-btn" onClick={handleGoogleLogin}>
          เข้าสู่ระบบด้วย Google
        </button>

        <button className="line-btn" onClick={handleLineLogin}>
          เข้าสู่ระบบด้วย LINE
        </button>

        <p className="contact">สอบถามข้อมูลเพิ่มเติมได้ที่ LINE: @fonduehelp</p>

        <p className="download-text">ดาวน์โหลดและติดตั้งแอปพลิเคชันได้ที่</p>
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
