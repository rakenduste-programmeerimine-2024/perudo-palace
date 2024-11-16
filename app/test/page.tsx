// "use client"
// import { useEffect } from "react";
// import { io } from "socket.io-client";

// export default function TestPage() {
//    useEffect(() => {
//       const socket = io("http://localhost:3030");

//       // Listen for the 'connect' event
//       socket.on("connect", () => {
//          console.log("Frontend connected successfully");
//          console.log(`Connected with id: ${socket.id}`);

//          // Emit the 'test-event' after connecting
//          socket.emit("test-event", 10, "hello", { x: "x" });
//       });

//       // Listen for potential connection errors
//       socket.on("connect_error", (err) => {
//          console.error("Connection failed:", err);
//       });

//       // Clean up the socket connection on component unmount
//       return () => {
//          socket.disconnect();
//       };
//    }, []); // Empty dependency array ensures this runs only once on mount

//    return (
//       <>
//          <h1>Test Page</h1>
//       </>
//    );
// }
