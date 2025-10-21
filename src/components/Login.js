import React, { useEffect, useState, useCallback } from "react";
import "./Login.css";
import traffyLogo from "./traffy.png";
import liff from "@line/liff";
import { jwtDecode } from "jwt-decode";
import { auth, googleProvider, facebookProvider } from "./firebaseConfig";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { FaFacebookF, FaLine } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

const DB_API = "https://premium-citydata-api-ab.vercel.app/api/users";
const LIFF_ID = "2008265392-G9mE93Em";

const Login = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // --- [จุดที่ 1: สร้างฟังก์ชันใหม่] ---
  // ฟังก์ชันนี้จะตรวจสอบองค์กรและทำการ redirect
  const checkUserOrgsAndNavigate = useCallback(
    async (userFromDb, successMessage) => {
      // ตรวจสอบว่ามีข้อมูล user ที่จำเป็นหรือไม่
      // **ข้อสมมติ**: ผมใช้ userFromDb.user_id ถ้าใน DB ของคุณเป็น id เฉยๆ ให้แก้ตรงนี้
      // *** แก้ไข: ใช้ userFromDb.id ตามที่คุยกันใน schema ***
      if (!userFromDb || !userFromDb.id || !userFromDb.access_token) {
        console.error("Invalid user data received from DB", userFromDb);
        setErrorMessage("ข้อมูลผู้ใช้ไม่สมบูรณ์ ไม่สามารถตรวจสอบองค์กรได้");
        setIsProcessing(false);
        return;
      }

      try {
        console.log(`Checking organizations for user_id: ${userFromDb.id}`);

        // --- [สำคัญมาก: ต้องสร้าง API นี้ที่ Backend] ---
        // นี่คือ API ที่คุณต้องสร้างเพิ่มใน Vercel
        // เพื่อคืนค่า Array ขององค์กรที่ User คนนี้สังกัดอยู่
        // (อิงจากตาราง users_organizations)
        const orgsResponse = await fetch(
          `${DB_API}/${userFromDb.id}/organizations`, // URL คือ .../api/users/USER_ID/organizations
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              // ส่ง Token ที่เพิ่งได้มา เพื่อยืนยันตัวตน
              Authorization: `Bearer ${userFromDb.access_token}`,
            },
          }
        );

        if (!orgsResponse.ok) {
          throw new Error("Failed to fetch user organizations");
        }

        // สมมติว่า API คืนค่ามาเป็น Array เช่น [{org_id: 1}, {org_id: 2}]
        const organizations = await orgsResponse.json();
        
        // ถ้า API คืนค่ามาเป็น { count: 2 } ให้เปลี่ยนตรงนี้เป็น organizations.count
        const orgCount = Array.isArray(organizations) ? organizations.length : 0;

        console.log(`User belongs to ${orgCount} organization(s).`);

        // เก็บ Token ลง localStorage
        localStorage.setItem("accessToken", userFromDb.access_token);
        alert(successMessage); // แสดง Alert ที่ส่งมาจากฟังก์ชันก่อนหน้า

        if (orgCount > 1) {
          console.log("Navigating to Home1 (Multiple orgs)");
          navigate("/Home1"); // ไปหน้าเลือกองค์กร
        } else {
          // ถ้ามี 1 หรือ 0 องค์กร ก็ไปหน้า Home ปกติ
          console.log("Navigating to Home (Single or Zero orgs)");
          navigate("/Home"); // ไปหน้าหลัก
        }
      } catch (error) {
        console.error("Error checking organizations:", error);
        setErrorMessage(
          "เกิดข้อผิดพลาดในการตรวจสอบข้อมูลองค์กร: " + error.message
        );
        setIsProcessing(false); // หยุดหมุน
      }
    },
    [navigate] // dependency array
  );

  // --- [จุดที่ 2: ปรับปรุง processLiffLogin] ---
  const processLiffLogin = useCallback(async () => {
    try {
      console.log("User is logged in via LIFF. Processing login...");
      const idToken = liff.getIDToken();
      if (!idToken) throw new Error("Could not get ID Token from LIFF.");

      const decodedToken = jwtDecode(idToken);
      const userEmail = decodedToken.email;
      console.log("Decoded Token Info:", decodedToken);

      if (!userEmail) {
        alert(
          "การเข้าสู่ระบบล้มเหลว: จำเป็นต้องได้รับอนุญาตให้เข้าถึงอีเมล กรุณาลองใหม่อีกครั้งและกดยินยอม"
        );
        liff.logout();
        setIsProcessing(false);
        return;
      }

      const userData = {
        email: userEmail,
        first_name: decodedToken.name,
        last_name: "-", // หรือจะใช้ "" ก็ได้ถ้าต้องการ
        provider: "line",
        access_token: decodedToken.sub, // ใช้ sub เป็น access_token สำหรับ LINE
      };

      const response = await fetch(DB_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to save user data to DB"
        );
      }

      const userFromDb = await response.json();

      // --- [แก้ไข] ---
      // เรียกใช้ฟังก์ชัน checkUserOrgsAndNavigate
      if (userFromDb && userFromDb.access_token) {
        const successMessage = `เข้าสู่ระบบสำเร็จ! ยินดีต้อนรับคุณ ${decodedToken.name}`;
        await checkUserOrgsAndNavigate(userFromDb, successMessage); // <-- เรียกใช้ฟังก์ชันใหม่
      } else {
        throw new Error("API did not return access_token for LINE user");
      }
    } catch (error) {
      console.error("LIFF Process Error:", error);
      setErrorMessage("เกิดข้อผิดพลาดในการประมวลผลข้อมูล LIFF: " + error.message);
      setIsProcessing(false);
    }
  }, [navigate, checkUserOrgsAndNavigate]); // <-- เพิ่ม checkUserOrgsAndNavigate

  useEffect(() => {
    const initializeLiff = async () => {
      try {
        await liff.init({ liffId: LIFF_ID });
        console.log("LIFF initialized successfully");

        if (liff.isLoggedIn()) {
          // ถ้าล็อกอินอยู่แล้ว ให้เริ่มประมวลผลข้อมูลเลย (Auto-Login)
          await processLiffLogin();
        } else {
          // ถ้ายังไม่ล็อกอิน ก็พร้อมให้ผู้ใช้กดปุ่ม
          console.log("User is not logged in. Ready for manual login.");
          setIsProcessing(false);
        }
      } catch (error) {
        console.error("LIFF initialization error:", error);
        setErrorMessage("เกิดข้อผิดพลาดในการเริ่มต้น LIFF: " + error.message);
        setIsProcessing(false);
      }
    };

    initializeLiff();
  }, [processLiffLogin]); // ใส่ processLiffLogin เป็น dependency

  const handleLineLogin = () => {
    if (isProcessing) return; // ป้องกันการกดซ้ำซ้อน
    
    setIsProcessing(true); // แสดงสถานะกำลังโหลดก่อน Redirect
    // สั่งให้ LIFF ทำการล็อกอิน
    liff.login({ scope: "profile openid email" });
  };

  // --- [จุดที่ 3: ปรับปรุง handleGoogleLogin] ---
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result._tokenResponse;

      const userData = {
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
        provider: "google",
        access_token: user.oauthAccessToken, // ใช้ oauthAccessToken สำหรับ Google
      };

      const response = await fetch(DB_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save Google user to DB");
      }

      const userFromDb = await response.json();
      
      // --- [แก้ไข] ---
      if (userFromDb && userFromDb.access_token) {
        const successMessage = `เข้าสู่ระบบ Google สำเร็จ! สวัสดี ${user.displayName}`;
        await checkUserOrgsAndNavigate(userFromDb, successMessage); // <-- เรียกใช้ฟังก์ชันใหม่
      } else {
        throw new Error("API did not return access_token for Google user");
      }

    } catch (error) {
      if (error.code === "auth/popup-closed-by-user") {
        alert("คุณปิดหน้าต่างล็อกอินก่อนเข้าสู่ระบบ");
      } else {
        console.error("Google login error:", error);
        alert("ไม่สามารถเข้าสู่ระบบด้วย Google ได้: " + error.message);
      }
      setIsProcessing(false); // เพิ่ม setIsProcessing(false) ใน catch
    }
  };

  // --- [จุดที่ 4: ปรับปรุง handleFacebookLogin] ---
  const handleFacebookLogin = async () => {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      const user = result._tokenResponse;

      const userData = {
        email: user.email,
        first_name: user.firstName || "",
        last_name: user.lastName || "",
        provider: "facebook",
        access_token: user.oauthAccessToken, // ใช้ oauthAccessToken สำหรับ Facebook
      };

      const response = await fetch(DB_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save Facebook user to DB");
      }
      
      const userFromDb = await response.json();

      // --- [แก้ไข] ---
      if (userFromDb && userFromDb.access_token) {
        const successMessage = `เข้าสู่ระบบ Facebook สำเร็จ! สวัสดี ${user.displayName}`;
        await checkUserOrgsAndNavigate(userFromDb, successMessage); // <-- เรียกใช้ฟังก์ชันใหม่
      } else {
        throw new Error("API did not return access_token for Facebook user");
      }

    } catch (error) {
      if (error.code === "auth/popup-closed-by-user") {
        alert("คุณปิดหน้าต่างล็อกอินก่อนเข้าสู่ระบบ");
      } else if (error.code === "auth/account-exists-with-different-credential") {
        alert("บัญชีนี้มีอยู่แล้วกับผู้ให้บริการอื่น กรุณาใช้บัญชีเดิมเข้าสู่ระบบ");
      } else {
        console.error("Facebook login error:", error);
        alert("ไม่สามารถเข้าสู่ระบบด้วย Facebook ได้: " + error.message);
      }
      setIsProcessing(false); // เพิ่ม setIsProcessing(false) ใน catch
    }
  };


  return (
    <div className="login-container">
      <div className="login-column">
        {isProcessing ? (
          <>
            <img src={traffyLogo} alt="Traffy Logo" className="logo" />
            <h3>กำลังตรวจสอบสถานะ...</h3>
          </>
        ) : (
          <>
            <img src={traffyLogo} alt="Traffy Logo" className="logo" />
            <h2>Fondue Dashboard and Manager</h2>
            <h3>แพลตฟอร์มบริหารจัดการปัญหาเมืองสำหรับเจ้าหน้าที่</h3>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <button className="facebook-btn" onClick={handleFacebookLogin}>
              <FaFacebookF size={20} /> เข้าสู่ระบบด้วย Facebook
            </button>
            <button className="google-btn" onClick={handleGoogleLogin}>
              <FcGoogle size={22} /> เข้าสู่ระบบด้วย Google
            </button>
            <button className="line-btn" onClick={handleLineLogin}>
              <FaLine size={20} /> เข้าสู่ระบบด้วย LINE
            </button>

            <div className="bottom-links">
              <a
                href="https://www.traffy.in.th/Traffy-Fondue-247430d4aa7b803b835beb9ee988541f"
                target="_blank"
                rel="noopener noreferrer"
              >
                คู่มือการใช้งาน
              </a>
              <a
                href="line://ti/p/@fonduehelp"
                target="_blank"
                rel="noopener noreferrer"
              >
                ติดต่อสอบถาม
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
