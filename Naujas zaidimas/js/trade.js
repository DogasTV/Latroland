// ==================== PREKYBOS SISTEMA ====================

function openTradeMenu(senderId, receiverId) {
    console.log('🔓 openTradeMenu called for sender:', senderId, 'receiver:', receiverId);
    
    const sender = players[senderId];
    
    if (receiverId === undefined) {
        console.log("🏦 Prekyba su banku");
        showBankTradeModal(sender);
        return;
    }
    
    const receiver = players[receiverId];
    if (!sender || !receiver) {
        console.error("Žaidėjas nerastas!");
        showToast("Klaida: žaidėjas nerastas", 'error');
        return;
    }
    
    console.log("🔄 Prekyba tarp žaidėjų:", sender.name, "ir", receiver.name);
    showPlayerTradeModal(sender, receiver);
}

function showBankTradeModal(player) {
    const modal = document.createElement('div');
    modal.className = 'trade-modal';
    modal.innerHTML = `
        <div class="trade-modal-content">
            <h3>🏦 PREKYBA SU BANKU 🏦</h3>
            <div class="trade-player-name">${player.figure} ${player.name}</div>
            <div class="trade-section">
                <div class="trade-section-title">💰 Tavo nuosavybės:</div>
                <div class="trade-properties-list" id="playerPropertiesList">
                    ${player.properties.length === 0 ? '<div class="trade-no-properties">Neturite nuosavybių</div>' : ''}
                    ${player.properties.map(prop => {
                        const cellData = getCellById(prop.id);
                        const sellPrice = Math.floor(cellData.price / 2);
                        return `
                            <div class="trade-property-item" data-prop-id="${prop.id}">
                                <span>🏠 ${prop.name}</span>
                                <span class="trade-property-price">Parduoti už ${sellPrice}€</span>
                                <button class="trade-sell-btn" data-prop-id="${prop.id}">💲 Parduoti</button>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            <div class="trade-buttons">
                <button class="trade-cancel-btn" id="tradeCancelBtn">❌ UŽDARYTI</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelectorAll('.trade-sell-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const propId = parseInt(btn.dataset.propId);
            const prop = player.properties.find(p => p.id === propId);
            const cellData = getCellById(propId);
            const sellPrice = Math.floor(cellData.price / 2);
            
            const confirmModal = document.createElement('div');
            confirmModal.className = 'pledge-confirm-modal';
            confirmModal.innerHTML = `
                <div class="pledge-confirm-content">
                    <h3>💰 PARDAVIMAS BANKUI 💰</h3>
                    <div class="pledge-confirm-property">${prop.name}</div>
                    <div class="pledge-confirm-value">Gausite: ${sellPrice}€</div>
                    <div class="pledge-confirm-warning">Kortelė grįš į rinką!</div>
                    <div class="pledge-confirm-message">Ar tikrai norite parduoti šią nuosavybę bankui?</div>
                    <div class="pledge-confirm-buttons">
                        <button id="pledgeConfirmYes" class="pledge-confirm-yes">✅ TAIP, PARDUOTI</button>
                        <button id="pledgeConfirmNo" class="pledge-confirm-no">❌ NE, ATŠAUKTI</button>
                    </div>
                </div>
            `;
            document.body.appendChild(confirmModal);
            
            confirmModal.querySelector('#pledgeConfirmYes').onclick = () => {
                confirmModal.remove();
                player.money += sellPrice;
                player.properties = player.properties.filter(p => p.id !== propId);
                delete cellData.owner;
                addLog(`${player.name} pardavė "${prop.name}" bankui už ${sellPrice}€.`);
                showToast(`✅ Pardavėte "${prop.name}" už ${sellPrice}€!`, 'success');
                updateUI();
                updatePlayersCards();
                updateCellDisplayWithOwner();
                modal.remove();
                showBankTradeModal(player);
            };
            confirmModal.querySelector('#pledgeConfirmNo').onclick = () => confirmModal.remove();
            confirmModal.addEventListener('click', (e) => { if (e.target === confirmModal) confirmModal.remove(); });
        });
    });
    
    modal.querySelector('#tradeCancelBtn').addEventListener('click', () => modal.remove());
}

