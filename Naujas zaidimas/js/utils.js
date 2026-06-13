// ==================== PAGALBINĖS FUNKCIJOS ====================

function getCornerClass(position) {
    const classes = {
        'top-left': 'top-left-corner',
        'top-right': 'top-right-corner',
        'bottom-right': 'bottom-right-corner',
        'bottom-left': 'bottom-left-corner'
    };
    return classes[position] || '';
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

function showToast(message, type = 'info') {
    // Pašaliname seną toast'ą jei yra
    const oldToast = document.querySelector('.toast-notification');
    if (oldToast) oldToast.remove();
    
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    toast.innerHTML = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.animation = 'fadeOut 0.5s ease forwards';
            setTimeout(() => {
                if (toast.parentNode) toast.remove();
            }, 500);
        }
    }, 3000);
}

// ========== INFORMACINĖ KORTELĖ (6 sekundės) ==========
function showInfoCard(playerName, message, title) {
    const infoCard = document.createElement('div');
    infoCard.className = 'info-card';
    infoCard.innerHTML = `
        <div class="info-card-content">
            <h4>${title}</h4>
            <div class="info-card-player">🎲 ${playerName}</div>
            <div class="info-card-message">${message}</div>
            <button class="info-card-ok">Gerai</button>
        </div>
    `;
    document.body.appendChild(infoCard);
    
    const okBtn = infoCard.querySelector('.info-card-ok');
    okBtn.addEventListener('click', () => {
        infoCard.remove();
    });
    
    // Prailginta iki 6 sekundžių
    setTimeout(() => {
        if (infoCard.parentNode) infoCard.remove();
    }, 6000);
}