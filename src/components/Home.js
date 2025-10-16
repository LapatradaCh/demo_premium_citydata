import React, { useState } from "react";
import "./Home.css";
import {
  FaMapMarkedAlt, FaBuilding, FaClipboardList,
  FaChartBar, FaCog, FaSignOutAlt
} from "react-icons/fa";
import Logo from "./logo.png";
import LowerImage1 from "./traffy-preview.png";
import LowerImage2 from "./traffy-preview2.png";
import LowerImage3 from "./traffy-preview3.png";
import LowerImage4 from "./traffy-preview4.png";

// 1. Import สิ่งที่จำเป็นเข้ามา
import { useNavigate } from 'react-router-dom';
import liff from '@line/liff';

const Home = () => {
  const navigate = useNavigate(); // 2. เตรียม useNavigate ไว้ใช้งาน
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
   * 3. สร้างฟังก์ชันสำหรับออกจากระบบโดยเฉพาะ
   */
  const handleLogout = () => {
    // ตรวจสอบว่าผู้ใช้ล็อกอินผ่าน LIFF หรือไม่
    if (liff.isLoggedIn()) {
      liff.logout();
      alert("ออกจากระบบสำเร็จ");
      // liff.logout() จะทำการรีเฟรชหน้าและเคลียร์เซสชันให้เอง
      // เราไม่จำเป็นต้องสั่ง navigate ไปหน้าอื่น
    } else {
      // สำหรับกรณีที่อาจล็อกอินด้วยช่องทางอื่นในอนาคต
      // หรือเป็น fallback หากไม่ได้ล็อกอินด้วย LIFF
      navigate('/'); // กลับไปหน้า Login
    }
  };

  const cardsData = {
    "แผนที่": [
      { icon: <FaMapMarkedAlt />, label: "แผนที่สาธารณะ" },
      { icon: <FaMapMarkedAlt />, label: "แผนที่ภายใน" }
    ],
    "รายการแจ้ง": [
      { icon: <FaClipboardList />, label: "เฉพาะหน่วยงาน" },
      { icon: <FaClipboardList />, label: "รายการแจ้งรวม" }
    ],
    "สถิติ": [
      { icon: <FaChartBar />, label: "สถิติ" },
      { icon: <FaChartBar />, label: "สถิติองค์กร" }
    ],
    "ตั้งค่า": [
      { icon: <FaCog />, label: "ตั้งค่า" },
      { icon: <FaCog />, label: "QRCode หน่วยงาน" },
      { icon: <FaCog />, label: "QRCode สร้างเอง" }
    ]
  };

  const tabs = ["แผนที่", "หน่วยงาน", "รายการแจ้ง", "สถิติ", "ตั้งค่า"];

  const lowerImages = [
    { src: LowerImage1, alt: "Traffy Preview", link: "https://www.traffy.in.th/Traffy-Fondue-247430d4aa7b803b835beb9ee988541f" },
    { src: LowerImage2, alt: "ตัวอย่างภาพ 1", link: "https://spacebar.th/posts/what-is-traffy-fondue" },
    { src: LowerImage3, alt: "ตัวอย่างภาพ 2", link: "https://www.nstda.or.th/home/news_post/nstda_meetsthepress_traffyfondue/" },
    { src: LowerImage4, alt: "ตัวอย่างภาพ 3", link: "https://www.facebook.com/traffy.in.th/posts/pfbid0vS3ijDd8aHYFZSGogTbMb5bMUbBFFSmxfFQZhzD6oFqLQqK4XKcHkeEx8KxFJMbZl" },
  ];

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
              <span className={`chevron ${openTab === "appName" ? "open" : ""}`}>▼</span>
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
                  <span className={`chevron ${openTab === tab ? "open" : ""}`}>▼</span>
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

          {/* 4. แก้ไขปุ่มออกจากระบบให้เรียกใช้ฟังก์ชันใหม่ */}
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
