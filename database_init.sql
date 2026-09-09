--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.usuario DROP CONSTRAINT IF EXISTS usuario_id_cooperativa_usuario_fkey;
ALTER TABLE IF EXISTS ONLY public.solicitud_credito DROP CONSTRAINT IF EXISTS solicitud_credito_id_socio_solicitud_fkey;
ALTER TABLE IF EXISTS ONLY public.solicitud_credito DROP CONSTRAINT IF EXISTS solicitud_credito_id_simulacion_solicitud_fkey;
ALTER TABLE IF EXISTS ONLY public.solicitud_credito DROP CONSTRAINT IF EXISTS solicitud_credito_id_linea_solicitud_fkey;
ALTER TABLE IF EXISTS ONLY public.solicitud_credito DROP CONSTRAINT IF EXISTS solicitud_credito_id_config_solicitud_fkey;
ALTER TABLE IF EXISTS ONLY public.solicitud_credito DROP CONSTRAINT IF EXISTS solicitud_credito_id_analista_solicitud_fkey;
ALTER TABLE IF EXISTS ONLY public.socio DROP CONSTRAINT IF EXISTS socio_id_usuario_socio_fkey;
ALTER TABLE IF EXISTS ONLY public.socio DROP CONSTRAINT IF EXISTS socio_id_cooperativa_socio_fkey;
ALTER TABLE IF EXISTS ONLY public.simulacion DROP CONSTRAINT IF EXISTS simulacion_id_socio_simulacion_fkey;
ALTER TABLE IF EXISTS ONLY public.simulacion DROP CONSTRAINT IF EXISTS simulacion_id_linea_simulacion_fkey;
ALTER TABLE IF EXISTS ONLY public.simulacion DROP CONSTRAINT IF EXISTS simulacion_id_config_simulacion_fkey;
ALTER TABLE IF EXISTS ONLY public.reestructuracion DROP CONSTRAINT IF EXISTS reestructuracion_id_gestor_reestruc_fkey;
ALTER TABLE IF EXISTS ONLY public.reestructuracion DROP CONSTRAINT IF EXISTS reestructuracion_id_credito_reestruc_fkey;
ALTER TABLE IF EXISTS ONLY public.pago DROP CONSTRAINT IF EXISTS pago_id_socio_pago_fkey;
ALTER TABLE IF EXISTS ONLY public.pago DROP CONSTRAINT IF EXISTS pago_id_cajero_pago_fkey;
ALTER TABLE IF EXISTS ONLY public.pago_detalle DROP CONSTRAINT IF EXISTS pago_detalle_id_pago_pagodetalle_fkey;
ALTER TABLE IF EXISTS ONLY public.pago_detalle DROP CONSTRAINT IF EXISTS pago_detalle_id_cuota_pagodetalle_fkey;
ALTER TABLE IF EXISTS ONLY public.notificacion DROP CONSTRAINT IF EXISTS notificacion_id_socio_notificacion_fkey;
ALTER TABLE IF EXISTS ONLY public.notificacion DROP CONSTRAINT IF EXISTS notificacion_id_credito_notificacion_fkey;
ALTER TABLE IF EXISTS ONLY public.notificacion DROP CONSTRAINT IF EXISTS notificacion_id_aspirante_notificacion_fkey;
ALTER TABLE IF EXISTS ONLY public.movimiento_ahorro DROP CONSTRAINT IF EXISTS movimiento_ahorro_id_socio_movimiento_fkey;
ALTER TABLE IF EXISTS ONLY public.movimiento_ahorro DROP CONSTRAINT IF EXISTS movimiento_ahorro_id_pago_movimiento_fkey;
ALTER TABLE IF EXISTS ONLY public.linea_credito DROP CONSTRAINT IF EXISTS linea_credito_id_cooperativa_linea_fkey;
ALTER TABLE IF EXISTS ONLY public.historial_analista DROP CONSTRAINT IF EXISTS historial_analista_id_aspirante_historial_fkey;
ALTER TABLE IF EXISTS ONLY public.historial_analista DROP CONSTRAINT IF EXISTS historial_analista_id_analista_historial_fkey;
ALTER TABLE IF EXISTS ONLY public.gestion_cobro DROP CONSTRAINT IF EXISTS gestion_cobro_id_gestor_gestion_fkey;
ALTER TABLE IF EXISTS ONLY public.gestion_cobro DROP CONSTRAINT IF EXISTS gestion_cobro_id_credito_gestion_fkey;
ALTER TABLE IF EXISTS ONLY public.documento_generado DROP CONSTRAINT IF EXISTS documento_generado_id_usuario_documento_fkey;
ALTER TABLE IF EXISTS ONLY public.documento_generado DROP CONSTRAINT IF EXISTS documento_generado_id_socio_documento_fkey;
ALTER TABLE IF EXISTS ONLY public.documento_generado DROP CONSTRAINT IF EXISTS documento_generado_id_credito_documento_fkey;
ALTER TABLE IF EXISTS ONLY public.cuota DROP CONSTRAINT IF EXISTS cuota_id_credito_cuota_fkey;
ALTER TABLE IF EXISTS ONLY public.credito DROP CONSTRAINT IF EXISTS credito_id_solicitud_credito_fkey;
ALTER TABLE IF EXISTS ONLY public.credito DROP CONSTRAINT IF EXISTS credito_id_socio_credito_fkey;
ALTER TABLE IF EXISTS ONLY public.credito DROP CONSTRAINT IF EXISTS credito_id_linea_credito_fkey;
ALTER TABLE IF EXISTS ONLY public.config_linea DROP CONSTRAINT IF EXISTS config_linea_id_linea_config_fkey;
ALTER TABLE IF EXISTS ONLY public.config_linea DROP CONSTRAINT IF EXISTS config_linea_id_gestor_config_fkey;
ALTER TABLE IF EXISTS ONLY public.castigo_cartera DROP CONSTRAINT IF EXISTS castigo_cartera_id_gestor_castigo_fkey;
ALTER TABLE IF EXISTS ONLY public.castigo_cartera DROP CONSTRAINT IF EXISTS castigo_cartera_id_gerente_castigo_fkey;
ALTER TABLE IF EXISTS ONLY public.castigo_cartera DROP CONSTRAINT IF EXISTS castigo_cartera_id_credito_castigo_fkey;
ALTER TABLE IF EXISTS ONLY public.aspirante DROP CONSTRAINT IF EXISTS aspirante_id_cooperativa_aspirante_fkey;
ALTER TABLE IF EXISTS ONLY public.aspirante DROP CONSTRAINT IF EXISTS aspirante_id_analista_aspirante_fkey;
DROP INDEX IF EXISTS public.idx_usuario_coop;
DROP INDEX IF EXISTS public.idx_solicitud_socio;
DROP INDEX IF EXISTS public.idx_socio_coop;
DROP INDEX IF EXISTS public.idx_simulacion_socio;
DROP INDEX IF EXISTS public.idx_pagodetalle_pago;
DROP INDEX IF EXISTS public.idx_pagodetalle_cuota;
DROP INDEX IF EXISTS public.idx_pago_socio;
DROP INDEX IF EXISTS public.idx_pago_fecha;
DROP INDEX IF EXISTS public.idx_notif_pendiente;
DROP INDEX IF EXISTS public.idx_movimiento_socio;
DROP INDEX IF EXISTS public.idx_linea_coop;
DROP INDEX IF EXISTS public.idx_gestion_credito;
DROP INDEX IF EXISTS public.idx_doc_vigente;
DROP INDEX IF EXISTS public.idx_cuota_vencimiento;
DROP INDEX IF EXISTS public.idx_cuota_vencida_pendiente;
DROP INDEX IF EXISTS public.idx_cuota_estado;
DROP INDEX IF EXISTS public.idx_cuota_credito;
DROP INDEX IF EXISTS public.idx_credito_socio;
DROP INDEX IF EXISTS public.idx_credito_estado;
DROP INDEX IF EXISTS public.idx_castigo_estado;
DROP INDEX IF EXISTS public.idx_aspirante_coop;
ALTER TABLE IF EXISTS ONLY public.usuario DROP CONSTRAINT IF EXISTS usuario_pkey;
ALTER TABLE IF EXISTS ONLY public.usuario DROP CONSTRAINT IF EXISTS usuario_id_cooperativa_usuario_documento_usuario_key;
ALTER TABLE IF EXISTS ONLY public.usuario DROP CONSTRAINT IF EXISTS usuario_correo_usuario_key;
ALTER TABLE IF EXISTS ONLY public.solicitud_credito DROP CONSTRAINT IF EXISTS solicitud_credito_pkey;
ALTER TABLE IF EXISTS ONLY public.solicitud_afiliacion DROP CONSTRAINT IF EXISTS solicitud_afiliacion_pkey;
ALTER TABLE IF EXISTS ONLY public.socio DROP CONSTRAINT IF EXISTS socio_pkey;
ALTER TABLE IF EXISTS ONLY public.socio DROP CONSTRAINT IF EXISTS socio_id_usuario_socio_key;
ALTER TABLE IF EXISTS ONLY public.simulacion DROP CONSTRAINT IF EXISTS simulacion_pkey;
ALTER TABLE IF EXISTS ONLY public.reestructuracion DROP CONSTRAINT IF EXISTS reestructuracion_pkey;
ALTER TABLE IF EXISTS ONLY public.pago DROP CONSTRAINT IF EXISTS pago_pkey;
ALTER TABLE IF EXISTS ONLY public.pago DROP CONSTRAINT IF EXISTS pago_numero_recibo_pago_key;
ALTER TABLE IF EXISTS ONLY public.pago_detalle DROP CONSTRAINT IF EXISTS pago_detalle_pkey;
ALTER TABLE IF EXISTS ONLY public.notificacion DROP CONSTRAINT IF EXISTS notificacion_pkey;
ALTER TABLE IF EXISTS ONLY public.movimiento_ahorro DROP CONSTRAINT IF EXISTS movimiento_ahorro_pkey;
ALTER TABLE IF EXISTS ONLY public.linea_credito DROP CONSTRAINT IF EXISTS linea_credito_pkey;
ALTER TABLE IF EXISTS ONLY public.linea_credito DROP CONSTRAINT IF EXISTS linea_credito_id_cooperativa_linea_nombre_linea_key;
ALTER TABLE IF EXISTS ONLY public.historial_analista DROP CONSTRAINT IF EXISTS historial_analista_pkey;
ALTER TABLE IF EXISTS ONLY public.gestion_cobro DROP CONSTRAINT IF EXISTS gestion_cobro_pkey;
ALTER TABLE IF EXISTS ONLY public.documento_generado DROP CONSTRAINT IF EXISTS documento_generado_pkey;
ALTER TABLE IF EXISTS ONLY public.documento_generado DROP CONSTRAINT IF EXISTS documento_generado_numero_documento_key;
ALTER TABLE IF EXISTS ONLY public.cuota DROP CONSTRAINT IF EXISTS cuota_pkey;
ALTER TABLE IF EXISTS ONLY public.cuota DROP CONSTRAINT IF EXISTS cuota_id_credito_cuota_numero_cuota_key;
ALTER TABLE IF EXISTS ONLY public.credito DROP CONSTRAINT IF EXISTS credito_pkey;
ALTER TABLE IF EXISTS ONLY public.credito DROP CONSTRAINT IF EXISTS credito_id_solicitud_credito_key;
ALTER TABLE IF EXISTS ONLY public.cooperativa DROP CONSTRAINT IF EXISTS cooperativa_pkey;
ALTER TABLE IF EXISTS ONLY public.cooperativa DROP CONSTRAINT IF EXISTS cooperativa_nit_cooperativa_key;
ALTER TABLE IF EXISTS ONLY public.cooperativa DROP CONSTRAINT IF EXISTS cooperativa_correo_cooperativa_key;
ALTER TABLE IF EXISTS ONLY public.config_linea DROP CONSTRAINT IF EXISTS config_linea_pkey;
ALTER TABLE IF EXISTS ONLY public.castigo_cartera DROP CONSTRAINT IF EXISTS castigo_cartera_pkey;
ALTER TABLE IF EXISTS ONLY public.castigo_cartera DROP CONSTRAINT IF EXISTS castigo_cartera_id_credito_castigo_key;
ALTER TABLE IF EXISTS ONLY public.aspirante DROP CONSTRAINT IF EXISTS aspirante_pkey;
ALTER TABLE IF EXISTS ONLY public.aspirante DROP CONSTRAINT IF EXISTS aspirante_id_cooperativa_aspirante_documento_aspirante_key;
ALTER TABLE IF EXISTS public.usuario ALTER COLUMN id_usuario DROP DEFAULT;
ALTER TABLE IF EXISTS public.solicitud_credito ALTER COLUMN id_solicitud DROP DEFAULT;
ALTER TABLE IF EXISTS public.solicitud_afiliacion ALTER COLUMN id_solicitud DROP DEFAULT;
ALTER TABLE IF EXISTS public.socio ALTER COLUMN id_socio DROP DEFAULT;
ALTER TABLE IF EXISTS public.simulacion ALTER COLUMN id_simulacion DROP DEFAULT;
ALTER TABLE IF EXISTS public.reestructuracion ALTER COLUMN id_reestruc DROP DEFAULT;
ALTER TABLE IF EXISTS public.pago_detalle ALTER COLUMN id_pago_detalle DROP DEFAULT;
ALTER TABLE IF EXISTS public.pago ALTER COLUMN id_pago DROP DEFAULT;
ALTER TABLE IF EXISTS public.notificacion ALTER COLUMN id_notificacion DROP DEFAULT;
ALTER TABLE IF EXISTS public.movimiento_ahorro ALTER COLUMN id_movimiento DROP DEFAULT;
ALTER TABLE IF EXISTS public.linea_credito ALTER COLUMN id_linea_credito DROP DEFAULT;
ALTER TABLE IF EXISTS public.historial_analista ALTER COLUMN id_historial DROP DEFAULT;
ALTER TABLE IF EXISTS public.gestion_cobro ALTER COLUMN id_gestion DROP DEFAULT;
ALTER TABLE IF EXISTS public.documento_generado ALTER COLUMN id_documento DROP DEFAULT;
ALTER TABLE IF EXISTS public.cuota ALTER COLUMN id_cuota DROP DEFAULT;
ALTER TABLE IF EXISTS public.credito ALTER COLUMN id_credito DROP DEFAULT;
ALTER TABLE IF EXISTS public.cooperativa ALTER COLUMN id_cooperativa DROP DEFAULT;
ALTER TABLE IF EXISTS public.config_linea ALTER COLUMN id_config DROP DEFAULT;
ALTER TABLE IF EXISTS public.castigo_cartera ALTER COLUMN id_castigo DROP DEFAULT;
ALTER TABLE IF EXISTS public.aspirante ALTER COLUMN id_aspirante DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.usuario_id_usuario_seq;
DROP TABLE IF EXISTS public.usuario;
DROP SEQUENCE IF EXISTS public.solicitud_credito_id_solicitud_seq;
DROP TABLE IF EXISTS public.solicitud_credito;
DROP SEQUENCE IF EXISTS public.solicitud_afiliacion_id_solicitud_seq;
DROP TABLE IF EXISTS public.solicitud_afiliacion;
DROP SEQUENCE IF EXISTS public.socio_id_socio_seq;
DROP TABLE IF EXISTS public.socio;
DROP SEQUENCE IF EXISTS public.simulacion_id_simulacion_seq;
DROP TABLE IF EXISTS public.simulacion;
DROP SEQUENCE IF EXISTS public.reestructuracion_id_reestruc_seq;
DROP TABLE IF EXISTS public.reestructuracion;
DROP SEQUENCE IF EXISTS public.pago_id_pago_seq;
DROP SEQUENCE IF EXISTS public.pago_detalle_id_pago_detalle_seq;
DROP TABLE IF EXISTS public.pago_detalle;
DROP TABLE IF EXISTS public.pago;
DROP SEQUENCE IF EXISTS public.notificacion_id_notificacion_seq;
DROP TABLE IF EXISTS public.notificacion;
DROP SEQUENCE IF EXISTS public.movimiento_ahorro_id_movimiento_seq;
DROP TABLE IF EXISTS public.movimiento_ahorro;
DROP SEQUENCE IF EXISTS public.linea_credito_id_linea_credito_seq;
DROP TABLE IF EXISTS public.linea_credito;
DROP SEQUENCE IF EXISTS public.historial_analista_id_historial_seq;
DROP TABLE IF EXISTS public.historial_analista;
DROP SEQUENCE IF EXISTS public.gestion_cobro_id_gestion_seq;
DROP TABLE IF EXISTS public.gestion_cobro;
DROP SEQUENCE IF EXISTS public.documento_generado_id_documento_seq;
DROP TABLE IF EXISTS public.documento_generado;
DROP SEQUENCE IF EXISTS public.cuota_id_cuota_seq;
DROP TABLE IF EXISTS public.cuota;
DROP SEQUENCE IF EXISTS public.credito_id_credito_seq;
DROP TABLE IF EXISTS public.credito;
DROP SEQUENCE IF EXISTS public.cooperativa_id_cooperativa_seq;
DROP TABLE IF EXISTS public.cooperativa;
DROP SEQUENCE IF EXISTS public.config_linea_id_config_seq;
DROP TABLE IF EXISTS public.config_linea;
DROP SEQUENCE IF EXISTS public.castigo_cartera_id_castigo_seq;
DROP TABLE IF EXISTS public.castigo_cartera;
DROP SEQUENCE IF EXISTS public.aspirante_id_aspirante_seq;
DROP TABLE IF EXISTS public.aspirante;
DROP TYPE IF EXISTS public.tipo_movimiento;
DROP TYPE IF EXISTS public.tipo_mora;
DROP TYPE IF EXISTS public.tipo_documento;
DROP TYPE IF EXISTS public.tipo_contrato;
DROP TYPE IF EXISTS public.rol_usuario;
DROP TYPE IF EXISTS public.medio_contacto_enum;
DROP TYPE IF EXISTS public.estado_solicitud;
DROP TYPE IF EXISTS public.estado_general;
DROP TYPE IF EXISTS public.estado_cuota;
DROP TYPE IF EXISTS public.estado_credito;
DROP TYPE IF EXISTS public.estado_castigo;
DROP TYPE IF EXISTS public.estado_aspirante;
DROP TYPE IF EXISTS public.canal_pago;
DROP TYPE IF EXISTS public.accion_analista;
--
-- Name: accion_analista; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.accion_analista AS ENUM (
    'aprobado',
    'rechazado'
);


