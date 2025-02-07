document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const dealId = params.get('dealId');
    const amount = params.get('amount');
    const totalAmount = document.getElementById('totalAmount');
    
    console.log('Payment page loaded with:', { dealId, amount }); // Debug log

    if (!dealId) {
        console.error('No deal ID provided');
        alert('Invalid payment session. Please try again.');
        window.location.href = 'chat.html';
        return;
    }
    
    if (amount) {
        totalAmount.textContent = `$${amount}`;
    }

    // Format card number with spaces
    document.getElementById('cardNumber').addEventListener('input', (e) => {
        let value = e.target.value.replace(/\s/g, '');
        if (value.length > 0) {
            value = value.match(new RegExp('.{1,4}', 'g')).join(' ');
        }
        e.target.value = value;
    });

    // Format expiry date
    document.getElementById('expiryDate').addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.slice(0, 2) + '/' + value.slice(2);
        }
        e.target.value = value;
    });

    // Update the form submission handler
    document.getElementById('paymentForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        // Basic validation
        const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
        const expiryDate = document.getElementById('expiryDate').value;
        const cvv = document.getElementById('cvv').value;
        const cardholderName = document.getElementById('cardholderName').value;

        if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
            alert('Please fill in all payment details');
            return;
        }

        // Validate card number format
        if (cardNumber.length !== 16 || !/^\d+$/.test(cardNumber)) {
            alert('Please enter a valid 16-digit card number');
            return;
        }

        // Validate expiry date format (MM/YY)
        if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
            alert('Please enter a valid expiry date (MM/YY)');
            return;
        }

        // Validate CVV
        if (!/^\d{3}$/.test(cvv)) {
            alert('Please enter a valid 3-digit CVV');
            return;
        }

        const submitButton = document.querySelector('.confirm-payment-btn');
        submitButton.disabled = true;
        submitButton.textContent = 'Processing...';

        try {
            console.log('Submitting payment for deal:', dealId); // Debug log
            const response = await fetch('https://fed-s10270642j-s10267318g-assignment2.onrender.com/deals/complete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    dealId: dealId,
                    paymentDetails: {
                        cardNumber: cardNumber.slice(-4),
                        expiryDate,
                        cardholderName
                    }
                })
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.message || `Payment failed with status ${response.status}`);
            }

            const result = await response.json();
            console.log('Payment result:', result); // Debug log

            if (result.success) {
                showSuccessAnimation();
            } else {
                throw new Error(result.message || 'Payment failed');
            }
        } catch (error) {
            console.error('Payment error:', error);
            alert('Payment failed: ' + error.message);
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Confirm Payment';
        }
    });

    function showSuccessAnimation() {
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        
        const popup = document.createElement('div');
        popup.className = 'success-popup';
        popup.innerHTML = `
            <div id="successAnimation"></div>
            <h2>Payment Successful!</h2>
            <p>Transaction completed</p>
        `;
        
        document.body.appendChild(overlay);
        document.body.appendChild(popup);

        lottie.loadAnimation({
            container: document.getElementById('successAnimation'),
            renderer: 'svg',
            loop: false,
            autoplay: true,
            path: 'animations\Animation - 1738914521622.json'
        });

        setTimeout(() => {
            window.location.href = 'chat.html';
        }, 3000);
    }
});