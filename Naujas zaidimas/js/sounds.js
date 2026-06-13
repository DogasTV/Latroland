// ==================== GARSO SISTEMA ====================

let soundsEnabled = true;
let currentVolume = 0.7;
let audioContext = null;
let diceSound = null;
let buySound = null;
let jailSound = null;
let cardDealSound = null;
let airPortSound = null;
let airInSound = null;
let holydSound = null;
let autServSound = null;
let hospitalSound = null;
let electroSound = null;
let waterSound = null;
let devilSound = null;
let barSound = null;
let startSound = null;
let taxSound = null;
let freejailSound = null;
let parkingSound = null;
let iseejouSound = null;

// NAUJI GARSAI STATYBOMS
let houseBuildSound = null;
let hotelBuildSound = null;
let timeBuildSound = null;

function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
}

function initSounds() {
    diceSound = new Audio('sounds/dice-roll.mp3');
    diceSound.volume = currentVolume;
    console.log('🎵 Kauliukų garsas įkeltas');
    
    buySound = new Audio('sounds/buy.mp3');
    buySound.volume = currentVolume;
    console.log('🎵 Pirkimo garsas įkeltas');
    
    jailSound = new Audio('sounds/jail.mp3');
    jailSound.volume = currentVolume;
    console.log('🎵 Kalėjimo garsas įkeltas');
    
    cardDealSound = new Audio('sounds/card-deal.mp3');
    cardDealSound.volume = currentVolume;
    console.log('🎵 Kortelių dalijimo garsas įkeltas');
    
    airPortSound = new Audio('sounds/air-port.mp3');
    airPortSound.volume = currentVolume;
    console.log('🎵 Oro uosto (pirkimo) garsas įkeltas');
    
    airInSound = new Audio('sounds/air-in.mp3');
    airInSound.volume = currentVolume;
    console.log('🎵 Oro uosto (nuomos) garsas įkeltas');
    
    holydSound = new Audio('sounds/holyd-1.mp3');
    holydSound.volume = currentVolume;
    console.log('🎵 Poilsiavietės garsas įkeltas');
    
    autServSound = new Audio('sounds/aut-serv.mp3');
    autServSound.volume = currentVolume;
    console.log('🎵 Auto serviso garsas įkeltas');
    
    hospitalSound = new Audio('sounds/amb-car-1.mp3');
    hospitalSound.volume = currentVolume;
    console.log('🎵 Ligoninės garsas įkeltas');
    
    electroSound = new Audio('sounds/electo-1.mp3');
    electroSound.volume = currentVolume;
    console.log('🎵 Elektros garsas įkeltas');
    
    waterSound = new Audio('sounds/vanduo-1.mp3');
    waterSound.volume = currentVolume;
    console.log('💧 Vandens garsas įkeltas');
    
    devilSound = new Audio('sounds/velnio-1.mp3');
    devilSound.volume = currentVolume;
    console.log('😈 Velnio tuzino garsas įkeltas');
    
    barSound = new Audio('sounds/bar-1.mp3');
    barSound.volume = currentVolume;
    console.log('🍺 Baro garsas įkeltas');
    
    startSound = new Audio('sounds/start-1.mp3');
    startSound.volume = currentVolume;
    console.log('🏁 START garsas įkeltas');
    
    taxSound = new Audio('sounds/tax-1.mp3');
    taxSound.volume = currentVolume;
    console.log('💰 Mokesčių garsas įkeltas');
    
    freejailSound = new Audio('sounds/freejail-1.mp3');
    freejailSound.volume = currentVolume;
    console.log('🚔 Kalėjimo (svečias) garsas įkeltas');
    
    parkingSound = new Audio('sounds/parking-1.mp3');
    parkingSound.volume = currentVolume;
    console.log('🅿️ Parkingo garsas įkeltas');
    
    iseejouSound = new Audio('sounds/iseejou-1.mp3');
    iseejouSound.volume = currentVolume;
    console.log('🔊 Nepakanka pinigų garsas įkeltas');
    
    // NAUJI GARSAI STATYBOMS
    houseBuildSound = new Audio('sounds/hous-buid1.mp3');
    houseBuildSound.volume = currentVolume;
    console.log('🏠 Namelio statybos garsas įkeltas');
    
    hotelBuildSound = new Audio('sounds/hotell-build1.mp3');
    hotelBuildSound.volume = currentVolume;
    console.log('🏨 Viešbučio statybos garsas įkeltas');
    
    timeBuildSound = new Audio('sounds/time-bild1.mp3');
    timeBuildSound.volume = currentVolume;
    console.log('⏰ Leidimo statyti garsas įkeltas');
}

