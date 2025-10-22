import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom'; 
import liff from '@line/liff'; 
const LIFF_ID = "2008265392-G9mE93Em"; 

const root = ReactDOM.createRoot(document.getElementById('root'));

// 3. สั่ง liff.init() ก่อน
liff.init({
  liffId: LIFF_ID,
})
.then(() => {
  // 4. เมื่อ init() สำเร็จ ค่อย render แอปของคุณ
  // (นี่คือ code 'root.render' เดิมของคุณที่ย้ายเข้ามาข้างในนี้)
  console.log("LIFF initialized successfully.");
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
})
.catch((e) => {
  // 5. กรณี liff.init() ล้มเหลว
  console.error("LIFF initialization failed:", e);
  root.render(
    <div>
      <h1>เกิดข้อผิดพลาดในการเริ่มต้น LIFF</h1>
      <p>{e.message}</p>
    </div>
  );
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
