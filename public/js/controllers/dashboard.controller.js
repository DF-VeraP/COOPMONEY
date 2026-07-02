document.addEventListener('DOMContentLoaded', () => {
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
    
    // --- Lógica de Navegación por Pestañas ---
    const navItems = document.querySelectorAll('.dash-nav-item');
    const tabPanes = document.querySelectorAll('.tab-pane');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remover active de todos
            navItems.forEach(n => n.classList.remove('active'));
            tabPanes.forEach(t => t.classList.remove('active'));

            // Añadir active al clickeado
            item.classList.add('active');
            const targetId = item.getAttribute('data-tab-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // --- Lógica de Modales ---
    const modals = document.querySelectorAll('.modal-overlay');
    const closeButtons = document.querySelectorAll('.close-modal');

    window.openModal = function(id) {
        const modal = document.getElementById(id);
        if(modal) {
            modal.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
    }

    window.closeModal = function(id) {
        const modal = document.getElementById(id);
        if(modal) {
            modal.classList.remove('open');
            document.body.style.overflow = '';
        }
    }

    closeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal-overlay');
            if(modal) {
                closeModal(modal.id);
            }
        });
    });

    // Cerrar al hacer clic fuera del modal content
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if(e.target === modal) {
                closeModal(modal.id);
            }
        });
    });

    // --- Mocks Funcionales Originales ---
    const mockButtons = document.querySelectorAll('.action-mock');
    mockButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const accion = e.currentTarget.getAttribute('data-action') || 'esta acción';
            alert(`✅ Funcionalidad simulada: ${accion}`);
        });
    });

    const logoutBtn = document.getElementById('logout-btn');
    if(logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            window.location.replace('index.html');
        });
    }

    // ==========================================
    // LÓGICA DINÁMICA (DATOS REALES)
    // ==========================================

    async function cargarEstadisticas() {
        try {
            const res = await fetch('/api/superadmin/stats');
            if(!res.ok) throw new Error("Error obteniendo estadísticas");
            const data = await res.json();
            
            document.getElementById('kpi-cooperativas').textContent = data.total_cooperativas;
            document.getElementById('kpi-socios').textContent = data.total_socios;
            
            // Formatear moneda (Millones o valor real)
            const formatoMoneda = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
            document.getElementById('kpi-creditos').textContent = formatoMoneda.format(data.total_creditos);
            document.getElementById('kpi-cartera').textContent = formatoMoneda.format(data.total_cartera);
            
        } catch (err) {
            console.error(err);
        }
    }

    function renderTop5Cartera(lista) {
        const container = document.getElementById('top5-cartera-list');
        if (!container) return;

        const formatoMoneda = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

        // Filtrar solo cooperativas registradas (excluir solicitudes pendientes) y con cartera > 0
        const registradas = lista
            .filter(c => c.tipo === 'registrada' && parseFloat(c.cartera || 0) > 0)
            .sort((a, b) => parseFloat(b.cartera) - parseFloat(a.cartera))
            .slice(0, 5);

        if (registradas.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--color-text-muted);">No hay cooperativas con cartera activa.</div>';
            return;
        }

        // El máximo es la cartera de la primera cooperativa (para la barra al 100%)
        const maxCartera = parseFloat(registradas[0].cartera);
        // Sumar cartera total de TODAS las registradas para calcular el porcentaje real
        const totalCartera = lista
            .filter(c => c.tipo === 'registrada')
            .reduce((sum, c) => sum + parseFloat(c.cartera || 0), 0);

        const colores = [
            'var(--color-primary)',
            'var(--color-info, #3b82f6)',
            'var(--color-success)',
            'var(--color-warning)',
            'var(--color-text-muted)'
        ];

        container.innerHTML = registradas.map((coop, i) => {
            const cartera = parseFloat(coop.cartera);
            const pctBarra = maxCartera > 0 ? (cartera / maxCartera) * 100 : 0;
            const pctTotal = totalCartera > 0 ? ((cartera / totalCartera) * 100).toFixed(1) : '0.0';
            const color = colores[i] || colores[colores.length - 1];

            return `
                <div>
                    <div class="progress-item-header">
                        <span>${coop.nombre}</span>
                        <strong>${formatoMoneda.format(cartera)} (${pctTotal}%)</strong>
                    </div>
                    <div class="progress-track">
                        <div class="progress-fill" style="width: ${pctBarra}%; background: ${color};"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Lista completa en memoria para filtrado local
    let listaCooperativasCache = [];

    function renderCooperativas(lista) {
        const tbody = document.getElementById('tabla-cooperativas-body');
        tbody.innerHTML = '';

        if (lista.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No se encontraron cooperativas.</td></tr>';
            return;
        }

        const formatoMoneda = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

        lista.forEach(item => {
            const tr = document.createElement('tr');
            
            // Determinar el badge y las acciones según el estado
            let badge = '';
            let acciones = '';
            
            if (item.tipo === 'solicitud') {
                badge = `<span class="status-badge pending">Pendiente</span>`;
                acciones = `
                    <button class="btn-icon" style="color: var(--color-success);" onclick="aprobarSolicitud(${item.id})" title="Aprobar"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg></button>
                    <button class="btn-icon" style="color: var(--color-danger);" onclick="rechazarSolicitud(${item.id})" title="Rechazar"><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
                `;
            } else {
                if (item.estado === 'activo') {
                    badge = `<span class="status-badge active">Activa</span>`;
                } else {
                    badge = `<span class="status-badge inactive">Inactiva</span>`;
                }
                acciones = `
                    <button class="btn-icon" onclick="abrirModalCooperativa(${item.id}, 'detalles')" title="Ver Detalles"><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg></button>
                    <button class="btn-icon" onclick="abrirModalCooperativa(${item.id}, 'editar')" title="Editar"><svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                `;
            }

            tr.innerHTML = `
                <td>${item.nit}</td>
                <td>${item.nombre}</td>
                <td>${item.tipo === 'solicitud' ? item.socios_aprox + ' (Aprox)' : item.socios}</td>
                <td>${badge}</td>
                <td>${formatoMoneda.format(item.cartera || 0)}</td>
                <td><div class="action-group">${acciones}</div></td>
            `;
            tbody.appendChild(tr);
        });
    }

    function filtrarCooperativas() {
        const texto = (document.getElementById('filtro-coop-buscar').value || '').toLowerCase().trim();
        const estado = document.getElementById('filtro-coop-estado').value;

        const filtrada = listaCooperativasCache.filter(item => {
            // Filtro por texto (nombre o NIT)
            const coincideTexto = !texto 
                || item.nombre.toLowerCase().includes(texto) 
                || item.nit.toLowerCase().includes(texto);

            // Filtro por estado
            let coincideEstado = true;
            if (estado) {
                if (estado === 'pendiente') {
                    coincideEstado = item.tipo === 'solicitud';
                } else {
                    coincideEstado = item.tipo === 'registrada' && item.estado === estado;
                }
            }

            return coincideTexto && coincideEstado;
        });

        renderCooperativas(filtrada);
    }

    async function cargarCooperativas() {
        try {
            const res = await fetch('/api/superadmin/cooperativas');
            if(!res.ok) throw new Error("Error obteniendo cooperativas");
            const lista = await res.json();
            
            // Guardar en caché y renderizar Top 5
            listaCooperativasCache = lista;
            renderTop5Cartera(lista);

            // Renderizar tabla aplicando filtros actuales
            filtrarCooperativas();

        } catch (err) {
            console.error(err);
            document.getElementById('tabla-cooperativas-body').innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Error al cargar datos.</td></tr>';
        }
    }

    // Event listeners para filtrado dinámico
    const inputBuscar = document.getElementById('filtro-coop-buscar');
    const selectEstado = document.getElementById('filtro-coop-estado');
    if (inputBuscar) inputBuscar.addEventListener('input', filtrarCooperativas);
    if (selectEstado) selectEstado.addEventListener('change', filtrarCooperativas);

    // Funciones globales para que el onclick de HTML las reconozca
    window.aprobarSolicitud = async function(id) {
        if(!confirm("¿Estás seguro de aprobar esta solicitud? Se creará la cooperativa y su administrador local.")) return;
        try {
            const res = await fetch(`/api/superadmin/solicitudes/${id}/aprobar`, { method: 'POST' });
            const data = await res.json();
            if(data.success) {
                alert("¡Cooperativa aprobada con éxito!");
                cargarCooperativas();
                cargarEstadisticas();
            } else {
                alert("Error: " + data.error);
            }
        } catch (err) {
            alert("Error de red");
        }
    };

    window.rechazarSolicitud = async function(id) {
        if(!confirm("¿Estás seguro de rechazar y eliminar esta solicitud permanentemente?")) return;
        try {
            const res = await fetch(`/api/superadmin/solicitudes/${id}/rechazar`, { method: 'POST' });
            const data = await res.json();
            if(data.success) {
                alert("Solicitud rechazada correctamente.");
                cargarCooperativas();
            } else {
                alert("Error: " + data.error);
            }
        } catch (err) {
            alert("Error de red");
        }
    };

    // Registro directo de cooperativa + admin local
    const formRegistro = document.getElementById('form-nueva-cooperativa');
    if (formRegistro) {
        formRegistro.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('btn-registrar-coop');
            const alertDiv = document.getElementById('reg-alert');
            
            // Recoger datos
            const data = {
                nit: document.getElementById('reg-nit').value,
                nombre: document.getElementById('reg-nombre').value,
                correo: document.getElementById('reg-correo').value,
                telefono: document.getElementById('reg-telefono').value,
                direccion: document.getElementById('reg-direccion').value,
                web: document.getElementById('reg-web').value,
                nombre_rep: document.getElementById('reg-nombre-rep').value,
                cedula_rep: document.getElementById('reg-cedula-rep').value,
                cargo_rep: document.getElementById('reg-cargo-rep').value,
                tel_rep: document.getElementById('reg-tel-rep').value,
                correo_rep: document.getElementById('reg-correo-rep').value,
                pass_rep: document.getElementById('reg-pass-rep').value
            };

            btn.disabled = true;
            btn.textContent = 'Registrando...';
            alertDiv.style.display = 'none';

            try {
                const res = await fetch('/api/superadmin/cooperativas', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                const result = await res.json();
                
                if (res.ok && result.success) {
                    alertDiv.style.backgroundColor = 'var(--color-success)';
                    alertDiv.style.color = 'white';
                    alertDiv.textContent = result.message;
                    alertDiv.style.display = 'block';
                    
                    // Limpiar form y recargar
                    formRegistro.reset();
                    setTimeout(() => {
                        closeModal('modal-registro');
                        alertDiv.style.display = 'none';
                        cargarCooperativas();
                        cargarEstadisticas();
                    }, 1500);
                } else {
                    throw new Error(result.error || 'Error al registrar');
                }
            } catch (err) {
                alertDiv.style.backgroundColor = 'var(--color-danger)';
                alertDiv.style.color = 'white';
                alertDiv.textContent = err.message;
                alertDiv.style.display = 'block';
            } finally {
                btn.disabled = false;
                btn.textContent = 'Registrar Cooperativa';
            }
        });
    }

    window.abrirModalCooperativa = async function(id, modo) {
        try {
            // --- MODO DETALLES AVANZADOS ---
            if (modo === 'detalles') {
                const res = await fetch(`/api/superadmin/cooperativas/${id}/detalles`);
                if (!res.ok) throw new Error("Error obteniendo métricas");
                const data = await res.json();

                const formatoMoneda = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

                // Nombre y estado
                document.getElementById('det-nombre-coop').textContent = data.cooperativa.nombre_cooperativa;
                const badgeEl = document.getElementById('det-estado-coop');
                if (data.cooperativa.estado_cooperativa === 'activo') {
                    badgeEl.className = 'status-badge active';
                    badgeEl.textContent = 'Activa';
                } else {
                    badgeEl.className = 'status-badge inactive';
                    badgeEl.textContent = 'Inactiva';
                }

                // Empleados agrupados por rol
                const rolesMap = {
                    'admin_local': { label: 'Administrador Local', icon: 'bi-shield-lock-fill', color: '#6366f1' },
                    'gerente': { label: 'Gerentes', icon: 'bi-briefcase-fill', color: '#8b5cf6' },
                    'analista': { label: 'Analistas', icon: 'bi-clipboard-data-fill', color: '#3b82f6' },
                    'cajero': { label: 'Cajeros', icon: 'bi-cash-stack', color: '#10b981' },
                    'gestor_financiero': { label: 'Gestores Financieros', icon: 'bi-graph-up-arrow', color: '#f59e0b' }
                };

                const listaEl = document.getElementById('det-lista-empleados');
                let totalEmpleados = 0;

                if (data.empleados.length === 0) {
                    listaEl.innerHTML = '<li style="color: var(--color-text-muted); font-style: italic;">Sin personal registrado.</li>';
                } else {
                    listaEl.innerHTML = data.empleados.map(e => {
                        const info = rolesMap[e.rol_usuario] || { label: e.rol_usuario, icon: 'bi-person', color: '#64748b' };
                        const cant = parseInt(e.cantidad);
                        totalEmpleados += cant;
                        return `
                            <li style="display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; background: #fff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                                <span style="display: flex; align-items: center; gap: 8px;">
                                    <i class="bi ${info.icon}" style="color: ${info.color}; font-size: 1.1rem;"></i>
                                    ${info.label}
                                </span>
                                <strong style="background: ${info.color}15; color: ${info.color}; padding: 2px 10px; border-radius: 20px; font-size: 0.85rem;">${cant}</strong>
                            </li>
                        `;
                    }).join('');

                    // Línea total
                    listaEl.innerHTML += `
                        <li style="display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; margin-top: 5px; border-top: 1px dashed var(--color-border); font-weight: 600;">
                            <span><i class="bi bi-people-fill" style="color: var(--color-text-muted);"></i> Total Empleados</span>
                            <strong>${totalEmpleados}</strong>
                        </li>
                    `;
                }

                // Métricas financieras
                document.getElementById('det-socios').textContent = parseInt(data.metricas.socios).toLocaleString('es-CO');
                document.getElementById('det-ahorros').textContent = formatoMoneda.format(data.metricas.ahorros);
                document.getElementById('det-cartera-vigente').textContent = formatoMoneda.format(data.metricas.cartera_vigente);
                document.getElementById('det-cartera-vencida').textContent = formatoMoneda.format(data.cartera_vencida);

                openModal('modal-detalle-avanzado');
                return;
            }

            // --- MODO EDITAR ---
            const res = await fetch(`/api/superadmin/cooperativas/${id}`);
            if (!res.ok) throw new Error("Error obteniendo datos");
            const data = await res.json();
            
            // Poblar campos
            document.getElementById('edit-id-coop').value = data.id_cooperativa;
            document.getElementById('edit-nit').value = data.nit_cooperativa;
            document.getElementById('edit-nombre').value = data.nombre_cooperativa;
            document.getElementById('edit-correo').value = data.correo_cooperativa;
            document.getElementById('edit-telefono').value = data.telefono_cooperativa;
            document.getElementById('edit-direccion').value = data.direccion_cooperativa;
            document.getElementById('edit-estado').value = data.estado_cooperativa;
            
            document.getElementById('edit-admin-nombre').value = data.admin_nombre || '';
            document.getElementById('edit-admin-correo').value = data.admin_correo || '';
            document.getElementById('edit-admin-pass').value = ''; // Siempre limpiar

            const modal = document.getElementById('modal-editar-coop');
            const inputs = modal.querySelectorAll('input:not(#edit-nit):not([type="hidden"]), select');
            const btnGuardar = document.getElementById('btn-guardar-edicion');
            const passContainer = document.getElementById('edit-admin-pass').parentElement.parentElement;

            modal.querySelector('h3').textContent = 'Editar Cooperativa';
            inputs.forEach(i => i.disabled = false);
            btnGuardar.style.display = 'block';
            passContainer.style.display = 'block';
            
            document.getElementById('edit-alert').style.display = 'none';
            openModal('modal-editar-coop');

        } catch (err) {
            alert("No se pudieron cargar los detalles: " + err.message);
        }
    };

    const formEditar = document.getElementById('form-editar-cooperativa');
    if (formEditar) {
        formEditar.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('btn-guardar-edicion');
            const alertDiv = document.getElementById('edit-alert');
            const id = document.getElementById('edit-id-coop').value;
            
            const data = {
                nombre: document.getElementById('edit-nombre').value,
                correo: document.getElementById('edit-correo').value,
                telefono: document.getElementById('edit-telefono').value,
                direccion: document.getElementById('edit-direccion').value,
                estado: document.getElementById('edit-estado').value,
                admin_nombre: document.getElementById('edit-admin-nombre').value,
                admin_correo: document.getElementById('edit-admin-correo').value,
                pass_rep: document.getElementById('edit-admin-pass').value
            };

            btn.disabled = true;
            btn.textContent = 'Guardando...';
            alertDiv.style.display = 'none';

            try {
                const res = await fetch(`/api/superadmin/cooperativas/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                const result = await res.json();
                
                if (res.ok && result.success) {
                    alertDiv.style.backgroundColor = 'var(--color-success)';
                    alertDiv.style.color = 'white';
                    alertDiv.textContent = result.message;
                    alertDiv.style.display = 'block';
                    
                    setTimeout(() => {
                        closeModal('modal-editar-coop');
                        alertDiv.style.display = 'none';
                        cargarCooperativas();
                    }, 1500);
                } else {
                    throw new Error(result.error || 'Error al actualizar');
                }
            } catch (err) {
                alertDiv.style.backgroundColor = 'var(--color-danger)';
                alertDiv.style.color = 'white';
                alertDiv.textContent = err.message;
                alertDiv.style.display = 'block';
            } finally {
                btn.disabled = false;
                btn.textContent = 'Guardar Cambios';
            }
        });
    }

    // Iniciar carga de datos
    cargarEstadisticas();
    cargarCooperativas();

});
