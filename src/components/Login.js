import React, { useEffect } from "react";
import "./Login.css";
import traffyLogo from "./traffy.png";
import liff from "@line/liff";
import { auth, googleProvider, facebookProvider } from "./firebaseConfig";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { FaFacebookF, FaLine } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc"; 
const DB_API = "https://myapi-331445071173.asia-southeast1.run.app/users";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const initLiff = async () => {
      try {
        await liff.init({ liffId: "2008265392-G9mE93Em" });
        console.log("LIFF initialized");
      } catch (error) {
        console.error("LIFF init error:", error);
      }
    };
    initLiff();
  }, []);

  const handleLineLogin = async () => {
    try {
      if (!liff.isLoggedIn()) liff.login();
      else {
        const profile = await liff.getProfile();
        const userData = {
          Email: profile.userId + "@line.me",
          First_Name: profile.displayName,
          Last_Name: "-",
          Provider: "line",
          Provider_ID: profile.userId,
        };
        await fetch(DB_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        });
        alert(`เข้าสู่ระบบ LINE สำเร็จ! สวัสดี ${profile.displayName}`);
        navigate("/Home");
      }
    } catch (error) {
      console.error("LINE login error:", error);
      alert("ไม่สามารถเข้าสู่ระบบด้วย LINE ได้");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const [firstName, ...lastParts] = (user.displayName || "").split(" ");
      const lastName = lastParts.join(" ");

      const userData = {
        Email: user.email,
        First_Name: firstName || "",
        Last_Name: lastName || "",
        Provider: "google",
        Provider_ID: user.uid,
      };

      await fetch(DB_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      alert(`เข้าสู่ระบบ Google สำเร็จ! สวัสดี ${user.displayName}`);
      navigate("/Home");
    } catch (error) {
      if (error.code === "auth/popup-closed-by-user") 
        alert("คุณปิดหน้าต่างล็อกอินก่อนเข้าสู่ระบบ");
      else {
        console.error("Google login error:", error);
        alert("ไม่สามารถเข้าสู่ระบบด้วย Google ได้");
      }
    }
  };

  const handleFacebookLogin = async () => {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      const user = result.user;
      const [firstName, ...lastParts] = (user.displayName || "").split(" ");
      const lastName = lastParts.join(" ");

      const userData = {
        Email: user.email,
        First_Name: firstName || "",
        Last_Name: lastName || "",
        Provider: "facebook",
        Provider_ID: user.uid,
      };

      await fetch(DB_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      alert(`เข้าสู่ระบบ Facebook สำเร็จ! สวัสดี ${user.displayName}`);
      navigate("/Home");
    } catch (error) {
      if (error.code === "auth/popup-closed-by-user") 
        alert("คุณปิดหน้าต่างล็อกอินก่อนเข้าสู่ระบบ");
      else if (error.code === "auth/account-exists-with-different-credential") 
        alert("บัญชีนี้มีอยู่แล้วกับผู้ให้บริการอื่น กรุณาใช้บัญชีเดิมเข้าสู่ระบบ");
      else {
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

        {/* Links ด้านล่างสุด */}
        <div className="bottom-links">
          <a href="https://www.traffy.in.th/Traffy-Fondue-247430d4aa7b803b835beb9ee988541f" target="_blank" rel="noopener noreferrer">
            คู่มือการใช้งาน
          </a>
          <a href="line://ti/p/@fonduehelp" target="_blank" rel="noopener noreferrer">
            ติดต่อสอบถาม
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
