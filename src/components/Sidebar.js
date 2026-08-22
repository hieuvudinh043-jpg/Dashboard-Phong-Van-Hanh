"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import WeekSelector from './WeekSelector';

export default function Sidebar({ activeTab = 'vande', activeSheet = '', groupedSheets = {}, currentWeek = '', weeks = [] }) {
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [sheetUrl, setSheetUrl] = useState('');
  const [theme, setTheme] = useState('dark');
  const [autoSync, setAutoSync] = useState(true);

  // Auto-sync effect (5 minutes)
  useEffect(() => {
    let interval;
    if (autoSync) {
      interval = setInterval(() => {
        handleSync(true); // Silent sync
      }, 5 * 60 * 1000);
    }
    return () => clearInterval(interval);
  }, [autoSync, currentWeek]);

  // Lấy link hiện tại và theme
  useEffect(() => {
    // Khôi phục theme từ localStorage
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    fetch('/api/settings').then(res => res.json()).then(data => {
      if (data.success && data.settings?.sheetUrl) {
        setSheetUrl(data.settings.sheetUrl);
      }
    });
  }, []);

  const handleChangeLink = async () => {
    const newLink = prompt("Nhập đường dẫn Google Sheet mới:\\n(Ví dụ: https://docs.google.com/spreadsheets/d/.../edit)", sheetUrl);
    if (newLink && newLink !== sheetUrl) {
      if (!newLink.includes('docs.google.com/spreadsheets')) {
        alert("Link không hợp lệ! Vui lòng nhập đúng đường dẫn Google Sheet.");
        return;
      }
      try {
        const res = await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sheetUrl: newLink })
        });
        const data = await res.json();
        if (data.success) {
          setSheetUrl(newLink);
          alert("Đã cập nhật Nguồn dữ liệu thành công!\\nVui lòng nhấn nút 'Đồng bộ dữ liệu' để tải dữ liệu mới về hệ thống.");
        } else {
          alert("Lỗi: " + data.error);
        }
      } catch (e) {
        alert("Lỗi kết nối khi lưu cài đặt!");
      }
    }
  };

  const handleSync = async (isAuto = false) => {
    if (!isAuto) setSyncing(true);
    try {
      await fetch(`/api/sync?force=true&week=${encodeURIComponent(currentWeek)}`);
      router.refresh(); // Tải lại dữ liệu mới nhất
    } catch (error) {
      console.error("Lỗi đồng bộ:", error);
    } finally {
      if (!isAuto) setSyncing(false);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const tabs = [
    { id: 'vande', name: 'Vấn đề tồn đọng', icon: '📄', color: '#fca5a5', sheets: groupedSheets.vande || [] },
    { id: 'duantrongdiem', name: 'Dự án trọng điểm', icon: '🎯', color: '#c084fc', sheets: groupedSheets.duantrongdiem || [] },
    { id: 'duanthuong', name: 'Dự án thường', icon: '📋', color: '#60a5fa', sheets: groupedSheets.duanthuong || [] },
    { id: 'vanhanh', name: 'Vận hành', icon: '⚙️', color: '#fcd34d', sheets: groupedSheets.vanhanh || [] },
  ];

  return (
    <aside className="glass-panel" style={{ 
      width: '280px', 
      minWidth: '280px', 
      flexShrink: 0, 
      display: 'flex', 
      flexDirection: 'column', 
      padding: '0', 
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 100,
      background: 'var(--bg-secondary, #191c24)',
      overflowY: 'auto',
      borderRight: '1px solid var(--glass-border)',
      boxShadow: '4px 0 15px rgba(0,0,0,0.05)'
    }}>
      {/* Tiêu đề Tool - Sticky */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: 'linear-gradient(135deg, var(--accent-secondary) 0%, #8f5fe8 100%)',
        padding: '1.5rem',
        borderBottom: '1px solid var(--glass-border)',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
      }}>
        <h1 style={{ 
          fontSize: '1.25rem', 
          fontWeight: '900', 
          margin: 0,
          color: '#ffffff',
          lineHeight: '1.3',
          textShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
          DASHBOARD<br/>PHÒNG VẬN HÀNH
        </h1>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.5rem', flex: 1 }}>
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <div key={tab.id}>
                <Link 
                  href={`/?tab=${tab.id}`} 
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', 
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    backgroundColor: isActive ? 'var(--bg-primary)' : 'transparent',
                    fontWeight: isActive ? '600' : '500',
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{ 
                    width: '32px', height: '32px', 
                    background: `rgba(${tab.id === 'vande' ? '252,66,74' : tab.id === 'duantrongdiem' ? '143,95,232' : tab.id === 'duanthuong' ? '0,144,231' : '255,171,0'}, 0.2)`, 
                    color: tab.color, 
                    borderRadius: '8px', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center' 
                  }}>{tab.icon}</span> 
                  <span>{tab.name}</span> {isActive && <span style={{marginLeft: 'auto', color: 'var(--text-secondary)'}}>▾</span>}
                </Link>
                
                {/* Sub-menu cho các sheet con */}
                {isActive && tab.sheets.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '56px', marginTop: '4px' }}>
                    {tab.sheets.map(sheetName => {
                      const isSheetActive = activeSheet === sheetName || (activeSheet === '' && tab.sheets[0] === sheetName);
                      return (
                        <Link 
                          key={sheetName}
                          href={`/?tab=${tab.id}&sheet=${encodeURIComponent(sheetName)}`}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            color: isSheetActive ? (theme === 'light' ? '#000' : '#fff') : 'var(--text-secondary)',
                            backgroundColor: isSheetActive ? 'var(--bg-primary)' : 'transparent',
                            fontWeight: isSheetActive ? '600' : '400',
                          }}
                        >
                          {sheetName}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.5rem', margin: '0 1.5rem 1.5rem 1.5rem', backgroundColor: 'var(--bg-primary)', borderRadius: '16px' }}>
          
          <button 
            className="btn-secondary" 
            style={{ width: '100%', justifyContent: 'center', padding: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s', marginBottom: '4px' }}
            onClick={toggleTheme}
          >
            {theme === 'dark' ? '☀️ Giao diện Sáng' : '🌙 Giao diện Tối'}
          </button>

          <WeekSelector initialWeeks={weeks} currentWeek={currentWeek} />
          <button 
            className="btn-primary" 
            style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
            onClick={() => handleSync(false)}
            disabled={syncing}
          >
            {syncing ? '⏳ Đang đồng bộ...' : '🔄 Đồng bộ dữ liệu'}
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', marginTop: '-4px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Tự động đồng bộ (5p)</span>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '4px' }}>
              <input 
                type="checkbox" 
                checked={autoSync} 
                onChange={(e) => setAutoSync(e.target.checked)} 
                style={{ cursor: 'pointer' }}
              />
              <span style={{ color: autoSync ? '#00e665' : 'var(--text-secondary)', fontWeight: autoSync ? 'bold' : 'normal' }}>
                {autoSync ? 'Bật' : 'Tắt'}
              </span>
            </label>
          </div>
          
          <button 
            className="btn-secondary" 
            style={{ width: '100%', justifyContent: 'center', padding: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
            onClick={() => { window.location.href = '/api/export'; }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.borderColor = 'var(--text-secondary)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
          >
            📊 Xuất Excel
          </button>
          
          {/* Nguồn dữ liệu Google Sheets */}
          <div style={{ marginTop: '8px', paddingTop: '16px', borderTop: '1px solid var(--glass-border)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: 'bold' }}>
              🔗 Nguồn Dữ Liệu
            </div>
            
            <div 
              style={{ fontSize: '12px', color: 'var(--text-primary)', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '4px', wordBreak: 'break-all', marginBottom: '8px', border: '1px solid var(--glass-border)' }}
              title={sheetUrl}
            >
              {sheetUrl.length > 40 ? sheetUrl.substring(0, 37) + '...' : sheetUrl || 'Đang tải...'}
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => { navigator.clipboard.writeText(sheetUrl); alert("Đã copy link!"); }}
                style={{ flex: 1, padding: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', borderRadius: '4px', cursor: 'pointer' }}
              >
                📋 Copy
              </button>
              <button 
                onClick={handleChangeLink}
                style={{ flex: 1, padding: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', borderRadius: '4px', cursor: 'pointer' }}
              >
                ✏️ Thay đổi
              </button>
            </div>
          </div>
        </div>
    </aside>
  );
}
