import React, { useEffect } from "react";
import "./Login.css";
import traffyLogo from "./traffy.png";
import liff from "@line/liff";
import Swal from 'sweetalert2';
// 1. ลบ import ที่ไม่จำเป็นออกไป (FacebookAuthProvider, GoogleAuthProvider) เพราะเราใช้ตัวที่มาจาก firebaseConfig แล้ว
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider, facebookProvider } from "./firebaseConfig";
import { useNavigate } from "react-router-dom";

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

  const sendDataToApi = async (userData) => {
    const response = await fetch(DB_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error("Failed to send data to API");
    }

    return response.json();
  };

  const handleLineLogin = async () => {
    try {
      if (!liff.isLoggedIn()) {
        liff.login();
      } else {
        const profile = await liff.getProfile();
        const userData = {
          Email: profile.userId + "@line.me", // สร้างอีเมลจำลองสำหรับ LINE
          First_Name: profile.displayName,
          Last_Name: "",
          Provider: "line",
          Provider_ID: profile.userId,
        };
        await sendDataToApi(userData);
        Swal.fire({ icon: 'success', title: `สวัสดีคุณ ${profile.displayName}`, text: 'เข้าสู่ระบบ LINE สำเร็จ!'});
        navigate("/Home");
      }
    } catch (error) {
      console.error("LINE login error:", error);
      Swal.fire({ icon: 'error', title: 'ผิดพลาด', text: "ไม่สามารถเข้าสู่ระบบด้วย LINE ได้" });
    }
  };

  const handleGoogleLogin = () => {
    signInWithPopup(auth, googleProvider)
      .then(async (result) => { // <-- เพิ่ม async ตรงนี้
        const user = result.user;
        
        if (!user.email) {
          Swal.fire({ icon: 'error', title: 'ไม่ได้รับอีเมล', text: 'กรุณายกเลิกสิทธิ์แอปในบัญชี Google แล้วลองใหม่' });
          return;
        }

        const displayName = user.displayName || "";
        const nameParts = displayName.split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        const userData = {
          Email: user.email,
          First_Name: firstName,
          Last_Name: lastName,
          Provider: "google",
          Provider_ID: user.uid,
        };

        // 2. ✅ เพิ่มส่วนที่ขาดหายไปตรงนี้
        await sendDataToApi(userData);
        Swal.fire({ icon: 'success', title: `สวัสดีคุณ ${displayName}`, text: 'เข้าสู่ระบบ Google สำเร็จ!' });
        navigate("/Home");

      })
      .catch((error) => {
        console.error("Google login error:", error);
        Swal.fire({ icon: 'error', title: 'ล็อกอินไม่สำเร็จ', text: error.message });
      });
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

      await sendDataToApi(userData);
      Swal.fire({ icon: 'success', title: `สวัสดีคุณ ${user.displayName}`, text: 'เข้าสู่ระบบ Facebook สำเร็จ!' });
      navigate("/Home");
    } catch (error) {
      console.error("Facebook login error:", error);
      Swal.fire({ icon: 'error', title: 'ล็อกอินไม่สำเร็จ', text: error.message });
    }
  };

  return (
    <div className="login-container">
      <div className="login-column">
        <img src={traffyLogo} alt="Traffy Logo" className="logo" />
        <h2>Fondue Dashboard and Manager</h2>
        <h3>แพลตฟอร์มบริหารจัดการปัญหาเมือง</h3>
        <p className="description">
          <span className="highlight">Traffy Fondue (ทราฟฟี่ฟองดูว์ / ท่านพี่ฟ้องดู)</span>
          <br />
          สามารถช่วยให้หน่วยงานต่างๆ บริหารจัดการปัญหาได้ทันท่วงที พร้อมแสดงข้อมูลรายละเอียดของปัญหา ภาพหน้างาน และพิกัดตำแหน่ง เพื่อประกอบการตัดสินใจให้เจ้าหน้าที่พร้อมเข้าแก้ไขปัญหาได้อย่างรวดเร็ว
        </p>

        <button className="facebook-btn" onClick={handleFacebookLogin}>เข้าสู่ระบบด้วย Facebook</button>
        <button className="google-btn" onClick={handleGoogleLogin}>เข้าสู่ระบบด้วย Google</button>
        <button className="line-btn" onClick={handleLineLogin}>เข้าสู่ระบบด้วย LINE</button>

        {/* ... ส่วนที่เหลือของ JSX เหมือนเดิม ... */}
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
          <p className="contact">
            <a href="line://ti/p/@fonduehelp" target="_blank" rel="noopener noreferrer">
              ติดต่อสอบถาม
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
