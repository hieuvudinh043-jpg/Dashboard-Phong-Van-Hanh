"use client";

export default function Header() {
  return (
    <header className="glass-panel" style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '16px' }}>
      <div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.2rem', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Dashboard Giao Ban Phòng
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Theo dõi và quản lý hiệu suất theo thời gian thực</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <select className="glass-card" style={{ padding: '0.8rem 1.2rem', color: 'white', border: '1px solid var(--glass-border)', outline: 'none', cursor: 'pointer', appearance: 'none', minWidth: '150px' }}>
          <option value="latest">Hôm nay (18/08)</option>
          <option value="yesterday">Hôm qua (17/08)</option>
        </select>
        
        <button className="btn-primary" onClick={() => alert('Đang đồng bộ dữ liệu từ Google Sheet...')}>
          🔄 Đồng bộ dữ liệu
        </button>
      </div>
    </header>
  );
}
