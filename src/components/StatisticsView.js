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

const StatisticsView = ({ organizationId }) => {
  // --- State ---
  const [statsData, setStatsData] = useState(null);
  const [trendData, setTrendData] = useState([]); 
  const [staffData, setStaffData] = useState([]);
  const [totalStaffCount, setTotalStaffCount] = useState(0); 
  const [satisfactionData, setSatisfactionData] = useState(null);
  const [efficiencyData, setEfficiencyData] = useState([]);
  const [problemTypeData, setProblemTypeData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ฟังก์ชันโหลดข้อมูลจำลอง (Mock Data)
    const loadMockData = () => {
        
        // 1. ข้อมูลการ์ดด้านบน
        setStatsData({
          'รอรับเรื่อง': 2,
          'กำลังประสานงาน': 3,
          'กำลังดำเนินการ': 5,
          'เสร็จสิ้น': 10,
          'ส่งต่อ': 1,
          'เชิญร่วม': 0,
          'ปฏิเสธ': 1
        });

        // 2. ข้อมูลกราฟเส้น (Trend)
        setTrendData([
          { date: '15/11', total: 4, pending: 1, coordinating: 3, completed: 0 },
          { date: '16/11', total: 6, pending: 2, coordinating: 2, completed: 2 },
          { date: '17/11', total: 5, pending: 1, coordinating: 3, completed: 1 }, 
          { date: '18/11', total: 8, pending: 3, coordinating: 4, completed: 1 }, 
          { date: '19/11', total: 3, pending: 0, coordinating: 2, completed: 1 },
          { date: '20/11', total: 7, pending: 2, coordinating: 3, completed: 2 },
          { date: '21/11', total: 5, pending: 2, coordinating: 1, completed: 2 },
        ]);

        // 3. ข้อมูลกราฟแท่งแนวนอน (Efficiency)
        setEfficiencyData([
            { id: 'Ticket-001', stage1: 0.5, stage2: 2, stage3: 24, total: 26.5, type: 'ไฟฟ้า' },
            { id: 'Ticket-002', stage1: 1.0, stage2: 4, stage3: 12, total: 17.0, type: 'ต้นไม้' },
            { id: 'Ticket-003', stage1: 0.2, stage2: 1, stage3: 48, total: 49.2, type: 'ถนน' },
            { id: 'Ticket-004', stage1: 0.8, stage2: 5, stage3: 10, total: 15.8, type: 'ประปา' },
            { id: 'Ticket-005', stage1: 0.5, stage2: 3, stage3: 20, total: 23.5, type: 'ขยะ' },
        ]);

        // 4. ข้อมูลเจ้าหน้าที่ (Staff)
        setStaffData([
          { name: 'สมชาย ใจดี', 'รอรับเรื่อง': 1, 'เสร็จสิ้น': 5, 'กำลังดำเนินการ': 2, total: 8 },
          { name: 'วิภา รักดี', 'กำลังดำเนินการ': 3, 'เสร็จสิ้น': 2, total: 5 },
          { name: 'อำนาจ มั่นคง', 'กำลังประสานงาน': 4, total: 4 },
          { name: 'กานดา มีสุข', 'รอรับเรื่อง': 2, total: 2 }
        ]);
        setTotalStaffCount(12);

        // 5. ข้อมูลความพึงพอใจ (Satisfaction)
        setSatisfactionData({ 
            overall_average: 4.35, 
            total_count: 100, 
            breakdown: [
                {score: 5, count: 41}, 
                {score: 4, count: 53}, 
                {score: 3, count: 6},
                {score: 2, count: 0},
                {score: 1, count: 0}
            ] 
        });

        // 6. ข้อมูลประเภทปัญหา (Types)
        setProblemTypeData([
            {name: 'ไฟฟ้า', count: 10, avgTime: 20}, 
            {name: 'ถนน', count: 8, avgTime: 15},
            {name: 'น้ำประปา', count: 5, avgTime: 45},
            {name: 'ขยะ', count: 3, avgTime: 10},
            {name: 'จราจร', count: 2, avgTime: 5}
        ]);
        
        setLoading(false);
    };

    const fetchData = async () => {
      const accessToken = localStorage.getItem('accessToken');
      
      // ใช้ Mock Data เสมอเพื่อทดสอบการแสดงผล
      if (!accessToken || !organizationId || true) { 
        setTimeout(() => {
            loadMockData();
        }, 500);
        return;
      }
    };

    fetchData();
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
            <h1 className={styles.headerTitle}>Dashboard ภาพรวม</h1>
            <p className={styles.headerSubtitle}>
              {new Date().toLocaleDateString("th-TH", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • ข้อมูลปัจจุบัน
            </p>
         </div>
      </header>

      <main>
        {loading && !statsData ? (
           <div className={styles.emptyState} style={{ marginTop: '50px' }}>
              <p>กำลังโหลดข้อมูล...</p>
           </div>
        ) : (
          <>
            {/* 1. Status Cards Grid */}
            <section className={styles.responsiveGrid4}>
                {statusCardConfig.map((card, idx) => {
                const percent = getPercent(card.count, getTotalCases());
                return (
                    <div 
                    key={idx} 
                    className={styles.statusCard}
                    style={{
                        backgroundColor: card.bg,
                        borderColor: card.border,
                        borderTopColor: card.color
                    }}
                    >
                    <div className={styles.cardHeader}>
                        <span className={styles.cardTitle} title={card.title}>{card.title}</span>
                        <span className={styles.cardPercentBadge}>{percent.toFixed(0)}%</span>
                    </div>
                    <div className={styles.cardCount} style={{color: card.color}}>
                        {card.count}
                    </div>
                    </div>
                );
                })}
            </section>

            {/* 2. Trend Chart Section (FIXED HEIGHT) */}
            <div style={{ marginTop: '24px' }}>
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
                {/* *** สำคัญ: ใส่ style height และ width ตรงนี้เพื่อให้กราฟขึ้น *** */}
                <div className={styles.trendChartContainer} style={{ height: '300px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                        <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} name="เรื่องทั้งหมด" />
                        <Line type="monotone" dataKey="pending" stroke="#f87171" strokeWidth={2} dot={{r: 3}} name="รอรับเรื่อง" />
                        <Line type="monotone" dataKey="coordinating" stroke="#c084fc" strokeWidth={2} dot={{r: 3}} name="กำลังประสานงาน" />
                    </LineChart>
                    </ResponsiveContainer>
                </div>
                </section>
            </div>

            <div className={styles.responsiveGrid2} style={{ marginTop: '24px' }}>
            
            {/* 3. Efficiency Bar Chart */}
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
                {/* *** ใส่ Height ตรงนี้ *** */}
                <div className={styles.chartContainer} style={{ height: '300px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={efficiencyData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="id" type="category" width={70} axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#6b7280'}} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{fontSize: '12px', borderRadius: '8px'}} />
                    <Legend iconType="circle" wrapperStyle={{fontSize: '11px', paddingTop: '10px'}} />
                    <Bar dataKey="stage1" stackId="a" fill="#fca5a5" name="รอรับเรื่อง" barSize={12} radius={[0, 0, 0, 0]} />
                    <Bar dataKey="stage2" stackId="a" fill="#d8b4fe" name="ประสานงาน" barSize={12} radius={[0, 0, 0, 0]} />
                    <Bar dataKey="stage3" stackId="a" fill="#fde047" name="ดำเนินการ" barSize={12} radius={[0, 4, 4, 0]} />
                    </BarChart>
                </ResponsiveContainer>
                </div>
            </section>

            {/* 4. Problem Type Composed Chart */}
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
                {/* *** ใส่ Height ตรงนี้ *** */}
                <div className={styles.chartContainer} style={{ height: '300px', width: '100%' }}>
                {problemTypeData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={problemTypeData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid stroke="#f3f4f6" vertical={true} horizontal={true} />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={70} axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#4b5563'}} />
                        <Tooltip contentStyle={{fontSize: '12px', borderRadius: '8px'}} />
                        <Legend wrapperStyle={{fontSize: '11px'}} />
                        <Bar dataKey="count" name="จำนวน (เรื่อง)" barSize={10} fill="#3b82f6" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="avgTime" name="เวลาเฉลี่ย (ชม.)" barSize={10} fill="#f97316" radius={[0, 4, 4, 0]} />
                    </ComposedChart>
                    </ResponsiveContainer>
                ) : (
                    <p className={styles.emptyState}>ไม่มีข้อมูล</p>
                )}
                </div>
            </section>

            </div>

            <div className={styles.responsiveGrid2} style={{ marginTop: '24px' }}>
                
                {/* 5. Satisfaction Section */}
                <section className={styles.sectionCard}>
                    <div className={styles.sectionHeader}>
                        <h3 className={styles.sectionTitle}>ความพึงพอใจ</h3>
                    </div>
                    <div className={styles.satisfactionContent}>
                        {satisfactionData ? (
                        <>
                            <div className={styles.satisfactionOverview}>
                                <span className={styles.scoreBig}>{satisfactionData.overall_average.toFixed(2)}</span>
                                <div style={{textAlign: 'center'}}>
                                    <div style={{color: '#facc15', fontSize: '20px', letterSpacing: '2px'}}>
                                        {'★'.repeat(Math.round(satisfactionData.overall_average))}
                                        <span style={{color: '#e2e8f0'}}>{'★'.repeat(5 - Math.round(satisfactionData.overall_average))}</span>
                                    </div>
                                    <div className={styles.totalReviewLabel} style={{fontSize: '12px', color: '#64748b', marginTop: '4px'}}>
                                        จาก {satisfactionData.total_count} ผู้ประเมิน
                                    </div>
                                </div>
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
                    </div>
                </section>

                {/* 6. Staff Activities Section */}
                <section className={styles.sectionCard}>
                    <div className={styles.sectionHeader}>
                        <h3 className={styles.sectionTitle}>อันดับประสิทธิภาพ</h3>
                        <div style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Users size={14} />
                            ทั้งหมด: {totalStaffCount} คน
                        </div>
                    </div>
                    {/* *** ใส่ Height ตรงนี้ *** */}
                    <div className={styles.staffChartContainer} style={{ height: '300px', width: '100%' }}>
                        {staffData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart 
                            layout="vertical" 
                            data={staffData} 
                            margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                            >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                            <XAxis type="number" hide />
                            <YAxis 
                                dataKey="name" 
                                type="category" 
                                width={90} 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fontSize: 11, fontWeight: 500, fill: '#374151'}} 
                            />
                            <Tooltip 
                                cursor={{fill: 'transparent'}}
                                contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                            />
                            {Object.keys(STATUS_COLORS).map((status) => (
                                <Bar 
                                key={status} 
                                dataKey={status} 
                                stackId="staff" 
                                fill={STATUS_COLORS[status]} 
                                barSize={15}
                                name={status}
                                />
                            ))}
                            <Legend iconType="circle" wrapperStyle={{fontSize: '10px', paddingTop: '10px'}} />
                            </BarChart>
                        </ResponsiveContainer>
                        ) : (
                            <div className={styles.emptyState}>ไม่มีข้อมูลกิจกรรมเจ้าหน้าที่</div>
                        )}
                    </div>
                </section>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default StatisticsView;
