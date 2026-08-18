import { fetchAllData } from '@/utils/googleSheet';
import { saveVersion, getVersions } from '@/utils/db';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';
    const week = searchParams.get('week') || 'Tuần 34';
    
    if (force) {
      const tempPath = path.join(process.cwd(), 'temp_sheet.xlsx');
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    }

    const allData = await fetchAllData(week, force);
    const versionId = saveVersion(allData, week);

    return NextResponse.json({ success: true, versionId, message: 'Data synced successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
