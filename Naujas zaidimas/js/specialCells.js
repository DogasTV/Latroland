// ==================== SPECIALŪS LANGELIAI ====================

function handleSpecialCell(cellData, currentPlayer) {
    // Išsaugome originalų žaidėją patikrinimui
    const originalPlayerIndex = currentPlayerIndex;
    const originalPlayerId = currentPlayer.id;
    
    // KALĖJIMAS KAIP SVEČIAS (ID 15)
    if (cellData.id === 15 && !inJail[currentPlayerIndex]) {
        playSound('freejail-1');
        addLog(`${currentPlayer.name} atvyko į KALĖJIMĄ, bet tik kaip svečias.`);
        showToast(`${currentPlayer.name} aplanko kalėjimą, bet nėra įkalinamas.`, 'info');
        showInfoCard(`${currentPlayer.name}`, `Aplankėte kalėjimą, bet nesate įkalinamas.`, '🚔 KALĖJIMAS');
        return;
    }
    
    // PARKINGAS (ID 25)
    if (cellData.id === 25) {
        playSound('parking-1');
        addLog(`${currentPlayer.name} atvyko į PARKINGĄ. Stovėjimas nemokamas.`);
        showToast(`🅿️ ${currentPlayer.name} atvyko į parkingą! Stovėjimas nemokamas.`, 'info');
        showInfoCard(`${currentPlayer.name}`, `Parkingas nemokamas. Nieko nemokate už stovėjimą.`, '🅿️ PARKINGAS');
        return;
    }
    
    switch(cellData.special) {
        case 'service':
            const services = getCellsBySpecialType('service');
            const playerServices = services.filter(s => s.owner === currentPlayerIndex);
            let serviceRent = cellData.rent;
            if (playerServices.length === 2) serviceRent = 100;
            if (cellData.owner !== undefined && cellData.owner !== null && cellData.owner !== currentPlayerIndex) {
                const owner = players[cellData.owner];
                if (currentPlayer.money >= serviceRent) {
                    currentPlayer.money -= serviceRent;
                    owner.money += serviceRent;
                    addLog(`${currentPlayer.name} sumokėjo ${serviceRent}€ serviso mokestį ${owner.name} už ${cellData.name}`);
                    showToast(`💰 ${currentPlayer.name} moka ${serviceRent}€ serviso mokestį ${owner.name}`, 'info');
                    showInfoCard(`${currentPlayer.name}`, `Sumokėjote ${serviceRent}€ ${owner.name} už automobilio remontą.`, '🔧 AUTOMOBILIŲ SERVISAS');
                    playSound('sell');
                } else {
                    if (typeof handleDebt === 'function') {
                        handleDebt(serviceRent, currentPlayer, owner);
                    } else {
                        processBankruptcy(currentPlayer, owner);
                    }
                    return;
                }
            } else if (cellData.owner === undefined && cellData.price > 0) {
                addLog(`${currentPlayer.name} atsistojo ant ${cellData.name} - gali nusipirkti už ${cellData.price}€`);
                playSound('aut-serv');
                setTimeout(() => {
                    if (currentPlayerIndex === originalPlayerIndex && players[currentPlayerIndex]?.id === originalPlayerId) {
                        offerToBuy(cellData.id);
                    } else {
                        addLog(`${players[originalPlayerId]?.name} negali pirkti ${cellData.name}, nes jau ne jo eilė!`);
                    }
                }, 500);
            }
            break;
            
        case 'airport':
            const airports = getCellsBySpecialType('airport');
            const playerAirports = airports.filter(a => a.owner === currentPlayerIndex);
            let airportRent = 50;
            if (playerAirports.length === 2) airportRent = 100;
            if (playerAirports.length === 3) airportRent = 200;
            
            if (cellData.owner !== undefined && cellData.owner !== null && cellData.owner !== currentPlayerIndex) {
                const owner = players[cellData.owner];
                if (currentPlayer.money >= airportRent) {
                    currentPlayer.money -= airportRent;
                    owner.money += airportRent;
                    addLog(`${currentPlayer.name} sumokėjo ${airportRent}€ oro uosto mokestį ${owner.name}`);
                    showToast(`💰 ${currentPlayer.name} moka ${airportRent}€ oro uosto mokestį ${owner.name}`, 'info');
                    showInfoCard(`${currentPlayer.name}`, `Sumokėjote ${airportRent}€ oro uosto mokestį ${owner.name}.`, '✈️ ORO UOSTAS');
                    playSound('air-in');
                } else {
                    if (typeof handleDebt === 'function') {
                        handleDebt(airportRent, currentPlayer, owner);
                    } else {
                        processBankruptcy(currentPlayer, owner);
                    }
                    return;
                }
            } else if (cellData.owner === undefined && cellData.price > 0) {
                addLog(`${currentPlayer.name} atsistojo ant ${cellData.name} - gali nusipirkti už ${cellData.price}€`);
                playSound('air-port');
                setTimeout(() => {
                    if (currentPlayerIndex === originalPlayerIndex && players[currentPlayerIndex]?.id === originalPlayerId) {
                        offerToBuy(cellData.id);
                    } else {
                        addLog(`${players[originalPlayerId]?.name} negali pirkti ${cellData.name}, nes jau ne jo eilė!`);
                    }
                }, 500);
            }
            break;
            
        case 'utility':
            const utilities = getCellsBySpecialType('utility');
            const playerUtilities = utilities.filter(u => u.owner === currentPlayerIndex);
            let utilityRent = 50;
            if (playerUtilities.length === 2) utilityRent = 100;
            
            if (cellData.owner !== undefined && cellData.owner !== null && cellData.owner !== currentPlayerIndex) {
                const owner = players[cellData.owner];
                if (currentPlayer.money >= utilityRent) {
                    currentPlayer.money -= utilityRent;
                    owner.money += utilityRent;
                    addLog(`${currentPlayer.name} sumokėjo ${utilityRent}€ komunalinį mokestį ${owner.name}`);
                    showToast(`💰 ${currentPlayer.name} moka ${utilityRent}€ komunalinį mokestį ${owner.name}`, 'info');
                    if (cellData.id === 17) {
                        playSound('electro');
                        showInfoCard(`${currentPlayer.name}`, `Sumokėjote ${utilityRent}€ už elektrą.`, '⚡ ELEKTROS TINKLAI');
                    } else if (cellData.id === 27) {
                        playSound('water');
                        showInfoCard(`${currentPlayer.name}`, `Sumokėjote ${utilityRent}€ už vandenį.`, '💧 VANDUO');
                    } else {
                        playSound('sell');
                    }
                } else {
                    if (typeof handleDebt === 'function') {
                        handleDebt(utilityRent, currentPlayer, owner);
                    } else {
                        processBankruptcy(currentPlayer, owner);
                    }
                    return;
                }
            } else if (cellData.owner === undefined && cellData.price > 0) {
                addLog(`${currentPlayer.name} atsistojo ant ${cellData.name} - gali nusipirkti už ${cellData.price}€`);
                if (cellData.id === 17) {
                    playSound('electro');
                } else if (cellData.id === 27) {
                    playSound('water');
                }
                setTimeout(() => {
                    if (currentPlayerIndex === originalPlayerIndex && players[currentPlayerIndex]?.id === originalPlayerId) {
                        offerToBuy(cellData.id);
                    } else {
                        addLog(`${players[originalPlayerId]?.name} negali pirkti ${cellData.name}, nes jau ne jo eilė!`);
                    }
                }, 500);
            }
            break;
            
        case 'devil':
            playSound('devil');
            let totalHouses = 0;
            for (let prop of currentPlayer.properties) {
                totalHouses += currentPlayer.houses[prop.id] || 0;
            }
            const devilPayment = totalHouses * 50;
            if (devilPayment > 0) {
                if (currentPlayer.money >= devilPayment) {
                    currentPlayer.money -= devilPayment;
                    addLog(`${currentPlayer.name} pataikė į VELNIO TUZINĄ! Turi ${totalHouses} namus. Sumokėjo ${devilPayment}€!`);
                    showToast(`😈 Velnio tuzinas! Sumokate ${devilPayment}€!`, 'error');
                    showInfoCard(`${currentPlayer.name}`, `Pataikėte į VELNIO TUZINĄ! Turite ${totalHouses} namų. Sumokėjote ${devilPayment}€.`, '😈 VELNIO TUZINAS');
                    playSound('error');
                } else {
                    if (typeof handleDebt === 'function') {
                        handleDebt(devilPayment, currentPlayer, null);
                    } else {
                        processBankruptcy(currentPlayer, null);
                    }
                    return;
                }
            } else {
                addLog(`${currentPlayer.name} pataikė į VELNIO TUZINĄ, bet neturi namų - nieko nemokėjo`);
                showToast(`😈 Velnio tuzinas - neturite namų, nieko nemokate!`, 'info');
                showInfoCard(`${currentPlayer.name}`, `Pataikėte į VELNIO TUZINĄ! Bet neturite namų, todėl nieko nemokate.`, '😈 VELNIO TUZINAS');
            }
            break;
            
        case 'free':
            playSound('bar');
            addLog(`${currentPlayer.name} atėjo į Latro barą ir gauna nemokamą alų!`);
            showToast(`🍺 ${currentPlayer.name} atėjo į Latro barą! Nieko mokėti nereikia.`, 'success');
            showInfoCard(`${currentPlayer.name}`, `Atėjote į Latro barą! Gaunate nemokamą alų.`, '🍺 LATRO BARAS');
            playSound('success');
            break;
            
        case 'hospital':
            if (currentPlayer.money >= 25) {
                currentPlayer.money -= 25;
                addLog(`${currentPlayer.name} gydosi ligoninėje. Sumokėjo 25€ daktarui Bubauskui.`);
                showToast(`🏥 ${currentPlayer.name} gydosi ligoninėje. Sumokėjo 25€ daktarui Bubauskui.`, 'warning');
                showInfoCard(`${currentPlayer.name}`, `Sumokėjote 25€ daktarui Bubauskui už gydymą.`, '🏥 LIGONINĖ');
                playSound('hospital');
            } else {
                if (typeof handleDebt === 'function') {
                    handleDebt(25, currentPlayer, null);
                } else {
                    processBankruptcy(currentPlayer, null);
                }
                return;
            }
            break;
            
        case 'treasure':
            const treasureAmount = Math.floor(Math.random() * 401) + 100;
            currentPlayer.money += treasureAmount;
            addLog(`${currentPlayer.name} rado LOBIJĄ ir gauna ${treasureAmount}€!`);
            showToast(`💰 ${currentPlayer.name} rado lobį ir gauna ${treasureAmount}€!`, 'success');
            showInfoCard(`${currentPlayer.name}`, `Radote lobį! Laimėjote ${treasureAmount}€!`, '💰 LOBIS');
            playSound('success');
            break;
            
        case 'birthday':
            addLog(`${currentPlayer.name} švenčia GIMTADIENĮ! Visi žaidėjai atvyksta sveikinti į 47 poziciją!`);
            showToast(`🎂 ${currentPlayer.name} švenčia gimtadienį! Visi žaidėjai atvyksta sveikinti!`, 'success');
            showInfoCard(`${currentPlayer.name}`, `Švenčiate gimtadienį! Visi žaidėjai atvyksta sveikinti į 47 poziciją.`, '🎂 GIMTADIENIS');
            playSound('success');
            for (let i = 0; i < activePlayers; i++) {
                if (i !== currentPlayerIndex && !players[i].bankrupt) {
                    players[i].position = 47;
                }
            }
            updateAllPlayerTokens();
            break;
            
        case 'start':
            playSound('start-1');
            currentPlayer.money += 300;
            addLog(`${currentPlayer.name} atsistojo ant START ir gauna 300€!`);
            showToast(`🎯 ${currentPlayer.name} atsistojo ant START ir gauna 300€!`, 'success');
            showInfoCard(`${currentPlayer.name}`, `Atsistojote ant START! Gaunate 300€.`, '🏁 START');
            playSound('success');
            break;
            
        case 'goToJail':
            currentPlayer.position = 15;
            inJail[currentPlayerIndex] = true;
            jailTurns[currentPlayerIndex] = 0;
            updateAllPlayerTokens();
            addLog(`${currentPlayer.name} EINA Į KALĖJIMĄ! Praleis iki 3 ėjimų.`);
            showToast(`🚔 ${currentPlayer.name} eina į KALĖJIMĄ! Praleis iki 3 ėjimų.`, 'error');
            showInfoCard(`${currentPlayer.name}`, `Einate į kalėjimą! Praleisite iki 3 ėjimų.`, '🚔 EIK Į KALĖJIMĄ');
            playSound('jail');
            break;
            
        case 'tax':
            playSound('tax-1');
            if (currentPlayer.money >= cellData.rent) {
                currentPlayer.money -= cellData.rent;
                addLog(`${currentPlayer.name} sumokėjo ${cellData.rent}€ mokesčių!`);
                showToast(`📄 ${currentPlayer.name} sumokėjo ${cellData.rent}€ mokesčių!`, 'warning');
                showInfoCard(`${currentPlayer.name}`, `Sumokėjote mokesčius: ${cellData.rent}€`, '💰 MOKESČIAI');
                playSound('error');
            } else {
                if (typeof handleDebt === 'function') {
                    handleDebt(cellData.rent, currentPlayer, null);
                } else {
                    processBankruptcy(currentPlayer, null);
                }
                return;
            }
            break;
            
        case 'chance':
            drawChanceCard();
            break;
            
        case 'vacation':
            addLog(`${currentPlayer.name} atėjo į poilsiavietę!`);
            showToast(`🌴 ${currentPlayer.name} atėjo į poilsiavietę!`, 'success');
            showInfoCard(`${currentPlayer.name}`, `Atėjote į poilsiavietę! Mėgaukitės atostogomis.`, '🌴 POILSAVIETĖ');
            playSound('holyd');
            break;
            
        default:
            if (cellData.type === 'property' && cellData.price > 0) {
                if (cellData.owner !== undefined && cellData.owner !== null && cellData.owner !== currentPlayerIndex) {
                    const owner = players[cellData.owner];
                    
                    const isPledged = cellData.pledged === true;
                    if (isPledged) {
                        addLog(`${cellData.name} yra įkeista bankui – nereikia mokėti nuomos!`);
                        showToast(`🔒 ${cellData.name} yra įkeista – nuomos mokėti nereikia!`, 'info');
                        break;
                    }
                    
                    const houses = owner.houses[cellData.id] || 0;
                    const rent = getRentWithHouses(cellData, houses);
                    
                    if (currentPlayer.money >= rent) {
                        currentPlayer.money -= rent;
                        owner.money += rent;
                        addLog(`${currentPlayer.name} sumokėjo ${rent}€ nuomos mokestį ${owner.name} už ${cellData.name}`);
                        showToast(`💰 ${currentPlayer.name} moka ${rent}€ nuomos mokestį ${owner.name}`, 'info');
                        playSound('sell');
                    } else {
                        if (typeof handleDebt === 'function') {
                            handleDebt(rent, currentPlayer, owner);
                        } else {
                            processBankruptcy(currentPlayer, owner);
                        }
                        return;
                    }
                } else if (cellData.owner === undefined) {
                    addLog(`${currentPlayer.name} atsistojo ant ${cellData.name} - gali nusipirkti už ${cellData.price}€`);
                    setTimeout(() => {
                        if (currentPlayerIndex === originalPlayerIndex && players[currentPlayerIndex]?.id === originalPlayerId) {
                            offerToBuy(cellData.id);
                        } else {
                            addLog(`${players[originalPlayerId]?.name} negali pirkti ${cellData.name}, nes jau ne jo eilė!`);
                        }
                    }, 500);
                }
            }
            break;
    }
    updateUI();
    updatePlayersCards();
    updateCellDisplayWithOwner();
    if (typeof updateDebtIndicator === 'function') {
        updateDebtIndicator(currentPlayer, 0);
    }
}

function checkCellEffect() {
    const currentPlayer = players[currentPlayerIndex];
    const cellData = getCellById(currentPlayer.position);
    if (!cellData) return;
    handleSpecialCell(cellData, currentPlayer);
}