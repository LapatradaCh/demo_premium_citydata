import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./css/CreateOrg.module.css";

/**
 * =================================================================
 * Component 1: QuickCreatePage (No Changes)
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
        />
      </div>
      
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
 * REFACTOR: Component ย่อยสำหรับจัดการฟอร์มโลโก้ (ปรับปรุง Layout)
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
    onSave(); // บอก Parent (SetupGuidePage) ให้ปิด Accordion
  };

  return (
    <form onSubmit={handleLogoSubmit} className={styles.contentForm}>
      {/* REFACTOR: ใช้ Layout ใหม่ */}
      <div className={styles.logoUploadBox}>
        <img
          id="logo-preview"
          src={orgImagePreview || "https://placehold.co/150x150/E2E8F0/A0AEC0?text=โลโก้"}
          alt="Logo Preview"
          className={styles.logoPreview}
        />
        {/* REFACTOR: เพิ่ม .logoUploadActions wrapper */}
        <div className={styles.logoUploadActions}>
          <input
            type="file"
            id="logo-upload-input"
            accept="image/*"
            className={styles.hiddenFileInput}
            onChange={handleImageChange}
          />
          <label
            htmlFor="logo-upload-input"
            className={`${styles.button} ${styles.btnSecondary}`}
          >
            เลือกไฟล์โลโก้
          </label>
          <p className={styles.helpTextSmall}>ขนาดไฟล์ไม่เกิน 5MB, รูปแบบ JPG, PNG</p>
          <button type="submit" className={`${styles.button} ${styles.btnSuccess} ${styles.btnSave}`}>
            บันทึกโลโก้
          </button>
        </div>
      </div>
    </form>
  );
};


/**
 * =================================================================
 * REFACTOR: Component ย่อยสำหรับจัดการฟอร์มตำแหน่ง (No Changes)
 * =================================================================
 */
