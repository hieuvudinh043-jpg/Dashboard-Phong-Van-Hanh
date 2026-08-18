import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import * as XLSX from 'xlsx';

const TEMP_XLSX = path.join(process.cwd(), 'temp_sheet.xlsx');

export function getDbPathForWeek(week) {
  const safeWeek = week ? week.replace(/\s+/g, '_') : 'Tuan_34';
  return path.join(process.cwd(), 'data', `sheet_db_${safeWeek}.json`);
}

export async function fetchAllData(week = 'Tuần 34', forceSync = false) {
  const DB_FILE = getDbPathForWeek(week);
  
  // Migration: Khôi phục lại data cũ của người dùng từ sheet_db.json
  const OLD_DB_FILE = path.join(process.cwd(), 'data', 'sheet_db.json');
  if (fs.existsSync(OLD_DB_FILE)) {
    console.log("Đang khôi phục dữ liệu cũ sang Tuần 34...");
    fs.copyFileSync(OLD_DB_FILE, getDbPathForWeek('Tuần 34'));
    fs.renameSync(OLD_DB_FILE, OLD_DB_FILE + '.bak');
  }

  if (!forceSync && fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(data);
    } catch (e) {
      console.error(`Lỗi đọc ${DB_FILE}, sẽ tải lại từ Google Sheets`, e);
    }
  }

  let sheetUrl = "https://docs.google.com/spreadsheets/d/1hva7q5dwCcVhPfHqzKfnsq0_eeTRG6lu/export?format=xlsx";
  const SETTINGS_FILE = path.join(process.cwd(), 'data', 'settings.json');
  if (fs.existsSync(SETTINGS_FILE)) {
    try {
      const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
      if (settings.sheetUrl) {
        // Tự động nhận diện ID từ bất kỳ dạng link Google Sheet nào (edit, view, sharing)
        const match = settings.sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
        if (match && match[1]) {
          sheetUrl = `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=xlsx`;
        }
      }
    } catch(e) {}
  }
  
  console.log("Đang tải dữ liệu từ Google Sheets cho", week);

  try {
    console.log("Đang tải dữ liệu từ Google Sheets (bỏ qua cache)...");
    const bypassCacheUrl = `${sheetUrl}&_t=${Date.now()}`;
    const { execSync } = require('child_process');
    
    // Sử dụng curl với các tham số: --ipv4 (ép dùng IPv4 để tránh lỗi network), -s (silent), -L (follow redirect), -k (bỏ qua lỗi SSL)
    const cmd = `curl --ipv4 -sLk "${bypassCacheUrl}" -o "${TEMP_XLSX}"`;
    execSync(cmd);
    
    if (!fs.existsSync(TEMP_XLSX) || fs.statSync(TEMP_XLSX).size === 0) {
      throw new Error("File tải về bị lỗi hoặc rỗng. (CURL failed)");
    }
    
    // Sử dụng fs.readFileSync bản địa của Node thay vì XLSX.readFile 
    // vì Next.js Webpack thường gây lỗi "Cannot access file" khi XLSX tự gọi fs
    const fileBuffer = fs.readFileSync(TEMP_XLSX);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const allData = {};

    workbook.SheetNames.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      
      let headerRowIndex = -1;
      for (let i = 0; i < Math.min(10, jsonData.length); i++) {
        const row = jsonData[i];
        const vals = Object.values(row).map(v => String(v).toLowerCase().trim());
        if (
          vals.includes('stt') || 
          vals.includes('tt') || 
          vals.includes('nội dung') ||
          vals.some(v => v.includes('wbs')) ||
          vals.some(v => v.includes('hạng mục')) ||
          vals.some(v => v.includes('công việc')) ||
          vals.some(v => v.includes('trạng thái'))
        ) {
          headerRowIndex = i;
          break;
        }
      }

      if (headerRowIndex >= 0) {
        const rawHeaders = Object.keys(jsonData[headerRowIndex]);
        const mappedHeaders = {};
        
        rawHeaders.forEach(key => {
          let headerText = jsonData[headerRowIndex][key];
          if (typeof headerText === 'string') {
            headerText = headerText.replace(/\r?\n|\r/g, ' ').trim();
          }
          mappedHeaders[key] = headerText;
        });

        const processedData = [];
        for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          
          let isEmpty = true;
          const processedRow = {};
          
          rawHeaders.forEach(key => {
            const headerName = mappedHeaders[key];
            if (headerName && headerName.trim() !== '') {
              let val = row[key];
              if (val !== undefined && val !== null && val !== '') {
                isEmpty = false;
              }
              if (typeof val === 'string') {
                val = val.replace(/\r?\n|\r/g, ' ').trim();
              }
              processedRow[headerName] = val !== undefined ? val : '';
            }
          });

          if (!isEmpty) {
            processedData.push(processedRow);
          }
        }
        
        allData[sheetName] = processedData;
      } else {
        allData[sheetName] = jsonData;
      }
    });

    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(DB_FILE, JSON.stringify(allData, null, 2), 'utf8');
    fs.writeFileSync(path.join(process.cwd(), 'debug_error.txt'), 'SUCCESS: Data downloaded and parsed correctly at ' + new Date().toISOString(), 'utf8');
    return allData;

  } catch (error) {
    console.error("Lỗi khi xử lý file từ Google Sheets:", error);
    fs.writeFileSync(path.join(process.cwd(), 'debug_error.txt'), 'ERROR at ' + new Date().toISOString() + ':\n' + error.message + '\n' + error.stack, 'utf8');
    
    // Nếu lỗi, cố gắng lấy dữ liệu từ tuần gần nhất có sẵn
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(data);
    } else {
      // Tìm tuần gần nhất
      const dataDir = path.dirname(DB_FILE);
      if (fs.existsSync(dataDir)) {
        const files = fs.readdirSync(dataDir).filter(f => f.startsWith('sheet_db_') && f.endsWith('.json') && !f.includes(week));
        if (files.length > 0) {
          files.sort((a, b) => {
            const numA = parseInt(a.replace(/\D/g, '')) || 0;
            const numB = parseInt(b.replace(/\D/g, '')) || 0;
            return numB - numA; 
          });
          const latestWeekFile = path.join(dataDir, files[0]);
          console.log(`Lấy dữ liệu từ tuần gần nhất: ${files[0]} do lỗi đồng bộ`);
          fs.copyFileSync(latestWeekFile, DB_FILE);
          const data = fs.readFileSync(DB_FILE, 'utf8');
          return JSON.parse(data);
        }
      }
    }
    return {};
  }
}

