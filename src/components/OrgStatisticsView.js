import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart2, 
  Star, 
  Clock, 
  Filter, 
  AlertCircle,
  CheckCircle, 
  PieChart,
  Layers, // ไอคอนสำหรับประเภทปัญหา
  Loader2 // ไอคอน Loading
} from 'lucide-react';

// ==========================================
// 1. CONFIGURATION & CONSTANTS
// ==========================================

const COLORS = {
  pending: "#EF4444",    // red-500
  inProgress: "#F59E0B", // amber-500
  completed: "#10B981",  // emerald-500
  forwarded: "#3B82F6",  // blue-500
  rejected: "#9CA3AF",   // gray-400
  invited: "#06B6D4"     // cyan-500
};

const LABELS = {
  pending: "รอรับเรื่อง",
  inProgress: "ดำเนินการ",
  completed: "เสร็จสิ้น",
  forwarded: "ส่งต่อ",
  rejected: "ปฏิเสธ",
  invited: "เชิญร่วม"
};

// ชุดสีสำหรับ Donut Chart (วนใช้กรณีประเภทปัญหาเยอะ)
const PROBLEM_COLORS_PALETTE = [
  "#3B82F6", // Blue
  "#F59E0B", // Amber
  "#10B981", // Emerald
  "#06B6D4", // Cyan
  "#EF4444", // Red
  "#8B5CF6", // Violet
  "#EC4899", // Pink
  "#6366F1", // Indigo
  "#9CA3AF"  // Gray
];

const TARGET_SLA_DAYS = 3.0; // เป้าหมาย KPI (วัน)
const USER_ORG_ID = 74;      // *** ID องค์กรตามจริง ***

// ==========================================
// 2. SUB-COMPONENTS
// ==========================================

