import React, { useState, useEffect } from "react";
import styles from "./css/Signin.module.css"; 
import logo from "./traffy.png"; 
import { useNavigate } from "react-router-dom";
import liff from "@line/liff";

const DB_API = "https://premium-citydata-api-ab.vercel.app/api/users_organizations";
const ORG_COUNT_API_BASE = "https://premium-citydata-api-ab.vercel.app/api/users_organizations";

const JoinORG = () => {
  // --- State เดิม ---
  const [unitCode, setUnitCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [generatedOTP, setGeneratedOTP] = useState("");
  const [otpSentTime, setOtpSentTime] = useState(null);
  const [message, setMessage] = useState("");
  const [otpActive, setOtpActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // --- State ใหม่สำหรับ UI กำหนดระดับหน่วยงาน ---
  const [orgLevel, setOrgLevel] = useState("subdistrict"); // ค่าเริ่มต้น: ระดับแขวง/ตำบล
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

  const navigate = useNavigate();
  const OTP_EXPIRY_SECONDS = 60;

  // --- Mock Data (ข้อมูลจำลองจังหวัด/อำเภอ) ---
  // *หมายเหตุ: ในการใช้งานจริง ควรเปลี่ยนไป fetch จาก API ของคุณ
  const provincesMock = [
    { id: "1", name: "กรุงเทพมหานคร" },
    { id: "2", name: "เชียงใหม่" },
    { id: "3", name: "ชลบุรี" },
    { id: "4", name: "ภูเก็ต" }
  ];

  const districtsMock = [
    { id: "101", name: "เขตพระนคร", provinceId: "1" },
    { id: "102", name: "เขตดุสิต", provinceId: "1" },
    { id: "103", name: "เขตปทุมวัน", provinceId: "1" },
    { id: "201", name: "อำเภอเมืองเชียงใหม่", provinceId: "2" },
    { id: "202", name: "อำเภอแม่ริม", provinceId: "2" }
  ];

  // Filter อำเภอตามจังหวัดที่เลือก
  const filteredDistricts = districtsMock.filter(d => d.provinceId === selectedProvince);

  // --- ฟังก์ชัน Logout ---
  const performLogout = async () => {
    const accessToken = localStorage.getItem("accessToken");
    const userId = localStorage.getItem("user_id");

    try {
      if (accessToken && userId) {
        const apiUrl = "https://premium-citydata-api-ab.vercel.app/api/logout";
        await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ user_id: userId }),
        });
      }
    } catch (error) {
      console.error("Logout notify failed", error);
    } finally {
      if (liff.isLoggedIn()) {
        liff.logout();
      }
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user_id");
      localStorage.removeItem("selectedOrg");
      localStorage.removeItem("lastSelectedOrg");
      navigate("/");
    }
  };

  // --- Logic ปุ่มย้อนกลับ ---
  const handleBack = () => {
    const savedOrg = localStorage.getItem("lastSelectedOrg");
    if (savedOrg) {
      navigate("/home1");
    } else {
      performLogout();
    }
  };

  // --- OTP Logic ---
  const handleGetOTP = () => {
    if (!phoneNumber.trim()) return setMessage("กรุณาใส่เบอร์โทรศัพท์ก่อน");
    if (!/^\d{9,10}$/.test(phoneNumber)) return setMessage("เบอร์โทรศัพท์ไม่ถูกต้อง");

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOTP(otp);
    setOtpSentTime(Date.now());
    setMessage(`ส่ง OTP ไปที่ ${phoneNumber} แล้ว (จำลอง: ${otp})`);
    setOtpActive(true);

    let timeLeft = OTP_EXPIRY_SECONDS;
    const interval = setInterval(() => {
      timeLeft--;
      if (timeLeft <= 0) {
        clearInterval(interval);
        setOtpActive(false);
        setGeneratedOTP("");
        setMessage("รหัส OTP หมดอายุแล้ว");
      }
    }, 1000);
  };

  // --- Submit Logic ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const userIdFromStorage = localStorage.getItem("user_id");
    if (!userIdFromStorage) return setMessage("ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่");
    
    if (!unitCode || !phoneNumber || !otpCode) return setMessage("กรุณากรอกข้อมูลให้ครบ");
    if (!generatedOTP) return setMessage("กรุณากดปุ่ม OTP ก่อน");

    // ตรวจสอบข้อมูลส่วนใหม่ (ถ้าจำเป็นต้องบังคับเลือก)
    // if (!selectedProvince) return setMessage("กรุณาเลือกจังหวัด");

    const elapsed = (Date.now() - otpSentTime) / 1000;
    if (elapsed > OTP_EXPIRY_SECONDS) return setMessage("OTP หมดอายุแล้ว");
    if (otpCode !== generatedOTP) return setMessage("รหัส OTP ไม่ถูกต้อง");

    setIsLoading(true);

    try {
      // 1. ยิง API เพื่อ Join หรือ Upgrade
      const response = await fetch(DB_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userIdFromStorage,
          organization_code: unitCode,
          // ส่งข้อมูล Location ไปด้วยหาก API รองรับ
          // province_id: selectedProvince,
          // district_id: selectedDistrict,
          // org_level: orgLevel
        }),
      });

      const data = await response.json();

      // 2. ฟังก์ชันตรวจสอบ Org หลังจากทำรายการสำเร็จ
      const checkORG = async () => {
        try {
          const orgRes = await fetch(`${ORG_COUNT_API_BASE}?user_id=${userIdFromStorage}`);
          const orgData = await orgRes.json();
          const orgCount = orgData.length || 0;

          if (orgCount > 1) {
            navigate("/home1"); 
          } else if (orgCount === 1) {
            const sourceOrg = orgData[0];
            const singleOrg = {
              badge: sourceOrg.badge || null,
              id: sourceOrg.organization_id,
              img: sourceOrg.url_logo,
              name: sourceOrg.organization_name,
              role: sourceOrg.role 
            };
            localStorage.setItem("lastSelectedOrg", JSON.stringify(singleOrg));
            setTimeout(() => navigate('/home'), 100);
          } else {
            navigate("/Signin"); 
          }
        } catch (err) {
          console.error("Error fetching orgs:", err);
          setMessage("เกิดข้อผิดพลาดในการโหลดข้อมูลองค์กร");
          setIsLoading(false);
        }
      };

      if (response.status === 201 || response.status === 200) {
        setMessage("ดำเนินการสำเร็จ!");
        await checkORG(); 
      } else if (response.status === 409) {
        setIsLoading(false);
        setMessage("คุณเป็นสมาชิกในหน่วยงานนี้อยู่แล้ว");
      } else if (response.status === 404) {
        setIsLoading(false);
        setMessage("รหัสหน่วยงานหรือรหัส Admin ไม่ถูกต้อง");
      } else {
        setIsLoading(false);
        setMessage(data.message || "เกิดข้อผิดพลาด");
      }

    } catch (error) {
      setIsLoading(false);
      setMessage("Error: " + error.message);
    }
  };

  // --- Inline Styles สำหรับส่วนที่เพิ่มใหม่ (UI Location) ---
  const locationCardStyle = {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    marginBottom: "20px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
  };

  const levelButtonStyle = (isActive) => ({
    flex: 1,
    padding: "12px 8px",
    borderRadius: "8px",
    border: isActive ? "1.5px solid #3b82f6" : "1px solid #e5e7eb",
    backgroundColor: isActive ? "#eff6ff" : "#fff",
    color: isActive ? "#1d4ed8" : "#6b7280",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "0.9rem",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "6px",
    transition: "all 0.2s"
  });

  return (
    <div className={styles.bodySignin}>
      <div className={styles.otpContainer}>
        <div className={styles.header}>
          <img src={logo} alt="Logo" className={styles.logoImg} />
        </div>

        {/* ========================================================= */}
        {/* ส่วนที่เพิ่มใหม่: กำหนดระดับหน่วยงาน            */}
        {/* ========================================================= */}
        <div style={locationCardStyle}>
            {/* Header ส่วนกำหนดระดับ */}
            <div style={{ display: "flex", alignItems: "center", marginBottom: "20px", color: "#1e3a8a", fontWeight: "bold", fontSize: "1.1rem" }}>
                <div style={{ backgroundColor: "#3b82f6", borderRadius: "6px", padding: "6px", marginRight: "10px", display: "flex", alignItems: "center", justifyContent:"center", width: "32px", height: "32px" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/></svg>
                </div>
                กำหนดระดับหน่วยงาน
            </div>

            {/* ปุ่มเลือกระดับ */}
            <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "10px", color: "#374151", fontWeight: "500", fontSize: "0.95rem" }}>
                    เลือกระดับที่ต้องการบริหารจัดการ
                </label>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <button type="button" onClick={() => setOrgLevel("province")} style={levelButtonStyle(orgLevel === "province")}>
                        📍 ระดับจังหวัด
                    </button>
                    <button type="button" onClick={() => setOrgLevel("district")} style={levelButtonStyle(orgLevel === "district")}>
                        🏢 ระดับเขต / อำเภอ
                    </button>
                    <button type="button" onClick={() => setOrgLevel("subdistrict")} style={levelButtonStyle(orgLevel === "subdistrict")}>
                        🏘️ ระดับแขวง / ตำบล
                    </button>
                </div>
            </div>

            {/* Dropdown เลือกพื้นที่ */}
            <div style={{ backgroundColor: "#f8fafc", padding: "20px", borderRadius: "8px", border: "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
                    
                    {/* จังหวัด */}
                    <div style={{ flex: 1, minWidth: "180px" }}>
                        <label style={{ display: "block", marginBottom: "8px", color: "#374151", fontWeight: "500", fontSize: "0.9rem" }}>
                            จังหวัดที่รับผิดชอบ <span style={{ color: "red" }}>*</span>
                        </label>
                        <select
                            value={selectedProvince}
                            onChange={(e) => {
                                setSelectedProvince(e.target.value);
                                setSelectedDistrict(""); 
                            }}
                            style={{
                                width: "100%", padding: "10px", borderRadius: "8px",
                                border: "2px solid #3b82f6", outline: "none",
                                backgroundColor: "#fff", color: "#333", fontSize: "0.95rem"
                            }}
                        >
                            <option value="">-- โปรดเลือกจังหวัด --</option>
                            {provincesMock.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* เขต/อำเภอ */}
                    <div style={{ flex: 1, minWidth: "180px" }}>
                        <label style={{ display: "block", marginBottom: "8px", color: "#374151", fontWeight: "500", fontSize: "0.9rem" }}>
                            เขต / อำเภอ <span style={{ color: "red" }}>*</span>
                        </label>
                        <select
                            value={selectedDistrict}
                            onChange={(e) => setSelectedDistrict(e.target.value)}
                            disabled={!selectedProvince}
                            style={{
                                width: "100%", padding: "10px", borderRadius: "8px",
                                border: "1px solid #e2e8f0", outline: "none",
                                backgroundColor: !selectedProvince ? "#f1f5f9" : "#fff",
                                color: !selectedProvince ? "#94a3b8" : "#333",
                                cursor: !selectedProvince ? "not-allowed" : "pointer",
                                fontSize: "0.95rem"
                            }}
                        >
                            <option value="">
                                {!selectedProvince ? "กรุณาเลือกจังหวัดก่อน" : "-- เลือกเขต / อำเภอ --"}
                            </option>
                            {filteredDistricts.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Status Badge */}
            <div style={{ marginTop: "20px" }}>
                <span style={{ 
                    backgroundColor: (selectedProvince && selectedDistrict) ? "#dcfce7" : "#eff6ff", 
                    color: (selectedProvince && selectedDistrict) ? "#166534" : "#2563eb",
                    padding: "6px 16px", 
                    borderRadius: "20px", 
                    fontSize: "0.85rem", 
                    fontWeight: "600",
                    display: "inline-block"
                }}>
                    สถานะการเลือก: {selectedProvince && selectedDistrict ? "เลือกข้อมูลครบถ้วน" : "รอการเลือกข้อมูล"}
                </span>
            </div>
        </div>
        {/* ========================================================= */}
        {/* จบส่วนที่เพิ่มใหม่                               */}
        {/* ========================================================= */}

        <form className={styles.otpForm} onSubmit={handleSubmit}>
          {/* Unit Code Input */}
          <div>
            <label className={styles.labelUse}>รหัสหน่วยงาน / รหัส Admin</label>
            <div className={styles.inputField}>
              <input
                type="text"
                value={unitCode}
                onChange={(e) => setUnitCode(e.target.value)}
                placeholder="ระบุรหัสหน่วยงาน..."
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Phone & OTP */}
          <div>
            <label className={styles.labelUse}>เบอร์โทรศัพท์</label>
            <div className={styles.phoneOtpGroup}>
              <div className={styles.inputField}>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="08xxxxxxxx"
                  disabled={isLoading}
                />
              </div>
              <button
                type="button"
                onClick={handleGetOTP}
                disabled={otpActive || isLoading}
              >
                {otpActive ? "..." : "OTP"}
              </button>
            </div>
          </div>

          {/* OTP Code Input */}
          <div>
            <label className={styles.labelUse}>รหัส OTP</label>
            <div className={styles.inputField}>
              <input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="กรอกรหัส 4 หลัก"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className={styles.buttonGroup}>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isLoading}
            >
              {isLoading ? "กำลังโหลด..." : "บันทึกและไปต่อ"} 
              {/* เปลี่ยน Text ปุ่มให้เข้ากับบริบทใหม่ หรือใช้ "เข้าร่วมหน่วยงาน" เหมือนเดิมก็ได้ */}
            </button>

            <button
              type="button"
              className={styles.goBackBtn}
              onClick={handleBack}
              disabled={isLoading}
            >
              ย้อนกลับ
            </button>
          </div>

          {message && <div className={styles.message}>{message}</div>}
        </form>

        <div className={styles.contactInfo}>ติดต่อสอบถาม: @fonduehelp</div>
      </div>
    </div>
  );
};

export default JoinORG;
