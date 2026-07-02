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

    // 1. VERIFICAR AUTENTICACIÓN
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.rol !== 'admin_local') {
        window.location.href = 'index.html';
        return;
    }

    // 2. CONFIGURAR CABECERA DINÁMICA
    document.getElementById('header-coop-name').textContent = `Cooperativa: ${currentUser.cooperativa || 'No definida'}`;
    document.getElementById('header-user-name').textContent = currentUser.nombre;
    const initials = currentUser.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    document.getElementById('header-user-avatar').textContent = initials;

    // Configurar Perfil
    document.getElementById('profile-name').textContent = currentUser.nombre;
    document.getElementById('profile-document').textContent = currentUser.documento || 'No registrado';
    document.getElementById('profile-email').textContent = currentUser.correo;
    document.getElementById('profile-phone').textContent = currentUser.telefono || 'Sin registrar';
    const profileAvatarLarge = document.getElementById('profile-avatar-large');
    if (profileAvatarLarge) profileAvatarLarge.textContent = initials;
    document.getElementById('profile-coop').textContent = currentUser.cooperativa || 'No definida';

    // Cierre de Sesión
    document.getElementById('logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('currentUser');
        window.location.replace('index.html');
    });

    // 3. NAVEGACIÓN POR PESTAÑAS
    const navItems = document.querySelectorAll('.dash-nav-item');
    const tabPanes = document.querySelectorAll('.tab-pane');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const target = item.getAttribute('data-tab-target');
            
            navItems.forEach(nav => nav.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));

            item.classList.add('active');
            const targetPane = document.getElementById(target);
            if (targetPane) targetPane.classList.add('active');

            // Cargar datos frescos según la pestaña
            if (target === 'tab-dashboard' || target === 'tab-usuarios') {
                loadLocalUsers();
            }
        });
    });

    // 4. MEMORIA DE USUARIOS LOCALES
    let allUsers = [];
    let parsedExcelUsers = [];

    // Helper para alertas visuales consistentes y corregir inline specificity
    function showAlert(alertEl, text, type = 'danger') {
        if (!alertEl) return;
        alertEl.textContent = text;
        alertEl.className = `alert alert-${type} show`;
        alertEl.style.display = 'block';
    }
    function hideAlert(alertEl) {
        if (!alertEl) return;
        alertEl.style.display = 'none';
        alertEl.className = 'alert';
    }

    // Cargar usuarios desde la base de datos PostgreSQL real
    async function loadLocalUsers() {
        try {
            const response = await fetch(`/api/admin/usuarios?cooperativaId=${currentUser.id_cooperativa}`);
            if (!response.ok) throw new Error('Error al obtener la lista de usuarios');
            
            allUsers = await response.json();
            renderDashboardStats();
            renderUsersTable();
        } catch (error) {
            console.error('Error cargando usuarios:', error);
        }
    }

    // 5. CÁLCULO DE ESTADÍSTICAS Y GRÁFICOS (DASHBOARD)
    function renderDashboardStats() {
        // En base de datos, sumamos +1 administrador local (el usuario activo actual)
        const total = allUsers.length + 1;
        const analistas = allUsers.filter(u => u.rol_usuario === 'analista').length;
        const cajeros = allUsers.filter(u => u.rol_usuario === 'cajero').length;
        const gerentes = allUsers.filter(u => u.rol_usuario === 'gerente').length;
        const gestores = allUsers.filter(u => u.rol_usuario === 'gestor_financiero').length;
        
        const activos = allUsers.filter(u => u.estado_usuario === 'activo').length + 1; // +1 Administrador Local activo
        const inactivos = allUsers.filter(u => u.estado_usuario === 'inactivo').length;

        // Escribir KPIs
        document.getElementById('kpi-total').textContent = total;
        document.getElementById('kpi-analistas').textContent = analistas;
        document.getElementById('kpi-cajeros').textContent = cajeros;
        document.getElementById('kpi-gerentes').textContent = gerentes;
        document.getElementById('kpi-gestores').textContent = gestores;
        document.getElementById('kpi-activos').textContent = activos;
        document.getElementById('kpi-inactivos').textContent = inactivos;

        // Calcular porcentajes exactos
        const pctAna = total > 0 ? Math.round((analistas / total) * 100) : 0;
        const pctCaj = total > 0 ? Math.round((cajeros / total) * 100) : 0;
        const pctGer = total > 0 ? Math.round((gerentes / total) * 100) : 0;
        const pctGes = total > 0 ? Math.round((gestores / total) * 100) : 0;
        const pctAdm = total > 0 ? Math.round((1 / total) * 100) : 0; // Administrador Local actual

        // Actualizar textos de porcentajes
        document.getElementById('pct-analistas').textContent = `${pctAna}% (${analistas})`;
        document.getElementById('pct-cajeros').textContent = `${pctCaj}% (${cajeros})`;
        document.getElementById('pct-gerentes').textContent = `${pctGer}% (${gerentes})`;
        document.getElementById('pct-gestores').textContent = `${pctGes}% (${gestores})`;
        document.getElementById('pct-admin').textContent = `${pctAdm}% (1)`;

        // Modificar anchos de barras CSS con transiciones fluidas
        document.getElementById('bar-analistas').style.width = `${pctAna}%`;
        document.getElementById('bar-cajeros').style.width = `${pctCaj}%`;
        document.getElementById('bar-gerentes').style.width = `${pctGer}%`;
        document.getElementById('bar-gestores').style.width = `${pctGes}%`;
        document.getElementById('bar-admin').style.width = `${pctAdm}%`;

        // Renderizar tabla de usuarios recientes (Últimos 5 ordenados por ID o fecha)
        const recientesBody = document.getElementById('recientes-table-body');
        recientesBody.innerHTML = '';
        
        // Agregar primero al administrador si deseamos o listar directo los 5 usuarios creados recientemente
        const recientes = allUsers.slice(0, 5);
        if (recientes.length === 0) {
            recientesBody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--color-text-muted);">Aún no has registrado usuarios colaboradores.</td></tr>`;
            return;
        }

        recientes.forEach(u => {
            const tr = document.createElement('tr');
            const fechaStr = u.fecha_creacion_usuario ? new Date(u.fecha_creacion_usuario).toLocaleDateString() : 'N/A';
            const rolLabel = formatRolName(u.rol_usuario);
            tr.innerHTML = `
                <td><strong>${u.nombre_usuario}</strong></td>
                <td><span style="font-size:0.85rem; padding: 2px 8px; background: #e2e8f0; border-radius:12px; font-weight:600; text-transform:capitalize;">${rolLabel}</span></td>
                <td style="color: var(--color-text-muted);">${fechaStr}</td>
            `;
            recientesBody.appendChild(tr);
        });
    }

    // 6. RENDERIZADO Y FILTRADO DE LA TABLA GENERAL DE USUARIOS
    const searchInput = document.getElementById('user-search-input');
    const filterRol = document.getElementById('filter-rol');
    const filterEstado = document.getElementById('filter-estado');

    function renderUsersTable() {
        const tbody = document.getElementById('usuarios-table-body');
        tbody.innerHTML = '';

        const searchQuery = searchInput.value.toLowerCase().trim();
        const roleQuery = filterRol.value;
        const statusQuery = filterEstado.value;

        // Aplicar filtros reactivos
        const filtered = allUsers.filter(u => {
            const matchesSearch = u.nombre_usuario.toLowerCase().includes(searchQuery) ||
                                  u.correo_usuario.toLowerCase().includes(searchQuery) ||
                                  u.documento_usuario.includes(searchQuery);

            const matchesRole = roleQuery === '' || u.rol_usuario === roleQuery;
            const matchesStatus = statusQuery === '' || u.estado_usuario === statusQuery;

            return matchesSearch && matchesRole && matchesStatus;
        });

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--color-text-muted); padding: var(--spacing-xl);">Ningún usuario coincide con los filtros aplicados.</td></tr>`;
            return;
        }

        filtered.forEach(u => {
            const tr = document.createElement('tr');
            const statusBadge = u.estado_usuario === 'activo' 
                ? '<span class="status-badge active">Activo</span>' 
                : '<span class="status-badge inactive">Inactivo</span>';

            const toggleIcon = u.estado_usuario === 'activo' 
                ? '<i class="bi bi-person-x" style="color: var(--color-error); font-size:1.15rem;" title="Desactivar Usuario"></i>' 
                : '<i class="bi bi-person-check" style="color: var(--color-success); font-size:1.15rem;" title="Activar Usuario"></i>';

            tr.innerHTML = `
                <td><strong>${u.nombre_usuario}</strong></td>
                <td>${u.correo_usuario}</td>
                <td style="font-family: monospace;">${u.documento_usuario}</td>
                <td><span style="font-size:0.85rem; padding: 2px 8px; background: #EDF2F7; border-radius:4px; font-weight:600;">${formatRolName(u.rol_usuario)}</span></td>
                <td>${statusBadge}</td>
                <td class="action-group">
                    <button class="table-action-btn btn-view" title="Ver Detalles" data-id="${u.id_usuario}">
                        <i class="bi bi-eye" style="color: #3B82F6;"></i>
                    </button>
                    <button class="table-action-btn btn-edit" title="Editar Información" data-id="${u.id_usuario}">
                        <i class="bi bi-pencil-square" style="color: #F59E0B;"></i>
                    </button>
                    <button class="table-action-btn btn-role" title="Cambiar Rol" data-id="${u.id_usuario}">
                        <i class="bi bi-person-gear" style="color: #8B5CF6;"></i>
                    </button>
                    <button class="table-action-btn btn-toggle" data-id="${u.id_usuario}" data-estado="${u.estado_usuario}">
                        ${toggleIcon}
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Enganchar eventos a botones de acción
        document.querySelectorAll('.btn-view').forEach(btn => {
            btn.addEventListener('click', () => openViewModal(btn.getAttribute('data-id')));
        });
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', () => openEditModal(btn.getAttribute('data-id')));
        });
        document.querySelectorAll('.btn-role').forEach(btn => {
            btn.addEventListener('click', () => openRoleModal(btn.getAttribute('data-id')));
        });
        document.querySelectorAll('.btn-toggle').forEach(btn => {
            btn.addEventListener('click', () => {
                const uid = btn.getAttribute('data-id');
                const currState = btn.getAttribute('data-estado');
                confirmToggleStatus(uid, currState);
            });
        });
    }

    // Buscador y filtros reactivos
    searchInput.addEventListener('input', renderUsersTable);
    filterRol.addEventListener('change', renderUsersTable);
    filterEstado.addEventListener('change', renderUsersTable);

    // ====================================
    // 7. MODALES Y OPERACIONES INDIVIDUALES (CRUD)
    // ====================================

    // --- MODAL: CREAR NUEVO USUARIO ---
    const createModal = document.getElementById('create-user-modal');
    const openCreateBtn = document.getElementById('btn-open-create-modal');
    const closeCreateBtns = [
        document.getElementById('btn-close-create-modal'),
        document.getElementById('btn-cancel-create')
    ];
    const createUserForm = document.getElementById('create-user-form');
    const generatePassBtn = document.getElementById('btn-generate-password');
    const createAlert = document.getElementById('create-user-alert');

    openCreateBtn.addEventListener('click', () => {
        createUserForm.reset();
        hideAlert(createAlert);
        createModal.classList.add('open');
    });

    closeCreateBtns.forEach(btn => {
        btn.addEventListener('click', () => createModal.classList.remove('open'));
    });

    generatePassBtn.addEventListener('click', () => {
        // Generar contraseña aleatoria
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$';
        let pass = '';
        for (let i = 0; i < 10; i++) {
            pass += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        document.getElementById('new-password').value = pass;
    });

    createUserForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideAlert(createAlert);

        const payload = {
            id_cooperativa: currentUser.id_cooperativa,
            nombre: document.getElementById('new-name').value,
            correo: document.getElementById('new-email').value,
            documento: document.getElementById('new-document').value,
            telefono: document.getElementById('new-phone').value,
            rol: document.getElementById('new-role').value,
            contrasena: document.getElementById('new-password').value
        };

        try {
            const response = await fetch('/api/admin/usuarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();

            if (!response.ok) {
                showAlert(createAlert, data.error || 'Ocurrió un error al registrar el usuario.', 'danger');
                return;
            }

            // Exito
            showAlert(createAlert, data.message, 'success');
            
            setTimeout(() => {
                createModal.classList.remove('open');
                loadLocalUsers();
            }, 1200);

        } catch (error) {
            showAlert(createAlert, 'Error de comunicación con el servidor.', 'danger');
        }
    });

    // --- MODAL: VER DETALLES ---
    const viewModal = document.getElementById('view-user-modal');
    const closeViewBtns = [
        document.getElementById('btn-close-view-modal'),
        document.getElementById('btn-close-view-panel')
    ];

    closeViewBtns.forEach(btn => {
        btn.addEventListener('click', () => viewModal.classList.remove('open'));
    });

    function openViewModal(id) {
        const u = allUsers.find(user => user.id_usuario == id);
        if (!u) return;

        document.getElementById('view-name').textContent = u.nombre_usuario;
        document.getElementById('view-email').textContent = u.correo_usuario;
        document.getElementById('view-document').textContent = u.documento_usuario;
        document.getElementById('view-phone').textContent = u.telefono_usuario || 'Sin registrar';
        document.getElementById('view-role').textContent = formatRolName(u.rol_usuario);
        
        const stateLabel = u.estado_usuario === 'activo' 
            ? '<span class="status-badge active">Activo</span>' 
            : '<span class="status-badge inactive">Inactivo</span>';
        document.getElementById('view-status').innerHTML = stateLabel;
        
        const createdDate = u.fecha_creacion_usuario ? new Date(u.fecha_creacion_usuario).toLocaleString() : 'N/A';
        document.getElementById('view-created').textContent = createdDate;

        viewModal.classList.add('open');
    }

    // --- MODAL: EDITAR INFORMACIÓN ---
    const editModal = document.getElementById('edit-user-modal');
    const closeEditBtns = [
        document.getElementById('btn-close-edit-modal'),
        document.getElementById('btn-cancel-edit')
    ];
    const editForm = document.getElementById('edit-user-form');
    const editAlert = document.getElementById('edit-user-alert');

    closeEditBtns.forEach(btn => {
        btn.addEventListener('click', () => editModal.classList.remove('open'));
    });

    function openEditModal(id) {
        const u = allUsers.find(user => user.id_usuario == id);
        if (!u) return;

        hideAlert(editAlert);

        document.getElementById('edit-user-id').value = u.id_usuario;
        document.getElementById('edit-name').value = u.nombre_usuario;
        document.getElementById('edit-email').value = u.correo_usuario;
        document.getElementById('edit-document').value = u.documento_usuario;
        document.getElementById('edit-phone').value = u.telefono_usuario || '';

        editModal.classList.add('open');
    }

    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideAlert(editAlert);

        const uid = document.getElementById('edit-user-id').value;
        const payload = {
            nombre: document.getElementById('edit-name').value,
            correo: document.getElementById('edit-email').value,
            documento: document.getElementById('edit-document').value,
            telefono: document.getElementById('edit-phone').value
        };

        try {
            const response = await fetch(`/api/admin/usuarios/${uid}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();

            if (!response.ok) {
                showAlert(editAlert, data.error || 'Error al actualizar la información.', 'danger');
                return;
            }

            showAlert(editAlert, data.message, 'success');

            setTimeout(() => {
                editModal.classList.remove('open');
                loadLocalUsers();
            }, 1200);

        } catch (error) {
            showAlert(editAlert, 'Error de conexión con el servidor.', 'danger');
        }
    });

    // --- MODAL: CAMBIAR ROL ---
    const roleModal = document.getElementById('role-user-modal');
    const closeRoleBtns = [
        document.getElementById('btn-close-role-modal'),
        document.getElementById('btn-cancel-role')
    ];
    const roleForm = document.getElementById('role-user-form');
    const roleAlert = document.getElementById('role-user-alert');

    closeRoleBtns.forEach(btn => {
        btn.addEventListener('click', () => roleModal.classList.remove('open'));
    });

    function openRoleModal(id) {
        const u = allUsers.find(user => user.id_usuario == id);
        if (!u) return;

        roleAlert.style.display = 'none';
        roleAlert.className = 'alert';

        document.getElementById('role-user-id').value = u.id_usuario;
        document.getElementById('role-user-display-name').textContent = u.nombre_usuario;
        document.getElementById('change-role-select').value = u.rol_usuario;

        roleModal.classList.add('open');
    }

    roleForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        roleAlert.style.display = 'none';

        const uid = document.getElementById('role-user-id').value;
        const newRol = document.getElementById('change-role-select').value;

        try {
            const response = await fetch(`/api/admin/usuarios/${uid}/rol`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rol: newRol })
            });
            const data = await response.json();

            if (!response.ok) {
                roleAlert.textContent = data.error || 'Error al cambiar de rol.';
                roleAlert.classList.add('show', 'alert-danger');
                return;
            }

            roleAlert.textContent = data.message;
            roleAlert.classList.add('show', 'alert-success');

            setTimeout(() => {
                roleModal.classList.remove('open');
                loadLocalUsers();
            }, 1200);

        } catch (error) {
            roleAlert.textContent = 'Error de conexión con el servidor.';
            roleAlert.classList.add('show', 'alert-danger');
        }
    });

    // --- MODAL CONFIRMACIÓN: ACTIVAR/DESACTIVAR ---
    const confirmModal = document.getElementById('confirm-action-modal');
    const confirmTitle = document.getElementById('confirm-title');
    const confirmDesc = document.getElementById('confirm-description');
    const confirmCancelBtn = document.getElementById('btn-confirm-cancel');
    const confirmOkBtn = document.getElementById('btn-confirm-ok');

    let actionTargetUid = null;
    let actionTargetNewState = null;

    confirmCancelBtn.addEventListener('click', () => confirmModal.classList.remove('open'));

    function confirmToggleStatus(uid, currentState) {
        actionTargetUid = uid;
        actionTargetNewState = currentState === 'activo' ? 'inactivo' : 'activo';

        const u = allUsers.find(user => user.id_usuario == uid);
        if (!u) return;

        confirmTitle.textContent = actionTargetNewState === 'activo' ? '¿Activar usuario?' : '¿Desactivar usuario?';
        confirmDesc.innerHTML = actionTargetNewState === 'activo'
            ? `¿Deseas activar el acceso para <strong>${u.nombre_usuario}</strong>? Podrá acceder al sistema normalmente.`
            : `¿Deseas suspender a <strong>${u.nombre_usuario}</strong>? Se le negará el acceso a todos los servicios de la cooperativa.`;

        confirmModal.classList.add('open');
    }

    confirmOkBtn.addEventListener('click', async () => {
        confirmModal.classList.remove('open');
        if (!actionTargetUid || !actionTargetNewState) return;

        try {
            const response = await fetch(`/api/admin/usuarios/${actionTargetUid}/estado`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: actionTargetNewState })
            });
            
            const data = await response.json();
            if (response.ok) {
                loadLocalUsers();
            } else {
                alert(data.error || 'Error al cambiar estado.');
            }
        } catch (error) {
            console.error('Error toggling status:', error);
        }
    });

    // Helper formatting
    function formatRolName(rol) {
        if (!rol) return '';
        return rol.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
    }

    // ====================================
    // 8. CARGA MASIVA DE EXCEL (SHEETJS CDN)
    // ====================================
    const dropZone = document.getElementById('excel-drop-zone');
    const fileInput = document.getElementById('excel-file-input');
    const previewContainer = document.getElementById('excel-preview-container');
    const previewTbody = document.getElementById('excel-preview-tbody');
    const excelAlertBox = document.getElementById('excel-alert-box');
    const excelSummaryText = document.getElementById('excel-summary-text');
    const confirmImportBtn = document.getElementById('btn-confirm-import');
    const cancelImportBtn = document.getElementById('btn-cancel-import');
    const downloadTemplateBtn = document.getElementById('btn-download-template');

    // Click en la zona abre el buscador de archivos
    dropZone.addEventListener('click', () => fileInput.click());

    // Eventos drag & drop
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
        }, false);
    });

    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length) handleExcelFile(files[0]);
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) handleExcelFile(e.target.files[0]);
    });

    // Cancelar la importación actual
    cancelImportBtn.addEventListener('click', () => {
        parsedExcelUsers = [];
        previewContainer.style.display = 'none';
        fileInput.value = '';
        excelAlertBox.innerHTML = '';
        excelAlertBox.className = 'alert';
    });

    // Descargar plantilla .xlsx dinámica con SheetJS
    downloadTemplateBtn.addEventListener('click', () => {
        const ws_data = [
            ["nombre", "correo", "documento", "rol", "telefono"],
            ["Juan Perez", "juan.perez@coop.com", "1023456789", "analista", "3001234567"],
            ["Maria Gomez", "maria.gomez@coop.com", "1034567890", "cajero", "3109876543"],
            ["Carlos Lopez", "carlos.lopez@coop.com", "1045678901", "gerente", "3201234567"],
            ["Ana Castro", "ana.castro@coop.com", "1056789012", "gestor financiero", "3151234567"]
        ];

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(ws_data);
        XLSX.utils.book_append_sheet(wb, ws, "Plantilla Importar");
        XLSX.writeFile(wb, "Plantilla_Usuarios_COOPMONEY.xlsx");
    });

    // Procesar archivo Excel/CSV
    function handleExcelFile(file) {
        excelAlertBox.innerHTML = '';
        excelAlertBox.className = 'alert';
        previewTbody.innerHTML = '';
        parsedExcelUsers = [];

        const reader = new FileReader();
        reader.onload = function(e) {
            const data = e.target.result;
            try {
                const workbook = XLSX.read(data, { type: 'binary' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                
                // Convertir la hoja a JSON
                const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                if (rawRows.length < 2) {
                    showExcelError("El archivo de Excel está vacío o no contiene filas de datos.");
                    return;
                }

                // Obtener cabeceras y normalizar (remover espacios, minúsculas, acentos simples)
                const headers = rawRows[0].map(h => (h || '').toString().toLowerCase().trim().replace(/[^a-z0-9]/g, ''));
                
                // Validar encabezados requeridos
                const required = ['nombre', 'correo', 'documento', 'rol'];
                const missing = required.filter(col => !headers.includes(col));
                if (missing.length > 0) {
                    showExcelError(`El archivo no cuenta con los encabezados requeridos: <strong>${missing.join(', ')}</strong>.`);
                    return;
                }

                const nameIdx = headers.indexOf('nombre');
                const emailIdx = headers.indexOf('correo');
                const docIdx = headers.indexOf('documento');
                const roleIdx = headers.indexOf('rol');
                const telIdx = headers.indexOf('telefono');

                const rowsToRender = [];
                let validCount = 0;
                let errorCount = 0;
                const errorsList = [];
                const processedEmails = new Set();
                const processedDocuments = new Set();

                for (let i = 1; i < rawRows.length; i++) {
                    const row = rawRows[i];
                    if (row.length === 0 || row.every(cell => cell === null || cell === undefined || cell === '')) {
                        continue; // saltar líneas vacías
                    }

                    const nombre = (row[nameIdx] || '').toString().trim();
                    const correo = (row[emailIdx] || '').toString().trim();
                    const rawDocumento = (row[docIdx] || '').toString().trim();
                    const rol = (row[roleIdx] || '').toString().trim();
                    const telefono = telIdx !== -1 ? (row[telIdx] || '').toString().trim() : '';

                    // Sanitizar documento: quitar puntos (.) y espacios en blanco
                    const documento = rawDocumento.replace(/[\.\s]/g, '');

                    const rowNum = i + 1;
                    let rowHasError = false;
                    let rowErrorText = '';

                    // 1. Validar campos vacíos
                    if (!nombre || !correo || !rawDocumento || !rol) {
                        rowHasError = true;
                        rowErrorText = 'Campos obligatorios incompletos.';
                    }
                    // 2. Validar que el documento sea estrictamente numérico (sin letras)
                    else if (!/^\d+$/.test(documento)) {
                        rowHasError = true;
                        rowErrorText = `Documento "${rawDocumento}" inválido (solo debe contener números).`;
                    }
                    // 3. Validar longitud del documento
                    else if (documento.length < 5 || documento.length > 15) {
                        rowHasError = true;
                        rowErrorText = `Documento debe tener entre 5 y 15 dígitos.`;
                    }
                    // 4. Validar formato de correo electrónico
                    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
                        rowHasError = true;
                        rowErrorText = `Correo "${correo}" inválido (debe contener @ y formato correcto).`;
                    }
                    // 5. Validar rol
                    else if (rol) {
                        const rolNormalizado = rol.toLowerCase().replace(/\s+/g, '_');
                        const validRoles = ['analista', 'cajero', 'gerente', 'gestor_financiero'];
                        if (!validRoles.includes(rolNormalizado)) {
                            rowHasError = true;
                            rowErrorText = `Rol no válido "${rol}".`;
                        }
                    }

                    // 6. Validar duplicados dentro del mismo archivo Excel
                    if (!rowHasError) {
                        if (processedEmails.has(correo.toLowerCase())) {
                            rowHasError = true;
                            rowErrorText = `Correo duplicado "${correo}" en el mismo archivo.`;
                        } else if (processedDocuments.has(documento)) {
                            rowHasError = true;
                            rowErrorText = `Documento duplicado "${rawDocumento}" en el mismo archivo.`;
                        }
                    }

                    if (rowHasError) {
                        errorCount++;
                        errorsList.push(`Fila ${rowNum}: ${rowErrorText}`);
                    } else {
                        validCount++;
                        processedEmails.add(correo.toLowerCase());
                        processedDocuments.add(documento);

                        parsedExcelUsers.push({
                            nombre: nombre,
                            correo: correo,
                            documento: documento, // Se guarda el documento sanitizado (sin puntos)
                            rol: rol,
                            telefono: telefono
                        });
                    }

                    // Guardar para renderizar las primeras 5 filas
                    if (rowsToRender.length < 5) {
                        rowsToRender.push({
                            nombre,
                            correo,
                            documento: documento, // Mostrar sanitizado
                            rol,
                            telefono,
                            hasError: rowHasError,
                            errorText: rowErrorText
                        });
                    }
                }

                // Renderizar vista previa
                renderExcelPreview(rowsToRender);

                // Imprimir resumen
                excelSummaryText.innerHTML = `
                    <span style="color: var(--color-success); font-size:1.05rem;">🟢 ${validCount} filas listas para importar.</span><br>
                    <span style="color: var(--color-error); font-size:0.95rem;">🔴 ${errorCount} filas con errores (se omitirán).</span>
                `;

                if (errorsList.length > 0) {
                    showExcelWarnings(errorsList.slice(0, 10), errorsList.length);
                }

                previewContainer.style.display = 'block';

            } catch (err) {
                console.error(err);
                showExcelError("Error al procesar el archivo. Asegúrate de que sea un archivo de Excel (.xlsx, .xls) o CSV válido.");
            }
        };

        reader.onerror = function() {
            showExcelError("Error de lectura del archivo.");
        };

        reader.readAsBinaryString(file);
    }

    function renderExcelPreview(rows) {
        previewTbody.innerHTML = '';
        rows.forEach(r => {
            const tr = document.createElement('tr');
            if (r.hasError) {
                tr.style.backgroundColor = '#FEF2F2';
                tr.style.color = '#991B1B';
            }
            tr.innerHTML = `
                <td>
                    <strong>${r.nombre}</strong>
                    ${r.hasError ? `<br><span style="font-size:0.75rem; font-weight:600; color:var(--color-error);">${r.errorText}</span>` : ''}
                </td>
                <td>${r.correo}</td>
                <td style="font-family: monospace;">${r.documento}</td>
                <td><span style="font-size:0.8rem; padding: 2px 6px; background:${r.hasError?'#FEE2E2':'#e2e8f0'}; border-radius:4px; font-weight:600;">${r.rol}</span></td>
                <td>${r.telefono || '-'}</td>
            `;
            previewTbody.appendChild(tr);
        });
    }

    function showExcelError(msg) {
        excelAlertBox.innerHTML = msg;
        excelAlertBox.className = 'alert alert-danger show';
        previewContainer.style.display = 'none';
    }

    function showExcelWarnings(errors, totalErrors) {
        let html = `<strong>Errores encontrados en el archivo (Se omitirán estas filas):</strong><ul style="margin-top:6px; padding-left:20px; font-size:0.85rem; line-height:1.4;">`;
        errors.forEach(e => {
            html += `<li>${e}</li>`;
        });
        if (totalErrors > 10) {
            html += `<li>...y ${totalErrors - 10} errores más.</li>`;
        }
        html += `</ul>`;
        excelAlertBox.innerHTML = html;
        excelAlertBox.className = 'alert alert-danger show';
    }

    // Confirmar importación
    confirmImportBtn.addEventListener('click', async () => {
        if (parsedExcelUsers.length === 0) {
            alert("No hay usuarios válidos para importar.");
            return;
        }

        confirmImportBtn.disabled = true;
        confirmImportBtn.textContent = 'Importando...';

        const payload = {
            id_cooperativa: currentUser.id_cooperativa,
            usuarios: parsedExcelUsers
        };

        try {
            const response = await fetch('/api/admin/usuarios/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();

            if (!response.ok) {
                alert(data.error || 'Ocurrió un error al importar.');
                confirmImportBtn.disabled = false;
                confirmImportBtn.textContent = 'Confirmar Importación';
                return;
            }

            // Éxito total o parcial
            excelAlertBox.innerHTML = `
                <div style="font-size: 1.1rem; font-weight:600;">¡Importación masiva completada!</div>
                <div style="margin-top:6px;">
                    ✅ <strong>${data.importados}</strong> usuarios agregados exitosamente a la base de datos real.<br>
                    ❌ <strong>${data.errores}</strong> usuarios omitidos por duplicado o inconsistencia.
                </div>
            `;
            excelAlertBox.className = 'alert alert-success show';
            parsedExcelUsers = [];

            setTimeout(() => {
                confirmImportBtn.disabled = false;
                confirmImportBtn.textContent = 'Confirmar Importación';
                previewContainer.style.display = 'none';
                fileInput.value = '';
                
                // Redirigir a pestaña de usuarios
                document.querySelector('[data-tab-target="tab-usuarios"]').click();
            }, 2500);

        } catch (error) {
            alert('Error de conexión al importar.');
            confirmImportBtn.disabled = false;
            confirmImportBtn.textContent = 'Confirmar Importación';
        }
    });

    // ====================================
    // 9. SEGURIDAD Y CAMBIO DE CONTRASEÑA
    // ====================================
    const changePassForm = document.getElementById('change-password-form');
    const passAlert = document.getElementById('password-alert');

    changePassForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideAlert(passAlert);

        const curr = document.getElementById('pass-current').value;
        const newPass = document.getElementById('pass-new').value;
        const confPass = document.getElementById('pass-confirm').value;

        if (newPass !== confPass) {
            showAlert(passAlert, 'La nueva contraseña y la confirmación no coinciden.', 'danger');
            return;
        }

        if (newPass.length < 6) {
            showAlert(passAlert, 'La nueva contraseña debe tener al menos 6 caracteres.', 'danger');
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
                showAlert(passAlert, data.error || 'Error al actualizar la contraseña.', 'danger');
                return;
            }

            // Exito
            showAlert(passAlert, data.message, 'success');
            changePassForm.reset();

        } catch (error) {
            showAlert(passAlert, 'Error de conexión con el servidor.', 'danger');
        }
    });

    // --- CARGA INICIAL ---
    loadLocalUsers();
});
