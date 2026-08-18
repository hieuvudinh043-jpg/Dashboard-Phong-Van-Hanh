"use client";
import React from 'react';

export default function Operations({ operations = [] }) {
  return (
    <div className="glass-card animate-fade-in" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', fontWeight: '600', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>⚙️</span> Vận hành
      </h3>
      
      {(!operations || operations.length === 0) ? (
        <div style={{ flex: 1, border: '2px dashed var(--glass-border)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
          Hệ thống đang hoạt động ổn định.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, overflowY: 'auto' }}>
          {operations.map((op, idx) => (
            <div key={idx} style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                width: '40px', height: '40px', borderRadius: '50%', 
                background: op.status === 'Lỗi' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                color: op.status === 'Lỗi' ? 'var(--danger)' : 'var(--success)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem'
              }}>
                {op.status === 'Lỗi' ? '❌' : '✅'}
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontWeight: '500', marginBottom: '2px' }}>{op.name}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{op.description}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block' }}>Người trực</span>
                <span style={{ fontWeight: '500' }}>{op.assignee}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
