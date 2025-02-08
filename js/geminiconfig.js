const GEMINI_API_KEY = 'AIzaSyAjeyAXxlhhQi3z92Ecm_Zag2R-egeqOSA';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

async function getPCRecommendation(userInput) {
    try {
        const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
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

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error('Error:', error);
        return 'Sorry, I encountered an error while processing your request.';
    }
}

export { getPCRecommendation };