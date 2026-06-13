// ==================== PAGRINDINIS ====================

window.addEventListener('DOMContentLoaded', () => {
    loadCardPositions();
    createBoard();
    
    const rollBtn = document.getElementById('rollBtnCenter');
    if (rollBtn) rollBtn.addEventListener('click', () => { if (waitingForRoll) rollDice(); });
    
    const playerCountBtn = document.getElementById('playerCountBtn');
    if (playerCountBtn) playerCountBtn.addEventListener('click', () => changePlayerCount());
    
    const logClearBtn = document.getElementById('logClearBtn');
    if (logClearBtn) logClearBtn.addEventListener('click', clearLog);
    
    const animationsBtn = document.getElementById('animationsToggleBtn');
    if (animationsBtn) {
        animationsBtn.addEventListener('click', () => {
            animationsEnabled = !animationsEnabled;
            animationsBtn.innerHTML = animationsEnabled ? '🎬 ANIMACIJOS: ĮJUNGTA' : '🎬 ANIMACIJOS: IŠJUNGTA';
            animationsBtn.style.background = animationsEnabled ? '#ffd700' : '#8b0000';
            animationsBtn.style.color = animationsEnabled ? '#8b0000' : '#ffd700';
            showToast(animationsEnabled ? 'Animacijos įjungtos' : 'Animacijos išjungtos', 'info');
        });
    }
    
    const cardsChoiceBtn = document.getElementById('cardsChoiceToggleBtn');
    if (cardsChoiceBtn) {
        cardsChoiceBtn.addEventListener('click', () => {
            cardsChoiceEnabled = !cardsChoiceEnabled;
            cardsChoiceBtn.innerHTML = cardsChoiceEnabled ? '🃏 KORTELIŲ PASIRINKIMAS: ĮJUNGTAS' : '🃏 KORTELIŲ PASIRINKIMAS: IŠJUNGTAS';
            cardsChoiceBtn.style.background = cardsChoiceEnabled ? '#ffd700' : '#8b0000';
            cardsChoiceBtn.style.color = cardsChoiceEnabled ? '#8b0000' : '#ffd700';
            showToast(cardsChoiceEnabled ? 'Kortelių pasirinkimas įjungtas (rinksitės iš 3)' : 'Kortelių pasirinkimas išjungtas (atsitiktinė)', 'info');
        });
    }
    
    const saveBtn = document.getElementById('saveGameBtn');
    if (saveBtn) saveBtn.addEventListener('click', () => saveGame());
    
    const loadBtn = document.getElementById('loadGameBtn');
    if (loadBtn) {
        loadBtn.addEventListener('click', () => {
            if (loadGame()) {
                updateAllPlayerTokens();
                updateUI();
                updatePlayersCards();
                if (typeof updateAllCellsDisplay === 'function') updateAllCellsDisplay();
                if (typeof updateCellDisplayWithOwner === 'function') updateCellDisplayWithOwner();
            }
        });
    }
    
    const resetBtn = document.getElementById('resetGameBtn');
    if (resetBtn) resetBtn.addEventListener('click', () => resetGame());
    
    loadLogPosition();
    loadLogSize();
    createResizeHandles();
    initLogDrag();
    
    setTimeout(() => {
        if (typeof initBoardControls === 'function') {
            initBoardControls();
        }
    }, 100);
    
    setInterval(() => {
        if (typeof saveGame === 'function') saveGame();
    }, 30000);
});

// ========== VISAS EKRANAS / NORMALUS DYDIS ==========

const fullscreenBtn = document.getElementById('fullscreenBtn');
const normalSizeBtn = document.getElementById('normalSizeBtn');
const container = document.querySelector('.container');

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(() => {
            container.classList.add('fullscreen-mode');
            const board = document.querySelector('.game-board');
            if (board) {
                board.style.transform = '';
                board.style.width = '';
            }
            showToast('Viso ekrano režimas įjungtas', 'success');
        }).catch(err => {
            console.error('Klaida:', err);
            showToast('Nepavyko įjungti viso ekrano režimo', 'error');
        });
    } else {
        exitFullscreen();
    }
}

