"use client";
import React from 'react';

export default function NormalProjects({ projects = [] }) {
  return (
    <div className="glass-card animate-fade-in" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>📂</span> Dự án thông thường
        </h3>
        <span style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '16px', fontSize: '0.9rem' }}>
          Tổng: {projects.length}
        </span>
      </div>
      
      {(!projects || projects.length === 0) ? (
        <div style={{ flex: 1, border: '2px dashed var(--glass-border)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
          Không có dự án thông thường
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px 8px', fontWeight: '500' }}>Tên dự án</th>
                <th style={{ padding: '12px 8px', fontWeight: '500' }}>Người phụ trách</th>
                <th style={{ padding: '12px 8px', fontWeight: '500' }}>Thời hạn</th>
                <th style={{ padding: '12px 8px', fontWeight: '500', textAlign: 'center' }}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((proj, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px 8px', fontWeight: '500' }}>{proj.name}</td>
                  <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>{proj.lead}</td>
                  <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>{proj.deadline}</td>
                  <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '12px', 
                      fontSize: '0.8rem',
                      background: proj.status === 'Đã xong' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                      color: proj.status === 'Đã xong' ? 'var(--success)' : 'var(--accent-primary)'
                    }}>
                      {proj.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
