const { fetchAllData } = require('./src/utils/googleSheet.js');

async function test() {
  const data = await fetchAllData();
  console.log("Keys:", Object.keys(data));
}
test();
