// ==================== ŽAIDIMO IŠSAUGOJIMAS / ĮKĖLIMAS ====================

function saveGame() {
    const gameState = {
        players: players.map(p => ({
            id: p.id,
            name: p.name,
            position: p.position,
            money: p.money,
            properties: p.properties,
            houses: p.houses,
            x: p.x,
            y: p.y,
            figure: p.figure,
            figureName: p.figureName,
            bankrupt: p.bankrupt || false
        })),
        currentPlayerIndex: currentPlayerIndex,
        activePlayers: activePlayers,
        inJail: inJail,
        jailTurns: jailTurns,
        consecutiveDoubles: consecutiveDoubles,
        cellOwners: {}
    };
    
    for (let id = 1; id <= 48; id++) {
        const cell = getCellById(id);
        if (cell && cell.owner !== undefined) {
            gameState.cellOwners[id] = cell.owner;
        }
    }
    
    localStorage.setItem('monopolySave', JSON.stringify(gameState));
    addLog(`💾 Žaidimas išsaugotas!`);
    showToast(`Žaidimas išsaugotas!`, 'success');
}

function loadGame() {
    const saved = localStorage.getItem('monopolySave');
    if (!saved) {
        showToast(`Nėra išsaugoto žaidimo`, 'warning');
        return false;
    }
    
    try {
        const gameState = JSON.parse(saved);
        
        gameState.players.forEach((savedPlayer, idx) => {
            if (players[idx]) {
                players[idx].position = savedPlayer.position;
                players[idx].money = savedPlayer.money;
                players[idx].properties = savedPlayer.properties;
                players[idx].houses = savedPlayer.houses;
                players[idx].x = savedPlayer.x;
                players[idx].y = savedPlayer.y;
                players[idx].bankrupt = savedPlayer.bankrupt;
            }
        });
        
        currentPlayerIndex = gameState.currentPlayerIndex;
        activePlayers = gameState.activePlayers;
        inJail = gameState.inJail;
        jailTurns = gameState.jailTurns;
        consecutiveDoubles = gameState.consecutiveDoubles;
        
        for (let id = 1; id <= 48; id++) {
            const cell = getCellById(id);
            if (cell) {
                if (gameState.cellOwners[id] !== undefined) {
                    cell.owner = gameState.cellOwners[id];
                } else {
                    delete cell.owner;
                }
            }
        }
        
        if (typeof updateAllPlayerTokens === 'function') updateAllPlayerTokens();
        if (typeof updateUI === 'function') updateUI();
        if (typeof updatePlayersCards === 'function') updatePlayersCards();
        if (typeof updateAllCellsDisplay === 'function') updateAllCellsDisplay();
        if (typeof updateCellDisplayWithOwner === 'function') updateCellDisplayWithOwner();
        
        addLog(`📀 Žaidimas įkeltas! Tęsiame nuo ${players[currentPlayerIndex]?.name || 'žaidėjo'} ėjimo.`);
        showToast(`Žaidimas įkeltas!`, 'success');
        return true;
    } catch (e) {
        console.error('Klaida įkeliant žaidimą:', e);
        showToast(`Klaida įkeliant žaidimą`, 'error');
        return false;
    }
}

function resetGame() {
    const confirmModal = document.createElement('div');
    confirmModal.className = 'reset-confirm-modal';
    confirmModal.innerHTML = `
        <div class="reset-confirm-content">
            <h3>🔄 NAUJAS ŽAIDIMAS 🔄</h3>
            <div class="reset-confirm-message">
                Ar tikrai norite pradėti naują žaidimą?
            </div>
            <div class="reset-confirm-warning">
                ⚠️ Visi duomenys bus prarasti!
            </div>
            <div class="reset-confirm-buttons">
                <button id="resetConfirmYes" class="reset-confirm-yes">✅ TAIP, PRADĖTI NAUJĄ</button>
                <button id="resetConfirmNo" class="reset-confirm-no">❌ NE, ATŠAUKTI</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(confirmModal);
    
    const yesBtn = confirmModal.querySelector('#resetConfirmYes');
    const noBtn = confirmModal.querySelector('#resetConfirmNo');
    
    yesBtn.addEventListener('click', () => {
        confirmModal.remove();
        localStorage.removeItem('monopolySave');
        location.reload();
    });
    
    noBtn.addEventListener('click', () => {
        confirmModal.remove();
    });
    
    confirmModal.addEventListener('click', (e) => {
        if (e.target === confirmModal) confirmModal.remove();
    });
}

// IŠJUNGTAS AUTOMATINIS IŠSAUGOTO ŽAIDIMO TIKRINIMAS
// (senas kodas buvo čia, dabar jį pašalinome)