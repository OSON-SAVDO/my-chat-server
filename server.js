const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

let onlineUsers = {}; // { phone: socketId }
let registeredUsers = new Set(); // Рӯйхати ҳамаи рақамҳо
let offlineMessages = {}; // { phone: [messages] } - Паёмҳое, ки дар навбат ҳастанд

io.on('connection', (socket) => {
    
    socket.on('register', (phone) => {
        socket.phone = phone;
        onlineUsers[phone] = socket.id;
        registeredUsers.add(phone);
        
        console.log(`Корбар ${phone} онлайн шуд.`);

        // Агар барои ин корбар паёмҳои дар навбат истода бошад, мефиристем
        if (offlineMessages[phone] && offlineMessages[phone].length > 0) {
            offlineMessages[phone].forEach(msg => {
                io.to(socket.id).emit('message', msg);
            });
            offlineMessages[phone] = []; // Навбатро холӣ мекунем
        }
    });

    // Санҷиши рақам (ҳатто агар Offline бошад)
    socket.on('check-user', (phone, callback) => {
        callback(registeredUsers.has(phone));
    });

    socket.on('message', (data) => {
        const targetSocket = onlineUsers[data.toPhone];
        const msgPayload = { data: data.data, fromPhone: socket.phone };

        if (targetSocket) {
            // Агар дӯст онлайн бошад - дарҳол мефиристем
            io.to(targetSocket).emit('message', msgPayload);
        } else {
            // Агар дӯст офлайн бошад - дар сервер захира мекунем
            if (!offlineMessages[data.toPhone]) offlineMessages[data.toPhone] = [];
            offlineMessages[data.toPhone].push(msgPayload);
            console.log(`Паём барои ${data.toPhone} дар сервер ҳифз шуд (Offline).`);
        }
    });

    socket.on('disconnect', () => {
        if (socket.phone) delete onlineUsers[socket.phone];
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log(`Сервер дар порти ${PORT} фаъол аст`));
