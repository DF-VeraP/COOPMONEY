document.addEventListener('DOMContentLoaded', () => {
  const coopInput = document.getElementById('cooperativa');
  const suggestionsBox = document.getElementById('cooperativas-suggestions');
  const btnClear = document.getElementById('btn-clear-coop');
  const loginForm = document.getElementById('login-form');
  const alertBox = document.getElementById('login-alert');
  const togglePassword = document.getElementById('toggle-password');
  const passwordInput = document.getElementById('password');

  let cooperativasData = [];

  // 1. Cargar cooperativas activas desde el backend
  fetch('/api/cooperativas/activas')
    .then(response => {
      if (!response.ok) throw new Error('Error en la red');
      return response.json();
    })
    .then(data => {
      if (Array.isArray(data)) {
        cooperativasData = data;
      } else {
        cooperativasData = [];
      }
    })
    .catch(err => {
      console.error("Error cargando cooperativas:", err);
      cooperativasData = [];
    });

  // 2. Manejo del input de cooperativa (Autocompletado Custom y Botón Limpiar)
  coopInput.addEventListener('input', (e) => {
    const val = e.target.value.trim().toLowerCase();
    
    // Controlar botón limpiar
    btnClear.style.display = val !== '' ? 'block' : 'none';

    // Limpiar sugerencias anteriores
    suggestionsBox.innerHTML = '';

    if (!val) {
      suggestionsBox.classList.remove('show');
      return;
    }

    // Filtrar cooperativas
    const filtradas = cooperativasData.filter(coop => 
      coop.display.toLowerCase().includes(val)
    );

    if (filtradas.length > 0) {
      filtradas.forEach(coop => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.textContent = coop.display;
        
        // Al hacer clic en una sugerencia
        div.addEventListener('click', () => {
          coopInput.value = coop.display;
          suggestionsBox.classList.remove('show');
          btnClear.style.display = 'block';
        });

        suggestionsBox.appendChild(div);
      });
      suggestionsBox.classList.add('show');
    } else {
      suggestionsBox.classList.remove('show');
    }
  });

  // Cerrar sugerencias si se hace clic afuera
  document.addEventListener('click', (e) => {
    if (e.target !== coopInput && e.target !== suggestionsBox) {
      suggestionsBox.classList.remove('show');
    }
  });

  // Botón Limpiar
  btnClear.addEventListener('click', () => {
    coopInput.value = '';
    btnClear.style.display = 'none';
    suggestionsBox.classList.remove('show');
    coopInput.focus();
  });

  // 3. Mostrar/Ocultar contraseña
  togglePassword.addEventListener('change', (e) => {
    passwordInput.type = e.target.checked ? 'text' : 'password';
  });

  // 4. Enviar formulario y validar reglas
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Ocultar alerta anterior
    alertBox.className = 'alert';
    alertBox.textContent = '';

    const cooperativaId = coopInput.value;
    const usuario = document.getElementById('usuario').value;
    const password = passwordInput.value;

    fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ cooperativaId, usuario, password })
    })
    .then(async response => {
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error de conexión');
      }
      return data;
    })
    .then(data => {
      // Éxito
      const userToStore = { ...data.user, token: data.token };
      localStorage.setItem('currentUser', JSON.stringify(userToStore));
      sessionStorage.setItem('currentUser', JSON.stringify(userToStore));
      alertBox.textContent = data.message;
      alertBox.classList.add('show', 'alert-success');
      
      setTimeout(() => {
        if (data.user.rol === 'super_admin') {
          window.location.replace('dashboard-superadmin.html');
        } else if (data.user.rol === 'admin_local') {
          window.location.replace('dashboard-adminlocal.html');
        } else if (data.user.rol === 'gerente') {
          window.location.replace('dashboard-gerente.html');
        } else if (data.user.rol === 'analista') {
          window.location.replace('dashboard-analista.html');
        } else if (data.user.rol === 'cajero') {
          window.location.replace('dashboard-cajero.html');
        } else if (data.user.rol === 'gestor_financiero') {
          window.location.replace('dashboard-gestor.html');
        } else if (data.user.rol === 'socio') {
          window.location.replace('dashboard-socio.html');
        } else {
          alert(`Redirigiendo al panel de: ${data.user.rol}`);
        }
      }, 1500);
    })
    .catch(err => {
      // Error
      alertBox.textContent = err.message;
      alertBox.classList.add('show', 'alert-danger');
    });
  });
});
