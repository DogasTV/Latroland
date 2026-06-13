// ==================== ĮKEITIMO SISTEMA ====================

function openPledgeModal(player) {
    console.log("🏦 Atidaromas įkeitimo modalas žaidėjui:", player?.name);
    
    if (!player) {
        console.error("❌ Player nerastas!");
        showToast("Klaida: žaidėjas nerastas", "error");
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'pledge-modal';
    modal.innerHTML = `
        <div class="pledge-modal-content">
            <h3>🏦 ĮKEITIMO SISTEMA 🏦</h3>
            <div class="pledge-player-name">${player.figure} ${player.name}</div>
            <div class="pledge-money">💰 Pinigai: ${player.money}€</div>
            <div class="pledge-section">
                <h4>🏠 JŪSŲ NUOSAVYBĖS</h4>
                <div class="pledge-properties-list" id="pledgePropertiesList">
                    ${generatePledgePropertiesList(player)}
                </div>
            </div>
            <div class="pledge-section">
                <h4>🔒 ĮKEISTOS NUOSAVYBĖS</h4>
                <div class="pledge-pledged-list" id="pledgePledgedList">
                    ${generatePledgedPropertiesList(player)}
                </div>
            </div>
            <div class="pledge-buttons">
                <button id="pledgeCloseBtn" class="pledge-close-btn">❌ UŽDARYTI</button>
            </div>
            <div class="pledge-hint">
                💡 Įkeitus gaunate 50% nuosavybės vertės<br>
                🔓 Išpirkti kainuoja 50% + 20% palūkanų<br>
                ⚠️ Įkeista nuosavybė NEDUODA nuomos
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Įkeitimo mygtukai
    player.properties.forEach(prop => {
        const cellData = getCellById(prop.id);
        if (!cellData) return;
        
        const isPledged = player.pledgedProperties && player.pledgedProperties.some(p => p.id === prop.id);
        const hasHouses = (player.houses[prop.id] || 0) > 0;
        
        if (!isPledged) {
            const pledgeBtn = modal.querySelector(`#pledge-btn-${prop.id}`);
            if (pledgeBtn && !hasHouses) {
                pledgeBtn.addEventListener('click', () => {
                    pledgeProperty(player, prop, cellData, modal);
                });
            }
        }
    });
    
    // Išpirkimo mygtukai
    if (player.pledgedProperties) {
        player.pledgedProperties.forEach(pledged => {
            const redeemBtn = modal.querySelector(`#redeem-btn-${pledged.id}`);
            if (redeemBtn) {
                redeemBtn.addEventListener('click', () => {
                    redeemPledgedProperty(player, pledged, modal);
                });
            }
        });
    }
    
    const closeBtn = modal.querySelector('#pledgeCloseBtn');
    if (closeBtn) closeBtn.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
}

function generatePledgePropertiesList(player) {
    if (!player.properties || player.properties.length === 0) {
        return '<div class="pledge-no-properties">📭 Neturite nuosavybių</div>';
    }
    
    let html = '';
    player.properties.forEach(prop => {
        const cellData = getCellById(prop.id);
        if (!cellData) return;
        
        const isPledged = player.pledgedProperties && player.pledgedProperties.some(p => p.id === prop.id);
        const hasHouses = (player.houses[prop.id] || 0) > 0;
        const housesCount = player.houses[prop.id] || 0;
        const houseIcon = housesCount === 5 ? '🏨' : housesCount > 0 ? '🏠'.repeat(housesCount) : '';
        
        if (!isPledged) {
            const pledgeValue = Math.floor(cellData.price * 0.5);
            html += `
                <div class="pledge-property-item">
                    <div class="pledge-property-info">
                        <span class="pledge-property-name">${cellData.name}</span>
                        <span class="pledge-property-value">💰 ${cellData.price}€</span>
                        ${houseIcon ? `<span class="pledge-property-houses">${houseIcon}</span>` : ''}
                        <span class="pledge-property-pledge-value">🔒 Įkeitimo vertė: ${pledgeValue}€</span>
                    </div>
                    <button id="pledge-btn-${prop.id}" class="pledge-action-btn pledge-btn">
                        🏦 ĮKEISTI (${pledgeValue}€)
                    </button>
                    ${hasHouses ? '<div class="pledge-warning">⚠️ Pirmiausia nugriaukite namelius</div>' : ''}
                </div>
            `;
        }
    });
    
    return html || '<div class="pledge-no-properties">📭 Nėra neįkeistų nuosavybių</div>';
}