function exitFullscreen() {
    if (document.fullscreenElement) {
        document.exitFullscreen().then(() => {
            container.classList.remove('fullscreen-mode');
            const board = document.querySelector('.game-board');
            if (board) {
                board.style.transform = '';
                board.style.width = '';
                board.style.zoom = '';
            }
            if (typeof resetZoom === 'function') {
                resetZoom();
            }
            showToast('Normalus dydis', 'info');
        });
    } else {
        container.classList.remove('fullscreen-mode');
        const board = document.querySelector('.game-board');
        if (board) {
            board.style.transform = '';
            board.style.width = '';
            board.style.zoom = '';
        }
        if (typeof resetZoom === 'function') {
            resetZoom();
        }
        showToast('Normalus dydis', 'info');
    }
}

if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', toggleFullscreen);
}
if (normalSizeBtn) {
    normalSizeBtn.addEventListener('click', exitFullscreen);
}

document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
        container.classList.remove('fullscreen-mode');
        const board = document.querySelector('.game-board');
        if (board) {
            board.style.transform = '';
            board.style.width = '';
            board.style.zoom = '';
        }
    }
});

// ========== STATISTIKOS PANELĖS SLAUGYMAS ==========

const toggleStatsBtn = document.getElementById('toggleStatsBtn');
const statsContent = document.getElementById('statsContent');
const statsPanel = document.querySelector('.stats-panel');
let statsCollapsed = false;

function toggleStatsPanel() {
    statsCollapsed = !statsCollapsed;
    
    if (statsCollapsed) {
        statsContent.classList.add('hidden');
        toggleStatsBtn.innerHTML = '🔽 IŠSKLEISTI';
        toggleStatsBtn.style.background = '#4caf50';
        toggleStatsBtn.style.color = 'white';
        statsPanel.classList.add('collapsed');
        showToast('Statistikos panelė paslėpta', 'info');
    } else {
        statsContent.classList.remove('hidden');
        toggleStatsBtn.innerHTML = '🔼 SLAUGYTI';
        toggleStatsBtn.style.background = '#ffd700';
        toggleStatsBtn.style.color = '#8b0000';
        statsPanel.classList.remove('collapsed');
        showToast('Statistikos panelė atidaryta', 'info');
    }
    
    localStorage.setItem('statsCollapsed', statsCollapsed);
}

if (toggleStatsBtn) {
    toggleStatsBtn.addEventListener('click', toggleStatsPanel);
}

const savedStatsCollapsed = localStorage.getItem('statsCollapsed');
if (savedStatsCollapsed === 'true') {
    statsCollapsed = true;
    statsContent.classList.add('hidden');
    toggleStatsBtn.innerHTML = '🔽 IŠSKLEISTI';
    toggleStatsBtn.style.background = '#4caf50';
    toggleStatsBtn.style.color = 'white';
    statsPanel.classList.add('collapsed');
}

// ========== STATISTIKOS PANELĖS TEMPIMAS ==========

const statsPanelDrag = document.getElementById('statsPanel');
const statsHeader = document.getElementById('statsHeader');
const dragStatsBtn = document.getElementById('dragStatsBtn');

let isDraggingStats = false;
let statsDragStartX = 0;
let statsDragStartY = 0;
let statsStartLeft = 0;
let statsStartTop = 0;
let statsDragMode = false;

if (statsPanelDrag) {
    statsPanelDrag.style.position = 'absolute';
    statsPanelDrag.style.left = 'auto';
    statsPanelDrag.style.right = '30px';
    statsPanelDrag.style.top = '100px';
    statsPanelDrag.style.bottom = 'auto';
}

function saveStatsPosition() {
    if (!statsPanelDrag) return;
    const left = statsPanelDrag.style.left;
    const top = statsPanelDrag.style.top;
    const right = statsPanelDrag.style.right;
    localStorage.setItem('statsPanelPosition', JSON.stringify({ left, top, right }));
}

function loadStatsPosition() {
    if (!statsPanelDrag) return;
    const saved = localStorage.getItem('statsPanelPosition');
    if (saved) {
        const pos = JSON.parse(saved);
        if (pos.left && pos.left !== 'auto') statsPanelDrag.style.left = pos.left;
        if (pos.top) statsPanelDrag.style.top = pos.top;
        if (pos.right) statsPanelDrag.style.right = pos.right;
    }
}

function startStatsDrag(e) {
    if (!statsDragMode) return;
    e.preventDefault();
    isDraggingStats = true;
    statsDragStartX = e.clientX;
    statsDragStartY = e.clientY;
    
    const rect = statsPanelDrag.getBoundingClientRect();
    statsStartLeft = rect.left;
    statsStartTop = rect.top;
    
    statsPanelDrag.style.left = statsStartLeft + 'px';
    statsPanelDrag.style.right = 'auto';
    statsPanelDrag.classList.add('dragging');
}

