import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CreateOrg.module.css";
// เพิ่ม icon ที่ดูคลีนขึ้น
import { FaBuilding, FaMapMarkerAlt, FaKey, FaLayerGroup, FaCamera, FaCopy, FaCheckCircle, FaArrowLeft, FaArrowRight, FaChevronRight } from "react-icons/fa";

// URL ของ API
const API_BASE_URL = "https://premium-citydata-api-ab.vercel.app/api";

// --- Helper UI Components ---
const SectionHeader = ({ icon: Icon, title, subtitle }) => (
  <div className={styles.sectionHeader}>
    <div className={styles.headerIconBox}>
      <Icon />
    </div>
    <div className={styles.headerTextBox}>
      <h3 className={styles.headerTitle}>{title}</h3>
      <p className={styles.headerSubtitle}>{subtitle}</p>
    </div>
  </div>
);

// =========================================================
// 1. หน้าแรก: Quick Create (สร้างชื่อหน่วยงาน)
// =========================================================
const QuickCreatePage = ({ orgName, setOrgName, createdOrgName, isLoading, handleQuickCreate, handleBackToHome, error }) => (
  <div className={styles.centeredCard}>
    <div className={styles.cardHeader}>
      <div className={styles.brandIcon}><FaBuilding /></div>
      <h1 className={styles.cardTitle}>{createdOrgName ? 'แก้ไขชื่อหน่วยงาน' : 'เริ่มต้นสร้างหน่วยงาน'}</h1>
      <p className={styles.cardSubtitle}>กรอกชื่อหน่วยงานของคุณเพื่อเข้าสู่ระบบจัดการเมือง<br/>อย่างเต็มรูปแบบ</p>
    </div>

    <form onSubmit={handleQuickCreate} className={styles.mainForm}>
      <div className={styles.inputWrapper}>
        <label className={styles.inputLabel}>ชื่อหน่วยงาน <span className={styles.req}>*</span></label>
        <input
          type="text"
          className={styles.inputFieldLarge}
          placeholder="เช่น เทศบาลตำบล..."
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          disabled={isLoading}
          autoFocus
        />
      </div>

      {error && <div className={styles.errorAlert}>{error}</div>}

      <div className={styles.actionButtons}>
        <button type="button" onClick={handleBackToHome} className={styles.btnGhost} disabled={isLoading}>
          <FaArrowLeft /> ย้อนกลับ
        </button>
        <button type="submit" className={styles.btnPrimary} disabled={isLoading}>
          {isLoading ? 'กำลังประมวลผล...' : (createdOrgName ? 'บันทึกการแก้ไข' : 'สร้างหน่วยงาน')} <FaArrowRight />
        </button>
      </div>
    </form>
  </div>
);

