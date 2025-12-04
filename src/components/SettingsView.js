import React, { useState, useRef, useEffect } from "react";
import styles from "./css/SettingsView.module.css"; 
import {
  FaMapMarkedAlt, FaCog, FaTimes, FaUnlockAlt, 
  FaSyncAlt, FaEye, FaEyeSlash, FaQrcode, FaLink, FaEdit, FaImage,
  FaCheckCircle, FaPhoneAlt, FaCity, FaRegCopy, FaSpinner
} from "react-icons/fa";

// ------------------------------------------------------------------
// --- Config & Constants ---
// ------------------------------------------------------------------
const API_BASE_URL = "https://premium-citydata-api-ab.vercel.app/api/organizations";

// --- ปรับปรุง: ดึง ID จาก LocalStorage ---
let ORGANIZATION_ID = 1; // ค่า Default กรณีไม่พบข้อมูล
try {
  const storedOrgString = localStorage.getItem("lastSelectedOrg");
  if (storedOrgString) {
    const storedOrg = JSON.parse(storedOrgString);
    // ตรวจสอบว่ามี id หรือไม่
    if (storedOrg && storedOrg.id) {
      ORGANIZATION_ID = storedOrg.id;
      console.log("Loaded Organization ID:", ORGANIZATION_ID);
    }
  }
} catch (error) {
  console.error("Error parsing lastSelectedOrg:", error);
}

// ------------------------------------------------------------------
// --- Helper Components ---
// ------------------------------------------------------------------
const MockToggle = () => (
  <label className={styles.mockToggle}>
    <input type="checkbox" />
    <span className={styles.mockSlider}></span>
  </label>
);

