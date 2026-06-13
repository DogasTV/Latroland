// ==================== KAULIUKAI ====================

function updateDiceDisplay(value1, value2) {
    updateSingleDice('centerDice1', value1);
    updateSingleDice('centerDice2', value2);
    const dice1 = document.getElementById('centerDice1');
    const dice2 = document.getElementById('centerDice2');
    if (dice1) dice1.classList.add('rolling');
    if (dice2) dice2.classList.add('rolling');
    setTimeout(() => {
        if (dice1) dice1.classList.remove('rolling');
        if (dice2) dice2.classList.remove('rolling');
    }, 300);
}

function updateSingleDice(diceId, value) {
    const dice = document.getElementById(diceId);
    if (!dice) return;
    const container = dice.querySelector('.dice-dots-container');
    if (!container) return;
    const allDots = container.querySelectorAll('.dice-dot');
    allDots.forEach(dot => dot.classList.remove('visible'));
    const patterns = { 1: ['cc'], 2: ['tl', 'br'], 3: ['tl', 'cc', 'br'], 4: ['tl', 'tr', 'bl', 'br'], 5: ['tl', 'tr', 'cc', 'bl', 'br'], 6: ['tl', 'cl', 'bl', 'tr', 'cr', 'br'] };
    const positions = patterns[value];
    if (positions) {
        positions.forEach(pos => { const dot = container.querySelector(`.dot-${pos}`); if (dot) dot.classList.add('visible'); });
    }
}

function movePlayer(steps) {
    let newPosition = players[currentPlayerIndex].position + steps;
    let passedStart = false;
    if (newPosition > 48) { newPosition = newPosition - 48; passedStart = true; }
    if (passedStart) {
        players[currentPlayerIndex].money += 200;
        addLog(`${players[currentPlayerIndex].name} perėjo START ir gavo 200€!`);
        showToast(`${players[currentPlayerIndex].name} perėjo START ir gavo 200€!`, 'success');
        playSound('success');
    }
    players[currentPlayerIndex].position = newPosition;
    
    updateAllPlayerTokens();
    updatePlayerPositionDisplay();
    updateUI();
    updatePlayersCards();
    
    const cellData = getCellById(players[currentPlayerIndex].position);
    addLog(`${players[currentPlayerIndex].name} atsistojo ant ${cellData?.name || 'langelio ' + players[currentPlayerIndex].position}`);
    if (cellData && cellData.special === 'start') {
        players[currentPlayerIndex].money += 300;
        addLog(`${players[currentPlayerIndex].name} atsistojo ant START ir gauna papildomai 300€!`);
        showToast(`${players[currentPlayerIndex].name} atsistojo ant START ir gauna papildomai 300€!`, 'success');
        playSound('success');
    }
    
    checkCellEffect();
    
    if (typeof saveFullGameState === 'function') {
        saveFullGameState();
    }
}

function showJailOptions() {
    const currentPlayer = players[currentPlayerIndex];
    const modal = document.createElement('div');
    modal.className = 'jail-modal';
    modal.innerHTML = `
        <div class="jail-modal-content">
            <h3>🚔 KALĖJIMAS 🚔</h3>
            <div class="jail-player-name">${currentPlayer.figure} ${currentPlayer.name}</div>
            <div class="jail-info">Praleista ėjimų: ${jailTurns[currentPlayerIndex] || 0}/3</div>
            <div class="jail-info">💰 Pinigai: ${currentPlayer.money}€</div>
            <div class="jail-options">
                <button class="jail-btn-roll" id="jailRollBtn">🎲 MESTI KAULIUKUS</button>
                <button class="jail-btn-pay" id="jailPayBtn">💰 SUMOKĖTI 50€</button>
                <button class="jail-btn-sell" id="jailSellBtn">🏠 PARDUOTI NUOSAVYBES</button>
            </div>
            <div class="jail-hint">🎲 Jei išmesite dvigubą - išeinate iš kalėjimo ir judate!<br>💰 Sumokėję 50€ išeinate iš karto!<br>🏠 Pardavę nuosavybes galite gauti pinigų išsilaisvinimui!</div>
        </div>
    `;
    document.body.appendChild(modal);
    const rollBtn = modal.querySelector('#jailRollBtn');
    const payBtn = modal.querySelector('#jailPayBtn');
    const sellBtn = modal.querySelector('#jailSellBtn');
    rollBtn.addEventListener('click', () => { modal.remove(); performRollFromJail(); });
    payBtn.addEventListener('click', () => {
        if (currentPlayer.money >= 50) {
            modal.remove();
            currentPlayer.money -= 50;
            inJail[currentPlayerIndex] = false;
            jailTurns[currentPlayerIndex] = 0;
            addLog(`${currentPlayer.name} sumokėjo 50€ ir išėjo iš kalėjimo! Liko pinigų: ${currentPlayer.money}€`);
            showToast(`${currentPlayer.name} sumokėjo 50€ ir išėjo iš kalėjimo!`, 'success');
            showInfoCard(`${currentPlayer.name}`, `Sumokėjote 50€ ir išėjote iš kalėjimo!`, '💰 IŠĖJIMAS IŠ KALĖJIMO');
            playSound('success');
            updateUI();
            updatePlayersCards();
            performRoll();
        } else {
            showToast(`Neturite 50€! Pasirinkite kitą variantą.`, 'warning');
            playSound('error');
        }
    });
    sellBtn.addEventListener('click', () => { modal.remove(); showJailSellProperties(currentPlayer); });
}

