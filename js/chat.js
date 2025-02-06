document.addEventListener('DOMContentLoaded', () => {
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
            chats.forEach(chat => {
                const chatListItem = document.createElement('div');
                chatListItem.classList.add('chat-list-item');
                chatListItem.textContent = chat.username;
                chatListItem.addEventListener('click', () => {
                    loadChat(chat.userId);
                });
                chatList.appendChild(chatListItem);
            });
        });

    // Load chat messages
    function loadChat(sellerId) {
        currentChatUserId = sellerId;
        chatMessages.innerHTML = '';
        fetch(`https://fed-s10270642j-s10267318g-assignment2.onrender.com/chats?userId=${userId}&sellerId=${sellerId}`)
            .then(response => response.json())
            .then(messages => {
                messages.forEach(message => {
                    const messageElement = document.createElement('div');
                    messageElement.textContent = `${message.sender === userId ? 'You' : message.sender}: ${message.text}`;
                    chatMessages.appendChild(messageElement);
                });
            });

        // Fetch seller information
        fetch(`https://fed-s10270642j-s10267318g-assignment2.onrender.com/users/${sellerId}`)
            .then(response => response.json())
            .then(user => {
                chatWith.textContent = user.username;
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
                });
        }
    });
});

// Fetch chat list for a user
app.get('/chats/list', async (req, res) => {
    const { userId } = req.query;
    try {
        const chats = await Chat.aggregate([
            {
                $match: {
                    $or: [
                        { sender: mongoose.Types.ObjectId(userId) },
                        { receiver: mongoose.Types.ObjectId(userId) }
                    ]
                }
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ['$sender', mongoose.Types.ObjectId(userId)] },
                            '$receiver',
                            '$sender'
                        ]
                    }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $project: {
                    userId: '$_id',
                    username: '$user.username'
                }
            }
        ]);
        res.json(chats);
    } catch (error) {
        console.error('Error fetching chat list:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});