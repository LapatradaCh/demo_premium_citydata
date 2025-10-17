import React, { useState } from "react";
import "./Home.css";
import {
  FaMapMarkedAlt,
  FaBuilding,
  FaClipboardList,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import Logo from "./logo.png";
import LowerImage1 from "./traffy-preview.png";
import LowerImage2 from "./traffy-preview2.png";
import LowerImage3 from "./traffy-preview3.png";
import LowerImage4 from "./traffy-preview4.png";

// Import สิ่งที่จำเป็นสำหรับการ Redirect และ LIFF
import { useNavigate } from "react-router-dom";
import liff from "@line/liff";

const Home = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(null);
  const [openTab, setOpenTab] = useState(null);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab !== "หน่วยงาน") {
      setOpenTab(openTab === tab ? null : tab);
    } else {
      setOpenTab(null);
    }
  };

  /**
   * ฟังก์ชันสำหรับออกจากระบบ (ฉบับสมบูรณ์)
   * ทำการเรียก API ไปยัง Backend เพื่อบันทึก Log ก่อน แล้วจึงเคลียร์ข้อมูลฝั่ง Client
   */
  const handleLogout = async () => {
    // 1. ดึง Access Token ที่ถูกเก็บไว้หลังจาก Login สำเร็จ
    const accessToken = localStorage.getItem("accessToken");
    console.log("token:", accessToken)

    // 2. ถ้ามี Token, ให้เรียก API ของ Backend เพื่อบันทึก Log การ Logout
    if (accessToken) {
      try {
        // ใช้ Environment Variable เพื่อความปลอดภัยและยืดหยุ่น
        const apiUrl = `https://premium-citydata-api-ab.vercel.app/api/logout`;
        
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // [สำคัญ] ส่ง Token ไปใน Header เพื่อให้ Backend รู้ว่าใครกำลัง Logout
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          console.log("Backend notified of logout successfully.");
        } else {
          // แม้ API จะล้มเหลว ก็ยังควรให้ผู้ใช้ Logout จากฝั่ง Client ต่อไป
          console.error("Failed to notify backend of logout, but proceeding with client-side logout.");
        }
      } catch (error) {
        console.error("Error calling logout API:", error);
      }
    }

    // 3. ทำการ Logout ฝั่ง Client (เคลียร์ข้อมูลและเปลี่ยนหน้า)
    // ส่วนนี้ควรจะทำงานเสมอ ไม่ว่าการเรียก API จะสำเร็จหรือล้มเหลวก็ตาม
    if (liff.isLoggedIn()) {
      liff.logout(); // LIFF จะจัดการเคลียร์ Session และ Refresh หน้าเว็บให้เอง
    } else {
      // สำหรับการ Login แบบอื่นๆ (Google, Facebook, etc.)
      localStorage.removeItem("accessToken"); // ลบ Token ออกจาก Storage
      // หากมีข้อมูลผู้ใช้อื่นๆ ก็ควรลบไปด้วย
      // localStorage.removeItem('userData');
      navigate("/"); // กลับไปที่หน้า Login หลัก
    }
  };

  // --- ข้อมูลสำหรับแสดงผล UI (ไม่มีการเปลี่ยนแปลง) ---
  const cardsData = {
    "แผนที่": [
      { icon: <FaMapMarkedAlt />, label: "แผนที่สาธารณะ" },
      { icon: <FaMapMarkedAlt />, label: "แผนที่ภายใน" },
    ],
    "รายการแจ้ง": [
      { icon: <FaClipboardList />, label: "เฉพาะหน่วยงาน" },
      { icon: <FaClipboardList />, label: "รายการแจ้งรวม" },
    ],
    "สถิติ": [
      { icon: <FaChartBar />, label: "สถิติ" },
      { icon: <FaChartBar />, label: "สถิติองค์กร" },
    ],
    "ตั้งค่า": [
      { icon: <FaCog />, label: "ตั้งค่า" },
      { icon: <FaCog />, label: "QRCode หน่วยงาน" },
      { icon: <FaCog />, label: "QRCode สร้างเอง" },
    ],
  };

  const tabs = ["แผนที่", "หน่วยงาน", "รายการแจ้ง", "สถิติ", "ตั้งค่า"];

  const lowerImages = [
    { src: LowerImage1, alt: "Traffy Preview", link: "https://www.traffy.in.th/Traffy-Fondue-247430d4aa7b803b835beb9ee988541f" },
    { src: LowerImage2, alt: "ตัวอย่างภาพ 1", link: "https://spacebar.th/posts/what-is-traffy-fondue" },
    { src: LowerImage3, alt: "ตัวอย่างภาพ 2", link: "https://www.nstda.or.th/home/news_post/nstda_meetsthepress_traffyfondue/" },
    { src: LowerImage4, alt: "ตัวอย่างภาพ 3", link: "https://www.facebook.com/traffy.in.th/posts/pfbid0vS3ijDd8aHYFZSGogTbMb5bMUbBFFSmxfFQZhzD6oFqLQqK4XKcHkeEx8KxFJMbZl" },
  ];
  // --- สิ้นสุดส่วนข้อมูล UI ---

  return (
    <div>
      {/* Upper Section */}
      <div className="dashboard-upper">
        <div className="header-content">
          <img src={Logo} alt="Logo" className="logo-img" />
          <div className="logo-dropdown-container">
            <p
              className="logo-text"
              onClick={() => setOpenTab(openTab === "appName" ? null : "appName")}
            >
              ชื่อหน่วยงาน
              <span className={`chevron ${openTab === "appName" ? "open" : ""}`}>
                ▼
              </span>
            </p>
            {openTab === "appName" && (
              <div className="dropdown">
                <div className="dropdown-item">-- Blank --</div>
                <div className="dropdown-item">-- Blank --</div>
              </div>
            )}
          </div>
        </div>

        {/* Tab Menu */}
        <div className="tab-menu">
          {tabs.map((tab) => (
            <div key={tab} className="tab-item">
              <button
                className={activeTab === tab ? "active" : ""}
                onClick={() => handleTabClick(tab)}
              >
                {tab}
                {tab !== "หน่วยงาน" && (
                  <span className={`chevron ${openTab === tab ? "open" : ""}`}>
                    ▼
                  </span>
                )}
              </button>
              {openTab === tab && cardsData[tab] && (
                <div className="dropdown">
                  {cardsData[tab].map((card, index) => (
                    <div className="dropdown-item" key={index}>
                      {card.icon} <span>{card.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* ปุ่มออกจากระบบ */}
          <div className="tab-item">
            <button onClick={handleLogout}>
              ออกจากระบบ <FaSignOutAlt style={{ marginLeft: "8px" }} />
            </button>
          </div>
        </div>
      </div>

      {/* Lower Section */}
      <div className="dashboard-lower">
        <div className="lower-image-grid">
          {lowerImages.map((img, index) => (
            <a
              href={img.link}
              target="_blank"
              rel="noopener noreferrer"
              className="image-card"
              key={index}
            >
              <img src={img.src} alt={img.alt} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
