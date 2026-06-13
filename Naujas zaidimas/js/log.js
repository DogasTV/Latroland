// ==================== VEIKSMŲ ŽURNALAS ====================

let isDraggingLog = false;
let logDragStartX = 0;
let logDragStartY = 0;
let logStartLeft = 0;
let logStartTop = 0;
let dragModeActive = false;

let isResizing = false;
let resizeStartX = 0;
let resizeStartY = 0;
let resizeStartWidth = 0;
let resizeStartHeight = 0;
let resizeStartLeft = 0;
let resizeStartTop = 0;
let resizeCorner = '';

function loadLogPosition() {
    const saved = localStorage.getItem('logPosition');
    const log = document.getElementById('draggableLog');
    if (saved && log) {
        const pos = JSON.parse(saved);
        log.style.left = pos.left + 'px';
        log.style.top = pos.top + 'px';
        log.style.right = 'auto';
        log.style.bottom = 'auto';
    }
}

function saveLogPosition() {
    const log = document.getElementById('draggableLog');
    if (log) {
        const left = parseInt(log.style.left);
        const top = parseInt(log.style.top);
        if (!isNaN(left) && !isNaN(top)) {
            localStorage.setItem('logPosition', JSON.stringify({ left, top }));
        }
    }
}

function loadLogSize() {
    const saved = localStorage.getItem('logSize');
    const log = document.getElementById('draggableLog');
    if (saved && log) {
        const size = JSON.parse(saved);
        if (size.width) log.style.width = size.width + 'px';
        if (size.height) log.style.height = size.height + 'px';
        const logList = log.querySelector('.log-list');
        if (logList && size.height) {
            logList.style.height = (size.height - 45) + 'px';
        }
    }
}

function saveLogSize() {
    const log = document.getElementById('draggableLog');
    if (log) {
        const width = log.offsetWidth;
        const height = log.offsetHeight;
        localStorage.setItem('logSize', JSON.stringify({ width, height }));
    }
}

function createResizeHandles() {
    const log = document.getElementById('draggableLog');
    if (!log) return;
    
    const oldHandles = log.querySelectorAll('.log-resize-handle');
    oldHandles.forEach(handle => handle.remove());
    
    const corners = ['tl', 'tr', 'bl', 'br'];
    corners.forEach(corner => {
        const handle = document.createElement('div');
        handle.className = `log-resize-handle ${corner}`;
        handle.dataset.corner = corner;
        
        handle.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            if (!dragModeActive) return;
            startResize(e, corner);
        });
        
        log.appendChild(handle);
    });
    
    document.querySelectorAll('.log-resize-handle').forEach(h => {
        h.style.display = 'none';
    });
}

function startResize(e, corner) {
    e.preventDefault();
    const log = document.getElementById('draggableLog');
    if (!log) return;
    
    isResizing = true;
    resizeCorner = corner;
    resizeStartX = e.clientX;
    resizeStartY = e.clientY;
    resizeStartWidth = log.offsetWidth;
    resizeStartHeight = log.offsetHeight;
    resizeStartLeft = log.offsetLeft;
    resizeStartTop = log.offsetTop;
    document.body.style.cursor = `${corner === 'tl' || corner === 'br' ? 'nw' : 'ne'}-resize`;
    log.style.transition = 'none';
}

