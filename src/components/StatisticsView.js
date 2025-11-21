import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Activity, 
  Clock, 
  Users,
  Star
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, ComposedChart
} from 'recharts';

import styles from './css/StatisticsView.module.css';

// --- Configuration ---
const STATUS_COLORS = {
  'รอรับเรื่อง': '#ef4444',        
  'กำลังประสานงาน': '#a855f7',     
  'กำลังดำเนินการ': '#f59e0b',     
  'เสร็จสิ้น': '#22c55e',          
  'ส่งต่อ': '#3b82f6',             
  'เชิญร่วม': '#06b6d4',           
  'ปฏิเสธ': '#6b7280',             
  'NULL': '#d1d5db'                
};

const StatisticsView = ({ organizationId }) => {
  const [statsData, setStatsData] = useState(null);
  const [staffData, setStaffData] = useState([]);
  const [totalStaffCount, setTotalStaffCount] = useState(0); 
  const [satisfactionData, setSatisfactionData] = useState(null);
  const [problemTypeData, setProblemTypeData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [efficiencyData, setEfficiencyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const accessToken = localStorage.getItem('accessToken');
      
      // --- MOCK DATA (ใช้ทดสอบ ถ้าไม่มี API) ---
      if (!accessToken && !organizationId) {
        setTimeout(() => {
           setStatsData({
             'รอรับเรื่อง': 2, 'กำลังประสานงาน': 5, 'กำลังดำเนินการ': 8,
             'เสร็จสิ้น': 12, 'ส่งต่อ': 3, 'เชิญร่วม': 1, 'ปฏิเสธ': 0
           });
           
           setTrendData([
             { date: '12/11', total: 5, pending: 1, coordinating: 2 },
             { date: '13/11', total: 8, pending: 3, coordinating: 1 },
             { date: '14/11', total: 4, pending: 0, coordinating: 2 },
             { date: '15/11', total: 10, pending: 2, coordinating: 4 },
             { date: '16/11', total: 6, pending: 1, coordinating: 1 },
             { date: '17/11', total: 12, pending: 4, coordinating: 3 }, 
             { date: '18/11', total: 9, pending: 2, coordinating: 3 }, 
           ]);

           setEfficiencyData([
             { id: 'ไฟส่องสว่างดับ', stage1: 2, stage2: 4, stage3: 24, total: 30 },
             { id: 'ถนนเป็นหลุมบ่อ', stage1: 5, stage2: 12, stage3: 48, total: 65 },
             { id: 'ขยะส่งกลิ่นเหม็น', stage1: 1, stage2: 2, stage3: 5, total: 8 },
             { id: 'ท่อระบายน้ำอุดตัน', stage1: 3, stage2: 6, stage3: 20, total: 29 },
           ]);

           setStaffData([
             { name: 'สมชาย ใจดี', 'เสร็จสิ้น': 15, 'กำลังดำเนินการ': 2, total: 17 },
             { name: 'วิภา รักดี', 'กำลังดำเนินการ': 8, 'รอรับเรื่อง': 1, total: 9 },
             { name: 'กมลวรรณ', 'ส่งต่อ': 5, 'กำลังประสานงาน': 4, total: 9 },
             { name: 'ณเดชน์', 'เสร็จสิ้น': 4, 'ปฏิเสธ': 1, total: 5 },
             { name: 'ญาญ่า', 'กำลังดำเนินการ': 2, total: 2 }
           ]);
           setTotalStaffCount(12);
           
           setSatisfactionData({ 
             overall_average: 4.65, 
             total_count: 158, 
             breakdown: [
               {score: 5, count: 100}, 
               {score: 4, count: 40}, 
               {score: 3, count: 15}, 
               {score: 2, count: 3}, 
               {score: 1, count: 0}
             ] 
           });
           
           setProblemTypeData([
             {name: 'ไฟฟ้าส่องสว่างสาธารณะ', count: 45, avgTime: 24}, 
             {name: 'ความสะอาด/ขยะ', count: 32, avgTime: 12},
             {name: 'ถนน/ทางเท้าชำรุด', count: 28, avgTime: 48},
             {name: 'เหตุรำคาญ/เสียงดัง', count: 15, avgTime: 6},
             {name: 'การจราจร/ป้าย', count: 10, avgTime: 18}
           ]);
           setLoading(false);
        }, 800);
        return;
      }
      
      // ... (ส่วน Real API Fetching คงเดิม) ...
    };

    fetchData();
  }, [organizationId]);

  // --- Helpers ---
  const getTotalCases = () => statsData ? Object.values(statsData).reduce((a, b) => a + b, 0) : 0;
  const getStatusCount = (statusKey) => statsData?.[statusKey] || 0;
  const getPercent = (val, total) => total > 0 ? (val / total) * 100 : 0;

  // ตัดคำแกน Y ให้ไม่ยาวเกินไป
  const formatYAxisLabel = (value) => {
    if (typeof value === 'string' && value.length > 12) {
      return value.substring(0, 12) + '...';
    }
    return value;
  };

  // คำนวณความสูงกราฟ Staff
  const calculateStaffChartHeight = () => {
    const minHeight = 300;
    const itemHeight = 60; // ความสูงต่อคน
    const calculated = (staffData.length * itemHeight) + 80; 
    return Math.max(calculated, minHeight);
  };

  const statusCardConfig = [
    { title: 'ทั้งหมด', count: getTotalCases(), color: '#64748b', bg: '#f8fafc', border: '#e2e8f0' },
    { title: 'รอรับเรื่อง', count: getStatusCount('รอรับเรื่อง'), color: '#ef4444', bg: '#fef2f2', border: '#fee2e2' },
    { title: 'กำลังประสานงาน', count: getStatusCount('กำลังประสานงาน'), color: '#a855f7', bg: '#faf5ff', border: '#f3e8ff' },
    { title: 'กำลังดำเนินการ', count: getStatusCount('กำลังดำเนินการ'), color: '#f59e0b', bg: '#fffbeb', border: '#fef3c7' },
    { title: 'เสร็จสิ้น', count: getStatusCount('เสร็จสิ้น'), color: '#22c55e', bg: '#f0fdf4', border: '#dcfce7' },
    { title: 'ส่งต่อ', count: getStatusCount('ส่งต่อ'), color: '#3b82f6', bg: '#eff6ff', border: '#dbeafe' },
    { title: 'เชิญร่วม', count: getStatusCount('เชิญร่วม'), color: '#06b6d4', bg: '#ecfeff', border: '#cffafe' },
    { title: 'ปฏิเสธ', count: getStatusCount('ปฏิเสธ'), color: '#6b7280', bg: '#f9fafb', border: '#f3f4f6' },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
         <h1 className={styles.headerTitle}>Dashboard ภาพรวม</h1>
         <p className={styles.headerSubtitle}>
           {new Date().toLocaleDateString("th-TH", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • ข้อมูลล่าสุด
         </p>
      </header>

      <main>
        {/* --- 1. Status Cards --- */}
        <section className={styles.responsiveGrid4}>
            {loading && !statsData ? <div className={styles.emptyState}>กำลังโหลด...</div> : (
              statusCardConfig.map((card, idx) => (
                <div key={idx} className={styles.statusCard} style={{ backgroundColor: '#ffffff', borderColor: card.border, borderTopColor: card.color }}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardTitle}>{card.title}</span>
                    <span className={styles.cardPercentBadge} style={{color: card.color, backgroundColor: card.bg}}>
                       {getPercent(card.count, getTotalCases()).toFixed(0)}%
                    </span>
                  </div>
                  <div className={styles.cardCount} style={{color: card.color}}>{card.count}</div>
                </div>
              ))
            )}
        </section>

        {/* --- 2. Trend Chart (Line) --- */}
        <section className={styles.sectionCard}>
           <div className={styles.sectionHeader}>
              <div>
                 <h2 className={styles.sectionTitle}>
                    <TrendingUp color="#3b82f6" size={20} /> แนวโน้มเรื่องร้องเรียน
                 </h2>
                 <p className={styles.sectionSubtitle}>ยอดรับเรื่องย้อนหลัง 7 วัน</p>
              </div>
              <div className={styles.legendContainer}>
                 <div className={styles.legendItem}><div className={styles.dot} style={{background: '#3b82f6'}}></div> ทั้งหมด</div>
                 <div className={styles.legendItem}><div className={styles.dot} style={{background: '#ef4444'}}></div> รอรับเรื่อง</div>
              </div>
           </div>
           <div className={styles.trendChartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                        cursor={{ stroke: '#cbd5e1', strokeWidth: 2 }}
                    />
                    <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, fill: '#fff', strokeWidth: 2}} activeDot={{r: 6}} name="ทั้งหมด" />
                    <Line type="monotone" dataKey="pending" stroke="#ef4444" strokeWidth={3} dot={false} activeDot={{r: 6}} name="รอรับเรื่อง" />
                 </LineChart>
              </ResponsiveContainer>
           </div>
        </section>

        {/* --- 3. Middle Grid (2 Columns) --- */}
        <div className={styles.responsiveGrid2}>
           
           {/* Efficiency (Bar) */}
           <section className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                 <div>
                    <h2 className={styles.sectionTitle}>
                        <Clock color="#f97316" size={20} /> ประสิทธิภาพการดำเนินงาน
                    </h2>
                    <p className={styles.sectionSubtitle}>เวลาเฉลี่ยในแต่ละขั้นตอน (ชั่วโมง)</p>
                 </div>
              </div>
              <div className={styles.chartContainer}>
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={efficiencyData} layout="vertical" margin={{ left: 0, right: 10 }}>
                       <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                       <XAxis type="number" hide />
                       {/* width=90 เพื่อให้ข้อความแกน Y มีพื้นที่แสดงผล */}
                       <YAxis dataKey="id" type="category" width={100} tick={{fontSize: 12, fill: '#475569'}} axisLine={false} tickLine={false} tickFormatter={formatYAxisLabel} />
                       <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px'}} />
                       <Legend wrapperStyle={{paddingTop: '10px', fontSize: '12px'}} />
                       <Bar dataKey="stage1" stackId="a" fill="#fca5a5" name="รับเรื่อง" maxBarSize={24} radius={[4,0,0,4]} />
                       <Bar dataKey="stage2" stackId="a" fill="#c084fc" name="ประสานงาน" maxBarSize={24} />
                       <Bar dataKey="stage3" stackId="a" fill="#fde047" name="แก้ไข" maxBarSize={24} radius={[0,4,4,0]} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </section>

           {/* Problem Type (Composed) */}
           <section className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                 <div>
                    <h2 className={styles.sectionTitle}>
                        <Activity color="#6366f1" size={20} /> ประเภทปัญหา vs เวลา
                    </h2>
                    <p className={styles.sectionSubtitle}>จำนวนเรื่องเทียบกับเวลาแก้ไขเฉลี่ย</p>
                 </div>
              </div>
              <div className={styles.chartContainer}>
                 {problemTypeData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                       <ComposedChart data={problemTypeData.slice(0, 6)} layout="vertical" margin={{ left: 10, right: 10 }}>
                          <CartesianGrid stroke="#f1f5f9" vertical={true} horizontal={true} />
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" width={110} tick={{fontSize: 12, fill: '#475569'}} axisLine={false} tickLine={false} tickFormatter={formatYAxisLabel} />
                          <Tooltip contentStyle={{borderRadius: '8px'}} />
                          <Legend wrapperStyle={{paddingTop: '10px', fontSize: '12px'}} />
                          {/* maxBarSize ช่วยให้แท่งกราฟใหญ่ขึ้น */}
                          <Bar dataKey="count" name="จำนวนเรื่อง" fill="#3b82f6" maxBarSize={20} radius={[0,4,4,0]} barSize={20} />
                          <Bar dataKey="avgTime" name="เวลาเฉลี่ย (ชม.)" fill="#f97316" maxBarSize={10} radius={[0,4,4,0]} barSize={10} />
                       </ComposedChart>
                    </ResponsiveContainer>
                 ) : <div className={styles.emptyState}>ไม่มีข้อมูล</div>}
              </div>
           </section>

        </div>

        {/* --- 4. Bottom Grid (2 Columns) --- */}
        <div className={styles.responsiveGrid2}>

            {/* Satisfaction */}
            <section className={styles.sectionCard}>
               <div className={styles.sectionHeader}>
                   <h2 className={styles.sectionTitle}><Star color="#eab308" size={20} /> ความพึงพอใจ (CSAT)</h2>
               </div>
               {satisfactionData ? (
                  <div className={styles.satisfactionContent}>
                     <div className={styles.satisfactionOverview}>
                        <div style={{textAlign: 'center'}}>
                           <div className={styles.scoreBig}>{satisfactionData.overall_average.toFixed(1)}</div>
                           <div style={{color: '#eab308', fontSize: '14px', fontWeight: 'bold'}}>
                             {'★'.repeat(Math.round(satisfactionData.overall_average))}
                           </div>
                        </div>
                        <div className={styles.totalReviewLabel}>
                           <div style={{fontSize: '20px', fontWeight: 'bold', color: '#475569'}}>{satisfactionData.total_count}</div>
                           <div style={{color: '#94a3b8', fontSize: '12px'}}>ผู้ประเมิน</div>
                        </div>
                     </div>
                     
                     <div className={styles.satisfactionBreakdown}>
                        {[5, 4, 3, 2, 1].map((star) => {
                           const item = satisfactionData.breakdown.find(b => b.score === star);
                           const count = item ? item.count : 0;
                           const percent = satisfactionData.total_count > 0 ? (count / satisfactionData.total_count) * 100 : 0;
                           return (
                              <div key={star} className={styles.starRow}>
                                 <span className={styles.starLabel}>{star} <span style={{fontSize:'10px'}}>★</span></span>
                                 <div className={styles.progressTrack}>
                                    <div className={styles.progressBar} style={{width: `${percent}%`, backgroundColor: star >= 4 ? '#facc15' : '#cbd5e1'}}></div>
                                 </div>
                                 <span className={styles.starPercent}>{Math.round(percent)}%</span>
                              </div>
                           );
                        })}
                     </div>
                  </div>
               ) : <div className={styles.emptyState}>ไม่มีข้อมูล</div>}
            </section>

            {/* Staff Performance (Dynamic Height) */}
            <section className={styles.sectionCard}>
               <div className={styles.sectionHeader}>
                   <div>
                     <h2 className={styles.sectionTitle}><Users color="#10b981" size={20} /> ประสิทธิภาพเจ้าหน้าที่</h2>
                     <p className={styles.sectionSubtitle}>Top 10 ผลงานสูงสุด</p>
                   </div>
               </div>
               
               <div className={styles.staffChartContainer} style={{ height: `${calculateStaffChartHeight()}px` }}>
                  {staffData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart layout="vertical" data={staffData} margin={{ left: 0, right: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 500, fill: '#334155'}} />
                          <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px' }} />
                          {/* Loop สร้าง Bar ตาม Status */}
                          {Object.keys(STATUS_COLORS).slice(0, 5).map((status) => (
                             <Bar key={status} dataKey={status} stackId="staff" fill={STATUS_COLORS[status]} maxBarSize={24} radius={[0,0,0,0]} />
                          ))}
                       </BarChart>
                    </ResponsiveContainer>
                  ) : <div className={styles.emptyState}>ไม่มีข้อมูลกิจกรรมเจ้าหน้าที่</div>}
               </div>
            </section>

        </div>
      </main>
    </div>
  );
};

export default StatisticsView;
