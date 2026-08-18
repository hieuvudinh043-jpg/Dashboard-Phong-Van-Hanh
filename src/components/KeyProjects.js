"use client";
import React from 'react';

export default function KeyProjects({ projects = [] }) {
  if (!projects || projects.length === 0) {
    return (
      <div className="glass-card animate-fade-in" style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', fontWeight: '600', color: 'var(--warning)' }}>⭐ Dự án trọng điểm</h3>
        <div style={{ flex: 1, border: '2px dashed rgba(245, 158, 11, 0.3)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warning)', background: 'rgba(245, 158, 11, 0.05)' }}>
          Chưa có dự án trọng điểm nào được ghi nhận
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card animate-fade-in" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', fontWeight: '600', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>⭐</span> Dự án trọng điểm
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem', flex: 1, alignContent: 'flex-start' }}>
        {projects.map((project, idx) => {
          const progress = project.progress || 0;
          return (
            <div key={idx} style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <h4 style={{ fontWeight: '600', fontSize: '1rem' }}>{project.name || "Dự án mới"}</h4>
                <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '12px', background: project.status === 'Delay' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)', color: project.status === 'Delay' ? 'var(--danger)' : 'var(--success)' }}>
                  {project.status || "On track"}
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>Phụ trách: {project.lead || "N/A"}</p>
              
              <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: 'var(--warning)', transition: 'width 1s ease-in-out' }}></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{progress}% hoàn thành</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
