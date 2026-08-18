const XLSX = require('xlsx');

function analyzeSheet() {
  const workbook = XLSX.readFile('/home/hieuvd12/dashboard/temp_sheet.xlsx');
  
  console.log("=== SHEET ANALYSIS ===");
  workbook.SheetNames.forEach(sheetName => {
    console.log(`\nSheet: ${sheetName}`);
    const sheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    
    if (rawRows.length === 0) {
      console.log("  (Empty)");
      return;
    }

    let headerRowIndex = 0;
    let maxCols = 0;
    for (let i = 0; i < Math.min(10, rawRows.length); i++) {
      const colsCount = rawRows[i].filter(cell => String(cell).trim() !== '').length;
      if (colsCount > maxCols) {
        maxCols = colsCount;
        headerRowIndex = i;
      }
    }

    const headers = rawRows[headerRowIndex].map(h => String(h).trim());
    console.log(`  Headers (Row ${headerRowIndex + 1}):`, headers.filter(h => h !== ''));
    if (rawRows.length > headerRowIndex + 1) {
      console.log(`  Sample Data Row:`, rawRows[headerRowIndex + 1].slice(0, 5));
    }
  });
}

analyzeSheet();
