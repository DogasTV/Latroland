// ==================== KAMPINIŲ LANGELIŲ VALDYMAS ====================

const cornersConfig = {
    1: {
        name: "START",
        icon: "🏁",
        description: "Pradžios vieta. Kiekvieną kartą praėjus gauni 200€. Atsistojus gauni 300€",
        backgroundColor: "linear-gradient(135deg, #ffd700, #ff8c00)",
        borderColor: "#ffd700"
    },
    15: {
        name: "KALĖJIMAS",
        icon: "🚔",
        description: "Kalėjimas. Įkalinimo vieta. Išeiti galima sumokėjus 50€ arba išmetus dvigubą.",
        backgroundColor: "#1a1a1a",
        borderColor: "#ff0000"
    },
    25: {
        name: "PARKINGAS",
        icon: "🅿️",
        description: "Nemokamas stovėjimas. Jokių efektų.",
        backgroundColor: "#2e5a2e",
        borderColor: "#ffd700"
    },
    39: {
        name: "EIK Į KALĖJIMĄ",
        icon: "🚔",
        description: "Atsistoji – eini tiesiai į kalėjimą!",
        backgroundColor: "#1a1a1a",
        borderColor: "#ff0000"
    }
};

// Funkcija kampiniams langeliams sukurti
function createCornerCell(cellData) {
    if (!cellData || !cornersConfig[cellData.id]) return null;
    
    const config = cornersConfig[cellData.id];
    const cell = document.createElement('div');
    cell.className = `cell corner ${getCornerClass(cellData.position)}`;
    
    // VISIEMS kampiniams langeliams - paslėpti numerį
    const hideNumber = (cellData.id === 1 || cellData.id === 15 || cellData.id === 25 || cellData.id === 39);
    
    // Pridedame animuotą ikoną
    let iconHtml = '';
    if (cellData.id === 1) {
        iconHtml = `
            <div class="start-container">
                <div class="start-icon">🏁</div>
                <div class="start-name">START</div>
                <div class="start-sparkle">✨</div>
                <div class="start-prize">💰</div>
            </div>
        `;
    } else if (cellData.id === 15) {
        iconHtml = `
            <div class="jail-container">
                <div class="jail-bars-left">🔒🔒🔒</div>
                <div class="jail-area">
                    <div class="jail-name">KALĖJIMAS</div>
                    <div class="jail-subtitle">🚔</div>
                </div>
                <div class="jail-bars-right">🔒🔒🔒</div>
            </div>
        `;
    } else if (cellData.id === 25) {
        iconHtml = `
            <div class="parking-container">
                <div class="parking-sign">🅿️</div>
                <div class="parking-lines">
                    <div class="parking-line"></div>
                    <div class="parking-line"></div>
                    <div class="parking-line"></div>
                </div>
                <div class="parking-car">🚗</div>
            </div>
        `;
    } else if (cellData.id === 39) {
        iconHtml = `
            <div class="go-to-jail-container">
                <div class="go-to-jail-icon">⚠️🚔⚠️</div>
                <div class="go-to-jail-name">EIK Į KALĖJIMĄ</div>
            </div>
        `;
    }
    
    if (hideNumber) {
        cell.innerHTML = `
            <div class="cell-number" style="display:none;">${cellData.id}</div>
            <div class="cell-name" style="display:none;">${config.name}</div>
            ${iconHtml}
        `;
    } else {
        cell.innerHTML = `
            <div class="cell-number">${cellData.id === 1 ? config.icon : cellData.id}</div>
            <div class="cell-name">${config.name}</div>
            ${iconHtml}
        `;
    }
    
    cell.style.background = config.backgroundColor;
    cell.style.border = `3px solid ${config.borderColor}`;
    cell.style.position = 'relative';
    
    return cell;
}

// Eksportuojame funkcijas
window.createCornerCell = createCornerCell;
window.cornersConfig = cornersConfig;