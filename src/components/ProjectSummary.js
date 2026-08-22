"use client";
import React, { useState, useEffect } from 'react';

export default function ProjectSummary({ data, projectName, currentWeek }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [overrideData, setOverrideData] = useState(null);

  // States for Edit Mode
  const [editProgress, setEditProgress] = useState(0);
  const [editHealth, setEditHealth] = useState('Tốt');
  const [editHealthNote, setEditHealthNote] = useState('');
  const [editMilestones, setEditMilestones] = useState([]);
  const [editCompleted, setEditCompleted] = useState('');
  const [editNext, setEditNext] = useState('');
  const [editRisks, setEditRisks] = useState('');

  // 1. Phân tích dữ liệu tự động
  let totalProgress = 0;
  let countProgress = 0;
  const autoMilestones = [];
  const autoCompletedTasks = [];
  const autoNextTasks = [];
  const autoRisks = [];

  if (data && data.length > 0) {
    data.forEach(row => {
      const taskName = String(row['Tên Hạng Mục / Công Việc'] || row['Tên Hạng Mục'] || row['Công việc'] || row['Mục tiêu'] || '').trim();
      if (!taskName) return;

      const progressRaw = row['% Hoàn thành'] !== undefined ? row['% Hoàn thành'] : row['Tiến độ tổng thể'];
      const status = String(row['Trạng thái'] || row['Tình trạng'] || '').trim().toLowerCase();
      const milestoneMark = String(row['Mốc quan trọng'] || '').trim().toLowerCase();
      const reason = String(row['Lí do (nếu fail)'] || row['Vấn đề / rủi ro đang gặp'] || '').trim();
      const solution = String(row['Phương án'] || row['Kế hoạch tiếp theo'] || '').trim();
      const deadline = String(row['Ngày kết thúc'] || '').trim();

      let progressVal = parseFloat(progressRaw);
      if (!isNaN(progressVal)) {
        if (progressVal <= 1) progressVal = progressVal * 100;
        totalProgress += progressVal;
        countProgress++;
      }

      if (milestoneMark.includes('milestone') || milestoneMark.includes('mốc')) {
        if (!autoMilestones.some(m => m.name === taskName)) {
          autoMilestones.push({ name: taskName, date: deadline, status });
        }
      }

      if (status.includes('hoàn thành') || status === 'done') {
        if (!autoCompletedTasks.includes(taskName)) {
          autoCompletedTasks.push(taskName);
        }
      } else if (status.includes('đang') || status.includes('chưa') || status === 'todo' || status === 'in progress') {
        if (!autoNextTasks.includes(taskName)) {
          autoNextTasks.push(taskName);
        }
      }

      if (reason) {
        if (!autoRisks.some(r => r.reason === reason)) {
          autoRisks.push({ task: taskName, reason, solution });
        }
      }
    });
  }

  const autoProgress = countProgress > 0 ? Math.round(totalProgress / countProgress) : 0;
  
  let autoHealth = 'Tốt';
  if (autoRisks.length > 0) autoHealth = 'Có rủi ro';
  if (autoProgress < 20 && autoNextTasks.length > 5) autoHealth = 'Trễ tiến độ';

  // 2. Fetch overrides
  useEffect(() => {
    if (!currentWeek || !projectName) return;
    fetch(`/api/summary?week=${encodeURIComponent(currentWeek)}&project=${encodeURIComponent(projectName)}&t=${Date.now()}`)
      .then(res => res.json())
      .then(res => {
        if (res.success && res.override) setOverrideData(res.override);
        else setOverrideData(null);
      })
      .catch(e => console.error(e));
  }, [currentWeek, projectName]);

  const displayProgress = overrideData?.progress !== undefined ? overrideData.progress : autoProgress;
  const displayHealth = overrideData?.health || autoHealth;
  const displayHealthNote = overrideData?.healthNote || '';
  const displayMilestones = overrideData?.milestones || autoMilestones;
  
  const displayCompleted = overrideData?.completed !== undefined 
    ? overrideData.completed 
    : (autoCompletedTasks.length > 0 ? autoCompletedTasks.map(t => `✔ ${t}`).join('\n') : 'Chưa có task hoàn thành.');
    
  const displayNext = overrideData?.next !== undefined 
    ? overrideData.next 
    : (autoNextTasks.length > 0 ? autoNextTasks.map(t => `• ${t}`).join('\n') : 'Không có task mới.');
    
  const displayRisks = overrideData?.risks !== undefined 
    ? overrideData.risks 
    : (autoRisks.length > 0 ? autoRisks.map(r => `Vấn đề: ${r.reason}${r.solution ? `\nPhương án: ${r.solution}` : ''}`).join('\n\n') : '');

  let healthColor = '#4caf50';
  let healthBg = '#e8f5e9';
  if (displayHealth === 'Có rủi ro') { healthColor = '#f57c00'; healthBg = '#fff3e0'; }
  if (displayHealth === 'Trễ tiến độ') { healthColor = '#d32f2f'; healthBg = '#ffebee'; }

  // 4. Handlers
  const handleEditClick = () => {
    setEditProgress(displayProgress);
    setEditHealth(displayHealth);
    setEditHealthNote(displayHealthNote);
    setEditMilestones([...displayMilestones]);
    setEditCompleted(displayCompleted);
    setEditNext(displayNext);
    setEditRisks(displayRisks);
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    setIsSaving(true);
    const newOverride = {
      progress: editProgress,
      health: editHealth,
      healthNote: editHealthNote,
      milestones: editMilestones,
      completed: editCompleted,
      next: editNext,
      risks: editRisks
    };
    
    try {
      const res = await fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          week: currentWeek,
          project: projectName,
          overrideData: newOverride
        })
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Lỗi không xác định từ server');
      }
      
      setOverrideData(newOverride);
      setIsEditing(false);
    } catch (e) {
      alert("Lỗi khi lưu!");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const handleGlobalSave = async () => {
      if (isEditing) {
        await handleSaveClick();
      }
    };
    window.addEventListener('save-dashboard-data', handleGlobalSave);
    return () => window.removeEventListener('save-dashboard-data', handleGlobalSave);
  }, [isEditing, editProgress, editHealth, editHealthNote, editMilestones, editCompleted, editNext, editRisks, currentWeek, projectName]);

  const handleCancel = () => setIsEditing(false);

  const addMilestone = () => {
    setEditMilestones([...editMilestones, { name: '', date: '', status: 'chưa thực hiện' }]);
  };
  
  const updateMilestone = (idx, field, val) => {
    const newM = [...editMilestones];
    newM[idx] = { ...newM[idx], [field]: val };
    setEditMilestones(newM);
  };
  
  const removeMilestone = (idx) => {
    const newM = [...editMilestones];
    newM.splice(idx, 1);
    setEditMilestones(newM);
  };

  if (!data || data.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '1rem', position: 'relative' }}>
      
      {!isEditing ? (
        <button onClick={handleEditClick} className="btn-secondary" style={{ position: 'absolute', top: '-20px', right: '0', zIndex: 10, padding: '6px 12px', fontSize: '0.85rem' }}>
          ✏️ Chỉnh sửa Tổng quan
        </button>
      ) : (
        <div style={{ display: 'flex', gap: '12px', position: 'absolute', top: '-20px', right: '0', zIndex: 10 }}>
          <button onClick={handleCancel} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>❌ Hủy</button>
          <button onClick={handleSaveClick} className="btn-primary" disabled={isSaving} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
            {isSaving ? '⏳ Đang lưu...' : '💾 Lưu thay đổi'}
          </button>
        </div>
      )}

      {/* Top Bar: Tiến độ & Tình hình */}
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginTop: isEditing ? '24px' : '0' }}>
        {/* Progress Card */}
        <div style={{ flex: '2 1 400px', background: 'var(--bg-secondary)', borderRadius: '16px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)' }}>Tổng tiến độ dự án</h3>
            {isEditing ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input type="number" min="0" max="100" value={editProgress} onChange={e => setEditProgress(Number(e.target.value))} style={{ width: '70px', padding: '6px', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                <span style={{ color: 'var(--text-primary)' }}>%</span>
              </div>
            ) : (
              <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--success)' }}>{displayProgress}%</span>
            )}
          </div>
          <div style={{ width: '100%', height: '12px', background: 'var(--bg-primary)', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{ width: `${isEditing ? editProgress : displayProgress}%`, height: '100%', background: 'var(--success)', borderRadius: '6px', transition: 'width 0.3s ease-in-out' }}></div>
          </div>
        </div>
        
        {/* Status Card */}
        <div style={{ flex: '1 1 200px', background: 'var(--bg-secondary)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tình hình chung</h3>
          
          {isEditing ? (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <select value={editHealth} onChange={e => setEditHealth(e.target.value)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', width: '100%' }}>
                <option value="Tốt">Tốt</option>
                <option value="Có rủi ro">Có rủi ro</option>
                <option value="Trễ tiến độ">Trễ tiến độ</option>
              </select>
              <textarea 
                placeholder="Ghi chú thêm về tình hình..." 
                value={editHealthNote} 
                onChange={e => setEditHealthNote(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '60px', resize: 'vertical' }}
              />
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <span style={{ padding: '8px 24px', borderRadius: '24px', backgroundColor: healthBg, color: healthColor, fontWeight: '700', fontSize: '1.1rem', display: 'inline-block', marginBottom: displayHealthNote ? '8px' : '0' }}>
                {displayHealth}
              </span>
              {displayHealthNote && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px', whiteSpace: 'pre-wrap' }}>{displayHealthNote}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Grid 3 Cột */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* Cột 1: Milestones */}
        <div style={{ background: 'var(--bg-secondary)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '32px', height: '32px', background: 'rgba(143, 95, 232, 0.2)', color: '#8f5fe8', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🚩</span>
              Thanh Milestones
            </h3>
            {isEditing && (
              <button onClick={addMilestone} style={{ background: 'none', border: 'none', color: '#8f5fe8', cursor: 'pointer', fontWeight: 'bold' }}>+ Thêm</button>
            )}
          </div>

          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {editMilestones.map((m, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--bg-primary)', padding: '12px', borderRadius: '8px', position: 'relative', border: '1px solid var(--glass-border)' }}>
                  <button onClick={() => removeMilestone(idx)} style={{ position: 'absolute', top: '8px', right: '8px', background: 'none', border: 'none', color: '#fc424a', cursor: 'pointer' }}>✖</button>
                  <input placeholder="Tên Milestone" value={m.name} onChange={e => updateMilestone(idx, 'name', e.target.value)} style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-primary)', width: '90%' }} />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input placeholder="Deadline" value={m.date} onChange={e => updateMilestone(idx, 'date', e.target.value)} style={{ flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-primary)' }} />
                    <select value={m.status} onChange={e => updateMilestone(idx, 'status', e.target.value)} style={{ flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-primary)' }}>
                      <option value="chưa thực hiện">Chưa làm</option>
                      <option value="đang thực hiện">Đang làm</option>
                      <option value="hoàn thành">Hoàn thành</option>
                    </select>
                  </div>
                </div>
              ))}
              {editMilestones.length === 0 && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Chưa có milestone.</p>}
            </div>
          ) : (
            displayMilestones.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
                <div style={{ position: 'absolute', left: '11px', top: '8px', bottom: '8px', width: '2px', background: '#2c2e33', zIndex: 0 }}></div>
                {displayMilestones.map((m, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '16px', position: 'relative', zIndex: 1 }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: m.status.includes('hoàn thành') ? '#8f5fe8' : 'var(--bg-primary)', border: '2px solid #8f5fe8', flexShrink: 0 }}></div>
                    <div>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '2px' }}>{m.name}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{m.date || 'Chưa rõ deadline'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>Chưa ghi nhận milestone nào.</p>
            )
          )}
        </div>

        {/* Cột 2: Tasks */}
        <div style={{ background: 'var(--bg-secondary)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ color: 'var(--text-primary)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <span style={{ width: '32px', height: '32px', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✅</span> 
                Đã hoàn thành tuần này
              </h4>
              {isEditing && (
                <button 
                  onClick={() => {
                    const lines = editCompleted.split('\n');
                    const unique = Array.from(new Set(lines.map(l => l.trim()))).filter(Boolean);
                    setEditCompleted(unique.join('\n'));
                  }}
                  style={{ background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer' }}
                  title="Lọc các dòng bị trùng lặp"
                >
                  🧹 Lọc trùng
                </button>
              )}
            </div>
            {isEditing ? (
              <textarea 
                value={editCompleted} 
                onChange={e => setEditCompleted(e.target.value)} 
                style={{ width: '100%', minHeight: '80px', padding: '8px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', resize: 'vertical' }}
              />
            ) : (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                {displayCompleted}
              </div>
            )}
          </div>
          
          <div style={{ marginTop: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <span style={{ width: '32px', height: '32px', background: 'rgba(255, 171, 0, 0.2)', color: '#ffab00', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⏳</span>
                Sẽ làm tuần tiếp theo
              </h3>
              {isEditing && (
                <button 
                  onClick={() => {
                    const lines = editNext.split('\n');
                    const unique = Array.from(new Set(lines.map(l => l.trim()))).filter(Boolean);
                    setEditNext(unique.join('\n'));
                  }}
                  style={{ background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer' }}
                  title="Lọc các dòng bị trùng lặp"
                >
                  🧹 Lọc trùng
                </button>
              )}
            </div>
            {isEditing ? (
              <textarea 
                value={editNext} 
                onChange={e => setEditNext(e.target.value)} 
                style={{ width: '100%', minHeight: '80px', padding: '8px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', resize: 'vertical' }}
              />
            ) : (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                {displayNext}
              </div>
            )}
          </div>
        </div>

        {/* Cột 3: Rủi ro */}
        <div style={{ background: 'var(--bg-secondary)', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '32px', height: '32px', background: 'rgba(252, 66, 74, 0.2)', color: '#fc424a', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⚠️</span>
            Rủi ro có thể xảy ra
          </h3>
          {isEditing ? (
            <textarea 
              value={editRisks} 
              onChange={e => setEditRisks(e.target.value)} 
              placeholder="Nhập nội dung rủi ro..."
              style={{ width: '100%', minHeight: '150px', padding: '8px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', resize: 'vertical' }}
            />
          ) : (
            displayRisks ? (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                {displayRisks}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100px', opacity: 0.6 }}>
                <span style={{ fontSize: '2rem', marginBottom: '8px' }}>🛡️</span>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Mọi thứ đang trong tầm kiểm soát</p>
              </div>
            )
          )}
        </div>

      </div>
    </div>
  );
}
