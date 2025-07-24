// Shared theme management
function initTheme() {
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
  }
  
  if (document.getElementById('themeToggleBtn')) {
    document.getElementById('themeToggleBtn').addEventListener('click', toggleTheme);
  }
}

function toggleTheme() {
  document.body.classList.toggle('dark');
  const theme = document.body.classList.contains('dark') ? 'dark' : 'light';
  localStorage.setItem('theme', theme);
}

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', initTheme);

