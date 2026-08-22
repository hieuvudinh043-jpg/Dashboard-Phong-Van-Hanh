import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const SUMMARY_FILE = path.join(process.cwd(), 'data', 'summary_overrides.json');

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const week = searchParams.get('week');
    const project = searchParams.get('project');

    if (!fs.existsSync(SUMMARY_FILE)) {
      return new Response(JSON.stringify({ success: true, override: null }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    const data = JSON.parse(fs.readFileSync(SUMMARY_FILE, 'utf8'));
    
    if (week && project && data[week] && data[week][project]) {
      return new Response(JSON.stringify({ success: true, override: data[week][project] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ success: true, override: null }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error("Lỗi đọc summary_overrides.json:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { week, project, overrideData } = body;

    if (!week || !project) {
      return new Response(JSON.stringify({ success: false, error: "Thiếu week hoặc project" }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    let data = {};
    if (fs.existsSync(SUMMARY_FILE)) {
      try {
        data = JSON.parse(fs.readFileSync(SUMMARY_FILE, 'utf8'));
      } catch (e) {
        data = {};
      }
    }

    if (!data[week]) data[week] = {};
    data[week][project] = overrideData;

    // Đảm bảo thư mục data tồn tại
    const dataDir = path.dirname(SUMMARY_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(SUMMARY_FILE, JSON.stringify(data, null, 2), 'utf8');

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error("Lỗi ghi summary_overrides.json:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
