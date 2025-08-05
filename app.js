/**
 * AM VIP Authentication System
 * Enhanced with security features and better UX
 */

// DOM Elements with null checks
const getElement = (id) => document.getElementById(id) || console.error(`Element ${id} not found`);

const elements = {
  themeToggleBtn: getElement('themeToggleBtn'),
  deviceIdBtn: getElement('deviceIdBtn'),
  deviceIdModal: getElement('deviceIdModal'),
  deviceIdDisplay: getElement('deviceIdDisplay'),
  copyDeviceIdBtn: getElement('copyDeviceId'),
  closeModal: document.querySelector('.close-modal'),
  chatToggle: getElement('chatToggle'),
  chatWidget: getElement('chatWidget'),
  closeChat: getElement('closeChat'),
  chatInput: getElement('chatInput'),
  chatMessages: getElement('chatMessages'),
  sendMsg: getElement('sendMsg'),
  loading: getElement('loading'),
  result: getElement('result'),
  loginForm: getElement('loginForm'),
  userKeyInput: getElement('user-key'),
  forgotPassword: getElement('forgotPassword'),
  giftCode: getElement('giftCode')
};

// Configuration with encrypted keys (basic example)
const config = {
  deviceIdRange: 20,
  keyMapping: {
    20: "Aman", 1: "T93r2", 2: "A3f9k0", 3: "U7y7a0", 4: "QU8i9", 
    5: "5n6M8", 6: "Ls0", 7: "Hx2C34", 8: "P7R9e8", 9: "NZ4l3", 
    10: "L9kh6", 11: "6W5hg2", 12: null, 13: null, 14: "4i1O0p9", 
    15: "G0N1o2", 16: "M9n3a2", 17: "I65fq6", 18: "K1l2J8", 19: "O4R3e2", 
    0: "S0a1Dk7"
  },
  redirectDelay: 1000,
  verificationDelay: 1500,
  maxLoginAttempts: 5,
  lockoutTime: 30000,
  securityQuestions: [
    "What was your first pet's name?",
    "What city were you born in?",
    "What is your mother's maiden name?"
  ]
};

// State management
const state = {
  loginAttempts: 0,
  isLockedOut: false,
  currentTheme: localStorage.getItem('theme') || 'dark',
  deviceId: null,
  chatHistory: [],
  security: {
    lastAttempt: null,
    failedAttempts: 0
  }
};

// Utility functions
const utils = {
  showElement: (el, show = true) => el && (el.style.display = show ? 'block' : 'none'),
  addClass: (el, className) => el && el.classList.add(className),
  removeClass: (el, className) => el && el.classList.remove(className),
  encrypt: (text) => btoa(encodeURIComponent(text)), // Basic encryption for demo
  decrypt: (text) => decodeURIComponent(atob(text)),
  throttle: (func, limit) => {
    let lastFunc;
    let lastRan;
    return function() {
      const context = this;
      const args = arguments;
      if (!lastRan) {
        func.apply(context, args);
        lastRan = Date.now();
      } else {
        clearTimeout(lastFunc);
        lastFunc = setTimeout(() => {
          if ((Date.now() - lastRan) >= limit) {
            func.apply(context, args);
            lastRan = Date.now();
          }
        }, limit - (Date.now() - lastRan));
      }
    }
  }
};

// Theme Management
function initTheme() {
  if (!elements.themeToggleBtn) return;
  
  document.documentElement.setAttribute('data-theme', state.currentTheme);
  
  elements.themeToggleBtn.addEventListener('click', () => {
    state.currentTheme = state.currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', state.currentTheme);
    localStorage.setItem('theme', state.currentTheme);
    updateThemeButton();
  });
  
  updateThemeButton();
}

function updateThemeButton() {
  if (elements.themeToggleBtn) {
    elements.themeToggleBtn.innerHTML = state.currentTheme === 'dark' ? 
      '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
  }
}

