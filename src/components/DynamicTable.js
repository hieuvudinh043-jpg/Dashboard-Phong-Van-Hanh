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
        const res = await fetch('/api/data', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sheetName: title, week: currentWeek, bulkData: localData })
        });
        
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Lỗi không xác định từ server');
        }
        
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

  const headers = Object.keys(data[0]).filter(k => !k.startsWith('_'));

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
    
    let currentSpan = 1;
    if (localData[rIdx]._rowSpans && localData[rIdx]._rowSpans[header] !== undefined) {
       currentSpan = localData[rIdx]._rowSpans[header];
       if (currentSpan === 0) currentSpan = 1; // Fallback
    }

    for (let i = rIdx; i < rIdx + currentSpan; i++) {
      if (newData[i]) {
        newData[i] = { ...newData[i], [header]: value };
      }
    }
    
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
             <option value={text} style={{background: 'var(--bg-secondary)', color: 'var(--text-primary)'}}>{text}</option>
          )}
          <option value="" style={{background: 'var(--bg-secondary)', color: 'var(--text-primary)'}} disabled hidden>Chọn trạng thái</option>
          <option value="Chưa thực hiện" style={{background: 'var(--bg-secondary)', color: '#fc424a'}}>Chưa thực hiện</option>
          <option value="Đang thực hiện" style={{background: 'var(--bg-secondary)', color: '#ffab00'}}>Đang thực hiện</option>
          <option value="Theo dõi" style={{background: 'var(--bg-secondary)', color: '#00d25b'}}>Theo dõi</option>
          <option value="Pending" style={{background: 'var(--bg-secondary)', color: '#9ca3af'}}>Pending</option>
          <option value="Hoàn thành" style={{background: 'var(--bg-secondary)', color: '#00d25b'}}>Hoàn thành</option>
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

        {(() => {
          const headerMeta = {};
          const skipHeaders = new Set();
          let maxHeaderRows = 1;
          let hasSubHeaders = false;
          
          if (localData && localData.length > 0) {
            // First pass: detect if there are any horizontal merges in headers
            for (let idx = 0; idx < headers.length; idx++) {
              let nextIdx = idx + 1;
              const header = headers[idx];
              while (nextIdx < headers.length) {
                const nextHeader = headers[nextIdx];
                const baseName = header.replace(/_\d+$/, '');
                const nextBaseName = nextHeader.replace(/_\d+$/, '');
                if (baseName === nextBaseName && nextHeader.match(/_\d+$/)) {
                  hasSubHeaders = true;
                  break;
                } else {
                  break;
                }
              }
              if (hasSubHeaders) break;
            }

            headers.forEach((header, idx) => {
              if (skipHeaders.has(idx)) return;
              
              let thColSpan = 1;
              let nextIdx = idx + 1;
              while (nextIdx < headers.length) {
                const nextHeader = headers[nextIdx];
                const baseName = header.replace(/_\d+$/, '');
                const nextBaseName = nextHeader.replace(/_\d+$/, '');
                if (baseName === nextBaseName && nextHeader.match(/_\d+$/)) {
                  thColSpan++;
                  skipHeaders.add(nextIdx);
                  nextIdx++;
                } else {
                  break;
                }
              }

              let thRowSpan = 1;
              if (hasSubHeaders && thColSpan === 1) {
                // Only allow header vertical merge if there are subheaders and this column doesn't span horizontally
                for (let r = 0; r < localData.length; r++) {
                  if (localData[r]._rowSpans && localData[r]._rowSpans[header] === 0) {
                    thRowSpan++;
                  } else {
                    break;
                  }
                }
              }
              
              if (thRowSpan > maxHeaderRows) maxHeaderRows = thRowSpan;
              headerMeta[idx] = { rowSpan: thRowSpan, colSpan: thColSpan, label: header.replace(/_\d+$/, '') };
            });
          }
          
          const subHeaderCount = maxHeaderRows - 1;

          const renderDataRow = (row, rIdx, isSubHeader) => {
            return (
              <tr key={rIdx} style={isSubHeader ? { backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' } : { backgroundColor: 'transparent', borderBottom: '1px solid var(--glass-border)' }}>
                {headers.map((header, cIdx) => {
                  const getRowSpan = (idx) => {
                    const h = headers[idx];
                    if (row._rowSpans && row._rowSpans[h] !== undefined) {
                      if (title === 'Ticket Escalate' && rIdx === 0 && row._rowSpans[h] === 0) {
                        return 1;
                      }
                      return row._rowSpans[h];
                    }
                    return 1;
                  };
                  
                  const getColSpan = (idx) => {
                    const h = headers[idx];
                    if (row._colSpans && row._colSpans[h] !== undefined) return row._colSpans[h];
                    return 1;
                  };

                  const rowSpan = getRowSpan(cIdx);
                  const colSpan = getColSpan(cIdx);
                  
                  if (rowSpan === 0 || colSpan === 0) return null;

                  let val = String(row[header] || '');
                  if (title === 'Ticket Escalate' && !val && rIdx === 0 && row._rowSpans && row._rowSpans[header] === 0) {
                    val = header.replace(/_\d+$/, '');
                  }
                  
                  const lowerHeader = header.toLowerCase().trim();
                  const isStatusCol = (lowerHeader.includes('trạng thái') || lowerHeader.includes('tình trạng')) && !lowerHeader.includes('xử lý');
                  const isDateCol = lowerHeader.includes('deadline') || lowerHeader.includes('ngày') || lowerHeader === 'thời hạn';
                  const isSTT = lowerHeader === 'stt';
                  const isShrinkCol = lowerHeader === 'wbs' || (isSTT && !title.toLowerCase().includes('clear'));
                  
                  let colWidth = 'auto';
                  let minWidth = '120px'; 
                  if (isShrinkCol) {
                    colWidth = '1%';
                    minWidth = '40px';
                  } else if (isStatusCol || isDateCol) {
                    colWidth = '160px';
                    minWidth = '160px';
                  }

                  const isCenterAligned = isStatusCol || isDateCol || isSTT || isShrinkCol || lowerHeader.includes('pic') || lowerHeader.includes('đơn vị');
                  const align = isCenterAligned ? 'center' : 'left';

                  if (isSubHeader) {
                    return (
                      <th key={cIdx} rowSpan={rowSpan > 1 ? rowSpan : undefined} colSpan={colSpan > 1 ? colSpan : undefined} style={{ padding: '16px 12px', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px', textAlign: 'center', width: colWidth, minWidth: minWidth, whiteSpace: isShrinkCol ? 'nowrap' : 'normal', border: '1px solid var(--glass-border)' }}>
                        {val}
                      </th>
                    );
                  }

                  const formatDateForInput = (dateStr) => {
                    if (!dateStr) return '';
                    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
                    
                    let dateOnly = String(dateStr).trim().split(/\s+/)[0];
                    let normalized = dateOnly.replace(/[\.\-]/g, '/');
                    const parts = normalized.split('/');
                    
                    if (parts.length === 3) {
                      let year = parts[2];
                      let month = parts[1];
                      let day = parts[0];
                      
                      if (parts[0].length === 4) {
                        year = parts[0];
                        month = parts[1];
                        day = parts[2];
                      } else if (year.length === 2) {
                        year = '20' + year;
                      }
                      
                      if (/^\d{4}$/.test(year) && /^\d{1,2}$/.test(month) && /^\d{1,2}$/.test(day)) {
                        return `${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}`;
                      }
                    }
                    return ''; 
                  };

                  const formatDateForDisplay = (dateStr) => {
                    if (!dateStr) return '';
                    const parts = dateStr.split('-');
                    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
                    return dateStr;
                  };

                  const isTextCol = !isShrinkCol && !isStatusCol && !isDateCol;
                  
                  const parsedDateForInput = formatDateForInput(val);
                  const isValEmpty = !val || String(val).trim() === '';
                  const showDatePicker = isDateCol && (parsedDateForInput !== '' || isValEmpty);
                  
                  return (
                    <td key={cIdx} rowSpan={rowSpan > 1 ? rowSpan : undefined} colSpan={colSpan > 1 ? colSpan : undefined} style={{ padding: '16px 12px', color: 'var(--text-primary)', verticalAlign: 'middle', textAlign: align, width: colWidth, minWidth: minWidth, whiteSpace: isShrinkCol ? 'nowrap' : 'normal', border: '1px solid var(--glass-border)', background: (rowSpan > 1 || colSpan > 1) ? 'var(--bg-secondary)' : 'transparent' }}>
                      {isStatusCol ? renderStatus(val, rIdx, header) : showDatePicker ? (
                        <div style={{ position: 'relative' }}>
                          <input 
                            type={parsedDateForInput ? "date" : "text"}
                            value={parsedDateForInput}
                            onFocus={(e) => {
                              e.target.type = 'date';
                              e.target.showPicker && e.target.showPicker();
                            }}
                            onBlur={(e) => {
                              if (!e.target.value) e.target.type = 'text';
                            }}
                            onChange={(e) => {
                              const d = e.target.value;
                              handleCellChange(rIdx, header, d ? formatDateForDisplay(d) : '');
                            }}
                            style={{ 
                              background: 'transparent', 
                              border: 'none', 
                              color: 'var(--text-primary)', 
                              outline: 'none', 
                              width: '100%', 
                              fontSize: '0.85rem',
                              cursor: 'pointer'
                            }}
                            placeholder=""
                            title="Chọn ngày"
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
                            width: '100%',
                            minWidth: isTextCol ? '120px' : 'auto',
                            background: 'transparent',
                            border: '1px solid transparent',
                            color: 'inherit',
                            fontSize: 'inherit',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            outline: 'none',
                            transition: 'border 0.2s',
                            whiteSpace: isShrinkCol ? 'nowrap' : 'pre-wrap',
                            wordBreak: isShrinkCol ? 'normal' : 'break-word',
                            lineHeight: '1.5'
                          }}
                        >
                          {val}
                        </div>
                      )}
                    </td>
                  )
                })}
                {isSubHeader ? null : (
                  <td style={{ padding: '16px 12px', textAlign: 'center', verticalAlign: 'middle', border: '1px solid var(--glass-border)' }}>
                    <button onClick={() => handleDelete(rIdx)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--glass-border)', backgroundColor: 'transparent', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseOver={(e) => {e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.borderColor = 'var(--danger)'}}
                      onMouseOut={(e) => {e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--glass-border)'}}
                    >
                      🗑️
                    </button>
                  </td>
                )}
              </tr>
            );
          };

          return (
            <div className="table-container" style={{ position: 'relative', width: '100%', minHeight: '300px' }}>
              <div style={{ padding: '0 24px 24px' }}>
                <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', borderStyle: 'hidden' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                      {headers.map((header, idx) => {
                        if (skipHeaders.has(idx)) return null;
                        const meta = headerMeta[idx];
                        const lowerHeader = header.toLowerCase().trim();
                        const isSTT = lowerHeader === 'stt';
                        const isShrinkCol = lowerHeader === 'wbs' || (isSTT && !title.toLowerCase().includes('clear'));
                        const isStatusCol = lowerHeader.includes('trạng thái') || lowerHeader.includes('tình trạng');
                        const isDateCol = lowerHeader.includes('deadline') || lowerHeader.includes('ngày bắt đầu') || lowerHeader.includes('ngày kết thúc') || lowerHeader.includes('ngày hoàn thành') || lowerHeader === 'thời hạn';
                        const isExpandCol = lowerHeader.includes('ghi chú') || lowerHeader.includes('kết quả') || lowerHeader.includes('nội dung') || lowerHeader.includes('note');
                        
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
                        
                        const align = isExpandCol ? 'left' : 'center';

                        return (
                          <th key={idx} rowSpan={meta.rowSpan > 1 ? meta.rowSpan : undefined} colSpan={meta.colSpan > 1 ? meta.colSpan : undefined} style={{ padding: '16px 12px', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px', textAlign: 'center', width: colWidth, minWidth: minWidth, whiteSpace: isShrinkCol ? 'nowrap' : 'normal', border: '1px solid var(--glass-border)' }}>
                            {meta.label}
                          </th>
                        )
                      })}
                      <th rowSpan={maxHeaderRows} style={{ padding: '16px 12px', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px', textAlign: 'center', width: '60px', border: '1px solid var(--glass-border)' }}>
                        Xóa
                      </th>
                    </tr>
                    {localData.slice(0, subHeaderCount).map((row, idx) => renderDataRow(row, idx, true))}
                  </thead>
                  <tbody>
                    {localData.slice(subHeaderCount).map((row, idx) => renderDataRow(row, idx + subHeaderCount, false))}
                  </tbody>
                </table>
              </div>
              </div>
            </div>
          )
        })()}
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
