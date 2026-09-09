const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

/**
 * Servicio de envío de notificaciones reales por correo electrónico usando Nodemailer.
 */
class EmailService {
    static async enviarBienvenidaSocio({ correo, nombre, contrasenaTemp, nombreCooperativa }) {
        const subject = `¡Te damos la bienvenida a ${nombreCooperativa}! 🌟`;
        
        // Plantilla HTML Premium
        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background-color: #f1f5f9;
                    margin: 0;
                    padding: 20px;
                    color: #1e293b;
                }
                .email-card {
                    max-width: 600px;
                    background-color: #ffffff;
                    margin: 0 auto;
                    border-radius: 12px;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
                    overflow: hidden;
                    border: 1px solid #e2e8f0;
                }
                .email-header {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    padding: 30px;
                    text-align: center;
                    color: #ffffff;
                }
                .email-header h1 {
                    margin: 0;
                    font-size: 1.6rem;
                    font-weight: 700;
                }
                .email-body {
                    padding: 30px;
                    line-height: 1.6;
                }
                .email-body p {
                    margin-bottom: 20px;
                }
                .cred-box {
                    background-color: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 20px;
                    margin: 25px 0;
                }
                .cred-title {
                    font-weight: 700;
                    color: #0f172a;
                    margin-bottom: 10px;
                    font-size: 0.95rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .cred-item {
                    margin-bottom: 8px;
                    font-size: 0.95rem;
                }
                .cred-label {
                    font-weight: 600;
                    color: #475569;
                    width: 140px;
                    display: inline-block;
                }
                .cred-val {
                    font-family: monospace;
                    font-weight: 700;
                    color: #059669;
                    background-color: #ecfdf5;
                    padding: 2px 6px;
                    border-radius: 4px;
                }
                .btn-cta {
                    display: block;
                    text-align: center;
                    background-color: #10b981;
                    color: #ffffff !important;
                    text-decoration: none;
                    font-weight: 600;
                    padding: 12px 24px;
                    border-radius: 8px;
                    margin: 30px auto 10px auto;
                    width: 200px;
                    box-shadow: 0 4px 6px -1px rgba(16,185,129,0.2);
                }
                .email-footer {
                    background-color: #f8fafc;
                    padding: 20px;
                    text-align: center;
                    font-size: 0.8rem;
                    color: #64748b;
                    border-top: 1px solid #e2e8f0;
                }
            </style>
        </head>
        <body>
            <div class="email-card">
                <div class="email-header">
                    <h1>¡Afiliación Aprobada Exitosamente!</h1>
                </div>
                <div class="email-body">
                    <p>Estimado/a <strong>${nombre}</strong>,</p>
                    <p>Nos complace darte la más cálida bienvenida como nuevo asociado de <strong>${nombreCooperativa}</strong> a través de nuestra plataforma cooperativa virtual <strong>COOPMONEY</strong>.</p>
                    <p>Tu solicitud ha sido revisada minuciosamente y aprobada por nuestro analista asignado. A partir de este momento, tienes acceso total a tu panel para simular y radicar créditos, revisar tus amortizaciones mensuales y controlar tus estados de ahorro.</p>
                    
                    <div class="cred-box">
                        <div class="cred-title">Tus Credenciales de Ingreso</div>
                        <div class="cred-item">
                            <span class="cred-label">Plataforma:</span>
                            <span style="color:#0f172a;">COOPMONEY Solidario</span>
                        </div>
                        <div class="cred-item">
                            <span class="cred-label">Usuario / Correo:</span>
                            <span class="cred-val">${correo}</span>
                        </div>
                        <div class="cred-item">
                            <span class="cred-label">Contraseña Temp:</span>
                            <span class="cred-val">${contrasenaTemp}</span>
                        </div>
                    </div>
                    
                    <p style="font-size: 0.85rem; color: #64748b; font-style: italic;">
                        ⚠️ Por tu seguridad, te recomendamos iniciar sesión de inmediato y cambiar esta contraseña predeterminada desde la pestaña "Mi Perfil".
                    </p>
                    
                    <a href="http://localhost:3000" class="btn-cta" target="_blank">Ingresar a COOPMONEY</a>
                </div>
                <div class="email-footer">
                    Este es un mensaje automático del sistema de afiliación de ${nombreCooperativa}.<br>
                    &copy; 2026 COOPMONEY. Todos los derechos reservados.
                </div>
            </div>
        </body>
        </html>
        `;

        // Leer y sanitizar variables de entorno (remover comillas accidentales de dotenv)
        const rawHost = process.env.SMTP_HOST || '';
        const rawUser = process.env.SMTP_USER || '';
        const rawPass = process.env.SMTP_PASS || '';
        const rawFrom = process.env.SMTP_FROM || '';

                const smtpHost = rawHost.replace(/^['"]|['"]$/g, '').trim();
        const smtpUser = rawUser.replace(/^['"]|['"]$/g, '').trim();
        const smtpPass = rawPass.replace(/^['"]|['"]$/g, '').trim();
        const smtpFrom = rawFrom.replace(/^['"]|['"]$/g, '').replace(/\\/g, '').trim();

        // Comprobar si las variables SMTP reales ya fueron configuradas
        const isSmtpConfigured = smtpHost && 
                                 smtpUser && smtpUser !== 'tu_correo_emisor@gmail.com' && 
                                 smtpPass && smtpPass !== 'tu_clave_de_aplicacion_aqui';

        if (isSmtpConfigured) {
            try {
                // Configurar transporte real de Nodemailer
                const transporter = nodemailer.createTransport({
                    host: smtpHost,
                    port: parseInt(process.env.SMTP_PORT || '465'),
                    secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
                    auth: {
                        user: smtpUser,
                        pass: smtpPass
                    },
                    tls: {
                        rejectUnauthorized: false
                    }
                });

                const remitente = smtpFrom || `"${nombreCooperativa}" <${smtpUser}>`;

                await transporter.sendMail({
                    from: remitente,
                    to: correo,
                    subject: subject,
                    html: htmlContent
                });

                console.log(`✉️ [REAL] Correo de bienvenida enviado con éxito a: ${correo} (Remitente: ${remitente})`);
                return true;
            } catch (err) {
                console.error("❌ Error de envío con el servidor SMTP real:", err.message);
                throw err;
            }
        } else {
            console.log("\n⚠️ \x1b[33m[ADVERTENCIA] CONFIGURACIÓN DE SMTP DETECTADA COMO INCOMPLETA\x1b[0m ⚠️");
            console.log(`Valores leídos del .env (Sanitizados):`);
            console.log(` - Host: "${smtpHost}"`);
            console.log(` - User: "${smtpUser}"`);
            console.log(` - Pass: ${smtpPass ? '******** (Cargado)' : 'Vacio'}`);
            console.log("Asegúrate de haber guardado el archivo .env y que los cambios hayan sido cargados por nodemon.");
            console.log("Si el servidor no se reinició automáticamente, escribe 'rs' en la terminal o reinícialo manualmente.\n");

            // Guardar copia local de todas formas para verificar el diseño
            try {
                const tempDir = path.join(__dirname, '..', '..', 'temp_emails');
                if (!fs.existsSync(tempDir)) {
                    fs.mkdirSync(tempDir, { recursive: true });
                }
                const cleanEmailName = correo.replace(/[^a-zA-Z0-9]/g, '_');
                const filePath = path.join(tempDir, `welcome_${cleanEmailName}.html`);
                fs.writeFileSync(filePath, htmlContent, 'utf-8');
            } catch (fsErr) {
                // Silent
            }

            return false;
        }
    }

    static async enviarRechazoAspirante({ correo, nombre, motivoRechazo, nombreCooperativa }) {
        const subject = `Información sobre tu solicitud de afiliación a ${nombreCooperativa}`;
        
        // Plantilla HTML Premium de Rechazo (Gama de Rojos/Grisáceos)
        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background-color: #f8fafc;
                    margin: 0;
                    padding: 20px;
                    color: #334155;
                }
                .email-card {
                    max-width: 600px;
                    background-color: #ffffff;
                    margin: 0 auto;
                    border-radius: 12px;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
                    overflow: hidden;
                    border: 1px solid #e2e8f0;
                }
                .email-header {
                    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                    padding: 30px;
                    text-align: center;
                    color: #ffffff;
                }
                .email-header h1 {
                    margin: 0;
                    font-size: 1.6rem;
                    font-weight: 700;
                }
                .email-body {
                    padding: 30px;
                    line-height: 1.6;
                }
                .email-body p {
                    margin-bottom: 20px;
                }
                .reason-box {
                    background-color: #fef2f2;
                    border-left: 4px solid #ef4444;
                    border-radius: 4px;
                    padding: 20px;
                    margin: 25px 0;
                    color: #991b1b;
                    font-style: italic;
                    font-size: 1rem;
                }
                .reason-title {
                    font-weight: 700;
                    color: #7f1d1d;
                    margin-bottom: 5px;
                    font-style: normal;
                    font-size: 0.9rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .email-footer {
                    background-color: #f8fafc;
                    padding: 20px;
                    text-align: center;
                    font-size: 0.8rem;
                    color: #64748b;
                    border-top: 1px solid #e2e8f0;
                }
            </style>
        </head>
        <body>
            <div class="email-card">
                <div class="email-header">
                    <h1>Estado de Solicitud de Afiliación</h1>
                </div>
                <div class="email-body">
                    <p>Estimado/a <strong>${nombre}</strong>,</p>
                    <p>Agradecemos sinceramente tu interés en formar parte de <strong>${nombreCooperativa}</strong> y por radicar tu solicitud de afiliación a través de nuestra plataforma cooperativa virtual <strong>COOPMONEY</strong>.</p>
                    <p>Lamentamos informarte que, tras un análisis detallado de tu perfil y la documentación provista, tu solicitud de afiliación ha sido <strong>rechazada</strong> en esta oportunidad.</p>
                    
                    <div class="reason-box">
                        <div class="reason-title">Motivo de la Decisión</div>
                        "${motivoRechazo}"
                    </div>
                    
                    <p>Si consideras que puedes subsanar este motivo o si deseas radicar una nueva postulación en el futuro una vez cumplidos los requisitos, estaremos encantados de atenderte nuevamente.</p>
                </div>
                <div class="email-footer">
                    Este es un mensaje automático del departamento de admisiones de ${nombreCooperativa}.<br>
                    &copy; 2026 COOPMONEY. Todos los derechos reservados.
                </div>
            </div>
        </body>
        </html>
        `;

        const rawHost = process.env.SMTP_HOST || '';
        const rawUser = process.env.SMTP_USER || '';
        const rawPass = process.env.SMTP_PASS || '';
        const rawFrom = process.env.SMTP_FROM || '';

        const smtpHost = rawHost.replace(/^['"]|['"]$/g, '').trim();
        const smtpUser = rawUser.replace(/^['"]|['"]$/g, '').trim();
        const smtpPass = rawPass.replace(/^['"]|['"]$/g, '').trim();
        const smtpFrom = rawFrom.replace(/^['"]|['"]$/g, '').replace(/\\/g, '').trim();

        const isSmtpConfigured = smtpHost && 
                                 smtpUser && smtpUser !== 'tu_correo_emisor@gmail.com' && 
                                 smtpPass && smtpPass !== 'tu_clave_de_aplicacion_aqui';

        if (isSmtpConfigured) {
            try {
                const transporter = nodemailer.createTransport({
                    host: smtpHost,
                    port: parseInt(process.env.SMTP_PORT || '465'),
                    secure: smtpHost === 'smtp.gmail.com' || process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
                    auth: { user: smtpUser, pass: smtpPass },
                    tls: { rejectUnauthorized: false }
                });

                const remitente = smtpFrom || `"${nombreCooperativa}" <${smtpUser}>`;

                await transporter.sendMail({
                    from: remitente,
                    to: correo,
                    subject: subject,
                    html: htmlContent
                });

                console.log(`✉️ [REAL] Correo de rechazo enviado con éxito a: ${correo} (Remitente: ${remitente})`);
                return true;
            } catch (err) {
                console.error("❌ Error de envío con el servidor SMTP real:", err.message);
                throw err;
            }
        } else {
            console.log("\n⚠️ [Simulación] Copia local del correo de rechazo generada por falta de credenciales reales.");
            
            try {
                const tempDir = path.join(__dirname, '..', '..', 'temp_emails');
                if (!fs.existsSync(tempDir)) {
                    fs.mkdirSync(tempDir, { recursive: true });
                }
                const cleanEmailName = correo.replace(/[^a-zA-Z0-9]/g, '_');
                const filePath = path.join(tempDir, `rejection_${cleanEmailName}.html`);
                fs.writeFileSync(filePath, htmlContent, 'utf-8');
            } catch (fsErr) {
                // Silent
            }
            return false;
        }
    }

    /**
     * Envío de correo de recuperación de contraseña con clave temporal segura
     */
    static async enviarRecuperacionContrasena({ correo, nombre, contrasenaTemp, nombreCooperativa = 'COOPMONEY' }) {
        const subject = `Recuperación de Contraseña - ${nombreCooperativa} 🔐`;
        
        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background-color: #f1f5f9;
                    margin: 0;
                    padding: 20px;
                    color: #1e293b;
                }
                .email-card {
                    max-width: 600px;
                    background-color: #ffffff;
                    margin: 0 auto;
                    border-radius: 12px;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
                    overflow: hidden;
                    border: 1px solid #e2e8f0;
                }
                .email-header {
                    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                    padding: 30px;
                    text-align: center;
                    color: #ffffff;
                }
                .email-header h1 {
                    margin: 0;
                    font-size: 1.5rem;
                    font-weight: 700;
                }
                .email-body {
                    padding: 30px;
                    line-height: 1.6;
                }
                .cred-box {
                    background-color: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 20px;
                    margin: 25px 0;
                    text-align: center;
                }
                .cred-title {
                    font-weight: 700;
                    color: #475569;
                    margin-bottom: 10px;
                    font-size: 0.9rem;
                    text-transform: uppercase;
                }
                .temp-pass {
                    font-family: monospace;
                    font-size: 1.4rem;
                    font-weight: 700;
                    color: #1d4ed8;
                    background-color: #eff6ff;
                    padding: 8px 16px;
                    border-radius: 6px;
                    letter-spacing: 2px;
                    display: inline-block;
                }
                .warning-box {
                    background-color: #fffbeb;
                    border-left: 4px solid #f59e0b;
                    padding: 12px 16px;
                    margin: 20px 0;
                    font-size: 0.9rem;
                    color: #92400e;
                    border-radius: 0 6px 6px 0;
                }
                .email-footer {
                    background-color: #f8fafc;
                    padding: 20px;
                    text-align: center;
                    font-size: 0.8rem;
                    color: #64748b;
                    border-top: 1px solid #e2e8f0;
                }
            </style>
        </head>
        <body>
            <div class="email-card">
                <div class="email-header">
                    <h1>Restablecimiento de Contraseña</h1>
                </div>
                <div class="email-body">
                    <p>Hola, <strong>${nombre}</strong>:</p>
                    <p>Hemos recibido una solicitud para restablecer la contraseña de acceso a tu cuenta en <strong>${nombreCooperativa}</strong>.</p>
                    
                    <div class="cred-box">
                        <div class="cred-title">Tu nueva contraseña temporal es:</div>
                        <div class="temp-pass">${contrasenaTemp}</div>
                    </div>
                    
                    <div class="warning-box">
                        ⚠️ <strong>Importante:</strong> Por motivos de seguridad, te recomendamos cambiar esta contraseña temporal una vez ingreses al sistema desde tu perfil.
                    </div>
                    
                    <p>Si no realizaste esta solicitud, puedes ignorar este mensaje o contactar al administrador de tu cooperativa.</p>
                </div>
                <div class="email-footer">
                    &copy; 2026 ${nombreCooperativa} - Plataforma COOPMONEY. Todos los derechos reservados.
                </div>
            </div>
        </body>
        </html>
        `;

        const rawHost = process.env.SMTP_HOST || '';
        const rawUser = process.env.SMTP_USER || '';
        const rawPass = process.env.SMTP_PASS || '';
        const rawFrom = process.env.SMTP_FROM || '';

        const smtpHost = rawHost.replace(/^['"]|['"]$/g, '').trim();
        const smtpUser = rawUser.replace(/^['"]|['"]$/g, '').trim();
        const smtpPass = rawPass.replace(/^['"]|['"]$/g, '').trim();
        const smtpFrom = rawFrom.replace(/^['"]|['"]$/g, '').replace(/\\/g, '').trim();

        const isSmtpConfigured = smtpHost && 
                                 smtpUser && smtpUser !== 'tu_correo_emisor@gmail.com' && 
                                 smtpPass && smtpPass !== 'tu_clave_de_aplicacion_aqui';

        if (isSmtpConfigured) {
            try {
                const transporter = nodemailer.createTransport({
                    host: smtpHost,
                    port: parseInt(process.env.SMTP_PORT || '465'),
                    secure: smtpHost === 'smtp.gmail.com' || process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
                    auth: { user: smtpUser, pass: smtpPass },
                    tls: { rejectUnauthorized: false }
                });

                const remitente = smtpFrom || `"${nombreCooperativa}" <${smtpUser}>`;

                await transporter.sendMail({
                    from: remitente,
                    to: correo,
                    subject: subject,
                    html: htmlContent
                });

                console.log(`✉️ [REAL] Correo de recuperación enviado con éxito a: ${correo}`);
                return true;
            } catch (err) {
                console.error("❌ Error enviando correo de recuperación con SMTP:", err.message);
                throw err;
            }
        } else {
            console.log(`\n⚠️ [Simulación] Copia local del correo de recuperación generada para: ${correo}`);
            try {
                const tempDir = path.join(__dirname, '..', '..', 'temp_emails');
                if (!fs.existsSync(tempDir)) {
                    fs.mkdirSync(tempDir, { recursive: true });
                }
                const cleanEmailName = correo.replace(/[^a-zA-Z0-9]/g, '_');
                const filePath = path.join(tempDir, `recovery_${cleanEmailName}.html`);
                fs.writeFileSync(filePath, htmlContent, 'utf-8');
                console.log(`📁 Correo guardado en: ${filePath}`);
            } catch (fsErr) {
                // Silent
            }
            return false;
        }
    }
}

module.exports = EmailService;
