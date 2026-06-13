// ==================== KINTAMIEJI ====================

if (typeof currentPlayerIndex === 'undefined') {
    var currentPlayerIndex = 0;
}
if (typeof players === 'undefined') {
    var players = [];
}
if (typeof activePlayers === 'undefined') {
    var activePlayers = 0;
}
if (typeof waitingForRoll === 'undefined') {
    var waitingForRoll = true;
}
if (typeof lastRoll === 'undefined') {
    var lastRoll = 0;
}
if (typeof inJail === 'undefined') {
    var inJail = {};
}
if (typeof jailTurns === 'undefined') {
    var jailTurns = {};
}
if (typeof consecutiveDoubles === 'undefined') {
    var consecutiveDoubles = 0;
}

if (typeof draggedPlayerId === 'undefined') {
    var draggedPlayerId = null;
}
if (typeof dragOffsetX === 'undefined') {
    var dragOffsetX = 0;
}
if (typeof dragOffsetY === 'undefined') {
    var dragOffsetY = 0;
}
if (typeof dragPreview === 'undefined') {
    var dragPreview = null;
}

if (typeof animationsEnabled === 'undefined') {
    var animationsEnabled = true;
}
if (typeof cardsChoiceEnabled === 'undefined') {
    var cardsChoiceEnabled = false;
}

// ==================== LAIKO NUSTATYMAI ====================
if (typeof autoEndTurnTime === 'undefined') {
    var autoEndTurnTime = 10000; // 10 sekundžių
}

let turnEndTimeout = null;
let isWaitingForAction = false;

function setAutoEndTurnTime(seconds) {
    autoEndTurnTime = seconds * 1000;
    localStorage.setItem('autoEndTurnTime', autoEndTurnTime);
    console.log(`⏱️ Auto ėjimo pabaigos laikas nustatytas į ${seconds} sekundes`);
    if (typeof addLog === 'function') {
        addLog(`⏱️ Auto ėjimo pabaigos laikas: ${seconds} sekundės`);
    }
}

function getAutoEndTurnTime() {
    const saved = localStorage.getItem('autoEndTurnTime');
    if (saved) {
        autoEndTurnTime = parseInt(saved);
    }
    return autoEndTurnTime;
}

function cancelTurnEnd() {
    if (turnEndTimeout) {
        clearTimeout(turnEndTimeout);
        turnEndTimeout = null;
        console.log("⏰ Automatinis ėjimo pabaigimas atšauktas");
    }
}

function scheduleTurnEnd() {
    if (isWaitingForAction) {
        console.log("⏳ Laukiama veiksmo, timeris nebus paleistas");
        return;
    }
    
    cancelTurnEnd();
    const delay = getAutoEndTurnTime();
    console.log(`⏰ Suplanuotas ėjimo pabaigimas po ${delay/1000} sekundžių`);
    if (typeof addLog === 'function') {
        addLog(`⏱️ Ėjimas baigsis automatiškai po ${delay/1000} sekundžių`);
    }
    turnEndTimeout = setTimeout(() => {
        console.log("⏰ Automatinis ėjimo pabaigimas");
        if (typeof nextPlayer === 'function') {
            nextPlayer();
        }
        turnEndTimeout = null;
        isWaitingForAction = false;
    }, delay);
}

function endTurnNow() {
    cancelTurnEnd();
    isWaitingForAction = false;
    console.log("✅ Žaidėjas rankiniu būdu baigė ėjimą");
    if (typeof addLog === 'function') {
        addLog(`✅ Ėjimas baigtas rankiniu būdu`);
    }
    if (typeof nextPlayer === 'function') {
        nextPlayer();
    }
}

function setWaitingForAction(waiting) {
    isWaitingForAction = waiting;
    if (!waiting) {
        scheduleTurnEnd();
    } else {
        cancelTurnEnd();
    }
}

window.setAutoEndTurnTime = setAutoEndTurnTime;
window.getAutoEndTurnTime = getAutoEndTurnTime;
window.cancelTurnEnd = cancelTurnEnd;
window.scheduleTurnEnd = scheduleTurnEnd;
window.endTurnNow = endTurnNow;
window.setWaitingForAction = setWaitingForAction;