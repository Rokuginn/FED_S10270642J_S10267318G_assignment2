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
                            loadChat(chatRoom.userId);
                            // Clear item details when switching chats from the list
                            if (!itemId) {
                                itemDetailsBar.style.display = 'none';
                            }
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

    // Load chat messages
    function loadChat(sellerId) {
        currentChatUserId = sellerId;
        chatMessages.innerHTML = '';
        
        // First fetch the chat room details to get associated itemId
        fetch(`https://fed-s10270642j-s10267318g-assignment2.onrender.com/chats/rooms?userId=${userId}&sellerId=${sellerId}`)
            .then(response => response.json())
            .then(chatRooms => {
                const chatRoom = chatRooms.find(room => 
                    room.userId === sellerId || room.receiver === sellerId
                );
                
                if (chatRoom && chatRoom.itemId) {
                    // Update item details if there's an associated item
                    fetch(`https://fed-s10270642j-s10267318g-assignment2.onrender.com/listing/${chatRoom.itemId}`)
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
                            } else {
                                itemDetailsBar.style.display = 'none';
                            }
                        })
                        .catch(error => {
                            console.error('Error fetching item details:', error);
                            itemDetailsBar.style.display = 'none';
                        });
                } else {
                    itemDetailsBar.style.display = 'none';
                }
            })
            .catch(error => {
                console.error('Error fetching chat room details:', error);
                itemDetailsBar.style.display = 'none';
            });

        // Fetch and display chat messages
        fetch(`https://fed-s10270642j-s10267318g-assignment2.onrender.com/chats?userId=${userId}&sellerId=${sellerId}`)
            .then(response => response.json())
            .then(messages => {
                if (Array.isArray(messages)) {
                    messages.forEach(message => {
                        const messageElement = document.createElement('div');
                        messageElement.classList.add('chat-bubble');
                        messageElement.classList.add(message.sender._id === userId ? 'sender' : 'receiver');
                        messageElement.textContent = `${message.sender.username === userId ? 'You' : message.sender.username}: ${message.text}`;
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
});