// =========================================================
// 2. Form: อัปโหลดโลโก้
// =========================================================
const LogoSetupForm = ({ onSave, orgId }) => {
  const [orgImagePreview, setOrgImagePreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setOrgImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleLogoSubmit = async (e) => {
    e.preventDefault();
    if (!orgId) return;
    setIsSaving(true);
    // จำลอง API Call
    setTimeout(() => {
        setIsSaving(false);
        onSave(); // ปิด Accordion
    }, 800);
  };

  return (
    <form onSubmit={handleLogoSubmit} className={styles.innerForm}>
      <div className={styles.logoUploadContainer}>
        <div className={styles.previewBox}>
          {orgImagePreview ? (
            <img src={orgImagePreview} alt="Preview" className={styles.previewImg} />
          ) : (
            <FaCamera />
          )}
        </div>
        <div className={styles.uploadControls}>
          <label className={styles.btnUpload}>
            เลือกรูปภาพ
            <input type="file" hidden accept="image/*" onChange={handleImageChange} />
          </label>
          <p className={styles.hintText}>รองรับไฟล์ JPG, PNG ขนาดไม่เกิน 5MB<br/>แนะนำขนาด 500x500 px</p>
        </div>
      </div>
      <div className={styles.formFooter}>
        <button type="submit" className={styles.btnSave} disabled={isSaving}>
          {isSaving ? 'กำลังบันทึก...' : 'บันทึกโลโก้'}
        </button>
      </div>
    </form>
  );
};

// =========================================================
// 3. Form: ที่อยู่และพิกัด
// =========================================================
const LocationSetupForm = ({ onSave, orgId }) => {
  const [locationData, setLocationData] = useState({
    province: '', district: '', sub_district: '', contact_phone: ''
  });
  const [geoStatus, setGeoStatus] = useState('idle');
  const [isSaving, setIsSaving] = useState(false);

  const handleFetchGeolocation = () => {
    setGeoStatus('loading');
    if (!navigator.geolocation) return setGeoStatus('error');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        // จำลอง Fetch API
        const { latitude, longitude } = pos.coords;
        // Mock data response
        setTimeout(() => {
            setLocationData(prev => ({...prev, province: 'เชียงใหม่', district: 'เมือง', sub_district: 'สุเทพ'}));
            setGeoStatus('success');
        }, 1000);
      },
      () => setGeoStatus('error')
    );
  };

  const handleSubmit = (e) => {
      e.preventDefault();
      setIsSaving(true);
      setTimeout(() => { setIsSaving(false); onSave(); }, 800);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.innerForm}>
      <div className={styles.geoSection}>
        <div>
            <label className={styles.inputLabel} style={{marginBottom: 0}}>พิกัดตำแหน่ง</label>
            <p className={styles.hintText} style={{marginTop: '0.25rem'}}>ระบุตำแหน่งเพื่อการแสดงผลบนแผนที่</p>
        </div>
        
        {geoStatus === 'success' ? (
             <span className={styles.statusSuccess}><FaCheckCircle /> ระบุตำแหน่งแล้ว</span>
        ) : (
            <button type="button" onClick={handleFetchGeolocation} className={styles.btnGeo} disabled={geoStatus === 'loading'}>
              {geoStatus === 'loading' ? 'กำลังค้นหา...' : <><FaMapMarkerAlt /> ดึงตำแหน่งปัจจุบัน</>}
            </button>
        )}
      </div>

      <div className={styles.gridThree}>
        <div className={styles.inputGroup}>
          <label>จังหวัด</label>
          <input className={styles.inputField} value={locationData.province} readOnly placeholder="-" />
        </div>
        <div className={styles.inputGroup}>
          <label>อำเภอ/เขต</label>
          <input className={styles.inputField} value={locationData.district} readOnly placeholder="-" />
        </div>
        <div className={styles.inputGroup}>
          <label>ตำบล/แขวง</label>
          <input className={styles.inputField} value={locationData.sub_district} readOnly placeholder="-" />
        </div>
      </div>

      <div className={styles.inputGroup}>
        <label>เบอร์โทรศัพท์ติดต่อ <span className={styles.req}>*</span></label>
        <input 
            className={styles.inputField} 
            placeholder="08X-XXX-XXXX" 
            value={locationData.contact_phone}
            onChange={e => setLocationData({...locationData, contact_phone: e.target.value})}
        />
      </div>

      <div className={styles.formFooter}>
        <button type="submit" className={styles.btnSave} disabled={isSaving}>
            {isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูลที่อยู่'}
        </button>
      </div>
    </form>
  );
};

// =========================================================
// 4. Form: ประเภทหน่วยงาน
// =========================================================
const TypeSetupForm = ({ onSave, orgId }) => {
  const [isSaving, setIsSaving] = useState(false);
  // Mock Data
  const handleSubmit = (e) => {
      e.preventDefault();
      setIsSaving(true);
      setTimeout(() => { setIsSaving(false); onSave(); }, 800);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.innerForm}>
      <div className={styles.gridTwo}>
        <div className={styles.inputGroup}>
            <label>ประเภทหน่วยงาน <span className={styles.req}>*</span></label>
            <select className={styles.selectField}>
                <option>เลือกประเภท...</option>
                <option>เทศบาล</option>
                <option>องค์การบริหารส่วนตำบล (อบต.)</option>
                <option>โรงพยาบาล</option>
                <option>หน่วยงานเอกชน</option>
            </select>
        </div>
        <div className={styles.inputGroup}>
            <label>รูปแบบการใช้งาน <span className={styles.req}>*</span></label>
            <select className={styles.selectField}>
                <option>เลือกรูปแบบ...</option>
                <option>เต็มรูปแบบ (City Management)</option>
                <option>รับแจ้งเหตุ (Report & Dispatch)</option>
            </select>
        </div>
      </div>
      <div className={styles.formFooter}>
        <button type="submit" className={styles.btnSave} disabled={isSaving}>
            {isSaving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
        </button>
      </div>
    </form>
  );
};

// =========================================================
// 5. Code Display (แสดงรหัส)
// =========================================================
const CodeDisplay = ({ adminCode, userCode }) => {
    const [mode, setMode] = useState('admin'); // 'admin' | 'user'
    const code = mode === 'admin' ? adminCode : userCode;
    
    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        alert('คัดลอกรหัสแล้ว');
    };

    return (
        <div className={styles.codeContainer}>
            <div className={styles.codeTabs}>
                <button 
                    className={`${styles.codeTab} ${mode === 'admin' ? styles.activeTab : ''}`}
                    onClick={() => setMode('admin')}
                >
                    Admin Code
                </button>
                <button 
                    className={`${styles.codeTab} ${mode === 'user' ? styles.activeTab : ''}`}
                    onClick={() => setMode('user')}
                >
                    User Code
                </button>
            </div>
            <div className={styles.codeDisplayBox}>
                <span className={styles.theCode}>{code}</span>
                <button className={styles.btnCopy} onClick={handleCopy}>
                    <FaCopy /> คัดลอก
                </button>
            </div>
            <p className={styles.codeHint}>
                {mode === 'admin' 
                    ? 'รหัสสำหรับผู้ดูแลระบบ ใช้ในการเข้าถึง Dashboard และการตั้งค่าขั้นสูง' 
                    : 'รหัสสำหรับเจ้าหน้าที่ภาคสนาม ใช้ในการรับงานและแจ้งเหตุผ่านมือถือ'}
            </p>
        </div>
    );
};

