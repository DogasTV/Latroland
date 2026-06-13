// ==================== NAMELIŲ / VIEŠBUČIŲ SISTEMA (BALANSINĖ) ====================

console.log('🏠 houses.js loaded');

const housePrices = {
    'brown': 50,
    'lightblue': 50,
    'orange': 50,
    'bronze': 100,
    'red': 100,
    'yellow': 150,
    'darkgreen': 150,
    'purple': 150,
    'lime': 200,
    'brightblue': 200
};

const groupProperties = {
    'brown': [2, 4],
    'lightblue': [7, 8, 10],
    'orange': [11, 12, 14],
    'bronze': [16, 18, 19],
    'red': [21, 23, 24],
    'yellow': [26, 28, 29],
    'darkgreen': [31, 32, 34],
    'purple': [36, 38],
    'lime': [40, 42, 43],
    'brightblue': [45, 46, 48]
};

// ==================== REŽIMO SISTEMA ====================
let gameDifficulty = 'medium';

function setDifficulty(difficulty) {
    if (difficulty === 'easy' || difficulty === 'medium' || difficulty === 'hard') {
        gameDifficulty = difficulty;
        localStorage.setItem('gameDifficulty', difficulty);
        console.log("🎮 Sudėtingumas nustatytas į:", difficulty);
        if (typeof addLog === 'function') {
            addLog(`🎮 Žaidimo sudėtingumas: ${difficulty === 'easy' ? 'LENGVAS' : difficulty === 'hard' ? 'SUNKUS' : 'VIDUTINIS'}`);
        }
    }
}

function getDifficulty() {
    const saved = localStorage.getItem('gameDifficulty');
    if (saved && ['easy', 'medium', 'hard'].includes(saved)) {
        gameDifficulty = saved;
    }
    return gameDifficulty;
}

// ==================== SEKIMAS AR JAU GROTA ====================
let hasPlayedBuildSoundForGroup = {};

function resetBuildSoundForPlayer(playerId) {
    if (hasPlayedBuildSoundForGroup[playerId]) {
        delete hasPlayedBuildSoundForGroup[playerId];
        console.log(`🗑️ Išvalyti garso įrašai žaidėjui ID: ${playerId}`);
    }
}

function resetAllBuildSounds() {
    hasPlayedBuildSoundForGroup = {};
    console.log("🗑️ Išvalyti visi garso įrašai");
}

function getColorGroup(cellId) {
    for (const [color, ids] of Object.entries(groupProperties)) {
        if (ids.includes(cellId)) return color;
    }
    return null;
}

function getHousePrice(cellData) {
    const color = getColorGroup(cellData.id);
    return housePrices[color] || 100;
}

function getHotelPrice(cellData) {
    return getHousePrice(cellData) * 2;
}

// ==================== NUOMOS FORMULĖ SU REŽIMAIS ====================
function getRentWithHouses(cellData, houses) {
    const baseRent = cellData.rent;
    const difficulty = getDifficulty();
    
    if (houses === 0) return baseRent;
    
    switch(difficulty) {
        case 'easy':
            if (houses === 1) return baseRent * 2;
            if (houses === 2) return baseRent * 4;
            if (houses === 3) return baseRent * 6;
            if (houses === 4) return baseRent * 8;
            if (houses === 5) return baseRent * 10;
            break;
            
        case 'medium':
            if (houses === 1) return baseRent * 5;
            if (houses === 2) return baseRent * 10;
            if (houses === 3) return baseRent * 15;
            if (houses === 4) return baseRent * 20;
            if (houses === 5) return baseRent * 25;
            break;
            
        case 'hard':
            if (houses === 1) return baseRent * 10;
            if (houses === 2) return baseRent * 20;
            if (houses === 3) return baseRent * 30;
            if (houses === 4) return baseRent * 40;
            if (houses === 5) return baseRent * 50;
            break;
    }
    
    return baseRent;
}

function getColorGroupIds(color) {
    return groupProperties[color] || [];
}

