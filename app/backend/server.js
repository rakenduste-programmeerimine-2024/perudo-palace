import { handleGameStart,handleTurns ,handlePlayerDeath,handleDiceCheck, handleDiceBidSubmit, handleDiceRolls, checkGameOver,handlePlayerDeath} from './gameLogicScript.js';
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
      //Teeb kõik vajalikud muutjad mängu ja lobby jaoks
      rooms[roomCode] = { 
         host: hostName, 
         players: [hostName], 
         turns: null, 
         dice: null, 
         lives: null, 
         activeBid: {diceValue: 1, diceAmount: 1, playerIndex: 0 }};
      socket.join(roomCode);
      socket.emit("room-created", roomCode);
      console.log("Players in room when creating:", rooms[roomCode].players);
    }
  });

  socket.on("join-room", (roomCode, playerName) => {
    if (rooms[roomCode]) {
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

  socket.on("pass-turn", (roomCode, diceAmount, dotAmount) =>
    PassTurn(roomCode, diceAmount, dotAmount)
  );
  socket.on("challange", (roomCode) => handleDiceCheck(roomCode));
  socket.on("placed-bid", ({ roomCode, diceAmount, diceValue }) => {
   handleDiceBidSubmit(roomCode, diceAmount, diceValue);
});
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


