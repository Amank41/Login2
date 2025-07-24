// ======================
// AUTHENTICATION MODULE
// ======================

class AuthSystem {
  constructor() {
    this.initElements();
    this.initEventListeners();
    this.checkSavedTheme();
    this.initDeviceId();
  }

  // DOM Elements
  initElements() {
    this.elements = {
      form: document.getElementById('loginForm'),
      resultDiv: document.getElementById('result'),
      togglePassword: document.querySelector('.toggle-password'),
      passwordInput: document.getElementById('password'),
      userIdInput: document.getElementById('userId'),
      deviceIdBtn: document.getElementById('deviceIdBtn'),
      deviceIdDisplay: document.getElementById('deviceIdDisplay'),
      fingerprintBtn: document.getElementById('fingerprintBtn'),
      themeToggleBtn: document.getElementById('themeToggleBtn'),
      chatWidget: document.querySelector('.chat-widget')
    };
  }

  // Event Listeners
  initEventListeners() {
    this.elements.themeToggleBtn.addEventListener('click', () => this.toggleTheme());
    this.elements.togglePassword.addEventListener('click', () => this.togglePasswordVisibility());
    this.elements.deviceIdBtn.addEventListener('click', () => this.copyDeviceId());
    this.elements.fingerprintBtn.addEventListener('click', () => this.handleBiometricAuth());
    this.elements.form.addEventListener('submit', (e) => this.handleLogin(e));
    
    // Initialize chat if exists
    if (this.elements.chatWidget) {
      this.initChatSystem();
    }
  }

