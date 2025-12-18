/* === (SHARED) Calendar === */
.calendarPopup {
  position: absolute;
  top: 120%;
  z-index: 100;
  background: #ffffff;
  border-radius: 18px;
  padding: 18px;
  min-width: 280px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.08);
}

/* --- Report Table Specific --- */
.searchTop {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: 16px;
  position: relative;
  width: 100%;
  max-width: 1100px; 
  margin: 0 auto 24px auto; 
}

.searchInputWrapper {
  flex-grow: 1;
  position: relative;
  display: flex;
}

.searchInput {
  width: 100%;
  padding: 12px 18px 12px 52px;
  border-radius: 28px;
  border: 1px solid #e0e0e0;
  font-size: 14px;
  background-color: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  transition: all 0.25s ease;
  color: #000;
}

.searchInput:focus {
  outline: none;
  border-color: #000;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
}

.searchIcon {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  color: #555;
}

.filterToggleButton {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  background-color: #000;
  border: none;
  border-radius: 24px;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  transition: all 0.25s ease;
}

/* === (SHARED) Modal === */
.filterModalBackdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1999;
  backdrop-filter: blur(4px);
}

.filterModal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2000;
  background: #ffffff;
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.filterModalHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 18px;
  border-bottom: 1px solid #f0f0f0;
}

.filterModalClose {
  background: #dc3545;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #fff;
}

.filterModalContent {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 70vh;
}

.reportFilters {
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  max-height: 50vh;
}

.filterGroup {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filterGroup label {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.filterGroup select, .timeRangeButton {
  width: 100%;
  font-size: 14px;
  border-radius: 12px;
  border: 1px solid #d0d0d0;
  padding: 10px 14px;
  background-color: #fff;
}

.filterApplyButton {
  padding: 12px 20px;
  background-color: #057a55;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  align-self: center;
  min-width: 150px;
}

/* === Report Table Specific (แก้ไขเพื่อป้องกันการยืดตามกัน) === */
.reportSummary {
  font-weight: 600;
  margin: 28px auto 16px auto;
  color: #333;
  width: 100%;
  max-width: 1100px;
}

.reportTableContainer {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  max-width: 1100px;
  margin: 0 auto;
  /* ✅ บรรทัดนี้สำคัญที่สุด: ป้องกัน Card ในแถวเดียวกันยืดตามกัน */
  align-items: start; 
}

.reportTableRow {
  display: grid;
  grid-template-columns: 70px 1fr auto;
  grid-template-areas:
    "image header status"
    "image details details"
    "location location location"
    "toggle toggle toggle";
  align-items: start;
  gap: 8px 10px;
  padding: 16px;
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #e9e9e9;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  height: fit-content;
}

.reportTableRow:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.09);
}

.reportImage {
  grid-area: image;
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 10px;
}

.reportHeader {
  grid-area: header;
  font-weight: 700;
  font-size: 15px;
  color: #000;
}

.mainDetails {
  grid-area: details;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

/* ส่วนแสดงรายละเอียดเมื่อขยาย */
.expandedSection {
  grid-column: 1 / -1;
  border-top: 1px dashed #ddd;
  margin-top: 10px;
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.locationDetails {
  background: #f8f9fa;
  padding: 10px;
  border-radius: 8px;
  font-size: 11px;
  color: #777;
}

/* Status Tags (Modern Style) */
.statusTag {
  grid-area: status;
  padding: 4px 10px;
  border-radius: 22px;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  text-align: center;
}
.statusTag.pending { background: #dc3545; }
.statusTag.in_progress { background: #ffc107; color: #333; }
.statusTag.completed { background: #057a55; }
.statusTag.coordinating { background: #9b59b6; }

.toggleDetailsButton {
  grid-area: toggle;
  background: none;
  border: none;
  width: 100%;
  text-align: center;
  padding-top: 10px;
  margin-top: 4px;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  color: #007bff;
  border-top: 1px solid #f0f0f0;
}

@media screen and (max-width: 768px) {
  .reportTableContainer { grid-template-columns: 1fr; }
}