const LocationSetupForm = ({ onSave }) => {
  const [locationData, setLocationData] = useState({
    province: '',
    district: '',
    sub_district: '',
    contact_phone: '',
  });
  const [geoStatus, setGeoStatus] = useState('idle');
  const [geoError, setGeoError] = useState(null);

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    // FIX: อนุญาตให้กรอกเบอร์โทรศัพท์ได้
    // if (name === 'contact_phone') {
      setLocationData(prev => ({ ...prev, [name]: value }));
    // }
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
          const apiUrl = `https://premium-citydata-api-ab.vercel.app/api/GPS?lat=${latitude}&lon=${longitude}`;
          const response = await fetch(apiUrl);
          if (!response.ok) throw new Error(`API ล้มเหลว (Status: ${response.status})`);
          
          const data = await response.json();
          setLocationData(prev => ({
            ...prev,
            province: data.province || '',
            district: data.district || '',
            sub_district: data.sub_district || data.subdistrict || '',
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
        if (error.code === error.PERMISSION_DENIED) {
          setGeoError('คุณปฏิเสธการเข้าถึงตำแหน่ง');
        } else if (error.code === error.TIMEOUT) {
          setGeoError('ไม่สามารถค้นหาตำแหน่งได้ (หมดเวลา) ลองอีกครั้ง');
        } else {
          setGeoError(error.message);
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleLocationSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting Location:", locationData);
    alert("บันทึกข้อมูลขอบเขตสำเร็จ!");
    onSave();
  };

  return (
    <form onSubmit={handleLocationSubmit} className={`${styles.contentForm} ${styles.formGrid}`}>
      <div className={`${styles.formGroup} ${styles.geoButtonContainer}`}>
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

      <div className={styles.submitRow}>
        <button type="submit" className={`${styles.button} ${styles.btnSuccess}`}>
          บันทึกข้อมูล
        </button>
      </div>
    </form>
  );
};

/**
 * =================================================================
 * REFACTOR: Component ย่อยสำหรับจัดการฟอร์มประเภท (No Changes)
 * =================================================================
 */
const TypeSetupForm = ({ onSave }) => {
  const [typeData, setTypeData] = useState({ org_type: '', usage_type: '' });
  const [orgTypeOptions, setOrgTypeOptions] = useState([]);
  const [usageTypeOptions, setUsageTypeOptions] = useState([]);
  const [typesLoading, setTypesLoading] = useState(false);
  const [typesError, setTypesError] = useState(null);

  useEffect(() => {
    const fetchTypes = async () => {
      setTypesLoading(true);
      setTypesError(null);
      try {
        const [orgTypeRes, usageTypeRes] = await Promise.all([
          fetch('https://premium-citydata-api-ab.vercel.app/api/organization-types'),
          fetch('https://premium-citydata-api-ab.vercel.app/api/usage-types')
        ]);
        if (!orgTypeRes.ok || !usageTypeRes.ok) {
          throw new Error('ไม่สามารถดึงข้อมูลประเภทหน่วยงานได้');
        }
        const orgTypeData = await orgTypeRes.json();
        const usageTypeData = await usageTypeRes.json();
        setOrgTypeOptions(orgTypeData);
        setUsageTypeOptions(usageTypeData);
      } catch (error) {
  _     console.error("Error fetching types:", error);
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

  const handleTypeSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting Types (UUIDs):", typeData);
    alert("บันทึกข้อมูลประเภทสำเร็จ!");
    onSave();
  };

  if (typesLoading) return <p>กำลังโหลดข้อมูลประเภท...</p>;
  if (typesError) return <p className={styles.errorMessage}>{typesError}</p>;

  return (
    <form onSubmit={handleTypeSubmit} className={`${styles.contentForm} ${styles.formGrid}`}>
      <div className={styles.formGroup}>
        <label htmlFor="org_type" className={`${styles.label} ${styles.required}`}>ประเภทหน่วยงาน</label>
        <select
          id="org_type"
          name="org_type"
          value={typeData.org_type}
          onChange={handleTypeChange}
          className={styles.select}
          disabled={orgTypeOptions.length === 0}
        >
          <option value="">เลือกประเภท</option>
          {orgTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="usage_type" className={`${styles.label} ${styles.required}`}>ประเภทการใช้งาน</label>
        <select
          id="usage_type"
          name="usage_type"
          value={typeData.usage_type}
          onChange={handleTypeChange}
          className={styles.select}
          disabled={usageTypeOptions.length === 0}
        >
          <option value="">เลือกประเภทการใช้งาน</option>
          {usageTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.submitRow}>
        <button
          type="submit"
          className={`${styles.button} ${styles.btnSuccess}`}
          disabled={!typeData.org_type || !typeData.usage_type}
        >
          บันทึกข้อมูล
        </button>
      </div>
    </form>
  );
};

/**
 * =================================================================
 * NEW: Component 3: CodeSetupBox (สำหรับแสดงรหัสใน Accordion)
 * =================================================================
 */
const CodeSetupBox = ({ adminCode, userCode }) => {
  const [showAdminCode, setShowAdminCode] = useState(true);
  const [copyStatus, setCopyStatus] = useState('idle'); // idle, copied

  const currentCode = showAdminCode ? adminCode : userCode;
  const currentCodeType = showAdminCode ? 'Admin Code' : 'User Code';
  
  const toggleCodeType = () => setShowAdminCode(!showAdminCode);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode).then(() => {
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
      alert('คัดลอกไม่สำเร็จ');
    });
  };

  return (
    <div className={styles.codeBoxContent}>
      <div className={styles.codeBoxHeader}>
        <span className={styles.codeBoxType}>{currentCodeType}</span>
        <button
          type="button"
          className={styles.codeBoxSwitch}
          onClick={toggleCodeType}
        >
          {showAdminCode ? 'สลับเป็น User Code' : 'สลับเป็น Admin Code'}
        </button>
      </div>
      <div className={styles.codeBoxDisplayWrapper}>
        <div id="display-org-code" className={styles.codeBoxDisplay}>
          {currentCode}
        </div>
        <button 
          type="button"
          onClick={handleCopy}
          className={`${styles.codeCopyButton} ${copyStatus === 'copied' ? styles.copied : ''}`}
        >
          {copyStatus === 'copied' ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              คัดลอกแล้ว!
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.03 1.125 0 1.13.094 1.976 1.057 1.976 2.192V7.5m-9 3v5.25A2.25 2.25 0 006.75 18h10.5a2.25 2.25 0 002.25-2.25V10.5m-15 0a2.25 2.25 0 012.25-2.25h10.5a2.25 2.25 0 012.25 2.25m-15 0V7.5A2.25 2.25 0 014.5 5.25h15A2.25 2.25 0 0121.75 7.5v3" /></svg>
              คัดลอก
            </>
          )}
        </button>
      </div>
    </div>
  );
};


/**
 * =================================================================
 * REFACTOR: Component 4: SetupGuidePage (ปรับปรุง Org Code Box และ Accordion)
 * =================================================================
 */
const SetupGuidePage = ({
  createdOrgName,
  adminCode, // รับ Admin Code
  userCode,   // รับ User Code
  handleGoBackToEdit,
}) => {
  const [activeAccordion, setActiveAccordion] = useState(null); // เริ่มต้นโดยไม่มีอะไรเปิด

  const handleAccordionClick = (section) => {
    setActiveAccordion(activeAccordion === section ? null : section);
  };
  
  return (
    <div id="page-setup-guide" className={`${styles.page} ${styles.pageSetup}`}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          <span>ยินดีต้อนรับสู่ <span className={styles.orgNameHighlight}>{createdOrgName}</span>!</span>
        </h1>
        <p className={styles.pageSubtitle}>องค์กรของคุณถูกสร้างเรียบร้อยแล้ว</p>
      </div>

      {/* REMOVED: .orgCodeBox ถูกย้ายเข้าไปใน Accordion */}

      <div className={styles.setupContainer}>
        <h2 className={styles.setupTitle}>ขั้นตอนต่อไป (แนะนำ)</h2>
        <div className={styles.accordion} id="setup-accordion">

          {/* ====== NEW: 1. รหัสเข้าร่วม ====== */}
          <div className={styles.accordionItem}>
            <button
              type="button"
              className={styles.accordionHeader}
              onClick={() => handleAccordionClick('code')}
            >
              {/* NEW: เพิ่ม class .iconBgCode */}
              <div className={`${styles.accordionIcon} ${styles.iconBgCode}`}>🔑</div>
              <div className={styles.accordionTitleBox}>
                <p className={styles.accordionTitle}>รหัสเข้าร่วมองค์กร</p>
                <p className={styles.accordionSubtitle}>สำหรับแชร์ให้สมาชิก Admin และ User</p>
              </div>
              <svg className={`${styles.accordionArrow} ${activeAccordion === 'code' ? styles.rotate180 : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            <div className={`${styles.accordionContentWrapper} ${activeAccordion === 'code' ? styles.open : ''}`}>
              <div className={styles.accordionContent}>
                {/* NEW: ใช้ Component ใหม่ */}
                <CodeSetupBox adminCode={adminCode} userCode={userCode} />
              </div>
            </div>
          </div>


          {/* ====== 2. อัปโหลดโลโก้ (was 1) ====== */}
          <div className={styles.accordionItem}>
            <button
              type="button"
              className={styles.accordionHeader}
              onClick={() => handleAccordionClick('logo')}
            >
              {/* NEW: เพิ่ม class .iconBgLogo */}
              <div className={`${styles.accordionIcon} ${styles.iconBgLogo}`}>🖼️</div>
              <div className={styles.accordionTitleBox}>
                <p className={styles.accordionTitle}>อัปโหลดโลโก้</p>
                <p className={styles.accordionSubtitle}>เพิ่มตราสัญลักษณ์ให้สมาชิกจำได้ง่าย</p>
              </div>
              <svg className={`${styles.accordionArrow} ${activeAccordion === 'logo' ? styles.rotate180 : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
      _       <div className={`${styles.accordionContentWrapper} ${activeAccordion === 'logo' ? styles.open : ''}`}>
              <div className={styles.accordionContent}>
                <h3 className={styles.contentTitle}>อัปโหลดโลโก้หน่วยงาน</h3>
                <LogoSetupForm onSave={() => handleAccordionClick(null)} />
              </div>
            </div>
          </div>

          {/* ====== 3. กำหนดขอบเขต (was 2) ====== */}
          <div className={styles.accordionItem}>
            <button
              type="button"
              className={styles.accordionHeader}
              onClick={() => handleAccordionClick('location')}
            >
              {/* NEW: เพิ่ม class .iconBgLocation */}
              <div className={`${styles.accordionIcon} ${styles.iconBgLocation}`}>📍</div>
              <div className={styles.accordionTitleBox}>
                <p className={styles.accordionTitle}>กำหนดขอบเขตที่รับผิดชอบ</p>
                <p className={styles.accordionSubtitle}>ระบุตำแหน่งและเบอร์ติดต่อ</p>
              </div>
              <svg className={`${styles.accordionArrow} ${activeAccordion === 'location' ? styles.rotate180 : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            <div className={`${styles.accordionContentWrapper} ${activeAccordion === 'location' ? styles.open : ''}`}>
              <div className={styles.accordionContent}>
                <h3 className={styles.contentTitle}>กำหนดขอบเขตและข้อมูลติดต่อ</h3>
                <LocationSetupForm onSave={() => handleAccordionClick(null)} />
              </div>
            </div>
          </div>

          {/* ====== 4. ตั้งค่าประเภท (was 3) ====== */}
          <div className={styles.accordionItem}>
            <button
              type="button"
              className={styles.accordionHeader}
              onClick={() => handleAccordionClick('types')}
            >
              {/* NEW: เพิ่ม class .iconBgType */}
              <div className={`${styles.accordionIcon} ${styles.iconBgType}`}>🏷️</div>
              <div className={styles.accordionTitleBox}>
                <p className={styles.accordionTitle}>ตั้งค่าประเภทหน่วยงาน</p>
                <p className={styles.accordionSubtitle}>ระบุประเภทและการใช้งาน</p>
              </div>
              <svg className={`${styles.accordionArrow} ${activeAccordion === 'types' ? styles.rotate180 : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            <div className={`${styles.accordionContentWrapper} ${activeAccordion === 'types' ? styles.open : ''}`}>
              <div className={styles.accordionContent}>
                <h3 className={styles.contentTitle}>ตั้งค่าประเภทหน่วยงานและการใช้งาน</h3>
                <TypeSetupForm onSave={() => handleAccordionClick(null)} />
              </div>
            </div>
          </div>

        </div>
      </div>
      
      {/* ปุ่มย้อนกลับ (สีแดง) ด้านล่างสุดของหน้าจอ */}
      <div className={styles.buttonGroup} style={{ marginTop: '3rem' }}>
        <button
          type="button"
          id="btn-back-to-edit"
          className={`${styles.button} ${styles.btnPrimaryBack}`}
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
 * Main Component: CreateOrg (เพิ่มการสร้าง Admin/User Code)
 * =================================================================
 */
function CreateOrg() {
  const [page, setPage] = useState('create');
  const navigate = useNavigate();

  const [orgName, setOrgName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [createdOrgName, setCreatedOrgName] = useState('');
  // แยก Org Code เป็น Admin/User Code
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
      // สร้างรหัส Admin (เช่น ADMIN-H8DK)
      const randomPartAdmin = Math.random().toString(36).substring(2, 6).toUpperCase();
      const newAdminCode = `ADMIN-${randomPartAdmin}`;
      
      // สร้างรหัส User (เช่น USER-8G9F)
      const randomPartUser = Math.random().toString(36).substring(2, 7).toUpperCase();
      const newUserCode = `USER-${randomPartUser}`;

      setCreatedOrgName(orgName);
      setAdminCode(newAdminCode);
      setUserCode(newUserCode);
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
    /* ★★★ นี่คือบรรทัดที่แก้ไขครับ ★★★ */
    <div className={styles.createOrgContainer}> 
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
