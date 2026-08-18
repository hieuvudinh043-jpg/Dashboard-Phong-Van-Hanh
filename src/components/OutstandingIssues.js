"use client";
import React from 'react';

export default function OutstandingIssues({ issues = [] }) {
  if (!issues || issues.length === 0) {
    return (
      <div className="glass-card animate-fade-in" style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', fontWeight: '600', color: 'var(--danger)' }}>🚨 Vấn đề tồn đọng</h3>
        <div style={{ flex: 1, border: '2px dashed rgba(239, 68, 68, 0.3)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.05)' }}>
          Không có vấn đề tồn đọng nghiêm trọng nào
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card animate-fade-in" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', fontWeight: '600', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>🚨</span> Vấn đề tồn đọng
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, overflowY: 'auto' }}>
        {issues.map((issue, idx) => (
          <div key={idx} style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid var(--danger)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h4 style={{ fontWeight: '600', marginBottom: '4px' }}>{issue.title || "Vấn đề chưa rõ tên"}</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{issue.description || "Chưa có mô tả chi tiết."}</p>
            </div>
            <span style={{ fontSize: '0.8rem', padding: '4px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', whiteSpace: 'nowrap' }}>
              Người xử lý: {issue.assignee || "N/A"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
