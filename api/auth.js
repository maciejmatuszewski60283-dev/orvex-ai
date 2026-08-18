// api/auth.js — Backendowy ochroniarz aplikacji

export default async function handler(req, res) {
  const { action, email, code } = req.body;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metoda niedozwolona' });
  }

  try {
    // KROK 1: Wysyłanie kodu na email
    if (action === 'send-code') {
      console.log(`Wysyłanie kodu do: ${email}`);
      // Tutaj w przyszłości wywołamy prawdziwe API do wysyłki maila
      return res.status(200).json({ status: 'Kod wysłany' });
    }

    // KROK 2: Weryfikacja kodu
    if (action === 'verify-code') {
      if (code === '123456') { // Symulacja poprawnego kodu
        return res.status(200).json({ status: 'Zalogowano', token: 'mock-jwt-token' });
      } else {
        return res.status(401).json({ error: 'Nieprawidłowy kod' });
      }
    }

    return res.status(400).json({ error: 'Nieznana akcja' });
  } catch (error) {
    return res.status(500).json({ error: 'Błąd serwera' });
  }
}
