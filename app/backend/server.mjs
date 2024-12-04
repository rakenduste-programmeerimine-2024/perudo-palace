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
      io.to(socket.id).emit(
        "room-error",
        "Room with that code already exists."
      );
    } else {
      //Teeb kõik vajalikud muutjad mängu ja lobby jaoks
      rooms[roomCode] = { 
        host: hostName,
        players: [hostName],
        playerIds: [hostId],
        turns: null, 
        dice: null, 
        lives: null, 
        activeBid: {diceValue: 1, diceAmount: 1, playerIndex: 0 },
        positions: {
          position1: null,
          position2: null,
          position3: null,
          position4: null,
        },
      };

      console.log("Users in room: " + rooms[roomCode].playerIds);

      socket.join(roomCode);
      io.to(roomCode).emit("room-created", roomCode);
      io.to(roomCode).emit("room-host", rooms[roomCode].host);
      console.log("Players in room when creating:", rooms[roomCode].players);
      return;
    }
    

  });

   //Listenerid mängu loogika jaoks paigas
  socket.on("join-room", (roomCode, playerName, playerId) => {
    if (rooms[roomCode] == true && rooms[roomCode].players.length == 4) {
      io.to(socket.id).emit("room-error", "Room full (4 players).");
    } else if (rooms[roomCode]) {
      rooms[roomCode].players.push(playerName);
      rooms[roomCode].playerIds.push(playerId);
      
      socket.join(roomCode);
      io.to(roomCode).emit("current-players", rooms[roomCode].players);
      io.to(roomCode).emit("player-joined", playerName);
      io.to(roomCode).emit("room-host", rooms[roomCode].host);
      console.log("Players in room when joining:", rooms[roomCode].players);
    } else {
      io.to(socket.id).emit("room-error", "Room does not exist.");
      return;
    }
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

  socket.on("start-game", (roomCode) =>{
    handleGameStart(roomCode);

    io.to(roomCode).emit("start-game");

    rooms[roomCode].playerIds.forEach(id => {
      io.to(roomCode).emit("display-player-dices", id); // naitab ainult playeri dice
    });
    
    io.to(roomCode).emit("display-hearts", rooms[roomCode].lives); // naitab koikide inimeste elusi
    io.to(roomCode).emit("display-turn", rooms[roomCode].turns, rooms[roomCode].playerIds); // naitab kelle turn hetkel on
  });
  
  socket.on("placed-bid", ({ roomCode, diceAmount, diceValue }) => {
    console.log("Placed new bid!")

    handleDiceBidSubmit(roomCode, diceAmount, diceValue);

    io.to(roomCode).emit("display-current-bid", rooms[roomCode].activeBid); // naitab hetkest bidi
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

    // saada positsioonid lobby'sse
    io.to(roomCode).emit("update-positions", room.positions);
  });

  socket.on("challange", (roomCode) => {
    console.log("Challanged!")

    io.to(roomCode).emit("display-all-dices", rooms[roomCode].dice); // naitab koikide inimeste taringuid

    handleDiceCheck(roomCode);

    io.to(roomCode).emit("display-hearts", rooms[roomCode].lives); // naitab koikide inimeste elusi see hetk
    io.to(roomCode).emit("hide-all-dices"); // peidab koikide diceid

    handleNewGameSetup(roomCode); // veeretab uuesti taringud ja muudab turni

    io.to(roomCode).emit("display-player-dices", socket.id); // naitab ainult playeri elusi
  });

  socket.on("check-bid", ({ response, roomCode }) => {
    console.log("Bullseye!")
    
    io.to(roomCode).emit("display-all-dices", rooms[roomCode].dice); // naitab koikide inimeste taringuid

    handleDiceCheck(response, roomCode);

    io.to(roomCode).emit("hide-all-dices"); // peidab koikide diceid
    io.to(roomCode).emit("display-hearts", rooms[roomCode].lives); // naitab koikide inimeste elusi see hetk
    io.to(roomCode).emit("display-player-dices", socket.id); // naitab ainult playeri elusi
  });
});

//Ütleb kellel on turn, teeb kõik täringu veeretused
export function handleGameStart(roomCode) {  
  //Andmete setup
  console.log(roomCode);
  rooms[roomCode].turns = Array(rooms[roomCode].players.length).fill(false);
  rooms[roomCode].dice = Array(rooms[roomCode].players.length).fill(null).map(() => Array(4).fill(1));
  rooms[roomCode].lives = Array(rooms[roomCode].players.length).fill(3);

  handleNewGameSetup(roomCode);
}

function handleNewGameSetup(roomCode){
  //Kõikidele mängjatele täringute veeretamine
  rooms[roomCode].dice = handleDiceRolls(rooms[roomCode].dice);
  //Mängu alguse turni seadmine
  rooms[roomCode].turns = handleTurns(rooms[roomCode].turns, roomCode);
}

