import React, { useEffect, useState, useCallback } from "react"; 
import styles from "./css/Login.module.css";
import traffyLogo from "./traffy.png";
import liff from "@line/liff";
import { jwtDecode } from "jwt-decode";
import { auth, googleProvider, facebookProvider } from "./firebaseConfig";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { FaFacebookF, FaLine } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

const DB_API = "https://premium-citydata-api-ab.vercel.app/api/users";
// [NEW] API Endpoint สำหรับนับจำนวนองค์กรของ User (ต้องสร้างที่ Backend)
const ORG_COUNT_API_BASE = "https://premium-citydata-api-ab.vercel.app/api/users_organizations";
const LIFF_ID = "2008265392-G9mE93Em"; 

const Login = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");


  // [NEW] ฟังก์ชันกลางสำหรับจัดการการนำทาง (Navigation) หลังล็อกอินสำเร็จ
  const handleLoginSuccess = useCallback(async (userFromDb, welcomeName) => {
    try {
      // ตรวจสอบว่าได้ข้อมูล user_id และ access_token มาจาก API ของเราหรือไม่
      if (!userFromDb || !userFromDb.access_token || !userFromDb.user_id) {
        throw new Error("API response is missing access_token or user_id.");
      }

      // 1. เก็บ Token
      localStorage.setItem("user_id", userFromDb.user_id);
      console.log("uid:",userFromDb.user_id)
      localStorage.setItem("accessToken", userFromDb.access_token);
      console.log("token:",userFromDb.access_token)

      console.log("userdata:",userFromDb)
      
      console.log("Token stored successfully!");

      // 2. [สำคัญ] ยิง API เพื่อเช็คจำนวนองค์กร
      const userId = userFromDb.user_id;
      const orgCountResponse = await fetch(`${ORG_COUNT_API_BASE}?user_id=${userId}`);

      if (!orgCountResponse.ok) {
        // ถ้า API เช็คองค์กรล้มเหลว ก็ยังให้ไปหน้า Home ปกติ
        console.error("Failed to fetch organization count. Navigating to /Home as default.");
        alert(`เข้าสู่ระบบสำเร็จ! ยินดีต้อนรับคุณ ${welcomeName}`);
        navigate("/Home1");
        return;
      }

      const orgData = await orgCountResponse.json();
      console.log(orgData)
      // สมมติว่า API คืนค่า { count: N }
      const orgCount = orgData.length || 0; 

      console.log(`User ${userId} is in ${orgCount} organizations.`);

      // 3. แสดง Alert
      alert(`เข้าสู่ระบบสำเร็จ! ยินดีต้อนรับคุณ ${welcomeName}`);
      
      // 4. นำทางตามเงื่อนไข
      if (orgCount > 1) {
        navigate("/home1"); // ไปหน้าเลือกองค์กร
      } else if (orgCount ==1){
        navigate("/home")
      }else {
        navigate("/Signin"); // ไปหน้าหลัก (มี 1 หรือ 0 องค์กร)
      }

    } catch (error) {
      console.error("Login Success Handler Error:", error);
      setErrorMessage("เกิดข้อผิดพลาดหลังล็อกอิน: " + error.message);
      // หากเกิด Error ระหว่างเช็คองค์กร ให้ fallback ไปหน้า Home
      navigate("/Home");
    }
  }, [navigate]); // Dependency คือ navigate


  // --- [MODIFIED] ปรับปรุง processLiffLogin ---
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
        last_name: "-",
        provider: "line",
        access_token: decodedToken.sub,
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

      // [MODIFIED] เรียกใช้ฟังก์ชันกลางแทนการ navigate เอง
      await handleLoginSuccess(userFromDb, decodedToken.name);

    } catch (error) {
      console.error("LIFF Process Error:", error);
      setErrorMessage("เกิดข้อผิดพลาดในการประมวลผลข้อมูล LIFF: " + error.message);
      setIsProcessing(false);
    }
  }, [navigate, handleLoginSuccess]); // [MODIFIED] เพิ่ม handleLoginSuccess ใน dependency

  useEffect(() => {
    const initializeLiff = async () => {
      try {
        await liff.init({ liffId: LIFF_ID });
        console.log("LIFF initialized successfully");

        if (liff.isLoggedIn()) {
          await processLiffLogin();
        } else {
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
  }, [processLiffLogin]); // dependency ถูกต้องแล้ว

  
  const handleLineLogin = () => {
    if (isProcessing) return; 
    setIsProcessing(true); 
    liff.login({ scope: "profile openid email" });
  };


  // --- [MODIFIED] ปรับปรุง handleGoogleLogin ---
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result._tokenResponse;

      const userData = {
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
        provider: "google",
        access_token: user.oauthAccessToken,
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
      
      // [MODIFIED] เรียกใช้ฟังก์ชันกลางแทนการ navigate เอง
      await handleLoginSuccess(userFromDb, user.displayName);

    } catch (error) {
      if (error.code === "auth/popup-closed-by-user") {
        alert("คุณปิดหน้าต่างล็อกอินก่อนเข้าสู่ระบบ");
      } else {
        console.error("Google login error:", error);
        alert("ไม่สามารถเข้าสู่ระบบด้วย Google ได้: " + error.message);
      }
    }
  };

  // --- [MODIFIED] ปรับปรุง handleFacebookLogin ---
  const handleFacebookLogin = async () => {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      const user = result._tokenResponse;

      const userData = {
        email: user.email,
        first_name: user.firstName || "",
        last_name: user.lastName || "",
        provider: "facebook",
        access_token: user.oauthAccessToken,
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

      // [MODIFIED] เรียกใช้ฟังก์ชันกลางแทนการ navigate เอง
      await handleLoginSuccess(userFromDb, user.displayName);

    } catch (error) {
      if (error.code === "auth/popup-closed-by-user") {
        alert("คุณปิดหน้าต่างล็อกอินก่อนเข้าสู่ระบบ");
      } else if (error.code === "auth/account-exists-with-different-credential") {
        alert("บัญชีนี้มีอยู่แล้วกับผู้ให้บริการอื่น กรุณาใช้บัญชีเดิมเข้าสู่ระบบ");
      } else {
        console.error("Facebook login error:", error);
        alert("ไม่สามารถเข้าสู่ระบบด้วย Facebook ได้: " + error.message);
      }
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginColumn}>
        {isProcessing ? (
          <>
            <img src={traffyLogo} alt="Traffy Logo" className={styles.logo} />
            <h3>กำลังตรวจสอบสถานะ...</h3>
          </>
        ) : (
          <>
            <img src={traffyLogo} alt="Traffy Logo" className={styles.logo} />
            <h2>Fondue Dashboard and Manager</h2>
            <h3>แพลตฟอร์มบริหารจัดการปัญหาเมืองสำหรับเจ้าหน้าที่</h3>
            {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
            {/* <button className={styles.facebookBtn} onClick={handleFacebookLogin}>
              <FaFacebookF size={20} /> เข้าสู่ระบบด้วย Facebook
            </button> */}
            <button onClick={handleFacebookLogin} style={{backgroundColor:"#1A77F2", color:"white", bordercolor:"#005fd8"}}>
              <svg aria-label="Facebook logo" width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path fill="white" d="M8 12h5V8c0-6 4-7 11-6v5c-4 0-5 0-5 3v2h5l-1 6h-4v12h-6V18H8z"></path></svg>
              เข้าสู่ระบบด้วย Facebook
            </button>


            {/* <button className={styles.googleBtn} onClick={handleGoogleLogin}>
              <FcGoogle size={22} /> เข้าสู่ระบบด้วย Google
            </button> */}

            <button onClick={handleGoogleLogin} style={{backgroundColor:"white", color:"black", bordercolor:"#e5e5e5"}}>
              <svg aria-label="Google logo" width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g><path d="m0 0H512V512H0" fill="#fff"></path><path fill="#34a853" d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341"></path><path fill="#4285f4" d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"></path><path fill="#fbbc02" d="m90 341a208 200 0 010-171l63 49q-12 37 0 73"></path><path fill="#ea4335" d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"></path></g></svg>
              เข้าสู่ระบบด้วย Google
            </button>

            {/* <button className={styles.lineBtn} onClick={handleLineLogin}>
              <FaLine size={20} /> เข้าสู่ระบบด้วย LINE
            </button> */}

            <button onClick={handleLineLogin} style={{backgroundColor:"#03C755", color:"white", bordercolor:"#00b544"}}>
              <svg aria-label="Line logo" width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><g fill-rule="evenodd" stroke-linejoin="round" fill="white"><path fill-rule="nonzero" d="M12.91 6.57c.232 0 .42.19.42.42 0 .23-.188.42-.42.42h-1.17v.75h1.17a.42.42 0 1 1 0 .84h-1.59a.42.42 0 0 1-.418-.42V5.4c0-.23.188-.42.42-.42h1.59a.42.42 0 0 1-.002.84h-1.17v.75h1.17zm-2.57 2.01a.421.421 0 0 1-.757.251l-1.63-2.217V8.58a.42.42 0 0 1-.42.42.42.42 0 0 1-.418-.42V5.4a.418.418 0 0 1 .755-.249L9.5 7.366V5.4c0-.23.188-.42.42-.42.23 0 .42.19.42.42v3.18zm-3.828 0c0 .23-.188.42-.42.42a.42.42 0 0 1-.418-.42V5.4c0-.23.188-.42.42-.42.23 0 .418.19.418.42v3.18zM4.868 9h-1.59c-.23 0-.42-.19-.42-.42V5.4c0-.23.19-.42.42-.42.232 0 .42.19.42.42v2.76h1.17a.42.42 0 1 1 0 .84M16 6.87C16 3.29 12.41.376 8 .376S0 3.29 0 6.87c0 3.208 2.846 5.896 6.69 6.405.26.056.615.172.705.394.08.2.053.518.026.722 0 0-.092.565-.113.685-.035.203-.16.79.693.432.854-.36 4.607-2.714 6.285-4.646C15.445 9.594 16 8.302 16 6.87"></path></g></svg>
              เข้าสู่ระบบด้วย LINE
            </button>

            <div className={styles.bottomLinks}>
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


