// ==================== BANKROTO SISTEMA (PILNA VERSIJA) ====================

// Globali skolos kintamasis
let currentDebt = 0;
let debtModal = null;

// ========== PAGRINDINĖ BANKROTO FUNKCIJA ==========
function processBankruptcy(player, creditor = null) {
    if (player.bankrupt) return;
    
    player.bankrupt = true;
    
    // ========== DIDELIS RAUDONAS PRANEŠIMAS ==========
    const bankruptMessage = document.createElement('div');
    bankruptMessage.className = 'bankrupt-announcement';
    bankruptMessage.innerHTML = `
        <div class="bankrupt-announcement-content">
            <div class="bankrupt-icon">💀</div>
            <div class="bankrupt-player">${player.figure} ${player.name}</div>
            <div class="bankrupt-text">BANKRUTAVO!</div>
            <div class="bankrupt-subtext">Pašalintas iš žaidimo</div>
        </div>
    `;
    document.body.appendChild(bankruptMessage);
    
    // Animacija ir pašalinimas po 4 sekundžių
    setTimeout(() => {
        if (bankruptMessage.parentNode) {
            bankruptMessage.style.animation = 'fadeOut 0.5s ease forwards';
            setTimeout(() => {
                if (bankruptMessage.parentNode) bankruptMessage.remove();
            }, 500);
        }
    }, 4000);
    
    addLog(`💀 ${player.name} BANKRUTAVO!`);
    showToast(`💀 ${player.name} bankrutavo!`, 'error');
    
    // Išvalome garso įrašus šiam žaidėjui
    if (typeof resetBuildSoundForPlayer === 'function') {
        resetBuildSoundForPlayer(player.id);
    }
    
    // 1. Visos nuosavybės perduodamos bankui už 75% vertės
    const propertiesToTransfer = [...player.properties];
    let totalValue = 0;
    
    propertiesToTransfer.forEach(prop => {
        const cellData = getCellById(prop.id);
        if (!cellData) return;
        
        const sellValue = Math.floor(cellData.price * 0.75);
        totalValue += sellValue;
        
        delete cellData.owner;
        
        if (player.houses[prop.id]) {
            delete player.houses[prop.id];
        }
        
        addLog(`  📦 "${prop.name}" parduota bankui už ${sellValue}€`);
    });
    
    // 2. Įkeistos kortelės – bankas jas perima nemokamai
    if (player.pledgedProperties && player.pledgedProperties.length > 0) {
        player.pledgedProperties.forEach(prop => {
            const cellData = getCellById(prop.id);
            if (cellData) {
                delete cellData.owner;
                delete cellData.pledged;
                addLog(`  🔓 Įkeista "${prop.name}" perimta banko (įkeitimas anuliuotas)`);
            }
        });
    }
    
    // 3. Pridedame pinigus iš pardavimų
    player.money += totalValue;
    addLog(`  💰 Iš pardavimų gauta: ${totalValue}€`);
    
    // 4. Padengiame skolą (jei yra)
    if (currentDebt > 0) {
        if (player.money >= currentDebt) {
            player.money -= currentDebt;
            addLog(`  💸 Skola ${currentDebt}€ padengta. Liko pinigų: ${player.money}€`);
        } else {
            addLog(`  💸 Skola ${currentDebt}€ iš dalies padengta (${player.money}€). Likutis nurašomas.`);
            player.money = 0;
        }
        currentDebt = 0;
    }
    
    // 5. Išvalome žaidėjo duomenis
    player.properties = [];
    player.pledgedProperties = [];
    player.houses = {};
    
    // 6. Pašalinti žetoną nuo lentos
    if (player.token && player.token.parentNode) {
        player.token.parentNode.removeChild(player.token);
        player.token = null;
    }
    
    // 7. Atnaujinti UI
    updateUI();
    updatePlayersCards();
    updateCellDisplayWithOwner();
    if (typeof updateBuildButtons === 'function') updateBuildButtons();
    
    // 8. Patikrinti, ar žaidimas baigtas
    const activePlayersList = players.filter(p => !p.bankrupt && p.id < activePlayers);
    
    if (activePlayersList.length < 2) {
        const winner = activePlayersList[0];
        if (winner) {
            addLog(`🏆 ŽAIDIMAS BAIGTAS! Laimėtojas: ${winner.name} 🏆`);
            showToast(`🏆 ${winner.name} LAIMĖJO ŽAIDIMĄ! 🏆`, 'success');
            
            setTimeout(() => {
                const winnerModal = document.createElement('div');
                winnerModal.className = 'winner-confirm-modal';
                winnerModal.innerHTML = `
                    <div class="winner-confirm-content">
                        <h3>🏆 ŽAIDIMAS BAIGTAS! 🏆</h3>
                        <div class="winner-confirm-player">🏆 ${winner.figure} ${winner.name} 🏆</div>
                        <div class="winner-confirm-message">
                            Laimėjo žaidimą!
                        </div>
                        <div class="winner-confirm-buttons">
                            <button id="winnerConfirmYes" class="winner-confirm-yes">✅ PRADĖTI NAUJĄ ŽAIDIMĄ</button>
                            <button id="winnerConfirmNo" class="winner-confirm-no">❌ UŽDARYTI</button>
                        </div>
                    </div>
                `;
                
                document.body.appendChild(winnerModal);
                
                const yesBtn = winnerModal.querySelector('#winnerConfirmYes');
                const noBtn = winnerModal.querySelector('#winnerConfirmNo');
                
                yesBtn.addEventListener('click', () => {
                    winnerModal.remove();
                    location.reload();
                });
                
                noBtn.addEventListener('click', () => {
                    winnerModal.remove();
                });
                
                winnerModal.addEventListener('click', (e) => {
                    if (e.target === winnerModal) winnerModal.remove();
                });
            }, 1000);
        }
        return;
    }
    
    // 9. Jei bankrutavęs žaidėjas buvo dabartinis – pereiti prie kito
    if (currentPlayerIndex === player.id) {
        addLog(`➡️ Praleidžiamas ${player.name} ėjimas (bankrutavo)`);
        nextPlayer();
    }
    
    // 10. Uždaryti skolos modalą jei atidarytas
    if (debtModal) {
        debtModal.remove();
        debtModal = null;
    }
    
    // IŠSAUGOME VISĄ ŽAIDIMO BŪSENĄ
    if (typeof saveFullGameState === 'function') {
        saveFullGameState();
    }
}

