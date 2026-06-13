// ==================== PIRKIMAS IR NUOMA ====================

function buyProperty(cellId) {
    const cellData = getCellById(cellId);
    const currentPlayer = players[currentPlayerIndex];
    
    const requestingPlayerId = currentPlayer.id;
    const requestingPlayerIndex = currentPlayerIndex;
    
    if (!currentPlayer.properties) {
        currentPlayer.properties = [];
    }
    
    if (cellData.owner !== undefined && cellData.owner !== null) {
        addLog(`${currentPlayer.name} bandė pirkti ${cellData.name}, bet jis jau priklauso ${players[cellData.owner]?.name}`);
        showToast(`Šis langelis jau priklauso ${players[cellData.owner]?.name || 'kažkam'}!`, 'warning');
        playSound('error');
        return;
    }
    
    if (currentPlayerIndex !== requestingPlayerIndex || players[currentPlayerIndex].id !== requestingPlayerId) {
        showToast(`❌ Jau ne jūsų eilė! Negalite pirkti.`, 'error');
        addLog(`${players[requestingPlayerId]?.name} bandė pirkti, bet jau ne jo eilė!`);
        return;
    }
    
    offerToBuy(cellId);
}

function offerToBuy(cellId) {
    const cellData = getCellById(cellId);
    const currentPlayer = players[currentPlayerIndex];
    
    const requestingPlayerId = currentPlayer.id;
    const requestingPlayerIndex = currentPlayerIndex;
    
    if (!currentPlayer.properties) {
        currentPlayer.properties = [];
    }
    
    if ((cellData.owner === undefined || cellData.owner === null) && cellData.price > 0) {
        if (typeof setWaitingForAction === 'function') {
            setWaitingForAction(true);
        }
        
        const modal = document.createElement('div');
        modal.className = 'purchase-modal';
        
        let colorStripHtml = '';
        if (cellData.color) {
            let colorClass = '';
            switch(cellData.color) {
                case 'brown': colorClass = 'color-strip-brown'; break;
                case 'lightblue': colorClass = 'color-strip-lightblue'; break;
                case 'orange': colorClass = 'color-strip-orange'; break;
                case 'bronze': colorClass = 'color-strip-bronze'; break;
                case 'bomz': colorClass = 'color-strip-bomz'; break;
                case 'yellow': colorClass = 'color-strip-yellow'; break;
                case 'butelka': colorClass = 'color-strip-butelka'; break;
                case 'purple': colorClass = 'color-strip-purple'; break;
                case 'lime': colorClass = 'color-strip-lime'; break;
                case 'brightblue': colorClass = 'color-strip-brightblue'; break;
                default: colorClass = '';
            }
            if (colorClass) {
                colorStripHtml = `<div class="purchase-color-strip ${colorClass}"></div>`;
            }
        }
        
        modal.innerHTML = `
            <div class="purchase-modal-content">
                <h3>🏠 PIRKTI NEKILNOJAMĄ TURTĄ 🏠</h3>
                <div class="purchase-property-name">${cellData.name}</div>
                ${colorStripHtml}
                <div class="purchase-price">${cellData.price}<span>€</span></div>
                <div class="purchase-player-money">💰 Jūsų pinigai: ${currentPlayer.money} €</div>
                <div class="purchase-buttons">
                    <button class="purchase-btn-buy" id="purchaseBuyBtn">✅ PIRKTI</button>
                    <button class="purchase-btn-cancel" id="purchaseCancelBtn">❌ ATŠAUKTI</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const buyBtn = modal.querySelector('#purchaseBuyBtn');
        const cancelBtn = modal.querySelector('#purchaseCancelBtn');
        
        buyBtn.addEventListener('click', () => {
            if (currentPlayerIndex !== requestingPlayerIndex || players[currentPlayerIndex].id !== requestingPlayerId) {
                modal.remove();
                showToast("❌ Jau ne jūsų eilė! Negalite pirkti.", 'error');
                addLog(`${players[requestingPlayerId]?.name} bandė pirkti, bet jau ne jo eilė!`);
                if (typeof setWaitingForAction === 'function') {
                    setWaitingForAction(false);
                }
                return;
            }
            
            if (currentPlayer.money >= cellData.price) {
                currentPlayer.money -= cellData.price;
                cellData.owner = currentPlayer.id;
                currentPlayer.properties.push({ id: cellId, name: cellData.name, price: cellData.price });
                updateUI();
                updatePlayersCards();
                updateCellDisplayWithOwner();
                addLog(`${currentPlayer.name} nusipirko ${cellData.name} už ${cellData.price}€ (liko ${currentPlayer.money}€)`);
                showToast(`✅ Sėkmingai nusipirkote ${cellData.name}! Liko pinigų: ${currentPlayer.money} €`, 'success');
                playSound('buy');
                modal.remove();
                
                if (typeof saveFullGameState === 'function') {
                    saveFullGameState();
                }
                if (typeof saveCellOwners === 'function') {
                    saveCellOwners();
                }
                
                if (typeof setWaitingForAction === 'function') {
                    setWaitingForAction(false);
                }
            } else {
                const truksta = cellData.price - currentPlayer.money;
                addLog(`${currentPlayer.name} nepakanka pinigų ${cellData.name} pirkti! Reikia ${cellData.price}€, turi ${currentPlayer.money}€ (trūksta ${truksta}€)`);
                showToast(`❌ Nepakanka pinigų! ${cellData.name} kainuoja ${cellData.price} €, o turite ${currentPlayer.money} € (trūksta ${truksta}€)`, 'error');
                showInfoCard(`${currentPlayer.name}`, `Nepakanka pinigų! Norint nusipirkti "${cellData.name}" reikia ${cellData.price}€, bet turite tik ${currentPlayer.money}€. Trūksta ${truksta}€.`, '❌ NEPAKANKA PINIGŲ');
                playSound('iseejou');
                modal.remove();
                
                if (typeof setWaitingForAction === 'function') {
                    setWaitingForAction(false);
                }
            }
        });
        
        cancelBtn.addEventListener('click', () => {
            modal.remove();
            addLog(`${currentPlayer.name} atsisakė pirkti ${cellData.name} (kaina ${cellData.price}€)`);
            showToast(`❌ Atsisakėte pirkti ${cellData.name}`, 'info');
            
            if (typeof setWaitingForAction === 'function') {
                setWaitingForAction(false);
            }
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                if (typeof setWaitingForAction === 'function') {
                    setWaitingForAction(false);
                }
            }
        });
    }
}

function payRent(cellData, currentPlayer) {
    const owner = players.find(p => p.id === cellData.owner);
    if (!owner) return false;
    
    const isPledged = cellData.pledged === true;
    if (isPledged) {
        addLog(`${cellData.name} yra įkeista bankui – nereikia mokėti nuomos!`);
        showToast(`🔒 ${cellData.name} yra įkeista – nuomos mokėti nereikia!`, 'info');
        return true;
    }
    
    const houses = owner?.houses?.[cellData.id] || 0;
    const rent = getRentWithHouses(cellData, houses);
    
    if (currentPlayer.money >= rent) {
        currentPlayer.money -= rent;
        owner.money += rent;
        addLog(`${currentPlayer.name} sumokėjo ${rent}€ nuomos mokestį ${owner.name} už ${cellData.name}`);
        showToast(`💰 ${currentPlayer.name} moka ${rent}€ nuomos mokestį ${owner.name} už ${cellData.name}`, 'info');
        playSound('sell');
        updateUI();
        updatePlayersCards();
        return true;
    } else {
        addLog(`${currentPlayer.name} NETURI PINIGŲ sumokėti nuomos už ${cellData.name}! Reikia ${rent}€, turi ${currentPlayer.money}€`);
        showToast(`💀 ${currentPlayer.name} neturi pinigų sumokėti nuomos!`, 'error');
        playSound('bankrupt');
        
        if (typeof handleDebt === 'function') {
            handleDebt(rent, currentPlayer, owner);
        } else {
            processBankruptcy(currentPlayer, owner);
        }
        return false;
    }
}

function getCornerClass(position) {
    const classes = {
        'top-left': 'top-left-corner',
        'top-right': 'top-right-corner',
        'bottom-right': 'bottom-right-corner',
        'bottom-left': 'bottom-left-corner'
    };
    return classes[position] || '';
}