function setSoundVolume(volume) {
    currentVolume = Math.max(0, Math.min(1, volume));
    if (diceSound) diceSound.volume = currentVolume;
    if (buySound) buySound.volume = currentVolume;
    if (jailSound) jailSound.volume = currentVolume;
    if (cardDealSound) cardDealSound.volume = currentVolume;
    if (airPortSound) airPortSound.volume = currentVolume;
    if (airInSound) airInSound.volume = currentVolume;
    if (holydSound) holydSound.volume = currentVolume;
    if (autServSound) autServSound.volume = currentVolume;
    if (hospitalSound) hospitalSound.volume = currentVolume;
    if (electroSound) electroSound.volume = currentVolume;
    if (waterSound) waterSound.volume = currentVolume;
    if (devilSound) devilSound.volume = currentVolume;
    if (barSound) barSound.volume = currentVolume;
    if (startSound) startSound.volume = currentVolume;
    if (taxSound) taxSound.volume = currentVolume;
    if (freejailSound) freejailSound.volume = currentVolume;
    if (parkingSound) parkingSound.volume = currentVolume;
    if (iseejouSound) iseejouSound.volume = currentVolume;
    if (houseBuildSound) houseBuildSound.volume = currentVolume;
    if (hotelBuildSound) hotelBuildSound.volume = currentVolume;
    if (timeBuildSound) timeBuildSound.volume = currentVolume;
}

function playSound(type) {
    if (!soundsEnabled) return;
    
    try {
        initAudio();
        const now = audioContext.currentTime;
        
        switch(type) {
            case 'dice':
                if (diceSound) {
                    diceSound.currentTime = 0;
                    diceSound.play().catch(e => playDiceSound(now));
                } else {
                    playDiceSound(now);
                }
                break;
            case 'buy':
                if (buySound) {
                    buySound.currentTime = 0;
                    buySound.play().catch(e => playBuySound(now));
                } else {
                    playBuySound(now);
                }
                break;
            case 'jail':
                if (jailSound) {
                    jailSound.currentTime = 0;
                    jailSound.play().catch(e => playJailSound(now));
                } else {
                    playJailSound(now);
                }
                break;
            case 'card':
            case 'card-deal':
                if (cardDealSound) {
                    cardDealSound.currentTime = 0;
                    cardDealSound.play().catch(e => playCardSound(now));
                } else {
                    playCardSound(now);
                }
                break;
            case 'air-port':
                if (airPortSound) {
                    airPortSound.currentTime = 0;
                    airPortSound.play().catch(e => playAirPortSound(now));
                } else {
                    playAirPortSound(now);
                }
                break;
            case 'air-in':
                if (airInSound) {
                    airInSound.currentTime = 0;
                    airInSound.play().catch(e => playAirInSound(now));
                } else {
                    playAirInSound(now);
                }
                break;
            case 'holyd':
                if (holydSound) {
                    holydSound.currentTime = 0;
                    holydSound.play().catch(e => playHolydSound(now));
                } else {
                    playHolydSound(now);
                }
                break;
            case 'aut-serv':
                if (autServSound) {
                    autServSound.currentTime = 0;
                    autServSound.play().catch(e => playAutServSound(now));
                } else {
                    playAutServSound(now);
                }
                break;
            case 'hospital':
                if (hospitalSound) {
                    hospitalSound.currentTime = 0;
                    hospitalSound.play().catch(e => playHospitalSound(now));
                } else {
                    playHospitalSound(now);
                }
                break;
            case 'electro':
                if (electroSound) {
                    electroSound.currentTime = 0;
                    electroSound.play().catch(e => playElectroSound(now));
                } else {
                    playElectroSound(now);
                }
                break;
            case 'water':
                if (waterSound) {
                    waterSound.currentTime = 0;
                    waterSound.play().catch(e => playWaterSound(now));
                } else {
                    playWaterSound(now);
                }
                break;
            case 'devil':
                if (devilSound) {
                    devilSound.currentTime = 0;
                    devilSound.play().catch(e => playErrorSound(now));
                } else {
                    playErrorSound(now);
                }
                break;
            case 'bar':
                if (barSound) {
                    barSound.currentTime = 0;
                    barSound.play().catch(e => playSuccessSound(now));
                } else {
                    playSuccessSound(now);
                }
                break;
            case 'start-1':
                if (startSound) {
                    startSound.currentTime = 0;
                    startSound.play().catch(e => playSuccessSound(now));
                } else {
                    playSuccessSound(now);
                }
                break;
            case 'tax-1':
                if (taxSound) {
                    taxSound.currentTime = 0;
                    taxSound.play().catch(e => playErrorSound(now));
                } else {
                    playErrorSound(now);
                }
                break;
            case 'freejail-1':
                if (freejailSound) {
                    freejailSound.currentTime = 0;
                    freejailSound.play().catch(e => playSuccessSound(now));
                } else {
                    playSuccessSound(now);
                }
                break;
            case 'parking-1':
                if (parkingSound) {
                    parkingSound.currentTime = 0;
                    parkingSound.play().catch(e => playSuccessSound(now));
                } else {
                    playSuccessSound(now);
                }
                break;
            case 'iseejou':
                if (iseejouSound) {
                    iseejouSound.currentTime = 0;
                    iseejouSound.play().catch(e => playErrorSound(now));
                } else {
                    playErrorSound(now);
                }
                break;
            case 'sell':
                playSellSound(now);
                break;
            case 'bankrupt':
                playBankruptSound(now);
                break;
            case 'winner':
                playWinnerSound(now);
                break;
            case 'error':
                playErrorSound(now);
                break;
            case 'success':
                playSuccessSound(now);
                break;
            case 'move':
                playMoveSound(now);
                break;
            // NAUJI GARSAI STATYBOMS
            case 'house-build':
                if (houseBuildSound) {
                    houseBuildSound.currentTime = 0;
                    houseBuildSound.play().catch(e => playHouseBuildSound(now));
                } else {
                    playHouseBuildSound(now);
                }
                break;
            case 'hotel-build':
                if (hotelBuildSound) {
                    hotelBuildSound.currentTime = 0;
                    hotelBuildSound.play().catch(e => playHotelBuildSound(now));
                } else {
                    playHotelBuildSound(now);
                }
                break;
            case 'time-build':
                if (timeBuildSound) {
                    timeBuildSound.currentTime = 0;
                    timeBuildSound.play().catch(e => playTimeBuildSound(now));
                } else {
                    playTimeBuildSound(now);
                }
                break;
            default:
                return;
        }
    } catch(e) {
        console.log('Garso klaida:', e);
    }
}

