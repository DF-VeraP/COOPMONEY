import { initSimulator } from './controllers/simulator.controller.js';

document.addEventListener('DOMContentLoaded', () => {
  // Inicializar simulador
  initSimulator();

  // Actualizar año dinámico en el footer
  const yearElement = document.getElementById('current-year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // Lógica Off-canvas (Login Sidebar)
  const loginSidebar = document.getElementById('loginSidebar');
  const loginOverlay = document.getElementById('loginOverlay');
  const btnCloseLogin = document.getElementById('btnCloseLogin');

  function openLogin() {
    loginSidebar.classList.add('open');
    loginOverlay.classList.add('open');
    document.body.style.overflow = 'hidden'; // Evitar scroll del fondo
  }

  function closeLogin() {
    loginSidebar.classList.remove('open');
    loginOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Bindear eventos a los botones de login
  const loginBtns = document.querySelectorAll('.action-login');
  loginBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openLogin();
    });
  });

  if (btnCloseLogin) btnCloseLogin.addEventListener('click', closeLogin);
  if (loginOverlay) loginOverlay.addEventListener('click', closeLogin);

  const registerBtns = document.querySelectorAll('.action-register');
  registerBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Mock: Abriendo formulario de solicitud de afiliación a cooperativa...');
    });
  });
});
