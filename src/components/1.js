import React from "react";
import "./1.css";
import traffyLogo from "./traffy.png";
import { auth, googleProvider, facebookProvider } from "./firebaseConfig";
import { 
  signInWithPopup, 
  FacebookAuthProvider, 
  fetchSignInMethodsForEmail, 
  linkWithCredential 
} from "firebase/auth";

const DB_API = "https://1ed0db3ec62d.ngrok-free.app/users";

const Login = () => {

  // ฟังก์ชันล็อกอิน Google
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userData = {
        Email: user.email,
        Provider: "google",
        Provider_ID: user.uid,
      };

      console.log("ล็อกอิน Google สำเร็จ:", userData);

      await fetch(DB_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      alert(`เข้าสู่ระบบ Google สำเร็จ! สวัสดี ${user.displayName}`);
    } catch (error) {
      if (error.code === "auth/popup-closed-by-user") {
        alert("คุณปิดหน้าต่างล็อกอินก่อนเข้าสู่ระบบ");
      } else {
        console.error("Google login error:", error);
        alert("ไม่สามารถเข้าสู่ระบบด้วย Google ได้");
      }
    }
  };

  // ✅ ฟังก์ชันล็อกอิน Facebook (เวอร์ชันที่รองรับเชื่อม provider)
  const handleFacebookLogin = async () => {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      const user = result.user;

      const userData = {
        Email: user.email,
        Provider: "facebook",
        Provider_ID: user.uid,
      };

      console.log("ล็อกอิน Facebook สำเร็จ:", userData);

      await fetch(DB_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      alert(`เข้าสู่ระบบ Facebook สำเร็จ! สวัสดี ${user.displayName}`);
    } catch (error) {
      console.error("Facebook login error:", error);

      if (error.code === "auth/popup-closed-by-user") {
        alert("คุณปิดหน้าต่างล็อกอินก่อนเข้าสู่ระบบ");
      } 
      else if (error.code === "auth/account-exists-with-different-credential") {
        // ⚠️ เมื่อเจอว่าอีเมลนี้เคยใช้ provider อื่น (เช่น Google)
        const email = error.customData?.email;
        const pendingCred = FacebookAuthProvider.credentialFromError(error);
        const methods = await fetchSignInMethodsForEmail(auth, email);

        if (methods.includes("google.com")) {
          alert("บัญชีนี้เคยสมัครด้วย Google กำลังเชื่อมบัญชีให้...");

          // ให้ผู้ใช้ล็อกอินด้วย Google ก่อน
          const googleResult = await signInWithPopup(auth, googleProvider);
          // แล้วเชื่อม Facebook เข้ากับบัญชี Google เดิม
          await linkWithCredential(googleResult.user, pendingCred);

          // บันทึกข้อมูลอัปเดตไป backend
          const user = googleResult.user;
          const userData = {
            Email: user.email,
            Provider: "google+facebook",
            Provider_ID: user.uid,
          };

          await fetch(DB_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
          });

          alert("เชื่อมบัญชี Facebook เข้ากับ Google สำเร็จ!");
        } else {
          alert("บัญชีนี้ใช้ผู้ให้บริการอื่น กรุณาเข้าสู่ระบบด้วย provider เดิม");
        }
      } 
      else {
        alert("ไม่สามารถเข้าสู่ระบบด้วย Facebook ได้");
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-column">
        <img src={traffyLogo} alt="Traffy Logo" className="logo" />
        <h2>Traffy Fondue</h2>
        <h3>ระบบแจ้งปัญหาเมือง</h3>

        <p className="description">
          เข้าสู่ระบบเพื่อแจ้งปัญหา ติดตามสถานะ และมีส่วนร่วมในการพัฒนาเมืองของคุณ
        </p>

        <button className="facebook-btn" onClick={handleFacebookLogin}>
          เข้าสู่ระบบด้วย Facebook
        </button>

        <button className="google-btn" onClick={handleGoogleLogin}>
          เข้าสู่ระบบด้วย Google
        </button>

        <button className="line-btn">เข้าสู่ระบบด้วย LINE</button>

        <p className="version">เวอร์ชัน 3.0.0</p>
        <p className="contact">สอบถามข้อมูลเพิ่มเติมได้ที่ LINE: @fonduehelp</p>

        <p className="download-text">ดาวน์โหลดและติดตั้งแอปพลิเคชันได้ที่</p>
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
          <a href="https://line.me/R/ti/p/@fonduehelp" target="_blank" rel="noopener noreferrer">
            ติดต่อสอบถาม
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
