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
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.rol !== 'analista') {
        window.location.replace('index.html');
        return;
    }

    // Configurar Cabecera
    document.getElementById('header-coop-name').textContent = currentUser.cooperativa || 'Cooperativa Demo Huila';
    document.getElementById('header-user-name').textContent = currentUser.nombre;
    const initials = currentUser.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    document.getElementById('header-user-avatar').textContent = initials;

    // Configurar Perfil
    document.querySelectorAll('#p-nombre').forEach(el => el.textContent = currentUser.nombre);
    document.querySelectorAll('#p-documento').forEach(el => el.textContent = currentUser.documento || '10607080');
    document.querySelectorAll('#p-correo').forEach(el => el.textContent = currentUser.correo);

    // 2. NAVEGACIÓN POR PESTAÑAS
    const navItems = document.querySelectorAll('.dash-nav-item, .profile-dropdown-item[data-tab-target]');
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
        sessionStorage.removeItem('currentUser');
        localStorage.removeItem('currentUser');
        window.location.replace('index.html');
    });

    function formatCurrency(val) {
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);
    }

    // 3. CARGA DE SOLICITUDES EN ESTUDIO (CARDS)
    async function loadSolicitudes() {
        const container = document.getElementById('cards-solicitudes-container');
        const countBadge = document.getElementById('count-solicitudes');
        
        try {
            const res = await fetch(`/api/analista/solicitudes?cooperativaId=${currentUser.id_cooperativa}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error al obtener solicitudes.');
            
            if (data.length === 0) {
                countBadge.textContent = '0 pendientes';
                container.innerHTML = `
                    <div class="dash-card analista-empty-state">
                        <i class="bi bi-inbox"></i>
                        No hay solicitudes de crédito pendientes en este momento.
                    </div>
                `;
                return;
            }

            countBadge.textContent = `${data.length} pendiente${data.length > 1 ? 's' : ''}`;
            container.innerHTML = '';

            data.forEach(sol => {
                const fechaSol = new Date(sol.fecha_solicitud).toLocaleDateString('es-CO');
                const ahorroPctIcon = sol.cumple_15 ? 'bi-check-circle-fill' : 'bi-x-circle-fill';
                const ahorroPctColor = sol.cumple_15 ? '#10B981' : '#EF4444';
                const moraIcon = sol.dias_mora === 0 ? 'bi-check-circle-fill' : 'bi-x-circle-fill';
                const moraColor = sol.dias_mora === 0 ? '#10B981' : '#EF4444';
                const mesesIcon = sol.meses_socio >= 6 ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill';
                const mesesColor = sol.meses_socio >= 6 ? '#10B981' : '#F59E0B';

                const card = document.createElement('div');
                card.className = 'dash-card analista-solicitud-card';
                card.id = `card-sol-${sol.id_solicitud}`;
                card.innerHTML = `
                    <div class="analista-solicitud-top">
                        <div class="analista-socio-block">
                            <div class="analista-socio-header">
                                <span class="analista-socio-icon">
                                    <i class="bi bi-person-fill"></i>
                                </span>
                                <span class="analista-socio-name">${sol.asociado}</span>
                                <span class="analista-score-badge" style="background: ${sol.scoring_color};">${sol.scoring}</span>
                            </div>
                            <div class="analista-meta-grid">
                                <div class="analista-meta-item"><i class="bi bi-calendar3"></i> Solicitado: <strong>${fechaSol}</strong></div>
                                <div class="analista-meta-item"><i class="bi bi-cash-stack"></i> Monto: <strong>${formatCurrency(sol.monto)}</strong></div>
                                <div class="analista-meta-item"><i class="bi bi-calendar-range"></i> Plazo: <strong>${sol.plazo} meses</strong></div>
                                <div class="analista-meta-item"><i class="bi bi-tags"></i> Línea: <strong>${sol.linea}</strong></div>
                                <div class="analista-meta-item full"><i class="bi bi-chat-left-text"></i> Propósito: <strong>${sol.proposito || 'No especificado'}</strong></div>
                            </div>
                        </div>
                    </div>

                    <!-- DATOS FINANCIEROS DEL SOCIO -->
                    <div class="analista-financial-panel">
                        <div class="analista-financial-title">
                            <i class="bi bi-bar-chart-line"></i> DATOS FINANCIEROS DEL SOCIO
                        </div>
                        <div class="analista-financial-grid">
                            <div class="analista-financial-item">
                                <i class="bi bi-piggy-bank"></i>
                                <span>Saldo de ahorros:</span> <strong>${formatCurrency(sol.saldo_ahorros)}</strong>
                                <span style="color: ${ahorroPctColor};">(${sol.porcentaje_ahorro}% del monto)</span>
                                <i class="bi ${ahorroPctIcon}" style="color: ${ahorroPctColor};"></i>
                            </div>
                            <div class="analista-financial-item">
                                <i class="bi bi-credit-card"></i>
                                <span>Créditos activos:</span> <strong>${sol.creditos_activos}</strong>
                                <span style="color: ${moraColor};">(mora: ${sol.dias_mora} días)</span>
                                <i class="bi ${moraIcon}" style="color: ${moraColor};"></i>
                            </div>
                            <div class="analista-financial-item">
                                <i class="bi bi-calendar-check"></i>
                                <span>Tiempo como socio:</span> <strong>${sol.meses_socio} meses</strong>
                                <i class="bi ${mesesIcon}" style="color: ${mesesColor};"></i>
                            </div>
                            <div class="analista-financial-item">
                                <i class="bi bi-graph-up-arrow"></i>
                                <span>Historial de pagos:</span>
                                <strong style="color: ${sol.historial_color};">${sol.historial_label}</strong>
                            </div>
                        </div>
                    </div>

                    <!-- BOTONES DE ACCIÓN -->
                    <div class="analista-actions">
                        <button class="btn btn-secondary" onclick="verHistorial(${sol.id_socio}, '${sol.asociado.replace(/'/g, "\\'")}')">
                            <i class="bi bi-eye"></i> Ver historial completo
                        </button>
                        <button class="btn btn-primary" style="background-color: #10B981;" onclick="aprobarSolicitud(${sol.id_solicitud}, '${sol.asociado.replace(/'/g, "\\'")}')">
                            <i class="bi bi-check-circle"></i> Aprobar
                        </button>
                        <button class="btn btn-primary" style="background-color: #EF4444;" onclick="abrirRechazo(${sol.id_solicitud}, '${sol.asociado.replace(/'/g, "\\'")}')">
                            <i class="bi bi-x-circle"></i> Rechazar
                        </button>
                    </div>
                `;
                container.appendChild(card);
            });
        } catch(e) {
            console.error("Error cargando solicitudes:", e);
            container.innerHTML = `
                <div class="dash-card analista-error-state">
                    <i class="bi bi-exclamation-triangle"></i>
                    Error al conectar con la base de datos para cargar solicitudes.
                </div>
            `;
        }
    }

    // APROBAR solicitud
    window.aprobarSolicitud = async function(id, socioName) {
        if (!confirm(`¿Confirmas la APROBACIÓN del crédito para ${socioName}?\n\nSe generará el crédito, la tabla de amortización y se notificará al socio.`)) return;

        try {
            const res = await fetch(`/api/analista/solicitudes/${id}/resolver`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ decision: 'aprobar' })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error al aprobar.');
            alert(`✅ ${data.message}`);
            await loadSolicitudes();
        } catch (err) {
            alert(`❌ Error: ${err.message}`);
        }
    };

    // ABRIR modal de rechazo
    window.abrirRechazo = function(id, socioName) {
        document.getElementById('rechazo-solicitud-id').value = id;
        document.getElementById('rechazo-socio-name').textContent = socioName;
        document.getElementById('rechazo-motivo-input').value = '';
        document.getElementById('modal-rechazo').classList.add('open');
    };

    // CONFIRMAR rechazo
    document.getElementById('btn-confirmar-rechazo').addEventListener('click', async () => {
        const id = document.getElementById('rechazo-solicitud-id').value;
        const motivo = document.getElementById('rechazo-motivo-input').value.trim();

        if (!motivo) {
            alert('Debes escribir un motivo de rechazo.');
            return;
        }

        try {
            const res = await fetch(`/api/analista/solicitudes/${id}/resolver`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ decision: 'rechazar', motivo_rechazo: motivo })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error al rechazar.');
            document.getElementById('modal-rechazo').classList.remove('open');
            alert(`❌ ${data.message}`);
            await loadSolicitudes();
        } catch (err) {
            alert(`❌ Error: ${err.message}`);
        }
    });

    // VER HISTORIAL financiero del socio
    window.verHistorial = async function(idSocio, socioName) {
        document.getElementById('historial-socio-title').textContent = `Historial financiero de ${socioName}`;
        document.getElementById('historial-socio-content').innerHTML = '<div style="text-align:center; padding: 20px;">Cargando...</div>';
        document.getElementById('modal-historial-socio').classList.add('open');

        try {
            const res = await fetch(`/api/socio/historial/${idSocio}`);
            if (!res.ok) throw new Error();
            const history = await res.json();

            if (history.length === 0) {
                document.getElementById('historial-socio-content').innerHTML = '<p style="text-align: center; color: var(--color-text-muted);">Este socio no tiene movimientos registrados.</p>';
                return;
            }

            let html = `<table class="data-table" style="font-size: 0.85rem;">
                <thead><tr><th>Fecha</th><th>Operación</th><th>Monto</th><th>Descripción</th></tr></thead><tbody>`;
            history.forEach(h => {
                const color = h.tipo === 'deposito' ? 'var(--color-success)' : 'var(--color-danger)';
                const sign = h.tipo === 'deposito' ? '+' : '-';
                const badge = h.tipo === 'deposito' ? 'active' : 'inactive';
                html += `<tr>
                    <td>${new Date(h.fecha).toLocaleDateString('es-CO')}</td>
                    <td><span class="status-badge ${badge}">${h.tipo === 'deposito' ? 'Depósito' : 'Retiro'}</span></td>
                    <td style="font-weight: 600; color: ${color};">${sign}${formatCurrency(h.monto)}</td>
                    <td>${h.descripcion || '-'}</td>
                </tr>`;
            });
            html += '</tbody></table>';
            document.getElementById('historial-socio-content').innerHTML = html;
        } catch (e) {
            document.getElementById('historial-socio-content').innerHTML = '<p style="text-align: center; color: var(--color-danger);">Error al cargar historial.</p>';
        }
    };

    // 4. CARGA DE ASPIRANTES ASIGNADOS (NUEVOS SOCIOS)
    async function loadAspirantes() {
        const tbody = document.getElementById('tabla-analista-aspirantes');
        
        try {
            const res = await fetch(`/api/analista/aspirantes/${currentUser.id}`);
            if (!res.ok) throw new Error();
            const data = await res.json();

            if (data.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" style="text-align: center; color: var(--color-text-muted);">No tienes solicitudes de afiliación pendientes de revisión.</td>
                    </tr>
                `;
                return;
            }

            tbody.innerHTML = '';
            data.forEach(asp => {
                const tr = document.createElement('tr');
                tr.id = `row-asp-${asp.id_aspirante}`;
                tr.innerHTML = `
                    <td style="font-weight:600;">${asp.nombre_aspirante}</td>
                    <td>${asp.documento_aspirante}</td>
                    <td>
                        <div style="font-size:0.85rem; color:var(--color-text-main);">${asp.correo_aspirante}</div>
                        <div style="font-size:0.75rem; color:var(--color-text-muted);">${asp.telefono_aspirante || 'Sin teléfono'}</div>
                    </td>
                    <td>${asp.direccion_aspirante || '-'}</td>
                    <td style="font-weight:500;">${asp.ocupacion_aspirante || '-'}</td>
                    <td style="font-weight:700; color:var(--color-primary-dark);">${formatCurrency(asp.ingresos_aspirante)}</td>
                    <td>
                        <div style="display:flex; gap:6px;">
                            <button class="btn btn-primary" style="padding:4px 8px; font-size:0.8rem; background-color:#10B981;" onclick="resolverAspirante(${asp.id_aspirante}, '${asp.nombre_aspirante}', 'aprobar')">
                                <i class="bi bi-check-circle"></i> Aceptar
                            </button>
                            <button class="btn btn-secondary" style="padding:4px 8px; font-size:0.8rem; background-color:#EF4444; color:#fff; border:none;" onclick="resolverAspirante(${asp.id_aspirante}, '${asp.nombre_aspirante}', 'rechazar')">
                                <i class="bi bi-x-circle"></i> Rechazar
                            </button>
                        </div>
                    </td>
                </tr>
                `;
                tbody.appendChild(tr);
            });

        } catch (e) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; color: var(--color-text-muted);">Error al cargar solicitudes de la base de datos.</td>
                </tr>
            `;
        }
    }

    window.resolverAspirante = async function(id, name, decision) {
        if (decision === 'aprobar') {
            if (!confirm(`¿Confirmas la aceptación de ${name} como nuevo asociado de la cooperativa? Se le creará una cuenta de socio automáticamente.`)) {
                return;
            }

            try {
                const res = await fetch(`/api/analista/aspirantes/${id}/resolver`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ decision: 'aprobar' })
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Error al procesar la aprobación");

                alert(`✅ ${name} ha sido dado de alta como Socio exitosamente.`);
                loadAspirantes();

            } catch (err) {
                alert(`❌ Error: ${err.message}`);
            }

        } else {
            const motivo = prompt(`Escribe el motivo del rechazo para la solicitud de ${name}:`);
            if (motivo === null) return; // Cancelado

            if (!motivo.trim()) {
                alert("Debes especificar un motivo válido de rechazo.");
                return;
            }

            try {
                const res = await fetch(`/api/analista/aspirantes/${id}/resolver`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ decision: 'rechazar', motivo_rechazo: motivo })
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.error);

                alert(`❌ La solicitud de ${name} ha sido rechazada.`);
                loadAspirantes();

            } catch (err) {
                alert(`❌ Error: ${err.message}`);
            }
        }
    };

    // 5. RADICAR SOLICITUD MANUAL
    const formReg = document.getElementById('registrar-solicitud-form');
    const fAlert = document.getElementById('analista-form-alert');

    formReg.addEventListener('submit', async (e) => {
        e.preventDefault();
        fAlert.style.display = 'none';
        fAlert.className = 'alert';

        const doc = document.getElementById('sol-documento').value;
        const linea = document.getElementById('sol-linea').value;
        const monto = parseFloat(document.getElementById('sol-monto').value);
        const plazo = parseInt(document.getElementById('sol-plazo').value);
        const proposito = document.getElementById('sol-proposito').value;

        try {
            const res = await fetch('/api/analista/solicitudes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    documento: doc,
                    id_linea: linea,
                    monto: monto,
                    plazo: plazo,
                    proposito: proposito,
                    analista: currentUser.nombre
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error al radicar la solicitud.');

            fAlert.textContent = `✅ Solicitud radicada con éxito para el documento ${doc}. ID de solicitud: ${data.id}`;
            fAlert.style.display = 'block';
            fAlert.className = 'alert alert-success show';
            formReg.reset();

            // Recargar listado en el dashboard
            await loadSolicitudes();
        } catch(err) {
            fAlert.textContent = `❌ Error: ${err.message}`;
            fAlert.style.display = 'block';
            fAlert.className = 'alert alert-danger show';
        }
    });

    // 6. CAMBIO DE CONTRASEÑA
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

    await loadSolicitudes();
    await loadAspirantes();
});
