/**
 * AM VIP Authentication System (Passwordless)
 * Includes: Login, Device ID, Biometric Auth, Theme Toggle, Chat Widget
 */

class AuthSystem {
  constructor() {
    this.validUsers = ['VIP299', 'A8652', '7DHSK'];
    this.initElements();
    this.initEventListeners();
    this.checkSavedTheme();
    this.initDeviceId();
  }

  // 🧱 Get elements
  initElements() {
    this.elements = {
      form: document.getElementById('loginForm'),
      usernameInput: document.getElementById('username'),
      resultDiv: document.getElementById('result'),
      deviceIdBtn: document.getElementById('deviceIdBtn'),
      deviceIdDisplay: document.getElementById('deviceIdDisplay'),
      themeToggleBtn: document.getElementById('themeToggleBtn'),
      chatToggle: document.getElementById('chatToggle'),
      chatWidget: document.getElementById('chatWidget'),
      closeChat: document.getElementById('closeChat'),
      chatInput: document.getElementById('chatInput'),
      sendMsgBtn: document.getElementById('sendMsg'),
      chatMessages: document.getElementById('chatMessages'),
      fingerprintBox: document.querySelector('.fingerprintBox')
    };
  }

  // ⚙️ Add all listeners
  initEventListeners() {
    const el = this.elements;

    el.form.addEventListener('submit', e => this.handleLogin(e));
    el.deviceIdBtn.addEventListener('click', () => this.copyDeviceId());
    el.themeToggleBtn.addEventListener('click', () => this.toggleTheme());

    // Chat events
    el.chatToggle.addEventListener('click', () => el.chatWidget.classList.toggle('hidden'));
    el.closeChat.addEventListener('click', () => el.chatWidget.classList.add('hidden'));
    el.sendMsgBtn.addEventListener('click', () => this.sendChatMessage());
    el.chatInput.addEventListener('keypress', e => {
      if (e.key === 'Enter') this.sendChatMessage();
    });

    // Biometric mock
    if (el.fingerprintBox) {
      el.fingerprintBox.addEventListener('click', () => this.handleBiometricLogin());
    }

    // Auto-open chat after 30 seconds
    setTimeout(() => {
      if (el.chatWidget.classList.contains('hidden')) {
        el.chatWidget.classList.remove('hidden');
        this.addChatMessage("👋 Need help? I'm here!", 'bot');
      }
    }, 30000);
  }

  // 🔐 Handle login
  async handleLogin(e) {
    e.preventDefault();
    const username = this.elements.usernameInput.value.trim();

    if (!username) {
      this.showMessage('✗ Please enter your username', 'error');
      return;
    }

    this.showLoading('⏳ Authenticating...');
    await new Promise(resolve => setTimeout(resolve, 800));

    if (this.validUsers.includes(username)) {
      const deviceId = await this.getDeviceId();
      this.loginSuccess(username, deviceId);
    } else {
      this.loginFailed();
    }
  }

  // ✅ Login success
  loginSuccess(userId, deviceId) {
    sessionStorage.setItem('authDeviceId', deviceId);
    sessionStorage.setItem('userId', userId);
    this.showMessage('✓ Login successful! Redirecting...', 'success');

    setTimeout(() => {
      window.location.href = `main-app.html?device=${encodeURIComponent(deviceId)}`;
    }, 1200);
  }

  // ❌ Login failed
  loginFailed() {
    this.showMessage('✗ Invalid username', 'error');
  }

  // 🧾 Show feedback message
  showMessage(msg, type) {
    const result = this.elements.resultDiv;
    result.textContent = msg;
    result.style.color = type === 'success' ? 'green' : 'red';
  }

  // ⏳ Show loading
  showLoading(msg) {
    const result = this.elements.resultDiv;
    result.textContent = msg;
    result.style.color = '#888';
  }

  // 📋 Generate + copy device ID
  async getDeviceId() {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      const raw = `${navigator.userAgent}-${navigator.language}-${screen.width}x${screen.height}-${Intl.DateTimeFormat().resolvedOptions().timeZone}`;
      deviceId = 'AM-' + Math.abs(this.hashString(raw));
      localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
  }

  copyDeviceId() {
    this.getDeviceId().then(deviceId => {
      navigator.clipboard.writeText(deviceId).then(() => {
        this.showMessage(`📋 Device ID Copied: ${deviceId}`, 'success');
      }).catch(() => {
        this.showMessage('❌ Failed to copy Device ID', 'error');
      });
    });
  }

  initDeviceId() {
    this.getDeviceId().then(deviceId => {
      this.elements.deviceIdDisplay.textContent = `Device ID: ${deviceId}`;
    });
  }

  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }

  // 🌙 Theme toggle
  checkSavedTheme() {
    const saved = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
  }

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  }

  // 🔐 Biometric login (mock or WebAuthn)
  async handleBiometricLogin() {
    this.showLoading('🔒 Waiting for biometric...');
    try {
      if (window.PublicKeyCredential) {
        await navigator.credentials.get({
          publicKey: {
            challenge: new Uint8Array(32),
            timeout: 60000,
            userVerification: 'required'
          }
        });
        this.loginSuccess('BiometricUser', await this.getDeviceId());
      } else {
        throw new Error("Biometric not supported.");
      }
    } catch (e) {
      this.showMessage('✗ Biometric login failed', 'error');
    }
  }

  // 💬 Chat system
  sendChatMessage() {
    const input = this.elements.chatInput;
    const message = input.value.trim();
    if (!message) return;

    this.addChatMessage(message, 'user');
    input.value = '';

    const replies = [
      "Let me check that for you.",
      "Thanks for reaching out!",
      "Please wait a moment.",
      "I’ll get back to you shortly.",
      "Could you clarify that?",
      "You’re awesome for asking!"
    ];

    setTimeout(() => {
      const reply = replies[Math.floor(Math.random() * replies.length)];
      this.addChatMessage(reply, 'bot');
    }, 1200);
  }

  addChatMessage(text, sender = 'bot') {
    const msg = document.createElement('div');
    msg.className = `msg ${sender}`;
    msg.textContent = text;
    this.elements.chatMessages.appendChild(msg);
    this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
  }
}

// 🚀 Initialize on load
document.addEventListener('DOMContentLoaded', () => new AuthSystem());
