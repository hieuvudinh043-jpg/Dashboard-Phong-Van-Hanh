"use client";
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function WeekSelector({ initialWeeks, currentWeek }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [weeks, setWeeks] = useState(initialWeeks || []);
  const [loading, setLoading] = useState(false);

  const handleWeekChange = (e) => {
    const selected = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    params.set('week', selected);
    router.push(`/?${params.toString()}`);
  };

  const handleAddWeek = async () => {
    const newWeekName = prompt('Nhập tên tuần báo cáo mới (VD: Tuần 36):');
    if (!newWeekName || !newWeekName.trim()) return;

    if (weeks.includes(newWeekName.trim())) {
      alert('Tuần này đã tồn tại!');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/weeks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ week: newWeekName.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setWeeks(data.weeks);
        const params = new URLSearchParams(searchParams.toString());
        params.set('week', newWeekName.trim());
        router.push(`/?${params.toString()}`);
      } else {
        alert('Lỗi: ' + data.error);
      }
    } catch (err) {
      alert('Lỗi kết nối: ' + err.message);
    }
    setLoading(false);
  };

  const getWeekDateRange = (weekStr) => {
    if (!weekStr) return '';
    const match = weekStr.match(/\d+/);
    if (!match) return '';
    const weekNum = parseInt(match[0], 10);
    const year = new Date().getFullYear();
    
    const d = new Date(year, 0, 1);
    const dayNum = d.getDay() || 7;
    d.setDate(d.getDate() + (4 - dayNum) + (weekNum - 1) * 7);
    
    const start = new Date(d);
    start.setDate(start.getDate() - 3);
    const end = new Date(d);
    end.setDate(end.getDate() + 3);
    
    if (start.getMonth() === end.getMonth()) {
      return `(${start.getDate()}-${end.getDate()}/${start.getMonth() + 1})`;
    } else {
      return `(${start.getDate()}/${start.getMonth() + 1} - ${end.getDate()}/${end.getMonth() + 1})`;
    }
  };

  return (
    <div style={{ padding: '8px 12px', borderRadius: '16px', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', display: 'flex', gap: '12px', alignItems: 'center', background: 'var(--bg-secondary)', justifyContent: 'center' }}>
      <span style={{ fontSize: '1.2rem', color: '#8f5fe8' }}>🕒</span>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <select 
            value={currentWeek} 
            onChange={handleWeekChange}
            disabled={loading}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              fontWeight: '700',
              outline: 'none',
              cursor: 'pointer',
              padding: '0 4px 0 0',
              appearance: 'none',
              textAlign: 'center'
            }}
          >
            {weeks.map(w => (
              <option key={w} value={w} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>{w}</option>
            ))}
          </select>
          <span style={{ fontSize: '0.7rem', pointerEvents: 'none' }}>▼</span>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px', fontWeight: '500', whiteSpace: 'nowrap' }}>
          {getWeekDateRange(currentWeek)}
        </span>
      </div>

      <button 
        onClick={handleAddWeek}
        disabled={loading}
        title="Thêm tuần báo cáo mới"
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--accent-primary)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          marginLeft: '4px',
          fontSize: '1rem'
        }}
      >
        {loading ? '⏳' : '⊕'}
      </button>
    </div>
  );
}
