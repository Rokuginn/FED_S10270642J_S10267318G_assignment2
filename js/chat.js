document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const chatRoomId = params.get('chatRoomId');
    let itemId = params.get('itemId'); // Change from const to let
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
    const offerInput = document.getElementById('offerInput');
    const offerBtn = document.getElementById('offerBtn');
    const dealBtn = document.getElementById('dealBtn');
    let currentChatUserId = null;
    let isUserSeller = false;

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
                
                if (Array.isArray(chatRooms) && chatRooms.length > 0) {
                    chatRooms.forEach(chatRoom => {
                        const chatListItem = document.createElement('div');
                        chatListItem.classList.add('chat-list-item');
                        
                        const chatInfo = document.createElement('div');
                        chatInfo.classList.add('chat-info');
                        chatInfo.textContent = `${chatRoom.username}${chatRoom.lastMessage ? ': ' + chatRoom.lastMessage : ''}`;
                        chatInfo.addEventListener('click', () => {
                            loadChat(chatRoom.userId, chatRoom.itemId);
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
                } else {
                    // Add empty state message
                    const noChatsMessage = document.createElement('div');
                    noChatsMessage.className = 'no-chats-message';
                    noChatsMessage.innerHTML = `
                        <i class="far fa-comments"></i>
                        <p>No chats yet</p>
                        <p>Start a conversation by clicking on "Chat with Seller" on any item</p>
                    `;
                    chatList.appendChild(noChatsMessage);
                    
                    // Also clear the chat window
                    chatMessages.innerHTML = '';
                    chatWith.textContent = '';
                    itemDetailsBar.style.display = 'none';
                }
            })
            .catch(error => {
                console.error('Error fetching chat rooms:', error);
                // Show error state
                chatList.innerHTML = `
                    <div class="no-chats-message">
                        <i class="fas fa-exclamation-circle"></i>
                        <p>Could not load chats</p>
                        <p>Please try again later</p>
                    </div>
                `;
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
        
        // Update the itemId
        itemId = chatItemId || params.get('itemId');
        console.log('Loading chat with itemId:', itemId);
        
        if (itemId) {
            fetch(`https://fed-s10270642j-s10267318g-assignment2.onrender.com/listing/${itemId}`)
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
                        isUserSeller = item.userId === userId;
                        // Hide offer input and button for sellers
                        offerInput.style.display = isUserSeller ? 'none' : 'block';
                        offerBtn.style.display = isUserSeller ? 'none' : 'block';
                        dealBtn.style.display = 'none';
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
                                displayMessage(message);
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

    // Add reject button initialization
    const rejectBtn = document.createElement('button');
    rejectBtn.id = 'rejectBtn';
    rejectBtn.className = 'reject-btn';
    rejectBtn.textContent = 'Reject Offer';
    rejectBtn.style.display = 'none';

    // Insert reject button after deal button
    dealBtn.parentNode.insertBefore(rejectBtn, dealBtn.nextSibling);

    // Add reject button click handler
    rejectBtn.addEventListener('click', () => {
        const rejectMessage = 'OFFER REJECTED!';
        
        fetch('https://fed-s10270642j-s10267318g-assignment2.onrender.com/chats', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sender: userId,
                receiver: currentChatUserId,
                text: rejectMessage,
                itemId: itemId,
                type: 'reject'
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const messageElement = document.createElement('div');
                messageElement.classList.add('chat-bubble', 'sender', 'reject-message');
                messageElement.textContent = 'You rejected the offer!';
                chatMessages.appendChild(messageElement);
                dealBtn.style.display = 'none';
                rejectBtn.style.display = 'none';
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        });
    });

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

    // Update the send message event listener
    sendMessageBtn.addEventListener('click', () => {
        const message = messageInput.value;
        // Use currentItemId to persist the item association
        const currentItemId = itemId || params.get('itemId');
        
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
                    itemId: currentItemId // Use the persisted itemId
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const messageElement = document.createElement('div');
                    messageElement.classList.add('chat-bubble', 'sender');
                    messageElement.textContent = `You: ${message}`;
                    chatMessages.appendChild(messageElement);
                    messageInput.value = '';
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                    
                    // Keep the item details bar visible
                    if (currentItemId && itemDetailsBar.style.display === 'none') {
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
                            });
                    }
                }
            })
            .catch(error => {
                console.error('Error sending message:', error);
            });
        }
    });

    // Add offer button click handler
    offerBtn.addEventListener('click', () => {
        const offerAmount = offerInput.value;
        if (offerAmount && offerAmount > 0) {
            const offerMessage = `OFFER: $${offerAmount}`;
            
            fetch('https://fed-s10270642j-s10267318g-assignment2.onrender.com/chats', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sender: userId,
                    receiver: currentChatUserId,
                    text: offerMessage,
                    itemId: itemId,
                    type: 'offer',
                    amount: offerAmount
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const messageElement = document.createElement('div');
                    messageElement.classList.add('chat-bubble', 'sender', 'offer-message');
                    messageElement.textContent = `You made an offer: $${offerAmount}`;
                    chatMessages.appendChild(messageElement);
                    offerInput.value = '';
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }
            });
        }
    });

    // Update the deal button click handler
    dealBtn.addEventListener('click', () => {
        const dealMessage = 'DEAL ACCEPTED!';
        const lastOfferMessage = Array.from(chatMessages.getElementsByClassName('offer-message')).pop();
        const offerAmount = lastOfferMessage ? parseFloat(lastOfferMessage.textContent.match(/\$(\d+)/)[1]) : null;
        
        if (!offerAmount) {
            alert('No valid offer found');
            return;
        }

        fetch('https://fed-s10270642j-s10267318g-assignment2.onrender.com/deals/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                seller: userId,
                buyer: currentChatUserId,
                item: itemId,
                price: offerAmount
            })
        })
        .then(response => response.json())
        .then(dealData => {
            console.log('Deal created:', dealData); // Debug log
            if (dealData.success && dealData.deal && dealData.deal._id) {
                return fetch('https://fed-s10270642j-s10267318g-assignment2.onrender.com/chats', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        sender: userId,
                        receiver: currentChatUserId,
                        text: dealMessage,
                        itemId: itemId,
                        type: 'deal',
                        dealId: dealData.deal._id,
                        amount: offerAmount
                    })
                });
            } else {
                throw new Error('Invalid deal data received');
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const messageElement = document.createElement('div');
                messageElement.classList.add('chat-bubble', 'sender', 'deal-message');
                messageElement.textContent = 'You accepted the offer!';
                chatMessages.appendChild(messageElement);
                dealBtn.style.display = 'none';
                rejectBtn.style.display = 'none';
                showDealComplete(true, offerAmount, data.dealId);
            }
        })
        .catch(error => {
            console.error('Error handling deal:', error);
            alert('Failed to process deal: ' + error.message);
        });
    });

    // Update the message display to handle offers and deals
    function displayMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-bubble');
        messageElement.classList.add(message.sender._id === userId ? 'sender' : 'receiver');

        if (message.text.startsWith('OFFER:')) {
            messageElement.classList.add('offer-message');
            // Show deal and reject buttons to seller when offer is received
            if (isUserSeller && message.sender._id !== userId) {
                dealBtn.style.display = 'block';
                rejectBtn.style.display = 'block';
            }
        } else if (message.text === 'DEAL ACCEPTED!') {
            messageElement.classList.add('deal-message');
            dealBtn.style.display = 'none';
            rejectBtn.style.display = 'none';
            offerBtn.style.display = 'none';
            offerInput.style.display = 'none';

            // Add payment button for buyer
            if (!isUserSeller) {
                messageElement.classList.add('payment-message');
                messageElement.addEventListener('click', () => {
                    window.location.href = `payment.html?dealId=${message.dealId}&amount=${message.amount}`;
                });
            }
        } else if (message.text === 'OFFER REJECTED!') {
            messageElement.classList.add('reject-message');
            dealBtn.style.display = 'none';
            rejectBtn.style.display = 'none';
            // Allow buyer to make new offer after rejection
            if (!isUserSeller) {
                offerBtn.style.display = 'block';
                offerInput.style.display = 'block';
            }
        }

        messageElement.textContent = `${message.sender.username === userId ? 'You' : message.sender.username}: ${message.text}`;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Update showDealComplete function
    function showDealComplete(isSeller, amount, dealId) {
        console.log('Showing deal complete with:', { isSeller, amount, dealId }); // Debug log
        
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        
        const popup = document.createElement('div');
        popup.className = 'deal-popup';
        
        popup.innerHTML = `
            <div id="dealAnimation"></div>
            <h2>Deal Completed!</h2>
            <p>${isSeller ? 'You have accepted the offer!' : 'Your offer has been accepted!'}</p>
            <p>Amount: $${amount}</p>
            ${!isSeller ? 
                `<button class="payment-button" onclick="window.location.href='payment.html?dealId=${dealId._id || dealId}&amount=${amount}'">
                    Proceed to Payment
                </button>` : 
                '<p>Waiting for buyer to complete payment...</p>'
            }
        `;
        
        document.body.appendChild(overlay);
        document.body.appendChild(popup);

        // Load Lottie animation
        lottie.loadAnimation({
            container: document.getElementById('dealAnimation'),
            renderer: 'svg',
            loop: true,
            autoplay: true,
            path: 'animations\Animation - 1738914521622.json'
        });

        // Auto close popup after 5 seconds for seller
        if (isSeller) {
            setTimeout(() => {
                overlay.remove();
                popup.remove();
            }, 5000);
        }
    }

    // Add a function to check pending deals
    function checkPendingDeals() {
        fetch(`https://fed-s10270642j-s10267318g-assignment2.onrender.com/deals/pending/${userId}`)
            .then(response => response.json())
            .then(deals => {
                deals.forEach(deal => {
                    if (deal.status === 'pending') {
                        const isSeller = deal.seller._id === userId;
                        // Pass the deal._id as the dealId
                        showDealComplete(isSeller, deal.price, deal._id);
                    }
                });
            })
            .catch(error => {
                console.error('Error checking pending deals:', error);
            });
    }

    // Call checkPendingDeals when page loads
    checkPendingDeals();
});