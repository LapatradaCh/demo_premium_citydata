import React, { useState, useEffect } from "react"; 
import { useNavigate } from "react-router-dom"; 
import styles from "./css/CreateOrg.module.css"; 

/**
 * =================================================================
 * Component 1: QuickCreatePage (แยกมาจาก renderQuickCreatePage)
 * =================================================================
 * รับ props ที่จำเป็นสำหรับการสร้าง/แก้ไขชื่อ
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
        {createdOrgName ? 'กรอกชื่อที่ถูกต้องและกดยืนยัน' : 'ใช้เวลาเพียง 10 วินาที'}
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
      {!createdOrgName && (
        <p className={styles.helpText}>คุณสามารถตั้งค่ารายละเอียดอื่นๆ ได้ในภายหลัง</p>
      )}
      <div className={styles.buttonGroup}>
        <button
          type="submit"
          id="btn-create-quick"
          className={`${styles.button} ${styles.btnPrimary}`}
          disabled={isLoading}
        >
          {isLoading ? 'กำลังบันทึก...' : (createdOrgName ? 'ยืนยันการแก้ไข' : 'สร้างหน่วยงาน')}
        </button>
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
      </div>
    </form>
  </div>
);

/**
 * =================================================================
 * Component 2: SetupGuidePage (แยกมาจาก renderSetupGuidePage)
 * =================================================================
 * รับ props จำนวนมากที่จำเป็นสำหรับการตั้งค่าทั้งหมด
 */
