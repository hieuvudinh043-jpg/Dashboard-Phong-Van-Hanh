const XLSX = require('xlsx');

function analyzeProject() {
  const workbook = XLSX.readFile('/home/hieuvd12/dashboard/temp_sheet_new.xlsx');
  const sheet = workbook.Sheets['HPCN'];
  const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  
  const dataRows = rawRows.slice(1).map(row => row.slice(0, 12));
  console.log("HPCN Data:");
  console.log(dataRows.slice(0, 15));
}

analyzeProject();
