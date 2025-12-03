import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./css/CreateOrg.module.css";

const API_BASE_URL = "https://premium-citydata-api-ab.vercel.app/api";

/* =================================================================
   Component: LogoSetupForm (แก้เรื่องปุ่ม Choose File โผล่)
   ================================================================= */
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
    if (!orgId) return alert("ไม่พบรหัสหน่วยงาน");
    setIsSaving(true);
    // (จำลองการอัปโหลด)
    const mockLogoUrl = "https://placehold.co/400x400/png?text=Logo"; 
    try {
      await new Promise(r => setTimeout(r, 800)); // Fake delay
      const response = await fetch(`${API_BASE_URL}/organizations`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organization_id: orgId, url_logo: mockLogoUrl }),
      });
      if (!response.ok) throw new Error('Failed');
      alert("บันทึกโลโก้สำเร็จ!");
      onSave();
    } catch (err) {
      alert("เกิดข้อผิดพลาด");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleLogoSubmit}>
      <div className={styles.logoUploadBox}>
        {/* รูป Preview */}
        <img
          src={orgImagePreview || "https://placehold.co/150x150/f0f0f0/cccccc?text=LOGO"}
          alt="Logo Preview"
          className={styles.logoPreview}
        />
        <div className={styles.logoUploadActions}>
          {/* ซ่อน Input ตัวเก่าทิ้งไป */}
          <input
            type="file"
            id="logo-upload"
            accept="image/*"
            className={styles.hiddenFileInput}
            onChange={handleImageChange}
          />
          {/* ปุ่มเลือกไฟล์สวยๆ */}
          <label htmlFor="logo-upload" className={`${styles.button} ${styles.btnSecondary}`}>
            เลือกไฟล์โลโก้
          </label>
          <p style={{fontSize: '0.85rem', color: '#999', margin: 0}}>ขนาดไฟล์ไม่เกิน 5MB (JPG, PNG)</p>
          
          <button type="submit" className={`${styles.button} ${styles.btnSuccess}`} disabled={isSaving}>
            {isSaving ? 'กำลังบันทึก...' : 'บันทึกโลโก้'}
          </button>
        </div>
      </div>
    </form>
  );
};

/* =================================================================
   Component: LocationSetupForm (แก้เรื่อง Input เบี้ยว)
   ================================================================= */
const LocationSetupForm = ({ onSave, orgId }) => {
  const [data, setData] = useState({ province: '', district: '', sub_district: '', contact_phone: '' });
  const [geoStatus, setGeoStatus] = useState('idle');

  const handleFetchGeolocation = () => {
     // ... (Logic เดิมของคุณ)
     setGeoStatus('loading');
     setTimeout(() => {
         setData(prev => ({ ...prev, province: 'กรุงเทพมหานคร', district: 'ปทุมวัน', sub_district: 'รองเมือง' }));
         setGeoStatus('success');
     }, 1000);
  };

  const handleSubmit = (e) => {
      e.preventDefault();
      onSave();
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* ปุ่ม GPS เต็มความกว้าง */}
      <div className={styles.geoButtonContainer}>
        <button type="button" onClick={handleFetchGeolocation} className={`${styles.button} ${styles.btnGeo}`}>
           {geoStatus === 'loading' ? 'กำลังดึงข้อมูล...' : '📍 ดึงตำแหน่งปัจจุบัน'}
        </button>
      </div>

      {/* Grid Layout: จัดเรียง Input */}
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label className={styles.label}>จังหวัดที่รับผิดชอบ</label>
          <input className={styles.input} value={data.province} readOnly placeholder="-" />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>อำเภอ/เขต</label>
          <input className={styles.input} value={data.district} readOnly placeholder="-" />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>ตำบล/แขวง</label>
          <input className={styles.input} value={data.sub_district} readOnly placeholder="-" />
        </div>
        <div className={styles.formGroup}>
          <label className={`${styles.label} ${styles.required}`}>เบอร์โทรศัพท์ติดต่อ</label>
          <input 
            className={styles.input} 
            placeholder="08XXXXXXXX" 
            value={data.contact_phone}
            onChange={e => setData({...data, contact_phone: e.target.value})}
          />
        </div>

        {/* ปุ่มบันทึกอยู่ล่างสุด ชิดซ้าย */}
        <div className={styles.submitRow}>
          <button type="submit" className={`${styles.button} ${styles.btnSuccess}`} style={{width: 'auto', minWidth: '150px'}}>
             บันทึกข้อมูล
          </button>
        </div>
      </div>
    </form>
  );
};

