document.addEventListener('DOMContentLoaded', async () => {
    const originalFetch = window.fetch.bind(window);
    window.fetch = (input, init = {}) => {
        const url = typeof input === 'string' ? input : input?.url;
        const needsAuth = typeof url === 'string' && url.startsWith('/api/');
        if (!needsAuth) return originalFetch(input, init);
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser') || 'null');
        const token = currentUser && currentUser.token;
        const headers = new Headers(init.headers || {});
        if (token) headers.set('Authorization', `Bearer ${token}`);
        return originalFetch(input, { ...init, headers }).then(res => {
            if ((res.status === 401 || res.status === 403) && !window.location.pathname.endsWith('index.html')) {
                sessionStorage.removeItem('currentUser');
                localStorage.removeItem('currentUser');
                window.location.replace('index.html');
            }
            return res;
        });
    };

    // 1. VERIFICAR AUTENTICACIÓN
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.rol !== 'cajero') {
        window.location.replace('index.html');
        return;
    }

    // Configurar Cabecera
    document.getElementById('header-coop-name').textContent = `Cooperativa: ${currentUser.cooperativa || 'Cooperativa Demo Huila'}`;
    document.getElementById('header-user-name').textContent = currentUser.nombre;
    const initials = currentUser.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    document.getElementById('header-user-avatar').textContent = initials;

    // Configurar Perfil
    document.querySelectorAll('#p-nombre').forEach(el => el.textContent = currentUser.nombre);
    document.querySelectorAll('#p-documento').forEach(el => el.textContent = currentUser.documento || '10405060');
    document.querySelectorAll('#p-correo').forEach(el => el.textContent = currentUser.correo);

    // 2. NAVEGACIÓN POR PESTAÑAS
    const navItems = document.querySelectorAll('.dash-nav-item');
    const tabPanes = document.querySelectorAll('.tab-pane');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const target = item.getAttribute('data-tab-target');
            navItems.forEach(n => n.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            item.classList.add('active');
            document.getElementById(target).classList.add('active');
        });
    });

    // Cierre de Sesión
    document.getElementById('logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('currentUser');
        window.location.replace('index.html');
    });

    // Helpers
    function formatCurrency(val) {
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);
    }

    const cAlert = document.getElementById('cajero-alert');
    function showAlert(text, type) {
        cAlert.textContent = text;
        cAlert.style.display = 'block';
        cAlert.className = `alert show alert-${type}`;
    }
    function hideAlert() {
        cAlert.style.display = 'none';
    }

    const allowMocks = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    async function openPdfFromApi(url) {
        const win = window.open('', '_blank');
        const res = await fetch(url);
        if (!res.ok) {
            const data = await res.json().catch(() => null);
            throw new Error((data && data.error) ? data.error : 'No se pudo generar el recibo.');
        }
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        if (win) win.location = blobUrl;
        else window.open(blobUrl, '_blank');
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    }

    const btnCertPaz = document.getElementById('btn-cj-cert-pazysalvo');
    const btnCertAfi = document.getElementById('btn-cj-cert-afiliacion');
    const btnCertAho = document.getElementById('btn-cj-cert-ahorros');
    const btnCertEcu = document.getElementById('btn-cj-cert-estado-cuenta');

    function setCertButtonsEnabled(enabled) {
        [btnCertPaz, btnCertAfi, btnCertAho, btnCertEcu].forEach(btn => {
            if (!btn) return;
            btn.disabled = !enabled;
        });
    }

    // 3. BUSCADOR DE SOCIO
    const btnSearch = document.getElementById('btn-search-socio');
    const inputSearch = document.getElementById('search-socio-document');
    const resultCard = document.getElementById('result-socio-card');

    let socioEncontrado = null;

    async function openCertificado(tipo) {
        if (!socioEncontrado || !socioEncontrado.socio || !socioEncontrado.socio.id_socio) return;
        const socioId = socioEncontrado.socio.id_socio;
        const pathByTipo = {
            'pazysalvo': 'pazysalvo',
            'afiliacion': 'afiliacion',
            'ahorros': 'ahorros',
            'estado-cuenta': 'estado-cuenta'
        };
        const route = pathByTipo[tipo];
        if (!route) return;
        await openPdfFromApi(`/api/cajero/socios/${socioId}/certificados/${route}`);
    }

    if (btnCertPaz) {
        btnCertPaz.addEventListener('click', async () => {
            hideAlert();
            try {
                await openCertificado('pazysalvo');
            } catch (e) {
                showAlert(e.message || 'No se pudo generar el certificado.', 'danger');
            }
        });
    }
    if (btnCertAfi) {
        btnCertAfi.addEventListener('click', async () => {
            hideAlert();
            try {
                await openCertificado('afiliacion');
            } catch (e) {
                showAlert(e.message || 'No se pudo generar el certificado.', 'danger');
            }
        });
    }
    if (btnCertAho) {
        btnCertAho.addEventListener('click', async () => {
            hideAlert();
            try {
                await openCertificado('ahorros');
            } catch (e) {
                showAlert(e.message || 'No se pudo generar el certificado.', 'danger');
            }
        });
    }
    if (btnCertEcu) {
        btnCertEcu.addEventListener('click', async () => {
            hideAlert();
            try {
                await openCertificado('estado-cuenta');
            } catch (e) {
                showAlert(e.message || 'No se pudo generar el certificado.', 'danger');
            }
        });
    }

    btnSearch.addEventListener('click', async () => {
        hideAlert();
        resultCard.style.display = 'none';
        setCertButtonsEnabled(false);
        
        const doc = inputSearch.value.trim();
        if (!doc) {
            showAlert("Por favor ingresa un número de documento.", "danger");
            return;
        }

        try {
            // Busqueda real por documento
            const res = await fetch(`/api/socio/resumen/doc/${doc}`);
            if (!res.ok) throw new Error("Not found");
            const data = await res.json();
            
            socioEncontrado = data;
            
            // Cargar datos
            document.getElementById('res-socio-name').textContent = data.socio.nombre_usuario;
            document.getElementById('res-socio-doc').textContent = `CC: ${data.socio.documento_usuario}`;
            document.getElementById('res-socio-ahorros').textContent = formatCurrency(data.socio.saldo_ahorros_socio);
            renderCreditosSelect();
            
            resultCard.style.display = 'block';
            setCertButtonsEnabled(true);

        } catch (e) {
            if (allowMocks && doc === '1098765432') {
                socioEncontrado = {
                    socio: {
                        id_socio: 2,
                        nombre_usuario: "Juan Pérez Socio",
                        documento_usuario: doc,
                        saldo_ahorros_socio: 2850000
                    },
                    creditos: [
                        {
                            id_credito: 1,
                            monto_aprobado_credito: 12000000,
                            saldo_pendiente_credito: 11000000,
                            next_id_cuota: 10,
                            next_numero_cuota: 1,
                            next_valor_cuota: 450000
                        }
                    ]
                };
                
                document.getElementById('res-socio-name').textContent = socioEncontrado.socio.nombre_usuario;
                document.getElementById('res-socio-doc').textContent = `CC: ${doc}`;
                document.getElementById('res-socio-ahorros').textContent = formatCurrency(socioEncontrado.socio.saldo_ahorros_socio);
                renderCreditosSelect();
                
                resultCard.style.display = 'block';
                setCertButtonsEnabled(true);
            } else {
                showAlert("Socio no encontrado en esta cooperativa.", "danger");
            }
        }
    });

    // 4. TRANSACCIONES
    const formTx = document.getElementById('recaudo-form');
    const historialBody = document.getElementById('tabla-cajero-historial');
    const txTypeEl = document.getElementById('tx-type');
    const txMontoEl = document.getElementById('tx-monto');
    const txCreditoWrap = document.getElementById('tx-credito-wrap');
    const txCreditoEl = document.getElementById('tx-credito');
    const txCuotaHint = document.getElementById('tx-cuota-hint');
    const txMetodoWrap = document.getElementById('tx-metodo-wrap');
    const txMetodoEl = document.getElementById('tx-metodo');
    const txTipoPagoWrap = document.getElementById('tx-tipo-pago-wrap');
    const txTipoPagoEl = document.getElementById('tx-tipo-pago');
    const txAccionExtraWrap = document.getElementById('tx-accion-extra-wrap');
    const txAccionExtraEl = document.getElementById('tx-accion-extra');
    let txnList = [];
    let creditoSeleccionado = null;

    function getCreditosActivos() {
        if (!socioEncontrado) return [];
        if (Array.isArray(socioEncontrado.creditos)) return socioEncontrado.creditos;
        if (socioEncontrado.credito) return [socioEncontrado.credito];
        return [];
    }

    function selectCreditoById(idCredito) {
        const creditos = getCreditosActivos();
        creditoSeleccionado = creditos.find(c => String(c.id_credito) === String(idCredito)) || null;
        if (creditoSeleccionado) socioEncontrado.credito = creditoSeleccionado;
        syncCreditoUI();
        syncTxUI();
    }

    function renderCreditosSelect() {
        const creditos = getCreditosActivos();
        txCreditoEl.innerHTML = '';
        if (creditos.length === 0) {
            const opt = document.createElement('option');
            opt.value = '';
            opt.textContent = 'Sin créditos activos';
            txCreditoEl.appendChild(opt);
            creditoSeleccionado = null;
            socioEncontrado.credito = null;
            syncCreditoUI();
            syncTxUI();
            return;
        }

        for (const cr of creditos) {
            const opt = document.createElement('option');
            opt.value = String(cr.id_credito);
            const saldo = cr.saldo_pendiente_credito !== null && cr.saldo_pendiente_credito !== undefined
                ? formatCurrency(cr.saldo_pendiente_credito)
                : '';
            opt.textContent = `Crédito #${cr.id_credito}${saldo ? ` · Saldo ${saldo}` : ''}`;
            txCreditoEl.appendChild(opt);
        }

        creditoSeleccionado = creditos[0];
        socioEncontrado.credito = creditoSeleccionado;
        txCreditoEl.value = String(creditoSeleccionado.id_credito);
        syncCreditoUI();
        syncTxUI();
    }

    function syncCreditoUI() {
        if (socioEncontrado && socioEncontrado.credito) {
            document.getElementById('res-socio-credito-monto').textContent = formatCurrency(socioEncontrado.credito.monto_aprobado_credito);
            document.getElementById('res-socio-credito-pendiente').textContent = formatCurrency(socioEncontrado.credito.saldo_pendiente_credito);
        } else {
            document.getElementById('res-socio-credito-monto').textContent = "$0 (Sin crédito)";
            document.getElementById('res-socio-credito-pendiente').textContent = "$0";
        }
    }

    function calcularMoraCredito(cr) {
        const cuotaVal = Number(cr && cr.next_valor_cuota ? cr.next_valor_cuota : 0);
        const tasaMora = Number(cr && cr.tasa_moratoria_credito ? cr.tasa_moratoria_credito : 2.5);
        const fechaVence = cr && cr.next_fecha_vencimiento_cuota ? new Date(cr.next_fecha_vencimiento_cuota) : null;
        let diasMora = 0;
        if (fechaVence) {
            const diffMs = Date.now() - fechaVence.getTime();
            if (diffMs > 0) diasMora = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        }
        const interesMora = Number((cuotaVal * (tasaMora / 100) * (diasMora / 30)).toFixed(2));
        return { diasMora, interesMora };
    }

    function syncTxUI() {
        const type = txTypeEl.value;
        if (type === 'pago_cuota') {
            txCreditoWrap.style.display = '';
            txMetodoWrap.style.display = '';
            txTipoPagoWrap.style.display = '';
            if (!creditoSeleccionado) {
                txCuotaHint.textContent = 'Este socio no tiene créditos activos.';
                txAccionExtraWrap.style.display = 'none';
                txMontoEl.value = '';
                txMontoEl.disabled = true;
                return;
            }
            const cuotaId = creditoSeleccionado.next_id_cuota;
            const cuotaNum = creditoSeleccionado.next_numero_cuota;
            const cuotaVal = creditoSeleccionado.next_valor_cuota;
            const interesCorriente = creditoSeleccionado.next_interes_corriente_cuota;
            const saldoPendiente = creditoSeleccionado.saldo_pendiente_credito;
            if (!cuotaId || cuotaVal === null || cuotaVal === undefined) {
                txCuotaHint.textContent = 'Este crédito no tiene cuotas pendientes.';
                txAccionExtraWrap.style.display = 'none';
                txMontoEl.value = '';
                txMontoEl.disabled = true;
                return;
            }
            const modo = txTipoPagoEl.value;
            const mora = calcularMoraCredito(creditoSeleccionado);
            const baseCuotaConMora = Number(cuotaVal) + Number(mora.interesMora || 0);
            if (modo === 'normal') {
                txAccionExtraWrap.style.display = 'none';
                txCuotaHint.textContent = mora.diasMora > 0
                    ? `Cuota #${cuotaNum} · Valor ${formatCurrency(cuotaVal)} + Mora ${formatCurrency(mora.interesMora)} (${mora.diasMora} días)`
                    : `Cuota #${cuotaNum} · Valor ${formatCurrency(cuotaVal)}`;
                txMontoEl.value = baseCuotaConMora;
                txMontoEl.disabled = true;
            } else if (modo === 'total') {
                txAccionExtraWrap.style.display = 'none';
                const total = Number(saldoPendiente || 0) + Number(interesCorriente || 0) + Number(mora.interesMora || 0);
                txCuotaHint.textContent = mora.diasMora > 0
                    ? `Pago total · Total ${formatCurrency(total)} (incluye mora ${formatCurrency(mora.interesMora)})`
                    : `Pago total · Total ${formatCurrency(total)}`;
                txMontoEl.value = total;
                txMontoEl.disabled = true;
            } else {
                txAccionExtraWrap.style.display = '';
                txCuotaHint.textContent = `Otro valor · Mínimo ${formatCurrency(baseCuotaConMora + 1)}`;
                txMontoEl.value = '';
                txMontoEl.disabled = false;
            }
        } else {
            txCreditoWrap.style.display = 'none';
            txCuotaHint.textContent = '';
            txMetodoWrap.style.display = 'none';
            txTipoPagoWrap.style.display = 'none';
            txAccionExtraWrap.style.display = 'none';
            txMontoEl.disabled = false;
        }
    }

    txTypeEl.addEventListener('change', () => {
        syncTxUI();
    });

    txTipoPagoEl.addEventListener('change', () => {
        syncTxUI();
    });

    txCreditoEl.addEventListener('change', (e) => {
        selectCreditoById(e.target.value);
    });

    formTx.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideAlert();

        const type = txTypeEl.value;
        const monto = parseFloat(txMontoEl.value);

        if (!socioEncontrado) return;

        if (monto <= 0) {
            showAlert("El monto debe ser mayor a 0.", "danger");
            return;
        }

        try {
            const socioId = (socioEncontrado && socioEncontrado.socio && socioEncontrado.socio.id_socio) || socioEncontrado.id_socio || socioEncontrado.id;
            if (!socioId) {
                showAlert("No se pudo identificar el socio seleccionado.", "danger");
                return;
            }
            const creditoId = (creditoSeleccionado && creditoSeleccionado.id_credito) ? creditoSeleccionado.id_credito : null;
            const cuotaId = (creditoSeleccionado && creditoSeleccionado.next_id_cuota) ? creditoSeleccionado.next_id_cuota : null;
            if (type === 'pago_cuota' && (!creditoId || !cuotaId)) {
                showAlert("Selecciona un crédito con cuota pendiente para poder registrar el pago.", "danger");
                return;
            }
            const metodo = txMetodoEl ? txMetodoEl.value : 'efectivo';
            const tipoPago = txTipoPagoEl ? txTipoPagoEl.value : 'normal';
            const accionExtra = txAccionExtraEl ? txAccionExtraEl.value : null;
            const cuotaVal = creditoSeleccionado ? Number(creditoSeleccionado.next_valor_cuota || 0) : 0;
            if (type === 'pago_cuota' && tipoPago === 'extra') {
                const mora = creditoSeleccionado ? calcularMoraCredito(creditoSeleccionado) : { interesMora: 0 };
                const baseCuotaConMora = cuotaVal + Number(mora.interesMora || 0);
                if (!(monto > baseCuotaConMora)) {
                    showAlert("Para 'otro valor' el monto debe ser mayor al valor de la cuota (incluyendo mora).", "danger");
                    return;
                }
            }

            // Llamado real al recaudo
            const res = await fetch('/api/cajero/recaudar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_socio: socioId,
                    id_credito: creditoId,
                    id_cuota: cuotaId,
                    tipo: type,
                    monto: monto,
                    operador: currentUser.nombre,
                    metodo: metodo,
                    tipo_pago: tipoPago,
                    accion_extra: tipoPago === 'extra' ? accionExtra : null
                })
            });
            
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            showAlert(`Transacción registrada. Recibo N° ${data.referencia}`, "success");
            
            // Actualizar vista
            if (type === 'deposito_ahorros') {
                const act = data.saldo_ahorros_socio !== null && data.saldo_ahorros_socio !== undefined
                    ? parseFloat(data.saldo_ahorros_socio)
                    : parseFloat(socioEncontrado.socio.saldo_ahorros_socio) + monto;
                socioEncontrado.socio.saldo_ahorros_socio = act;
                document.getElementById('res-socio-ahorros').textContent = formatCurrency(act);
            } else {
                const act = data.saldo_pendiente_credito !== null && data.saldo_pendiente_credito !== undefined
                    ? parseFloat(data.saldo_pendiente_credito)
                    : Math.max(0, parseFloat(socioEncontrado.credito.saldo_pendiente_credito) - monto);
                socioEncontrado.credito.saldo_pendiente_credito = act;
                syncCreditoUI();
                if (data.saldo_ahorros_socio !== null && data.saldo_ahorros_socio !== undefined) {
                    const ah = parseFloat(data.saldo_ahorros_socio);
                    socioEncontrado.socio.saldo_ahorros_socio = ah;
                    document.getElementById('res-socio-ahorros').textContent = formatCurrency(ah);
                }
            }

            addTxRow(type, monto, data.referencia);
            formTx.reset();
            syncTxUI();

            if (type === 'deposito_ahorros' && data.id_movimiento) {
                await openPdfFromApi(`/api/ahorros/movimientos/${data.id_movimiento}/recibo`);
            } else if (type === 'pago_cuota' && data.id_pago) {
                await openPdfFromApi(`/api/pagos/${data.id_pago}/recibo`);
            }

        } catch (err) {
            showAlert(err && err.message ? err.message : "No fue posible registrar la transacción.", "danger");
        }
    });

    function addTxRow(type, monto, refStr) {
        const ref = refStr || `REC-${Math.floor(100000 + Math.random() * 900000)}`;
        const hr = new Date().toLocaleTimeString();
        const tr = document.createElement('tr');
        
        const label = type === 'pago_cuota' ? 'PAGO CUOTA' : 'DEPÓSITO AHORRO';
        const color = type === 'pago_cuota' ? 'var(--color-error)' : 'var(--color-success)';

        tr.innerHTML = `
            <td style="font-family:monospace; font-weight:700;">${ref}</td>
            <td>${hr}</td>
            <td style="font-weight:600;">${socioEncontrado.nombre || (socioEncontrado.socio && socioEncontrado.socio.nombre_usuario)}</td>
            <td><span class="status-badge active" style="background-color:${color}; color:#fff; border:none;">${label}</span></td>
            <td style="font-weight:700; color:var(--color-primary-dark);">${formatCurrency(monto)}</td>
            <td>${currentUser.nombre}</td>
            <td><span class="status-badge active">COMPLETADO</span></td>
        `;

        if (historialBody.children.length === 1 && historialBody.children[0].cells.length === 1) {
            historialBody.innerHTML = '';
        }
        historialBody.insertBefore(tr, historialBody.firstChild);
    }

    // 5. CAMBIO DE CONTRASEÑA
    const changePassForm = document.getElementById('change-password-form');
    const passAlert = document.getElementById('password-alert');

    changePassForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        passAlert.style.display = 'none';
        passAlert.className = 'alert';

        const curr = document.getElementById('pass-current').value;
        const newPass = document.getElementById('pass-new').value;
        const confPass = document.getElementById('pass-confirm').value;

        if (newPass !== confPass) {
            passAlert.textContent = 'La nueva contraseña y la confirmación no coinciden.';
            passAlert.style.display = 'block';
            passAlert.classList.add('show', 'alert-danger');
            return;
        }

        if (newPass.length < 6) {
            passAlert.textContent = 'La nueva contraseña debe tener al menos 6 caracteres.';
            passAlert.style.display = 'block';
            passAlert.classList.add('show', 'alert-danger');
            return;
        }

        try {
            const response = await fetch('/api/admin/perfil/contrasena', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_usuario: currentUser.id,
                    contrasenaActual: curr,
                    contrasenaNueva: newPass
                })
            });
            const data = await response.json();

            if (!response.ok) {
                passAlert.textContent = data.error || 'Error al actualizar la contraseña.';
                passAlert.style.display = 'block';
                passAlert.classList.add('show', 'alert-danger');
                return;
            }

            passAlert.textContent = data.message;
            passAlert.style.display = 'block';
            passAlert.classList.add('show', 'alert-success');
            changePassForm.reset();

        } catch (error) {
            passAlert.textContent = 'Error de conexión con el servidor.';
            passAlert.style.display = 'block';
            passAlert.classList.add('show', 'alert-danger');
        }
    });
});
