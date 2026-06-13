// ==================== TEMPIMOS KORTELĖS ====================

function handleDragStart(e) {
    draggedPlayerId = parseInt(this.dataset.playerId);
    const playerCard = this;
    const rect = playerCard.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
    
    playerCard.classList.add('dragging');
    e.dataTransfer.setData('text/plain', draggedPlayerId);
    e.dataTransfer.effectAllowed = 'move';
    
    dragPreview = playerCard.cloneNode(true);
    dragPreview.classList.add('drag-preview');
    dragPreview.style.position = 'fixed';
    dragPreview.style.left = e.clientX - dragOffsetX + 'px';
    dragPreview.style.top = e.clientY - dragOffsetY + 'px';
    dragPreview.style.width = playerCard.offsetWidth + 'px';
    dragPreview.style.opacity = '0.5';
    dragPreview.style.pointerEvents = 'none';
    dragPreview.style.zIndex = '9999';
    document.body.appendChild(dragPreview);
    
    e.dataTransfer.setDragImage(new Image(), 0, 0);
    playerCard.style.opacity = '0.3';
}

function handleDragOver(e) {
    e.preventDefault();
    if (dragPreview) {
        let newX = e.clientX - dragOffsetX;
        let newY = e.clientY - dragOffsetY;
        newX = Math.max(0, Math.min(newX, window.innerWidth - dragPreview.offsetWidth));
        newY = Math.max(0, Math.min(newY, window.innerHeight - dragPreview.offsetHeight));
        dragPreview.style.left = newX + 'px';
        dragPreview.style.top = newY + 'px';
    }
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    this.style.opacity = '1';
    
    if (dragPreview) {
        dragPreview.remove();
        dragPreview = null;
    }
    
    let newX = e.clientX - dragOffsetX;
    let newY = e.clientY - dragOffsetY;
    newX = Math.max(0, Math.min(newX, window.innerWidth - this.offsetWidth));
    newY = Math.max(0, Math.min(newY, window.innerHeight - this.offsetHeight));
    
    players[draggedPlayerId].x = newX;
    players[draggedPlayerId].y = newY;
    this.style.left = newX + 'px';
    this.style.top = newY + 'px';
    
    saveCardPositions();
    draggedPlayerId = null;
}

function resetCardPositions() {
    const startX = 100;
    const startY = 200;
    for (let i = 0; i < activePlayers; i++) {
        players[i].x = startX;
        players[i].y = startY + (i * 120);
        const card = document.querySelector(`.player-card[data-player-id="${i}"]`);
        if (card) {
            card.style.left = players[i].x + 'px';
            card.style.top = players[i].y + 'px';
        }
    }
    saveCardPositions();
    addLog(`📌 Kortelių pozicijos atstatytos`);
}

function showPlayerInfo(playerIndex) {
    const player = players[playerIndex];
    let message = `${player.figure} ${player.name} (${player.figureName})<br>💰 ${player.money} €<br>📍 Pozicija: ${player.position}`;
    if (player.properties.length > 0) {
        message += `<br>🏠 ${player.properties.length} nuosavybės`;
    }
    showToast(message, 'info');
}