/* =================================================================
   Component: CodeSetupBox (แก้เรื่องปุ่มสลับไม่สวย)
   ================================================================= */
const CodeSetupBox = ({ adminCode, userCode }) => {
  const [isViewAdmin, setIsViewAdmin] = useState(true);
  
  return (
    <div className={styles.codeBoxContainer}>
      {/* Switcher แบบใหม่ */}
      <div className={styles.codeSwitchWrapper}>
         <button 
           type="button" 
           className={`${styles.codeSwitchBtn} ${isViewAdmin ? styles.active : ''}`}
           onClick={() => setIsViewAdmin(true)}
         >
           Admin Code
         </button>
         <button 
           type="button" 
           className={`${styles.codeSwitchBtn} ${!isViewAdmin ? styles.active : ''}`}
           onClick={() => setIsViewAdmin(false)}
         >
           User Code
         </button>
      </div>

      <div className={styles.codeDisplayBox}>
        <span className={styles.codeText}>
          {isViewAdmin ? adminCode : userCode}
        </span>
        <button type="button" className={styles.btnCopy} onClick={() => alert('Copied!')}>
          คัดลอก
        </button>
      </div>
    </div>
  );
};

/* =================================================================
   Component: TypeSetupForm (ใช้ Grid เหมือน Location)
   ================================================================= */
const TypeSetupForm = ({ onSave }) => {
    return (
        <form onSubmit={(e) => { e.preventDefault(); onSave(); }}>
            <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                    <label className={`${styles.label} ${styles.required}`}>ประเภทหน่วยงาน</label>
                    <select className={styles.select}>
                        <option>เลือกประเภท</option>
                        <option>โรงพยาบาล</option>
                        <option>เทศบาล</option>
                    </select>
                </div>
                <div className={styles.formGroup}>
                    <label className={`${styles.label} ${styles.required}`}>ประเภทการใช้งาน</label>
                    <select className={styles.select}>
                         <option>เลือกประเภทการใช้งาน</option>
                         <option>ทั่วไป</option>
                         <option>ฉุกเฉิน</option>
                    </select>
                </div>
                 <div className={styles.submitRow}>
                    <button type="submit" className={`${styles.button} ${styles.btnSuccess}`} style={{width: 'auto', minWidth: '150px'}}>
                        บันทึกข้อมูล
                    </button>
                </div>
            </div>
        </form>
    );
}

/* =================================================================
   Main Page & Accordion Logic
   ================================================================= */
