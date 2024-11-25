import { handleGameStart,handleTurns ,handlePlayerDeath,handleDiceCheck, handleDiceBidSubmit, handleDiceRolls, checkGameOver,handlePlayerDeath} from './gameLogicScript.js';
const { Server } = require("socket.io");

const io = new Server(3030, {
  cors: {
    origin: ["http://localhost:3000"],
  },
});

export let rooms = {};

io.on("connection", (socket) => {
  console.log("serveriga ühendatud: " + socket.id);

  //   socket.on("test-event", (number, string, obj) => {
  //    console.log(number, string, obj)
  //   })

  // RUUMI LOOMINE
  socket.on("create-room", (roomCode, hostName) => {
    if (rooms[roomCode]) {
      socket.emit("room-error", "Room with that code already exists.");
      return;
    }
    
    // mangija info
    let userData = {
      userName: any,
      socketId: any
    };

    //Teeb kõik vajalikud muutjad mängu ja lobby jaoks
    rooms[roomCode] = { 
      host: hostName, 
      players: [userData(hostName, hostName.id)],
      //players: [hostName], 
      turns: null, 
      dice: null, 
      lives: null, 
      activeBid: {diceValue: 1, diceAmount: 1, playerIndex: 0 }
    };

    socket.join(roomCode);
    socket.emit("room-created", roomCode);

    console.log("Players in room when creating:", rooms[roomCode].players);
  });

   //Listenerid mängu loogika jaoks paigas
  socket.on("join-room", (roomCode, playerName) => {
    if (!rooms[roomCode]) {
      socket.emit("room-error", "Room does not exist.");
      return;
    }
    
    rooms[roomCode].players.push(playerName, playerName.id);
    socket.join(roomCode);
    io.to(roomCode).emit("current-players", rooms[roomCode].players);
    io.to(roomCode).emit("player-joined", playerName);

    console.log("Players in room when joining:", rooms[roomCode].players);
   });

  socket.on("update-room", (roomCode, playerName) => {
    if (!rooms[roomCode]) {
      socket.emit("room-error", "Room does not exist.");
      return;
    }
    
    socket.join(roomCode);
    io.to(roomCode).emit("current-players", rooms[roomCode].players);
    io.to(roomCode).emit("player-joined", playerName);

    console.log("Players in room when updating:", rooms[roomCode].players);
  });

  socket.on("leave-room", (roomCode, playerName) => {
    console.log("user " + playerName + " left");

    if (!rooms[roomCode]) { return; }
    
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
    if (rooms[roomCode].players.length == 0) { return; }
    
    delete rooms[roomCode];
    console.log("room " + roomCode + " deleted");
  });
   
  //-----------
  //Kajastajad mängu loogika jaoks, et clientis muutuks midagi
  //-----------

  socket.on("game-start", ({ roomCode }) =>{
    handleGameStart(roomCode);

    io.to(roomCode).emit("hide-all-dices"); // peidab koikide diceid
    io.to(roomCode).emit("display-player-dices", socket.id); // naitab ainult playeri elusi
    io.to(roomCode).emit("display-hearts", rooms[roomCode].lives); // naitab koikide inimeste elusi
    io.to(roomCode).emit("display-turn", rooms[roomCode].turns); // naitab kelle turn hetkel on
  });
  
  socket.on("placed-bid", ({ roomCode, diceAmount, diceValue }) => {
    console.log("Placed new bid!")

    handleDiceBidSubmit(roomCode, diceAmount, diceValue);

    io.to(roomCode).emit("display-current-bid", rooms[roomCode].activeBid); // naitab hetkest bidi
  });

  socket.on("challange", (roomCode) => {
    console.log("Challanged!")

    io.to(roomCode).emit("display-action"); // naitab hetkese inimese actionit
    io.to(roomCode).emit("display-all-dices", rooms[roomCode].dice); // naitab koikide inimeste taringuid

    handleDiceCheck(roomCode);

    io.to(roomCode).emit("hide-all-dices"); // peidab koikide diceid
    io.to(roomCode).emit("display-hearts", rooms[roomCode].lives); // naitab koikide inimeste elusi see hetk
    io.to(roomCode).emit("display-player-dices", socket.id); // naitab ainult playeri elusi
  });

  socket.on("check-bid", ({ response, roomCode }) => {
    console.log("Bullseye!")
    
    io.to(roomCode).emit("display-action"); // naitab hetkese inimese actionit
    io.to(roomCode).emit("display-all-dices", rooms[roomCode].dice); // naitab koikide inimeste taringuid

    handleDiceCheck(response, roomCode);

    io.to(roomCode).emit("hide-all-dices"); // peidab koikide diceid
    io.to(roomCode).emit("display-hearts", rooms[roomCode].lives); // naitab koikide inimeste elusi see hetk
    io.to(roomCode).emit("display-player-dices", socket.id); // naitab ainult playeri elusi
  });
});