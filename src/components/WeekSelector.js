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

  return (
    <div style={{ padding: '4px 12px', borderRadius: '20px', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: '600', display: 'flex', gap: '8px', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
      <span>🕒</span>
      <span>Kỳ báo cáo:</span>
      <select 
        value={currentWeek} 
        onChange={handleWeekChange}
        disabled={loading}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--text-primary)',
          fontWeight: '700',
          outline: 'none',
          cursor: 'pointer'
        }}
      >
        {weeks.map((w, idx) => (
          <option key={idx} value={w} style={{ background: 'var(--bg-secondary)', color: '#fff' }}>
            {w}
          </option>
        ))}
      </select>
      
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
