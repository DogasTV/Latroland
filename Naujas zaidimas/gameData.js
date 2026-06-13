// Monopolio žaidimo duomenys su 48 langeliais
const monopolyData = [
    { id: 1, name: "START", type: "corner", color: null, price: 0, rent: 0, group: "corner", position: "top-left", special: "start" },
    { id: 15, name: "KALĖJIMAS", type: "corner", color: null, price: 0, rent: 0, group: "corner", position: "top-right", special: "jail" },
    { id: 25, name: "PARKINGAS", type: "corner", color: null, price: 0, rent: 0, group: "corner", position: "bottom-right", special: "parking" },
    { id: 39, name: "EIK Į KALĖJIMĄ", type: "corner", color: null, price: 0, rent: 0, group: "corner", position: "bottom-left", special: "goToJail" },
    { id: 2, name: "BIRŽAI", type: "property", color: "brown", price: 60, rent: 6, group: "brown", position: "top" },
    { id: 3, name: "Automobilių servisas", type: "service", color: null, price: 200, rent: 50, group: "service", position: "top", special: "service" },
    { id: 4, name: "VILKAVIŠKIS", type: "property", color: "brown", price: 70, rent: 7, group: "brown", position: "top" },
    { id: 5, name: "Mokestis", type: "tax", color: null, price: 0, rent: 200, group: "tax", position: "top", special: "tax" },
    { id: 6, name: "Oro uostas", type: "airport", color: null, price: 200, rent: 50, group: "airport", position: "top", special: "airport" },
    { id: 7, name: "KURŠĖNAI", type: "property", color: "lightblue", price: 80, rent: 8, group: "lightblue", position: "top" },
    { id: 8, name: "ROKIŠKIS", type: "property", color: "lightblue", price: 90, rent: 9, group: "lightblue", position: "top" },
    { id: 9, name: "Šansas", type: "chance", color: null, price: 0, rent: 0, group: "chance", position: "top", special: "chance" },
    { id: 10, name: "JURBARKAS", type: "property", color: "lightblue", price: 100, rent: 10, group: "lightblue", position: "top" },
    { id: 11, name: "ELEKTRĖNAI", type: "property", color: "orange", price: 100, rent: 10, group: "orange", position: "top" },
    { id: 12, name: "DRUSKININKAI", type: "property", color: "orange", price: 110, rent: 11, group: "orange", position: "top" },
    { id: 13, name: "Velnio tuzinas", type: "special", color: null, price: 0, rent: 0, group: "special", position: "top", special: "devil" },
    { id: 14, name: "RADVILIŠKIS", type: "property", color: "orange", price: 120, rent: 12, group: "orange", position: "top" },
    { id: 16, name: "GARGŽDAI", type: "property", color: "bronze", price: 140, rent: 14, group: "purple", position: "right" },
    { id: 17, name: "Elektros tinklai", type: "utility", color: null, price: 200, rent: 50, group: "utility", position: "right", special: "utility" },
    { id: 18, name: "ŠILUTĖ", type: "property", color: "bronze", price: 150, rent: 15, group: "blue", position: "right" },
    { id: 19, name: "PLUNGĖ", type: "property", color: "bronze", price: 160, rent: 16, group: "chance", position: "right" },
    { id: 20, name: "Latro baras", type: "free", color: null, price: 0, rent: 0, group: "free", position: "right", special: "free" },
    { id: 21, name: "KRETINGA", type: "property", color: "red", price: 180, rent: 19, group: "red", position: "right" },
    { id: 22, name: "Oro uostas", type: "airport", color: null, price: 200, rent: 50, group: "airport", position: "right", special: "airport" },
    { id: 23, name: "PALANGA", type: "property", color: "red", price: 190, rent: 19, group: "red", position: "right" },
    { id: 24, name: "VISAGINAS", type: "property", color: "red", price: 200, rent: 20, group: "red", position: "right" },
    { id: 26, name: "TAURAGĖ", type: "property", color: "yellow", price: 220, rent: 22, group: "yellow", position: "bottom" },
    { id: 27, name: "Vanduo", type: "utility", color: null, price: 200, rent: 50, group: "utility", position: "bottom", special: "utility" },
    { id: 28, name: "TELŠIAI", type: "property", color: "yellow", price: 230, rent: 23, group: "purple", position: "bottom" },
    { id: 29, name: "UKMERGĖ", type: "property", color: "yellow", price: 240, rent: 24, group: "chance", position: "bottom" },
    { id: 30, name: "Servisas", type: "service", color: null, price: 200, rent: 50, group: "service", position: "bottom", special: "service" },
    { id: 31, name: "KĖDAINIAI", type: "property", color: "butelka", price: 250, rent: 25, group: "butelka", position: "bottom" },
    { id: 32, name: "UTENA", type: "property", color: "butelka", price: 260, rent: 26, group: "butelka", position: "bottom" },
    { id: 33, name: "Ligoninė", type: "hospital", color: null, price: 0, rent: 25, group: "hospital", position: "bottom", special: "hospital" },
    { id: 34, name: "JONAVA", type: "property", color: "butelka", price: 270, rent: 27, group: "butelka", position: "bottom" },
    { id: 35, name: "Oro uostas", type: "airport", color: null, price: 200, rent: 50, group: "airport", position: "bottom", special: "airport" },
    { id: 36, name: "MAŽEIKIAI", type: "property", color: "purple", price: 280, rent: 28, group: "purple", position: "bottom" },
    { id: 37, name: "Šansas", type: "chance", color: null, price: 0, rent: 0, group: "chance", position: "bottom", special: "chance" },
    { id: 38, name: "MARIJAMPOLĖ", type: "property", color: "purple", price: 300, rent: 30, group: "purple", position: "bottom" },
    { id: 40, name: "ALYTUS", type: "property", color: "lime", price: 320, rent: 32, group: "darkgreen", position: "left" },
    { id: 41, name: "Radote lobį", type: "special", color: null, price: 0, rent: 0, group: "special", position: "left", special: "treasure" },
    { id: 42, name: "PANEVĖŽYS", type: "property", color: "lime", price: 330, rent: 33, group: "darkgreen", position: "left" },
    { id: 43, name: "ŠIAULIAI", type: "property", color: "lime", price: 340, rent: 34, group: "darkgreen", position: "left" },
    { id: 44, name: "Poilsiavietė", type: "property", color: null, price: 100, rent: 25, group: "vacation", position: "left", special: "vacation" },
    { id: 45, name: "KLAIPĖDA", type: "property", color: "brightblue", price: 350, rent: 35, group: "brightblue", position: "left" },
    { id: 46, name: "KAUNAS", type: "property", color: "brightblue", price: 375, rent: 38, group: "brightblue", position: "left" },
    { id: 47, name: "Tavo gimtadienis", type: "special", color: null, price: 0, rent: 0, group: "special", position: "left", special: "birthday" },
    { id: 48, name: "VILNIUS", type: "property", color: "brightblue", price: 400, rent: 40, group: "brightblue", position: "left" }
];

