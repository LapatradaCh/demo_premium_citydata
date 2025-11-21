import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// เปลี่ยนการ import ให้ตรงกับไฟล์ CSS ของคุณ
import "./css/CreateOrg.module.css"; 

/**
 * =================================================================
 * Component 1: QuickCreatePage
 * =================================================================
 */
const QuickCreatePage = ({
  orgName,
  setOrgName,
  createdOrgName,
  isLoading,
  handleQuickCreate,
  handleBackToHome
}) => (
  <div id="page-quick-create" className="oc-page">
    <div className="oc-header">
      <h1 className="oc-title">
        {createdOrgName ? 'แก้ไขชื่อหน่วยงาน' : 'สร้างหน่วยงานของคุณ'}
      </h1>
      <p className="oc-subtitle">
        {createdOrgName ? 'กรอกชื่อที่ถูกต้องและกดยืนยัน' : 'กรอกชื่อหน่วยงานของคุณเพื่อเริ่มต้น'}
      </p>
    </div>
    <form onSubmit={handleQuickCreate} className="oc-form">
      <div className="oc-formGroup">
        <label htmlFor="org-name-quick" className="oc-label required">ชื่อหน่วยงาน</label>
        <input
          type="text"
          id="org-name-quick"
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          className="oc-input"
          placeholder="เช่น โรงพยาบาล A, สถานีตำรวจ B"
        />
      </div>
      
      <div className="oc-buttonGroup">
        <button
          type="button"
          id="btn-back-home"
          className="oc-button oc-btnBack"
          disabled={isLoading}
          onClick={handleBackToHome}
        >
          {'ย้อนกลับ'}
        </button>
        <button
          type="submit"
          id="btn-create-quick"
          className="oc-button oc-btnPrimary"
          disabled={isLoading}
        >
          {isLoading ? 'กำลังบันทึก...' : (createdOrgName ? 'ยืนยันการแก้ไข' : 'สร้างหน่วยงาน')}
        </button>
      </div>
    </form>
  </div>
);

/**
 * =================================================================
 * Component: LogoSetupForm
 * =================================================================
 */
const LogoSetupForm = ({ onSave }) => {
  const [orgImage, setOrgImage] = useState(null);
  const [orgImagePreview, setOrgImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setOrgImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setOrgImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleLogoSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting Logo:", orgImage);
    alert("บันทึกโลโก้สำเร็จ!");
    onSave();
  };

  return (
    <form onSubmit={handleLogoSubmit} className="oc-form">
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <img
          src={orgImagePreview || "https://placehold.co/150x150/E2E8F0/A0AEC0?text=โลโก้"}
          alt="Logo Preview"
          style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '1rem', border: '1px solid #e5e7eb' }}
        />
      </div>
      <div className="oc-formGroup">
          <input
            type="file"
            id="logo-upload-input"
            accept="image/*"
            onChange={handleImageChange}
            className="oc-input" 
            style={{ padding: '0.5rem' }} 
          />
          <p style={{ fontSize: '0.8rem', color: '#6c757d', marginTop: '0.5rem' }}>ขนาดไฟล์ไม่เกิน 5MB, รูปแบบ JPG, PNG</p>
      </div>
      <button type="submit" className="oc-button oc-btnPrimary">
        บันทึกโลโก้
      </button>
    </form>
  );
};

/**
 * =================================================================
 * Component: LocationSetupForm
 * =================================================================
 */