ALTER TYPE public.accion_analista OWNER TO postgres;

--
-- Name: canal_pago; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.canal_pago AS ENUM (
    'virtual',
    'presencial'
);


ALTER TYPE public.canal_pago OWNER TO postgres;

--
-- Name: estado_aspirante; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_aspirante AS ENUM (
    'pendiente',
    'aprobado',
    'rechazado'
);


ALTER TYPE public.estado_aspirante OWNER TO postgres;

--
-- Name: estado_castigo; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_castigo AS ENUM (
    'propuesto',
    'aprobado',
    'rechazado'
);


ALTER TYPE public.estado_castigo OWNER TO postgres;

--
-- Name: estado_credito; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_credito AS ENUM (
    'activo',
    'pagado',
    'vencido',
    'reestructurado',
    'castigado',
    'rechazado'
);


ALTER TYPE public.estado_credito OWNER TO postgres;

--
-- Name: estado_cuota; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_cuota AS ENUM (
    'pendiente',
    'pagada',
    'vencida',
    'condonada'
);


ALTER TYPE public.estado_cuota OWNER TO postgres;

--
-- Name: estado_general; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_general AS ENUM (
    'activo',
    'inactivo',
    'pendiente'
);


ALTER TYPE public.estado_general OWNER TO postgres;

--
-- Name: estado_solicitud; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_solicitud AS ENUM (
    'pendiente',
    'aprobada',
    'rechazada',
    'desembolsada'
);


ALTER TYPE public.estado_solicitud OWNER TO postgres;

--
-- Name: medio_contacto_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.medio_contacto_enum AS ENUM (
    'telefono',
    'correo',
    'visita',
    'whatsapp'
);


ALTER TYPE public.medio_contacto_enum OWNER TO postgres;

--
-- Name: rol_usuario; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.rol_usuario AS ENUM (
    'super_admin',
    'admin_local',
    'analista',
    'cajero',
    'gerente',
    'gestor_financiero',
    'socio'
);


ALTER TYPE public.rol_usuario OWNER TO postgres;

--
-- Name: tipo_contrato; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tipo_contrato AS ENUM (
    'indefinido',
    'fijo',
    'obra_labor',
    'prestacion_servicios',
    'independiente'
);


ALTER TYPE public.tipo_contrato OWNER TO postgres;

--
-- Name: tipo_documento; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tipo_documento AS ENUM (
    'paz_y_salvo',
    'certificado_deuda',
    'tabla_amortizacion',
    'recibo_pago'
);


ALTER TYPE public.tipo_documento OWNER TO postgres;

--
-- Name: tipo_mora; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tipo_mora AS ENUM (
    'leve',
    'preocupante',
    'critica',
    'castigada'
);


ALTER TYPE public.tipo_mora OWNER TO postgres;

--
-- Name: tipo_movimiento; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tipo_movimiento AS ENUM (
    'deposito',
    'retiro'
);


ALTER TYPE public.tipo_movimiento OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: aspirante; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.aspirante (
    id_aspirante integer NOT NULL,
    id_cooperativa_aspirante integer NOT NULL,
    nombre_aspirante character varying(200) NOT NULL,
    documento_aspirante character varying(20) NOT NULL,
    correo_aspirante character varying(150) NOT NULL,
    telefono_aspirante character varying(20),
    direccion_aspirante character varying(300),
    ocupacion_aspirante character varying(150),
    ingresos_aspirante numeric(15,2),
    estado_aspirante public.estado_aspirante DEFAULT 'pendiente'::public.estado_aspirante NOT NULL,
    motivo_rechazo_aspirante text,
    id_analista_aspirante integer,
    fecha_solicitud_aspirante timestamp without time zone DEFAULT now() NOT NULL,
    fecha_revision_aspirante timestamp without time zone
);


ALTER TABLE public.aspirante OWNER TO postgres;

--
-- Name: TABLE aspirante; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.aspirante IS 'Sin acceso al sistema hasta ser aprobado por el analista';


--
-- Name: COLUMN aspirante.motivo_rechazo_aspirante; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.aspirante.motivo_rechazo_aspirante IS 'Obligatorio cuando estado_aspirante = rechazado (RF009)';


--
-- Name: aspirante_id_aspirante_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.aspirante_id_aspirante_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.aspirante_id_aspirante_seq OWNER TO postgres;

--
-- Name: aspirante_id_aspirante_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.aspirante_id_aspirante_seq OWNED BY public.aspirante.id_aspirante;


--
-- Name: castigo_cartera; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.castigo_cartera (
    id_castigo integer NOT NULL,
    id_credito_castigo integer NOT NULL,
    id_gestor_castigo integer NOT NULL,
    id_gerente_castigo integer,
    monto_castigado_castigo numeric(15,2) NOT NULL,
    saldo_al_castigo numeric(15,2) NOT NULL,
    motivo_castigo text NOT NULL,
    fecha_propuesta_castigo date DEFAULT CURRENT_DATE NOT NULL,
    fecha_aprobacion_castigo date,
    estado_castigo public.estado_castigo DEFAULT 'propuesto'::public.estado_castigo NOT NULL,
    CONSTRAINT castigo_cartera_monto_castigado_castigo_check CHECK ((monto_castigado_castigo > (0)::numeric))
);


ALTER TABLE public.castigo_cartera OWNER TO postgres;

--
-- Name: TABLE castigo_cartera; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.castigo_cartera IS 'Créditos dados por pérdidos con 61+ días de mora (RF05, RF060)';


--
-- Name: COLUMN castigo_cartera.id_gerente_castigo; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.castigo_cartera.id_gerente_castigo IS 'NULL hasta que el gerente aprueba o rechaza la propuesta';


--
-- Name: castigo_cartera_id_castigo_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.castigo_cartera_id_castigo_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.castigo_cartera_id_castigo_seq OWNER TO postgres;

--
-- Name: castigo_cartera_id_castigo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.castigo_cartera_id_castigo_seq OWNED BY public.castigo_cartera.id_castigo;


--
-- Name: config_linea; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.config_linea (
    id_config integer NOT NULL,
    id_linea_config integer NOT NULL,
    id_gestor_config integer NOT NULL,
    tasa_interes_config numeric(6,4) NOT NULL,
    tasa_moratoria_config numeric(6,4) NOT NULL,
    plazo_min_config integer NOT NULL,
    plazo_max_config integer NOT NULL,
    monto_min_config numeric(15,2) NOT NULL,
    monto_max_config numeric(15,2) NOT NULL,
    fecha_actualizacion_config timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT config_linea_check CHECK ((plazo_max_config >= plazo_min_config)),
    CONSTRAINT config_linea_check1 CHECK ((monto_max_config >= monto_min_config)),
    CONSTRAINT config_linea_monto_min_config_check CHECK ((monto_min_config > (0)::numeric)),
    CONSTRAINT config_linea_plazo_min_config_check CHECK ((plazo_min_config > 0)),
    CONSTRAINT config_linea_tasa_interes_config_check CHECK ((tasa_interes_config > (0)::numeric)),
    CONSTRAINT config_linea_tasa_moratoria_config_check CHECK ((tasa_moratoria_config > (0)::numeric))
);


ALTER TABLE public.config_linea OWNER TO postgres;

--
-- Name: TABLE config_linea; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.config_linea IS 'Versionado de parámetros por línea — historial inmutable (RNF01)';


--
-- Name: COLUMN config_linea.tasa_interes_config; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.config_linea.tasa_interes_config IS 'Tasa mensual. Ej: 0.0185 = 1.85% mensual';


--
-- Name: config_linea_id_config_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.config_linea_id_config_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.config_linea_id_config_seq OWNER TO postgres;

--
-- Name: config_linea_id_config_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.config_linea_id_config_seq OWNED BY public.config_linea.id_config;


--
-- Name: cooperativa; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cooperativa (
    id_cooperativa integer NOT NULL,
    nombre_cooperativa character varying(200) NOT NULL,
    nit_cooperativa character varying(20) NOT NULL,
    direccion_cooperativa character varying(300),
    telefono_cooperativa character varying(20),
    correo_cooperativa character varying(150) NOT NULL,
    estado_cooperativa public.estado_general DEFAULT 'activo'::public.estado_general NOT NULL,
    fecha_creacion_cooperativa timestamp without time zone DEFAULT now() NOT NULL,
    fecha_registro timestamp without time zone DEFAULT now()
);


ALTER TABLE public.cooperativa OWNER TO postgres;

--
-- Name: TABLE cooperativa; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.cooperativa IS 'Cooperativas registradas — raíz del modelo multi-tenant';


--
-- Name: COLUMN cooperativa.estado_cooperativa; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.cooperativa.estado_cooperativa IS 'Inactiva bloquea el acceso a todos sus usuarios (RNF03)';


--
-- Name: cooperativa_id_cooperativa_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cooperativa_id_cooperativa_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cooperativa_id_cooperativa_seq OWNER TO postgres;

--
-- Name: cooperativa_id_cooperativa_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cooperativa_id_cooperativa_seq OWNED BY public.cooperativa.id_cooperativa;


--
-- Name: credito; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.credito (
    id_credito integer NOT NULL,
    id_socio_credito integer NOT NULL,
    id_solicitud_credito integer NOT NULL,
    id_linea_credito integer NOT NULL,
    monto_aprobado_credito numeric(15,2) NOT NULL,
    tasa_interes_credito numeric(6,4) NOT NULL,
    tasa_moratoria_credito numeric(6,4) NOT NULL,
    plazo_meses_credito integer NOT NULL,
    saldo_pendiente_credito numeric(15,2) NOT NULL,
    estado_credito public.estado_credito DEFAULT 'activo'::public.estado_credito NOT NULL,
    fecha_desembolso_credito timestamp without time zone,
    fecha_creacion_credito timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT credito_monto_aprobado_credito_check CHECK ((monto_aprobado_credito > (0)::numeric))
);


ALTER TABLE public.credito OWNER TO postgres;

--
-- Name: TABLE credito; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.credito IS 'Crédito aprobado y desembolsado';


--
-- Name: COLUMN credito.tasa_interes_credito; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.credito.tasa_interes_credito IS 'Copia de la tasa al momento del desembolso — no cambia si el gestor modifica la línea';


--
-- Name: COLUMN credito.saldo_pendiente_credito; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.credito.saldo_pendiente_credito IS 'Se actualiza en cada pago registrado';


--
-- Name: credito_id_credito_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.credito_id_credito_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.credito_id_credito_seq OWNER TO postgres;

--
-- Name: credito_id_credito_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.credito_id_credito_seq OWNED BY public.credito.id_credito;


--
-- Name: cuota; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cuota (
    id_cuota integer NOT NULL,
    id_credito_cuota integer NOT NULL,
    numero_cuota integer NOT NULL,
    fecha_vencimiento_cuota date NOT NULL,
    valor_cuota numeric(15,2) NOT NULL,
    abono_capital_cuota numeric(15,2) NOT NULL,
    interes_corriente_cuota numeric(15,2) NOT NULL,
    saldo_restante_cuota numeric(15,2) NOT NULL,
    estado_cuota public.estado_cuota DEFAULT 'pendiente'::public.estado_cuota NOT NULL,
    bloqueada_hasta_cuota timestamp without time zone,
    CONSTRAINT cuota_numero_cuota_check CHECK ((numero_cuota > 0))
);


ALTER TABLE public.cuota OWNER TO postgres;

--
-- Name: TABLE cuota; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.cuota IS 'Fila de la tabla de amortización francesa (RF02)';


--
-- Name: COLUMN cuota.bloqueada_hasta_cuota; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.cuota.bloqueada_hasta_cuota IS 'Bloqueo anti-pago duplicado de 5 minutos (RNF06)';


--
-- Name: cuota_id_cuota_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cuota_id_cuota_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cuota_id_cuota_seq OWNER TO postgres;

--
-- Name: cuota_id_cuota_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cuota_id_cuota_seq OWNED BY public.cuota.id_cuota;


