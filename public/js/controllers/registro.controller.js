document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registroForm');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const alertBox = document.getElementById('formAlert');
    const nitInput = document.getElementById('nit');
    const telCoopInput = document.getElementById('telCoop');
    
    // Validaciones Regex
    const nitRegex = /^[0-9]{8,10}-[0-9]$/; // Ej: 900123456-1 o 900.123.456-1 (si se limpian puntos)

    // Formateador simple de NIT al perder el foco
    nitInput.addEventListener('blur', (e) => {
        let val = e.target.value.replace(/\s/g, '');
        // Si no tiene guión pero tiene la longitud adecuada, intentar ponerlo
        if(val.length >= 9 && !val.includes('-')) {
            val = val.slice(0, -1) + '-' + val.slice(-1);
        }
        e.target.value = val;
        
        // Remover puntos para validación interna
        const cleanNit = val.replace(/\./g, '');
        if(!nitRegex.test(cleanNit) && val !== '') {
            nitInput.parentElement.classList.add('has-error');
        } else {
            nitInput.parentElement.classList.remove('has-error');
        }
    });

    telCoopInput.addEventListener('blur', (e) => {
        const val = e.target.value.replace(/\D/g, '');
        if(val.length > 0 && val.length < 10) {
            telCoopInput.parentElement.classList.add('has-error');
        } else {
            telCoopInput.parentElement.classList.remove('has-error');
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Limpiar alertas
        alertBox.className = 'alert';
        alertBox.textContent = '';

        // Verificar errores visuales
        if(document.querySelectorAll('.has-error').length > 0) {
            alertBox.textContent = 'Por favor corrige los errores resaltados en rojo antes de enviar.';
            alertBox.classList.add('show', 'alert-danger');
            return;
        }

        // Recopilar Líneas de Crédito
        const lineasCheckboxes = document.querySelectorAll('input[name="linea"]:checked');
        const lineasArray = Array.from(lineasCheckboxes).map(cb => cb.value);

        // Recopilar Migración
        const migracionRadio = document.querySelector('input[name="migracion"]:checked');
        
        const payload = {
            nit_cooperativa: document.getElementById('nit').value.replace(/\./g, ''),
            nombre_cooperativa: document.getElementById('nombreCoop').value,
            correo_cooperativa: document.getElementById('correoCoop').value,
            telefono_cooperativa: document.getElementById('telCoop').value,
            direccion_cooperativa: document.getElementById('dirCoop').value,
            sitio_web: document.getElementById('webCoop').value || '',
            
            nombre_representante: document.getElementById('nombreRep').value,
            cedula_representante: document.getElementById('cedulaRep').value,
            cargo_representante: document.getElementById('cargoRep').value,
            telefono_representante: document.getElementById('telRep').value,
            correo_representante: document.getElementById('correoRep').value,
            contrasena_admin: document.getElementById('passAdmin').value,
            
            lineas_credito: lineasArray.join(', '),
            cantidad_socios: document.getElementById('cantSocios').value,
            necesita_migracion: migracionRadio ? migracionRadio.value === 'true' : false
        };

        // Mostrar loading
        loadingOverlay.classList.add('active');

        try {
            const response = await fetch('/api/cooperativas/solicitud', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            // Simular un poco de latencia extra para que se vea el loading
            setTimeout(() => {
                loadingOverlay.classList.remove('active');

                if (!response.ok) {
                    alertBox.textContent = data.error || 'Ocurrió un error al enviar la solicitud.';
                    alertBox.classList.add('show', 'alert-danger');
                    return;
                }

                // Éxito
                form.style.display = 'none';
                const successDiv = document.createElement('div');
                successDiv.style.textAlign = 'center';
                successDiv.style.padding = '40px 20px';
                successDiv.innerHTML = `
                    <svg style="color: var(--color-success); width: 80px; height: 80px; margin-bottom: 20px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    <h2 style="color: var(--color-text-main); margin-bottom: 10px;">¡Solicitud enviada con éxito!</h2>
                    <p style="color: var(--color-text-muted); line-height: 1.5; font-size: 1.1rem;">
                        El Super Administrador revisará tu información. Una vez aprobada, te contactaremos al correo institucional y podrás acceder con el usuario: <strong>${payload.correo_representante}</strong>
                    </p>
                    <a href="index.html" class="btn btn-primary" style="margin-top: 30px; display: inline-block;">Volver al inicio</a>
                `;
                document.querySelector('.registro-container').appendChild(successDiv);
                document.querySelector('.progress-container').style.display = 'none';
                document.querySelector('.info-box').style.display = 'none';

            }, 1000);

        } catch (error) {
            loadingOverlay.classList.remove('active');
            alertBox.textContent = 'Error de conexión con el servidor.';
            alertBox.classList.add('show', 'alert-danger');
            console.error(error);
        }
    });
});
