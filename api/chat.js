export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metoda niedozwolona' });
  }

  const { message, image } = req.body;

  if (!message && !image) {
    return res.status(400).json({ error: 'Brak treści wiadomości lub obrazu' });
  }

  try {
    // 1. Pobieramy klucz od Google ze zmiennych środowiskowych Vercela
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
       return res.status(500).json({ error: 'Brak klucza GEMINI_API_KEY w zmiennych środowiskowych Vercela!' });
    }

    // 2. Przygotowanie wiadomości pod strukturę Gemini
    let contents = [];

    contents.push({
      role: 'user',
      parts: [
        { text: 'Instrukcja systemowa: Jesteś ORVEX, zaawansowaną sztuczną inteligencją o potężnych możliwościach. Odpowiadasz konkretnie, profesjonalnie, z lekkim, hakerskim, mrocznym klimatem. Używasz polskiego języka.\n\nWiadomość od użytkownika: ' + (message || '[Przesłano obraz do analizy]') }
      ]
    });

    // 3. Jeśli użytkownik wgrał zdjęcie, przygotowujemy je dla Gemini (Base64)
    if (image) {
      const matches = image.match(/^data:(.+);base64,(.+)$/);
      if (matches) {
        contents[0].parts.push({
          inline_data: {
            mime_type: matches[1],
            data: matches[2]
          }
        });
      }
    }

    // 4. Zapytanie do darmowego, oficjalnego API Google Gemini 1.5 Flash
    const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ contents })
    });

    const data = await apiResponse.json();

    // 5. Obsługa ewentualnych błędów z serwerów Google
    if (!apiResponse.ok) {
       return res.status(500).json({ error: data.error?.message || 'Błąd połączenia z siecią neuronową Gemini' });
    }

    // 6. Wyciągamy sam tekst odpowiedzi od ORVEXA
    const reply = data.candidates[0].content.parts[0].text;

    res.status(200).json({ reply: reply });

  } catch (error) {
    console.error('Błąd serwera AI:', error);
    // Wyświetli dokładny błąd na ekranie aplikacji, ułatwiając nam diagnozę
    res.status(500).json({ error: error.message || 'Wewnętrzny błąd serwera' });
  }
}
