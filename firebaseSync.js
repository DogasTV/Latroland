// Firebase sinchronizacija

function syncGame() {
    const gameRef = database.ref('games/' + window.gameId);
    
    gameRef.child('players').on('value', (snapshot) => {
        const fbPlayers = snapshot.val();
        if (fbPlayers && fbPlayers.length > 0) {
            console.log("🔄 Gaunami žaidėjai iš Firebase:", fbPlayers);
            
            if (typeof players !== 'undefined') {
                fbPlayers.forEach((fbPlayer, index) => {
                    if (players[index]) {
                        players[index].name = fbPlayer.name;
                        players[index].money = fbPlayer.money;
                        players[index].position = fbPlayer.position;
                        players[index].figure = fbPlayer.figure;
                        players[index].figureName = fbPlayer.figureName;
                        players[index].properties = fbPlayer.properties || [];
                        players[index].houses = fbPlayer.houses || {};
                        players[index].pledgedProperties = fbPlayer.pledgedProperties || [];
                        players[index].bankrupt = fbPlayer.bankrupt || false;
                    } else {
                        players.push({
                            id: fbPlayer.id,
                            name: fbPlayer.name,
                            money: fbPlayer.money || 1500,
                            position: fbPlayer.position || 1,
                            figure: fbPlayer.figure || ['🚗', '🐕', '👞', '⛵', '🎩', '🐱'][index],
                            figureName: fbPlayer.figureName || ['Automobilis', 'Šuniukas', 'Batas', 'Laivas', 'Skrybėlė', 'Katė'][index],
                            properties: fbPlayer.properties || [],
                            houses: fbPlayer.houses || {},
                            pledgedProperties: fbPlayer.pledgedProperties || [],
                            bankrupt: fbPlayer.bankrupt || false,
                            x: 100,
                            y: 200 + (index * 120),
                            token: null
                        });
                    }
                });
            }
            
            activePlayers = players.length;
            
            if (typeof createAllPlayerTokens === 'function') {
                createAllPlayerTokens();
            }
            if (typeof updateAllPlayerTokens === 'function') {
                updateAllPlayerTokens();
            }
            if (typeof updateUI === 'function') updateUI();
            if (typeof updatePlayersCards === 'function') updatePlayersCards();
            if (typeof updateCellDisplayWithOwner === 'function') updateCellDisplayWithOwner();
            
            console.log("👥 Žaidėjai atnaujinti:", players.map(p => p.name));
        }
    });
    
    gameRef.child('currentPlayer').on('value', (snapshot) => {
        const newIndex = snapshot.val();
        if (newIndex !== undefined && newIndex !== null && typeof currentPlayerIndex !== 'undefined' && newIndex !== currentPlayerIndex) {
            currentPlayerIndex = newIndex;
            waitingForRoll = true;
            if (typeof updateUI === 'function') updateUI();
            if (typeof updatePlayersCards === 'function') updatePlayersCards();
            if (typeof addLog === 'function') addLog(`➡️ Dabar eina ${players[currentPlayerIndex]?.name}`);
            console.log("🔄 Sinchronizuotas žaidėjas:", currentPlayerIndex);
        }
    });
    
    gameRef.child('waitingForRoll').on('value', (snapshot) => {
        const waiting = snapshot.val();
        if (waiting !== undefined && waiting !== null) {
            window.waitingForRoll = waiting;
            console.log("🔄 Sinchronizuotas waitingForRoll:", waiting);
        }
    });
    
    gameRef.child('cellOwners').on('value', (snapshot) => {
        const owners = snapshot.val();
        if (owners) {
            for (let id = 1; id <= 48; id++) {
                const cell = getCellById(id);
                if (cell) {
                    if (owners[id] !== undefined && owners[id] !== null) {
                        cell.owner = owners[id];
                    } else {
                        delete cell.owner;
                    }
                }
            }
            if (typeof updateCellDisplayWithOwner === 'function') {
                updateCellDisplayWithOwner();
            }
            console.log("🔄 Sinchronizuoti langelių savininkai");
        }
    });
    
    gameRef.child('gameState').on('value', (snapshot) => {
        const state = snapshot.val();
        if (state && state.players && typeof players !== 'undefined') {
            state.players.forEach((savedPlayer, idx) => {
                if (players[idx]) {
                    players[idx].money = savedPlayer.money;
                    players[idx].position = savedPlayer.position;
                    players[idx].properties = savedPlayer.properties || [];
                    players[idx].houses = savedPlayer.houses || {};
                    players[idx].pledgedProperties = savedPlayer.pledgedProperties || [];
                }
            });
            if (typeof updateUI === 'function') updateUI();
            if (typeof updatePlayersCards === 'function') updatePlayersCards();
            if (typeof updateAllPlayerTokens === 'function') updateAllPlayerTokens();
            console.log("🔄 Žaidimo būsena sinchronizuota");
        }
    });
}