// ========== SKOLOS APDOROJIMAS (kai trūksta pinigų) ==========
function handleDebt(requiredAmount, currentPlayer, creditor = null) {
    const shortage = requiredAmount - currentPlayer.money;
    if (shortage <= 0) {
        currentPlayer.money -= requiredAmount;
        if (creditor) {
            creditor.money += requiredAmount;
        }
        addLog(`${currentPlayer.name} sumokėjo ${requiredAmount}€${creditor ? " " + creditor.name : ""}`);
        updateUI();
        updatePlayersCards();
        return true;
    }
    
    currentDebt = shortage;
    showDebtManagementModal(requiredAmount, currentPlayer, creditor);
    return false;
}

// ========== SKOLOS VALDYMO MODALAS ==========
function showDebtManagementModal(requiredAmount, player, creditor) {
    if (debtModal) {
        debtModal.remove();
    }
    
    const shortage = requiredAmount - player.money;
    
    debtModal = document.createElement('div');
    debtModal.className = 'debt-modal';
    debtModal.innerHTML = `
        <div class="debt-modal-content">
            <h3>💰 SKOLA 💰</h3>
            <div class="debt-player-name">${player.figure} ${player.name}</div>
            <div class="debt-amount">
                Reikia sumokėti: <span>${requiredAmount}€</span><br>
                Turite: <span>${player.money}€</span><br>
                <strong style="color:#ff6666">Trūksta: ${shortage}€</strong>
            </div>
            <div class="debt-options">
                <div class="debt-section">
                    <h4>🏠 JŪSŲ NUOSAVYBĖS</h4>
                    <div class="debt-properties-list" id="debtPropertiesList">
                        ${generateDebtPropertiesList(player)}
                    </div>
                </div>
                <div class="debt-buttons">
                    <button id="debtBankruptBtn" class="debt-bankrupt-btn">💀 SKELBTI BANKROTĄ</button>
                </div>
            </div>
            <div class="debt-hint">
                💡 Pasirinkite kortelę ir veiksmą iš apačios<br>
                🏦 Įkeitus – gaunate 50% vertės (išperkant +20%)<br>
                💰 Pardavus bankui – gaunate 75% vertės<br>
                🏚️ Nugriovus namelį – gaunate 50% statybos kainos
            </div>
        </div>
    `;
    
    document.body.appendChild(debtModal);
    
    player.properties.forEach(prop => {
        const cellData = getCellById(prop.id);
        if (!cellData) return;
        
        const propDiv = debtModal.querySelector(`#debt-prop-${prop.id}`);
        if (!propDiv) return;
        
        const isPledged = player.pledgedProperties && player.pledgedProperties.some(p => p.id === prop.id);
        const hasHouses = (player.houses[prop.id] || 0) > 0;
        
        if (!isPledged && !hasHouses) {
            const pledgeBtn = document.createElement('button');
            pledgeBtn.className = 'debt-action-btn pledge-btn';
            pledgeBtn.innerHTML = '🏦 ĮKEISTI (50%)';
            pledgeBtn.addEventListener('click', () => {
                showPledgeConfirmModal(player, prop, cellData, requiredAmount, creditor);
            });
            propDiv.appendChild(pledgeBtn);
        } else if (hasHouses) {
            const warning = document.createElement('span');
            warning.className = 'debt-warning';
            warning.innerHTML = '⚠️ Pirmiausia nugriaukite namelius';
            propDiv.appendChild(warning);
        } else if (isPledged) {
            const pledgedText = document.createElement('span');
            pledgedText.className = 'debt-pledged-text';
            pledgedText.innerHTML = '🔒 Įkeista (negalima parduoti)';
            propDiv.appendChild(pledgedText);
        }
        
        if (!isPledged) {
            const sellBtn = document.createElement('button');
            sellBtn.className = 'debt-action-btn sell-btn';
            sellBtn.innerHTML = '💰 PARDUOTI BANKUI (75%)';
            sellBtn.addEventListener('click', () => {
                showSellConfirmModal(player, prop, cellData, requiredAmount, creditor);
            });
            propDiv.appendChild(sellBtn);
        }
        
        if (!isPledged) {
            const tradeBtn = document.createElement('button');
            tradeBtn.className = 'debt-action-btn trade-btn';
            tradeBtn.innerHTML = '🔄 PARDUOTI KITAM (100%)';
            tradeBtn.addEventListener('click', () => {
                debtModal.remove();
                debtModal = null;
                openTradeMenu(player.id);
            });
            propDiv.appendChild(tradeBtn);
        }
        
        if (hasHouses) {
            const destroyBtn = document.createElement('button');
            destroyBtn.className = 'debt-action-btn destroy-btn';
            const housesCount = player.houses[prop.id] || 0;
            const refund = Math.floor((housesCount === 5 ? getHotelPrice(cellData) : getHousePrice(cellData) * housesCount) / 2);
            destroyBtn.innerHTML = `🏚️ GRIAUTI NAMELIUS (+${refund}€)`;
            destroyBtn.addEventListener('click', () => {
                destroyHouses(player, prop, cellData, requiredAmount, creditor);
            });
            propDiv.appendChild(destroyBtn);
        }
    });
    
    const bankruptBtn = debtModal.querySelector('#debtBankruptBtn');
    bankruptBtn.addEventListener('click', () => {
        const confirmModal = document.createElement('div');
        confirmModal.className = 'bankrupt-confirm-modal';
        confirmModal.innerHTML = `
            <div class="bankrupt-confirm-content">
                <h3>💀 BANKROTAS 💀</h3>
                <div class="bankrupt-confirm-player">${player.figure} ${player.name}</div>
                <div class="bankrupt-confirm-message">Ar tikrai norite skelbti bankrotą?</div>
                <div class="bankrupt-confirm-warning">⚠️ Prarasite visas nuosavybes ir būsite pašalintas iš žaidimo!</div>
                <div class="bankrupt-confirm-buttons">
                    <button id="bankruptConfirmYes" class="bankrupt-confirm-yes">✅ TAIP, SKELBTI BANKROTĄ</button>
                    <button id="bankruptConfirmNo" class="bankrupt-confirm-no">❌ NE, ATŠAUKTI</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(confirmModal);
        
        const yesBtn = confirmModal.querySelector('#bankruptConfirmYes');
        const noBtn = confirmModal.querySelector('#bankruptConfirmNo');
        
        yesBtn.addEventListener('click', () => {
            confirmModal.remove();
            debtModal.remove();
            debtModal = null;
            processBankruptcy(player, creditor);
        });
        
        noBtn.addEventListener('click', () => {
            confirmModal.remove();
        });
        
        confirmModal.addEventListener('click', (e) => {
            if (e.target === confirmModal) confirmModal.remove();
        });
    });
    
    debtModal.addEventListener('click', (e) => {
        if (e.target === debtModal) {
            debtModal.remove();
            debtModal = null;
        }
    });
}

function showPledgeConfirmModal(player, prop, cellData, requiredAmount, creditor) {
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
    
    const yesBtn = confirmModal.querySelector('#pledgeConfirmYes');
    const noBtn = confirmModal.querySelector('#pledgeConfirmNo');
    
    yesBtn.addEventListener('click', () => {
        confirmModal.remove();
        
        player.money += pledgeValue;
        if (!player.pledgedProperties) player.pledgedProperties = [];
        player.pledgedProperties.push({ id: prop.id, name: prop.name, pledgedValue: pledgeValue });
        
        const cellData2 = getCellById(prop.id);
        if (cellData2) {
            cellData2.pledged = true;
        }
        
        addLog(`${player.name} įkeitė "${prop.name}" bankui už ${pledgeValue}€`);
        showToast(`🔒 Įkeitėte "${prop.name}" už ${pledgeValue}€`, 'info');
        
        updateUI();
        updatePlayersCards();
        updateCellDisplayWithOwner();
        
        const newShortage = requiredAmount - player.money;
        if (newShortage <= 0) {
            player.money -= requiredAmount;
            if (creditor) creditor.money += requiredAmount;
            addLog(`${player.name} sumokėjo ${requiredAmount}€${creditor ? " " + creditor.name : ""}`);
            if (debtModal) debtModal.remove();
            debtModal = null;
            updateUI();
            updatePlayersCards();
        } else {
            if (debtModal) debtModal.remove();
            showDebtManagementModal(requiredAmount, player, creditor);
        }
    });
    
    noBtn.addEventListener('click', () => {
        confirmModal.remove();
    });
    
    confirmModal.addEventListener('click', (e) => {
        if (e.target === confirmModal) confirmModal.remove();
    });
}

function showSellConfirmModal(player, prop, cellData, requiredAmount, creditor) {
    const sellValue = Math.floor(cellData.price * 0.75);
    
    const confirmModal = document.createElement('div');
    confirmModal.className = 'sell-confirm-modal';
    confirmModal.innerHTML = `
        <div class="sell-confirm-content">
            <h3>💰 PARDAVIMAS BANKUI 💰</h3>
            <div class="sell-confirm-property">${prop.name}</div>
            <div class="sell-confirm-value">Gausite: ${sellValue}€</div>
            <div class="sell-confirm-warning">Kortelė grįš į rinką!</div>
            <div class="sell-confirm-message">Ar tikrai norite parduoti šią nuosavybę bankui?</div>
            <div class="sell-confirm-buttons">
                <button id="sellConfirmYes" class="sell-confirm-yes">✅ TAIP, PARDUOTI</button>
                <button id="sellConfirmNo" class="sell-confirm-no">❌ NE, ATŠAUKTI</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(confirmModal);
    
    const yesBtn = confirmModal.querySelector('#sellConfirmYes');
    const noBtn = confirmModal.querySelector('#sellConfirmNo');
    
    yesBtn.addEventListener('click', () => {
        confirmModal.remove();
        
        player.money += sellValue;
        player.properties = player.properties.filter(p => p.id !== prop.id);
        delete cellData.owner;
        
        if (player.houses[prop.id]) {
            delete player.houses[prop.id];
        }
        
        addLog(`${player.name} pardavė "${prop.name}" bankui už ${sellValue}€`);
        showToast(`💰 Pardavėte "${prop.name}" už ${sellValue}€`, 'success');
        
        updateUI();
        updatePlayersCards();
        updateCellDisplayWithOwner();
        
        const newShortage = requiredAmount - player.money;
        if (newShortage <= 0) {
            player.money -= requiredAmount;
            if (creditor) creditor.money += requiredAmount;
            addLog(`${player.name} sumokėjo ${requiredAmount}€${creditor ? " " + creditor.name : ""}`);
            if (debtModal) debtModal.remove();
            debtModal = null;
            updateUI();
            updatePlayersCards();
        } else {
            if (debtModal) debtModal.remove();
            showDebtManagementModal(requiredAmount, player, creditor);
        }
    });
    
    noBtn.addEventListener('click', () => {
        confirmModal.remove();
    });
    
    confirmModal.addEventListener('click', (e) => {
        if (e.target === confirmModal) confirmModal.remove();
    });
}

function generateDebtPropertiesList(player) {
    if (!player.properties || player.properties.length === 0) {
        return '<div class="debt-no-properties">📭 Neturite nuosavybių</div>';
    }
    
    let html = '';
    player.properties.forEach(prop => {
        const cellData = getCellById(prop.id);
        if (!cellData) return;
        
        const isPledged = player.pledgedProperties && player.pledgedProperties.some(p => p.id === prop.id);
        const housesCount = player.houses[prop.id] || 0;
        const houseIcon = housesCount === 5 ? '🏨' : housesCount > 0 ? '🏠'.repeat(housesCount) : '';
        
        html += `
            <div class="debt-property-item" id="debt-prop-${prop.id}" data-prop-id="${prop.id}">
                <div class="debt-property-info">
                    <span class="debt-property-name">${cellData.name}</span>
                    <span class="debt-property-value">💰 ${cellData.price}€</span>
                    ${houseIcon ? `<span class="debt-property-houses">${houseIcon}</span>` : ''}
                    ${isPledged ? '<span class="debt-pledged-badge">🔒 ĮKEISTA</span>' : ''}
                </div>
                <div class="debt-property-actions" id="debt-actions-${prop.id}"></div>
            </div>
        `;
    });
    return html;
}

function destroyHouses(player, prop, cellData, requiredAmount, creditor) {
    const housesCount = player.houses[prop.id] || 0;
    if (housesCount === 0) {
        showToast("Šioje nuosavybėje nėra namelių!", "warning");
        return;
    }
    
    let refund = 0;
    if (housesCount === 5) {
        refund = Math.floor(getHotelPrice(cellData) / 2);
    } else {
        refund = Math.floor(getHousePrice(cellData) * housesCount / 2);
    }
    
    const confirmModal = document.createElement('div');
    confirmModal.className = 'destroy-confirm-modal';
    confirmModal.innerHTML = `
        <div class="destroy-confirm-content">
            <h3>🏚️ GRIAUTI NAMELIUS 🏚️</h3>
            <div class="destroy-confirm-property">${prop.name}</div>
            <div class="destroy-confirm-value">Gausite: ${refund}€ grąžą!</div>
            <div class="destroy-confirm-message">Ar tikrai norite nugriauti ${housesCount === 5 ? 'VIEŠBUTĮ' : housesCount + ' NAMELIUS'}?</div>
            <div class="destroy-confirm-buttons">
                <button id="destroyConfirmYes" class="destroy-confirm-yes">✅ TAIP, GRIAUTI</button>
                <button id="destroyConfirmNo" class="destroy-confirm-no">❌ NE, ATŠAUKTI</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(confirmModal);
    
    const yesBtn = confirmModal.querySelector('#destroyConfirmYes');
    const noBtn = confirmModal.querySelector('#destroyConfirmNo');
    
    yesBtn.addEventListener('click', () => {
        confirmModal.remove();
        
        player.money += refund;
        delete player.houses[prop.id];
        
        addLog(`${player.name} nugriovė ${housesCount === 5 ? 'viešbutį' : housesCount + ' namelius'} ant "${prop.name}" ir gavo ${refund}€`);
        showToast(`🏚️ Nugriovėte namelius ir gavote ${refund}€`, 'info');
        
        updateUI();
        updatePlayersCards();
        updateCellDisplay(prop.id);
        if (typeof updateBuildButtons === 'function') updateBuildButtons();
        
        const newShortage = requiredAmount - player.money;
        if (newShortage <= 0) {
            player.money -= requiredAmount;
            if (creditor) creditor.money += requiredAmount;
            addLog(`${player.name} sumokėjo ${requiredAmount}€${creditor ? " " + creditor.name : ""}`);
            if (debtModal) debtModal.remove();
            debtModal = null;
            updateUI();
            updatePlayersCards();
        } else {
            if (debtModal) debtModal.remove();
            showDebtManagementModal(requiredAmount, player, creditor);
        }
    });
    
    noBtn.addEventListener('click', () => {
        confirmModal.remove();
    });
    
    confirmModal.addEventListener('click', (e) => {
        if (e.target === confirmModal) confirmModal.remove();
    });
}

function redeemPledgedProperty(player, propId) {
    if (!player.pledgedProperties) return false;
    
    const pledgedProp = player.pledgedProperties.find(p => p.id === propId);
    if (!pledgedProp) return false;
    
    const redeemCost = Math.floor(pledgedProp.pledgedValue * 1.2);
    
    if (player.money >= redeemCost) {
        const confirmModal = document.createElement('div');
        confirmModal.className = 'pledge-confirm-modal';
        confirmModal.innerHTML = `
            <div class="pledge-confirm-content">
                <h3>🔓 IŠPIRKIMAS 🔓</h3>
                <div class="pledge-confirm-property">${pledgedProp.name}</div>
                <div class="pledge-confirm-value">Kaina: ${redeemCost}€</div>
                <div class="pledge-confirm-message">Ar tikrai norite išpirkti šią nuosavybę?</div>
                <div class="pledge-confirm-buttons">
                    <button id="redeemConfirmYes" class="pledge-confirm-yes">✅ TAIP, IŠPIRKTI</button>
                    <button id="redeemConfirmNo" class="pledge-confirm-no">❌ NE, ATŠAUKTI</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(confirmModal);
        
        const yesBtn = confirmModal.querySelector('#redeemConfirmYes');
        const noBtn = confirmModal.querySelector('#redeemConfirmNo');
        
        yesBtn.addEventListener('click', () => {
            confirmModal.remove();
            player.money -= redeemCost;
            player.pledgedProperties = player.pledgedProperties.filter(p => p.id !== propId);
            
            const cellData = getCellById(propId);
            if (cellData) {
                delete cellData.pledged;
            }
            
            addLog(`${player.name} išpirko "${pledgedProp.name}" iš banko už ${redeemCost}€`);
            showToast(`🔓 Išpirkote "${pledgedProp.name}" už ${redeemCost}€`, 'success');
            
            updateUI();
            updatePlayersCards();
            updateCellDisplayWithOwner();
        });
        
        noBtn.addEventListener('click', () => {
            confirmModal.remove();
        });
        
        confirmModal.addEventListener('click', (e) => {
            if (e.target === confirmModal) confirmModal.remove();
        });
        
        return true;
    } else {
        showToast(`Neturite pakankamai pinigų išpirkti! Reikia ${redeemCost}€`, 'error');
        return false;
    }
}

window.processBankruptcy = processBankruptcy;
window.handleDebt = handleDebt;
window.redeemPledgedProperty = redeemPledgedProperty;