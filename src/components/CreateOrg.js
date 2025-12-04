import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./css/CreateOrg.modulde.css"; // นำเข้า CSS ไฟล์นี้

// URL ของ API
const API_BASE_URL = "https://premium-citydata-api-ab.vercel.app/api";

// --- Helper Component: Wrapper สำหรับใส่ไอคอนหน้า Input/Select ---
const InputWrapper = ({ icon, children }) => (
  <div className="inputIconWrapper">
    <div className="inputIcon">{icon}</div>
    {children}
  </div>
);

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
  handleBackToHome,
  error
}) => (
  <div id="page-quick-create" className="page pageCreate">
    <div className="pageHeader">
      <h1 className="pageTitle">
        {createdOrgName ? 'แก้ไขชื่อหน่วยงาน' : 'สร้างหน่วยงานของคุณ'}
      </h1>
      <p className="pageSubtitle">
        {createdOrgName ? 'กรอกชื่อที่ถูกต้องและกดยืนยัน' : 'กรอกชื่อหน่วยงานของคุณเพื่อเริ่มต้น'}
      </p>
    </div>
    <form onSubmit={handleQuickCreate} className="form">
      <div className="formGroup">
        <label htmlFor="org-name-quick" className="label required">ชื่อหน่วยงาน</label>
        <input
          type="text"
          id="org-name-quick"
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          className="input"
          placeholder="เช่น โรงพยาบาล A, สถานีตำรวจ B"
          disabled={isLoading}
        />
      </div>
      
      {error && <div className="errorMessage">{error}</div>}
      
      <div className="buttonGroup">
        <button
          type="button"
          id="btn-back-home"
          className="button btnPrimaryBack"
          disabled={isLoading}
          onClick={handleBackToHome}
        >
          {'ย้อนกลับ'}
        </button>
        <button
          type="submit"
          id="btn-create-quick"
          className="button btnSuccess"
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
 * Component 2: LogoSetupForm (มีปุ่มกล้องมุมขวา)
 * =================================================================
 */
const LogoSetupForm = ({ onSave, orgId }) => {
  const [orgImage, setOrgImage] = useState(null);
  const [orgImagePreview, setOrgImagePreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setOrgImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setOrgImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleLogoSubmit = async (e) => {
    e.preventDefault();
    if (!orgId) return alert("ไม่พบรหัสหน่วยงาน (Organization ID)");
    
    setIsSaving(true);
    
    const mockLogoUrl = "https://placehold.co/400x400/png?text=Logo"; 

    try {
      const response = await fetch(`${API_BASE_URL}/organizations`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_id: orgId,
          url_logo: mockLogoUrl
        }),
      });

      if (!response.ok) throw new Error('Update logo failed');

      alert("บันทึกโลโก้สำเร็จ!");
      onSave();
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการบันทึกโลโก้");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleLogoSubmit}>
      <div className="logoUploadBox">
        
        {/* Wrapper สำหรับรูปภาพและปุ่มแก้ไข */}
        <div className="logoWrapper">
          <img
            id="logo-preview"
            src={orgImagePreview || "https://placehold.co/150x150/f0f0f0/cccccc?text=LOGO"}
            alt="Logo Preview"
            className="logoPreview"
          />
          
          {/* ปุ่มไอคอนกล้องสีเหลือง */}
          <div 
            className="editIcon" 
            onClick={() => document.getElementById('logo-upload-input').click()}
            title="เปลี่ยนรูปภาพ"
          >
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
             </svg>
          </div>
        </div>
        
        <div className="logoUploadActions">
          <input
            type="file"
            id="logo-upload-input"
            accept="image/*"
            className="hiddenFileInput"
            onChange={handleImageChange}
          />
          
          <p style={{fontSize: '0.85rem', color: '#999', margin: '1rem 0'}}>
            ขนาดไฟล์ไม่เกิน 5MB, รูปแบบ JPG, PNG
          </p>
          
          <button 
            type="submit" 
            className="button btnSuccess"
            disabled={isSaving}
            style={{ width: 'auto', minWidth: '150px' }}
          >
            {isSaving ? 'กำลังบันทึก...' : 'บันทึกโลโก้'}
          </button>
        </div>
      </div>
    </form>
  );
};

/**
 * =================================================================
 * Component 3: LocationSetupForm (ดีไซน์ใหม่: Smart Card + Icons)
 * =================================================================
 */
