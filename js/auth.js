// Shared authentication functions
function checkAuth() {
  if (!sessionStorage.getItem('userId')) {
    window.location.href = 'logi.html';
  }
}

function logout() {
  sessionStorage.clear();
  window.location.href = 'logi.html';
}

// Initialize auth check on pages that need it
if (document.getElementById('logoutBtn')) {
  document.getElementById('logoutBtn').addEventListener('click', logout);
}

// Load user data where needed
if (document.getElementById('userIdDisplay')) {
  const userId = sessionStorage.getItem('userId') || 'Guest';
  document.getElementById('userIdDisplay').textContent = userId;
}