// ATSARGINIAI PROGRAMINIAI GARSAI
function playDiceSound(now) {
    for (let i = 0; i < 3; i++) {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.value = 300 + (i * 100);
        gain.gain.value = currentVolume * 0.15;
        osc.start(now + (i * 0.05));
        gain.gain.exponentialRampToValueAtTime(0.00001, now + (i * 0.05) + 0.2);
        osc.stop(now + (i * 0.05) + 0.2);
    }
}

function playBuySound(now) {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.frequency.value = 523.25;
    gain.gain.value = currentVolume * 0.2;
    osc.start(now);
    gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.3);
    osc.stop(now + 0.3);
}

function playSellSound(now) {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.frequency.value = 392.00;
    gain.gain.value = currentVolume * 0.2;
    osc.start(now);
    gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.3);
    osc.stop(now + 0.3);
}

function playBankruptSound(now) {
    const osc1 = audioContext.createOscillator();
    const gain1 = audioContext.createGain();
    osc1.connect(gain1);
    gain1.connect(audioContext.destination);
    osc1.frequency.value = 100;
    gain1.gain.value = currentVolume * 0.3;
    osc1.start(now);
    gain1.gain.exponentialRampToValueAtTime(0.00001, now + 0.5);
    osc1.stop(now + 0.5);
    
    const osc2 = audioContext.createOscillator();
    const gain2 = audioContext.createGain();
    osc2.connect(gain2);
    gain2.connect(audioContext.destination);
    osc2.frequency.value = 800;
    gain2.gain.value = currentVolume * 0.15;
    osc2.start(now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.00001, now + 0.6);
    osc2.stop(now + 0.6);
}

function playJailSound(now) {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.frequency.value = 200;
    gain.gain.value = currentVolume * 0.2;
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.3);
    osc.start(now);
    gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.5);
    osc.stop(now + 0.5);
}

