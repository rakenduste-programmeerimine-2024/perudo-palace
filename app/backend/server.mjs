import { Server } from "socket.io";

const io = new Server(3030, {
  cors: {
    origin: ["http://localhost:3000"],
  },
});

export let rooms = {};

io.on("connection", (socket) => {
  console.log("serveriga ühendatud: " + socket.id);

  // RUUMI LOOMINE
  socket.on("create-room", (roomCode, hostName, hostId) => {
    if (rooms[roomCode]) {
      io.to(socket.id).emit("room-error", "Room with that code already exists.");
    }
    
      //Teeb kõik vajalikud muutjad mängu ja lobby jaoks
    rooms[roomCode] = { 
      host: hostName,
      players: [hostName],
      playerIds: [hostId],
      turns: null, 
      dice: null, 
      lives: null, 
      isActive: null,
      activeBid: {diceValue: 1, diceAmount: 1, playerIndex: 0 },
      positions: {
        position1: null,
        position2: null,
        position3: null,
        position4: null,
      },
      gameIsOn: false
    };

    console.log("Users in room: " + rooms[roomCode].playerIds);

    socket.join(roomCode);
    io.to(roomCode).emit("room-created", roomCode);
    io.to(roomCode).emit("room-host", rooms[roomCode].host);
  });

   //Listenerid mängu loogika jaoks paigas
  socket.on("join-room", (roomCode, playerName, playerId) => {
    if (!rooms[roomCode]) {
      io.to(socket.id).emit("room-error", "Room does not exist.");
      return;
    }

    if (rooms[roomCode].players.length == 4) {
      io.to(socket.id).emit("room-error", "Room full (4 players).");
      return;
    }

    if (rooms[roomCode].gameIsOn){
      io.to(socket.id).emit("room-error", "Game is currently ongoing.");
      return;
    }

    rooms[roomCode].players.push(playerName);
    rooms[roomCode].playerIds.push(playerId);
    
    socket.join(roomCode);
    io.to(roomCode).emit("current-players", rooms[roomCode].players);
    io.to(roomCode).emit("player-joined", playerName);
    io.to(roomCode).emit("room-host", rooms[roomCode].host);

    console.log("Players in room when joining:", rooms[roomCode].players);
  });

  socket.on("update-room", (roomCode, playerName) => {
    if (!rooms[roomCode]) {
      io.to(socket.id).emit("room-error", "Room does not exist.");
      return;
    }
    
    socket.join(roomCode);
    io.to(roomCode).emit("current-players", rooms[roomCode].players);
    io.to(roomCode).emit("player-joined", playerName);

    console.log("Players in room when updating:", rooms[roomCode].players);
  });

  socket.on("leave-room", (roomCode, playerName) => {
    console.log("user " + playerName + " left");

    const room = rooms[roomCode];

    if (!room) { return; }
    
    // Kustutab playeri ruumi listist
    room.players = room.players.filter(
      (player) => player !== playerName
    );

    io.to(roomCode).emit("player-left", playerName);
    io.to(roomCode).emit("current-players", room.players);

    console.log("Kustutasin mängija");
    console.log("Players in room before deletion:", room.players);
    console.log("Player count:", room.players.length);

    if (playerName == room.host){
      console.log("Closing room " + roomCode);
      io.to(roomCode).emit("close-room");
      delete rooms[roomCode];
      return;
    }

    // Kui ruum on tühi, kustuta
    if (room.players.length > 0) { return; }
    
    delete rooms[roomCode];
    console.log("room " + roomCode + " deleted");
  });

  socket.on("position-picked", ({ playerName, position, roomCode }) => {
    const room = rooms[roomCode];

    if (!room) {
      io.to(socket.id).emit("room-error", "Room does not exist.");
      return;
    }

    const playerIndex = room.players.indexOf(playerName);

    if (playerIndex === -1) {
      io.to(socket.id).emit("room-error", "Player not found in room.");
      return;
    }

    const positionKey = `position${playerIndex + 1}`;

    // Check kas positsioon on võetud
    if (Object.values(room.positions).includes(position)) {
      io.to(socket.id).emit("position-error", "Position already taken.");
      return;
    }

    // Assign'i positsioon'id
    room.positions[positionKey] = position;
    console.log("positsioonid: " + JSON.stringify(room.positions))
    // saada positsioonid lobby'sse
    io.to(roomCode).emit("update-positions", room.positions);
  });
  
  //-----------
  //Kajastajad mängu loogika jaoks, et clientis muutuks midagi
  //-----------

  socket.on("start-game", (roomCode) =>{
    handleGameStart(roomCode);

    io.to(roomCode).emit("start-game");
    io.to(roomCode).emit("hide-all-dices"); // peidab koikide diceid

    rooms[roomCode].gameIsOn = true;

    // dice generating
    const randomDiceAmounts = [];
    for (let j = 0; j < 4; j++) {
      randomDiceAmounts.push(Math.floor(Math.random() * 6) + 1);
    }
    console.log("Mängjate array dice's", rooms[roomCode].players)
    if (rooms[roomCode].length <= rooms[roomCode].players.length) { rooms[roomCode].dice.push(randomDiceAmounts); }
    console.log(rooms[roomCode].dice);
    io.to(roomCode).emit("generate-dice", 
      rooms[roomCode].dice, 
      rooms[roomCode].players, 
      rooms[roomCode].positions
   );

    //dice displaying
    for (let playerNumber = 0; playerNumber < rooms[roomCode].players.length; playerNumber++) {
      console.log("playernumber:" + playerNumber)
      io.to(roomCode).emit("display-player-dice", 
         playerNumber, 
         rooms[roomCode].players[playerNumber], 
         rooms[roomCode].dice, 
         rooms[roomCode].positions['position' + (playerNumber + 1)
         ]); // naitab ainult playeri dice
    }

    io.to(roomCode).emit("display-hearts", rooms[roomCode].lives, rooms[roomCode].players); // naitab koikide inimeste elusi
    io.to(roomCode).emit("display-turn", rooms[roomCode].turns, rooms[roomCode].players); // naitab kelle turn hetkel on
  });

  socket.on("placed-bid", ({ roomCode, diceAmount, diceValue }) => {
    console.log("Placed new bid!")

    handleDiceBidSubmit(roomCode, diceAmount, diceValue);

    io.to(roomCode).emit("display-current-bid", rooms[roomCode].activeBid); // naitab hetkest bidi
    io.to(roomCode).emit("display-turn", rooms[roomCode].turns, rooms[roomCode].players); // naitab kelle turn hetkel on
  });

  socket.on("check-bid", ({ response, roomCode }) => {
    io.to(roomCode).emit("display-all-dices"); // naitab koikide inimeste taringuid

    handleDiceCheck(response, roomCode);

    io.to(roomCode).emit("display-hearts", rooms[roomCode].lives, rooms[roomCode].players); // naitab koikide inimeste elusi see hetk
    setTimeout(() => {
      io.to(roomCode).emit("hide-all-dices"); 
    }, 5000); // peidab koikide diceid, 5 sekundi prst
    setTimeout(() => {
      handleNewGameSetup(roomCode); // veeretab uuesti taringud ja muudab turni
    }, 5000);  
  });
});

