import React, { useState, useEffect } from 'react';
import { Search, LogOut, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import liff from "@line/liff"; 
import styles from './css/Home1.module.css';

const Home1 = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const [allAgencies, setAllAgencies] = useState([]); 
  const [filteredAgencies, setFilteredAgencies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAgencies = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const userId = localStorage.getItem('user_id'); 
        const accessToken = localStorage.getItem('accessToken');

        if (!userId) {
          throw new Error('ไม่พบข้อมูลผู้ใช้ (user_id) กรุณาเข้าสู่ระบบใหม่');
        }
        
        if (!accessToken) {
          throw new Error('ไม่พบ Access Token กรุณาเข้าสู่ระบบใหม่');
        }

        const apiUrl = `https://premium-citydata-api-ab.vercel.app/api/users_organizations?user_id=${userId}`;

        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`ไม่สามารถดึงข้อมูลได้: ${response.statusText}`);
        }

        const data = await response.json();

        const formattedData = data.map(item => ({
          id: item.organization_id, 
          name: item.organization_name,
          img: item.url_logo, // <-- **สำคัญ: เราจะส่ง field 'img' นี้ไป**
          badge: null 
        }));

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


const handleLogout = async () => {
    const accessToken = localStorage.getItem("accessToken");
    const userId = localStorage.getItem("user_id"); // 1. ดึง user_id มาด้วย
    console.log("Initiating logout for token:", accessToken);

    try {
      // Step 1: Notify the backend
      if (accessToken && userId) { // 2. เช็กว่ามี cả userId ด้วย
        const apiUrl = "https://premium-citydata-api-ab.vercel.app/api/logout";
        await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ user_id: userId }), // 3. ส่ง user_id ไปใน body
        });
        console.log("Backend has been notified of the logout.");
      }
    } catch (error) {
      // It's okay if the backend call fails. We still want to log the user out on the client-side.
      console.error("Failed to notify backend, but proceeding with client-side logout.", error);
    } finally {
      // Step 2: Perform client-side logout actions (this block ALWAYS runs)
      console.log("Executing client-side cleanup.");

      // Logout from LIFF if the user is logged in via LIFF
      if (liff.isLoggedIn()) {
        liff.logout();
      }

      // ALWAYS remove the token from local storage, regardless of login method
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user_id"); // เคลียร์ user_id ด้วย
      localStorage.removeItem("selectedOrg"); // เคลียร์ค่าที่เลือกไว้ด้วย

      // ALWAYS navigate the user back to the login page for a consistent experience
      navigate("/"); // Or '/login'
    }
  };


  const handleSearch = () => {
    const filtered = allAgencies.filter((agency) =>
      agency.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAgencies(filtered);
  };

  const handleClear = () => {
    setSearchTerm('');
    setFilteredAgencies(allAgencies);
  };

  // --- vvv 1. แก้ไข handleAgencyClick vvv ---
  const handleAgencyClick = (agency) => {
    // 1. เก็บข้อมูลหน่วยงานที่เลือก (ทั้ง object) ลงใน localStorage
    localStorage.setItem('selectedOrg', JSON.stringify(agency));

    // ✅ 2. เก็บค่าไว้เป็นหน่วยงานล่าสุดด้วย
    localStorage.setItem('lastSelectedOrg', JSON.stringify(agency));
      
    // 2. นำทางไปหน้า /home (หน้า Dashboard)
    navigate('/home');
  };
  // --- ^^^ สิ้นสุดการแก้ไข ^^^ ---

  return (
    <div className={styles.appBody}>
      {/* ... (ส่วน Logout, Header, Search Box เหมือนเดิม) ... */}
      <div className={styles.logoutIcon}>
         <button onClick={handleLogout}>
           <LogOut size={18} />
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
           onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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

      {/* Agency Grid */}
      <div className={styles.agencySection}>
        {isLoading ? (
          <p className="loading-message">กำลังโหลดข้อมูลหน่วยงาน...</p>
        ) : error ? (
          <p className="error-message">เกิดข้อผิดพลาด: {error}</p>
        ) : filteredAgencies.length === 0 ? (
          <p className={styles.noResults}>ไม่พบหน่วยงาน</p>
        ) : (
          <div className={styles.agencyGrid}>
            {filteredAgencies.map((agency) => (
              <div
                key={agency.id} 
                className={styles.agencyItem}
                // --- vvv 2. แก้ไข onClick vvv ---
                onClick={() => handleAgencyClick(agency)}
                // --- ^^^ สิ้นสุดการแก้ไข ^^^ ---
              >
                <div className={styles.agencyImg}>
                  <img
                    src={agency.img} // <-- field นี้จะถูกส่งไป
                    alt={agency.name} 
                    title={agency.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://placehold.co/100x100/A0AEC0/ffffff?text=${agency.name.charAt(0)}`;
                    }}
                  />
                  {agency.badge && <div className="agency-badge">{agency.badge}</div>}
                </div>
                <div className={styles.agencyName} title="คลิกเพื่อเข้าหน่วยงานนี้">
                  {agency.name} {/* <-- field นี้จะถูกส่งไป */}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home1
