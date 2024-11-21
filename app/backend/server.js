const { Server } = require("socket.io");

const io = new Server(3000, { 
   cors: { 
      origin: [
         "http://localhost:3001"
      ]
   }, 
});

let rooms = {}

io.on("connection", (socket) => {
  console.log("Server: Connected!")
  console.log(socket.id)
  
  socket.on("join-room", (roomId) => JoinRoom(socket, roomId))
  socket.on("pass-turn", (roomId, diceAmount, dotAmount) => PassTurn(roomId, diceAmount, dotAmount))
  socket.on("challange", (roomId) => Challange(roomId));
})

function JoinRoom(socket, roomId){
   if (!rooms[roomId]) {
      rooms[roomId] = {
        players: [],
        currentTurn: 0,
        diceAmount: null,
        dotAmount: null,
      };
    }

    const selectedRoom = rooms[roomId];

    if (selectedRoom.players.length >= 4) return

    selectedRoom.players.push({ 
      id: socket.id, 
      health: 3, 
      dice: [1, 2, 3, 4, 5] 
      });
    socket.join(roomId);
    console.log("joined room: " + roomId)
    
    io.to(roomId).emit('updateRoom', selectedRoom);
}

function PassTurn(roomId, diceAmount, dotAmount) {
   console.log("Trying to pass turn...")
   const selectedRoom = rooms[roomId]

   if (selectedRoom == null) {
      console.log("Failed!")
      return
   }

   console.log("Passed turn!")

   selectedRoom.diceAmount = diceAmount
   selectedRoom.dotAmount = dotAmount
   selectedRoom.currentTurn = (selectedRoom.currentTurn + 1) % selectedRoom.players.length;

   io.to(roomId).emit('update-room', selectedRoom);
}

function Challange(roomId){
   console.log("Trying to challange...")
   
   const room = rooms[roomId]
   if (room == null){
      console.log("Failed!")
      return
   }

   console.log("Challanged! Room: " + roomId)

   const loser = CheckBet();

   if (loser) {
      loser.health -= 1;
      if (loser.health <= 0) {
        room.players = room.players.filter((player) => player.health > 0);
      }
    }

    room.currentTurn = (room.currentTurn + 1) % room.players.length;

    io.to(roomId).emit('updateRoom', room);
}