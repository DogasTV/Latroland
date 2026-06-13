// ==================== CHATO SISTEMA ====================

let chatMessages = [];
let isDraggingChat = false;
let chatDragStartX = 0, chatDragStartY = 0;
let chatStartLeft = 0, chatStartTop = 0;
let chatDragModeActive = false;
let isResizingChat = false;
let chatResizeStartX = 0, chatResizeStartY = 0;
let chatResizeStartWidth = 0, chatResizeStartHeight = 0;
let chatResizeStartLeft = 0, chatResizeStartTop = 0;
let chatResizeCorner = '';

const emojis = ['😊', '🎲', '🏆', '💀', '🔥', '🎉', '😂', '😭', '🍺', '🚀', '💩', '👑', '🤡', '🥇', '🤬', '💀', '👻', '🎃', '💎', '💰'];

// ========== CHATO SINCHRONIZACIJA SU FIREBASE ==========

function getLocalChatPlayer() {
    if (!window.gameId) return null;
    const savedPlayer = localStorage.getItem(`player_${window.gameId}`);
    if (savedPlayer && players && players.length > 0) {
        for (let i = 0; i < players.length; i++) {
            if (players[i] && players[i].name === savedPlayer) {
                return players[i];
            }
        }
    }
    const savedPlayerId = localStorage.getItem(`playerId_${window.gameId}`);
    if (savedPlayerId !== null && players && players[savedPlayerId]) {
        return players[parseInt(savedPlayerId)];
    }
    return players[currentPlayerIndex] || null;
}

function sendChatMessageToFirebase(message, playerName, playerFigure) {
    if (!window.gameId || !window.database) return;
    
    const chatRef = window.database.ref('games/' + window.gameId + '/chatMessages');
    const newMessage = {
        message: message,
        playerName: playerName,
        playerFigure: playerFigure,
        timestamp: Date.now(),
        playerId: getLocalPlayerId()
    };
    
    chatRef.push(newMessage);
    
    // Išvalome senas žinutes (paliekame paskutines 200)
    chatRef.limitToLast(200).once('value', (snapshot) => {
        const messages = snapshot.val();
        if (messages) {
            const keys = Object.keys(messages);
            if (keys.length > 200) {
                const keysToRemove = keys.slice(0, keys.length - 200);
                keysToRemove.forEach(key => {
                    chatRef.child(key).remove();
                });
            }
        }
    });
}

function listenForChatMessages() {
    if (!window.gameId || !window.database) return;
    
    const chatRef = window.database.ref('games/' + window.gameId + '/chatMessages');
    
    chatRef.on('child_added', (snapshot) => {
        const msg = snapshot.val();
        if (msg) {
            // Patikriname ar ne mūsų pačių žinutė (kad nesidubliuotų)
            const localPlayerId = getLocalPlayerId();
            if (localPlayerId !== -1 && msg.playerId === localPlayerId) return;
            
            addChatMessageToUI(msg.message, false, msg.playerName, msg.playerFigure);
        }
    });
}

function addChatMessageToUI(message, isSystem = false, playerName = null, playerFigure = null) {
    const chatMessagesDiv = document.getElementById('chatMessagesList');
    if (!chatMessagesDiv) return;
    
    const messageEntry = document.createElement('div');
    messageEntry.className = `chat-message ${isSystem ? 'system' : 'player'}`;
    
    if (isSystem) {
        messageEntry.innerHTML = `📢 ${message}`;
    } else {
        messageEntry.innerHTML = `<strong style="color:#ffaa00;">${playerFigure || '👤'} ${playerName || 'Žaidėjas'}:</strong> ${message}`;
    }
    
    chatMessagesDiv.appendChild(messageEntry);
    chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
    chatMessages.push({ message, isSystem, playerName, timestamp: Date.now() });
    
    while (chatMessagesDiv.children.length > 200) {
        chatMessagesDiv.removeChild(chatMessagesDiv.firstChild);
        chatMessages.shift();
    }
}

// ========== CHATO FUNKCIJOS ==========

function loadChatPosition() {
    const saved = localStorage.getItem('chatPosition');
    const chat = document.getElementById('draggableChat');
    if (saved && chat) {
        const pos = JSON.parse(saved);
        chat.style.left = pos.left + 'px';
        chat.style.top = pos.top + 'px';
        chat.style.right = 'auto';
        chat.style.bottom = 'auto';
    }
}

function saveChatPosition() {
    const chat = document.getElementById('draggableChat');
    if (chat) {
        const left = parseInt(chat.style.left);
        const top = parseInt(chat.style.top);
        if (!isNaN(left) && !isNaN(top)) {
            localStorage.setItem('chatPosition', JSON.stringify({ left, top }));
        }
    }
}

