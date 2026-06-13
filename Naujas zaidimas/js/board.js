// ==================== LENTOS KŪRIMAS ====================

function updateCellDisplayWithOwner() {
    for (let id = 1; id <= 48; id++) {
        const cell = document.getElementById(`cell-${id}`);
        if (!cell) continue;
        
        const cellData = getCellById(id);
        if (!cellData) continue;
        
        // Dinamiškai pritaikome dydį pagal teksto ilgį
        if (cellData.name && cellData.name.length > 15) {
            cell.classList.add('long-text');
        } else {
            cell.classList.remove('long-text');
        }
        
        let owner = null;
        if (cellData.owner !== undefined && cellData.owner !== null) {
            owner = players.find(p => p.id === cellData.owner);
        }
        
        const houses = owner?.houses?.[id] || 0;
        
        const hideNumberCells = [3, 5, 6, 9, 13, 17, 20, 22, 27, 30, 33, 35, 37, 41, 44, 47];
        const shouldHideNumber = hideNumberCells.includes(cellData.id);
        const isCorner = [1, 15, 25, 39].includes(cellData.id);
        const hideNumber = shouldHideNumber || isCorner;
        
        let numberDiv = cell.querySelector('.cell-number');
        if (!numberDiv) {
            numberDiv = document.createElement('div');
            numberDiv.className = 'cell-number';
            cell.appendChild(numberDiv);
        }
        
        if (hideNumber) {
            numberDiv.style.display = 'none';
        } else {
            numberDiv.style.display = 'flex';
            numberDiv.innerHTML = cellData.id;
        }
        
        let nameDiv = cell.querySelector('.cell-name');
        if (window.isSpecialCell && window.isSpecialCell(cellData.id) && owner) {
            if (nameDiv) nameDiv.style.display = 'none';
        } else {
            if (!nameDiv) {
                nameDiv = document.createElement('div');
                nameDiv.className = 'cell-name';
                cell.appendChild(nameDiv);
            }
            nameDiv.style.display = 'block';
            nameDiv.innerHTML = cellData.name;
        }
        
        const oldPrice = cell.querySelector('.cell-price');
        if (oldPrice) oldPrice.remove();
        
        const oldOwnerToken = cell.querySelector('.cell-owner-token');
        if (oldOwnerToken) oldOwnerToken.remove();
        
        const oldIcons = cell.querySelectorAll('.wrench-icon, .tax-icon, .plane-icon, .chance-icon, .devil-icon, .lightning-icon, .beer-icon, .water-icon, .hospital-icon, .treasure-icon, .vacation-icon, .birthday-icon');
        oldIcons.forEach(icon => icon.remove());
        
        if (window.isSpecialCell && window.isSpecialCell(cellData.id)) {
            if (window.updateSpecialCell) {
                window.updateSpecialCell(cell, cellData.id, owner);
            }
            if (owner) {
                const tokenDiv = document.createElement('div');
                tokenDiv.className = 'cell-owner-token';
                tokenDiv.style.cssText = 'font-size:15px; margin:5px 0;';
                tokenDiv.innerHTML = owner.figure;
                cell.appendChild(tokenDiv);
            }
        } else if (owner) {
            const tokenDiv = document.createElement('div');
            tokenDiv.className = 'cell-owner-token';
            tokenDiv.style.cssText = 'font-size:15px; margin:5px 0;';
            tokenDiv.innerHTML = owner.figure;
            cell.appendChild(tokenDiv);
        } else if (cellData.price > 0) {
            const priceDiv = document.createElement('div');
            priceDiv.className = 'cell-price';
            priceDiv.innerHTML = `${cellData.price}€`;
            cell.appendChild(priceDiv);
        }
        
        let housesDiv = cell.querySelector('.cell-houses');
        if (houses > 0) {
            if (!housesDiv) {
                housesDiv = document.createElement('div');
                housesDiv.className = 'cell-houses';
                cell.appendChild(housesDiv);
            }
            if (houses === 5) {
                housesDiv.innerHTML = '🏨';
                housesDiv.title = 'Viešbutis';
            } else {
                housesDiv.innerHTML = '🏠'.repeat(houses);
                housesDiv.title = `${houses} nameliai`;
            }
        } else if (housesDiv) {
            housesDiv.remove();
        }
        
        if (cellData.color) {
            cell.setAttribute('data-color', cellData.color);
        }
        
        cell.dataset.id = cellData.id;
        cell.dataset.type = cellData.type;
        cell.dataset.price = cellData.price;
        cell.dataset.rent = cellData.rent;
        cell.id = `cell-${cellData.id}`;
    }
    
    updateAllPlayerTokens();
    
    if (typeof updateAllCellsBuildDisplay === 'function') {
        updateAllCellsBuildDisplay();
    }
    
    const hideNumberCellsFinal = [3, 5, 6, 9, 13, 17, 20, 22, 27, 30, 33, 35, 37, 41, 44, 47];
    const cornersFinal = [1, 15, 25, 39];
    const allToHideFinal = [...hideNumberCellsFinal, ...cornersFinal];
    
    for (let id of allToHideFinal) {
        const cell = document.getElementById(`cell-${id}`);
        if (cell) {
            const numberDiv = cell.querySelector('.cell-number');
            if (numberDiv) numberDiv.style.display = 'none';
        }
    }
}

