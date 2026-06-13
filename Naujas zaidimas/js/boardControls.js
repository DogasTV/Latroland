// ==================== LENTOS VALDYMO FUNKCIJOS ====================

let currentZoom = 1;
let boardTranslateX = 0;
let boardTranslateY = 0;
let boardStretchX = 1;
let boardStretchY = 1;

function updateZoomDisplay() {
    const zoomPercent = Math.round(currentZoom * 100);
    const zoomValueEl = document.getElementById('zoomValue');
    if (zoomValueEl) zoomValueEl.innerText = zoomPercent + '%';
    
    const board = document.querySelector('.game-board');
    if (board) {
        board.style.transform = `scale(${currentZoom}) translate(${boardTranslateX}px, ${boardTranslateY}px) scaleX(${boardStretchX}) scaleY(${boardStretchY})`;
    }
}

function zoomIn() {
    if (currentZoom < 2) {
        currentZoom = Math.min(2, currentZoom + 0.1);
        updateZoomDisplay();
        addLog(`Priartinta: ${Math.round(currentZoom * 100)}%`);
        showToast(`Priartinta: ${Math.round(currentZoom * 100)}%`, 'info');
    }
}

function zoomOut() {
    if (currentZoom > 0.5) {
        currentZoom = Math.max(0.5, currentZoom - 0.1);
        updateZoomDisplay();
        addLog(`Nutolinta: ${Math.round(currentZoom * 100)}%`);
        showToast(`Nutolinta: ${Math.round(currentZoom * 100)}%`, 'info');
    }
}

function resetZoom() {
    currentZoom = 1;
    boardTranslateX = 0;
    boardTranslateY = 0;
    boardStretchX = 1;
    boardStretchY = 1;
    updateZoomDisplay();
    addLog(`Atstatytas normalus lentos dydis`);
    showToast(`Atstatytas normalus dydis`, 'success');
}

function stretchWidth() {
    if (boardStretchX < 1.5) {
        boardStretchX = Math.min(1.5, boardStretchX + 0.05);
        updateZoomDisplay();
        addLog(`Plotis: ${Math.round(boardStretchX * 100)}%`);
        showToast(`Plotis: ${Math.round(boardStretchX * 100)}%`, 'info');
    } else {
        boardStretchX = 1;
        updateZoomDisplay();
        addLog(`Plotis atstatytas`);
        showToast(`Plotis atstatytas`, 'info');
    }
}

function stretchHeight() {
    if (boardStretchY < 1.5) {
        boardStretchY = Math.min(1.5, boardStretchY + 0.05);
        updateZoomDisplay();
        addLog(`Aukštis: ${Math.round(boardStretchY * 100)}%`);
        showToast(`Aukštis: ${Math.round(boardStretchY * 100)}%`, 'info');
    } else {
        boardStretchY = 1;
        updateZoomDisplay();
        addLog(`Aukštis atstatytas`);
        showToast(`Aukštis atstatytas`, 'info');
    }
}

let isDraggingBoard = false;
let boardDragStartX = 0;
let boardDragStartY = 0;
let boardStartTranslateX = 0;
let boardStartTranslateY = 0;

function initBoardDrag() {
    const board = document.querySelector('.game-board');
    if (!board) return;
    
    const dragBtn = document.getElementById('dragBoardBtn');
    let boardDragModeActive = false;
    
    if (dragBtn) {
        dragBtn.addEventListener('click', () => {
            boardDragModeActive = !boardDragModeActive;
            if (boardDragModeActive) {
                dragBtn.style.background = 'linear-gradient(135deg, #ffd700, #ffaa00)';
                dragBtn.style.color = '#8b0000';
                addLog(`Įjungtas lentos tempimo režimas`);
                showToast('Įjungtas lentos tempimo režimas', 'info');
            } else {
                dragBtn.style.background = 'linear-gradient(135deg, #2e7d32, #1b5e20)';
                dragBtn.style.color = '#ffd700';
                addLog(`Išjungtas lentos tempimo režimas`);
                showToast('Išjungtas lentos tempimo režimas', 'info');
            }
        });
    }
    
    const startDrag = (e) => {
        if (!boardDragModeActive) return;
        e.preventDefault();
        isDraggingBoard = true;
        boardDragStartX = e.clientX;
        boardDragStartY = e.clientY;
        boardStartTranslateX = boardTranslateX;
        boardStartTranslateY = boardTranslateY;
        document.body.style.cursor = 'grabbing';
    };
    
    const onDrag = (e) => {
        if (!isDraggingBoard) return;
        const dx = e.clientX - boardDragStartX;
        const dy = e.clientY - boardDragStartY;
        boardTranslateX = boardStartTranslateX + dx;
        boardTranslateY = boardStartTranslateY + dy;
        updateZoomDisplay();
    };
    
    const stopDrag = () => {
        isDraggingBoard = false;
        document.body.style.cursor = '';
    };
    
    board.addEventListener('mousedown', startDrag);
    window.addEventListener('mousemove', onDrag);
    window.addEventListener('mouseup', stopDrag);
}

function initBoardControls() {
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const resetZoomBtn = document.getElementById('resetZoomBtn');
    const stretchWidthBtn = document.getElementById('stretchWidthBtn');
    const stretchHeightBtn = document.getElementById('stretchHeightBtn');
    
    if (zoomInBtn) zoomInBtn.addEventListener('click', zoomIn);
    if (zoomOutBtn) zoomOutBtn.addEventListener('click', zoomOut);
    if (resetZoomBtn) resetZoomBtn.addEventListener('click', resetZoom);
    if (stretchWidthBtn) stretchWidthBtn.addEventListener('click', stretchWidth);
    if (stretchHeightBtn) stretchHeightBtn.addEventListener('click', stretchHeight);
    
    initBoardDrag();
}