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
          img: item.url_logo, 
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
      console.error("Failed to notify backend, but proceeding with client-side logout.", error);
    } finally {
      console.log("Executing client-side cleanup.");
      if (liff.isLoggedIn()) {
        liff.logout();
      }
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user_id"); 
      localStorage.removeItem("selectedOrg"); 
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
    setSearchTerm('');
    setFilteredAgencies(allAgencies);
  };

  const handleAgencyClick = (agency) => {
    localStorage.setItem('selectedOrg', JSON.stringify(agency));
    localStorage.setItem('lastSelectedOrg', JSON.stringify(agency));
    navigate('/home');
  };

  return (
    <div className={styles.appBody}>
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

       {/* --- Card ใหม่ 3 อัน --- */}
       <div className={styles.extraCards}>
         <div className={styles.extraCard} onClick={() => navigate('/request-code')}>
           <p>ขอรหัสเพื่อเริ่มใช้งาน</p>
         </div>
         <div className={styles.extraCard} onClick={() => navigate('/Signin')}>
           <p>ใส่รหัสเพื่อเริ่มใช้งาน</p>
         </div>
         <div className={styles.extraCard} onClick={() => navigate('/-')}>
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
          <div className={styles.agencyGrid}>
            {filteredAgencies.map((agency) => (
              <div
                key={agency.id} 
                className={styles.agencyItem}
                onClick={() => handleAgencyClick(agency)}
              >
                <div className={styles.agencyImg}>
                  <img
                    src={agency.img}
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
                  {agency.name}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home1;
