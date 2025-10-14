import React from "react";
import "./Dashboard.css";
import { 
  FaMapMarkedAlt, FaBuilding, FaClipboardList, 
  FaChartBar, FaCog, FaSignOutAlt 
} from "react-icons/fa";

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      {/* โลโก้ */}
      <div className="logo-container">
        <h1 className="logo">F Fondue</h1>
      </div>

      {/* Search Box */}
      <div className="search-box">
        <input type="text" placeholder="ค้นหา..." />
      </div>

      {/* Card Grid */}
      <div className="card-grid">
        {/* 1. แผนที่ */}
        <div className="card">
          <FaMapMarkedAlt size={40} />
          <p>แผนที่</p>
          <small>เลือกแผนที่สาธารณะหรือภายใน</small>
        </div>

        {/* 2. หน่วยงาน */}
        <div className="card">
          <FaBuilding size={40} />
          <p>หน่วยงาน</p>
          <small>
            - เลือกการทำงาน<br/>
            - ขอรหัสเริ่มใช้งาน<br/>
            - ใส่รหัสเริ่มใช้งาน<br/>
            - สร้างหน่วยงาน<br/>
            - หน่วยงานที่เข้าร่วม
          </small>
        </div>

        {/* 3. รายการแจ้ง */}
        <div className="card">
          <FaClipboardList size={40} />
          <p>รายการแจ้ง</p>
          <small>เฉพาะหน่วยงาน / รายการแจ้งรวม</small>
        </div>

        {/* 4. สถิติ */}
        <div className="card">
          <FaChartBar size={40} />
          <p>สถิติ</p>
          <small>สถิติ / สถิติองค์กร</small>
        </div>

        {/* 5. ตั้งค่า */}
        <div className="card">
          <FaCog size={40} />
          <p>ตั้งค่า</p>
          <small>ตั้งค่า / QRCode หน่วยงาน / QRCode สร้างเอง</small>
        </div>

        {/* 6. ออกจากระบบ */}
        <div className="card">
          <FaSignOutAlt size={40} />
          <p>ออกจากระบบ</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
