const io = require("socket.io")(process.env.PORT || 3000, {
    cors: {
        origin: "*", // Иҷозат ба ҳамаи доменҳо (Netlify, Vercel ва ғайра)
        methods: ["GET", "POST"]
    }
});

// Рӯйхати корбарони онлайн
let users = {};

io.on("connection", (socket) => {
    console.log("Корбари нав пайваст шуд: " + socket.id);

    // 1. Бақайдгирии корбар бо рақами телефон
    socket.on("register", (phone) => {
        users[phone] = socket.id;
        socket.phone = phone; // Рақамро дар дохили сокет захира мекунем
        console.log(`Корбар сабт шуд: ${phone} (ID: ${socket.id})`);
    });

    // 2. Интиқоли паёмҳо (Матн, Акс, Видео, Овоз)
    socket.on("message", (data) => {
        const targetSocketId = users[data.toPhone];
        if (targetSocketId) {
            io.to(targetSocketId).emit("message", {
                fromPhone: data.fromPhone,
                data: data.data,
                type: data.type
            });
        }
    });

    // 3. ЗАНГИ ВИДЕОӢ ВА АУДИОӢ (WebRTC Signaling)
    
    // Дархости занг (Offer)
    socket.on("call-request", (data) => {
        const targetSocketId = users[data.toPhone];
        if (targetSocketId) {
            console.log(`Занг аз ${data.fromPhone} ба ${data.toPhone}`);
            io.to(targetSocketId).emit("incoming-call", {
                fromPhone: data.fromPhone,
                signal: data.signal,
                type: data.type
            });
        }
    });

    // Ҷавоби занг (Answer)
    socket.on("call-answer", (data) => {
        const targetSocketId = users[data.toPhone];
        if (targetSocketId) {
            io.to(targetSocketId).emit("call-answered", {
                signal: data.signal
            });
        }
    });

    // Қатъи занг
    socket.on("end-call", (data) => {
        const targetSocketId = users[data.toPhone];
        if (targetSocketId) {
            io.to(targetSocketId).emit("call-ended");
        }
    });

    // 4. Вақте корбар аз шабака мебарояд
    socket.on("disconnect", () => {
        if (socket.phone) {
            delete users[socket.phone];
            console.log(`Корбар ҷудо шуд: ${socket.phone}`);
        }
    });
});

console.log("Сервер дар порти 3000 кор карда истодааст...");
