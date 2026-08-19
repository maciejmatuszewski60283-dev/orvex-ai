export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metoda niedozwolona' });
  }

  const { message, image } = req.body;

  if (!message && !image) {
    return res.status(400).json({ error: 'Brak treści wiadomości' });
  }

  try {
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
       return res.status(500).json({ error: 'Brak klucza GEMINI_API_KEY w zmiennych środowiskowych' });
    }

    let contents = [];
    contents.push({
      role: 'user',
      parts: [
        { text: 'Jesteś ORVEX, zaawansowaną sztuczną inteligencją o mrocznym, hakerskim klimacie. Odpowiadaj profesjonalnie, konkretnie i po polsku.' },
        { text: message || 'Oto załączony obraz:' }
      ]
    });

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

    const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ contents })
    });

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
       return res.status(500).json({ error: data.error?.message || 'Błąd połączenia z Google Gemini API' });
    }

    const reply = data.candidates[0].content.parts[0].text;

    res.status(200).json({ reply: reply });

  } catch (error) {
    console.error('Błąd serwera AI:', error);
    res.status(500).json({ error: error.message });
  }
}
