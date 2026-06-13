// ==================== ŽAIDĖJŲ KORTELIŲ VALDYMAS ====================

if (typeof window.currentDebt === 'undefined') window.currentDebt = 0;

function sortPropertiesByPriceAndColor(properties, player) {
    const sorted = [...properties];
    const colorOrder = {
        'brown': 1, 'lightblue': 2, 'orange': 3, 'bronze': 4,
        'red': 5, 'yellow': 6, 'darkgreen': 7, 'purple': 8,
        'lime': 9, 'brightblue': 10
    };
    sorted.sort((a, b) => {
        const cellDataA = getCellById(a.id);
        const cellDataB = getCellById(b.id);
        if (!cellDataA || !cellDataB) return 0;
        const colorOrderA = colorOrder[cellDataA.color] || 99;
        const colorOrderB = colorOrder[cellDataB.color] || 99;
        if (colorOrderA !== colorOrderB) return colorOrderA - colorOrderB;
        return (cellDataA.price || 0) - (cellDataB.price || 0);
    });
    return sorted;
}

function playerHasHouses(player) {
    if (!player.houses) return false;
    for (let propId in player.houses) {
        if (player.houses[propId] > 0) return true;
    }
    return false;
}

function createFloatingCards() {
    console.log("🏗️ createFloatingCards() iškviesta");
    const container = document.getElementById('floatingCardsContainer');
    if (!container) {
        console.error("❌ floatingCardsContainer nerastas!");
        return;
    }
    container.innerHTML = '';
    
    // Gauname vietinio žaidėjo ID
    const localPlayerId = getLocalPlayerId();
    if (localPlayerId === -1) {
        console.error("❌ Nepavyko nustatyti vietinio žaidėjo!");
        return;
    }
    
    const player = players[localPlayerId];
    if (!player || player.bankrupt) return;
    
    const playerCard = document.createElement('div');
    playerCard.className = `player-card ${localPlayerId === currentPlayerIndex ? 'active' : ''}`;
    playerCard.dataset.playerId = localPlayerId;
    playerCard.setAttribute('draggable', 'false');
    
    const savedSize = localStorage.getItem(`cardSize_${localPlayerId}`);
    if (savedSize) {
        const size = JSON.parse(savedSize);
        playerCard.style.width = size.width + 'px';
    } else {
        playerCard.style.width = '260px';
    }
    
    playerCard.style.position = 'absolute';
    playerCard.style.left = (player.x || 100) + 'px';
    playerCard.style.top = (player.y || 200 + (localPlayerId * 120)) + 'px';
    playerCard.style.cursor = 'default';
    playerCard.style.zIndex = '1000';
    playerCard.style.userSelect = 'none';
    
    let jailStatusHtml = '';
    if (inJail[localPlayerId] && !player.bankrupt) {
        jailStatusHtml = `<div class="player-jail-status">🚔 KALĖJIME (${jailTurns[localPlayerId] || 0}/3)</div>`;
    }
    
    let debtIndicatorHtml = '';
    if (window.currentDebt && currentPlayerIndex === localPlayerId) {
        debtIndicatorHtml = `<div class="player-debt-indicator">⚠️ SKOLA: <span style="color:#ff6666">-${window.currentDebt}€</span></div>`;
    }
    
    // MINI KORTELĖS (NUOSAVYBĖS)
    let propertiesHtml = '<div class="player-properties-title">🏠 Nuosavybės:</div>';
    propertiesHtml += '<div class="properties-mini-grid">';
    
    if (player.properties && player.properties.length > 0) {
        const sortedProperties = sortPropertiesByPriceAndColor(player.properties, player);
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
            const houses = player.houses[prop.id] || 0;
            const houseIcon = houses === 5 ? '🏨' : houses > 0 ? '🏠'.repeat(houses) : '';
            const isPledged = player.pledgedProperties && player.pledgedProperties.some(p => p.id === prop.id);
            
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
    
    const destroyButtonHtml = playerHasHouses(player) ? '<button class="player-extra-btn destroy-extra-btn" data-action="destroy">🏚️ GRIAUTI NAMELIUS</button>' : '';
    
    // Patikriname ar einamasis žaidėjas yra šios kortelės savininkas
    const isMyTurn = (currentPlayerIndex === localPlayerId);
    
    // Mygtukai rodomi TIK kai tavo eilė
    let extraButtonsHtml = '';
    if (isMyTurn && !player.bankrupt) {
        extraButtonsHtml = `
            <div class="player-extra-buttons">
                <button class="player-extra-btn pledge-extra-btn" data-action="pledge">🏦 ĮKEISTI</button>
                <button class="player-extra-btn sellbank-extra-btn" data-action="sellbank">💰 PARDUOTI</button>
                ${destroyButtonHtml}
            </div>
        `;
    }
    
    playerCard.innerHTML = `
        <div class="card-controls">
            <button class="card-drag-btn" data-card-id="${localPlayerId}" title="Tempti / Keisti dydį">✋</button>
            <button class="card-trade-btn" data-card-id="${localPlayerId}" title="Prekyba">🔄</button>
        </div>
        <div class="player-name">
            <div class="player-figure" style="font-size: 24px;">${player.figure}</div>
            ${player.name} (${player.figureName})
        </div>
        <div class="player-money">💰 Pinigai: <span>${player.money}</span> €</div>
        ${debtIndicatorHtml}
        <div class="player-position">📍 Pozicija: ${player.position}</div>
        ${jailStatusHtml}
        ${propertiesHtml}
        <div class="player-total-wealth">💎 Visas turtas: <span>${totalWealth}</span> €</div>
        ${extraButtonsHtml}
        <div class="card-resize-handles">
            <div class="card-resize-handle tl"></div>
            <div class="card-resize-handle tr"></div>
            <div class="card-resize-handle bl"></div>
            <div class="card-resize-handle br"></div>
        </div>
    `;
    
    container.appendChild(playerCard);
    initCardControls(playerCard, localPlayerId);
    
    const pledgeBtn = playerCard.querySelector('[data-action="pledge"]');
    const sellBankBtn = playerCard.querySelector('[data-action="sellbank"]');
    const destroyBtn = playerCard.querySelector('[data-action="destroy"]');
    
    if (pledgeBtn) {
        pledgeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (typeof openPledgeModal === 'function') {
                openPledgeModal(player);
            } else {
                showToast('Įkeitimo sistema dar neįkelta', 'error');
            }
        });
    }
    
    if (sellBankBtn) {
        sellBankBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openSellOptionsModal(player);
        });
    }
    
    if (destroyBtn) {
        destroyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openDestroyHousesModal(player);
        });
    }
    
    setTimeout(initHoverCards, 200);
}

