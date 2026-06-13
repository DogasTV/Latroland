// ==================== KORTELĖS ====================

function animateCard(cardElement, callback) {
    if (!animationsEnabled) {
        if (callback) callback();
        return;
    }
    
    cardElement.classList.add('card-animate');
    setTimeout(() => {
        cardElement.classList.remove('card-animate');
        if (callback) callback();
    }, 300);
}

function showChoiceCards(cards, title, callback) {
     playSound('card-deal');  // <-- PRIDĖTI ŠIA LINIJA
    const modal = document.createElement('div');
    modal.className = 'choice-cards-modal';
    
    let cardsHtml = '<div class="choice-cards-container">';
    cards.forEach((card, index) => {
        cardsHtml += `
            <div class="choice-card" data-index="${index}">
                <div class="choice-card-inner">
                    <div class="choice-card-front">❓</div>
                    <div class="choice-card-back">${card.text}</div>
                </div>
            </div>
        `;
    });
    cardsHtml += '</div>';
    
    modal.innerHTML = `
        <div class="choice-cards-modal-content">
            <h3>${title}</h3>
            ${cardsHtml}
            <div class="choice-cards-hint">💰 Spustelkite ant kortelės, kurią norite pasirinkti!</div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const cardsElements = modal.querySelectorAll('.choice-card');
    cardsElements.forEach((cardEl, idx) => {
        cardEl.addEventListener('click', () => {
            cardEl.classList.add('flipped');
            setTimeout(() => {
                modal.remove();
                if (callback) callback(cards[idx]);
            }, 500);
        });
    });
}

function showCardMessage(title, message, callback) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card-popup';
    cardDiv.innerHTML = `
        <div class="card-popup-content">
            <h3>${title}</h3>
            <p>${message}</p>
            <button class="card-ok-btn">Gerai</button>
        </div>
    `;
    document.body.appendChild(cardDiv);
    
    animateCard(cardDiv, () => {
        const btn = cardDiv.querySelector('.card-ok-btn');
        btn.addEventListener('click', () => {
            cardDiv.remove();
            if (callback) callback();
        });
    });
}

function drawChanceCard() {
    if (cardsChoiceEnabled) {
        const shuffled = [...chanceCards];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        const threeCards = shuffled.slice(0, 3);
        
        showChoiceCards(threeCards, "🎲 PASIRINKITE ŠANSO KORTELĘ 🎲", (selectedCard) => {
            const currentPlayer = players[currentPlayerIndex];
            addLog(`${currentPlayer.name} pasirinko ŠANSO kortelę: "${selectedCard.text}"`);
            showCardMessage("🎲 ŠANSŲ KORTELĖ 🎲", selectedCard.text, () => executeCardEffect(selectedCard, currentPlayer));
        });
    } else {
        const randomIndex = Math.floor(Math.random() * chanceCards.length);
        const card = chanceCards[randomIndex];
        const currentPlayer = players[currentPlayerIndex];
        addLog(`${currentPlayer.name} ištraukė ŠANSO kortelę: "${card.text}"`);
        showCardMessage("🎲 ŠANSŲ KORTELĖ 🎲", card.text, () => executeCardEffect(card, currentPlayer));
    }
}

function drawCommunityCard() {
    if (cardsChoiceEnabled) {
        const shuffled = [...communityCards];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        const threeCards = shuffled.slice(0, 3);
        
        showChoiceCards(threeCards, "🏢 PASIRINKITE BENDRIJOS KORTELĘ 🏢", (selectedCard) => {
            const currentPlayer = players[currentPlayerIndex];
            addLog(`${currentPlayer.name} pasirinko BENDRIJOS kortelę: "${selectedCard.text}"`);
            showCardMessage("🏢 BENDRIJOS KORTELĖ 🏢", selectedCard.text, () => executeCardEffect(selectedCard, currentPlayer));
        });
    } else {
        const randomIndex = Math.floor(Math.random() * communityCards.length);
        const card = communityCards[randomIndex];
        const currentPlayer = players[currentPlayerIndex];
        addLog(`${currentPlayer.name} ištraukė BENDRIJOS kortelę: "${card.text}"`);
        showCardMessage("🏢 BENDRIJOS KORTELĖ 🏢", card.text, () => executeCardEffect(card, currentPlayer));
    }
}

function executeCardEffect(card, currentPlayer) {
    switch(card.type) {
        case "money":
            currentPlayer.money += card.value;
            if (card.value >= 0) {
                addLog(`${currentPlayer.name} gavo ${card.value}€ iš kortelės (dabar ${currentPlayer.money}€)`);
            } else {
                addLog(`${currentPlayer.name} sumokėjo ${Math.abs(card.value)}€ pagal kortelę (liko ${currentPlayer.money}€)`);
            }
            showToast(`${currentPlayer.name} ${card.value >= 0 ? 'gavo' : 'sumokėjo'} ${Math.abs(card.value)}€. Dabar turi: ${currentPlayer.money}€`, card.value >= 0 ? 'success' : 'error');
            break;
        case "move":
            let newPos = currentPlayer.position + card.value;
            let passedStart = false;
            if (newPos > 48) { newPos = newPos - 48; passedStart = true; }
            else if (newPos < 1) { newPos = 48 + newPos; }
            if (passedStart || (card.value > 0 && currentPlayer.position + card.value > 48)) {
                currentPlayer.money += 200;
                addLog(`${currentPlayer.name} perėjo START ir gavo 200€!`);
                showToast(`${currentPlayer.name} perėjo START ir gavo 200€!`, 'success');
            }
            currentPlayer.position = newPos;
            updateAllPlayerTokens();
            updateUI();
            updatePlayersCards();
            addLog(`${currentPlayer.name} persikėlė į poziciją ${currentPlayer.position}`);
            showToast(`${currentPlayer.name} persikėlė į poziciją ${currentPlayer.position}`, 'info');
            setTimeout(() => checkCellEffect(), 500);
            break;
        case "moveTo":
            const targetCell = getCellById(card.targetId);
            if (targetCell) {
                let oldPos = currentPlayer.position;
                currentPlayer.position = card.targetId;
                if (card.targetId < oldPos) {
                    currentPlayer.money += 200;
                    addLog(`${currentPlayer.name} perėjo START ir gavo 200€!`);
                    showToast(`${currentPlayer.name} perėjo START ir gavo 200€!`, 'success');
                }
                updateAllPlayerTokens();
                updateUI();
                updatePlayersCards();
                addLog(`${currentPlayer.name} persikėlė į ${targetCell.name}`);
                showToast(`${currentPlayer.name} persikėlė į ${targetCell.name}`, 'info');
                setTimeout(() => checkCellEffect(), 500);
            }
            break;
        case "moveToNearest":
            let nearestId = null;
            for (let i = currentPlayer.position + 1; i <= 48; i++) {
                const cell = getCellById(i);
                if (cell && cell.special === card.targetType) {
                    nearestId = i;
                    break;
                }
            }
            if (!nearestId) {
                for (let i = 1; i < currentPlayer.position; i++) {
                    const cell = getCellById(i);
                    if (cell && cell.special === card.targetType) {
                        nearestId = i;
                        currentPlayer.money += 200;
                        addLog(`${currentPlayer.name} perėjo START ir gavo 200€!`);
                        showToast(`${currentPlayer.name} perėjo START ir gavo 200€!`, 'success');
                        break;
                    }
                }
            }
            if (nearestId) {
                currentPlayer.position = nearestId;
                updateAllPlayerTokens();
                updateUI();
                updatePlayersCards();
                const targetCell2 = getCellById(nearestId);
                addLog(`${currentPlayer.name} persikėlė į artimiausią ${targetCell2?.name}`);
                showToast(`${currentPlayer.name} persikėlė į artimiausią ${targetCell2?.name || 'objektą'}`, 'info');
                setTimeout(() => checkCellEffect(), 500);
            }
            break;
    }
    updateUI();
    updatePlayersCards();
}