const LocationSetupForm = ({ onSave }) => {
  const [locationData, setLocationData] = useState({
    province: '', district: '', sub_district: '', contact_phone: '',
  });
  const [geoStatus, setGeoStatus] = useState('idle');
  const [geoError, setGeoError] = useState(null);

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setLocationData(prev => ({ ...prev, [name]: value }));
  };

  const handleFetchGeolocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('error');
      setGeoError('เบราว์เซอร์ไม่รองรับ Geolocation');
      return;
    }
    setGeoStatus('loading');
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const apiUrl = `https://premium-citydata-api-ab.vercel.app/api/GPS?lat=${latitude}&lon=${longitude}`;
          const response = await fetch(apiUrl);
          if (!response.ok) throw new Error(`API ล้มเหลว`);
          const data = await response.json();
          setLocationData(prev => ({
            ...prev,
            province: data.province || '',
            district: data.district || '',
            sub_district: data.sub_district || data.subdistrict || '',
          }));
          setGeoStatus('success');
        } catch (err) {
          setGeoStatus('error');
          setGeoError('ไม่สามารถดึงข้อมูลได้');
        }
      },
      (error) => {
        setGeoStatus('error');
        setGeoError(error.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleLocationSubmit = (e) => {
    e.preventDefault();
    alert("บันทึกข้อมูลขอบเขตสำเร็จ!");
    onSave();
  };

  return (
    <form onSubmit={handleLocationSubmit} className="oc-form">
      <div className="oc-formGroup">
        <button
          type="button"
          onClick={handleFetchGeolocation}
          className="oc-button"
          style={{ background: '#eaf8ff', color: '#007bff', border: '1px solid #b8daff' }}
          disabled={geoStatus === 'loading'}
        >
          {geoStatus === 'loading' ? 'กำลังค้นหา...' : '📍 ดึงตำแหน่งปัจจุบัน'}
        </button>
        {geoStatus === 'error' && <p style={{color: 'red', fontSize: '0.85rem'}}>{geoError}</p>}
      </div>

      <div className="oc-formGroup">
        <label className="oc-label">จังหวัด</label>
        <input type="text" value={locationData.province} className="oc-input" readOnly disabled />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="oc-formGroup">
           <label className="oc-label">อำเภอ/เขต</label>
           <input type="text" value={locationData.district} className="oc-input" readOnly disabled />
        </div>
        <div className="oc-formGroup">
           <label className="oc-label">ตำบล/แขวง</label>
           <input type="text" value={locationData.sub_district} className="oc-input" readOnly disabled />
        </div>
      </div>

      <div className="oc-formGroup">
        <label className="oc-label required">เบอร์โทรศัพท์ติดต่อ</label>
        <input type="tel" name="contact_phone" value={locationData.contact_phone} onChange={handleLocationChange} className="oc-input" placeholder="08XXXXXXXX" />
      </div>

      <button type="submit" className="oc-button oc-btnPrimary">
        บันทึกข้อมูล
      </button>
    </form>
  );
};

/**
 * =================================================================
 * Component: TypeSetupForm
 * =================================================================
 */
const TypeSetupForm = ({ onSave }) => {
  const [typeData, setTypeData] = useState({ org_type: '', usage_type: '' });
  const [orgTypeOptions, setOrgTypeOptions] = useState([]);
  const [usageTypeOptions, setUsageTypeOptions] = useState([]);
  
  useEffect(() => {
    // Mock fetching for UI display purposes since logic is same
    // In real use, fetch from API as in original code
    setOrgTypeOptions([{value: '1', label: 'ภาครัฐ'}, {value: '2', label: 'เอกชน'}]);
    setUsageTypeOptions([{value: '1', label: 'ทั่วไป'}, {value: '2', label: 'ฉุกเฉิน'}]);
  }, []);

  const handleTypeChange = (e) => {
    const { name, value } = e.target;
    setTypeData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(); }} className="oc-form">
      <div className="oc-formGroup">
        <label className="oc-label required">ประเภทหน่วยงาน</label>
        <select name="org_type" value={typeData.org_type} onChange={handleTypeChange} className="oc-input">
          <option value="">เลือกประเภท</option>
          {orgTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      <div className="oc-formGroup">
        <label className="oc-label required">ประเภทการใช้งาน</label>
        <select name="usage_type" value={typeData.usage_type} onChange={handleTypeChange} className="oc-input">
          <option value="">เลือกประเภทการใช้งาน</option>
          {usageTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      <button type="submit" className="oc-button oc-btnPrimary">
        บันทึกข้อมูล
      </button>
    </form>
  );
};

/**
 * =================================================================
 * Component: CodeSetupBox (ปรับโครงสร้างให้ตรงกับ CSS ใหม่)
 * =================================================================
 */
const CodeSetupBox = ({ adminCode, userCode }) => {
  const [showAdminCode, setShowAdminCode] = useState(true);
  const [copyStatus, setCopyStatus] = useState('idle');

  const currentCode = showAdminCode ? adminCode : userCode;
  const currentCodeType = showAdminCode ? 'Admin Code' : 'User Code';
  
  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopyStatus('copied');
    setTimeout(() => setCopyStatus('idle'), 2000);
  };

  return (
    <div className="oc-code-row">
      <div className="oc-code-label-group">
        <span className="oc-code-label">{currentCodeType}</span>
        <button type="button" className="oc-code-switch" onClick={() => setShowAdminCode(!showAdminCode)}>
          {showAdminCode ? 'สลับเป็น User' : 'สลับเป็น Admin'}
        </button>
      </div>
      
      <div className="oc-code-value-box">
        <span className="oc-code-value">{currentCode}</span>
        <button type="button" className="oc-btn-copy" onClick={handleCopy}>
           {copyStatus === 'copied' ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  );
};

/**
 * =================================================================
 * Component: SetupGuidePage (ใช้ Card Accordion จาก CSS)
 * =================================================================
 */
const SetupGuidePage = ({
  createdOrgName,
  adminCode,
  userCode,
  handleGoBackToEdit,
}) => {
  const [activeAccordion, setActiveAccordion] = useState(null);

  const handleAccordionClick = (section) => {
    setActiveAccordion(activeAccordion === section ? null : section);
  };
  
  // Helper to render accordion item
  const AccordionItem = ({ id, title, subtitle, iconClass, iconChar, children }) => {
    const isOpen = activeAccordion === id;
    return (
      <div className={`oc-card ${isOpen ? 'open' : ''}`}>
        <div className="oc-card-header" onClick={() => handleAccordionClick(id)}>
          <div className={`oc-icon-box ${iconClass}`}>{iconChar}</div>
          <div className="oc-card-text">
            <div className="oc-card-title">{title}</div>
            <div className="oc-card-desc">{subtitle}</div>
          </div>
          <div className="oc-arrow">▼</div>
        </div>
        <div className="oc-card-content">
          <div className="oc-content-inner">
            {children}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div id="page-setup-guide" className="oc-page">
      <div className="oc-header">
        <h1 className="oc-title">
          ยินดีต้อนรับสู่ <span style={{color: 'var(--oc-color-green-dark)'}}>{createdOrgName}</span>!
        </h1>
        <p className="oc-subtitle">องค์กรของคุณถูกสร้างเรียบร้อยแล้ว</p>
      </div>

      <div className="oc-accordion">
        <h2 className="oc-section-title">ขั้นตอนต่อไป (แนะนำ)</h2>
        
        {/* 1. รหัสเข้าร่วม */}
        <AccordionItem 
          id="code" 
          title="รหัสเข้าร่วมองค์กร" 
          subtitle="สำหรับแชร์ให้สมาชิก Admin และ User"
          iconClass="oc-icon-key"
          iconChar="🔑"
        >
          <CodeSetupBox adminCode={adminCode} userCode={userCode} />
        </AccordionItem>

        {/* 2. อัปโหลดโลโก้ */}
        <AccordionItem 
          id="logo" 
          title="อัปโหลดโลโก้" 
          subtitle="เพิ่มตราสัญลักษณ์ให้สมาชิกจำได้ง่าย"
          iconClass="oc-icon-img"
          iconChar="🖼️"
        >
          <LogoSetupForm onSave={() => handleAccordionClick(null)} />
        </AccordionItem>

        {/* 3. กำหนดขอบเขต */}
        <AccordionItem 
          id="location" 
          title="กำหนดขอบเขตที่รับผิดชอบ" 
          subtitle="ระบุตำแหน่งและเบอร์ติดต่อ"
          iconClass="oc-icon-pin"
          iconChar="📍"
        >
          <LocationSetupForm onSave={() => handleAccordionClick(null)} />
        </AccordionItem>

        {/* 4. ตั้งค่าประเภท */}
        <AccordionItem 
          id="types" 
          title="ตั้งค่าประเภทหน่วยงาน" 
          subtitle="ระบุประเภทและการใช้งาน"
          iconClass="oc-icon-tag"
          iconChar="🏷️"
        >
          <TypeSetupForm onSave={() => handleAccordionClick(null)} />
        </AccordionItem>
      </div>
      
      <div className="oc-buttonGroup" style={{marginTop: '3rem'}}>
        <button
          type="button"
          className="oc-footer-btn"
          onClick={handleGoBackToEdit} 
        >
          ย้อนกลับไปแก้ไขชื่อหน่วยงาน
        </button>
      </div>
    </div>
  );
};

/**
 * =================================================================
 * Main Component: CreateOrg
 * =================================================================
 */
function CreateOrg() {
  const [page, setPage] = useState('create');
  const navigate = useNavigate();

  const [orgName, setOrgName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [createdOrgName, setCreatedOrgName] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [userCode, setUserCode] = useState('');

  const handleQuickCreate = (e) => {
    e.preventDefault();
    if (!orgName) {
      alert('กรุณากรอกชื่อหน่วยงาน');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      const randomPartAdmin = Math.random().toString(36).substring(2, 6).toUpperCase();
      const randomPartUser = Math.random().toString(36).substring(2, 7).toUpperCase();
      setCreatedOrgName(orgName);
      setAdminCode(`ADMIN-${randomPartAdmin}`);
      setUserCode(`USER-${randomPartUser}`);
      setIsLoading(false);
      setPage('setup');
    }, 1500);
  };

  const handleGoBackToEdit = () => {
    setOrgName(createdOrgName);
    setPage('create');
  };

  const handleBackToHome = () => {
    navigate('/home1');
  };

  return (
    // Wrapper นี้สำคัญมาก เพื่อให้ CSS Variables ใน .org-create-wrapper ทำงาน
    <div className="org-create-wrapper">
      {page === 'create' ? (
        <QuickCreatePage
          orgName={orgName}
          setOrgName={setOrgName}
          createdOrgName={createdOrgName}
          isLoading={isLoading}
          handleQuickCreate={handleQuickCreate}
          handleBackToHome={handleBackToHome}
        />
      ) : (
        <SetupGuidePage
          createdOrgName={createdOrgName}
          adminCode={adminCode}
          userCode={userCode}
          handleGoBackToEdit={handleGoBackToEdit}
        />
      )}
    </div>
  );
}

export default CreateOrg;