function onStatsDrag(e) {
    if (!isDraggingStats) return;
    e.preventDefault();
    const dx = e.clientX - statsDragStartX;
    const dy = e.clientY - statsDragStartY;
    let newLeft = statsStartLeft + dx;
    let newTop = statsStartTop + dy;
    
    newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - statsPanelDrag.offsetWidth));
    newTop = Math.max(0, Math.min(newTop, window.innerHeight - statsPanelDrag.offsetHeight));
    
    statsPanelDrag.style.left = newLeft + 'px';
    statsPanelDrag.style.top = newTop + 'px';
}

function stopStatsDrag() {
    if (isDraggingStats) {
        isDraggingStats = false;
        statsPanelDrag.classList.remove('dragging');
        saveStatsPosition();
    }
}

if (dragStatsBtn) {
    dragStatsBtn.addEventListener('click', () => {
        statsDragMode = !statsDragMode;
        if (statsDragMode) {
            dragStatsBtn.style.background = '#ffd700';
            dragStatsBtn.style.color = '#8b0000';
            dragStatsBtn.innerHTML = '✋ TEMPIMAS ĮJUNGTAS';
            if (statsHeader) statsHeader.style.cursor = 'grab';
            showToast('Statistikos panelės tempimas įjungtas', 'info');
        } else {
            dragStatsBtn.style.background = '#4caf50';
            dragStatsBtn.style.color = 'white';
            dragStatsBtn.innerHTML = '✋ TEMPTI';
            if (statsHeader) statsHeader.style.cursor = 'default';
            showToast('Statistikos panelės tempimas išjungtas', 'info');
        }
    });
}

if (statsHeader) {
    statsHeader.addEventListener('mousedown', startStatsDrag);
}
window.addEventListener('mousemove', onStatsDrag);
window.addEventListener('mouseup', stopStatsDrag);

loadStatsPosition();

// ==================== NUSTATYMŲ MODALAS ====================

// Patikriname ar soundsEnabled apibrėžtas
if (typeof soundsEnabled === 'undefined') {
    window.soundsEnabled = true;
}