function openSellOptionsModal(player) {
    console.log("🔓 openSellOptionsModal iškviesta žaidėjui:", player.name);
    
    let otherPlayers = [];
    for (let i = 0; i < players.length; i++) {
        if (i !== player.id && players[i] && !players[i].bankrupt) {
            otherPlayers.push(players[i]);
        }
    }
    
    console.log("👥 Kiti žaidėjai:", otherPlayers.map(p => p.name));
    
    let playersHtml = '';
    otherPlayers.forEach(p => {
        playersHtml += `<button class="sell-option-player-btn" data-player-id="${p.id}">👤 ${p.figure} ${p.name}</button>`;
    });
    
    const modal = document.createElement('div');
    modal.className = 'sell-options-modal';
    modal.innerHTML = `
        <div class="sell-options-modal-content">
            <h3>💰 KAM NORITE PARDUOTI? 💰</h3>
            <div class="sell-options-buttons">
                <button id="sellToBankBtn" class="sell-option-bank-btn">🏦 BANKUI (75% vertės)</button>
                ${playersHtml}
                <button id="sellCancelBtn" class="sell-option-cancel-btn">❌ ATŠAUKTI</button>
            </div>
            <div class="sell-options-hint">
                💡 Bankas perka už 75% nuosavybės vertės<br>
                💡 Žaidėjui galite parduoti už jūsų sutartą kainą
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const bankBtn = modal.querySelector('#sellToBankBtn');
    if (bankBtn) {
        bankBtn.addEventListener('click', () => {
            modal.remove();
            openSellToBankModal(player);
        });
    }
    
    otherPlayers.forEach(p => {
        const playerBtn = modal.querySelector(`.sell-option-player-btn[data-player-id="${p.id}"]`);
        if (playerBtn) {
            playerBtn.addEventListener('click', () => {
                modal.remove();
                if (typeof openTradeMenu === 'function') {
                    openTradeMenu(player.id, p.id);
                } else {
                    console.error("❌ openTradeMenu neapibrėžta!");
                    showToast('Prekybos sistema laikinai neveikia', 'error');
                }
            });
        }
    });
    
    const cancelBtn = modal.querySelector('#sellCancelBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => modal.remove());
    }
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

function openSellToBankModal(player) {
    if (!player.properties || player.properties.length === 0) {
        showToast('📭 Neturite nuosavybių pardavimui!', 'warning');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'sell-to-bank-modal';
    modal.innerHTML = `
        <div class="sell-to-bank-modal-content">
            <h3>💰 PARDUOTI NUOSAVYBĘ BANKUI 💰</h3>
            <div class="sell-player-name">${player.figure} ${player.name}</div>
            <div class="sell-money">💰 Pinigai: ${player.money}€</div>
            <div class="sell-section">
                <h4>🏠 JŪSŲ NUOSAVYBĖS</h4>
                <div class="sell-properties-list" id="sellPropertiesList">
                    ${generateSellPropertiesList(player)}
                </div>
            </div>
            <div class="sell-buttons">
                <button id="sellCloseBtn" class="sell-close-btn">❌ UŽDARYTI</button>
            </div>
            <div class="sell-hint">
                💡 Pardavus bankui gaunate 75% nuosavybės vertės<br>
                🏚️ Jei yra namelių – jie dingsta (negrąžinama)<br>
                🔓 Įkeistų nuosavybių parduoti negalima
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    player.properties.forEach(prop => {
        const cellData = getCellById(prop.id);
        if (!cellData) return;
        const isPledged = player.pledgedProperties && player.pledgedProperties.some(p => p.id === prop.id);
        const sellValue = Math.floor(cellData.price * 0.75);
        if (!isPledged) {
            const sellBtn = modal.querySelector(`#sell-btn-${prop.id}`);
            if (sellBtn) {
                sellBtn.addEventListener('click', () => {
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
                        if (player.houses[prop.id]) delete player.houses[prop.id];
                        addLog(`${player.name} pardavė "${prop.name}" bankui už ${sellValue}€`);
                        showToast(`💰 Pardavėte "${prop.name}" už ${sellValue}€!`, 'success');
                        playSound('sell');
                        updateUI();
                        updatePlayersCards();
                        updateCellDisplayWithOwner();
                        if (typeof updateBuildButtons === 'function') updateBuildButtons();
                        modal.remove();
                        openSellToBankModal(player);
                    });
                    
                    noBtn.addEventListener('click', () => {
                        confirmModal.remove();
                    });
                    
                    confirmModal.addEventListener('click', (e) => {
                        if (e.target === confirmModal) confirmModal.remove();
                    });
                });
            }
        }
    });
    
    const closeBtn = modal.querySelector('#sellCloseBtn');
    if (closeBtn) closeBtn.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
}

