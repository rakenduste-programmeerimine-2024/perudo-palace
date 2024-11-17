"use client";

import { createClient } from "@/utils/supabase/client";
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
  const supabase = createClient();
  const [socketId, setSocketId] = useState<string>("");

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to socket server, socket ID:", socket.id);
      setSocketId(socket.id as string);
    });

    socket.on("room-error", (message) => {
      setError(message);
    });

    socket.on("room-created", (roomCode) => {
      router.push(`/room?roomCode=${roomCode}&playerName=${hostName}`);
    });

    return () => {
      socket.off("connect");
      socket.off("room-error");
      socket.off("room-created");
    };
  }, [router, hostName]);

  const handleCreateRoom = () => {
    if (!hostName || !roomCode) {
      setError("Enter both your name and a room code.");
      return;
    }

    setError("");
    socket.emit("create-room", roomCode, hostName);

    addToDB();
  };

  const addToDB = async () => {
    const { data, error } = await supabase
      .from("player")
      .insert([{ username: hostName, socket_id: socketId }])
      .select();

    // ... id where tabelis name = inputi name
    const { data: playerData, error: playerError } = await supabase
      .from("player")
      .select("id")
      .eq("username", hostName)
      .single();

    if (playerData) {
      const host_id = playerData.id;

      const { data: lobbyData, error: lobbyError } = await supabase
        .from("lobby")
        .insert([{ host_id: host_id, code: roomCode }])
        .select();

      if (lobbyError) {
        console.error("Error inserting into lobby:", lobbyError);
        return;
      }

      const lobby_id = lobbyData[0].id;

      // player_in_lobby
      const { data: playerInLobbyData, error: playerInLobbyError } =
        await supabase
          .from("player_in_lobby")
          .insert([{ player_id: host_id, lobby_id: lobby_id }]);
    }
    console.log("Added to database");
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
