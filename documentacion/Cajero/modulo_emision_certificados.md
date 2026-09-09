# Módulo: Emisión de Certificados y Consultas (Cajero)

## 1. Identificación y Alcance
* **Rol Responsable:** `cajero`
* **Requerimientos Asociados:**
  * **RF035:** Ver historial completo de pagos del socio con filtros por rango de fechas.
  * **RF036:** Generar y entregar certificados impresos o en PDF al socio que se acerque a ventanilla (Paz y Salvo, Certificado de Deuda, Afiliación, Ahorros).

---

## 2. Endpoints de la API REST

### 2.1. Certificados Emitibles por el Cajero
* **Paz y Salvo:** `GET /api/cajero/socios/:socioId/certificados/pazysalvo`
* **Certificado de Deuda / Estado de Cuenta:** `GET /api/cajero/socios/:socioId/certificados/estado-cuenta`
* **Certificado de Afiliación:** `GET /api/cajero/socios/:socioId/certificados/afiliacion`
* **Certificado de Ahorros:** `GET /api/cajero/socios/:socioId/certificados/ahorros`

### 2.2. Historial de Transacciones
* **Ruta:** `GET /api/socio/historial-completo/:socioId`
* Permite consultar la trazabilidad histórica de todos los créditos tomados, pagos realizados y movimientos de ahorros.

---

## 3. Servicio de Generación de Certificados
* **Servicio:** `CertificateService` ([src/services/certificate.service.js](file:///c:/Users/Lenovo/Documents/SENA/COOPMONEY/Coopmoney_proyect/src/services/certificate.service.js)).
* Genera documentos PDF seguros con tipografía Helvética, escudo/logo institucional, código de verificación y firma del representante o revisoría fiscal.