function sendRoll(dice1, dice2) {
    if (!window.gameId) return;
    database.ref('games/' + window.gameId + '/lastRoll').set({
        dice1: dice1,
        dice2: dice2,
        player: currentPlayerIndex,
        timestamp: Date.now()
    });
}

function listenRolls() {
    if (!window.gameId) return;
    database.ref('games/' + window.gameId + '/lastRoll').on('value', (snapshot) => {
        const roll = snapshot.val();
        if (roll && roll.player !== currentPlayerIndex) {
            updateDiceDisplay(roll.dice1, roll.dice2);
        }
    });
}

function saveFullGameState() {
    if (!window.gameId) return;
    if (typeof players === 'undefined') return;
    
    const gameState = {
        players: players.map(p => ({
            id: p.id,
            name: p.name,
            money: p.money,
            position: p.position,
            figure: p.figure,
            figureName: p.figureName,
            properties: p.properties || [],
            houses: p.houses || {},
            pledgedProperties: p.pledgedProperties || [],
            bankrupt: p.bankrupt || false
        })),
        currentPlayerIndex: currentPlayerIndex,
        waitingForRoll: waitingForRoll
    };
    
    database.ref('games/' + window.gameId + '/gameState').set(gameState);
}

function saveCellOwners() {
    if (!window.gameId) return;
    const cellOwners = {};
    for (let id = 1; id <= 48; id++) {
        const cell = getCellById(id);
        if (cell && cell.owner !== undefined) {
            cellOwners[id] = cell.owner;
        }
    }
    database.ref('games/' + window.gameId + '/cellOwners').set(cellOwners);
}

function getLocalPlayerIdForTrade() {
    if (window.gameId) {
        const savedPlayer = localStorage.getItem(`player_${window.gameId}`);
        if (savedPlayer && players && players.length > 0) {
            for (let i = 0; i < players.length; i++) {
                if (players[i] && players[i].name === savedPlayer) {
                    return i;
                }
            }
        }
    }
    if (typeof currentPlayerIndex !== 'undefined' && currentPlayerIndex !== -1) {
        return currentPlayerIndex;
    }
    if (players && players.length > 0) {
        for (let i = 0; i < players.length; i++) {
            if (players[i] && !players[i].bankrupt) {
                return i;
            }
        }
    }
    return -1;
}

let tradeOfferListener = null;

