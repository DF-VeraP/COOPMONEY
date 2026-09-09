# Módulo: Pagos y Certificaciones (Socio)

## 1. Identificación y Alcance
* **Rol Responsable:** `socio`
* **Requerimientos Asociados:**
  * **RF023:** Pagar una cuota directamente desde la plataforma web.
  * **RF024 / RF025:** Al momento de pagar, el sistema consulta voluntariamente: *"¿Deseas pagar con tus ahorros disponibles (\$X)?"*. El socio decide libremente.
  * **RF026:** Posibilidad de realizar abonos a capital o pagos anticipados con reducción de intereses futuros.
  * **RF027 / RNF02:** Descargar certificado de **Paz y Salvo** en PDF una vez el crédito esté pagado al 100%.
  * **RF028 / RNF02:** Descargar certificado de **Deuda / Estado de Cuenta** en cualquier momento.

---

## 2. Endpoints de la API REST

### 2.1. Pagar Cuota con Ahorros Disponibles
* **Ruta:** `POST /api/socio/pagar-ahorro`
* **Cuerpo de la Solicitud:**
```json
{
  "id_socio": 5,
  "id_credito": 12,
  "id_cuota": 45,
  "monto": 458333.33
}
```
* **Procesamiento Atómico:**
  1. Verifica que `saldo_ahorro >= monto`.
  2. Debita el valor de la tabla `socio`.
  3. Registra el movimiento en `movimiento_ahorro`.
  4. Marca la cuota como `'pagada'`.
  5. Inserta el registro en la tabla `pago`.

### 2.2. Descarga de Certificados Oficiales en PDF

| Certificado | Endpoint | Condición de Emisión |
| :--- | :--- | :--- |
| **Paz y Salvo** | `GET /api/socio/certificados/pazysalvo?socioId=:id` | No tener créditos activos con saldo pendiente > 0 |
| **Estado de Cuenta** | `GET /api/socio/certificados/estado-cuenta?socioId=:id` | Siempre disponible con el balance al día |
| **Certificado de Afiliación** | `GET /api/socio/certificados/afiliacion?socioId=:id` | Socio en estado `'activo'` |
| **Certificado de Ahorros** | `GET /api/socio/certificados/ahorros?socioId=:id` | Saldo actual de ahorros certificado |

---

## 3. Seguridad en la Emisión de Documentos
* Generados por `CertificateService` con PDFKit.
* Contiene código alfanumérico único para auditoría y validación documental.
