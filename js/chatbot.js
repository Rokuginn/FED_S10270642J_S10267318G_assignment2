import { getPCRecommendation } from './geminiconfig.js';

document.addEventListener('DOMContentLoaded', () => {
    const chatbotToggle = document.getElementById('chatbotToggle');
    const chatbotContainer = document.getElementById('chatbotContainer');
    const chatbotClose = document.getElementById('chatbotClose');
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');

    // Toggle chatbot
    chatbotToggle.addEventListener('click', () => {
        chatbotContainer.classList.add('active');
        chatbotToggle.style.display = 'none';
    });

    chatbotClose.addEventListener('click', () => {
        chatbotContainer.classList.remove('active');
        chatbotToggle.style.display = 'block';
    });

    // Handle chat functionality
    function addMessage(message, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
        messageDiv.textContent = message;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async function handleUserInput() {
        const message = userInput.value.trim();
        if (!message) return;

        addMessage(message, true);
        userInput.value = '';

        // Show typing indicator
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot typing';
        typingDiv.textContent = 'Thinking...';
        chatMessages.appendChild(typingDiv);

        try {
            console.log('Sending request:', message); // Debug log
            const response = await getPCRecommendation(message);
            console.log('Received response:', response); // Debug log
            chatMessages.removeChild(typingDiv);
            addMessage(response);
        } catch (error) {
            console.error('Chatbot error:', error); // Detailed error logging
            chatMessages.removeChild(typingDiv);
            addMessage('Sorry, I encountered an error. Please try again.');
        }
    }

    sendBtn.addEventListener('click', handleUserInput);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleUserInput();
    });
});