// ==================== CENTRINĖS DALIES LOGIKA ====================

console.log('✅ center.js įkeltas!');

function updateCenterPlayerCard() {
    const currentPlayer = players[currentPlayerIndex];
    const leftPanel = document.querySelector('.center-left-panel');
    if (!leftPanel) {
        console.log('Kairės panelės nerasta - laukiama...');
        return;
    }
    
    console.log('Atnaujinama žaidėjo kortelė:', currentPlayer?.name || 'Nežinomas');
    
    let propertiesHtml = '<div class="player-properties-title">🏠 Nuosavybės:</div>';
    propertiesHtml += '<div class="properties-mini-grid">';
    
    if (currentPlayer && currentPlayer.properties && currentPlayer.properties.length > 0) {
        const sortedProperties = sortPropertiesByPriceAndColor(currentPlayer.properties, currentPlayer);
        sortedProperties.forEach(prop => {
            const cellData = getCellById(prop.id);
            if (!cellData) return;
            
            let colorIcon = '📌';
            let colorClass = '';
            if (cellData.color) {
                const colors = { 
                    'brown': '🟤', 'lightblue': '🔵', 'orange': '🟠', 
                    'yellow': '🟡', 'red': '🔴', 'purple': '🟣', 
                    'bronze': '🥉', 'butelka': '🍾', 'lime': '🟢', 
                    'brightblue': '💙' 
                };
                colorIcon = colors[cellData.color] || '📌';
                colorClass = `prop-color-${cellData.color}`;
            }
            const houses = currentPlayer.houses[prop.id] || 0;
            const houseIcon = houses === 5 ? '🏨' : houses > 0 ? '🏠'.repeat(houses) : '';
            const isPledged = currentPlayer.pledgedProperties && currentPlayer.pledgedProperties.some(p => p.id === prop.id);
            
            propertiesHtml += `
                <div class="prop-mini-card ${colorClass} ${isPledged ? 'pledged-mini' : ''}" 
                     data-prop-id="${prop.id}"
                     data-prop-name="${cellData.name}"
                     data-prop-price="${cellData.price || 0}"
                     data-prop-houses="${houses}"
                     data-prop-position="${cellData.id}"
                     title="${cellData.name}${isPledged ? ' (Įkeista)' : ''}${houseIcon ? ' - ' + houseIcon : ''}">
                    <div class="prop-mini-icon">${isPledged ? '🔒' : colorIcon}</div>
                    <div class="prop-mini-houses">${houseIcon}</div>
                </div>
            `;
        });
    } else {
        propertiesHtml += '<div class="prop-mini-empty">📭 Nėra nuosavybių</div>';
    }
    propertiesHtml += '</div>';
    
    let totalWealth = currentPlayer ? currentPlayer.money : 0;
    if (currentPlayer && currentPlayer.properties) {
        currentPlayer.properties.forEach(prop => {
            const cellData = getCellById(prop.id);
            if (cellData) {
                totalWealth += cellData.price || 0;
                const houses = currentPlayer.houses[prop.id] || 0;
                totalWealth += houses * 50;
            }
        });
    }
    
    leftPanel.innerHTML = `
        <div class="center-player-card-placeholder">
            <div class="center-player-figure">${currentPlayer?.figure || '🚗'}</div>
            <div class="center-player-name">${currentPlayer?.name || 'Žaidėjas'} (${currentPlayer?.figureName || 'Automobilis'})</div>
            <div class="center-player-money">💰 ${currentPlayer?.money || 1500}€</div>
            <div class="center-player-position">📍 Pozicija: ${currentPlayer?.position || 1}</div>
            <div class="center-player-properties">
                <div class="player-properties-title">🏠 Nuosavybės:</div>
                ${propertiesHtml}
            </div>
            <div class="center-player-wealth">💎 Visas turtas: ${totalWealth}€</div>
            <div class="center-player-buttons">
                <button class="center-pledge-btn">🏦 ĮKEISTI</button>
                <button class="center-sell-btn">💰 PARDUOTI</button>
                <button class="center-destroy-btn">🏚️ GRIAUTI NAMELIUS</button>
            </div>
        </div>
        <div id="playersListContainer"></div>
    `;
    
    const pledgeBtn = leftPanel.querySelector('.center-pledge-btn');
    const sellBtn = leftPanel.querySelector('.center-sell-btn');
    const destroyBtn = leftPanel.querySelector('.center-destroy-btn');
    
    if (pledgeBtn) pledgeBtn.onclick = () => openPledgeModal?.(currentPlayer);
    if (sellBtn) sellBtn.onclick = () => openSellOptionsModal?.(currentPlayer);
    if (destroyBtn) destroyBtn.onclick = () => openDestroyHousesModal?.(currentPlayer);
    
    updatePlayersList();
}

