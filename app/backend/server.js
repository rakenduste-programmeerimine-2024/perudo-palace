const { Server } = require("socket.io");

const io = new Server(3030, {
  cors: {
    origin: ["http://localhost:3000"],
  },
});

let rooms = {};

io.on("connection", (socket) => {
  console.log("serveriga ühendatud: " + socket.id);

  //   socket.on("test-event", (number, string, obj) => {
  //    console.log(number, string, obj)
  //   })

  socket.on("create-room", (roomCode, hostName) => {
    if (rooms[roomCode]) {
      socket.emit("room-error", "Room with that code already exists.");
    } else {
      rooms[roomCode] = { host: hostName, players: [hostName] };
      socket.join(roomCode);
      socket.emit("room-created", roomCode);
    }
  });

  socket.on("join-room", (roomCode, playerName) => {
    if (rooms[roomCode]) {
      rooms[roomCode].players.push(playerName);
      socket.join(roomCode);
      io.to(roomCode).emit("current-players", rooms[roomCode].players);
      io.to(roomCode).emit("player-joined", playerName);
    } else {
      socket.emit("room-error", "Room does not exist.");
    }
  });

  socket.on("leave-room", (roomCode, playerName) => {
    console.log("user " + playerName + " left");
    if (rooms[roomCode]) {
      // Kustutab playeri ruumi listist
      rooms[roomCode].players = rooms[roomCode].players.filter(
        (player) => player !== playerName
      );

      io.to(roomCode).emit("player-left", playerName);
      io.to(roomCode).emit("current-players", rooms[roomCode].players);

      // Kui ruum on tühi, kustuta
      if (rooms[roomCode].players.length === 0) {
        delete rooms[roomCode];
        console.log("room " + roomCode + " deleted");
      }
    }
  });
});
