import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Activity,
  Clock
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  ComposedChart
} from 'recharts';

// Import CSS Module
import styles from "./css/StatisticsView.module.css";

// --- Mock Data ---
const trendData = [
  { date: '12/11', total: 2, pending: 1, coordinating: 0, completed: 1 },
  { date: '13/11', total: 3, pending: 2, coordinating: 1, completed: 0 },
  { date: '14/11', total: 1, pending: 0, coordinating: 1, completed: 0 },
  { date: '15/11', total: 4, pending: 1, coordinating: 3, completed: 0 },
  { date: '16/11', total: 2, pending: 1, coordinating: 1, completed: 0 },
  { date: '17/11', total: 5, pending: 2, coordinating: 3, completed: 0 }, 
  { date: '18/11', total: 5, pending: 2, coordinating: 3, completed: 0 }, 
];

const efficiencyData = [
  { id: 'Ticket-001', stage1: 0.5, stage2: 2, stage3: 24, total: 26.5, type: 'ไฟฟ้า' },
  { id: 'Ticket-002', stage1: 1.0, stage2: 4, stage3: 12, total: 17.0, type: 'ต้นไม้' },
  { id: 'Ticket-003', stage1: 0.2, stage2: 1, stage3: 48, total: 49.2, type: 'ต้นไม้' },
  { id: 'Ticket-004', stage1: 0.8, stage2: 5, stage3: 10, total: 15.8, type: 'ต้นไม้' },
  { id: 'Ticket-005', stage1: 0.5, stage2: 3, stage3: 20, total: 23.5, type: 'ต้นไม้' },
];

