"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import WeekSelector from './WeekSelector';

export default function Sidebar({ activeTab = 'vande', activeSheet = '', groupedSheets = {}, currentWeek = '', weeks = [] }) {
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [sheetUrl, setSheetUrl] = useState('');

  // Lấy link hiện tại
  useEffect(() => {
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

  const handleSync = async () => {
    setSyncing(true);
    try {
      await fetch(`/api/sync?force=true&week=${encodeURIComponent(currentWeek)}`);
      router.refresh(); // Tải lại dữ liệu mới nhất
    } catch (error) {
      console.error("Lỗi đồng bộ:", error);
    } finally {
      setSyncing(false);
    }
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
      height: '100vh', 
      position: 'sticky', 
      top: 0, 
      overflowY: 'auto',
      background: 'var(--bg-secondary)',
      borderRight: 'none'
    }}>
      <div style={{ padding: '2rem 1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <h3 style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '1px', marginBottom: '4px' }}>Hệ thống báo cáo</h3>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)' }}>Phòng Vận hành</h2>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <div key={tab.id}>
                <Link 
                  href={`/?tab=${tab.id}${tab.sheets.length > 0 ? `&sheet=${encodeURIComponent(tab.sheets[0])}` : ''}`} 
                  style={{ 
                    padding: '12px 16px', 
                    borderRadius: '12px', 
                    backgroundColor: isActive ? '#000000' : 'transparent',
                    color: isActive ? '#ffffff' : 'var(--text-secondary)',
                    fontWeight: isActive ? '700' : '500', 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'var(--transition-fast)' 
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
                            color: isSheetActive ? '#ffffff' : 'var(--text-secondary)',
                            backgroundColor: isSheetActive ? '#000000' : 'transparent',
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

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.5rem', backgroundColor: '#000000', borderRadius: '16px' }}>
          <WeekSelector initialWeeks={weeks} currentWeek={currentWeek} />
          <button 
            className="btn-primary" 
            style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
            onClick={handleSync}
            disabled={syncing}
          >
            {syncing ? '⏳ Đang đồng bộ...' : '🔄 Đồng bộ dữ liệu'}
          </button>
          
          <button 
            className="btn-secondary" 
            style={{ width: '100%', justifyContent: 'center', padding: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
            onClick={() => { window.location.href = '/api/export'; }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.borderColor = 'var(--text-secondary)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
          >
            📥 Xuất Excel (Tất cả)
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
      </div>
    </aside>
  );
}
