const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: { origin: "*" }
});

let users = {}; // Рақам : socket.id

io.on('connection', (socket) => {
  console.log('Пайвастшавии нав: ' + socket.id);

  // Сабти номи корбар
  socket.on('register', (phone) => {
    socket.phone = phone;
    users[phone] = socket.id;
    console.log(`Корбар ${phone} онлайн шуд`);
  });

  // Фиристодани паёми матнӣ ё голос
  socket.on('message', (data) => {
    const targetSocket = users[data.toPhone];
    if (targetSocket) {
      io.to(targetSocket).emit('message', {
        fromPhone: socket.phone,
        data: data.data,
        type: data.type || 'text' // метавонад 'text' ё 'voice' бошад
      });
    }
  });

  // Мантиқи зангҳо (WebRTC Signaling)
  socket.on('call-request', (data) => {
    const targetSocket = users[data.toPhone];
    if (targetSocket) {
      io.to(targetSocket).emit('incoming-call', {
        fromPhone: socket.phone,
        type: data.type // 'audio' ё 'video'
      });
    }
  });

  socket.on('disconnect', () => {
    for (let phone in users) {
      if (users[phone] === socket.id) {
        delete users[phone];
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log('Сервер дар порти ' + PORT + ' кор мекунад');
});