//Ütleb kellel on turn, teeb kõik täringu veeretused
export function handleGameStart(roomCode) {  
  //Andmete setup
  console.log(roomCode);
  rooms[roomCode].turns = Array(rooms[roomCode].players.length).fill(false);
  rooms[roomCode].dice = Array(rooms[roomCode].players.length).fill(null).map(() => Array(4).fill(1));
  rooms[roomCode].lives = Array(rooms[roomCode].players.length).fill(3);
  rooms[roomCode].isActive = Array(rooms[roomCode].players.length).fill(true);

  handleNewGameSetup(roomCode);
}

function handleNewGameSetup(roomCode){
  //Kõikidele mängjatele täringute veeretamine
  rooms[roomCode].dice = handleDiceRolls(rooms[roomCode].dice, rooms[roomCode].isActive);
  //Mängu alguse turni seadmine
  rooms[roomCode].turns = handleTurns(roomCode);

  
  //Paneb uued täringud
  io.to(roomCode).emit("generate-dice", 
    rooms[roomCode].dice, 
    rooms[roomCode].players, 
    rooms[roomCode].positions
  );

 //dice displaying
 for (let playerNumber = 0; playerNumber < rooms[roomCode].players.length; playerNumber++) {
   console.log("playernumber:" + playerNumber)
   io.to(roomCode).emit("display-player-dice", 
      playerNumber, 
      rooms[roomCode].players[playerNumber], 
      rooms[roomCode].dice, 
      rooms[roomCode].positions['position' + (playerNumber + 1)
      ]); // naitab ainult playeri dice
 } 
  io.to(roomCode).emit("display-turn", rooms[roomCode].turns, rooms[roomCode].players);
}

//Muudab kelle turn on olenevat sellest kelle turn prg on
export function handleTurns(roomCode) {
   const turnArray = rooms[roomCode].turns;
   const isActiveArray = rooms[roomCode].isActive;
 
   for (let i = 0; i < turnArray.length; i++) {
     // Mängu algus: pane 1. aktiivse mängija käik trueks
     if (!turnArray.includes(true)) {
       const firstActiveIndex = isActiveArray.findIndex((active) => active);
       if (firstActiveIndex !== -1) {
         turnArray[firstActiveIndex] = true;
         return turnArray;
       }
       // Kui pole aktiivseid mängijaid (äärmuslik juhtum)
       console.error("No active players left in the game.");
       return turnArray;
     }
 
     // Leia mängija, kelle turn on praegu
     if (turnArray[i] === true) {
       turnArray[i] = false;
       let nextIndex = (i + 1) % turnArray.length;
 
       // Leia järgmine aktiivne mängija
       while (!isActiveArray[nextIndex]) {
         nextIndex = (nextIndex + 1) % turnArray.length;
 
         // Äärmuslik juhtum: kui kõik mängijad on mitteaktiivsed
         if (nextIndex === i) {
           console.error("No active players available for the next turn.");
           return turnArray;
         }
       }
 
       turnArray[nextIndex] = true;
       break;
     }
   }
   return turnArray;
 }