// --- TAB 1: WORKLOAD (STACKED BAR) ---
const WorkloadView = ({ data }) => {
  const [sortBy, setSortBy] = useState('total'); // 'total' | 'pending'

  // Sorting Logic
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => b[sortBy] - a[sortBy]);
  }, [data, sortBy]);

  // Calculate Global Stats
  const globalStats = useMemo(() => {
    const total = data.reduce((acc, item) => acc + item.total, 0);
    const completed = data.reduce((acc, item) => acc + item.completed, 0);
    const pending = data.reduce((acc, item) => acc + item.pending, 0);
    const successRate = total > 0 ? (completed / total) * 100 : 0;
    return { total, completed, pending, successRate };
  }, [data]);

  if (data.length === 0) return <div className="text-center py-20 text-gray-400">ไม่พบข้อมูล</div>;

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Success Rate */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 opacity-90 mb-1">
              <CheckCircle size={18} />
              <span className="text-sm font-medium">อัตราความสำเร็จ</span>
            </div>
            <div className="text-3xl font-bold">{globalStats.successRate.toFixed(1)}%</div>
            <div className="text-xs opacity-80 mt-1">จากเรื่องร้องเรียนทั้งหมด</div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
        </div>

        {/* Total Volume */}
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-2 text-gray-500 mb-1 text-sm">
            <PieChart size={18} />
            <span>เรื่องร้องเรียนทั้งหมด</span>
          </div>
          <div className="text-3xl font-bold text-gray-800">{globalStats.total.toLocaleString()} <span className="text-sm font-normal text-gray-400">เรื่อง</span></div>
        </div>

        {/* Pending Warning */}
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col justify-center border-l-4 border-l-red-500">
          <div className="flex items-center gap-2 text-red-500 mb-1 text-sm">
            <AlertCircle size={18} />
            <span>รอรับเรื่อง (ค้าง)</span>
          </div>
          <div className="text-3xl font-bold text-gray-800">{globalStats.pending.toLocaleString()} <span className="text-sm font-normal text-gray-400">เรื่อง</span></div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Filter size={16} />
          <span>เรียงลำดับตาม:</span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setSortBy('total')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${sortBy === 'total' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-200'}`}
          >
            งานทั้งหมด
          </button>
          <button 
            onClick={() => setSortBy('pending')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${sortBy === 'pending' ? 'bg-red-500 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-200'}`}
          >
            งานค้าง (วิกฤต)
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="space-y-4">
        {sortedData.map((item) => {
          const itemSuccessRate = item.total > 0 ? (item.completed / item.total) * 100 : 0;
          
          return (
            <div key={item.id} className="group">
              <div className="flex justify-between mb-1 items-end">
                <span className="font-medium text-gray-700 text-sm">{item.name}</span>
                <div className="text-right">
                  <span className="text-xs font-semibold text-emerald-600 mr-2">
                    สำเร็จ {itemSuccessRate.toFixed(0)}%
                  </span>
                  <span className="text-gray-400 text-xs">| รวม {item.total}</span>
                </div>
              </div>
              
              <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden flex shadow-inner">
                {/* Segments */}
                {Object.keys(COLORS).map((key) => {
                  const val = item[key] || 0;
                  const width = item.total > 0 ? (val / item.total) * 100 : 0;
                  if (width <= 0) return null;
                  return (
                    <div 
                      key={key}
                      style={{ width: `${width}%`, backgroundColor: COLORS[key] }}
                      className="h-full first:pl-2 last:pr-2 flex items-center justify-center transition-all duration-500 hover:brightness-110 relative group/segment"
                      title={`${LABELS[key]}: ${val}`}
                    >
                       {/* Tooltip on Hover */}
                       <div className="hidden group-hover/segment:block absolute bottom-full mb-1 bg-gray-800 text-white text-[10px] px-2 py-1 rounded z-20 whitespace-nowrap">
                          {LABELS[key]}: {val}
                       </div>
                       {width > 8 && <span className="text-[10px] text-white font-bold drop-shadow-md pointer-events-none">{val}</span>}
                    </div>
                  );
                })}
              </div>

              {/* Warning if pending is high (>30%) */}
              {sortBy === 'pending' && item.total > 0 && (item.pending / item.total) > 0.3 && (
                <div className="mt-1 flex items-center gap-1 text-xs text-red-500 animate-pulse">
                  <AlertCircle size={12} />
                  <span>งานค้างสูงผิดปกติ ({((item.pending/item.total)*100).toFixed(0)}%)</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-8 pt-4 border-t border-gray-100">
        {Object.keys(COLORS).map(key => (
          <div key={key} className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[key] }}></span>
            {LABELS[key]}
          </div>
        ))}
      </div>
    </div>
  );
};

// --- TAB 2: SATISFACTION (RANKING LIST) ---
const SatisfactionView = ({ data }) => {
  const sortedData = useMemo(() => [...data].sort((a, b) => b.satisfaction - a.satisfaction), [data]);

  if (data.length === 0) return <div className="text-center py-20 text-gray-400">ไม่พบข้อมูล</div>;

  const getScoreColor = (score) => {
    if (score >= 4.5) return 'text-emerald-500 bg-emerald-50 border-emerald-100';
    if (score >= 3.0) return 'text-amber-500 bg-amber-50 border-amber-100';
    return 'text-red-500 bg-red-50 border-red-100';
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header Stat */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
          <div className="text-emerald-800 text-xs font-semibold uppercase tracking-wider">คะแนนสูงสุด</div>
          <div className="text-xl font-bold text-emerald-600 mt-1 truncate">{sortedData[0]?.name || '-'}</div>
          <div className="text-3xl font-bold text-emerald-500 mt-2">{sortedData[0]?.satisfaction.toFixed(1) || '0.0'} <span className="text-sm font-normal text-emerald-400">/ 5.0</span></div>
        </div>
        <div className="bg-red-50 p-4 rounded-xl border border-red-100">
          <div className="text-red-800 text-xs font-semibold uppercase tracking-wider">ต้องปรับปรุง</div>
          <div className="text-xl font-bold text-red-600 mt-1 truncate">{sortedData[sortedData.length - 1]?.name || '-'}</div>
          <div className="text-3xl font-bold text-red-500 mt-2">{sortedData[sortedData.length - 1]?.satisfaction.toFixed(1) || '0.0'} <span className="text-sm font-normal text-red-400">/ 5.0</span></div>
        </div>
      </div>

      {/* Ranking List */}
      <div className="space-y-3">
        {sortedData.map((item, index) => (
          <div key={item.id} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            
            {/* Rank Number */}
            <div className={`
              w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm flex-shrink-0
              ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                index === 1 ? 'bg-gray-100 text-gray-600' :
                index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-white text-gray-400 border border-gray-100'}
            `}>
              {index + 1}
            </div>

            {/* Name & Bar */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-1">
                <span className="font-semibold text-gray-800 truncate pr-2">{item.name}</span>
                <span className="text-xs text-gray-400 flex-shrink-0">({item.reviews} รีวิว)</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${item.satisfaction >= 4.0 ? 'bg-emerald-400' : item.satisfaction >= 3.0 ? 'bg-amber-400' : 'bg-red-400'}`} 
                  style={{ width: `${(item.satisfaction / 5) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Score Badge */}
            <div className={`px-3 py-1 rounded-lg border font-bold text-lg flex items-center gap-1 ${getScoreColor(item.satisfaction)}`}>
              {item.satisfaction.toFixed(1)}
              <Star size={14} className="fill-current" />
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

// --- TAB 3: EFFICIENCY (SLA CHART) ---
const EfficiencyView = ({ data }) => {
  // Sort น้อยไปมาก (เร็วไปช้า)
  const sortedData = useMemo(() => [...data].sort((a, b) => a.avgTime - b.avgTime), [data]);
  
  if (data.length === 0) return <div className="text-center py-20 text-gray-400">ไม่พบข้อมูล</div>;

  const maxVal = Math.max(...data.map(d => d.avgTime), TARGET_SLA_DAYS * 1.5);
  const globalAvg = (data.reduce((acc, curr) => acc + curr.avgTime, 0) / data.length) || 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Info */}
      <div className="flex justify-between items-center bg-blue-50 p-4 rounded-xl border border-blue-100 mb-2">
        <div>
          <h4 className="font-bold text-blue-900">เป้าหมาย SLA: ภายใน {TARGET_SLA_DAYS} วัน</h4>
          <p className="text-xs text-blue-600 mt-1">หากกราฟเกินเส้นประ แสดงว่าล่าช้ากว่ากำหนด</p>
        </div>
        <div className="text-right">
          <span className="block text-xs text-blue-600">เวลาเฉลี่ยรวมทุกเขต</span>
          <span className="font-bold text-2xl text-blue-800">{globalAvg.toFixed(1)} <span className="text-sm font-normal">วัน</span></span>
        </div>
      </div>

      <div className="relative pt-6 pb-2">
        {/* SLA Line */}
        <div 
          className="absolute top-0 bottom-0 border-l-2 border-dashed border-gray-400 z-10 flex flex-col justify-end pointer-events-none"
          style={{ left: `${(TARGET_SLA_DAYS / maxVal) * 100}%` }}
        >
          <span className="bg-gray-600 text-white text-[10px] px-1.5 py-0.5 rounded -ml-6 mb-full transform -translate-y-6 whitespace-nowrap">
            SLA {TARGET_SLA_DAYS} วัน
          </span>
        </div>

        {/* Bars */}
        <div className="space-y-5 relative z-0">
          {sortedData.map((item) => {
            const isOver = item.avgTime > TARGET_SLA_DAYS;
            const widthPct = (item.avgTime / maxVal) * 100;
            
            return (
              <div key={item.id} className="relative group">
                <div className="flex justify-between text-sm mb-1">
                  <span className={`font-medium ${isOver ? 'text-red-700' : 'text-gray-700'}`}>
                    {item.name}
                  </span>
                  <span className={`font-bold ${isOver ? 'text-red-600' : 'text-emerald-600'}`}>
                    {item.avgTime.toFixed(1)} วัน
                  </span>
                </div>

                <div className="h-8 bg-gray-100 rounded-r-md relative overflow-visible">
                  <div 
                    className={`h-full rounded-r-md flex items-center justify-end pr-2 transition-all duration-700 ease-out ${isOver ? 'bg-red-400' : 'bg-emerald-400'}`}
                    style={{ width: `${widthPct}%` }}
                  >
                    {isOver && <AlertCircle size={14} className="text-white opacity-80" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// --- TAB 4: PROBLEM TYPES (DONUT CHART) ---
const ProblemTypeView = ({ data }) => {
  if (data.length === 0) return <div className="text-center py-20 text-gray-400">ไม่พบข้อมูล</div>;

  const total = data.reduce((acc, item) => acc + item.count, 0);
  
  // Calculate SVG paths
  let cumulativePercent = 0;
  const donutData = data.map(item => {
    const percent = total > 0 ? item.count / total : 0;
    const startPercent = cumulativePercent;
    cumulativePercent += percent;
    return { ...item, percent, startPercent };
  });

  const getCoordinatesForPercent = (percent) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  return (
    <div className="animate-fadeIn">
      {/* Summary Header */}
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-8 flex justify-between items-center">
        <div>
          <h4 className="text-gray-600 text-sm font-medium">เรื่องร้องเรียนทั้งหมด</h4>
          <p className="text-3xl font-bold text-gray-800 mt-1">{total.toLocaleString()} <span className="text-sm font-normal text-gray-500">เรื่อง</span></p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 mb-1">ประเภทที่พบมากที่สุด</p>
          {data[0] && (
            <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-bold inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{backgroundColor: data[0].color}}></span>
              {data[0].name} ({((data[0].count/total)*100).toFixed(0)}%)
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
        
        {/* SVG Donut Chart */}
        <div className="relative w-64 h-64 flex-shrink-0">
          <svg viewBox="-1 -1 2 2" className="transform -rotate-90 w-full h-full">
            {donutData.map((item, index) => {
              if (item.percent === 1) {
                  return <circle key={item.id} cx="0" cy="0" r="1" fill={item.color} />;
              }
              const [startX, startY] = getCoordinatesForPercent(item.startPercent);
              const [endX, endY] = getCoordinatesForPercent(item.startPercent + item.percent);
              const largeArcFlag = item.percent > 0.5 ? 1 : 0;
              
              const pathData = [
                `M ${startX} ${startY}`,
                `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                `L 0 0`,
              ].join(' ');

              return (
                <path
                  key={item.id}
                  d={pathData}
                  fill={item.color}
                  stroke="white"
                  strokeWidth="0.02" 
                  className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                />
              );
            })}
            <circle cx="0" cy="0" r="0.65" fill="white" />
          </svg>
          
          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-bold text-gray-800">{data.length}</span>
            <span className="text-xs text-gray-500">ประเภท</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 w-full grid grid-cols-1 gap-3 max-h-[320px] overflow-y-auto pr-2">
          {donutData.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors group">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }}></span>
                <span className="text-gray-700 font-medium text-sm truncate max-w-[150px]">{item.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden hidden sm:block">
                  <div className="h-full rounded-full" style={{ width: `${item.percent * 100}%`, backgroundColor: item.color }}></div>
                </div>
                <span className="text-gray-900 font-bold w-12 text-right">{item.count}</span>
                <span className="text-gray-400 text-xs w-10 text-right">{(item.percent * 100).toFixed(0)}%</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};


// ==========================================
// 3. MAIN APP
// ==========================================

export default function OrganizationDashboard() {
  const [activeTab, setActiveTab] = useState('workload');
  const [orgStats, setOrgStats] = useState([]);
  const [problemTypeStats, setProblemTypeStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch Both APIs in parallel
        const [orgRes, probRes] = await Promise.all([
          fetch(`https://premium-citydata-api-ab.vercel.app/api/stats/org-stats?org_id=${USER_ORG_ID}`),
          fetch(`https://premium-citydata-api-ab.vercel.app/api/stats/org-count-issue-type?org_id=${USER_ORG_ID}`)
        ]);

        if (!orgRes.ok || !probRes.ok) {
            throw new Error('Failed to fetch data');
        }

        const orgData = await orgRes.json();
        const probData = await probRes.json();

        // Assign Colors to Problem Types
        const coloredProbData = Array.isArray(probData) ? probData.map((item, index) => ({
          ...item,
          color: PROBLEM_COLORS_PALETTE[index % PROBLEM_COLORS_PALETTE.length]
        })) : [];

        setOrgStats(Array.isArray(orgData) ? orgData : []);
        setProblemTypeStats(coloredProbData);

      } catch (err) {
        console.error("API Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-[400px] text-gray-400 animate-pulse">
          <Loader2 size={40} className="animate-spin mb-4 text-blue-500" />
          <p>กำลังโหลดข้อมูลสถิติ...</p>
        </div>
      );
    }

    if (error) {
       return (
        <div className="flex flex-col items-center justify-center h-[400px] text-red-400">
          <AlertCircle size={40} className="mb-4" />
          <p>เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
          >
            ลองใหม่
          </button>
        </div>
       );
    }

    switch (activeTab) {
      case 'workload': return <WorkloadView data={orgStats} />;
      case 'satisfaction': return <SatisfactionView data={orgStats} />;
      case 'efficiency': return <EfficiencyView data={orgStats} />;
      case 'problemType': return <ProblemTypeView data={problemTypeStats} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-10 hidden md:flex">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="w-2 h-6 bg-blue-600 rounded-sm"></span>
            สถิติองค์กร
          </h2>
          <p className="text-xs text-gray-400 mt-1 ml-4">Dashboard สำหรับผู้บริหาร</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('workload')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'workload' ? 'bg-blue-50 text-blue-700 shadow-sm font-medium' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <BarChart2 size={20} />
            <span>ปริมาณงาน</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('satisfaction')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'satisfaction' ? 'bg-yellow-50 text-yellow-700 shadow-sm font-medium' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <Star size={20} />
            <span>ความพึงพอใจ</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('efficiency')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'efficiency' ? 'bg-emerald-50 text-emerald-700 shadow-sm font-medium' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <Clock size={20} />
            <span>ประสิทธิภาพ (SLA)</span>
          </button>

          <button 
            onClick={() => setActiveTab('problemType')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'problemType' ? 'bg-purple-50 text-purple-700 shadow-sm font-medium' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <Layers size={20} />
            <span>ประเภทปัญหา</span>
          </button>
        </nav>

        <div className="p-4 border-t border-gray-100">
           <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500">
              <p>Organization ID: {USER_ORG_ID}</p>
              <p className="mt-1">ข้อมูล Real-time</p>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          
          {/* Mobile Header */}
          <div className="md:hidden mb-6 flex items-center justify-between">
            <h2 className="text-lg font-bold">สถิติองค์กร</h2>
            <div className="text-xs text-gray-400">ID: {USER_ORG_ID}</div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px]">
            {/* Header Content */}
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  {activeTab === 'workload' && "ภาพรวมปริมาณงานรายเขต"}
                  {activeTab === 'satisfaction' && "อันดับความพึงพอใจประชาชน"}
                  {activeTab === 'efficiency' && "ความรวดเร็วในการแก้ไขปัญหา (SLA)"}
                  {activeTab === 'problemType' && "สัดส่วนประเภทปัญหาในพื้นที่"}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {activeTab === 'problemType' ? 'ข้อมูลรวมจากทุกหน่วยงานภายในจังหวัด' : 'เปรียบเทียบข้อมูลระหว่างหน่วยงานลูกข่าย'}
                </p>
              </div>
              
              {/* Context Icon */}
              <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm text-gray-400">
                {activeTab === 'workload' && <BarChart2 size={20} />}
                {activeTab === 'satisfaction' && <Star size={20} />}
                {activeTab === 'efficiency' && <Clock size={20} />}
                {activeTab === 'problemType' && <Layers size={20} />}
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6">
              {renderContent()}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
