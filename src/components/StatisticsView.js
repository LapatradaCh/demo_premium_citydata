import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Map, 
  FileText, 
  Settings, 
  LogOut, 
  Clock, 
  User, 
  TrendingUp, 
  Activity,
  AlertCircle
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

// --- Mock Data for sections without API endpoints yet ---

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

// --- Styles Object ---
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    fontFamily: "'Sarabun', 'Prompt', sans-serif",
    paddingBottom: '80px',
  },
  header: {
    backgroundColor: '#ffffff',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  avatar: {
    width: '40px',
    height: '40px',
    backgroundColor: '#ffedd5',
    borderRadius: '50%',
    overflow: 'hidden',
    border: '2px solid #fed7aa',
  },
  headerTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: 0,
  },
  headerSubtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
  },
  logoutBtn: {
    backgroundColor: '#ef4444',
    color: '#ffffff',
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  main: {
    padding: '24px',
    maxWidth: '1280px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  statusCard: (color, bg, border) => ({
    backgroundColor: bg || '#ffffff',
    border: `1px solid ${border || '#e5e7eb'}`,
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    transition: 'box-shadow 0.2s',
    borderTop: `4px solid ${color}`, // Added top border from original req
    cursor: 'default',
  }),
  sectionCard: {
    backgroundColor: '#ffffff',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    border: '1px solid #f3f4f6',
    marginBottom: '24px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1f2937',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    margin: 0,
  },
  sectionSubtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '4px 0 0 0',
  },
  legendContainer: {
    display: 'flex',
    gap: '8px',
    fontSize: '12px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  dot: (color) => ({
    width: '12px',
    height: '12px',
    backgroundColor: color,
    borderRadius: '50%',
  }),
  summaryBadge: {
    marginBottom: '16px',
    padding: '12px',
    backgroundColor: '#fff7ed',
    borderRadius: '8px',
    border: '1px solid #ffedd5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomNav: {
    position: 'fixed',
    bottom: '24px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#ffffff',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    border: '1px solid #e5e7eb',
    borderRadius: '16px',
    padding: '12px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '32px',
    zIndex: 50,
  },
  navItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    color: '#9ca3af',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    transition: 'color 0.2s',
  },
  navItemActive: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    color: '#111827',
    backgroundColor: '#f3f4f6',
    padding: '8px 16px',
    borderRadius: '12px',
    marginTop: '-24px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  },
  navText: {
    fontSize: '10px',
  },
  navTextActive: {
    fontSize: '10px',
    fontWeight: 'bold',
  },
  staffRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px',
    borderRadius: '8px',
    transition: 'background-color 0.2s',
  },
  staffAvatar: {
    width: '32px',
    height: '32px',
    backgroundColor: '#e5e7eb',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#4b5563',
  },
  barContainer: {
    width: '96px',
    height: '16px',
    backgroundColor: '#e9d5ff',
    borderRadius: '4px',
    overflow: 'hidden',
    display: 'flex',
  },
  barFill: (percent) => ({
    backgroundColor: '#c084fc',
    height: '100%',
    width: `${percent}%`,
  }),
};

