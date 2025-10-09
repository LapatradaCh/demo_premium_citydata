import React from "react";
import "./Login.css";
import traffyLogo from "./traffy.png";

const Login = () => {
  return (
    <div className="login-container">
      <div className="login-box">
        <img src={traffyLogo} alt="Traffy Logo" className="logo" />
        <h1>Traffy* Fondue</h1>
        <p className="description">
          แพลตฟอร์มบริหารจัดการปัญหาเมือง ที่ช่วยติดตามและจัดการปัญหา
          พร้อมข้อมูลภาพถ่ายและตำแหน่ง เพื่อการตัดสินใจแก้ไขอย่างมีประสิทธิภาพ
        </p>

        <div className="buttons">
          <button className="facebook-btn">
            <img
              src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/facebook.svg"
              alt="Facebook"
              className="icon"
            />
            เข้าสู่ระบบด้วย Facebook
          </button>

          <button className="google-btn">
            <img
              src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/google.svg"
              alt="Google"
              className="icon"
            />
            เข้าสู่ระบบด้วย Google
          </button>

          <button className="line-btn">
            <img
              src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/line.svg"
              alt="Line"
              className="icon"
            />
            เข้าสู่ระบบด้วย Line
          </button>
        </div>

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
          <a
            href="https://line.me/R/ti/p/@fonduehelp"
            target="_blank"
            rel="noopener noreferrer"
          >
            ติดต่อสอบถาม
          </a>
        </div>

        <div className="version">v1.10.42</div>
      </div>
    </div>
  );
};

export default Login;