//Muudab kelle turn on olenevat sellest kelle turn prg on
export function handleTurns(turnArray, roomCode) {
  for (let i = 0; i < turnArray.length; i++) {
     // Mängu algus: paned 1. mängja käigu trueks
     if (!turnArray.includes(true)) {
        turnArray[0] = true;
        return turnArray;
     }

     // Otsin mängjate kelle turn on prg
     if (turnArray[i] === true) {
        turnArray[i] = false;
        // Panen turni järgmisele mängjale
        if (i + 1 < turnArray.length) {
           turnArray[i + 1] = true;
        } else {
           // Kui mängija on arrays viimane paned essa mängja turni trueks
           turnArray[0] = true;
        }
        break;
     }
  }
  return turnArray;
}

//Kui mängija otsustab callida bluffi tõeseks või valeks, 
//kontrollib üle kõik täringud, et kas see ühtib bluffiga
export function handleDiceCheck(response, roomCode){
  let diceCounter = 0;
  //Käib läbi kõik täringud ja loetab, mitu kindlat täringut on
  for (let i = 0; i < rooms[roomCode].dice.length; i++) {
     for (let j = 0; j < rooms[roomCode].dice[i].length; j++) {
        if(rooms[roomCode].dice[i][j] == diceValue){
           diceCounter++
        }
     }
 }
 //Muutujad, et lihtsalt elusid maha saaks võtta.
 const lastBidder = rooms[roomCode].activeBid.playerIndex;
 const checkerPlayer = (lastBidder + 1) % rooms[roomCode].dice.length;

 //kontrollib kas leitud täringute arv ühtib sellege, mis on bluffis
 if(diceCounter == diceAmount){
  if (response === false){
     rooms[roomCode].lives[checkerPlayer]--;
     if(rooms[roomCode].lives[checkerPlayer] == 0){handlePlayerDeath(checkerPlayer)}
  }
  else{
     rooms[roomCode].lives[lastBidder]--;
     if(rooms[roomCode].lives[lastBidder] == 0){handlePlayerDeath(lastBidder)}
  }
 }
 //Kui ei ühti
 else{
  if (response === false){
     rooms[roomCode].lives[lastBidder]--;
     if(rooms[roomCode].lives[lastBidder]== 0) { handlePlayerDeath(lastBidder) }
  }
  else{
     rooms[roomCode].lives[checkerPlayer]--;
     if(rooms[roomCode].lives[checkerPlayer] == 0) { handlePlayerDeath(checkerPlayer) }
  }
 }
}

//Mängjia paneb enda käigu ajal mitu, 
//missugust täringut on laual kokku tema arust. 
//Need params väärtused tuleksid frontendist kust seda Bidi submititakse
export function handleDiceBidSubmit(roomCode, diceValue, diceAmount) {
  for (let i = 0; i < rooms[roomCode].turns.length; i++) {
     if(turns[i] === true){
        playerIndex = i;
        break;
     }
  }
  //Määrab, mis Bid on prg laual (mitu täringut keegi (viimasena) arvab, et on laual prg)
  //Mis täringu väärtus (1,2,3,4,5,6)
  rooms[roomCode].activeBid.diceValue = diceValue;
  //Mitu seda täringut arvatakse et on laual
  rooms[roomCode].activeBid.diceAmount = diceAmount;
  rooms[roomCode].activeBid.playerIndex = playerIndex;
  //Muudab turni
  rooms[roomCode].turns = handleTurns(rooms[roomCode].turns, roomCode);
}

//Veeretab mängu alguses, 
//või kui round saab lõbi igale mängjale täringud.
export function handleDiceRolls(diceArray){
  for (let i = 0; i < diceArray.length; i++) {
     for (let j = 0; j < diceArray[i].length; j++) {
         diceArray[i][j] = Math.floor(Math.random() * 6) + 1;
     }
 }
 return diceArray;
}
// Vaatab kas mäng peaks läbi olema (ainult üks mängija on elus)
export function checkGameOver() {
  const activePlayers = rooms[roomCode].lives.filter(life => life > 0).length;

  if (activePlayers === 1) {
     console.log("Game Over! Restarting game...");
     handleGameStart(); // Restardib mängu
  }
}
//Kui mängjal on elud 0 siis võtame ta mängu loogikast välja 
export function handlePlayerDeath(i){
  console.log(`Player ${players[i]} has been eliminated.`);

  rooms[roomCode].turns.splice(i, 1);
  rooms[roomCode].dice.splice(i, 1);
  rooms[roomCode].lives.splice(i, 1);

  checkGameOver();
}