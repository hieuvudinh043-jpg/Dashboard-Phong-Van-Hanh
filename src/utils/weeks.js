import fs from 'fs';
import path from 'path';

const WEEKS_FILE = path.join(process.cwd(), 'data', 'weeks.json');

export function getWeeks() {
  try {
    if (fs.existsSync(WEEKS_FILE)) {
      const data = fs.readFileSync(WEEKS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Lỗi đọc weeks.json:", e);
  }
  // Mặc định trả về Tuần 34 nếu chưa có file
  return ['Tuần 34'];
}

export function saveWeeks(weeks) {
  try {
    const dir = path.dirname(WEEKS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(WEEKS_FILE, JSON.stringify(weeks, null, 2), 'utf8');
  } catch (e) {
    console.error("Lỗi ghi weeks.json:", e);
  }
}

export function addWeek(newWeek) {
  const weeks = getWeeks();
  if (!weeks.includes(newWeek)) {
    weeks.push(newWeek);
    // Sắp xếp tuần giảm dần (Tuần 35, Tuần 34) để tuần mới lên đầu
    weeks.sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.replace(/\D/g, '')) || 0;
      return numB - numA; 
    });
    saveWeeks(weeks);
  }
  return weeks;
}
