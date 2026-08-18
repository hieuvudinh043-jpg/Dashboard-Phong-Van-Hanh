"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DynamicTable({ title, data, currentWeek }) {
  const router = useRouter();
  const [localData, setLocalData] = useState(data || []);
  const [hasChanges, setHasChanges] = useState(false);

  // Cập nhật lại localData nếu data từ server thay đổi (sau khi save thành công)
  useEffect(() => {
    setLocalData(data || []);
    setHasChanges(false);
  }, [data]);

  // Lắng nghe sự kiện Save từ Header
  useEffect(() => {
    const handleSave = async () => {
      if (!hasChanges) {
        // Nếu không có thay đổi, vẫn báo done để Header tắt loading
        window.dispatchEvent(new Event('save-dashboard-done'));
        return;
      }
      
      try {
        await fetch('/api/data', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sheetName: title, week: currentWeek, bulkData: localData })
        });
        setHasChanges(false);
        window.dispatchEvent(new Event('save-dashboard-done'));
        router.refresh();
      } catch (error) {
        alert('Lỗi lưu dữ liệu: ' + error.message);
        window.dispatchEvent(new Event('save-dashboard-done'));
      }
    };

    window.addEventListener('save-dashboard-data', handleSave);
    return () => window.removeEventListener('save-dashboard-data', handleSave);
  }, [localData, hasChanges, title, currentWeek, router]);

  if (!data || data.length === 0) {
    return null;
  }

  const headers = Object.keys(data[0]);

  const handleAdd = () => {
    const initData = {};
    headers.forEach(h => initData[h] = '');
    setLocalData([initData, ...localData]);
    setHasChanges(true);
  };

  const handleDelete = (idx) => {
    if (!confirm('Bạn có chắc chắn muốn xóa dòng này khỏi giao diện? (Cần nhấn Lưu để áp dụng)')) return;
    const newData = [...localData];
    newData.splice(idx, 1);
    setLocalData(newData);
    setHasChanges(true);
  };

  const handleCellChange = (rIdx, header, value) => {
    const newData = [...localData];
    newData[rIdx] = { ...newData[rIdx], [header]: value };
    setLocalData(newData);
    setHasChanges(true);
  };

  const renderStatus = (text, rIdx, header) => {
    let bgColor = 'rgba(0, 144, 231, 0.2)';
    let color = '#0090e7';
    const textLower = text.toLowerCase();
    
    if (textLower.includes('đang thực hiện')) {
      bgColor = 'rgba(255, 171, 0, 0.2)';
      color = '#ffab00';
    } else if (textLower.includes('chưa')) {
      bgColor = 'rgba(252, 66, 74, 0.2)';
      color = '#fc424a';
    } else if (textLower.includes('theo dõi')) {
      bgColor = 'rgba(0, 210, 91, 0.2)';
      color = '#00d25b';
    } else if (textLower.includes('hoàn thành')) {
      bgColor = 'rgba(0, 210, 91, 0.2)';
      color = '#00d25b';
    } else if (textLower.includes('pending')) {
      bgColor = 'rgba(156, 163, 175, 0.2)'; // Màu xám cho Pending
      color = '#9ca3af';
    }

    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', padding: '0 8px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '600', backgroundColor: bgColor, color: color, cursor: 'pointer', position: 'relative', width: '100%' }}>
        <select 
          value={text}
          onChange={(e) => handleCellChange(rIdx, header, e.target.value)}
          style={{ 
            background: 'transparent', 
            border: 'none', 
            color: 'inherit', 
            outline: 'none', 
            fontWeight: 'inherit', 
            fontSize: 'inherit', 
            padding: '6px 16px 6px 4px', 
            appearance: 'none', 
            cursor: 'pointer',
            width: '100%',
            whiteSpace: 'normal',
            wordWrap: 'break-word'
          }}
        >
          {!['Chưa thực hiện', 'Đang thực hiện', 'Theo dõi', 'Pending', 'Hoàn thành'].includes(text) && text !== '' && (
             <option value={text} style={{background: '#191c24', color: '#fff'}}>{text}</option>
          )}
          <option value="" style={{background: '#191c24', color: '#fff'}} disabled hidden>Chọn trạng thái</option>
          <option value="Chưa thực hiện" style={{background: '#191c24', color: '#fc424a'}}>Chưa thực hiện</option>
          <option value="Đang thực hiện" style={{background: '#191c24', color: '#ffab00'}}>Đang thực hiện</option>
          <option value="Theo dõi" style={{background: '#191c24', color: '#00d25b'}}>Theo dõi</option>
          <option value="Pending" style={{background: '#191c24', color: '#9ca3af'}}>Pending</option>
          <option value="Hoàn thành" style={{background: '#191c24', color: '#00d25b'}}>Hoàn thành</option>
        </select>
        <span style={{ fontSize: '0.6rem', position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>▼</span>
      </div>
    );
  };

  return (
    <>
      <div style={{ background: 'var(--bg-secondary)', borderRadius: '16px', overflow: 'hidden', marginBottom: '1.5rem' }}>
        {/* Table Header Area */}
      <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: 'var(--text-primary)', fontSize: '1.2rem' }}>📄</span>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)' }}>Danh sách {title}</h2>
          <span className="badge">{localData.length} mục</span>
          {hasChanges && <span style={{ color: '#ffab00', fontSize: '0.8rem', fontWeight: '600' }}>* Đã chỉnh sửa (Nhấn Lưu để áp dụng)</span>}
        </div>
        <button onClick={handleAdd} className="btn-primary" style={{ padding: '8px 16px' }}>+ Thêm dòng</button>
      </div>

      {/* Table Content */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#000000', color: 'var(--text-primary)' }}>
              {headers.map((header, idx) => {
                const lowerHeader = header.toLowerCase().trim();
                const isSTT = lowerHeader === 'stt';
                const isShrinkCol = lowerHeader === 'wbs' || (isSTT && !title.toLowerCase().includes('clear'));
                const isStatusCol = lowerHeader.includes('trạng thái') || lowerHeader.includes('tình trạng');
                const isDateCol = lowerHeader.includes('deadline') || lowerHeader.includes('hạn') || lowerHeader.includes('ngày');
                const isExpandCol = lowerHeader.includes('ghi chú') || lowerHeader.includes('kết quả') || lowerHeader.includes('nội dung');
                
                let colWidth = 'auto';
                let minWidth = 'auto';
                if (isShrinkCol) {
                  colWidth = '1%';
                } else if (isExpandCol) {
                  colWidth = '25%';
                  minWidth = '200px';
                } else if (isStatusCol || isDateCol) {
                  colWidth = '160px';
                  minWidth = '160px';
                }
                
                return (
                  <th key={idx} style={{ padding: '16px 12px', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px', width: colWidth, minWidth: minWidth, whiteSpace: isShrinkCol ? 'nowrap' : 'normal', border: '1px solid var(--glass-border)' }}>
                    {header}
                  </th>
                )
              })}
              <th style={{ padding: '16px 12px', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px', textAlign: 'center', width: '60px', border: '1px solid var(--glass-border)' }}>
                Xóa
              </th>
            </tr>
          </thead>
          <tbody>
            {localData.map((row, rIdx) => (
              <tr key={rIdx} style={{ backgroundColor: rIdx % 2 === 0 ? 'var(--bg-secondary)' : '#12141a' }}>
                {headers.map((header, cIdx) => {
                  const val = String(row[header] || '');
                  const lowerHeader = header.toLowerCase().trim();
                  const isStatusCol = lowerHeader.includes('trạng thái') || lowerHeader.includes('tình trạng');
                  const isDateCol = lowerHeader.includes('deadline') || lowerHeader.includes('hạn') || lowerHeader.includes('ngày');
                  const isSTT = lowerHeader === 'stt';
                  const isShrinkCol = lowerHeader === 'wbs' || (isSTT && !title.toLowerCase().includes('clear'));
                  const isExpandCol = lowerHeader.includes('ghi chú') || lowerHeader.includes('kết quả') || lowerHeader.includes('nội dung');
                  
                  let colWidth = 'auto';
                  let minWidth = 'auto';
                  if (isShrinkCol) {
                    colWidth = '1%';
                  } else if (isExpandCol) {
                    colWidth = '25%';
                    minWidth = '200px';
                  } else if (isStatusCol || isDateCol) {
                    colWidth = '160px';
                    minWidth = '160px';
                  }

                  // Helper format ngày cho input date
                  const formatDateForInput = (dateStr) => {
                    if (!dateStr) return '';
                    // Nếu đã là YYYY-MM-DD
                    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
                    // Nếu là DD/MM/YYYY
                    const parts = dateStr.split('/');
                    if (parts.length === 3) return `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`;
                    return ''; // Fallback
                  };

                  const formatDateForDisplay = (dateStr) => {
                    if (!dateStr) return '';
                    const parts = dateStr.split('-');
                    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
                    return dateStr;
                  };

                  return (
                    <td key={cIdx} style={{ padding: '16px 12px', color: 'var(--text-primary)', verticalAlign: 'middle', maxWidth: '300px', width: colWidth, minWidth: minWidth, whiteSpace: isShrinkCol ? 'nowrap' : 'normal', border: '1px solid var(--glass-border)' }}>
                      {isStatusCol ? renderStatus(val, rIdx, header) : isDateCol ? (
                        <div style={{ position: 'relative' }}>
                          <input 
                            type="date"
                            value={formatDateForInput(val)}
                            onChange={(e) => {
                              const d = e.target.value;
                              handleCellChange(rIdx, header, d ? formatDateForDisplay(d) : '');
                            }}
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', width: '100%', fontSize: '0.85rem' }}
                          />
                        </div>
                      ) : (
                        <div 
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            e.target.style.border = '1px solid transparent';
                            handleCellChange(rIdx, header, e.currentTarget.innerText);
                          }}
                          onFocus={(e) => e.target.style.border = '1px solid var(--accent-primary)'}
                          style={{
                            width: isShrinkCol ? 'auto' : '100%',
                            minWidth: isShrinkCol ? 'auto' : '100px',
                            background: 'transparent',
                            border: '1px solid transparent',
                            color: 'inherit',
                            fontSize: 'inherit',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            outline: 'none',
                            transition: 'border 0.2s',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            lineHeight: '1.5'
                          }}
                        >
                          {val}
                        </div>
                      )}
                    </td>
                  )
                })}
                <td style={{ padding: '16px 12px', textAlign: 'center', verticalAlign: 'middle', border: '1px solid var(--glass-border)' }}>
                  <button onClick={() => handleDelete(rIdx)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--glass-border)', backgroundColor: 'transparent', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseOver={(e) => {e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.borderColor = 'var(--danger)'}}
                    onMouseOut={(e) => {e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--glass-border)'}}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
      
      {/* Ghi chú chung dời xuống dưới */}
      <div style={{ background: 'var(--bg-secondary)', borderRadius: '16px', padding: '1.5rem', marginTop: '1.5rem' }}>
        <h4 style={{ color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '24px', height: '24px', background: 'rgba(255, 171, 0, 0.2)', color: '#ffab00', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⚠️</span> Ghi chú chung
        </h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Click trực tiếp vào chữ trong bảng để sửa. Sau khi sửa xong, nhấn nút Lưu trên thanh tiêu đề để áp dụng toàn bộ thay đổi.
        </p>
      </div>
    </>
  );
}
