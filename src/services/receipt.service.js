const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

function formatMoney(value) {
  const n = Number(value || 0);
  return `$${n.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} COP`;
}

function safeText(v) {
  if (v === null || v === undefined) return '';
  return String(v);
}

function tryLoadLogo() {
  const candidates = [
    path.join(__dirname, '../../archivos_para_ia/LogoV1.png'),
    path.join(__dirname, '../../public/img/LogoV1.png'),
    path.join(__dirname, '../../public/assets/images/logo.png'),
  ];
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) return p;
    } catch (_) {
    }
  }
  return null;
}

function startPdfResponse(res, filename) {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  doc.pipe(res);
  return doc;
}

function renderHeader(doc, title, coop) {
  const logoPath = tryLoadLogo();
  const topY = doc.y;

  if (logoPath) {
    try {
      doc.image(logoPath, doc.page.margins.left, topY, { width: 90 });
    } catch (_) {
    }
  }

  doc.fontSize(18).font('Helvetica-Bold').text(title, 0, topY, { align: 'right' });
  doc.moveDown(0.4);
  doc.fontSize(10).font('Helvetica').text(safeText(coop?.nombre_cooperativa || ''), { align: 'right' });
  const nit = coop?.nit_cooperativa ? `NIT: ${safeText(coop.nit_cooperativa)}` : '';
  if (nit) doc.text(nit, { align: 'right' });
  doc.moveDown(0.8);
  doc.moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke();
  doc.moveDown(1);
}

function renderKeyValue(doc, label, value, x, y, w) {
  doc.fontSize(10).font('Helvetica-Bold').text(label, x, y, { width: w });
  doc.font('Helvetica').text(safeText(value), { width: w });
}

function renderSectionTitle(doc, title) {
  doc.moveDown(0.6);
  doc.fontSize(12).font('Helvetica-Bold').text(title);
  doc.moveDown(0.3);
}

function renderTableRow(doc, cols, widths) {
  const startX = doc.page.margins.left;
  const y = doc.y;
  let x = startX;
  doc.fontSize(10).font('Helvetica');
  for (let i = 0; i < cols.length; i++) {
    doc.text(safeText(cols[i]), x, y, { width: widths[i], align: i === cols.length - 1 ? 'right' : 'left' });
    x += widths[i];
  }
  doc.moveDown(1.2);
}

function renderFooter(doc) {
  doc.moveDown(1.2);
  doc.fontSize(9).font('Helvetica').fillColor('#64748B').text('Documento generado por COOPMONEY', { align: 'center' });
  doc.fillColor('#000000');
}

function streamPagoReciboPdf(res, data) {
  const filename = `recibo_pago_${safeText(data.numero_recibo_pago || data.id_pago)}.pdf`;
  const doc = startPdfResponse(res, filename);

  renderHeader(doc, 'Recibo de Pago', data.cooperativa);

  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;
  const colW = (right - left) / 2;

  renderKeyValue(doc, 'Recibo N°', data.numero_recibo_pago || data.id_pago, left, doc.y, colW);
  renderKeyValue(doc, 'Fecha', data.fecha_pago, left + colW, doc.y - 12, colW);
  doc.moveDown(0.8);

  renderSectionTitle(doc, 'Socio');
  renderKeyValue(doc, 'Nombre', data.socio?.nombre, left, doc.y, colW);
  renderKeyValue(doc, 'Documento', data.socio?.documento, left + colW, doc.y - 12, colW);
  doc.moveDown(0.8);

  renderSectionTitle(doc, 'Detalle');
  const widths = [200, 120, 90, right - left - 410];
  renderTableRow(doc, ['Concepto', 'Crédito', 'Cuota', 'Monto'], widths);
  doc.moveTo(left, doc.y - 8).lineTo(right, doc.y - 8).stroke();
  renderTableRow(
    doc,
    [
      'Pago de cuota',
      data.credito?.id_credito ? `#${data.credito.id_credito}` : '',
      data.credito?.numero_cuota ? `#${data.credito.numero_cuota}` : '',
      formatMoney(data.monto_total_pago),
    ],
    widths
  );
  doc.moveTo(left, doc.y - 8).lineTo(right, doc.y - 8).stroke();

  doc.moveDown(0.4);
  doc.fontSize(10).font('Helvetica-Bold').text('Canal', left, doc.y, { width: 140 });
  doc.font('Helvetica').text(safeText(data.canal_pago), left + 140, doc.y - 12, { width: right - left - 140 });
  doc.moveDown(0.2);
  doc.font('Helvetica-Bold').text('Total', left, doc.y, { width: 140 });
  doc.font('Helvetica-Bold').text(formatMoney(data.monto_total_pago), left + 140, doc.y - 12, { width: right - left - 140 });
  if (data.mora && (Number(data.mora.dias_mora) > 0 || Number(data.mora.interes_mora) > 0)) {
    doc.moveDown(0.2);
    doc.font('Helvetica-Bold').text('Mora', left, doc.y, { width: 140 });
    doc.font('Helvetica').text(`${safeText(data.mora.dias_mora)} días · ${formatMoney(data.mora.interes_mora)}`, left + 140, doc.y - 12, { width: right - left - 140 });
  }

  renderFooter(doc);
  doc.end();
}

function streamMovimientoReciboPdf(res, data) {
  const filename = `recibo_ahorro_${safeText(data.id_movimiento)}.pdf`;
  const doc = startPdfResponse(res, filename);

  renderHeader(doc, 'Recibo de Ahorro', data.cooperativa);

  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;
  const colW = (right - left) / 2;

  renderKeyValue(doc, 'Movimiento N°', `MOV-${safeText(data.id_movimiento)}`, left, doc.y, colW);
  renderKeyValue(doc, 'Fecha', data.fecha_movimiento, left + colW, doc.y - 12, colW);
  doc.moveDown(0.8);

  renderSectionTitle(doc, 'Socio');
  renderKeyValue(doc, 'Nombre', data.socio?.nombre, left, doc.y, colW);
  renderKeyValue(doc, 'Documento', data.socio?.documento, left + colW, doc.y - 12, colW);
  doc.moveDown(0.8);

  renderSectionTitle(doc, 'Detalle');
  const widths = [240, 140, right - left - 380];
  renderTableRow(doc, ['Tipo', 'Monto', 'Descripción'], widths);
  doc.moveTo(left, doc.y - 8).lineTo(right, doc.y - 8).stroke();
  renderTableRow(
    doc,
    [safeText(data.tipo_movimiento), formatMoney(data.monto_movimiento), safeText(data.descripcion_movimiento)],
    widths
  );
  doc.moveTo(left, doc.y - 8).lineTo(right, doc.y - 8).stroke();

  renderFooter(doc);
  doc.end();
}

module.exports = {
  streamPagoReciboPdf,
  streamMovimientoReciboPdf,
};
