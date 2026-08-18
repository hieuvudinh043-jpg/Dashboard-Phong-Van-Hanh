import React from 'react';

export default function ProjectSummary({ data, projectName }) {
  if (!data || data.length === 0) return null;

  // 1. Phân tích Tiến độ tổng thể
  let totalProgress = 0;
  let countProgress = 0;
  
  // 2. Phân tích các mảng dữ liệu
  const milestones = [];
  const completedTasks = [];
  const nextTasks = [];
  const risks = [];

  data.forEach(row => {
    // Trích xuất các trường với fallback an toàn
    const taskName = String(row['Tên Hạng Mục / Công Việc'] || row['Tên Hạng Mục'] || row['Công việc'] || row['Mục tiêu'] || '').trim();
    if (!taskName) return;

    const progressRaw = row['% Hoàn thành'] !== undefined ? row['% Hoàn thành'] : row['Tiến độ tổng thể'];
    const status = String(row['Trạng thái'] || row['Tình trạng'] || '').trim().toLowerCase();
    const milestoneMark = String(row['Mốc quan trọng'] || '').trim().toLowerCase();
    const reason = String(row['Lí do (nếu fail)'] || row['Vấn đề / rủi ro đang gặp'] || '').trim();
    const solution = String(row['Phương án'] || row['Kế hoạch tiếp theo'] || '').trim();
    const deadline = String(row['Ngày kết thúc'] || '').trim();

    // Tính tiến độ trung bình (Chỉ lấy các số hợp lệ)
    let progressVal = parseFloat(progressRaw);
    if (!isNaN(progressVal)) {
      // Nếu Google Sheet lưu định dạng % thì progressVal có thể là 0.8 (80%) hoặc 80.
      if (progressVal <= 1) progressVal = progressVal * 100;
      totalProgress += progressVal;
      countProgress++;
    }

    // Lọc Milestone
    if (milestoneMark.includes('milestone') || milestoneMark.includes('mốc')) {
      milestones.push({ name: taskName, date: deadline, status });
    }

    // Lọc công việc hoàn thành
    if (status.includes('hoàn thành') || status === 'done') {
      completedTasks.push(taskName);
    } 
    // Lọc công việc sắp tới / đang làm
    else if (status.includes('đang') || status.includes('chưa') || status === 'todo' || status === 'in progress') {
      nextTasks.push(taskName);
    }

    // Lọc Rủi ro
    if (reason) {
      risks.push({ task: taskName, reason, solution });
    }
  });

  const avgProgress = countProgress > 0 ? Math.round(totalProgress / countProgress) : 0;
  
  // Đánh giá tình hình chung
  let overallHealth = 'Tốt';
  let healthColor = '#4caf50';
  let healthBg = '#e8f5e9';
  if (risks.length > 0) {
    overallHealth = 'Có rủi ro';
    healthColor = '#f57c00';
    healthBg = '#fff3e0';
  }
  if (avgProgress < 20 && nextTasks.length > 5) {
    overallHealth = 'Trễ tiến độ';
    healthColor = '#d32f2f';
    healthBg = '#ffebee';
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '1rem' }}>
      
      {/* Top Bar: Tiến độ & Tình hình */}
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {/* Progress Card */}
        <div style={{ flex: '2 1 400px', background: 'var(--bg-secondary)', borderRadius: '16px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)' }}>Tổng tiến độ dự án</h3>
            <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--success)' }}>{avgProgress}%</span>
          </div>
          <div style={{ width: '100%', height: '12px', background: '#000000', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{ width: `${avgProgress}%`, height: '100%', background: 'var(--success)', borderRadius: '6px', transition: 'width 1s ease-in-out' }}></div>
          </div>
        </div>
        
        {/* Status Card */}
        <div style={{ flex: '1 1 200px', background: 'var(--bg-secondary)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tình hình chung</h3>
          <span style={{ padding: '8px 24px', borderRadius: '24px', backgroundColor: 'rgba(0, 210, 91, 0.2)', color: 'var(--success)', fontWeight: '700', fontSize: '1.1rem' }}>
            {overallHealth}
          </span>
        </div>
      </div>

      {/* Grid 3 Cột: Milestone - Task - Rủi ro */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* Cột 1: Milestones */}
        <div style={{ background: 'var(--bg-secondary)', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '32px', height: '32px', background: 'rgba(143, 95, 232, 0.2)', color: '#8f5fe8', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🚩</span>
            Thanh Milestones
          </h3>
          {milestones.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
              {/* Vertical line */}
              <div style={{ position: 'absolute', left: '11px', top: '8px', bottom: '8px', width: '2px', background: '#2c2e33', zIndex: 0 }}></div>
              {milestones.map((m, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '16px', position: 'relative', zIndex: 1 }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: m.status.includes('hoàn thành') ? '#8f5fe8' : '#000000', border: '2px solid #8f5fe8', flexShrink: 0 }}></div>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '2px' }}>{m.name}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{m.date || 'Chưa rõ deadline'}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>Chưa ghi nhận milestone nào.</p>
          )}
        </div>

        {/* Cột 2: Tasks */}
        <div style={{ background: 'var(--bg-secondary)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <h4 style={{ color: 'var(--text-primary)', fontSize: '1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '32px', height: '32px', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✅</span> 
              Đã hoàn thành tuần này
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {completedTasks.slice(0, 5).map((t, idx) => (
                <li key={idx} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <span style={{ color: '#10b981' }}>✔</span> {t}
                </li>
              ))}
              {completedTasks.length === 0 && <li style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Chưa có task hoàn thành.</li>}
            </ul>
          </div>
          
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '32px', height: '32px', background: 'rgba(255, 171, 0, 0.2)', color: '#ffab00', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⏳</span>
              Sẽ làm tuần tiếp theo
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {nextTasks.slice(0, 5).map((t, idx) => (
                <li key={idx} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <span style={{ color: '#ffab00' }}>•</span> {t}
                </li>
              ))}
              {nextTasks.length === 0 && <li style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Không có task mới.</li>}
            </ul>
          </div>
        </div>

        {/* Cột 3: Rủi ro */}
        <div style={{ background: 'var(--bg-secondary)', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '32px', height: '32px', background: 'rgba(252, 66, 74, 0.2)', color: '#fc424a', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⚠️</span>
            Rủi ro có thể xảy ra
          </h3>
          {risks.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {risks.map((r, idx) => (
                <div key={idx} style={{ padding: '12px', background: '#000000', borderRadius: '8px', borderLeft: '4px solid #fc424a' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>{r.task}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}><strong>Vấn đề:</strong> {r.reason}</p>
                  {r.solution && <p style={{ fontSize: '0.8rem', color: 'var(--success)' }}><strong>Phương án:</strong> {r.solution}</p>}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100px', opacity: 0.6 }}>
              <span style={{ fontSize: '2rem', marginBottom: '8px' }}>🛡️</span>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Mọi thứ đang trong tầm kiểm soát</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