function loadChatSize() {
    const saved = localStorage.getItem('chatSize');
    const chat = document.getElementById('draggableChat');
    if (saved && chat) {
        const size = JSON.parse(saved);
        if (size.width) chat.style.width = size.width + 'px';
        if (size.height) chat.style.height = size.height + 'px';
        const chatMessagesDiv = chat.querySelector('.chat-messages-list');
        if (chatMessagesDiv && size.height) {
            chatMessagesDiv.style.height = (size.height - 100) + 'px';
        }
    }
}

function saveChatSize() {
    const chat = document.getElementById('draggableChat');
    if (chat) {
        const width = chat.offsetWidth;
        const height = chat.offsetHeight;
        localStorage.setItem('chatSize', JSON.stringify({ width, height }));
    }
}

function createChatResizeHandles() {
    const chat = document.getElementById('draggableChat');
    if (!chat) return;
    
    const oldHandles = chat.querySelectorAll('.chat-resize-handle');
    oldHandles.forEach(handle => handle.remove());
    
    const corners = ['tl', 'tr', 'bl', 'br'];
    corners.forEach(corner => {
        const handle = document.createElement('div');
        handle.className = `chat-resize-handle ${corner}`;
        handle.dataset.corner = corner;
        
        handle.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            if (!chatDragModeActive) return;
            startChatResize(e, corner);
        });
        
        chat.appendChild(handle);
    });
    
    document.querySelectorAll('.chat-resize-handle').forEach(h => {
        h.style.display = 'none';
    });
}

function startChatResize(e, corner) {
    e.preventDefault();
    const chat = document.getElementById('draggableChat');
    if (!chat) return;
    
    isResizingChat = true;
    chatResizeCorner = corner;
    chatResizeStartX = e.clientX;
    chatResizeStartY = e.clientY;
    chatResizeStartWidth = chat.offsetWidth;
    chatResizeStartHeight = chat.offsetHeight;
    chatResizeStartLeft = chat.offsetLeft;
    chatResizeStartTop = chat.offsetTop;
    document.body.style.cursor = `${corner === 'tl' || corner === 'br' ? 'nw' : 'ne'}-resize`;
    chat.style.transition = 'none';
}

function onChatResize(e) {
    if (!isResizingChat) return;
    
    const chat = document.getElementById('draggableChat');
    if (!chat) return;
    
    const dx = e.clientX - chatResizeStartX;
    const dy = e.clientY - chatResizeStartY;
    let newWidth = chatResizeStartWidth;
    let newHeight = chatResizeStartHeight;
    let newLeft = chatResizeStartLeft;
    let newTop = chatResizeStartTop;
    
    switch(chatResizeCorner) {
        case 'br':
            newWidth = Math.max(250, chatResizeStartWidth + dx);
            newHeight = Math.max(200, chatResizeStartHeight + dy);
            break;
        case 'bl':
            newWidth = Math.max(250, chatResizeStartWidth - dx);
            newHeight = Math.max(200, chatResizeStartHeight + dy);
            newLeft = chatResizeStartLeft + (chatResizeStartWidth - newWidth);
            break;
        case 'tr':
            newWidth = Math.max(250, chatResizeStartWidth + dx);
            newHeight = Math.max(200, chatResizeStartHeight - dy);
            newTop = chatResizeStartTop + (chatResizeStartHeight - newHeight);
            break;
        case 'tl':
            newWidth = Math.max(250, chatResizeStartWidth - dx);
            newHeight = Math.max(200, chatResizeStartHeight - dy);
            newLeft = chatResizeStartLeft + (chatResizeStartWidth - newWidth);
            newTop = chatResizeStartTop + (chatResizeStartHeight - newHeight);
            break;
    }
    
    chat.style.width = newWidth + 'px';
    chat.style.height = newHeight + 'px';
    chat.style.left = newLeft + 'px';
    chat.style.top = newTop + 'px';
    
    const chatMessagesDiv = chat.querySelector('.chat-messages-list');
    if (chatMessagesDiv) {
        chatMessagesDiv.style.height = (newHeight - 100) + 'px';
    }
}

function stopChatResize() {
    if (isResizingChat) {
        isResizingChat = false;
        const chat = document.getElementById('draggableChat');
        if (chat) {
            chat.style.transition = '';
            saveChatSize();
        }
        document.body.style.cursor = '';
    }
}