// =========================================================
// 6. หน้า Setup Guide (Main Setup Page)
// =========================================================
const SetupGuidePage = ({ createdOrgName, adminCode, userCode, orgId, handleGoBackToEdit }) => {
    const [activeSection, setActiveSection] = useState(null); // 'code', 'logo', 'location', 'type'

    const toggleSection = (section) => {
        setActiveSection(activeSection === section ? null : section);
    };

    const AccordionItem = ({ id, icon, title, subtitle, component }) => (
        <div className={`${styles.accordionCard} ${activeSection === id ? styles.active : ''}`}>
            <div className={styles.accordionHeader} onClick={() => toggleSection(id)}>
                <SectionHeader icon={icon} title={title} subtitle={subtitle} />
                <div className={styles.accordionArrow}>
                    <FaChevronRight style={{ transform: activeSection === id ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />
                </div>
            </div>
            <div className={styles.accordionBody}>
                <div className={styles.accordionContent}>
                    {component}
                </div>
            </div>
        </div>
    );

    return (
        <div className={styles.setupLayout}>
            <div className={styles.setupHeader}>
                <h2>ตั้งค่าหน่วยงาน</h2>
                <p>จัดการข้อมูลของ <strong>{createdOrgName}</strong> ให้ครบถ้วน</p>
            </div>

            <div className={styles.accordionList}>
                <AccordionItem 
                    id="code" icon={FaKey} title="รหัสเข้าใช้งาน" subtitle="ดูและคัดลอกรหัสสำหรับ Admin และเจ้าหน้าที่"
                    component={<CodeDisplay adminCode={adminCode} userCode={userCode} />} 
                />
                <AccordionItem 
                    id="logo" icon={FaCamera} title="ตราสัญลักษณ์" subtitle="อัปโหลดโลโก้หน่วยงานเพื่อความน่าเชื่อถือ"
                    component={<LogoSetupForm onSave={() => setActiveSection(null)} orgId={orgId} />} 
                />
                <AccordionItem 
                    id="location" icon={FaMapMarkerAlt} title="ที่อยู่และพิกัด" subtitle="กำหนดขอบเขตความรับผิดชอบและจุดติดต่อ"
                    component={<LocationSetupForm onSave={() => setActiveSection(null)} orgId={orgId} />} 
                />
                <AccordionItem 
                    id="type" icon={FaLayerGroup} title="ข้อมูลจำเพาะ" subtitle="ตั้งค่าประเภทหน่วยงานและรูปแบบระบบ"
                    component={<TypeSetupForm onSave={() => setActiveSection(null)} orgId={orgId} />} 
                />
            </div>

            <button className={styles.btnTextBack} onClick={handleGoBackToEdit}>
                <FaArrowLeft /> กลับไปแก้ไขชื่อหน่วยงาน
            </button>
        </div>
    );
};

// =========================================================
// Main Component
// =========================================================
function CreateOrg() {
  const [page, setPage] = useState('create');
  const [orgName, setOrgName] = useState('');
  const [createdOrgName, setCreatedOrgName] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [userCode, setUserCode] = useState('');
  const [orgId, setOrgId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // จำลองการสร้าง (Mock Logic)
  const handleQuickCreate = (e) => {
    e.preventDefault();
    if (!orgName) return alert('กรุณากรอกชื่อหน่วยงาน');
    setIsLoading(true);
    setTimeout(() => {
        setCreatedOrgName(orgName);
        setAdminCode('A-' + Math.floor(1000 + Math.random() * 9000));
        setUserCode('U-' + Math.floor(1000 + Math.random() * 9000));
        setOrgId(123);
        setPage('setup');
        setIsLoading(false);
    }, 1000);
  };

  return (
    <div className={styles.pageContainer}>
      {page === 'create' ? (
        <QuickCreatePage
          orgName={orgName} setOrgName={setOrgName} createdOrgName={createdOrgName}
          isLoading={isLoading} handleQuickCreate={handleQuickCreate}
          handleBackToHome={() => navigate('/home')} error={null}
        />
      ) : (
        <SetupGuidePage
          createdOrgName={createdOrgName} adminCode={adminCode} userCode={userCode}
          orgId={orgId} handleGoBackToEdit={() => setPage('create')}
        />
      )}
    </div>
  );
}

export default CreateOrg;
