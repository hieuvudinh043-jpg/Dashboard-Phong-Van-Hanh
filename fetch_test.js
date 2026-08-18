const fs = require('fs');

async function testFetch() {
  const sheetNames = [
    'Vấn đề tồn đọng',
    'Dự án trọng điểm',
    'Dự án thông thường',
    'Vận hành'
  ];

  for (const name of sheetNames) {
    const encoded = encodeURIComponent(name);
    const url = `https://docs.google.com/spreadsheets/d/1hva7q5dwCcVhPfHqzKfnsq0_eeTRG6lu/gviz/tq?tqx=out:csv&sheet=${encoded}`;
    try {
      const res = await fetch(url);
      if (res.ok) {
        const text = await res.text();
        console.log(`\n--- SHEET: ${name} ---`);
        console.log(text.substring(0, 200));
      } else {
        console.log(`\n--- SHEET: ${name} (Failed: ${res.status}) ---`);
      }
    } catch (e) {
      console.log(`\n--- SHEET: ${name} (Error: ${e.message}) ---`);
    }
  }
}

testFetch();
