"use client";

import { useEffect, useState } from "react";
import { TextField, Button } from "@mui/material";
import { useRouter } from "next/navigation";
import io from "socket.io-client";

const socket = io("http://localhost:3030");

const Create: React.FC = () => {
  const [hostName, setHostName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    socket.on("room-error", (message) => {
      setError(message);
    });

    socket.on("room-created", (roomCode) => {
      router.push(`/room?roomCode=${roomCode}`);
    });

    return () => {
      socket.off("room-error");
      socket.off("room-created");
    };
  }, [router]);

  const handleCreateRoom = () => {
    if (!hostName || !roomCode) {
      setError("Enter both your name and a room code.");
      return;
    }

    setError("");
    socket.emit("create-room", roomCode, hostName);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-back-bg bg-cover bg-center">
      <h1 className="text-3xl font-bold mb-6">Perudo Palace Create Game</h1>
      <div className="space-y-4 w-1/3">
        <TextField
          label="Name"
          variant="outlined"
          fullWidth
          className="bg-white rounded-md shadow"
          value={hostName}
          onChange={(e) => setHostName(e.target.value)}
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
          onClick={handleCreateRoom}
        >
          Create Game
        </Button>
      </div>
    </div>
  );
};

export default Create;
