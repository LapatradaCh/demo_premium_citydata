import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./css/CreateOrg.module.css";

// URL ของ API
const API_BASE_URL = "https://premium-citydata-api-ab.vercel.app/api";

/**
 * =================================================================
 * Component 1: QuickCreatePage (หน้าแรก - สร้างหน่วยงาน)
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
  <div id="page-quick-create" className={`${styles.page} ${styles.pageCreate}`}>
    <div className={styles.pageHeader}>
      <h1 className={styles.pageTitle}>
        {createdOrgName ? 'แก้ไขชื่อหน่วยงาน' : 'สร้างหน่วยงานของคุณ'}
      </h1>
      <p className={styles.pageSubtitle}>
        {createdOrgName ? 'กรอกชื่อที่ถูกต้องและกดยืนยัน' : 'กรอกชื่อหน่วยงานของคุณเพื่อเริ่มต้น'}
      </p>
    </div>
    <form onSubmit={handleQuickCreate} className={styles.form}>
      <div className={styles.formGroup}>
        <label htmlFor="org-name-quick" className={`${styles.label} ${styles.required}`}>ชื่อหน่วยงาน</label>
        <input
          type="text"
          id="org-name-quick"
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          className={styles.input}
          placeholder="เช่น โรงพยาบาล A, สถานีตำรวจ B"
          disabled={isLoading}
        />
      </div>
      
      {/* แสดง Error Message */}
      {error && <div className={styles.errorMessage}>{error}</div>}
      
      <div className={styles.buttonGroup}>
        <button
          type="button"
          id="btn-back-home"
          className={`${styles.button} ${styles.btnPrimaryBack}`}
          disabled={isLoading}
          onClick={handleBackToHome}
        >
          {'ย้อนกลับ'}
        </button>
        <button
          type="submit"
          id="btn-create-quick"
          className={`${styles.button} ${styles.btnPrimary}`}
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
 * Component 2: LogoSetupForm (อัปเดตโลโก้) - ปรับปุ่มให้สวย
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
    
    // Note: จำลองการส่ง URL
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
      <div className={styles.logoUploadBox}>
        {/* รูป Preview */}
        <img
          id="logo-preview"
          src={orgImagePreview || "https://placehold.co/150x150/E2E8F0/A0AEC0?text=LOGO"}
          alt="Logo Preview"
          className={styles.logoPreview}
        />
        
        <div className={styles.logoUploadActions}>
          {/* ซ่อน Input ตัวจริง */}
          <input
            type="file"
            id="logo-upload-input"
            accept="image/*"
            className={styles.hiddenFileInput}
            onChange={handleImageChange}
          />
          {/* ใช้ Label ทำเป็นปุ่มแทน */}
          <label
            htmlFor="logo-upload-input"
            className={`${styles.button} ${styles.btnSecondary}`}
            style={{ width: 'auto', minWidth: '150px' }}
          >
            เลือกไฟล์โลโก้
          </label>
          
          <p className={styles.helpTextSmall}>ขนาดไฟล์ไม่เกิน 5MB, รูปแบบ JPG, PNG</p>
          
          <button 
            type="submit" 
            className={`${styles.button} ${styles.btnSuccess} ${styles.btnSave}`}
            disabled={isSaving}
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
 * Component 3: LocationSetupForm - ปรับ Grid Layout
 * =================================================================
 */
