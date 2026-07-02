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
    if (!currentUser || currentUser.rol !== 'gestor_financiero') {
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
    document.querySelectorAll('#p-documento').forEach(el => el.textContent = currentUser.documento || '10809010');
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

    function formatCurrency(val) {
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);
    }

    const gAlert = document.getElementById('gestor-alert');
    function showAlert(text, type) {
        gAlert.textContent = text;
        gAlert.style.display = 'block';
        gAlert.className = `alert show alert-${type}`;
    }
    function hideAlert() {
        gAlert.style.display = 'none';
    }

    // 3. DATOS DE LÍNEAS DE CRÉDITO
    let lineasArr = [
        { id: 1, nombre: "Libre Inversión", tasa: 1.8, mora: 2.5, minMonto: 1000000, maxMonto: 30000000, minPlazo: 6, maxPlazo: 36 },
        { id: 2, nombre: "Vivienda / Inmobiliario", tasa: 1.2, mora: 1.9, minMonto: 10000000, maxMonto: 100000000, minPlazo: 12, maxPlazo: 60 },
        { id: 3, nombre: "Educativo", tasa: 0.9, mora: 1.5, minMonto: 500000, maxMonto: 15000000, minPlazo: 6, maxPlazo: 24 }
    ];

    async function loadLineas() {
        try {
            const res = await fetch('/api/gestor/lineas');
            const data = await res.json();
            if (res.ok && data.length > 0) {
                lineasArr = data;
            }
        } catch(e) {}

        const tbody = document.getElementById('tabla-gestor-lineas');
        tbody.innerHTML = '';
        lineasArr.forEach(l => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-weight:600;">${l.nombre}</td>
                <td style="color:var(--color-primary); font-weight:700;">${l.tasa}%</td>
                <td style="color:var(--color-error);">${l.mora}%</td>
                <td>${formatCurrency(l.maxMonto)}</td>
                <td>${l.maxPlazo} meses</td>
                <td>
                    <button class="btn btn-secondary" style="padding: 4px 10px; font-size: 0.8rem;" onclick="seleccionarLinea(${l.id})">
                        <i class="bi bi-pencil-square"></i> Editar
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    window.seleccionarLinea = function(id) {
        hideAlert();
        const l = lineasArr.find(item => item.id === id);
        if (!l) return;

        document.getElementById('form-config-title').textContent = `Configurar: ${l.nombre}`;
        document.getElementById('cfg-linea-id').value = l.id;
        document.getElementById('cfg-nombre').value = l.nombre;
        document.getElementById('cfg-tasa').value = l.tasa;
        document.getElementById('cfg-mora').value = l.mora;
        document.getElementById('cfg-monto-min').value = l.minMonto;
        document.getElementById('cfg-monto-max').value = l.maxMonto;
        document.getElementById('cfg-plazo-min').value = l.minPlazo;
        document.getElementById('cfg-plazo-max').value = l.maxPlazo;
    };

    // Formulario de envío
    const formConfig = document.getElementById('gestor-config-form');
    formConfig.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideAlert();

        const id = parseInt(document.getElementById('cfg-linea-id').value);
        const tasa = parseFloat(document.getElementById('cfg-tasa').value);
        const mora = parseFloat(document.getElementById('cfg-mora').value);
        const minM = parseFloat(document.getElementById('cfg-monto-min').value);
        const maxM = parseFloat(document.getElementById('cfg-monto-max').value);
        const minP = parseInt(document.getElementById('cfg-plazo-min').value);
        const maxP = parseInt(document.getElementById('cfg-plazo-max').value);

        if (minM >= maxM) {
            showAlert("El monto mínimo debe ser menor al monto máximo.", "danger");
            return;
        }

        if (minP >= maxP) {
            showAlert("El plazo mínimo debe ser menor al plazo máximo.", "danger");
            return;
        }

        try {
            // Envío real a API
            const res = await fetch('/api/gestor/lineas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, tasa, mora, minM, maxM, minP, maxP })
            });
            if (!res.ok) throw new Error();
            
            showAlert("✅ Configuración guardada correctamente en base de datos.", "success");
            loadLineas();

        } catch (err) {
            // MOCK LOCAL EXITOSO
            const idx = lineasArr.findIndex(item => item.id === id);
            if (idx !== -1) {
                lineasArr[idx].tasa = tasa;
                lineasArr[idx].mora = mora;
                lineasArr[idx].minMonto = minM;
                lineasArr[idx].maxMonto = maxM;
                lineasArr[idx].minPlazo = minP;
                lineasArr[idx].maxPlazo = maxP;
            }

            showAlert("✅ Configuración simulada con éxito. Parámetros de tasas actualizados.", "success");
            loadLineas();
        }
    });

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

    await loadLineas();
    if (lineasArr.length > 0) seleccionarLinea(lineasArr[0].id);
});
