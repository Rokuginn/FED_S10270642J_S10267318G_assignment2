document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const chatRoomId = params.get('chatRoomId');
    const userId = JSON.parse(localStorage.getItem('user'))._id;
    const chatList = document.getElementById('chatList');
    const chatWith = document.getElementById('chatWith');
    const chatMessages = document.getElementById('chatMessages');
    const messageInput = document.getElementById('messageInput');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    let currentChatUserId = null;

    // Fetch chat list
    fetch(`https://fed-s10270642j-s10267318g-assignment2.onrender.com/chats/list?userId=${userId}`)
        .then(response => response.json())
        .then(chats => {
            if (Array.isArray(chats)) {
                chats.forEach(chat => {
                    const chatListItem = document.createElement('div');
                    chatListItem.classList.add('chat-list-item');
                    chatListItem.textContent = chat.username;
                    chatListItem.addEventListener('click', () => {
                        loadChat(chat.userId);
                    });
                    chatList.appendChild(chatListItem);
                });
            } else {
                console.error('Unexpected response format:', chats);
            }
        })
        .catch(error => {
            console.error('Error fetching chat list:', error);
        });

    // Load chat messages
    function loadChat(sellerId) {
        currentChatUserId = sellerId;
        chatMessages.innerHTML = '';
        fetch(`https://fed-s10270642j-s10267318g-assignment2.onrender.com/chats?userId=${userId}&sellerId=${sellerId}`)
            .then(response => response.json())
            .then(messages => {
                if (Array.isArray(messages)) {
                    messages.forEach(message => {
                        const messageElement = document.createElement('div');
                        messageElement.textContent = `${message.sender === userId ? 'You' : message.sender}: ${message.text}`;
                        chatMessages.appendChild(messageElement);
                    });
                } else {
                    console.error('Unexpected response format:', messages);
                }
            })
            .catch(error => {
                console.error('Error fetching chat messages:', error);
            });

        // Fetch seller information
        fetch(`https://fed-s10270642j-s10267318g-assignment2.onrender.com/users/${sellerId}`)
            .then(response => response.json())
            .then(user => {
                chatWith.textContent = user.username;
            })
            .catch(error => {
                console.error('Error fetching user information:', error);
            });
    }

    // Load the chat room if chatRoomId is present in the URL
    if (chatRoomId) {
        fetch(`https://fed-s10270642j-s10267318g-assignment2.onrender.com/chats/${chatRoomId}`)
            .then(response => response.json())
            .then(chatRoom => {
                if (chatRoom) {
                    loadChat(chatRoom.receiver === userId ? chatRoom.sender : chatRoom.receiver);
                } else {
                    console.error('Chat room not found');
                }
            })
            .catch(error => {
                console.error('Error fetching chat room:', error);
            });
    }

    // Send message
    sendMessageBtn.addEventListener('click', () => {
        const message = messageInput.value;
        if (message.trim() !== '' && currentChatUserId) {
            fetch('https://fed-s10270642j-s10267318g-assignment2.onrender.com/chats', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ sender: userId, receiver: currentChatUserId, text: message })
            })
                .then(response => response.json())
                .then(data => {
                    const messageElement = document.createElement('div');
                    messageElement.textContent = `You: ${message}`;
                    chatMessages.appendChild(messageElement);
                    messageInput.value = '';
                })
                .catch(error => {
                    console.error('Error sending message:', error);
                });
        }
    });
});