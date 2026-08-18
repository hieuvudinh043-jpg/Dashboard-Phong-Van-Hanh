import { NextResponse } from 'next/server';
import { getWeeks, addWeek } from '@/utils/weeks';
import { fetchAllData } from '@/utils/googleSheet';

export async function GET() {
  try {
    const weeks = getWeeks();
    return NextResponse.json({ success: true, weeks });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { week } = await request.json();
    if (!week) {
      return NextResponse.json({ error: 'Missing week name' }, { status: 400 });
    }
    
    // Thêm tuần vào danh sách
    const weeks = addWeek(week);
    
    // Khởi tạo data cho tuần mới (quét lại từ Google Sheets, forceSync = true)
    await fetchAllData(week, true);
    
    return NextResponse.json({ success: true, weeks, message: 'Đã thêm tuần mới và đồng bộ dữ liệu.' });
  } catch (error) {
    console.error("Lỗi khi thêm tuần:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
