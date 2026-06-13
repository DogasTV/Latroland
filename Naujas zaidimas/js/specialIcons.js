// ==================== SPECIALIŲ LANGELIŲ IKONOS ====================

const specialCellsConfig = {
    3: { icon: 'wrench', html: '<div class="wrench-icon"><span class="wrench-cross-left">🔧</span><span class="wrench-cross-right">🔧</span></div>', showPrice: true, price: 200 },
    30: { icon: 'wrench', html: '<div class="wrench-icon"><span class="wrench-cross-left">🔧</span><span class="wrench-cross-right">🔧</span></div>', showPrice: true, price: 200 },
    5: { icon: 'tax', html: '<div class="tax-icon">💸</div>', showPrice: true, price: 200 },
    6: { icon: 'plane', html: '<div class="plane-icon">✈️</div>', showPrice: true, price: 200 },
    22: { icon: 'plane', html: '<div class="plane-icon">✈️</div>', showPrice: true, price: 200 },
    35: { icon: 'plane', html: '<div class="plane-icon">✈️</div>', showPrice: true, price: 200 },
    9: { icon: 'chance', html: '<div class="chance-icon">🎲❓</div>', showPrice: false },
    37: { icon: 'chance', html: '<div class="chance-icon">🃏❓</div>', showPrice: false },
    13: { icon: 'devil', html: '<div class="devil-icon">👿</div>', showPrice: false },
    17: { icon: 'lightning', html: '<div class="lightning-icon">⚡</div>', showPrice: true, price: 200 },
    20: { icon: 'beer', html: '<div class="beer-icon">🍺<span class="beer-foam">💭</span></div>', showPrice: false },
    27: { icon: 'water', html: '<div class="water-icon"><span class="water-content">💧</span><span class="water-sparkle">💦</span></div>', showPrice: true, price: 200 },
    33: { icon: 'hospital', html: '<div class="hospital-icon">🏥❤️</div>', showPrice: false },
    41: { icon: 'treasure', html: '<div class="treasure-icon"><span class="treasure-content">📦💰</span><span class="treasure-sparkle">✨</span></div>', showPrice: false },
    44: { icon: 'vacation', html: '<div class="vacation-icon"><span class="vacation-content">🌴🏖️</span><span class="vacation-sparkle">✨</span></div>', showPrice: false },
    47: { icon: 'birthday', html: '<div class="birthday-icon"><div class="birthday-pulse">🎂🕯️</div></div>', showPrice: false },
};

function isSpecialCell(cellId) {
    return specialCellsConfig.hasOwnProperty(cellId);
}

function getSpecialCellHTML(cellId, cellName, cellPrice) {
    const config = specialCellsConfig[cellId];
    if (!config) return null;
    let html = `<div class="cell-number" style="display:none;">${cellId}</div>`;
    html += config.html;
    html += `<div class="cell-name">${cellName}</div>`;
    if (config.showPrice && config.price) {
        html += `<div class="cell-price">${config.price}€</div>`;
    }
    return html;
}

function updateSpecialCell(cell, cellId, owner) {
    if (!isSpecialCell(cellId)) return false;
    const config = specialCellsConfig[cellId];
    
    const oldIcons = cell.querySelectorAll('.wrench-icon, .tax-icon, .plane-icon, .chance-icon, .devil-icon, .lightning-icon, .beer-icon, .water-icon, .hospital-icon, .treasure-icon, .vacation-icon, .birthday-icon, .cell-price');
    oldIcons.forEach(icon => icon.remove());
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = config.html;
    const iconElement = tempDiv.firstChild;
    
    // Jei tai kairės eilės langelis (40-48) - apverčiame animaciją atgal
    if (cellId >= 40 && cellId <= 48) {
        iconElement.style.transform = 'rotate(180deg)';
    }
    
    cell.appendChild(iconElement);
    
    if (!owner && config.showPrice && config.price) {
        let priceDiv = cell.querySelector('.cell-price');
        if (!priceDiv) {
            priceDiv = document.createElement('div');
            priceDiv.className = 'cell-price';
            cell.appendChild(priceDiv);
        }
        priceDiv.innerHTML = `${config.price}€`;
    }
    
    return true;
}

window.isSpecialCell = isSpecialCell;
window.getSpecialCellHTML = getSpecialCellHTML;
window.updateSpecialCell = updateSpecialCell;