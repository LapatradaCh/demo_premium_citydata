import React, { useEffect } from "react";
import "./Login.css";
import traffyLogo from "./traffy.png";
import liff from "@line/liff";
import { auth, googleProvider, facebookProvider } from "./firebaseConfig";
import { signInWithPopup, FacebookAuthProvider } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { FaFacebookF, FaLine } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc"; 
const DB_API = "https://premium-citydata-api-ab.vercel.app/api/users"; // URL API ของคุณ

const Login = () => {
  const navigate = useNavigate();

  // 🔹 เริ่มต้น LIFF
    useEffect(() => {
    const initializeLiff = async () => {
      try {
        await liff.init({ liffId: "2008265392-G9mE93Em" });
        console.log("LIFF initialized");

        // ถ้าผู้ใช้ล็อกอินอยู่แล้ว (หลังจาก redirect กลับมา) ให้เริ่มดึงข้อมูล
        if (liff.isLoggedIn()) {
          console.log("User is logged in, processing data...");
          
          const profile = await liff.getProfile();
          const idToken = liff.getIDToken();
          const accessToken = liff.getAccessToken();

          if (!idToken) {
            alert("ไม่สามารถรับข้อมูลอีเมลได้ กรุณาลองอีกครั้ง");
            liff.logout();
            return;
          }

          // ถอดรหัส ID Token เพื่อเอาอีเมลจริง
          const decodedIdToken = JSON.parse(atob(idToken.split('.')[1]));
          const userEmail = decodedIdToken.email;

          if (!userEmail) {
            alert("ไม่สามารถเข้าถึงอีเมลได้ กรุณาตรวจสอบว่าบัญชี LINE ของคุณได้ยืนยันอีเมลแล้ว");
            liff.logout();
            return;
          }
          
          const userData = {
            email: userEmail,
            first_name: profile.displayName,
            last_name: "-",
            provider: "line",
            access_token: accessToken, // ใช้ Access Token จริง
          };

          console.log("ล็อกอิน LINE สำเร็จ:", userData);

          await fetch(DB_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
          });

          alert(`เข้าสู่ระบบ LINE สำเร็จ! สวัสดี ${profile.displayName}`);
          navigate("/Home");
        }
      } catch (error) {
        console.error("LIFF process error:", error);
      }
    };
    initializeLiff();
  }, [navigate]); 

  // 🔹 ฟังก์ชันล็อกอิน LINE
 const handleLineLogin = () => {
    try {
      if (!liff.isLoggedIn()) {
        // สั่งให้ LIFF เปิดหน้าล็อกอิน พร้อมขอสิทธิ์ในการเข้าถึงอีเมล
        liff.login({ scope: 'profile openid email' });
      }
    } catch (error) {
      console.error("LINE login trigger error:", error);
      alert("ไม่สามารถเข้าสู่ระบบด้วย LINE ได้");
    }
  };

  // 🔹 ฟังก์ชันล็อกอิน Google
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);      
      const emailFromUser = result.email || null; 
      console.log("result:",result)
      console.log("email",result._tokenResponse.email)
      
      const user = result._tokenResponse;
      console.log("user info:", user)
      
      // const [firstName, ...lastParts] = (user.fullName || "").split(" ");
      // const lastName = lastParts.join(" ");

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

  // 🔹 ฟังก์ชันล็อกอิน Facebook
  const handleFacebookLogin = async () => {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      console.log("result:",result)
      const emailFromUser = result.email || null; 
      console.log("email",result._tokenResponse.email)
      const user = result._tokenResponse;
      console.log("email ", user.email)
      // const credential = FacebookAuthProvider.credentialFromResult(result);
      // const accessToken = credential?.accessToken;


      const [firstName, ...lastParts] = (user.displayName || "").split(" ");
      const lastName = lastParts.join(" ");

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