  // =================
  // THEME MANAGEMENT
  // =================
  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  }

  checkSavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }

  // =====================
  // PASSWORD VISIBILITY
  // =====================
  togglePasswordVisibility() {
    const { passwordInput, togglePassword } = this.elements;
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    
    passwordInput.setAttribute('type', type);
    togglePassword.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
  }

  // =================
  // DEVICE MANAGEMENT
  // =================
  async initDeviceId() {
    try {
      const deviceId = await this.getDeviceId();
      this.elements.deviceIdDisplay.textContent = deviceId;
    } catch (error) {
      console.error('Device ID initialization failed:', error);
    }
  }

  async getDeviceId() {
    const storedId = localStorage.getItem('deviceId');
    if (storedId) return storedId;

    try {
      const array = new Uint32Array(2);
      crypto.getRandomValues(array);
      
      let deviceId = `dev_${array[0].toString(36)}_${
        array[1].toString(36).slice(-4)}_${
        Date.now().toString(36)}_${
        navigator.hardwareConcurrency || 'x'}c_${
        (navigator.platform || 'web').slice(0, 3).toLowerCase()}`;
      
      deviceId = deviceId.replace(/\s+/g, '').toLowerCase();
      localStorage.setItem('deviceId', deviceId);
      return deviceId;
    } catch (e) {
      console.error('Secure Device ID generation failed:', e);
      return this.generateFallbackId();
    }
  }

  generateFallbackId() {
    const fallbackId = 'dev_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
    localStorage.setItem('deviceId', fallbackId);
    return fallbackId;
  }

  async copyDeviceId() {
    try {
      const deviceId = await this.getDeviceId();
      await navigator.clipboard.writeText(deviceId);
      this.showMessage('✓ Device ID copied', 'success');
    } catch (error) {
      this.fallbackCopyDeviceId();
    }
  }

  fallbackCopyDeviceId() {
    const { deviceIdDisplay } = this.elements;
    const textarea = document.createElement('textarea');
    textarea.value = deviceIdDisplay.textContent;
    textarea.style.position = 'fixed';
    
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
      document.execCommand('copy');
      this.showMessage('✓ Device ID copied (fallback)', 'success');
    } catch (err) {
      this.showMessage('✗ Copy failed. Please copy manually.', 'error');
    } finally {
      document.body.removeChild(textarea);
    }
  }

  // ================
  // AUTHENTICATION
  // ================
  async handleLogin(e) {
    e.preventDefault();
    const { userIdInput, passwordInput } = this.elements;
    const userId = userIdInput.value.trim();
    const password = passwordInput.value;

    if (!userId || !password) {
      this.showMessage('✗ Please enter both User ID and Password', 'error');
      return;
    }

    this.showLoading('⏳ Authenticating...');
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try {
      const deviceId = await this.getDeviceId();
      const isValid = await this.validateCredentials(userId, password);
      
      if (isValid) {
        this.loginSuccess(userId, deviceId);
      } else {
        this.loginFailed();
      }
    } catch (error) {
      this.showMessage('✗ Authentication error', 'error');
      console.error('Login error:', error);
    }
  }

  async validateCredentials(userId, password) {
    // In a real app, this would be an API call to your backend
    const validCredentials = {
      'Aman112': 'p123',
      'Aman11': 'Aman12',
      '5jdg45': 'test789',
      'Adsv30': 'welcome1',
      'Akdh4': 'demo2023'
    };
    
    return validCredentials[userId] === password;
  }

  loginSuccess(userId, deviceId) {
    sessionStorage.setItem('authDeviceId', deviceId);
    sessionStorage.setItem('userId', userId);
    
    this.showMessage('✓ Login successful! Redirecting...', 'success');
    
    setTimeout(() => {
      window.location.href = `main-app.html?device=${encodeURIComponent(deviceId)}`;
    }, 1200);
  }

  loginFailed() {
    const { passwordInput, form } = this.elements;
    
    this.showMessage('✗ Invalid User ID or Password', 'error');
    passwordInput.value = '';
    passwordInput.focus();
    
    form.classList.add('shake');
    setTimeout(() => form.classList.remove('shake'), 500);
  }

  // ===================
  // BIOMETRIC AUTH
  // ===================
  async handleBiometricAuth() {
    if (!window.PublicKeyCredential) {
      this.showMessage('✗ Biometric authentication not supported', 'error');
      return;
    }

    try {
      const credential = await this.createBiometricCredential();
      
      if (credential) {
        this.showMessage('✓ Biometric login successful!', 'success');
        
        setTimeout(() => {
          window.location.href = 'main-app.html?device=webauthn';
        }, 1200);
      }
    } catch (error) {
      this.showMessage(`✗ Biometric error: ${error.message}`, 'error');
      console.error('Biometric auth error:', error);
    }
  }

  async createBiometricCredential() {
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    const publicKey = {
      challenge,
      rp: { name: "Secure App" },
      user: {
        id: Uint8Array.from("secure-user-id", c => c.charCodeAt(0)),
        name: "user@secureapp.com",
        displayName: "Secure User"
      },
      pubKeyCredParams: [{ type: "public-key", alg: -7 }],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "preferred"
      },
      timeout: 60000,
      attestation: "none"
    };

    return await navigator.credentials.create({ publicKey });
  }

  // =============
  // UI UTILITIES
  // =============
  showMessage(message, type) {
    const { resultDiv } = this.elements;
    resultDiv.innerHTML = `<div class="${type}">${message}</div>`;
    resultDiv.style.display = 'block';
  }

  showLoading(message) {
    const { resultDiv } = this.elements;
    resultDiv.innerHTML = `<div class="loading">${message}</div>`;
    resultDiv.style.display = 'block';
  }

  // =============
  // CHAT SYSTEM
  // =============
  initChatSystem() {
    const chat = {
      toggle: document.querySelector('.chat-to2'),
      widget: document.querySelector('.chat-widget'),
      close: document.querySelector('.chat-close'),
      body: document.querySelector('.chat-body'),
      input: document.querySelector('.chat-in2'),
      sendBtn: document.querySelector('.send-b2'),
      isOpen: false,
      isTyping: false,
      responses: [
        "Hello! How can I help?",
        "Please hold while I check...",
        "Thanks for your message!",
        "I'll forward this to our team",
        "Can you explain more?",
        "Have you checked our help docs?"
      ]
    };

    chat.toggle.addEventListener('click', () => this.toggleChat(chat));
    chat.close.addEventListener('click', () => this.toggleChat(chat));
    chat.sendBtn.addEventListener('click', () => this.sendChatMessage(chat));
    chat.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendChatMessage(chat);
    });

    // Auto-open after delay
    setTimeout(() => {
      if (!chat.isOpen) {
        this.toggleChat(chat);
        setTimeout(() => {
          this.addBotMessage(chat, "Need help? Ask me anything!");
        }, 1000);
      }
    }, 30000);
  }

  toggleChat(chat) {
    chat.isOpen = !chat.isOpen;
    chat.widget.classList.toggle('active', chat.isOpen);

    if (chat.isOpen && chat.body.children.length === 0) {
      this.addBotMessage(chat, "Welcome! How can I assist you?");
    }

    if (chat.isOpen) chat.input.focus();
  }

  sendChatMessage(chat) {
    const text = chat.input.value.trim();
    if (!text) return;

    this.addUserMessage(chat, text);
    chat.input.value = '';
    this.showTypingIndicator(chat);

    setTimeout(() => {
      this.hideTypingIndicator(chat);
      const randomResponse = chat.responses[Math.floor(Math.random() * chat.responses.length)];
      this.addBotMessage(chat, randomResponse);
    }, 1500 + Math.random() * 1500);
  }

  addUserMessage(chat, text) {
    const message = document.createElement('div');
    message.className = 'message user-message';
    message.innerHTML = `${text}<span class="message-time">${this.getCurrentTime()}</span>`;
    chat.body.appendChild(message);
    this.scrollChatToBottom(chat);
  }

  addBotMessage(chat, text) {
    const message = document.createElement('div');
    message.className = 'message agent-message';
    message.innerHTML = `${text}<span class="message-time">${this.getCurrentTime()}</span>`;
    chat.body.appendChild(message);
    this.scrollChatToBottom(chat);
  }

  showTypingIndicator(chat) {
    if (chat.isTyping) return;
    chat.isTyping = true;

    const typing = document.createElement('div');
    typing.className = 'typing-indicator';
    typing.innerHTML = `
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    `;
    chat.body.appendChild(typing);
    this.scrollChatToBottom(chat);
  }

  hideTypingIndicator(chat) {
    const typing = chat.body.querySelector('.typing-indicator');
    if (typing) typing.remove();
    chat.isTyping = false;
  }

  scrollChatToBottom(chat) {
    chat.body.scrollTop = chat.body.scrollHeight;
  }

  getCurrentTime() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}

// Initialize the auth system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new AuthSystem();
});