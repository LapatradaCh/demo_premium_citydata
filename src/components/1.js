import React, { useEffect } from "react";
import "./1.css";
import traffyLogo from "./traffy.png";
import liff from "@line/liff";
import { auth, googleProvider, facebookProvider } from "./firebaseConfig";
import { signInWithPopup, FacebookAuthProvider } from "firebase/auth";

const DB_API = "https://1ed0db3ec62d.ngrok-free.app/users";

const Login = () => {
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

  // 🔹 LINE Login
  const handleLineLogin = async () => {
    try {
      if (!liff.isLoggedIn()) {
        liff.login();
      } else {
        const profile = await liff.getProfile();

        // ✅ เพิ่มชื่อและนามสกุล (LINE ไม่มีแยก จึงใส่รวมไว้ใน Name)
        const userData = {
          Email: profile.userId + "@line.me",
          Provider: "line",
          Provider_ID: profile.userId,
          First_Name: profile.displayName, // ✅ ชื่อเต็ม
          Last_Name: "", // LINE ไม่มีข้อมูลนามสกุล
        };

        console.log("ล็อกอิน LINE สำเร็จ:", userData);

        await fetch(DB_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        });

        alert(`เข้าสู่ระบบ LINE สำเร็จ! สวัสดี ${profile.displayName}`);
        liff.logout();
        window.location.reload();
      }
    } catch (error) {
      console.error("LINE login error:", error);
      alert("ไม่สามารถเข้าสู่ระบบด้วย LINE ได้");
    }
  };

  // 🔹 Google Login
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // ✅ แยกชื่อกับนามสกุล (Google มักมีชื่อเต็มใน displayName)
      const [firstName, ...lastParts] = (user.displayName || "").split(" ");
      const lastName = lastParts.join(" ");

      const userData = {
        Email: user.email,
        Provider: "google",
        Provider_ID: user.uid,
        First_Name: firstName || "",
        Last_Name: lastName || "",
      };

      console.log("ล็อกอิน Google สำเร็จ:", userData);

      await fetch(DB_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      alert(`เข้าสู่ระบบ Google สำเร็จ! สวัสดี ${user.displayName}`);
      window.location.reload();
    } catch (error) {
      if (error.code === "auth/popup-closed-by-user") {
        alert("คุณปิดหน้าต่างล็อกอินก่อนเข้าสู่ระบบ");
      } else {
        console.error("Google login error:", error);
        alert("ไม่สามารถเข้าสู่ระบบด้วย Google ได้");
      }
    }
  };

  // 🔹 Facebook Login
  const handleFacebookLogin = async () => {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      const user = result.user;
      const credential = FacebookAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken;

      // ✅ แยกชื่อกับนามสกุลเหมือน Google
      const [firstName, ...lastParts] = (user.displayName || "").split(" ");
      const lastName = lastParts.join(" ");

      const userData = {
        Email: user.email,
        Provider: "facebook",
        Provider_ID: user.uid,
        First_Name: firstName || "",
        Last_Name: lastName || "",
      };

      console.log("ล็อกอิน Facebook สำเร็จ:", userData);

      await fetch(DB_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      alert(`เข้าสู่ระบบ Facebook สำเร็จ! สวัสดี ${user.displayName}`);
      window.location.reload();
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
        <h3>แพลตฟอร์มบริหารจัดการปัญหาเมือง</h3>

        <p className="description">
          <span className="highlight">Traffy Fondue</span><br />
          ช่วยให้หน่วยงานบริหารจัดการปัญหาได้รวดเร็วและมีประสิทธิภาพ
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
      </div>
    </div>
  );
};

export default Login;