function onResize(e) {
    if (!isResizing) return;
    
    const log = document.getElementById('draggableLog');
    if (!log) return;
    
    const dx = e.clientX - resizeStartX;
    const dy = e.clientY - resizeStartY;
    let newWidth = resizeStartWidth;
    let newHeight = resizeStartHeight;
    let newLeft = resizeStartLeft;
    let newTop = resizeStartTop;
    
    switch(resizeCorner) {
        case 'br':
            newWidth = Math.max(250, resizeStartWidth + dx);
            newHeight = Math.max(200, resizeStartHeight + dy);
            break;
        case 'bl':
            newWidth = Math.max(250, resizeStartWidth - dx);
            newHeight = Math.max(200, resizeStartHeight + dy);
            newLeft = resizeStartLeft + (resizeStartWidth - newWidth);
            break;
        case 'tr':
            newWidth = Math.max(250, resizeStartWidth + dx);
            newHeight = Math.max(200, resizeStartHeight - dy);
            newTop = resizeStartTop + (resizeStartHeight - newHeight);
            break;
        case 'tl':
            newWidth = Math.max(250, resizeStartWidth - dx);
            newHeight = Math.max(200, resizeStartHeight - dy);
            newLeft = resizeStartLeft + (resizeStartWidth - newWidth);
            newTop = resizeStartTop + (resizeStartHeight - newHeight);
            break;
    }
    
    log.style.width = newWidth + 'px';
    log.style.height = newHeight + 'px';
    log.style.left = newLeft + 'px';
    log.style.top = newTop + 'px';
    
    const logList = log.querySelector('.log-list');
    if (logList) {
        logList.style.height = (newHeight - 45) + 'px';
    }
}

function stopResize() {
    if (isResizing) {
        isResizing = false;
        const log = document.getElementById('draggableLog');
        if (log) {
            log.style.transition = '';
            saveLogSize();
        }
        document.body.style.cursor = '';
    }
}

function initLogDrag() {
    const log = document.getElementById('draggableLog');
    const dragBtn = document.getElementById('logDragBtn');
    const header = document.getElementById('logHeader');
    
    if (!log || !dragBtn) return;
    
    dragBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dragModeActive = !dragModeActive;
        if (dragModeActive) {
            dragBtn.style.background = '#ffd700';
            dragBtn.style.color = '#8b0000';
            header.style.cursor = 'grab';
            document.querySelectorAll('.log-resize-handle').forEach(h => {
                h.style.display = 'block';
            });
        } else {
            dragBtn.style.background = '#2e7d32';
            dragBtn.style.color = '#ffd700';
            header.style.cursor = 'default';
            document.querySelectorAll('.log-resize-handle').forEach(h => {
                h.style.display = 'none';
            });
        }
    });
    
    const startDrag = (e) => {
        if (!dragModeActive) return;
        if (e.target === dragBtn || dragBtn.contains(e.target)) return;
        if (e.target.classList && e.target.classList.contains('log-resize-handle')) return;
        e.preventDefault();
        isDraggingLog = true;
        log.classList.add('dragging');
        logDragStartX = e.clientX;
        logDragStartY = e.clientY;
        logStartLeft = parseInt(log.style.left) || (window.innerWidth - log.offsetWidth - 30);
        logStartTop = parseInt(log.style.top) || 150;
        document.body.style.cursor = 'grabbing';
    };
    
    const onDrag = (e) => {
        if (!isDraggingLog) return;
        const dx = e.clientX - logDragStartX;
        const dy = e.clientY - logDragStartY;
        let newLeft = logStartLeft + dx;
        let newTop = logStartTop + dy;
        newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - log.offsetWidth));
        newTop = Math.max(0, Math.min(newTop, window.innerHeight - log.offsetHeight));
        log.style.left = newLeft + 'px';
        log.style.top = newTop + 'px';
        log.style.right = 'auto';
        log.style.bottom = 'auto';
    };
    
    const stopDrag = () => {
        if (isDraggingLog) {
            isDraggingLog = false;
            log.classList.remove('dragging');
            document.body.style.cursor = '';
            saveLogPosition();
        }
    };
    
    header.addEventListener('mousedown', startDrag);
    window.addEventListener('mousemove', onDrag);
    window.addEventListener('mouseup', stopDrag);
    
    window.addEventListener('mousemove', onResize);
    window.addEventListener('mouseup', stopResize);
}

function addLog(message) {
    const logList = document.getElementById('logList');
    if (!logList) return;
    
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    logEntry.innerHTML = message;
    logList.appendChild(logEntry);
    
    logList.scrollTop = logList.scrollHeight;
    
    while (logList.children.length > 200) {
        logList.removeChild(logList.firstChild);
    }
}

function clearLog() {
    const logList = document.getElementById('logList');
    if (logList) {
        logList.innerHTML = '<div class="log-entry">📋 Žurnalas išvalytas</div>';
    }
}