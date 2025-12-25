import React, { useState, useRef, useEffect } from "react";
import styles from "./css/SettingsView.module.css";
import {
  FaMapMarkedAlt, FaCog, FaTimes, FaUnlockAlt, 
  FaSyncAlt, FaEye, FaEyeSlash, FaQrcode, FaLink, FaEdit, FaImage,
  FaCheckCircle, FaPhoneAlt, FaCity, FaRegCopy, FaSpinner,
  FaChevronDown, FaCheck
} from "react-icons/fa";

// ------------------------------------------------------------------
// --- Config & Constants ---
// ------------------------------------------------------------------
const API_BASE_URL = "https://premium-citydata-api-ab.vercel.app/api/organizations";
const API_ORG_TYPES_URL = "https://premium-citydata-api-ab.vercel.app/api/organization-types";

// ------------------------------------------------------------------
// --- Helper Components ---
// ------------------------------------------------------------------
const MockToggle = () => (
  <label className={styles.mockToggle}>
    <input type="checkbox" />
    <span className={styles.mockSlider}></span>
  </label>
);

// ✅ NEW: Custom Dropdown Component (แก้ไขปัญหา Overflow และดีไซน์)
const CustomDropdown = ({ options, value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    // ปิด dropdown เมื่อคลิกพื้นที่อื่น
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedLabel = options.find(o => o.value === value)?.label || "Select...";

    return (
        <div className={styles.customSelectWrapper} ref={wrapperRef}>
            <div className={styles.customSelectTrigger} onClick={() => setIsOpen(!isOpen)}>
                <span>{selectedLabel}</span>
                <FaChevronDown className={`${styles.customSelectArrow} ${isOpen ? styles.open : ''}`} />
            </div>
            {isOpen && (
                <div className={styles.customSelectOptions}>
                    {options.map((opt) => (
                        <div 
                            key={opt.value} 
                            className={`${styles.customOption} ${opt.value === value ? styles.selected : ''}`}
                            onClick={() => { onChange(opt.value); setIsOpen(false); }}
                        >
                            {opt.label}
                            {opt.value === value && <FaCheck size={12}/>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ==================================================================================
// 1. ส่วน "ข้อมูลหน่วยงาน"
// ==================================================================================
const AgencySettings = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [orgId, setOrgId] = useState(null);
  const [showCodes, setShowCodes] = useState({ admin: false, user: false });
  const [logoPreview, setLogoPreview] = useState(null); 
  const fileInputRef = useRef(null); 
  const [orgTypeOptions, setOrgTypeOptions] = useState([]);

  const [formData, setFormData] = useState({
    name: "", adminCode: "", userCode: "", agencyType: "", 
    province: "", district: "", subDistrict: "", phone: "",
  });

  useEffect(() => {
    const fetchOrgTypes = async () => {
        try {
            const res = await fetch(API_ORG_TYPES_URL);
            if(res.ok) {
                const data = await res.json();
                setOrgTypeOptions(data);
            }
        } catch (error) { console.error("Error fetching org types:", error); }
    };

    const fetchOrgData = async () => {
      try {
        setIsLoading(true);
        let currentId = null;
        try {
          const storedOrgString = localStorage.getItem("lastSelectedOrg");
          if (storedOrgString) currentId = JSON.parse(storedOrgString)?.id;
        } catch (error) { console.error(error); }

        if (!currentId) {
            alert("ไม่พบข้อมูลหน่วยงาน"); setIsLoading(false); return;
        }
        setOrgId(currentId);
        
        await fetchOrgTypes(); 
        const res = await fetch(`${API_BASE_URL}?id=${currentId}`);
        const data = await res.json();

        setFormData({
            name: data.organization_name || "",
            adminCode: data.admin_code || "",
            userCode: data.organization_code || "",
            agencyType: data.org_type_id || "", 
            province: data.province || "",
            district: data.district || "",
            subDistrict: data.sub_district || "",
            phone: data.contact_phone || "",
        });
        if (data.url_logo) setLogoPreview(data.url_logo);

      } catch (error) { console.error(error); alert("โหลดข้อมูลไม่สำเร็จ"); } 
      finally { setIsLoading(false); }
    };
    fetchOrgData();
  }, []);

  const handleSaveData = async () => {
    try {
        setIsSaving(true);
        if (!orgId) throw new Error("ไม่พบ ID หน่วยงาน");

        const payload = {
            organization_id: orgId,
            organization_name: formData.name,
            org_type_id: formData.agencyType, 
            district: formData.district,
            sub_district: formData.subDistrict,
            province: formData.province,
            contact_phone: formData.phone,
        };

        const res = await fetch(API_BASE_URL, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error("Update failed");

        const updatedData = await res.json();
        alert("บันทึกข้อมูลเรียบร้อยแล้ว!");
        setFormData(prev => ({ ...prev, name: updatedData.organization_name }));
        setIsEditModalOpen(false);

    } catch (error) { console.error(error); alert("บันทึกไม่สำเร็จ"); } 
    finally { setIsSaving(false); }
  };

  const handleChange = (field, value) => { setFormData({ ...formData, [field]: value }); };
  const toggleCode = (key) => { setShowCodes(prev => ({ ...prev, [key]: !prev[key] })); };
  const handleCopy = (text) => { navigator.clipboard.writeText(text); alert(`คัดลอกรหัสเรียบร้อย`); };
  const handleImageClick = () => { fileInputRef.current.click(); };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setLogoPreview(URL.createObjectURL(file));
  };
  const getOrgTypeLabel = (id) => orgTypeOptions.find(opt => opt.value === id)?.label || "-";

  if (isLoading) return <div style={{ padding: "50px", textAlign: "center" }}><FaSpinner className="fa-spin" /> Loading...</div>;

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
                            <span className={styles.agencyBadgeType}><FaCity style={{fontSize:10}}/> {getOrgTypeLabel(formData.agencyType)}</span>
                        </div>
                    </div>
                </div>
                <button className={styles.agencyBtnEditWarning} onClick={() => setIsEditModalOpen(true)}><FaEdit /> แก้ไขข้อมูล</button>
            </div>

            <div className={styles.agencyInfoGrid}>
                <div className={styles.agencyInfoBox}>
                    <div className={styles.agencyBoxHeader}><FaUnlockAlt style={{color:'#0d6efd'}}/> รหัสเข้าร่วมองค์กร</div>
                    <div className={styles.agencyDataRow}>
                        <span>Admin:</span> 
                        <div className={styles.codeRevealGroup}>
                            <strong className={styles.agencyCodeFont}>{showCodes.admin ? formData.adminCode : "******"}</strong>
                            <button className={styles.iconBtnEye} onClick={() => toggleCode('admin')}>{showCodes.admin ? <FaEye /> : <FaEyeSlash />}</button>
                            <button className={styles.iconBtnCopy} onClick={() => handleCopy(formData.adminCode)}><FaRegCopy /></button>
                        </div>
                    </div>
                    <div className={styles.agencyDataRow}>
                        <span>User:</span> 
                        <div className={styles.codeRevealGroup}>
                            <strong className={styles.agencyCodeFont}>{showCodes.user ? formData.userCode : "******"}</strong>
                            <button className={styles.iconBtnEye} onClick={() => toggleCode('user')}>{showCodes.user ? <FaEye /> : <FaEyeSlash />}</button>
                            <button className={styles.iconBtnCopy} onClick={() => handleCopy(formData.userCode)}><FaRegCopy /></button>
                        </div>
                    </div>
                </div>
                <div className={styles.agencyInfoBox}>
                    <div className={styles.agencyBoxHeader}><FaMapMarkedAlt style={{color:'#198754'}}/> พื้นที่รับผิดชอบ</div>
                    <div className={styles.agencyDataRow}><span>ที่อยู่:</span> <span>{formData.subDistrict} {formData.district} {formData.province}</span></div>
                    <div className={styles.agencyDataRow}><span>โทรศัพท์:</span> <span style={{color:'#057a55', fontWeight:'bold'}}>{formData.phone}</span></div>
                </div>
            </div>
        </div>
        
        {isEditModalOpen && (
            <>
              <div className={styles.agencyModalBackdrop} onClick={() => !isSaving && setIsEditModalOpen(false)} />
              <div className={styles.agencyModalContainer}>
                <div className={styles.agencyModalHeader}>
                    <h3 className={styles.agencyModalTitle}>แก้ไขข้อมูลหน่วยงาน</h3>
                    <button className={styles.agencyBtnCloseRed} onClick={() => setIsEditModalOpen(false)} disabled={isSaving}><FaTimes /></button>
                </div>
                <div className={styles.agencyModalBody}>
                      <div className={styles.agencyImageSection}>
                        <input type="file" ref={fileInputRef} style={{ display: "none" }} accept="image/*" onChange={handleFileChange}/>
                        <div className={styles.agencyImageCircle} onClick={handleImageClick}>
                            {logoPreview ? <img src={logoPreview} alt="Logo" className={styles.uploadedLogo} /> : <FaImage size={32} color="#ccc"/>}
                            <div className={styles.agencyEditOverlay}><FaEdit/></div>
                        </div>
                        <span className={styles.agencyHint}>แตะเพื่อเปลี่ยนโลโก้</span>
                      </div>
                      <div className={styles.agencyFormContainer}>
                        <div className={styles.agencySectionTitle}>ข้อมูลทั่วไป</div>
                        <div className={styles.agencyFormGroup}>
                            <label className={styles.agencyLabel}>ชื่อหน่วยงาน</label>
                            <input className={styles.agencyInput} value={formData.name} onChange={(e)=>handleChange('name', e.target.value)} />
                        </div>
                        {/* Dropdown ประเภทหน่วยงานใน Modal (ใช้ Select เดิมเพื่อความง่าย) */}
                        <div className={styles.agencyFormGroup}>
                            <label className={styles.agencyLabel}>ประเภทหน่วยงาน <span className={styles.req}>*</span></label>
                            <select className={styles.agencyInput} value={formData.agencyType} onChange={(e)=>handleChange('agencyType', e.target.value)}>
                                <option value="">-- กรุณาเลือก --</option>
                                {orgTypeOptions.map((option) => (<option key={option.value} value={option.value}>{option.label}</option>))}
                            </select>
                        </div>
                        <div className={styles.agencyDivider}></div>
                        <div className={styles.agencySectionTitle}><FaUnlockAlt/> รหัสเข้าร่วม (แก้ไขไม่ได้)</div>
                        <div className={styles.agencyRow2}>
                              <div className={styles.agencyFormGroup}><label className={styles.agencyLabel}>Admin Code</label><input className={styles.agencyInputCode} value={formData.adminCode} disabled style={{background: '#f0f0f0', color:'#999'}} /></div>
                              <div className={styles.agencyFormGroup}><label className={styles.agencyLabel}>User Code</label><input className={styles.agencyInputCode} value={formData.userCode} disabled style={{background: '#f0f0f0', color:'#999'}} /></div>
                        </div>
                        <div className={styles.agencyDivider}></div>
                        <div className={styles.agencySectionTitle}><FaMapMarkedAlt/> ที่อยู่และติดต่อ</div>
                        <div className={styles.agencyAddressGrid}>
                            <div className={styles.agencyFormGroup}><label className={styles.agencyLabel}>จังหวัด</label><input className={styles.agencyInput} value={formData.province} onChange={(e)=>handleChange('province', e.target.value)} /></div>
                            <div className={styles.agencyFormGroup}><label className={styles.agencyLabel}>อำเภอ/เขต</label><input className={styles.agencyInput} value={formData.district} onChange={(e)=>handleChange('district', e.target.value)} /></div>
                            <div className={styles.agencyFormGroup}><label className={styles.agencyLabel}>ตำบล/แขวง</label><input className={styles.agencyInput} value={formData.subDistrict} onChange={(e)=>handleChange('subDistrict', e.target.value)} /></div>
                        </div>
                        <div className={styles.agencyFormGroup} style={{marginTop: 10}}>
                            <label className={styles.agencyLabel}>เบอร์โทรศัพท์ติดต่อ <span className={styles.req}>*</span></label>
                            <div style={{position:'relative'}}><FaPhoneAlt style={{position:'absolute', left:12, top:13, color:'#999', fontSize:12}}/><input className={styles.agencyInput} style={{paddingLeft: 35}} value={formData.phone} onChange={(e)=>handleChange('phone', e.target.value)} /></div>
                        </div>
                      </div>
                </div>
                <div className={styles.agencyModalFooter}>
                    <button className={styles.agencyBtnCancel} onClick={() => setIsEditModalOpen(false)} disabled={isSaving}>ยกเลิก</button>
                    <button className={styles.agencyBtnSave} onClick={handleSaveData} disabled={isSaving}>{isSaving ? <><FaSpinner className="fa-spin"/> ...</> : "บันทึกข้อมูล"}</button>
                </div>
              </div>
            </>
        )}
    </>
  );
};

// ==================================================================================
// 2-4. หน้าอื่นๆ (Static)
// ==================================================================================
const MapSettingsContent = () => (
  <div className={styles.settingsSection}>
    <h3 className={styles.settingsTitle}><FaMapMarkedAlt style={{ marginRight: "10px", color: "#6c757d" }} /> ตั้งค่าแผนที่</h3>
    <p className={styles.settingsSubtitle}>ตั้งค่าการแสดงผลของแผนที่สาธารณะสำหรับประชาชน</p>
    <div className={styles.settingsItem} style={{ borderBottom: "none" }}><div className={styles.settingsItemText}><span>แผนที่สาธารณะ (เปิด/ปิด)</span></div><MockToggle /></div>
  </div>
);

const QRUnitSettingsContent = () => (
  <div className={styles.settingsSection}>
    <h3 className={styles.settingsTitle}>QRCode ประจำหน่วยงาน</h3>
    <p className={styles.settingsSubtitle}>ใช้ QR Code นี้สำหรับแชร์ให้ประชาชนทั่วไป</p>
    <div className={styles.qrCodePlaceholder}><FaQrcode className={styles.mockQrIcon} /><span>(Mockup QR Code)</span></div>
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
        <select className={styles.agencyInput}>
          <option>xxxx (ทั้งหมด)</option>
          <option>xxxx ไฟฟ้า/ประปา</option>
        </select>
      </div>
      <div className={styles.filterGroup}><label><FaLink /> ชื่อลิงก์ (ไม่บังคับ)</label><input type="text" placeholder="เช่น 'qr-ไฟดับ-โซนA'" className={styles.agencyInput} /></div>
      <button className={styles.filterApplyButton}>สร้าง QR Code</button>
    </form>
    <div className={styles.qrCodePlaceholder} style={{ marginTop: "20px" }}><span>(QR Code ที่สร้างจะแสดงที่นี่)</span></div>
  </div>
);

// Main View
const SettingsView = () => {
  const settingsOptions = [
    { value: "ข้อมูลหน่วยงาน", label: "ข้อมูลหน่วยงาน" },
    { value: "แผนที่", label: "ตั้งค่าแผนที่" },
    { value: "qrหน่วยงาน", label: "QRCode หน่วยงาน" },
    { value: "qrสร้างเอง", label: "QRCode สร้างเอง" },
  ];

  const [activeSetting, setActiveSetting] = useState(settingsOptions[0].value);

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
          <label style={{paddingLeft:4, marginBottom:0, display:'flex', alignItems:'center', gap:8, fontWeight:700, fontSize:15}}>
            <FaCog /> เมนูตั้งค่าระบบ
          </label>
          
          {/* ✅ ใช้วิธี Custom Dropdown แทน Select เดิม เพื่อไม่ให้ล้นจอ */}
          <CustomDropdown 
            options={settingsOptions} 
            value={activeSetting} 
            onChange={(val) => setActiveSetting(val)} 
          />
          
        </div>
      </div>
      <div className={styles.settingsContentArea}>
        {renderSettingContent()}
      </div>
    </div>
  );
};

export default SettingsView;