const SetupGuidePage = ({
  createdOrgName,
  orgCode,
  activeAccordion,
  orgImagePreview,
  locationData,
  geoStatus,
  geoError,
  typeData,
  handleGoBackToEdit,
  handleAccordionClick,
  handleLogoSubmit,
  handleImageChange,
  handleLocationSubmit,
  handleFetchGeolocation,
  handleLocationChange,
  handleTypeSubmit,
  handleTypeChange,
  
  // Props ใหม่ที่ Fetch มา
  orgTypeOptions,
  usageTypeOptions,
  typesLoading,
  typesError

}) => (
  <div id="page-setup-guide" className={`${styles.page} ${styles.pageSetup}`}>
    <div className={styles.pageHeader}>
      <h1 className={styles.pageTitle}>
        <span>ยินดีต้อนรับสู่ <span className={styles.orgNameHighlight}>{createdOrgName}</span>!</span>
        <button 
          onClick={handleGoBackToEdit} 
          className={styles.editNameButton} 
          title="แก้ไขชื่อหน่วยงาน"
        >
          (ย้อนกลับ)
        </button>
      </h1>
      <p className={styles.pageSubtitle}>องค์กรของคุณถูกสร้างเรียบร้อยแล้ว</p>
    </div>

    <div className={styles.orgCodeBox}>
      <p className={styles.orgCodeLabel}>นี่คือรหัสสำหรับให้สมาชิกเข้าร่วม:</p>
      <p id="display-org-code" className={styles.orgCode}>{orgCode}</p>
    </div>

    <div className={styles.setupContainer}>
      <h2 className={styles.setupTitle}>ขั้นตอนต่อไป (แนะนำ)</h2>
      <div className={styles.accordion} id="setup-accordion">
        
        {/* ====== 1. อัปโหลดโลโก้ (เหมือนเดิม) ====== */}
        <div className={styles.accordionItem}>
          <button
            type="button"
            className={styles.accordionHeader}
            onClick={() => handleAccordionClick('logo')}
          >
            <div className={styles.accordionIcon}>?</div>
            <div className={styles.accordionTitleBox}>
              <p className={styles.accordionTitle}>อัปโหลดโลโก้</p>
              <p className={styles.accordionSubtitle}>เพิ่มตราสัญลักษณ์ให้สมาชิกจำได้ง่าย</p>
            </div>
            <svg className={`${styles.accordionArrow} ${activeAccordion === 'logo' ? styles.rotate180 : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </button>
          <div className={`${styles.accordionContentWrapper} ${activeAccordion === 'logo' ? styles.open : ''}`}>
            <div className={styles.accordionContent}>
              <h3 className={styles.contentTitle}>อัปโหลดโลโก้หน่วยงาน</h3>
              <form onSubmit={handleLogoSubmit} className={styles.contentForm}>
                <div className={styles.logoUploadBox}>
                  <img
                    id="logo-preview"
                    src={orgImagePreview || "https://placehold.co/150x150/E2E8F0/A0AEC0?text=โลโก้"}
                    alt="Logo Preview"
                    className={styles.logoPreview}
                  />
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
              </form>
            </div>
          </div>
        </div>


        {/* ====== 2. กำหนดขอบเขต (เหมือนเดิม) ====== */}
        <div className={styles.accordionItem}>
          <button
            type="button"
            className={styles.accordionHeader}
            onClick={() => handleAccordionClick('location')}
          >
            <div className={styles.accordionIcon}>📍</div>
            <div className={styles.accordionTitleBox}>
              <p className={styles.accordionTitle}>กำหนดขอบเขตที่รับผิดชอบ</p>
              <p className={styles.accordionSubtitle}>
                {geoStatus === 'success' ? 'ดึงตำแหน่งสำเร็จ!' : 'ระบุตำแหน่งและเบอร์ติดต่อ'}
              </p>
            </div>
            <svg className={`${styles.accordionArrow} ${activeAccordion === 'location' ? styles.rotate180 : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </button>

          <div className={`${styles.accordionContentWrapper} ${activeAccordion === 'location' ? styles.open : ''}`}>
            <div className={styles.accordionContent}>
              <h3 className={styles.contentTitle}>กำหนดขอบเขตและข้อมูลติดต่อ</h3>
              <form onSubmit={handleLocationSubmit} className={`${styles.contentForm} ${styles.formGrid}`}>
                  
                  {/* 'ปุ่มดึงตำแหน่ง' */}
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

                  {/* 'Input (disabled) โชว์ผลลัพธ์' */}
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
                  
                  {/* 'เบอร์โทร' */}
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
            </div>
          </div>
        </div>

        {/* ====== 3. ตั้งค่าประเภท (อัปเดต) ====== */}
        <div className={styles.accordionItem}>
          <button
            type="button"
            className={styles.accordionHeader}
            onClick={() => handleAccordionClick('types')}
          >
            <div className={styles.accordionIcon}>🏷️</div>
            <div className={styles.accordionTitleBox}>
              <p className={styles.accordionTitle}>ตั้งค่าประเภทหน่วยงาน</p>
              <p className={styles.accordionSubtitle}>
                {typesLoading ? 'กำลังโหลดตัวเลือก...' : 'ระบุประเภทและการใช้งาน'}
              </p>
            </div>
            <svg className={`${styles.accordionArrow} ${activeAccordion === 'types' ? styles.rotate180 : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </button>
          <div className={`${styles.accordionContentWrapper} ${activeAccordion === 'types' ? styles.open : ''}`}>
            <div className={styles.accordionContent}>
              <h3 className={styles.contentTitle}>ตั้งค่าประเภทหน่วยงานและการใช้งาน</h3>

              {/* แสดงสถานะ Loading หรือ Error */}
              {typesLoading && <p>กำลังโหลดข้อมูลประเภท...</p>}
              {typesError && <p className={styles.errorMessage}>เกิดข้อผิดพลาด: {typesError}</p>}

              {/* แสดงฟอร์มเมื่อโหลดเสร็จและไม่ Error */}
              {!typesLoading && !typesError && (
                <form onSubmit={handleTypeSubmit} className={`${styles.contentForm} ${styles.formGrid}`}>
                    <div className={styles.formGroup}>
                      <label htmlFor="org_type" className={`${styles.label} ${styles.required}`}>ประเภทหน่วยงาน</label>
                      <select 
                        id="org_type" 
                        name="org_type" // 'name' ต้องตรงกับ key ใน state 'typeData'
                        value={typeData.org_type} 
                        onChange={handleTypeChange} 
                        className={styles.select}
                        disabled={orgTypeOptions.length === 0}
                      >
                        <option value="">เลือกประเภท</option>
                        {/* Render Options จาก API */}
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
                        name="usage_type" // 'name' ต้องตรงกับ key ใน state 'typeData'
                        value={typeData.usage_type} 
                        onChange={handleTypeChange} 
                        className={styles.select}
                        disabled={usageTypeOptions.length === 0}
                      >
                        <option value="">เลือกประเภทการใช้งาน</option>
                        {/* Render Options จาก API */}
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
                      // ปิดปุ่มถ้ายังไม่ได้เลือก
                      disabled={!typeData.org_type || !typeData.usage_type} 
                    >
                      บันทึกข้อมูล
                    </button>
                  </div>
                </form>
              )} 

            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
);


/**
 * =================================================================
 * Main Component: CreateOrg
 * =================================================================
 * - จัดการ State ทั้งหมด
 * - จัดการ Logic และ Event Handlers ทั้งหมด
 * - ส่ง props ที่จำเป็นไปยัง Sub-components (QuickCreatePage, SetupGuidePage)
 */
function CreateOrg() {
  const [page, setPage] = useState('create'); 
  const [activeAccordion, setActiveAccordion] = useState(null); 
  const navigate = useNavigate(); 
  
  const [orgName, setOrgName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [createdOrgName, setCreatedOrgName] = useState('');
  const [orgCode, setOrgCode] = useState('');
  
  const [orgImage, setOrgImage] = useState(null);
  const [orgImagePreview, setOrgImagePreview] = useState(null);
  
  const [locationData, setLocationData] = useState({
    province: '',
    district: '',
    sub_district: '',
    contact_phone: '', 
  });
  const [geoStatus, setGeoStatus] = useState('idle'); 
  const [geoError, setGeoError] = useState(null);

  const [typeData, setTypeData] = useState({
    org_type: '',   // ตอนนี้จะเก็บค่า (type_value) ที่เลือก
    usage_type: '', // ตอนนี้จะเก็บค่า (type_value) ที่เลือก
  });

  // State สำหรับเก็บข้อมูล Dropdown จาก API
  const [orgTypeOptions, setOrgTypeOptions] = useState([]);
  const [usageTypeOptions, setUsageTypeOptions] = useState([]);
  const [typesLoading, setTypesLoading] = useState(false);
  const [typesError, setTypesError] = useState(null);


  // useEffect สำหรับ Fetch ข้อมูล Dropdown เมื่อ Component โหลด
  useEffect(() => {
    const fetchTypes = async () => {
      setTypesLoading(true);
      setTypesError(null);
      try {
        // ===== START: EDIT =====
        // ยิง API พร้อมกัน 2 ตัว (ตามที่ผู้ใช้ร้องขอ)
        const orgTypePromise = fetch('https://premium-citydata-api-ab.vercel.app/organization-types');
        const usageTypePromise = fetch('https://premium-citydata-api-ab.vercel.app/usage-types');
        // ===== END: EDIT =====

        const [orgTypeRes, usageTypeRes] = await Promise.all([orgTypePromise, usageTypePromise]);

        if (!orgTypeRes.ok || !usageTypeRes.ok) {
          throw new Error('ไม่สามารถดึงข้อมูลประเภทหน่วยงานได้');
        }

        const orgTypeData = await orgTypeRes.json();
        const usageTypeData = await usageTypeRes.json();

        // ===== START: EDIT =====
        // ทำการ Map ข้อมูลตามที่ผู้ใช้ร้องขอ (ใช้ 'type_value')
        // เราจะใช้ 'type_value' สำหรับ cả value (ค่าที่จะเก็บ) และ label (ข้อความที่จะแสดง)
        const mappedOrgTypes = orgTypeData.map(item => ({
          value: item.type_value,
          label: item.type_value
        }));
        
        const mappedUsageTypes = usageTypeData.map(item => ({
          value: item.type_value,
          label: item.type_value
        }));

        setOrgTypeOptions(mappedOrgTypes);
        setUsageTypeOptions(mappedUsageTypes);
        // ===== END: EDIT =====

      } catch (error) {
        console.error("Error fetching types:", error);
        setTypesError(error.message);
      } finally {
        setTypesLoading(false);
      }
    };

    // เรียกใช้งานฟังก์ชัน
    fetchTypes();
  }, []); // [] หมายถึงให้ทำงานแค่ 1 ครั้งตอน Component โหลด


  // --- Event Handlers (คง Logic เดิมไว้ที่ Component หลัก) ---

  const handleQuickCreate = (e) => {
    e.preventDefault();
    if (!orgName) {
      alert('กรุณากรอกชื่อหน่วยงาน');
      return;
    }
    setIsLoading(true);

    setTimeout(() => {
      const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
      const newOrgCode = `ORG-${randomPart}`;

      setCreatedOrgName(orgName);
      setOrgCode(newOrgCode);
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

  const handleAccordionClick = (section) => {
    setActiveAccordion(activeAccordion === section ? null : section);
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    if (name === 'contact_phone') {
      setLocationData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFetchGeolocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('error');
      setGeoError('เบราว์เซอร์ของคุณไม่รองรับ Geolocation');
      return;
    }

    setGeoStatus('loading');
    setGeoError(null);

    const options = {
      enableHighAccuracy: true,
      timeout: 10000, 
      maximumAge: 0 
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const apiUrl = `https://premium-citydata-api-ab.vercel.app/api/GPS?lat=${latitude}&lon=${longitude}`;
          
          const response = await fetch(apiUrl);
          
          if (!response.ok) {
            throw new Error(`API ล้มเหลว (Status: ${response.status})`);
          }
          
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
      options
    );
  };


  const handleTypeChange = (e) => {
    const { name, value } = e.target;
    setTypeData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setOrgImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setOrgImagePreview(reader.result);
      reader.readDataURL(file);
    }
  };

  const handleLogoSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting Logo:", orgImage);
    alert("บันทึกโลโก้สำเร็จ!");
    setActiveAccordion(null);
  };

  const handleLocationSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting Location:", locationData);
    alert("บันทึกข้อมูลขอบเขตสำเร็จ!");
    setActiveAccordion(null); 
  };

  const handleTypeSubmit = (e) => {
    e.preventDefault();
    // ตอนนี้ typeData จะเก็บค่า 'type_value' ที่เป็น String
    // เช่น { org_type: "โรงพยาบาล", usage_type: "ทั่วไป" }
    console.log("Submitting Types (Values):", typeData);
    alert("บันทึกข้อมูลประเภทสำเร็จ!");
    setActiveAccordion(null); 
  };

  // --- Main Render ---
  // ส่วน Render หลักจะทำหน้าที่แค่เลือกว่าจะแสดง Component ย่อยตัวไหน
  // และส่ง Props ที่จำเป็นทั้งหมดไปให้
  return (
    <div className={styles.container}>
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
          orgCode={orgCode}
          activeAccordion={activeAccordion}
          orgImagePreview={orgImagePreview}
          locationData={locationData}
          geoStatus={geoStatus}
          geoError={geoError}
          typeData={typeData}
          handleGoBackToEdit={handleGoBackToEdit}
          handleAccordionClick={handleAccordionClick}
          handleLogoSubmit={handleLogoSubmit}
          handleImageChange={handleImageChange}
          handleLocationSubmit={handleLocationSubmit}
          handleFetchGeolocation={handleFetchGeolocation}
          handleLocationChange={handleLocationChange}
          handleTypeSubmit={handleTypeSubmit}
          handleTypeChange={handleTypeChange}
          
          // ส่ง State ใหม่ไปให้ SetupGuidePage
          orgTypeOptions={orgTypeOptions}
          usageTypeOptions={usageTypeOptions}
          typesLoading={typesLoading}
          typesError={typesError}
        />
      )}
    </div>
  );
}

export default CreateOrg;
