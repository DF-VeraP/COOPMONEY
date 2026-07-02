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
    if (!currentUser || currentUser.rol !== 'socio') {
        window.location.replace('index.html');
        return;
    }

    // Configurar Cabecera Básica
    document.getElementById('header-coop-name').textContent = `${currentUser.cooperativa || 'Cooperativa Demo Huila'}`;
    document.getElementById('header-user-name').textContent = currentUser.nombre;
    const initials = currentUser.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    document.getElementById('header-user-avatar').textContent = initials;

    // Ficha de perfil inicial
    document.getElementById('p-nombre').textContent = currentUser.nombre;
    document.getElementById('p-documento').textContent = currentUser.documento || '1098765432';
    document.getElementById('p-correo').textContent = currentUser.correo;
    const avatarLarge = document.getElementById('p-avatar-large');
    if (avatarLarge) avatarLarge.textContent = initials;

    // 2. NAVEGACIÓN POR PESTAÑAS
    const navItems = document.querySelectorAll('[data-tab-target]');
    const tabPanes = document.querySelectorAll('.tab-pane');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const target = item.getAttribute('data-tab-target');
            navItems.forEach(n => n.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            item.classList.add('active');
            document.getElementById(target).classList.add('active');

            // Cargar datos específicos al cambiar de pestaña
            if (target === 'tab-ahorros' && socioId) {
                loadSavingsMovements();
            } else if (target === 'tab-historial' && socioId) {
                loadFullHistory();
            }
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

    // HELPER: Toast reutilizable sin borde, con color de fondo personalizado
    function showToast({ icon, title, message, bgColor, iconBg, iconColor, titleColor }) {
        const toast = document.createElement('div');
        Object.assign(toast.style, {
            position: 'fixed',
            bottom: '20px',
            right: '-380px',
            width: '340px',
            backgroundColor: bgColor || '#FFFFFF',
            borderRadius: '14px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '16px 18px',
            zIndex: '10000',
            transition: 'right 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            fontFamily: 'Inter, sans-serif',
            border: 'none'
        });

        toast.innerHTML = `
            <div style="width: 40px; height: 40px; background: ${iconBg || '#E0E0E0'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: ${iconColor || '#333'}; flex-shrink: 0;">
                <i class="bi ${icon || 'bi-info-circle'}" style="font-size: 1.15rem;"></i>
            </div>
            <div style="flex-grow: 1; overflow: hidden;">
                <div style="font-size: 0.85rem; font-weight: 700; color: ${titleColor || '#1f2937'}; margin-bottom: 2px;">${title}</div>
                <div style="font-size: 0.75rem; color: #6b7280; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${message}</div>
            </div>
            <button onclick="this.parentElement.style.right='-380px'; setTimeout(() => this.parentElement.remove(), 400);" style="background: none; border: none; font-size: 1.2rem; color: #9ca3af; cursor: pointer; padding: 0; line-height: 1;">&times;</button>
        `;

        document.body.appendChild(toast);
        setTimeout(() => toast.style.right = '20px', 100);
        setTimeout(() => {
            if (document.body.contains(toast)) {
                toast.style.right = '-380px';
                setTimeout(() => toast.remove(), 400);
            }
        }, 5000);
    }

    // HELPER: Calcular estado de una cuota según días de vencimiento
    function getCuotaStatus(cuota) {
        if (cuota.estado_cuota === 'pagada') {
            return { key: 'pagada', borderColor: '#9e9e9e', badgeColor: '#757575', badgeBg: '#F5F5F5', icon: 'bi-check-circle-fill', label: 'Pagada' };
        }
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const vence = new Date(cuota.fecha_vencimiento_cuota);
        vence.setHours(0, 0, 0, 0);
        const diffMs = vence - hoy;
        const dias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        if (dias < 0) {
            // Vencida
            return { key: 'vencida', borderColor: '#EF4444', badgeColor: '#C62828', badgeBg: '#FFEBEE', icon: 'bi-exclamation-triangle-fill', label: `VENCIDA hace ${Math.abs(dias)} día${Math.abs(dias) !== 1 ? 's' : ''}`, dias };
        } else if (dias <= 3) {
            // Pronta a vencer
            const lbl = dias === 0 ? 'Vence HOY' : (dias === 1 ? 'Vence mañana' : `Vence en ${dias} días`);
            return { key: 'pronta_vencer', borderColor: '#F59E0B', badgeColor: '#F57C00', badgeBg: '#FFF8E1', icon: 'bi-exclamation-circle-fill', label: lbl, dias };
        } else {
            // Al día
            return { key: 'al_dia', borderColor: '#10B981', badgeColor: '#2E7D32', badgeBg: '#E8F5E9', icon: 'bi-check-circle-fill', label: `Al día`, dias };
        }
    }

    // HELPER: Renderizar una tarjeta de cuota compacta (para Dashboard)
    function renderCuotaCardCompact(cuota, creditInfo) {
        const status = getCuotaStatus(cuota);
        let fechaVenceFormateada = 'Fecha N/A';
        if (cuota.fecha_vencimiento_cuota) {
            const parts = cuota.fecha_vencimiento_cuota.split('T')[0].split('-');
            if (parts.length === 3) {
                fechaVenceFormateada = new Date(parts[0], parts[1] - 1, parts[2]).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
            }
        }

        return `
            <div style="display: flex; flex-direction: column; gap: 16px; padding: 20px; border-radius: 20px; background: #FFFFFF; box-shadow: 0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02); transition: all 0.2s ease;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <i class="bi bi-wallet2" style="color: ${status.borderColor}; font-size: 1.1rem;"></i>
                        <span style="font-weight: 600; font-size: 0.95rem; color: var(--color-text-main);">${creditInfo || 'Crédito'}</span>
                    </div>
                    <span style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; background: ${status.badgeBg}; color: ${status.badgeColor};">
                        <i class="bi ${status.icon}"></i> ${status.label}
                    </span>
                </div>
                
                <div style="height: 1px; background-color: #f1f5f9; width: 100%;"></div>
                
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; flex-direction: column;">
                        <span style="font-size: 0.8rem; color: var(--color-text-muted); margin-bottom: 2px;">Cuota #${cuota.numero_cuota} • <i class="bi bi-calendar-event" style="margin-left: 4px; margin-right: 2px;"></i> ${fechaVenceFormateada}</span>
                        <span style="font-weight: 700; font-size: 1.1rem; color: var(--color-text-main);">${formatCurrency(cuota.valor_cuota)}</span>
                    </div>
                    ${status.key !== 'pagada' ? `<button class="btn btn-primary" style="padding: 6px 14px; border-radius: 8px; font-size: 0.8rem; font-weight: 500;" onclick="openPaymentModal(${cuota.id_cuota}, ${cuota.numero_cuota}, '${cuota.fecha_vencimiento_cuota}', ${cuota.valor_cuota}, ${cuota.id_credito})">Pagar ahora</button>` : ''}
                </div>
            </div>
        `;
    }

    // HELPER: Renderizar tarjeta de crédito ACTIVO (para Mis Créditos)
    function renderCreditCard(cred) {
        const cuotasPendientes = cred.cuotas.filter(c => c.estado_cuota === 'pendiente');
        const cuotasPagadas = cred.cuotas.filter(c => c.estado_cuota === 'pagada');
        const nextCuota = cuotasPendientes[0] || null;
        const nextStatus = nextCuota ? getCuotaStatus(nextCuota) : null;
        const progreso = cred.cuotas.length > 0 ? Math.round((cuotasPagadas.length / cred.cuotas.length) * 100) : 0;
        const borderColor = nextStatus ? nextStatus.borderColor : '#10B981';
        const linea = cred.nombre_linea || 'Libre Inversión';

        return `
            <div style="background-color: #fff; border-radius: 20px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02); display: flex; flex-direction: column; gap: 16px;">
                <!-- Header del crédito -->
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <i class="bi bi-credit-card-2-front" style="color: var(--color-text-main); font-size: 1.2rem;"></i>
                        <span style="font-weight: 600; font-size: 1rem; color: var(--color-text-main);">${linea}</span>
                    </div>
                    ${nextStatus ? `
                    <span style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; background: ${nextStatus.badgeBg}; color: ${nextStatus.badgeColor};">
                        <i class="bi ${nextStatus.icon}"></i> ${nextStatus.label}
                    </span>` : `
                    <span style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; background: #F5F5F5; color: #757575;">
                        <i class="bi bi-check-circle-fill"></i> Liquidado
                    </span>
                    `}
                </div>

                <div style="height: 1px; background-color: #f1f5f9; width: 100%;"></div>

                <!-- Detalle de cuota próxima -->
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 0.9rem; color: var(--color-text-muted);">Cuota #${nextCuota ? nextCuota.numero_cuota : '-'}</span>
                    <span style="font-weight: 700; font-size: 1.15rem; color: var(--color-text-main);">${nextCuota ? formatCurrency(nextCuota.valor_cuota) : '$0'}</span>
                </div>

                <!-- Barra de progreso -->
                <div style="display: flex; flex-direction: column; gap: 6px;">
                    <span style="font-size: 0.8rem; color: var(--color-text-muted);"><i class="bi bi-circle-fill" style="font-size: 0.5rem; margin-right: 4px; vertical-align: middle;"></i>${cuotasPagadas.length} de ${cred.cuotas.length} cuotas pagadas</span>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="flex: 1; height: 6px; background: #f1f5f9; border-radius: 4px; overflow: hidden;">
                            <div style="width: ${progreso}%; height: 100%; background: var(--color-primary); border-radius: 4px;"></div>
                        </div>
                        <span style="font-size: 0.8rem; font-weight: 600; color: var(--color-text-main);">${progreso}%</span>
                    </div>
                </div>

                <div style="height: 1px; background-color: #f1f5f9; width: 100%;"></div>

                <!-- Botones -->
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; gap: 12px;">
                        <button class="btn btn-icon" style="color: var(--color-primary); font-weight: 500; font-size: 0.85rem; display: flex; align-items: center; gap: 4px; padding: 0;" onclick="window.togglePlan(${cred.id_credito})">
                            Ver detalles <i class="bi bi-chevron-right"></i>
                        </button>
                        <button class="btn btn-icon" style="color: #8B5CF6; font-weight: 500; font-size: 0.85rem; display: flex; align-items: center; gap: 4px; padding: 0;" onclick="window.openHistorialCredito(${cred.id_credito})">
                            <i class="bi bi-receipt"></i> Pagos
                        </button>
                    </div>
                    ${nextCuota ? `<button class="btn btn-primary" style="padding: 6px 16px; border-radius: 8px; font-size: 0.85rem; font-weight: 500;" onclick="openPaymentModal(${nextCuota.id_cuota}, ${nextCuota.numero_cuota}, '${nextCuota.fecha_vencimiento_cuota}', ${nextCuota.valor_cuota}, ${cred.id_credito})">Pagar ahora</button>` : ''}
                </div>
            </div>
        `;
    }

    // HELPER: Renderizar tarjeta de crédito PAGADO/FINALIZADO (historial)
    function renderPaidCreditCard(cred) {
        const cuotasPagadas = cred.cuotas.filter(c => c.estado_cuota === 'pagada');
        const totalPagado = cuotasPagadas.reduce((sum, c) => sum + parseFloat(c.valor_cuota || 0), 0);
        const linea = cred.nombre_linea || 'Libre Inversión';
        const montoAprobado = parseFloat(cred.monto_aprobado_credito || 0);
        const fechaCreacion = cred.fecha_creacion_credito ? new Date(cred.fecha_creacion_credito).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';

        return `
            <div style="background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f8fafc 100%); border-radius: 20px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02); display: flex; flex-direction: column; gap: 14px; border: 1px solid #d1fae5;">
                <!-- Header -->
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <i class="bi bi-patch-check-fill" style="color: #10B981; font-size: 1.2rem;"></i>
                        <span style="font-weight: 600; font-size: 1rem; color: var(--color-text-main);">${linea}</span>
                    </div>
                    <span style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 14px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; background: linear-gradient(135deg, #10B981, #059669); color: #fff;">
                        <i class="bi bi-trophy-fill"></i> Liquidado
                    </span>
                </div>

                <div style="height: 1px; background-color: #d1fae5; width: 100%;"></div>

                <!-- Info resumida -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    <div style="display: flex; flex-direction: column; gap: 2px;">
                        <span style="font-size: 0.75rem; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.03em;">Monto aprobado</span>
                        <span style="font-weight: 700; font-size: 1.05rem; color: var(--color-text-main);">${formatCurrency(montoAprobado)}</span>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 2px;">
                        <span style="font-size: 0.75rem; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.03em;">Cuotas pagadas</span>
                        <span style="font-weight: 700; font-size: 1.05rem; color: #10B981;">${cuotasPagadas.length} de ${cred.cuotas.length}</span>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 2px;">
                        <span style="font-size: 0.75rem; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.03em;">Fecha de inicio</span>
                        <span style="font-weight: 600; font-size: 0.9rem; color: var(--color-text-main);">${fechaCreacion}</span>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 2px;">
                        <span style="font-size: 0.75rem; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.03em;">Saldo pendiente</span>
                        <span style="font-weight: 700; font-size: 0.9rem; color: #10B981;">$0 — Pagado</span>
                    </div>
                </div>

                <!-- Barra 100% -->
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="flex: 1; height: 6px; background: #d1fae5; border-radius: 4px; overflow: hidden;">
                        <div style="width: 100%; height: 100%; background: linear-gradient(90deg, #10B981, #059669); border-radius: 4px;"></div>
                    </div>
                    <span style="font-size: 0.8rem; font-weight: 700; color: #10B981;">100%</span>
                </div>

                <div style="height: 1px; background-color: #d1fae5; width: 100%;"></div>

                <!-- Botones -->
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; gap: 12px;">
                        <button class="btn btn-icon" style="color: var(--color-primary); font-weight: 500; font-size: 0.85rem; display: flex; align-items: center; gap: 4px; padding: 0;" onclick="window.togglePlan(${cred.id_credito})">
                            Ver detalles <i class="bi bi-chevron-right"></i>
                        </button>
                        <button class="btn btn-icon" style="color: #8B5CF6; font-weight: 500; font-size: 0.85rem; display: flex; align-items: center; gap: 4px; padding: 0;" onclick="window.openHistorialCredito(${cred.id_credito})">
                            <i class="bi bi-receipt"></i> Historial de Pagos
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // 3. CONTEXTO DE DATOS DE SOCIO
    let socioId = null;
    let savingsBalance = 0;
    let monthlySavingsFee = 100000;
    let activeCreditCuotas = [];
    let allCreditos = [];
    let fullHistoryData = [];

    async function loadSocioData() {
        try {
            const res = await fetch(`/api/socio/resumen/${currentUser.id}`);
            if (!res.ok) throw new Error("Backend offline");
            const data = await res.json();

            if (data.socio) {
                socioId = data.socio.id_socio;
                savingsBalance = parseFloat(data.socio.saldo_ahorros_socio || 0);
                monthlySavingsFee = parseFloat(data.socio.cuota_ahorro_socio || 100000);

                // Actualizar KPIs de Ahorros
                document.getElementById('resumen-ahorros').textContent = formatCurrency(savingsBalance);
                document.getElementById('resumen-cuota-mensual').textContent = formatCurrency(monthlySavingsFee);

                // Actualizar Pestaña Ahorros
                document.getElementById('ahorros-saldo-actual').textContent = formatCurrency(savingsBalance);
                document.getElementById('ahorros-cuota-config').textContent = formatCurrency(monthlySavingsFee);
                document.getElementById('nequi-monto').value = monthlySavingsFee; // Precargar monto nequi
                document.getElementById('ahorro-monto-config-input').value = monthlySavingsFee; // Precargar config perfil

                // Ficha Perfil Completa
                document.getElementById('p-documento').textContent = data.socio.documento_usuario || currentUser.documento;
                document.getElementById('p-correo').textContent = data.socio.correo_usuario || currentUser.correo;
                document.getElementById('p-empresa').textContent = `${data.socio.empresa_socio || 'Independiente'} / ${data.socio.cargo_socio || 'Asociado'}`;
                document.getElementById('p-ingresos').textContent = formatCurrency(data.socio.ingresos_mensuales_socio || 0);
                document.getElementById('p-egresos').textContent = formatCurrency(data.socio.egresos_mensuales_socio || 0);

                // Cupo Máximo en Simulador (15%)
                document.getElementById('sim-cupo-maximo').textContent = formatCurrency(savingsBalance / 0.15);
            }

            // Alerta de aporte de Ahorro mensual pendiente
            const ahorroAlert = document.getElementById('ahorro-alert-banner');

            // Calcular fecha real del próximo pago de ahorro (el 15 del mes correspondiente)
            const today = new Date();
            let nextPaymentDate = new Date(today.getFullYear(), today.getMonth(), 15);

            if (data.ahorroMesPagado) {
                // Si ya pagó el mes actual, el próximo corte es el mes siguiente
                nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
            }

            const mesStr = nextPaymentDate.toLocaleString('es-CO', { month: 'long' });
            const nextPaymentStr = `15 de ${mesStr}`;

            // Actualizar tarjetas en la UI
            const elResumenFecha = document.getElementById('resumen-fecha-ahorro');
            if (elResumenFecha) elResumenFecha.textContent = nextPaymentStr;

            const elAhorrosFecha = document.getElementById('ahorros-fecha-proxima');
            if (elAhorrosFecha) elAhorrosFecha.textContent = nextPaymentStr;

            if (data.ahorroMesPagado === false) {
                ahorroAlert.style.display = 'flex';
                document.getElementById('ahorro-val-pending').textContent = formatCurrency(monthlySavingsFee);
            } else {
                ahorroAlert.style.display = 'none';
            }

            // Datos de Créditos y Amortización
            const creditsActiveVal = document.getElementById('resumen-creditos-activos');
            const totalDeudaVal = document.getElementById('resumen-total-deuda');

            // Guardar todos los créditos con cuotas
            allCreditos = data.creditos || [];

            if (allCreditos.length > 0) {
                // Solo contar créditos activos para el KPI (no los pagados)
                const onlyActive = allCreditos.filter(c => c.estado_credito === 'activo');
                creditsActiveVal.textContent = onlyActive.length.toString();
                const totalDeuda = onlyActive.reduce((sum, c) => sum + parseFloat(c.saldo_pendiente_credito), 0);
                totalDeudaVal.textContent = formatCurrency(totalDeuda);

                // Compatibilidad: cuotas del primer crédito
                activeCreditCuotas = data.cuotas || [];
            } else if (data.credito) {
                // Fallback por si creditos no viene del backend
                creditsActiveVal.textContent = "1";
                totalDeudaVal.textContent = formatCurrency(data.credito.saldo_pendiente_credito);
                activeCreditCuotas = data.cuotas || [];
                allCreditos = [{ ...data.credito, cuotas: data.cuotas || [] }];
            } else {
                creditsActiveVal.textContent = "0";
                totalDeudaVal.textContent = "$0";
                document.getElementById('card-amortizacion-detalle').style.display = 'none';
            }

            // ====================================================
            // SECCIÓN A: TARJETAS "PRÓXIMOS PAGOS" (Dashboard)
            // ====================================================
            const containerProximos = document.getElementById('container-proximos-pagos');
            const badgeProximos = document.getElementById('badge-proximos-pagos');

            // Recolectar SOLO LA PRÓXIMA cuota pendiente de cada crédito activo
            const allPendingCuotas = [];
            allCreditos.forEach(cred => {
                if (cred.estado_credito !== 'activo') return; // Solo créditos activos
                
                const linea = cred.nombre_linea || 'Libre Inversión';
                const pendientes = (cred.cuotas || []).filter(c => c.estado_cuota === 'pendiente');
                
                if (pendientes.length > 0) {
                    // Obtener la cuota con el numero_cuota más bajo (la más pronta a vencer)
                    const nextCuota = pendientes.reduce((min, cuota) => cuota.numero_cuota < min.numero_cuota ? cuota : min);
                    allPendingCuotas.push({ ...nextCuota, creditInfo: linea, id_credito: cred.id_credito });
                }
            });

            // Ordenar por fecha de vencimiento (más próximas primero)
            allPendingCuotas.sort((a, b) => new Date(a.fecha_vencimiento_cuota) - new Date(b.fecha_vencimiento_cuota));

            // Mostrar las primeras 4 cuotas más próximas
            const topCuotas = allPendingCuotas.slice(0, 4);

            if (topCuotas.length > 0) {
                badgeProximos.textContent = `${allPendingCuotas.length} cuota${allPendingCuotas.length > 1 ? 's' : ''} pendiente${allPendingCuotas.length > 1 ? 's' : ''}`;
                containerProximos.innerHTML = topCuotas.map(c => renderCuotaCardCompact(c, c.creditInfo)).join('');
            } else if (allCreditos.length > 0) {
                badgeProximos.textContent = '0 pendientes';
                badgeProximos.className = 'status-badge active';
                containerProximos.innerHTML = `
                    <div style="text-align: center; color: var(--color-success); padding: var(--spacing-xl); font-weight: 600;">
                        <i class="bi bi-trophy-fill" style="font-size: 2rem; display: block; margin-bottom: 8px;"></i>
                        ¡Felicidades! Estás completamente al día con tus créditos.
                    </div>
                `;
            } else {
                badgeProximos.textContent = '0 cuotas';
                containerProximos.innerHTML = `
                    <div style="text-align: center; color: var(--color-text-muted); padding: var(--spacing-xl);">
                        <i class="bi bi-inbox" style="font-size: 2rem; display: block; margin-bottom: 8px; opacity: 0.4;"></i>
                        No posees obligaciones vigentes.
                    </div>
                `;
            }

            // ====================================================
            // SECCIÓN B: TARJETAS DETALLADAS "MIS CRÉDITOS"
            // ====================================================
            const containerCreditos = document.getElementById('container-creditos-cards');
            const badgeCreditos = document.getElementById('badge-creditos-activos');

            // Separar créditos activos de los finalizados/pagados
            const creditosActivos = allCreditos.filter(c => c.estado_credito === 'activo');
            const creditosPagados = allCreditos.filter(c => c.estado_credito === 'pagado');

            let creditosHTML = '';

            if (creditosActivos.length > 0) {
                badgeCreditos.textContent = `${creditosActivos.length} activo${creditosActivos.length > 1 ? 's' : ''}`;
                creditosHTML += creditosActivos.map(cred => renderCreditCard(cred)).join('');
            } else {
                badgeCreditos.textContent = '0 activos';
                creditosHTML += `
                    <div class="dash-card" style="text-align: center; color: var(--color-text-muted); padding: var(--spacing-3xl);">
                        <i class="bi bi-wallet2" style="font-size: 2.5rem; display: block; margin-bottom: var(--spacing-md); opacity: 0.3;"></i>
                        No tienes créditos activos en este momento.
                    </div>
                `;
            }

            // Sección de créditos finalizados
            if (creditosPagados.length > 0) {
                creditosHTML += `
                    <div style="margin-top: 28px; margin-bottom: 14px; display: flex; align-items: center; gap: 10px;">
                        <i class="bi bi-archive-fill" style="color: #10B981; font-size: 1.15rem;"></i>
                        <span style="font-weight: 700; font-size: 1.05rem; color: var(--color-text-main);">Créditos Finalizados</span>
                        <span style="display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 600; background: #ECFDF5; color: #065F46;">
                            ${creditosPagados.length} liquidado${creditosPagados.length > 1 ? 's' : ''}
                        </span>
                    </div>
                `;
                creditosHTML += creditosPagados.map(cred => renderPaidCreditCard(cred)).join('');
            }

            if (allCreditos.length === 0) {
                // Ni activos ni pagados: socio nuevo
                badgeCreditos.textContent = '0 créditos';
                creditosHTML = `
                    <div class="dash-card" style="text-align: center; color: var(--color-text-muted); padding: var(--spacing-3xl);">
                        <i class="bi bi-wallet2" style="font-size: 2.5rem; display: block; margin-bottom: var(--spacing-md); opacity: 0.3;"></i>
                        No tienes créditos registrados. Cuando solicites tu primer crédito, aparecerá aquí.
                    </div>
                `;
            }

            containerCreditos.innerHTML = creditosHTML;

            // Manejo de la Mora e Intereses acumulados
            const moraBanner = document.getElementById('mora-alert-banner');
            const kpiMoraVal = document.getElementById('resumen-mora-actual');
            const kpiMoraStatus = document.getElementById('resumen-mora-status');
            const kpiMoraIcon = document.getElementById('icon-estado-mora');

            if (data.moraInfo && data.moraInfo.inMora) {
                moraBanner.style.display = 'flex';
                document.getElementById('mora-val-due').textContent = formatCurrency(data.moraInfo.montoMora);
                document.getElementById('mora-val-interest').textContent = formatCurrency(data.moraInfo.interesMora);

                kpiMoraVal.textContent = formatCurrency(data.moraInfo.montoMora);
                kpiMoraVal.style.color = 'var(--color-error)';
                kpiMoraStatus.innerHTML = `<i class="bi bi-x-circle-fill" style="color: var(--color-error);"></i> ${data.moraInfo.diasMora} días de mora`;

                kpiMoraIcon.className = 'bi bi-shield-fill-x kpi-icon';
                kpiMoraIcon.style.color = 'var(--color-error)';
            } else {
                moraBanner.style.display = 'none';
                kpiMoraVal.textContent = "$0";
                kpiMoraVal.style.color = 'var(--color-success)';
                kpiMoraStatus.innerHTML = `<i class="bi bi-check-circle-fill" style="color: var(--color-success);"></i> Al día`;

                kpiMoraIcon.className = 'bi bi-shield-exclamation kpi-icon';
                kpiMoraIcon.style.color = 'var(--color-success)';
            }

            // Notificaciones en la campana
            const badge = document.getElementById('badge-notificaciones');
            if (data.unreadNotifications && data.unreadNotifications > 0) {
                badge.textContent = data.unreadNotifications;
                badge.style.display = 'block';
            } else {
                badge.style.display = 'none';
            }

            // Actualizar gráfica de evolución de ahorros con datos reales
            renderEvolucionAhorros(savingsBalance, socioId);

            // Recalcular el simulador con los ahorros reales cargados
            simular();

        } catch (error) {
            console.error("Error al obtener datos reales:", error);
            // Fallback parcial a mocks de ser necesario
        }
    }

    async function renderEvolucionAhorros(currentBalance, idSocio) {
        try {
            const res = await fetch(`/api/socio/historial/${idSocio}`);
            if (!res.ok) return;
            const history = await res.json();
            
            const savingMovs = history.filter(m => m.tipo === 'deposito' || m.tipo === 'retiro');
            
            const today = new Date();
            const monthsData = [];
            
            for (let i = 5; i >= 0; i--) {
                const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
                monthsData.push({
                    monthStr: d.toLocaleString('es-CO', { month: 'short' }).substring(0, 3),
                    year: d.getFullYear(),
                    month: d.getMonth(),
                    deposits: 0,
                    withdrawals: 0
                });
            }

            // Calcular depósitos y retiros por separado para cada mes
            for (let i = 0; i < 6; i++) {
                const mData = monthsData[i];
                const startOfMonth = new Date(mData.year, mData.month, 1, 0, 0, 0, 0);
                const endOfMonth = new Date(mData.year, mData.month + 1, 0, 23, 59, 59, 999);
                
                for (const mov of savingMovs) {
                    const movDate = new Date(mov.fecha);
                    if (movDate >= startOfMonth && movDate <= endOfMonth) {
                        if (mov.tipo === 'deposito') {
                            mData.deposits += parseFloat(mov.monto);
                        } else {
                            mData.withdrawals += parseFloat(mov.monto);
                        }
                    }
                }
            }

            // Valor máximo entre todos los depósitos y retiros para escalar las barras
            const allValues = monthsData.flatMap(m => [m.deposits, m.withdrawals]);
            const maxVal = Math.max(...allValues, 100000); // mínimo 100k para evitar barras gigantes con montos bajos

            // Formatear valor corto
            function shortFormat(val) {
                if (val >= 1000000) return '$' + (val / 1000000).toFixed(1).replace('.0', '') + 'M';
                if (val >= 1000) return '$' + (val / 1000).toFixed(0) + 'k';
                if (val > 0) return '$' + Math.round(val);
                return '';
            }

            // Generar HTML dinámico
            const container = document.getElementById('chart-container');
            container.innerHTML = monthsData.map((m, i) => {
                const depPct = (m.deposits / maxVal) * 100;
                const witPct = (m.withdrawals / maxVal) * 100;
                const lblMonth = m.monthStr.charAt(0).toUpperCase() + m.monthStr.slice(1);
                const isCurrentMonth = i === 5;

                return `
                    <div style="display: flex; flex-direction: column; justify-content: flex-end; align-items: center; width: 14%; height: 100%;">
                        <div style="display: flex; gap: 3px; align-items: flex-end; width: 100%; justify-content: center; height: calc(100% - 26px);">
                            <!-- Barra Depósitos (verde) -->
                            <div style="position: relative; width: 45%; height: ${depPct > 0 ? depPct : 0}%; min-height: ${m.deposits > 0 ? '4px' : '0'}; background: linear-gradient(to top, #34d399, #10B981); border-radius: 4px 4px 0 0; transition: height 0.5s ease;" title="Depósitos: ${formatCurrency(m.deposits)}">
                                ${m.deposits > 0 ? `<div style="position: absolute; top: -20px; width: 100%; text-align: center; font-size: 0.62rem; font-weight: 700; color: #059669; white-space: nowrap;">${shortFormat(m.deposits)}</div>` : ''}
                            </div>
                            <!-- Barra Retiros (ámbar) -->
                            <div style="position: relative; width: 45%; height: ${witPct > 0 ? witPct : 0}%; min-height: ${m.withdrawals > 0 ? '4px' : '0'}; background: linear-gradient(to top, #fbbf24, #f59e0b); border-radius: 4px 4px 0 0; transition: height 0.5s ease;" title="Retiros: ${formatCurrency(m.withdrawals)}">
                                ${m.withdrawals > 0 ? `<div style="position: absolute; top: -20px; width: 100%; text-align: center; font-size: 0.62rem; font-weight: 700; color: #D97706; white-space: nowrap;">${shortFormat(m.withdrawals)}</div>` : ''}
                            </div>
                        </div>
                        <span style="font-size: 0.72rem; margin-top: 6px; color: ${isCurrentMonth ? 'var(--color-text-main)' : 'var(--color-text-muted)'}; font-weight: ${isCurrentMonth ? '600' : '400'};">${lblMonth}</span>
                    </div>
                `;
            }).join('');

        } catch (e) {
            console.error("Error renderEvolucionAhorros:", e);
        }
    }

    // 4. TABLA DE AMORTIZACIÓN Y PAGOS VIRTUALES
    function loadAmortizationTable(cuotas) {
        const body = document.getElementById('tabla-amortizacion-socio');
        body.innerHTML = '';
        cuotas.forEach(c => {
            const tr = document.createElement('tr');
            const isPaid = c.estado_cuota === 'pagada';
            const statusLabel = isPaid ? 'Pagada' : 'Pendiente';
            const statusBg = isPaid ? '#F5F5F5' : '#FFF8E1';
            const statusColor = isPaid ? '#757575' : '#F57C00';

            // Botón de acción pagar si está pendiente
            const actionBtn = isPaid
                ? `<span style="color: var(--color-success); font-weight: 600;"><i class="bi bi-patch-check-fill"></i> Liquidada</span>`
                : `<button class="btn btn-primary" style="padding: 4px 10px; font-size: 0.75rem;" onclick="openPaymentModal(${c.id_cuota}, ${c.numero_cuota}, '${c.fecha_vencimiento_cuota}', ${c.valor_cuota}, ${c.id_credito})">
                     <i class="bi bi-wallet2"></i> Pagar cuota
                   </button>`;

            tr.innerHTML = `
                <td>Cuota ${c.numero_cuota}</td>
                <td>${new Date(c.fecha_vencimiento_cuota).toLocaleDateString('es-CO')}</td>
                <td style="font-weight:600;">${formatCurrency(c.valor_cuota)}</td>
                <td>${formatCurrency(c.abono_capital_cuota)}</td>
                <td>${formatCurrency(c.interes_corriente_cuota)}</td>
                <td>${formatCurrency(c.saldo_restante_cuota)}</td>
                <td><span style="display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; background: ${statusBg}; color: ${statusColor};"><i class="bi ${isPaid ? 'bi-check-circle-fill' : 'bi-clock-fill'}" style="margin-right: 4px;"></i>${statusLabel}</span></td>
                <td>${actionBtn}</td>
            `;
            body.appendChild(tr);
        });
    }

    // 4.1 LOGICA DEL MODAL DE PAGO
    let currentPagoContext = null;

    window.openPaymentModal = (idCuota, numCuota, fechaVence, valor, idCredito) => {
        // Encontrar el crédito y la cuota
        const cred = allCreditos.find(c => c.id_credito === idCredito);
        if (!cred) return;
        const cuota = cred.cuotas.find(c => c.id_cuota === idCuota);
        if (!cuota) return;

        const cuotasPendientes = (cred.cuotas || []).filter(c => c.estado_cuota === 'pendiente').sort((a, b) => a.numero_cuota - b.numero_cuota);
        if (cuotasPendientes.length > 0 && String(cuotasPendientes[0].id_cuota) !== String(idCuota)) {
            alert(`⚠️ Debes pagar primero la cuota más antigua pendiente (#${cuotasPendientes[0].numero_cuota}).`);
            return;
        }

        // Validaciones:
        if (cuota.estado_cuota === 'pagada') {
            alert("⚠️ Esta cuota ya ha sido pagada anteriormente.");
            return;
        }

        const deudaRestante = parseFloat(cred.saldo_pendiente_credito);
        if (deudaRestante <= 0) {
            alert("🎉 Este crédito ya está pagado completamente. ¡Felicidades!");
            return;
        }

        currentPagoContext = {
            idCuota,
            numCuota,
            fechaVence,
            valor,
            idCredito,
            linea: cred.nombre_linea || 'Libre Inversión',
            deudaRestante,
            interesActual: parseFloat(cuota.interes_corriente_cuota) || 0,
            tasaMora: parseFloat(cred.tasa_moratoria_credito || 2.5)
        };

        // Llenar Modal Header
        document.getElementById('pago-cuota-linea').textContent = currentPagoContext.linea;
        document.getElementById('pago-cuota-numero').textContent = `#${numCuota}`;
        document.getElementById('pago-cuota-monto').textContent = formatCurrency(valor);
        document.getElementById('pago-cuota-vence').textContent = new Date(fechaVence).toLocaleDateString();

        // Limpiar errores y resetear opciones
        document.getElementById('pago-cuota-alerta').style.display = 'none';
        document.querySelector('input[name="pago_tipo"][value="normal"]').checked = true;
        document.querySelector('input[name="pago_metodo"][value="ahorros"]').checked = true;
        document.getElementById('pago-extra-container').style.display = 'none';
        document.getElementById('pago-monto-personalizado').value = '';

        updateSimulacionPago();

        showModal('modal-pago-cuota');
    };

    function updateSimulacionPago() {
        if (!currentPagoContext) return;

        const tipoPago = document.querySelector('input[name="pago_tipo"]:checked').value;
        const metodo = document.querySelector('input[name="pago_metodo"]:checked').value;
        const cuotaBase = parseFloat(currentPagoContext.valor);
        const dueDate = currentPagoContext.fechaVence ? new Date(currentPagoContext.fechaVence) : null;
        let diasMora = 0;
        if (dueDate) {
            const diffMs = Date.now() - dueDate.getTime();
            if (diffMs > 0) diasMora = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        }
        const interesMora = parseFloat((cuotaBase * (Number(currentPagoContext.tasaMora || 2.5) / 100) * (diasMora / 30)).toFixed(2));
        const baseCuotaConMora = cuotaBase + interesMora;
        let valorCalculado = cuotaBase;

        const extraContainer = document.getElementById('pago-extra-container');

        if (tipoPago === 'normal') {
            extraContainer.style.display = 'none';
            valorCalculado = baseCuotaConMora;
        } else if (tipoPago === 'total') {
            extraContainer.style.display = 'none';
            // Pago total = Saldo Pendiente + Intereses de la cuota actual
            valorCalculado = currentPagoContext.deudaRestante + currentPagoContext.interesActual + interesMora;
        } else if (tipoPago === 'extra') {
            extraContainer.style.display = 'flex';
            const inputPersonalizado = parseFloat(document.getElementById('pago-monto-personalizado').value);
            valorCalculado = (inputPersonalizado > baseCuotaConMora) ? inputPersonalizado : baseCuotaConMora;
        }

        document.getElementById('pago-cuota-monto').textContent = formatCurrency(valorCalculado);
        const methodNames = {
            'ahorros': 'Ahorros',
            'pse': 'PSE',
            'nequi': 'Nequi'
        };

        document.getElementById('simulacion-metodo').textContent = methodNames[metodo];
        document.getElementById('simulacion-ahorros-actual').textContent = formatCurrency(savingsBalance);
        document.getElementById('simulacion-deuda-restante').textContent = formatCurrency(currentPagoContext.deudaRestante);

        const contenedorDespues = document.getElementById('simulacion-ahorros-despues-container');
        const alerta = document.getElementById('pago-cuota-alerta');
        const btnConfirmar = document.getElementById('btn-confirmar-pago');

        // VALIDACIÓN: No permitir que el valor exceda la liquidación total actual
        const maxLiquidar = currentPagoContext.deudaRestante + currentPagoContext.interesActual + interesMora;
        if (valorCalculado > maxLiquidar) {
            alerta.style.display = 'flex';
            document.getElementById('pago-cuota-alerta-texto').innerHTML = `<strong>Monto excedido:</strong> El pago no puede superar el monto de liquidación total de <strong>${formatCurrency(maxLiquidar)}</strong>.`;
            btnConfirmar.disabled = true;
            btnConfirmar.style.opacity = '0.5';
            btnConfirmar.style.cursor = 'not-allowed';
            if (metodo === 'ahorros') {
                contenedorDespues.style.display = 'flex';
                document.getElementById('simulacion-ahorros-despues').textContent = formatCurrency(savingsBalance - valorCalculado);
            } else {
                contenedorDespues.style.display = 'none';
            }
            return;
        }

        if (metodo === 'ahorros') {
            contenedorDespues.style.display = 'flex';
            document.getElementById('simulacion-ahorros-despues').textContent = formatCurrency(savingsBalance - valorCalculado);

            if (savingsBalance < valorCalculado) {
                const faltante = valorCalculado - savingsBalance;
                alerta.style.display = 'flex';
                document.getElementById('pago-cuota-alerta-texto').innerHTML = `<strong>Saldo insuficiente:</strong> Necesitas ${formatCurrency(faltante)} más en tus ahorros para pagar esta cuota.`;
                btnConfirmar.disabled = true;
                btnConfirmar.style.opacity = '0.5';
                btnConfirmar.style.cursor = 'not-allowed';
            } else {
                alerta.style.display = 'none';
                btnConfirmar.disabled = false;
                btnConfirmar.style.opacity = '1';
                btnConfirmar.style.cursor = 'pointer';
            }
        } else {
            contenedorDespues.style.display = 'none';
            alerta.style.display = 'none';
            btnConfirmar.disabled = false;
            btnConfirmar.style.opacity = '1';
            btnConfirmar.style.cursor = 'pointer';
        }
    }

    // Attach listeners a los radio buttons y selects
    document.querySelectorAll('input[name="pago_metodo"]').forEach(radio => {
        radio.addEventListener('change', updateSimulacionPago);
    });
    document.querySelectorAll('input[name="pago_tipo"]').forEach(radio => {
        radio.addEventListener('change', updateSimulacionPago);
    });
    document.getElementById('pago-monto-personalizado').addEventListener('input', updateSimulacionPago);

    // Confirmar pago
    document.getElementById('btn-confirmar-pago').addEventListener('click', async () => {
        if (!currentPagoContext) return;
        const metodo = document.querySelector('input[name="pago_metodo"]:checked').value;
        const tipoPago = document.querySelector('input[name="pago_tipo"]:checked').value;
        const cuotaBase = parseFloat(currentPagoContext.valor);
        const dueDate = currentPagoContext.fechaVence ? new Date(currentPagoContext.fechaVence) : null;
        let diasMora = 0;
        if (dueDate) {
            const diffMs = Date.now() - dueDate.getTime();
            if (diffMs > 0) diasMora = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        }
        const interesMora = parseFloat((cuotaBase * (Number(currentPagoContext.tasaMora || 2.5) / 100) * (diasMora / 30)).toFixed(2));
        const baseCuotaConMora = cuotaBase + interesMora;

        let valorCalculado = baseCuotaConMora;
        if (tipoPago === 'total') valorCalculado = currentPagoContext.deudaRestante + currentPagoContext.interesActual + interesMora;
        if (tipoPago === 'extra') {
            const extra = parseFloat(document.getElementById('pago-monto-personalizado').value);
            if (!extra || extra <= baseCuotaConMora) {
                alert("Para abonos extraordinarios el monto debe ser mayor al valor de la cuota.");
                return;
            }
            const maxLiquidar = currentPagoContext.deudaRestante + currentPagoContext.interesActual + interesMora;
            if (extra > maxLiquidar) {
                alert(`El monto ingresado ($${extra.toLocaleString('es-CO')}) excede el valor total para liquidar la deuda ($${maxLiquidar.toLocaleString('es-CO')}). Por favor, ajusta el monto o elige "Liquidación Total".`);
                return;
            }
            valorCalculado = extra;
        }

        // Simulaciones
        if (metodo === 'pse' || metodo === 'nequi') {
            const methodNames = {
                'pse': 'PSE',
                'nequi': 'Nequi'
            };
            const btn = document.getElementById('btn-confirmar-pago');
            const originalText = btn.innerHTML;
            btn.innerHTML = `<i class="bi bi-hourglass-split"></i> Procesando pago con ${methodNames[metodo]}...`;
            btn.disabled = true;

            setTimeout(async () => {
                alert(`✅ Pago simulado exitosamente con ${methodNames[metodo]}`);
                btn.innerHTML = originalText;
                btn.disabled = false;

                // Realizar la llamada real a la API para asentar el pago
                await proceedWithPayment('virtual', tipoPago, valorCalculado);
            }, 1500);
            return;
        }

        // Si es ahorros, validar antes
        if (metodo === 'ahorros') {
            if (savingsBalance < valorCalculado) {
                return; // no se cierra
            }
            await proceedWithPayment('ahorros', tipoPago, valorCalculado);
        }
    });

    async function openPdfFromApi(url) {
        const r = await fetch(url);
        if (!r.ok) {
            let errText = 'No se pudo generar el recibo.';
            try {
                const j = await r.json();
                if (j && j.error) errText = j.error;
            } catch (_) {
            }
            throw new Error(errText);
        }
        const blob = await r.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.target = '_blank';
        a.rel = 'noopener';
        a.click();
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    }

    window.downloadReciboPago = async (idPago) => {
        if (!idPago) return;
        await openPdfFromApi(`/api/pagos/${idPago}/recibo`);
    };

    async function proceedWithPayment(metodoStr, tipoPago, valorCalculado) {
        try {
            const accionExtra = document.getElementById('pago-accion-extra').value; // 'plazo' o 'cuota'
            const payload = {
                id_cuota: currentPagoContext.idCuota,
                id_socio: socioId,
                metodo: metodoStr,
                tipo_pago: tipoPago,
                monto_pago: valorCalculado,
                accion_extra: tipoPago === 'extra' ? accionExtra : null
            };
            const res = await fetch('/api/socio/pagar-cuota', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (res.ok) {
                closeModal('modal-pago-cuota');
                alert(`✅ ¡Pago procesado con éxito!\nReferencia de transacción: ${data.referencia || 'N/A'}`);
                if (data.id_pago) {
                    try {
                        await window.downloadReciboPago(data.id_pago);
                    } catch (e) {
                        alert(`No se pudo abrir el recibo: ${e.message}`);
                    }
                }

                // Recargar toda la data y forzar refresco de tablas de amortización
                await loadSocioData();
                if (document.getElementById('card-amortizacion-detalle').style.display === 'block') {
                    // Refrescar tabla del crédito actual si está abierta
                    const credObj = allCreditos.find(c => c.id_credito === currentPagoContext.idCredito);
                    if (credObj) {
                        activeCreditCuotas = credObj.cuotas || [];
                        loadAmortizationTable(activeCreditCuotas);
                    }
                }
            } else {
                alert(`❌ Error al pagar cuota: ${data.error}`);
            }
        } catch (err) {
            console.error(err);
            alert("❌ Error de red al procesar el pago.");
        }
    }

    // 4.2 HISTORIAL DE PAGOS POR CRÉDITO
    window.openHistorialCredito = async (idCredito) => {
        const cred = allCreditos.find(c => c.id_credito === idCredito);
        const linea = cred ? (cred.nombre_linea || 'Libre Inversión') : 'Crédito';

        document.getElementById('historial-credito-linea').textContent = linea;
        document.getElementById('historial-credito-total').textContent = '$0';

        const body = document.getElementById('tabla-historial-credito');
        body.innerHTML = '<tr><td colspan="5" style="text-align: center;">Cargando pagos...</td></tr>';

        showModal('modal-historial-credito');

        try {
            const res = await fetch(`/api/socio/credito/${idCredito}/pagos`);
            if (!res.ok) throw new Error('Error al cargar historial');
            const pagos = await res.json();

            body.innerHTML = '';
            if (pagos.length > 0) {
                let totalPagado = 0;
                pagos.forEach(p => {
                    totalPagado += parseFloat(p.monto);
                    const tr = document.createElement('tr');
                    const canalBadge = {
                        'virtual': { label: 'Ahorros', bg: '#ECFDF5', color: '#065F46' },
                        'pse': { label: 'PSE', bg: '#EFF6FF', color: '#1E40AF' },
                        'nequi': { label: 'Nequi', bg: '#F5F3FF', color: '#5B21B6' }
                    };
                    const canal = canalBadge[p.canal] || { label: p.canal, bg: '#F5F5F5', color: '#757575' };

                    tr.innerHTML = `
                        <td>${new Date(p.fecha).toLocaleDateString('es-CO')}</td>
                        <td><a href="#" onclick="window.downloadReciboPago(${p.id_pago}); return false;" style="font-family: monospace; font-size: 0.8rem; color: var(--color-primary); text-decoration: underline;">${p.recibo}</a></td>
                        <td style="text-align: center;">#${p.cuota_num}</td>
                        <td style="font-weight: 600;">${formatCurrency(p.monto)}</td>
                        <td><span style="display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 600; background: ${canal.bg}; color: ${canal.color};">${canal.label}</span></td>
                    `;
                    body.appendChild(tr);
                });
                document.getElementById('historial-credito-total').textContent = formatCurrency(totalPagado);
            } else {
                body.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--color-text-muted); padding: 30px 0;"><i class="bi bi-inbox" style="display: block; font-size: 1.5rem; margin-bottom: 8px; opacity: 0.3;"></i>Aún no has realizado pagos a este crédito.</td></tr>';
            }
        } catch (e) {
            console.error(e);
            body.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--color-danger);">Error al cargar el historial de pagos.</td></tr>';
        }
    };

    // 5. MOVIMIENTOS DE AHORROS
    async function loadSavingsMovements() {
        const body = document.getElementById('tabla-movimientos-ahorro');
        body.innerHTML = '<tr><td colspan="5" style="text-align: center;">Cargando movimientos...</td></tr>';

        try {
            const res = await fetch(`/api/socio/historial/${socioId}`);
            if (!res.ok) throw new Error("History offline");
            const movements = await res.json();

            body.innerHTML = '';
            // Filtrar solo movimientos tipo deposito/retiro de ahorros
            const savingMovs = movements.filter(m => m.tipo === 'deposito' || m.tipo === 'retiro');
            if (savingMovs.length > 0) {
                // Calcular saldo acumulado ("Saldo después") usando el saldo actual real y calculando en reversa
                let currentBalance = savingsBalance;

                savingMovs.forEach(m => {
                    m.saldoDespues = currentBalance;
                    // Restamos el impacto de este movimiento para saber cuál era el saldo ANTES de este movimiento
                    if (m.tipo === 'deposito') {
                        currentBalance -= parseFloat(m.monto);
                    } else {
                        currentBalance += parseFloat(m.monto);
                    }
                });

                // Renderizar en orden descendente (más reciente primero)
                savingMovs.forEach(m => {
                    const tr = document.createElement('tr');
                    const color = m.tipo === 'deposito' ? 'var(--color-success)' : 'var(--color-danger)';
                    const sign = m.tipo === 'deposito' ? '+' : '-';

                    tr.innerHTML = `
                        <td>${new Date(m.fecha).toLocaleDateString('es-CO')}</td>
                        <td><span class="status-badge ${m.tipo === 'deposito' ? 'active' : 'inactive'}">${m.tipo === 'deposito' ? 'Depósito' : 'Retiro'}</span></td>
                        <td style="font-weight: 600; color: ${color};">${sign}${formatCurrency(m.monto)}</td>
                        <td style="font-weight: 600;">${formatCurrency(m.saldoDespues || 0)}</td>
                    `;
                    body.appendChild(tr);
                });
            } else {
                body.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--color-text-muted);">No posees depósitos ni retiros registrados.</td></tr>';
            }
        } catch (e) {
            console.error(e);
            body.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--color-danger);">Error de conexión al cargar historial.</td></tr>';
        }
    }

    // 6. HISTORIAL COMPLETO
    function renderHistoryTable(historyArray) {
        const body = document.getElementById('tabla-historial-completo');
        body.innerHTML = '';
        if (historyArray.length > 0) {
            historyArray.forEach(h => {
                const tr = document.createElement('tr');
                
                let color, sign, badgeLabel, badgeStyle;
                if (h.tipo === 'deposito') {
                    color = 'var(--color-success)';
                    sign = '+';
                    badgeLabel = 'DEPÓSITO';
                    badgeStyle = 'background: #E8F5E9; color: #2E7D32; padding: 3px 10px; border-radius: 12px; font-size: 0.72rem; font-weight: 600;';
                } else if (h.tipo === 'retiro') {
                    color = 'var(--color-error)';
                    sign = '-';
                    badgeLabel = 'RETIRO';
                    badgeStyle = 'background: #FFF3E0; color: #E65100; padding: 3px 10px; border-radius: 12px; font-size: 0.72rem; font-weight: 600;';
                } else if (h.tipo === 'pago_credito') {
                    color = '#7C3AED';
                    sign = '-';
                    badgeLabel = 'PAGO CRÉDITO';
                    badgeStyle = 'background: #EDE9FE; color: #5B21B6; padding: 3px 10px; border-radius: 12px; font-size: 0.72rem; font-weight: 600;';
                } else {
                    color = 'var(--color-text-muted)';
                    sign = '';
                    badgeLabel = h.tipo.toUpperCase();
                    badgeStyle = 'background: #F5F5F5; color: #757575; padding: 3px 10px; border-radius: 12px; font-size: 0.72rem; font-weight: 600;';
                }

                tr.innerHTML = `
                    <td>${new Date(h.fecha).toLocaleString()}</td>
                    <td><span style="${badgeStyle}">${badgeLabel}</span></td>
                    <td style="font-weight: 600; color: ${color};">${sign}${formatCurrency(h.monto)}</td>
                    <td>${h.descripcion || 'Operación bancaria'}</td>
                `;
                body.appendChild(tr);
            });
        } else {
            body.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--color-text-muted);">No se encontraron transacciones.</td></tr>';
        }
    }

    async function loadFullHistory() {
        const body = document.getElementById('tabla-historial-completo');
        body.innerHTML = '<tr><td colspan="4" style="text-align: center;">Cargando historial...</td></tr>';

        try {
            const res = await fetch(`/api/socio/historial-completo/${socioId}`);
            if (!res.ok) throw new Error("History offline");
            fullHistoryData = await res.json();
            renderHistoryTable(fullHistoryData);
        } catch (e) {
            console.error(e);
            body.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--color-danger);">Error al conectar al historial.</td></tr>';
        }
    }

    // Filtros del historial
    function applyHistoryFilter(filterType, filterValue = null) {
        let filtered = [];
        const hoy = new Date();
        hoy.setHours(0,0,0,0);
        
        const btnClear = document.getElementById('filter-historial-clear');
        btnClear.style.display = 'inline-block';

        if (filterType === 'hoy') {
            filtered = fullHistoryData.filter(h => {
                const f = new Date(h.fecha);
                f.setHours(0,0,0,0);
                return f.getTime() === hoy.getTime();
            });
        } else if (filterType === 'ayer') {
            const ayer = new Date(hoy);
            ayer.setDate(ayer.getDate() - 1);
            filtered = fullHistoryData.filter(h => {
                const f = new Date(h.fecha);
                f.setHours(0,0,0,0);
                return f.getTime() === ayer.getTime();
            });
        } else if (filterType === 'mes' && filterValue) {
            const [y, m] = filterValue.split('-');
            filtered = fullHistoryData.filter(h => {
                const f = new Date(h.fecha);
                return f.getFullYear() == y && (f.getMonth() + 1) == m;
            });
        } else if (filterType === 'dia' && filterValue) {
            const [y, m, d] = filterValue.split('-');
            filtered = fullHistoryData.filter(h => {
                const f = new Date(h.fecha);
                // getDate() retorna el día local, hay que evitar problemas de timezone usando el mismo offset
                return f.getFullYear() == y && (f.getMonth() + 1) == m && f.getDate() == parseInt(d, 10);
            });
        } else {
            filtered = fullHistoryData;
            btnClear.style.display = 'none';
        }

        renderHistoryTable(filtered);
    }

    document.getElementById('filter-historial-hoy')?.addEventListener('click', () => applyHistoryFilter('hoy'));
    document.getElementById('filter-historial-ayer')?.addEventListener('click', () => applyHistoryFilter('ayer'));
    document.getElementById('filter-historial-mes')?.addEventListener('change', (e) => applyHistoryFilter('mes', e.target.value));
    document.getElementById('filter-historial-dia')?.addEventListener('change', (e) => applyHistoryFilter('dia', e.target.value));
    document.getElementById('filter-historial-clear')?.addEventListener('click', () => {
        document.getElementById('filter-historial-mes').value = '';
        document.getElementById('filter-historial-dia').value = '';
        applyHistoryFilter('clear');
    });

    // 7. DEPOSITAR AHORROS (NEQUI)
    document.getElementById('btn-modal-pagar-ahorro').addEventListener('click', () => {
        document.getElementById('nequi-monto').value = monthlySavingsFee;
        showModal('modal-nequi-ahorro');
    });

    document.getElementById('nequi-pay-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const monto = parseFloat(document.getElementById('nequi-monto').value);

        try {
            const res = await fetch('/api/socio/pagar-ahorro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_socio: socioId, monto })
            });
            const data = await res.json();
            if (res.ok) {
                closeModal('modal-nequi-ahorro');
                
                showToast({
                    icon: 'bi-piggy-bank',
                    title: 'Depósito Exitoso',
                    message: `Se depositaron ${formatCurrency(monto)} a tus ahorros.`,
                    bgColor: '#ECFDF5',
                    iconBg: '#D1FAE5',
                    iconColor: '#059669',
                    titleColor: '#065F46'
                });

                // Ocultar forzosamente la alerta de mora de ahorro
                const ahorroBanner = document.getElementById('ahorro-alert-banner');
                if (ahorroBanner) ahorroBanner.style.display = 'none';

                document.getElementById('nequi-pay-form').reset();
                await loadSocioData();
                if (document.getElementById('tab-ahorros').classList.contains('active')) {
                    loadSavingsMovements();
                }
            } else {
                showToast({
                    icon: 'bi-exclamation-triangle',
                    title: 'Error',
                    message: data.error || 'No se pudo procesar el depósito.',
                    bgColor: '#FEF2F2',
                    iconBg: '#FEE2E2',
                    iconColor: '#DC2626',
                    titleColor: '#991B1B'
                });
            }
        } catch (err) {
            console.error(err);
            showToast({
                icon: 'bi-wifi-off',
                title: 'Error de Conexión',
                message: 'No se pudo conectar con el servidor.',
                bgColor: '#FEF2F2',
                iconBg: '#FEE2E2',
                iconColor: '#DC2626',
                titleColor: '#991B1B'
            });
        }
    });

    // 8. RETIRAR AHORROS
    document.getElementById('btn-modal-retirar').addEventListener('click', () => {
        document.getElementById('retirar-saldo-disponible').textContent = formatCurrency(savingsBalance);
        document.getElementById('retirar-monto-input').max = savingsBalance;
        showModal('modal-retirar-ahorros');
    });

    document.getElementById('retirar-ahorros-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const monto = parseFloat(document.getElementById('retirar-monto-input').value);

        if (monto > savingsBalance) {
            showToast({
                icon: 'bi-exclamation-triangle',
                title: 'Saldo Insuficiente',
                message: 'No puedes retirar más saldo del disponible en tu cuenta.',
                bgColor: '#FEF2F2',
                iconBg: '#FEE2E2',
                iconColor: '#DC2626',
                titleColor: '#991B1B'
            });
            return;
        }

        try {
            const res = await fetch('/api/socio/retirar-ahorro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_socio: socioId, monto })
            });
            const data = await res.json();
            if (res.ok) {
                closeModal('modal-retirar-ahorros');
                
                showToast({
                    icon: 'bi-bank',
                    title: 'Retiro Procesado',
                    message: `Se retiraron ${formatCurrency(monto)}. Llegará en 2-3 días hábiles.`,
                    bgColor: '#FFFBEB',
                    iconBg: '#FEF3C7',
                    iconColor: '#D97706',
                    titleColor: '#92400E'
                });

                document.getElementById('retirar-ahorros-form').reset();
                await loadSocioData();
                if (document.getElementById('tab-ahorros').classList.contains('active')) {
                    loadSavingsMovements();
                }
            } else {
                showToast({
                    icon: 'bi-exclamation-triangle',
                    title: 'Error',
                    message: data.error || 'No se pudo procesar el retiro.',
                    bgColor: '#FEF2F2',
                    iconBg: '#FEE2E2',
                    iconColor: '#DC2626',
                    titleColor: '#991B1B'
                });
            }
        } catch (err) {
            console.error(err);
            showToast({
                icon: 'bi-wifi-off',
                title: 'Error de Conexión',
                message: 'No se pudo conectar con el servidor.',
                bgColor: '#FEF2F2',
                iconBg: '#FEE2E2',
                iconColor: '#DC2626',
                titleColor: '#991B1B'
            });
        }
    });

    // 9. CONFIGURACIÓN APORTE AHORRO MENSUAL
    document.getElementById('config-ahorro-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const monto = parseFloat(document.getElementById('ahorro-monto-config-input').value);
        const alertDiv = document.getElementById('ahorro-config-alert');
        alertDiv.style.display = 'none';

        try {
            const res = await fetch('/api/socio/configurar-ahorro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_socio: socioId, monto })
            });
            const data = await res.json();
            if (res.ok) {
                alertDiv.textContent = `✅ Cuota de ahorro mensual configurada a ${formatCurrency(monto)}.`;
                alertDiv.style.display = 'block';
                await loadSocioData();
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (err) {
            console.error(err);
            alert("Error de red al actualizar la cuota.");
        }
    });

    // 10. SIMULADOR Y REGLA DEL 15%
    const rangeMonto = document.getElementById('sim-monto');
    const rangePlazo = document.getElementById('sim-plazo');
    const txtMonto = document.getElementById('sim-monto-txt');
    const txtPlazo = document.getElementById('sim-plazo-txt');
    const labelWarning = document.getElementById('sim-val-warning');
    const selectLinea = document.getElementById('sim-linea');
    const tasaLabel = document.getElementById('sim-tasa-label');

    let lineasCredito = [];
    let selectedLinea = null;

    function applyLineaToSimulator(linea) {
        if (!linea || !rangeMonto || !rangePlazo) return;
        const minMonto = parseFloat(linea.minMonto || 0);
        const maxMonto = parseFloat(linea.maxMonto || 0);
        const minPlazo = parseInt(linea.minPlazo || 0);
        const maxPlazo = parseInt(linea.maxPlazo || 0);

        if (Number.isFinite(minMonto) && Number.isFinite(maxMonto) && minMonto > 0 && maxMonto > minMonto) {
            rangeMonto.min = String(Math.floor(minMonto));
            rangeMonto.max = String(Math.floor(maxMonto));
            rangeMonto.step = '50000';
            const currentMonto = parseFloat(rangeMonto.value);
            if (!Number.isFinite(currentMonto) || currentMonto < minMonto) rangeMonto.value = String(Math.floor(minMonto));
            if (currentMonto > maxMonto) rangeMonto.value = String(Math.floor(maxMonto));
        }

        if (Number.isFinite(minPlazo) && Number.isFinite(maxPlazo) && minPlazo > 0 && maxPlazo > minPlazo) {
            rangePlazo.min = String(minPlazo);
            rangePlazo.max = String(maxPlazo);
            rangePlazo.step = '1';
            const currentPlazo = parseInt(rangePlazo.value);
            if (!Number.isFinite(currentPlazo) || currentPlazo < minPlazo) rangePlazo.value = String(minPlazo);
            if (currentPlazo > maxPlazo) rangePlazo.value = String(maxPlazo);
        }
    }

    async function loadLineasCredito() {
        if (!selectLinea) return;
        try {
            const res = await fetch('/api/socio/lineas');
            const data = await res.json();
            if (!res.ok) throw new Error();
            lineasCredito = Array.isArray(data) ? data : [];
        } catch (_) {
            lineasCredito = [];
        }

        selectLinea.innerHTML = '';
        if (lineasCredito.length === 0) {
            const opt = document.createElement('option');
            opt.value = '';
            opt.textContent = 'Sin líneas disponibles';
            selectLinea.appendChild(opt);
            selectLinea.disabled = true;
            selectedLinea = null;
            if (tasaLabel) tasaLabel.textContent = '-';
            return;
        }

        selectLinea.disabled = false;
        lineasCredito.forEach(l => {
            const opt = document.createElement('option');
            opt.value = String(l.id);
            opt.textContent = l.nombre;
            selectLinea.appendChild(opt);
        });

        const currentId = selectedLinea ? String(selectedLinea.id) : null;
        const preferred = currentId && lineasCredito.find(l => String(l.id) === currentId) ? currentId : String(lineasCredito[0].id);
        selectLinea.value = preferred;
        selectedLinea = lineasCredito.find(l => String(l.id) === String(preferred)) || null;
        applyLineaToSimulator(selectedLinea);
        simular();
    }

    function simular() {
        const monto = parseFloat(rangeMonto.value);
        const plazo = parseInt(rangePlazo.value);
        const tasaPct = selectedLinea && selectedLinea.tasa ? parseFloat(selectedLinea.tasa) : 1.8;
        const tasa = (Number.isFinite(tasaPct) ? tasaPct : 1.8) / 100;

        if (tasaLabel) tasaLabel.textContent = `${(Number.isFinite(tasaPct) ? tasaPct : 1.8).toFixed(2)}% MV`;

        txtMonto.textContent = formatCurrency(monto);
        txtPlazo.textContent = `${plazo} meses`;

        // Calcular cuota francesa real: P * i / (1 - (1 + i)^-n)
        const interesCalculado = (monto * tasa) / (1 - Math.pow(1 + tasa, -plazo));
        const totalIntereses = (interesCalculado * plazo) - monto;

        document.getElementById('sim-cuota').textContent = formatCurrency(interesCalculado);
        document.getElementById('sim-interes').textContent = formatCurrency(totalIntereses);

        // Validación visual de la Regla del 15%
        const minRequired = monto * 0.15;
        if (savingsBalance < minRequired) {
            labelWarning.style.display = 'block';
            labelWarning.style.backgroundColor = '#fef2f2';
            labelWarning.style.color = '#991b1b';
            labelWarning.innerHTML = `<i class="bi bi-x-circle-fill"></i> Saldo insuficiente: Requieres tener al menos <strong>${formatCurrency(minRequired)}</strong> ahorrado (tienes ${formatCurrency(savingsBalance)}). El botón de radicación se deshabilitará.`;
            document.getElementById('btn-socio-solicitar').disabled = true;
            document.getElementById('btn-socio-solicitar').style.opacity = '0.5';
            document.getElementById('btn-socio-solicitar').style.cursor = 'not-allowed';
        } else {
            labelWarning.style.display = 'block';
            labelWarning.style.backgroundColor = '#f0fdf4';
            labelWarning.style.color = '#166534';
            labelWarning.innerHTML = `<i class="bi bi-check-circle-fill"></i> Ahorro suficiente: Tu saldo actual cubre el 15% mínimo obligatorio (${formatCurrency(minRequired)}).`;
            document.getElementById('btn-socio-solicitar').disabled = false;
            document.getElementById('btn-socio-solicitar').style.opacity = '1';
            document.getElementById('btn-socio-solicitar').style.cursor = 'pointer';
        }
    }

    rangeMonto.addEventListener('input', simular);
    rangePlazo.addEventListener('input', simular);
    if (selectLinea) {
        selectLinea.addEventListener('change', () => {
            selectedLinea = lineasCredito.find(l => String(l.id) === String(selectLinea.value)) || null;
            applyLineaToSimulator(selectedLinea);
            simular();
        });
    }

    // Enviar solicitud de estudio de crédito
    document.getElementById('btn-socio-solicitar').addEventListener('click', async () => {
        const monto = parseFloat(rangeMonto.value);
        const plazo = parseInt(rangePlazo.value);
        const proposito = document.getElementById('sim-proposito').value;

        // Doble validación en cliente
        if (savingsBalance < (monto * 0.15)) {
            alert("❌ No cumples con la regla del 15% de ahorro mínimo para solicitar este monto.");
            return;
        }

        if (confirm(`¿Confirmas que deseas enviar la solicitud de estudio para crédito por ${formatCurrency(monto)} a ${plazo} meses?`)) {
            try {
                const res = await fetch('/api/socio/solicitar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id_socio: socioId,
                        id_linea: selectedLinea ? selectedLinea.id : null,
                        monto: monto,
                        plazo: plazo,
                        proposito: proposito
                    })
                });
                const data = await res.json();
                if (res.ok) {
                    alert("✅ ¡Tu solicitud de crédito ha sido radicada de forma real en la base de datos!\nEl analista de crédito evaluará tu caso en la bandeja de estudio.");
                    await loadSocioData();
                    // Limpiar formulario y forzar re-cálculo
                    document.getElementById('sim-proposito').value = 'Libre inversión y gastos personales';
                    rangeMonto.value = 5000000;
                    rangePlazo.value = 12;
                    if (selectedLinea) {
                        applyLineaToSimulator(selectedLinea);
                    }
                    simular();
                } else {
                    alert(`❌ Error al radicar crédito: ${data.error}`);
                }
            } catch (e) {
                console.error(e);
                alert("❌ Error de red al registrar la solicitud.");
            }
        }
    });

    // 11. NOTIFICACIONES CAMPANA
    const notifBell = document.getElementById('notif-bell-btn');
    const notifDropdown = document.getElementById('notif-dropdown');

    // Toggle dropdown
    notifBell.addEventListener('click', (e) => {
        e.stopPropagation();
        notifDropdown.classList.toggle('show');
        if (notifDropdown.classList.contains('show')) {
            loadNotifications();
        }
    });

    document.addEventListener('click', () => {
        notifDropdown.classList.remove('show');
    });

    async function loadNotifications() {
        const container = document.getElementById('notif-list-container');
        container.innerHTML = '<div style="text-align: center; color: var(--color-text-muted); padding: 15px; font-size: 0.8rem;">Cargando notificaciones...</div>';

        try {
            const res = await fetch(`/api/socio/notificaciones/${socioId}`);
            if (!res.ok) throw new Error();
            const notifications = await res.json();

            container.innerHTML = '';
            if (notifications.length > 0) {
                notifications.forEach(n => {
                    const item = document.createElement('div');
                    item.className = `notif-item ${!n.enviada_notificacion ? 'unread' : ''}`;
                    item.innerHTML = `
                        <div class="notif-item-title">${n.asunto_notificacion}</div>
                        <div class="notif-item-desc">${n.mensaje_notificacion}</div>
                        <span class="notif-item-time">${new Date(n.fecha_envio_notificacion || Date.now()).toLocaleString()}</span>
                    `;
                    container.appendChild(item);
                });
            } else {
                container.innerHTML = '<div style="text-align: center; color: var(--color-text-muted); padding: 15px; font-size: 0.8rem;">No tienes notificaciones registradas.</div>';
            }
        } catch (e) {
            container.innerHTML = '<div style="text-align: center; color: var(--color-danger); padding: 15px; font-size: 0.8rem;">Error al cargar notificaciones.</div>';
        }
    }

    // Marcar notificaciones como leídas
    document.getElementById('btn-clear-notifs').addEventListener('click', async (e) => {
        e.stopPropagation();
        try {
            const res = await fetch('/api/socio/notificaciones/leer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_socio: socioId })
            });
            if (res.ok) {
                document.getElementById('badge-notificaciones').style.display = 'none';
                loadNotifications();
            }
        } catch (err) {
            console.error(err);
        }
    });

    // 12. CAMBIO DE CONTRASEÑA EN PERFIL
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

    // TOGGLE PLAN DE AMORTIZACIÓN (llamado desde las tarjetas de crédito)
    window.togglePlan = (creditoId) => {
        const cardDetalle = document.getElementById('card-amortizacion-detalle');
        if (cardDetalle.style.display === 'none' || !cardDetalle.style.display) {
            // Buscar el crédito y cargar sus cuotas
            const cred = allCreditos.find(c => c.id_credito === creditoId);
            if (cred) {
                activeCreditCuotas = cred.cuotas || [];
                document.getElementById('title-amortizacion').innerHTML = `<i class="bi bi-list-columns-reverse" style="color: var(--color-primary); margin-right: 6px;"></i> Amortización: Crédito ${cred.nombre_linea || 'Libre Inversión'}`;
                loadAmortizationTable(activeCreditCuotas);
            }
            cardDetalle.style.display = 'block';
            cardDetalle.scrollIntoView({ behavior: 'smooth' });
        } else {
            cardDetalle.style.display = 'none';
        }
    };

    function bindCertificadosUI() {
        const btnPaz = document.getElementById('btn-cert-pazysalvo');
        const btnAfi = document.getElementById('btn-cert-afiliacion');
        const btnAho = document.getElementById('btn-cert-ahorros');
        const btnEcu = document.getElementById('btn-cert-estado-cuenta');

        if (btnPaz) {
            btnPaz.addEventListener('click', async () => {
                try {
                    await openPdfFromApi('/api/socio/certificados/pazysalvo');
                } catch (e) {
                    alert(e.message || 'No se pudo generar el certificado.');
                }
            });
        }

        if (btnAfi) {
            btnAfi.addEventListener('click', async () => {
                try {
                    await openPdfFromApi('/api/socio/certificados/afiliacion');
                } catch (e) {
                    alert(e.message || 'No se pudo generar el certificado.');
                }
            });
        }

        if (btnAho) {
            btnAho.addEventListener('click', async () => {
                try {
                    await openPdfFromApi('/api/socio/certificados/ahorros');
                } catch (e) {
                    alert(e.message || 'No se pudo generar el certificado.');
                }
            });
        }

        if (btnEcu) {
            btnEcu.addEventListener('click', async () => {
                try {
                    await openPdfFromApi('/api/socio/certificados/estado-cuenta');
                } catch (e) {
                    alert(e.message || 'No se pudo generar el certificado.');
                }
            });
        }
    }

    // Inicializar carga de datos de socio
    bindCertificadosUI();
    await loadSocioData();
    await loadLineasCredito();
});
