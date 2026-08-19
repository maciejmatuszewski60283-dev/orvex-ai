export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metoda niedozwolona' });
  }

  const { message, image } = req.body;

  try {
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
       return res.status(200).json({ reply: '[DEBUG ERROR]: Brak klucza GEMINI_API_KEY na Vercelu!' });
    }

    let contents = [];
    contents.push({
      role: 'user',
      parts: [
        { text: 'Jesteś ORVEX, zaawansowaną sztuczną inteligencją. Odpowiadaj krótko i po polsku.' },
        { text: message || 'Obraz' }
      ]
    });

    if (image) {
      const matches = image.match(/^data:(.+);base64,(.+)$/);
      if (matches) {
        contents[0].parts.push({
          inline_data: { mime_type: matches[1], data: matches[2] }
        });
      }
    }

    const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    });

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
       return res.status(200).json({ reply: '[GOOGLE API ERROR]: ' + (data.error?.message || JSON.stringify(data)) });
    }

    const reply = data.candidates[0].content.parts[0].text;
    res.status(200).json({ reply: reply });

  } catch (error) {
    res.status(200).json({ reply: '[SERVER CATCH ERROR]: ' + error.message });
  }
}