function generateSellPropertiesList(player) {
    if (!player.properties || player.properties.length === 0) return '<div class="sell-no-properties">📭 Neturite nuosavybių</div>';
    let html = '';
    player.properties.forEach(prop => {
        const cellData = getCellById(prop.id);
        if (!cellData) return;
        const isPledged = player.pledgedProperties && player.pledgedProperties.some(p => p.id === prop.id);
        const housesCount = player.houses[prop.id] || 0;
        const houseIcon = housesCount === 5 ? '🏨' : housesCount > 0 ? '🏠'.repeat(housesCount) : '';
        const sellValue = Math.floor(cellData.price * 0.75);
        if (!isPledged) {
            html += `
                <div class="sell-property-item">
                    <div class="sell-property-info">
                        <span class="sell-property-name">${cellData.name}</span>
                        <span class="sell-property-value">💰 ${cellData.price}€</span>
                        ${houseIcon ? `<span class="sell-property-houses">${houseIcon}</span>` : ''}
                        <span class="sell-property-sell-value">💵 Pardavimo vertė: ${sellValue}€</span>
                    </div>
                    <button id="sell-btn-${prop.id}" class="sell-action-btn">💰 PARDUOTI (${sellValue}€)</button>
                </div>
            `;
        } else {
            html += `
                <div class="sell-property-item pledged-item">
                    <div class="sell-property-info">
                        <span class="sell-property-name">🔒 ${cellData.name} (ĮKEISTA)</span>
                        <span class="sell-property-value">💰 ${cellData.price}€</span>
                    </div>
                    <div class="sell-pledged-warning">⚠️ Įkeistos nuosavybės parduoti negalima</div>
                </div>
            `;
        }
    });
    return html;
}

function openDestroyHousesModal(player) {
    const propertiesWithHouses = player.properties.filter(prop => (player.houses[prop.id] || 0) > 0);
    if (propertiesWithHouses.length === 0) {
        showToast('🏚️ Neturite namelių ar viešbučių griovimui!', 'warning');
        return;
    }
    
    let maxHousesInAnyProperty = 0;
    for (let prop of propertiesWithHouses) {
        const housesCount = player.houses[prop.id] || 0;
        if (housesCount > maxHousesInAnyProperty) maxHousesInAnyProperty = housesCount;
    }
    
    const maxProperties = propertiesWithHouses.filter(prop => (player.houses[prop.id] || 0) === maxHousesInAnyProperty);
    
    const modal = document.createElement('div');
    modal.className = 'destroy-houses-modal';
    modal.innerHTML = `
        <div class="destroy-houses-modal-content">
            <h3>🏚️ GRIAUTI NAMELIUS / VIEŠBUČIUS 🏚️</h3>
            <div class="destroy-player-name">${player.figure} ${player.name}</div>
            <div class="destroy-money">💰 Pinigai: ${player.money}€</div>
            <div class="destroy-section">
                <h4>🏠 NUOSAVYBĖS SU NAMELIAIS (MAX: ${maxHousesInAnyProperty})</h4>
                <div class="destroy-properties-list" id="destroyPropertiesList">
                    ${generateDestroyPropertiesList(player, maxProperties, maxHousesInAnyProperty)}
                </div>
            </div>
            <div class="destroy-buttons">
                <button id="destroyCloseBtn" class="destroy-close-btn">❌ UŽDARYTI</button>
            </div>
            <div class="destroy-hint">
                💡 Griauti galima TIK tuos sklypus, kurie turi DAUGIAUSIAI namelių (${maxHousesInAnyProperty})<br>
                🏨 Viešbutis griunamas į 4 namelius<br>
                ⚠️ Po griovimo nuosavybė lieka jūsų
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    maxProperties.forEach(prop => {
        const cellData = getCellById(prop.id);
        if (!cellData) return;
        const housesCount = player.houses[prop.id] || 0;
        
        const singleRefund = housesCount === 5 ? Math.floor(getHotelPrice(cellData) / 2) : Math.floor(getHousePrice(cellData) / 2);
        const actionText = housesCount === 5 ? `🏨 GRIAUTI VIEŠBUTĮ (+${singleRefund}€)` : `🏚️ GRIAUTI 1 NAMELĮ (+${singleRefund}€)`;
        
        const destroyBtn = document.createElement('button');
        destroyBtn.className = 'destroy-action-btn';
        destroyBtn.innerHTML = actionText;
        
        destroyBtn.addEventListener('click', () => {
            const confirmModal = document.createElement('div');
            confirmModal.className = 'destroy-confirm-modal';
            confirmModal.innerHTML = `
                <div class="destroy-confirm-content">
                    <h3>🏚️ GRIAUTI ${housesCount === 5 ? 'VIEŠBUTĮ' : 'NAMELĮ'} 🏚️</h3>
                    <div class="destroy-confirm-property">${prop.name}</div>
                    <div class="destroy-confirm-value">Gausite: ${singleRefund}€ grąžą!</div>
                    <div class="destroy-confirm-message">Ar tikrai norite nugriauti ${housesCount === 5 ? 'VIEŠBUTĮ' : 'VIENĄ NAMELĮ'}?</div>
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
                
                if (housesCount === 5) {
                    player.houses[prop.id] = 4;
                } else {
                    const newCount = housesCount - 1;
                    if (newCount === 0) {
                        delete player.houses[prop.id];
                    } else {
                        player.houses[prop.id] = newCount;
                    }
                }
                
                player.money += singleRefund;
                addLog(`${player.name} nugriovė ${housesCount === 5 ? 'VIEŠBUTĮ' : 'VIENĄ NAMELĮ'} nuo "${prop.name}" ir gavo ${singleRefund}€`);
                showToast(`🏚️ Nugriovėte ir gavote ${singleRefund}€`, 'info');
                playSound('sell');
                
                updateUI();
                updatePlayersCards();
                updateCellDisplay(prop.id);
                updateAllCellsBuildDisplay();
                if (typeof updateBuildButtons === 'function') updateBuildButtons();
                
                modal.remove();
                openDestroyHousesModal(player);
            });
            
            noBtn.addEventListener('click', () => {
                confirmModal.remove();
            });
            
            confirmModal.addEventListener('click', (e) => {
                if (e.target === confirmModal) confirmModal.remove();
            });
        });
        
        const propItem = modal.querySelector(`#destroy-prop-${prop.id}`);
        if (propItem) {
            const actionsDiv = propItem.querySelector('.destroy-property-actions');
            if (actionsDiv) {
                actionsDiv.appendChild(destroyBtn);
            }
        }
    });
    
    const closeBtn = modal.querySelector('#destroyCloseBtn');
    if (closeBtn) closeBtn.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
}

