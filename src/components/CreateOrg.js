import React, { useState } from "react";
// 'NEW: Import useNavigate'
import { useNavigate } from "react-router-dom"; 
import styles from "./css/CreateOrg.module.css"; 

function CreateOrg() {
  const [page, setPage] = useState('create'); 
  const [activeAccordion, setActiveAccordion] = useState(null); 
  // 'NEW: Initialize navigate function'
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
  const [typeData, setTypeData] = useState({
    org_type: '',
    usage_type: '',
  });

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

  /**
   * 'Function to go back and edit name (internal page navigation)'
   */
  const handleGoBackToEdit = () => {
    setOrgName(createdOrgName); 
    setPage('create');          
  };

  /**
   * 'NEW: Function to navigate back to /home1'
   */
  const handleBackToHome = () => {
    navigate('/home1');
  };

  const handleAccordionClick = (section) => {
    setActiveAccordion(activeAccordion === section ? null : section);
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setLocationData(prev => ({ ...prev, [name]: value }));
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
      reader.readAsDataURL(file);
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
    console.log("Submitting Types:", typeData);
    alert("บันทึกข้อมูลประเภทสำเร็จ!");
    setActiveAccordion(null); 
  };

  const renderQuickCreatePage = () => (
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

        {/* 'MODIFIED: Your new button, now functional' */}
        <div className={styles.buttonGroup}>
          <button
            type="button" // 'FIX: Changed from "back" to "button"'
            id="btn-back-home" // 'FIX: Changed ID to be unique'
            className={`${styles.button} ${styles.btnPrimaryBack}`}
            disabled={isLoading}
            onClick={handleBackToHome} // 'NEW: Added onClick handler'
          >
            {/* 'FIX: Simplified text' */}
            {'ย้อนกลับ'}
          </button>
        </div>
      </form>
    </div>
  );

  const renderSetupGuidePage = () => (
    <div id="page-setup-guide" className={`${styles.page} ${styles.pageSetup}`}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          <span>ยินดีต้อนรับสู่ <span className={styles.orgNameHighlight}>{createdOrgName}</span>!</span>
          <button 
            onClick={handleGoBackToEdit} 
            className={styles.editNameButton} 
            title="แก้ไขชื่อหน่วยงาน"
          >
            {/* 'User's requested text change' */}
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
          
          {/* ====== 1. อัปโหลดโลโก้ ====== */}
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

          {/* ====== 2. กำหนดขอบเขต ====== */}
          <div className={styles.accordionItem}>
            <button
              type="button"
              className={styles.accordionHeader}
              onClick={() => handleAccordionClick('location')}
            >
              <div className={styles.accordionIcon}>📍</div>
              <div className={styles.accordionTitleBox}>
                <p className={styles.accordionTitle}>กำหนดขอบเขตที่รับผิดชอบ</p>
                <p className={styles.accordionSubtitle}>ระบุจังหวัด, อำเภอ, ตำบล และเบอร์ติดต่อ</p>
              </div>
              <svg className={`${styles.accordionArrow} ${activeAccordion === 'location' ? styles.rotate180 : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            <div className={`${styles.accordionContentWrapper} ${activeAccordion === 'location' ? styles.open : ''}`}>
              <div className={styles.accordionContent}>
                <h3 className={styles.contentTitle}>กำหนดขอบเขตและข้อมูลติดต่อ</h3>
                <form onSubmit={handleLocationSubmit} className={`${styles.contentForm} ${styles.formGrid}`}>
                    <div className={styles.formGroup}>
                      <label htmlFor="province" className={`${styles.label} ${styles.required}`}>จังหวัดที่รับผิดชอบ</label>
                      <select id="province" name="province" value={locationData.province} onChange={handleLocationChange} className={styles.select}>
                        <option value="">เลือกจังหวัด</option>
                        <option value="กรุงเทพมหานคร">กรุงเทพมหานคร</option>
                        <option value="เชียงใหม่">เชียงใหม่</option>
                        <option value="ภูเก็ต">ภูเก็ต</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="district" className={`${styles.label} ${styles.required}`}>อำเภอ/เขต</label>
                      <select id="district" name="district" value={locationData.district} onChange={handleLocationChange} className={styles.select}>
                        <option value="">เลือกอำเภอ/เขต</option>
                        <option value="เขตบางกะปิ">เขตบางกะปิ</option>
                        <option value="อำเภอเมืองเชียงใหม่">อำเภอเมืองเชียงใหม่</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="sub_district" className={`${styles.label} ${styles.required}`}>ตำบล/แขวง</label>
                      <select id="sub_district" name="sub_district" value={locationData.sub_district} onChange={handleLocationChange} className={styles.select}>
                        <option value="">เลือกตำบล/แขวง</option>
                        <option value="หัวหมาก">หัวหมาก</option>
                        <option value="สุเทพ">สุเทพ</option>
                      </select>
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
              </div>
            </div>
          </div>

          {/* ====== 3. ตั้งค่าประเภท ====== */}
          <div className={styles.accordionItem}>
            <button
              type="button"
              className={styles.accordionHeader}
              onClick={() => handleAccordionClick('types')}
            >
              <div className={styles.accordionIcon}>🏷️</div>
              <div className={styles.accordionTitleBox}>
                <p className={styles.accordionTitle}>ตั้งค่าประเภทหน่วยงาน</p>
                <p className={styles.accordionSubtitle}>ระบุประเภท (ภาครัฐ/เอกชน) และการใช้งาน</p>
              </div>
              <svg className={`${styles.accordionArrow} ${activeAccordion === 'types' ? styles.rotate180 : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            <div className={`${styles.accordionContentWrapper} ${activeAccordion === 'types' ? styles.open : ''}`}>
              <div className={styles.accordionContent}>
                <h3 className={styles.contentTitle}>ตั้งค่าประเภทหน่วยงานและการใช้งาน</h3>
                <form onSubmit={handleTypeSubmit} className={`${styles.contentForm} ${styles.formGrid}`}>
                    <div className={styles.formGroup}>
                      <label htmlFor="org_type" className={`${styles.label} ${styles.required}`}>ประเภทหน่วยงาน</label>
                      <select id="org_type" name="org_type" value={typeData.org_type} onChange={handleTypeChange} className={styles.select}>
                        <option value="">เลือกประเภท</option>
                        <option value="ภาครัฐ">ภาครัฐ</option>
                        <option value="เอกชน">เอกชน</option>
                        <option value="NPO">องค์กรไม่แสวงผลกำไร</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="usage_type" className={`${styles.label} ${styles.required}`}>ประเภทการใช้งาน</label>
                      <select id="usage_type" name="usage_type" value={typeData.usage_type} onChange={handleTypeChange} className={styles.select}>
                        <option value="">เลือกประเภทการใช้งาน</option>
                        <option value="กู้ภัย">กู้ภัย</option>
                        <option value="ดูแลสุขภาพ">ดูแลสุขภาพ</option>
                        <option value="ความปลอดภัย">ความปลอดภัย</option>
                      </select>
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

        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      {page === 'create' ? renderQuickCreatePage() : renderSetupGuidePage()}
    </div>
  );
}

export default CreateOrg;

