import React from "react";
import "./Dashboard.css";

const Dashboard = () => {
  const handleClick = (menu) => {
    alert(`คุณเลือกหัวข้อ: ${menu}`);
    // TODO: นำทางไปหน้า/โมดอลเฉพาะ
  };

  const menuItems = [
    { name: "แผนที่", description: "เลือกแผนที่สาธารณะหรือภายใน" },
    { name: "หน่วยงาน", description: "เลือกการทำงาน, ขอรหัส, สร้างหน่วยงาน, หน่วยงานที่เข้าร่วม" },
    { name: "รายการแจ้ง", description: "เฉพาะหน่วยงาน / รายการแจ้งรวม" },
    { name: "สถิติ", description: "สถิติ / สถิติองค์กร" },
    { name: "ตั้งค่า", description: "ตั้งค่า / QRCode หน่วยงาน / QRCode สร้างเอง" },
    { name: "ออกจากระบบ", description: "" }
  ];

  return (
    <div className="dashboard-container">
      <div className="logo-container">
        <h1 className="logo">F Fondue</h1>
      </div>

      <div className="menu-list">
        {menuItems.map((item) => (
          <button
            key={item.name}
            className="menu-item"
            onClick={() => handleClick(item.name)}
          >
            <span className="menu-name">{item.name}</span>
            {item.description && (
              <small className="menu-desc">{item.description}</small>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