function getMinHousesInGroup(player, groupIds) {
    let min = 999;
    for (let id of groupIds) {
        const houses = player.houses[id] || 0;
        if (houses < min) min = houses;
    }
    return min;
}

function getMaxHousesInGroup(player, groupIds) {
    let max = 0;
    for (let id of groupIds) {
        const houses = player.houses[id] || 0;
        if (houses > max) max = houses;
    }
    return max;
}

function hasFullGroup(player, cellId) {
    const color = getColorGroup(cellId);
    if (!color) return false;
    
    const groupIds = groupProperties[color];
    const playerPropertyIds = player.properties.map(p => p.id);
    return groupIds.every(id => playerPropertyIds.includes(id));
}

function canBuildOnProperty(player, propertyId) {
    const color = getColorGroup(propertyId);
    if (!color) return false;
    
    const groupIds = groupProperties[color];
    
    const playerPropertyIds = player.properties.map(p => p.id);
    const hasAllProperties = groupIds.every(id => playerPropertyIds.includes(id));
    if (!hasAllProperties) return false;
    
    const currentHouses = player.houses[propertyId] || 0;
    
    if (currentHouses >= 5) return false;
    
    let minHouses = 999;
    let maxHouses = 0;
    for (let id of groupIds) {
        const h = player.houses[id] || 0;
        if (h < minHouses) minHouses = h;
        if (h > maxHouses) maxHouses = h;
    }
    
    if (currentHouses === 4) {
        let allOthersHaveAtLeast4 = true;
        for (let id of groupIds) {
            if (id === propertyId) continue;
            const h = player.houses[id] || 0;
            if (h < 4) allOthersHaveAtLeast4 = false;
        }
        if (allOthersHaveAtLeast4) {
            return player.money >= getHotelPrice(getCellById(propertyId));
        }
    }
    
    if (currentHouses === minHouses && minHouses < 4) {
        return player.money >= getHousePrice(getCellById(propertyId));
    }
    
    return false;
}

function getBuildableProperties(player) {
    const buildable = [];
    for (let prop of player.properties) {
        if (canBuildOnProperty(player, prop.id)) {
            buildable.push(prop.id);
        }
    }
    return buildable;
}