//Kui mängija otsustab callida bluffi tõeseks või valeks, 
//kontrollib üle kõik täringud, et kas see ühtib bluffiga
export function handleDiceCheck(response, roomCode){
  let diceCounter = 0;
  console.log("vastus bidile: ", response)
  //Käib läbi kõik täringud ja loetab, mitu kindlat täringut on
  for (let i = 0; i < rooms[roomCode].dice.length; i++) {
     for (let j = 0; j < rooms[roomCode].dice[i].length; j++) {
        if(rooms[roomCode].dice[i][j] == rooms[roomCode].activeBid.diceValue){
           diceCounter++;
        }
     }
 }

 //Muutujad, et lihtsalt elusid maha saaks võtta.
 const lastBidder = rooms[roomCode].activeBid.playerIndex;
 const checkerPlayer = (lastBidder + 1) % rooms[roomCode].dice.length;

 //kontrollib kas leitud täringute arv ühtib sellege, mis on bluffis
 if(diceCounter == rooms[roomCode].activeBid.diceAmount){
  if (response === false){
     rooms[roomCode].lives[checkerPlayer]--;
     if(rooms[roomCode].lives[checkerPlayer] == 0) {
      handlePlayerDeath(roomCode, checkerPlayer)
      io.to(roomCode).emit("display-hearts", rooms[roomCode].lives, rooms[roomCode].players)
   }
  }
  else{
     rooms[roomCode].lives[lastBidder]--;
     if(rooms[roomCode].lives[lastBidder] == 0) {
      handlePlayerDeath(roomCode, lastBidder)
      io.to(roomCode).emit("display-hearts", rooms[roomCode].lives, rooms[roomCode].players)
   }
  }
 }
 //Kui ei ühti
 else{
  if (response === false){
     rooms[roomCode].lives[lastBidder]--;
     if(rooms[roomCode].lives[lastBidder] == 0) { 
      handlePlayerDeath(roomCode, lastBidder)
      io.to(roomCode).emit("display-hearts", rooms[roomCode].lives, rooms[roomCode].players)
    }
  }
  else{
     rooms[roomCode].lives[checkerPlayer]--;
     if(rooms[roomCode].lives[checkerPlayer] == 0) { 
      handlePlayerDeath(roomCode, checkerPlayer)
      io.to(roomCode).emit("display-hearts", rooms[roomCode].lives, rooms[roomCode].players)
    }
  }
 }

 //resettib bidi
 rooms[roomCode].activeBid.diceAmount = 0
 rooms[roomCode].activeBid.diceValue = 0
 io.to(roomCode).emit("display-current-bid", rooms[roomCode].activeBid); // naitab hetkest bidi
}

//Mängjia paneb enda käigu ajal mitu, 
//missugust täringut on laual kokku tema arust. 
//Need params väärtused tuleksid frontendist kust seda Bidi submititakse
export function handleDiceBidSubmit(roomCode, diceAmount, diceValue ) {
  for (let i = 0; i < rooms[roomCode].turns.length; i++) {
     if(rooms[roomCode].turns[i] === true){
        rooms[roomCode].activeBid.playerIndex = i;
        break;
     }
  }

  rooms[roomCode].activeBid.diceValue = diceValue;
  rooms[roomCode].activeBid.diceAmount = diceAmount;
  
  rooms[roomCode].turns = handleTurns(roomCode);
}

//Veeretab mängu alguses, 
//või kui round saab lõbi igale mängjale täringud.
export function handleDiceRolls(diceArray, isActive) {
   for (let i = 0; i < diceArray.length; i++) {
     // Kui mängjia on inactive ta täringud on 0, seega ei mõjuta mängu
     if (!isActive[i]) {
       for (let j = 0; j < diceArray[i].length; j++) {
         diceArray[i][j] = 0; 
       }
     } else {
       // If the player is active, roll the dice normally
       for (let j = 0; j < diceArray[i].length; j++) {
         diceArray[i][j] = Math.floor(Math.random() * 6) + 1;
       }
     }
   }
   return diceArray;
 }

// Vaatab kas mäng peaks läbi olema (ainult üks mängija on elus)
export function checkGameOver(roomCode) {
  const activePlayers = rooms[roomCode].lives.filter(life => life > 0).length;
   
  if (activePlayers === 1) {
     console.log("Game Over!");
     const winnerIndex = rooms[roomCode].isActive.findIndex(isActive => isActive === true);
     const winner = rooms[roomCode].players[winnerIndex];

     rooms[roomCode].gameIsOn = false;
     io.to(roomCode).emit("game-over", winner)
  }
}

//Kui mängjal on elud 0 siis võtame ta mängu loogikast välja 
export function handlePlayerDeath(roomCode, i){
  console.log("Player: " + rooms[roomCode].players[i] + " has been eliminated.");

  rooms[roomCode].isActive[i] = false
  rooms[roomCode].turns[i] = false

  checkGameOver(roomCode);
}