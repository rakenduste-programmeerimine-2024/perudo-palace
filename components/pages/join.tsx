"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { TextField, Button } from "@mui/material";
import { SubmitButton } from "@/components/submit-button";
import { useRouter } from "next/navigation";
import io from "socket.io-client";
import BackButton from "@/components/buttons/back-button";
import { MuiThemeProvider } from "../MuiThemeProvider";

const socket = io("http://localhost:3030");

const Join: React.FC = () => {
  const [playerName, setPlayerName] = useState("");
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

    socket.on("player-joined", (playerName) => {
      router.push(`/gamepage?roomCode=${roomCode}&playerName=${playerName}`);
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
    
    console.log("id: " + socketId + " og: " + socket.id);

    setError("");
    socket.emit("join-room", roomCode, playerName, socket.id);

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
    <MuiThemeProvider>
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800">
      {/* Pealkiri */}
      <div className="flex flex-col items-center justify-center mt-0">
        <h1 className="text-4xl font-bold mb-6 text-center text-orange-500">
          Perudo Palace
        </h1>
        <h2 className="text-2xl mb-8 text-center text-orange-400">
          Join Game
        </h2>
      </div>

      {/* Vorm */}
      <form className="flex flex-col items-center justify-center w-full max-w-md space-y-4 bg-gray-900 p-8 rounded-md shadow-lg">
        <TextField
          label="Name"
          variant="outlined"
          fullWidth
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="rounded-md text-orange-500 border-2 border-orange-500"
          InputLabelProps={{
            style: { color: "#FFA500" }, // Label värv
          }}
          InputProps={{
            classes: {
              notchedOutline: "border-orange-500 focus:border-orange-600", // Serva värvid
            },
            style: {
              color: "#FFA500", // Sisestatud teksti värv
            },
          }}
        />
        <TextField
          label="Room code"
          variant="outlined"
          fullWidth
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
          className="rounded-md text-orange-500 border-2 border-orange-500"
          InputLabelProps={{
            style: { color: "#FFA500" }, // Label värv
          }}
          InputProps={{
            classes: {
              notchedOutline: "border-orange-500 focus:border-orange-600",
            },
            style: {
              color: "#FFA500", // Sisestatud teksti värv
            },
          }}
        />
        {error && <p className="text-red-500">{error}</p>}
        <SubmitButton
        formAction={handleJoinRoom}
        pendingText="Joining..."
        className="mt-4 bg-orange-500 text-white hover:bg-orange-600"
      >
        Join Game
      </SubmitButton>
      </form>
      {/* Tagasi nupp */}
      <BackButton href="/" />
    </div>
        </MuiThemeProvider>

  );
};

export default Join;
