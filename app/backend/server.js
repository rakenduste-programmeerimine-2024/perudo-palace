const { Server } = require("socket.io");

const io = new Server(3030, { 
   cors: { 
      origin: ["http://localhost:3000"]
   }, 
});

io.on("connection", (socket) => {
  console.log("serveriga ühendatud")
  console.log(socket.id)
  
  socket.on("test-event", (number, string, obj) => {
   console.log(number, string, obj)
  })
});
