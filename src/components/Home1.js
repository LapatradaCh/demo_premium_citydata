import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import liff from "@line/liff";
import styles from "./css/Home1.module.css";
import {
  FaSignOutAlt,
  // ===== [เพิ่มส่วนเมนู] 1. Imports: ไอคอนสำหรับเมนู =====
  FaMapMarkedAlt,
  FaClipboardList,
  FaChartBar,
  FaCog,
  FaBuilding,
} from "react-icons/fa";

const Home1 = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [allAgencies, setAllAgencies] = useState([]);
  const [filteredAgencies, setFilteredAgencies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ===== [เพิ่มส่วนเมนู] 2. State: สำหรับควบคุมเมนู =====
  // เราอยู่ในหน้า "หน่วยงาน" ดังนั้นจึงตั้งค่านี้เป็น default
  const [activeTab, setActiveTab] = useState("หน่วยงาน");
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const [activeSubTabs, setActiveSubTabs] = useState({
    แผนที่: "แผนที่สาธารณะ",
    รายการแจ้ง: "เฉพาะหน่วยงาน",
    สถิติ: "สถิติ",
    ผลลัพธ์: "แก้ปัญหาสูงสุด",
  });
  // ===================================================

  useEffect(() => {
    const fetchAgencies = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const userId = localStorage.getItem("user_id");
        const accessToken = localStorage.getItem("accessToken");

        if (!userId)
          throw new Error("ไม่พบข้อมูลผู้ใช้ (user_id) กรุณาเข้าสู่ระบบใหม่");
        if (!accessToken)
          throw new Error("ไม่พบ Access Token กรุณาเข้าสู่ระบบใหม่");

        const apiUrl = `https://premium-citydata-api-ab.vercel.app/api/users_organizations?user_id=${userId}`;

        const response = await fetch(apiUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok)
          throw new Error(`ไม่สามารถดึงข้อมูลได้: ${response.statusText}`);

        const data = await response.json();
        const formattedData = data.map((item) => ({
          id: item.organization_id,
          name: item.organization_name,
          img: item.url_logo,
          badge: null,
        }));
        console.log("data select:", formattedData);

        setAllAgencies(formattedData);
        setFilteredAgencies(formattedData);
      } catch (err) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูลหน่วยงาน:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgencies();
  }, []);

  // --- ฟังก์ชันสำหรับส่ง Log (ตามตัวเลือกที่ 1: JSONB) ---
  const logAgencyEntry = async (agency) => {
    const userId = localStorage.getItem("user_id");
    const accessToken = localStorage.getItem("accessToken");

    if (!userId || !accessToken) {
      console.error("ไม่สามารถส่ง log: ไม่พบ user_id หรือ accessToken");
      return;
    }

    try {
      // สร้างข้อมูล Log ให้ตรงกับตาราง (รวม details)
      const logData = {
        user_id: userId,
        action_type: "enter_organization",
        provider: localStorage.getItem("provider") || null,
        user_agent: navigator.userAgent,
        status: "success",

        // --- ส่วนที่เพิ่มเข้ามาสำหรับเก็บชื่อและ ID หน่วยงาน ---
        details: {
          organization_id: agency.id,
          organization_name: agency.name,
        },
        // ----------------------------------------------------
      };

      // [สำคัญ] Endpoint API ของคุณสำหรับ user_logs
      const apiUrl = "https://premium-citydata-api-ab.vercel.app/api/user_logs";

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(logData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("ไม่สามารถบันทึก log การเข้าหน่วยงาน:", errorData);
      } else {
        console.log("บันทึกการเข้าหน่วยงานเรียบร้อย");
      }
    } catch (err) {
      console.error("เกิดข้อผิดพลาดในการส่ง log:", err);
    }
  };

  const handleLogout = async () => {
    const accessToken = localStorage.getItem("accessToken");
    const userId = localStorage.getItem("user_id");
    console.log("Initiating logout for token:", accessToken);

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
        console.log("Backend has been notified of the logout.");
      }
    } catch (error) {
      console.error(
        "Failed to notify backend, but proceeding with client-side logout.",
        error
      );
    } finally {
      console.log("Executing client-side cleanup.");
      if (liff.isLoggedIn()) liff.logout();
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user_id");
      localStorage.removeItem("selectedOrg");
      localStorage.removeItem("provider"); // <-- อาจจะลบ provider ออกตอน logout ด้วย
      navigate("/");
    }
  };

  const handleSearch = () => {
    const filtered = allAgencies.filter((agency) =>
      agency.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAgencies(filtered);
  };

  const handleClear = () => {
    setSearchTerm("");
    setFilteredAgencies(allAgencies);
  };

  // --- ฟังก์ชันที่ปรับแก้ให้เรียก Log ---
  const handleAgencyClick = (agency) => {
    console.log("Clicked agency:", agency); // <--- เพิ่มบรรทัดนี้
    // 1. บันทึกข้อมูลหน่วยงานที่เลือกลง localStorage
    localStorage.setItem("selectedOrg", JSON.stringify(agency));
    localStorage.setItem("lastSelectedOrg", JSON.stringify(agency));

    // 2. เรียกฟังก์ชันส่ง Log (แบบ fire-and-forget)
    logAgencyEntry(agency); // <-- เรียกใช้ฟังก์ชัน Log ที่นี่

    // 3. นำทางผู้ใช้ไปยังหน้า /home ทันที
    navigate("/home");
  };

  // ===== [เพิ่มส่วนเมนู] 3. Logic: ข้อมูลเมนู และฟังก์ชันควบคุม =====
  const menuItems = [
    {
      name: "แผนที่",
      icon: FaMapMarkedAlt,
      items: ["แผนที่สาธารณะ", "แผนที่ภายใน"],
      action: () => navigate("/home"), // กลับไปหน้า Home หลัก (ที่มีแผนที่)
    },
    {
      name: "หน่วยงาน",
      icon: FaBuilding,
      items: null,
      action: () => navigate("/home1"), // อยู่หน้านี้แล้ว
    },
    {
      name: "รายการแจ้ง",
      icon: FaClipboardList,
      items: ["เฉพาะหน่วยงาน", "รายการแจ้งรวม"],
      action: () => navigate("/home"), // กลับไปหน้า Home หลัก
    },
    {
      name: "สถิติ",
      icon: FaChartBar,
      items: ["สถิติ", "สถิติองค์กร"],
      action: () => navigate("/home"), // กลับไปหน้า Home หลัก
    },
    {
      name: "ตั้งค่า",
      icon: FaCog,
      items: null,
      action: () => navigate("/home"), // กลับไปหน้า Home หลัก
    },
  ];

  // สลับแท็บหลัก
  const handleTabClick = (item) => {
    // ถ้าคลิก "หน่วยงาน" (ซึ่งอยู่หน้านี้แล้ว) ก็ไม่ต้องทำอะไร
    if (item.name === "หน่วยงาน") {
      setActiveTab("หน่วยงาน");
      setOpenSubMenu(null);
      return;
    }
    
    // ถ้าเป็นปุ่มที่มี action (เช่น "หน่วยงาน" หรือปุ่มที่ไปหน้า home)
    if (item.action) {
      item.action();
    } 
    // ถ้าเป็นปุ่มที่มีเมนูย่อย (เช่น แผนที่, รายการแจ้ง)
    else if (item.items) {
      // ให้ไปที่หน้า /home ก่อน แล้วค่อยเปิดเมนูย่อย
      // (ตรรกะนี้อาจจะต้องปรับ ถ้าหน้า /home ไม่ได้ handle)
      // *** แก้ไข: เปลี่ยนเป็นให้ /home จัดการเอง ***
      // เราจะ navigate ไปที่ /home พร้อมบอก state ว่าจะให้ active tab ไหน
      navigate("/home", { state: { defaultTab: item.name } });

      // setActiveTab(item.name);
      // setOpenSubMenu(openSubMenu === item.name ? null : item.name);
    } 
    // ถ้าเป็นปุ่มธรรมดา (เช่น "ตั้งค่า")
    else {
      navigate("/home", { state: { defaultTab: item.name } });
      // setActiveTab(item.name);
      // setOpenSubMenu(null);
    }
  };

  // เปลี่ยนเมนูย่อย (Logic นี้จะทำงานที่หน้า /home)
  const handleSubMenuItemClick = (mainTabName, subItemName) => {
    // setActiveSubTabs({
    //   ...activeSubTabs,
    //   [mainTabName]: subItemName,
    // });
    // setOpenSubMenu(null);
    // เมื่อคลิกเมนูย่อย ให้นำทางไปหน้า /home พร้อมบอก state
    navigate("/home", { 
      state: { 
        defaultTab: mainTabName, 
        defaultSubTab: subItemName 
      } 
    });
  };
  // =========================================================

  return (
    <div className={styles.appBody}>
      <div className={styles.logoutIcon}>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <FaSignOutAlt size={18} />
          <span>ออกจากระบบ</span>
        </button>
      </div>

      <h1 className={styles.title}>เลือกหน่วยงานที่คุณต้องการ</h1>

      <div className={styles.searchContainer}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="ค้นหาหน่วยงาน..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        {searchTerm && (
          <button className={styles.searchButton} onClick={handleClear}>
            <X size={16} />
          </button>
        )}
        <button className={styles.searchButton} onClick={handleSearch}>
          <Search size={18} />
        </button>
      </div>

      {/* --- Card ใหม่ 3 อัน --- */}
      <div className={styles.extraCards}>
        <div
          className={styles.extraCard}
          onClick={() => navigate("/request-code")}
        >
          <p>ขอรหัสเพื่อเริ่มใช้งาน</p>
        </div>
        <div className={styles.extraCard} onClick={() => navigate("/Signin")}>
          <p>ใส่รหัสเพื่อเริ่มใช้งาน</p>
        </div>
        <div className={styles.extraCard} onClick={() => navigate("/CreateOrg")}>
          <p>สร้างหน่วยงาน</p>
        </div>
      </div>

      <div className={styles.agencySection}>
        {isLoading ? (
          <p className="loading-message">กำลังโหลดข้อมูลหน่วยงาน...</p>
        ) : error ? (
          <p className="error-message">เกิดข้อผิดพลาด: {error}</p>
        ) : filteredAgencies.length === 0 ? (
          <p className={styles.noResults}>ไม่พบหน่วยงาน</p>
        ) : (
          <>
            <h2 className={styles.sectionTitle}>หน่วยงานทั้งหมด</h2>
            <div className={styles.agencyGrid}>
              {filteredAgencies.map((agency) => (
                <div
                  key={agency.id}
                  className={styles.agencyItem}
                  onClick={() => handleAgencyClick(agency)} // <-- เรียกใช้ handleAgencyClick ที่นี่
                >
                  <div className={styles.agencyImg}>
                    <img
                      src={agency.img}
                      alt={agency.name}
                      title={agency.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://placehold.co/100x100/A0AEC0/ffffff?text=${agency.name.charAt(
                          0
                        )}`;
                      }}
                    />
                    {agency.badge && (
                      <div className="agency-badge">{agency.badge}</div>
                    )}
                  </div>
                  <div
                    className={styles.agencyName}
                    title="คลิกเพื่อเข้าหน่วยงานนี้"
                  >
                    {agency.name}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ===== [เพิ่มส่วนเมนู] 4. JSX: โค้ดเมนูด้านล่าง ===== */}
      <div className={styles.bottomNav}>
        {menuItems.map((item) => (
          <div key={item.name} className={styles.bottomNavButtonContainer}>
            {item.items && openSubMenu === item.name && (
              <div className={styles.subMenuPopup}>
                {item.items.map((subItem) => (
                  <div
                    key={subItem}
                    className={`${styles.subMenuItem} ${
                      activeSubTabs[item.name] === subItem ? styles.active : ""
                    }`}
                    onClick={() =>
                      handleSubMenuItemClick(item.name, subItem)
                    }
                  >
                    {subItem}
                  </div>
                ))}
              </div>
            )}
            <button
              className={activeTab === item.name ? styles.active : ""}
              onClick={() => handleTabClick(item)}
            >
              <item.icon />
              <span>{item.name}</span>
            </button>
          </div>
        ))}
      </div>
      {/* ============================================== */}
    </div>
  );
};

export default Home1;
