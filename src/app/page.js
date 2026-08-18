import Sidebar from '@/components/Sidebar';
import DynamicTable from '@/components/DynamicTable';
import ProjectSummary from '@/components/ProjectSummary';
import { fetchAllData } from '@/utils/googleSheet';
import { getWeeks } from '@/utils/weeks';

import SaveButton from '@/components/SaveButton';
import WeekSelector from '@/components/WeekSelector';
import ImageGallery from '@/components/ImageGallery';

export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }) {
  const weeks = getWeeks();
  const activeWeek = searchParams.week || weeks[0] || 'Tuần 34';
  
  const allData = await fetchAllData(activeWeek);
  const sheetNames = Object.keys(allData);

  // Tìm vị trí của các sheet làm mốc (marker sheets)
  const idxVande = sheetNames.findIndex(n => n.toLowerCase().trim() === 'vấn đề tồn đọng');
  const idxTrongDiem = sheetNames.findIndex(n => n.toLowerCase().trim() === 'dự án trọng điểm');
  const idxThuong = sheetNames.findIndex(n => n.toLowerCase().trim() === 'dự án thông thường');
  const idxVanHanh = sheetNames.findIndex(n => n.toLowerCase().trim() === 'vận hành');

  // Lấy các sheet con dựa trên khoảng cách giữa các mốc
  const duAnTrongDiemSheets = idxTrongDiem !== -1 
    ? sheetNames.slice(idxTrongDiem + 1, idxThuong !== -1 ? idxThuong : undefined).filter(n => n.trim() !== '')
    : [];
    
  const duAnThuongSheets = idxThuong !== -1 
    ? sheetNames.slice(idxThuong + 1, idxVanHanh !== -1 ? idxVanHanh : undefined).filter(n => n.trim() !== '')
    : [];
    
  const vanHanhSheets = idxVanHanh !== -1 
    ? sheetNames.slice(idxVanHanh + 1).filter(n => n.trim() !== '')
    : [];

  // Vấn đề tồn đọng chỉ chứa chính nó
  const vandeSheets = idxVande !== -1 ? [sheetNames[idxVande]] : [];

  const groupedSheets = {
    vande: vandeSheets,
    duantrongdiem: duAnTrongDiemSheets,
    duanthuong: duAnThuongSheets,
    vanhanh: vanHanhSheets
  };

  // Xác định Tab đang chọn, mặc định là Vấn đề tồn đọng
  const activeTab = searchParams.tab || 'vande';

  let displaySheets = [];
  let tabTitle = '';
  let tabSubtitle = '';
  let badgeText = '';

  switch (activeTab) {
    case 'vande':
      displaySheets = vandeSheets;
      tabTitle = 'Báo cáo Vấn đề tồn đọng';
      tabSubtitle = 'Tổng hợp các vấn đề tồn đọng cần xử lý gấp.';
      badgeText = 'VẤN ĐỀ TỒN ĐỌNG';
      break;
    case 'duantrongdiem':
      displaySheets = duAnTrongDiemSheets;
      tabTitle = 'Dự án trọng điểm';
      tabSubtitle = 'Theo dõi tiến độ các dự án mang tính chiến lược của phòng.';
      badgeText = 'DỰ ÁN TRỌNG ĐIỂM';
      break;
    case 'duanthuong':
      displaySheets = duAnThuongSheets;
      tabTitle = 'Dự án thường';
      tabSubtitle = 'Theo dõi các dự án và công việc thông thường.';
      badgeText = 'DỰ ÁN THƯỜNG';
      break;
    case 'vanhanh':
      displaySheets = vanHanhSheets;
      tabTitle = 'Vận hành';
      tabSubtitle = 'Báo cáo năng suất, KPI và SLA vận hành hàng ngày.';
      badgeText = 'VẬN HÀNH';
      break;
    default:
      displaySheets = sheetNames;
      tabTitle = 'Tổng quan';
      badgeText = 'TỔNG QUAN';
  }

  // Xác định Sheet đang active để render (mặc định là sheet đầu tiên của tab)
  let activeSheet = searchParams.sheet || '';
  if (!activeSheet && displaySheets.length > 0) {
    activeSheet = displaySheets[0];
  }

  const activeSheetData = (allData[activeSheet] || []).filter(row => Object.keys(row).length > 1);
  const isProjectTab = activeTab === 'duantrongdiem' || activeTab === 'duanthuong';

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} activeSheet={activeSheet} groupedSheets={groupedSheets} currentWeek={activeWeek} weeks={weeks} />
      
      <main className="main-content">
        {/* Main Header */}
        <header style={{ background: 'var(--bg-secondary)', padding: '1.5rem 2rem', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span className="badge" style={{ marginBottom: '12px' }}>{badgeText}</span>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px' }}>{tabTitle}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{tabSubtitle}</p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <SaveButton />
            <button className="btn-secondary">📄 Xuất CSV</button>
            <button className="btn-secondary">🖨️ In / PDF</button>
          </div>
        </header>

        {activeSheet && isProjectTab && (
          <div style={{ marginTop: '2rem' }}>
            <ProjectSummary data={activeSheetData} projectName={activeSheet} />
          </div>
        )}

        {activeSheet && activeSheetData.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <DynamicTable title={activeSheet} data={activeSheetData} currentWeek={activeWeek} />
          </div>
        )}

        {/* Thư viện ảnh (Cho phép đính kèm ảnh vào tất cả các board) */}
        {activeSheet && (
          <div style={{ marginTop: '0.5rem' }}>
            <ImageGallery currentWeek={activeWeek} sheetName={activeSheet} />
          </div>
        )}
      </main>
    </div>
  );
}