function showPlayerTradeModal(sender, receiver) {
    const modal = document.createElement('div');
    modal.className = 'trade-modal-large';
    modal.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #1b4d1b; border-radius: 20px; border: 3px solid #ffd700; z-index: 10005; text-align: center; width: auto; max-width: 1000px; min-width: 300px; max-height: 80vh; overflow-y: auto; padding: 20px;';
    modal.innerHTML = `
        <div style="max-height: 80vh; overflow-y: auto;">
            <h3 style="color: #ffd700; margin-bottom: 15px; font-size: 20px;">🔄 PREKYBA TARP ŽAIDĖJŲ 🔄</h3>
            <div style="display: flex; gap: 20px; justify-content: space-between; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 250px; background: #0d2b0d; border-radius: 15px; padding: 12px;">
                    <div style="text-align: center; margin-bottom: 10px;">
                        <div style="font-size: 32px;">${sender.figure}</div>
                        <div style="font-size: 16px; font-weight: bold; color: #ffd700;">${sender.name}</div>
                        <div style="color: #90EE90; font-size: 14px;">💰 ${sender.money}€</div>
                    </div>
                    <div style="font-weight: bold; color: #ffd700; font-size: 13px; margin-bottom: 8px; border-bottom: 1px solid #ffd700; padding-bottom: 3px;">📦 SIŪLO (atiduoda):</div>
                    <div id="senderOfferProps" style="max-height: 200px; overflow-y: auto; margin-bottom: 10px;"></div>
                    <div style="margin-top: 8px;">
                        <label style="color: #ffd700; font-size: 12px;">➕ PRIDEDA PINIGŲ:</label>
                        <input type="number" id="senderOfferMoney" value="0" min="0" max="${sender.money}" style="width: 100%; padding: 5px; margin-top: 3px; border-radius: 8px; border: none; background: #1b4d1b; color: #ffd700; font-size: 12px;">
                    </div>
                </div>
                
                <div style="font-size: 28px; display: flex; align-items: center; color: #ffd700;">➡️</div>
                
                <div style="flex: 1; min-width: 250px; background: #0d2b0d; border-radius: 15px; padding: 12px;">
                    <div style="text-align: center; margin-bottom: 10px;">
                        <div style="font-size: 32px;">${receiver.figure}</div>
                        <div style="font-size: 16px; font-weight: bold; color: #ffd700;">${receiver.name}</div>
                        <div style="color: #90EE90; font-size: 14px;">💰 ${receiver.money}€</div>
                    </div>
                    <div style="font-weight: bold; color: #ffd700; font-size: 13px; margin-bottom: 8px; border-bottom: 1px solid #ffd700; padding-bottom: 3px;">📦 PRAŠO (gauna):</div>
                    <div id="receiverRequestProps" style="max-height: 200px; overflow-y: auto; margin-bottom: 10px;"></div>
                    <div style="margin-top: 8px;">
                        <label style="color: #ffd700; font-size: 12px;">➕ PRIDEDA PINIGŲ:</label>
                        <input type="number" id="receiverRequestMoney" value="0" min="0" max="${receiver.money}" style="width: 100%; padding: 5px; margin-top: 3px; border-radius: 8px; border: none; background: #1b4d1b; color: #ffd700; font-size: 12px;">
                    </div>
                </div>
            </div>
            <div style="display: flex; gap: 15px; justify-content: center; margin-top: 20px;">
                <button id="tradeSendBtn" style="background: #ffd700; color: #8b0000; padding: 10px 25px; font-size: 16px; font-weight: bold; border: none; border-radius: 25px; cursor: pointer;">📤 SIŪLYTI ${receiver.name}</button>
                <button id="tradeCancelBtn" style="background: #8b0000; color: #ffd700; padding: 10px 25px; font-size: 16px; font-weight: bold; border: none; border-radius: 25px; cursor: pointer;">❌ ATŠAUKTI</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    updateTradePropertyList(modal, sender, 'senderOfferProps', 'sender');
    updateTradePropertyList(modal, receiver, 'receiverRequestProps', 'receiver');
    
    modal.querySelector('#tradeSendBtn').addEventListener('click', () => {
        const senderOfferMoney = parseInt(modal.querySelector('#senderOfferMoney').value) || 0;
        const receiverRequestMoney = parseInt(modal.querySelector('#receiverRequestMoney').value) || 0;
        
        const senderSelectedProps = [];
        const receiverSelectedProps = [];
        
        modal.querySelectorAll('.trade-property-checkbox.sender:checked').forEach(cb => {
            const propId = parseInt(cb.value);
            const prop = sender.properties.find(p => p.id === propId);
            if (prop) senderSelectedProps.push(prop);
        });
        
        modal.querySelectorAll('.trade-property-checkbox.receiver:checked').forEach(cb => {
            const propId = parseInt(cb.value);
            const prop = receiver.properties.find(p => p.id === propId);
            if (prop) receiverSelectedProps.push(prop);
        });
        
        if (sender.money < senderOfferMoney) {
            showToast(`${sender.name} neturi ${senderOfferMoney}€!`, 'error');
            return;
        }
        if (receiver.money < receiverRequestMoney) {
            showToast(`${receiver.name} neturi ${receiverRequestMoney}€!`, 'error');
            return;
        }
        
        modal.remove();
        
        const tradeOffer = {
            fromPlayerId: sender.id,
            fromPlayerName: sender.name,
            fromPlayerFigure: sender.figure,
            toPlayerId: receiver.id,
            toPlayerName: receiver.name,
            toPlayerFigure: receiver.figure,
            senderProps: senderSelectedProps.map(p => ({ id: p.id, name: p.name })),
            receiverProps: receiverSelectedProps.map(p => ({ id: p.id, name: p.name })),
            senderMoney: senderOfferMoney,
            receiverMoney: receiverRequestMoney,
            timestamp: Date.now(),
            status: 'pending'
        };
        
        if (window.gameId && window.database) {
            window.sendTradeOffer(tradeOffer);
            addLog(`📨 ${sender.name} išsiuntė prekybos pasiūlymą ${receiver.name}. Laukiama atsakymo...`);
            showToast(`✅ Pasiūlymas išsiųstas ${receiver.name}! Laukiama atsakymo.`, 'success');
        } else {
            showTradeProposalToReceiver(sender, receiver, senderSelectedProps, receiverSelectedProps, senderOfferMoney, receiverRequestMoney);
        }
    });
    
    modal.querySelector('#tradeCancelBtn').addEventListener('click', () => modal.remove());
}

function showTradeProposalToReceiver(sender, receiver, senderProps, receiverProps, senderMoney, receiverMoney) {
    const existingModal = document.querySelector('.trade-proposal-modal');
    if (existingModal) existingModal.remove();
    
    const modal = document.createElement('div');
    modal.className = 'trade-proposal-modal';
    modal.id = 'activeTradeProposal';
    modal.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #1b4d1b; border-radius: 20px; border: 3px solid #ffd700; z-index: 10010; text-align: center; width: auto; max-width: 500px; min-width: 350px; padding: 20px; animation: fadeIn 0.3s ease;';
    modal.innerHTML = `
        <div>
            <h3 style="color: #ffd700; margin-bottom: 15px;">📋 PREKYBOS PASIŪLYMAS 📋</h3>
            <div style="background: #0d2b0d; border-radius: 15px; padding: 15px; margin-bottom: 15px;">
                <div style="font-size: 40px; text-align: center;">${sender.figure}</div>
                <div style="font-size: 18px; font-weight: bold; color: #ffd700; text-align: center;">${sender.name}</div>
                <div style="text-align: center; color: #90EE90; margin-bottom: 15px;">SIŪLO:</div>
                <div style="margin-bottom: 15px;">
                    ${senderProps.map(p => `<div style="padding: 5px; background: #1b4d1b; margin: 3px 0; border-radius: 8px;">🏠 ${p.name}</div>`).join('')}
                    ${senderMoney > 0 ? `<div style="padding: 5px; background: #1b4d1b; margin: 3px 0; border-radius: 8px;">💰 +${senderMoney}€</div>` : ''}
                    ${senderProps.length === 0 && senderMoney === 0 ? '<div>❌ Nieko nesiūlo</div>' : ''}
                </div>
                <div style="text-align: center; color: #ffd700; margin: 15px 0 10px 0;">⬇️ JUMS REIKĖS DUOTI ⬇️</div>
                <div>
                    ${receiverProps.map(p => `<div style="padding: 5px; background: #1b4d1b; margin: 3px 0; border-radius: 8px;">🏠 ${p.name}</div>`).join('')}
                    ${receiverMoney > 0 ? `<div style="padding: 5px; background: #1b4d1b; margin: 3px 0; border-radius: 8px;">💰 +${receiverMoney}€</div>` : ''}
                </div>
            </div>
            <div style="display: flex; gap: 15px; justify-content: center;">
                <button id="tradeAcceptBtn" style="background: #2e7d32; color: #ffd700; padding: 10px 25px; font-size: 16px; font-weight: bold; border: none; border-radius: 25px; cursor: pointer;">✅ PRIIMTI</button>
                <button id="tradeRejectBtn" style="background: #8b0000; color: #ffd700; padding: 10px 25px; font-size: 16px; font-weight: bold; border: none; border-radius: 25px; cursor: pointer;">❌ ATMESTI</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const acceptBtn = modal.querySelector('#tradeAcceptBtn');
    const rejectBtn = modal.querySelector('#tradeRejectBtn');
    
    acceptBtn.onclick = () => {
        if (window.gameId && window.database) {
            window.database.ref('games/' + window.gameId + '/pendingTrade').remove();
        }
        modal.remove();
        executeTrade(sender, receiver, senderProps, receiverProps, senderMoney, receiverMoney);
        addLog(`✅ ${receiver.name} priėmė ${sender.name} prekybos pasiūlymą!`);
        showToast(`✅ Priėmėte pasiūlymą! Mainai įvykdyti.`, 'success');
        updateUI();
        updatePlayersCards();
        updateCellDisplayWithOwner();
        if (typeof updateBuildButtons === 'function') updateBuildButtons();
        if (typeof saveFullGameState === 'function') saveFullGameState();
        if (typeof saveCellOwners === 'function') saveCellOwners();
    };
    
    rejectBtn.onclick = () => {
        if (window.gameId && window.database) {
            window.database.ref('games/' + window.gameId + '/pendingTrade').remove();
        }
        modal.remove();
        addLog(`❌ ${receiver.name} atmetė ${sender.name} prekybos pasiūlymą.`);
        showToast(`❌ Atmetėte pasiūlymą.`, 'warning');
    };
    
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
}

