// Main page functionality
document.addEventListener('DOMContentLoaded', () => {
  // Initialize user display
  const userId = sessionStorage.getItem('userId') || 'Guest';
  const userEmail = sessionStorage.getItem('userEmail') || 'user@example.com';
  
  document.getElementById('userIdDisplay').textContent = userId;
  document.getElementById('usernameDisplay').textContent = userId;
  document.getElementById('userInitial').textContent = userId.charAt(0).toUpperCase();
  
  // Device ID handling
  const urlParams = new URLSearchParams(window.location.search);
  const deviceParam = urlParams.get('device');
  const sessionDevice = sessionStorage.getItem('authDeviceId');
  const deviceId = deviceParam || sessionDevice || 'Unknown';
  document.getElementById('deviceIdDisplay').textContent = deviceId;

  // Last login time
  const lastLogin = sessionStorage.getItem('lastLogin') || new Date().toLocaleString();
  document.getElementById('lastLoginDisplay').textContent = lastLogin;
  sessionStorage.setItem('lastLogin', new Date().toLocaleString());

  // App menu functionality
  const appMenuBtn = document.getElementById('appMenuBtn');
  const appMenuDropdown = document.getElementById('appMenuDropdown');

  appMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    appMenuDropdown.style.display = appMenuDropdown.style.display === 'block' ? 'none' : 'block';
  });

  document.addEventListener('click', () => {
    appMenuDropdown.style.display = 'none';
  });

  // Refresh button
  document.getElementById('refreshBtn').addEventListener('click', () => {
    window.location.reload();
  });
});

