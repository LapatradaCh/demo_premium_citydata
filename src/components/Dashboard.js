import React, { useState } from "react";
import "./Dashboard.css";
import { FaMapMarkedAlt, FaBuilding, FaClipboardList, FaChartBar, FaCog, FaSignOutAlt } from "react-icons/fa";

const Dashboard = () => {
  // สถานะหัวข้อที่เลือก
  const [activeTab, setActiveTab] = useState("แผนที่");

  // ฟังก์ชันเปลี่ยนหัวข้อ
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  // ข้อมูลการ์ดแต่ละหัวข้อ
  const cardsData = {
    "แผนที่": [
      { icon: <FaMapMarkedAlt size={40} />, label: "แผนที่สาธารณะ" },
      { icon: <FaMapMarkedAlt size={40} />, label: "แผนที่ภายใน" }
    ],
    "หน่วยงาน": [
      { icon: <FaBuilding size={40} />, label: "เลือกการทำงาน" },
      { icon: <FaBuilding size={40} />, label: "ขอรหัสเพื่อเริ่มใช้งาน" },
      { icon: <FaBuilding size={40} />, label: "ใส่รหัสเพื่อเริ่มใช้งาน" },
      { icon: <FaBuilding size={40} />, label: "สร้างหน่วยงาน" },
      { icon: <FaBuilding size={40} />, label: "หน่วยงานที่เข้าร่วม" }
    ],
    "รายการแจ้ง": [
      { icon: <FaClipboardList size={40} />, label: "เฉพาะหน่วยงาน" },
      { icon: <FaClipboardList size={40} />, label: "รายการแจ้งรวม" }
    ],
    "สถิติ": [
      { icon: <FaChartBar size={40} />, label: "สถิติ" },
      { icon: <FaChartBar size={40} />, label: "สถิติองค์กร" }
    ],
    "ตั้งค่า": [
      { icon: <FaCog size={40} />, label: "ตั้งค่า" },
      { icon: <FaCog size={40} />, label: "QRCode หน่วยงาน" },
      { icon: <FaCog size={40} />, label: "QRCode สร้างเอง" }
    ],
    "ออกจากระบบ": [
      { icon: <FaSignOutAlt size={40} />, label: "ออกจากระบบ" }
    ]
  };

  const tabs = Object.keys(cardsData);

  return (
    <div className="dashboard-container">
      <h1 className="logo">F Fondue</h1>

      <div className="search-box">
        <input type="text" placeholder="ค้นหา..." />
      </div>

      <div className="tab-menu">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? "active" : ""}
            onClick={() => handleTabClick(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="card-grid">
        {cardsData[activeTab].map((card, index) => (
          <div className="card" key={index}>
            {card.icon}
            <p>{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
