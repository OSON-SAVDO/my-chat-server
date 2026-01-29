const io = require("socket.io")(process.env.PORT || 3000, {
  cors: { origin: "*" }
});

let users = {};

io.on("connection", (socket) => {
  console.log("Корбар пайваст шуд: " + socket.id);

  // Бақайдгирии рақами телефон
  socket.on("register", (phone) => {
    users[phone] = socket.id;
    console.log(`Рақами ${phone} бо ID ${socket.id} сабт шуд`);
  });

  // Фиристодани паёмҳо (матн, овоз, акс)
  socket.on("message", (data) => {
    const targetSocket = users[data.toPhone];
    if (targetSocket) {
      io.to(targetSocket).emit("message", {
        fromPhone: Object.keys(users).find(key => users[key] === socket.id),
        data: data.data,
        type: data.type
      });
    }
  });

  // --- СИГНАЛҲО БАРОИ ЗАНГ (WebRTC) ---

  // 1. Дархости занг
  socket.on("call-request", (data) => {
    const targetSocket = users[data.toPhone];
    if (targetSocket) {
      io.to(targetSocket).emit("incoming-call", {
        fromPhone: data.fromPhone,
        signal: data.signal,
        type: data.type
      });
    }
  });

  // 2. Ҷавоб ба занг
  socket.on("call-answer", (data) => {
    const targetSocket = users[data.toPhone];
    if (targetSocket) {
      io.to(targetSocket).emit("call-answered", {
        signal: data.signal
      });
    }
  });

  // 3. Анҷоми занг
  socket.on("end-call", (data) => {
    const targetSocket = users[data.toPhone];
    if (targetSocket) {
      io.to(targetSocket).emit("call-ended");
    }
  });

  socket.on("disconnect", () => {
    for (let phone in users) {
      if (users[phone] === socket.id) {
        delete users[phone];
        break;
      }
    }
    console.log("Корбар ҷудо шуд");
  });
});
