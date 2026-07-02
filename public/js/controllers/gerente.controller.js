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
    if (!currentUser || currentUser.rol !== 'gerente') {
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
    document.querySelectorAll('#p-documento').forEach(el => el.textContent = currentUser.documento || '10203040');
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

    // 3. CARGA DE KPIs Y SOLICITUDES PENDIENTES
    function formatCurrency(val) {
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);
    }

    function formatPct(val) {
        const n = Number(val || 0);
        return `${n.toFixed(1)}%`;
    }

    function renderDistribucionLineas(items, total) {
        const container = document.getElementById('dist-lineas-container');
        if (!container) return;
        container.innerHTML = '';

        const palette = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];
        const rows = Array.isArray(items) ? items : [];
        if (rows.length === 0) {
            container.innerHTML = '<div style="text-align:center; color: var(--color-text-muted); padding: 24px 0;">No hay datos de distribución.</div>';
            return;
        }

        rows.forEach((r, idx) => {
            const saldo = parseFloat(r.saldo || 0);
            const pct = total > 0 ? (saldo / total) * 100 : 0;
            const color = palette[idx % palette.length];
            const el = document.createElement('div');
            el.innerHTML = `
                <div style="display: flex; justify-content: space-between; font-weight: 500; font-size: 0.9rem;">
                    <span>${r.nombre}</span>
                    <span>${pct.toFixed(0)}% (${formatCurrency(saldo)})</span>
                </div>
                <div style="height: 12px; background: #e2e8f0; border-radius: 6px; overflow: hidden; margin-top: 6px;">
                    <div style="width: ${Math.max(0, Math.min(100, pct)).toFixed(2)}%; height: 100%; background: ${color};"></div>
                </div>
            `;
            container.appendChild(el);
        });
    }

    function renderCarteraTable(items) {
        const tbody = document.getElementById('tabla-cartera-gerente');
        if (!tbody) return;
        tbody.innerHTML = '';

        const list = Array.isArray(items) ? items : [];
        if (list.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--color-text-muted);">No hay créditos para los filtros seleccionados.</td></tr>';
            return;
        }

        list.forEach(it => {
            const tr = document.createElement('tr');
            const estado = it.estado || '-';
            const colors = {
                vigente: { bg: '#ECFDF5', color: '#065F46' },
                vencida: { bg: '#FFFBEB', color: '#92400E' },
                castigada: { bg: '#FEF2F2', color: '#991B1B' }
            };
            const st = colors[estado] || { bg: '#F1F5F9', color: '#334155' };
            const prox = it.cuota_proxima
                ? `#${it.cuota_proxima.numero} · ${new Date(it.cuota_proxima.vence).toLocaleDateString('es-CO')} · ${formatCurrency(it.cuota_proxima.valor)}`
                : '-';
            tr.innerHTML = `
                <td style="font-weight: 600;">${it.socio || '-'}</td>
                <td style="font-family: monospace;">${it.documento || '-'}</td>
                <td>${it.linea || '-'}</td>
                <td style="font-weight: 700; color: var(--color-primary);">${formatCurrency(it.saldo_pendiente || 0)}</td>
                <td>${(it.dias_mora || 0)} días</td>
                <td><span style="display:inline-block; padding: 3px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; background:${st.bg}; color:${st.color};">${estado.toUpperCase()}</span></td>
                <td>${prox}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    function setCarteraKpis(kpis) {
        const k = kpis || {};
        const total = parseFloat(k.cartera_total || 0);
        const vigente = parseFloat(k.vigente || 0);
        const vencida = parseFloat(k.vencida || 0);
        const castigada = parseFloat(k.castigada || 0);
        const riesgo = parseFloat(k.riesgo_mora_pct || 0);

        const elTotal = document.getElementById('kpi-cartera-total');
        const elVig = document.getElementById('kpi-cartera-vigente');
        const elVen = document.getElementById('kpi-cartera-vencida');
        const elCas = document.getElementById('kpi-cartera-castigada');
        const elRie = document.getElementById('kpi-cartera-riesgo');
        if (elTotal) elTotal.textContent = formatCurrency(total);
        if (elVig) elVig.textContent = formatCurrency(vigente);
        if (elVen) elVen.textContent = formatCurrency(vencida);
        if (elCas) elCas.textContent = formatCurrency(castigada);
        if (elRie) elRie.textContent = formatPct(riesgo);
    }

    async function loadDashboard() {
        const res = await fetch('/api/gerente/dashboard');
        const data = await res.json();
        if (!res.ok) throw new Error((data && data.error) ? data.error : 'No se pudo cargar el dashboard');

        document.getElementById('kpi-socios').textContent = String(data.socios ?? 0);
        document.getElementById('kpi-aprobados').textContent = formatCurrency(data.aprobados_total || 0);
        document.getElementById('kpi-ahorros').textContent = formatCurrency(data.fondo_ahorros || 0);
        document.getElementById('kpi-cartera').textContent = formatCurrency(data.cartera_total || 0);
        document.getElementById('kpi-mora').textContent = formatPct(data.riesgo_mora_pct || 0);

        renderDistribucionLineas(data.distribucion_linea || [], parseFloat(data.cartera_total || 0));

        const selLinea = document.getElementById('cartera-filtro-linea');
        if (selLinea) {
            const current = selLinea.value;
            selLinea.innerHTML = '<option value=\"\">Todas las líneas</option>';
            (data.lineas || []).forEach(l => {
                const opt = document.createElement('option');
                opt.value = String(l.id);
                opt.textContent = l.nombre;
                selLinea.appendChild(opt);
            });
            if (current) selLinea.value = current;
        }
    }

    async function loadCartera() {
        const estado = document.getElementById('cartera-filtro-estado')?.value || 'todas';
        const idLinea = document.getElementById('cartera-filtro-linea')?.value || '';
        const q = document.getElementById('cartera-filtro-q')?.value || '';
        const minMora = document.getElementById('cartera-filtro-minmora')?.value || '';
        const maxMora = document.getElementById('cartera-filtro-maxmora')?.value || '';

        const params = new URLSearchParams();
        if (estado) params.set('estado', estado);
        if (idLinea) params.set('id_linea', idLinea);
        if (q && q.trim()) params.set('q', q.trim());
        if (minMora !== '') params.set('min_mora', minMora);
        if (maxMora !== '') params.set('max_mora', maxMora);

        const url = `/api/gerente/cartera/resumen?${params.toString()}`;
        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok) throw new Error((data && data.error) ? data.error : 'No se pudo cargar la cartera');

        setCarteraKpis(data.kpis);
        renderCarteraTable(data.items);
    }

    // 4. CAMBIO DE CONTRASEÑA
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

    const btnFiltrar = document.getElementById('btn-cartera-filtrar');
    if (btnFiltrar) {
        btnFiltrar.addEventListener('click', async () => {
            await loadCartera();
        });
    }

    try {
        await loadDashboard();
        await loadCartera();
    } catch (e) {
        console.error(e);
    }
});
