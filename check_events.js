const fs = require('fs');
const js = fs.readFileSync('public/js/controllers/socio.controller.js', 'utf8');
const regex = /getElementById\(['"]([^'"]+)['"]\)\.addEventListener/g;
let match;
const ids = [];
while ((match = regex.exec(js)) !== null) {
  ids.push(match[1]);
}
console.log('Elements with addEventListener:', [...new Set(ids)]);
