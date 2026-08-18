document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const emailStep = document.getElementById('email-step');
  const codeStep = document.getElementById('code-step');
  const timerDisplay = document.getElementById('timer');
  const verifyCodeBtn = document.getElementById('verify-code-btn');
  const backToEmailBtn = document.getElementById('back-to-email-btn');
  const googleLoginBtn = document.getElementById('google-login-btn');
  const emailInput = /** @type {HTMLInputElement} */ (document.getElementById('email'));
  const codeInput = /** @type {HTMLInputElement} */ (document.getElementById('verification-code'));

  let countdownInterval = null;

  /**
   * Uruchamia licznik czasu (w sekundach)
   */
  function startTimer(duration, display) {
    let timer = duration;
    if (countdownInterval) clearInterval(countdownInterval);

    countdownInterval = setInterval(() => {
      let minutes = parseInt(String(timer / 60), 10);
      let seconds = parseInt(String(timer % 60), 10);

      let minStr = minutes < 10 ? "0" + minutes : minutes;
      let secStr = seconds < 10 ? "0" + seconds : seconds;

      if (display) display.textContent = minStr + ":" + secStr;

      if (--timer < 0) {
        clearInterval(countdownInterval);
        if (display) display.textContent = "00:00";
        alert("Czas na wpisanie kodu minął. Wygeneruj nowy.");
        resetToEmailStep();
      }
    }, 1000);
  }

  function resetToEmailStep() {
    if (countdownInterval) clearInterval(countdownInterval);
    codeStep?.classList.add('hidden');
    emailStep?.classList.remove('hidden');
    if (codeInput) codeInput.value = '';
  }

  // KROK 1: Wysyłanie emaila do API
  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value;

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send-code', email })
      });

      if (response.ok) {
        emailStep?.classList.add('hidden');
        codeStep?.classList.remove('hidden');
        startTimer(120, timerDisplay);
      } else {
        alert("Błąd wysyłania kodu z serwera!");
      }
    } catch (err) {
      // Zabezpieczenie dla Acode (działa lokalnie bez hostingu Vercel)
      console.log("Brak serwera, tryb symulacji włączony.");
      emailStep?.classList.add('hidden');
      codeStep?.classList.remove('hidden');
      startTimer(120, timerDisplay);
    }
  });

  // KROK 2: Weryfikacja kodu przez API
  verifyCodeBtn?.addEventListener('click', async () => {
    const code = codeInput.value;

    if (!code) {
      alert("Wprowadź kod!");
      return;
    }

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify-code', code })
      });

      if (response.ok) {
        window.location.href = 'onboarding.html';
      } else {
        alert("Nieprawidłowy kod! (Spróbuj 123456)");
      }
    } catch (err) {
      // Zabezpieczenie dla Acode (symulacja logowania offline)
      if (code === '123456') {
         window.location.href = 'onboarding.html';
      } else {
         alert("Brak połączenia z serwerem. Użyj kodu testowego: 123456");
      }
    }
  });

  // Obsługa przycisków pomocniczych
  backToEmailBtn?.addEventListener('click', resetToEmailStep);

  googleLoginBtn?.addEventListener('click', () => {
    window.location.href = 'onboarding.html';
  });
});