function createBoard() {
    const board = document.getElementById('gameBoard');
    board.innerHTML = '';
    
    const boardContainer = document.createElement('div');
    boardContainer.className = 'board-container';
    
    // ========== VIRŠUTINĖ EILĖ (1-15) ==========
    const topRow = document.createElement('div');
    topRow.className = 'top-row';
    
    for (let id = 1; id <= 15; id++) {
        const cellData = getCellById(id);
        if (!cellData) continue;
        let cell = document.createElement('div');
        
        const hideNumberCells = [3, 5, 6, 9, 13, 17, 20, 22, 27, 30, 33, 35, 37, 41, 44, 47];
        const shouldHideNumber = hideNumberCells.includes(cellData.id);
        const isCorner = [1, 15, 25, 39].includes(cellData.id);
        const hideNumber = shouldHideNumber || isCorner;
        const hideNumberStyle = hideNumber ? 'style="display:none;"' : '';
        
        if (cellData.type === 'corner') {
            if (window.createCornerCell) {
                const cornerCell = window.createCornerCell(cellData);
                if (cornerCell) {
                    cell = cornerCell;
                } else {
                    cell.className = `cell corner ${getCornerClass(cellData.position)}`;
                    if (cellData.id === 1) {
                        cell.innerHTML = `<div class="cell-number" ${hideNumberStyle}>🏁</div><div class="cell-name">${cellData.name}</div>`;
                    } else {
                        cell.innerHTML = `<div class="cell-number" ${hideNumberStyle}>${cellData.id}</div><div class="cell-name">${cellData.name}</div>`;
                    }
                }
            } else {
                cell.className = `cell corner ${getCornerClass(cellData.position)}`;
                if (cellData.id === 1) {
                    cell.innerHTML = `<div class="cell-number" ${hideNumberStyle}>🏁</div><div class="cell-name">${cellData.name}</div>`;
                } else {
                    cell.innerHTML = `<div class="cell-number" ${hideNumberStyle}>${cellData.id}</div><div class="cell-name">${cellData.name}</div>`;
                }
            }
        } else {
            cell.className = 'cell horizontal-cell';
            
            // Pridedame ilgo teksto klasę
            if (cellData.name && cellData.name.length > 15) {
                cell.classList.add('long-text');
            }
            
            if (cellData.id === 3) {
                cell.innerHTML = `
                    <div class="cell-number" ${hideNumberStyle}>${cellData.id}</div>
                    <div class="wrench-icon" style="display:flex; justify-content:center; align-items:center; gap:0px; margin:5px 0;">
                        <span class="wrench-cross-left">🔧</span>
                        <span class="wrench-cross-right">🔧</span>
                    </div>
                    <div class="cell-name">AUTOMOBILIŲ<br>SERVISAS</div>
                    <div class="cell-price">200€</div>
                `;
            }
            else if (cellData.id === 5) {
                cell.innerHTML = `
                    <div class="cell-number" ${hideNumberStyle}>${cellData.id}</div>
                    <div class="tax-icon">💰💸</div>
                    <div class="cell-name">${cellData.name}</div>
                    <div class="cell-price">200€</div>
                `;
            }
            else if (cellData.id === 6 || cellData.id === 22 || cellData.id === 35) {
                cell.innerHTML = `
                    <div class="cell-number" ${hideNumberStyle}>${cellData.id}</div>
                    <div class="plane-icon">✈️</div>
                    <div class="cell-name">${cellData.name}</div>
                    <div class="cell-price">200€</div>
                `;
            }
            else if (cellData.id === 9) {
                cell.innerHTML = `
                    <div class="cell-number" ${hideNumberStyle}>${cellData.id}</div>
                    <div class="chance-icon">🎲❓</div>
                    <div class="cell-name">${cellData.name}</div>
                `;
            }
            else if (cellData.id === 13) {
                cell.innerHTML = `
                    <div class="cell-number" ${hideNumberStyle}>${cellData.id}</div>
                    <div class="devil-icon">👿</div>
                    <div class="cell-name">${cellData.name}</div>
                `;
            }
            else if (cellData.id === 17) {
                cell.innerHTML = `
                    <div class="cell-number" ${hideNumberStyle}>${cellData.id}</div>
                    <div class="lightning-icon">⚡</div>
                    <div class="cell-name">${cellData.name}</div>
                    <div class="cell-price">200€</div>
                `;
            }
            else if (cellData.id === 20) {
                cell.innerHTML = `
                    <div class="cell-number" ${hideNumberStyle}>${cellData.id}</div>
                    <div class="beer-icon">🍺<span class="beer-foam">💭</span></div>
                    <div class="cell-name">${cellData.name}</div>
                `;
            }
            else if (cellData.id === 27) {
                cell.innerHTML = `
                    <div class="cell-number" ${hideNumberStyle}>${cellData.id}</div>
                    <div class="water-icon"><span class="water-content">💧🌊</span><span class="water-sparkle">💦</span></div>
                    <div class="cell-name">${cellData.name}</div>
                    <div class="cell-price">200€</div>
                `;
            }
            else if (cellData.id === 30) {
                cell.innerHTML = `
                    <div class="cell-number" ${hideNumberStyle}>${cellData.id}</div>
                    <div class="wrench-icon" style="display:flex; justify-content:center; align-items:center; gap:0px; margin:5px 0;">
                        <span class="wrench-cross-left">🔧</span>
                        <span class="wrench-cross-right">🔧</span>
                    </div>
                    <div class="cell-name">SERVISAS</div>
                    <div class="cell-price">200€</div>
                `;
            }
            else if (cellData.id === 33) {
                cell.innerHTML = `
                    <div class="cell-number" ${hideNumberStyle}>${cellData.id}</div>
                    <div class="hospital-icon">🏥❤️</div>
                    <div class="cell-name">${cellData.name}</div>
                `;
            }
            else if (cellData.id === 37) {
                cell.innerHTML = `
                    <div class="cell-number" ${hideNumberStyle}>${cellData.id}</div>
                    <div class="chance-icon">🃏❓</div>
                    <div class="cell-name">${cellData.name}</div>
                `;
            }
            else if (cellData.id === 41) {
                cell.innerHTML = `
                    <div class="cell-number" ${hideNumberStyle}>${cellData.id}</div>
                    <div class="treasure-icon"><span class="treasure-content">📦💰</span><span class="treasure-sparkle">✨</span></div>
                    <div class="cell-name">${cellData.name}</div>
                `;
            }
            else if (cellData.id === 44) {
                cell.innerHTML = `
                    <div class="cell-number" ${hideNumberStyle}>${cellData.id}</div>
                    <div class="vacation-icon"><span class="vacation-content">🌴🏖️</span><span class="vacation-sparkle">✨</span></div>
                    <div class="cell-name">${cellData.name}</div>
                `;
            }
            else if (cellData.id === 47) {
                cell.innerHTML = `
                    <div class="cell-number" ${hideNumberStyle}>${cellData.id}</div>
                    <div class="birthday-icon"><span class="birthday-content">🎂</span><span class="birthday-candle">🕯️</span></div>
                    <div class="cell-name">${cellData.name}</div>
                `;
            }
            else {
                cell.innerHTML = `<div class="cell-number">${cellData.id}</div><div class="cell-name">${cellData.name}</div><div class="cell-price">${cellData.price}€</div>`;
            }
        }
        
        cell.dataset.id = cellData.id;
        cell.dataset.type = cellData.type;
        cell.dataset.color = cellData.color || '';
        cell.dataset.price = cellData.price;
        cell.dataset.rent = cellData.rent;
        cell.id = `cell-${cellData.id}`;
        if (cellData.color) cell.setAttribute('data-color', cellData.color);
        cell.addEventListener('click', () => {
            if (!waitingForRoll && cellData.type === 'property' && cellData.price > 0 && (cellData.owner === undefined || cellData.owner === null)) {
                buyProperty(cellData.id);
            }
        });
        topRow.appendChild(cell);
    }
    boardContainer.appendChild(topRow);
    
    // ========== VIDURIUS (kairė, centras, dešinė) ==========
    const middleSection = document.createElement('div');
    middleSection.className = 'middle-section';
    
    // KAIRĖ EILĖ (40-48)
    const leftCol = document.createElement('div');
    leftCol.className = 'left-col';
    for (let id = 48; id >= 40; id--) {
        const cellData = getCellById(id);
        if (!cellData) continue;
        const cell = document.createElement('div');
        cell.className = 'cell vertical-cell';
        
        // Pridedame ilgo teksto klasę
        if (cellData.name && cellData.name.length > 15) {
            cell.classList.add('long-text');
        }
        
        cell.innerHTML = `<div class="cell-number">${cellData.id}</div><div class="cell-name">${cellData.name}</div><div class="cell-price">${cellData.price}€</div>`;
        cell.dataset.id = cellData.id;
        cell.dataset.type = cellData.type;
        cell.dataset.color = cellData.color || '';
        cell.dataset.price = cellData.price;
        cell.dataset.rent = cellData.rent;
        cell.id = `cell-${cellData.id}`;
        if (cellData.color) cell.setAttribute('data-color', cellData.color);
        cell.addEventListener('click', () => {
            if (!waitingForRoll && cellData.type === 'property' && cellData.price > 0 && (cellData.owner === undefined || cellData.owner === null)) {
                buyProperty(cellData.id);
            }
        });
        leftCol.appendChild(cell);
    }
    middleSection.appendChild(leftCol);
    
    // ========== CENTRAS ==========
    const center = document.createElement('div');
    center.className = 'board-center';
    
    // KAIRĖ PANELĖ - Žaidėjo kortelė
    const leftPanel = document.createElement('div');
    leftPanel.className = 'center-left-panel';
    leftPanel.id = 'centerPlayerCard';
    leftPanel.innerHTML = `
        <div class="center-player-card-placeholder">
            <div class="center-player-figure">🚗</div>
            <div class="center-player-name">Žaidėjas 1</div>
            <div class="center-player-money">💰 1500€</div>
            <div class="center-player-position">📍 Pozicija: 1</div>
            <div class="center-player-properties">🏠 Nuosavybės: -</div>
            <div class="center-player-wealth">💎 Visas turtas: 1500€</div>
            <div class="center-player-buttons">
                <button class="center-pledge-btn">🏦 ĮKEISTI</button>
                <button class="center-sell-btn">💰 PARDUOTI</button>
                <button class="center-destroy-btn">🏚️ GRIAUTI NAMELIUS</button>
            </div>
        </div>
        <div id="playersListContainer"></div>
    `;
    
    // VIDURINĖ PANELĖ - Kauliukai ir info
    const middlePanel = document.createElement('div');
    middlePanel.className = 'center-middle-panel';
    
    const diceContainer = document.createElement('div');
    diceContainer.className = 'center-dice-container';
    
    const dice1 = document.createElement('div');
    dice1.className = 'center-dice';
    dice1.id = 'centerDice1';
    const dotsContainer1 = document.createElement('div');
    dotsContainer1.className = 'dice-dots-container';
    
    const dotPositions = ['tl', 'tc', 'tr', 'cl', 'cc', 'cr', 'bl', 'bc', 'br'];
    dotPositions.forEach(pos => {
        const dot = document.createElement('div');
        dot.className = `dice-dot dot-${pos}`;
        dotsContainer1.appendChild(dot);
    });
    dice1.appendChild(dotsContainer1);
    
    const dice2 = document.createElement('div');
    dice2.className = 'center-dice';
    dice2.id = 'centerDice2';
    const dotsContainer2 = document.createElement('div');
    dotsContainer2.className = 'dice-dots-container';
    
    dotPositions.forEach(pos => {
        const dot = document.createElement('div');
        dot.className = `dice-dot dot-${pos}`;
        dotsContainer2.appendChild(dot);
    });
    dice2.appendChild(dotsContainer2);
    
    diceContainer.appendChild(dice1);
    diceContainer.appendChild(dice2);
    
    const infoBlock = document.createElement('div');
    infoBlock.className = 'center-info';
    infoBlock.innerHTML = `
        <div class="info-row">🎮 ŽAIDĖJAS: <span id="currentPlayer">1</span></div>
        <div class="info-row">🎲 SUMA: <span id="totalSum">0</span></div>
        <div class="info-row">📍 POZICIJA: <span id="playerPos">1</span></div>
        <div class="info-row">🎭 FIGŪRĖLĖ: <span id="playerFigureDisplay">🚗</span></div>
        <div class="info-row" style="border-top: 1px solid #4caf50; margin-top: 5px; padding-top: 5px;">👥 ŽAIDĖJŲ SKAIČIUS: <span id="playerCountDisplay">0</span></div>
        <div class="info-row">📋 STALO KODAS: <span id="gameCodeDisplayCenter" style="font-family: monospace; letter-spacing: 2px;">---</span></div>
    `;
    
    const rollButtonContainer = document.createElement('div');
    rollButtonContainer.className = 'roll-button-container';
    const rollButton = document.createElement('button');
    rollButton.className = 'roll-button';
    rollButton.id = 'rollBtnCenter';
    rollButton.innerHTML = '🎲 MESTI KAULIUKUS 🎲';
    rollButton.style.cssText = 'background:#ffd700; color:#8b0000; font-size:18px; font-weight:bold; padding:10px 25px; border:none; border-radius:40px; cursor:pointer; box-shadow:0 4px 0 #b8860b; transition:0.1s linear; width:100%;';
    rollButton.onclick = () => { if (window.waitingForRoll) rollDice(); };
    rollButtonContainer.appendChild(rollButton);
    
    // MYGTUKŲ EILUTĖS (po MESTI KAULIUKUS)
    
    // Pirma eilutė - 3 mygtukai (garsas, nustatymai, atstatyti)
    const topButtonsRow = document.createElement('div');
    topButtonsRow.style.display = 'flex';
    topButtonsRow.style.justifyContent = 'center';
    topButtonsRow.style.alignItems = 'center';
    topButtonsRow.style.gap = '100px';
    topButtonsRow.style.margin = '15px 0 5px 0';
    topButtonsRow.style.padding = '5px';
    topButtonsRow.style.flexWrap = 'wrap';
    
    // 1. Garsas
    const soundBtn = document.createElement('div');
    soundBtn.id = 'soundToggleBtn';
    soundBtn.innerHTML = '🔊';
    soundBtn.style.cssText = `width:44px; height:44px; background:#2e7d32; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:20px; font-weight:bold; color:#ffd700; cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.3); border:2px solid #ffd700; transition:0.2s;`;
    soundBtn.onmouseenter = () => soundBtn.style.transform = 'scale(1.05)';
    soundBtn.onmouseleave = () => soundBtn.style.transform = 'scale(1)';
    soundBtn.onclick = () => { if (typeof toggleSounds === 'function') toggleSounds(); const btn = document.getElementById('soundToggleBtn'); if (btn) { btn.innerHTML = soundsEnabled ? '🔊' : '🔇'; btn.style.backgroundColor = soundsEnabled ? '#2e7d32' : '#8b0000'; } };
    topButtonsRow.appendChild(soundBtn);
    
    // 2. Nustatymai
    const settingsBtn = document.createElement('div');
    settingsBtn.id = 'settingsWheel';
    settingsBtn.innerHTML = '⚙️';
    settingsBtn.style.cssText = `width:44px; height:44px; background:#ffd700; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:22px; font-weight:bold; color:#8b0000; cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.3); border:2px solid #8b0000; transition:0.2s;`;
    settingsBtn.onmouseenter = () => settingsBtn.style.transform = 'scale(1.05)';
    settingsBtn.onmouseleave = () => settingsBtn.style.transform = 'scale(1)';
    settingsBtn.onclick = () => { if (typeof showSettingsModal === 'function') showSettingsModal(); };
    topButtonsRow.appendChild(settingsBtn);
    
    // 3. Atstatyti lentą
    const resetBtn = document.createElement('div');
    resetBtn.id = 'resetBoardBtn';
    resetBtn.innerHTML = '🔄';
    resetBtn.style.cssText = `width:44px; height:44px; background:#8b0000; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:20px; font-weight:bold; color:#ffd700; cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.3); border:2px solid #ffd700; transition:0.2s;`;
    resetBtn.onmouseenter = () => resetBtn.style.transform = 'scale(1.05)';
    resetBtn.onmouseleave = () => resetBtn.style.transform = 'scale(1)';
    resetBtn.onclick = () => { if (typeof resetZoom === 'function') { resetZoom(); showToast('Lenta atstatyta į pradinę padėtį', 'success'); } };
    topButtonsRow.appendChild(resetBtn);
    
    // Antra eilutė - Visas ekranas
    const fullscreenRow = document.createElement('div');
    fullscreenRow.style.display = 'flex';
    fullscreenRow.style.justifyContent = 'center';
    fullscreenRow.style.margin = '5px 0';
    
    const fullscreenBtn = document.createElement('button');
    fullscreenBtn.id = 'centerFullscreenBtn';
    fullscreenBtn.innerHTML = '🖥️ VISAS EKRANAS';
    fullscreenBtn.style.cssText = `background:#4caf50; color:#ffd700; border:2px solid #ffd700; border-radius:40px; padding:8px 20px; font-size:14px; font-weight:bold; cursor:pointer; transition:0.2s;`;
    fullscreenBtn.onclick = () => toggleFullscreen();
    fullscreenRow.appendChild(fullscreenBtn);
    
    // Trečia eilutė - Normalus dydis
    const normalSizeRow = document.createElement('div');
    normalSizeRow.style.display = 'flex';
    normalSizeRow.style.justifyContent = 'center';
    normalSizeRow.style.margin = '5px 0';
    
    const normalSizeBtn = document.createElement('button');
    normalSizeBtn.id = 'centerNormalSizeBtn';
    normalSizeBtn.innerHTML = '🔄 NORMALUS DYDIS';
    normalSizeBtn.style.cssText = `background:#4caf50; color:#ffd700; border:2px solid #ffd700; border-radius:40px; padding:8px 20px; font-size:14px; font-weight:bold; cursor:pointer; transition:0.2s;`;
    normalSizeBtn.onclick = () => exitFullscreen();
    normalSizeRow.appendChild(normalSizeBtn);
    
    // BANKROTO MYGTUKAS (pataisytas be confirm)
    const bankruptRow = document.createElement('div');
    bankruptRow.style.display = 'flex';
    bankruptRow.style.justifyContent = 'center';
    bankruptRow.style.margin = '5px 0';
    
    const bankruptBigBtn = document.createElement('button');
    bankruptBigBtn.id = 'bankruptBigBtn';
    bankruptBigBtn.innerHTML = '💀 BANKROTAS 💀';
    bankruptBigBtn.style.cssText = `background:#8b0000; color:#ffd700; border:2px solid #ffd700; border-radius:40px; padding:8px 20px; font-size:14px; font-weight:bold; cursor:pointer; transition:0.2s;`;
    
    bankruptBigBtn.onclick = () => {
        const p = players[currentPlayerIndex];
        if (p && !p.bankrupt) {
            const confirmModal = document.createElement('div');
            confirmModal.className = 'bankrupt-confirm-modal';
            confirmModal.innerHTML = `
                <div class="bankrupt-confirm-content">
                    <h3>💀 BANKROTAS 💀</h3>
                    <div class="bankrupt-confirm-player">${p.figure} ${p.name}</div>
                    <div class="bankrupt-confirm-message">Ar tikrai norite skelbti bankrotą?</div>
                    <div class="bankrupt-confirm-warning">⚠️ Prarasite visas nuosavybes ir būsite pašalintas iš žaidimo!</div>
                    <div class="bankrupt-confirm-buttons">
                        <button id="bankruptConfirmYes" class="bankrupt-confirm-yes">✅ TAIP, SKELBTI BANKROTĄ</button>
                        <button id="bankruptConfirmNo" class="bankrupt-confirm-no">❌ NE, ATŠAUKTI</button>
                    </div>
                </div>
            `;
            document.body.appendChild(confirmModal);
            
            confirmModal.querySelector('#bankruptConfirmYes').onclick = () => {
                confirmModal.remove();
                if (typeof processBankruptcy === 'function') processBankruptcy(p, null);
            };
            confirmModal.querySelector('#bankruptConfirmNo').onclick = () => {
                confirmModal.remove();
            };
            confirmModal.addEventListener('click', (e) => {
                if (e.target === confirmModal) confirmModal.remove();
            });
        }
    };
    bankruptRow.appendChild(bankruptBigBtn);
    
    // SUDEDAME VIDURINĖS PANELĖS TURINĮ
    middlePanel.appendChild(diceContainer);
    middlePanel.appendChild(infoBlock);
    middlePanel.appendChild(rollButtonContainer);
    middlePanel.appendChild(topButtonsRow);
    middlePanel.appendChild(fullscreenRow);
    middlePanel.appendChild(normalSizeRow);
    middlePanel.appendChild(bankruptRow);
    
    // DEŠINĖ PANELĖ - VŽ (viršuje) ir CHAT (apačioje)
    const rightPanel = document.createElement('div');
    rightPanel.className = 'center-right-panel';
    rightPanel.innerHTML = `
        <div class="center-log-panel">
            <div class="center-log-header">📜 VEIKSMŲ ŽURNALAS</div>
            <div class="center-log-list" id="centerLogList">
                <div class="log-entry">🎲 Žaidimas pradėtas!</div>
            </div>
        </div>
        <div class="center-chat-panel">
            <div class="center-chat-header">💬 POKALBIAI</div>
            <div class="center-chat-messages" id="centerChatMessages">
                <div class="chat-message system">💬 Pokalbio pradžia!</div>
            </div>
            <div class="center-chat-emoji-bar" id="centerChatEmojis"></div>
            <div class="center-chat-input-container">
                <input type="text" id="centerChatInput" class="center-chat-input" placeholder="Rašykite žinutę...">
                <button id="centerChatSendBtn" class="center-chat-send-btn">➤ SIŲSTI</button>
            </div>
        </div>
    `;
    
    center.appendChild(leftPanel);
    center.appendChild(middlePanel);
    center.appendChild(rightPanel);
    
    middleSection.appendChild(center);
    
    // DEŠINĖ EILĖ (16-24)
    const rightCol = document.createElement('div');
    rightCol.className = 'right-col';
    for (let id = 16; id <= 24; id++) {
        const cellData = getCellById(id);
        if (!cellData) continue;
        const cell = document.createElement('div');
        cell.className = 'cell vertical-cell';
        
        // Pridedame ilgo teksto klasę
        if (cellData.name && cellData.name.length > 15) {
            cell.classList.add('long-text');
        }
        
        cell.innerHTML = `<div class="cell-number">${cellData.id}</div><div class="cell-name">${cellData.name}</div><div class="cell-price">${cellData.price}€</div>`;
        cell.dataset.id = cellData.id;
        cell.dataset.type = cellData.type;
        cell.dataset.color = cellData.color || '';
        cell.dataset.price = cellData.price;
        cell.dataset.rent = cellData.rent;
        cell.id = `cell-${cellData.id}`;
        if (cellData.color) cell.setAttribute('data-color', cellData.color);
        cell.addEventListener('click', () => {
            if (!waitingForRoll && cellData.type === 'property' && cellData.price > 0 && (cellData.owner === undefined || cellData.owner === null)) {
                buyProperty(cellData.id);
            }
        });
        rightCol.appendChild(cell);
    }
    middleSection.appendChild(rightCol);
    boardContainer.appendChild(middleSection);
    
    // ========== APATINĖ EILĖ (25-39) ==========
    const bottomRow = document.createElement('div');
    bottomRow.className = 'bottom-row';
    for (let id = 39; id >= 25; id--) {
        const cellData = getCellById(id);
        if (!cellData) continue;
        let cell = document.createElement('div');
        
        const hideNumberCells = [3, 5, 6, 9, 13, 17, 20, 22, 27, 30, 33, 35, 37, 41, 44, 47];
        const shouldHideNumber = hideNumberCells.includes(cellData.id);
        const isCorner = [1, 15, 25, 39].includes(cellData.id);
        const hideNumber = shouldHideNumber || isCorner;
        const hideNumberStyle = hideNumber ? 'style="display:none;"' : '';
        
        if (cellData.type === 'corner') {
            if (window.createCornerCell) {
                const cornerCell = window.createCornerCell(cellData);
                if (cornerCell) {
                    cell = cornerCell;
                } else {
                    cell.className = `cell corner ${getCornerClass(cellData.position)}`;
                    cell.innerHTML = `<div class="cell-number" ${hideNumberStyle}>${cellData.id}</div><div class="cell-name">${cellData.name}</div>`;
                }
            } else {
                cell.className = `cell corner ${getCornerClass(cellData.position)}`;
                cell.innerHTML = `<div class="cell-number" ${hideNumberStyle}>${cellData.id}</div><div class="cell-name">${cellData.name}</div>`;
            }
        } else {
            cell.className = 'cell horizontal-cell';
            
            // Pridedame ilgo teksto klasę
            if (cellData.name && cellData.name.length > 15) {
                cell.classList.add('long-text');
            }
            
            cell.innerHTML = `<div class="cell-number">${cellData.id}</div><div class="cell-name">${cellData.name}</div><div class="cell-price">${cellData.price}€</div>`;
        }
        
        cell.dataset.id = cellData.id;
        cell.dataset.type = cellData.type;
        cell.dataset.color = cellData.color || '';
        cell.dataset.price = cellData.price;
        cell.dataset.rent = cellData.rent;
        cell.id = `cell-${cellData.id}`;
        if (cellData.color) cell.setAttribute('data-color', cellData.color);
        cell.addEventListener('click', () => {
            if (!waitingForRoll && cellData.type === 'property' && cellData.price > 0 && (cellData.owner === undefined || cellData.owner === null)) {
                buyProperty(cellData.id);
            }
        });
        bottomRow.appendChild(cell);
    }
    boardContainer.appendChild(bottomRow);
    board.appendChild(boardContainer);
    
    createAllPlayerTokens();
    updatePlayerPositionDisplay();
    updateUI();
    
    setTimeout(() => {
        updateSingleDice('centerDice1', 1);
        updateSingleDice('centerDice2', 1);
        updateCellDisplayWithOwner();
        if (typeof updateAllCellsBuildDisplay === 'function') {
            updateAllCellsBuildDisplay();
        }
    }, 50);
}