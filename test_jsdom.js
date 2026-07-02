const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = fs.readFileSync('public/dashboard-socio.html', 'utf8');
let js = fs.readFileSync('public/js/controllers/socio.controller.js', 'utf8');
js = js.replace("document.getElementById('btn-socio-solicitar').addEventListener", "console.log('Attaching click listener to btn-socio-solicitar...'); document.getElementById('btn-socio-solicitar').addEventListener");

const dom = new JSDOM(html, { url: "http://localhost/", runScripts: "outside-only" });
const window = dom.window;
global.document = window.document;
global.window = window;

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});

// mock fetch
window.fetch = async () => ({
  ok: true,
  json: async () => ({})
});
window.alert = console.log;
window.confirm = () => true;

// mock sessionStorage and localStorage
const storage = { getItem: () => "{\"rol\":\"socio\",\"id\":1, \"nombre\":\"Test\", \"correo\":\"test@test.com\"}", setItem: () => {} };
Object.defineProperty(window, 'sessionStorage', { value: storage });
Object.defineProperty(window, 'localStorage', { value: storage });
window.Intl = { NumberFormat: () => ({ format: (v) => v }) };

try {
  window.eval(js);
  window.document.dispatchEvent(new window.Event('DOMContentLoaded'));
  setTimeout(() => {
    console.log("Simulating click on btn-socio-solicitar...");
    const btn = window.document.getElementById('btn-socio-solicitar');
    if (btn) {
      btn.click();
    }
  }, 1000);
} catch (e) {
  console.error("Error during execution:", e);
}
