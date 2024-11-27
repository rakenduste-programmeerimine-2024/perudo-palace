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
      rooms[roomCode] = {
        host: hostName,
        players: [hostName],
        positions: {
          position1: null,
          position2: null,
          position3: null,
          position4: null,
        },
      };
      socket.join(roomCode);
      socket.emit("room-created", roomCode);
      console.log("Players in room when creating:", rooms[roomCode].players);
    }
  });

  socket.on("join-room", (roomCode, playerName) => {
    if (rooms[roomCode] == true && rooms[roomCode].players.length == 4) {
      socket.emit("room-error", "Room player limit reached (4).");
    } else if (rooms[roomCode]) {
      rooms[roomCode].players.push(playerName);
      socket.join(roomCode);
      io.to(roomCode).emit("current-players", rooms[roomCode].players);
      io.to(roomCode).emit("player-joined", playerName);
      console.log("Players in room when joining:", rooms[roomCode].players);
    } else {
      socket.emit("room-error", "Room does not exist.");
    }
  });

  socket.on("update-room", (roomCode, playerName) => {
    if (rooms[roomCode]) {
      socket.join(roomCode);
      io.to(roomCode).emit("current-players", rooms[roomCode].players);
      io.to(roomCode).emit("player-joined", playerName);
      console.log("Players in room when updating:", rooms[roomCode].players);
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

      console.log("Kustutasin mängija");
      console.log("Players in room before deletion:", rooms[roomCode].players);
      console.log("Player count:", rooms[roomCode].players.length);

      // Kui ruum on tühi, kustuta
      if (rooms[roomCode].players.length == 0) {
        delete rooms[roomCode];
        console.log("room " + roomCode + " deleted");
      }
    }
  });

  socket.on("position-picked", ({ playerName, position, roomCode }) => {
    const room = rooms[roomCode];

    if (!room) {
      socket.emit("room-error", "Room does not exist.");
      return;
    }

    const playerIndex = room.players.indexOf(playerName);

    if (playerIndex === -1) {
      socket.emit("room-error", "Player not found in room.");
      return;
    }

    const positionKey = `position${playerIndex + 1}`;

    // Check kas positsioon on võetud
    if (Object.values(room.positions).includes(position)) {
      socket.emit("position-error", "Position already taken.");
      return;
    }

    // Assign'i positsioon'id
    room.positions[positionKey] = position;

    // saada positsioonid lobby'sse
    io.to(roomCode).emit("update-positions", room.positions);
  });

  socket.on("pass-turn", (roomId, diceAmount, dotAmount) =>
    PassTurn(roomId, diceAmount, dotAmount)
  );
  socket.on("challange", (roomId) => Challange(roomId));
});

function PassTurn(roomId, diceAmount, dotAmount) {
  console.log("Trying to pass turn...");
  const selectedRoom = rooms[roomId];

  if (selectedRoom == null) {
    console.log("Failed!");
    return;
  }

  console.log("Passed turn!");

  selectedRoom.diceAmount = diceAmount;
  selectedRoom.dotAmount = dotAmount;
  selectedRoom.currentTurn =
    (selectedRoom.currentTurn + 1) % selectedRoom.players.length;

  io.to(roomId).emit("update-room", selectedRoom);
}

function Challange(roomId) {
  console.log("Trying to challange...");

  const room = rooms[roomId];
  if (room == null) {
    console.log("Failed!");
    return;
  }

  console.log("Challanged! Room: " + roomId);

  const loser = CheckBet();

  if (loser) {
    loser.health -= 1;
    if (loser.health <= 0) {
      room.players = room.players.filter((player) => player.health > 0);
    }
  }

  room.currentTurn = (room.currentTurn + 1) % room.players.length;

  io.to(roomId).emit("updateRoom", room);
}
