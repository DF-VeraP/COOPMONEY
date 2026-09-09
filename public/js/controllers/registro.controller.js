/**
 * Controlador de Registro de Cooperativa (Wizard Multi-paso & Validación)
 * COOPMONEY Platform
 */

document.addEventListener('DOMContentLoaded', () => {
    // Referencias principales
    const form = document.getElementById('registroForm');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const alertBox = document.getElementById('formAlert');

    // Botones de navegación
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');

    // Pasos e indicadores
    const steps = [
        document.getElementById('step-1'),
        document.getElementById('step-2'),
        document.getElementById('step-3'),
        document.getElementById('step-4')
    ];
    const stepItems = document.querySelectorAll('.reg-step-item');
    const stepperProgress = document.getElementById('stepperProgress');

    let currentStep = 1;
    const totalSteps = 4;

    // Inputs clave
    const nitInput = document.getElementById('nit');
    const telCoopInput = document.getElementById('telCoop');
    const passInput = document.getElementById('passAdmin');
    const togglePassBtn = document.getElementById('togglePassBtn');

    // Resumen (Paso 4)
    const summaryNombreCoop = document.getElementById('summaryNombreCoop');
    const summaryNit = document.getElementById('summaryNit');
    const summaryNombreRep = document.getElementById('summaryNombreRep');
    const summaryCorreoAdmin = document.getElementById('summaryCorreoAdmin');

    // Regex
    const nitRegex = /^[0-9]{8,10}-[0-9]$/; // Ej: 900123456-1
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    /* ==========================================================================
       1. FORMATEO Y VALIDACIONES EN TIEMPO REAL
       ========================================================================== */

    // Formatear NIT al perder el foco
    if (nitInput) {
        nitInput.addEventListener('blur', (e) => {
            let val = e.target.value.trim().replace(/\s/g, '');
            if (val.length >= 9 && !val.includes('-')) {
                val = val.slice(0, -1) + '-' + val.slice(-1);
            }
            e.target.value = val;

            const cleanNit = val.replace(/\./g, '');
            setFieldError(nitInput, !nitRegex.test(cleanNit) && val !== '');
        });

        nitInput.addEventListener('input', () => {
            if (nitInput.closest('.reg-form-group').classList.contains('has-error')) {
                const cleanNit = nitInput.value.trim().replace(/\./g, '');
                if (nitRegex.test(cleanNit)) {
                    setFieldError(nitInput, false);
                }
            }
        });
    }

    // Teléfono de la cooperativa
    if (telCoopInput) {
        telCoopInput.addEventListener('blur', () => {
            const val = telCoopInput.value.replace(/\D/g, '');
            setFieldError(telCoopInput, val.length > 0 && val.length < 7);
        });
    }

    // Helper para marcar error en input
    function setFieldError(input, hasError) {
        if (!input) return;
        const group = input.closest('.reg-form-group');
        if (!group) return;
        if (hasError) {
            group.classList.add('has-error');
        } else {
            group.classList.remove('has-error');
        }
    }

    /* ==========================================================================
       2. TOGGLE DE VISIBILIDAD DE CONTRASEÑA
       ========================================================================== */
    if (togglePassBtn && passInput) {
        togglePassBtn.addEventListener('click', () => {
            const isPassword = passInput.type === 'password';
            passInput.type = isPassword ? 'text' : 'password';

            togglePassBtn.innerHTML = isPassword
                ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                     <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                     <line x1="1" y1="1" x2="23" y2="23"></line>
                   </svg>`
                : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                     <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                     <circle cx="12" cy="12" r="3"></circle>
                   </svg>`;
        });
    }

    /* ==========================================================================
       3. SELECCIÓN VISUAL DE CHIPS & RADIO CARDS
       ========================================================================== */
    // Checkboxes de líneas de crédito
    document.querySelectorAll('.reg-chip-label input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const label = checkbox.closest('.reg-chip-label');
            if (checkbox.checked) {
                label.classList.add('checked');
            } else {
                label.classList.remove('checked');
            }
        });
    });

    // Radios de migración
    document.querySelectorAll('.reg-radio-card input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', () => {
            document.querySelectorAll('.reg-radio-card').forEach(card => card.classList.remove('checked'));
            if (radio.checked) {
                radio.closest('.reg-radio-card').classList.add('checked');
            }
        });
    });

    /* ==========================================================================
       4. CONTROL DE PASOS (WIZARD NAVIGATION)
       ========================================================================== */
    function updateWizardUI() {
        // Mostrar solo el paso actual
        steps.forEach((step, idx) => {
            if (step) {
                if (idx + 1 === currentStep) {
                    step.classList.add('active');
                } else {
                    step.classList.remove('active');
                }
            }
        });

        // Actualizar Stepper Header
        stepItems.forEach((item, idx) => {
            const stepNum = idx + 1;
            item.classList.remove('active', 'completed');
            if (stepNum === currentStep) {
                item.classList.add('active');
            } else if (stepNum < currentStep) {
                item.classList.add('completed');
            }
        });

        // Barra de progreso superior
        if (stepperProgress) {
            const progressPercent = ((currentStep - 1) / (totalSteps - 1)) * 100;
            stepperProgress.style.width = `${progressPercent}%`;
        }

        // Control de visibilidad de botones
        if (prevBtn) {
            prevBtn.style.visibility = currentStep === 1 ? 'hidden' : 'visible';
        }

        if (currentStep === totalSteps) {
            if (nextBtn) nextBtn.style.display = 'none';
            if (submitBtn) submitBtn.style.display = 'inline-flex';
            // Cargar resumen
            populateSummary();
        } else {
            if (nextBtn) nextBtn.style.display = 'inline-flex';
            if (submitBtn) submitBtn.style.display = 'none';
        }

        // Scroll suave al inicio del formulario para comodidad
        const container = document.querySelector('.registro-container');
        if (container) {
            container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    function populateSummary() {
        if (summaryNombreCoop) {
            summaryNombreCoop.textContent = document.getElementById('nombreCoop').value.trim() || '--';
        }
        if (summaryNit) {
            summaryNit.textContent = document.getElementById('nit').value.trim() || '--';
        }
        if (summaryNombreRep) {
            summaryNombreRep.textContent = document.getElementById('nombreRep').value.trim() || '--';
        }
        if (summaryCorreoAdmin) {
            summaryCorreoAdmin.textContent = document.getElementById('correoRep').value.trim() || '--';
        }
    }

    function validateStep(stepNumber) {
        clearAlert();
        let isValid = true;

        if (stepNumber === 1) {
            const nit = document.getElementById('nit');
            const cleanNit = nit.value.trim().replace(/\./g, '');
            if (!cleanNit || !nitRegex.test(cleanNit)) {
                setFieldError(nit, true);
                isValid = false;
            } else {
                setFieldError(nit, false);
            }

            const nombreCoop = document.getElementById('nombreCoop');
            if (!nombreCoop.value.trim()) {
                setFieldError(nombreCoop, true);
                isValid = false;
            } else {
                setFieldError(nombreCoop, false);
            }

            const correoCoop = document.getElementById('correoCoop');
            if (!correoCoop.value.trim() || !emailRegex.test(correoCoop.value.trim())) {
                setFieldError(correoCoop, true);
                isValid = false;
            } else {
                setFieldError(correoCoop, false);
            }

            const telCoop = document.getElementById('telCoop');
            const cleanTel = telCoop.value.replace(/\D/g, '');
            if (cleanTel.length < 7) {
                setFieldError(telCoop, true);
                isValid = false;
            } else {
                setFieldError(telCoop, false);
            }

            const dirCoop = document.getElementById('dirCoop');
            if (!dirCoop.value.trim()) {
                setFieldError(dirCoop, true);
                isValid = false;
            } else {
                setFieldError(dirCoop, false);
            }
        }

        if (stepNumber === 2) {
            const nombreRep = document.getElementById('nombreRep');
            if (!nombreRep.value.trim()) {
                setFieldError(nombreRep, true);
                isValid = false;
            } else {
                setFieldError(nombreRep, false);
            }

            const cedulaRep = document.getElementById('cedulaRep');
            if (!cedulaRep.value.trim()) {
                setFieldError(cedulaRep, true);
                isValid = false;
            } else {
                setFieldError(cedulaRep, false);
            }

            const cargoRep = document.getElementById('cargoRep');
            if (!cargoRep.value.trim()) {
                setFieldError(cargoRep, true);
                isValid = false;
            } else {
                setFieldError(cargoRep, false);
            }

            const telRep = document.getElementById('telRep');
            if (!telRep.value.trim()) {
                setFieldError(telRep, true);
                isValid = false;
            } else {
                setFieldError(telRep, false);
            }

            const correoRep = document.getElementById('correoRep');
            if (!correoRep.value.trim() || !emailRegex.test(correoRep.value.trim())) {
                setFieldError(correoRep, true);
                isValid = false;
            } else {
                setFieldError(correoRep, false);
            }

            const passAdmin = document.getElementById('passAdmin');
            if (!passAdmin.value || passAdmin.value.length < 6) {
                setFieldError(passAdmin, true);
                isValid = false;
            } else {
                setFieldError(passAdmin, false);
            }
        }

        if (stepNumber === 3) {
            const cantSocios = document.getElementById('cantSocios');
            if (!cantSocios.value) {
                setFieldError(cantSocios, true);
                isValid = false;
            } else {
                setFieldError(cantSocios, false);
            }

            const lineasCheckboxes = document.querySelectorAll('input[name="linea"]:checked');
            if (lineasCheckboxes.length === 0) {
                showAlert('Debe seleccionar al menos una línea de crédito a operar.', 'alert-danger');
                isValid = false;
            }
        }

        if (!isValid && !alertBox.classList.contains('show')) {
            showAlert('Por favor complete los campos obligatorios resaltados en rojo para continuar.', 'alert-danger');
        }

        return isValid;
    }

    function showAlert(message, type = 'alert-danger') {
        if (!alertBox) return;
        alertBox.className = `alert show ${type}`;
        alertBox.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>${message}</span>
        `;
    }

    function clearAlert() {
        if (!alertBox) return;
        alertBox.className = 'alert';
        alertBox.innerHTML = '';
    }

    // Botón Continuar
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (validateStep(currentStep)) {
                if (currentStep < totalSteps) {
                    currentStep++;
                    updateWizardUI();
                }
            }
        });
    }

    // Botón Anterior
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            clearAlert();
            if (currentStep > 1) {
                currentStep--;
                updateWizardUI();
            }
        });
    }

    // Clic directo en los círculos de pasos completados
    stepItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetStep = parseInt(item.getAttribute('data-step'), 10);
            if (targetStep < currentStep) {
                clearAlert();
                currentStep = targetStep;
                updateWizardUI();
            } else if (targetStep > currentStep) {
                if (validateStep(currentStep)) {
                    currentStep = targetStep;
                    updateWizardUI();
                }
            }
        });
    });

    /* ==========================================================================
       5. ENVÍO DEL FORMULARIO Y RADICACIÓN
       ========================================================================== */
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearAlert();

        // Validar paso 4 (Términos)
        const terminos = document.getElementById('terminos');
        const datos = document.getElementById('datos');

        if (!terminos.checked || !datos.checked) {
            showAlert('Debe aceptar los Términos y Condiciones y la Política de Privacidad para continuar.', 'alert-danger');
            return;
        }

        // Recopilar líneas de crédito
        const lineasCheckboxes = document.querySelectorAll('input[name="linea"]:checked');
        const lineasArray = Array.from(lineasCheckboxes).map(cb => cb.value);

        // Recopilar migración
        const migracionRadio = document.querySelector('input[name="migracion"]:checked');

        const payload = {
            nit_cooperativa: document.getElementById('nit').value.replace(/\./g, '').trim(),
            nombre_cooperativa: document.getElementById('nombreCoop').value.trim(),
            correo_cooperativa: document.getElementById('correoCoop').value.trim(),
            telefono_cooperativa: document.getElementById('telCoop').value.trim(),
            direccion_cooperativa: document.getElementById('dirCoop').value.trim(),
            sitio_web: document.getElementById('webCoop').value.trim() || '',

            nombre_representante: document.getElementById('nombreRep').value.trim(),
            cedula_representante: document.getElementById('cedulaRep').value.trim(),
            cargo_representante: document.getElementById('cargoRep').value.trim(),
            telefono_representante: document.getElementById('telRep').value.trim(),
            correo_representante: document.getElementById('correoRep').value.trim(),
            contrasena_admin: document.getElementById('passAdmin').value,

            lineas_credito: lineasArray.join(', '),
            cantidad_socios: document.getElementById('cantSocios').value,
            necesita_migracion: migracionRadio ? migracionRadio.value === 'true' : false
        };

        // Mostrar loading
        if (loadingOverlay) loadingOverlay.classList.add('active');

        try {
            const response = await fetch('/api/cooperativas/solicitud', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            // Breve espera para una transición fluida y visual
            setTimeout(() => {
                if (loadingOverlay) loadingOverlay.classList.remove('active');

                if (!response.ok) {
                    showAlert(data.error || 'Ocurrió un error al procesar la solicitud.', 'alert-danger');
                    return;
                }

                // Ocultar componentes previos
                form.style.display = 'none';
                const cardHeader = document.querySelector('.reg-card-header');
                if (cardHeader) cardHeader.style.display = 'none';
                const stepperEl = document.getElementById('stepper');
                if (stepperEl) stepperEl.style.display = 'none';
                const calloutEl = document.querySelector('.reg-callout');
                if (calloutEl) calloutEl.style.display = 'none';
                const footerNote = document.querySelector('.reg-footer-note');
                if (footerNote) footerNote.style.display = 'none';

                // Renderizar pantalla de éxito premium
                const successDiv = document.createElement('div');
                successDiv.className = 'reg-success-card';
                successDiv.innerHTML = `
                    <div class="reg-success-badge">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                    </div>
                    <h2 class="reg-success-title">¡Solicitud Radicada con Éxito!</h2>
                    <p class="reg-success-text">
                        Hemos recibido la información de <strong>${payload.nombre_cooperativa}</strong>. Nuestro equipo de auditoría y el Super Administrador evaluarán los antecedentes jurídicos. Una vez aprobada la afiliación, recibirá una notificación institucional y podrá ingresar directamente con el usuario: <br><br>
                        <span style="display: inline-block; background: #e2e8f0; padding: 6px 14px; border-radius: 6px; font-weight: 700; color: #0f172a;">${payload.correo_representante}</span>
                    </p>
                    <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                        <a href="index.html" class="reg-btn-submit" style="text-decoration: none;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                            Volver al Inicio
                        </a>
                        <a href="index.html" class="reg-btn-prev" style="text-decoration: none; visibility: visible;">
                            Portal de Acceso
                        </a>
                    </div>
                `;

                document.querySelector('.registro-container').appendChild(successDiv);

            }, 800);

        } catch (error) {
            if (loadingOverlay) loadingOverlay.classList.remove('active');
            showAlert('Error de conexión con el servidor. Por favor verifique su red e intente nuevamente.', 'alert-danger');
            console.error('Error al registrar cooperativa:', error);
        }
    });

    // Inicializar estado del Wizard
    updateWizardUI();
});
