const socket = io();

  const form = document.getElementById('form');
  const input = document.getElementById('input');
  const messages = document.getElementById('messages');
  const usrdiv = document.getElementById('username');
const rcdiv = document.getElementById('roomcode');

const roomcode = rcdiv.getAttribute('data-roomcode');
const username = usrdiv.getAttribute('data-user');

socket.emit('join', roomcode);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value) {
      socket.emit('chat message', { username: username, message: input.value });
      input.value = '';
    }
  });

  socket.on('chat message', (data) => {
    const item = document.createElement('li');
    const message = `${data.username}: ${data.message}`;
    item.textContent = message;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
  });
