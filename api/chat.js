export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metoda niedozwolona' });
  }

  const { message, image } = req.body;

  if (!message && !image) {
    return res.status(400).json({ error: 'Brak treści wiadomości lub obrazu' });
  }

  try {
    // Pobieramy klucz wyłącznie bezpiecznie ze zmiennych środowiskowych Vercela
    const API_KEY = process.env.OPENAI_API_KEY;

    if (!API_KEY) {
       return res.status(500).json({ error: 'Brak skonfigurowanego klucza OPENAI_API_KEY w zmiennych środowiskowych Vercela!' });
    }

    // Przygotowanie wiadomości (obsługa tekstu oraz opcjonalnego obrazu podglądu)
    let userContent = [];
    if (message) {
      userContent.push({ type: 'text', text: message });
    }
    if (image) {
      userContent.push({ type: 'image_url', image_url: { url: image } });
    }

    // Zapytanie do oficjalnego API OpenAI
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Używamy szybkiego i nowoczesnego modelu obsługującego też obrazy (Vision)
        messages: [
          { 
            role: 'system', 
            content: 'Jesteś ORVEX, zaawansowaną sztuczną inteligencją o potężnych możliwościach. Odpowiadasz konkretnie, profesjonalnie, z lekkim, hakerskim, mrocznym klimatem. Używasz polskiego języka.' 
          },
          { 
            role: 'user', 
            content: userContent.length === 1 && typeof userContent[0].text === 'string' ? userContent[0].text : userContent 
          }
        ],
        max_tokens: 400,
        temperature: 0.7
      })
    });

    const data = await aiResponse.json();

    if (!aiResponse.ok) {
       return res.status(500).json({ error: data.error?.message || 'Błąd połączenia z siecią neuronową OpenAI' });
    }

    const reply = data.choices[0].message.content;

    res.status(200).json({ reply: reply });

  } catch (error) {
    console.error('Błąd serwera AI:', error);
    res.status(500).json({ error: 'Wewnętrzny błąd serwera' });
  }
}
