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
const ORG_COUNT_API_BASE = "https://premium-citydata-api-ab.vercel.app/api/users_organizations";
const LIFF_ID = "2008265392-G9mE93Em"; 

const Login = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [processingMethod, setProcessingMethod] = useState(""); // เพิ่ม state ช่องทาง login

  // ฟังก์ชันกลางจัดการ navigation หลังล็อกอิน
  const handleLoginSuccess = useCallback(async (userFromDb, welcomeName) => {
    try {
      if (!userFromDb || !userFromDb.access_token || !userFromDb.user_id) {
        throw new Error("API response is missing access_token or user_id.");
      }

      localStorage.setItem("user_id", userFromDb.user_id);
      localStorage.setItem("accessToken", userFromDb.access_token);

      const userId = userFromDb.user_id;
      const orgCountResponse = await fetch(`${ORG_COUNT_API_BASE}?user_id=${userId}`);
      if (!orgCountResponse.ok) {
        navigate("/Home1");
        return;
      }

      const orgData = await orgCountResponse.json();
      const orgCount = orgData.length || 0; 

      if (orgCount > 1) {
        navigate("/home1");
      } else if (orgCount === 1) {
        navigate("/home");
      } else {
        navigate("/Signin");
      }
    } catch (error) {
      console.error("Login Success Handler Error:", error);
      setErrorMessage("เกิดข้อผิดพลาดหลังล็อกอิน: " + error.message);
      navigate("/Home");
    }
  }, [navigate]);

  // LIFF Login
  const processLiffLogin = useCallback(async () => {
    try {
      const idToken = liff.getIDToken();
      if (!idToken) throw new Error("Could not get ID Token from LIFF.");

      const decodedToken = jwtDecode(idToken);
      const userEmail = decodedToken.email;

      if (!userEmail) {
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
        throw new Error(errorData.message || "Failed to save user data to DB");
      }

      const userFromDb = await response.json();
      await handleLoginSuccess(userFromDb, decodedToken.name);

    } catch (error) {
      console.error("LIFF Process Error:", error);
      setErrorMessage("เกิดข้อผิดพลาดในการประมวลผลข้อมูล LIFF: " + error.message);
      setIsProcessing(false);
    }
  }, [handleLoginSuccess]);

  useEffect(() => {
    const initializeLiff = async () => {
      try {
        await liff.init({ liffId: LIFF_ID });
        if (liff.isLoggedIn()) {
          await processLiffLogin();
        } else {
          setIsProcessing(false);
        }
      } catch (error) {
        console.error("LIFF initialization error:", error);
        setErrorMessage("เกิดข้อผิดพลาดในการเริ่มต้น LIFF: " + error.message);
        setIsProcessing(false);
      }
    };
    initializeLiff();
  }, [processLiffLogin]);

  // LINE Login
  const handleLineLogin = () => {
    if (isProcessing) return;
    setProcessingMethod("LINE");
    setIsProcessing(true);
    liff.login({ scope: "profile openid email" });
  };

  // Google Login
  const handleGoogleLogin = async () => {
    if (isProcessing) return;
    setProcessingMethod("Google");
    setIsProcessing(true);

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
      await handleLoginSuccess(userFromDb, user.displayName);

    } catch (error) {
      console.error("Google login error:", error);
      setIsProcessing(false);
      setProcessingMethod("");
    }
  };

  // Facebook Login
  const handleFacebookLogin = async () => {
    if (isProcessing) return;
    setProcessingMethod("Facebook");
    setIsProcessing(true);

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
      await handleLoginSuccess(userFromDb, user.displayName);

    } catch (error) {
      console.error("Facebook login error:", error);
      setIsProcessing(false);
      setProcessingMethod("");
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginColumn}>
        {isProcessing && processingMethod && (
          <p className="text-white mb-2">
            กำลังเข้าสู่ระบบด้วย {processingMethod}...
          </p>
        )}

        <img src={traffyLogo} alt="Traffy Logo" className={styles.logo} />
        {!isProcessing && (
          <>
            <h2>Fondue Dashboard and Manager</h2>
            <h3>แพลตฟอร์มบริหารจัดการปัญหาเมืองสำหรับเจ้าหน้าที่</h3>
            {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
            <button
              onClick={handleFacebookLogin}
              disabled={isProcessing}
              className="btn btn-primary w-4/5 mb-3 flex items-center justify-center gap-2"
            >
              <FaFacebookF size={20} /> เข้าสู่ระบบด้วย Facebook
            </button>
            <button
              onClick={handleGoogleLogin}
              disabled={isProcessing}
              className="btn btn-outline btn-secondary w-4/5 mb-3 flex items-center justify-center gap-2"
            >
              <FcGoogle size={22} /> เข้าสู่ระบบด้วย Google
            </button>
            <button
              onClick={handleLineLogin}
              disabled={isProcessing}
              className="btn btn-success w-4/5 flex items-center justify-center gap-2"
            >
              <FaLine size={20} /> เข้าสู่ระบบด้วย LINE
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
