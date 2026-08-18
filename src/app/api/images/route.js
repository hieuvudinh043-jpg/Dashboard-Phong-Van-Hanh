import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const IMAGES_DB_FILE = path.join(process.cwd(), 'data', 'images.json');
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

// Hàm đọc DB
function getImagesDB() {
  if (fs.existsSync(IMAGES_DB_FILE)) {
    return JSON.parse(fs.readFileSync(IMAGES_DB_FILE, 'utf8'));
  }
  return {};
}

// Hàm lưu DB
function saveImagesDB(db) {
  const dir = path.dirname(IMAGES_DB_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(IMAGES_DB_FILE, JSON.stringify(db, null, 2), 'utf8');
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const week = searchParams.get('week');
  const sheet = searchParams.get('sheet');

  if (!week || !sheet) {
    return NextResponse.json({ success: false, error: 'Thiếu tham số week hoặc sheet' }, { status: 400 });
  }

  const db = getImagesDB();
  const weekData = db[week] || {};
  const images = weekData[sheet] || [];

  return NextResponse.json({ success: true, images });
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const week = formData.get('week');
    const sheet = formData.get('sheet');
    const files = formData.getAll('images');

    if (!week || !sheet || !files || files.length === 0) {
      return NextResponse.json({ success: false, error: 'Thiếu dữ liệu' }, { status: 400 });
    }

    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }

    const db = getImagesDB();
    if (!db[week]) db[week] = {};
    if (!db[week][sheet]) db[week][sheet] = [];

    const uploadedUrls = [];

    for (const file of files) {
      // Validate định dạng
      if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
        continue;
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      // Tránh trùng tên bằng cách thêm timestamp
      const filename = `${Date.now()}_${Math.random().toString(36).substring(7)}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const filepath = path.join(UPLOADS_DIR, filename);
      
      fs.writeFileSync(filepath, buffer);
      
      const fileUrl = `/uploads/${filename}`;
      db[week][sheet].push({
        url: fileUrl,
        filename: filename,
        uploadedAt: new Date().toISOString()
      });
      
      uploadedUrls.push(fileUrl);
    }

    saveImagesDB(db);

    return NextResponse.json({ success: true, images: db[week][sheet] });
  } catch (error) {
    console.error("Lỗi upload ảnh:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const week = searchParams.get('week');
    const sheet = searchParams.get('sheet');
    const filename = searchParams.get('filename');

    if (!week || !sheet || !filename) {
      return NextResponse.json({ success: false, error: 'Thiếu tham số' }, { status: 400 });
    }

    const db = getImagesDB();
    if (db[week] && db[week][sheet]) {
      // Lọc bỏ file
      db[week][sheet] = db[week][sheet].filter(img => img.filename !== filename);
      saveImagesDB(db);

      // Xóa file vật lý
      const filepath = path.join(UPLOADS_DIR, filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Lỗi xóa ảnh:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
