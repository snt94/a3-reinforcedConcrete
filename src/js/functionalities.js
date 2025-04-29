document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('themeToggleBtn');
    
    btn.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      document.body.classList.toggle('light-mode');
    });
  });