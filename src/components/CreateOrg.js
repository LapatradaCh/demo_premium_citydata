import React, { useState } from "react";
import styles from "./css/CreateOrg.module.css";

function CreateOrg() {
  const [formData, setFormData] = useState({
    orgName: "",
    orgType: "",
    usageType: "",
    province: "",
    district: "",
    subdistrict: "",
    phone: "",
  });

  const [orgImage, setOrgImage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setOrgImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("ข้อมูลที่ส่ง:", formData);
    console.log("รูปภาพ:", orgImage);
    alert("สร้างหน่วยงานสำเร็จ!");
  };

  const handleCancel = () => {
    setFormData({
      orgName: "",
      orgType: "",
      usageType: "",
      province: "",
      district: "",
      subdistrict: "",
      phone: "",
    });
    setOrgImage(null);
  };

  const fields = [
    { label: "ชื่อหน่วยงาน", name: "orgName", required: true, span: 2, type: "text" },
    { label: "ประเภทหน่วยงาน", name: "orgType", required: true, type: "select" },
    { label: "ประเภทการใช้งาน", name: "usageType", required: true, type: "select" },
    { label: "จังหวัดที่รับผิดชอบ", name: "province", required: true, type: "select" },
    { label: "อำเภอ/เขตที่รับผิดชอบ", name: "district", required: true, type: "select" },
    { label: "ตำบล/แขวงที่รับผิดชอบ", name: "subdistrict", required: true, type: "select" },
    { label: "เบอร์โทรศัพท์", name: "phone", required: true, type: "tel" },
  ];

  const renderField = (field) => {
    const commonProps = {
      id: field.name,
      name: field.name,
      value: formData[field.name],
      onChange: handleChange,
      required: field.required || false,
      placeholder: field.label,
    };

    if (field.type === "textarea") {
      return <textarea {...commonProps} className={styles.textarea} rows="4" />;
    }

    if (field.type === "select") {
      return (
        <select {...commonProps} className={styles.select}>
          <option value="" disabled>
            {field.label}
          </option>
          <option value="type1">ประเภทที่ 1</option>
          <option value="type2">ประเภทที่ 2</option>
        </select>
      );
    }

    return <input {...commonProps} type={field.type} className={styles.input} />;
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>สร้างหน่วยงานใหม่</h2>

      <div className={styles.imageUpload}>
        <label
          htmlFor="orgImage"
          className={styles.imagePreview}
          style={{ backgroundImage: orgImage ? `url(${orgImage})` : "none" }}
        >
          {!orgImage && "คลิกเพื่ออัปโหลดรูป"}
        </label>
        <input
          id="orgImage"
          type="file"
          accept="image/*"
          className={styles.imageInput}
          onChange={handleImageChange}
        />
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGrid}>
          {fields.map((field) => (
            <div
              key={field.name}
              className={
                field.span === 2
                  ? `${styles.formGroup} ${styles["span-2"]}`
                  : styles.formGroup
              }
            >
              <label
                htmlFor={field.name}
                className={
                  field.required
                    ? `${styles.label} ${styles.required}`
                    : styles.label
                }
              >
                {field.label}
              </label>
              {renderField(field)}
            </div>
          ))}
        </div>

        <div className={styles.buttonGroup}>
          <button type="button" className={styles.cancelBtn} onClick={handleCancel}>
            ยกเลิก
          </button>
          <button type="submit" className={styles.createBtn}>
            สร้างหน่วยงาน
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateOrg;
