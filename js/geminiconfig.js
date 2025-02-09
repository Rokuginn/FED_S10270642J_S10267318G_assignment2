let GEMINI_API_KEY = '';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// Fetch API key when module loads
async function initializeApiKey() {
    try {
        const response = await fetch('https://fed-s10270642j-s10267318g-assignment2.onrender.com/api/gemini-key');
        const data = await response.json();
        GEMINI_API_KEY = data.apiKey;
    } catch (error) {
        console.error('Error fetching API key:', error);
    }
}

async function getPCRecommendation(userInput) {
    if (!GEMINI_API_KEY) {
        await initializeApiKey();
    }

    try {
        const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            mode: 'cors', // Add CORS mode
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Act as a PC building expert. Recommend PC parts based on this request: ${userInput}. 
                               Format your response with clear sections for CPU, GPU, RAM, Storage, and estimated total price.`
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 800,
                }
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (!data.candidates || !data.candidates[0]) {
            throw new Error('Invalid response format');
        }
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error('Error:', error);
        return `Sorry, I encountered an error: ${error.message}`;
    }
}

// Initialize API key when module loads
initializeApiKey();

export { getPCRecommendation };