const LocationSetupForm = ({ onSave, orgId }) => {
  const [locationData, setLocationData] = useState({
    province: '', district: '', sub_district: '', contact_phone: '', latitude: '', longitude: ''
  });
  const [geoStatus, setGeoStatus] = useState('idle');
  const [geoError, setGeoError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setLocationData(prev => ({ ...prev, [name]: value }));
  };

  const handleFetchGeolocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('error'); setGeoError('อุปกรณ์ไม่รองรับ GPS'); return;
    }
    setGeoStatus('loading'); setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`${API_BASE_URL}/GPS?lat=${latitude}&lon=${longitude}`);
          if (!res.ok) throw new Error('API Error');
          const data = await res.json();
          setLocationData(prev => ({
            ...prev, province: data.province || '', district: data.district || '',
            sub_district: data.sub_district || data.subdistrict || '',
            latitude, longitude
          }));
          setGeoStatus('success');
        } catch (err) { setGeoStatus('error'); setGeoError('ดึงข้อมูลไม่สำเร็จ'); }
      },
      (err) => { setGeoStatus('error'); setGeoError(err.message); },
      { enableHighAccuracy: true }
    );
  };

  const handleLocationSubmit = async (e) => {
    e.preventDefault();
    if (!orgId) return alert("ไม่พบรหัสหน่วยงาน");
    setIsSaving(true);
    try {
      await fetch(`${API_BASE_URL}/organizations`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organization_id: orgId, ...locationData }),
      });
      alert("บันทึกข้อมูลสำเร็จ!"); onSave();
    } catch (err) { alert("เกิดข้อผิดพลาด"); } 
    finally { setIsSaving(false); }
  };

  return (
    <form onSubmit={handleLocationSubmit}>
      {/* 1. Hero Action: ปุ่มดึงตำแหน่งแบบการ์ดสวยๆ */}
      <div 
        className={`geoActionBox ${geoStatus === 'success' ? 'geoSuccess' : ''}`}
        onClick={handleFetchGeolocation}
      >
        <div className="geoIconCircle">
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
        </div>
        <div className="geoTextContent">
          <h4 className="geoTitle">
            {geoStatus === 'loading' ? 'กำลังค้นหาตำแหน่ง...' : (geoStatus === 'success' ? 'ดึงข้อมูลเรียบร้อยแล้ว' : 'ดึงตำแหน่งปัจจุบันอัตโนมัติ')}
          </h4>
          <p className="geoSubtitle">
             {geoStatus === 'success' ? 'ข้อมูลถูกกรอกลงในแบบฟอร์มอัตโนมัติ' : 'คลิกเพื่อระบุพิกัด GPS และที่อยู่ของคุณ'}
          </p>
        </div>
        {geoStatus === 'loading' && <div className="spinner"></div>}
      </div>

      {geoStatus === 'error' && <div className="errorMessage" style={{marginBottom: '1rem'}}>{geoError}</div>}

      {/* 2. Form Grid พร้อมไอคอน */}
      <div className="formGrid">
        <div className="formGroup">
          <label className="label">จังหวัดที่รับผิดชอบ</label>
          <InputWrapper icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><map name=""></map><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>}>
            <input type="text" name="province" value={locationData.province} className="input inputWithIcon" readOnly disabled placeholder="-" />
          </InputWrapper>
        </div>
        
        <div className="formGroup"> 
          <label className="label">อำเภอ/เขต</label>
          <InputWrapper icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>}>
            <input type="text" name="district" value={locationData.district} className="input inputWithIcon" readOnly disabled placeholder="-" />
          </InputWrapper>
        </div>

        <div className="formGroup">
          <label className="label">ตำบล/แขวง</label>
          <InputWrapper icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z"></path></svg>}>
            <input type="text" name="sub_district" value={locationData.sub_district} className="input inputWithIcon" readOnly disabled placeholder="-" />
          </InputWrapper>
        </div>

        <div className="formGroup">
          <label className="label required">เบอร์โทรศัพท์ติดต่อ</label>
          <InputWrapper icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={locationData.contact_phone ? "#28a745" : "#888"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>}>
             <input type="tel" name="contact_phone" value={locationData.contact_phone} onChange={handleLocationChange} className="input inputWithIcon" placeholder="08XXXXXXXX" style={{borderColor: locationData.contact_phone ? '#28a745' : ''}} />
          </InputWrapper>
        </div>

        <div className="submitRow">
          <button type="submit" className="button btnSuccess" disabled={isSaving} style={{ width: '100%' }}>
             {isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
          </button>
        </div>
      </div>
    </form>
  );
};

