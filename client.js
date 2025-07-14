const socket = io(); // Connect to the server (Remember to update this URL if hosting on Render)

// --- DOM Elements ---
const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');
const epinukeButton = document.getElementById('epinuke-button');
const explosionDiv = document.getElementById('explosion');
const body = document.body;

// --- User Setup ---
let username = '';
while (!username || !username.trim()) {
    username = prompt("Please enter your username:");
    if (username === null) { // Handle clicking 'cancel' on the prompt
        username = `Guest${Math.floor(Math.random() * 1000)}`;
    }
}
socket.emit('new user', username);

// --- Chat Functions ---
function addChatMessage(user, msg) {
    const item = document.createElement('li');
    item.className = 'message'; // For styling and animation

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
    item.className = 'notification'; // For styling and animation
    item.textContent = msg;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
}

// --- Socket.IO Event Listeners ---
form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (input.value) {
        socket.emit('chat message', input.value);
        input.value = '';
    }
});

socket.on('chat message', (data) => {
    addChatMessage(data.user, data.msg);
});

socket.on('user connected', (msg) => {
    addNotification(`→ ${msg} ←`);
});

socket.on('user disconnected', (msg) => {
    addNotification(`← ${msg} →`);
});

// --- Epinuke Feature Logic (Cooldown Removed) ---
epinukeButton.addEventListener('click', () => {
    // 1. Trigger explosion and screen shake animations
    explosionDiv.classList.add('nuke');
    body.classList.add('shake');
    
    // 2. Remove the last 5 messages from the DOM
    const allMessages = messages.querySelectorAll('li');
    const messageCount = allMessages.length;
    const start = Math.max(0, messageCount - 5);
    
    // Create a static copy of the nodes to remove, as the live collection changes
    const nodesToRemove = Array.from(allMessages).slice(start);
    nodesToRemove.forEach(node => node.remove());
    
    // 3. Add a notification about the nuke
    addNotification(`*** ${username} triggered the Epinuke! Last 5 messages cleared. ***`);

    // 4. Remove animation classes after they finish to allow re-triggering
    setTimeout(() => {
        explosionDiv.classList.remove('nuke');
        body.classList.remove('shake');
    }, 500); // Duration should match the longest animation
});