function showJailSellProperties(player) {
    const modal = document.createElement('div');
    modal.className = 'jail-modal';
    let propertiesHtml = '';
    if (player.properties && player.properties.length > 0) {
        propertiesHtml = '<div class="jail-properties-list">';
        player.properties.forEach(prop => {
            const cellData = getCellById(prop.id);
            const sellPrice = Math.floor(cellData.price / 2);
            propertiesHtml += `<div class="jail-property-item" data-prop-id="${prop.id}"><span class="jail-property-name">🏠 ${prop.name}</span><span class="jail-property-price">${sellPrice}€</span><button class="jail-sell-property-btn" data-prop-id="${prop.id}">💲 PARDUOTI</button></div>`;
        });
        propertiesHtml += '</div>';
    } else {
        propertiesHtml = '<div style="color:#aaa; text-align:center; padding:10px;">Neturite nuosavybių pardavimui</div>';
    }
    modal.innerHTML = `
        <div class="jail-modal-content">
            <h3>🏠 PARDUOTI NUOSAVYBES 🏠</h3>
            <div class="jail-player-name">${player.figure} ${player.name}</div>
            <div class="jail-info">💰 Pinigai: ${player.money}€</div>
            <div class="jail-info">Parduodant nuosavybę bankui gausite pusę jos vertės</div>
            ${propertiesHtml}
            <div class="jail-options"><button class="jail-btn-pay" id="jailBackBtn">🔙 ATGAL</button><button class="jail-btn-roll" id="jailTryAgainBtn">🎲 BANDYTI MESTI</button></div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.querySelectorAll('.jail-sell-property-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const propId = parseInt(btn.dataset.propId);
            const prop = player.properties.find(p => p.id === propId);
            const cellData = getCellById(propId);
            const sellPrice = Math.floor(cellData.price / 2);
            player.money += sellPrice;
            player.properties = player.properties.filter(p => p.id !== propId);
            delete cellData.owner;
            addLog(`${player.name} pardavė "${prop.name}" bankui už ${sellPrice}€ (kad išsilaisvintų iš kalėjimo).`);
            showToast(`✅ Pardavėte "${prop.name}" už ${sellPrice}€!`, 'success');
            playSound('sell');
            updateUI();
            updatePlayersCards();
            updateCellDisplayWithOwner();
            modal.remove();
            if (player.money >= 50) showJailOptions();
            else if (player.properties.length === 0 && player.money < 50) processBankruptcy(player, null);
            else showJailSellProperties(player);
        });
    });
    const backBtn = modal.querySelector('#jailBackBtn');
    const tryAgainBtn = modal.querySelector('#jailTryAgainBtn');
    backBtn.addEventListener('click', () => { modal.remove(); showJailOptions(); });
    tryAgainBtn.addEventListener('click', () => { modal.remove(); performRollFromJail(); });
}

function performRollFromJail() {
    playSound('dice');
    const currentPlayer = players[currentPlayerIndex];
    const dice1Value = Math.floor(Math.random() * 6) + 1;
    const dice2Value = Math.floor(Math.random() * 6) + 1;
    const isDouble = (dice1Value === dice2Value);
    const total = dice1Value + dice2Value;
    updateDiceDisplay(dice1Value, dice2Value);
    const totalSumEl = document.getElementById('totalSum');
    const lastRollStatEl = document.getElementById('lastRollStat');
    if (totalSumEl) totalSumEl.innerText = total;
    if (lastRollStatEl) lastRollStatEl.innerText = total;
    addLog(`${currentPlayer.name} kalėjime metė ${dice1Value} + ${dice2Value} = ${total}${isDouble ? ' (Dvigubas!)' : ''}`);
    if (isDouble) {
        inJail[currentPlayerIndex] = false;
        jailTurns[currentPlayerIndex] = 0;
        addLog(`${currentPlayer.name} išmetė dvigubą ir išėjo iš kalėjimo!`);
        showToast(`🎲 Dvigubas! ${currentPlayer.name} išėjo iš kalėjimo!`, 'success');
        showInfoCard(`${currentPlayer.name}`, `Išmetėte dvigubą! Išėjote iš kalėjimo ir judate pirmyn.`, '🎲 IŠĖJIMAS IŠ KALĖJIMO');
        playSound('success');
        movePlayer(total);
        waitingForRoll = false;
        if (typeof scheduleTurnEnd === 'function') {
            scheduleTurnEnd();
        }
    } else {
        jailTurns[currentPlayerIndex] = (jailTurns[currentPlayerIndex] || 0) + 1;
        const remaining = 3 - jailTurns[currentPlayerIndex];
        addLog(`${currentPlayer.name} neišmetė dvigubo. Praleidžia ėjimą kalėjime (${jailTurns[currentPlayerIndex]}/3).`);
        showToast(`🚔 Neišmetėte dvigubo! Liekate kalėjime. (${jailTurns[currentPlayerIndex]}/3)`, 'warning');
        showInfoCard(`${currentPlayer.name}`, `Neišmetėte dvigubo! Praleidžiate ėjimą kalėjime. Jums liko ${remaining} ėjimai kalėjime.`, '🚔 KALĖJIMAS');
        if (jailTurns[currentPlayerIndex] >= 3) {
            if (currentPlayer.money >= 50) {
                currentPlayer.money -= 50;
                inJail[currentPlayerIndex] = false;
                jailTurns[currentPlayerIndex] = 0;
                addLog(`${currentPlayer.name} praleido 3 ėjimus kalėjime. Priverstinai sumokėjo 50€ ir išėjo! Liko pinigų: ${currentPlayer.money}€`);
                showToast(`Praleidote 3 ėjimus kalėjime. Priverstinai sumokėjote 50€ ir išėjote!`, 'info');
                showInfoCard(`${currentPlayer.name}`, `Praleidote 3 ėjimus kalėjime. Priverstinai sumokėjote 50€ ir išėjote!`, '💰 PRIVERSTINIS IŠĖJIMAS');
                updateUI();
                updatePlayersCards();
                performRoll();
                return;
            } else if (currentPlayer.properties && currentPlayer.properties.length > 0) {
                addLog(`${currentPlayer.name} neturi 50€. Priverstas parduoti nuosavybes.`);
                showToast(`Neturite 50€! Privalote parduoti nuosavybes.`, 'warning');
                showJailSellProperties(currentPlayer);
                return;
            } else {
                processBankruptcy(currentPlayer, null);
                return;
            }
        }
        waitingForRoll = false;
        if (typeof scheduleTurnEnd === 'function') {
            scheduleTurnEnd();
        }
    }
}

function getLocalPlayerId() {
    if (!window.gameId) return -1;
    const savedPlayer = localStorage.getItem(`player_${window.gameId}`);
    if (savedPlayer && players.length > 0) {
        for (let i = 0; i < players.length; i++) {
            if (players[i] && players[i].name === savedPlayer) {
                return i;
            }
        }
    }
    const savedPlayerId = localStorage.getItem(`playerId_${window.gameId}`);
    if (savedPlayerId !== null && players[savedPlayerId]) {
        return parseInt(savedPlayerId);
    }
    return -1;
}

function performRoll() {
    playSound('dice');
    const currentPlayer = players[currentPlayerIndex];
    if (currentPlayer.bankrupt) { nextPlayer(); return; }
    
    if (window.gameId && typeof database !== 'undefined') {
        database.ref('games/' + window.gameId + '/waitingForRoll').set(false);
    }
    
    const dice1Value = Math.floor(Math.random() * 6) + 1;
    const dice2Value = Math.floor(Math.random() * 6) + 1;
    const total = dice1Value + dice2Value;
    const isDouble = (dice1Value === dice2Value);
    
    lastRoll = total;
    updateDiceDisplay(dice1Value, dice2Value);
    
    if (typeof sendRoll === 'function') {
        sendRoll(dice1Value, dice2Value);
    }
    
    const totalSumEl = document.getElementById('totalSum');
    const lastRollStatEl = document.getElementById('lastRollStat');
    if (totalSumEl) totalSumEl.innerText = total;
    if (lastRollStatEl) lastRollStatEl.innerText = total;
    
    let rollMessage = `${currentPlayer.name} metė ${dice1Value} + ${dice2Value} = ${total}`;
    if (isDouble) rollMessage += ` (Dvigubas!)`;
    addLog(rollMessage);
    
    movePlayer(total);
    
    if (isDouble) {
        consecutiveDoubles++;
        if (consecutiveDoubles === 3) {
            addLog(`${currentPlayer.name} išmetė TREČIĄ DVIGUBĄ IŠ EILĖS! EINA Į KALĖJIMĄ!`);
            showToast(`${currentPlayer.name} išmetė 3 dvigubus iš eilės! Eina į kalėjimą!`, 'error');
            playSound('jail');
            currentPlayer.position = 15;
            inJail[currentPlayerIndex] = true;
            jailTurns[currentPlayerIndex] = 0;
            updateAllPlayerTokens();
            updateUI();
            updatePlayersCards();
            addLog(`${currentPlayer.name} atsidūrė KALĖJIME! Praleis iki 3 ėjimų.`);
            showToast(`${currentPlayer.name} atsidūrė kalėjime!`, 'error');
            consecutiveDoubles = 0;
            waitingForRoll = false;
            setTimeout(() => {
                nextPlayer();
                if (typeof updateAllCellsBuildDisplay === 'function') {
                    setTimeout(() => updateAllCellsBuildDisplay(), 100);
                }
            }, 2000);
            return;
        } else {
            addLog(`${currentPlayer.name} išmetė dvigubą! Gauna papildomą metimą.`);
            showToast(`🎲 Dvigubas! ${currentPlayer.name} meta dar kartą!`, 'success');
            waitingForRoll = true;
            if (typeof updateAllCellsBuildDisplay === 'function') {
                setTimeout(() => updateAllCellsBuildDisplay(), 100);
            }
            return;
        }
    } else {
        consecutiveDoubles = 0;
        waitingForRoll = false;
        
        if (typeof scheduleTurnEnd === 'function') {
            scheduleTurnEnd();
        }
    }
    
    if (window.gameId && typeof database !== 'undefined') {
        database.ref('games/' + window.gameId + '/currentPlayer').set(currentPlayerIndex);
    }
    
    if (typeof saveFullGameState === 'function') {
        saveFullGameState();
    }
}

function rollDice() {
    console.log('🎲 rollDice() iškviesta');
    
    const localPlayerId = getLocalPlayerId();
    const currentPlayer = players[currentPlayerIndex];
    
    if (localPlayerId !== -1 && currentPlayerIndex !== localPlayerId) {
        console.log("⏳ Ne tavo eilė! Dabartinis žaidėjas:", currentPlayerIndex, "Tavo ID:", localPlayerId);
        showToast(`⏳ Dar ne tavo eilė! Dabar meta ${currentPlayer?.name} (${currentPlayer?.figure}). Palaukite...`, "warning");
        return;
    }
    
    if (inJail[currentPlayerIndex]) {
        console.log('Žaidėjas kalėjime');
        showJailOptions();
        return;
    }
    
    if (!window.waitingForRoll) {
        console.log("⏳ Kažkas jau meta kauliukus!");
        showToast("⏳ Kažkas jau meta kauliukus! Palaukite...", "warning");
        return;
    }
    
    console.log('Metami kauliukai...');
    performRoll();
}

document.addEventListener('DOMContentLoaded', function() {
    const rollBtn = document.getElementById('rollBtnCenter');
    if (rollBtn) {
        rollBtn.onclick = function() {
            console.log('Mygtukas paspaustas');
            if (window.waitingForRoll) rollDice();
        };
    }
});