document.addEventListener('DOMContentLoaded', () => {
    // Supabase initialization
    // Replace these with your actual Supabase project URL and anon key
    const SUPABASE_URL = 'https://nftxdkdtegdndwcdcyje.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mdHhka2R0ZWdkbmR3Y2RjeWplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyOTgzNTYsImV4cCI6MjA1OTg3NDM1Nn0.T3YsgBKvXVdTFP4Qy94UPGkTmDIw5-W2C8f5P-84Bv0';
    
    // Create Supabase client with proper headers
    const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        },
        global: {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
        }
    });
    
    // Test the connection first
    async function testSupabaseConnection() {
        try {
            console.log("Testing Supabase connection...");
            const { data, error } = await supabaseClient.from('players').select('*').limit(1);
            
            if (error) {
                console.error("Supabase connection test failed:", error);
                alert("Failed to connect to the leaderboard. Please check your connection and try again.");
                return false;
            }
            
            console.log("Supabase connection successful!", data);
            return true;
        } catch (err) {
            console.error("Supabase connection error:", err);
            alert("Error connecting to leaderboard server.");
            return false;
        }
    }
    
    // Test connection on startup
    testSupabaseConnection();
    
    // Game elements
    const startScreen = document.getElementById('start-screen');
    const endScreen = document.getElementById('end-screen');
    const gameArea = document.getElementById('game-area');
    const timeDisplay = document.getElementById('time');
    const scoreDisplay = document.getElementById('score');
    const finalScoreDisplay = document.getElementById('final-score');
    const startButton = document.getElementById('start-button');
    const playAgainButton = document.getElementById('play-again');
    const shareButton = document.getElementById('share-button');
    const playerModal = document.getElementById('player-modal');
    const playerForm = document.getElementById('player-form');
    const displayNameInput = document.getElementById('display-name');
    const emailInput = document.getElementById('email');
    const highScoreMessage = document.getElementById('high-score-message');
    const leaderboardList = document.getElementById('leaderboard-list');
    const leaderboardListEnd = document.getElementById('leaderboard-list-end');
    
    // Player data
    let playerData = {
        displayName: localStorage.getItem('tt_displayName') || '',
        email: localStorage.getItem('tt_email') || '',
        id: localStorage.getItem('tt_playerId') || '',
        highScore: 0
    };
    
    // Game state
    let score = 0;
    let timeLeft = 30;
    let timer;
    let isGameRunning = false;
    let itemInterval;
    let isNewHighScore = false;
    
    // Create tariff hand element
    const tariffHand = document.createElement('div');
    tariffHand.className = 'tariff-hand';
    tariffHand.textContent = '👋';
    gameArea.appendChild(tariffHand);
    
    // Game items
    const imports = [
        { emoji: '🐼', isImport: true },
        { emoji: '🇨🇳', isImport: true },
        { emoji: '🇯🇵', isImport: true },
        { emoji: '🇰🇷', isImport: true },
        { emoji: '🇲🇽', isImport: true },
        { emoji: '🇩🇪', isImport: true },
        { emoji: '🇮🇹', isImport: true },
        { emoji: '🇫🇷', isImport: true },
        { emoji: '🇮🇳', isImport: true },
        { emoji: '🇷🇺', isImport: true },
        { emoji: '🇧🇷', isImport: true },
        { emoji: '🎧', isImport: true },
        { emoji: '🚗', isImport: true },
        { emoji: '📱', isImport: true },
        { emoji: '💻', isImport: true },
        { emoji: '👟', isImport: true },
        { emoji: '👕', isImport: true },
        { emoji: '🧸', isImport: true },
        { emoji: '🚲', isImport: true },
        { emoji: '⌚', isImport: true },
        { emoji: '📺', isImport: true },
        { emoji: '🍜', isImport: true },
        { emoji: '🍵', isImport: true },
        { emoji: '🍚', isImport: true }
    ];
    
    const americanGoods = [
        { emoji: '🍔', isImport: false },
        { emoji: '🗽', isImport: false },
        { emoji: '🦅', isImport: false },
        { emoji: '🎸', isImport: false },
        { emoji: '🧢', isImport: false },
        { emoji: '🇺🇸', isImport: false },
        { emoji: '🌭', isImport: false },
        { emoji: '🏈', isImport: false },
        { emoji: '🥧', isImport: false },
        { emoji: '🍕', isImport: false },
        { emoji: '🚀', isImport: false },
        { emoji: '🚜', isImport: false }
    ];
    
    const allItems = [...imports, ...americanGoods];
    
    // Event listeners
    startButton.addEventListener('click', startGame);
    playAgainButton.addEventListener('click', startGame);
    shareButton.addEventListener('click', shareScore);
    gameArea.addEventListener('click', handleGameAreaClick);
    playerForm.addEventListener('submit', handlePlayerFormSubmit);
    
    // Move tariff hand with mouse/touch
    gameArea.addEventListener('mousemove', (e) => {
        const rect = gameArea.getBoundingClientRect();
        tariffHand.style.left = `${e.clientX - rect.left}px`;
        tariffHand.style.top = `${e.clientY - rect.top}px`;
    });
    
    gameArea.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const rect = gameArea.getBoundingClientRect();
        const touch = e.touches[0];
        tariffHand.style.left = `${touch.clientX - rect.left}px`;
        tariffHand.style.top = `${touch.clientY - rect.top}px`;
    });
    
    // Initialize: Get leaderboard data and check for existing player
    initializeGame();
    
    // Functions
    async function initializeGame() {
        loadLeaderboard();
        
        // Check if player exists
        if (playerData.id) {
            await getPlayerHighScore();
        }
    }
    
    async function loadLeaderboard() {
        try {
            // First try with an asterisk to get whatever columns are available
            const { data, error } = await supabaseClient
                .from('players')
                .select('*')
                .order('score', { ascending: false })
                .limit(3);
                
            if (error) throw error;
            
            renderLeaderboard(data, leaderboardList);
            renderLeaderboard(data, leaderboardListEnd);
        } catch (error) {
            console.error('Error loading leaderboard:', error);
            leaderboardList.innerHTML = '<p>Failed to load leaderboard</p>';
            leaderboardListEnd.innerHTML = '<p>Failed to load leaderboard</p>';
        }
    }
    
    function renderLeaderboard(players, container) {
        if (!players || players.length === 0) {
            container.innerHTML = '<p>No scores yet. Be the first!</p>';
            return;
        }
        
        const medals = ['🥇', '🥈', '🥉'];
        let html = '';
        
        players.forEach((player, index) => {
            // Adapt to different column names
            const playerId = player.id || player.player_id || player.uuid;
            const playerName = player.display_name || player.name || player.player_name || 'Anonymous';
            const playerScore = player.score || 0;
            
            const isCurrentPlayer = playerId && playerId === playerData.id;
            html += `
                <div class="leaderboard-entry ${isCurrentPlayer ? 'player-score' : ''}">
                    <span class="medal">${medals[index]}</span>
                    <span class="player-info">${playerName}</span>
                    <span class="score">${playerScore}</span>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }
    
    async function getPlayerHighScore() {
        try {
            const { data, error } = await supabaseClient
                .from('players')
                .select('*')
                .eq('email', playerData.email)  // Using email instead of id for lookups
                .single();
                
            if (error) throw error;
            
            if (data) {
                // Find the appropriate primary key
                const idField = 'id' in data ? 'id' : 
                               ('player_id' in data ? 'player_id' : 
                               ('uuid' in data ? 'uuid' : null));
                
                if (idField) {
                    playerData.id = data[idField];
                    localStorage.setItem('tt_playerId', data[idField]);
                }
                
                playerData.highScore = data.score || 0;
            }
        } catch (error) {
            console.error('Error getting player high score:', error);
        }
    }
    
    function startGame() {
        // Reset game state
        score = 0;
        timeLeft = 30;
        isGameRunning = true;
        isNewHighScore = false;
        highScoreMessage.classList.add('hidden');
        
        // Update UI
        scoreDisplay.textContent = score;
        timeDisplay.textContent = timeLeft;
        startScreen.classList.add('hidden');
        endScreen.classList.add('hidden');
        
        // Remove any existing items
        document.querySelectorAll('.item').forEach(item => item.remove());
        
        // Start timer
        timer = setInterval(updateTimer, 1000);
        
        // Start spawning items
        itemInterval = setInterval(spawnItem, 1000);
    }
    
    function updateTimer() {
        timeLeft--;
        timeDisplay.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            endGame();
        }
    }
    
    async function endGame() {
        isGameRunning = false;
        clearInterval(timer);
        clearInterval(itemInterval);
        
        // Show end screen
        finalScoreDisplay.textContent = score;
        
        // Check if we need to get player info
        const needsPlayerInfo = !playerData.displayName || !playerData.email;
        
        // Check if this is a new high score
        if (!needsPlayerInfo && playerData.id) {
            if (score > playerData.highScore) {
                isNewHighScore = true;
                highScoreMessage.classList.remove('hidden');
                playerData.highScore = score;
                
                // Update score in Supabase
                await updatePlayerScore();
            }
        }
        
        // Refresh leaderboard
        await loadLeaderboard();
        
        if (needsPlayerInfo) {
            // Show player info modal
            playerModal.classList.remove('hidden');
        } else {
            // Show end screen
            endScreen.classList.remove('hidden');
        }
    }
    
    async function handlePlayerFormSubmit(e) {
        e.preventDefault();
        
        const displayName = displayNameInput.value.trim();
        const email = emailInput.value.trim();
        
        if (!displayName || !email) return;
        
        // Save to localStorage
        localStorage.setItem('tt_displayName', displayName);
        localStorage.setItem('tt_email', email);
        
        playerData.displayName = displayName;
        playerData.email = email;
        
        // Create or update player in Supabase
        await savePlayerToSupabase();
        
        // Hide modal
        playerModal.classList.add('hidden');
        
        // Show end screen
        endScreen.classList.remove('hidden');
    }
    
    async function savePlayerToSupabase() {
        try {
            console.log("Starting player save process...");
            
            // Check if player exists with this email
            const { data: existingPlayer, error: lookupError } = await supabaseClient
                .from('players')
                .select('*')
                .eq('email', playerData.email)
                .single();
                
            // Log full error details for diagnosis
            if (lookupError) {
                console.log("Player lookup full error:", JSON.stringify(lookupError));
            }
            
            if (lookupError && lookupError.code !== 'PGRST116') {
                // Real error, not just "no rows returned"
                console.error("Error looking up player:", lookupError);
                throw lookupError;
            }
            
            if (existingPlayer) {
                console.log("Found existing player:", existingPlayer);
                // Find the appropriate ID field
                const idField = 'id' in existingPlayer ? 'id' : 
                               ('player_id' in existingPlayer ? 'player_id' : 
                               ('uuid' in existingPlayer ? 'uuid' : null));
                
                if (idField) {
                    playerData.id = existingPlayer[idField];
                    localStorage.setItem('tt_playerId', existingPlayer[idField]);
                }
                
                playerData.highScore = existingPlayer.score || 0;
                
                if (score > playerData.highScore) {
                    isNewHighScore = true;
                    highScoreMessage.classList.remove('hidden');
                    
                    // Update in Supabase
                    await updatePlayerScore();
                }
            } else {
                console.log("Creating new player:", playerData.displayName);
                
                // Try to determine the table structure first
                const tableStructure = await getTableStructure();
                console.log("Table structure:", tableStructure);
                
                // Create player data based on actual table structure
                let newPlayerData = {};
                
                // Handle different possible column names
                if (tableStructure.includes('display_name')) {
                    newPlayerData.display_name = playerData.displayName;
                } else if (tableStructure.includes('name')) {
                    newPlayerData.name = playerData.displayName;
                } else if (tableStructure.includes('player_name')) {
                    newPlayerData.player_name = playerData.displayName;
                } else {
                    // Default to display_name if we can't determine
                    newPlayerData.display_name = playerData.displayName;
                }
                
                // Email should be standard
                newPlayerData.email = playerData.email;
                
                // Score should be standard
                newPlayerData.score = score;
                
                console.log("Inserting new player data:", newPlayerData);
                
                // Use a simpler insert without requesting return data first
                const { error: insertError } = await supabaseClient
                    .from('players')
                    .insert([newPlayerData]);
                    
                if (insertError) {
                    console.error("Error creating player:", insertError);
                    console.log("Full insert error:", JSON.stringify(insertError));
                    throw insertError;
                } else {
                    console.log("Player created successfully!");
                    
                    // Now try to retrieve the created player
                    const { data: createdPlayer, error: fetchError } = await supabaseClient
                        .from('players')
                        .select('*')
                        .eq('email', playerData.email)
                        .single();
                        
                    if (fetchError) {
                        console.error("Error fetching created player:", fetchError);
                    } else if (createdPlayer) {
                        console.log("Retrieved created player:", createdPlayer);
                        // Find the appropriate ID field
                        const idField = 'id' in createdPlayer ? 'id' : 
                                    ('player_id' in createdPlayer ? 'player_id' : 
                                    ('uuid' in createdPlayer ? 'uuid' : null));
                        
                        if (idField) {
                            playerData.id = createdPlayer[idField];
                            localStorage.setItem('tt_playerId', createdPlayer[idField]);
                        }
                        
                        playerData.highScore = score;
                        isNewHighScore = true;
                        highScoreMessage.classList.remove('hidden');
                    }
                }
            }
            
            // Refresh leaderboard
            await loadLeaderboard();
            
        } catch (error) {
            console.error('Error saving player:', error);
            alert('There was an error saving your score. The leaderboard might not be working properly.');
        }
    }
    
    // Helper function to get table structure
    async function getTableStructure() {
        try {
            // Try a query with asterisk to see what we get
            const { data, error } = await supabaseClient
                .from('players')
                .select('*')
                .limit(1);
                
            if (error || !data || data.length === 0) {
                return ['display_name', 'email', 'score']; // Default columns
            }
            
            return Object.keys(data[0]);
        } catch (error) {
            console.error('Error getting table structure:', error);
            return ['display_name', 'email', 'score']; // Default columns
        }
    }
    
    async function updatePlayerScore() {
        // If we don't have an ID, try finding the player by email
        if (!playerData.id && playerData.email) {
            try {
                console.log("Looking up player by email for score update");
                const { data, error } = await supabaseClient
                    .from('players')
                    .select('*')
                    .eq('email', playerData.email)
                    .single();
                    
                if (error) {
                    console.error("Error finding player by email:", error);
                } else if (data) {
                    console.log("Found player by email:", data);
                    // Find the appropriate ID field
                    const idField = 'id' in data ? 'id' : 
                                  ('player_id' in data ? 'player_id' : 
                                  ('uuid' in data ? 'uuid' : null));
                    
                    if (idField) {
                        playerData.id = data[idField];
                    }
                }
            } catch (error) {
                console.error('Error finding player by email:', error);
            }
        }
        
        if (!playerData.id && !playerData.email) {
            console.error("Cannot update score: No player ID or email");
            return;
        }
        
        try {
            console.log("Updating player score to:", score);
            
            // Get table structure to know what columns to use
            const tableStructure = await getTableStructure();
            console.log("Table structure for update:", tableStructure);
            
            // First try direct update
            const updatePayload = { score: score };
            
            let updateCondition;
            if (playerData.id) {
                // Use appropriate ID field if we have it
                const possibleIdFields = ['id', 'player_id', 'uuid'];
                const existingIdField = possibleIdFields.find(field => tableStructure.includes(field));
                
                if (existingIdField) {
                    updateCondition = { [existingIdField]: playerData.id };
                    console.log(`Using ${existingIdField} = ${playerData.id} for update condition`);
                } else {
                    updateCondition = { email: playerData.email };
                    console.log(`Using email = ${playerData.email} for update condition`);
                }
            } else {
                // Fall back to email
                updateCondition = { email: playerData.email };
                console.log(`Using email = ${playerData.email} for update condition`);
            }
            
            // Try the update using a simpler method to avoid filter syntax errors
            const { error } = await supabaseClient
                .from('players')
                .update(updatePayload)
                .match(updateCondition);
                
            if (error) {
                console.error("Error updating score:", error);
                console.log("Full update error:", JSON.stringify(error));
                throw error;
            } else {
                console.log("Score updated successfully");
            }
            
        } catch (error) {
            console.error('Error updating score:', error);
            // Don't show an alert here as it's not critical for gameplay
        }
    }
    
    function spawnItem() {
        if (!isGameRunning) return;
        
        const gameAreaRect = gameArea.getBoundingClientRect();
        const randomItem = allItems[Math.floor(Math.random() * allItems.length)];
        
        const item = document.createElement('div');
        item.className = 'item';
        item.textContent = randomItem.emoji;
        item.dataset.isImport = randomItem.isImport;
        item.dataset.clicked = "false"; // Add clicked property to prevent multiple clicks
        
        // Random starting position (top or sides)
        const startPosition = Math.random();
        
        if (startPosition < 0.33) {
            // From top
            item.style.top = '-50px';
            item.style.left = `${Math.random() * (gameAreaRect.width - 50)}px`;
            animateItem(item, 'top', gameAreaRect.height + 50, 3 + Math.random() * 3);
        } else if (startPosition < 0.66) {
            // From left
            item.style.left = '-50px';
            item.style.top = `${Math.random() * (gameAreaRect.height - 50)}px`;
            animateItem(item, 'left', gameAreaRect.width + 50, 3 + Math.random() * 3);
        } else {
            // From right
            item.style.left = `${gameAreaRect.width + 50}px`;
            item.style.top = `${Math.random() * (gameAreaRect.height - 50)}px`;
            animateItem(item, 'left', -50, 3 + Math.random() * 3, true);
        }
        
        gameArea.appendChild(item);
    }
    
    function animateItem(item, property, endValue, duration, reverse = false) {
        const start = parseFloat(item.style[property]);
        const distance = reverse ? start - endValue : endValue - start;
        const startTime = performance.now();
        
        function step(currentTime) {
            if (!isGameRunning) {
                item.remove();
                return;
            }
            
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / (duration * 1000), 1);
            
            const currentPosition = reverse 
                ? start - (distance * progress)
                : start + (distance * progress);
                
            item.style[property] = `${currentPosition}px`;
            
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                item.remove();
            }
        }
        
        requestAnimationFrame(step);
    }
    
    function handleGameAreaClick(e) {
        if (!isGameRunning) return;
        
        // Activate tariff hand animation
        tariffHand.classList.add('active');
        setTimeout(() => {
            tariffHand.classList.remove('active');
        }, 200);
        
        // Check if clicked on an item
        const clickedItem = e.target.closest('.item');
        if (!clickedItem) return;
        
        // Check if this item has already been clicked
        if (clickedItem.dataset.clicked === "true") return;
        
        // Mark item as clicked to prevent multiple clicks
        clickedItem.dataset.clicked = "true";
        
        const isImport = clickedItem.dataset.isImport === 'true';
        let points = 0;
        
        if (isImport) {
            // Hit an import item = good!
            points = 100;
            score += points;
            clickedItem.classList.add('hit');
            showPoints(clickedItem, points, true);
        } else {
            // Hit an American item = bad!
            points = -500;
            score += points;
            clickedItem.classList.add('hit');
            showPoints(clickedItem, points, false);
        }
        
        // Update score display
        scoreDisplay.textContent = score;
        
        // Remove the item
        setTimeout(() => {
            clickedItem.remove();
        }, 200);
    }
    
    function showPoints(item, points, isPositive) {
        const pointsElement = document.createElement('div');
        pointsElement.className = `points ${isPositive ? 'positive' : 'negative'}`;
        pointsElement.textContent = points > 0 ? `+${points}` : points;
        
        // Position at item location
        const rect = item.getBoundingClientRect();
        const gameRect = gameArea.getBoundingClientRect();
        
        pointsElement.style.left = `${rect.left - gameRect.left + (rect.width / 2)}px`;
        pointsElement.style.top = `${rect.top - gameRect.top}px`;
        
        gameArea.appendChild(pointsElement);
        
        // Remove after animation completes
        setTimeout(() => {
            pointsElement.remove();
        }, 1000);
    }
    
    function shareScore() {
        const highScoreText = isNewHighScore ? " (NEW HIGH SCORE!)" : "";
        const text = `I just scored ${score} America First Points™${highScoreText} in #TariffTycoon. Can you beat me? 🇺🇸😂`;
        const url = window.location.href;
        
        // Create Twitter intent URL
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        
        // Open in new window
        window.open(twitterUrl, '_blank');
    }
}); 