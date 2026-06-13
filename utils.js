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

// ========== PATAISYTA: ILGESNI PRANEŠIMAI (5 sek.) ==========
function showToast(message, type = 'info') {
    const oldToast = document.querySelector('.toast-notification');
    if (oldToast) oldToast.remove();
    
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    if (message.length > 50) toast.classList.add('long-message');
    toast.innerHTML = message;
    document.body.appendChild(toast);
    
    // Pailginome iš 3000ms į 5000ms (5 sekundes)
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.animation = 'fadeOut 0.5s ease forwards';
            setTimeout(() => {
                if (toast.parentNode) toast.remove();
            }, 500);
        }
    }, 5000);
}

// ========== PATAISYTA: ILGESNĖ INFORMACINĖ KORTELĖ (8 sek.) ==========
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
    
    // Pailginome iš 6000ms į 8000ms (8 sekundes)
    setTimeout(() => {
        if (infoCard.parentNode) infoCard.remove();
    }, 8000);
}
