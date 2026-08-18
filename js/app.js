document.addEventListener('DOMContentLoaded', () => {
  // --- Elementy DOM ---
  const chatBox = document.getElementById('chat-box');
  const chatForm = document.getElementById('chat-form');
  const messageInput = /** @type {HTMLTextAreaElement} */ (document.getElementById('message-input'));
  const uploadBtn = document.getElementById('upload-btn');
  const fileInput = /** @type {HTMLInputElement} */ (document.getElementById('file-input'));
  const imagePreviewContainer = document.getElementById('image-preview-container');
  const imagePreview = /** @type {HTMLImageElement} */ (document.getElementById('image-preview'));
  const removeImageBtn = document.getElementById('remove-image-btn');
  const userGreeting = document.getElementById('user-greeting');
  const logoutBtn = document.getElementById('logout-btn');

  // --- Ładowanie Profilu ---
  const storedProfile = localStorage.getItem('orvex_user_profile');
  if (!storedProfile) {
    // Brak profilu = brak dostępu, wracamy do logowania
    window.location.href = 'login.html';
    return;
  }

  const userProfile = JSON.parse(storedProfile);
  userGreeting.innerText = `Agent: ${userProfile.firstName} | Tryb: ${userProfile.isAdult ? 'Pełny Dostęp' : 'Bezpieczny'}`;

  // --- Wylogowanie ---
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('orvex_sec_state'); // Usuwa stan 2FA
    window.location.href = 'login.html';
  });

  // --- Autoresize pola tekstowego ---
  messageInput.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
    if (this.value === '') {
      this.style.height = 'auto'; // Reset, gdy pusto
    }
  });

  // Zabezpieczenie przed enterem
  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      chatForm.dispatchEvent(new Event('submit'));
    }
  });

  // --- Obsługa wgrywania zdjęć (Vision) ---
  let selectedFile = null;

  uploadBtn.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', function () {
    if (this.files && this.files[0]) {
      selectedFile = this.files[0];
      const reader = new FileReader();

      reader.onload = (e) => {
        imagePreview.src = /** @type {string} */ (e.target.result);
        imagePreviewContainer.classList.remove('hidden');
      };

      reader.readAsDataURL(selectedFile);
    }
  });

  removeImageBtn.addEventListener('click', (e) => {
    e.preventDefault();
    selectedFile = null;
    fileInput.value = '';
    imagePreviewContainer.classList.add('hidden');
    imagePreview.src = '';
  });

  // --- Tworzenie dymków wiadomości ---
  /**
   * @param {string} text
   * @param {boolean} isUser
   * @param {string} [imgSrc]
   */
  function appendMessage(text, isUser, imgSrc = null) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;

    let avatarHTML = '';
    if (isUser) {
      avatarHTML = `<div class="avatar" style="background: var(--neon-purple); color: white;"><i class="ri-user-smile-line"></i></div>`;
    } else {
      avatarHTML = `
        <div class="avatar">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="80%" height="80%">
            <defs>
              <linearGradient id="orvexGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#00f0ff" />
                <stop offset="100%" stop-color="#9d4edd" />
              </linearGradient>
            </defs>
            <rect x="5" y="5" width="90" height="90" rx="22" fill="#0d0f18" stroke="url(#orvexGrad3)" stroke-width="2"/>
            <path d="M30 32 L50 68 L70 32" fill="none" stroke="url(#orvexGrad3)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="50" cy="44" r="4" fill="#00f0ff"/>
          </svg>
        </div>`;
    }

    let imageHTML = imgSrc ? `<img src="${imgSrc}" style="max-width: 100%; border-radius: 8px; margin-bottom: 8px; border: 1px solid var(--border-neon);">` : '';
    
    msgDiv.innerHTML = `
      ${avatarHTML}
      <div class="bubble">
        ${imageHTML}
        <p>${text.replace(/\n/g, '<br>')}</p>
      </div>
    `;

    chatBox.appendChild(msgDiv);
    
    setTimeout(() => {
      chatBox.scrollTop = chatBox.scrollHeight;
    }, 50);
  }

  // --- Obsługa wysyłania wiadomości (Prawdziwe API) ---
  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = messageInput.value.trim();
    
    if (text === '' && !selectedFile) return;

    let imgSrc = imagePreviewContainer.classList.contains('hidden') ? null : imagePreview.src;

    // Wyświetlenie wiadomości użytkownika lokalnie
    appendMessage(text, true, imgSrc);

    // Czyszczenie interfejsu po wysłaniu
    messageInput.value = '';
    messageInput.style.height = 'auto';
    
    const imageToSend = imgSrc;
    removeImageBtn.click(); // Czyści podgląd i plik

    try {
      // Wysyłanie zapytania do backendu na Vercelu (/api/chat)
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          message: text,
          image: imageToSend 
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Błąd komunikacji z serwerem AI');
      }

      // Wyświetlenie odpowiedzi z OpenAI
      appendMessage(data.reply, false);

    } catch (error) {
      console.error('Błąd:', error);
      appendMessage('[System]: Wystąpił problem z połączeniem z siecią neuronową.', false);
    }
  });
});
