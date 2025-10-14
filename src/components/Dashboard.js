// Dashboard.js
import React from "react";
import "./Dashboard.css";
import { FaComments, FaUsers, FaFileAlt, FaFolder } from "react-icons/fa";

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <h1 className="logo">F Fondue</h1>

      <div className="search-box">
        <input type="text" placeholder="ค้นหา..." />
      </div>

      <div className="tab-menu">
        <button className="active">ทาพรม</button>
        <button>กิริยาร่ม</button>
        <button>กิยัม</button>
        <button>ดั้งย้า</button>
        <button>ต๊ะจ้า</button>
      </div>

      <div className="card-grid">
        <div className="card">
          <FaComments size={40} />
          <p>เริ่มห้องถกภาวา</p>
        </div>

        <div className="card">
          <FaUsers size={40} />
          <p>จาตตผู้ร่วมมะสก</p>
        </div>

        <div className="card">
          <FaFileAlt size={40} />
          <p>รางกรยายหบ</p>
        </div>

        <div className="card">
          <FaFolder size={40} />
          <p>ดูยคตรคดร่า</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