function showBuildMenuOnCell(cellId) {
    const currentPlayer = players[currentPlayerIndex];
    const cellData = getCellById(cellId);
    if (!cellData) return;
    
    if (cellData.owner !== currentPlayer.id) {
        showToast('Tik savininkas gali statyti namelius!', 'warning');
        return;
    }
    
    if (!canBuildOnProperty(currentPlayer, cellId)) {
        const color = getColorGroup(cellId);
        const groupIds = groupProperties[color];
        const minHouses = getMinHousesInGroup(currentPlayer, groupIds);
        const maxHouses = getMaxHousesInGroup(currentPlayer, groupIds);
        
        if (minHouses !== maxHouses) {
            showToast(`Pirmiausia reikia išlyginti namelių skaičių grupėje!`, 'warning');
        } else if (!hasFullGroup(currentPlayer, cellId)) {
            showToast(`Reikia turėti VISUS ${color} spalvos sklypus!`, 'warning');
        }
        return;
    }
    
    const currentHouses = currentPlayer.houses[cellId] || 0;
    const housePrice = getHousePrice(cellData);
    const hotelPrice = getHotelPrice(cellData);
    
    const canBuildHouse = currentHouses < 4 && currentPlayer.money >= housePrice;
    const canBuildHotel = currentHouses === 4 && currentPlayer.money >= hotelPrice;
    
    const modal = document.createElement('div');
    modal.className = 'build-modal';
    modal.innerHTML = `
        <div class="build-modal-content">
            <h3>🏠 STATYBA: ${cellData.name} 🏠</h3>
            <div class="build-current">
                ${currentHouses === 5 ? '🏨 VIEŠBUTIS' : '🏠'.repeat(currentHouses) || 'Nėra namelių'}
            </div>
            <div class="build-info">
                <div>💰 Dabartinė nuoma: ${getRentWithHouses(cellData, currentHouses)}€</div>
                <div>🏠 Namelio kaina: ${housePrice}€</div>
                <div>🏨 Viešbučio kaina: ${hotelPrice}€</div>
            </div>
            <div class="build-buttons">
                ${canBuildHouse ? `<button class="build-house-btn">🏠 STATYTI NAMELĮ (${housePrice}€)</button>` : ''}
                ${canBuildHotel ? `<button class="build-hotel-btn">🏨 STATYTI VIEŠBUTĮ (${hotelPrice}€)</button>` : ''}
                <button class="build-cancel-btn">❌ UŽDARYTI</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    if (canBuildHouse) {
        modal.querySelector('.build-house-btn').addEventListener('click', () => {
            currentPlayer.money -= housePrice;
            currentPlayer.houses[cellId] = (currentPlayer.houses[cellId] || 0) + 1;
            addLog(`${currentPlayer.name} pastatė namelį ant "${cellData.name}" už ${housePrice}€. Liko pinigų: ${currentPlayer.money}€`);
            showToast(`🏠 Pastatėte namelį ant "${cellData.name}"!`, 'success');
            playSound('house-build');
            updateUI();
            updatePlayersCards();
            updateCellDisplay(cellId);
            updateAllCellsBuildDisplay();
            if (typeof saveGame === 'function') saveGame();
            modal.remove();
            
            if (typeof saveFullGameState === 'function') {
                saveFullGameState();
            }
        });
    }
    
    if (canBuildHotel) {
        modal.querySelector('.build-hotel-btn').addEventListener('click', () => {
            currentPlayer.money -= hotelPrice;
            currentPlayer.houses[cellId] = 5;
            addLog(`${currentPlayer.name} pastatė viešbutį ant "${cellData.name}" už ${hotelPrice}€. Liko pinigų: ${currentPlayer.money}€`);
            showToast(`🏨 Pastatėte viešbutį ant "${cellData.name}"!`, 'success');
            playSound('hotel-build');
            updateUI();
            updatePlayersCards();
            updateCellDisplay(cellId);
            updateAllCellsBuildDisplay();
            if (typeof saveGame === 'function') saveGame();
            modal.remove();
            
            if (typeof saveFullGameState === 'function') {
                saveFullGameState();
            }
        });
    }
    
    modal.querySelector('.build-cancel-btn').addEventListener('click', () => modal.remove());
}

function updateCellDisplay(cellId) {
    const cell = document.getElementById(`cell-${cellId}`);
    if (!cell) return;
    
    const owner = players.find(p => p && p.properties && p.properties.some(prop => prop.id === cellId));
    if (!owner) return;
    
    const houses = owner.houses[cellId] || 0;
    
    const oldHouses = cell.querySelector('.cell-houses');
    if (oldHouses) oldHouses.remove();
    
    if (houses > 0) {
        const housesDiv = document.createElement('div');
        housesDiv.className = 'cell-houses';
        if (houses === 5) {
            housesDiv.innerHTML = '🏨';
            housesDiv.title = 'Viešbutis';
        } else {
            housesDiv.innerHTML = '🏠'.repeat(houses);
            housesDiv.title = `${houses} nameliai`;
        }
        cell.appendChild(housesDiv);
    }
}

function updateAllCellsDisplay() {
    for (let id = 1; id <= 48; id++) {
        updateCellDisplay(id);
    }
}

function updateAllCellsBuildDisplay() {
    console.log("🏠 Atnaujinami statybos mygtukai, einamasis žaidėjas:", players[currentPlayerIndex]?.name);
    
    let buildIconAdded = false;
    const currentPlayer = players[currentPlayerIndex];
    
    if (!currentPlayer) {
        console.log("⚠️ Nėra einamojo žaidėjo");
        return;
    }
    
    // Tikriname ar žaidėjas turi naujai pilną grupę
    const currentPlayerGroups = {};
    
    for (let id = 1; id <= 48; id++) {
        const cell = document.getElementById(`cell-${id}`);
        if (!cell) continue;
        
        const cellData = getCellById(id);
        if (!cellData) continue;
        
        const isOwnedByCurrentPlayer = (cellData.owner === currentPlayer.id);
        
        let canBuild = false;
        if (isOwnedByCurrentPlayer) {
            canBuild = canBuildOnProperty(currentPlayer, id);
            if (canBuild) {
                const color = getColorGroup(id);
                if (color) {
                    currentPlayerGroups[color] = true;
                }
                console.log(`🏠 ${currentPlayer.name} gali statyti ant ${cellData.name}`);
            }
        }
        
        const oldBuildIcon = cell.querySelector('.build-icon');
        if (oldBuildIcon) oldBuildIcon.remove();
        
        if (isOwnedByCurrentPlayer && canBuild) {
            const numberDiv = cell.querySelector('.cell-number');
            if (numberDiv) {
                numberDiv.style.display = 'none';
            }
            
            const buildIcon = document.createElement('div');
            buildIcon.className = 'build-icon';
            buildIcon.innerHTML = '🏠';
            buildIcon.style.cssText = 'font-size:24px; cursor:pointer; margin:5px 0; animation:pulse 1s ease-in-out infinite;';
            buildIcon.title = 'Spustelėkite norėdami statyti namelį';
            buildIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                showBuildMenuOnCell(id);
            });
            cell.appendChild(buildIcon);
            buildIconAdded = true;
        } else {
            const numberDiv = cell.querySelector('.cell-number');
            if (numberDiv && numberDiv.style.display === 'none') {
                numberDiv.style.display = 'flex';
            }
        }
    }
    
    // GARSO LOGIKA: groti tik kai PIRMĄ KARTĄ surinkta visa grupė
    for (const color in currentPlayerGroups) {
        if (!hasPlayedBuildSoundForGroup[currentPlayer.id]) {
            hasPlayedBuildSoundForGroup[currentPlayer.id] = {};
        }
        
        if (!hasPlayedBuildSoundForGroup[currentPlayer.id][color]) {
            console.log(`🔊 PIRMA KARTĄ surinkta ${color} grupė! Grojame garsą.`);
            playSound('time-build');
            hasPlayedBuildSoundForGroup[currentPlayer.id][color] = true;
        }
    }
    
    // Išvalome senus įrašus kai žaidėjas bankrutuoja
    for (let i = 0; i < players.length; i++) {
        if (players[i] && players[i].bankrupt) {
            if (hasPlayedBuildSoundForGroup[i]) {
                delete hasPlayedBuildSoundForGroup[i];
                console.log(`🗑️ Išvalyti garso įrašai bankrutavusiam žaidėjui ${players[i]?.name}`);
            }
        }
    }
    
    if (buildIconAdded) {
        // Garsas jau paleistas aukščiau, čia nereikia
    }
    
    console.log("🏠 Statybos mygtukų atnaujinimas baigtas");
}

// Eksportuojame funkcijas
window.hasFullGroup = hasFullGroup;
window.getColorGroup = getColorGroup;
window.getHousePrice = getHousePrice;
window.getHotelPrice = getHotelPrice;
window.showBuildMenuOnCell = showBuildMenuOnCell;
window.updateCellDisplay = updateCellDisplay;
window.updateAllCellsDisplay = updateAllCellsDisplay;
window.updateAllCellsBuildDisplay = updateAllCellsBuildDisplay;
window.canBuildOnProperty = canBuildOnProperty;
window.getBuildableProperties = getBuildableProperties;
window.getRentWithHouses = getRentWithHouses;
window.setDifficulty = setDifficulty;
window.getDifficulty = getDifficulty;
window.resetBuildSoundForPlayer = resetBuildSoundForPlayer;
window.resetAllBuildSounds = resetAllBuildSounds;