const StatisticsView = ({ organizationId }) => {
  // --- State for API Data ---
  const [statsData, setStatsData] = useState(null);
  const [staffData, setStaffData] = useState([]);
  const [satisfactionData, setSatisfactionData] = useState(null);
  const [problemTypeData, setProblemTypeData] = useState([]);
  
  // Loading States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Kept for future error handling

  // --- API Fetching Logic ---
  useEffect(() => {
    const fetchData = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken || !organizationId) {
        setLoading(false);
      }

      setLoading(true);
      setError(null);

      try {
        const headers = { 'Authorization': `Bearer ${accessToken}` };

        // 1. Fetch Overview Stats
        const statsRes = await fetch(`https://premium-citydata-api-ab.vercel.app/api/stats/overview?organization_id=${organizationId}`, { headers });
        if (statsRes.ok) {
          const data = await statsRes.json();
          const statsObject = data.reduce((acc, item) => {
            acc[item.status] = parseInt(item.count, 10);
            return acc;
          }, {});
          setStatsData(statsObject);
        }

        // 2. Fetch Problem Types
        const typeRes = await fetch(`https://premium-citydata-api-ab.vercel.app/api/stats/count-by-type?organization_id=${organizationId}`, { headers });
        if (typeRes.ok) {
          const data = await typeRes.json();
          const formatted = data.map(item => ({
            name: item.issue_type_name,
            count: parseInt(item.count, 10),
            avgTime: Math.floor(Math.random() * 30) + 5 
          })).sort((a, b) => b.count - a.count);
          setProblemTypeData(formatted);
        }

        // 3. Fetch Satisfaction
        const satRes = await fetch(`https://premium-citydata-api-ab.vercel.app/api/stats/overall-rating?organization_id=${organizationId}`, { headers });
        if (satRes.ok) {
          const data = await satRes.json();
          setSatisfactionData(data);
        }

        // 4. Fetch Staff Activities
        const staffRes = await fetch(`https://premium-citydata-api-ab.vercel.app/api/stats/staff-activities?organization_id=${organizationId}`, { headers });
        if (staffRes.ok) {
          const rawData = await staffRes.json();
          const grouped = {};
          rawData.forEach(item => {
             const name = item.staff_name || "Unknown";
             const count = parseInt(item.count, 10) || 0;
             if (!grouped[name]) grouped[name] = 0;
             grouped[name] += count;
          });
          const staffArray = Object.entries(grouped)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
          setStaffData(staffArray);
        }

      } catch (err) {
        console.error("API Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (organizationId) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [organizationId]);

  // --- Data Processing Helpers ---
  const getTotalCases = () => {
    if (!statsData) return 0;
    return Object.values(statsData).reduce((a, b) => a + b, 0);
  };

  const getStatusCount = (statusKey) => {
    return statsData?.[statusKey] || 0;
  };

  const getPercent = (val, total) => {
    return total > 0 ? (val / total) * 100 : 0;
  };

  // Config for Status Cards
  const statusCardConfig = [
    { title: 'ทั้งหมด', count: getTotalCases(), color: '#6c757d', bg: '#ffffff', border: '#e5e7eb' },
    { title: 'รอรับเรื่อง', count: getStatusCount('รอรับเรื่อง'), color: '#dc3545', bg: '#fef2f2', border: '#fee2e2' },
    { title: 'กำลังประสานงาน', count: getStatusCount('กำลังประสานงาน'), color: '#9b59b6', bg: '#faf5ff', border: '#f3e8ff' },
    { title: 'กำลังดำเนินการ', count: getStatusCount('กำลังดำเนินการ'), color: '#ffc107', bg: '#fefce8', border: '#fef9c3' },
    { title: 'เสร็จสิ้น', count: getStatusCount('เสร็จสิ้น'), color: '#057A55', bg: '#f0fdf4', border: '#dcfce7' },
    { title: 'ส่งต่อ', count: getStatusCount('ส่งต่อ'), color: '#007bff', bg: '#eff6ff', border: '#dbeafe' },
    { title: 'เชิญร่วม', count: getStatusCount('เชิญร่วม'), color: '#20c997', bg: '#ecfeff', border: '#cffafe' },
    { title: 'ปฏิเสธ', count: getStatusCount('ปฏิเสธ'), color: '#6b7280', bg: '#f9fafb', border: '#f3f4f6' },
  ];

  const maxStaffCount = Math.max(...staffData.map(s => s.count), 0);

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div>
            <p className={styles.headerSubtitle}>
              {new Date().toLocaleDateString("th-TH", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • ข้อมูลปัจจุบัน
            </p>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        
        {/* 1. STATUS CARDS */}
        {loading && !statsData ? (
           <p style={{textAlign: 'center', color: '#9ca3af'}}>กำลังโหลดข้อมูล...</p>
        ) : (
          <section className={styles.responsiveGrid4}>
            {statusCardConfig.map((card, idx) => {
              const percent = getPercent(card.count, getTotalCases());
              return (
                <div 
                  key={idx} 
                  className={`${styles.statusCard} ${styles.hoverShadow}`}
                  // Dynamic styles for colors are kept inline, layout in CSS
                  style={{
                    backgroundColor: card.bg,
                    borderColor: card.border,
                    borderTopColor: card.color
                  }}
                >
                  <div className={styles.cardHeader}>
                    <span className={styles.cardTitle}>{card.title}</span>
                    <span className={styles.cardCount} style={{color: card.color}}>
                      {card.count}
                    </span>
                  </div>
                  <div className={styles.cardPercent}>({percent.toFixed(2)}%)</div>
                </div>
              );
            })}
          </section>
        )}

        {/* 2. TREND ANALYSIS */}
        <section className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>
                <TrendingUp color="#3b82f6" size={20} />
                แนวโน้มเรื่องร้องเรียน (Trend Analysis)
              </h2>
              <p className={styles.sectionSubtitle}>เปรียบเทียบยอดรับเรื่อง vs สถานะในช่วง 7 วันที่ผ่านมา (Mockup)</p>
            </div>
            <div className={styles.legendContainer}>
               <span className={styles.legendItem}>
                 <div className={styles.dot} style={{backgroundColor: '#3b82f6'}}></div> ทั้งหมด
               </span>
               <span className={styles.legendItem}>
                 <div className={styles.dot} style={{backgroundColor: '#f87171'}}></div> รอรับเรื่อง
               </span>
               <span className={styles.legendItem}>
                 <div className={styles.dot} style={{backgroundColor: '#c084fc'}}></div> กำลังประสาน
               </span>
            </div>
          </div>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }}
                />
                <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} name="เรื่องทั้งหมด" />
                <Line type="monotone" dataKey="pending" stroke="#f87171" strokeWidth={2} dot={{r: 3}} name="รอรับเรื่อง" />
                <Line type="monotone" dataKey="coordinating" stroke="#c084fc" strokeWidth={2} dot={{r: 3}} name="กำลังประสานงาน" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <div className={styles.responsiveGrid2}>