const chanceCards = [
    { text: "Eik į START ir gauk 300€ (nes sustojai)", type: "move", value: 1, money: 300 },
    { text: "Eik į KALĖJIMĄ. Nepereik START", type: "move", value: 15, money: 0 },
    { text: "Banko klaida tavo naudai – gauk 150€", type: "money", value: 150, money: 150 },
    { text: "Sumokėk 100€ už gatvių remontą", type: "money", value: -100, money: -100 },
    { text: "Eik 3 žingsnius atgal", type: "move", value: -3, money: 0 },
    { text: "Gauk 50€ už antros vietos konkurse", type: "money", value: 50, money: 50 },
    { text: "Eik į artimiausią servisą (id 3 arba 30)", type: "moveToNearest", targetType: "service", money: 0 },
    { text: "Išlošei loterijoje – gauk 100€", type: "money", value: 100, money: 100 },
    { text: "Sumokėk 150€ mokesčių", type: "money", value: -150, money: -150 },
    { text: "Pereik START – gauk 200€", type: "move", value: 0, money: 200 },
    { text: "Eik į PARKINGA (id 25)", type: "moveTo", targetId: 25, money: 0 },
    { text: "Gydytojo sąskaita – sumokėk 80€", type: "money", value: -80, money: -80 },
    { text: "Gauk 25€ konsultacijos mokestį", type: "money", value: 25, money: 25 },
    { text: "Eik 5 žingsnius pirmyn", type: "move", value: 5, money: 0 },
    { text: "Eik į artimiausią oro uostą", type: "moveToNearest", targetType: "airport", money: 0 },
    { text: "Parduok senus daiktus – gauk 70€", type: "money", value: 70, money: 70 },
    { text: "Sumokėk 50€ už elektrą", type: "money", value: -50, money: -50 },
    { text: "Gauk 200€ iš banko", type: "money", value: 200, money: 200 },
    { text: "Eik į artimiausią komunalinį (elektra/vanduo)", type: "moveToNearest", targetType: "utility", money: 0 },
    { text: "Tavo draugas grąžina skolą – gauk 120€", type: "money", value: 120, money: 120 }
];

const communityCards = [
    { text: "Gauk 200€ dividendų", type: "money", value: 200, money: 200 },
    { text: "Sumokėk 50€ ligoninės išlaidų", type: "money", value: -50, money: -50 },
    { text: "Išlošei grožio konkurse – gauk 100€", type: "money", value: 100, money: 100 },
    { text: "Paveldėjai 150€", type: "money", value: 150, money: 150 },
    { text: "Sumokėk 30€ už mokyklą", type: "money", value: -30, money: -30 },
    { text: "Gauk 20€ iš draudimo", type: "money", value: 20, money: 20 },
    { text: "Eik į START ir gauk 300€", type: "move", value: 1, money: 300 },
    { text: "Banko klaida – sumokėk 100€", type: "money", value: -100, money: -100 },
    { text: "Gauk 50€ už pagalbą kaimynams", type: "money", value: 50, money: 50 },
    { text: "Eik į KALĖJIMĄ", type: "move", value: 15, money: 0 },
    { text: "Gauk 10€ iš pardavimo", type: "money", value: 10, money: 10 },
    { text: "Sumokėk 200€ mokesčių", type: "money", value: -200, money: -200 },
    { text: "Gauk 75€ už gerą elgesį", type: "money", value: 75, money: 75 },
    { text: "Eik 2 žingsnius pirmyn", type: "move", value: 2, money: 0 },
    { text: "Gauk 40€ iš investicijų", type: "money", value: 40, money: 40 },
    { text: "Sumokėk 25€ už remontą", type: "money", value: -25, money: -25 },
    { text: "Gauk 300€ iš valstybės", type: "money", value: 300, money: 300 },
    { text: "Eik į PARKINGA (id 25)", type: "moveTo", targetId: 25, money: 0 },
    { text: "Pereik START – gauk 200€", type: "move", value: 0, money: 200 },
    { text: "Gauk 15€ už šiukšlių rinkimą", type: "money", value: 15, money: 15 }
];

function getCellById(id) {
    return monopolyData.find(cell => cell.id === id);
}

function getCellsByGroup(group) {
    return monopolyData.filter(cell => cell.group === group);
}

function getCellsBySpecialType(specialType) {
    return monopolyData.filter(cell => cell.special === specialType);
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { monopolyData, getCellById, getCellsByGroup, getCellsBySpecialType, chanceCards, communityCards };
}