// ==================================================================================
// 1. ส่วน "ข้อมูลหน่วยงาน" (CONNECTED TO REAL API)
// ==================================================================================
const AgencySettings = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
   
  // State สำหรับซ่อน/แสดงรหัส
  const [showCodes, setShowCodes] = useState({ admin: false, user: false });

  // State สำหรับเก็บรูปภาพ
  const [logoPreview, setLogoPreview] = useState(null); 
  const fileInputRef = useRef(null); 

  // Initial State
  const [formData, setFormData] = useState({
    name: "",
    adminCode: "",
    userCode: "",
    agencyType: "เทศบาล",
    province: "",
    district: "",
    subDistrict: "",
    phone: "",
  });

  // --- 1. FETCH DATA (GET) ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const url = `${API_BASE_URL}?id=${ORGANIZATION_ID}`;
        console.log("Fetching:", url);

        const res = await fetch(url);
        
        // อ่านเป็น Text ก่อนเพื่อกัน Error กรณี Server ส่ง HTML (404/500)
        const textResponse = await res.text();

        if (!res.ok) {
          throw new Error(`API Error (${res.status}): ${textResponse}`);
        }

        let data;
        try {
          data = JSON.parse(textResponse);
        } catch (e) {
          throw new Error("Server returned invalid JSON");
        }

        // Map ข้อมูลจาก DB (snake_case) -> Frontend (camelCase)
        setFormData({
            name: data.organization_name || "",
            adminCode: data.admin_code || "",
            userCode: data.organization_code || "",
            agencyType: data.org_type_id || "เทศบาล",
            province: data.province || "",
            district: data.district || "",
            subDistrict: data.sub_district || "",
            phone: data.contact_phone || "",
        });

        if (data.url_logo) {
            setLogoPreview(data.url_logo);
        }

      } catch (error) {
        console.error("Fetch error:", error);
        alert(`โหลดข้อมูลไม่สำเร็จ: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- 2. UPDATE DATA (PUT) ---
  const handleSaveData = async () => {
    try {
        setIsSaving(true);

        // Prepare Payload (Map กลับเป็น snake_case)
        const payload = {
            organization_id: ORGANIZATION_ID, // ต้องส่ง ID ไปด้วย
            organization_name: formData.name,
            org_type_id: formData.agencyType,
            district: formData.district,
            sub_district: formData.subDistrict,
            contact_phone: formData.phone,
            province: formData.province,
            // หมายเหตุ: url_logo ต้องทำระบบ upload file แยกต่างหาก
        };

        const res = await fetch(API_BASE_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const textResponse = await res.text();

        if (!res.ok) {
            throw new Error(`Update failed: ${textResponse}`);
        }

        const updatedData = JSON.parse(textResponse);
        alert("บันทึกข้อมูลเรียบร้อยแล้ว!");
        
        // อัปเดต UI ให้ตรงกับ Server ล่าสุด
        setFormData(prev => ({
            ...prev,
            name: updatedData.organization_name
        }));
        
        setIsEditModalOpen(false);

    } catch (error) {
        console.error("Update error:", error);
        alert(`บันทึกไม่สำเร็จ: ${error.message}`);
    } finally {
        setIsSaving(false);
    }
  };

  const handleChange = (field, value) => { setFormData({ ...formData, [field]: value }); };

  const toggleCode = (key) => {
    setShowCodes(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert(`คัดลอกรหัส "${text}" เรียบร้อยแล้ว`);
  };

  // จัดการรูปภาพ (Preview Only)
  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setLogoPreview(imageUrl);
      // TODO: เพิ่ม Logic Upload รูปขึ้น Server ตรงนี้
    }
  };

  // --- Loading State ---
  if (isLoading) {
    return (
        <div style={{ padding: "50px", textAlign: "center", color: "#666" }}>
            <FaSpinner className="fa-spin" style={{ fontSize: "24px", marginBottom: "10px" }} />
            <p>กำลังโหลดข้อมูลหน่วยงาน...</p>
        </div>
    );
  }

  // --- POPUP EDIT MODAL ---
  const AgencyEditModal = () => (
    <>
      <div className={styles.agencyModalBackdrop} onClick={() => !isSaving && setIsEditModalOpen(false)} />
      <div className={styles.agencyModalContainer}>
        {/* Header */}
        <div className={styles.agencyModalHeader}>
            <h3 className={styles.agencyModalTitle}>แก้ไขข้อมูลหน่วยงาน</h3>
            <button className={styles.agencyBtnCloseRed} onClick={() => setIsEditModalOpen(false)} disabled={isSaving}>
                <FaTimes />
            </button>
        </div>
        
        <div className={styles.agencyModalBody}>
             {/* ส่วนอัปโหลดรูปภาพ */}
             <div className={styles.agencyImageSection}>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    style={{ display: "none" }} 
                    accept="image/*"
                    onChange={handleFileChange}
                />
                <div className={styles.agencyImageCircle} onClick={handleImageClick}>
                    {logoPreview ? (
                        <img src={logoPreview} alt="Logo" className={styles.uploadedLogo} />
                    ) : (
                        <FaImage size={32} color="#ccc"/>
                    )}
                    <div className={styles.agencyEditOverlay}><FaEdit/></div>
                </div>
                <span className={styles.agencyHint}>แตะเพื่อเปลี่ยนโลโก้</span>
             </div>

             {/* ฟอร์มข้อมูล */}
             <div className={styles.agencyFormContainer}>
                
                {/* Group 1: ข้อมูลทั่วไป */}
                <div className={styles.agencySectionTitle}>ข้อมูลทั่วไป</div>
                <div className={styles.agencyFormGroup}>
                    <label className={styles.agencyLabel}>ชื่อหน่วยงาน</label>
                    <input className={styles.agencyInput} value={formData.name} onChange={(e)=>handleChange('name', e.target.value)} />
                </div>
                
                <div className={styles.agencyFormGroup}>
                    <label className={styles.agencyLabel}>ประเภทหน่วยงาน <span className={styles.req}>*</span></label>
                    <select className={styles.agencyInput} value={formData.agencyType} onChange={(e)=>handleChange('agencyType', e.target.value)}>
                        <option value="เทศบาล">เทศบาล</option>
                        <option value="อบต">อบต.</option>
                    </select>
                </div>

                {/* Group 2: รหัส (Read Only) */}
                <div className={styles.agencyDivider}></div>
                <div className={styles.agencySectionTitle}><FaUnlockAlt/> รหัสเข้าร่วม (แก้ไขไม่ได้)</div>
                <div className={styles.agencyRow2}>
                      <div className={styles.agencyFormGroup}>
                        <label className={styles.agencyLabel}>Admin Code</label>
                        <input className={styles.agencyInputCode} value={formData.adminCode} disabled style={{background: '#f0f0f0', color:'#999'}} />
                      </div>
                      <div className={styles.agencyFormGroup}>
                        <label className={styles.agencyLabel}>User Code</label>
                        <input className={styles.agencyInputCode} value={formData.userCode} disabled style={{background: '#f0f0f0', color:'#999'}} />
                      </div>
                </div>

                {/* Group 3: ที่อยู่ */}
                <div className={styles.agencyDivider}></div>
                <div className={styles.agencySectionTitle}><FaMapMarkedAlt/> ที่อยู่และติดต่อ</div>
                
                <div className={styles.agencyAddressGrid}>
                    <div className={styles.agencyFormGroup}>
                        <label className={styles.agencyLabel}>จังหวัด</label>
                        <input className={styles.agencyInput} value={formData.province} onChange={(e)=>handleChange('province', e.target.value)} />
                    </div>
                    <div className={styles.agencyFormGroup}>
                        <label className={styles.agencyLabel}>อำเภอ/เขต</label>
                        <input className={styles.agencyInput} value={formData.district} onChange={(e)=>handleChange('district', e.target.value)} />
                    </div>
                    <div className={styles.agencyFormGroup}>
                        <label className={styles.agencyLabel}>ตำบล/แขวง</label>
                        <input className={styles.agencyInput} value={formData.subDistrict} onChange={(e)=>handleChange('subDistrict', e.target.value)} />
                    </div>
                </div>

                <div className={styles.agencyFormGroup} style={{marginTop: 10}}>
                    <label className={styles.agencyLabel}>เบอร์โทรศัพท์ติดต่อ <span className={styles.req}>*</span></label>
                    <div style={{position:'relative'}}>
                        <FaPhoneAlt style={{position:'absolute', left:12, top:13, color:'#999', fontSize:12}}/>
                        <input className={styles.agencyInput} style={{paddingLeft: 35}} value={formData.phone} onChange={(e)=>handleChange('phone', e.target.value)} />
                    </div>
                </div>

             </div>
        </div>

        <div className={styles.agencyModalFooter}>
            <button 
                className={styles.agencyBtnCancel} 
                onClick={() => setIsEditModalOpen(false)}
                disabled={isSaving}
            >
                ยกเลิก
            </button>
            <button 
                className={styles.agencyBtnSave} 
                onClick={handleSaveData} 
                disabled={isSaving}
                style={{ opacity: isSaving ? 0.7 : 1, cursor: isSaving ? 'not-allowed' : 'pointer' }}
            >
                {isSaving ? <><FaSpinner className="fa-spin"/> กำลังบันทึก...</> : "บันทึกข้อมูล"}
            </button>
        </div>
      </div>
    </>
  );

  // --- VIEW MODE ---
  return (
    <>
        <div className={styles.agencyViewContainer}>
            <div className={styles.agencyProfileCard}>
                <div className={styles.agencyProfileHeader}>
                    <div className={styles.agencyLogoCircle}>
                        {logoPreview ? <img src={logoPreview} alt="Logo" className={styles.uploadedLogo} /> : <FaImage/>}
                    </div>
                    <div>
                        <h2 className={styles.agencyOrgName}>{formData.name || "-"}</h2>
                        <div className={styles.agencyBadges}>
                            <span className={styles.agencyBadgeType}><FaCity style={{fontSize:10}}/> {formData.agencyType}</span>
                        </div>
                    </div>
                </div>
                
                <button className={styles.agencyBtnEditWarning} onClick={() => setIsEditModalOpen(true)}>
                    <FaEdit /> แก้ไขข้อมูล
                </button>
            </div>

            <div className={styles.agencyInfoGrid}>
                {/* Info Box 1: Codes */}
                <div className={styles.agencyInfoBox}>
                    <div className={styles.agencyBoxHeader}><FaUnlockAlt style={{color:'#0d6efd'}}/> รหัสเข้าร่วมองค์กร</div>
                    
                    {/* Admin Code */}
                    <div className={styles.agencyDataRow}>
                        <span>Admin:</span> 
                        <div className={styles.codeRevealGroup}>
                            <strong className={styles.agencyCodeFont}>
                                {showCodes.admin ? formData.adminCode : "******"}
                            </strong>
                            <button className={styles.iconBtnEye} onClick={() => toggleCode('admin')} title="แสดง/ซ่อน">
                                {showCodes.admin ? <FaEye /> : <FaEyeSlash />}
                            </button>
                            <button className={styles.iconBtnCopy} onClick={() => handleCopy(formData.adminCode)} title="คัดลอกรหัส">
                                <FaRegCopy />
                            </button>
                        </div>
                    </div>

                    {/* User Code */}
                    <div className={styles.agencyDataRow}>
                        <span>User:</span> 
                        <div className={styles.codeRevealGroup}>
                            <strong className={styles.agencyCodeFont}>
                                {showCodes.user ? formData.userCode : "******"}
                            </strong>
                            <button className={styles.iconBtnEye} onClick={() => toggleCode('user')} title="แสดง/ซ่อน">
                                {showCodes.user ? <FaEye /> : <FaEyeSlash />}
                            </button>
                            <button className={styles.iconBtnCopy} onClick={() => handleCopy(formData.userCode)} title="คัดลอกรหัส">
                                <FaRegCopy />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Info Box 2: Address */}
                <div className={styles.agencyInfoBox}>
                    <div className={styles.agencyBoxHeader}><FaMapMarkedAlt style={{color:'#198754'}}/> พื้นที่รับผิดชอบ</div>
                    <div className={styles.agencyDataRow}><span>ที่อยู่:</span> <span>ต.{formData.subDistrict} อ.{formData.district} จ.{formData.province}</span></div>
                    <div className={styles.agencyDataRow}><span>โทรศัพท์:</span> <span style={{color:'#057a55', fontWeight:'bold'}}>{formData.phone}</span></div>
                </div>
            </div>
        </div>
        {isEditModalOpen && <AgencyEditModal />}
    </>
  );
};

// ==================================================================================
// 2-4. หน้าอื่นๆ (Map, QR) -> (Static Placeholder)
// ==================================================================================
const MapSettingsContent = () => (
  <div className={styles.settingsSection}>
    <h3 className={styles.settingsTitle}>
      <FaMapMarkedAlt style={{ marginRight: "10px", color: "#6c757d" }} /> ตั้งค่าแผนที่
    </h3>
    <p className={styles.settingsSubtitle}>ตั้งค่าการแสดงผลของแผนที่สาธารณะสำหรับประชาชน</p>
    <div className={styles.settingsItem} style={{ borderBottom: "none" }}>
      <div className={styles.settingsItemText}><span>แผนที่สาธารณะ (เปิด/ปิด)</span></div>
      <MockToggle />
    </div>
  </div>
);

const QRUnitSettingsContent = () => (
  <div className={styles.settingsSection}>
    <h3 className={styles.settingsTitle}>QRCode ประจำหน่วยงาน</h3>
    <p className={styles.settingsSubtitle}>ใช้ QR Code นี้สำหรับแชร์ให้ประชาชนทั่วไป</p>
    <div className={styles.qrCodePlaceholder}>
      <FaQrcode className={styles.mockQrIcon} />
      <span>(Mockup QR Code)</span>
    </div>
    <button className={styles.filterApplyButton} style={{ width: "100%" }}>ดาวน์โหลด QR Code</button>
  </div>
);

const QRCreateSettingsContent = () => (
  <div className={styles.settingsSection}>
    <h3 className={styles.settingsTitle}>สร้าง QR Code เอง</h3>
    <p className={styles.settingsSubtitle}>สร้าง QR Code เพื่อลิงก์ไปยังประเภทปัญหาที่กำหนดเอง</p>
    <form className={styles.qrForm} onSubmit={(e)=>e.preventDefault()}>
      <div className={styles.filterGroup}>
        <label>เลือกประเภทปัญหา</label>
        <select>
          <option>xxxx (ทั้งหมด)</option>
          <option>xxxx ไฟฟ้า/ประปา</option>
        </select>
      </div>
      <div className={styles.filterGroup}>
        <label><FaLink /> ชื่อลิงก์ (ไม่บังคับ)</label>
        <input type="text" placeholder="เช่น 'qr-ไฟดับ-โซนA'" className={styles.searchInput} />
      </div>
      <button className={styles.filterApplyButton}>สร้าง QR Code</button>
    </form>
    <div className={styles.qrCodePlaceholder} style={{ marginTop: "20px" }}>
      <span>(QR Code ที่สร้างจะแสดงที่นี่)</span>
    </div>
  </div>
);

// Main View
const SettingsView = () => {
  const settingsOptions = [
    { id: "ข้อมูลหน่วยงาน", label: "ข้อมูลหน่วยงาน" },
    { id: "แผนที่", label: "ตั้งค่าแผนที่" },
    { id: "qrหน่วยงาน", label: "QRCode หน่วยงาน" },
    { id: "qrสร้างเอง", label: "QRCode สร้างเอง" },
  ];

  const [activeSetting, setActiveSetting] = useState(settingsOptions[0].id);

  const renderSettingContent = () => {
    switch (activeSetting) {
      case "ข้อมูลหน่วยงาน": return <AgencySettings />;
      case "แผนที่": return <MapSettingsContent />;
      case "qrหน่วยงาน": return <QRUnitSettingsContent />;
      case "qrสร้างเอง": return <QRCreateSettingsContent />;
      default: return null;
    }
  };

  return (
    <div className={styles.settingsContainer}>
      <div className={styles.settingsHeaderDropdown}>
        <div className={styles.filterGroup}>
          <label style={{paddingLeft:4, marginBottom:8, display:'flex', alignItems:'center', gap:8, fontWeight:700, fontSize:15}}>
            <FaCog /> เมนูตั้งค่าระบบ
          </label>
          <select value={activeSetting} onChange={(e) => setActiveSetting(e.target.value)}>
            {settingsOptions.map((opt) => (<option key={opt.id} value={opt.id}>{opt.label}</option>))}
          </select>
        </div>
      </div>
      <div className={styles.settingsContentArea}>
        {renderSettingContent()}
      </div>
    </div>
  );
};

export default SettingsView;
