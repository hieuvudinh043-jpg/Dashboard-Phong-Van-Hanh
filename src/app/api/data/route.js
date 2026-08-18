import { NextResponse } from 'next/server';
import { addRow, updateRow, deleteRow, bulkUpdateSheet } from '@/utils/googleSheet';

export async function POST(request) {
  try {
    const { sheetName, week, rowData } = await request.json();
    if (!sheetName || !rowData) {
      return NextResponse.json({ error: 'Missing sheetName or rowData' }, { status: 400 });
    }
    
    await addRow(week, sheetName, rowData);
    return NextResponse.json({ success: true, message: 'Thêm thành công' });
  } catch (error) {
    console.error("API POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { sheetName, week, rowIndex, rowData, bulkData } = body;
    
    if (!sheetName) {
      return NextResponse.json({ error: 'Missing sheetName' }, { status: 400 });
    }
    
    if (bulkData && Array.isArray(bulkData)) {
      await bulkUpdateSheet(week, sheetName, bulkData);
      return NextResponse.json({ success: true, message: 'Cập nhật hàng loạt thành công' });
    } else if (rowIndex !== undefined && rowData) {
      await updateRow(week, sheetName, rowIndex, rowData);
      return NextResponse.json({ success: true, message: 'Cập nhật dòng thành công' });
    } else {
      return NextResponse.json({ error: 'Missing parameters for update' }, { status: 400 });
    }
  } catch (error) {
    console.error("API PUT error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const url = new URL(request.url);
    const sheetName = url.searchParams.get('sheetName');
    const rowIndexStr = url.searchParams.get('rowIndex');
    
    if (!sheetName || !rowIndexStr) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }
    
    const rowIndex = parseInt(rowIndexStr, 10);
    await deleteRow(sheetName, rowIndex);
    return NextResponse.json({ success: true, message: 'Xóa thành công' });
  } catch (error) {
    console.error("API DELETE error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
