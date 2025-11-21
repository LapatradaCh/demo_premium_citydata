import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Activity,
  Clock,
  Users 
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

import styles from './css/StatisticsView.module.css';

// --- Configuration ---
const STATUS_COLORS = {
  'รอรับเรื่อง': '#ef4444',       // Red
  'กำลังประสานงาน': '#a855f7',    // Purple
  'กำลังดำเนินการ': '#f59e0b',    // Amber
  'เสร็จสิ้น': '#22c55e',         // Green
  'ส่งต่อ': '#3b82f6',            // Blue
  'เชิญร่วม': '#06b6d4',          // Cyan
  'ปฏิเสธ': '#6b7280',            // Gray
  'NULL': '#d1d5db'               // Light Gray
};

// --- Mock Data (For other sections) ---
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
  const [statsData, setStatsData] = useState(null);
  const [staffData, setStaffData] = useState([]);
  const [totalStaffCount, setTotalStaffCount] = useState(0); 
  const [satisfactionData, setSatisfactionData] = useState(null);
  const [problemTypeData, setProblemTypeData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const accessToken = localStorage.getItem('accessToken');
      
      // Mocking data load if no API (for preview purposes)
      if (!accessToken && !organizationId) {
        setTimeout(() => {
           setStatsData({
             'รอรับเรื่อง': 2,
             'กำลังประสานงาน': 3,
             'กำลังดำเนินการ': 5,
             'เสร็จสิ้น': 10,
             'ส่งต่อ': 1,
             'เชิญร่วม': 0,
             'ปฏิเสธ': 1
           });
           setStaffData([
             { name: 'สมชาย ใจดี', 'รอรับเรื่อง': 1, 'เสร็จสิ้น': 5, total: 6 },
             { name: 'วิภา รักดี', 'กำลังดำเนินการ': 3, total: 3 },
             { name: 'กมลวรรณ', 'ส่งต่อ': 2, 'กำลังประสานงาน': 1, total: 3 }
           ]);
           setTotalStaffCount(12);
           setSatisfactionData({ overall_average: 4.35, total_count: 100, breakdown: [{score: 5, count: 41}, {score: 4, count: 53}, {score: 3, count: 6}] });
           setProblemTypeData([{name: 'ไฟฟ้าส่องสว่าง', count: 10, avgTime: 20}, {name: 'ถนนชำรุด', count: 5, avgTime: 15}]);
           setLoading(false);
        }, 1000);
        return;
      }
      
      setLoading(true);

      try {
        const headers = { 'Authorization': `Bearer ${accessToken}` };

        // 1. Overview Stats
        const statsRes = await fetch(`https://premium-citydata-api-ab.vercel.app/api/stats/overview?organization_id=${organizationId}`, { headers });
        if (statsRes.ok) {
          const data = await statsRes.json();
          const statsObject = data.reduce((acc, item) => {
            acc[item.status] = parseInt(item.count, 10);
            return acc;
          }, {});
          setStatsData(statsObject);
        }

        // 2. Problem Types
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

        // 3. Satisfaction
        const satRes = await fetch(`https://premium-citydata-api-ab.vercel.app/api/stats/overall-rating?organization_id=${organizationId}`, { headers });
        if (satRes.ok) {
          const data = await satRes.json();
          setSatisfactionData(data);
        }

        // 4. Staff Count
        const staffCountRes = await fetch(`https://premium-citydata-api-ab.vercel.app/api/stats/staff-count?organization_id=${organizationId}`, { headers });
        if (staffCountRes.ok) {
          const data = await staffCountRes.json();
          const count = data.staff_count ? parseInt(data.staff_count, 10) : 0;
          setTotalStaffCount(count);
        }

        // 5. Staff Activities
        const staffRes = await fetch(`https://premium-citydata-api-ab.vercel.app/api/stats/staff-activities?organization_id=${organizationId}`, { headers });
        if (staffRes.ok) {
          const rawData = await staffRes.json();
          const grouped = {};
          
          if (Array.isArray(rawData)) {
            rawData.forEach(item => {
               const name = item.staff_name || "Unknown";
               const status = item.new_status || "NULL"; 
               const count = item.count || 0;

               if (!grouped[name]) {
                 grouped[name] = { name: name, total: 0 };
               }
               
               if (!grouped[name][status]) {
                 grouped[name][status] = 0;
               }
               grouped[name][status] += count;
               grouped[name].total += count;
            });
          }

          const staffArray = Object.values(grouped)
            .sort((a, b) => b.total - a.total)
            .slice(0, 10);

          setStaffData(staffArray);
        }

      } catch (err) {
        console.error("API Error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (organizationId || true) { 
      fetchData();
    }
  }, [organizationId]);

  // Helpers
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

  // Helper to calculate dynamic height for Staff Chart
  const calculateStaffChartHeight = () => {
    const baseHeight = 100; // Header & Legend space
    const itemHeight = 70;  // Space per staff member
    const calculated = (staffData.length * itemHeight) + baseHeight;
    // Ensure minimum height of 400px, otherwise stretch to fit content
    return Math.max(calculated, 400);
  };

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

  return (
    <div className={styles.container}>
      <header className={styles.header}>
         <div>
           <p className={styles.headerSubtitle}>
             {new Date().toLocaleDateString("th-TH", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • ข้อมูลปัจจุบัน
           </p>
         </div>
      </header>

      <main className={styles.main}>
        
        {loading && !statsData ? (
           <p style={{textAlign: 'center', color: '#9ca3af', marginTop: '40px'}}>กำลังโหลดข้อมูล...</p>
        ) : (
          <section className={styles.responsiveGrid4}>
            {statusCardConfig.map((card, idx) => {
              const percent = getPercent(card.count, getTotalCases());
              return (
                <div 
                  key={idx} 
                  className={`${styles.statusCard} ${styles.hoverShadow}`}
                  style={{
                    backgroundColor: card.bg,
                    borderColor: card.border,
                    borderTopColor: card.color
                  }}
                >
                  <div className={styles.cardHeader}>
                    <span className={styles.cardTitle} title={card.title}>{card.title}</span>
                    <span className={styles.cardCount} style={{color: card.color}}>
                      {card.count}
                    </span>
                  </div>
                  <div className={styles.cardPercent}>({percent.toFixed(0)}%)</div>
                </div>
              );
            })}
          </section>
        )}

        <section className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>
                <TrendingUp color="#3b82f6" size={20} />
                แนวโน้มเรื่องร้องเรียน
              </h2>
              <p className={styles.sectionSubtitle}>ยอดรับเรื่อง vs สถานะ (7 วันล่าสุด)</p>
            </div>
            <div className={styles.legendContainer}>
               <span className={styles.legendItem}><div className={styles.dot} style={{backgroundColor: '#3b82f6'}}></div> ทั้งหมด</span>
               <span className={styles.legendItem}><div className={styles.dot} style={{backgroundColor: '#f87171'}}></div> รอรับเรื่อง</span>
               <span className={styles.legendItem}><div className={styles.dot} style={{backgroundColor: '#c084fc'}}></div> กำลังประสาน</span>
            </div>
          </div>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }} />
                <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} name="เรื่องทั้งหมด" />
                <Line type="monotone" dataKey="pending" stroke="#f87171" strokeWidth={2} dot={{r: 3}} name="รอรับเรื่อง" />
                <Line type="monotone" dataKey="coordinating" stroke="#c084fc" strokeWidth={2} dot={{r: 3}} name="กำลังประสานงาน" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <div className={styles.responsiveGrid2}>
          
          {/* Efficiency Chart */}
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>
                  <Clock color="#f97316" size={20} />
                  เจาะลึกประสิทธิภาพ
                </h2>
                <p className={styles.sectionSubtitle}>วิเคราะห์เวลาในแต่ละขั้นตอน</p>
              </div>
            </div>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={efficiencyData} layout="vertical" margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="id" 
                    type="category" 
                    width={100} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 12, fill: '#4b5563', fontWeight: 500}} 
                  />
                  <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{fontSize: '13px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                  <Legend iconType="circle" wrapperStyle={{fontSize: '12px', paddingTop: '10px'}} />
                  <Bar dataKey="stage1" stackId="a" fill="#fca5a5" name="รอรับเรื่อง" barSize={24} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="stage2" stackId="a" fill="#d8b4fe" name="ประสานงาน" barSize={24} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="stage3" stackId="a" fill="#fde047" name="ดำเนินการ" barSize={24} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Problem Type vs Time Chart */}
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>
                  <Activity color="#6366f1" size={20} />
                  ประเภท vs เวลา
                </h2>
                <p className={styles.sectionSubtitle}>ประเภทปัญหาเทียบกับเวลาแก้ไข</p>
              </div>
            </div>
            {problemTypeData.length > 0 ? (
              <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={problemTypeData.slice(0, 5)} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="#f3f4f6" vertical={true} horizontal={true} />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={110} 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 12, fill: '#4b5563', fontWeight: 500}} 
                    />
                    <Tooltip contentStyle={{fontSize: '13px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                    <Legend wrapperStyle={{fontSize: '12px'}} />
                    <Bar dataKey="count" name="จำนวน (เรื่อง)" barSize={14} fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="avgTime" name="เวลาเฉลี่ย (ชม.)" barSize={14} fill="#f97316" radius={[0, 4, 4, 0]} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className={styles.emptyState}>ไม่มีข้อมูล</p>
            )}
          </section>

        </div>

        <div className={styles.responsiveGrid2}>
            
            {/* Satisfaction Score */}
            <section className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                    <h3 style={{fontWeight: 'bold', color: '#1f2937', margin: 0}}>ความพึงพอใจ</h3>
                </div>
                {satisfactionData ? (
                  <>
                    <div className={styles.satisfactionHeader}>
                        <span className={styles.scoreBig}>{satisfactionData.overall_average.toFixed(2)}</span>
                        <span style={{color: '#facc15', fontSize: '18px'}}>{'★'.repeat(Math.round(satisfactionData.overall_average))}</span>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                        {[5, 4, 3, 2, 1].map((star) => {
                           const item = satisfactionData.breakdown.find(b => b.score === star);
                           const percent = satisfactionData.total_count > 0 ? ((item?.count || 0) / satisfactionData.total_count) * 100 : 0;
                           return (
                            <div key={star} className={styles.starRow}>
                                <span className={styles.starLabel}>{star}★</span>
                                <div className={styles.progressTrack}>
                                    <div className={styles.progressBar} style={{backgroundColor: '#facc15', width: `${percent}%`}}></div>
                                </div>
                                <span className={styles.starPercent}>{Math.round(percent)}%</span>
                            </div>
                           );
                        })}
                    </div>
                  </>
                ) : <div className={styles.emptyState}>ไม่มีข้อมูล</div>}
            </section>

            {/* Staff Performance Ranking (Updated Logic) */}
            <section className={styles.sectionCard}>
                <div className={styles.topHeader}>
                    <h3 style={{fontWeight: 'bold', color: '#1f2937', margin: 0}}>อันดับประสิทธิภาพ</h3>
                    <div className={styles.topBadge}>
                       <Users size={14} style={{marginRight: '4px'}}/>
                       ทั้งหมด: {totalStaffCount} คน
                    </div>
                </div>
                
                {/* Dynamic Height Applied Here */}
                <div className={styles.staffChartContainer} style={{ height: `${calculateStaffChartHeight()}px` }}>
                    {staffData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          layout="vertical" 
                          data={staffData} 
                          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                          <XAxis type="number" hide />
                          <YAxis 
                            dataKey="name" 
                            type="category" 
                            width={120} 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fontSize: 13, fontWeight: 500, fill: '#374151'}} 
                          />
                          <Tooltip 
                            cursor={{fill: '#f9fafb'}}
                            contentStyle={{ borderRadius: '8px', fontSize: '13px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                          />
                          {Object.keys(STATUS_COLORS).map((status) => (
                            <Bar 
                              key={status} 
                              dataKey={status} 
                              stackId="staff" 
                              fill={STATUS_COLORS[status]} 
                              barSize={24}
                              name={status}
                            />
                          ))}
                          <Legend iconType="circle" wrapperStyle={{fontSize: '12px', paddingTop: '15px'}} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                       <div className={styles.emptyState}>ไม่มีข้อมูลกิจกรรมเจ้าหน้าที่</div>
                    )}
                </div>
            </section>
        </div>

      </main>
    </div>
  );
};

export default StatisticsView;