function listenForTradeOffers() {
    if (!window.gameId) {
        setTimeout(() => listenForTradeOffers(), 1000);
        return;
    }
    
    if (!window.database) {
        setTimeout(() => listenForTradeOffers(), 1000);
        return;
    }
    
    if (!players || players.length === 0) {
        setTimeout(() => listenForTradeOffers(), 1000);
        return;
    }
    
    const localPlayerId = getLocalPlayerIdForTrade();
    console.log("🔍 listenForTradeOffers: localPlayerId =", localPlayerId);
    
    if (localPlayerId === -1) {
        setTimeout(() => listenForTradeOffers(), 2000);
        return;
    }
    
    const tradeRef = window.database.ref('games/' + window.gameId + '/pendingTrade');
    
    if (tradeOfferListener) {
        tradeRef.off('value', tradeOfferListener);
    }
    
    tradeOfferListener = (snapshot) => {
        const offer = snapshot.val();
        
        if (offer && offer.toPlayerId === localPlayerId && offer.status === 'pending') {
            console.log("🎉 GAUTAS PASIŪLYMAS MAN!");
            
            const sender = players[offer.fromPlayerId];
            const receiver = players[offer.toPlayerId];
            
            if (sender && receiver && typeof showTradeProposalToReceiver === 'function') {
                showTradeProposalToReceiver(
                    sender,
                    receiver,
                    offer.senderProps || [],
                    offer.receiverProps || [],
                    offer.senderMoney,
                    offer.receiverMoney
                );
                tradeRef.update({ status: 'viewed' });
            }
        }
    };
    
    tradeRef.on('value', tradeOfferListener);
}

function sendTradeOffer(tradeOffer) {
    if (!window.gameId) return false;
    const tradeRef = window.database.ref('games/' + window.gameId + '/pendingTrade');
    tradeRef.set(tradeOffer);
    return true;
}

function clearTradeOffer() {
    if (!window.gameId) return;
    window.database.ref('games/' + window.gameId + '/pendingTrade').remove();
}

// ==================== CHATO SINCHRONIZACIJA ====================

function sendChatMessageToFirebase(message, playerName, playerFigure) {
    if (!window.gameId || !window.database) return;
    
    const chatRef = window.database.ref('games/' + window.gameId + '/chatMessages');
    const localPlayerId = getLocalPlayerIdForTrade();
    
    chatRef.push({
        message: message,
        playerName: playerName,
        playerFigure: playerFigure,
        timestamp: Date.now(),
        playerId: localPlayerId
    });
    
    // Išvalome senas žinutes (paliekame paskutines 200)
    chatRef.limitToLast(200).once('value', (snapshot) => {
        const messages = snapshot.val();
        if (messages) {
            const keys = Object.keys(messages);
            if (keys.length > 200) {
                const keysToRemove = keys.slice(0, keys.length - 200);
                keysToRemove.forEach(key => {
                    chatRef.child(key).remove();
                });
            }
        }
    });
}

function listenForChatMessages() {
    if (!window.gameId || !window.database) return;
    
    const chatRef = window.database.ref('games/' + window.gameId + '/chatMessages');
    
    chatRef.on('child_added', (snapshot) => {
        const msg = snapshot.val();
        if (msg && typeof addChatMessageToUI === 'function') {
            const localPlayerId = getLocalPlayerIdForTrade();
            if (localPlayerId !== -1 && msg.playerId === localPlayerId) return;
            addChatMessageToUI(msg.message, false, msg.playerName, msg.playerFigure);
        }
    });
}

let syncInitialized = false;

function initSync() {
    if (syncInitialized) return;
    syncInitialized = true;
    
    console.log("🔄 Inicijuojama sinchronizacija...");
    
    if (typeof createAllPlayerTokens === 'function') {
        createAllPlayerTokens();
    }
    if (typeof updateAllPlayerTokens === 'function') {
        updateAllPlayerTokens();
    }
    
    if (typeof players !== 'undefined') {
        syncGame();
    } else {
        setTimeout(initSync, 500);
        return;
    }
    
    listenRolls();
    setTimeout(() => { listenForTradeOffers(); }, 2000);
    setTimeout(() => { listenForChatMessages(); }, 2000);
    
    console.log("🔄 Sinchronizacija pradėta");
}

window.sendRoll = sendRoll;
window.listenRolls = listenRolls;
window.initSync = initSync;
window.saveFullGameState = saveFullGameState;
window.saveCellOwners = saveCellOwners;
window.sendTradeOffer = sendTradeOffer;
window.listenForTradeOffers = listenForTradeOffers;
window.clearTradeOffer = clearTradeOffer;
window.getLocalPlayerIdForTrade = getLocalPlayerIdForTrade;
window.sendChatMessageToFirebase = sendChatMessageToFirebase;
window.listenForChatMessages = listenForChatMessages;