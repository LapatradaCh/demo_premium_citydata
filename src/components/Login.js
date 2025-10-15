import React, { useEffect } from "react";
import "./Login.css";
import traffyLogo from "./traffy.png";
import liff from "@line/liff";
import { auth } from "./firebaseConfig"; // นำเข้าเฉพาะ auth ก็พอ
import { signInWithPopup, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const DB_API = "https://myapi-331445071173.asia-southeast1.run.app/users";
const LIFF_ID = "2008265392-G9mE93Em"; // 👈 ดึง ID ออกมาเป็นค่าคงที่

const Login = () => {
  const navigate = useNavigate();

  // 🔹 [ปรับปรุง] รวมฟังก์ชันส่งข้อมูลไปที่ API ไว้ในที่เดียว
  const postUserDataToApi = async (userData) => {
    try {
      const response = await fetch(DB_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        // จัดการกรณีที่ API ตอบกลับมาว่ามีปัญหา
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save user data.");
      }

      console.log("User data saved successfully:", userData);
      return await response.json();

    } catch (error) {
      console.error("API post error:", error);
      // ส่ง error ออกไปเพื่อให้ฟังก์ชันที่เรียกใช้จัดการต่อ
      throw error;
    }
  };


  // 🔹 เริ่มต้น LIFF
  useEffect(() => {
    const initLiff = async () => {
      try {
        await liff.init({ liffId: LIFF_ID });
        console.log("LIFF initialized");
      } catch (error) {
        console.error("LIFF init error:", error);
      }
    };
    initLiff();
  }, []); // ใส่ [] เพื่อให้ useEffect ทำงานแค่ครั้งเดียว


  // 🔹 ฟังก์ชันล็อกอิน LINE
  const handleLineLogin = async () => {
    try {
      if (!liff.isLoggedIn()) {
        liff.login(); // ถ้ายังไม่ล็อกอิน ให้ไปหน้าล็อกอินของ LINE
        return; // ออกจากฟังก์ชันไปก่อน เพราะจะมีการ redirect
      }

      const profile = await liff.getProfile();
      const userData = {
        Email: liff.getDecodedIDToken()?.email || `${profile.userId}@line.me`, // 👈 [ปรับปรุง] พยายามดึงอีเมลจริงก่อน
        First_Name: profile.displayName,
        Last_Name: "", // Line ไม่มีนามสกุลแยกมาให้
        Provider: "line",
        Provider_ID: profile.userId,
      };

      await postUserDataToApi(userData);
      alert(`เข้าสู่ระบบ LINE สำเร็จ! สวัสดี ${profile.displayName}`);
      navigate("/Home");

    } catch (error) {
      console.error("LINE login error:", error);
      alert("ไม่สามารถเข้าสู่ระบบด้วย LINE ได้");
    }
  };


  // 🔹 [ปรับปรุง] ฟังก์ชันกลางสำหรับ Firebase Login (Google & Facebook)
  const handleFirebaseLogin = async (provider) => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const providerId = provider.providerId; // 'google.com' หรือ 'facebook.com'

      console.log(`${providerId} user info:`, user);

      // [ปรับปรุง] แยกชื่อ-นามสกุลให้ดีขึ้น
      const displayName = user.displayName || "";
      const nameParts = displayName.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      const userData = {
        Email: user.email,
        First_Name: firstName,
        Last_Name: lastName,
        Provider: providerId.replace(".com", ""), // 'google' หรือ 'facebook'
        Provider_ID: user.uid,
      };

      await postUserDataToApi(userData);
      alert(`เข้าสู่ระบบ ${userData.Provider} สำเร็จ! สวัสดี ${displayName}`);
      navigate("/Home");

    } catch (error) {
      if (error.code === "auth/popup-closed-by-user") {
        // ไม่ต้องแจ้งเตือนก็ได้ เพราะเป็นเรื่องปกติที่ผู้ใช้จะกดยกเลิก
        console.log("User closed the login popup.");
      } else if (error.code === "auth/account-exists-with-different-credential") {
        alert("มีบัญชีที่ใช้อีเมลนี้อยู่แล้ว แต่ล็อกอินด้วยผู้ให้บริการอื่น ลองใช้วิธีล็อกอินเดิมของคุณ");
      } else {
        console.error(`${provider.providerId} login error:`, error);
        alert(`เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย ${provider.providerId}`);
      }
    }
  };


  // 🔹 [ปรับปรุง] ฟังก์ชันสำหรับปุ่มโดยเฉพาะ
  const handleGoogleLogin = () => {
    const provider = new GoogleAuthProvider();
    provider.addScope("email"); // ขอบเขตการขอข้อมูล
    provider.addScope("profile");
    handleFirebaseLogin(provider);
  };

  const handleFacebookLogin = () => {
    const provider = new FacebookAuthProvider();
    provider.addScope("email"); // ขอบเขตการขอข้อมูล
    provider.addScope("public_profile");
    handleFirebaseLogin(provider);
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

        {/* [ปรับปรุง] ปุ่มเรียกใช้ฟังก์ชันที่สร้างขึ้นใหม่ */}
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
