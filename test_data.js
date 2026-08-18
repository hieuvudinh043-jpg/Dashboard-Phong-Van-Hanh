const { fetchAllData } = require('./src/utils/googleSheet');

async function test() {
  const data = await fetchAllData();
  
  for (const sheetName in data) {
    console.log(`\n=== SHEET: ${sheetName} ===`);
    const cleanData = data[sheetName].filter(row => Object.keys(row).length > 1);
    console.log(`Valid Rows: ${cleanData.length}`);
    if (cleanData.length > 0) {
      console.log(cleanData[0]);
    }
  }
}

test();
