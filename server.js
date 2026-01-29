const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: { origin: "*" } 
});

io.on('connection', (socket) => {
    console.log('Корбар пайваст шуд:', socket.id);

    // Интиқоли сигналҳои WebRTC (занг)
    socket.on('signal', (data) => {
        socket.broadcast.emit('signal', data);
    });

    // Интиқоли паёмҳо (матн ва овоз)
    socket.on('message', (msg) => {
        io.emit('message', msg);
    });

    socket.on('disconnect', () => {
        console.log('Корбар ҷудо шуд');
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Сервер дар портали ${PORT} кор мекунад`);
});
