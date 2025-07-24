        // Current selected plan
        let currentPlan = {
            name: '',
            price: 0
        };
        
        // DOM Elements
        const paymentModal = document.getElementById('paymentModal');
        const modalPlanTitle = document.getElementById('modalPlanTitle');
        const selectedPlanName = document.getElementById('selectedPlanName');
        const selectedPlanPrice = document.getElementById('selectedPlanPrice');
        const upiId = document.getElementById('upiId');
        const qrCodeImage = document.getElementById('qrCodeImage');
        const copyUpiBtn = document.getElementById('copyUpiBtn');
        const statusMessage = document.getElementById('statusMessage');
        const confirmPaymentBtn = document.getElementById('confirmPaymentBtn');
        const paymentMethods = document.querySelectorAll('.payment-method');
        const upiPayment = document.getElementById('upiPayment');
        const qrPayment = document.getElementById('qrPayment');
        
        // Select a plan
        function selectPlan(name, price) {
            currentPlan = { name, price };
            
            // Update modal with selected plan
            selectedPlanName.textContent = name;
            selectedPlanPrice.textContent = `₹${price}`;
            modalPlanTitle.textContent = `Pay for ${name}`;
            
            // Generate QR code URL
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=kushwaha.87@superyes&pn=Premium%20Upgrade&am=${price}&cu=INR`;
            qrCodeImage.src = qrUrl;
            
            // Show modal
            paymentModal.style.display = 'flex';
        }
        
        // Close modal
        function closeModal() {
            paymentModal.style.display = 'none';
            statusMessage.textContent = '';
        }
        
        // Payment method selection
        paymentMethods.forEach(method => {
            method.addEventListener('click', () => {
                paymentMethods.forEach(m => m.classList.remove('active'));
                method.classList.add('active');
                
                if (method.dataset.method === 'upi') {
                    upiPayment.classList.add('active');
                    qrPayment.classList.remove('active');
                } else {
                    upiPayment.classList.remove('active');
                    qrPayment.classList.add('active');
                }
            });
        });
        
        // Copy UPI ID
        copyUpiBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(upiId.textContent)
                .then(() => {
                    statusMessage.textContent = 'UPI ID copied to clipboard!';
                    copyUpiBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                    copyUpiBtn.style.background = 'var(--success)';
                    
                    setTimeout(() => {
                        statusMessage.textContent = '';
                        copyUpiBtn.innerHTML = '<i class="fas fa-copy"></i> Copy UPI ID';
                        copyUpiBtn.style.background = 'var(--primary)';
                    }, 2000);
                })
                .catch(err => {
                    console.error('Failed to copy: ', err);
                    statusMessage.textContent = 'Failed to copy UPI ID';
                    statusMessage.style.color = 'var(--danger)';
                });
        });
        
        // Confirm payment
        confirmPaymentBtn.addEventListener('click', () => {
            statusMessage.textContent = 'Thank you! We will verify your payment shortly.';
            statusMessage.style.color = 'var(--success)';
            confirmPaymentBtn.disabled = true;
            confirmPaymentBtn.innerHTML = '<i class="fas fa-check-circle"></i> Payment Received';
            confirmPaymentBtn.style.background = 'var(--success)';
            
            // In a real app, you would track the payment confirmation
            setTimeout(() => {
                closeModal();
                alert(`Thank you for purchasing ${currentPlan.name}! Your account will be upgraded soon.`);
                confirmPaymentBtn.disabled = false;
                confirmPaymentBtn.innerHTML = '<i class="fas fa-check-circle"></i> I\'ve Completed Payment';
                confirmPaymentBtn.style.background = 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)';
            }, 2000);
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target === paymentModal) {
                closeModal();
            }
        });