function updatePlayersList() {
    const container = document.getElementById('playersListContainer');
    if (!container) return;
    
    let html = '<div class="players-list-title">👥 KITI ŽAIDĖJAI</div>';
    html += '<div class="players-list">';
    
    for (let i = 0; i < players.length; i++) {
        const player = players[i];
        if (!player) continue;
        if (player.id === currentPlayerIndex) continue;
        
        const isActive = !player.bankrupt;
        const activeClass = isActive ? 'player-active' : 'player-inactive';
        
        html += `
            <div class="player-list-item ${activeClass}" data-player-id="${player.id}" data-player-name="${player.name}" data-player-figure="${player.figure}" data-player-money="${player.money}" data-player-position="${player.position}" data-player-figurename="${player.figureName}">
                <div class="player-list-figure">${player.figure}</div>
                <div class="player-list-name">${player.name}</div>
                <div class="player-list-money">💰 ${player.money}€</div>
            </div>
        `;
    }
    
    html += '</div>';
    container.innerHTML = html;
    
    document.querySelectorAll('.player-list-item').forEach(item => {
        item.addEventListener('mouseenter', showPlayerHoverInfo);
        item.addEventListener('mouseleave', hidePlayerHoverInfo);
    });
}

function showPlayerHoverInfo(e) {
    const item = e.currentTarget;
    const playerId = parseInt(item.dataset.playerId);
    const player = players[playerId];
    if (!player) return;
    
    hidePlayerHoverInfo();
    
    const hoverCard = document.createElement('div');
    hoverCard.className = 'player-hover-card';
    hoverCard.id = 'playerHoverCard';
    
    let propertiesHtml = '';
    if (player.properties && player.properties.length > 0) {
        player.properties.forEach(prop => {
            const cellData = getCellById(prop.id);
            const houses = player.houses[prop.id] || 0;
            const houseIcon = houses === 5 ? '🏨' : houses > 0 ? '🏠'.repeat(houses) : '';
            propertiesHtml += `<div>🏠 ${cellData?.name || prop.name} ${houseIcon}</div>`;
        });
    } else {
        propertiesHtml = '<div>📭 Nėra nuosavybių</div>';
    }
    
    let totalWealth = player.money;
    if (player.properties) {
        player.properties.forEach(prop => {
            const cellData = getCellById(prop.id);
            if (cellData) {
                totalWealth += cellData.price || 0;
                const houses = player.houses[prop.id] || 0;
                totalWealth += houses * 50;
            }
        });
    }
    
    hoverCard.innerHTML = `
        <div class="player-hover-content">
            <div class="player-hover-figure">${player.figure}</div>
            <div class="player-hover-name">${player.name} (${player.figureName})</div>
            <div class="player-hover-money">💰 ${player.money}€</div>
            <div class="player-hover-position">📍 Pozicija: ${player.position}</div>
            <div class="player-hover-wealth">💎 Visas turtas: ${totalWealth}€</div>
            <div class="player-hover-properties">
                <div class="player-hover-properties-title">🏠 Nuosavybės:</div>
                ${propertiesHtml}
            </div>
        </div>
    `;
    
    document.body.appendChild(hoverCard);
    
    const rect = item.getBoundingClientRect();
    let left = rect.right + 10;
    let top = rect.top - 20;
    
    if (left + 240 > window.innerWidth) {
        left = rect.left - 250;
    }
    if (top + 300 > window.innerHeight) {
        top = window.innerHeight - 310;
    }
    if (top < 10) top = 10;
    
    hoverCard.style.left = left + 'px';
    hoverCard.style.top = top + 'px';
}

function hidePlayerHoverInfo() {
    const hoverCard = document.getElementById('playerHoverCard');
    if (hoverCard) hoverCard.remove();
}

function addCenterLog(message) {
    const logList = document.getElementById('centerLogList');
    if (!logList) return;
    
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    logEntry.innerHTML = message;
    logList.appendChild(logEntry);
    logList.scrollTop = logList.scrollHeight;
    
    while (logList.children.length > 100) {
        logList.removeChild(logList.firstChild);
    }
}

