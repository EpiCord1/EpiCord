const socket = io('epicord.onrender.com'); // Connect to the server (Remember to update this URL if hosting on Render/Glitch)

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
    if (username === null) {
        username = `Guest${Math.floor(Math.random() * 1000)}`;
    }
}
socket.emit('new user', username);

// --- Chat Functions ---
function addChatMessage(user, msg) {
    const item = document.createElement('li');
    item.className = 'message';
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


// --- Epinuke Feature Logic (Networked) ---

// 1. When a user clicks the button, tell the server.
epinukeButton.addEventListener('click', () => {
    socket.emit('epinuke trigger', username);
});

// 2. When the server broadcasts the 'epinuke blast' event, EVERYONE runs this code.
socket.on('epinuke blast', (triggeringUser) => {
    // Trigger explosion and screen shake animations
    explosionDiv.classList.add('nuke');
    body.classList.add('shake');

    // Remove the last 5 messages from the local DOM
    const allMessages = messages.querySelectorAll('li');
    const messageCount = allMessages.length;
    const start = Math.max(0, messageCount - 5);
    const nodesToRemove = Array.from(allMessages).slice(start);
    nodesToRemove.forEach(node => node.remove());

    // Add a notification showing who triggered the nuke
    addNotification(`*** ${triggeringUser} triggered the Epinuke! Last 5 messages cleared. ***`);

    // Remove animation classes after they finish
    setTimeout(() => {
        explosionDiv.classList.remove('nuke');
        body.classList.remove('shake');
    }, 500); // This duration should match your CSS animation time
});
