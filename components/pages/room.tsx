"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import io from "socket.io-client";
import { useRouter } from "next/navigation";

const socket = io("http://localhost:3030");

const Room: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomCode = searchParams.get("roomCode");
  const playerName = searchParams.get("playerName");
  const [players, setPlayers] = useState<string[]>([]);

  useEffect(() => {
    if (!roomCode) return;
    if (!playerName) {
      router.push("/lobby");
      return;
    }

    socket.emit("update-room", roomCode);

    socket.on("player-joined", (playerName) => {
      setPlayers((prev) => [...prev, playerName]);
    });

    socket.on("player-left", (playerName) => {
      setPlayers((prev) => prev.filter((player) => player !== playerName));
    });

    socket.on("current-players", (playersList: string[]) => {
      setPlayers(playersList);
    });

    return () => {
      socket.off("player-joined");
      socket.off("player-left");
      socket.off("current-players");
    };
  }, [roomCode]);

  const handleLeaveRoom = () => {
    socket.emit("leave-room", roomCode, playerName);
    setPlayers([]);
    router.push("/lobby");
  };

  if (!roomCode) {
    return <div>Room not found.</div>;
  }

  return (
    <div>
      <h1>Room Code: {roomCode}</h1>
      <h2>Players in the Room:</h2>
      <ul>
        {players.length === 0 ? (
          <li>No players in the room yet.</li>
        ) : (
          players.map((player, index) => <li key={index}>{player}</li>)
        )}
      </ul>
      <button
        onClick={handleLeaveRoom}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
      >
        LEAVE
      </button>
    </div>
  );
};

export default Room;