/**
 * =================================================================
 * Component 4: TypeSetupForm (ดีไซน์ใหม่: Dropdown with Icons)
 * =================================================================
 */
const TypeSetupForm = ({ onSave, orgId }) => {
  const [typeData, setTypeData] = useState({ org_type_id: '', usage_type_id: '' });
  const [orgTypeOptions, setOrgTypeOptions] = useState([]);
  const [usageTypeOptions, setUsageTypeOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchTypes = async () => {
      setLoading(true);
      try {
        const [res1, res2] = await Promise.all([
          fetch(`${API_BASE_URL}/organization-types`),
          fetch(`${API_BASE_URL}/usage-types`)
        ]);
        setOrgTypeOptions(await res1.json());
        setUsageTypeOptions(await res2.json());
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    fetchTypes();
  }, []);

  const handleChange = (e) => setTypeData({ ...typeData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!orgId) return alert("ไม่พบรหัสหน่วยงาน");
    setIsSaving(true);
    try {
      await fetch(`${API_BASE_URL}/organizations`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organization_id: orgId, ...typeData }),
      });
      alert("บันทึกข้อมูลสำเร็จ!"); onSave();
    } catch (err) { alert("เกิดข้อผิดพลาด"); } 
    finally { setIsSaving(false); }
  };

  if (loading) return <div style={{textAlign:'center', padding:'2rem'}}>กำลังโหลดข้อมูล...</div>;

  return (
    <form onSubmit={handleSubmit}>
      <div className="formGrid">
        
        {/* Dropdown 1: ประเภทหน่วยงาน */}
        <div className="formGroup">
          <label className="label required">ประเภทหน่วยงาน</label>
          <InputWrapper icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="22.01"></line><line x1="15" y1="22" x2="15" y2="22.01"></line><line x1="12" y1="18" x2="12" y2="18.01"></line><line x1="12" y1="14" x2="12" y2="14.01"></line><line x1="12" y1="10" x2="12" y2="10.01"></line><line x1="12" y1="6" x2="12" y2="6.01"></line><line x1="16" y1="18" x2="16" y2="18.01"></line><line x1="16" y1="14" x2="16" y2="14.01"></line><line x1="16" y1="10" x2="16" y2="10.01"></line><line x1="16" y1="6" x2="16" y2="6.01"></line><line x1="8" y1="18" x2="8" y2="18.01"></line><line x1="8" y1="14" x2="8" y2="14.01"></line><line x1="8" y1="10" x2="8" y2="10.01"></line><line x1="8" y1="6" x2="8" y2="6.01"></line></svg>
          }>
            <select
              name="org_type_id"
              value={typeData.org_type_id}
              onChange={handleChange}
              className="select inputWithIcon"
            >
              <option value="">เลือกประเภทหน่วยงาน</option>
              {orgTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </InputWrapper>
        </div>

        {/* Dropdown 2: ประเภทการใช้งาน */}
        <div className="formGroup">
          <label className="label required">ประเภทการใช้งาน</label>
          <InputWrapper icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
          }>
            <select
              name="usage_type_id"
              value={typeData.usage_type_id}
              onChange={handleChange}
              className="select inputWithIcon"
            >
              <option value="">เลือกประเภทการใช้งาน</option>
              {usageTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </InputWrapper>
        </div>
        
        <div className="submitRow">
            <button
            type="submit"
            className="button btnSuccess"
            disabled={!typeData.org_type_id || !typeData.usage_type_id || isSaving}
            style={{ width: '100%' }}
            >
            {isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
            </button>
        </div>
      </div>
    </form>
  );
};

/**
 * =================================================================
 * Component 5: CodeSetupBox (Updated: Tab Switcher)
 * =================================================================
 */