function executeTrade(sender, receiver, senderProps, receiverProps, senderMoney, receiverMoney) {
    console.log("🔄 Vykdomi mainai tarp:", sender.name, "ir", receiver.name);
    
    senderProps.forEach(prop => {
        const cellData = getCellById(prop.id);
        if (cellData) {
            sender.properties = sender.properties.filter(p => p.id !== prop.id);
            receiver.properties.push(prop);
            cellData.owner = receiver.id;
            addLog(`${sender.name} perdavė "${prop.name}" žaidėjui ${receiver.name}.`);
        }
    });
    
    receiverProps.forEach(prop => {
        const cellData = getCellById(prop.id);
        if (cellData) {
            receiver.properties = receiver.properties.filter(p => p.id !== prop.id);
            sender.properties.push(prop);
            cellData.owner = sender.id;
            addLog(`${receiver.name} perdavė "${prop.name}" žaidėjui ${sender.name}.`);
        }
    });
    
    sender.money = sender.money - senderMoney + receiverMoney;
    receiver.money = receiver.money - receiverMoney + senderMoney;
    
    addLog(`💰 Pinigų mainai: ${sender.name} gavo ${receiverMoney}€, ${receiver.name} gavo ${senderMoney}€.`);
    addLog(`✅ PREKYBA: ${sender.name} ir ${receiver.name} sėkmingai apsikeitė!`);
    showToast(`🎉 Prekyba sėkminga!`, 'success');
    playSound('success');
    
    updateUI();
    updatePlayersCards();
    updateCellDisplayWithOwner();
    if (typeof updateBuildButtons === 'function') updateBuildButtons();
    if (typeof saveFullGameState === 'function') saveFullGameState();
    if (typeof saveCellOwners === 'function') saveCellOwners();
}

