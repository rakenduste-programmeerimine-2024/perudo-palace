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
      router.push(`/gamepage?roomCode=${roomCode}&playerName=${hostName}`);
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
    socket.emit("create-room", roomCode, hostName, socketId);

    // addToDB();
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
    <MuiThemeProvider>
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800">
      {/* Pealkiri */}
      <div className="flex flex-col items-center justify-center mt-0">
        <h1 className="text-4xl font-bold mb-6 text-center text-orange-500">
          Perudo Palace
        </h1>
        <h2 className="text-2xl mb-8 text-center text-orange-400">
          Create Game
        </h2>
      </div>
  
      <form className="flex flex-col items-center justify-center w-full max-w-md space-y-4 bg-gray-900 p-8 rounded-md shadow-lg">
  <TextField
    label="Name"
    variant="outlined"
    fullWidth
    value={hostName}
    onChange={(e) => setHostName(e.target.value)}
    className="rounded-md text-orange-500 border-2 border-orange-500"
    InputLabelProps={{
      style: { color: '#FFA500' }, // Label color
    }}
    InputProps={{
      classes: {
        notchedOutline: "border-orange-500 focus:border-orange-600", // Default and focus colors
      },
      style: {
        color: '#FFA500', // Input text color
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
      style: { color: '#FFA500' }, // Label color
    }}
    InputProps={{
      classes: {
        notchedOutline: "border-orange-500 focus:border-orange-600",
      },
      style: {
        color: '#FFA500', // Input text color
      },
    }}
  />

        {error && <p className="text-red-500">{error}</p>}
        <SubmitButton
          formAction={handleCreateRoom}
          pendingText="creating..."
          className="mt-4 bg-orange-500 text-white hover:bg-orange-600"
        >
        Create Game
        </SubmitButton>
      </form>
      {/* Tagasi nupp */}
      <BackButton href="/" />
    </div>
    </MuiThemeProvider>
  );
  
};

export default Create;
