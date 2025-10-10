import React, { useEffect } from "react";
import "./1.css";
import traffyLogo from "./traffy.png";
import liff from "@line/liff";
import { auth, googleProvider, facebookProvider } from "./firebaseConfig";
import { signInWithPopup, FacebookAuthProvider } from "firebase/auth";

const DB_API = "https://1ed0db3ec62d.ngrok-free.app/users"; // ของคุณเอง

const Login = () => {
  // 🔹 เริ่มต้น LIFF
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

  // 🔹 ฟังก์ชันล็อกอิน LINE
  const handleLineLogin = async () => {
    try {
      if (!liff.isLoggedIn()) {
        liff.login();
      } else {
        const profile = await liff.getProfile();
        const userData = {
          Email: profile.userId + "@line.me",
          Provider: "line",
          Provider_ID: profile.userId,
          DisplayName: profile.displayName,
        };

        console.log("ล็อกอิน LINE สำเร็จ:", userData);

        await fetch(DB_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        });

        alert(`เข้าสู่ระบบ LINE สำเร็จ! สวัสดี ${profile.displayName}`);
        liff.logout(); // ✅ ออกจากระบบแล้วกลับหน้า login
        window.location.reload();
      }
    } catch (error) {
      console.error("LINE login error:", error);
      alert("ไม่สามารถเข้าสู่ระบบด้วย LINE ได้");
    }
  };

  // 🔹 ฟังก์ชันล็อกอิน Google
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
      window.location.reload(); // ✅ กลับหน้า login
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
    const user = result.user;
    const credential = FacebookAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken;
        console.log("user info:", user);

    // สร้าง JSON แบบเดียวกับ Google
    const userData = {
      Email: user.email,
      Provider: "facebook",
      Provider_ID: user.uid, // ใช้ uid ของ Firebase เป็น Provider_ID
    };

    console.log("ล็อกอิน Facebook สำเร็จ:", userData);

    // ส่งข้อมูลไปยัง endpoint ของคุณ
    await fetch(DB_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    alert(`เข้าสู่ระบบ Facebook สำเร็จ! สวัสดี ${user.displayName}`);
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
