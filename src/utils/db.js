import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

// Khởi tạo thư mục data nếu chưa có
if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
  fs.mkdirSync(path.join(process.cwd(), 'data'), { recursive: true });
}

// Khởi tạo file db.json nếu chưa có
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify({ versions: [] }, null, 2));
}

export function saveVersion(data) {
  const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  const versionId = new Date().toISOString();
  
  db.versions.unshift({
    id: versionId,
    timestamp: versionId,
    data: data
  });

  // Giữ lại 10 phiên bản gần nhất để tránh phình to file
  if (db.versions.length > 10) {
    db.versions = db.versions.slice(0, 10);
  }

  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  return versionId;
}

export function getVersions() {
  const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  return db.versions.map(v => ({ id: v.id, timestamp: v.timestamp }));
}

export function getVersionData(id) {
  const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  const version = db.versions.find(v => v.id === id);
  return version ? version.data : null;
}