const CodeSetupBox = ({ adminCode, userCode }) => {
  const [codeType, setCodeType] = useState('admin');
  const [copyStatus, setCopyStatus] = useState('idle');

  const currentCode = codeType === 'admin' ? adminCode : userCode;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode).then(() => {
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    }).catch(err => alert('คัดลอกไม่สำเร็จ'));
  };

  return (
    <div className="codeBoxContainer">
      
      {/* Tab Switcher แทน Dropdown */}
      <div className="tabContainer">
        <button 
          type="button"
          onClick={() => setCodeType('admin')}
          className={`tabBtn ${codeType === 'admin' ? 'tabActive' : ''}`}
        >
          🔑 Admin Code
        </button>
        <button 
          type="button"
          onClick={() => setCodeType('user')}
          className={`tabBtn ${codeType === 'user' ? 'tabActive' : ''}`}
        >
          👤 User Code
        </button>
      </div>
      
      <p className="tabDescription">
        {codeType === 'admin' ? 'รหัสสำหรับผู้ดูแล (แก้ไขข้อมูลได้)' : 'รหัสสำหรับสมาชิก (ดูข้อมูลได้อย่างเดียว)'}
      </p>

      <div className="codeDisplayBox">
        <span className="codeText">
          {currentCode}
        </span>
        <button 
          type="button" 
          onClick={handleCopy}
          className="btnCopy"
          title={copyStatus === 'copied' ? 'คัดลอกสำเร็จ' : 'คัดลอกรหัส'}
        >
          {copyStatus === 'copied' ? (
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          ) : (
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          )}
        </button>
      </div>
    </div>
  );
};

/**
 * =================================================================
 * Component 6: SetupGuidePage
 * =================================================================
 */
