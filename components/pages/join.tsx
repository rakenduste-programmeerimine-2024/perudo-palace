"use client";

import { useEffect, useState } from "react";
import { TextField, Button } from "@mui/material";
import { useRouter } from "next/navigation";
import io from "socket.io-client";

const socket = io("http://localhost:3030");

const Join: React.FC = () => {
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    socket.on("room-error", (message) => {
      setError(message);
    });

    socket.on("player-joined", (playerName) => {
      router.push(`/room?roomCode=${roomCode}&playerName=${playerName}`);
    });

    return () => {
      socket.off("room-error");
      socket.off("player-joined");
    };
  }, [router, roomCode]);

  const handleJoinRoom = () => {
    if (!playerName || !roomCode) {
      setError("Enter both your name and the room code.");
      return;
    }

    setError("");
    socket.emit("join-room", roomCode, playerName);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-gradient-to-r from-cyan-500 to-blue-500">
      <h1 className="text-3xl font-bold mb-6">Perudo Palace Join Game</h1>
      <div className="space-y-4 w-1/3">
        <TextField
          label="Name"
          variant="outlined"
          fullWidth
          className="bg-white rounded-md shadow"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
        />
        <TextField
          label="Room code"
          variant="outlined"
          fullWidth
          className="bg-white rounded-md shadow"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
        />
        {error && <p className="text-red-500">{error}</p>}
        <Button
          variant="contained"
          color="primary"
          fullWidth
          className="mt-4"
          onClick={handleJoinRoom}
        >
          Join Game
        </Button>
      </div>
    </div>
  );
};

export default Join;