function generateDestroyPropertiesList(player, propertiesWithHouses, maxHouses) {
    let html = '';
    propertiesWithHouses.forEach(prop => {
        const cellData = getCellById(prop.id);
        if (!cellData) return;
        const housesCount = player.houses[prop.id] || 0;
        const houseIcon = housesCount === 5 ? '🏨' : '🏠'.repeat(housesCount);
        
        html += `
            <div class="destroy-property-item" id="destroy-prop-${prop.id}">
                <div class="destroy-property-info">
                    <span class="destroy-property-name">${cellData.name}</span>
                    <span class="destroy-property-houses">${houseIcon}</span>
                    <span class="destroy-property-current">🏠 ${housesCount === 5 ? 'VIEŠBUTIS' : housesCount + ' nameliai'}</span>
                    <span class="destroy-property-max-badge">⭐ DAUGIAUSIAI (${maxHouses})</span>
                </div>
                <div class="destroy-property-actions" id="destroy-actions-${prop.id}"></div>
            </div>
        `;
    });
    return html;
}

function initCardControls(card, cardId) {
    const dragBtn = card.querySelector('.card-drag-btn');
    const tradeBtn = card.querySelector('.card-trade-btn');
    const resizeHandles = card.querySelectorAll('.card-resize-handle');
    let dragModeActive = false;
    
    function updateButtons() {
        if (dragModeActive) {
            dragBtn.style.background = '#ffd700';
            dragBtn.style.color = '#8b0000';
            resizeHandles.forEach(handle => { 
                handle.style.display = 'block';
                handle.style.visibility = 'visible';
            });
        } else {
            dragBtn.style.background = '#2e7d32';
            dragBtn.style.color = '#ffd700';
            resizeHandles.forEach(handle => { 
                handle.style.display = 'none';
            });
        }
    }
    
    dragBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dragModeActive = !dragModeActive;
        updateButtons();
        showToast(dragModeActive ? 'Įjungtas kortelės tempimo režimas' : 'Išjungtas kortelės tempimo režimas', 'info');
    });
    
    tradeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof openTradeMenu === 'function') {
            openTradeMenu(cardId);
        } else {
            console.error('openTradeMenu not defined!');
            showToast('Prekybos sistema dar neveikia', 'error');
        }
    });
    
    let isDraggingCard = false;
    let dragStartX = 0, dragStartY = 0;
    let startLeft = 0, startTop = 0;
    
    const startDrag = (e) => {
        if (!dragModeActive) return;
        if (e.target === dragBtn || dragBtn.contains(e.target)) return;
        if (e.target === tradeBtn || tradeBtn.contains(e.target)) return;
        if (e.target.classList && e.target.classList.contains('card-resize-handle')) return;
        e.preventDefault();
        isDraggingCard = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        startLeft = card.offsetLeft;
        startTop = card.offsetTop;
        card.style.cursor = 'grabbing';
        card.classList.add('dragging-card');
    };
    
    const onDrag = (e) => {
        if (!isDraggingCard) return;
        const dx = e.clientX - dragStartX;
        const dy = e.clientY - dragStartY;
        let newLeft = startLeft + dx;
        let newTop = startTop + dy;
        newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - card.offsetWidth));
        newTop = Math.max(0, Math.min(newTop, window.innerHeight - card.offsetHeight));
        card.style.left = newLeft + 'px';
        card.style.top = newTop + 'px';
        players[cardId].x = newLeft;
        players[cardId].y = newTop;
    };
    
    const stopDrag = () => {
        if (isDraggingCard) {
            isDraggingCard = false;
            card.style.cursor = '';
            card.classList.remove('dragging-card');
            saveCardPositions();
        }
    };
    
    let isResizing = false;
    let resizeStartX = 0, resizeStartY = 0;
    let resizeStartWidth = 0, resizeStartHeight = 0;
    let resizeStartLeft = 0, resizeStartTop = 0;
    let resizeCorner = '';
    
    const startResize = (e, corner) => {
        if (!dragModeActive) return;
        e.preventDefault();
        e.stopPropagation();
        isResizing = true;
        resizeCorner = corner;
        resizeStartX = e.clientX;
        resizeStartY = e.clientY;
        resizeStartWidth = card.offsetWidth;
        resizeStartHeight = card.offsetHeight;
        resizeStartLeft = card.offsetLeft;
        resizeStartTop = card.offsetTop;
        document.body.style.cursor = `${corner === 'tl' || corner === 'br' ? 'nw' : 'ne'}-resize`;
    };
    
    const onResize = (e) => {
        if (!isResizing) return;
        const dx = e.clientX - resizeStartX;
        const dy = e.clientY - resizeStartY;
        let newWidth = resizeStartWidth;
        let newHeight = resizeStartHeight;
        let newLeft = resizeStartLeft;
        let newTop = resizeStartTop;
        switch(resizeCorner) {
            case 'br': newWidth = Math.max(200, resizeStartWidth + dx); newHeight = Math.max(150, resizeStartHeight + dy); break;
            case 'bl': newWidth = Math.max(200, resizeStartWidth - dx); newHeight = Math.max(150, resizeStartHeight + dy); newLeft = resizeStartLeft + (resizeStartWidth - newWidth); break;
            case 'tr': newWidth = Math.max(200, resizeStartWidth + dx); newHeight = Math.max(150, resizeStartHeight - dy); newTop = resizeStartTop + (resizeStartHeight - newHeight); break;
            case 'tl': newWidth = Math.max(200, resizeStartWidth - dx); newHeight = Math.max(150, resizeStartHeight - dy); newLeft = resizeStartLeft + (resizeStartWidth - newWidth); newTop = resizeStartTop + (resizeStartHeight - newHeight); break;
        }
        card.style.width = newWidth + 'px';
        card.style.height = 'auto';
        card.style.left = newLeft + 'px';
        card.style.top = newTop + 'px';
        localStorage.setItem(`cardSize_${cardId}`, JSON.stringify({ width: newWidth }));
    };
    
    const stopResize = () => {
        if (isResizing) {
            isResizing = false;
            document.body.style.cursor = '';
            saveCardPositions();
        }
    };
    
    card.addEventListener('mousedown', startDrag);
    window.addEventListener('mousemove', onDrag);
    window.addEventListener('mouseup', stopDrag);
    resizeHandles.forEach(handle => {
        const corner = handle.classList.contains('tl') ? 'tl' : handle.classList.contains('tr') ? 'tr' : handle.classList.contains('bl') ? 'bl' : 'br';
        handle.addEventListener('mousedown', (e) => startResize(e, corner));
    });
    window.addEventListener('mousemove', onResize);
    window.addEventListener('mouseup', stopResize);
    updateButtons();
}

