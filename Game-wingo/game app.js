        function navigateTo(page) {
            // Optional: highlight selected card
            document.querySelectorAll('.card').forEach(card => {
                card.classList.remove('active');
            });
            event.currentTarget.classList.add('active');

            // Navigate
            window.location.href = page;
        }
        
        document.addEventListener('DOMContentLoaded', function() {
            const predictedNumberElement = document.getElementById('predictedNumber1');
            const issueNumberElement = document.getElementById('issueNumber1');
            const loadingElement = document.getElementById('loading');
            const refreshButton = document.getElementById('refreshButton');

            let currentIssueNumber = null;
            let timerInterval = null;

            const fetchGameIssue = () => {
                const requestData = {
                    typeId: 1,
                    language: 0,
                    random: "e7fe6c090da2495ab8290dac551ef1ed",
                    signature: "1F390E2B2D8A55D693E57FD905AE73A7",
                    timestamp: Math.floor(Date.now() / 1000)
                };

                return fetch('https://api.bdg88zf.com/api/webapi/GetGameIssue', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json;charset=UTF-8',
                        'Accept': 'application/json, text/plain, */*'
                    },
                    body: JSON.stringify(requestData)
                })
                .then(response => response.json())
                .catch(error => console.error('Error fetching game issue:', error));
            };

            const categorizeNumber = (number) => {
                return number >= 5 ? 'Big' : 'Small';
            };

            const generateRandomPrediction = () => {
                const randomNumber = Math.floor(Math.random() * 10);
                return {
                    number: randomNumber,
                    category: categorizeNumber(randomNumber),
                    premium: 'N/A'
                };
            };

            const updatePrediction = (newIssueNumber) => {
                if (currentIssueNumber !== newIssueNumber) {
                    currentIssueNumber = newIssueNumber;
                    issueNumberElement.value = `${currentIssueNumber}`;

                    loadingElement.style.display = 'block';

                    setTimeout(() => {
                        const currentPrediction = generateRandomPrediction();
                        predictedNumberElement.textContent = `RESULT: ${currentPrediction.number} ${currentPrediction.category}`;
                        
                        // Store prediction in sessionStorage
                        sessionStorage.setItem('lastPrediction', JSON.stringify(currentPrediction));
                        loadingElement.style.display = 'none';
                    }, 2000);
                }
            };

            refreshButton.addEventListener('click', function(e) {
                e.preventDefault();
                fetchGameIssue().then(data => {
                    if (data && data.data) {
                        updatePrediction(data.data.issueNumber);
                    }
                });
            });

            // Initialize with stored prediction or fetch new one
            const storedPrediction = sessionStorage.getItem('lastPrediction');
            if (storedPrediction) {
                const lastPrediction = JSON.parse(storedPrediction);
                predictedNumberElement.textContent = `RESULT: ${lastPrediction.number} (${lastPrediction.category})`;
            }

            fetchGameIssue().then(data => {
                if (data && data.data) {
                    updatePrediction(data.data.issueNumber);
                }
            });

            // Update when tab becomes visible
            document.addEventListener('visibilitychange', function() {
                if (document.visibilityState === 'visible') {
                    fetchGameIssue().then(data => {
                        if (data && data.data) {
                            updatePrediction(data.data.issueNumber);
                        }
                    });
                }
            });
        });