function initCenterChat() {
    const emojis = ['😊', '🎲', '🏆', '💀', '🔥', '🎉', '😂', '🍺', '🚀', '👑', '🤡', '💎', '💰'];
    const emojiBar = document.getElementById('centerChatEmojis');
    if (emojiBar) {
        emojiBar.innerHTML = '';
        emojis.forEach(emoji => {
            const btn = document.createElement('button');
            btn.innerHTML = emoji;
            btn.style.cssText = 'background:#2e7d32; color:#ffd700; border:1px solid #ffd700; border-radius:15px; padding:2px 6px; font-size:12px; cursor:pointer; margin:2px;';
            btn.onclick = () => {
                const input = document.getElementById('centerChatInput');
                if (input) input.value += emoji;
            };
            emojiBar.appendChild(btn);
        });
    }
    
    const sendBtn = document.getElementById('centerChatSendBtn');
    const input = document.getElementById('centerChatInput');
    
    if (sendBtn) {
        sendBtn.onclick = () => {
            const message = input?.value.trim();
            if (!message) return;
            const currentPlayer = players[currentPlayerIndex];
            addCenterChatMessage(`${currentPlayer.figure} ${currentPlayer.name}: ${message}`, false);
            if (input) input.value = '';
        };
    }
    if (input) {
        input.onkeypress = (e) => { if (e.key === 'Enter') sendBtn?.click(); };
    }
    
    const chatMessages = document.getElementById('centerChatMessages');
    if (chatMessages && chatMessages.children.length === 0) {
        addCenterChatMessage('Pokalbio pradžia!', true);
    }
}

function addCenterChatMessage(message, isSystem = false) {
    const chatMessages = document.getElementById('centerChatMessages');
    if (!chatMessages) return;
    
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${isSystem ? 'system' : 'player'}`;
    msgDiv.innerHTML = message;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    while (chatMessages.children.length > 200) {
        chatMessages.removeChild(chatMessages.firstChild);
    }
}

// ========== PAPILDOMOS FUNKCIJOS STALO INFO ==========
function updateCenterStats() {
    const playerCountSpan = document.getElementById('playerCountDisplay');
    const gameCodeSpan = document.getElementById('gameCodeDisplayCenter');
    
    // GAUNAME TIKRĄ ŽAIDĖJŲ SKAIČIŲ
    let currentPlayers = [];
    if (typeof players !== 'undefined' && players && players.length > 0) {
        currentPlayers = players;
    } else if (window.players && window.players.length > 0) {
        currentPlayers = window.players;
    }
    
    // GAUNAME MAKSIMALŲ ŽAIDĖJŲ SKAIČIŲ IŠ FIREBASE
    if (window.gameId && window.database) {
        window.database.ref('games/' + window.gameId).once('value').then(snapshot => {
            const game = snapshot.val();
            const maxPlayers = game?.maxPlayers || 6;
            if (playerCountSpan) {
                const activePlayersCount = currentPlayers.filter(p => p && !p.bankrupt).length;
                playerCountSpan.innerText = `${activePlayersCount}/${maxPlayers}`;
                console.log("📊 Atnaujintas žaidėjų skaičius:", activePlayersCount, "/", maxPlayers);
            }
        });
    } else {
        if (playerCountSpan) {
            const activePlayersCount = currentPlayers.filter(p => p && !p.bankrupt).length;
            playerCountSpan.innerText = `${activePlayersCount}/6`;
        }
    }
    
    // Atnaujinti stalo kodą
    if (gameCodeSpan && window.gameId) {
        gameCodeSpan.innerText = window.gameId;
    }
    
    // 🆕 Atnaujinti figūrėlę – kiekvienas žaidėjas mato savo
    const figureSpan = document.getElementById('playerFigureDisplay');
    if (figureSpan) {
        const savedPlayerName = localStorage.getItem(`player_${window.gameId}`);
        if (savedPlayerName) {
            const localPlayer = players.find(p => p.name === savedPlayerName);
            if (localPlayer) {
                figureSpan.innerText = localPlayer.figure;
            }
        }
    }
}

// Perrašyti addLog funkciją
const originalAddLog = window.addLog;
window.addLog = function(message) {
    if (originalAddLog) originalAddLog(message);
    addCenterLog(message);
};

// Atnaujinti kortelę kai keičiasi žaidėjas
const originalUpdateUI = window.updateUI;
window.updateUI = function() {
    if (originalUpdateUI) originalUpdateUI();
    updateCenterPlayerCard();
    updateCenterStats();
    // Atnaujiname žetonus (figūrėles)
    if (typeof updateAllPlayerTokens === 'function') {
        updateAllPlayerTokens();
    }
};

const originalUpdatePlayersCards = window.updatePlayersCards;
window.updatePlayersCards = function() {
    if (originalUpdatePlayersCards) originalUpdatePlayersCards();
    updateCenterPlayerCard();
    updateCenterStats();
    // Atnaujiname žetonus (figūrėles)
    if (typeof updateAllPlayerTokens === 'function') {
        updateAllPlayerTokens();
    }
};

// Inicijuoti
document.addEventListener('DOMContentLoaded', () => {
    console.log('center.js DOMContentLoaded');
    setTimeout(() => {
        updateCenterPlayerCard();
        initCenterChat();
        updateCenterStats();
        // Pradžioje atnaujiname žetonus
        if (typeof updateAllPlayerTokens === 'function') {
            updateAllPlayerTokens();
        }
    }, 500);
});

// Periodiškai atnaujinti statistiką
setInterval(updateCenterStats, 1000);