--
-- Name: documento_generado; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.documento_generado (
    id_documento integer NOT NULL,
    id_socio_documento integer NOT NULL,
    id_credito_documento integer,
    id_usuario_documento integer NOT NULL,
    tipo_documento public.tipo_documento NOT NULL,
    numero_documento character varying(60) NOT NULL,
    url_documento character varying(500) NOT NULL,
    vigente_documento boolean DEFAULT true NOT NULL,
    fecha_generacion_documento timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.documento_generado OWNER TO postgres;

--
-- Name: TABLE documento_generado; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.documento_generado IS 'Trazabilidad de paz y salvos y certificados emitidos (RNF02)';


--
-- Name: COLUMN documento_generado.vigente_documento; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.documento_generado.vigente_documento IS 'FALSE cuando se emite un nuevo documento del mismo tipo para el mismo crédito';


--
-- Name: documento_generado_id_documento_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.documento_generado_id_documento_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.documento_generado_id_documento_seq OWNER TO postgres;

--
-- Name: documento_generado_id_documento_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.documento_generado_id_documento_seq OWNED BY public.documento_generado.id_documento;


--
-- Name: gestion_cobro; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gestion_cobro (
    id_gestion integer NOT NULL,
    id_credito_gestion integer NOT NULL,
    id_gestor_gestion integer NOT NULL,
    tipo_mora_gestion public.tipo_mora NOT NULL,
    medio_contacto_gestion public.medio_contacto_enum NOT NULL,
    acuerdo_gestion text,
    fecha_promesa_gestion date,
    fecha_contacto_gestion timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.gestion_cobro OWNER TO postgres;

--
-- Name: TABLE gestion_cobro; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.gestion_cobro IS 'Registro de gestión de cobro clasificado por rangos de mora (RF057)';


--
-- Name: gestion_cobro_id_gestion_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.gestion_cobro_id_gestion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.gestion_cobro_id_gestion_seq OWNER TO postgres;

--
-- Name: gestion_cobro_id_gestion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.gestion_cobro_id_gestion_seq OWNED BY public.gestion_cobro.id_gestion;


--
-- Name: historial_analista; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.historial_analista (
    id_historial integer NOT NULL,
    id_analista_historial integer NOT NULL,
    id_aspirante_historial integer NOT NULL,
    accion_historial public.accion_analista NOT NULL,
    motivo_rechazo_historial text,
    fecha_historial timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.historial_analista OWNER TO postgres;

--
-- Name: TABLE historial_analista; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.historial_analista IS 'Trazabilidad de todas las revisiones del analista (RF015)';


--
-- Name: historial_analista_id_historial_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.historial_analista_id_historial_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.historial_analista_id_historial_seq OWNER TO postgres;

--
-- Name: historial_analista_id_historial_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.historial_analista_id_historial_seq OWNED BY public.historial_analista.id_historial;


--
-- Name: linea_credito; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.linea_credito (
    id_linea_credito integer NOT NULL,
    id_cooperativa_linea integer NOT NULL,
    nombre_linea character varying(150) NOT NULL,
    descripcion_linea text
);


ALTER TABLE public.linea_credito OWNER TO postgres;

--
-- Name: TABLE linea_credito; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.linea_credito IS 'Catálogo de líneas: consumo, vivienda, educativo, etc.';


--
-- Name: linea_credito_id_linea_credito_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.linea_credito_id_linea_credito_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.linea_credito_id_linea_credito_seq OWNER TO postgres;

--
-- Name: linea_credito_id_linea_credito_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.linea_credito_id_linea_credito_seq OWNED BY public.linea_credito.id_linea_credito;


--
-- Name: movimiento_ahorro; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.movimiento_ahorro (
    id_movimiento integer NOT NULL,
    id_socio_movimiento integer NOT NULL,
    id_pago_movimiento integer,
    monto_movimiento numeric(15,2) NOT NULL,
    tipo_movimiento public.tipo_movimiento NOT NULL,
    descripcion_movimiento character varying(300),
    fecha_movimiento timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT movimiento_ahorro_monto_movimiento_check CHECK ((monto_movimiento > (0)::numeric))
);


ALTER TABLE public.movimiento_ahorro OWNER TO postgres;

--
-- Name: TABLE movimiento_ahorro; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.movimiento_ahorro IS 'Movimientos del fondo de ahorro del socio';


--
-- Name: COLUMN movimiento_ahorro.id_pago_movimiento; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.movimiento_ahorro.id_pago_movimiento IS 'FK al pago que originó el descuento cuando uso_ahorros = TRUE (RF066)';


--
-- Name: movimiento_ahorro_id_movimiento_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.movimiento_ahorro_id_movimiento_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.movimiento_ahorro_id_movimiento_seq OWNER TO postgres;

--
-- Name: movimiento_ahorro_id_movimiento_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.movimiento_ahorro_id_movimiento_seq OWNED BY public.movimiento_ahorro.id_movimiento;


--
-- Name: notificacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notificacion (
    id_notificacion integer NOT NULL,
    id_socio_notificacion integer,
    id_aspirante_notificacion integer,
    id_credito_notificacion integer,
    tipo_notificacion character varying(60) NOT NULL,
    asunto_notificacion character varying(300) NOT NULL,
    mensaje_notificacion text NOT NULL,
    enviada_notificacion boolean DEFAULT false NOT NULL,
    fecha_envio_notificacion timestamp without time zone,
    CONSTRAINT chk_destinatario_notificacion CHECK (((id_socio_notificacion IS NOT NULL) OR (id_aspirante_notificacion IS NOT NULL)))
);


ALTER TABLE public.notificacion OWNER TO postgres;

--
-- Name: TABLE notificacion; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.notificacion IS 'Notificaciones de correo/sistema para socios y aspirantes';


--
-- Name: COLUMN notificacion.id_socio_notificacion; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.notificacion.id_socio_notificacion IS 'NULL cuando el destinatario es un aspirante';


--
-- Name: COLUMN notificacion.id_aspirante_notificacion; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.notificacion.id_aspirante_notificacion IS 'NULL cuando el destinatario es un socio';


--
-- Name: notificacion_id_notificacion_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notificacion_id_notificacion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notificacion_id_notificacion_seq OWNER TO postgres;

--
-- Name: notificacion_id_notificacion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notificacion_id_notificacion_seq OWNED BY public.notificacion.id_notificacion;


--
-- Name: pago; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pago (
    id_pago integer NOT NULL,
    id_socio_pago integer NOT NULL,
    id_cajero_pago integer,
    monto_total_pago numeric(15,2) NOT NULL,
    canal_pago public.canal_pago NOT NULL,
    uso_ahorros_pago boolean DEFAULT false NOT NULL,
    monto_ahorros_usado_pago numeric(15,2) DEFAULT 0 NOT NULL,
    numero_recibo_pago character varying(50) NOT NULL,
    recibo_url_pago character varying(500),
    fecha_pago timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT pago_monto_total_pago_check CHECK ((monto_total_pago > (0)::numeric))
);


ALTER TABLE public.pago OWNER TO postgres;

--
-- Name: TABLE pago; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.pago IS 'Cabecera de pago — puede cubrir una o varias cuotas (RF03)';


--
-- Name: COLUMN pago.id_cajero_pago; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.pago.id_cajero_pago IS 'NULL cuando el socio paga de forma virtual';


--
-- Name: COLUMN pago.numero_recibo_pago; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.pago.numero_recibo_pago IS 'Número único para reimpresión y trazabilidad (RF03)';


--
-- Name: pago_detalle; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pago_detalle (
    id_pago_detalle integer NOT NULL,
    id_pago_pagodetalle integer NOT NULL,
    id_cuota_pagodetalle integer NOT NULL,
    monto_aplicado_pagodetalle numeric(15,2) NOT NULL,
    dias_mora_pagodetalle integer DEFAULT 0 NOT NULL,
    interes_mora_pagodetalle numeric(15,2) DEFAULT 0 NOT NULL,
    base_calculo_pagodetalle numeric(15,2),
    tasa_mora_pagodetalle numeric(6,4),
    CONSTRAINT pago_detalle_dias_mora_pagodetalle_check CHECK ((dias_mora_pagodetalle >= 0)),
    CONSTRAINT pago_detalle_monto_aplicado_pagodetalle_check CHECK ((monto_aplicado_pagodetalle > (0)::numeric))
);


ALTER TABLE public.pago_detalle OWNER TO postgres;

--
-- Name: TABLE pago_detalle; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.pago_detalle IS 'Desglose de cada pago por cuota con detalle de mora (RF03, RF04)';


--
-- Name: COLUMN pago_detalle.dias_mora_pagodetalle; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.pago_detalle.dias_mora_pagodetalle IS 'Días de retraso al momento del pago — auditable por Super Solidaria';


--
-- Name: COLUMN pago_detalle.base_calculo_pagodetalle; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.pago_detalle.base_calculo_pagodetalle IS 'Saldo sobre el cual se calculó la mora';


--
-- Name: pago_detalle_id_pago_detalle_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pago_detalle_id_pago_detalle_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pago_detalle_id_pago_detalle_seq OWNER TO postgres;

--
-- Name: pago_detalle_id_pago_detalle_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pago_detalle_id_pago_detalle_seq OWNED BY public.pago_detalle.id_pago_detalle;


--
-- Name: pago_id_pago_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pago_id_pago_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pago_id_pago_seq OWNER TO postgres;

--
-- Name: pago_id_pago_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pago_id_pago_seq OWNED BY public.pago.id_pago;


--
-- Name: reestructuracion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reestructuracion (
    id_reestruc integer NOT NULL,
    id_credito_reestruc integer NOT NULL,
    id_gestor_reestruc integer NOT NULL,
    plazo_nuevo_reestruc integer NOT NULL,
    cuotas_nuevas_reestruc integer NOT NULL,
    tasa_nueva_reestruc numeric(6,4) NOT NULL,
    motivo_reestruc text NOT NULL,
    fecha_reestruc timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT reestructuracion_cuotas_nuevas_reestruc_check CHECK ((cuotas_nuevas_reestruc > 0)),
    CONSTRAINT reestructuracion_plazo_nuevo_reestruc_check CHECK ((plazo_nuevo_reestruc > 0)),
    CONSTRAINT reestructuracion_tasa_nueva_reestruc_check CHECK ((tasa_nueva_reestruc > (0)::numeric))
);


ALTER TABLE public.reestructuracion OWNER TO postgres;

--
-- Name: TABLE reestructuracion; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.reestructuracion IS 'Historial de reestructuraciones de un crédito (RF058, RF059)';


--
-- Name: reestructuracion_id_reestruc_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reestructuracion_id_reestruc_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reestructuracion_id_reestruc_seq OWNER TO postgres;

--
-- Name: reestructuracion_id_reestruc_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reestructuracion_id_reestruc_seq OWNED BY public.reestructuracion.id_reestruc;


--
-- Name: simulacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.simulacion (
    id_simulacion integer NOT NULL,
    id_socio_simulacion integer NOT NULL,
    id_linea_simulacion integer NOT NULL,
    id_config_simulacion integer NOT NULL,
    monto_simulacion numeric(15,2) NOT NULL,
    plazo_meses_simulacion integer NOT NULL,
    tasa_simulada_simulacion numeric(6,4) NOT NULL,
    cuota_estimada_simulacion numeric(15,2) NOT NULL,
    total_intereses_simulacion numeric(15,2) NOT NULL,
    fecha_simulacion timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT simulacion_monto_simulacion_check CHECK ((monto_simulacion > (0)::numeric)),
    CONSTRAINT simulacion_plazo_meses_simulacion_check CHECK ((plazo_meses_simulacion > 0))
);


ALTER TABLE public.simulacion OWNER TO postgres;

--
-- Name: TABLE simulacion; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.simulacion IS 'Escenarios de simulación sin comprometer una solicitud real (RF02)';


--
-- Name: simulacion_id_simulacion_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.simulacion_id_simulacion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.simulacion_id_simulacion_seq OWNER TO postgres;

--
-- Name: simulacion_id_simulacion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.simulacion_id_simulacion_seq OWNED BY public.simulacion.id_simulacion;


--
-- Name: socio; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.socio (
    id_socio integer NOT NULL,
    id_usuario_socio integer NOT NULL,
    id_cooperativa_socio integer NOT NULL,
    saldo_ahorros_socio numeric(15,2) DEFAULT 0 NOT NULL,
    fecha_ingreso_socio timestamp without time zone DEFAULT now() NOT NULL,
    estado_socio public.estado_general DEFAULT 'activo'::public.estado_general NOT NULL,
    empresa_socio character varying(200),
    cargo_socio character varying(150),
    tipo_contrato_socio public.tipo_contrato,
    antiguedad_meses_socio integer,
    ingresos_mensuales_socio numeric(15,2),
    egresos_mensuales_socio numeric(15,2),
    otros_ingresos_socio numeric(15,2) DEFAULT 0,
    patrimonio_socio numeric(15,2) DEFAULT 0,
    cuota_ahorro_socio numeric DEFAULT 100000.00,
    CONSTRAINT socio_antiguedad_meses_socio_check CHECK ((antiguedad_meses_socio >= 0)),
    CONSTRAINT socio_egresos_mensuales_socio_check CHECK ((egresos_mensuales_socio >= (0)::numeric)),
    CONSTRAINT socio_ingresos_mensuales_socio_check CHECK ((ingresos_mensuales_socio >= (0)::numeric))
);


ALTER TABLE public.socio OWNER TO postgres;

--
-- Name: TABLE socio; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.socio IS 'Asociado activo — extiende usuario con datos financieros (RF01)';


--
-- Name: COLUMN socio.saldo_ahorros_socio; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.socio.saldo_ahorros_socio IS 'Actualizado en cada depósito o pago con ahorros (RF066)';


--
-- Name: COLUMN socio.ingresos_mensuales_socio; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.socio.ingresos_mensuales_socio IS 'Requerido para cálculo de capacidad de pago (RF01)';


--
-- Name: socio_id_socio_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.socio_id_socio_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.socio_id_socio_seq OWNER TO postgres;

--
-- Name: socio_id_socio_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.socio_id_socio_seq OWNED BY public.socio.id_socio;


--
-- Name: solicitud_afiliacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.solicitud_afiliacion (
    id_solicitud integer NOT NULL,
    nit_cooperativa character varying(50) NOT NULL,
    nombre_cooperativa character varying(150) NOT NULL,
    correo_cooperativa character varying(100) NOT NULL,
    telefono_cooperativa character varying(50) NOT NULL,
    direccion_cooperativa character varying(200) NOT NULL,
    sitio_web character varying(200),
    nombre_representante character varying(150) NOT NULL,
    cedula_representante character varying(50) NOT NULL,
    cargo_representante character varying(100) NOT NULL,
    correo_representante character varying(100) NOT NULL,
    telefono_representante character varying(50) NOT NULL,
    lineas_credito text,
    cantidad_socios character varying(50),
    necesita_migracion boolean,
    contrasena_admin character varying(255) NOT NULL,
    estado_solicitud public.estado_general DEFAULT 'pendiente'::public.estado_general,
    fecha_solicitud timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.solicitud_afiliacion OWNER TO postgres;

--
-- Name: solicitud_afiliacion_id_solicitud_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.solicitud_afiliacion_id_solicitud_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.solicitud_afiliacion_id_solicitud_seq OWNER TO postgres;

--
-- Name: solicitud_afiliacion_id_solicitud_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.solicitud_afiliacion_id_solicitud_seq OWNED BY public.solicitud_afiliacion.id_solicitud;


--
-- Name: solicitud_credito; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.solicitud_credito (
    id_solicitud integer NOT NULL,
    id_socio_solicitud integer NOT NULL,
    id_linea_solicitud integer NOT NULL,
    id_config_solicitud integer NOT NULL,
    id_simulacion_solicitud integer,
    monto_solicitado_solicitud numeric(15,2) NOT NULL,
    plazo_meses_solicitud integer NOT NULL,
    proposito_solicitud text NOT NULL,
    estado_solicitud public.estado_solicitud DEFAULT 'pendiente'::public.estado_solicitud NOT NULL,
    id_analista_solicitud integer,
    fecha_solicitud timestamp without time zone DEFAULT now() NOT NULL,
    fecha_resolucion_solicitud timestamp without time zone,
    CONSTRAINT solicitud_credito_monto_solicitado_solicitud_check CHECK ((monto_solicitado_solicitud > (0)::numeric)),
    CONSTRAINT solicitud_credito_plazo_meses_solicitud_check CHECK ((plazo_meses_solicitud > 0))
);


ALTER TABLE public.solicitud_credito OWNER TO postgres;

--
-- Name: COLUMN solicitud_credito.id_config_solicitud; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.solicitud_credito.id_config_solicitud IS 'Congela la config vigente para auditoría';


--
-- Name: COLUMN solicitud_credito.id_simulacion_solicitud; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.solicitud_credito.id_simulacion_solicitud IS 'Opcional: vincula la simulación previa del socio';


--
-- Name: solicitud_credito_id_solicitud_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.solicitud_credito_id_solicitud_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.solicitud_credito_id_solicitud_seq OWNER TO postgres;

--
-- Name: solicitud_credito_id_solicitud_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.solicitud_credito_id_solicitud_seq OWNED BY public.solicitud_credito.id_solicitud;


--
-- Name: usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuario (
    id_usuario integer NOT NULL,
    id_cooperativa_usuario integer NOT NULL,
    nombre_usuario character varying(200) NOT NULL,
    documento_usuario character varying(20) NOT NULL,
    correo_usuario character varying(150) NOT NULL,
    contrasena_usuario character varying(255) NOT NULL,
    rol_usuario public.rol_usuario NOT NULL,
    estado_usuario public.estado_general DEFAULT 'activo'::public.estado_general NOT NULL,
    fecha_creacion_usuario timestamp without time zone DEFAULT now() NOT NULL,
    telefono_usuario character varying(50),
    direccion_usuario character varying(255)
);


ALTER TABLE public.usuario OWNER TO postgres;

--
-- Name: TABLE usuario; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.usuario IS 'Usuarios internos: admin, analista, cajero, gerente, gestor';


--
-- Name: COLUMN usuario.rol_usuario; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.usuario.rol_usuario IS 'Define permisos de acceso por pantalla y datos (RNF03)';


--
-- Name: usuario_id_usuario_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuario_id_usuario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuario_id_usuario_seq OWNER TO postgres;

--
-- Name: usuario_id_usuario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuario_id_usuario_seq OWNED BY public.usuario.id_usuario;


--
-- Name: aspirante id_aspirante; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aspirante ALTER COLUMN id_aspirante SET DEFAULT nextval('public.aspirante_id_aspirante_seq'::regclass);


--
-- Name: castigo_cartera id_castigo; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.castigo_cartera ALTER COLUMN id_castigo SET DEFAULT nextval('public.castigo_cartera_id_castigo_seq'::regclass);


--
-- Name: config_linea id_config; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.config_linea ALTER COLUMN id_config SET DEFAULT nextval('public.config_linea_id_config_seq'::regclass);


--
-- Name: cooperativa id_cooperativa; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cooperativa ALTER COLUMN id_cooperativa SET DEFAULT nextval('public.cooperativa_id_cooperativa_seq'::regclass);


--
-- Name: credito id_credito; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credito ALTER COLUMN id_credito SET DEFAULT nextval('public.credito_id_credito_seq'::regclass);


--
-- Name: cuota id_cuota; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuota ALTER COLUMN id_cuota SET DEFAULT nextval('public.cuota_id_cuota_seq'::regclass);


--
-- Name: documento_generado id_documento; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documento_generado ALTER COLUMN id_documento SET DEFAULT nextval('public.documento_generado_id_documento_seq'::regclass);


--
-- Name: gestion_cobro id_gestion; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gestion_cobro ALTER COLUMN id_gestion SET DEFAULT nextval('public.gestion_cobro_id_gestion_seq'::regclass);


--
-- Name: historial_analista id_historial; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_analista ALTER COLUMN id_historial SET DEFAULT nextval('public.historial_analista_id_historial_seq'::regclass);


--
-- Name: linea_credito id_linea_credito; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.linea_credito ALTER COLUMN id_linea_credito SET DEFAULT nextval('public.linea_credito_id_linea_credito_seq'::regclass);


--
-- Name: movimiento_ahorro id_movimiento; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimiento_ahorro ALTER COLUMN id_movimiento SET DEFAULT nextval('public.movimiento_ahorro_id_movimiento_seq'::regclass);


--
-- Name: notificacion id_notificacion; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificacion ALTER COLUMN id_notificacion SET DEFAULT nextval('public.notificacion_id_notificacion_seq'::regclass);


--
-- Name: pago id_pago; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pago ALTER COLUMN id_pago SET DEFAULT nextval('public.pago_id_pago_seq'::regclass);


--
-- Name: pago_detalle id_pago_detalle; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pago_detalle ALTER COLUMN id_pago_detalle SET DEFAULT nextval('public.pago_detalle_id_pago_detalle_seq'::regclass);


--
-- Name: reestructuracion id_reestruc; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reestructuracion ALTER COLUMN id_reestruc SET DEFAULT nextval('public.reestructuracion_id_reestruc_seq'::regclass);


--
-- Name: simulacion id_simulacion; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.simulacion ALTER COLUMN id_simulacion SET DEFAULT nextval('public.simulacion_id_simulacion_seq'::regclass);


--
-- Name: socio id_socio; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.socio ALTER COLUMN id_socio SET DEFAULT nextval('public.socio_id_socio_seq'::regclass);


--
-- Name: solicitud_afiliacion id_solicitud; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitud_afiliacion ALTER COLUMN id_solicitud SET DEFAULT nextval('public.solicitud_afiliacion_id_solicitud_seq'::regclass);


--
-- Name: solicitud_credito id_solicitud; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitud_credito ALTER COLUMN id_solicitud SET DEFAULT nextval('public.solicitud_credito_id_solicitud_seq'::regclass);


--
-- Name: usuario id_usuario; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario ALTER COLUMN id_usuario SET DEFAULT nextval('public.usuario_id_usuario_seq'::regclass);


--
-- Data for Name: aspirante; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.aspirante (id_aspirante, id_cooperativa_aspirante, nombre_aspirante, documento_aspirante, correo_aspirante, telefono_aspirante, direccion_aspirante, ocupacion_aspirante, ingresos_aspirante, estado_aspirante, motivo_rechazo_aspirante, id_analista_aspirante, fecha_solicitud_aspirante, fecha_revision_aspirante) FROM stdin;
6	2	Tatiana Ramos	1006289061	veraprdm@gmail.com	3153470934	Car 14	Independiente	2500000.00	aprobado	\N	3	2026-05-18 23:01:37.986619	2026-05-18 23:01:50.174683
7	2	Topoyiyo	1117811948	murciacorredoremerson@gmail.com	3229602906	sadfasdf-a	Desocupado	1300000.00	aprobado	\N	7	2026-05-19 14:54:14.001534	2026-05-19 14:55:15.492608
8	2	Pepita Florez	10092938833	ingrijuliethgascatenorio@gmail.com	323467899	adsfa	Desocupada	13000000.00	aprobado	\N	12	2026-05-19 15:57:46.472612	2026-05-19 15:59:21.452341
9	2	Yuleiny Lugo	1234567811	yuleiny798@gmail.com	3108617630	los angeles	Desocupada	1313000.00	aprobado	\N	3	2026-05-20 17:33:55.550185	2026-05-20 17:38:25.63883
11	2	Luchando los diaz	105106107	2005luismorales2020@gmail.com	3145678911	Villa monica	Desocupado	2500000.00	aprobado	\N	12	2026-06-11 16:58:21.32884	2026-06-11 17:01:01.958325
12	2	Daniel Felipe Vera Perdomo	1006510328	pvfduni@gmail.com	3153470934	ssssssssss	asasasa	2800000.00	rechazado	Ya existe	3	2026-07-24 13:32:59.349708	2026-07-24 13:35:28.619982
10	2	Yuleiny Lugo	1117512328	yuleiny798@gmail.com	3108617630	sdafa	sdfasd	1313000.00	rechazado	hhh	7	2026-05-20 17:37:47.760145	2026-07-24 13:35:51.07285
13	2	Sebastian Carvajal	123456733	carvajal7lsch@gmail.com	312456789	sdfasdfasdfa	Desocupado	1800000.00	aprobado	\N	7	2026-07-24 16:07:48.034248	2026-07-24 16:08:29.249722
\.


--
-- Data for Name: castigo_cartera; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.castigo_cartera (id_castigo, id_credito_castigo, id_gestor_castigo, id_gerente_castigo, monto_castigado_castigo, saldo_al_castigo, motivo_castigo, fecha_propuesta_castigo, fecha_aprobacion_castigo, estado_castigo) FROM stdin;
\.


--
-- Data for Name: config_linea; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.config_linea (id_config, id_linea_config, id_gestor_config, tasa_interes_config, tasa_moratoria_config, plazo_min_config, plazo_max_config, monto_min_config, monto_max_config, fecha_actualizacion_config) FROM stdin;
1	1	6	1.8000	2.5000	6	36	1000000.00	50000000.00	2026-05-18 21:24:58.483755
2	2	6	1.5000	2.2000	6	48	500000.00	30000000.00	2026-05-19 19:57:50.773815
3	3	6	1.2000	2.0000	12	120	5000000.00	200000000.00	2026-05-19 19:57:50.773815
4	4	6	0.9000	1.8000	6	60	500000.00	50000000.00	2026-05-19 19:57:50.773815
\.


--
-- Data for Name: cooperativa; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cooperativa (id_cooperativa, nombre_cooperativa, nit_cooperativa, direccion_cooperativa, telefono_cooperativa, correo_cooperativa, estado_cooperativa, fecha_creacion_cooperativa, fecha_registro) FROM stdin;
1	Cooperativa Demo Huila	900123456-1	\N	\N	admin@coopdemo.com	activo	2026-05-18 17:33:14.529987	2026-07-28 17:29:35.151725
2	Cooperativa ALOHA	900200300-2	Cra 10 	3122222220	coopaloha@coop.co	activo	2026-05-18 20:14:13.164026	2026-07-28 17:29:35.151725
3	Cooperativa PlaticaBuena	900200900-2	Cra 10 	3456789342	platicaBuena@gmail.com	activo	2026-05-18 23:11:15.108552	2026-07-28 17:29:35.151725
4	Cooperativa Ronviejo	900200310-2	Cra 10 	3002004954	ronvi@gmail.com	activo	2026-05-18 23:13:21.547041	2026-07-28 17:29:35.151725
\.


--
-- Data for Name: credito; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.credito (id_credito, id_socio_credito, id_solicitud_credito, id_linea_credito, monto_aprobado_credito, tasa_interes_credito, tasa_moratoria_credito, plazo_meses_credito, saldo_pendiente_credito, estado_credito, fecha_desembolso_credito, fecha_creacion_credito) FROM stdin;
4	7	6	4	3500000.00	0.9000	1.8000	24	3236213.01	activo	2026-05-19 20:09:43.882849	2026-05-19 20:09:43.882849
5	5	8	2	5000000.00	1.5000	2.2000	36	0.00	pagado	2026-05-20 14:28:22.721303	2026-05-20 14:28:22.721303
2	2	1	1	12000000.00	1.8000	2.5000	12	0.00	pagado	2026-04-18 21:24:58.485685	2026-04-18 21:24:58.485685
3	2	2	1	5000000.00	1.8000	2.5000	12	0.00	pagado	2026-05-19 14:07:41.327582	2026-05-19 14:07:41.327582
6	5	4	2	5000000.00	1.5000	2.2000	12	0.00	pagado	2026-05-20 20:42:52.078147	2026-05-20 20:42:52.078147
8	5	9	2	2000000.00	1.5000	2.2000	6	0.00	pagado	2026-05-20 21:05:31.742857	2026-05-20 21:05:31.742857
7	5	10	2	7000000.00	1.5000	2.2000	12	6463240.05	activo	2026-05-20 21:05:21.457795	2026-05-20 21:05:21.457795
9	5	11	2	5000000.00	1.5000	2.2000	12	0.00	pagado	2026-05-20 22:23:17.441797	2026-05-20 22:23:17.441797
10	10	12	2	6000000.00	1.5000	2.2000	11	6000000.00	activo	2026-07-24 16:14:57.349367	2026-07-24 16:14:57.349367
\.


--
-- Data for Name: cuota; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cuota (id_cuota, id_credito_cuota, numero_cuota, fecha_vencimiento_cuota, valor_cuota, abono_capital_cuota, interes_corriente_cuota, saldo_restante_cuota, estado_cuota, bloqueada_hasta_cuota) FROM stdin;
1	2	1	2026-05-18	1120000.00	1000000.00	120000.00	11000000.00	pagada	\N
139	10	1	2026-08-24	595763.07	505763.07	90000.00	5494236.93	pendiente	\N
140	10	2	2026-09-24	595763.07	513349.51	82413.55	4980887.42	pendiente	\N
141	10	3	2026-10-24	595763.07	521049.75	74713.31	4459837.67	pendiente	\N
142	10	4	2026-11-24	595763.07	528865.50	66897.57	3930972.17	pendiente	\N
143	10	5	2026-12-24	595763.07	536798.48	58964.58	3394173.69	pendiente	\N
144	10	6	2027-01-24	595763.07	544850.46	50912.61	2849323.23	pendiente	\N
145	10	7	2027-02-24	595763.07	553023.22	42739.85	2296300.01	pendiente	\N
146	10	8	2027-03-24	595763.07	561318.56	34444.50	1734981.45	pendiente	\N
147	10	9	2027-04-24	595763.07	569738.34	26024.72	1165243.10	pendiente	\N
148	10	10	2027-05-24	595763.07	578284.42	17478.65	586958.68	pendiente	\N
149	10	11	2027-06-24	595763.07	586958.68	8804.38	0.00	pendiente	\N
15	3	3	2026-08-19	467009.88	390704.39	76305.49	3848489.66	pendiente	\N
16	3	4	2026-09-19	467009.88	397737.07	69272.81	3450752.59	pendiente	\N
17	3	5	2026-10-19	467009.88	404896.34	62113.55	3045856.25	pendiente	\N
18	3	6	2026-11-19	467009.88	412184.47	54825.41	2633671.78	pendiente	\N
19	3	7	2026-12-19	467009.88	419603.79	47406.09	2214067.99	pendiente	\N
20	3	8	2027-01-19	467009.88	427156.66	39853.22	1786911.33	pendiente	\N
21	3	9	2027-02-19	467009.88	434845.48	32164.40	1352065.85	pendiente	\N
22	3	10	2027-03-19	467009.88	442672.70	24337.19	909393.15	pendiente	\N
23	3	11	2027-04-19	467009.88	450640.81	16369.08	458752.34	pendiente	\N
24	3	12	2027-05-19	467009.88	458752.34	8257.54	0.00	pendiente	\N
27	4	3	2026-08-19	162802.63	133676.72	29125.92	3102536.30	pendiente	\N
28	4	4	2026-09-19	162802.63	134879.81	27922.83	2967656.49	pendiente	\N
29	4	5	2026-10-19	162802.63	136093.72	26708.91	2831562.77	pendiente	\N
30	4	6	2026-11-19	162802.63	137318.57	25484.06	2694244.20	pendiente	\N
31	4	7	2026-12-19	162802.63	138554.43	24248.20	2555689.76	pendiente	\N
32	4	8	2027-01-19	162802.63	139801.42	23001.21	2415888.34	pendiente	\N
33	4	9	2027-02-19	162802.63	141059.64	21743.00	2274828.70	pendiente	\N
34	4	10	2027-03-19	162802.63	142329.17	20473.46	2132499.53	pendiente	\N
35	4	11	2027-04-19	162802.63	143610.14	19192.50	1988889.39	pendiente	\N
36	4	12	2027-05-19	162802.63	144902.63	17900.00	1843986.76	pendiente	\N
37	4	13	2027-06-19	162802.63	146206.75	16595.88	1697780.01	pendiente	\N
38	4	14	2027-07-19	162802.63	147522.61	15280.02	1550257.40	pendiente	\N
39	4	15	2027-08-19	162802.63	148850.32	13952.32	1401407.08	pendiente	\N
40	4	16	2027-09-19	162802.63	150189.97	12612.66	1251217.11	pendiente	\N
41	4	17	2027-10-19	162802.63	151541.68	11260.95	1099675.43	pendiente	\N
42	4	18	2027-11-19	162802.63	152905.55	9897.08	946769.88	pendiente	\N
43	4	19	2027-12-19	162802.63	154281.70	8520.93	792488.18	pendiente	\N
44	4	20	2028-01-19	162802.63	155670.24	7132.39	636817.94	pendiente	\N
45	4	21	2028-02-19	162802.63	157071.27	5731.36	479746.67	pendiente	\N
46	4	22	2028-03-19	162802.63	158484.91	4317.72	321261.75	pendiente	\N
47	4	23	2028-04-19	162802.63	159911.28	2891.36	161350.48	pendiente	\N
48	4	24	2028-05-19	162802.63	161350.48	1452.15	0.00	pendiente	\N
25	4	1	2026-06-19	162802.63	131302.63	31500.00	3368697.37	pagada	\N
26	4	2	2026-07-19	162802.63	132484.36	30318.28	3236213.01	pagada	\N
49	5	1	2026-06-20	180761.98	105761.98	75000.00	4894238.02	pagada	\N
50	5	2	2026-07-20	180761.98	107348.41	73413.57	4786889.61	pagada	\N
51	5	3	2026-08-20	180761.98	108958.63	71803.34	4677930.98	pagada	\N
52	5	4	2026-09-20	180761.98	110593.01	70168.96	4567337.97	pagada	\N
53	5	5	2026-10-20	180761.98	112251.91	68510.07	4455086.06	pagada	\N
54	5	6	2026-11-20	180761.98	113935.69	66826.29	4341150.37	pagada	\N
55	5	7	2026-12-20	180761.98	115644.72	65117.26	4225505.65	pagada	\N
56	5	8	2027-01-20	180761.98	117379.39	63382.58	4108126.26	pagada	\N
2	2	2	2026-06-18	1120000.00	1000000.00	120000.00	10000000.00	pagada	\N
3	2	3	2026-07-18	1120000.00	1000000.00	120000.00	9000000.00	pagada	\N
4	2	4	2026-08-18	1120000.00	1000000.00	120000.00	8000000.00	pagada	\N
5	2	5	2026-09-18	1120000.00	1000000.00	120000.00	7000000.00	pagada	\N
6	2	6	2026-10-18	1120000.00	1000000.00	120000.00	6000000.00	pagada	\N
7	2	7	2026-11-18	1120000.00	1000000.00	120000.00	5000000.00	pagada	\N
8	2	8	2026-12-18	1120000.00	1000000.00	120000.00	4000000.00	pagada	\N
9	2	9	2027-01-18	1120000.00	1000000.00	120000.00	3000000.00	pagada	\N
10	2	10	2027-02-18	1120000.00	1000000.00	120000.00	2000000.00	pagada	\N
11	2	11	2027-03-18	1120000.00	1000000.00	120000.00	1000000.00	pagada	\N
12	2	12	2027-04-18	1120000.00	1000000.00	120000.00	0.00	pagada	\N
13	3	1	2026-06-19	467009.88	377009.88	90000.00	4622990.12	pagada	\N
14	3	2	2026-07-19	467009.88	383796.06	83213.82	4239194.05	pagada	\N
57	5	9	2027-02-20	180761.98	119140.08	61621.89	3988986.17	pagada	\N
58	5	10	2027-03-20	180761.98	120927.19	59834.79	3868058.99	pagada	\N
59	5	11	2027-04-20	180761.98	122741.09	58020.88	3745317.90	pagada	\N
60	5	12	2027-05-20	180761.98	124582.21	56179.77	3620735.69	pagada	\N
61	5	13	2027-06-20	180761.98	126450.94	54311.04	3494284.75	pagada	\N
62	5	14	2027-07-20	180761.98	128347.71	52414.27	3365937.04	pagada	\N
63	5	15	2027-08-20	180761.98	130272.92	50489.06	3235664.12	pagada	\N
64	5	16	2027-09-20	180761.98	132227.02	48534.96	3103437.10	pagada	\N
65	5	17	2027-10-20	180761.98	134210.42	46551.56	2969226.68	pagada	\N
66	5	18	2027-11-20	180761.98	136223.58	44538.40	2833003.10	pagada	\N
67	5	19	2027-12-20	180761.98	138266.93	42495.05	2694736.17	pagada	\N
68	5	20	2028-01-20	180761.98	140340.94	40421.04	2554395.24	pagada	\N
69	5	21	2028-02-20	180761.98	142446.05	38315.93	2411949.19	pagada	\N
70	5	22	2028-03-20	180761.98	144582.74	36179.24	2267366.45	pagada	\N
71	5	23	2028-04-20	180761.98	146751.48	34010.50	2120614.97	pagada	\N
72	5	24	2028-05-20	180761.98	148952.75	31809.22	1971662.21	pagada	\N
73	5	25	2028-06-20	180761.98	151187.04	29574.93	1820475.17	pagada	\N
74	5	26	2028-07-20	180761.98	153454.85	27307.13	1667020.32	pagada	\N
75	5	27	2028-08-20	180761.98	155756.67	25005.30	1511263.65	pagada	\N
76	5	28	2028-09-20	180761.98	158093.02	22668.95	1353170.62	pagada	\N
77	5	29	2028-10-20	180761.98	160464.42	20297.56	1192706.20	pagada	\N
78	5	30	2028-11-20	180761.98	162871.38	17890.59	1029834.82	pagada	\N
79	5	31	2028-12-20	180761.98	165314.46	15447.52	864520.36	pagada	\N
80	5	32	2029-01-20	180761.98	167794.17	12967.81	696726.19	pagada	\N
81	5	33	2029-02-20	180761.98	170311.08	10450.89	526415.11	pagada	\N
82	5	34	2029-03-20	180761.98	172865.75	7896.23	353549.36	pagada	\N
83	5	35	2029-04-20	180761.98	175458.74	5303.24	178090.62	pagada	\N
84	5	36	2029-05-20	180761.98	178090.62	2671.36	0.00	pagada	\N
97	7	1	2026-06-20	641759.95	536759.95	105000.00	6463240.05	pagada	\N
86	6	2	2026-07-20	458399.96	389150.96	69249.00	4227449.07	pendiente	\N
87	6	3	2026-08-20	458399.96	394988.23	63411.74	3832460.84	pendiente	\N
88	6	4	2026-09-20	458399.96	400913.05	57486.91	3431547.79	pendiente	\N
89	6	5	2026-10-20	458399.96	406926.75	51473.22	3024621.04	pendiente	\N
90	6	6	2026-11-20	458399.96	413030.65	45369.32	2611590.39	pendiente	\N
91	6	7	2026-12-20	458399.96	419226.11	39173.86	2192364.29	pendiente	\N
92	6	8	2027-01-20	458399.96	425514.50	32885.46	1766849.79	pendiente	\N
93	6	9	2027-02-20	458399.96	431897.22	26502.75	1334952.57	pendiente	\N
94	6	10	2027-03-20	458399.96	438375.68	20024.29	896576.89	pendiente	\N
95	6	11	2027-04-20	458399.96	444951.31	13448.65	451625.58	pendiente	\N
96	6	12	2027-05-20	458399.96	451625.58	6774.38	0.00	pendiente	\N
85	6	1	2026-06-20	458399.96	383399.96	75000.00	4616600.04	pagada	\N
98	7	2	2026-07-20	641759.95	544811.35	96948.60	5918428.70	pendiente	\N
99	7	3	2026-08-20	641759.95	552983.52	88776.43	5365445.18	pendiente	\N
100	7	4	2026-09-20	641759.95	561278.27	80481.68	4804166.91	pendiente	\N
101	7	5	2026-10-20	641759.95	569697.45	72062.50	4234469.46	pendiente	\N
102	7	6	2026-11-20	641759.95	578242.91	63517.04	3656226.55	pendiente	\N
103	7	7	2026-12-20	641759.95	586916.55	54843.40	3069310.00	pendiente	\N
104	7	8	2027-01-20	641759.95	595720.30	46039.65	2473589.70	pendiente	\N
105	7	9	2027-02-20	641759.95	604656.10	37103.85	1868933.60	pendiente	\N
106	7	10	2027-03-20	641759.95	613725.95	28034.00	1255207.65	pendiente	\N
107	7	11	2027-04-20	641759.95	622931.84	18828.11	632275.81	pendiente	\N
108	7	12	2027-05-20	641759.95	632275.81	9484.14	0.00	pendiente	\N
128	9	2	2026-07-20	404622.42	343497.42	61125.00	3731502.58	pagada	\N
129	9	3	2026-08-20	404622.42	348649.88	55972.54	3382852.71	pagada	\N
130	9	4	2026-09-20	404622.42	353879.62	50742.79	3028973.08	pagada	\N
131	9	5	2026-10-20	404622.42	359187.82	45434.60	2669785.27	pagada	\N
132	9	6	2026-11-20	404622.42	364575.64	40046.78	2305209.63	pagada	\N
133	9	7	2026-12-20	404622.42	370044.27	34578.14	1935165.36	pagada	\N
109	8	1	2026-06-20	351050.43	321050.43	30000.00	1678949.57	pagada	\N
110	8	2	2026-07-20	351050.43	325866.19	25184.24	1353083.39	pagada	\N
134	9	8	2027-01-20	404622.42	375594.93	29027.48	1559570.42	pagada	\N
115	8	3	2026-08-20	34645.82	34133.81	512.01	0.00	pagada	\N
135	9	9	2027-02-20	404622.42	381228.86	23393.56	1178341.57	pagada	\N
136	9	10	2027-03-20	404622.42	386947.29	17675.12	791394.27	pagada	\N
137	9	11	2027-04-20	404622.42	392751.50	11870.91	398642.77	pagada	\N
138	9	12	2027-05-20	404622.42	398642.77	5979.64	0.00	pagada	\N
116	9	1	2026-06-20	458399.96	383399.96	75000.00	4616600.04	pagada	\N
\.


--
-- Data for Name: documento_generado; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.documento_generado (id_documento, id_socio_documento, id_credito_documento, id_usuario_documento, tipo_documento, numero_documento, url_documento, vigente_documento, fecha_generacion_documento) FROM stdin;
\.


--
-- Data for Name: gestion_cobro; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gestion_cobro (id_gestion, id_credito_gestion, id_gestor_gestion, tipo_mora_gestion, medio_contacto_gestion, acuerdo_gestion, fecha_promesa_gestion, fecha_contacto_gestion) FROM stdin;
\.


--
-- Data for Name: historial_analista; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.historial_analista (id_historial, id_analista_historial, id_aspirante_historial, accion_historial, motivo_rechazo_historial, fecha_historial) FROM stdin;
\.


--
-- Data for Name: linea_credito; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.linea_credito (id_linea_credito, id_cooperativa_linea, nombre_linea, descripcion_linea) FROM stdin;
1	1	Libre Inversión	Crédito multipropósito de libre asignación
2	2	Consumo	Crédito para libre consumo y necesidades personales
3	2	Vivienda	Crédito para adquisición o mejora de vivienda
4	2	Educativo	Crédito para estudios y formación profesional
\.


--
-- Data for Name: movimiento_ahorro; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.movimiento_ahorro (id_movimiento, id_socio_movimiento, id_pago_movimiento, monto_movimiento, tipo_movimiento, descripcion_movimiento, fecha_movimiento) FROM stdin;
1	2	\N	500000.00	deposito	Pago de cuota de ahorro mensual (Pasarela Nequi)	2026-05-19 14:25:00.444615
2	2	\N	50000.00	retiro	Retiro de ahorros solicitado por el socio	2026-05-19 14:25:00.45323
3	5	\N	100000.00	deposito	Pago de cuota de ahorro mensual (Pasarela Nequi)	2026-05-19 14:48:09.587062
4	5	\N	500000.00	deposito	Pago de cuota de ahorro mensual (Pasarela Nequi)	2026-05-19 14:49:17.343825
5	6	\N	100000000.00	deposito	Pago de cuota de ahorro mensual (Pasarela Nequi)	2026-05-19 15:40:33.772223
6	6	\N	1000000.00	retiro	Retiro de ahorros solicitado por el socio	2026-05-19 15:41:04.494249
7	6	\N	99000000.00	retiro	Retiro de ahorros solicitado por el socio	2026-05-19 15:41:17.96651
8	6	\N	1000000.00	deposito	Pago de cuota de ahorro mensual (Pasarela Nequi)	2026-05-19 15:41:37.41919
9	6	\N	100000.00	deposito	Pago de cuota de ahorro mensual (Pasarela Nequi)	2026-05-19 15:43:05.201392
10	7	\N	1000000.00	deposito	Pago de cuota de ahorro mensual (Pasarela Nequi)	2026-05-19 16:01:51.653
11	7	\N	700000.00	retiro	Retiro de ahorros solicitado por el socio	2026-05-19 16:02:43.412301
12	7	\N	1000000.00	deposito	Pago de cuota de ahorro mensual (Pasarela Nequi)	2026-05-19 16:04:24.823513
13	5	\N	250000.00	deposito	Cuota de ahorro mensual - Enero 2026	2026-01-15 00:00:00
14	5	\N	300000.00	deposito	Cuota de ahorro mensual - Febrero 2026	2026-02-15 00:00:00
15	5	\N	200000.00	deposito	Cuota de ahorro mensual - Marzo 2026	2026-03-15 00:00:00
16	5	\N	100000.00	retiro	Retiro para emergencia médica	2026-03-28 00:00:00
17	5	\N	300000.00	deposito	Cuota de ahorro mensual - Abril 2026	2026-04-15 00:00:00
18	5	\N	300000.00	deposito	Cuota de ahorro mensual - Mayo 2026	2026-05-12 00:00:00
19	6	\N	500000.00	deposito	Aporte inicial de afiliación	2026-01-05 00:00:00
20	6	\N	400000.00	deposito	Cuota de ahorro mensual - Febrero 2026	2026-02-10 00:00:00
21	6	\N	500000.00	deposito	Cuota de ahorro mensual - Marzo 2026	2026-03-10 00:00:00
22	6	\N	500000.00	deposito	Cuota de ahorro mensual - Abril 2026	2026-04-10 00:00:00
23	6	\N	500000.00	deposito	Cuota de ahorro mensual - Mayo 2026	2026-05-10 00:00:00
24	6	\N	400000.00	deposito	Ingreso adicional por bonificación	2026-05-15 00:00:00
25	7	\N	350000.00	deposito	Aporte inicial de afiliación	2026-03-19 00:00:00
26	7	\N	200000.00	deposito	Cuota de ahorro mensual - Abril 2026	2026-04-20 00:00:00
27	7	\N	200000.00	deposito	Cuota de ahorro mensual - Mayo 2026	2026-05-18 00:00:00
28	7	\N	1000000.00	deposito	Pago de cuota de ahorro mensual (Pasarela Nequi)	2026-05-19 23:14:13.326509
29	7	\N	1000000.00	deposito	Pago de cuota de ahorro mensual (Pasarela Nequi)	2026-05-19 23:20:44.944654
30	7	\N	1000000.00	deposito	Pago de cuota de ahorro mensual (Pasarela Nequi)	2026-05-19 23:24:01.607235
31	7	\N	3750000.00	retiro	Retiro de ahorros solicitado por el socio	2026-05-19 23:27:43.185283
32	5	\N	180761.98	retiro	Débito por pago de crédito (Cuota #1)	2026-05-20 19:22:31.501383
33	2	\N	10000000.00	deposito	Pago de cuota de ahorro mensual (Pasarela Nequi)	2026-05-20 20:46:46.824801
34	5	\N	100000.00	deposito	Pago de cuota de ahorro mensual (Pasarela Nequi)	2026-06-02 16:49:50.471227
35	5	\N	100000.00	deposito	Pago de cuota de ahorro mensual (Pasarela Nequi)	2026-06-10 17:30:11.981258
36	5	\N	100000.00	deposito	Pago de cuota de ahorro mensual (Pasarela Nequi)	2026-06-10 17:30:49.403686
37	5	\N	100000.00	deposito	Pago de cuota de ahorro mensual (Pasarela Nequi)	2026-06-10 17:38:22.961786
38	5	\N	100000.00	deposito	Pago de cuota de ahorro mensual (Pasarela Nequi)	2026-06-10 20:19:29.111165
39	5	\N	200000.00	deposito	Pago de cuota de ahorro mensual (Pasarela Nequi)	2026-06-10 22:28:29.042118
40	5	\N	1000000.00	retiro	Retiro de ahorros solicitado por el socio	2026-06-10 22:29:32.908032
41	5	\N	100000.00	retiro	Retiro de ahorros solicitado por el socio	2026-06-10 22:39:27.935988
42	10	\N	1000000.00	deposito	Pago de cuota de ahorro mensual (Pasarela Nequi)	2026-07-24 16:12:49.214445
\.


--
-- Data for Name: notificacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notificacion (id_notificacion, id_socio_notificacion, id_aspirante_notificacion, id_credito_notificacion, tipo_notificacion, asunto_notificacion, mensaje_notificacion, enviada_notificacion, fecha_envio_notificacion) FROM stdin;
1	2	\N	\N	deposito	Depósito Registrado	Has depositado $500000 a tu cuenta de ahorros.	t	2026-05-19 14:25:00.446728
40	5	\N	\N	deposito	Depósito Registrado	Has depositado $100.000 a tu cuenta de ahorros a través de Nequi.	t	2026-06-02 16:49:50.495369
2	5	\N	\N	deposito	Depósito Registrado	Has depositado $100.000 a tu cuenta de ahorros a través de Nequi.	t	2026-05-19 14:48:09.622357
3	5	\N	\N	deposito	Depósito Registrado	Has depositado $500.000 a tu cuenta de ahorros a través de Nequi.	t	2026-05-19 14:49:17.345252
21	5	\N	\N	credito_solicitado	Solicitud Radicada	Tu solicitud de estudio para crédito por valor de $5.000.000 ha sido radicada y se encuentra en revisión.	t	2026-05-20 14:26:09.610975
22	5	\N	\N	credito	Crédito Aprobado y Desembolsado	¡Felicidades! Tu crédito por $5.000.000 a 36 meses ha sido aprobado y desembolsado exitosamente.	t	2026-05-20 14:28:22.721303
23	5	\N	\N	pago_cuota	Pago de Crédito Registrado	Has realizado un pago por $180.761,98 para tu crédito.	t	2026-05-20 19:22:31.501383
4	6	\N	\N	deposito	Depósito Registrado	Has depositado $100.000.000 a tu cuenta de ahorros a través de Nequi.	t	2026-05-19 15:40:33.775038
5	6	\N	\N	retiro	Retiro Procesado	Has retirado $1.000.000 de tu cuenta de ahorros.	t	2026-05-19 15:41:04.49552
6	6	\N	\N	retiro	Retiro Procesado	Has retirado $99.000.000 de tu cuenta de ahorros.	t	2026-05-19 15:41:17.968152
7	6	\N	\N	deposito	Depósito Registrado	Has depositado $1.000.000 a tu cuenta de ahorros a través de Nequi.	t	2026-05-19 15:41:37.420998
8	6	\N	\N	deposito	Depósito Registrado	Has depositado $100.000 a tu cuenta de ahorros a través de Nequi.	t	2026-05-19 15:43:05.20382
34	5	\N	\N	credito	Crédito Aprobado y Desembolsado	¡Felicidades! Tu crédito por $2.000.000 a 6 meses ha sido aprobado y desembolsado exitosamente.	t	2026-05-20 21:05:31.742857
35	5	\N	\N	pago_cuota	Pago de Crédito Registrado	Has realizado un pago por $351.050,43 para tu crédito.	t	2026-05-20 21:38:31.506089
36	5	\N	\N	pago_cuota	Pago de Crédito Registrado	Has realizado un pago por $1.670.000 para tu crédito.	t	2026-05-20 21:39:15.388247
9	7	\N	\N	deposito	Depósito Registrado	Has depositado $1.000.000 a tu cuenta de ahorros a través de Nequi.	t	2026-05-19 16:01:51.654837
10	7	\N	\N	retiro	Retiro Procesado	Has retirado $700.000 de tu cuenta de ahorros.	t	2026-05-19 16:02:43.414107
11	7	\N	\N	deposito	Depósito Registrado	Has depositado $1.000.000 a tu cuenta de ahorros a través de Nequi.	t	2026-05-19 16:04:24.824948
12	7	\N	\N	credito	Crédito Aprobado y Desembolsado	¡Felicidades! Tu crédito por $3.500.000 a 24 meses ha sido aprobado y desembolsado exitosamente.	t	2026-05-19 20:09:43.882849
13	7	\N	\N	credito_solicitado	Solicitud Radicada	Tu solicitud de estudio para crédito por valor de $5.000.000 ha sido radicada y se encuentra en revisión.	t	2026-05-19 20:12:24.934086
14	7	\N	\N	credito	Solicitud de Crédito Rechazada	Tu solicitud de crédito por $5.000.000 ha sido rechazada. Motivo: Ya tienes un credito y tienes muy pocos ahorros	t	2026-05-19 20:14:06.745554
15	7	\N	\N	pago_cuota	Cuota de Crédito Pagada	Has pagado la cuota #1 del crédito por un valor de $162.802,63.	t	2026-05-19 22:14:10.857492
16	7	\N	\N	pago_cuota	Cuota de Crédito Pagada	Has pagado la cuota #2 del crédito por un valor de $162.802,63.	t	2026-05-19 22:14:50.876986
17	7	\N	\N	deposito	Depósito Registrado	Has depositado $1.000.000 a tu cuenta de ahorros a través de Nequi.	t	2026-05-19 23:14:13.366123
18	7	\N	\N	deposito	Depósito Registrado	Has depositado $1.000.000 a tu cuenta de ahorros a través de Nequi.	t	2026-05-19 23:20:44.982744
19	7	\N	\N	deposito	Depósito Registrado	Has depositado $1.000.000 a tu cuenta de ahorros a través de Nequi.	t	2026-05-19 23:24:01.611086
20	7	\N	\N	retiro	Retiro Procesado	Has retirado $3.750.000 de tu cuenta de ahorros.	t	2026-05-19 23:27:43.189416
27	2	\N	\N	pago_cuota	Pago de Crédito Registrado	Has realizado un pago por $11.120.000 para tu crédito.	f	2026-05-20 20:45:17.490393
28	2	\N	\N	pago_cuota	Pago de Crédito Registrado	Has realizado un pago por $467.009,88 para tu crédito.	f	2026-05-20 20:45:46.573705
29	2	\N	\N	deposito	Depósito Registrado	Has depositado $10.000.000 a tu cuenta de ahorros a través de Nequi.	f	2026-05-20 20:46:46.828132
30	2	\N	\N	pago_cuota	Pago de Crédito Registrado	Has realizado un pago por $5.000.000 para tu crédito.	f	2026-05-20 20:52:34.200894
41	5	\N	\N	pago_cuota	Pago de Crédito Registrado	Has realizado un pago por $4.136.125 para tu crédito.	t	2026-06-02 16:54:18.451349
24	5	\N	\N	pago_cuota	Pago de Crédito Registrado	Has realizado un pago por $4.967.651,59 para tu crédito.	t	2026-05-20 19:38:04.537091
25	5	\N	\N	credito	Crédito Aprobado y Desembolsado	¡Felicidades! Tu crédito por $5.000.000 a 12 meses ha sido aprobado y desembolsado exitosamente.	t	2026-05-20 20:42:52.078147
26	5	\N	\N	credito_solicitado	Solicitud Radicada	Tu solicitud de estudio para crédito por valor de $2.000.000 ha sido radicada y se encuentra en revisión.	t	2026-05-20 20:44:06.872829
31	5	\N	\N	pago_cuota	Pago de Crédito Registrado	Has realizado un pago por $10.000.000 para tu crédito.	t	2026-05-20 20:56:34.252287
32	5	\N	\N	credito_solicitado	Solicitud Radicada	Tu solicitud de estudio para crédito por valor de $7.000.000 ha sido radicada y se encuentra en revisión.	t	2026-05-20 21:04:37.05985
33	5	\N	\N	credito	Crédito Aprobado y Desembolsado	¡Felicidades! Tu crédito por $7.000.000 a 12 meses ha sido aprobado y desembolsado exitosamente.	t	2026-05-20 21:05:21.457795
49	10	\N	\N	deposito	Depósito Registrado	Has depositado $1.000.000 a tu cuenta de ahorros a través de Nequi.	t	2026-07-24 16:12:49.248266
50	10	\N	\N	credito_solicitado	Solicitud Radicada	Tu solicitud de estudio para crédito por valor de $6.000.000 ha sido radicada y se encuentra en revisión.	t	2026-07-24 16:14:09.485977
51	10	\N	\N	credito	Crédito Aprobado y Desembolsado	¡Felicidades! Tu crédito por $6.000.000 a 11 meses ha sido aprobado y desembolsado exitosamente.	t	2026-07-24 16:14:57.349367
52	10	\N	\N	credito_solicitado	Solicitud Radicada	Tu solicitud de estudio para crédito por valor de $6.650.000 ha sido radicada y se encuentra en revisión.	f	2026-07-28 13:53:03.720361
37	5	\N	\N	pago_cuota	Pago de Crédito Registrado	Has realizado un pago por $34.645,82 para tu crédito.	t	2026-05-20 21:41:04.033917
38	5	\N	\N	credito_solicitado	Solicitud Radicada	Tu solicitud de estudio para crédito por valor de $5.000.000 ha sido radicada y se encuentra en revisión.	t	2026-05-20 22:22:37.835969
39	5	\N	\N	credito	Crédito Aprobado y Desembolsado	¡Felicidades! Tu crédito por $5.000.000 a 12 meses ha sido aprobado y desembolsado exitosamente.	t	2026-05-20 22:23:17.441797
42	5	\N	\N	deposito	Depósito Registrado	Has depositado $100.000 a tu cuenta de ahorros a través de Nequi.	t	2026-06-10 17:30:11.989628
43	5	\N	\N	deposito	Depósito Registrado	Has depositado $100.000 a tu cuenta de ahorros a través de Nequi.	t	2026-06-10 17:30:49.404626
44	5	\N	\N	deposito	Depósito Registrado	Has depositado $100.000 a tu cuenta de ahorros a través de Nequi.	t	2026-06-10 17:38:22.964346
45	5	\N	\N	deposito	Depósito Registrado	Has depositado $100.000 a tu cuenta de ahorros a través de Nequi.	t	2026-06-10 20:19:29.113376
46	5	\N	\N	deposito	Depósito Registrado	Has depositado $200.000 a tu cuenta de ahorros a través de Nequi.	t	2026-06-10 22:28:29.057361
47	5	\N	\N	retiro	Retiro Procesado	Has retirado $1.000.000 de tu cuenta de ahorros.	t	2026-06-10 22:29:32.911832
48	5	\N	\N	retiro	Retiro Procesado	Has retirado $100.000 de tu cuenta de ahorros.	t	2026-06-10 22:39:27.938431
\.


--
-- Data for Name: pago; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pago (id_pago, id_socio_pago, id_cajero_pago, monto_total_pago, canal_pago, uso_ahorros_pago, monto_ahorros_usado_pago, numero_recibo_pago, recibo_url_pago, fecha_pago) FROM stdin;
1	7	\N	162802.63	virtual	f	0.00	PAG-188488	\N	2026-05-19 22:14:10.857492
2	7	\N	162802.63	virtual	f	0.00	PAG-679597	\N	2026-05-19 22:14:50.876986
3	5	\N	180761.98	virtual	t	180761.98	PAG-941316	\N	2026-05-20 19:22:31.501383
4	5	\N	4967651.59	virtual	f	0.00	PAG-875863	\N	2026-05-20 19:38:04.537091
5	2	\N	11120000.00	virtual	f	0.00	PAG-500358	\N	2026-05-20 20:45:17.490393
6	2	\N	467009.88	virtual	f	0.00	PAG-590993	\N	2026-05-20 20:45:46.573705
7	2	\N	5000000.00	virtual	f	0.00	PAG-143947	\N	2026-05-20 20:52:34.200894
8	5	\N	10000000.00	virtual	f	0.00	PAG-979301	\N	2026-05-20 20:56:34.252287
9	5	\N	351050.43	virtual	f	0.00	PAG-746944	\N	2026-05-20 21:38:31.506089
10	5	\N	1670000.00	virtual	f	0.00	PAG-625599	\N	2026-05-20 21:39:15.388247
11	5	\N	34645.82	virtual	f	0.00	PAG-738156	\N	2026-05-20 21:41:04.033917
12	5	\N	1000000.00	presencial	f	0.00	REC-306491	\N	2026-05-22 00:11:45.097891
13	5	\N	641759.95	presencial	f	0.00	REC-489359	\N	2026-05-22 00:31:44.656864
14	5	\N	4136125.00	virtual	f	0.00	PAG-341227	\N	2026-06-02 16:54:18.451349
\.


--
-- Data for Name: pago_detalle; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pago_detalle (id_pago_detalle, id_pago_pagodetalle, id_cuota_pagodetalle, monto_aplicado_pagodetalle, dias_mora_pagodetalle, interes_mora_pagodetalle, base_calculo_pagodetalle, tasa_mora_pagodetalle) FROM stdin;
1	1	25	162802.63	0	0.00	\N	\N
2	2	26	162802.63	0	0.00	\N	\N
3	3	49	180761.98	0	0.00	\N	\N
4	4	50	4967651.59	0	0.00	\N	\N
5	5	2	11120000.00	0	0.00	\N	\N
6	6	13	467009.88	0	0.00	\N	\N
7	7	14	5000000.00	0	0.00	\N	\N
8	8	85	10000000.00	0	0.00	\N	\N
9	9	109	351050.43	0	0.00	\N	\N
10	10	110	1670000.00	0	0.00	\N	\N
11	11	115	34645.82	0	0.00	\N	\N
12	12	116	1000000.00	0	0.00	\N	\N
13	13	97	641759.95	0	0.00	\N	\N
14	14	128	4136125.00	0	0.00	\N	\N
\.


--
-- Data for Name: reestructuracion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reestructuracion (id_reestruc, id_credito_reestruc, id_gestor_reestruc, plazo_nuevo_reestruc, cuotas_nuevas_reestruc, tasa_nueva_reestruc, motivo_reestruc, fecha_reestruc) FROM stdin;
\.


--
-- Data for Name: simulacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.simulacion (id_simulacion, id_socio_simulacion, id_linea_simulacion, id_config_simulacion, monto_simulacion, plazo_meses_simulacion, tasa_simulada_simulacion, cuota_estimada_simulacion, total_intereses_simulacion, fecha_simulacion) FROM stdin;
\.


--
-- Data for Name: socio; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.socio (id_socio, id_usuario_socio, id_cooperativa_socio, saldo_ahorros_socio, fecha_ingreso_socio, estado_socio, empresa_socio, cargo_socio, tipo_contrato_socio, antiguedad_meses_socio, ingresos_mensuales_socio, egresos_mensuales_socio, otros_ingresos_socio, patrimonio_socio, cuota_ahorro_socio) FROM stdin;
6	20	2	2800000.00	2026-05-19 14:55:15.492608	activo	Distribuidora El Buen Gusto S.A.S.	Gerente Comercial	indefinido	36	5200000.00	2100000.00	800000.00	45000000.00	400000
7	21	2	0.00	2026-05-19 15:59:21.452341	activo	Restaurante La Casona	Mesera	fijo	4	2200000.00	1800000.00	0.00	8000000.00	1000000
8	22	2	0.00	2026-05-20 17:38:25.63883	activo	Independiente	Desocupada	indefinido	1	1313000.00	0.00	0.00	0.00	100000.00
2	14	1	10550000.00	2026-05-18 21:24:58.481856	activo	Innovatech Ltda	Ingeniero de Sistemas	indefinido	36	4200000.00	1600000.00	400000.00	25000000.00	150000.00
5	17	2	669238.02	2026-05-18 23:01:50.174683	activo	Centro de Estética Glamour	Estilista Profesional	indefinido	18	3800000.00	1500000.00	400000.00	18000000.00	100000.00
9	23	2	0.00	2026-06-11 17:01:01.958325	activo	Independiente	Desocupado	indefinido	1	2500000.00	0.00	0.00	0.00	100000.00
10	24	2	1000000.00	2026-07-24 16:08:29.249722	activo	Independiente	Desocupado	indefinido	1	1800000.00	0.00	0.00	0.00	100000.00
\.


--
-- Data for Name: solicitud_afiliacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.solicitud_afiliacion (id_solicitud, nit_cooperativa, nombre_cooperativa, correo_cooperativa, telefono_cooperativa, direccion_cooperativa, sitio_web, nombre_representante, cedula_representante, cargo_representante, correo_representante, telefono_representante, lineas_credito, cantidad_socios, necesita_migracion, contrasena_admin, estado_solicitud, fecha_solicitud) FROM stdin;
\.


--
-- Data for Name: solicitud_credito; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.solicitud_credito (id_solicitud, id_socio_solicitud, id_linea_solicitud, id_config_solicitud, id_simulacion_solicitud, monto_solicitado_solicitud, plazo_meses_solicitud, proposito_solicitud, estado_solicitud, id_analista_solicitud, fecha_solicitud, fecha_resolucion_solicitud) FROM stdin;
1	2	1	1	\N	12000000.00	12	Compra de equipo tecnológico	desembolsada	\N	2026-05-18 21:24:58.484721	\N
2	2	1	1	\N	5000000.00	12	Prueba de integración automatizada Antigravity	aprobada	\N	2026-05-19 14:07:41.315723	2026-05-19 14:07:41.327582
3	2	1	1	\N	1000000.00	12	Test Credit via E2E	pendiente	\N	2026-05-19 14:25:00.45148	\N
5	6	3	3	\N	15000000.00	36	Remodelación completa del segundo piso de la casa propia	pendiente	\N	2026-05-18 19:57:50.773815	\N
6	7	4	4	\N	3500000.00	24	Pago de matrícula semestral en la universidad USCO - Ingeniería de Sistemas	aprobada	\N	2026-05-19 14:57:50.773815	2026-05-19 20:09:43.882849
7	7	2	2	\N	5000000.00	36	Libre inversión y gastos personales	rechazada	\N	2026-05-19 20:12:24.923498	2026-05-19 20:14:06.745554
8	5	2	2	\N	5000000.00	36	Libre inversión y gastos personales	aprobada	\N	2026-05-20 14:26:09.56716	2026-05-20 14:28:22.721303
4	5	2	2	\N	5000000.00	12	Compra de vehículo para desplazamiento al trabajo	aprobada	\N	2026-05-17 19:57:50.773815	2026-05-20 20:42:52.078147
10	5	2	2	\N	7000000.00	12	Libre inversión y gastos personales	aprobada	\N	2026-05-20 21:04:37.019465	2026-05-20 21:05:21.457795
9	5	2	2	\N	2000000.00	6	Libre inversión y gastos personales	aprobada	\N	2026-05-20 20:44:06.867588	2026-05-20 21:05:31.742857
11	5	2	2	\N	5000000.00	12	Libre inversión y gastos personales	aprobada	\N	2026-05-20 22:22:37.786045	2026-05-20 22:23:17.441797
12	10	2	2	\N	6000000.00	11	Libre inversión y gastos personales	aprobada	\N	2026-07-24 16:14:09.481841	2026-07-24 16:14:57.349367
13	10	2	2	\N	6650000.00	11	Libre inversión y gastos personales	pendiente	\N	2026-07-28 13:53:03.657784	\N
\.


--
-- Data for Name: usuario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuario (id_usuario, id_cooperativa_usuario, nombre_usuario, documento_usuario, correo_usuario, contrasena_usuario, rol_usuario, estado_usuario, fecha_creacion_usuario, telefono_usuario, direccion_usuario) FROM stdin;
1	1	Super Administrador	000000000	superadmin@coopmoney.com	$2b$12$heQT2zmtPB9GcaWSL83U2.h8wJkmy.hUyz4Exy8xabxKwBBCs.Zbi	super_admin	activo	2026-05-18 17:33:14.529987	\N	\N
2	2	Daniel Vera	1006510328	pvfduni@gmail.com	$2b$12$heQT2zmtPB9GcaWSL83U2.h8wJkmy.hUyz4Exy8xabxKwBBCs.Zbi	admin_local	activo	2026-05-18 20:14:13.164026	\N	\N
3	2	Juan Perez	1023456789	juan.perez@coop.com	$2b$12$heQT2zmtPB9GcaWSL83U2.h8wJkmy.hUyz4Exy8xabxKwBBCs.Zbi	analista	activo	2026-05-18 21:03:48.025593	3001234567	\N
4	2	Maria Gomez	1034567890	maria.gomez@coop.com	$2b$12$heQT2zmtPB9GcaWSL83U2.h8wJkmy.hUyz4Exy8xabxKwBBCs.Zbi	cajero	activo	2026-05-18 21:03:48.025593	3109876543	\N
5	2	Carlos Lopez	1045678901	carlos.lopez@coop.com	$2b$12$heQT2zmtPB9GcaWSL83U2.h8wJkmy.hUyz4Exy8xabxKwBBCs.Zbi	gerente	activo	2026-05-18 21:03:48.025593	3201234567	\N
6	2	Ana Castro	1056789012	ana.castro@coop.com	$2b$12$heQT2zmtPB9GcaWSL83U2.h8wJkmy.hUyz4Exy8xabxKwBBCs.Zbi	gestor_financiero	activo	2026-05-18 21:03:48.025593	3151234567	\N
7	2	Carlos Pérez	80123456	carlos@coop.com	$2b$12$heQT2zmtPB9GcaWSL83U2.h8wJkmy.hUyz4Exy8xabxKwBBCs.Zbi	analista	activo	2026-05-18 21:03:48.025593	3001112222	\N
8	2	Ana Gómez	81234567	ana@coop.com	$2b$12$heQT2zmtPB9GcaWSL83U2.h8wJkmy.hUyz4Exy8xabxKwBBCs.Zbi	cajero	activo	2026-05-18 21:03:48.025593	3102223333	\N
9	2	Luis Mora	82345678	luis@coop.com	$2b$12$heQT2zmtPB9GcaWSL83U2.h8wJkmy.hUyz4Exy8xabxKwBBCs.Zbi	gestor_financiero	activo	2026-05-18 21:03:48.025593	3203334444	\N
10	2	Sofía Ríos	83456789	sofia@coop.com	$2b$12$heQT2zmtPB9GcaWSL83U2.h8wJkmy.hUyz4Exy8xabxKwBBCs.Zbi	cajero	activo	2026-05-18 21:03:48.025593	3114445555	\N
11	2	Pedro Díaz	84567890	pedro@coop.com	$2b$12$heQT2zmtPB9GcaWSL83U2.h8wJkmy.hUyz4Exy8xabxKwBBCs.Zbi	gerente	activo	2026-05-18 21:03:48.025593	3125556666	\N
12	2	Laura Paz	85678901	laura@coop.com	$2b$12$heQT2zmtPB9GcaWSL83U2.h8wJkmy.hUyz4Exy8xabxKwBBCs.Zbi	analista	activo	2026-05-18 21:03:48.025593	3136667777	\N
17	2	Tatiana Ramos	1006289061	veraprdm@gmail.com	$2b$12$HW0OLG3yH3rpnk/SL3DZyugBv1PCY3.yOVZfB.2T5mPx8uGbTYgDK	socio	activo	2026-05-18 23:01:50.174683	3153470934	\N
18	3	Pepito Perez	1006745234	pepito@gmail.com	$2b$12$fZe/dwVqIaGK4UgFoVjhzuqGICQmOwqZ83bvpEUySIa/ktXqd7TW2	admin_local	activo	2026-05-18 23:11:15.108552	3212345436	\N
19	4	Mami Papi	1006510329	papi@gmail.com	$2b$12$xPfQRvDnRcQ.oX.XMsiGCuZ7yr12DDMHoqe2UfA76VfamdMd3rcxa	admin_local	activo	2026-05-18 23:13:21.547041	3123456789	\N
21	2	Pepita Florez	10092938833	ingrijuliethgascatenorio@gmail.com	$2b$12$WrznoXoz78OMJY/DoOT6zetLc0LQKaTAAMZ4Z3bA5Qlu5sp6OUKzy	socio	activo	2026-05-19 15:59:21.452341	323467899	\N
22	2	Yuleiny Lugo	1234567811	yuleiny798@gmail.com	$2b$12$Kh8qvBs9nEpquKVJZqrfgelmKP.QGqIbU0i/2kXi0NbM9hj0w0p6i	socio	activo	2026-05-20 17:38:25.63883	3108617630	\N
23	2	Luchando los diaz	100674832	2005luismorales2020@gmail.com	$2b$12$J33zLY0uJHOFbMgTN3z2/.VsPH33IGaiImThsrnxdm9rWDKqeiC7S	socio	activo	2026-06-11 17:01:01.958325	3145678911	\N
24	2	Sebastian Carvajal	123456733	carvajal7lsch@gmail.com	$2b$12$XTsQQyFeGY43fJ.adb9KaOrkcRFmcvA5qwr5t9UCIqwE/3tfb0k9m	socio	activo	2026-07-24 16:08:29.249722	312456789	\N
14	1	Juan Pérez Socio	1098765432	socio@coop.com	$2b$12$NqqZIZWjJfl1XzNo4ClkouR7LK8vvoarEbT6sfEbvLd2YoBzVlu36	socio	activo	2026-05-18 21:24:58.477751	3159876543	\N
20	2	Topoyiyo	1117811948	murciacorredoremerson@gmail.com	$2b$12$uK1XMgLt9tUB3fWedokFluwl4zbida9BxztUIe1u8lQDz.WJQywqG	socio	activo	2026-05-19 14:55:15.492608	3229602906	\N
\.


--
-- Name: aspirante_id_aspirante_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.aspirante_id_aspirante_seq', 13, true);


--
-- Name: castigo_cartera_id_castigo_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.castigo_cartera_id_castigo_seq', 1, false);


--
-- Name: config_linea_id_config_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.config_linea_id_config_seq', 4, true);


--
-- Name: cooperativa_id_cooperativa_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cooperativa_id_cooperativa_seq', 4, true);


--
-- Name: credito_id_credito_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.credito_id_credito_seq', 10, true);


--
-- Name: cuota_id_cuota_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cuota_id_cuota_seq', 149, true);


--
-- Name: documento_generado_id_documento_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.documento_generado_id_documento_seq', 1, false);


--
-- Name: gestion_cobro_id_gestion_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.gestion_cobro_id_gestion_seq', 1, false);


--
-- Name: historial_analista_id_historial_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.historial_analista_id_historial_seq', 1, false);


--
-- Name: linea_credito_id_linea_credito_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.linea_credito_id_linea_credito_seq', 4, true);


--
-- Name: movimiento_ahorro_id_movimiento_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.movimiento_ahorro_id_movimiento_seq', 42, true);


--
-- Name: notificacion_id_notificacion_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notificacion_id_notificacion_seq', 52, true);


--
-- Name: pago_detalle_id_pago_detalle_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pago_detalle_id_pago_detalle_seq', 14, true);


--
-- Name: pago_id_pago_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pago_id_pago_seq', 14, true);


--
-- Name: reestructuracion_id_reestruc_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reestructuracion_id_reestruc_seq', 1, false);


--
-- Name: simulacion_id_simulacion_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.simulacion_id_simulacion_seq', 1, false);


--
-- Name: socio_id_socio_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.socio_id_socio_seq', 10, true);


--
-- Name: solicitud_afiliacion_id_solicitud_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.solicitud_afiliacion_id_solicitud_seq', 3, true);


--
-- Name: solicitud_credito_id_solicitud_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.solicitud_credito_id_solicitud_seq', 13, true);


--
-- Name: usuario_id_usuario_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuario_id_usuario_seq', 24, true);


--
-- Name: aspirante aspirante_id_cooperativa_aspirante_documento_aspirante_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aspirante
    ADD CONSTRAINT aspirante_id_cooperativa_aspirante_documento_aspirante_key UNIQUE (id_cooperativa_aspirante, documento_aspirante);


--
-- Name: aspirante aspirante_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aspirante
    ADD CONSTRAINT aspirante_pkey PRIMARY KEY (id_aspirante);


--
-- Name: castigo_cartera castigo_cartera_id_credito_castigo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.castigo_cartera
    ADD CONSTRAINT castigo_cartera_id_credito_castigo_key UNIQUE (id_credito_castigo);


--
-- Name: castigo_cartera castigo_cartera_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.castigo_cartera
    ADD CONSTRAINT castigo_cartera_pkey PRIMARY KEY (id_castigo);


--
-- Name: config_linea config_linea_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.config_linea
    ADD CONSTRAINT config_linea_pkey PRIMARY KEY (id_config);


--
-- Name: cooperativa cooperativa_correo_cooperativa_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cooperativa
    ADD CONSTRAINT cooperativa_correo_cooperativa_key UNIQUE (correo_cooperativa);


--
-- Name: cooperativa cooperativa_nit_cooperativa_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cooperativa
    ADD CONSTRAINT cooperativa_nit_cooperativa_key UNIQUE (nit_cooperativa);


--
-- Name: cooperativa cooperativa_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cooperativa
    ADD CONSTRAINT cooperativa_pkey PRIMARY KEY (id_cooperativa);


--
-- Name: credito credito_id_solicitud_credito_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credito
    ADD CONSTRAINT credito_id_solicitud_credito_key UNIQUE (id_solicitud_credito);


--
-- Name: credito credito_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credito
    ADD CONSTRAINT credito_pkey PRIMARY KEY (id_credito);


--
-- Name: cuota cuota_id_credito_cuota_numero_cuota_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuota
    ADD CONSTRAINT cuota_id_credito_cuota_numero_cuota_key UNIQUE (id_credito_cuota, numero_cuota);


--
-- Name: cuota cuota_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuota
    ADD CONSTRAINT cuota_pkey PRIMARY KEY (id_cuota);


--
-- Name: documento_generado documento_generado_numero_documento_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documento_generado
    ADD CONSTRAINT documento_generado_numero_documento_key UNIQUE (numero_documento);


--
-- Name: documento_generado documento_generado_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documento_generado
    ADD CONSTRAINT documento_generado_pkey PRIMARY KEY (id_documento);


--
-- Name: gestion_cobro gestion_cobro_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gestion_cobro
    ADD CONSTRAINT gestion_cobro_pkey PRIMARY KEY (id_gestion);


--
-- Name: historial_analista historial_analista_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_analista
    ADD CONSTRAINT historial_analista_pkey PRIMARY KEY (id_historial);


--
-- Name: linea_credito linea_credito_id_cooperativa_linea_nombre_linea_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.linea_credito
    ADD CONSTRAINT linea_credito_id_cooperativa_linea_nombre_linea_key UNIQUE (id_cooperativa_linea, nombre_linea);


--
-- Name: linea_credito linea_credito_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.linea_credito
    ADD CONSTRAINT linea_credito_pkey PRIMARY KEY (id_linea_credito);


--
-- Name: movimiento_ahorro movimiento_ahorro_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimiento_ahorro
    ADD CONSTRAINT movimiento_ahorro_pkey PRIMARY KEY (id_movimiento);


--
-- Name: notificacion notificacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificacion
    ADD CONSTRAINT notificacion_pkey PRIMARY KEY (id_notificacion);


--
-- Name: pago_detalle pago_detalle_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pago_detalle
    ADD CONSTRAINT pago_detalle_pkey PRIMARY KEY (id_pago_detalle);


--
-- Name: pago pago_numero_recibo_pago_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pago
    ADD CONSTRAINT pago_numero_recibo_pago_key UNIQUE (numero_recibo_pago);


--
-- Name: pago pago_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pago
    ADD CONSTRAINT pago_pkey PRIMARY KEY (id_pago);


--
-- Name: reestructuracion reestructuracion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reestructuracion
    ADD CONSTRAINT reestructuracion_pkey PRIMARY KEY (id_reestruc);


--
-- Name: simulacion simulacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.simulacion
    ADD CONSTRAINT simulacion_pkey PRIMARY KEY (id_simulacion);


--
-- Name: socio socio_id_usuario_socio_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.socio
    ADD CONSTRAINT socio_id_usuario_socio_key UNIQUE (id_usuario_socio);


--
-- Name: socio socio_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.socio
    ADD CONSTRAINT socio_pkey PRIMARY KEY (id_socio);


--
-- Name: solicitud_afiliacion solicitud_afiliacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitud_afiliacion
    ADD CONSTRAINT solicitud_afiliacion_pkey PRIMARY KEY (id_solicitud);


--
-- Name: solicitud_credito solicitud_credito_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitud_credito
    ADD CONSTRAINT solicitud_credito_pkey PRIMARY KEY (id_solicitud);


--
-- Name: usuario usuario_correo_usuario_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_correo_usuario_key UNIQUE (correo_usuario);


--
-- Name: usuario usuario_id_cooperativa_usuario_documento_usuario_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_id_cooperativa_usuario_documento_usuario_key UNIQUE (id_cooperativa_usuario, documento_usuario);


--
-- Name: usuario usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_pkey PRIMARY KEY (id_usuario);


--
-- Name: idx_aspirante_coop; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_aspirante_coop ON public.aspirante USING btree (id_cooperativa_aspirante);


--
-- Name: idx_castigo_estado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_castigo_estado ON public.castigo_cartera USING btree (estado_castigo);


--
-- Name: idx_credito_estado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_credito_estado ON public.credito USING btree (estado_credito);


--
-- Name: idx_credito_socio; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_credito_socio ON public.credito USING btree (id_socio_credito);


--
-- Name: idx_cuota_credito; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cuota_credito ON public.cuota USING btree (id_credito_cuota);


--
-- Name: idx_cuota_estado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cuota_estado ON public.cuota USING btree (estado_cuota);


--
-- Name: idx_cuota_vencida_pendiente; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cuota_vencida_pendiente ON public.cuota USING btree (fecha_vencimiento_cuota) WHERE (estado_cuota = 'pendiente'::public.estado_cuota);


--
-- Name: idx_cuota_vencimiento; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cuota_vencimiento ON public.cuota USING btree (fecha_vencimiento_cuota);


--
-- Name: idx_doc_vigente; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_doc_vigente ON public.documento_generado USING btree (id_socio_documento, tipo_documento) WHERE (vigente_documento = true);


--
-- Name: idx_gestion_credito; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_gestion_credito ON public.gestion_cobro USING btree (id_credito_gestion);


--
-- Name: idx_linea_coop; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_linea_coop ON public.linea_credito USING btree (id_cooperativa_linea);


--
-- Name: idx_movimiento_socio; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_movimiento_socio ON public.movimiento_ahorro USING btree (id_socio_movimiento);


--
-- Name: idx_notif_pendiente; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notif_pendiente ON public.notificacion USING btree (enviada_notificacion) WHERE (enviada_notificacion = false);


--
-- Name: idx_pago_fecha; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pago_fecha ON public.pago USING btree (fecha_pago);


--
-- Name: idx_pago_socio; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pago_socio ON public.pago USING btree (id_socio_pago);


--
-- Name: idx_pagodetalle_cuota; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pagodetalle_cuota ON public.pago_detalle USING btree (id_cuota_pagodetalle);


--
-- Name: idx_pagodetalle_pago; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pagodetalle_pago ON public.pago_detalle USING btree (id_pago_pagodetalle);


--
-- Name: idx_simulacion_socio; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_simulacion_socio ON public.simulacion USING btree (id_socio_simulacion);


--
-- Name: idx_socio_coop; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_socio_coop ON public.socio USING btree (id_cooperativa_socio);


--
-- Name: idx_solicitud_socio; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_solicitud_socio ON public.solicitud_credito USING btree (id_socio_solicitud);


--
-- Name: idx_usuario_coop; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_usuario_coop ON public.usuario USING btree (id_cooperativa_usuario);


--
-- Name: aspirante aspirante_id_analista_aspirante_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aspirante
    ADD CONSTRAINT aspirante_id_analista_aspirante_fkey FOREIGN KEY (id_analista_aspirante) REFERENCES public.usuario(id_usuario);


--
-- Name: aspirante aspirante_id_cooperativa_aspirante_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aspirante
    ADD CONSTRAINT aspirante_id_cooperativa_aspirante_fkey FOREIGN KEY (id_cooperativa_aspirante) REFERENCES public.cooperativa(id_cooperativa);


--
-- Name: castigo_cartera castigo_cartera_id_credito_castigo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.castigo_cartera
    ADD CONSTRAINT castigo_cartera_id_credito_castigo_fkey FOREIGN KEY (id_credito_castigo) REFERENCES public.credito(id_credito);


--
-- Name: castigo_cartera castigo_cartera_id_gerente_castigo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.castigo_cartera
    ADD CONSTRAINT castigo_cartera_id_gerente_castigo_fkey FOREIGN KEY (id_gerente_castigo) REFERENCES public.usuario(id_usuario);


--
-- Name: castigo_cartera castigo_cartera_id_gestor_castigo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.castigo_cartera
    ADD CONSTRAINT castigo_cartera_id_gestor_castigo_fkey FOREIGN KEY (id_gestor_castigo) REFERENCES public.usuario(id_usuario);


--
-- Name: config_linea config_linea_id_gestor_config_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.config_linea
    ADD CONSTRAINT config_linea_id_gestor_config_fkey FOREIGN KEY (id_gestor_config) REFERENCES public.usuario(id_usuario);


--
-- Name: config_linea config_linea_id_linea_config_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.config_linea
    ADD CONSTRAINT config_linea_id_linea_config_fkey FOREIGN KEY (id_linea_config) REFERENCES public.linea_credito(id_linea_credito);


--
-- Name: credito credito_id_linea_credito_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credito
    ADD CONSTRAINT credito_id_linea_credito_fkey FOREIGN KEY (id_linea_credito) REFERENCES public.linea_credito(id_linea_credito);


--
-- Name: credito credito_id_socio_credito_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credito
    ADD CONSTRAINT credito_id_socio_credito_fkey FOREIGN KEY (id_socio_credito) REFERENCES public.socio(id_socio);


--
-- Name: credito credito_id_solicitud_credito_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credito
    ADD CONSTRAINT credito_id_solicitud_credito_fkey FOREIGN KEY (id_solicitud_credito) REFERENCES public.solicitud_credito(id_solicitud);


--
-- Name: cuota cuota_id_credito_cuota_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuota
    ADD CONSTRAINT cuota_id_credito_cuota_fkey FOREIGN KEY (id_credito_cuota) REFERENCES public.credito(id_credito);


--
-- Name: documento_generado documento_generado_id_credito_documento_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documento_generado
    ADD CONSTRAINT documento_generado_id_credito_documento_fkey FOREIGN KEY (id_credito_documento) REFERENCES public.credito(id_credito);


--
-- Name: documento_generado documento_generado_id_socio_documento_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documento_generado
    ADD CONSTRAINT documento_generado_id_socio_documento_fkey FOREIGN KEY (id_socio_documento) REFERENCES public.socio(id_socio);


--
-- Name: documento_generado documento_generado_id_usuario_documento_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documento_generado
    ADD CONSTRAINT documento_generado_id_usuario_documento_fkey FOREIGN KEY (id_usuario_documento) REFERENCES public.usuario(id_usuario);


--
-- Name: gestion_cobro gestion_cobro_id_credito_gestion_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gestion_cobro
    ADD CONSTRAINT gestion_cobro_id_credito_gestion_fkey FOREIGN KEY (id_credito_gestion) REFERENCES public.credito(id_credito);


--
-- Name: gestion_cobro gestion_cobro_id_gestor_gestion_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gestion_cobro
    ADD CONSTRAINT gestion_cobro_id_gestor_gestion_fkey FOREIGN KEY (id_gestor_gestion) REFERENCES public.usuario(id_usuario);


--
-- Name: historial_analista historial_analista_id_analista_historial_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_analista
    ADD CONSTRAINT historial_analista_id_analista_historial_fkey FOREIGN KEY (id_analista_historial) REFERENCES public.usuario(id_usuario);


--
-- Name: historial_analista historial_analista_id_aspirante_historial_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_analista
    ADD CONSTRAINT historial_analista_id_aspirante_historial_fkey FOREIGN KEY (id_aspirante_historial) REFERENCES public.aspirante(id_aspirante);


--
-- Name: linea_credito linea_credito_id_cooperativa_linea_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.linea_credito
    ADD CONSTRAINT linea_credito_id_cooperativa_linea_fkey FOREIGN KEY (id_cooperativa_linea) REFERENCES public.cooperativa(id_cooperativa);


--
-- Name: movimiento_ahorro movimiento_ahorro_id_pago_movimiento_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimiento_ahorro
    ADD CONSTRAINT movimiento_ahorro_id_pago_movimiento_fkey FOREIGN KEY (id_pago_movimiento) REFERENCES public.pago(id_pago);


--
-- Name: movimiento_ahorro movimiento_ahorro_id_socio_movimiento_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimiento_ahorro
    ADD CONSTRAINT movimiento_ahorro_id_socio_movimiento_fkey FOREIGN KEY (id_socio_movimiento) REFERENCES public.socio(id_socio);


--
-- Name: notificacion notificacion_id_aspirante_notificacion_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificacion
    ADD CONSTRAINT notificacion_id_aspirante_notificacion_fkey FOREIGN KEY (id_aspirante_notificacion) REFERENCES public.aspirante(id_aspirante);


--
-- Name: notificacion notificacion_id_credito_notificacion_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificacion
    ADD CONSTRAINT notificacion_id_credito_notificacion_fkey FOREIGN KEY (id_credito_notificacion) REFERENCES public.credito(id_credito);


--
-- Name: notificacion notificacion_id_socio_notificacion_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificacion
    ADD CONSTRAINT notificacion_id_socio_notificacion_fkey FOREIGN KEY (id_socio_notificacion) REFERENCES public.socio(id_socio);


--
-- Name: pago_detalle pago_detalle_id_cuota_pagodetalle_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pago_detalle
    ADD CONSTRAINT pago_detalle_id_cuota_pagodetalle_fkey FOREIGN KEY (id_cuota_pagodetalle) REFERENCES public.cuota(id_cuota);


--
-- Name: pago_detalle pago_detalle_id_pago_pagodetalle_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pago_detalle
    ADD CONSTRAINT pago_detalle_id_pago_pagodetalle_fkey FOREIGN KEY (id_pago_pagodetalle) REFERENCES public.pago(id_pago);


--
-- Name: pago pago_id_cajero_pago_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pago
    ADD CONSTRAINT pago_id_cajero_pago_fkey FOREIGN KEY (id_cajero_pago) REFERENCES public.usuario(id_usuario);


--
-- Name: pago pago_id_socio_pago_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pago
    ADD CONSTRAINT pago_id_socio_pago_fkey FOREIGN KEY (id_socio_pago) REFERENCES public.socio(id_socio);


--
-- Name: reestructuracion reestructuracion_id_credito_reestruc_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reestructuracion
    ADD CONSTRAINT reestructuracion_id_credito_reestruc_fkey FOREIGN KEY (id_credito_reestruc) REFERENCES public.credito(id_credito);


--
-- Name: reestructuracion reestructuracion_id_gestor_reestruc_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reestructuracion
    ADD CONSTRAINT reestructuracion_id_gestor_reestruc_fkey FOREIGN KEY (id_gestor_reestruc) REFERENCES public.usuario(id_usuario);


--
-- Name: simulacion simulacion_id_config_simulacion_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.simulacion
    ADD CONSTRAINT simulacion_id_config_simulacion_fkey FOREIGN KEY (id_config_simulacion) REFERENCES public.config_linea(id_config);


--
-- Name: simulacion simulacion_id_linea_simulacion_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.simulacion
    ADD CONSTRAINT simulacion_id_linea_simulacion_fkey FOREIGN KEY (id_linea_simulacion) REFERENCES public.linea_credito(id_linea_credito);


--
-- Name: simulacion simulacion_id_socio_simulacion_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.simulacion
    ADD CONSTRAINT simulacion_id_socio_simulacion_fkey FOREIGN KEY (id_socio_simulacion) REFERENCES public.socio(id_socio);


--
-- Name: socio socio_id_cooperativa_socio_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.socio
    ADD CONSTRAINT socio_id_cooperativa_socio_fkey FOREIGN KEY (id_cooperativa_socio) REFERENCES public.cooperativa(id_cooperativa);


--
-- Name: socio socio_id_usuario_socio_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.socio
    ADD CONSTRAINT socio_id_usuario_socio_fkey FOREIGN KEY (id_usuario_socio) REFERENCES public.usuario(id_usuario);


--
-- Name: solicitud_credito solicitud_credito_id_analista_solicitud_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitud_credito
    ADD CONSTRAINT solicitud_credito_id_analista_solicitud_fkey FOREIGN KEY (id_analista_solicitud) REFERENCES public.usuario(id_usuario);


--
-- Name: solicitud_credito solicitud_credito_id_config_solicitud_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitud_credito
    ADD CONSTRAINT solicitud_credito_id_config_solicitud_fkey FOREIGN KEY (id_config_solicitud) REFERENCES public.config_linea(id_config);


--
-- Name: solicitud_credito solicitud_credito_id_linea_solicitud_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitud_credito
    ADD CONSTRAINT solicitud_credito_id_linea_solicitud_fkey FOREIGN KEY (id_linea_solicitud) REFERENCES public.linea_credito(id_linea_credito);


--
-- Name: solicitud_credito solicitud_credito_id_simulacion_solicitud_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitud_credito
    ADD CONSTRAINT solicitud_credito_id_simulacion_solicitud_fkey FOREIGN KEY (id_simulacion_solicitud) REFERENCES public.simulacion(id_simulacion);


--
-- Name: solicitud_credito solicitud_credito_id_socio_solicitud_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitud_credito
    ADD CONSTRAINT solicitud_credito_id_socio_solicitud_fkey FOREIGN KEY (id_socio_solicitud) REFERENCES public.socio(id_socio);


--
-- Name: usuario usuario_id_cooperativa_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_id_cooperativa_usuario_fkey FOREIGN KEY (id_cooperativa_usuario) REFERENCES public.cooperativa(id_cooperativa);


--
-- PostgreSQL database dump complete
--

\unrestrict UhyF4UbrrawFXMK3czdMYhxJNBIqfldFGdNMdt3tL36CeU7o1OQt8Z9ie1Xbhxy