function initChatDrag() {
    const chat = document.getElementById('draggableChat');
    const dragBtn = document.getElementById('chatDragBtn');
    const header = document.getElementById('chatHeader');
    
    if (!chat || !dragBtn) return;
    
    dragBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        chatDragModeActive = !chatDragModeActive;
        if (chatDragModeActive) {
            dragBtn.style.background = '#ffd700';
            dragBtn.style.color = '#8b0000';
            header.style.cursor = 'grab';
            document.querySelectorAll('.chat-resize-handle').forEach(h => {
                h.style.display = 'block';
            });
        } else {
            dragBtn.style.background = '#2e7d32';
            dragBtn.style.color = '#ffd700';
            header.style.cursor = 'default';
            document.querySelectorAll('.chat-resize-handle').forEach(h => {
                h.style.display = 'none';
            });
        }
    });
    
    const startDrag = (e) => {
        if (!chatDragModeActive) return;
        if (e.target === dragBtn || dragBtn.contains(e.target)) return;
        if (e.target.classList && e.target.classList.contains('chat-resize-handle')) return;
        e.preventDefault();
        isDraggingChat = true;
        chat.classList.add('dragging');
        chatDragStartX = e.clientX;
        chatDragStartY = e.clientY;
        chatStartLeft = parseInt(chat.style.left) || (window.innerWidth - chat.offsetWidth - 30);
        chatStartTop = parseInt(chat.style.top) || 400;
        document.body.style.cursor = 'grabbing';
    };
    
    const onDrag = (e) => {
        if (!isDraggingChat) return;
        const dx = e.clientX - chatDragStartX;
        const dy = e.clientY - chatDragStartY;
        let newLeft = chatStartLeft + dx;
        let newTop = chatStartTop + dy;
        newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - chat.offsetWidth));
        newTop = Math.max(0, Math.min(newTop, window.innerHeight - chat.offsetHeight));
        chat.style.left = newLeft + 'px';
        chat.style.top = newTop + 'px';
        chat.style.right = 'auto';
        chat.style.bottom = 'auto';
    };
    
    const stopDrag = () => {
        if (isDraggingChat) {
            isDraggingChat = false;
            chat.classList.remove('dragging');
            document.body.style.cursor = '';
            saveChatPosition();
        }
    };
    
    header.addEventListener('mousedown', startDrag);
    window.addEventListener('mousemove', onDrag);
    window.addEventListener('mouseup', stopDrag);
    
    window.addEventListener('mousemove', onChatResize);
    window.addEventListener('mouseup', stopChatResize);
}

// ========== PATAISYTA: SIUNČIA SAVO ŽAIDĖJO VARDU ==========
function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    if (message === '') return;
    
    const localPlayer = getLocalChatPlayer();
    if (!localPlayer) {
        showToast('Klaida: nepavyko nustatyti žaidėjo', 'error');
        return;
    }
    
    // Pridedame žinutę į UI
    addChatMessageToUI(message, false, localPlayer.name, localPlayer.figure);
    
    // Siunčiame į Firebase
    sendChatMessageToFirebase(message, localPlayer.name, localPlayer.figure);
    
    input.value = '';
}

function addEmojiToChat(emoji) {
    const input = document.getElementById('chatInput');
    input.value += emoji;
    input.focus();
}

function clearChat() {
    const chatMessagesDiv = document.getElementById('chatMessagesList');
    if (chatMessagesDiv) {
        chatMessagesDiv.innerHTML = '<div class="chat-message system">💬 Pokalbio pradžia!</div>';
        chatMessages = [];
    }
}

function initChat() {
    loadChatPosition();
    loadChatSize();
    createChatResizeHandles();
    initChatDrag();
    
    const sendBtn = document.getElementById('chatSendBtn');
    const chatInput = document.getElementById('chatInput');
    const clearBtn = document.getElementById('chatClearBtn');
    
    if (sendBtn) sendBtn.addEventListener('click', sendChatMessage);
    if (clearBtn) clearBtn.addEventListener('click', clearChat);
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendChatMessage();
        });
    }
    
    const emojiContainer = document.getElementById('chatEmojis');
    if (emojiContainer) {
        emojis.forEach(emoji => {
            const btn = document.createElement('button');
            btn.className = 'chat-emoji-btn';
            btn.innerHTML = emoji;
            btn.addEventListener('click', () => addEmojiToChat(emoji));
            emojiContainer.appendChild(btn);
        });
    }
    
    addChatMessageToUI('Pokalbio pradžia! Visi žaidėjai gali bendrauti.', true);
    
    // Paleidžiame klausymąsi Firebase
    setTimeout(() => {
        listenForChatMessages();
    }, 1000);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChat);
} else {
    initChat();
}