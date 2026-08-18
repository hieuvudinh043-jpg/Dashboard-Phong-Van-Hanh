const XLSX = require('xlsx');

try {
  const workbook = XLSX.readFile('sheet.xlsx');
  console.log("Sheet names:", workbook.SheetNames);
  
  for (const sheetName of workbook.SheetNames) {
    console.log(`\n--- ${sheetName} ---`);
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    console.log(data.slice(0, 5));
  }
} catch (e) {
  console.error("Error:", e);
}