const SetupGuidePage = ({
  createdOrgName,
  adminCode, 
  userCode,   
  orgId, 
  handleGoBackToEdit,
}) => {
  const [activeAccordion, setActiveAccordion] = useState(null); 

  const handleAccordionClick = (section) => {
    setActiveAccordion(activeAccordion === section ? null : section);
  };
  
  return (
    <div id="page-setup-guide" className="page pageSetup">
      <div className="pageHeader">
        <h1 className="pageTitle">
          ยินดีต้อนรับสู่ <span className="orgNameHighlight">{createdOrgName}</span>
        </h1>
        <p className="pageSubtitle">องค์กรของคุณถูกสร้างเรียบร้อยแล้ว</p>
      </div>

      <div className="setupContainer">
        <div style={{textAlign: 'center', color: '#ff9800', fontWeight: 'bold', marginBottom: '1.5rem'}}>
             ขั้นตอนต่อไป (แนะนำ)
        </div>
        <div className="accordion" id="setup-accordion">

          {/* 1. รหัสเข้าร่วม */}
          <div className="accordionItem">
            <button
              type="button"
              className="accordionHeader"
              onClick={() => handleAccordionClick('code')}
            >
              <div className="accordionIcon">🔑</div>
              <div style={{flex: 1}}>
                <p className="accordionTitle">รหัสเข้าร่วมองค์กร</p>
                <p className="accordionSubtitle">สำหรับแชร์ให้สมาชิก Admin และ User</p>
              </div>
              <div className={`accordionArrow ${activeAccordion === 'code' ? 'rotate180' : ''}`}>▼</div>
            </button>
            <div className={`accordionContentWrapper ${activeAccordion === 'code' ? 'open' : ''}`}>
              <div className="accordionContent">
                <div className="accordionInner">
                   <CodeSetupBox adminCode={adminCode} userCode={userCode} />
                </div>
              </div>
            </div>
          </div>

          {/* 2. อัปโหลดโลโก้ */}
          <div className="accordionItem">
            <button
              type="button"
              className="accordionHeader"
              onClick={() => handleAccordionClick('logo')}
            >
              <div className="accordionIcon">🖼️</div>
              <div style={{flex: 1}}>
                <p className="accordionTitle">อัปโหลดโลโก้</p>
                <p className="accordionSubtitle">เพิ่มตราสัญลักษณ์ให้สมาชิกจำได้ง่าย</p>
              </div>
              <div className={`accordionArrow ${activeAccordion === 'logo' ? 'rotate180' : ''}`}>▼</div>
            </button>
            <div className={`accordionContentWrapper ${activeAccordion === 'logo' ? 'open' : ''}`}>
              <div className="accordionContent">
                <div className="accordionInner">
                   <LogoSetupForm onSave={() => handleAccordionClick(null)} orgId={orgId} />
                </div>
              </div>
            </div>
          </div>

          {/* 3. กำหนดขอบเขต */}
          <div className="accordionItem">
            <button
              type="button"
              className="accordionHeader"
              onClick={() => handleAccordionClick('location')}
            >
              <div className="accordionIcon">📍</div>
              <div style={{flex: 1}}>
                <p className="accordionTitle">กำหนดขอบเขตที่รับผิดชอบ</p>
                <p className="accordionSubtitle">ระบุตำแหน่งและเบอร์ติดต่อ</p>
              </div>
              <div className={`accordionArrow ${activeAccordion === 'location' ? 'rotate180' : ''}`}>▼</div>
            </button>
            <div className={`accordionContentWrapper ${activeAccordion === 'location' ? 'open' : ''}`}>
              <div className="accordionContent">
                <div className="accordionInner">
                    <LocationSetupForm onSave={() => handleAccordionClick(null)} orgId={orgId} />
                </div>
              </div>
            </div>
          </div>

          {/* 4. ตั้งค่าประเภท */}
          <div className="accordionItem">
            <button
              type="button"
              className="accordionHeader"
              onClick={() => handleAccordionClick('types')}
            >
              <div className="accordionIcon">🏷️</div>
              <div style={{flex: 1}}>
                <p className="accordionTitle">ตั้งค่าประเภทหน่วยงาน</p>
                <p className="accordionSubtitle">ระบุประเภทและการใช้งาน</p>
              </div>
              <div className={`accordionArrow ${activeAccordion === 'types' ? 'rotate180' : ''}`}>▼</div>
            </button>
            <div className={`accordionContentWrapper ${activeAccordion === 'types' ? 'open' : ''}`}>
              <div className="accordionContent">
                <div className="accordionInner">
                    <TypeSetupForm onSave={() => handleAccordionClick(null)} orgId={orgId} />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      
      <div className="buttonGroup" style={{ marginTop: '3rem' }}>
        <button
          type="button"
          id="btn-back-to-edit"
          className="button btnPrimaryBack"
          onClick={handleGoBackToEdit} 
        >
          {'ย้อนกลับไปแก้ไขชื่อหน่วยงาน'}
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
  const [error, setError] = useState(null);

  const [createdOrgName, setCreatedOrgName] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [userCode, setUserCode] = useState('');
   
  const [orgId, setOrgId] = useState(null); 

  const handleQuickCreate = async (e) => {
    e.preventDefault();
    if (!orgName) {
      alert('กรุณากรอกชื่อหน่วยงาน');
      return;
    }
    
    setIsLoading(true);
    setError(null);

    const generateCustomCode = (prefix) => {
      const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const numbers = "0123456789";
      let chars = [];
      for (let i = 0; i < 3; i++) {
        chars.push(letters.charAt(Math.floor(Math.random() * letters.length)));
      }
      for (let i = 0; i < 3; i++) {
        chars.push(numbers.charAt(Math.floor(Math.random() * numbers.length)));
      }
      for (let i = chars.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [chars[i], chars[j]] = [chars[j], chars[i]];
      }
      return prefix + chars.join('');
    };

    const newOrgCode = generateCustomCode('U');   
    const newAdminCode = generateCustomCode('A'); 
    
    const payload = {
        organization_code: newOrgCode,
        organization_name: orgName,
        admin_code: newAdminCode,
    };

    try {
        const response = await fetch(`${API_BASE_URL}/organizations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'เกิดข้อผิดพลาดในการสร้างหน่วยงาน');
        }
        
        setCreatedOrgName(orgName);
        setAdminCode(newAdminCode);
        setUserCode(newOrgCode); 
        setOrgId(data.organization_id); 
        setPage('setup');

    } catch (err) {
        console.error("API Error:", err);
        setError(err.message);
        if(err.message.includes('already')) {
            alert('รหัสหน่วยงานซ้ำ กรุณาลองใหม่อีกครั้ง');
        }
    } finally {
        setIsLoading(false);
    }
  };

  const handleGoBackToEdit = () => {
    setOrgName(createdOrgName);
    setPage('create');
  };

  const handleBackToHome = () => {
    navigate('/home1');
  };

  return (
    // [สำคัญ] เพิ่ม ID นี้เพื่อ Scope CSS ไม่ให้กระทบหน้าอื่น
    <div id="my-custom-page" className="container">
      {page === 'create' ? (
        <QuickCreatePage
          orgName={orgName}
          setOrgName={setOrgName}
          createdOrgName={createdOrgName}
          isLoading={isLoading}
          handleQuickCreate={handleQuickCreate}
          handleBackToHome={handleBackToHome}
          error={error}
        />
      ) : (
        <SetupGuidePage
          createdOrgName={createdOrgName}
          adminCode={adminCode}
          userCode={userCode}
          orgId={orgId} 
          handleGoBackToEdit={handleGoBackToEdit}
        />
      )}
    </div>
  );
}

export default CreateOrg;