function showSettingsModal() {
    const modal = document.createElement('div');
    modal.className = 'settings-modal';
    
    const currentZoom = localStorage.getItem('boardZoom') || '100';
    const currentStretchX = localStorage.getItem('boardStretchX') || '100';
    const currentStretchY = localStorage.getItem('boardStretchY') || '100';
    
    // Gauname dabartinį laiką sekundėmis
    const currentAutoTime = (typeof getAutoEndTurnTime === 'function' ? getAutoEndTurnTime() : 10000) / 1000;
    
    modal.innerHTML = `
        <div class="settings-modal-content">
            <h2>⚙️ NUSTATYMAI ⚙️</h2>
            
            <div class="settings-section">
                <label>🎬 Animacijos:</label>
                <button id="settingsAnimationsBtn" class="settings-btn">${animationsEnabled ? 'IŠJUNGTI' : 'ĮJUNGTI'}</button>
            </div>
            
            <div class="settings-section">
                <label>🃏 Kortelių pasirinkimas:</label>
                <button id="settingsCardsChoiceBtn" class="settings-btn">${cardsChoiceEnabled ? 'IŠJUNGTI' : 'ĮJUNGTI'}</button>
            </div>
            
            <div class="settings-section">
                <label>👥 Keisti žaidėjų skaičių:</label>
                <button id="settingsPlayerCountBtn" class="settings-btn">👥 KEISTI</button>
            </div>
            
            <div class="settings-section">
                <label>⏱️ Auto ėjimo pabaiga:</label>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <input type="range" id="autoTimeSlider" min="3" max="20" step="1" value="${currentAutoTime}" style="flex: 1;">
                    <span id="autoTimeValue" style="color:#ffd700; min-width: 60px;">${currentAutoTime} sek.</span>
                </div>
            </div>
            
            <div class="settings-section">
                <label>✅ Baigti ėjimą:</label>
                <button id="endTurnNowBtn" class="settings-btn" style="background: #ffd700; color: #8b0000;">⏩ BAIGTI ĖJIMĄ</button>
            </div>
            
            <div class="settings-section">
                <label>💾 Išsaugoti žaidimą:</label>
                <button id="settingsSaveGameBtn" class="settings-btn">💾 IŠSAUGOTI</button>
            </div>
            
            <div class="settings-section">
                <label>📀 Įkelti žaidimą:</label>
                <button id="settingsLoadGameBtn" class="settings-btn">📀 ĮKELTI</button>
            </div>
            
            <div class="settings-section">
                <label>🔄 Naujas žaidimas:</label>
                <button id="settingsResetGameBtn" class="settings-btn">🔄 NAUJAS</button>
            </div>
            
            <div class="settings-section">
                <label>🔍 Lentos priartinimas:</label>
                <input type="range" id="zoomSlider" min="50" max="200" value="${currentZoom}" step="10" style="flex:1;">
                <span id="zoomValueDisplay" style="color:#ffd700; width:50px; text-align:center;">${currentZoom}%</span>
                <button id="resetZoomBtn" class="settings-btn" style="padding:5px 10px;">↺</button>
            </div>
            
            <div class="settings-section">
                <label>⬅️➡️ Plotis (stretch):</label>
                <input type="range" id="stretchXSlider" min="50" max="150" value="${currentStretchX}" step="5" style="flex:1;">
                <span id="stretchXValue" style="color:#ffd700; width:50px; text-align:center;">${currentStretchX}%</span>
                <button id="resetStretchXBtn" class="settings-btn" style="padding:5px 10px;">↺</button>
            </div>
            
            <div class="settings-section">
                <label>⬆️⬇️ Aukštis (stretch):</label>
                <input type="range" id="stretchYSlider" min="50" max="150" value="${currentStretchY}" step="5" style="flex:1;">
                <span id="stretchYValue" style="color:#ffd700; width:50px; text-align:center;">${currentStretchY}%</span>
                <button id="resetStretchYBtn" class="settings-btn" style="padding:5px 10px;">↺</button>
            </div>
            
            <div class="settings-section">
                <label>🖱️ Lentos tempimas:</label>
                <button id="dragBoardModeBtn" class="settings-btn">✋ ĮJUNGTI</button>
            </div>
            
            <div class="settings-section">
                <label>🔊 Garsai:</label>
                <button id="settingsSoundBtn" class="settings-btn">${soundsEnabled ? '🔊 IŠJUNGTI' : '🔇 ĮJUNGTI'}</button>
            </div>
            
            <button id="settingsCloseBtn" class="settings-close-btn">❌ UŽDARYTI</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // LAIKO SLAIDERIS
    const autoTimeSlider = modal.querySelector('#autoTimeSlider');
    const autoTimeValue = modal.querySelector('#autoTimeValue');
    if (autoTimeSlider) {
        autoTimeSlider.addEventListener('input', (e) => {
            const seconds = parseInt(e.target.value);
            autoTimeValue.innerText = `${seconds} sek.`;
            if (typeof setAutoEndTurnTime === 'function') {
                setAutoEndTurnTime(seconds);
                showToast(`⏱️ Auto ėjimo pabaigos laikas: ${seconds} sekundės`, 'info');
            }
        });
    }
    
    // BAIGTI ĖJIMĄ MYGTUKAS
    const endTurnNowBtn = modal.querySelector('#endTurnNowBtn');
    if (endTurnNowBtn) {
        endTurnNowBtn.addEventListener('click', () => {
            if (typeof endTurnNow === 'function') {
                endTurnNow();
                modal.remove();
                showToast(`✅ Ėjimas baigtas rankiniu būdu!`, 'success');
            } else {
                showToast(`❌ Funkcija dar neaktyvi`, 'error');
            }
        });
    }
    
    // Animacijų mygtukas
    const animationsBtn = modal.querySelector('#settingsAnimationsBtn');
    if (animationsBtn) {
        animationsBtn.addEventListener('click', () => {
            animationsEnabled = !animationsEnabled;
            animationsBtn.innerHTML = animationsEnabled ? 'IŠJUNGTI' : 'ĮJUNGTI';
            const mainAnimationsBtn = document.getElementById('animationsToggleBtn');
            if (mainAnimationsBtn) {
                mainAnimationsBtn.innerHTML = animationsEnabled ? '🎬 ANIMACIJOS: ĮJUNGTA' : '🎬 ANIMACIJOS: IŠJUNGTA';
                mainAnimationsBtn.style.background = animationsEnabled ? '#ffd700' : '#8b0000';
                mainAnimationsBtn.style.color = animationsEnabled ? '#8b0000' : '#ffd700';
            }
            showToast(animationsEnabled ? 'Animacijos įjungtos' : 'Animacijos išjungtos', 'info');
        });
    }
    
    // Kortelių pasirinkimo mygtukas
    const cardsChoiceBtn = modal.querySelector('#settingsCardsChoiceBtn');
    if (cardsChoiceBtn) {
        cardsChoiceBtn.addEventListener('click', () => {
            cardsChoiceEnabled = !cardsChoiceEnabled;
            cardsChoiceBtn.innerHTML = cardsChoiceEnabled ? 'IŠJUNGTI' : 'ĮJUNGTI';
            const mainCardsBtn = document.getElementById('cardsChoiceToggleBtn');
            if (mainCardsBtn) {
                mainCardsBtn.innerHTML = cardsChoiceEnabled ? '🃏 KORTELIŲ PASIRINKIMAS: ĮJUNGTAS' : '🃏 KORTELIŲ PASIRINKIMAS: IŠJUNGTAS';
                mainCardsBtn.style.background = cardsChoiceEnabled ? '#ffd700' : '#8b0000';
                mainCardsBtn.style.color = cardsChoiceEnabled ? '#8b0000' : '#ffd700';
            }
            showToast(cardsChoiceEnabled ? 'Kortelių pasirinkimas įjungtas' : 'Kortelių pasirinkimas išjungtas', 'info');
        });
    }
    
    // Žaidėjų skaičiaus keitimas
    const playerCountBtn = modal.querySelector('#settingsPlayerCountBtn');
    if (playerCountBtn) {
        playerCountBtn.addEventListener('click', () => {
            if (typeof changePlayerCount === 'function') {
                changePlayerCount();
            }
            modal.remove();
        });
    }
    
    // Išsaugoti žaidimą
    const saveGameBtn = modal.querySelector('#settingsSaveGameBtn');
    if (saveGameBtn) {
        saveGameBtn.addEventListener('click', () => {
            if (typeof saveGame === 'function') {
                saveGame();
            }
            modal.remove();
        });
    }
    
    // Įkelti žaidimą
    const loadGameBtn = modal.querySelector('#settingsLoadGameBtn');
    if (loadGameBtn) {
        loadGameBtn.addEventListener('click', () => {
            if (typeof loadGame === 'function') {
                loadGame();
                updateAllPlayerTokens();
                updateUI();
                updatePlayersCards();
                if (typeof updateAllCellsDisplay === 'function') updateAllCellsDisplay();
                if (typeof updateCellDisplayWithOwner === 'function') updateCellDisplayWithOwner();
            }
            modal.remove();
        });
    }
    
    // Naujas žaidimas
    const resetGameBtn = modal.querySelector('#settingsResetGameBtn');
    if (resetGameBtn) {
        resetGameBtn.addEventListener('click', () => {
            if (typeof resetGame === 'function') {
                resetGame();
            }
            modal.remove();
        });
    }
    
    // Zoom nustatymai
    const zoomSlider = modal.querySelector('#zoomSlider');
    const zoomValueDisplay = modal.querySelector('#zoomValueDisplay');
    if (zoomSlider) {
        zoomSlider.addEventListener('input', (e) => {
            const val = e.target.value;
            zoomValueDisplay.innerText = val + '%';
            const board = document.querySelector('.game-board');
            if (board) {
                const stretchX = localStorage.getItem('boardStretchX') || '100';
                const stretchY = localStorage.getItem('boardStretchY') || '100';
                board.style.transform = `scale(${val / 100}) scaleX(${stretchX / 100}) scaleY(${stretchY / 100})`;
                localStorage.setItem('boardZoom', val);
            }
        });
    }
    
    const resetZoomBtn = modal.querySelector('#resetZoomBtn');
    if (resetZoomBtn) {
        resetZoomBtn.addEventListener('click', () => {
            zoomSlider.value = '100';
            zoomValueDisplay.innerText = '100%';
            const board = document.querySelector('.game-board');
            if (board) {
                const stretchX = localStorage.getItem('boardStretchX') || '100';
                const stretchY = localStorage.getItem('boardStretchY') || '100';
                board.style.transform = `scale(1) scaleX(${stretchX / 100}) scaleY(${stretchY / 100})`;
                localStorage.setItem('boardZoom', '100');
            }
        });
    }
    
    // Stretch X
    const stretchXSlider = modal.querySelector('#stretchXSlider');
    const stretchXValue = modal.querySelector('#stretchXValue');
    if (stretchXSlider) {
        stretchXSlider.addEventListener('input', (e) => {
            const val = e.target.value;
            stretchXValue.innerText = val + '%';
            localStorage.setItem('boardStretchX', val);
            const board = document.querySelector('.game-board');
            if (board) {
                const zoom = localStorage.getItem('boardZoom') || '100';
                const stretchY = localStorage.getItem('boardStretchY') || '100';
                board.style.transform = `scale(${zoom / 100}) scaleX(${val / 100}) scaleY(${stretchY / 100})`;
            }
        });
    }
    
    const resetStretchXBtn = modal.querySelector('#resetStretchXBtn');
    if (resetStretchXBtn) {
        resetStretchXBtn.addEventListener('click', () => {
            stretchXSlider.value = '100';
            stretchXValue.innerText = '100%';
            localStorage.setItem('boardStretchX', '100');
            const board = document.querySelector('.game-board');
            if (board) {
                const zoom = localStorage.getItem('boardZoom') || '100';
                const stretchY = localStorage.getItem('boardStretchY') || '100';
                board.style.transform = `scale(${zoom / 100}) scaleX(1) scaleY(${stretchY / 100})`;
            }
        });
    }
    
    // Stretch Y
    const stretchYSlider = modal.querySelector('#stretchYSlider');
    const stretchYValue = modal.querySelector('#stretchYValue');
    if (stretchYSlider) {
        stretchYSlider.addEventListener('input', (e) => {
            const val = e.target.value;
            stretchYValue.innerText = val + '%';
            localStorage.setItem('boardStretchY', val);
            const board = document.querySelector('.game-board');
            if (board) {
                const zoom = localStorage.getItem('boardZoom') || '100';
                const stretchX = localStorage.getItem('boardStretchX') || '100';
                board.style.transform = `scale(${zoom / 100}) scaleX(${stretchX / 100}) scaleY(${val / 100})`;
            }
        });
    }
    
    const resetStretchYBtn = modal.querySelector('#resetStretchYBtn');
    if (resetStretchYBtn) {
        resetStretchYBtn.addEventListener('click', () => {
            stretchYSlider.value = '100';
            stretchYValue.innerText = '100%';
            localStorage.setItem('boardStretchY', '100');
            const board = document.querySelector('.game-board');
            if (board) {
                const zoom = localStorage.getItem('boardZoom') || '100';
                const stretchX = localStorage.getItem('boardStretchX') || '100';
                board.style.transform = `scale(${zoom / 100}) scaleX(${stretchX / 100}) scaleY(1)`;
            }
        });
    }
    
    // Lentos tempimo režimas
    const dragBoardModeBtn = modal.querySelector('#dragBoardModeBtn');
    let dragModeActiveLocal = false;
    if (dragBoardModeBtn) {
        dragBoardModeBtn.addEventListener('click', () => {
            dragModeActiveLocal = !dragModeActiveLocal;
            if (dragModeActiveLocal) {
                dragBoardModeBtn.innerHTML = '✋ IŠJUNGTI';
                dragBoardModeBtn.style.background = '#ff6600';
                const dragBtn = document.getElementById('dragBoardBtn');
                if (dragBtn) dragBtn.click();
                showToast('Lentos tempimo režimas įjungtas', 'info');
            } else {
                dragBoardModeBtn.innerHTML = '✋ ĮJUNGTI';
                dragBoardModeBtn.style.background = '#ffd700';
                const dragBtn = document.getElementById('dragBoardBtn');
                if (dragBtn) dragBtn.click();
                showToast('Lentos tempimo režimas išjungtas', 'info');
            }
        });
    }
    
    // Garso mygtukas
    const settingsSoundBtn = modal.querySelector('#settingsSoundBtn');
    if (settingsSoundBtn) {
        settingsSoundBtn.addEventListener('click', () => {
            if (typeof toggleSounds === 'function') {
                toggleSounds();
            } else {
                soundsEnabled = !soundsEnabled;
                const soundToggleBtn = document.getElementById('soundToggleBtn');
                if (soundToggleBtn) {
                    soundToggleBtn.innerHTML = soundsEnabled ? '🔊' : '🔇';
                    soundToggleBtn.style.backgroundColor = soundsEnabled ? '#2e7d32' : '#8b0000';
                }
                showToast(soundsEnabled ? 'Garsai įjungti' : 'Garsai išjungti', 'info');
            }
            settingsSoundBtn.innerHTML = soundsEnabled ? '🔊 IŠJUNGTI' : '🔇 ĮJUNGTI';
        });
    }
    
    const closeBtn = modal.querySelector('#settingsCloseBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => modal.remove());
    }
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
}

// Eksportuojame
window.showSettingsModal = showSettingsModal;