  const PDFDocument = require('pdfkit');
  const fs = require('fs');
  const path = require('path');

  function safeText(v) {
    if (v === null || v === undefined) return '';
    return String(v);
  }

  function formatMoney(value) {
    const n = Number(value || 0);
    return `$${n.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} COP`;
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
    doc.fontSize(10).font('Helvetica').text(safeText(coop?.nombre || ''), { align: 'right' });
    const nit = coop?.nit ? `NIT: ${safeText(coop.nit)}` : '';
    if (nit) doc.text(nit, { align: 'right' });
    doc.moveDown(0.8);
    doc.moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke();
    doc.moveDown(1);
  }

  function renderFooter(doc) {
    doc.moveDown(1.2);
    doc.fontSize(9).font('Helvetica').fillColor('#64748B').text('Documento generado por COOPMONEY', { align: 'center' });
    doc.fillColor('#000000');
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

  function streamPazYSalvoPdf(res, data) {
    const filename = `paz_y_salvo_${safeText(data?.socio?.documento || data?.socio?.id_socio || 'socio')}.pdf`;
    const doc = startPdfResponse(res, filename);

    renderHeader(doc, 'Certificado de Paz y Salvo', data.cooperativa);

    const left = doc.page.margins.left;
    const right = doc.page.width - doc.page.margins.right;
    const colW = (right - left) / 2;

    renderKeyValue(doc, 'Fecha de expedición', data.fecha_expedicion, left, doc.y, colW);
    renderKeyValue(doc, 'Ciudad', data.ciudad || '—', left + colW, doc.y - 12, colW);
    doc.moveDown(0.8);

    renderSectionTitle(doc, 'Socio');
    renderKeyValue(doc, 'Nombre', data.socio?.nombre, left, doc.y, colW);
    renderKeyValue(doc, 'Documento', data.socio?.documento, left + colW, doc.y - 12, colW);
    doc.moveDown(0.8);

    doc.fontSize(11).font('Helvetica').text(
      `La cooperativa certifica que el socio identificado anteriormente se encuentra a paz y salvo por concepto de obligaciones crediticias registradas en la plataforma COOPMONEY, a la fecha de expedición.`,
      { align: 'justify' }
    );

    renderFooter(doc);
    doc.end();
  }

  function streamAfiliacionPdf(res, data) {
    const filename = `certificado_afiliacion_${safeText(data?.socio?.documento || data?.socio?.id_socio || 'socio')}.pdf`;
    const doc = startPdfResponse(res, filename);

    renderHeader(doc, 'Certificado de Afiliación', data.cooperativa);

    const left = doc.page.margins.left;
    const right = doc.page.width - doc.page.margins.right;
    const colW = (right - left) / 2;

    renderKeyValue(doc, 'Fecha de expedición', data.fecha_expedicion, left, doc.y, colW);
    renderKeyValue(doc, 'Ciudad', data.ciudad || '—', left + colW, doc.y - 12, colW);
    doc.moveDown(0.8);

    renderSectionTitle(doc, 'Socio');
    renderKeyValue(doc, 'Nombre', data.socio?.nombre, left, doc.y, colW);
    renderKeyValue(doc, 'Documento', data.socio?.documento, left + colW, doc.y - 12, colW);
    doc.moveDown(0.8);

    doc.fontSize(11).font('Helvetica').text(
      `La cooperativa certifica que el ciudadano(a) identificado anteriormente se encuentra registrado como socio en la plataforma COOPMONEY.`,
      { align: 'justify' }
    );

    renderFooter(doc);
    doc.end();
  }

  function streamAhorrosPdf(res, data) {
    const filename = `certificado_ahorros_${safeText(data?.socio?.documento || data?.socio?.id_socio || 'socio')}.pdf`;
    const doc = startPdfResponse(res, filename);

    renderHeader(doc, 'Certificado de Ahorros', data.cooperativa);

    const left = doc.page.margins.left;
    const right = doc.page.width - doc.page.margins.right;
    const colW = (right - left) / 2;

    renderKeyValue(doc, 'Fecha de expedición', data.fecha_expedicion, left, doc.y, colW);
    renderKeyValue(doc, 'Ciudad', data.ciudad || '—', left + colW, doc.y - 12, colW);
    doc.moveDown(0.8);

    renderSectionTitle(doc, 'Socio');
    renderKeyValue(doc, 'Nombre', data.socio?.nombre, left, doc.y, colW);
    renderKeyValue(doc, 'Documento', data.socio?.documento, left + colW, doc.y - 12, colW);
    doc.moveDown(0.8);

    renderSectionTitle(doc, 'Ahorros');
    renderKeyValue(doc, 'Saldo de ahorros', formatMoney(data.ahorros?.saldo), left, doc.y, colW);
    renderKeyValue(doc, 'Corte', data.ahorros?.fecha_corte, left + colW, doc.y - 12, colW);

    renderFooter(doc);
    doc.end();
  }

  function streamEstadoCuentaPdf(res, data) {
    const filename = `estado_cuenta_${safeText(data?.socio?.documento || data?.socio?.id_socio || 'socio')}.pdf`;
    const doc = startPdfResponse(res, filename);

    renderHeader(doc, 'Estado de Cuenta', data.cooperativa);

    const left = doc.page.margins.left;
    const right = doc.page.width - doc.page.margins.right;
    const colW = (right - left) / 2;

    renderKeyValue(doc, 'Fecha de expedición', data.fecha_expedicion, left, doc.y, colW);
    renderKeyValue(doc, 'Ciudad', data.ciudad || '—', left + colW, doc.y - 12, colW);
    doc.moveDown(0.8);

    renderSectionTitle(doc, 'Socio');
    renderKeyValue(doc, 'Nombre', data.socio?.nombre, left, doc.y, colW);
    renderKeyValue(doc, 'Documento', data.socio?.documento, left + colW, doc.y - 12, colW);
    doc.moveDown(0.8);

    renderSectionTitle(doc, 'Resumen');
    const totalSaldo = (data.creditos || []).reduce((acc, c) => acc + Number(c.saldo_pendiente_credito || 0), 0);
    renderKeyValue(doc, 'Créditos activos', (data.creditos || []).length, left, doc.y, colW);
    renderKeyValue(doc, 'Saldo total', formatMoney(totalSaldo), left + colW, doc.y - 12, colW);
    doc.moveDown(0.8);

    renderSectionTitle(doc, 'Detalle créditos');
    doc.fontSize(10).font('Helvetica-Bold').text('ID', left, doc.y, { width: 60 });
    doc.text('Saldo', left + 60, doc.y - 12, { width: 160 });
    doc.text('Cuota pendiente', left + 220, doc.y - 12, { width: 120 });
    doc.text('Estado', left + 340, doc.y - 12, { width: right - left - 340, align: 'right' });
    doc.moveDown(0.6);
    doc.moveTo(left, doc.y).lineTo(right, doc.y).stroke();
    doc.moveDown(0.4);

    doc.font('Helvetica').fontSize(10);
    for (const cr of (data.creditos || [])) {
      const cuotaTxt = cr.next_numero_cuota ? `#${cr.next_numero_cuota}` : '—';
      doc.text(safeText(cr.id_credito), left, doc.y, { width: 60 });
      doc.text(formatMoney(cr.saldo_pendiente_credito), left + 60, doc.y - 12, { width: 160 });
      doc.text(cuotaTxt, left + 220, doc.y - 12, { width: 120 });
      doc.text(safeText(cr.estado_credito), left + 340, doc.y - 12, { width: right - left - 340, align: 'right' });
      doc.moveDown(0.8);
    }

    renderFooter(doc);
    doc.end();
  }

  module.exports = {
    streamPazYSalvoPdf,
    streamAfiliacionPdf,
    streamAhorrosPdf,
    streamEstadoCuentaPdf,
  };