export async function addRow(week, sheetName, rowData) {
  const db = await fetchAllData(week);
  if (!db[sheetName]) db[sheetName] = [];
  db[sheetName].unshift(rowData);
  fs.writeFileSync(getDbPathForWeek(week), JSON.stringify(db, null, 2), 'utf8');
  return db[sheetName];
}

export async function updateRow(week, sheetName, rowIndex, rowData) {
  const db = await fetchAllData(week);
  if (!db[sheetName] || rowIndex < 0 || rowIndex >= db[sheetName].length) {
    throw new Error('Row not found');
  }
  db[sheetName][rowIndex] = { ...db[sheetName][rowIndex], ...rowData };
  fs.writeFileSync(getDbPathForWeek(week), JSON.stringify(db, null, 2), 'utf8');
  return db[sheetName];
}

export async function deleteRow(week, sheetName, rowIndex) {
  const db = await fetchAllData(week);
  if (!db[sheetName] || rowIndex < 0 || rowIndex >= db[sheetName].length) {
    throw new Error('Row not found');
  }
  db[sheetName].splice(rowIndex, 1);
  fs.writeFileSync(getDbPathForWeek(week), JSON.stringify(db, null, 2), 'utf8');
  return db[sheetName];
}

export async function bulkUpdateSheet(week, sheetName, newRows) {
  const db = await fetchAllData(week);
  db[sheetName] = newRows;
  fs.writeFileSync(getDbPathForWeek(week), JSON.stringify(db, null, 2), 'utf8');
  return db[sheetName];
}
