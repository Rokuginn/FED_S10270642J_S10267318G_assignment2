document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const chatRoomId = params.get('chatRoomId');
    const itemId = params.get('itemId'); // Get the item ID from the URL
    const userId = JSON.parse(localStorage.getItem('user'))._id;
    const chatList = document.getElementById('chatList');
    const chatWith = document.getElementById('chatWith');
    const chatMessages = document.getElementById('chatMessages');
    const messageInput = document.getElementById('messageInput');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    const itemDetailsBar = document.getElementById('itemDetailsBar');
    let currentChatUserId = null;

    // Fetch chat rooms
    function fetchChatRooms() {
        fetch(`https://fed-s10270642j-s10267318g-assignment2.onrender.com/chats/rooms?userId=${userId}`)
            .then(response => response.json())
            .then(chatRooms => {
                chatList.innerHTML = ''; // Clear existing chat list
                if (Array.isArray(chatRooms)) {
                    chatRooms.forEach(chatRoom => {
                        const chatListItem = document.createElement('div');
                        chatListItem.classList.add('chat-list-item');
                        chatListItem.textContent = `${chatRoom.username}: ${chatRoom.lastMessage}`;
                        chatListItem.addEventListener('click', () => {
                            window.location.href = `chat.html?chatRoomId=${chatRoom._id}`;
                        });
                        chatList.appendChild(chatListItem);
                    });
                } else {
                    console.error('Unexpected response format:', chatRooms);
                }
            })
            .catch(error => {
                console.error('Error fetching chat rooms:', error);
            });
    }

    fetchChatRooms(); // Initial fetch of chat rooms

    // Load chat messages and item details
    function loadChat(chatRoomId) {
        fetch(`https://fed-s10270642j-s10267318g-assignment2.onrender.com/chats/${chatRoomId}`)
            .then(response => response.json())
            .then(chatRoom => {
                if (chatRoom) {
                    currentChatUserId = chatRoom.receiver._id === userId ? chatRoom.sender._id : chatRoom.receiver._id;
                    chatMessages.innerHTML = '';
                    if (Array.isArray(chatRoom.messages)) {
                        chatRoom.messages.forEach(message => {
                            const messageElement = document.createElement('div');
                            messageElement.classList.add('chat-bubble');
                            messageElement.classList.add(message.sender._id === userId ? 'sender' : 'receiver');
                            messageElement.textContent = `${message.sender.username === userId ? 'You' : message.sender.username}: ${message.text}`;
                            chatMessages.appendChild(messageElement);
                        });
                    }

                    // Display item details
                    if (chatRoom.item) {
                        const itemDetailsHTML = `
                            <img src="https://fed-s10270642j-s10267318g-assignment2.onrender.com${chatRoom.item.imagePath}" alt="${chatRoom.item.partName}">
                            <div class="item-info">
                                <h3>${chatRoom.item.partName}</h3>
                                <p>$${chatRoom.item.price}</p>
                            </div>
                        `;
                        itemDetailsBar.innerHTML = itemDetailsHTML;
                    } else {
                        itemDetailsBar.innerHTML = '<p>No item details available.</p>';
                    }

                    // Fetch seller information
                    fetch(`https://fed-s10270642j-s10267318g-assignment2.onrender.com/users/${currentChatUserId}`)
                        .then(response => response.json())
                        .then(user => {
                            chatWith.textContent = user.username;
                        })
                        .catch(error => {
                            console.error('Error fetching user information:', error);
                        });
                } else {
                    console.error('Chat room not found');
                }
            })
            .catch(error => {
                console.error('Error fetching chat room:', error);
            });
    }

    // Load the chat room if chatRoomId is present in the URL
    if (chatRoomId) {
        loadChat(chatRoomId);
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
                    messageElement.classList.add('chat-bubble', 'sender');
                    messageElement.textContent = `You: ${message}`;
                    chatMessages.appendChild(messageElement);
                    messageInput.value = '';
                })
                .catch(error => {
                    console.error('Error sending message:', error);
                });
        }
    });

    // Handle chat icon click in the navbar
    const chatIcon = document.getElementById('chatIcon');
    chatIcon.addEventListener('click', (event) => {
        event.preventDefault();
        window.location.href = 'chat.html';
    });
});