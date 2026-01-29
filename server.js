const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "*", // Иҷозат барои пайвастшавӣ аз ҳама ҷо
        methods: ["GET", "POST"]
    }
});

// Рӯйхати корбарон: { "рақами_телефон": "socket_id" }
let users = {};

io.on('connection', (socket) => {
    console.log('Пайвастшавии нав:', socket.id);

    // Қайд кардани рақами телефон
    socket.on('register', (phone) => {
        users[phone] = socket.id;
        socket.phone = phone; // Рақамро ба худи сокет мечаспонем
        console.log(`Корбар бо рақами ${phone} қайд шуд.`);
    });

    // Интиқоли сигналҳои WebRTC (Занг)
    socket.on('signal', (data) => {
        const targetId = users[data.toPhone];
        if (targetId) {
            io.to(targetId).emit('signal', {
                sdp: data.sdp,
                candidate: data.candidate,
                fromPhone: socket.phone
            });
        }
    });

    // Интиқоли паёмҳои чат
    socket.on('message', (data) => {
        const targetId = users[data.toPhone];
        if (targetId) {
            io.to(targetId).emit('message', {
                data: data.data,
                fromPhone: socket.phone
            });
        }
    });

    // Вақте корбар аз интернет мебарояд
    socket.on('disconnect', () => {
        if (socket.phone) {
            delete users[socket.phone];
            console.log(`Рақами ${socket.phone} аз шабака баромад.`);
        }
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Сервер дар портали ${PORT} фаъол аст.`);
});
