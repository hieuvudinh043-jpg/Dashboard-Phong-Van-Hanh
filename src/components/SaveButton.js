"use client";
import { useState, useEffect } from 'react';

export default function SaveButton() {
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    const handleSaveEnd = () => setSaving(false);
    window.addEventListener('save-dashboard-done', handleSaveEnd);
    return () => window.removeEventListener('save-dashboard-done', handleSaveEnd);
  }, []);

  const handleSave = () => {
    setSaving(true);
    // Timeout in case no table responds (e.g. empty page)
    setTimeout(() => setSaving(false), 3000); 
    window.dispatchEvent(new Event('save-dashboard-data'));
  };

  return (
    <button className="btn-primary" onClick={handleSave} disabled={saving}>
      {saving ? '⏳ Đang lưu...' : '💾 Lưu'}
    </button>
  );
}
