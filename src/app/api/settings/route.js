import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'settings.json');
const DEFAULT_URL = "https://docs.google.com/spreadsheets/d/1hva7q5dwCcVhPfHqzKfnsq0_eeTRG6lu/edit";

function getSettings() {
  if (fs.existsSync(SETTINGS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
    } catch (e) {
      console.error("Lỗi đọc settings.json", e);
    }
  }
  return { sheetUrl: DEFAULT_URL };
}

export async function GET() {
  return NextResponse.json({ success: true, settings: getSettings() });
}

export async function POST(request) {
  try {
    const { sheetUrl } = await request.json();
    if (!sheetUrl || !sheetUrl.includes('docs.google.com/spreadsheets')) {
      return NextResponse.json({ success: false, error: 'Link Google Sheet không hợp lệ' }, { status: 400 });
    }

    const settings = getSettings();
    settings.sheetUrl = sheetUrl;

    const dir = path.dirname(SETTINGS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf8');

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("Lỗi lưu settings:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
