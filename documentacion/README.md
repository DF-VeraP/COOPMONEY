# COOPMONEY - Documentación Técnica Integral del Sistema

Bienvenido a la documentación técnica oficial de **COOPMONEY**, la plataforma web multi-cooperativa para la administración y control integral de créditos, ahorros, cartera y asociados en el sector solidario colombiano.

Este repositorio documental recopila la especificación de módulos por rol de usuario, los contratos de endpoints de la API REST, la arquitectura de base de datos relacional (PostgreSQL), los mecanismos de seguridad RBAC y el cumplimiento estricto de la **Propuesta Técnica SENA (Competencia 220501094 - ADSO)**.

---

## 1. Arquitectura General del Sistema

COOPMONEY está diseñado bajo una arquitectura de capas con enfoque multi-inquilino (*Multi-Tenant*), lo que permite que múltiples entidades cooperativas compartan la misma infraestructura conservando aislamiento total y confidencialidad en sus datos:

```
                  ┌────────────────────────────────────────┐
                  │          CAPA DE PRESENTACIÓN          │
                  │   HTML5 + Vanilla CSS + JavaScript ES6 │
                  │  (Dashboards específicos por cada rol) │
                  └───────────────────┬────────────────────┘
                                      │  HTTPS / REST JSON
                                      ▼
                  ┌────────────────────────────────────────┐
                  │       CAPA DE SEGURIDAD Y ENTRADA      │
                  │ Helmet + CORS + Express Rate Limiters │
                  │     JWT Authentication + Auth RBAC     │
                  └───────────────────┬────────────────────┘
                                      │
                                      ▼
                  ┌────────────────────────────────────────┐
                  │          CAPA DE CONTROLADORES         │
                  │   Auth / Superadmin / API Controllers  │
                  └───────────────────┬────────────────────┘
                                      │
                                      ▼
                  ┌────────────────────────────────────────┐
                  │          CAPA DE SERVICIOS             │
                  │ ReceiptService / CertificateService /  │
                  │              EmailService              │
                  └───────────────────┬────────────────────┘
                                      │
                                      ▼
                  ┌────────────────────────────────────────┐
                  │      CAPA DE MODELOS Y PERSISTENCIA    │
                  │       PostgreSQL Relacional (pg)       │
                  │  Esquema con llaves foráneas y checks  │
                  └────────────────────────────────────────┘
```

---

## 2. Mapa de Roles y Módulos del Sistema

Cada rol del sistema cuenta con su propio directorio de documentación técnica detallada:

### 👑 [Superadmin](./Superadmin/)
Acceso global a toda la plataforma multi-cooperativa.
* [Módulo de Gestión de Cooperativas](./Superadmin/modulo_gestion_cooperativas.md) (RF001, RF002, RF003, RF005)
* [Módulo de Métricas Globales](./Superadmin/modulo_metricas_globales.md) (RF004)
* [Módulo de Solicitudes de Afiliación](./Superadmin/modulo_solicitudes_afiliacion.md) (Aprobación de nuevas entidades)

### 🏢 [Admin Local](./Admin_Local/)
Responsable de la administración interna de una cooperativa específica.
* [Módulo de Gestión de Usuarios y Roles](./Admin_Local/modulo_gestion_usuarios.md) (RF045 - RF051)
* [Módulo de Configuración de Cooperativa](./Admin_Local/modulo_configuracion_cooperativa.md) (Parámetros institucionales)

### 📊 [Gerente](./Gerente/)
Visualización ejecutiva de la salud financiera y control de cartera.
* [Módulo de Reportes de Cartera](./Gerente/modulo_reportes_cartera.md) (RF037 - RF039)
* [Módulo de Indicadores KPI y Exportación](./Gerente/modulo_indicadores_kpi.md) (RF040 - RF044)

### 📋 [Analista de Crédito](./Analista/)
Estudio de viabilidad de nuevos asociados y solicitudes de préstamo.
* [Módulo de Estudio de Aspirantes](./Analista/modulo_estudio_aspirantes.md) (RF010 - RF015)
* [Módulo de Evaluación de Créditos](./Analista/modulo_evaluacion_creditos.md) (Aprobación/Rechazo de préstamos)

### 💵 [Cajero](./Cajero/)
Atención en ventanilla para recaudos y atención al asociado.
* [Módulo de Recaudo en Ventanilla](./Cajero/modulo_recaudo_ventanilla.md) (RF029 - RF034)
* [Módulo de Emisión de Certificados y Recibos](./Cajero/modulo_emision_certificados.md) (RF035 - RF036)

### 💼 [Gestor Financiero](./Gestor_Financiero/)
Parametrización de líneas crediticias y cobranza preventiva.
* [Módulo de Líneas de Crédito y Tasas](./Gestor_Financiero/modulo_lineas_credito.md) (RF052 - RF054, RNF01)
* [Módulo de Gestión de Mora y Cobranza](./Gestor_Financiero/modulo_gestion_mora_cobranza.md) (RF055 - RF061)

### 👤 [Socio](./Socio/)
Autogestión de préstamos, ahorros y certificaciones del asociado.
* [Módulo del Portal del Socio](./Socio/modulo_portal_socio.md) (RF016 - RF018)
* [Módulo de Solicitud y Simulación](./Socio/modulo_solicitud_simulacion.md) (RF019 - RF022, RF02)
* [Módulo de Pagos y Certificaciones](./Socio/modulo_pagos_certificados.md) (RF023 - RF028, RNF02)

### ⚙️ [Sistema y Reglas Automáticas](./Sistema_Reglas/)
Motor matemático y automatizaciones centrales de negocio.
* [Módulo del Motor de Amortización y Cálculo de Mora](./Sistema_Reglas/modulo_motor_amortizacion_mora.md) (RF062 - RF067, RF04)

---

## 3. Acervo de Requisitos y Materiales Iniciales

Los archivos originales del proyecto y guías analíticas se encuentran centralizados en:
* [`documentacion/archivos_para_ia/`](./archivos_para_ia/)
  * `Propuesta_ADSO_DanielVera.pdf` (Propuesta técnica oficial SENA)
  * `RQF_COOPMONEY.txt` (Requerimientos funcionales numerados RF001-RF067)
  * `RQNF_COOPMONEY.txt` (Requerimientos no funcionales RNF001-RNF014)
  * `HU_COOPMONEY.txt` (Historias de usuario detalladas con criterios de aceptación)
  * `Documentacion_COOPMONEY/` (Estudios de viabilidad y requisitos formales)