// Device ID Management
function initDeviceId() {
  state.deviceId = localStorage.getItem('deviceId') || generateDeviceId();
  localStorage.setItem('deviceId', state.deviceId);
  return state.deviceId;
}

function generateDeviceId() {
  return Math.floor(Math.random() * (config.deviceIdRange + 1)).toString();
}

function setupDeviceIdModal() {
  if (!elements.deviceIdBtn || !elements.deviceIdModal) return;

  elements.deviceIdBtn.addEventListener('click', () => {
    if (state.isLockedOut) {
      showResult(`Please wait ${Math.ceil((config.lockoutTime - (Date.now() - state.security.lastAttempt)) / 1000)} seconds`, 'error');
      return;
    }
    elements.deviceIdDisplay.textContent = state.deviceId;
    elements.deviceIdModal.classList.add('visible');
  });

  elements.copyDeviceIdBtn?.addEventListener('click', utils.throttle(copyDeviceIdToClipboard, 2000));
  elements.closeModal?.addEventListener('click', closeDeviceIdModal);

  window.addEventListener('click', (e) => {
    if (e.target === elements.deviceIdModal) {
      closeDeviceIdModal();
    }
  });
}

async function copyDeviceIdToClipboard() {
  try {
    await navigator.clipboard.writeText(state.deviceId);
    showFeedback(elements.copyDeviceIdBtn, 'Copied!', 'success');
  } catch (err) {
    console.error('Copy failed:', err);
    showFeedback(elements.copyDeviceIdBtn, 'Failed', 'error');
  }
}

function closeDeviceIdModal() {
  elements.deviceIdModal.classList.remove('visible');
}

function showFeedback(element, message, type = '') {
  if (!element) return;
  
  const originalText = element.textContent;
  element.textContent = message;
  utils.removeClass(element, 'success error');
  if (type) utils.addClass(element, type);
  
  setTimeout(() => {
    element.textContent = originalText;
    utils.removeClass(element, 'success error');
  }, 2000);
}

// Authentication System
function initKeyVerification() {
  if (!elements.loginForm) return;

  elements.loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleLogin();
  });

  // Rate limiting for form submission
  elements.loginForm.addEventListener('submit', utils.throttle(handleLogin, 2000));
}

function handleLogin() {
  if (state.isLockedOut) {
    const remainingTime = Math.ceil((config.lockoutTime - (Date.now() - state.security.lastAttempt)) / 1000);
    showResult(`Too many attempts. Please wait ${remainingTime} seconds.`, 'error');
    return;
  }

  const userKey = elements.userKeyInput?.value.trim();
  
  if (!userKey) {
    showResult('Please enter an access key', 'error');
    return;
  }

  verifyKey(userKey);
}

function verifyKey(userKey) {
  showLoading(true);
  showResult('Verifying...', 'loading');

  // Simulate server verification delay
  setTimeout(() => {
    showLoading(false);
    
    if (verifyAccessKey(state.deviceId, userKey)) {
      handleSuccessfulVerification();
    } else {
      handleFailedVerification();
    }
  }, config.verificationDelay);
}

function verifyAccessKey(deviceId, key) {
  const correctKey = config.keyMapping[deviceId];
  return correctKey && correctKey === key;
}

function handleSuccessfulVerification() {
  state.loginAttempts = 0;
  state.security.failedAttempts = 0;
  showResult('Access granted! Redirecting...', 'success');
  utils.addClass(elements.result, 'pulse');
  
  setTimeout(() => {
    window.location.href = 'dashboard.html';
  }, config.redirectDelay);
}