function playWinnerSound(now) {
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.value = freq;
        gain.gain.value = currentVolume * 0.25;
        osc.start(now + (i * 0.2));
        gain.gain.exponentialRampToValueAtTime(0.00001, now + (i * 0.2) + 0.6);
        osc.stop(now + (i * 0.2) + 0.6);
    });
}

function playErrorSound(now) {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.frequency.value = 440;
    gain.gain.value = currentVolume * 0.2;
    osc.start(now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.5);
    osc.stop(now + 0.5);
}

function playSuccessSound(now) {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.frequency.value = 659.25;
    gain.gain.value = currentVolume * 0.2;
    osc.start(now);
    gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.4);
    osc.stop(now + 0.4);
}

function playCardSound(now) {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.frequency.value = 1000;
    gain.gain.value = currentVolume * 0.1;
    osc.start(now);
    gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.15);
    osc.stop(now + 0.15);
}

function playAirPortSound(now) {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.frequency.value = 600;
    gain.gain.value = currentVolume * 0.15;
    osc.start(now);
    gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.4);
    osc.stop(now + 0.4);
}

function playAirInSound(now) {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.frequency.value = 300;
    gain.gain.value = currentVolume * 0.15;
    osc.start(now);
    gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.5);
    osc.stop(now + 0.5);
}

function playHolydSound(now) {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.frequency.value = 500;
    gain.gain.value = currentVolume * 0.15;
    osc.start(now);
    gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.4);
    osc.stop(now + 0.4);
}

function playAutServSound(now) {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.frequency.value = 700;
    gain.gain.value = currentVolume * 0.15;
    osc.start(now);
    gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.3);
    osc.stop(now + 0.3);
}

function playHospitalSound(now) {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.frequency.value = 650;
    gain.gain.value = currentVolume * 0.15;
    osc.start(now);
    gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.4);
    osc.stop(now + 0.4);
}

function playElectroSound(now) {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.frequency.value = 800;
    gain.gain.value = currentVolume * 0.15;
    osc.start(now);
    gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.2);
    osc.stop(now + 0.2);
}

function playWaterSound(now) {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.frequency.value = 550;
    gain.gain.value = currentVolume * 0.15;
    osc.start(now);
    gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.5);
    osc.stop(now + 0.5);
}

function playMoveSound(now) {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.frequency.value = 400;
    gain.gain.value = currentVolume * 0.1;
    osc.start(now);
    gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.1);
    osc.stop(now + 0.1);
}

// ATSARGINIAI GARSAI STATYBOMS
function playHouseBuildSound(now) {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.frequency.value = 523.25;
    gain.gain.value = currentVolume * 0.15;
    osc.start(now);
    gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.2);
    osc.stop(now + 0.2);
}

function playHotelBuildSound(now) {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.frequency.value = 659.25;
    gain.gain.value = currentVolume * 0.2;
    osc.start(now);
    gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.3);
    osc.stop(now + 0.3);
}

function playTimeBuildSound(now) {
    const notes = [523.25, 659.25];
    notes.forEach((freq, i) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.value = freq;
        gain.gain.value = currentVolume * 0.15;
        osc.start(now + (i * 0.1));
        gain.gain.exponentialRampToValueAtTime(0.00001, now + (i * 0.1) + 0.3);
        osc.stop(now + (i * 0.1) + 0.3);
    });
}

function toggleSounds() {
    soundsEnabled = !soundsEnabled;
    const soundToggleBtn = document.getElementById('soundToggleBtn');
    if (soundToggleBtn) {
        soundToggleBtn.innerHTML = soundsEnabled ? '🔊' : '🔇';
        soundToggleBtn.style.backgroundColor = soundsEnabled ? '#2e7d32' : '#8b0000';
    }
    const settingsSoundBtn = document.getElementById('settingsSoundBtn');
    if (settingsSoundBtn) {
        settingsSoundBtn.innerHTML = soundsEnabled ? '🔊 IŠJUNGTI' : '🔇 ĮJUNGTI';
        settingsSoundBtn.style.background = soundsEnabled ? '#ffd700' : '#8b0000';
        settingsSoundBtn.style.color = soundsEnabled ? '#8b0000' : '#ffd700';
    }
    showToast(soundsEnabled ? 'Garsai įjungti' : 'Garsai išjungti', 'info');
}

window.addEventListener('DOMContentLoaded', () => {
    initSounds();
});