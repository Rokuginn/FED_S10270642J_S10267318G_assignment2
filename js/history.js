document.addEventListener('DOMContentLoaded', async () => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    const transactionsList = document.getElementById('transactionsList');
    const tabButtons = document.querySelectorAll('.tab-btn');
    let currentTab = 'all';

    async function fetchTransactions() {
        try {
            // Add loading state
            transactionsList.innerHTML = `
                <div class="loading-state">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Loading transactions...</p>
                </div>`;

            const response = await fetch(`https://fed-s10270642j-s10267318g-assignment2.onrender.com/deals/completed/${currentUser._id}`);
            const transactions = await response.json();

            // Debug logging
            console.log('Fetched transactions:', transactions);

            displayTransactions(transactions, currentTab);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            transactionsList.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Failed to load transactions. Please try again later.</p>
                </div>`;
        }
    }

    function displayTransactions(transactions, type) {
        if (!Array.isArray(transactions)) {
            console.error('Invalid transactions data:', transactions);
            return;
        }

        transactionsList.innerHTML = '';
        
        // Filter transactions based on type only, don't filter out null items
        const filteredTransactions = transactions.filter(transaction => {
            if (type === 'all') return true;
            if (type === 'buying') return transaction.buyer._id === currentUser._id;
            if (type === 'selling') return transaction.seller._id === currentUser._id;
            return false;
        });

        if (filteredTransactions.length === 0) {
            transactionsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-history"></i>
                    <p>No ${type === 'all' ? '' : type} transactions found</p>
                </div>`;
            return;
        }

        filteredTransactions.forEach(transaction => {
            const card = document.createElement('div');
            card.className = 'transaction-card';
            
            const formattedDate = new Date(transaction.timestamp).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            // Handle deleted items
            const defaultItemName = 'Completed Transaction';
            const defaultImagePath = 'images/sold-item-placeholder.png'; // Create a placeholder image for sold items
            
            card.innerHTML = `
            
                <div class="transaction-details">
                    <h3>${defaultItemName}</h3>
                    <div class="transaction-info">
                        <p>
                            <i class="fas fa-exchange-alt"></i>
                            ${transaction.buyer._id === currentUser._id ? 'Bought from' : 'Sold to'} 
                            ${transaction.buyer._id === currentUser._id ? transaction.seller.username : transaction.buyer.username}
                        </p>
                        <p class="transaction-amount">
                            <i class="fas fa-dollar-sign"></i>
                            $${transaction.price.toFixed(2)}
                        </p>
                        <p class="transaction-date">
                            <i class="fas fa-calendar"></i>
                            ${formattedDate}
                        </p>
                        <p class="transaction-status completed">
                            <i class="fas fa-check-circle"></i>
                            Completed
                        </p>
                    </div>
                </div>
            `;
            
            transactionsList.appendChild(card);
        });
    }

    // Tab switching functionality
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentTab = button.dataset.type;
            fetchTransactions();
        });
    });

    // Initial load
    fetchTransactions();
});