function updatePlayersCards() {
    const playerCards = document.querySelectorAll('.player-card');
    playerCards.forEach((card, index) => {
        if (index < activePlayers) {
            const player = players[index];
            if (!player) return;
            
            if (player.bankrupt) {
                card.classList.add('bankrupt-card');
                const playerNameDiv = card.querySelector('.player-name');
                const playerMoneyDiv = card.querySelector('.player-money');
                const playerPositionDiv = card.querySelector('.player-position');
                const playerPropertiesDiv = card.querySelector('.player-properties');
                const playerWealthDiv = card.querySelector('.player-total-wealth');
                const extraButtons = card.querySelector('.player-extra-buttons');
                const tradeBtn = card.querySelector('.card-trade-btn');
                
                if (playerNameDiv) {
                    playerNameDiv.innerHTML = `<div class="player-figure" style="font-size: 24px; filter: grayscale(1);">${player.figure}</div>${player.name} (BANKRUTAVO)`;
                    playerNameDiv.style.color = '#ff6666';
                }
                if (playerMoneyDiv) playerMoneyDiv.innerHTML = '💰 BANKRUTAVĘS';
                if (playerPositionDiv) playerPositionDiv.innerHTML = '📍 BANKRUTAVĘS';
                if (playerPropertiesDiv) playerPropertiesDiv.innerHTML = '<div class="player-properties-title">🏠 Nuosavybės:</div><div class="prop-mini-empty">💀 BANKRUTAVĘS</div>';
                if (playerWealthDiv) playerWealthDiv.innerHTML = '💎 Visas turtas: 0€';
                if (extraButtons) extraButtons.style.display = 'none';
                if (tradeBtn) tradeBtn.disabled = true;
                card.classList.remove('active');
                return;
            }
            
            card.classList.remove('bankrupt-card');
            
            // Atnaujiname aktyvumo klasę
            if (index === currentPlayerIndex) { 
                card.classList.add('active'); 
            } else { 
                card.classList.remove('active'); 
            }
            
            const moneySpan = card.querySelector('.player-money span');
            const positionDiv = card.querySelector('.player-position');
            if (moneySpan) moneySpan.innerText = player.money;
            if (positionDiv) positionDiv.innerHTML = `📍 Pozicija: ${player.position}`;
            
            let debtIndicator = card.querySelector('.player-debt-indicator');
            if (window.currentDebt && currentPlayerIndex === index) {
                if (!debtIndicator) {
                    debtIndicator = document.createElement('div');
                    debtIndicator.className = 'player-debt-indicator';
                    const moneyDiv = card.querySelector('.player-money');
                    if (moneyDiv && moneyDiv.nextSibling) moneyDiv.parentNode.insertBefore(debtIndicator, moneyDiv.nextSibling);
                    else card.appendChild(debtIndicator);
                }
                debtIndicator.innerHTML = `⚠️ SKOLA: <span style="color:#ff6666">-${window.currentDebt}€</span>`;
                debtIndicator.style.display = 'block';
            } else if (debtIndicator) { debtIndicator.style.display = 'none'; }
            
            let jailStatusDiv = card.querySelector('.player-jail-status');
            if (inJail[index]) {
                if (!jailStatusDiv) {
                    jailStatusDiv = document.createElement('div');
                    jailStatusDiv.className = 'player-jail-status';
                    const propertiesDiv = card.querySelector('.player-properties');
                    if (propertiesDiv) card.insertBefore(jailStatusDiv, propertiesDiv);
                    else card.appendChild(jailStatusDiv);
                }
                jailStatusDiv.innerHTML = `🚔 KALĖJIME (${jailTurns[index] || 0}/3)`;
            } else if (jailStatusDiv) { jailStatusDiv.remove(); }
            
            const propertiesGrid = card.querySelector('.properties-mini-grid');
            if (propertiesGrid) {
                let newHtml = '';
                if (player.properties && player.properties.length > 0) {
                    const sortedProperties = sortPropertiesByPriceAndColor(player.properties, player);
                    sortedProperties.forEach(prop => {
                        const cellData = getCellById(prop.id);
                        if (!cellData) return;
                        let colorIcon = '📌';
                        let colorClass = '';
                        if (cellData.color) {
                            const colors = { 'brown': '🟤', 'lightblue': '🔵', 'orange': '🟠', 'yellow': '🟡', 'red': '🔴', 'purple': '🟣', 'bronze': '🥉', 'butelka': '🍾', 'lime': '🟢', 'brightblue': '💙' };
                            colorIcon = colors[cellData.color] || '📌';
                            colorClass = `prop-color-${cellData.color}`;
                        }
                        const houses = player.houses[prop.id] || 0;
                        const houseIcon = houses === 5 ? '🏨' : houses > 0 ? '🏠'.repeat(houses) : '';
                        const isPledged = player.pledgedProperties && player.pledgedProperties.some(p => p.id === prop.id);
                        newHtml += `
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
                    newHtml = '<div class="prop-mini-empty">📭 Nėra nuosavybių</div>';
                }
                propertiesGrid.innerHTML = newHtml;
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
            const totalWealthSpan = card.querySelector('.player-total-wealth span');
            if (totalWealthSpan) totalWealthSpan.innerText = totalWealth;
            
            // Atnaujiname mygtukų matomumą pagal eilę
            const isMyTurn = (currentPlayerIndex === index);
            const extraButtonsDiv = card.querySelector('.player-extra-buttons');
            if (extraButtonsDiv) {
                if (isMyTurn && !player.bankrupt) {
                    extraButtonsDiv.style.display = 'flex';
                } else {
                    extraButtonsDiv.style.display = 'none';
                }
            }
        }
    });
    
    const currentPlayerStatEl = document.getElementById('currentPlayerStat');
    const lastRollStatEl = document.getElementById('lastRollStat');
    if (currentPlayerStatEl) currentPlayerStatEl.innerText = currentPlayerIndex + 1;
    if (lastRollStatEl) lastRollStatEl.innerText = lastRoll;
    
    if (typeof window.updateBuildButtons === 'function') {
        window.updateBuildButtons();
    } else if (typeof updateBuildButtons === 'function') {
        updateBuildButtons();
    }
    
    if (typeof updateAllCellsBuildDisplay === 'function') {
        console.log("🏠 Atnaujinami statybos mygtukai po žaidėjų kortelių atnaujinimo");
        updateAllCellsBuildDisplay();
    }
    
    setTimeout(initHoverCards, 100);
}

function initHoverCards() {
    const miniCards = document.querySelectorAll('.prop-mini-card');
    console.log('🎯 Hover kortelės rastos:', miniCards.length);
    
    miniCards.forEach(card => {
        card.removeEventListener('mouseenter', card._mouseEnterHandler);
        card.removeEventListener('mouseleave', card._mouseLeaveHandler);
        
        card._mouseEnterHandler = (e) => {
            let propName = card.getAttribute('data-prop-name');
            let propPrice = card.getAttribute('data-prop-price');
            let propHouses = parseInt(card.getAttribute('data-prop-houses')) || 0;
            let propPosition = card.getAttribute('data-prop-position');
            const isPledged = card.classList.contains('pledged-mini');
            
            if (!propName || !propPrice) {
                const propId = card.getAttribute('data-prop-id');
                if (propId) {
                    const cellData = getCellById(parseInt(propId));
                    if (cellData) {
                        propName = cellData.name;
                        propPrice = cellData.price;
                        propPosition = cellData.id;
                    }
                }
            }
            
            const colorClass = Array.from(card.classList).find(c => c.startsWith('prop-color-')) || '';
            let colorIcon = '📌';
            if (colorClass === 'prop-color-brown') colorIcon = '🟤';
            else if (colorClass === 'prop-color-lightblue') colorIcon = '🔵';
            else if (colorClass === 'prop-color-orange') colorIcon = '🟠';
            else if (colorClass === 'prop-color-yellow') colorIcon = '🟡';
            else if (colorClass === 'prop-color-red') colorIcon = '🔴';
            else if (colorClass === 'prop-color-purple') colorIcon = '🟣';
            else if (colorClass === 'prop-color-bronze') colorIcon = '🥉';
            else if (colorClass === 'prop-color-butelka') colorIcon = '🍾';
            else if (colorClass === 'prop-color-lime') colorIcon = '🟢';
            else if (colorClass === 'prop-color-brightblue') colorIcon = '💙';
            
            const houseIcon = propHouses === 5 ? '🏨' : propHouses > 0 ? '🏠'.repeat(propHouses) : '';
            
            const hoverCard = document.createElement('div');
            hoverCard.className = 'prop-hover-card';
            hoverCard.style.cssText = 'position:fixed; background:#1b4d1b; border:2px solid #ffd700; border-radius:12px; box-shadow:0 10px 25px rgba(0,0,0,0.5); z-index:10001; overflow:hidden; min-width:180px;';
            hoverCard.innerHTML = `
                <div style="width:100%; height:8px; background:${colorClass === 'prop-color-brown' ? '#8B4513' : colorClass === 'prop-color-lightblue' ? '#87CEEB' : colorClass === 'prop-color-orange' ? '#FFA500' : colorClass === 'prop-color-yellow' ? '#FFD700' : colorClass === 'prop-color-red' ? '#DC143C' : colorClass === 'prop-color-purple' ? '#9370DB' : colorClass === 'prop-color-bronze' ? '#CD7F32' : colorClass === 'prop-color-butelka' ? '#2E8B57' : colorClass === 'prop-color-lime' ? '#32CD32' : colorClass === 'prop-color-brightblue' ? '#00BFFF' : '#ccc'}; border-radius:12px 12px 0 0;"></div>
                <div style="padding:12px; text-align:center;">
                    <div style="font-size:32px; margin-bottom:8px;">${isPledged ? '🔒' : colorIcon}</div>
                    <div style="font-size:14px; font-weight:bold; color:#ffd700; margin-bottom:8px;">${propName || 'Nežinoma'} ${isPledged ? '(ĮKEISTA)' : ''}</div>
                    <div style="font-size:13px; color:#90EE90; margin-bottom:5px;">💰 ${propPrice || '?'}€</div>
                    <div style="font-size:12px; color:#aaa; margin-bottom:5px;">📍 Pozicija: ${propPosition || '?'}</div>
                    <div style="font-size:13px; color:#ffd700;">${houseIcon || '🏚️ Be namelių'}</div>
                    ${isPledged ? '<div style="color:#ff6666; font-size:11px; margin-top:5px;">🔒 NEDUODA NUOMOS</div>' : ''}
                </div>
            `;
            document.body.appendChild(hoverCard);
            const rect = card.getBoundingClientRect();
            let left = rect.right + 10;
            let top = rect.top - 20;
            if (left + 200 > window.innerWidth) left = rect.left - 210;
            if (top + 200 > window.innerHeight) top = window.innerHeight - 220;
            if (top < 10) top = 10;
            hoverCard.style.left = left + 'px';
            hoverCard.style.top = top + 'px';
            card._hoverCard = hoverCard;
        };
        
        card._mouseLeaveHandler = () => {
            if (card._hoverCard) { card._hoverCard.remove(); card._hoverCard = null; }
        };
        
        card.addEventListener('mouseenter', card._mouseEnterHandler);
        card.addEventListener('mouseleave', card._mouseLeaveHandler);
    });
}

function getColorGroupName(colorCode) {
    const names = { 'brown': 'RUDUS', 'lightblue': 'ŠVIESIAI MĖLYNUS', 'orange': 'ORANŽINIUS', 'bronze': 'BRONZINIUS', 'red': 'RAUDONUS', 'yellow': 'GELTONUS', 'darkgreen': 'TAMSIAI ŽALIUS', 'purple': 'VIOLETINIUS', 'lime': 'LIME', 'brightblue': 'BRIGHTBLUE' };
    return names[colorCode] || 'šios spalvos';
}

function createAllPlayerTokens() {
    players.forEach(player => {
        if (player.token && player.token.parentNode) player.token.parentNode.removeChild(player.token);
        player.token = null;
    });
    
    for (let i = 0; i < activePlayers; i++) {
        if (!players[i] || players[i].bankrupt) continue;
        const startCell = document.getElementById('cell-1');
        if (startCell) {
            const token = document.createElement('div');
            token.className = 'player-token';
            token.style.cssText = 'position:absolute; width:36px; height:36px; font-size:30px; display:flex; align-items:center; justify-content:center; background:transparent; border:none; text-shadow:1px 1px 0 rgba(0,0,0,0.5); z-index:100;';
            token.innerHTML = players[i].figure;
            
            const offsets = [
                { top: '2px', left: '2px' },
                { top: '2px', right: '2px' },
                { top: '2px', left: '18px' },
                { top: '2px', right: '18px' },
                { top: '2px', left: '34px' },
                { top: '2px', right: '34px' }
            ];
            
            token.style.top = offsets[i].top;
            if (offsets[i].left) token.style.left = offsets[i].left;
            if (offsets[i].right) token.style.right = offsets[i].right;
            startCell.style.position = 'relative';
            startCell.appendChild(token);
            players[i].token = token;
        }
    }
}

function updateAllPlayerTokens() {
    for (let i = 0; i < activePlayers; i++) {
        if (!players[i]) continue;
        
        if (players[i].bankrupt) {
            if (players[i].token && players[i].token.parentNode) {
                players[i].token.classList.add('bankrupt-token');
                players[i].token.title = `${players[i].name} - BANKRUTAVO`;
            }
            continue;
        }
        
        const player = players[i];
        const cell = document.getElementById(`cell-${player.position}`);
        if (cell && player.token) {
            cell.style.position = 'relative';
            
            const isLeftOrRight = (player.position >= 16 && player.position <= 24) || (player.position >= 40 && player.position <= 48);
            
            let offsets;
            if (isLeftOrRight) {
                offsets = [
                    { top: '2px', left: '2px' },
                    { top: '2px', left: '18px' },
                    { top: '2px', left: '34px' },
                    { top: '18px', left: '2px' },
                    { top: '18px', left: '18px' },
                    { top: '18px', left: '34px' }
                ];
            } else {
                offsets = [
                    { top: '2px', left: '2px' },
                    { top: '2px', right: '2px' },
                    { top: '2px', left: '18px' },
                    { top: '2px', right: '18px' },
                    { top: '2px', left: '34px' },
                    { top: '2px', right: '34px' }
                ];
            }
            
            player.token.style.top = offsets[i].top;
            if (offsets[i].left) player.token.style.left = offsets[i].left;
            if (offsets[i].right) player.token.style.right = offsets[i].right;
            if (offsets[i].left) player.token.style.right = 'auto';
            if (offsets[i].right) player.token.style.left = 'auto';
            
            cell.appendChild(player.token);
        }
    }
}

function updateUI() {
    const currentPlayer = players[currentPlayerIndex];
    if (!currentPlayer) return;
    
    const elCurrentPlayer = document.getElementById('currentPlayer');
    const elPlayerPos = document.getElementById('playerPos');
    const elPlayerMoney = document.getElementById('playerMoney');
    const elCurrentPlayerStat = document.getElementById('currentPlayerStat');
    const elBankMoney = document.getElementById('bankMoney');
    if (elCurrentPlayer) elCurrentPlayer.innerText = currentPlayerIndex + 1;
    if (elPlayerPos) elPlayerPos.innerText = currentPlayer.position;
    if (elPlayerMoney) elPlayerMoney.innerText = currentPlayer.money;
    if (elCurrentPlayerStat) elCurrentPlayerStat.innerText = currentPlayerIndex + 1;
    if (elBankMoney) elBankMoney.innerText = 15000;
}

function updatePlayerPositionDisplay() {
    const elPlayerPos = document.getElementById('playerPos');
    if (elPlayerPos && players[currentPlayerIndex]) {
        elPlayerPos.innerText = players[currentPlayerIndex].position;
    }
}

function changePlayerCount() {
    let newCount = parseInt(prompt(`Kiek žaidėjų žais? (2-6)\nDabar: ${activePlayers}`, activePlayers));
    if (newCount >= 2 && newCount <= 6) {
        activePlayers = newCount;
        const startX = 100;
        const startY = 200;
        for (let i = 0; i < players.length; i++) {
            if (!players[i]) continue;
            players[i].position = 1;
            players[i].money = 1500;
            players[i].properties = [];
            players[i].houses = {};
            players[i].pledgedProperties = [];
            players[i].bankrupt = false;
            players[i].x = startX;
            players[i].y = startY + (i * 120);
            if (players[i].token && players[i].token.parentNode) players[i].token.parentNode.removeChild(players[i].token);
            players[i].token = null;
        }
        for (let id = 1; id <= 48; id++) { const cell = getCellById(id); if (cell) { delete cell.owner; delete cell.pledged; } }
        currentPlayerIndex = 0;
        waitingForRoll = true;
        inJail = {};
        jailTurns = {};
        consecutiveDoubles = 0;
        window.currentDebt = 0;
        
        if (typeof resetAllBuildSounds === 'function') {
            resetAllBuildSounds();
        }
        
        createAllPlayerTokens();
        updateAllPlayerTokens();
        createFloatingCards();
        updateUI();
        updateDiceDisplay(1, 1);
        document.getElementById('totalSum').innerText = '0';
        saveCardPositions();
        addLog(`👥 Žaidėjų skaičius pakeistas į ${activePlayers}`);
        showToast(`Žaidėjų skaičius pakeistas į ${activePlayers}`, 'success');
    } else {
        addLog(`❌ Bandymas pakeisti žaidėjų skaičių į ${newCount} (leidžiama 2-6)`);
        showToast("Žaidėjų skaičius turi būti nuo 2 iki 6!", 'error');
    }
}

function nextPlayer() {
    console.log("Prieš nextPlayer: currentPlayerIndex =", currentPlayerIndex);
    
    let startIndex = currentPlayerIndex;
    do { 
        currentPlayerIndex++; 
        if (currentPlayerIndex >= activePlayers) currentPlayerIndex = 0; 
        if (currentPlayerIndex === startIndex) {
            console.error("❌ Klaida: nerasta gyvų žaidėjų!");
            return;
        }
    } while (players[currentPlayerIndex] && (players[currentPlayerIndex].bankrupt || !players[currentPlayerIndex]));
    
    console.log("Po nextPlayer: currentPlayerIndex =", currentPlayerIndex);
    
    waitingForRoll = true;
    consecutiveDoubles = 0;
    window.currentDebt = 0;
    
    updateUI();
    updatePlayersCards();
    
    if (typeof updateCenterPlayerCard === 'function') {
        updateCenterPlayerCard();
    }
    
    const currentPlayer = players[currentPlayerIndex];
    if (currentPlayer && currentPlayer.name) {
        showToast(`🎲 ${currentPlayer.name} (${currentPlayer.figure}) - TAVO EILĖ! Mesti kauliukus! 🎲`, 'success');
        
        if (inJail[currentPlayerIndex]) {
            addLog(`➡️ Dabar eina ${currentPlayer.name} (🚔 KALĖJIME - ${jailTurns[currentPlayerIndex] || 0}/3 ėjimų praleista)`);
        } else {
            addLog(`➡️ Dabar eina ${currentPlayer.name}`);
        }
    }
    
    if (typeof updateAllCellsBuildDisplay === 'function') {
        console.log("🏠 Atnaujinami statybos mygtukai po ėjimo perėjimo");
        updateAllCellsBuildDisplay();
    }
    
    if (typeof updateAllPlayerTokens === 'function') {
        updateAllPlayerTokens();
    }
    
    if (window.gameId && typeof database !== 'undefined') {
        database.ref('games/' + window.gameId + '/currentPlayer').set(currentPlayerIndex);
        database.ref('games/' + window.gameId + '/waitingForRoll').set(true);
    }
    
    if (typeof saveFullGameState === 'function') {
        saveFullGameState();
    }
}

function saveCardPositions() {
    const positions = [];
    for (let i = 0; i < activePlayers; i++) {
        positions.push({ x: players[i].x, y: players[i].y });
    }
    localStorage.setItem('playerCardPositions', JSON.stringify(positions));
}

function loadCardPositions() {
    const saved = localStorage.getItem('playerCardPositions');
    if (saved) {
        const positions = JSON.parse(saved);
        for (let i = 0; i < activePlayers && i < positions.length; i++) {
            players[i].x = positions[i].x;
            players[i].y = positions[i].y;
        }
    }
}
