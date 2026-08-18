import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    const weeksPath = path.join(dataDir, 'weeks.json');
    
    if (!fs.existsSync(weeksPath)) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy danh sách tuần' }, { status: 404 });
    }

    const weeks = JSON.parse(fs.readFileSync(weeksPath, 'utf8'));
    const consolidatedData = {};

    weeks.forEach(week => {
      const safeWeekName = week.replace(/ /g, '_');
      const dbPath = path.join(dataDir, `sheet_db_${safeWeekName}.json`);
      
      if (fs.existsSync(dbPath)) {
        const weekData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        
        Object.keys(weekData).forEach(sheetName => {
          if (!consolidatedData[sheetName]) {
            consolidatedData[sheetName] = [];
          }
          
          const sheetRows = weekData[sheetName];
          if (Array.isArray(sheetRows)) {
            sheetRows.forEach(row => {
              // Bỏ qua các hàng trống hoàn toàn nếu có
              if (Object.keys(row).length > 0) {
                // Tạo một object mới với "Tuần báo cáo" ở đầu tiên
                const newRow = { 'Tuần báo cáo': week, ...row };
                consolidatedData[sheetName].push(newRow);
              }
            });
          }
        });
      }
    });

    const workbook = XLSX.utils.book_new();

    Object.keys(consolidatedData).forEach(sheetName => {
      const rows = consolidatedData[sheetName];
      if (rows.length > 0) {
        // Rút gọn tên sheet nếu vượt quá 31 ký tự (giới hạn của Excel)
        const safeSheetName = sheetName.substring(0, 31).replace(/[\\/*?:\[\]]/g, '');
        const worksheet = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(workbook, worksheet, safeSheetName || 'Sheet');
      }
    });

    // Nếu không có dữ liệu nào
    if (workbook.SheetNames.length === 0) {
      const worksheet = XLSX.utils.json_to_sheet([{ 'Thông báo': 'Không có dữ liệu' }]);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'No Data');
    }

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="Bao_Cao_Tong_Hop.xlsx"'
      }
    });

  } catch (error) {
    console.error("Lỗi xuất Excel:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
