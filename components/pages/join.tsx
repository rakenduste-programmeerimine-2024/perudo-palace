"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { TextField, Button } from "@mui/material";
import { useRouter } from "next/navigation";
import io from "socket.io-client";

const socket = io("http://localhost:3030");

//(sinisest roheliseni taust) bg-gradient-to-r from-cyan-700 to-green-700
const Join: React.FC = () => {
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();
  const [socketId, setSocketId] = useState<string>("");

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

    // addToDB();
  };

  const addToDB = async () => {
    // player
    const { data: playerData, error: playerError } = await supabase
      .from("player")
      .insert([{ username: playerName, socket_id: socketId }])
      .select("id");

    const player_id = playerData?.[0]?.id;

    // lobby ... id where tabelis kood = inputi kood
    const { data: lobbyData, error: lobbyError } = await supabase
      .from("lobby")
      .select("id")
      .eq("code", roomCode)
      .single();

    const lobby_id = lobbyData?.id;

    // player_in_lobby
    const { data: playerInLobbyData, error: playerInLobbyError } =
      await supabase
        .from("player_in_lobby")
        .insert([{ player_id: player_id, lobby_id: lobby_id }]);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-green-900">
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
