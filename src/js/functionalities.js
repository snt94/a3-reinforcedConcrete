const themeBtn = document.getElementById('themeToggleBtn');
const body = document.body;

themeBtn.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    body.classList.toggle('light-mode');
    themeBtn.textContent = body.classList.contains('dark-mode') ? '☀️ Modo Claro' : '🌙 Modo Escuro';
});