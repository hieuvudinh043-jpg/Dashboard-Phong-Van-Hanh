const http = require('http');

console.log('Bắt đầu chạy Cron Job đồng bộ dữ liệu...');
const req = http.request('http://localhost:3000/api/sync', { method: 'GET' }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Kết quả đồng bộ:', data);
  });
});

req.on('error', (e) => {
  console.error('Lỗi khi gọi API đồng bộ:', e.message);
});

req.end();
