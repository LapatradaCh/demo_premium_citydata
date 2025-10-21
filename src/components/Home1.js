import React, { useState } from 'react';
import { Search, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Home1.css';
const agencies = [
  { id: 1, name: "หน่วยงานราชการ A", img: "https://placehold.co/100x100/A0AEC0/ffffff?text=A" },
  { id: 2, name: "หน่วยงานราชการ B", img: "https://placehold.co/100x100/F59E0B/ffffff?text=B" },
  { id: 3, name: "หน่วยงานราชการ C", img: "https://placehold.co/100x100/10B981/ffffff?text=C" },
  { id: 4, name: "หน่วยงานราชการ D", img: "https://placehold.co/100x100/3B82F6/ffffff?text=D" },
  { id: 5, name: "หน่วยงานราชการ E", img: "https://placehold.co/100x100/EC4899/ffffff?text=E" },
  { id: 6, name: "หน่วยงานราชการ F", img: "https://placehold.co/100x100/F87171/ffffff?text=F" },
  { id: 7, name: "หน่วยงานราชการ G", img: "https://placehold.co/100x100/8B5CF6/ffffff?text=G" },
  { id: 8, name: "หน่วยงานราชการ H", img: "https://placehold.co/100x100/22D3EE/ffffff?text=H" },
  { id: 9, name: "หน่วยงานราชการ I", img: "https://placehold.co/100x100/FACC15/ffffff?text=I" },
  { id: 10, name: "หน่วยงานราชการ J", img: "https://placehold.co/100x100/EC4899/ffffff?text=J" },
  { id: 11, name: "หน่วยงานราชการ K", img: "https://placehold.co/100x100/3B82F6/ffffff?text=K" },
  { id: 12, name: "หน่วยงานราชการ L", img: "https://placehold.co/100x100/10B981/ffffff?text=L" },
];

const Home1 = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredAgencies, setFilteredAgencies] = useState(agencies);
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  const handleSearch = () => {
    const filtered = agencies.filter((agency) =>
      agency.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAgencies(filtered);
  };

  const handleAgencyClick = () => {
    navigate('/home');
  };

  return (
    <div className="app-body">
      {/* Logout Button */}
      <div className="logout-icon">
        <button onClick={handleLogout}>
          <LogOut size={18} />
          <span>ออกจากระบบ</span> {/* ข้อความไม่เลื่อน */}
        </button>
      </div>

      {/* Header */}
      <h1 className="title">เลือกหน่วยงานที่คุณต้องการ</h1>

      {/* Search Box */}
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="ค้นหาหน่วยงาน..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button className="search-button" onClick={handleSearch}>
          <Search size={18} />
        </button>
      </div>

      {/* Agency Grid */}
      <div className="agency-section">
        <div className="agency-grid">
          {filteredAgencies.map((agency) => (
            <div
              key={agency.id}
              className="agency-item"
              onClick={handleAgencyClick}
            >
              <div className="agency-img">
                <img
                  src={agency.img}
                  alt={agency.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://placehold.co/100x100/A0AEC0/ffffff?text=${agency.name.charAt(0)}`;
                  }}
                />
              </div>
              <div className="agency-name">{agency.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home1;
