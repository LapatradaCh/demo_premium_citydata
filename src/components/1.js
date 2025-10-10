import React, { useEffect } from "react";
import "./1.css";
import traffyLogo from "./traffy.png";
import liff from "@line/liff";
import {
  auth,
  googleProvider,
  facebookProvider,
} from "./firebaseConfig";
import {
  signInWithPopup,
  FacebookAuthProvider,
  fetchSignInMethodsForEmail,
  linkWithCredential,
} from "firebase/auth";

const DB_API = "https://1ed0db3ec62d.ngrok-free.app/users"; // ของคุณเอง

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
        const email = profile.userId + "@line.me";

        const userData = {
          Email: email,
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
        liff.logout();
        window.location.reload();
      }
    } catch (error) {
      console.error("LINE login error:", error);
      alert("ไม่สามารถเข้าสู่ระบบด้วย LINE ได้");
    }
  };

  // 🔹 ฟังก์ชันล็อกอินทั่วไป
  const handleProviderLogin = async (provider, providerName) => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // แยกชื่อกับนามสกุล
      const [firstName, ...lastParts] = (user.displayName || "").split(" ");
      const lastName = lastParts.join(" ");

      const userData = {
        Email: user.email,
        First_Name: firstName || "",
        Last_Name: lastName || "",
        Provider: providerName,
        Provider_ID: user.uid,
      };

      // ส่งไปเก็บใน DB
      await fetch(DB_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      alert(`เข้าสู่ระบบ ${providerName} สำเร็จ! สวัสดี ${user.displayName}`);
      window.location.reload();
    } catch (error) {
      if (error.code === "auth/popup-closed-by-user") {
        alert("คุณปิดหน้าต่างล็อกอินก่อนเข้าสู่ระบบ");
      } 
      // ถ้าเจอบัญชีนี้มี provider อื่น
      else if (error.code === "auth/account-exists-with-different-credential") {
        const pendingCred = FacebookAuthProvider.credentialFromError(error) || null;
        const email = error.customData?.email;

        if (!email) {
          alert("เกิดปัญหากับบัญชีนี้ กรุณาลองใหม่อีกครั้ง");
          return;
        }

        // ดึง provider เดิม
        const methods = await fetchSignInMethodsForEmail(auth, email);

        if (methods.length > 0) {
          let existingProviderName = "";
          let existingProvider;

          if (methods.includes("google.com")) {
            existingProviderName = "Google";
            existingProvider = googleProvider;
          } else if (methods.includes("facebook.com")) {
            existingProviderName = "Facebook";
            existingProvider = facebookProvider;
          } else {
            alert(`บัญชีนี้เคยใช้ล็อกอินด้วย ${methods[0]}`);
            return;
          }

          // ให้ผู้ใช้ล็อกอิน provider เดิมก่อน
          const existingResult = await signInWithPopup(auth, existingProvider);
          // เชื่อม provider ใหม่เข้าบัญชีเดิม
          if (pendingCred) {
            await linkWithCredential(existingResult.user, pendingCred);
          }

          alert(`บัญชี ${providerName} ถูกเชื่อมกับบัญชี ${existingProviderName} เรียบร้อยแล้ว!`);
          window.location.reload();
        }
      } else {
        console.error(`${providerName} login error:`, error);
        alert(`ไม่สามารถเข้าสู่ระบบด้วย ${providerName} ได้`);
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-column">
        <img src={traffyLogo} alt="Traffy Logo" className="logo" />
        <h2>Fondue Dashbord and Manager</h2>
        <h3>แพลตฟอร์มบริหารจัดการปัญหาเมือง</h3>

        <button className="facebook-btn" onClick={() => handleProviderLogin(facebookProvider, "Facebook")}>
          เข้าสู่ระบบด้วย Facebook
        </button>

        <button className="google-btn" onClick={() => handleProviderLogin(googleProvider, "Google")}>
          เข้าสู่ระบบด้วย Google
        </button>

        <button className="line-btn" onClick={handleLineLogin}>
          เข้าสู่ระบบด้วย LINE
        </button>
      </div>
    </div>
  );
};

export default Login;
