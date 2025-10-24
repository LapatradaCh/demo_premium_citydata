/* ========================= */

/* Reset & Base (global) */
:global(*),
:global(*::before),
:global(*::after) {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: 'Prompt', Arial, sans-serif;
}

/* Root variables */
:root {
  --color-primary: #b78b66;
  --color-secondary: #4b3b2f;
  --color-bg: #ffffff;
  --color-accent: #fffaf5;
  --shadow-card: 0 15px 35px rgba(0, 0, 0, 0.1);
  --transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* ------------------ Background ------------------ */
.bodySignin {
  background-image: 
    linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)),
    url('https://visitamanta.com/wp-content/uploads/2021/04/1.1-2-scaled.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  min-height: 100vh;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow-x: hidden;
}

/* Floating soft circles */
@keyframes floatLight {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.7; }
  50% { transform: translate(30px, -20px) scale(1.05); opacity: 0.9; }
}

.floating-circle-1,
.floating-circle-2,
.floating-circle-3 {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(80px);
  animation: floatLight 14s ease-in-out infinite;
  z-index: 1;
}

.floating-circle-1 { width: 280px; height: 280px; top: -100px; left: -80px; background: radial-gradient(circle, rgba(183,134,102,0.15), transparent 70%); }
.floating-circle-2 { width: 400px; height: 400px; bottom: -160px; right: -160px; background: radial-gradient(circle, rgba(183,134,102,0.12), transparent 70%); animation-delay: 2s; }
.floating-circle-3 { width: 240px; height: 240px; bottom: 10%; left: 25%; background: radial-gradient(circle, rgba(255,214,170,0.12), transparent 70%); animation-delay: 4s; }

/* ------------------ OTP Container ------------------ */
@keyframes fadeSlideIn {
  0% { opacity: 0; transform: translateY(30px) scale(0.97); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

.otp-container {
  width: 92%;
  padding: 28px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(14px);
  box-shadow: 0 15px 45px rgba(0, 0, 0, 0.25);
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 2;
  animation: fadeSlideIn 1s ease;
  transition: all 0.4s ease;
}

.otp-container:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
}

/* Header Logo */
.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
}

.logo-img {
  width: 110px;
  height: 110px;
  object-fit: cover;
  border-radius: 50%;
  border: 4px solid var(--color-primary);
  margin-bottom: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  transition: transform 0.4s ease;
}
.logo-img:hover {
  transform: rotate(5deg) scale(1.05);
}

/* ------------------ ฟอร์ม OTP ------------------ */
.otp-form {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.labelUse {
  font-weight: 600;
  color: #492610;
  margin: 12px 0 6px;
}

.inputField input[type="text"],
.inputField input[type="tel"] {
  padding: 14px 16px;
  border: 1px solid #ddd;
  border-radius: 12px;
  font-size: 1em;
  outline: none;
  transition: all 0.3s;
  background-color: #fff;
}

.inputField input[type="text"]:focus,
.inputField input[type="tel"]:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 10px rgba(183,134,102,0.35);
}

.inputField input:hover {
  box-shadow: 0 0 6px rgba(0,0,0,0.1);
}

.phone-otp-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 18px;
  align-items: stretch;
}

.phone-otp-group input {
  flex: 1;
}

.phone-otp-group button {
  flex: unset;
  padding: 10px 12px;
  border-radius: 20px;
  border: none;
  background-color: #007BFF;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  height: 46px;
  box-shadow: 0 5px 12px rgba(0,123,255,0.3);
}

.phone-otp-group button