function updateTradePropertyList(modal, player, containerId, side) {
    const container = modal.querySelector(`#${containerId}`);
    container.innerHTML = '';
    
    player.properties.forEach(prop => {
        const cellData = getCellById(prop.id);
        const div = document.createElement('div');
        div.className = 'trade-property-checkbox-item';
        
        let colorClass = '';
        let colorIcon = '🏠';
        if (cellData.color) {
            const colors = { 
                'brown': '🟤', 'lightblue': '🔵', 'orange': '🟠', 
                'yellow': '🟡', 'red': '🔴', 'purple': '🟣', 
                'bronze': '🥉', 'butelka': '🍾', 'lime': '🟢', 
                'brightblue': '💙' 
            };
            colorIcon = colors[cellData.color] || '🏠';
            colorClass = `prop-color-${cellData.color}`;
        }
        
        div.innerHTML = `
            <div class="trade-mini-card ${colorClass}" style="display: flex; align-items: center; gap: 10px; padding: 8px; margin: 5px 0; background: #1b4d1b; border-radius: 10px; border: 1px solid #ffd700;">
                <input type="checkbox" class="trade-property-checkbox ${side}" value="${prop.id}" style="width: 18px; height: 18px;">
                <span style="font-size: 20px;">${colorIcon}</span>
                <span style="flex: 1; font-weight: bold; color: #ffd700;">${prop.name}</span>
                <span style="color: #90EE90;">${cellData.price}€</span>
            </div>
        `;
        container.appendChild(div);
    });
    
    if (player.properties.length === 0) {
        container.innerHTML = '<div class="trade-no-properties">📭 Nėra nuosavybių</div>';
    }
}

window.openTradeMenu = openTradeMenu;
window.showBankTradeModal = showBankTradeModal;
window.showPlayerTradeModal = showPlayerTradeModal;
window.executeTrade = executeTrade;
window.showTradeProposalToReceiver = showTradeProposalToReceiver;