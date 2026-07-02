const fs = require('fs');
const html = fs.readFileSync('public/dashboard-socio.html', 'utf8');
const js = fs.readFileSync('public/js/controllers/socio.controller.js', 'utf8');
const regex = /getElementById\(['"]([^'"]+)['"]\)/g;
const missing = [];
let match;
while ((match = regex.exec(js)) !== null) {
  const id = match[1];
  if (!html.includes('id="' + id + '"') && !html.includes('id=\'' + id + '\'')) {
    missing.push(id);
  }
}
console.log('MISSING_IDS:', [...new Set(missing)]);