function handleFailedVerification() {
  state.loginAttempts++;
  state.security.failedAttempts++;
  state.security.lastAttempt = Date.now();
  
  if (state.security.failedAttempts >= config.maxLoginAttempts) {
    state.isLockedOut = true;
    const lockoutDuration = config.lockoutTime / 1000;
    showResult(`Too many attempts. Account locked for ${lockoutDuration} seconds.`, 'error');
    
    setTimeout(() => {
      state.isLockedOut = false;
      state.security.failedAttempts = 0;
      showResult('Account unlocked. Please try again.', 'info');
    }, config.lockoutTime);
  } else {
    const remainingAttempts = config.maxLoginAttempts - state.security.failedAttempts;
    showResult(`Invalid key. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.`, 'error');
    utils.addClass(elements.userKeyInput, 'shake');
    setTimeout(() => utils.removeClass(elements.userKeyInput, 'shake'), 500);
  }
}

// Chat System
function initChat() {
  if (!elements.chatToggle || !elements.chatWidget) return;

  elements.chatToggle.addEventListener('click', toggleChat);
  elements.closeChat?.addEventListener('click', closeChat);
  elements.sendMsg?.addEventListener('click', sendMessage);
  elements.chatInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  // Initial greeting
  setTimeout(() => {
    addChatMessage('Support', 'Hello! How can we help you today?');
  }, 1500);
}

function toggleChat() {
  elements.chatWidget.classList.toggle('active');
  if (elements.chatWidget.classList.contains('active')) {
    elements.chatInput.focus();
  }
}

function closeChat() {
  elements.chatWidget.classList.remove('active');
}

function sendMessage() {
  const message = elements.chatInput.value.trim();
  if (!message) return;

  addChatMessage('You', message);
  state.chatHistory.push({ sender: 'user', message, timestamp: new Date() });
  elements.chatInput.value = '';
  
  // Simulate intelligent response
  setTimeout(() => generateResponse(message), 1000 + Math.random() * 2000);
}

function generateResponse(userMessage) {
  const responses = {
    greeting: ["Hello!", "Hi there!", "Welcome back!"],
    help: ["How can I assist you?", "What do you need help with?", "I'm here to help."],
    default: ["I understand.", "Thanks for sharing.", "Let me check on that."]
  };

  let response;
  
  if (/hello|hi|hey/i.test(userMessage)) {
    response = responses.greeting[Math.floor(Math.random() * responses.greeting.length)];
  } else if (/help|support|problem/i.test(userMessage)) {
    response = responses.help[Math.floor(Math.random() * responses.help.length)];
  } else {
    response = responses.default[Math.floor(Math.random() * responses.default.length)];
  }

  addChatMessage('Support', response);
  state.chatHistory.push({ sender: 'support', message: response, timestamp: new Date() });
}

function addChatMessage(sender, message) {
  if (!elements.chatMessages) return;
  
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('msg', sender.toLowerCase());
  messageDiv.innerHTML = `<strong>${sender}:</strong> ${message}`;
  elements.chatMessages.appendChild(messageDiv);
  elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

// UI Helpers
function showLoading(show) {
  utils.showElement(elements.loading, show);
}

function showResult(message, type = '') {
  if (!elements.result) return;
  
  elements.result.textContent = message;
  elements.result.className = type;
}

// Password Recovery
function initPasswordRecovery() {
  if (!elements.forgotPassword) return;
  
  elements.forgotPassword.addEventListener('click', (e) => {
    e.preventDefault();
    showSecurityQuestion();
  });
}

function showSecurityQuestion() {
  const randomQuestion = config.securityQuestions[
    Math.floor(Math.random() * config.securityQuestions.length)
  ];
  
  const answer = prompt(randomQuestion);
  if (answer) {
    showResult('If your answer matches our records, you will receive a reset link.', 'info');
  }
}

// Initialize all components
function initApp() {
  try {
    initTheme();
    initDeviceId();
    setupDeviceIdModal();
    initKeyVerification();
    initChat();
    initPasswordRecovery();
    
    // Set focus to input field if it exists
    elements.userKeyInput?.focus();
    
    // Log initialization
    console.log('AM VIP System initialized');
  } catch (error) {
    console.error('Initialization error:', error);
    showResult('System error. Please refresh the page.', 'error');
  }
}

// Start the application
document.addEventListener('DOMContentLoaded', initApp);
