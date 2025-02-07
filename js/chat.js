document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const chatRoomId = params.get('chatRoomId');
    const itemId = params.get('itemId'); // Get the item ID from the URL
    const sellerId = params.get('sellerId'); // Add this line
    
    // Check if user is logged in
    const userJson = localStorage.getItem('user');
    if (!userJson) {
        console.error('No user found in localStorage');
        window.location.href = 'login.html';
        return;
    }

    const user = JSON.parse(userJson);
    const userId = user._id;

    if (!userId) {
        console.error('Invalid user ID');
        window.location.href = 'login.html';
        return;
    }

    const chatList = document.getElementById('chatList');
    const chatWith = document.getElementById('chatWith');
    const chatMessages = document.getElementById('chatMessages');
    const messageInput = document.getElementById('messageInput');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    const itemDetailsBar = document.getElementById('itemDetailsBar');
    let currentChatUserId = null;

    // Update the item details bar visibility based on context
    function updateItemDetailsBar() {
        if (!itemId) {
            itemDetailsBar.style.display = 'none';
        } else {
            itemDetailsBar.style.display = 'flex';
            fetch(`https://fed-s10270642j-s10267318g-assignment2.onrender.com/listing/${itemId}`)
                .then(response => response.json())
                .then(item => {
                    if (item) {
                        const itemDetailsHTML = `
                            <img src="https://fed-s10270642j-s10267318g-assignment2.onrender.com${item.imagePaths[0]}" alt="${item.partName}">
                            <div class="item-info">
                                <h3>${item.partName}</h3>
                                <p>$${item.price}</p>
                            </div>
                        `;
                        itemDetailsBar.innerHTML = itemDetailsHTML;
                    }
                })
                .catch(error => {
                    console.error('Error fetching item details:', error);
                });
        }
    }

    // Call updateItemDetailsBar after DOM loads
    updateItemDetailsBar();

    // Update the fetchChatRooms function
    function fetchChatRooms() {
        fetch(`https://fed-s10270642j-s10267318g-assignment2.onrender.com/chats/rooms?userId=${userId}`)
            .then(response => response.json())
            .then(chatRooms => {
                console.log('Chat rooms received:', chatRooms); // Debug log
                chatList.innerHTML = '';
                if (Array.isArray(chatRooms)) {
                    chatRooms.forEach(chatRoom => {
                        const chatListItem = document.createElement('div');
                        chatListItem.classList.add('chat-list-item');
                        
                        const chatInfo = document.createElement('div');
                        chatInfo.classList.add('chat-info');
                        chatInfo.textContent = `${chatRoom.username}${chatRoom.lastMessage ? ': ' + chatRoom.lastMessage : ''}`;
                        chatInfo.addEventListener('click', () => {
                            loadChat(chatRoom.userId, chatRoom.itemId); // Pass itemId to loadChat
                        });
                        
                        const deleteButton = document.createElement('button');
                        deleteButton.classList.add('delete-chat-btn');
                        deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
                        deleteButton.addEventListener('click', (e) => {
                            e.stopPropagation();
                            if (confirm('Are you sure you want to delete this chat?')) {
                                deleteChatRoom(chatRoom.userId);
                            }
                        });
                        
                        chatListItem.appendChild(chatInfo);
                        chatListItem.appendChild(deleteButton);
                        chatList.appendChild(chatListItem);
                    });
                }
            })
            .catch(error => {
                console.error('Error fetching chat rooms:', error);
            });
    }

    fetchChatRooms(); // Initial fetch of chat rooms

    // Add this new function to handle chat room deletion
    async function deleteChatRoom(otherUserId) {
        try {
            const response = await fetch(
                `https://fed-s10270642j-s10267318g-assignment2.onrender.com/chats/room/${userId}/${otherUserId}`,
                { method: 'DELETE' }
            );
            const result = await response.json();
            if (result.success) {
                // Refresh chat list
                fetchChatRooms();
                // Clear chat window if the deleted chat was open
                if (currentChatUserId === otherUserId) {
                    chatMessages.innerHTML = '';
                    chatWith.textContent = '';
                    itemDetailsBar.style.display = 'none';
                    currentChatUserId = null;
                }
            } else {
                alert('Failed to delete chat room');
            }
        } catch (error) {
            console.error('Error deleting chat room:', error);
            alert('Failed to delete chat room');
        }
    }

    // Update the loadChat function with validation
    function loadChat(sellerId, chatItemId = null) {
        if (!sellerId || !userId) {
            console.error('Missing required IDs:', { sellerId, userId });
            return;
        }

        currentChatUserId = sellerId;
        chatMessages.innerHTML = '';
        
        // If we have a chatItemId, use it, otherwise try to get it from the URL
        const currentItemId = chatItemId || itemId;
        
        if (currentItemId) {
            fetch(`https://fed-s10270642j-s10267318g-assignment2.onrender.com/listing/${currentItemId}`)
                .then(response => response.json())
                .then(item => {
                    if (item) {
                        itemDetailsBar.style.display = 'flex';
                        itemDetailsBar.innerHTML = `
                            <img src="https://fed-s10270642j-s10267318g-assignment2.onrender.com${item.imagePaths[0]}" alt="${item.partName}">
                            <div class="item-info">
                                <h3>${item.partName}</h3>
                                <p>$${item.price}</p>
                            </div>
                        `;
                    }
                })
                .catch(error => {
                    console.error('Error fetching item details:', error);
                    itemDetailsBar.style.display = 'none';
                });
        } else {
            itemDetailsBar.style.display = 'none';
        }

        // Add validation before fetching messages
        if (typeof userId === 'string' && typeof sellerId === 'string') {
            fetch(`https://fed-s10270642j-s10267318g-assignment2.onrender.com/chats?userId=${userId}&sellerId=${sellerId}`)
                .then(response => response.json())
                .then(messages => {
                    if (Array.isArray(messages)) {
                        messages
                            .filter(message => message.text && message.text.trim() !== '')
                            .forEach(message => {
                                const messageElement = document.createElement('div');
                                messageElement.classList.add('chat-bubble');
                                messageElement.classList.add(message.sender._id === userId ? 'sender' : 'receiver');
                                messageElement.textContent = `${message.sender.username === userId ? 'You' : message.sender.username}: ${message.text}`;
                                chatMessages.appendChild(messageElement);
                            });
                        chatMessages.scrollTop = chatMessages.scrollHeight;
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
    }

    // Update how chat is loaded initially if sellerId is present
    if (sellerId) {
        loadChat(sellerId, itemId);
    } else if (chatRoomId) {
        fetch(`https://fed-s10270642j-s10267318g-assignment2.onrender.com/chats/${chatRoomId}`)
            .then(response => response.json())
            .then(chatRoom => {
                if (chatRoom) {
                    loadChat(chatRoom.receiver === userId ? chatRoom.sender : chatRoom.receiver, itemId);
                } else {
                    console.error('Chat room not found');
                }
            })
            .catch(error => {
                console.error('Error fetching chat room:', error);
            });
    }

    // Fetch and display item details if itemId is present in the URL
    if (itemId) {
        fetch(`https://fed-s10270642j-s10267318g-assignment2.onrender.com/listing/${itemId}`)
            .then(response => response.json())
            .then(item => {
                if (item) {
                    const itemDetailsHTML = `
                        <img src="https://fed-s10270642j-s10267318g-assignment2.onrender.com${item.imagePaths[0]}" alt="${item.partName}">
                        <div class="item-info">
                            <h3>${item.partName}</h3>
                            <p>$${item.price}</p>
                        </div>
                    `;
                    itemDetailsBar.innerHTML = itemDetailsHTML;
                } else {
                    console.error('Item not found');
                }
            })
            .catch(error => {
                console.error('Error fetching item details:', error);
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
                body: JSON.stringify({ 
                    sender: userId, 
                    receiver: currentChatUserId, 
                    text: message,
                    itemId: itemId // Include the itemId if present
                })
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
});