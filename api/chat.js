export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metoda niedozwolona' });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Brak treści wiadomości' });
  }

  try {
    // TUTAJ WKLEIMY KLUCZ API (Na razie zostaw to puste lub wklej jeśli już masz)
    const API_KEY = process.env.OPENAI_API_KEY || 'TWOJ_KLUCZ_API';

    if (API_KEY === 'TWOJ_KLUCZ_API') {
       return res.status(200).json({ reply: "[System]: Kod gotowy, ale brakuje klucza API w pliku api/chat.js!" });
    }

    // Prawdziwe zapytanie do sztucznej inteligencji (OpenAI)
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // Możemy to potem zmienić na mocniejszy model
        messages: [
          { 
            role: 'system', 
            content: 'Jesteś ORVEX, zaawansowaną sztuczną inteligencją o potężnych możliwościach. Odpowiadasz konkretnie, profesjonalnie, z lekkim, hakerskim, mrocznym klimatem. Używasz polskiego języka.' 
          },
          { 
            role: 'user', 
            content: message 
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      })
    });

    const data = await aiResponse.json();

    if (!aiResponse.ok) {
       return res.status(500).json({ error: data.error?.message || 'Błąd połączenia z siecią neuronową' });
    }

    // Wyciągamy sam tekst odpowiedzi od bota
    const reply = data.choices[0].message.content;

    res.status(200).json({ reply: reply });

  } catch (error) {
    console.error('Błąd serwera AI:', error);
    res.status(500).json({ error: 'Wewnętrzny błąd serwera' });
  }
}
