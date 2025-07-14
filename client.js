const socket = io('https://epicord.onrender.com'); // <-- PASTE YOUR RENDER URL HERE

const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');
const epinukeButton = document.getElementById('epinuke-button');
const explosionDiv = document.getElementById('explosion');

// Prompt for username
let username = '';
while (!username.trim()) {
    username = prompt("Please enter your username:");
    if (username === null) { // Handle cancel button
        username = `Guest${Math.floor(Math.random() * 1000)}`;
    }
}
socket.emit('new user', username);

// --- Chat Logic ---

form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (input.value) {
        socket.emit('chat message', input.value);
        input.value = '';
    }
});

function addChatMessage(user, msg) {
    const item = document.createElement('li');
    const userSpan = document.createElement('span');
    userSpan.className = 'username';
    userSpan.textContent = user;
    const msgSpan = document.createElement('span');
    msgSpan.className = 'message-body';
    msgSpan.textContent = msg;
    item.appendChild(userSpan);
    item.appendChild(msgSpan);
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
}

function addNotification(msg) {
    const item = document.createElement('li');
    item.className = 'notification';
    item.textContent = msg;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
}

socket.on('chat message', (data) => {
    addChatMessage(data.user, data.msg);
});

socket.on('user connected', (msg) => {
    addNotification(msg);
});

socket.on('user disconnected', (msg) => {
    addNotification(msg);
});

// --- Epinuke Feature Logic ---

const EPINUKE_COOLDOWN = 300000; // 5 minutes in milliseconds
let timeRemaining = EPINUKE_COOLDOWN / 1000;
let countdownInterval;

function startCooldown() {
    epinukeButton.disabled = true;
    timeRemaining = EPINUKE_COOLDOWN / 1000;
    updateButtonText();

    countdownInterval = setInterval(() => {
        timeRemaining--;
        updateButtonText();
        if (timeRemaining <= 0) {
            clearInterval(countdownInterval);
            epinukeButton.disabled = false;
            epinukeButton.textContent = '🔥 EPINUKE! 🔥';
        }
    }, 1000);
}

function updateButtonText() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    epinukeButton.textContent = `Epinuke Ready in ${minutes}:${seconds.toString().padStart(2, '0')}`;
}

epinukeButton.addEventListener('click', () => {
    if (!epinukeButton.disabled) {
        // 1. Trigger explosion animation
        explosionDiv.classList.add('nuke');
        
        // 2. Remove last 5 messages
        const allMessages = messages.querySelectorAll('li');
        const messageCount = allMessages.length;
        const start = Math.max(0, messageCount - 5);
        for (let i = start; i < messageCount; i++) {
            allMessages[i].remove();
        }
        
        // 3. Reset cooldown
        startCooldown();

        // 4. Remove animation class after it finishes
        setTimeout(() => {
            explosionDiv.classList.remove('nuke');
        }, 500);
    }
});

// Initial start of the cooldown
startCooldown();
