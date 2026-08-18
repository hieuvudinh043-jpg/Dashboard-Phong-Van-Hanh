async function test() {
  try {
    const sheetUrl = "https://docs.google.com/spreadsheets/d/1hva7q5dwCcVhPfHqzKfnsq0_eeTRG6lu/export?format=xlsx";
    console.log("Fetching...");
    const res = await fetch(sheetUrl, { cache: 'no-store' });
    console.log("Status:", res.status);
    console.log("Headers:", res.headers.get('content-type'));
    const ab = await res.arrayBuffer();
    console.log("Bytes:", ab.byteLength);
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