function generatePledgedPropertiesList(player) {
    if (!player.pledgedProperties || player.pledgedProperties.length === 0) {
        return '<div class="pledge-no-properties">🔓 Nėra įkeistų nuosavybių</div>';
    }
    
    let html = '';
    player.pledgedProperties.forEach(pledged => {
        const cellData = getCellById(pledged.id);
        if (!cellData) return;
        
        const redeemCost = Math.floor(pledged.pledgedValue * 1.2);
        html += `
            <div class="pledge-property-item pledged-item">
                <div class="pledge-property-info">
                    <span class="pledge-property-name">🔒 ${cellData.name}</span>
                    <span class="pledge-property-value">💰 ${cellData.price}€</span>
                    <span class="pledge-property-pledge-value">Įkeista už: ${pledged.pledgedValue}€</span>
                    <span class="pledge-property-redeem-cost">Išpirkimas: ${redeemCost}€ (50% + 20%)</span>
                </div>
                <button id="redeem-btn-${pledged.id}" class="pledge-action-btn redeem-btn">
                    🔓 IŠPIRKTI (${redeemCost}€)
                </button>
            </div>
        `;
    });
    
    return html;
}

function pledgeProperty(player, prop, cellData, modal) {
    const pledgeValue = Math.floor(cellData.price * 0.5);
    
    const confirmModal = document.createElement('div');
    confirmModal.className = 'pledge-confirm-modal';
    confirmModal.innerHTML = `
        <div class="pledge-confirm-content">
            <h3>🏦 ĮKEITIMAS 🏦</h3>
            <div class="pledge-confirm-property">${prop.name}</div>
            <div class="pledge-confirm-value">Gausite: ${pledgeValue}€</div>
            <div class="pledge-confirm-warning">Išpirkimas: ${Math.floor(pledgeValue * 1.2)}€</div>
            <div class="pledge-confirm-message">Ar tikrai norite įkeisti šią nuosavybę?</div>
            <div class="pledge-confirm-buttons">
                <button id="pledgeConfirmYes" class="pledge-confirm-yes">✅ TAIP, ĮKEISTI</button>
                <button id="pledgeConfirmNo" class="pledge-confirm-no">❌ NE, ATŠAUKTI</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(confirmModal);
    
    confirmModal.querySelector('#pledgeConfirmYes').onclick = () => {
        confirmModal.remove();
        
        player.money += pledgeValue;
        if (!player.pledgedProperties) player.pledgedProperties = [];
        player.pledgedProperties.push({ id: prop.id, name: prop.name, pledgedValue: pledgeValue });
        
        const cellData2 = getCellById(prop.id);
        if (cellData2) cellData2.pledged = true;
        
        addLog(`${player.name} įkeitė "${prop.name}" bankui už ${pledgeValue}€`);
        showToast(`🔒 Įkeitėte "${prop.name}" už ${pledgeValue}€`, 'info');
        
        updateUI();
        updatePlayersCards();
        updateCellDisplayWithOwner();
        modal.remove();
        openPledgeModal(player);
    };
    
    confirmModal.querySelector('#pledgeConfirmNo').onclick = () => confirmModal.remove();
    confirmModal.addEventListener('click', (e) => { if (e.target === confirmModal) confirmModal.remove(); });
}

function redeemPledgedProperty(player, pledged, modal) {
    const redeemCost = Math.floor(pledged.pledgedValue * 1.2);
    
    if (player.money >= redeemCost) {
        const confirmModal = document.createElement('div');
        confirmModal.className = 'pledge-confirm-modal';
        confirmModal.innerHTML = `
            <div class="pledge-confirm-content">
                <h3>🔓 IŠPIRKIMAS 🔓</h3>
                <div class="pledge-confirm-property">${pledged.name}</div>
                <div class="pledge-confirm-value">Kaina: ${redeemCost}€</div>
                <div class="pledge-confirm-message">Ar tikrai norite išpirkti šią nuosavybę?</div>
                <div class="pledge-confirm-buttons">
                    <button id="redeemConfirmYes" class="pledge-confirm-yes">✅ TAIP, IŠPIRKTI</button>
                    <button id="redeemConfirmNo" class="pledge-confirm-no">❌ NE, ATŠAUKTI</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(confirmModal);
        
        confirmModal.querySelector('#redeemConfirmYes').onclick = () => {
            confirmModal.remove();
            
            player.money -= redeemCost;
            player.pledgedProperties = player.pledgedProperties.filter(p => p.id !== pledged.id);
            
            const cellData = getCellById(pledged.id);
            if (cellData) delete cellData.pledged;
            
            addLog(`${player.name} išpirko "${pledged.name}" iš banko už ${redeemCost}€`);
            showToast(`🔓 Išpirkote "${pledged.name}" už ${redeemCost}€`, 'success');
            
            updateUI();
            updatePlayersCards();
            updateCellDisplayWithOwner();
            modal.remove();
            openPledgeModal(player);
        };
        
        confirmModal.querySelector('#redeemConfirmNo').onclick = () => confirmModal.remove();
        confirmModal.addEventListener('click', (e) => { if (e.target === confirmModal) confirmModal.remove(); });
    } else {
        showToast(`❌ Neturite pakankamai pinigų išpirkti! Reikia ${redeemCost}€`, 'error');
    }
}

// Eksportuojame funkcijas
window.openPledgeModal = openPledgeModal;
window.pledgeProperty = pledgeProperty;
window.redeemPledgedProperty = redeemPledgedProperty;