const LocationSetupForm = ({ onSave, orgId }) => {
  const [locationData, setLocationData] = useState({
    province: '',
    district: '',
    sub_district: '',
    contact_phone: '',
    latitude: '',
    longitude: ''
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
      setGeoStatus('error');
      setGeoError('เบราว์เซอร์ของคุณไม่รองรับ Geolocation');
      return;
    }
    setGeoStatus('loading');
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const apiUrl = `${API_BASE_URL}/GPS?lat=${latitude}&lon=${longitude}`;
          const response = await fetch(apiUrl);
          if (!response.ok) throw new Error(`API ล้มเหลว (Status: ${response.status})`);
          
          const data = await response.json();
          setLocationData(prev => ({
            ...prev,
            province: data.province || '',
            district: data.district || '',
            sub_district: data.sub_district || data.subdistrict || '',
            latitude: latitude,
            longitude: longitude
          }));
          setGeoStatus('success');
        } catch (err) {
          console.error(err);
          setGeoStatus('error');
          setGeoError('ไม่สามารถดึงข้อมูลที่อยู่ได้ (API Error)');
        }
      },
      (error) => {
        setGeoStatus('error');
        setGeoError(error.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleLocationSubmit = async (e) => {
    e.preventDefault();
    if (!orgId) return alert("ไม่พบรหัสหน่วยงาน (Organization ID)");
    setIsSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/organizations`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_id: orgId,
          ...locationData
        }),
      });
      if (!response.ok) throw new Error('Update location failed');
      alert("บันทึกข้อมูลขอบเขตสำเร็จ!");
      onSave();
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการบันทึกที่อยู่");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleLocationSubmit}>
      <div className={styles.geoButtonContainer}>
        <button
          type="button"
          onClick={handleFetchGeolocation}
          className={`${styles.button} ${styles.btnGeo}`}
          disabled={geoStatus === 'loading'}
        >
          {geoStatus === 'loading' ? 'กำลังค้นหา...' : '📍 ดึงตำแหน่งปัจจุบัน'}
        </button>
        {geoStatus === 'error' && <p className={styles.errorMessage}>{geoError}</p>}
      </div>

      {/* ใช้ Grid Layout */}
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label htmlFor="province" className={styles.label}>จังหวัดที่รับผิดชอบ</label>
          <input type="text" id="province" name="province" value={locationData.province} className={styles.input} readOnly disabled />
        </div>
        <div className={styles.formGroup}> 
          <label htmlFor="district" className={styles.label}>อำเภอ/เขต</label>
          <input type="text" id="district" name="district" value={locationData.district} className={styles.input} readOnly disabled />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="sub_district" className={styles.label}>ตำบล/แขวง</label>
          <input type="text" id="sub_district" name="sub_district" value={locationData.sub_district} className={styles.input} readOnly disabled />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="contact_phone" className={`${styles.label} ${styles.required}`}>เบอร์โทรศัพท์ติดต่อ</label>
          <input type="tel" id="contact_phone" name="contact_phone" value={locationData.contact_phone} onChange={handleLocationChange} className={styles.input} placeholder="08XXXXXXXX" />
        </div>
        
        {/* ปุ่ม Submit เต็มแถว */}
        <div className={styles.submitRow}>
          <button type="submit" className={`${styles.button} ${styles.btnSuccess}`} disabled={isSaving}>
             {isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
          </button>
        </div>
      </div>
    </form>
  );
};

/**
 * =================================================================
 * Component 4: TypeSetupForm - ปรับ Grid Layout
 * =================================================================
 */
const TypeSetupForm = ({ onSave, orgId }) => {
  const [typeData, setTypeData] = useState({ org_type_id: '', usage_type_id: '' });
  const [orgTypeOptions, setOrgTypeOptions] = useState([]);
  const [usageTypeOptions, setUsageTypeOptions] = useState([]);
  const [typesLoading, setTypesLoading] = useState(false);
  const [typesError, setTypesError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchTypes = async () => {
      setTypesLoading(true);
      setTypesError(null);
      try {
        const [orgTypeRes, usageTypeRes] = await Promise.all([
          fetch(`${API_BASE_URL}/organization-types`),
          fetch(`${API_BASE_URL}/usage-types`)
        ]);
        if (!orgTypeRes.ok || !usageTypeRes.ok) throw new Error('ไม่สามารถดึงข้อมูลประเภทได้');
        const orgTypeData = await orgTypeRes.json();
        const usageTypeData = await usageTypeRes.json();
        setOrgTypeOptions(orgTypeData);
        setUsageTypeOptions(usageTypeData);
      } catch (error) {
        setTypesError(error.message);
      } finally {
        setTypesLoading(false);
      }
    };
    fetchTypes();
  }, []);

  const handleTypeChange = (e) => {
    const { name, value } = e.target;
    setTypeData(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeSubmit = async (e) => {
    e.preventDefault();
    if (!orgId) return alert("ไม่พบรหัสหน่วยงาน");
    setIsSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/organizations`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_id: orgId,
          org_type_id: typeData.org_type_id,
          usage_type_id: typeData.usage_type_id
        }),
      });
      if (!response.ok) throw new Error('Update types failed');
      alert("บันทึกข้อมูลประเภทสำเร็จ!");
      onSave();
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการบันทึกประเภท");
    } finally {
      setIsSaving(false);
    }
  };

  if (typesLoading) return <p>กำลังโหลดข้อมูลประเภท...</p>;
  if (typesError) return <p className={styles.errorMessage}>{typesError}</p>;

  return (
    <form onSubmit={handleTypeSubmit} className={styles.formGrid}>
      <div className={styles.formGroup}>
        <label htmlFor="org_type_id" className={`${styles.label} ${styles.required}`}>ประเภทหน่วยงาน</label>
        <select
          id="org_type_id"
          name="org_type_id"
          value={typeData.org_type_id}
          onChange={handleTypeChange}
          className={styles.select}
        >
          <option value="">เลือกประเภท</option>
          {orgTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="usage_type_id" className={`${styles.label} ${styles.required}`}>ประเภทการใช้งาน</label>
        <select
          id="usage_type_id"
          name="usage_type_id"
          value={typeData.usage_type_id}
          onChange={handleTypeChange}
          className={styles.select}
        >
          <option value="">เลือกประเภทการใช้งาน</option>
          {usageTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
      <div className={styles.submitRow}>
        <button
          type="submit"
          className={`${styles.button} ${styles.btnSuccess}`}
          disabled={!typeData.org_type_id || !typeData.usage_type_id || isSaving}
        >
          {isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
        </button>
      </div>
    </form>
  );
};

/**
 * =================================================================
 * Component 5: CodeSetupBox
 * =================================================================
 */
const CodeSetupBox = ({ adminCode, userCode }) => {
  const [showAdminCode, setShowAdminCode] = useState(true);
  const [copyStatus, setCopyStatus] = useState('idle');

  const currentCode = showAdminCode ? adminCode : userCode;
  const currentCodeType = showAdminCode ? 'Admin Code' : 'User Code';
  const toggleCodeType = () => setShowAdminCode(!showAdminCode);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode).then(() => {
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    }).catch(err => alert('คัดลอกไม่สำเร็จ'));
  };

  return (
    <div className={styles.codeBoxContent}>
      <div className={styles.codeBoxHeader}>
        <span className={styles.codeBoxType}>{currentCodeType}</span>
        <button type="button" className={styles.codeBoxSwitch} onClick={toggleCodeType}>
          {showAdminCode ? 'สลับเป็น User Code' : 'สลับเป็น Admin Code'}
        </button>
      </div>
      <div className={styles.codeBoxDisplayWrapper}>
        <div className={styles.codeBoxDisplay}>{currentCode}</div>
        <button 
          type="button"
          onClick={handleCopy}
          className={`${styles.codeCopyButton} ${copyStatus === 'copied' ? styles.copied : ''}`}
        >
          {copyStatus === 'copied' ? 'คัดลอกแล้ว!' : 'คัดลอก'}
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
const SetupGuidePage = ({ createdOrgName, adminCode, userCode, orgId, handleGoBackToEdit }) => {
  const [activeAccordion, setActiveAccordion] = useState(null); 
  const handleAccordionClick = (section) => {
    setActiveAccordion(activeAccordion === section ? null : section);
  };
  
  return (
    <div id="page-setup-guide" className={`${styles.page} ${styles.pageSetup}`}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          ยินดีต้อนรับสู่ <span className={styles.orgNameHighlight}>{createdOrgName}</span>
        </h1>
        <p className={styles.pageSubtitle}>องค์กรของคุณถูกสร้างเรียบร้อยแล้ว</p>
      </div>

      <div className={styles.accordion}>
        <h2 className={styles.contentTitle} style={{textAlign:'center', border:'none'}}>ขั้นตอนต่อไป (แนะนำ)</h2>
        
        {/* Accordion Items */}
        {['code', 'logo', 'location', 'types'].map((item) => {
          let title, subtitle, icon, content;
          if (item === 'code') {
             title = "รหัสเข้าร่วมองค์กร"; subtitle = "สำหรับแชร์ให้สมาชิก Admin และ User"; icon = "🔑";
             content = <CodeSetupBox adminCode={adminCode} userCode={userCode} />;
          } else if (item === 'logo') {
             title = "อัปโหลดโลโก้"; subtitle = "เพิ่มตราสัญลักษณ์ให้สมาชิกจำได้ง่าย"; icon = "🖼️";
             content = <LogoSetupForm onSave={() => handleAccordionClick(null)} orgId={orgId} />;
          } else if (item === 'location') {
             title = "กำหนดขอบเขตที่รับผิดชอบ"; subtitle = "ระบุตำแหน่งและเบอร์ติดต่อ"; icon = "📍";
             content = <LocationSetupForm onSave={() => handleAccordionClick(null)} orgId={orgId} />;
          } else {
             title = "ตั้งค่าประเภทหน่วยงาน"; subtitle = "ระบุประเภทและการใช้งาน"; icon = "🏷️";
             content = <TypeSetupForm onSave={() => handleAccordionClick(null)} orgId={orgId} />;
          }

          return (
            <div key={item} className={styles.accordionItem}>
              <button type="button" className={styles.accordionHeader} onClick={() => handleAccordionClick(item)}>
                <div className={styles.accordionIcon}>{icon}</div>
                <div style={{flex: 1}}>
                  <p className={styles.accordionTitle}>{title}</p>
                  <p className={styles.accordionSubtitle}>{subtitle}</p>
                </div>
                <svg className={`${styles.accordionArrow} ${activeAccordion === item ? styles.rotate180 : ''}`} xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
              <div className={`${styles.accordionContentWrapper} ${activeAccordion === item ? styles.open : ''}`}>
                <div className={styles.accordionContent}>
                   <h3 className={styles.contentTitle}>{title}</h3>
                   {content}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className={styles.buttonGroup} style={{ marginTop: '3rem' }}>
        <button
          type="button"
          className={`${styles.button} ${styles.btnPrimaryBack}`}
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
 * Main Component
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
    if (!orgName) return alert('กรุณากรอกชื่อหน่วยงาน');
    setIsLoading(true);
    setError(null);

    const generateCustomCode = (prefix) => {
      const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const numbers = "0123456789";
      let chars = [];
      for (let i = 0; i < 3; i++) chars.push(letters.charAt(Math.floor(Math.random() * letters.length)));
      for (let i = 0; i < 3; i++) chars.push(numbers.charAt(Math.floor(Math.random() * numbers.length)));
      for (let i = chars.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [chars[i], chars[j]] = [chars[j], chars[i]];
      }
      return prefix + chars.join('');
    };

    const newOrgCode = generateCustomCode('U');   
    const newAdminCode = generateCustomCode('A'); 
    
    try {
        const response = await fetch(`${API_BASE_URL}/organizations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                organization_code: newOrgCode,
                organization_name: orgName,
                admin_code: newAdminCode,
            }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'เกิดข้อผิดพลาดในการสร้างหน่วยงาน');

        setCreatedOrgName(orgName);
        setAdminCode(newAdminCode);
        setUserCode(newOrgCode); 
        setOrgId(data.organization_id); 
        setPage('setup');

    } catch (err) {
        console.error("API Error:", err);
        setError(err.message);
        if(err.message.includes('already')) alert('รหัสหน่วยงานซ้ำ กรุณาลองใหม่อีกครั้ง');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {page === 'create' ? (
        <QuickCreatePage
          orgName={orgName}
          setOrgName={setOrgName}
          createdOrgName={createdOrgName}
          isLoading={isLoading}
          handleQuickCreate={handleQuickCreate}
          handleBackToHome={() => navigate('/home1')}
          error={error}
        />
      ) : (
        <SetupGuidePage
          createdOrgName={createdOrgName}
          adminCode={adminCode}
          userCode={userCode}
          orgId={orgId} 
          handleGoBackToEdit={() => { setOrgName(createdOrgName); setPage('create'); }}
        />
      )}
    </div>
  );
}

export default CreateOrg;