const CreateOrg = () => {
    const [page, setPage] = useState('create');
    const [activeSection, setActiveSection] = useState(null);
    const [orgName, setOrgName] = useState('');

    const toggleSection = (section) => {
        setActiveSection(activeSection === section ? null : section);
    };

    // --- Mockup Data ---
    const adminCode = "A1M2R9I";
    const userCode = "U9X8Y7Z";

    if (page === 'create') {
        return (
            <div className={styles.container}>
                <div className={`${styles.page} ${styles.pageCreate}`}>
                    <div className={styles.pageHeader}>
                        <h1 className={styles.pageTitle}>สร้างหน่วยงานของคุณ</h1>
                        <p className={styles.pageSubtitle}>กรอกชื่อหน่วยงานเพื่อเริ่มต้น</p>
                    </div>
                    <form className={styles.form} onSubmit={(e) => { e.preventDefault(); setPage('setup'); }}>
                        <div className={styles.formGroup}>
                            <label className={`${styles.label} ${styles.required}`}>ชื่อหน่วยงาน</label>
                            <input className={styles.input} value={orgName} onChange={e => setOrgName(e.target.value)} placeholder="เช่น โรงพยาบาล A" />
                        </div>
                        <div className={styles.buttonGroup}>
                            <button type="button" className={`${styles.button} ${styles.btnPrimaryBack}`}>ย้อนกลับ</button>
                            <button type="submit" className={`${styles.button} ${styles.btnSuccess}`}>สร้างหน่วยงาน</button>
                        </div>
                    </form>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <div className={`${styles.page} ${styles.pageSetup}`}>
                <div className={styles.pageHeader}>
                    <h1 className={styles.pageTitle}>ยินดีต้อนรับสู่ <span className={styles.orgNameHighlight}>{orgName || '11'}</span></h1>
                    <p className={styles.pageSubtitle}>องค์กรของคุณถูกสร้างเรียบร้อยแล้ว</p>
                </div>

                <div style={{textAlign: 'center', color: '#ff9800', fontWeight: 'bold', marginBottom: '1.5rem'}}>
                    ขั้นตอนต่อไป (แนะนำ)
                </div>

                <div className={styles.accordion}>
                    {/* Item 1: Code */}
                    <div className={styles.accordionItem}>
                        <button type="button" className={styles.accordionHeader} onClick={() => toggleSection('code')}>
                            <div className={styles.accordionIcon}>🔑</div>
                            <div style={{flex:1}}>
                                <p className={styles.accordionTitle}>รหัสเข้าร่วมองค์กร</p>
                                <p className={styles.accordionSubtitle}>สำหรับแชร์ให้สมาชิก Admin และ User</p>
                            </div>
                            <div className={`${styles.accordionArrow} ${activeSection === 'code' ? styles.rotate180 : ''}`}>▼</div>
                        </button>
                        <div className={`${styles.accordionContentWrapper} ${activeSection === 'code' ? styles.open : ''}`}>
                            <div className={styles.accordionContent}>
                                <div className={styles.accordionInner}>
                                    <CodeSetupBox adminCode={adminCode} userCode={userCode} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Item 2: Logo */}
                    <div className={styles.accordionItem}>
                        <button type="button" className={styles.accordionHeader} onClick={() => toggleSection('logo')}>
                            <div className={styles.accordionIcon}>🖼️</div>
                            <div style={{flex:1}}>
                                <p className={styles.accordionTitle}>อัปโหลดโลโก้</p>
                                <p className={styles.accordionSubtitle}>เพิ่มตราสัญลักษณ์ให้สมาชิกจำได้ง่าย</p>
                            </div>
                            <div className={`${styles.accordionArrow} ${activeSection === 'logo' ? styles.rotate180 : ''}`}>▼</div>
                        </button>
                        <div className={`${styles.accordionContentWrapper} ${activeSection === 'logo' ? styles.open : ''}`}>
                            <div className={styles.accordionContent}>
                                <div className={styles.accordionInner}>
                                     <LogoSetupForm onSave={() => toggleSection(null)} orgId="123" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Item 3: Location */}
                    <div className={styles.accordionItem}>
                         <button type="button" className={styles.accordionHeader} onClick={() => toggleSection('location')}>
                            <div className={styles.accordionIcon}>📍</div>
                            <div style={{flex:1}}>
                                <p className={styles.accordionTitle}>กำหนดขอบเขตที่รับผิดชอบ</p>
                                <p className={styles.accordionSubtitle}>ระบุตำแหน่งและเบอร์ติดต่อ</p>
                            </div>
                            <div className={`${styles.accordionArrow} ${activeSection === 'location' ? styles.rotate180 : ''}`}>▼</div>
                        </button>
                        <div className={`${styles.accordionContentWrapper} ${activeSection === 'location' ? styles.open : ''}`}>
                            <div className={styles.accordionContent}>
                                <div className={styles.accordionInner}>
                                     <LocationSetupForm onSave={() => toggleSection(null)} orgId="123" />
                                </div>
                            </div>
                        </div>
                    </div>

                     {/* Item 4: Type */}
                     <div className={styles.accordionItem}>
                         <button type="button" className={styles.accordionHeader} onClick={() => toggleSection('type')}>
                            <div className={styles.accordionIcon}>🏷️</div>
                            <div style={{flex:1}}>
                                <p className={styles.accordionTitle}>ตั้งค่าประเภทหน่วยงาน</p>
                                <p className={styles.accordionSubtitle}>ระบุประเภทและการใช้งาน</p>
                            </div>
                            <div className={`${styles.accordionArrow} ${activeSection === 'type' ? styles.rotate180 : ''}`}>▼</div>
                        </button>
                        <div className={`${styles.accordionContentWrapper} ${activeSection === 'type' ? styles.open : ''}`}>
                            <div className={styles.accordionContent}>
                                <div className={styles.accordionInner}>
                                     <TypeSetupForm onSave={() => toggleSection(null)} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.buttonGroup}>
                    <button className={`${styles.button} ${styles.btnPrimaryBack}`} onClick={() => setPage('create')}>
                        ย้อนกลับไปแก้ไขชื่อหน่วยงาน
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateOrg;