const StatisticsView = ({ organizationId }) => {
  // --- State for API Data ---
  const [statsData, setStatsData] = useState(null);
  const [staffData, setStaffData] = useState([]);
  const [satisfactionData, setSatisfactionData] = useState(null);
  const [problemTypeData, setProblemTypeData] = useState([]);
  
  // Loading States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- API Fetching Logic (Preserved from Requirement) ---
  
  useEffect(() => {
    const fetchData = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken || !organizationId) {
        setLoading(false);
        // For Demo purposes if no auth/orgId, we might want to show mock or empty
        // return; 
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

        // 2. Fetch Problem Types (For Why Analysis)
        const typeRes = await fetch(`https://premium-citydata-api-ab.vercel.app/api/stats/count-by-type?organization_id=${organizationId}`, { headers });
        if (typeRes.ok) {
          const data = await typeRes.json();
          // Transform for Recharts: { name: 'Type', count: 10, avgTime: mock }
          // Note: API doesn't return time yet, so we mock avgTime for visual consistency
          const formatted = data.map(item => ({
            name: item.issue_type_name,
            count: parseInt(item.count, 10),
            avgTime: Math.floor(Math.random() * 30) + 5 // Mock data for visualization
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
          // Process Staff Data similar to original code
          const grouped = {};
          rawData.forEach(item => {
             const name = item.staff_name || "Unknown";
             const count = parseInt(item.count, 10) || 0;
             if (!grouped[name]) grouped[name] = 0;
             grouped[name] += count;
          });
          // Convert to array and sort
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
      // Fallback mock fetch for UI preview if no ID provided
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

  // Config for Status Cards based on API keys
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

  // Staff Max for Bar Calculation
  const maxStaffCount = Math.max(...staffData.map(s => s.count), 0);

  return (
    <div style={styles.container}>
      {/* CSS for Grid/Responsive */}
      <style>{`
        .responsive-grid-4 {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        .responsive-grid-2 {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        @media (min-width: 768px) {
          .responsive-grid-4 {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .responsive-grid-4 {
            grid-template-columns: repeat(4, 1fr);
          }
          .responsive-grid-2 {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        .hover-shadow:hover {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .staff-row:hover {
          background-color: #f9fafb;
        }
      `}</style>

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.avatar}>
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" style={{width: '100%', height: '100%'}} />
          </div>
          <div>
            <h1 style={styles.headerTitle}>ภาพรวมสถิติ (Analytical View)</h1>
            <p style={styles.headerSubtitle}>
              {new Date().toLocaleDateString("th-TH", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • ข้อมูลปัจจุบัน
            </p>
          </div>
        </div>
        <button style={styles.logoutBtn}>
          <LogOut size={16} /> ออกจากระบบ
        </button>
      </header>

      <main style={styles.main}>
        
        {/* 1. STATUS CARDS (Using Real API Data) */}
        {loading && !statsData ? (
           <p style={{textAlign: 'center', color: '#9ca3af'}}>กำลังโหลดข้อมูล...</p>
        ) : (
          <section className="responsive-grid-4">
            {statusCardConfig.map((card, idx) => {
              const percent = getPercent(card.count, getTotalCases());
              return (
                <div key={idx} style={styles.statusCard(card.color, card.bg, card.border)} className="hover-shadow">
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px'}}>
                    <span style={{fontSize: '14px', fontWeight: '600', color: '#374151'}}>{card.title}</span>
                    <span style={{fontSize: '24px', fontWeight: 'bold', color: card.color}}>{card.count}</span>
                  </div>
                  <div style={{fontSize: '12px', color: '#6b7280'}}>({percent.toFixed(2)}%)</div>
                </div>
              );
            })}
          </section>
        )}

        {/* 2. TREND ANALYSIS (Mock Data - API Not Available yet) */}
        <section style={styles.sectionCard}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>
                <TrendingUp color="#3b82f6" size={20} />
                แนวโน้มเรื่องร้องเรียน (Trend Analysis)
              </h2>
              <p style={styles.sectionSubtitle}>เปรียบเทียบยอดรับเรื่อง vs สถานะในช่วง 7 วันที่ผ่านมา (Mockup)</p>
            </div>
            <div style={styles.legendContainer}>
               <span style={styles.legendItem}><div style={styles.dot('#3b82f6')}></div> ทั้งหมด</span>
               <span style={styles.legendItem}><div style={styles.dot('#f87171')}></div> รอรับเรื่อง</span>
               <span style={styles.legendItem}><div style={styles.dot('#c084fc')}></div> กำลังประสาน</span>
            </div>
          </div>
          <div style={{height: '250px', width: '100%'}}>
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

        <div className="responsive-grid-2">
          
          {/* 3. BREAKDOWN ANALYSIS (Mock Data - API Not Available yet) */}
          <section style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <div>
                <h2 style={styles.sectionTitle}>
                  <Clock color="#f97316" size={20} />
                  เจาะลึกประสิทธิภาพ (Time Breakdown)
                </h2>
                <p style={styles.sectionSubtitle}>วิเคราะห์คอขวดของเวลาในแต่ละขั้นตอน (Mockup)</p>
              </div>
            </div>
            
            <div style={styles.summaryBadge}>
                <span style={{fontSize: '14px', color: '#9a3412', fontWeight: '500'}}>ค่าเฉลี่ยรวม: 1 วัน 4 ชม.</span>
                <span style={{fontSize: '12px', color: '#16a34a', backgroundColor: '#dcfce7', padding: '4px 8px', borderRadius: '9999px', fontWeight: 'bold'}}>เร็วขึ้น 12.5%</span>
            </div>

            <div style={{height: '250px', width: '100%'}}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={efficiencyData} layout="vertical" margin={{ left: 0, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="id" type="category" width={70} axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#6b7280'}} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px' }} />
                  <Legend iconType="circle" wrapperStyle={{fontSize: '12px', paddingTop: '10px'}} />
                  <Bar dataKey="stage1" stackId="a" fill="#fca5a5" name="รอรับเรื่อง (ชม.)" radius={[4, 0, 0, 4]} barSize={20} />
                  <Bar dataKey="stage2" stackId="a" fill="#d8b4fe" name="ประสานงาน (ชม.)" barSize={20} />
                  <Bar dataKey="stage3" stackId="a" fill="#fde047" name="ดำเนินการ (ชม.)" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* 4. CORRELATION ANALYSIS (Using API Data for Counts) */}
          <section style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <div>
                <h2 style={styles.sectionTitle}>
                  <Activity color="#6366f1" size={20} />
                  ความสัมพันธ์ ประเภท vs เวลา (Why Analysis)
                </h2>
                <p style={styles.sectionSubtitle}>ประเภทปัญหาเทียบกับเวลาแก้ไข (Count Real / Time Mock)</p>
              </div>
            </div>

            {problemTypeData.length > 0 ? (
              <div style={{height: '250px', width: '100%'}}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={problemTypeData.slice(0, 5)} layout="vertical" margin={{ left: 20, right: 20 }}>
                    <CartesianGrid stroke="#f3f4f6" horizontal={true} vertical={true} />
                    <XAxis type="number" axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={80} tick={{fontSize: 12, fontWeight: 600}} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="จำนวนเรื่อง" barSize={20} fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    {/* avgTime mocked because API doesn't provide it yet */}
                    <Bar dataKey="avgTime" name="เวลาเฉลี่ย (Mock ชม.)" barSize={20} fill="#f97316" radius={[0, 4, 4, 0]} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p style={{fontSize: '12px', color: '#9ca3af', textAlign: 'center', padding: '20px'}}>ไม่มีข้อมูลประเภทปัญหา</p>
            )}
          </section>

        </div>

        <div className="responsive-grid-2">
            {/* 5. Satisfaction (Using Real API Data) */}
            <section style={styles.sectionCard}>
                <h3 style={{fontWeight: 'bold', color: '#1f2937', marginBottom: '16px', marginTop: 0}}>ความพึงพอใจของประชาชน</h3>
                {satisfactionData ? (
                  <>
                    <div style={{display: 'flex', alignItems: 'flex-end', gap: '16px', marginBottom: '24px'}}>
                        <span style={{fontSize: '36px', fontWeight: 'bold', color: '#111827', lineHeight: 1}}>
                          {satisfactionData.overall_average.toFixed(2)}
                        </span>
                        <span style={{color: '#9ca3af', paddingBottom: '4px'}}>/ 5</span>
                        <div style={{color: '#facc15', paddingBottom: '4px'}}>
                            {'★'.repeat(Math.round(satisfactionData.overall_average))}
                            {'☆'.repeat(5 - Math.round(satisfactionData.overall_average))}
                        </div>
                        <span style={{fontSize: '12px', color: '#9ca3af', paddingBottom: '4px'}}>
                          ({satisfactionData.total_count} ความเห็น)
                        </span>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                        {/* Create 5 bars for 1-5 stars, mapping API breakdown if exists */}
                        {[5, 4, 3, 2, 1].map((star) => {
                           const item = satisfactionData.breakdown.find(b => b.score === star);
                           const count = item ? item.count : 0;
                           const percent = satisfactionData.total_count > 0 ? (count / satisfactionData.total_count) * 100 : 0;
                           return (
                            <div key={star} style={{display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px'}}>
                                <span style={{width: '20px', fontWeight: 'bold', color: '#4b5563'}}>{star}★</span>
                                <div style={{flex: 1, height: '8px', backgroundColor: '#f3f4f6', borderRadius: '9999px', overflow: 'hidden'}}>
                                    <div style={{height: '100%', backgroundColor: percent > 0 ? '#facc15' : '#e5e7eb', width: `${percent}%`, borderRadius: '9999px'}}></div>
                                </div>
                                <span style={{width: '32px', textAlign: 'right', color: '#6b7280'}}>{Math.round(percent)}%</span>
                            </div>
                           );
                        })}
                    </div>
                  </>
                ) : (
                   <div style={{padding: '20px', textAlign: 'center', color: '#9ca3af'}}>ไม่มีข้อมูลความพึงพอใจ</div>
                )}
            </section>

            {/* 6. Staff Performance (Using Real API Data) */}
            <section style={styles.sectionCard}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
                    <h3 style={{fontWeight: 'bold', color: '#1f2937', margin: 0}}>10 อันดับเจ้าหน้าที่</h3>
                    <div style={{backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '4px 12px', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold'}}>
                      Top 10
                    </div>
                </div>
                
                <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                    {staffData.length > 0 ? staffData.map((staff, i) => (
                        <div key={i} className="staff-row" style={styles.staffRow}>
                            <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                                <div style={styles.staffAvatar}>
                                    {staff.name.charAt(0)}
                                </div>
                                <span style={{fontSize: '14px', fontWeight: '500', color: '#374151'}}>{staff.name}</span>
                            </div>
                            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                <div style={styles.barContainer}>
                                    {/* Calculate width relative to max performer */}
                                    <div style={styles.barFill((staff.count / maxStaffCount) * 100)}></div> 
                                </div>
                                <span style={{fontSize: '12px', fontWeight: 'bold', color: '#4b5563', minWidth: '20px', textAlign: 'right'}}>{staff.count}</span>
                            </div>
                        </div>
                    )) : (
                       <div style={{padding: '20px', textAlign: 'center', color: '#9ca3af'}}>ไม่มีข้อมูลกิจกรรมเจ้าหน้าที่</div>
                    )}
                </div>
            </section>
        </div>

      </main>

      {/* Bottom Navigation */}
      <div style={styles.bottomNav}>
        <button style={styles.navItem}>
            <Map size={20} />
            <span style={styles.navText}>แผนที่</span>
        </button>
        <button style={styles.navItem}>
            <User size={20} />
            <span style={styles.navText}>หน่วยงาน</span>
        </button>
        <button style={styles.navItem}>
            <FileText size={20} />
            <span style={styles.navText}>รายงาน</span>
        </button>
        <button style={styles.navItemActive}>
            <LayoutDashboard size={20} />
            <span style={styles.navTextActive}>สถิติ</span>
        </button>
        <button style={styles.navItem}>
            <Settings size={20} />
            <span style={styles.navText}>ตั้งค่า</span>
        </button>
      </div>
    </div>
  );
};

export default StatisticsView;
